import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ projects: [], tasks: [] });
  }

  const supabase = getSupabaseAdmin();
  const searchTerm = `%${query.toLowerCase()}%`;

  try {
    // Search projects
    const { data: projects } = await supabase
      .from('projects')
      .select('id, title, slug, status, priority')
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(5);

    // Search tasks
    const { data: tasks } = await supabase
      .from('tasks')
      .select(`
        id, title, status, phase,
        project:projects(id, title, slug)
      `)
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(5);

    return NextResponse.json({
      projects: projects || [],
      tasks: tasks || [],
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
