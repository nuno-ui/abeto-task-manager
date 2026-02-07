// Script to analyze and fix duplicate tasks across projects
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pyxjwtyvmbltscayabsj.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function analyzeAndFix() {
  console.log('='.repeat(80));
  console.log('TASK ANALYSIS AND CLEANUP REPORT');
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
      estimated_hours,
      ai_potential,
      is_foundational,
      is_critical_path,
      order_index,
      owner_team_id,
      projects!inner(id, title, slug, status)
    `)
    .order('title');

  if (error) {
    console.error('Error fetching tasks:', error);
    return;
  }

  console.log(`\nTotal tasks: ${tasks.length}`);

  // Group by project
  const byProject = {};
  tasks.forEach(t => {
    const projectTitle = t.projects.title;
    if (!byProject[projectTitle]) {
      byProject[projectTitle] = [];
    }
    byProject[projectTitle].push(t);
  });

  console.log(`\nProjects with tasks: ${Object.keys(byProject).length}`);

  // ================================================================
  // SECTION 1: FIND EXACT DUPLICATE TITLES
  // ================================================================
  console.log('\n' + '='.repeat(80));
  console.log('SECTION 1: EXACT DUPLICATE TASK TITLES');
  console.log('='.repeat(80));

  const titleCount = {};
  tasks.forEach(t => {
    const key = t.title.toLowerCase().trim();
    if (!titleCount[key]) {
      titleCount[key] = [];
    }
    titleCount[key].push({
      id: t.id,
      title: t.title,
      project: t.projects.title,
      projectSlug: t.projects.slug,
      phase: t.phase,
      description: t.description?.substring(0, 100)
    });
  });

  const duplicates = Object.entries(titleCount)
    .filter(([_, tasks]) => tasks.length > 1)
    .sort((a, b) => b[1].length - a[1].length);

  console.log(`\nFound ${duplicates.length} duplicate task titles:\n`);

  duplicates.forEach(([title, instances]) => {
    console.log(`\n"${instances[0].title}" (${instances.length} occurrences):`);
    instances.forEach(t => {
      console.log(`  - [${t.projectSlug}] ${t.project} (${t.phase})`);
      console.log(`    ${t.description}...`);
    });
  });

  // ================================================================
  // SECTION 2: FIND SIMILAR TASKS (potential consolidation)
  // ================================================================
  console.log('\n' + '='.repeat(80));
  console.log('SECTION 2: SIMILAR TASKS THAT COULD BE CONSOLIDATED');
  console.log('='.repeat(80));

  // Group by common keywords
  const keywords = {
    'dashboard': [],
    'integration': [],
    'testing': [],
    'monitoring': [],
    'training': [],
    'documentation': [],
    'api': [],
    'validation': [],
    'deployment': [],
    'security': [],
    'authentication': [],
    'notification': [],
    'reporting': []
  };

  tasks.forEach(t => {
    const titleLower = t.title.toLowerCase();
    Object.keys(keywords).forEach(kw => {
      if (titleLower.includes(kw)) {
        keywords[kw].push({
          title: t.title,
          project: t.projects.title,
          projectSlug: t.projects.slug
        });
      }
    });
  });

  Object.entries(keywords).forEach(([kw, matches]) => {
    if (matches.length > 3) {
      console.log(`\n"${kw}" related tasks (${matches.length}):`);
      matches.slice(0, 10).forEach(m => {
        console.log(`  - [${m.projectSlug}] ${m.title}`);
      });
      if (matches.length > 10) {
        console.log(`  ... and ${matches.length - 10} more`);
      }
    }
  });

  // ================================================================
  // SECTION 3: CROSS-PROJECT DEPENDENCIES ANALYSIS
  // ================================================================
  console.log('\n' + '='.repeat(80));
  console.log('SECTION 3: CROSS-PROJECT DEPENDENCIES');
  console.log('='.repeat(80));

  // Key infrastructure projects that others depend on
  const infrastructureProjects = [
    'unified-data-layer',
    'agent-communication-protocol',
    'ai-cortex',
    'unified-quote-api'
  ];

  console.log('\nInfrastructure projects that should be prioritized:');
  infrastructureProjects.forEach(slug => {
    const projectTasks = tasks.filter(t => t.projects.slug === slug);
    if (projectTasks.length > 0) {
      console.log(`\n${projectTasks[0].projects.title} (${projectTasks.length} tasks):`);
      projectTasks.forEach(t => {
        console.log(`  - [${t.phase}] ${t.title} (${t.priority}, ${t.is_foundational ? 'foundational' : ''} ${t.is_critical_path ? 'critical-path' : ''})`);
      });
    }
  });

  // ================================================================
  // SECTION 4: RECOMMENDATIONS
  // ================================================================
  console.log('\n' + '='.repeat(80));
  console.log('SECTION 4: SPECIFIC RECOMMENDATIONS');
  console.log('='.repeat(80));

  console.log('\n1. RENAME DUPLICATE TASKS TO BE MORE SPECIFIC:');
  const renameRecommendations = [
    { old: 'Testing & Validation', projects: duplicates.find(d => d[0] === 'testing & validation')?.[1] || [] },
    { old: 'Launch & Monitor', projects: duplicates.find(d => d[0] === 'launch & monitor')?.[1] || [] },
    { old: 'Dashboard', projects: duplicates.find(d => d[0].includes('dashboard'))?.[1] || [] }
  ];

  renameRecommendations.forEach(rec => {
    if (rec.projects.length > 1) {
      console.log(`\n   "${rec.old}" should be renamed to:`);
      rec.projects.forEach(p => {
        const newName = `${rec.old} - ${p.project.split(' ')[0]}`;
        console.log(`     [${p.projectSlug}] → "${newName}"`);
      });
    }
  });

  console.log('\n2. TASKS THAT SHOULD HAVE DEPENDENCIES:');
  console.log('   - All "Agent" projects should depend on "Agent Communication Protocol"');
  console.log('   - All "Dashboard" tasks should depend on "Unified Data Layer"');
  console.log('   - All "Quote" tasks should depend on "Unified Quote API"');

  console.log('\n3. PROJECTS THAT SHOULD START FIRST (in order):');
  console.log('   1. Agent Communication Protocol (foundational for all agents)');
  console.log('   2. Unified Data Layer (foundational for all data)');
  console.log('   3. Unified Quote API (foundational for all quoting)');
  console.log('   4. AI Cortex (core AI engine)');

  // ================================================================
  // SECTION 5: Generate update SQL
  // ================================================================
  console.log('\n' + '='.repeat(80));
  console.log('SECTION 5: SUGGESTED TASK RENAMES');
  console.log('='.repeat(80));

  const renames = [];

  // Find duplicates and suggest renames
  duplicates.forEach(([title, instances]) => {
    if (instances.length > 1) {
      instances.forEach(t => {
        // Create a more specific name by prepending project context
        const projectPrefix = t.project.split(' ').slice(0, 2).join(' ');
        const newTitle = `${t.title} (${projectPrefix})`;
        renames.push({
          id: t.id,
          oldTitle: t.title,
          newTitle: newTitle,
          project: t.project
        });
      });
    }
  });

  console.log(`\n${renames.length} tasks could be renamed for clarity:`);
  renames.slice(0, 20).forEach(r => {
    console.log(`  "${r.oldTitle}" → "${r.newTitle}" [${r.project}]`);
  });

  if (renames.length > 20) {
    console.log(`  ... and ${renames.length - 20} more`);
  }

  return { duplicates, renames, tasks, byProject };
}

analyzeAndFix().catch(console.error);
