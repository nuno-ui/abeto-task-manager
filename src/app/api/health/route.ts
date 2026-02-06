import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey);
}

export async function GET() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return NextResponse.json({
      status: 'error',
      error: 'Service role key not configured',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }

  const supabase = getSupabaseAdmin();

  try {
    // Check database connectivity and measure response time
    const dbStart = Date.now();
    const { error: dbError } = await supabase.from('projects').select('id').limit(1);
    const dbResponseTime = Date.now() - dbStart;

    // Get table statistics
    const tables = ['projects', 'tasks', 'comments', 'users', 'teams', 'pillars'];
    const tableStats = await Promise.all(
      tables.map(async (table) => {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        return { table, count: error ? 0 : (count || 0) };
      })
    );

    // Calculate total records
    const totalRecords = tableStats.reduce((sum, t) => sum + t.count, 0);

    // Check for missing data
    const { data: projectsWithoutPillar } = await supabase
      .from('projects')
      .select('id, title')
      .is('pillar_id', null);

    const { data: tasksWithoutOwner } = await supabase
      .from('tasks')
      .select('id, title')
      .is('owner_team_id', null);

    const { data: projectsWithoutTeam } = await supabase
      .from('projects')
      .select('id, title')
      .is('owner_team_id', null);

    // Get review status overview
    const { data: reviewStatuses } = await supabase
      .from('project_review_status')
      .select('*');

    const reviewStats = {
      totalProjects: tableStats.find(t => t.table === 'projects')?.count || 0,
      fullyReviewed: reviewStatuses?.filter(r => r.all_reviewed).length || 0,
      partiallyReviewed: reviewStatuses?.filter(r =>
        !r.all_reviewed && (r.management_reviewed || r.operations_sales_reviewed || r.product_tech_reviewed)
      ).length || 0,
      notReviewed: (tableStats.find(t => t.table === 'projects')?.count || 0) - (reviewStatuses?.length || 0),
    };

    return NextResponse.json({
      status: dbError ? 'error' : 'healthy',
      database: {
        connected: !dbError,
        responseTimeMs: dbResponseTime,
        error: dbError?.message || null,
      },
      tableStats,
      totalRecords,
      missingData: {
        projectsWithoutPillar: projectsWithoutPillar?.length || 0,
        projectsWithoutPillarList: projectsWithoutPillar?.slice(0, 5) || [],
        tasksWithoutOwner: tasksWithoutOwner?.length || 0,
        tasksWithoutOwnerList: tasksWithoutOwner?.slice(0, 5) || [],
        projectsWithoutTeam: projectsWithoutTeam?.length || 0,
        projectsWithoutTeamList: projectsWithoutTeam?.slice(0, 5) || [],
      },
      reviewStats,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
