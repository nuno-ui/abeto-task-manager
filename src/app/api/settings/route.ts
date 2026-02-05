import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey);
}

// Get all settings data (pillars, teams count, projects count, etc.)
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Fetch pillars
    const { data: pillars, error: pillarsError } = await supabase
      .from('pillars')
      .select('*')
      .order('order_index');

    if (pillarsError) {
      console.error('Error fetching pillars:', pillarsError);
    }

    // Fetch teams count
    const { count: teamsCount } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true });

    // Fetch users count
    const { count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Fetch projects count
    const { count: projectsCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    // Fetch tasks count
    const { count: tasksCount } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      pillars: pillars || [],
      stats: {
        teams: teamsCount || 0,
        users: usersCount || 0,
        projects: projectsCount || 0,
        tasks: tasksCount || 0,
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
