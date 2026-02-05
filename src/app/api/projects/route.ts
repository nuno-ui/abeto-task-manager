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

    // Ensure required fields
    if (!body.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Helper to normalize difficulty value to valid enum
    const normalizeDifficulty = (d: string | undefined): string => {
      if (!d) return 'medium';
      const val = d.toLowerCase();
      if (['easy', 'medium', 'hard'].includes(val)) return val;
      if (val === 'trivial') return 'easy';
      if (val === 'complex') return 'hard';
      return 'medium';
    };

    // Helper to normalize project status to valid enum
    const normalizeProjectStatus = (s: string | undefined): string => {
      const mapping: Record<string, string> = {
        'active': 'in_progress',
        'paused': 'on_hold',
        'draft': 'idea',
        'backlog': 'idea',
        'done': 'completed',
        'archived': 'completed',
      };
      const val = (s || 'planning').toLowerCase();
      return mapping[val] || (['idea', 'planning', 'in_progress', 'on_hold', 'completed', 'cancelled'].includes(val) ? val : 'planning');
    };

    // Generate slug if not provided
    const slug = body.slug || body.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const projectData: Record<string, any> = {
      title: body.title,
      slug,
      description: body.description || null,
      status: normalizeProjectStatus(body.status),
      priority: body.priority || 'medium',
      difficulty: normalizeDifficulty(body.difficulty),
      start_date: body.start_date || null,
      target_date: body.target_date || null,
      owner_team_id: body.owner_team_id || null,
      pillar_id: body.pillar_id || null,
    };

    // Only add optional fields if they exist in the request
    if (body.estimated_hours_min !== undefined) projectData.estimated_hours_min = body.estimated_hours_min;
    if (body.estimated_hours_max !== undefined) projectData.estimated_hours_max = body.estimated_hours_max;
    if (body.why_it_matters !== undefined) projectData.why_it_matters = body.why_it_matters;
    if (body.category !== undefined) projectData.category = body.category;

    // Rich fields for COO Dashboard
    if (body.human_role_before !== undefined) projectData.human_role_before = body.human_role_before;
    if (body.human_role_after !== undefined) projectData.human_role_after = body.human_role_after;
    if (body.who_is_empowered !== undefined) projectData.who_is_empowered = body.who_is_empowered;
    if (body.new_capabilities !== undefined) projectData.new_capabilities = body.new_capabilities;
    if (body.data_required !== undefined) projectData.data_required = body.data_required;
    if (body.data_generates !== undefined) projectData.data_generates = body.data_generates;
    if (body.data_improves !== undefined) projectData.data_improves = body.data_improves;
    if (body.ops_process !== undefined) projectData.ops_process = body.ops_process;
    if (body.current_loa !== undefined) projectData.current_loa = body.current_loa;
    if (body.potential_loa !== undefined) projectData.potential_loa = body.potential_loa;
    if (body.resources_used !== undefined) projectData.resources_used = body.resources_used;
    if (body.api_endpoints !== undefined) projectData.api_endpoints = body.api_endpoints;
    if (body.prerequisites !== undefined) projectData.prerequisites = body.prerequisites;
    if (body.benefits !== undefined) projectData.benefits = body.benefits;
    if (body.missing_api_data !== undefined) projectData.missing_api_data = body.missing_api_data;
    if (body.integrations_needed !== undefined) projectData.integrations_needed = body.integrations_needed;
    if (body.depends_on !== undefined) projectData.depends_on = body.depends_on;
    if (body.enables !== undefined) projectData.enables = body.enables;
    if (body.related_to !== undefined) projectData.related_to = body.related_to;
    if (body.primary_users !== undefined) projectData.primary_users = body.primary_users;
    if (body.data_status !== undefined) projectData.data_status = body.data_status;
    if (body.next_milestone !== undefined) projectData.next_milestone = body.next_milestone;

    const { data: project, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        pillar:pillars(*),
        owner_team:teams(*),
        tasks(id)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform to include task count
    const projectsWithCounts = projects?.map(p => ({
      ...p,
      task_count: p.tasks?.length || 0,
      tasks: undefined
    }));

    return NextResponse.json(projectsWithCounts);
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
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // First delete all tasks associated with this project
    const { error: tasksError } = await supabase
      .from('tasks')
      .delete()
      .eq('project_id', id);

    if (tasksError) {
      console.error('Error deleting project tasks:', tasksError);
      return NextResponse.json({ error: 'Failed to delete project tasks' }, { status: 500 });
    }

    // Then delete comments associated with this project
    const { error: commentsError } = await supabase
      .from('comments')
      .delete()
      .eq('project_id', id);

    if (commentsError) {
      console.error('Error deleting project comments:', commentsError);
      // Continue anyway, comments might not exist
    }

    // Finally delete the project
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting project:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
