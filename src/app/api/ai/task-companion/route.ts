import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

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
  pain_point_level?: string | null;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  message: string;
  tasks: TaskSummary[];
  projects: ProjectSummary[];
  userArea?: string;
  conversationHistory: ConversationMessage[];
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    const { message, tasks, projects, userArea, conversationHistory } = body;

    const now = new Date();

    // Build context about the current state
    const taskStats = {
      total: tasks.length,
      notStarted: tasks.filter(t => t.status === 'not_started').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      blocked: tasks.filter(t => t.status === 'blocked').length,
      inReview: tasks.filter(t => t.status === 'in_review').length,
      overdue: tasks.filter(t => {
        if (!t.due_date) return false;
        return new Date(t.due_date) < now;
      }).length,
      dueSoon: tasks.filter(t => {
        if (!t.due_date) return false;
        const dueDate = new Date(t.due_date);
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilDue >= 0 && daysUntilDue <= 7;
      }).length,
      criticalPath: tasks.filter(t => t.is_critical_path).length,
      criticalPathBlocked: tasks.filter(t => t.is_critical_path && t.status === 'blocked').length,
      foundational: tasks.filter(t => t.is_foundational).length,
      highAIPotential: tasks.filter(t => t.ai_potential === 'high').length,
    };

    const projectStats = {
      total: projects.length,
      idea: projects.filter(p => p.status === 'idea').length,
      planning: projects.filter(p => p.status === 'planning').length,
      inProgress: projects.filter(p => p.status === 'in_progress').length,
      completed: projects.filter(p => p.status === 'completed').length,
      needsReview: projects.filter(p =>
        (p.status === 'planning' || p.status === 'in_progress') && !p.pain_point_level
      ).length,
    };

    // Group blocked tasks by team to identify cross-team blockers
    const blockedByTeam: Record<string, string[]> = {};
    tasks.filter(t => t.status === 'blocked').forEach(t => {
      const team = t.owner_team || 'Unassigned';
      if (!blockedByTeam[team]) blockedByTeam[team] = [];
      blockedByTeam[team].push(t.title);
    });

    // Identify overdue tasks
    const overdueTasks = tasks.filter(t => {
      if (!t.due_date || t.status === 'completed') return false;
      return new Date(t.due_date) < now;
    }).map(t => ({
      title: t.title,
      project: t.project?.title,
      daysOverdue: Math.ceil((now.getTime() - new Date(t.due_date!).getTime()) / (1000 * 60 * 60 * 24)),
    }));

    // Build the system prompt with all the context
    const systemPrompt = `You are the Task Companion 🤖, a friendly AI assistant for Abeto's task management system. Abeto is a solar installation lead generation company in Spain building AI-powered tools to automate operations.

## Your Personality
You're a helpful, proactive robot assistant. You care about helping the team succeed and you're always looking out for potential issues. Be friendly but professional, use occasional emojis to be approachable (but don't overdo it).

## Current Date & Time
${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

## System Health Overview

### 🚨 ALERTS & ISSUES
${taskStats.overdue > 0 ? `⚠️ **${taskStats.overdue} OVERDUE TASKS** - These need immediate attention!` : '✅ No overdue tasks'}
${taskStats.criticalPathBlocked > 0 ? `🔴 **${taskStats.criticalPathBlocked} CRITICAL PATH TASKS BLOCKED** - These are blocking other work!` : ''}
${taskStats.blocked > 0 ? `⏸️ **${taskStats.blocked} blocked tasks** across teams` : '✅ No blocked tasks'}
${projectStats.needsReview > 0 ? `📋 **${projectStats.needsReview} projects need review** - Missing stakeholder assessment` : ''}

### Cross-Team Blockers
${Object.keys(blockedByTeam).length > 0 ? Object.entries(blockedByTeam).map(([team, tasks]) =>
  `- **${team}**: ${tasks.length} blocked (${tasks.slice(0, 2).join(', ')}${tasks.length > 2 ? '...' : ''})`
).join('\n') : 'No cross-team blockers detected'}

### Overdue Tasks Detail
${overdueTasks.length > 0 ? overdueTasks.slice(0, 5).map(t =>
  `- **${t.title}** (${t.project || 'No project'}) - ${t.daysOverdue} day${t.daysOverdue > 1 ? 's' : ''} overdue`
).join('\n') : 'No overdue tasks'}

### Task Statistics
- Total: ${taskStats.total} tasks
- Not started: ${taskStats.notStarted}
- In progress: ${taskStats.inProgress}
- In review: ${taskStats.inReview}
- Completed: ${taskStats.completed}
- Due this week: ${taskStats.dueSoon}
- Critical path: ${taskStats.criticalPath}
- Foundational: ${taskStats.foundational}
- High AI potential: ${taskStats.highAIPotential}

### Project Statistics
- Total: ${projectStats.total} projects
- Ideas: ${projectStats.idea}
- Planning: ${projectStats.planning}
- In progress: ${projectStats.inProgress}
- Completed: ${projectStats.completed}
- Needs review: ${projectStats.needsReview}

### All Tasks (for reference)
${tasks.slice(0, 100).map(t => `
- **${t.title}** [${t.status}] ${t.is_critical_path ? '🔴 CRITICAL' : ''} ${t.is_foundational ? '🏗️' : ''}
  - Project: ${t.project?.title || 'None'} | Priority: ${t.priority} | AI: ${t.ai_potential}
  - Due: ${t.due_date || 'No date'} | Team: ${t.owner_team || 'Unassigned'}
  ${t.ai_assist_description ? `- 🤖 AI Assist: ${t.ai_assist_description}` : ''}`).join('\n')}

### All Projects
${projects.map(p => `
- **${p.title}** [${p.status}] ${!p.pain_point_level ? '📋 NEEDS REVIEW' : ''}
  - Priority: ${p.priority} | Progress: ${p.progress_percentage}%
  - Tasks: ${p.completed_tasks || 0}/${p.total_tasks || 0} completed`).join('\n')}

## User Context
${userArea && userArea !== 'all' ? `User is from the ${userArea} team.` : 'User has access to all areas.'}

## Response Guidelines

1. **Be proactive about issues**: If there are overdue tasks, blocked critical path items, or projects needing review - mention them! Don't wait to be asked.

2. **Prioritize recommendations** (in this order):
   - 🚨 Overdue tasks (immediate attention)
   - 🔴 Blocked critical path tasks (unblock these first)
   - ⚠️ Cross-team blockers (may affect other areas)
   - 📋 Projects needing review
   - 🏗️ Foundational tasks (enables other work)
   - ⭐ High AI potential tasks (can be accelerated)

3. **Use clear formatting**:
   - **Bold** for task/project names
   - Use bullet points and emojis for readability
   - Keep responses concise but informative

4. **Cross-team awareness**: When you see blockers, think about which teams might be affected and mention it.

5. **Review reminders**: If projects need stakeholder review, remind users - this is important for project health.

6. **Be conversational**: Reference previous messages, build on the conversation, feel like a helpful teammate.

7. **Suggest actions**: Point users to specific tasks or projects they should look at.

Remember: You're not just answering questions - you're actively helping the team stay on top of their work!`;

    // Build conversation messages for the API
    const messages: { role: 'user' | 'assistant'; content: string }[] = [];

    // Add conversation history
    conversationHistory.forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    });

    // Add current message
    messages.push({
      role: 'user',
      content: message,
    });

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages,
    });

    // Extract text response
    const textContent = response.content.find(block => block.type === 'text');
    const responseText = textContent?.type === 'text' ? textContent.text : 'I apologize, but I could not generate a response.';

    // Extract any action items from the response
    const actions: { type: string; label: string; projectSlug?: string; href?: string }[] = [];

    // Look for project mentions and create action links
    projects.forEach(project => {
      if (responseText.toLowerCase().includes(project.title.toLowerCase())) {
        actions.push({
          type: 'project',
          label: `View ${project.title}`,
          projectSlug: project.slug,
        });
      }
    });

    // Add review action if reviews were mentioned
    if (responseText.toLowerCase().includes('review') && projectStats.needsReview > 0) {
      actions.push({
        type: 'link',
        label: 'Start Reviews',
        href: '/reviews',
      });
    }

    // Add blocked tasks action if blockers were mentioned
    if (responseText.toLowerCase().includes('blocked') && taskStats.blocked > 0) {
      actions.push({
        type: 'link',
        label: 'View Blocked Tasks',
        href: '/tasks?status=blocked',
      });
    }

    // Limit to 3 actions
    const limitedActions = actions.slice(0, 3);

    return NextResponse.json({
      response: responseText,
      actions: limitedActions.length > 0 ? limitedActions : undefined,
    });
  } catch (error) {
    console.error('Task Companion API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', response: 'I apologize, but I encountered an error. Please try again.' },
      { status: 500 }
    );
  }
}
