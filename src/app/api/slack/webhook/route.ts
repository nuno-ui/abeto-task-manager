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

    console.log('[Slack] User lookup response:', {
      ok: userData.ok,
      userId: slackUserId,
      name: userData.user?.real_name || userData.user?.name,
      email: userData.user?.profile?.email,
    });

    if (userData.ok && userData.user) {
      result.slackUserName = userData.user.real_name || userData.user.name || 'User';
      result.slackEmail = userData.user.profile?.email;

      // Try to find matching user in Abeto by email first
      if (result.slackEmail) {
        const { data: abetoUser } = await getSupabaseClient()
          .from('users')
          .select('id, full_name, email, team:teams(name)')
          .eq('email', result.slackEmail)
          .single();

        if (abetoUser) {
          console.log('[Slack] Found Abeto user by email:', abetoUser.email);
          const teamData = abetoUser.team as { name: string } | { name: string }[] | null;
          const teamName = Array.isArray(teamData) ? teamData[0]?.name : teamData?.name;
          result.abetoUser = {
            id: abetoUser.id,
            full_name: abetoUser.full_name || result.slackUserName,
            email: abetoUser.email,
            team_name: teamName,
          };
        }
      }

      // Fallback: Try to find by name if email didn't match
      if (!result.abetoUser && result.slackUserName) {
        const firstName = result.slackUserName.split(' ')[0].toLowerCase();
        console.log('[Slack] Email lookup failed, trying name match:', firstName);

        const { data: users } = await getSupabaseClient()
          .from('users')
          .select('id, full_name, email, team:teams(name)');

        // Find user whose full_name starts with the same first name (case-insensitive)
        const matchedUser = users?.find(u =>
          u.full_name?.toLowerCase().startsWith(firstName)
        );

        if (matchedUser) {
          console.log('[Slack] Found Abeto user by name match:', matchedUser.full_name);
          const teamData = matchedUser.team as { name: string } | { name: string }[] | null;
          const teamName = Array.isArray(teamData) ? teamData[0]?.name : teamData?.name;
          result.abetoUser = {
            id: matchedUser.id,
            full_name: matchedUser.full_name || result.slackUserName,
            email: matchedUser.email,
            team_name: teamName,
          };
        } else {
          console.log('[Slack] No Abeto user found for Slack user:', result.slackUserName);
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

// Handle specific known commands with structured responses (no AI needed)
async function handleKnownCommand(
  command: string,
  tasks: TaskSummary[],
  projects: ProjectSummary[],
  userInfo?: SlackUserInfo
): Promise<string | null> {
  const now = new Date();
  const userName = userInfo?.abetoUser?.full_name || userInfo?.slackUserName || 'there';
  const userId = userInfo?.abetoUser?.id;
  const userTeam = userInfo?.abetoUser?.team_name;

  // Normalize command (lowercase, trim)
  const cmd = command.toLowerCase().trim();

  // === HELP COMMAND ===
  if (cmd === 'help' || cmd === '?' || cmd === 'commands') {
    return `👋 *Hi ${userName}!* Here's what I can help you with:

*📋 Task Commands*
• \`@Task-Companion my tasks\` - See your assigned tasks
• \`@Task-Companion blocked\` - Show blocked tasks needing attention
• \`@Task-Companion overdue\` - Show overdue tasks

*📊 Project Commands*
• \`@Task-Companion projects\` - List all active projects
• \`@Task-Companion summary\` - Get a quick overview of everything

*💬 Ask Me Anything*
• \`@Task-Companion what should I work on?\`
• \`@Task-Companion status of [project name]\`
• \`@Task-Companion how many tasks are in progress?\`

Just mention me and ask! 🤖`;
  }

  // === MY TASKS COMMAND ===
  if (cmd === 'my tasks' || cmd === 'mytasks' || cmd === 'tasks' || cmd === 'my work') {
    if (!userId) {
      return `❌ Sorry ${userName}, I couldn't find your user account in Abeto. Make sure your Slack email matches your Abeto account.`;
    }

    const myTasks = tasks.filter(t => t.assignee_id === userId && t.status !== 'completed');

    if (myTasks.length === 0) {
      return `✨ *No active tasks assigned to you, ${userName}!*\n\nYou're all caught up, or tasks may be assigned to your team rather than you personally.`;
    }

    const inProgress = myTasks.filter(t => t.status === 'in_progress');
    const notStarted = myTasks.filter(t => t.status === 'not_started');
    const blocked = myTasks.filter(t => t.status === 'blocked');
    const overdue = myTasks.filter(t => t.due_date && new Date(t.due_date) < now);

    let response = `📋 *${userName}'s Tasks* (${myTasks.length} active)\n\n`;

    if (overdue.length > 0) {
      response += `🚨 *OVERDUE (${overdue.length})*\n`;
      overdue.slice(0, 3).forEach(t => {
        response += `• _${t.title}_ - ${t.project?.title || 'No project'}\n`;
      });
      if (overdue.length > 3) response += `  _...and ${overdue.length - 3} more_\n`;
      response += '\n';
    }

    if (blocked.length > 0) {
      response += `⚠️ *BLOCKED (${blocked.length})*\n`;
      blocked.slice(0, 3).forEach(t => {
        response += `• _${t.title}_ - ${t.project?.title || 'No project'}\n`;
      });
      if (blocked.length > 3) response += `  _...and ${blocked.length - 3} more_\n`;
      response += '\n';
    }

    if (inProgress.length > 0) {
      response += `🔄 *IN PROGRESS (${inProgress.length})*\n`;
      inProgress.slice(0, 5).forEach(t => {
        const dueStr = t.due_date ? ` (due ${new Date(t.due_date).toLocaleDateString()})` : '';
        response += `• _${t.title}_${dueStr}\n`;
      });
      if (inProgress.length > 5) response += `  _...and ${inProgress.length - 5} more_\n`;
      response += '\n';
    }

    if (notStarted.length > 0) {
      response += `📝 *NOT STARTED (${notStarted.length})*\n`;
      notStarted.slice(0, 5).forEach(t => {
        response += `• _${t.title}_\n`;
      });
      if (notStarted.length > 5) response += `  _...and ${notStarted.length - 5} more_\n`;
    }

    return response.trim();
  }

  // === BLOCKED COMMAND ===
  if (cmd === 'blocked' || cmd === 'blockers') {
    let blockedTasks = tasks.filter(t => t.status === 'blocked');

    // If user is in system, prioritize their team's blocked tasks
    if (userTeam) {
      const teamBlocked = blockedTasks.filter(t => t.owner_team === userTeam);
      const otherBlocked = blockedTasks.filter(t => t.owner_team !== userTeam);
      blockedTasks = [...teamBlocked, ...otherBlocked];
    }

    if (blockedTasks.length === 0) {
      return `✅ *No blocked tasks!*\n\nGreat news - nothing is currently blocked across all projects.`;
    }

    let response = `⚠️ *Blocked Tasks* (${blockedTasks.length} total)\n\n`;

    blockedTasks.slice(0, 10).forEach(t => {
      const teamStr = t.owner_team ? ` [${t.owner_team}]` : '';
      const assigneeStr = t.assignee_name ? ` → ${t.assignee_name}` : '';
      response += `• *${t.title}*${teamStr}${assigneeStr}\n`;
      response += `  _${t.project?.title || 'No project'}_ | Priority: ${t.priority}\n`;
    });

    if (blockedTasks.length > 10) {
      response += `\n_...and ${blockedTasks.length - 10} more blocked tasks_`;
    }

    return response;
  }

  // === OVERDUE COMMAND ===
  if (cmd === 'overdue' || cmd === 'late' || cmd === 'past due') {
    const overdueTasks = tasks.filter(t => {
      if (!t.due_date || t.status === 'completed') return false;
      return new Date(t.due_date) < now;
    });

    if (overdueTasks.length === 0) {
      return `✅ *No overdue tasks!*\n\nEverything is on schedule. 🎉`;
    }

    let response = `🚨 *Overdue Tasks* (${overdueTasks.length} total)\n\n`;

    overdueTasks.slice(0, 10).forEach(t => {
      const daysOverdue = Math.floor((now.getTime() - new Date(t.due_date!).getTime()) / (1000 * 60 * 60 * 24));
      const assigneeStr = t.assignee_name ? ` → ${t.assignee_name}` : ' (unassigned)';
      response += `• *${t.title}*${assigneeStr}\n`;
      response += `  _${t.project?.title || 'No project'}_ | ${daysOverdue} day${daysOverdue === 1 ? '' : 's'} overdue\n`;
    });

    if (overdueTasks.length > 10) {
      response += `\n_...and ${overdueTasks.length - 10} more overdue tasks_`;
    }

    return response;
  }

  // === PROJECTS COMMAND ===
  if (cmd === 'projects' || cmd === 'project list' || cmd === 'all projects') {
    const activeProjects = projects.filter(p =>
      p.status === 'in_progress' || p.status === 'planning' || p.status === 'not_started'
    );

    if (activeProjects.length === 0) {
      return `📊 *No active projects found*\n\nAll projects may be completed or on hold.`;
    }

    let response = `📊 *Active Projects* (${activeProjects.length} total)\n\n`;

    // Group by status
    const inProgress = activeProjects.filter(p => p.status === 'in_progress');
    const planning = activeProjects.filter(p => p.status === 'planning');
    const notStarted = activeProjects.filter(p => p.status === 'not_started');

    if (inProgress.length > 0) {
      response += `*🔄 In Progress (${inProgress.length})*\n`;
      inProgress.slice(0, 5).forEach(p => {
        const progressBar = getProgressBar(p.progress_percentage);
        response += `• *${p.title}* ${progressBar} ${p.progress_percentage}%\n`;
      });
      if (inProgress.length > 5) response += `  _...and ${inProgress.length - 5} more_\n`;
      response += '\n';
    }

    if (planning.length > 0) {
      response += `*📝 Planning (${planning.length})*\n`;
      planning.slice(0, 3).forEach(p => {
        response += `• _${p.title}_ (${p.priority} priority)\n`;
      });
      if (planning.length > 3) response += `  _...and ${planning.length - 3} more_\n`;
      response += '\n';
    }

    if (notStarted.length > 0) {
      response += `*⏳ Not Started (${notStarted.length})*\n`;
      notStarted.slice(0, 3).forEach(p => {
        response += `• _${p.title}_\n`;
      });
      if (notStarted.length > 3) response += `  _...and ${notStarted.length - 3} more_\n`;
    }

    return response.trim();
  }

  // === SUMMARY COMMAND ===
  if (cmd === 'summary' || cmd === 'status' || cmd === 'overview' || cmd === 'dashboard') {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
    const overdueTasks = tasks.filter(t => {
      if (!t.due_date || t.status === 'completed') return false;
      return new Date(t.due_date) < now;
    }).length;

    const activeProjects = projects.filter(p =>
      p.status === 'in_progress' || p.status === 'planning'
    ).length;
    const avgProgress = projects.length > 0
      ? Math.round(projects.reduce((sum, p) => sum + p.progress_percentage, 0) / projects.length)
      : 0;

    let response = `📊 *Abeto Summary*\n\n`;
    response += `*Projects*\n`;
    response += `• Active: ${activeProjects} projects\n`;
    response += `• Average progress: ${avgProgress}%\n\n`;

    response += `*Tasks*\n`;
    response += `• Total: ${totalTasks} tasks\n`;
    response += `• In progress: ${inProgressTasks}\n`;
    response += `• Completed: ${completedTasks}\n`;

    if (blockedTasks > 0) {
      response += `• ⚠️ Blocked: ${blockedTasks}\n`;
    }
    if (overdueTasks > 0) {
      response += `• 🚨 Overdue: ${overdueTasks}\n`;
    }

    // User-specific summary if logged in
    if (userId) {
      const myTasks = tasks.filter(t => t.assignee_id === userId && t.status !== 'completed');
      const myInProgress = myTasks.filter(t => t.status === 'in_progress').length;
      const myBlocked = myTasks.filter(t => t.status === 'blocked').length;

      response += `\n*Your Tasks, ${userName}*\n`;
      response += `• Active: ${myTasks.length} tasks\n`;
      response += `• In progress: ${myInProgress}\n`;
      if (myBlocked > 0) {
        response += `• ⚠️ Blocked: ${myBlocked}\n`;
      }
    }

    response += `\n_Need details? Try \`@Task-Companion my tasks\` or \`@Task-Companion projects\`_`;

    return response;
  }

  // Command not recognized - return null to let AI handle it
  return null;
}

// Helper function for progress bar
function getProgressBar(percentage: number): string {
  const filled = Math.round(percentage / 10);
  const empty = 10 - filled;
  return '▓'.repeat(filled) + '░'.repeat(empty);
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

            // First, try to handle known commands (no AI needed)
            const knownCommandResponse = await handleKnownCommand(cleanMessage, tasks, projects, userInfo);

            let responseText: string;
            if (knownCommandResponse) {
              console.log(`Handled as known command: ${cleanMessage}`);
              responseText = knownCommandResponse;
            } else {
              // Fall back to AI for complex/unknown requests
              console.log(`Using AI for: ${cleanMessage}`);
              responseText = await generateAIResponse(cleanMessage, tasks, projects, userInfo);
              console.log(`Generated AI response: ${responseText.substring(0, 100)}...`);
            }

            // Send response using Slack Web API
            await sendSlackResponse(event.channel, responseText);
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
