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
  const limit = parseInt(searchParams.get('limit') || '50');
  const projectId = searchParams.get('project_id');
  const taskId = searchParams.get('task_id');

  const supabase = getSupabaseAdmin();

  try {
    let query = supabase
      .from('activity_log')
      .select(`
        *,
        user:users!activity_log_user_id_fkey(id, email, full_name, avatar_url),
        project:projects(id, title, slug),
        task:tasks(id, title)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    if (taskId) {
      query = query.eq('task_id', taskId);
    }

    const { data: activities, error } = await query;

    if (error) {
      console.error('Error fetching activity:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(activities || []);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();

  try {
    const body = await request.json();

    if (!body.action || !body.entity_type) {
      return NextResponse.json(
        { error: 'action and entity_type are required' },
        { status: 400 }
      );
    }

    // Get a default user if not provided
    let userId = body.user_id;
    if (!userId) {
      const { data: users } = await supabase
        .from('users')
        .select('id')
        .limit(1)
        .single();
      userId = users?.id;
    }

    const activityData = {
      user_id: userId,
      action: body.action,
      entity_type: body.entity_type,
      entity_id: body.entity_id || null,
      project_id: body.project_id || null,
      task_id: body.task_id || null,
      details: body.details || null,
    };

    const { data: activity, error } = await supabase
      .from('activity_log')
      .insert(activityData)
      .select()
      .single();

    if (error) {
      console.error('Error creating activity:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
