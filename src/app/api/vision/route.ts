import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const slug = searchParams.get('slug');

  try {
    let query = supabase
      .from('vision_documents')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    if (slug) {
      query = query.eq('slug', slug);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching vision documents:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in vision API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from('vision_documents')
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error('Error creating vision document:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in vision API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const supabase = await createClient();

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('vision_documents')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating vision document:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in vision API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
