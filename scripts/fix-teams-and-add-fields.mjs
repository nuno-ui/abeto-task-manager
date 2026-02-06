/**
 * Script to:
 * 1. Assign teams to all projects and tasks
 * 2. Add demo_link field to projects and tasks tables
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Parse .env.local manually
const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex > 0) {
      const key = trimmed.substring(0, eqIndex);
      let value = trimmed.substring(eqIndex + 1);
      value = value.replace(/^["']|["']$/g, '').replace(/\\n$/, '').trim();
      env[key] = value;
    }
  }
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY from .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log('='.repeat(60));
  console.log('FIX TEAMS AND ADD DEMO LINK FIELD');
  console.log('='.repeat(60));

  // 1. First, get all teams
  console.log('\n1. Fetching teams...');
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('*');

  if (teamsError) {
    console.error('Error fetching teams:', teamsError.message);
    return;
  }

  console.log(`Found ${teams?.length || 0} teams:`);
  teams?.forEach(t => console.log(`  - ${t.name} (${t.id})`));

  // If no teams exist, create default teams
  if (!teams || teams.length === 0) {
    console.log('\nNo teams found. Creating default teams...');

    const defaultTeams = [
      { name: 'Engineering', description: 'Technical development and infrastructure', color: '#3B82F6' },
      { name: 'Product', description: 'Product management and design', color: '#8B5CF6' },
      { name: 'Operations', description: 'Business operations and processes', color: '#10B981' },
      { name: 'Sales', description: 'Sales and business development', color: '#F59E0B' },
      { name: 'Marketing', description: 'Marketing and growth', color: '#EC4899' },
      { name: 'Data', description: 'Data analytics and ML', color: '#06B6D4' }
    ];

    const { data: createdTeams, error: createError } = await supabase
      .from('teams')
      .insert(defaultTeams)
      .select();

    if (createError) {
      console.error('Error creating teams:', createError.message);
      return;
    }

    console.log('Created teams:', createdTeams?.map(t => t.name).join(', '));
    teams.push(...(createdTeams || []));
  }

  // Create a team lookup map
  const teamByName = {};
  teams.forEach(t => {
    teamByName[t.name.toLowerCase()] = t.id;
  });

  // 2. Get all projects
  console.log('\n2. Fetching projects...');
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, title, slug, owner_team_id');

  if (projectsError) {
    console.error('Error fetching projects:', projectsError.message);
    return;
  }

  console.log(`Found ${projects?.length || 0} projects`);
  const projectsWithoutTeam = projects?.filter(p => !p.owner_team_id) || [];
  console.log(`Projects without team: ${projectsWithoutTeam.length}`);

  // 3. Assign teams to projects based on project type
  console.log('\n3. Assigning teams to projects...');

  const projectTeamMapping = {
    // Engineering/Technical projects
    'unified-data-layer': 'engineering',
    'ai-cortex': 'engineering',
    'unified-quote-api': 'engineering',
    'api-self-service-portal': 'engineering',
    'data-quality-monitor': 'engineering',
    'ai-omnichannel-chatbot-platform': 'engineering',
    'whatsapp-conversation-summary': 'engineering',

    // Product projects
    'sdr-portal': 'product',
    'installer-portal-product': 'product',
    'investor-portal': 'product',
    'funnel-automation-os': 'product',

    // Operations projects
    'reporting-hub': 'operations',
    'installer-performance-tracking': 'operations',
    'dynamic-allocation-engine': 'operations',
    'contact-prioritization-engine': 'operations',
    'lead-recycling-workflow': 'operations',
    'installer-feedback-system': 'operations',
    'installer-quote-sync': 'operations',
    'answer-rate-monitoring': 'operations',
    'automated-invoicing': 'operations',
    'gdpr-compliance-tracker': 'operations',
    'robinson-suppressor': 'operations',

    // Sales projects
    'partner-expansion-tool': 'sales',

    // Marketing projects
    'campaign-os': 'marketing',
    'programmatic-seo-pages': 'marketing',
    'pvpc-savings-widget': 'marketing',
    'irpf-calculator': 'marketing',
    'gmb-automation': 'marketing',
    'review-generation-system': 'marketing',
    'competitor-intel-agent': 'marketing',

    // Data projects
    // (use data team if exists, otherwise engineering)
  };

  let projectUpdateCount = 0;
  for (const project of projectsWithoutTeam) {
    let teamName = projectTeamMapping[project.slug];

    // Default assignment based on title keywords if not in mapping
    if (!teamName) {
      const titleLower = project.title.toLowerCase();
      if (titleLower.includes('api') || titleLower.includes('data') || titleLower.includes('ai') || titleLower.includes('integration')) {
        teamName = 'engineering';
      } else if (titleLower.includes('portal') || titleLower.includes('dashboard')) {
        teamName = 'product';
      } else if (titleLower.includes('marketing') || titleLower.includes('seo') || titleLower.includes('campaign')) {
        teamName = 'marketing';
      } else if (titleLower.includes('sales') || titleLower.includes('partner')) {
        teamName = 'sales';
      } else {
        teamName = 'operations'; // Default to operations
      }
    }

    const teamId = teamByName[teamName];
    if (teamId) {
      const { error } = await supabase
        .from('projects')
        .update({ owner_team_id: teamId })
        .eq('id', project.id);

      if (error) {
        console.log(`❌ Error assigning team to ${project.title}: ${error.message}`);
      } else {
        console.log(`✅ ${project.title} → ${teamName}`);
        projectUpdateCount++;
      }
    }
  }
  console.log(`\nUpdated ${projectUpdateCount} projects with team assignments`);

  // 4. Get all tasks
  console.log('\n4. Fetching tasks...');
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('id, title, project_id, owner_team_id');

  if (tasksError) {
    console.error('Error fetching tasks:', tasksError.message);
    return;
  }

  console.log(`Found ${tasks?.length || 0} tasks`);
  const tasksWithoutTeam = tasks?.filter(t => !t.owner_team_id) || [];
  console.log(`Tasks without team: ${tasksWithoutTeam.length}`);

  // 5. Get updated projects with their team assignments
  const { data: projectsWithTeams } = await supabase
    .from('projects')
    .select('id, owner_team_id');

  const projectTeamMap = {};
  projectsWithTeams?.forEach(p => {
    projectTeamMap[p.id] = p.owner_team_id;
  });

  // 6. Assign teams to tasks (inherit from project or assign based on task type)
  console.log('\n5. Assigning teams to tasks...');

  let taskUpdateCount = 0;
  for (const task of tasksWithoutTeam) {
    // First try to inherit from project
    let teamId = projectTeamMap[task.project_id];

    // If project doesn't have a team, assign based on task title
    if (!teamId) {
      const titleLower = task.title.toLowerCase();
      let teamName = 'operations'; // Default

      if (titleLower.includes('api') || titleLower.includes('backend') || titleLower.includes('database') || titleLower.includes('infrastructure')) {
        teamName = 'engineering';
      } else if (titleLower.includes('ui') || titleLower.includes('design') || titleLower.includes('ux') || titleLower.includes('frontend')) {
        teamName = 'product';
      } else if (titleLower.includes('marketing') || titleLower.includes('content') || titleLower.includes('seo')) {
        teamName = 'marketing';
      } else if (titleLower.includes('sales') || titleLower.includes('outreach')) {
        teamName = 'sales';
      } else if (titleLower.includes('analytics') || titleLower.includes('ml') || titleLower.includes('model')) {
        teamName = teamByName['data'] ? 'data' : 'engineering';
      }

      teamId = teamByName[teamName];
    }

    if (teamId) {
      const { error } = await supabase
        .from('tasks')
        .update({ owner_team_id: teamId })
        .eq('id', task.id);

      if (error) {
        console.log(`❌ Error assigning team to task: ${error.message}`);
      } else {
        taskUpdateCount++;
      }
    }
  }
  console.log(`Updated ${taskUpdateCount} tasks with team assignments`);

  // 7. Add demo_link column to projects and tasks tables
  console.log('\n6. Adding demo_link column to projects and tasks...');

  // Use raw SQL to add column if not exists
  const addColumnToProjects = await supabase.rpc('exec_sql', {
    sql: `ALTER TABLE projects ADD COLUMN IF NOT EXISTS demo_link text;`
  }).catch(() => null);

  const addColumnToTasks = await supabase.rpc('exec_sql', {
    sql: `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS demo_link text;`
  }).catch(() => null);

  // If RPC doesn't exist, we'll try direct approach via REST
  // The column might already exist or we need to add it via Supabase dashboard
  console.log('Note: If demo_link columns were not added, please run in Supabase SQL Editor:');
  console.log('  ALTER TABLE projects ADD COLUMN IF NOT EXISTS demo_link text;');
  console.log('  ALTER TABLE tasks ADD COLUMN IF NOT EXISTS demo_link text;');

  console.log('\n' + '='.repeat(60));
  console.log('COMPLETE!');
  console.log('='.repeat(60));
  console.log(`Projects updated: ${projectUpdateCount}`);
  console.log(`Tasks updated: ${taskUpdateCount}`);
}

main().catch(console.error);
