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

    // Helper to normalize difficulty value to valid enum
    const normalizeDifficulty = (d: string | undefined): string => {
      const val = (d || 'medium').toLowerCase();
      if (['easy', 'medium', 'hard'].includes(val)) return val;
      if (val === 'trivial') return 'easy';
      if (val === 'complex') return 'hard';
      return 'medium';
    };

    // Helper to normalize ai_potential value to valid enum
    const normalizeAiPotential = (a: string | undefined): string => {
      const val = (a || 'none').toLowerCase();
      if (['none', 'low', 'medium', 'high'].includes(val)) return val;
      if (val === 'full') return 'high';
      return 'none';
    };

    // Helper to normalize task status to valid enum
    const normalizeTaskStatus = (s: string | undefined): string => {
      const mapping: Record<string, string> = {
        'backlog': 'not_started',
        'ready': 'not_started',
        'done': 'completed',
        'review': 'in_review',
        'todo': 'not_started',
        'pending': 'not_started',
        'finished': 'completed',
      };
      const val = (s || 'not_started').toLowerCase();
      return mapping[val] || (['not_started', 'in_progress', 'blocked', 'in_review', 'completed', 'cancelled'].includes(val) ? val : 'not_started');
    };

    // Helper to normalize priority value to valid enum
    const normalizePriority = (p: string | undefined): string => {
      const val = (p || 'medium').toLowerCase();
      if (['critical', 'high', 'medium', 'low'].includes(val)) return val;
      if (val === 'urgent') return 'critical';
      if (val === 'normal') return 'medium';
      return 'medium';
    };

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
        status: normalizeTaskStatus(task.status),
        priority: normalizePriority(task.priority),
        difficulty: normalizeDifficulty(task.difficulty),
        ai_potential: normalizeAiPotential(task.ai_potential),
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

export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Parse query parameters for filtering
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const difficulty = searchParams.get('difficulty');
  const ai_potential = searchParams.get('ai_potential');
  const owner_team_id = searchParams.get('owner_team_id');
  const pillar_id = searchParams.get('pillar_id');
  const project_id = searchParams.get('project_id');
  const phase = searchParams.get('phase');

  try {
    // Build query with pillar data through project relation
    let query = supabase
      .from('tasks')
      .select(`
        *,
        owner_team:teams(*),
        project:projects(id, title, slug, pillar_id, pillar:pillars(*))
      `);

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (difficulty && difficulty !== 'all') {
      query = query.eq('difficulty', difficulty);
    }
    if (ai_potential && ai_potential !== 'all') {
      query = query.eq('ai_potential', ai_potential);
    }
    if (owner_team_id && owner_team_id !== 'all') {
      query = query.eq('owner_team_id', owner_team_id);
    }
    if (project_id && project_id !== 'all') {
      query = query.eq('project_id', project_id);
    }
    if (phase && phase !== 'all') {
      query = query.eq('phase', phase);
    }

    // Execute query with ordering
    const { data: tasks, error } = await query
      .order('phase')
      .order('order_index');

    if (error) {
      console.error('Error fetching tasks:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If pillar filter is provided, filter client-side (can't directly filter on nested relation)
    let filteredTasks = tasks;
    if (pillar_id && pillar_id !== 'all') {
      filteredTasks = tasks?.filter(t => t.project?.pillar_id === pillar_id) || [];
    }

    return NextResponse.json(filteredTasks);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Delete comments associated with this task
    const { error: commentsError } = await supabase
      .from('comments')
      .delete()
      .eq('task_id', id);

    if (commentsError) {
      console.error('Error deleting task comments:', commentsError);
      // Continue anyway
    }

    // Delete the task
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
