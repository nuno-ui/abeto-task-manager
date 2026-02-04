import { NextResponse } from 'next/server';
import { anthropic, PROJECT_SCHEMA, ProjectData, AIQuestion } from '@/lib/ai';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are an AI assistant helping users create projects for a task management system called Abeto. Your role is to:

1. Parse the user's natural language description of their project
2. Extract as many project fields as possible from the description
3. Ask targeted follow-up questions for critical missing fields
4. Be conversational but efficient - don't ask unnecessary questions

Project Schema:
${JSON.stringify(PROJECT_SCHEMA, null, 2)}

Available Teams (use these IDs when setting owner_team_id):
{{TEAMS}}

RULES:
- Always generate a slug from the title (lowercase, replace spaces with hyphens)
- If the description mentions urgency or deadlines, set priority accordingly
- If dates are mentioned, parse them to YYYY-MM-DD format
- Ask at most 2 questions at a time to keep the flow conversational
- When you have title, status, and priority filled, you can mark as complete (other fields are optional)
- Be smart about inferring information - don't ask for things you can reasonably guess

Your response MUST be valid JSON in this exact format:
{
  "project": {
    "title": "string or null",
    "slug": "string or null",
    "description": "string or null",
    "status": "planning|active|paused|completed or null",
    "priority": "low|medium|high|critical or null",
    "start_date": "YYYY-MM-DD or null",
    "target_date": "YYYY-MM-DD or null",
    "budget": "number or null",
    "owner_team_id": "uuid or null"
  },
  "questions": [
    {
      "field": "field_name",
      "question": "Natural language question to ask user",
      "options": ["option1", "option2"],
      "type": "text|select|date|number"
    }
  ],
  "complete": true/false,
  "summary": "Brief summary of what you understood and filled in"
}`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { description, answers, currentProject } = body;

    if (!description && !answers) {
      return NextResponse.json(
        { error: 'Either description or answers is required' },
        { status: 400 }
      );
    }

    // Fetch available teams for context
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: teams } = await supabase
      .from('teams')
      .select('id, name, slug');

    const teamsContext = teams
      ? teams.map(t => `- ${t.name} (ID: ${t.id})`).join('\n')
      : 'No teams available';

    const systemPrompt = SYSTEM_PROMPT.replace('{{TEAMS}}', teamsContext);

    // Build the conversation context
    let userMessage = '';

    if (description && !answers) {
      // Initial description
      userMessage = `User's project description: "${description}"

Please analyze this description and:
1. Extract any project fields you can infer
2. Ask follow-up questions for missing critical fields (title, status, priority at minimum)`;
    } else if (answers && currentProject) {
      // Follow-up with answers
      userMessage = `Current project data: ${JSON.stringify(currentProject)}

User's answers to your questions:
${Object.entries(answers).map(([field, answer]) => `- ${field}: "${answer}"`).join('\n')}

Please:
1. Update the project data with these answers
2. If any critical fields are still missing, ask follow-up questions
3. Mark as complete if you have enough information`;
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage
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
      project: aiResponse.project || {},
      questions: aiResponse.questions || [],
      complete: aiResponse.complete || false,
      summary: aiResponse.summary || ''
    });

  } catch (error) {
    console.error('Error in AI create-project:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    );
  }
}
