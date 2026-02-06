import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

// Initialize Anthropic client
const anthropic = new Anthropic();

// Initialize Supabase client with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SlackEvent {
  type: string;
  event?: {
    type: string;
    text?: string;
    user?: string;
    channel?: string;
    ts?: string;
  };
  challenge?: string;
}

interface TaskSummary {
  id: string;
  title: string;
  description: string | null;
  status: string;
  phase: string;
  priority: string;
  difficulty: string;
  ai_potential: string;
  ai_assist_description: string | null;
  due_date: string | null;
  is_critical_path: boolean;
  is_foundational: boolean;
  project: { title: string; slug: string } | null;
  owner_team: string | null;
}

interface ProjectSummary {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  priority: string;
  progress_percentage: number;
  total_tasks?: number;
  completed_tasks?: number;
}

// Handle Slack URL verification
function handleVerification(body: SlackEvent) {
  return NextResponse.json({ challenge: body.challenge });
}

// Fetch tasks and projects from database
async function fetchTasksAndProjects() {
  // Fetch all tasks with project info
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select(`
      id,
      title,
      description,
      status,
      phase,
      priority,
      difficulty,
      ai_potential,
      ai_assist_description,
      due_date,
      is_critical_path,
      is_foundational,
      project:projects(id, title, slug),
      owner_team:teams(name)
    `)
    .order('created_at', { ascending: false });

  if (tasksError) {
    console.error('Error fetching tasks:', tasksError);
  }

  // Fetch all projects
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select(`
      id,
      title,
      slug,
      description,
      status,
      priority,
      progress_percentage
    `)
    .eq('is_predicted', false)
    .order('created_at', { ascending: false });

  if (projectsError) {
    console.error('Error fetching projects:', projectsError);
  }

  // Transform task data
  const transformedTasks: TaskSummary[] = (tasks || []).map((task: Record<string, unknown>) => ({
    id: task.id as string,
    title: task.title as string,
    description: task.description as string | null,
    status: task.status as string,
    phase: task.phase as string,
    priority: task.priority as string,
    difficulty: task.difficulty as string,
    ai_potential: task.ai_potential as string,
    ai_assist_description: task.ai_assist_description as string | null,
    due_date: task.due_date as string | null,
    is_critical_path: task.is_critical_path as boolean,
    is_foundational: task.is_foundational as boolean,
    project: task.project ? {
      title: (task.project as { title: string; slug: string }).title,
      slug: (task.project as { title: string; slug: string }).slug,
    } : null,
    owner_team: task.owner_team ? (task.owner_team as { name: string }).name : null,
  }));

  // Transform project data
  const transformedProjects: ProjectSummary[] = (projects || []).map((project: Record<string, unknown>) => ({
    id: project.id as string,
    title: project.title as string,
    slug: project.slug as string,
    description: project.description as string | null,
    status: project.status as string,
    priority: project.priority as string,
    progress_percentage: project.progress_percentage as number,
  }));

  return { tasks: transformedTasks, projects: transformedProjects };
}

// Generate AI response using Claude
async function generateAIResponse(
  message: string,
  tasks: TaskSummary[],
  projects: ProjectSummary[]
) {
  const taskStats = {
    total: tasks.length,
    notStarted: tasks.filter(t => t.status === 'not_started').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    blocked: tasks.filter(t => t.status === 'blocked').length,
    overdue: tasks.filter(t => {
      if (!t.due_date) return false;
      return new Date(t.due_date) < new Date();
    }).length,
    criticalPath: tasks.filter(t => t.is_critical_path).length,
    highAIPotential: tasks.filter(t => t.ai_potential === 'high').length,
  };

  const systemPrompt = `You are the Task Companion, an AI assistant for Abeto's task management system integrated with Slack. Abeto is a solar installation lead generation company in Spain building AI-powered automation tools.

## Your Role
Help team members understand their tasks, prioritize work, and track progress through Slack.

## Current Task Statistics
- Total tasks: ${taskStats.total}
- Not started: ${taskStats.notStarted}
- In progress: ${taskStats.inProgress}
- Completed: ${taskStats.completed}
- Blocked: ${taskStats.blocked}
- Overdue: ${taskStats.overdue}
- Critical path tasks: ${taskStats.criticalPath}
- High AI potential tasks: ${taskStats.highAIPotential}

## All Tasks (Top 50)
${tasks.slice(0, 50).map(t => `
- **${t.title}** (${t.status})
  - Project: ${t.project?.title || 'None'}
  - Priority: ${t.priority}
  - AI Potential: ${t.ai_potential}
  - Due: ${t.due_date || 'No due date'}
  - Critical Path: ${t.is_critical_path ? 'Yes' : 'No'}
`).join('\n')}

## All Projects (Top 20)
${projects.slice(0, 20).map(p => `
- **${p.title}** (${p.status})
  - Priority: ${p.priority}
  - Progress: ${p.progress_percentage}%
`).join('\n')}

## Response Guidelines for Slack
1. Keep responses concise (Slack has message limits)
2. Use Slack formatting: *bold*, _italic_, \`code\`, bullet points
3. Be actionable - suggest specific tasks to work on
4. Mention overdue or critical tasks proactively
5. Keep it friendly and professional`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 800,
    system: systemPrompt,
    messages: [{ role: 'user', content: message }],
  });

  const textContent = response.content.find(block => block.type === 'text');
  return textContent?.type === 'text' ? textContent.text : 'Sorry, I could not generate a response.';
}

// Send response back to Slack
async function sendSlackResponse(webhookUrl: string, text: string, channel?: string) {
  try {
    const payload: { text: string; channel?: string } = { text };
    if (channel) payload.channel = channel;

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('Error sending Slack response:', error);
  }
}

export async function POST(request: Request) {
  try {
    const body: SlackEvent = await request.json();

    // Handle Slack URL verification challenge
    if (body.type === 'url_verification') {
      return handleVerification(body);
    }

    // Handle event callbacks
    if (body.type === 'event_callback' && body.event) {
      const event = body.event;

      // Only respond to app mentions or direct messages
      if (event.type === 'app_mention' || event.type === 'message') {
        const message = event.text || '';

        // Remove bot mention from message
        const cleanMessage = message.replace(/<@[A-Z0-9]+>/g, '').trim();

        if (cleanMessage) {
          // Fetch current tasks and projects
          const { tasks, projects } = await fetchTasksAndProjects();

          // Generate AI response
          const aiResponse = await generateAIResponse(cleanMessage, tasks, projects);

          // Get webhook URL from database or env
          let webhookUrl = process.env.SLACK_WEBHOOK_URL;
          if (!webhookUrl) {
            const { data: settings } = await supabase
              .from('app_settings')
              .select('value')
              .eq('key', 'slack_webhook_url')
              .single();
            webhookUrl = settings?.value;
          }

          if (webhookUrl && event.channel) {
            await sendSlackResponse(webhookUrl, aiResponse, event.channel);
          }

          return NextResponse.json({
            response_type: 'in_channel',
            text: aiResponse,
          });
        }
      }
    }

    // For interactive messages or other event types
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Slack webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle Slack slash commands
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const command = searchParams.get('command');
  const text = searchParams.get('text') || 'What should I work on?';

  if (command === '/taskcompanion' || command === '/tc') {
    try {
      // Fetch current tasks and projects
      const { tasks, projects } = await fetchTasksAndProjects();

      // Generate AI response
      const aiResponse = await generateAIResponse(text, tasks, projects);

      return NextResponse.json({
        response_type: 'in_channel',
        text: aiResponse,
      });
    } catch (error) {
      console.error('Slack command error:', error);
      return NextResponse.json({
        response_type: 'ephemeral',
        text: 'Sorry, I encountered an error. Please try again.',
      });
    }
  }

  return NextResponse.json({ message: 'Slack webhook endpoint ready' });
}
