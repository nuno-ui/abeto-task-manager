const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pyxjwtyvmbltscayabsj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5eGp3dHl2bWJsdHNjYXlhYnNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMzIwMzksImV4cCI6MjA4NTgwODAzOX0.O6Spt_DddZ6UUF4_HA5shW3OU1IeKidm661gaNEUBXA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log('Checking Supabase data...\n');

  // Check pillars
  const { data: pillars, error: pillarsError } = await supabase
    .from('pillars')
    .select('*');
  console.log('Pillars:', pillars?.length || 0, pillarsError ? `Error: ${pillarsError.message}` : '');

  // Check teams
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('*');
  console.log('Teams:', teams?.length || 0, teamsError ? `Error: ${teamsError.message}` : '');

  // Check projects
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*');
  console.log('Projects:', projects?.length || 0, projectsError ? `Error: ${projectsError.message}` : '');

  // Check tasks
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*');
  console.log('Tasks:', tasks?.length || 0, tasksError ? `Error: ${tasksError.message}` : '');

  if (projects && projects.length > 0) {
    console.log('\nFirst 5 projects:');
    projects.slice(0, 5).forEach(p => console.log(`  - ${p.title} (${p.status})`));
  }
}

checkData();
