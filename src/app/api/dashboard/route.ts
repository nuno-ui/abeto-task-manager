import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Fetch all projects with tasks count
    const { data: allProjects } = await supabase
      .from('projects')
      .select('id, status, priority, pillar_id, owner_team_id, progress_percentage, created_at, target_date')
      .eq('is_archived', false);

    // Fetch recent projects with details
    const { data: recentProjects, error: projectsError } = await supabase
      .from('projects')
      .select('*, pillar:pillars(*), owner_team:teams(*)')
      .eq('is_archived', false)
      .order('updated_at', { ascending: false })
      .limit(5);

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
    }

    // Fetch all tasks with more details
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, status, phase, priority, ai_potential, owner_team_id, due_date, created_at');

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
    }

    // Fetch teams for team stats
    const { data: teams } = await supabase
      .from('teams')
      .select('id, name, slug, color');

    // Fetch pillars for pillar stats
    const { data: pillars } = await supabase
      .from('pillars')
      .select('id, name, slug, color');

    // Calculate basic stats
    const stats = {
      totalProjects: allProjects?.length || 0,
      activeProjects: allProjects?.filter(p => p.status === 'in_progress').length || 0,
      totalTasks: tasks?.length || 0,
      completedTasks: tasks?.filter(t => t.status === 'completed').length || 0,
      blockedTasks: tasks?.filter(t => t.status === 'blocked').length || 0,
      inProgressTasks: tasks?.filter(t => t.status === 'in_progress').length || 0,
      inReviewTasks: tasks?.filter(t => t.status === 'in_review').length || 0,
    };

    // Projects by status
    const projectsByStatus = {
      idea: allProjects?.filter(p => p.status === 'idea').length || 0,
      planning: allProjects?.filter(p => p.status === 'planning').length || 0,
      in_progress: allProjects?.filter(p => p.status === 'in_progress').length || 0,
      on_hold: allProjects?.filter(p => p.status === 'on_hold').length || 0,
      completed: allProjects?.filter(p => p.status === 'completed').length || 0,
    };

    // Projects by priority
    const projectsByPriority = {
      critical: allProjects?.filter(p => p.priority === 'critical').length || 0,
      high: allProjects?.filter(p => p.priority === 'high').length || 0,
      medium: allProjects?.filter(p => p.priority === 'medium').length || 0,
      low: allProjects?.filter(p => p.priority === 'low').length || 0,
    };

    // Tasks by phase
    const tasksByPhase = {
      discovery: tasks?.filter(t => t.phase === 'discovery').length || 0,
      planning: tasks?.filter(t => t.phase === 'planning').length || 0,
      development: tasks?.filter(t => t.phase === 'development').length || 0,
      testing: tasks?.filter(t => t.phase === 'testing').length || 0,
      training: tasks?.filter(t => t.phase === 'training').length || 0,
      rollout: tasks?.filter(t => t.phase === 'rollout').length || 0,
      monitoring: tasks?.filter(t => t.phase === 'monitoring').length || 0,
    };

    // AI Potential analysis
    const aiPotentialStats = {
      high: tasks?.filter(t => t.ai_potential === 'high').length || 0,
      medium: tasks?.filter(t => t.ai_potential === 'medium').length || 0,
      low: tasks?.filter(t => t.ai_potential === 'low').length || 0,
      none: tasks?.filter(t => t.ai_potential === 'none').length || 0,
    };

    // Team workload
    const teamStats = teams?.map(team => {
      const teamProjects = allProjects?.filter(p => p.owner_team_id === team.id) || [];
      const teamTasks = tasks?.filter(t => t.owner_team_id === team.id) || [];
      return {
        ...team,
        projectCount: teamProjects.length,
        taskCount: teamTasks.length,
        completedTasks: teamTasks.filter(t => t.status === 'completed').length,
        inProgressTasks: teamTasks.filter(t => t.status === 'in_progress').length,
      };
    }) || [];

    // Pillar stats
    const pillarStats = pillars?.map(pillar => {
      const pillarProjects = allProjects?.filter(p => p.pillar_id === pillar.id) || [];
      return {
        ...pillar,
        projectCount: pillarProjects.length,
        activeProjects: pillarProjects.filter(p => p.status === 'in_progress').length,
        avgProgress: pillarProjects.length > 0
          ? Math.round(pillarProjects.reduce((acc, p) => acc + (p.progress_percentage || 0), 0) / pillarProjects.length)
          : 0,
      };
    }) || [];

    // Upcoming deadlines (tasks with due dates in next 7 days)
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingTasks = tasks?.filter(t => {
      if (!t.due_date || t.status === 'completed') return false;
      const dueDate = new Date(t.due_date);
      return dueDate >= now && dueDate <= weekFromNow;
    }).length || 0;

    // Overdue tasks
    const overdueTasks = tasks?.filter(t => {
      if (!t.due_date || t.status === 'completed') return false;
      const dueDate = new Date(t.due_date);
      return dueDate < now;
    }).length || 0;

    // Average project progress
    const avgProjectProgress = allProjects && allProjects.length > 0
      ? Math.round(allProjects.reduce((acc, p) => acc + (p.progress_percentage || 0), 0) / allProjects.length)
      : 0;

    return NextResponse.json({
      stats,
      projectsByStatus,
      projectsByPriority,
      tasksByPhase,
      aiPotentialStats,
      teamStats,
      pillarStats,
      upcomingTasks,
      overdueTasks,
      avgProjectProgress,
      recentProjects: recentProjects || [],
      recentActivity: [],
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
