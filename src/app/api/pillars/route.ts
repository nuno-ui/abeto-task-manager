import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey);
}

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const { data: pillars, error } = await supabase
      .from('pillars')
      .select('*')
      .order('order_index');

    if (error) {
      console.error('Error fetching pillars:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(pillars);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const supabase = getSupabaseAdmin();

    if (!body.name) {
      return NextResponse.json({ error: 'Pillar name is required' }, { status: 400 });
    }

    // Generate slug if not provided
    const slug = body.slug || body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Get max order_index
    const { data: maxOrder } = await supabase
      .from('pillars')
      .select('order_index')
      .order('order_index', { ascending: false })
      .limit(1)
      .single();

    const pillarData = {
      name: body.name,
      slug,
      description: body.description || null,
      color: body.color || '#6366f1',
      icon: body.icon || null,
      order_index: (maxOrder?.order_index || 0) + 1,
    };

    const { data: pillar, error } = await supabase
      .from('pillars')
      .insert(pillarData)
      .select()
      .single();

    if (error) {
      console.error('Error creating pillar:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(pillar, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const supabase = getSupabaseAdmin();

    if (!body.id) {
      return NextResponse.json({ error: 'Pillar ID is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.color !== undefined) updateData.color = body.color;
    if (body.icon !== undefined) updateData.icon = body.icon;
    if (body.order_index !== undefined) updateData.order_index = body.order_index;

    const { data: pillar, error } = await supabase
      .from('pillars')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating pillar:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(pillar);
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
      return NextResponse.json({ error: 'Pillar ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // First unassign projects from this pillar
    await supabase
      .from('projects')
      .update({ pillar_id: null })
      .eq('pillar_id', id);

    // Delete the pillar
    const { error } = await supabase
      .from('pillars')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting pillar:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Pillar deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
