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

    // Build context about the current state
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
      foundational: tasks.filter(t => t.is_foundational).length,
      highAIPotential: tasks.filter(t => t.ai_potential === 'high').length,
    };

    const projectStats = {
      total: projects.length,
      idea: projects.filter(p => p.status === 'idea').length,
      planning: projects.filter(p => p.status === 'planning').length,
      inProgress: projects.filter(p => p.status === 'in_progress').length,
      completed: projects.filter(p => p.status === 'completed').length,
    };

    // Build the system prompt with all the context
    const systemPrompt = `You are the Task Companion, an AI assistant for Abeto's task management system. Abeto is a solar installation lead generation company in Spain that is building AI-powered tools to automate their operations.

## Your Role
You help team members understand their tasks, prioritize work, track progress, and answer questions about projects. You have access to all tasks and projects in the system.

## Current System State

### Task Statistics
- Total tasks: ${taskStats.total}
- Not started: ${taskStats.notStarted}
- In progress: ${taskStats.inProgress}
- Completed: ${taskStats.completed}
- Blocked: ${taskStats.blocked}
- Overdue: ${taskStats.overdue}
- Critical path tasks: ${taskStats.criticalPath}
- Foundational tasks: ${taskStats.foundational}
- High AI potential tasks: ${taskStats.highAIPotential}

### Project Statistics
- Total projects: ${projectStats.total}
- Ideas: ${projectStats.idea}
- Planning: ${projectStats.planning}
- In progress: ${projectStats.inProgress}
- Completed: ${projectStats.completed}

### All Tasks
${tasks.map(t => `
- **${t.title}** (${t.status})
  - Project: ${t.project?.title || 'None'}
  - Phase: ${t.phase}
  - Priority: ${t.priority}
  - Difficulty: ${t.difficulty}
  - AI Potential: ${t.ai_potential}
  - Due: ${t.due_date || 'No due date'}
  - Critical Path: ${t.is_critical_path ? 'Yes' : 'No'}
  - Foundational: ${t.is_foundational ? 'Yes' : 'No'}
  - Team: ${t.owner_team || 'Unassigned'}
  ${t.ai_assist_description ? `- AI Assist: ${t.ai_assist_description}` : ''}
`).join('\n')}

### All Projects
${projects.map(p => `
- **${p.title}** (${p.status})
  - Slug: ${p.slug}
  - Priority: ${p.priority}
  - Progress: ${p.progress_percentage}%
  - Tasks: ${p.completed_tasks || 0}/${p.total_tasks || 0} completed
  ${p.description ? `- Description: ${p.description.substring(0, 200)}...` : ''}
`).join('\n')}

## User Context
${userArea && userArea !== 'all' ? `The user is from the ${userArea} area/team.` : 'The user has access to all areas.'}

## Response Guidelines

1. **Be helpful and actionable**: When users ask what to work on, provide specific task recommendations with reasons.

2. **Use the data**: Reference specific tasks and projects by name. Include relevant statistics.

3. **Format nicely**: Use markdown formatting:
   - **Bold** for task/project names
   - Use bullet points for lists
   - Keep responses concise but informative

4. **Provide actions when relevant**: If mentioning a project, you can suggest the user click to view it.

5. **Be proactive**: If you notice issues (many blocked tasks, overdue items), mention them.

6. **Priority recommendations**: When recommending what to work on, consider:
   - Critical path tasks (highest priority)
   - Foundational tasks (enables other work)
   - Overdue tasks (need immediate attention)
   - Blocked tasks (need unblocking)
   - High AI potential tasks (can be accelerated)

7. **Answer questions**: Help users understand project status, task details, and relationships between tasks.

8. **Be conversational**: Remember the conversation history and build on previous exchanges.

Always respond in a friendly, professional manner. Keep responses focused and actionable.`;

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
