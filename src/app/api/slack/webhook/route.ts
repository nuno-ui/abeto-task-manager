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
    bot_id?: string;
    subtype?: string;
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

// Send response back to Slack using the Web API (chat.postMessage)
async function sendSlackResponse(channel: string, text: string) {
  try {
    // Get the Bot Token from environment or database
    let botToken = process.env.SLACK_BOT_TOKEN;
    if (!botToken) {
      const { data: settings } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'slack_bot_token')
        .single();
      botToken = settings?.value;
    }

    if (!botToken) {
      console.error('No Slack Bot Token found');
      return;
    }

    const response = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${botToken}`,
      },
      body: JSON.stringify({
        channel,
        text,
      }),
    });

    const result = await response.json();
    if (!result.ok) {
      console.error('Slack API error:', result.error);
    }
  } catch (error) {
    console.error('Error sending Slack response:', error);
  }
}

// Process message asynchronously (fire and forget)
async function processSlackMessage(channel: string, cleanMessage: string) {
  try {
    console.log(`Processing Slack message: "${cleanMessage}" in channel ${channel}`);

    // Fetch current tasks and projects
    const { tasks, projects } = await fetchTasksAndProjects();
    console.log(`Fetched ${tasks.length} tasks and ${projects.length} projects`);

    // Generate AI response
    const aiResponse = await generateAIResponse(cleanMessage, tasks, projects);
    console.log(`Generated AI response: ${aiResponse.substring(0, 100)}...`);

    // Send response using Slack Web API
    await sendSlackResponse(channel, aiResponse);
    console.log('Slack response sent successfully');
  } catch (error) {
    console.error('Error processing Slack message:', error);
    // Try to send an error message to the channel
    try {
      await sendSlackResponse(channel, 'Sorry, I encountered an error processing your request. Please try again.');
    } catch (sendError) {
      console.error('Failed to send error message to Slack:', sendError);
    }
  }
}

export async function POST(request: Request) {
  try {
    const body: SlackEvent = await request.json();
    console.log('Received Slack event:', JSON.stringify(body, null, 2));

    // Handle Slack URL verification challenge
    if (body.type === 'url_verification') {
      console.log('Handling URL verification challenge');
      return handleVerification(body);
    }

    // Handle event callbacks
    if (body.type === 'event_callback' && body.event) {
      const event = body.event;
      console.log('Event type:', event.type, 'User:', event.user, 'Channel:', event.channel);

      // Ignore bot messages to prevent loops
      if (event.bot_id || event.subtype === 'bot_message') {
        console.log('Ignoring bot message');
        return NextResponse.json({ ok: true });
      }

      // Only respond to app mentions or direct messages
      if (event.type === 'app_mention' || event.type === 'message') {
        const message = event.text || '';
        console.log('Message text:', message);

        // Remove bot mention from message
        const cleanMessage = message.replace(/<@[A-Z0-9]+>/g, '').trim();
        console.log('Clean message:', cleanMessage);

        if (cleanMessage && event.channel) {
          // IMPORTANT: Respond to Slack immediately to prevent retries (3s timeout)
          // Process the message asynchronously
          processSlackMessage(event.channel, cleanMessage);

          // Return immediately - Slack requires response within 3 seconds
          return NextResponse.json({ ok: true });
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
