import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy-load Supabase client
let supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return supabase;
}

// Send a message to Slack
async function sendSlackMessage(channel: string, text: string, blocks?: unknown[]) {
  const botToken = process.env.SLACK_BOT_TOKEN;
  if (!botToken) {
    throw new Error('SLACK_BOT_TOKEN not configured');
  }

  const payload: { channel: string; text: string; blocks?: unknown[] } = {
    channel,
    text,
  };

  if (blocks) {
    payload.blocks = blocks;
  }

  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${botToken}`,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  if (!result.ok) {
    throw new Error(`Slack API error: ${result.error}`);
  }

  return result;
}

// Generate a daily summary report
async function generateDailySummary() {
  const now = new Date();
  const supabaseClient = getSupabaseClient();

  // Fetch tasks
  const { data: tasks } = await supabaseClient
    .from('tasks')
    .select(`
      id, title, status, priority, due_date, is_critical_path,
      project:projects(title, slug),
      assignee:users!assignee_id(full_name)
    `);

  // Fetch projects
  const { data: projects } = await supabaseClient
    .from('projects')
    .select('id, title, status, progress_percentage, priority')
    .eq('is_predicted', false);

  const allTasks = tasks || [];
  const allProjects = projects || [];

  // Calculate stats
  const totalTasks = allTasks.length;
  const inProgress = allTasks.filter(t => t.status === 'in_progress').length;
  const blocked = allTasks.filter(t => t.status === 'blocked').length;
  const completed = allTasks.filter(t => t.status === 'completed').length;
  const overdue = allTasks.filter(t => {
    if (!t.due_date || t.status === 'completed') return false;
    return new Date(t.due_date) < now;
  }).length;

  const activeProjects = allProjects.filter(p =>
    p.status === 'in_progress' || p.status === 'planning'
  ).length;

  // Build the message
  let message = `📊 *Daily Summary - ${now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}*\n\n`;

  message += `*Projects*\n`;
  message += `• Active: ${activeProjects}\n\n`;

  message += `*Tasks Overview*\n`;
  message += `• Total: ${totalTasks}\n`;
  message += `• In Progress: ${inProgress}\n`;
  message += `• Completed: ${completed}\n`;

  if (blocked > 0) {
    message += `• ⚠️ *Blocked: ${blocked}*\n`;
  }
  if (overdue > 0) {
    message += `• 🚨 *Overdue: ${overdue}*\n`;
  }

  // Add top priority items
  const blockedTasks = allTasks.filter(t => t.status === 'blocked').slice(0, 3);
  if (blockedTasks.length > 0) {
    message += `\n*⚠️ Blocked Tasks Needing Attention*\n`;
    blockedTasks.forEach(t => {
      const proj = t.project as unknown;
      const projectTitle = proj && typeof proj === 'object' && 'title' in proj ? (proj as { title: string }).title : 'No project';
      const user = t.assignee as unknown;
      const assignee = user && typeof user === 'object' && 'full_name' in user ? (user as { full_name: string }).full_name : 'Unassigned';
      message += `• _${t.title}_ (${projectTitle}) → ${assignee}\n`;
    });
  }

  const overdueTasks = allTasks.filter(t => {
    if (!t.due_date || t.status === 'completed') return false;
    return new Date(t.due_date) < now;
  }).slice(0, 3);

  if (overdueTasks.length > 0) {
    message += `\n*🚨 Overdue Tasks*\n`;
    overdueTasks.forEach(t => {
      const daysOverdue = Math.floor((now.getTime() - new Date(t.due_date!).getTime()) / (1000 * 60 * 60 * 24));
      const user = t.assignee as unknown;
      const assignee = user && typeof user === 'object' && 'full_name' in user ? (user as { full_name: string }).full_name : 'Unassigned';
      message += `• _${t.title}_ (${daysOverdue}d overdue) → ${assignee}\n`;
    });
  }

  message += `\n_Use \`@Task-Companion summary\` for more details_`;

  return message;
}

// POST - Send an alert or report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, channel, message, customMessage } = body;

    // Default to #general or a configured channel
    const targetChannel = channel || process.env.SLACK_DEFAULT_CHANNEL || '#general';

    let messageToSend: string;

    switch (type) {
      case 'daily_summary':
        messageToSend = await generateDailySummary();
        break;

      case 'test':
        messageToSend = `🧪 *Test Alert from Task Companion*\n\nThis is a test alert sent at ${new Date().toLocaleString()}.\n\nYour Slack integration is working correctly! 🎉\n\n_Use \`@Task-Companion help\` to see available commands._`;
        break;

      case 'custom':
        if (!customMessage) {
          return NextResponse.json(
            { error: 'customMessage is required for custom type' },
            { status: 400 }
          );
        }
        messageToSend = customMessage;
        break;

      case 'blocked_alert':
        const supabaseClient = getSupabaseClient();
        const { data: blockedTasks } = await supabaseClient
          .from('tasks')
          .select(`
            id, title, priority,
            project:projects(title),
            assignee:users!assignee_id(full_name)
          `)
          .eq('status', 'blocked');

        if (!blockedTasks || blockedTasks.length === 0) {
          messageToSend = `✅ *No Blocked Tasks*\n\nGreat news - there are no blocked tasks right now!`;
        } else {
          messageToSend = `⚠️ *Blocked Tasks Alert* (${blockedTasks.length} total)\n\n`;
          blockedTasks.slice(0, 5).forEach(t => {
            const proj = t.project as unknown;
            const projectTitle = proj && typeof proj === 'object' && 'title' in proj ? (proj as { title: string }).title : 'No project';
            const user = t.assignee as unknown;
            const assignee = user && typeof user === 'object' && 'full_name' in user ? (user as { full_name: string }).full_name : 'Unassigned';
            messageToSend += `• *${t.title}*\n  _${projectTitle}_ → ${assignee}\n`;
          });
          if (blockedTasks.length > 5) {
            messageToSend += `\n_...and ${blockedTasks.length - 5} more_`;
          }
          messageToSend += `\n\n_Need help? Use \`@Task-Companion blocked\` for details._`;
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid alert type. Use: daily_summary, test, custom, or blocked_alert' },
          { status: 400 }
        );
    }

    // Send to Slack
    const result = await sendSlackMessage(targetChannel, messageToSend);

    return NextResponse.json({
      success: true,
      message: 'Alert sent successfully',
      channel: targetChannel,
      ts: result.ts,
    });
  } catch (error) {
    console.error('Error sending Slack alert:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send alert' },
      { status: 500 }
    );
  }
}

// GET - Show available alert types
export async function GET() {
  return NextResponse.json({
    availableTypes: [
      { type: 'test', description: 'Send a test alert to verify integration' },
      { type: 'daily_summary', description: 'Send the daily project/task summary' },
      { type: 'blocked_alert', description: 'Send an alert about blocked tasks' },
      { type: 'custom', description: 'Send a custom message (requires customMessage param)' },
    ],
    usage: {
      method: 'POST',
      body: {
        type: 'test | daily_summary | blocked_alert | custom',
        channel: '#channel-name (optional, defaults to SLACK_DEFAULT_CHANNEL)',
        customMessage: 'Your message here (only for type: custom)',
      },
    },
  });
}
