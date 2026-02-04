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
  const projectId = searchParams.get('project_id');
  const taskId = searchParams.get('task_id');

  if (!projectId && !taskId) {
    return NextResponse.json(
      { error: 'Either project_id or task_id is required' },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  try {
    let query = supabase
      .from('comments')
      .select(`
        *,
        author:users!comments_author_id_fkey(id, email, full_name, avatar_url)
      `)
      .order('created_at', { ascending: true });

    if (projectId) {
      query = query.eq('project_id', projectId);
    } else if (taskId) {
      query = query.eq('task_id', taskId);
    }

    const { data: comments, error } = await query;

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(comments || []);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();

  try {
    const body = await request.json();

    if (!body.content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    if (!body.project_id && !body.task_id) {
      return NextResponse.json(
        { error: 'Either project_id or task_id is required' },
        { status: 400 }
      );
    }

    // Get a default user if author_id not provided
    let authorId = body.author_id;
    if (!authorId) {
      const { data: users } = await supabase
        .from('users')
        .select('id')
        .limit(1)
        .single();
      authorId = users?.id;
    }

    const commentData = {
      content: body.content,
      project_id: body.project_id || null,
      task_id: body.task_id || null,
      parent_comment_id: body.parent_comment_id || null,
      author_id: authorId,
    };

    const { data: comment, error } = await supabase
      .from('comments')
      .insert(commentData)
      .select(`
        *,
        author:users!comments_author_id_fkey(id, email, full_name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const supabase = getSupabaseAdmin();

  try {
    const body = await request.json();

    if (!body.id || !body.content) {
      return NextResponse.json(
        { error: 'id and content are required' },
        { status: 400 }
      );
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .update({ content: body.content, is_edited: true })
      .eq('id', body.id)
      .select(`
        *,
        author:users!comments_author_id_fkey(id, email, full_name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error updating comment:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting comment:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
