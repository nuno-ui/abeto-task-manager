import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const supabase = createAdminClient();
  const { slug } = await params;

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
      console.error('Error fetching project:', projectError);
      return NextResponse.json({ error: projectError.message }, { status: 500 });
    }

    // Fetch tasks for this project
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select(`
        *,
        owner_team:teams(*),
        assignee:users(*)
      `)
      .eq('project_id', project.id)
      .order('order_index');

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
    }

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
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
