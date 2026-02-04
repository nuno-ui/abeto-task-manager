import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Fetch all projects (not archived)
    const { data: allProjects } = await supabase
      .from('projects')
      .select('id, status')
      .eq('is_archived', false);

    // Fetch recent projects with details
    const { data: recentProjects, error: projectsError } = await supabase
      .from('projects')
      .select('*, pillar:pillars(*), owner_team:teams(*)')
      .eq('is_archived', false)
      .order('updated_at', { ascending: false })
      .limit(5);

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
    }

    // Fetch all tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, status');

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
    }

    // Calculate stats
    const stats = {
      totalProjects: allProjects?.length || 0,
      activeProjects: allProjects?.filter(p => p.status === 'in_progress').length || 0,
      totalTasks: tasks?.length || 0,
      completedTasks: tasks?.filter(t => t.status === 'completed').length || 0,
      blockedTasks: tasks?.filter(t => t.status === 'blocked').length || 0,
    };

    return NextResponse.json({
      stats,
      recentProjects: recentProjects || [],
      recentActivity: [], // Activity log can be added later
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
