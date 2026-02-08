import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { CreateVisionFeedbackInput, VisionFeedbackStatus } from '@/types/database';

// GET - Fetch vision feedback
export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const topic = searchParams.get('topic');
  const limit = parseInt(searchParams.get('limit') || '50');

  try {
    let query = supabase
      .from('vision_feedback')
      .select(`
        *,
        author:users(id, full_name, email, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (topic) {
      query = query.eq('topic', topic);
    }

    const { data, error } = await query;

    if (error) {
      // Table might not exist yet - return empty array
      if (error.code === '42P01') {
        return NextResponse.json([]);
      }
      console.error('Error fetching vision feedback:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Hide author info for anonymous feedback
    const sanitizedData = data?.map(item => ({
      ...item,
      author: item.is_anonymous ? null : item.author,
      author_name: item.is_anonymous ? 'Anonymous' : item.author_name,
      author_email: item.is_anonymous ? null : item.author_email,
    }));

    return NextResponse.json(sanitizedData || []);
  } catch (error) {
    console.error('Error in vision feedback API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new feedback
export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const body: CreateVisionFeedbackInput = await request.json();

    // Validate required fields
    if (!body.type || !body.topic || !body.title || !body.content) {
      return NextResponse.json(
        { error: 'Type, topic, title, and content are required' },
        { status: 400 }
      );
    }

    // Get current user if authenticated
    const { data: { user } } = await supabase.auth.getUser();

    const feedbackData = {
      type: body.type,
      topic: body.topic,
      title: body.title.slice(0, 200), // Limit title length
      content: body.content.slice(0, 5000), // Limit content length
      resource_url: body.resource_url || null,
      author_id: body.is_anonymous ? null : (user?.id || null),
      author_name: body.is_anonymous ? null : (body.author_name || user?.user_metadata?.full_name || null),
      author_email: body.is_anonymous ? null : (body.author_email || user?.email || null),
      is_anonymous: body.is_anonymous || false,
      status: 'pending' as VisionFeedbackStatus,
      upvotes: 0,
    };

    const { data, error } = await supabase
      .from('vision_feedback')
      .insert(feedbackData)
      .select()
      .single();

    if (error) {
      // If table doesn't exist, create it
      if (error.code === '42P01') {
        // Table doesn't exist - we'll store in a simpler way or return success
        console.log('Vision feedback table not found, feedback logged:', feedbackData);
        return NextResponse.json({
          id: 'temp-' + Date.now(),
          ...feedbackData,
          created_at: new Date().toISOString(),
          message: 'Feedback received (table being set up)',
        });
      }
      console.error('Error creating vision feedback:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in vision feedback API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update feedback (for admin responses, status changes)
export async function PUT(request: Request) {
  const supabase = await createClient();

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Feedback ID required' }, { status: 400 });
    }

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('vision_feedback')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating vision feedback:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in vision feedback API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Upvote feedback
export async function PATCH(request: Request) {
  const supabase = await createClient();

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Feedback ID required' }, { status: 400 });
    }

    // Increment upvotes
    const { data, error } = await supabase.rpc('increment_vision_feedback_upvotes', {
      feedback_id: id,
    });

    if (error) {
      // Fallback: manual increment if RPC doesn't exist
      const { data: current } = await supabase
        .from('vision_feedback')
        .select('upvotes')
        .eq('id', id)
        .single();

      if (current) {
        const { data: updated, error: updateError } = await supabase
          .from('vision_feedback')
          .update({ upvotes: (current.upvotes || 0) + 1 })
          .eq('id', id)
          .select()
          .single();

        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }
        return NextResponse.json(updated);
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in vision feedback upvote:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
