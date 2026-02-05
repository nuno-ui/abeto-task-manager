import { NextResponse } from 'next/server';
import { anthropic, PROJECT_SCHEMA, TASK_SCHEMA } from '@/lib/ai';
import { createClient } from '@supabase/supabase-js';
import { getCurrentUser } from '@/lib/supabase/auth';
import { isAdmin, getUnauthorizedMessage } from '@/lib/supabase/authorization';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are an AI assistant analyzing user comments to suggest system updates for a task management system called Abeto.

Your job is to:
1. Analyze the comment content to understand what changes the user wants
2. Identify if it's a field update, an action command, or just discussion
3. Generate appropriate suggestions or actions

Project Schema:
${JSON.stringify(PROJECT_SCHEMA, null, 2)}

Task Schema:
${JSON.stringify(TASK_SCHEMA, null, 2)}

Current Context:
{{CONTEXT}}

## COMMAND RECOGNITION
Recognize these common action patterns:

**Status Changes:**
- "done", "completed", "finished", "complete this" → status: "completed"
- "start", "begin", "working on this" → status: "in_progress"
- "block", "blocked", "stuck" → status: "blocked"
- "hold", "pause", "on hold" → status: "on_hold"
- "cancel", "cancelled", "abort" → status: "cancelled"

**Priority Changes:**
- "urgent", "critical", "asap", "highest priority" → priority: "critical"
- "important", "high priority" → priority: "high"
- "normal", "medium priority" → priority: "medium"
- "low priority", "not urgent" → priority: "low"

**Phase Changes (for tasks):**
- "discovery", "research", "investigate" → phase: "discovery"
- "planning", "design", "architect" → phase: "planning"
- "develop", "build", "implement", "code" → phase: "development"
- "test", "testing", "QA" → phase: "testing"
- "train", "training", "document" → phase: "training"
- "deploy", "launch", "rollout" → phase: "rollout"
- "monitor", "monitoring", "watch" → phase: "monitoring"

**Destructive Actions (require confirmation):**
- "delete", "remove", "archive" → action: "delete" or "archive"

## RESPONSE RULES
1. If the comment implies a field change → return suggestions array
2. If the comment is a destructive action → return action with confirmation message
3. If the comment is just discussion → return empty suggestions with summary
4. Always use the entity IDs from the context

Your response MUST be valid JSON in this exact format:
{
  "suggestions": [
    {
      "type": "project" or "task",
      "id": "the entity's id from context",
      "field": "field_name",
      "currentValue": "current value or null",
      "suggestedValue": "the new value",
      "reason": "Why this change is suggested"
    }
  ],
  "action": "delete|archive|null (only for destructive commands)",
  "actionTarget": "project|task (if action is set)",
  "message": "Human-readable message about what was understood",
  "summary": "Brief summary of what you understood from the comment"
}

Example for "mark as completed":
{
  "suggestions": [{"type": "project", "id": "uuid-here", "field": "status", "currentValue": "in_progress", "suggestedValue": "completed", "reason": "User requested to mark as completed"}],
  "summary": "Marking project as completed"
}

Example for "delete project":
{
  "suggestions": [],
  "action": "delete",
  "actionTarget": "project",
  "message": "To delete this project, please use the Edit menu and confirm deletion. This action cannot be undone.",
  "summary": "User requested to delete the project"
}`;

export async function POST(request: Request) {
  try {
    // Check if user is admin - only admins can use AI comment processing
    const user = await getCurrentUser();
    if (!isAdmin(user)) {
      return NextResponse.json(
        { error: getUnauthorizedMessage('AI comment processing') },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { content, projectId, taskId, context } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    // Fetch current context from database
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let contextInfo: any = {};

    if (projectId) {
      const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (project) {
        contextInfo.project = {
          id: project.id,
          title: project.title,
          status: project.status,
          priority: project.priority,
          start_date: project.start_date,
          target_date: project.target_date,
          description: project.description
        };
      }

      // Also fetch tasks for this project
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, title, status, phase, difficulty')
        .eq('project_id', projectId)
        .limit(20);

      if (tasks) {
        contextInfo.tasks = tasks;
      }
    }

    if (taskId) {
      const { data: task } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (task) {
        contextInfo.currentTask = {
          id: task.id,
          title: task.title,
          status: task.status,
          phase: task.phase,
          difficulty: task.difficulty,
          description: task.description,
          ai_potential: task.ai_potential,
          estimated_hours: task.estimated_hours
        };
      }
    }

    // Add any additional context provided
    if (context) {
      contextInfo = { ...contextInfo, ...context };
    }

    const systemPrompt = SYSTEM_PROMPT.replace(
      '{{CONTEXT}}',
      JSON.stringify(contextInfo, null, 2)
    );

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Comment to analyze: "${content}"`
        }
      ]
    });

    // Extract the text content
    const textContent = message.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from AI');
    }

    // Parse the JSON response
    const responseText = textContent.text;

    // Try to extract JSON from the response
    let jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response as JSON');
    }

    const aiResponse = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      suggestions: aiResponse.suggestions || [],
      summary: aiResponse.summary || '',
      action: aiResponse.action || null,
      actionTarget: aiResponse.actionTarget || null,
      message: aiResponse.message || null,
    });

  } catch (error) {
    console.error('Error in AI process-comment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process comment' },
      { status: 500 }
    );
  }
}
