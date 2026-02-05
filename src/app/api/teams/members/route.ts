import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey);
}

// Add member to a team
export async function POST(request: Request) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const supabase = getSupabaseAdmin();

    // Can add existing user to team or create new user
    if (body.user_id && body.team_id) {
      // Assign existing user to team
      const { data: user, error } = await supabase
        .from('users')
        .update({ team_id: body.team_id })
        .eq('id', body.user_id)
        .select()
        .single();

      if (error) {
        console.error('Error assigning user to team:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(user);
    } else if (body.email && body.team_id) {
      // Create new user and add to team
      if (!body.full_name) {
        return NextResponse.json({ error: 'Full name is required for new users' }, { status: 400 });
      }

      const userData = {
        email: body.email,
        full_name: body.full_name,
        team_id: body.team_id,
        role: body.role || 'member',
        is_active: true,
      };

      const { data: user, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(user, { status: 201 });
    } else {
      return NextResponse.json({ error: 'Either user_id or email is required, along with team_id' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Remove member from team
export async function DELETE(request: Request) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Remove user from team (set team_id to null)
    const { data: user, error } = await supabase
      .from('users')
      .update({ team_id: null })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error removing user from team:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get all users (for adding to teams)
export async function GET() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
  }

  const supabase = getSupabaseAdmin();

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, full_name, avatar_url, team_id, role, is_active')
      .order('full_name');

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
