import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey);
}

export async function POST(request: Request) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const supabase = getSupabaseAdmin();

    // Support both single task and bulk task creation
    const tasksToCreate = body.tasks || [body];

    if (!Array.isArray(tasksToCreate) || tasksToCreate.length === 0) {
      return NextResponse.json({ error: 'No tasks provided' }, { status: 400 });
    }

    // Validate and prepare tasks
    const preparedTasks = tasksToCreate.map((task: any, index: number) => {
      if (!task.title || !task.project_id) {
        throw new Error(`Task ${index + 1} missing required fields (title, project_id)`);
      }

      return {
        title: task.title,
        description: task.description || null,
        project_id: task.project_id,
        phase: task.phase || 'development',
        status: task.status || 'backlog',
        difficulty: task.difficulty || 'medium',
        ai_potential: task.ai_potential || 'none',
        ai_assist_description: task.ai_assist_description || null,
        estimated_hours: task.estimated_hours || null,
        is_foundational: task.is_foundational || false,
        is_critical_path: task.is_critical_path || false,
        acceptance_criteria: task.acceptance_criteria || null,
        tools_needed: task.tools_needed || null,
        knowledge_areas: task.knowledge_areas || null,
        order_index: task.order_index || index + 1,
        owner_team_id: task.owner_team_id || null,
        assignee_id: task.assignee_id || null,
        due_date: task.due_date || null,
      };
    });

    const { data: createdTasks, error } = await supabase
      .from('tasks')
      .insert(preparedTasks)
      .select();

    if (error) {
      console.error('Error creating tasks:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      tasks: createdTasks,
      count: createdTasks?.length || 0
    }, { status: 201 });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        owner_team:teams(*),
        project:projects(title, slug)
      `)
      .order('phase')
      .order('order_index');

    if (error) {
      console.error('Error fetching tasks:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
