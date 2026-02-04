import { NextResponse } from 'next/server';
import { anthropic, PROJECT_SCHEMA, TASK_SCHEMA } from '@/lib/ai';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are an AI assistant analyzing user comments to suggest system updates for a task management system called Abeto.

Your job is to:
1. Analyze the comment content to understand what changes the user is discussing
2. Identify if the comment mentions changes to project or task fields
3. Suggest specific field updates based on the comment

Project Schema:
${JSON.stringify(PROJECT_SCHEMA, null, 2)}

Task Schema:
${JSON.stringify(TASK_SCHEMA, null, 2)}

Current Context:
{{CONTEXT}}

RULES:
- Only suggest changes that are clearly implied by the comment
- If the comment is just a discussion or question with no actionable changes, return empty suggestions
- Be specific about what field should change and to what value
- Include a clear reason explaining why this change was suggested
- Priority keywords: "urgent", "critical", "important", "asap" -> suggest high/critical priority
- Status keywords: "done", "completed", "finished" -> suggest status change
- Phase keywords: "let's start development", "ready for testing" -> suggest phase change
- Date keywords: "next week", "by Friday", "deadline changed" -> suggest date updates

Your response MUST be valid JSON in this exact format:
{
  "suggestions": [
    {
      "type": "project" or "task",
      "id": "the entity's id",
      "field": "field_name",
      "currentValue": "current value or null",
      "suggestedValue": "the new value",
      "reason": "Why this change is suggested based on the comment"
    }
  ],
  "summary": "Brief summary of what you understood from the comment"
}

If there are no actionable changes, return:
{
  "suggestions": [],
  "summary": "This comment is informational/discussion and doesn't suggest any field changes."
}`;

export async function POST(request: Request) {
  try {
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
      summary: aiResponse.summary || ''
    });

  } catch (error) {
    console.error('Error in AI process-comment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process comment' },
      { status: 500 }
    );
  }
}
