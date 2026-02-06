import { NextResponse } from 'next/server';
import { anthropic } from '@/lib/ai';
import { createClient } from '@supabase/supabase-js';
import { getCurrentUser } from '@/lib/supabase/auth';
import { isAdmin, getUnauthorizedMessage } from '@/lib/supabase/authorization';

export const dynamic = 'force-dynamic';

const ANALYZE_PROMPT = `You are an expert project manager AI for Abeto, a task management system.
The user wants to create a new project. Analyze their input and determine if you have enough information to create a complete project plan.

## User Input:
- Project Idea: {{PROJECT_IDEA}}
- Problem Being Solved: {{PROBLEM_SOLVED}}
- Expected Deliverables: {{DELIVERABLES}}

## Existing Projects (for context on potential relations):
{{EXISTING_PROJECTS}}

## Your Task:
1. If the user has provided enough detail (clear scope, problem, deliverables), respond with needsQuestions: false
2. If you need more clarity, generate UP TO 2 specific questions to fill gaps

Consider asking about:
- Scale/scope if unclear (small automation vs enterprise platform)
- Target users or stakeholders if not specified
- Integration requirements if relevant
- Timeline expectations if not mentioned
- Success criteria if vague

Response Format (STRICT JSON):
{
  "needsQuestions": boolean,
  "questions": ["string"] // only if needsQuestions is true, max 2 questions
}`;

const GENERATE_PROMPT = `You are an expert project manager AI for Abeto, a task management system. Create a COMPLETE, DETAILED project plan with ALL fields populated.

## Context Provided:
- Project Idea: {{PROJECT_IDEA}}
- Problem Being Solved: {{PROBLEM_SOLVED}}
- Expected Deliverables: {{DELIVERABLES}}
{{CLARIFICATIONS}}

## Available Teams:
{{TEAMS}}

## Available Pillars (strategic areas):
{{PILLARS}}

## Existing Projects (check for potential relations/dependencies):
{{EXISTING_PROJECTS}}

## CRITICAL: Your Response MUST include ALL of these project fields:

### Core Fields (REQUIRED):
- title: Professional, clear project title
- slug: URL-friendly version (lowercase, hyphens)
- description: 2-3 sentences summarizing the project scope
- status: "planning" (default for new projects)
- priority: Based on business impact (low/medium/high/critical)
- difficulty: Technical complexity (easy/medium/hard) - ONLY these 3 values
- category: Project category (product/infrastructure/operations/research/automation)
- start_date: YYYY-MM-DD format, typically 1-2 weeks from now
- target_date: YYYY-MM-DD format, realistic end date
- estimated_hours_min: Minimum hours estimate (number)
- estimated_hours_max: Maximum hours estimate (number)
- owner_team_id: Best matching team ID from the list (or null)
- pillar_id: Best matching pillar ID from the list (or null)

### Problem & Value Fields (REQUIRED - these show prominently on cards):
- problem_statement: 1-2 sentences describing the specific problem this solves
- why_it_matters: Business justification explaining strategic importance (1-2 sentences)
- deliverables: Array of 3-5 specific, measurable deliverables (strings)
- benefits: Array of 3-5 key benefits this project will provide

### Human Impact Fields (REQUIRED):
- human_role_before: What humans do manually today (e.g., "Manually tracks data in spreadsheets")
- human_role_after: What humans will do after (e.g., "Reviews AI-generated insights and makes decisions")
- who_is_empowered: Array of roles that benefit (e.g., ["HR Team", "Managers", "Employees"])
- new_capabilities: Array of new abilities enabled (e.g., ["Real-time visibility", "Self-service requests"])
- primary_users: Array of main user types (e.g., ["HR Admin", "Department Manager", "Employee"])

### Automation Level Fields (REQUIRED):
- current_loa: Current Level of Automation ("Manual"/"Low"/"Medium"/"High")
- potential_loa: Target Level of Automation after project ("Low"/"Medium"/"High"/"Full")
- ops_process: The operational process being improved (e.g., "Time Off Request Management")

### Data Fields (REQUIRED):
- data_required: Array of data inputs needed (e.g., ["Employee records", "Leave balances", "Team calendars"])
- data_generates: Array of data outputs produced (e.g., ["Approval history", "Utilization reports", "Forecasts"])
- data_improves: Array of metrics improved (e.g., ["Processing time", "Visibility", "Compliance"])
- data_status: Current data availability ("available"/"partial"/"missing")

### Technical Fields (REQUIRED):
- resources_used: Array of resources/systems used (e.g., ["PostgreSQL", "React", "Supabase"])
- api_endpoints: Array of APIs needed (e.g., ["HR System API", "Calendar API"])
- integrations_needed: Array of integrations required (e.g., ["Slack notifications", "Email alerts"])
- missing_api_data: Array of data gaps (e.g., ["Historical leave data"] or empty if none)

### Dependencies & Relationships (populate if relevant):
- prerequisites: Array of things needed before starting (e.g., ["HR system access", "Stakeholder buy-in"])
- depends_on: Array of existing project slugs this depends on
- enables: Array of project slugs this enables
- related_to: Array of related project slugs

### Metadata:
- tags: Array of relevant tags (e.g., ["automation", "hr", "internal-tool"])
- next_milestone: Next key milestone (e.g., "Requirements sign-off by March 1")

## Tasks - Generate 8-15 comprehensive tasks with ALL fields:
Each task MUST have:
- title: Clear, actionable task title
- description: Detailed description of what needs to be done (2-3 sentences)
- phase: One of: discovery/planning/development/testing/training/rollout/monitoring
- status: "not_started"
- priority: Task priority (low/medium/high/critical)
- difficulty: easy/medium/hard
- ai_potential: How much AI can help (none/low/medium/high)
- ai_assist_description: If ai_potential > none, describe how AI can help
- estimated_hours: Hour range as string (e.g., "4-8")
- is_foundational: true if other tasks depend on this
- is_critical_path: true if delays would delay the whole project
- acceptance_criteria: Array of 2-4 specific criteria to consider task done
- tools_needed: Array of tools/technologies needed
- knowledge_areas: Array of expertise areas required
- deliverables: Array of task-level deliverables
- order_index: Sequential number (1, 2, 3...)

## Task Distribution:
- 1-2 Discovery tasks (requirements, research)
- 2-3 Planning tasks (architecture, design)
- 3-5 Development tasks (implementation)
- 2-3 Testing tasks (QA, UAT)
- 1-2 Training tasks (documentation, training)
- 1-2 Rollout tasks (deployment, migration)
- 1 Monitoring task (ongoing monitoring)

## Response Format (STRICT JSON - populate ALL fields):
{
  "project": {
    "title": "...",
    "slug": "...",
    "description": "...",
    "problem_statement": "...",
    "why_it_matters": "...",
    "deliverables": ["..."],
    "benefits": ["..."],
    "status": "planning",
    "priority": "...",
    "difficulty": "...",
    "category": "...",
    "pillar_id": "..." or null,
    "owner_team_id": "..." or null,
    "start_date": "YYYY-MM-DD",
    "target_date": "YYYY-MM-DD",
    "estimated_hours_min": number,
    "estimated_hours_max": number,
    "human_role_before": "...",
    "human_role_after": "...",
    "who_is_empowered": ["..."],
    "new_capabilities": ["..."],
    "primary_users": ["..."],
    "current_loa": "...",
    "potential_loa": "...",
    "ops_process": "...",
    "data_required": ["..."],
    "data_generates": ["..."],
    "data_improves": ["..."],
    "data_status": "...",
    "resources_used": ["..."],
    "api_endpoints": ["..."],
    "integrations_needed": ["..."],
    "missing_api_data": ["..."],
    "prerequisites": ["..."],
    "depends_on": [],
    "enables": [],
    "related_to": [],
    "tags": ["..."],
    "next_milestone": "..."
  },
  "tasks": [
    {
      "title": "...",
      "description": "...",
      "phase": "...",
      "status": "not_started",
      "priority": "...",
      "difficulty": "...",
      "ai_potential": "...",
      "ai_assist_description": "...",
      "estimated_hours": "...",
      "is_foundational": boolean,
      "is_critical_path": boolean,
      "acceptance_criteria": ["..."],
      "tools_needed": ["..."],
      "knowledge_areas": ["..."],
      "deliverables": ["..."],
      "order_index": number
    }
  ],
  "summary": "Brief executive summary of what was created",
  "relatedProjects": ["project titles that may relate"]
}

Today's date: {{TODAY}}`;

const MATCH_PROMPT = `You are an expert project manager AI for Abeto. Your task is to analyze whether a user's project request overlaps with existing projects or should be added as a task to an existing project.

## User's New Request:
- Idea: {{PROJECT_IDEA}}
- Problem Being Solved: {{PROBLEM_SOLVED}}
- Expected Deliverables: {{DELIVERABLES}}

## Existing Active Projects:
{{EXISTING_PROJECTS}}

## Analysis Guidelines:
1. **exact**: The user's request essentially describes the same problem/solution as an existing project (>80% overlap)
2. **similar**: Significant overlap exists - projects share goals, users, or systems but have distinct scopes (40-80% overlap)
3. **task_candidate**: The user's request is a feature, enhancement, or subset that fits within an existing project's scope
4. **new**: The request is genuinely distinct with minimal overlap (<40%)

## Consider:
- Problem statement similarity
- Target users overlap
- Technical scope/deliverables overlap
- Business area alignment
- Could this be a phase or task in an existing project?

## Response Format (STRICT JSON):
{
  "matchType": "exact" | "similar" | "task_candidate" | "new",
  "matches": [
    {
      "type": "project",
      "id": "project_id",
      "title": "Project Title",
      "slug": "project-slug",
      "similarity_reason": "Clear explanation of why this matches",
      "overlap_percentage": 75,
      "problem_statement": "The project's problem statement",
      "deliverables": ["deliverable1", "deliverable2"],
      "status": "planning",
      "priority": "high",
      "pillar_name": "Pillar Name or null",
      "task_count": 12
    }
  ],
  "suggestion": "A helpful, conversational recommendation for the user explaining what you found and what you suggest they do",
  "reasoning": "Internal reasoning for the match determination"
}

IMPORTANT:
- Return maximum 3 matches, ordered by relevance
- Only include matches with >30% overlap
- If matchType is "new", matches array should be empty
- suggestion should be friendly and helpful, explaining options`;

const GENERATE_TASK_PROMPT = `You are an expert project manager AI for Abeto. Create a single, well-structured task to add to an existing project based on the user's request.

## User's Request:
- Idea: {{PROJECT_IDEA}}
- Problem Being Solved: {{PROBLEM_SOLVED}}
- Expected Deliverables: {{DELIVERABLES}}

## Target Project Context:
{{PROJECT_CONTEXT}}

## Your Task:
Generate ONE comprehensive task that:
1. Fits naturally within the existing project's scope
2. Addresses the user's specific request
3. Follows the project's naming conventions and structure
4. Has appropriate phase assignment based on the project's current state

## Response Format (STRICT JSON):
{
  "task": {
    "title": "Clear, actionable task title",
    "description": "Detailed description of what needs to be done (2-3 sentences)",
    "phase": "discovery|planning|development|testing|training|rollout|monitoring",
    "status": "not_started",
    "priority": "low|medium|high|critical",
    "difficulty": "easy|medium|hard",
    "ai_potential": "none|low|medium|high",
    "ai_assist_description": "How AI can help (if ai_potential > none)",
    "estimated_hours": "4-8",
    "is_foundational": false,
    "is_critical_path": false,
    "acceptance_criteria": ["Criterion 1", "Criterion 2", "Criterion 3"],
    "tools_needed": ["Tool 1", "Tool 2"],
    "knowledge_areas": ["Area 1", "Area 2"],
    "deliverables": ["Deliverable 1", "Deliverable 2"]
  },
  "rationale": "Explanation of how this task fits into the project"
}`;

const REFINE_PROMPT = `You are an expert project manager AI. The user wants to modify an existing project plan draft.

## Current Project:
{{CURRENT_PROJECT}}

## Current Tasks:
{{CURRENT_TASKS}}

## User's Refinement Request:
{{REFINEMENT_REQUEST}}

## Your Task:
Apply the user's requested changes to the project and/or tasks. Be specific and make the changes they asked for.

Examples of refinements:
- "Add more testing tasks" → Add 2-3 more testing phase tasks
- "Change priority to critical" → Update project.priority to "critical"
- "Rename the project to X" → Update project.title and slug
- "Remove the monitoring tasks" → Filter out monitoring phase tasks
- "Make it simpler" → Reduce scope, fewer tasks, easier difficulty
- "Add a task for documentation" → Add a training phase documentation task

Return the COMPLETE updated project and tasks (not just changes).

Response Format (STRICT JSON):
{
  "project": { ... complete updated project ... },
  "tasks": [ ... complete updated task list ... ],
  "refinementSummary": "Brief description of changes made"
}`;

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey);
}

export async function POST(request: Request) {
  try {
    // Check if user is admin
    const user = await getCurrentUser();
    if (!isAdmin(user)) {
      return NextResponse.json(
        { error: getUnauthorizedMessage('AI project creation') },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      description,
      problemSolved,
      expectedDeliverables,
      clarifications,
      currentProject,
      currentTasks,
      refinementRequest,
      targetProjectId,
      userDifferenceReason,
      mode = 'analyze'
    } = body;

    if (!description && mode !== 'refine') {
      return NextResponse.json(
        { error: 'Project description is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Fetch available teams
    const { data: teams } = await supabase
      .from('teams')
      .select('id, name, slug');

    const teamsContext = teams && teams.length > 0
      ? teams.map(t => `- ${t.name} (ID: ${t.id})`).join('\n')
      : '- No teams available (use null for owner_team_id)';

    // Fetch available pillars
    const { data: pillars } = await supabase
      .from('pillars')
      .select('id, name, slug, description');

    const pillarsContext = pillars && pillars.length > 0
      ? pillars.map(p => `- ${p.name} (ID: ${p.id}): ${p.description || 'No description'}`).join('\n')
      : '- No pillars available (use null for pillar_id)';

    // Fetch existing projects for context (with more fields for better AI context)
    const { data: existingProjects } = await supabase
      .from('projects')
      .select('id, title, slug, status, description, problem_statement, category')
      .limit(15)
      .order('created_at', { ascending: false });

    const projectsContext = existingProjects && existingProjects.length > 0
      ? existingProjects.map(p => `- "${p.title}" (slug: ${p.slug}, ${p.status}, ${p.category || 'no category'}): ${p.problem_statement?.substring(0, 80) || p.description?.substring(0, 80) || 'No description'}...`).join('\n')
      : 'No existing projects';

    const today = new Date().toISOString().split('T')[0];

    let systemPrompt: string;
    let userMessage: string;

    // ===== MATCH MODE - Check for similar existing projects =====
    if (mode === 'match') {
      // Fetch ALL active projects with rich data for matching
      const { data: matchProjects } = await supabase
        .from('projects')
        .select(`
          id, title, slug, description, status, priority, category,
          problem_statement, deliverables, benefits, tags,
          data_required, data_generates, why_it_matters,
          pillar:pillars(name)
        `)
        .in('status', ['idea', 'planning', 'in_progress']);

      // Get task counts per project
      const { data: taskCounts } = await supabase
        .from('tasks')
        .select('project_id')
        .neq('status', 'completed');

      const taskCountMap: Record<string, number> = {};
      taskCounts?.forEach(t => {
        taskCountMap[t.project_id] = (taskCountMap[t.project_id] || 0) + 1;
      });

      // Format projects for AI matching
      const matchProjectsContext = matchProjects && matchProjects.length > 0
        ? JSON.stringify(matchProjects.map(p => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            status: p.status,
            priority: p.priority,
            category: p.category,
            problem_statement: p.problem_statement,
            deliverables: p.deliverables,
            benefits: p.benefits,
            tags: p.tags,
            why_it_matters: p.why_it_matters,
            pillar_name: (p.pillar as any)?.name || null,
            task_count: taskCountMap[p.id] || 0
          })), null, 2)
        : '[]';

      systemPrompt = MATCH_PROMPT
        .replace('{{PROJECT_IDEA}}', description || '')
        .replace('{{PROBLEM_SOLVED}}', problemSolved || 'Not specified')
        .replace('{{DELIVERABLES}}', expectedDeliverables || 'Not specified')
        .replace('{{EXISTING_PROJECTS}}', matchProjectsContext);

      userMessage = 'Analyze similarity with existing projects. Respond with valid JSON only.';

      // Make AI call for match analysis
      const matchMessage = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }]
      });

      const matchTextContent = matchMessage.content.find(c => c.type === 'text');
      if (!matchTextContent || matchTextContent.type !== 'text') {
        throw new Error('No text response from AI');
      }

      const matchJsonMatch = matchTextContent.text.match(/\{[\s\S]*\}/);
      if (!matchJsonMatch) {
        throw new Error('Could not parse AI match response');
      }

      let matchJsonString = matchJsonMatch[0]
        .replace(/,(\s*[}\]])/g, '$1')
        .replace(/[\x00-\x1F\x7F]/g, (char) => {
          if (char === '\n' || char === '\r' || char === '\t') return char;
          return '';
        });

      const matchResponse = JSON.parse(matchJsonString);

      return NextResponse.json({
        matchType: matchResponse.matchType || 'new',
        matches: matchResponse.matches || [],
        suggestion: matchResponse.suggestion || '',
        reasoning: matchResponse.reasoning
      });

    // ===== GENERATE_TASK MODE - Create single task for existing project =====
    } else if (mode === 'generate_task') {
      if (!targetProjectId) {
        return NextResponse.json(
          { error: 'Target project ID is required for generate_task mode' },
          { status: 400 }
        );
      }

      // Fetch the target project with full details
      const { data: targetProject, error: projectError } = await supabase
        .from('projects')
        .select(`
          id, title, slug, description, status, priority, category,
          problem_statement, deliverables, benefits, why_it_matters,
          current_loa, potential_loa, ops_process,
          pillar:pillars(name)
        `)
        .eq('id', targetProjectId)
        .single();

      if (projectError || !targetProject) {
        return NextResponse.json(
          { error: 'Target project not found' },
          { status: 404 }
        );
      }

      // Fetch existing tasks for context
      const { data: existingTasks } = await supabase
        .from('tasks')
        .select('title, phase, status')
        .eq('project_id', targetProjectId)
        .order('order_index', { ascending: true });

      const projectContext = JSON.stringify({
        ...targetProject,
        pillar_name: (targetProject.pillar as any)?.name || null,
        existing_tasks: existingTasks?.map(t => `${t.title} (${t.phase}, ${t.status})`) || []
      }, null, 2);

      systemPrompt = GENERATE_TASK_PROMPT
        .replace('{{PROJECT_IDEA}}', description || '')
        .replace('{{PROBLEM_SOLVED}}', problemSolved || 'Not specified')
        .replace('{{DELIVERABLES}}', expectedDeliverables || 'Not specified')
        .replace('{{PROJECT_CONTEXT}}', projectContext);

      userMessage = 'Generate a single task for this project. Respond with valid JSON only.';

      // Make AI call for task generation
      const taskMessage = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }]
      });

      const taskTextContent = taskMessage.content.find(c => c.type === 'text');
      if (!taskTextContent || taskTextContent.type !== 'text') {
        throw new Error('No text response from AI');
      }

      const taskJsonMatch = taskTextContent.text.match(/\{[\s\S]*\}/);
      if (!taskJsonMatch) {
        throw new Error('Could not parse AI task response');
      }

      let taskJsonString = taskJsonMatch[0]
        .replace(/,(\s*[}\]])/g, '$1')
        .replace(/[\x00-\x1F\x7F]/g, (char) => {
          if (char === '\n' || char === '\r' || char === '\t') return char;
          return '';
        });

      const taskResponse = JSON.parse(taskJsonString);

      return NextResponse.json({
        task: taskResponse.task,
        rationale: taskResponse.rationale,
        projectTitle: targetProject.title,
        projectSlug: targetProject.slug
      });

    // ===== ANALYZE MODE - Check if we need questions =====
    } else if (mode === 'analyze') {
      // Include user's difference reason if they explained why their request is different
      const differenceContext = userDifferenceReason
        ? `\n\nNote: The user explained their request is different from existing projects because: "${userDifferenceReason}"`
        : '';

      systemPrompt = ANALYZE_PROMPT
        .replace('{{PROJECT_IDEA}}', description || '')
        .replace('{{PROBLEM_SOLVED}}', problemSolved || 'Not specified')
        .replace('{{DELIVERABLES}}', expectedDeliverables || 'Not specified')
        .replace('{{EXISTING_PROJECTS}}', projectsContext + differenceContext);

      userMessage = 'Analyze the project input and determine if you need clarifying questions. Respond with JSON only.';
    } else if (mode === 'generate') {
      // Generate mode - create full project
      const clarificationsText = clarifications && clarifications.length > 0
        ? '\n## Additional Clarifications:\n' + clarifications.map((c: {question: string, answer: string}) =>
            `Q: ${c.question}\nA: ${c.answer}`
          ).join('\n\n')
        : '';

      // Include user's difference reason if provided
      const differenceContext = userDifferenceReason
        ? `\n## User's Context:\nThe user explained: "${userDifferenceReason}"`
        : '';

      systemPrompt = GENERATE_PROMPT
        .replace('{{PROJECT_IDEA}}', description || '')
        .replace('{{PROBLEM_SOLVED}}', problemSolved || 'Not specified')
        .replace('{{DELIVERABLES}}', expectedDeliverables || 'Not specified')
        .replace('{{CLARIFICATIONS}}', clarificationsText + differenceContext)
        .replace('{{TEAMS}}', teamsContext)
        .replace('{{PILLARS}}', pillarsContext)
        .replace('{{EXISTING_PROJECTS}}', projectsContext)
        .replace('{{TODAY}}', today);

      userMessage = 'Generate a complete project plan. Respond with valid JSON only.';
    } else if (mode === 'refine') {
      // Refine mode - modify existing draft
      if (!currentProject || !refinementRequest) {
        return NextResponse.json(
          { error: 'Current project and refinement request are required' },
          { status: 400 }
        );
      }

      systemPrompt = REFINE_PROMPT
        .replace('{{CURRENT_PROJECT}}', JSON.stringify(currentProject, null, 2))
        .replace('{{CURRENT_TASKS}}', JSON.stringify(currentTasks || [], null, 2))
        .replace('{{REFINEMENT_REQUEST}}', refinementRequest);

      userMessage = 'Apply the requested refinements. Respond with complete updated JSON only.';
    } else {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    });

    // Extract the text content
    const textContent = message.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from AI');
    }

    // Parse the JSON response
    const responseText = textContent.text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response as JSON');
    }

    let jsonString = jsonMatch[0];

    // Clean up common JSON issues
    jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1');
    jsonString = jsonString.replace(/[\x00-\x1F\x7F]/g, (char) => {
      if (char === '\n' || char === '\r' || char === '\t') return char;
      return '';
    });

    let aiResponse;
    try {
      aiResponse = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);

      // More aggressive cleanup
      jsonString = jsonString
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        .replace(/,\s*,/g, ',')
        .replace(/\[\s*,/g, '[')
        .replace(/,\s*\]/g, ']');

      try {
        aiResponse = JSON.parse(jsonString);
      } catch (secondError) {
        throw new Error('Could not parse AI response as valid JSON. Please try again.');
      }
    }

    // Return appropriate response based on mode
    if (mode === 'analyze') {
      if (aiResponse.needsQuestions && aiResponse.questions?.length > 0) {
        return NextResponse.json({
          needsQuestions: true,
          questions: aiResponse.questions.slice(0, 2) // Max 2 questions
        });
      } else {
        // No questions needed, but we still need to generate - switch to generate mode
        // For simplicity, tell frontend to call again with generate mode
        // Or we can generate here...
        // Let's generate directly since we have all context
        const generatePrompt = GENERATE_PROMPT
          .replace('{{PROJECT_IDEA}}', description || '')
          .replace('{{PROBLEM_SOLVED}}', problemSolved || 'Not specified')
          .replace('{{DELIVERABLES}}', expectedDeliverables || 'Not specified')
          .replace('{{CLARIFICATIONS}}', '')
          .replace('{{TEAMS}}', teamsContext)
          .replace('{{PILLARS}}', pillarsContext)
          .replace('{{EXISTING_PROJECTS}}', projectsContext)
          .replace('{{TODAY}}', today);

        const generateMessage = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 8192,
          system: generatePrompt,
          messages: [{ role: 'user', content: 'Generate a complete project plan. Respond with valid JSON only.' }]
        });

        const genTextContent = generateMessage.content.find(c => c.type === 'text');
        if (!genTextContent || genTextContent.type !== 'text') {
          throw new Error('No text response from AI');
        }

        const genJsonMatch = genTextContent.text.match(/\{[\s\S]*\}/);
        if (!genJsonMatch) {
          throw new Error('Could not parse AI response');
        }

        let genJsonString = genJsonMatch[0]
          .replace(/,(\s*[}\]])/g, '$1')
          .replace(/[\x00-\x1F\x7F]/g, (char) => {
            if (char === '\n' || char === '\r' || char === '\t') return char;
            return '';
          });

        const genResponse = JSON.parse(genJsonString);

        return NextResponse.json({
          needsQuestions: false,
          project: genResponse.project,
          tasks: genResponse.tasks || [],
          summary: genResponse.summary || 'Project plan generated successfully'
        });
      }
    } else if (mode === 'generate') {
      if (!aiResponse.project?.title) {
        throw new Error('AI did not generate a valid project');
      }

      return NextResponse.json({
        project: aiResponse.project,
        tasks: aiResponse.tasks || [],
        summary: aiResponse.summary || 'Project plan generated successfully',
        relatedProjects: aiResponse.relatedProjects || []
      });
    } else if (mode === 'refine') {
      if (!aiResponse.project?.title) {
        throw new Error('AI did not return a valid refined project');
      }

      return NextResponse.json({
        project: aiResponse.project,
        tasks: aiResponse.tasks || [],
        refinementSummary: aiResponse.refinementSummary || 'Project updated successfully'
      });
    }

    return NextResponse.json({ error: 'Unknown mode' }, { status: 400 });

  } catch (error) {
    console.error('Error in AI create-project:', error);

    // Provide more specific error messages
    let errorMessage = 'Failed to process request';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;

      // Check for common Anthropic API errors
      if (error.message.includes('401') || error.message.includes('authentication')) {
        errorMessage = 'AI service authentication failed. Please check API key configuration.';
        statusCode = 500;
      } else if (error.message.includes('429') || error.message.includes('rate limit')) {
        errorMessage = 'AI service rate limit exceeded. Please try again in a moment.';
        statusCode = 429;
      } else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
        errorMessage = 'AI service request timed out. Please try again.';
        statusCode = 504;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
