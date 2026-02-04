import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Fetch project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        *,
        pillar:pillars(*),
        owner_team:teams(*)
      `)
      .eq('slug', slug)
      .single();

    if (projectError) {
      if (projectError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      return NextResponse.json({ error: projectError.message }, { status: 500 });
    }

    // Fetch tasks for this project
    // Note: Using explicit foreign key reference for assignee since there are multiple FK to users
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select(`
        *,
        owner_team:teams(*),
        assignee:users!tasks_assignee_id_fkey(*)
      `)
      .eq('project_id', project.id)
      .order('order_index');

    // Fetch teams for forms
    const { data: teams } = await supabase
      .from('teams')
      .select('*')
      .order('name');

    // Fetch pillars
    const { data: pillars } = await supabase
      .from('pillars')
      .select('*')
      .order('order_index');

    return NextResponse.json({
      project,
      tasks: tasks || [],
      teams: teams || [],
      pillars: pillars || [],
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
