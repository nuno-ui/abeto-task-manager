import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy-load clients to avoid build-time errors
let anthropic: Anthropic | null = null;
let supabase: SupabaseClient | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropic) {
    anthropic = new Anthropic();
  }
  return anthropic;
}

function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return supabase;
}

interface SlackEvent {
  type: string;
  event_id?: string;
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
  assignee_id: string | null;
  assignee_name: string | null;
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

// Get Slack user info and map to Abeto user
interface SlackUserInfo {
  slackUserId: string;
  slackUserName: string;
  slackEmail?: string;
  abetoUser?: {
    id: string;
    full_name: string;
    email: string;
    team_name?: string;
  };
}

async function getSlackUserInfo(slackUserId: string, botToken: string): Promise<SlackUserInfo> {
  const result: SlackUserInfo = {
    slackUserId,
    slackUserName: 'User',
  };

  try {
    // Fetch Slack user profile
    const userResponse = await fetch(`https://slack.com/api/users.info?user=${slackUserId}`, {
      headers: {
        'Authorization': `Bearer ${botToken}`,
      },
    });
    const userData = await userResponse.json();

    if (userData.ok && userData.user) {
      result.slackUserName = userData.user.real_name || userData.user.name || 'User';
      result.slackEmail = userData.user.profile?.email;

      // Try to find matching user in Abeto by email
      if (result.slackEmail) {
        const { data: abetoUser } = await getSupabaseClient()
          .from('users')
          .select('id, full_name, email, team:teams(name)')
          .eq('email', result.slackEmail)
          .single();

        if (abetoUser) {
          result.abetoUser = {
            id: abetoUser.id,
            full_name: abetoUser.full_name || result.slackUserName,
            email: abetoUser.email,
            team_name: (abetoUser.team as { name: string } | null)?.name,
          };
        }
      }
    }
  } catch (error) {
    console.error('Error fetching Slack user info:', error);
  }

  return result;
}

// Fetch tasks and projects from database
async function fetchTasksAndProjects() {
  // Fetch all tasks with project info and assignee
  const { data: tasks, error: tasksError } = await getSupabaseClient()
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
      assignee_id,
      project:projects(id, title, slug),
      owner_team:teams(name),
      assignee:users!assignee_id(id, full_name)
    `)
    .order('created_at', { ascending: false });

  if (tasksError) {
    console.error('Error fetching tasks:', tasksError);
  }

  // Fetch all projects
  const { data: projects, error: projectsError } = await getSupabaseClient()
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
    assignee_id: task.assignee_id as string | null,
    assignee_name: task.assignee ? (task.assignee as { full_name: string }).full_name : null,
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
  projects: ProjectSummary[],
  userInfo?: SlackUserInfo
) {
  const now = new Date();

  // Filter tasks assigned to this user if we know who they are
  const userAssignedTasks = userInfo?.abetoUser?.id
    ? tasks.filter(t => t.assignee_id === userInfo.abetoUser!.id)
    : [];

  const userTeamTasks = userInfo?.abetoUser?.team_name
    ? tasks.filter(t => t.owner_team === userInfo.abetoUser!.team_name)
    : [];

  const taskStats = {
    total: tasks.length,
    notStarted: tasks.filter(t => t.status === 'not_started').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    blocked: tasks.filter(t => t.status === 'blocked').length,
    overdue: tasks.filter(t => {
      if (!t.due_date) return false;
      return new Date(t.due_date) < now;
    }).length,
    criticalPath: tasks.filter(t => t.is_critical_path).length,
    highAIPotential: tasks.filter(t => t.ai_potential === 'high').length,
  };

  // User-specific stats
  const userStats = userInfo?.abetoUser ? {
    assignedTotal: userAssignedTasks.length,
    assignedInProgress: userAssignedTasks.filter(t => t.status === 'in_progress').length,
    assignedOverdue: userAssignedTasks.filter(t => {
      if (!t.due_date || t.status === 'completed') return false;
      return new Date(t.due_date) < now;
    }).length,
    teamTotal: userTeamTasks.length,
    teamBlocked: userTeamTasks.filter(t => t.status === 'blocked').length,
  } : null;

  const userName = userInfo?.abetoUser?.full_name || userInfo?.slackUserName || 'there';
  const userTeam = userInfo?.abetoUser?.team_name;

  const systemPrompt = `You are the Task Companion, an AI assistant for Abeto's task management system integrated with Slack. Abeto is a solar installation lead generation company in Spain building AI-powered automation tools.

## Current User
- Name: ${userName}
${userTeam ? `- Team: ${userTeam}` : '- Team: Not specified'}
${userStats ? `
### ${userName}'s Personal Tasks
- Assigned to ${userName}: ${userStats.assignedTotal} tasks
- Currently working on: ${userStats.assignedInProgress} in progress
- Overdue: ${userStats.assignedOverdue} tasks need attention!
${userTeam ? `
### ${userTeam} Team Tasks
- Total team tasks: ${userStats.teamTotal}
- Blocked: ${userStats.teamBlocked}` : ''}
` : '- Note: User not found in system - showing all tasks'}

${userAssignedTasks.length > 0 ? `
### Tasks Assigned to ${userName}
${userAssignedTasks.slice(0, 10).map(t => `
- *${t.title}* (${t.status})
  - Project: ${t.project?.title || 'None'}
  - Priority: ${t.priority}
  - Due: ${t.due_date || 'No due date'}
  ${t.status === 'blocked' ? '⚠️ BLOCKED' : ''}
  ${t.due_date && new Date(t.due_date) < now && t.status !== 'completed' ? '🚨 OVERDUE' : ''}
`).join('\n')}
` : ''}

## Your Role
Help ${userName} understand their tasks, prioritize work, and track progress through Slack.
When ${userName} asks "what should I work on", prioritize THEIR assigned tasks first, then team tasks.

## Overall System Statistics
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
- *${t.title}* (${t.status}) ${t.assignee_name ? `[Assigned: ${t.assignee_name}]` : '[Unassigned]'}
  - Project: ${t.project?.title || 'None'}
  - Priority: ${t.priority}
  - Team: ${t.owner_team || 'None'}
  - Due: ${t.due_date || 'No due date'}
  - Critical Path: ${t.is_critical_path ? 'Yes' : 'No'}
`).join('\n')}

## All Projects (Top 20)
${projects.slice(0, 20).map(p => `
- *${p.title}* (${p.status})
  - Priority: ${p.priority}
  - Progress: ${p.progress_percentage}%
`).join('\n')}

## Response Guidelines for Slack
1. Address ${userName} by name when appropriate
2. Prioritize ${userName}'s assigned tasks when giving recommendations
3. Keep responses concise (Slack has message limits)
4. Use Slack formatting: *bold*, _italic_, \`code\`, bullet points
5. Be actionable - suggest specific tasks to work on
6. Mention overdue or critical tasks proactively
7. Keep it friendly and professional`;

  const response = await getAnthropicClient().messages.create({
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
      const { data: settings } = await getSupabaseClient()
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

// Track processed events to prevent duplicate processing (Slack retries)
const processedEvents = new Set<string>();

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

      // Deduplicate events using event_id or ts
      const eventId = body.event_id || event.ts || '';
      if (eventId && processedEvents.has(eventId)) {
        console.log('Duplicate event, skipping:', eventId);
        return NextResponse.json({ ok: true });
      }
      if (eventId) {
        processedEvents.add(eventId);
        // Clean up old events after 5 minutes
        setTimeout(() => processedEvents.delete(eventId), 5 * 60 * 1000);
      }

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
          try {
            console.log(`Processing Slack message: "${cleanMessage}" in channel ${event.channel}`);

            // Get bot token for API calls
            let botToken = process.env.SLACK_BOT_TOKEN;
            if (!botToken) {
              const { data: settings } = await getSupabaseClient()
                .from('app_settings')
                .select('value')
                .eq('key', 'slack_bot_token')
                .single();
              botToken = settings?.value;
            }

            // Get user info from Slack and map to Abeto user
            let userInfo: SlackUserInfo | undefined;
            if (event.user && botToken) {
              userInfo = await getSlackUserInfo(event.user, botToken);
              console.log(`User info: ${userInfo.slackUserName} (${userInfo.abetoUser?.full_name || 'not in system'})`);
            }

            // Fetch current tasks and projects
            const { tasks, projects } = await fetchTasksAndProjects();
            console.log(`Fetched ${tasks.length} tasks and ${projects.length} projects`);

            // Generate AI response with user context
            const aiResponse = await generateAIResponse(cleanMessage, tasks, projects, userInfo);
            console.log(`Generated AI response: ${aiResponse.substring(0, 100)}...`);

            // Send response using Slack Web API
            await sendSlackResponse(event.channel, aiResponse);
            console.log('Slack response sent successfully');
          } catch (processError) {
            console.error('Error processing Slack message:', processError);
            // Try to send an error message to the channel
            try {
              await sendSlackResponse(event.channel, 'Sorry, I encountered an error processing your request. Please try again.');
            } catch (sendError) {
              console.error('Failed to send error message to Slack:', sendError);
            }
          }

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
