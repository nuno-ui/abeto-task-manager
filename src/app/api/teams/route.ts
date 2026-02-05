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
    // Fetch teams with their projects and tasks counts
    const { data: teams, error } = await supabase
      .from('teams')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching teams:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch ALL projects with pillar info
    const { data: projects } = await supabase
      .from('projects')
      .select('id, title, slug, status, priority, owner_team_id, target_date, progress_percentage, pillar_id')
      .eq('is_archived', false);

    // Fetch ALL tasks with project info to get pillar association
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, title, status, priority, owner_team_id, due_date, project_id');

    // Fetch pillars to map team slugs
    const { data: pillars } = await supabase
      .from('pillars')
      .select('id, name, slug');

    // Fetch users for each team
    const { data: users } = await supabase
      .from('users')
      .select('id, email, full_name, avatar_url, team_id, role, is_active')
      .eq('is_active', true);

    // Create a mapping from team slug to pillar IDs (e.g., "marketing" team -> "marketing" pillar)
    const teamSlugToPillarIds: Record<string, string[]> = {};
    pillars?.forEach(pillar => {
      // Match team slug to pillar slug (e.g., "marketing" -> "marketing")
      const normalizedSlug = pillar.slug.toLowerCase().replace(/-/g, '_');
      teamSlugToPillarIds[normalizedSlug] = teamSlugToPillarIds[normalizedSlug] || [];
      teamSlugToPillarIds[normalizedSlug].push(pillar.id);
    });

    // Create project ID to pillar ID mapping
    const projectToPillar: Record<string, string | null> = {};
    projects?.forEach(p => {
      projectToPillar[p.id] = p.pillar_id;
    });

    // Enrich teams with stats - include projects by owner_team_id OR by matching pillar
    const enrichedTeams = teams?.map(team => {
      const teamSlug = team.slug.toLowerCase().replace(/-/g, '_');
      const matchingPillarIds = teamSlugToPillarIds[teamSlug] || [];

      // Get projects: either directly assigned to team OR in matching pillar
      const teamProjects = projects?.filter(p =>
        p.owner_team_id === team.id ||
        (matchingPillarIds.length > 0 && matchingPillarIds.includes(p.pillar_id))
      ) || [];

      // Get project IDs for task lookup
      const teamProjectIds = teamProjects.map(p => p.id);

      // Get tasks: either directly assigned to team OR belonging to team's projects
      const teamTasks = tasks?.filter(t =>
        t.owner_team_id === team.id ||
        teamProjectIds.includes(t.project_id)
      ) || [];

      const teamMembers = users?.filter(u => u.team_id === team.id) || [];

      return {
        ...team,
        projects: teamProjects.slice(0, 20), // Limit for performance
        tasks: teamTasks.slice(0, 50), // Limit for performance
        members: teamMembers,
        stats: {
          projectCount: teamProjects.length,
          activeProjects: teamProjects.filter(p => p.status === 'in_progress').length,
          taskCount: teamTasks.length,
          completedTasks: teamTasks.filter(t => t.status === 'completed').length,
          inProgressTasks: teamTasks.filter(t => t.status === 'in_progress').length,
          blockedTasks: teamTasks.filter(t => t.status === 'blocked').length,
          overdueTasks: teamTasks.filter(t => {
            if (!t.due_date || t.status === 'completed') return false;
            return new Date(t.due_date) < new Date();
          }).length,
          memberCount: teamMembers.length,
        }
      };
    }) || [];

    return NextResponse.json(enrichedTeams);
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
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
    }

    // Generate slug if not provided
    const slug = body.slug || body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const teamData = {
      name: body.name,
      slug,
      description: body.description || null,
      color: body.color || '#6366f1',
    };

    const { data: team, error } = await supabase
      .from('teams')
      .insert(teamData)
      .select()
      .single();

    if (error) {
      console.error('Error creating team:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(team, { status: 201 });
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
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.color !== undefined) updateData.color = body.color;

    const { data: team, error } = await supabase
      .from('teams')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating team:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(team);
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
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // First unassign users from this team
    await supabase
      .from('users')
      .update({ team_id: null })
      .eq('team_id', id);

    // Unassign projects from this team
    await supabase
      .from('projects')
      .update({ owner_team_id: null })
      .eq('owner_team_id', id);

    // Unassign tasks from this team
    await supabase
      .from('tasks')
      .update({ owner_team_id: null })
      .eq('owner_team_id', id);

    // Delete the team
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting team:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
