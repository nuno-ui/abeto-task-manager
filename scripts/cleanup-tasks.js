// Script to clean up and fix task issues across all projects
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pyxjwtyvmbltscayabsj.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupTasks() {
  console.log('='.repeat(80));
  console.log('TASK CLEANUP SCRIPT');
  console.log('='.repeat(80));

  // Fetch all tasks with project info
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select(`
      id,
      title,
      description,
      phase,
      status,
      priority,
      difficulty,
      is_foundational,
      is_critical_path,
      order_index,
      projects!inner(id, title, slug, status)
    `);

  if (error) {
    console.error('Error fetching tasks:', error);
    return;
  }

  console.log(`\nLoaded ${tasks.length} tasks`);

  // ================================================================
  // STEP 1: RENAME DUPLICATE TASKS
  // ================================================================
  console.log('\n' + '='.repeat(80));
  console.log('STEP 1: RENAMING DUPLICATE TASKS');
  console.log('='.repeat(80));

  // Find duplicates
  const titleCount = {};
  tasks.forEach(t => {
    const key = t.title.toLowerCase().trim();
    if (!titleCount[key]) {
      titleCount[key] = [];
    }
    titleCount[key].push(t);
  });

  const duplicates = Object.entries(titleCount)
    .filter(([_, tasks]) => tasks.length > 1);

  console.log(`\nFound ${duplicates.length} duplicate title groups`);

  let renameCount = 0;
  for (const [_, instances] of duplicates) {
    for (const task of instances) {
      // Create a more specific name
      const projectContext = task.projects.title
        .replace(/\s+(Platform|System|Engine|Suite|Portal|Automation|Agent|OS|API|Monitor|Dashboard|Tracker|Hub|Workflow|Calculator|Sync|Widget|Processing|Suppressor)$/i, '')
        .split(' ')
        .slice(0, 2)
        .join(' ');

      const newTitle = `${task.title} - ${projectContext}`;

      // Update the task
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ title: newTitle })
        .eq('id', task.id);

      if (updateError) {
        console.log(`  Error renaming "${task.title}": ${updateError.message}`);
      } else {
        console.log(`  Renamed: "${task.title}" → "${newTitle}"`);
        renameCount++;
      }
    }
  }

  console.log(`\nRenamed ${renameCount} tasks`);

  // ================================================================
  // STEP 2: FIX GENERIC DESCRIPTIONS
  // ================================================================
  console.log('\n' + '='.repeat(80));
  console.log('STEP 2: FIXING GENERIC DESCRIPTIONS');
  console.log('='.repeat(80));

  // Find tasks with generic descriptions
  const genericPhrases = [
    'Complete .* according to requirements',
    'Build and train machine learning model with proper validation',
    'Implement comprehensive test coverage including'
  ];

  const tasksWithGenericDesc = tasks.filter(t => {
    if (!t.description) return false;
    return genericPhrases.some(phrase => new RegExp(phrase, 'i').test(t.description));
  });

  console.log(`\nFound ${tasksWithGenericDesc.length} tasks with generic descriptions`);
  console.log('These will need manual review to add project-specific context.');

  // ================================================================
  // STEP 3: IDENTIFY INFRASTRUCTURE DEPENDENCIES
  // ================================================================
  console.log('\n' + '='.repeat(80));
  console.log('STEP 3: MARKING INFRASTRUCTURE DEPENDENCIES');
  console.log('='.repeat(80));

  // Get infrastructure projects
  const infraSlugs = ['unified-data-layer', 'agent-communication-protocol', 'ai-cortex', 'unified-quote-api'];

  const infraProjects = {};
  for (const slug of infraSlugs) {
    const { data: project } = await supabase
      .from('projects')
      .select('id, title, slug')
      .eq('slug', slug)
      .single();

    if (project) {
      infraProjects[slug] = project;
      console.log(`  Found infrastructure project: ${project.title} (${project.id})`);
    }
  }

  // Get all foundational tasks from infrastructure projects
  const { data: infraTasks } = await supabase
    .from('tasks')
    .select('id, title, project_id, is_foundational, is_critical_path')
    .in('project_id', Object.values(infraProjects).map(p => p.id))
    .eq('is_foundational', true);

  console.log(`\nFound ${infraTasks?.length || 0} foundational infrastructure tasks`);

  // ================================================================
  // STEP 4: CREATE DEPENDENCY RECOMMENDATIONS
  // ================================================================
  console.log('\n' + '='.repeat(80));
  console.log('STEP 4: DEPENDENCY RECOMMENDATIONS');
  console.log('='.repeat(80));

  // Find all agent-related projects
  const agentProjects = tasks
    .filter(t => t.projects.title.toLowerCase().includes('agent') ||
                 t.projects.slug.includes('agent'))
    .map(t => t.projects)
    .filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i);

  console.log('\nAgent projects that should depend on Agent Communication Protocol:');
  agentProjects.forEach(p => {
    if (p.slug !== 'agent-communication-protocol') {
      console.log(`  - ${p.title}`);
    }
  });

  // Find all dashboard/reporting projects
  const dataProjects = tasks
    .filter(t => t.title.toLowerCase().includes('dashboard') ||
                 t.title.toLowerCase().includes('reporting') ||
                 t.title.toLowerCase().includes('analytics'))
    .map(t => t.projects)
    .filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i);

  console.log('\nProjects with dashboard/reporting tasks that should depend on Unified Data Layer:');
  dataProjects.slice(0, 15).forEach(p => {
    if (p.slug !== 'unified-data-layer') {
      console.log(`  - ${p.title}`);
    }
  });

  // Find all quote-related projects
  const quoteProjects = tasks
    .filter(t => t.title.toLowerCase().includes('quote') ||
                 t.title.toLowerCase().includes('pricing') ||
                 t.projects.slug.includes('quote'))
    .map(t => t.projects)
    .filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i);

  console.log('\nProjects with quote/pricing tasks that should depend on Unified Quote API:');
  quoteProjects.forEach(p => {
    if (p.slug !== 'unified-quote-api') {
      console.log(`  - ${p.title}`);
    }
  });

  // ================================================================
  // STEP 5: SUMMARY
  // ================================================================
  console.log('\n' + '='.repeat(80));
  console.log('CLEANUP SUMMARY');
  console.log('='.repeat(80));

  console.log(`
✅ Renamed ${renameCount} duplicate tasks to include project context
⚠️  ${tasksWithGenericDesc.length} tasks have generic descriptions (manual review needed)

RECOMMENDED PROJECT EXECUTION ORDER:
1. Agent Communication Protocol (${infraProjects['agent-communication-protocol']?.id || 'not found'})
   - All other agent projects depend on this

2. Unified Data Layer (${infraProjects['unified-data-layer']?.id || 'not found'})
   - All dashboard/reporting/analytics projects depend on this

3. Unified Quote API (${infraProjects['unified-quote-api']?.id || 'not found'})
   - All quote/pricing projects depend on this

4. AI Cortex (${infraProjects['ai-cortex']?.id || 'not found'})
   - All AI-powered features depend on this

NEXT STEPS:
- Add explicit task dependencies in the task_dependencies table
- Review and update generic task descriptions
- Set up project-level dependencies
`);
}

cleanupTasks().catch(console.error);
