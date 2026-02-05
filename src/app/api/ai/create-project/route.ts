import { NextResponse } from 'next/server';
import { anthropic } from '@/lib/ai';
import { createClient } from '@supabase/supabase-js';
import { getCurrentUser } from '@/lib/supabase/auth';
import { isAdmin, getUnauthorizedMessage } from '@/lib/supabase/authorization';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are an expert project manager AI for Abeto, a task management system. When given a brief project idea, you MUST generate a COMPLETE, DETAILED project plan with ALL fields populated and a comprehensive set of tasks.

Your job is to take a simple idea and expand it into a fully-fleshed professional project plan that a COO would approve.

## Available Teams:
{{TEAMS}}

## Your Response MUST include:

1. **Project Details** - ALL fields populated with intelligent defaults:
   - title: Professional, clear project title
   - slug: URL-friendly version (lowercase, hyphens)
   - description: 2-3 paragraph detailed description explaining the project scope, goals, and expected outcomes
   - why_it_matters: Business justification and strategic importance
   - status: "planning" (default for new projects)
   - priority: Based on business impact (low/medium/high/critical)
   - difficulty: Technical complexity (easy/medium/hard) - ONLY these 3 values allowed
   - category: Project category (e.g., "product", "infrastructure", "operations", "research")
   - start_date: Realistic start date (YYYY-MM-DD format, typically 1-2 weeks from now)
   - target_date: Realistic end date based on scope (YYYY-MM-DD format)
   - estimated_hours_min: Minimum hours estimate
   - estimated_hours_max: Maximum hours estimate
   - owner_team_id: Best matching team ID from the list above

2. **Tasks** - Generate 8-15 comprehensive tasks covering all project phases:
   Each task must have:
   - title: Clear, actionable task title
   - description: Detailed description of what needs to be done
   - phase: One of: discovery, planning, development, testing, training, rollout, monitoring
   - status: "not_started" (default for new tasks)
   - difficulty: easy/medium/hard (ONLY these 3 values)
   - ai_potential: How much AI can help (none/low/medium/high - ONLY these 4 values)
   - ai_assist_description: If ai_potential > none, describe how AI can help
   - estimated_hours: Hour range as string (e.g., "4-8", "16-24")
   - is_foundational: true if other tasks depend on this
   - is_critical_path: true if delays would delay the whole project
   - acceptance_criteria: Array of specific criteria to consider task done
   - tools_needed: Array of tools/technologies needed
   - knowledge_areas: Array of expertise areas required

## Task Distribution Guidelines:
- 1-2 Discovery tasks (research, requirements gathering)
- 2-3 Planning tasks (architecture, design, specs)
- 3-5 Development tasks (core implementation)
- 2-3 Testing tasks (QA, validation)
- 1-2 Training tasks (documentation, team training)
- 1-2 Rollout tasks (deployment, launch)
- 1 Monitoring task (post-launch tracking)

## Response Format (STRICT JSON):
{
  "project": {
    "title": "string",
    "slug": "string",
    "description": "string (2-3 paragraphs)",
    "why_it_matters": "string",
    "status": "planning",
    "priority": "low|medium|high|critical",
    "difficulty": "easy|medium|hard",
    "category": "string",
    "start_date": "YYYY-MM-DD",
    "target_date": "YYYY-MM-DD",
    "estimated_hours_min": number,
    "estimated_hours_max": number,
    "owner_team_id": "uuid from teams list"
  },
  "tasks": [
    {
      "title": "string",
      "description": "string",
      "phase": "discovery|planning|development|testing|training|rollout|monitoring",
      "status": "not_started",
      "difficulty": "easy|medium|hard",
      "ai_potential": "none|low|medium|high",
      "ai_assist_description": "string or null",
      "estimated_hours": "string (e.g., '4-8')",
      "is_foundational": boolean,
      "is_critical_path": boolean,
      "acceptance_criteria": ["string"],
      "tools_needed": ["string"],
      "knowledge_areas": ["string"],
      "order_index": number (1, 2, 3...)
    }
  ],
  "summary": "Brief executive summary of what was created"
}

IMPORTANT:
- Generate REAL, DETAILED content - not placeholders
- Tasks should be specific and actionable
- Use realistic time estimates
- Today's date is {{TODAY}}
- Be thorough - this should be ready to execute immediately`;

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey);
}

export async function POST(request: Request) {
  try {
    // Check if user is admin - only admins can use AI features
    const user = await getCurrentUser();
    if (!isAdmin(user)) {
      return NextResponse.json(
        { error: getUnauthorizedMessage('AI project creation') },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { description } = body;

    if (!description) {
      return NextResponse.json(
        { error: 'Project description is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Fetch available teams for context
    const { data: teams } = await supabase
      .from('teams')
      .select('id, name, slug');

    const teamsContext = teams && teams.length > 0
      ? teams.map(t => `- ${t.name} (ID: ${t.id})`).join('\n')
      : '- Technology (use null for owner_team_id)';

    const today = new Date().toISOString().split('T')[0];

    const systemPrompt = SYSTEM_PROMPT
      .replace('{{TEAMS}}', teamsContext)
      .replace('{{TODAY}}', today);

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Create a complete project plan for: "${description}"\n\nIMPORTANT: Respond with valid JSON only. Ensure all strings are properly escaped.`
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
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response as JSON');
    }

    let jsonString = jsonMatch[0];

    // Clean up common JSON issues from AI responses
    // 1. Remove trailing commas before ] or }
    jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1');
    // 2. Fix unescaped newlines inside strings
    jsonString = jsonString.replace(/(?<!\\)\\n/g, '\\n');
    // 3. Remove control characters
    jsonString = jsonString.replace(/[\x00-\x1F\x7F]/g, (char) => {
      if (char === '\n' || char === '\r' || char === '\t') return char;
      return '';
    });

    let aiResponse;
    try {
      aiResponse = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON parse error, attempting recovery:', parseError);
      console.error('Raw JSON (first 500 chars):', jsonString.substring(0, 500));

      // Try a more aggressive cleanup
      jsonString = jsonString
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove all control chars
        .replace(/,\s*,/g, ',') // Remove double commas
        .replace(/\[\s*,/g, '[') // Remove leading commas in arrays
        .replace(/,\s*\]/g, ']'); // Remove trailing commas in arrays

      try {
        aiResponse = JSON.parse(jsonString);
      } catch (secondError) {
        console.error('Second parse attempt failed:', secondError);
        throw new Error('Could not parse AI response as valid JSON. Please try again.');
      }
    }

    // Validate we have required data
    if (!aiResponse.project?.title) {
      throw new Error('AI did not generate a valid project');
    }

    // Return the complete response - let the frontend handle creation
    return NextResponse.json({
      project: aiResponse.project,
      tasks: aiResponse.tasks || [],
      summary: aiResponse.summary || 'Project plan generated successfully',
      complete: true
    });

  } catch (error) {
    console.error('Error in AI create-project:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    );
  }
}
