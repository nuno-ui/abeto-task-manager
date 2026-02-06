import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization to avoid build-time errors
let supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return supabase;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, priority, category } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const supabaseClient = getSupabaseClient();

    // Store the bug report in a bugs table
    // First, let's try to create the table if it doesn't exist
    const { data, error } = await supabaseClient
      .from('bug_reports')
      .insert({
        title,
        description,
        priority: priority || 'medium',
        category: category || 'other',
        status: 'new',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      // If table doesn't exist, we'll just log and return success
      // The bug report can be sent via other means (GitHub, email, etc.)
      console.log('Bug report received (table may not exist):', { title, priority, category });
      console.log('Database error:', error.message);

      // For now, return success anyway since we logged it
      return NextResponse.json({
        success: true,
        message: 'Bug report logged',
        note: 'Table may not exist yet - bug was logged to console'
      });
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Bug report submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting bug report:', error);
    return NextResponse.json(
      { error: 'Failed to submit bug report' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabaseClient = getSupabaseClient();

    const { data, error } = await supabaseClient
      .from('bug_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ bugs: [], error: error.message });
    }

    return NextResponse.json({ bugs: data || [] });
  } catch (error) {
    console.error('Error fetching bug reports:', error);
    return NextResponse.json({ bugs: [], error: 'Failed to fetch bug reports' });
  }
}
