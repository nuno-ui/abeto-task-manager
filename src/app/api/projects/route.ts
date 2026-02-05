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
