/**
 * Task Analysis Script for Abeto Task Manager
 *
 * Analyzes all tasks across projects to identify:
 * 1. Interdependencies between tasks (across projects)
 * 2. Duplications or overlapping tasks
 * 3. Logical inconsistencies
 */

const SUPABASE_URL = 'https://pyxjwtyvmbltscayabsj.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5eGp3dHl2bWJsdHNjYXlhYnNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIzMjAzOSwiZXhwIjoyMDg1ODA4MDM5fQ.4CO0_gKZQrmKWolIzcb-vuGmKNQAdLVKjIwRXTbd0JQ';

// Helper to make Supabase REST API calls
async function supabaseQuery(table, options = {}) {
  const { select = '*', filters = [], order } = options;

  let url = `${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(select)}`;

  filters.forEach(filter => {
    url += `&${filter}`;
  });

  if (order) {
    url += `&order=${order}`;
  }

  const response = await fetch(url, {
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Supabase error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Calculate string similarity (Levenshtein-based Jaccard)
function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;

  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1;

  // Tokenize and compare words
  const words1 = new Set(s1.split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(s2.split(/\s+/).filter(w => w.length > 2));

  if (words1.size === 0 || words2.size === 0) return 0;

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

// Extract key themes from task titles and descriptions
function extractThemes(task) {
  const text = `${task.title} ${task.description || ''}`.toLowerCase();
  const themes = [];

  const themePatterns = {
    'API/Integration': /\b(api|integration|endpoint|rest|graphql|webhook)\b/,
    'UI/Frontend': /\b(ui|frontend|interface|dashboard|component|button|form|page|view|display)\b/,
    'Database/Data': /\b(database|data|schema|model|table|query|supabase|sql)\b/,
    'Authentication': /\b(auth|login|logout|session|permission|role|access|security)\b/,
    'Testing': /\b(test|testing|unit|integration|e2e|qa|quality)\b/,
    'Documentation': /\b(document|documentation|readme|guide|manual)\b/,
    'AI/ML': /\b(ai|ml|machine learning|model|prediction|llm|agent|cortex|autonomous)\b/,
    'Communication': /\b(email|notification|message|alert|sms|communicate|protocol)\b/,
    'Automation': /\b(automat|workflow|schedule|trigger|cron|batch)\b/,
    'Reporting': /\b(report|analytics|metrics|dashboard|kpi|insight)\b/,
    'Configuration': /\b(config|setting|preference|option|parameter)\b/,
    'Performance': /\b(performance|optimization|speed|cache|latency)\b/,
    'Deployment': /\b(deploy|release|rollout|production|staging|ci|cd)\b/,
    'Design': /\b(design|ux|prototype|wireframe|mockup|figma)\b/,
    'Quote/Pricing': /\b(quote|price|pricing|cost|estimate|bid)\b/,
    'CRM/Sales': /\b(crm|sales|lead|customer|prospect|deal|opportunity)\b/,
    'Installer/Technician': /\b(installer|technician|crew|field|job|appointment|dispatch)\b/
  };

  for (const [theme, pattern] of Object.entries(themePatterns)) {
    if (pattern.test(text)) {
      themes.push(theme);
    }
  }

  return themes.length > 0 ? themes : ['General'];
}

// Detect phase ordering issues
const PHASE_ORDER = {
  'discovery': 1,
  'planning': 2,
  'development': 3,
  'testing': 4,
  'training': 5,
  'rollout': 6,
  'monitoring': 7
};

function detectPhaseIssues(tasks) {
  const issues = [];

  // Check for tasks in later phases being completed while earlier phases are not
  const tasksByPhase = {};
  tasks.forEach(task => {
    if (!tasksByPhase[task.phase]) {
      tasksByPhase[task.phase] = [];
    }
    tasksByPhase[task.phase].push(task);
  });

  const phases = Object.keys(tasksByPhase).sort((a, b) =>
    (PHASE_ORDER[a] || 99) - (PHASE_ORDER[b] || 99)
  );

  for (let i = 0; i < phases.length; i++) {
    const currentPhase = phases[i];
    const currentPhaseTasks = tasksByPhase[currentPhase];

    // Check if any task in later phases is completed while tasks in this phase are not started
    for (let j = i + 1; j < phases.length; j++) {
      const laterPhase = phases[j];
      const laterPhaseTasks = tasksByPhase[laterPhase];

      const completedLaterTasks = laterPhaseTasks.filter(t => t.status === 'completed');
      const notStartedCurrentTasks = currentPhaseTasks.filter(t => t.status === 'not_started');

      if (completedLaterTasks.length > 0 && notStartedCurrentTasks.length > 0) {
        issues.push({
          type: 'phase_order',
          message: `"${laterPhase}" phase has completed tasks while "${currentPhase}" phase has not-started tasks`,
          completedTasks: completedLaterTasks.map(t => t.title),
          notStartedTasks: notStartedCurrentTasks.map(t => t.title)
        });
      }
    }
  }

  // Check for testing tasks before development
  const testingTasks = tasks.filter(t => t.phase === 'testing' && t.status !== 'not_started');
  const devTasks = tasks.filter(t => t.phase === 'development' && t.status === 'not_started');

  if (testingTasks.length > 0 && devTasks.length > 0) {
    issues.push({
      type: 'testing_before_dev',
      message: 'Testing tasks are in progress/completed while development tasks have not started',
      testingTasks: testingTasks.map(t => t.title),
      devTasks: devTasks.map(t => t.title)
    });
  }

  return issues;
}

// Find potential cross-project dependencies based on task content
function findCrossProjectDependencies(allTasks, projects) {
  const dependencies = [];
  const projectMap = {};
  projects.forEach(p => {
    projectMap[p.id] = p;
    projectMap[p.slug] = p;
  });

  // Keywords that suggest dependencies
  const dependencyKeywords = [
    'agent communication protocol', 'unified data layer', 'cortex',
    'api', 'integration', 'depends on', 'requires', 'needs',
    'data from', 'uses', 'connects to', 'after'
  ];

  // Group tasks by project
  const tasksByProject = {};
  allTasks.forEach(task => {
    if (!tasksByProject[task.project_id]) {
      tasksByProject[task.project_id] = [];
    }
    tasksByProject[task.project_id].push(task);
  });

  // Check each task for references to other projects
  allTasks.forEach(task => {
    const taskText = `${task.title} ${task.description || ''} ${(task.blocked_by || []).join(' ')}`.toLowerCase();
    const taskProject = projectMap[task.project_id];

    // Check if task mentions other project names/slugs
    projects.forEach(otherProject => {
      if (otherProject.id === task.project_id) return;

      const projectTerms = [
        otherProject.title.toLowerCase(),
        otherProject.slug.toLowerCase(),
        otherProject.agent_name?.toLowerCase()
      ].filter(Boolean);

      projectTerms.forEach(term => {
        if (term.length > 3 && taskText.includes(term)) {
          dependencies.push({
            fromProject: taskProject?.title || task.project_id,
            fromTask: task.title,
            toProject: otherProject.title,
            matchedTerm: term,
            taskPhase: task.phase,
            taskStatus: task.status
          });
        }
      });
    });

    // Check blocked_by for cross-project references
    if (task.blocked_by && task.blocked_by.length > 0) {
      task.blocked_by.forEach(blocker => {
        dependencies.push({
          fromProject: taskProject?.title || task.project_id,
          fromTask: task.title,
          blockedBy: blocker,
          taskPhase: task.phase,
          taskStatus: task.status
        });
      });
    }
  });

  return dependencies;
}

// Find duplicate/similar tasks
function findDuplicates(allTasks, threshold = 0.6) {
  const duplicates = [];
  const checked = new Set();

  for (let i = 0; i < allTasks.length; i++) {
    for (let j = i + 1; j < allTasks.length; j++) {
      const key = `${i}-${j}`;
      if (checked.has(key)) continue;
      checked.add(key);

      const task1 = allTasks[i];
      const task2 = allTasks[j];

      const titleSimilarity = calculateSimilarity(task1.title, task2.title);
      const descSimilarity = calculateSimilarity(task1.description, task2.description);

      const avgSimilarity = (titleSimilarity * 0.7) + (descSimilarity * 0.3);

      if (avgSimilarity >= threshold) {
        duplicates.push({
          task1: {
            id: task1.id,
            title: task1.title,
            project_id: task1.project_id,
            phase: task1.phase,
            status: task1.status
          },
          task2: {
            id: task2.id,
            title: task2.title,
            project_id: task2.project_id,
            phase: task2.phase,
            status: task2.status
          },
          similarity: avgSimilarity.toFixed(2),
          sameProject: task1.project_id === task2.project_id
        });
      }
    }
  }

  return duplicates.sort((a, b) => parseFloat(b.similarity) - parseFloat(a.similarity));
}

// Main analysis function
async function analyzeAllTasks() {
  console.log('='.repeat(80));
  console.log('ABETO TASK MANAGER - COMPREHENSIVE TASK ANALYSIS');
  console.log('='.repeat(80));
  console.log(`Analysis Date: ${new Date().toISOString()}\n`);

  try {
    // Fetch all projects with their relationships
    console.log('Fetching projects...');
    const projects = await supabaseQuery('projects', {
      select: '*',
      filters: ['is_archived=eq.false'],
      order: 'title.asc'
    });
    console.log(`Found ${projects.length} active projects\n`);

    // Fetch all tasks
    console.log('Fetching tasks...');
    const tasks = await supabaseQuery('tasks', {
      select: '*',
      order: 'project_id.asc,order_index.asc'
    });
    console.log(`Found ${tasks.length} total tasks\n`);

    // Create project lookup
    const projectMap = {};
    projects.forEach(p => {
      projectMap[p.id] = p;
    });

    // =========================================================================
    // SECTION 1: PROJECT SUMMARY
    // =========================================================================
    console.log('='.repeat(80));
    console.log('SECTION 1: PROJECT SUMMARY');
    console.log('='.repeat(80));

    // Group tasks by project
    const tasksByProject = {};
    tasks.forEach(task => {
      if (!tasksByProject[task.project_id]) {
        tasksByProject[task.project_id] = [];
      }
      tasksByProject[task.project_id].push(task);
    });

    // Summary table
    console.log('\n| Project | Status | Tasks | Completed | In Progress | Blocked |');
    console.log('|---------|--------|-------|-----------|-------------|---------|');

    const projectSummaries = [];
    for (const project of projects) {
      const projectTasks = tasksByProject[project.id] || [];
      const completed = projectTasks.filter(t => t.status === 'completed').length;
      const inProgress = projectTasks.filter(t => t.status === 'in_progress').length;
      const blocked = projectTasks.filter(t => t.status === 'blocked').length;

      projectSummaries.push({
        project,
        tasks: projectTasks,
        completed,
        inProgress,
        blocked
      });

      console.log(`| ${project.title.substring(0, 40).padEnd(40)} | ${project.status.padEnd(11)} | ${String(projectTasks.length).padStart(5)} | ${String(completed).padStart(9)} | ${String(inProgress).padStart(11)} | ${String(blocked).padStart(7)} |`);
    }

    console.log('\nTotal Tasks:', tasks.length);
    console.log('Total Completed:', tasks.filter(t => t.status === 'completed').length);
    console.log('Total In Progress:', tasks.filter(t => t.status === 'in_progress').length);
    console.log('Total Blocked:', tasks.filter(t => t.status === 'blocked').length);
    console.log('Total Not Started:', tasks.filter(t => t.status === 'not_started').length);

    // =========================================================================
    // SECTION 2: TASKS GROUPED BY THEME/CATEGORY
    // =========================================================================
    console.log('\n' + '='.repeat(80));
    console.log('SECTION 2: TASKS GROUPED BY THEME/CATEGORY');
    console.log('='.repeat(80));

    const tasksByTheme = {};
    tasks.forEach(task => {
      const themes = extractThemes(task);
      themes.forEach(theme => {
        if (!tasksByTheme[theme]) {
          tasksByTheme[theme] = [];
        }
        tasksByTheme[theme].push({
          ...task,
          projectTitle: projectMap[task.project_id]?.title || 'Unknown'
        });
      });
    });

    const sortedThemes = Object.keys(tasksByTheme).sort((a, b) =>
      tasksByTheme[b].length - tasksByTheme[a].length
    );

    for (const theme of sortedThemes) {
      const themeTasks = tasksByTheme[theme];
      console.log(`\n### ${theme} (${themeTasks.length} tasks)`);

      // Group by project within theme
      const byProject = {};
      themeTasks.forEach(t => {
        if (!byProject[t.projectTitle]) {
          byProject[t.projectTitle] = [];
        }
        byProject[t.projectTitle].push(t);
      });

      for (const [projectTitle, pTasks] of Object.entries(byProject)) {
        console.log(`  [${projectTitle}]`);
        pTasks.slice(0, 5).forEach(t => {
          console.log(`    - ${t.title} (${t.status})`);
        });
        if (pTasks.length > 5) {
          console.log(`    ... and ${pTasks.length - 5} more`);
        }
      }
    }

    // =========================================================================
    // SECTION 3: POTENTIAL DUPLICATIONS
    // =========================================================================
    console.log('\n' + '='.repeat(80));
    console.log('SECTION 3: POTENTIAL DUPLICATIONS / OVERLAPPING TASKS');
    console.log('='.repeat(80));

    const duplicates = findDuplicates(tasks, 0.5);

    if (duplicates.length === 0) {
      console.log('\nNo significant duplications found (threshold: 50% similarity)');
    } else {
      console.log(`\nFound ${duplicates.length} potential duplications:\n`);

      // Separate same-project and cross-project duplicates
      const sameProjectDups = duplicates.filter(d => d.sameProject);
      const crossProjectDups = duplicates.filter(d => !d.sameProject);

      if (sameProjectDups.length > 0) {
        console.log('### Same-Project Duplicates:');
        sameProjectDups.forEach((dup, idx) => {
          const project = projectMap[dup.task1.project_id];
          console.log(`\n${idx + 1}. [${project?.title || 'Unknown'}] (Similarity: ${dup.similarity})`);
          console.log(`   Task A: "${dup.task1.title}" (${dup.task1.status})`);
          console.log(`   Task B: "${dup.task2.title}" (${dup.task2.status})`);
        });
      }

      if (crossProjectDups.length > 0) {
        console.log('\n### Cross-Project Duplicates:');
        crossProjectDups.forEach((dup, idx) => {
          const project1 = projectMap[dup.task1.project_id];
          const project2 = projectMap[dup.task2.project_id];
          console.log(`\n${idx + 1}. (Similarity: ${dup.similarity})`);
          console.log(`   [${project1?.title || 'Unknown'}] "${dup.task1.title}" (${dup.task1.status})`);
          console.log(`   [${project2?.title || 'Unknown'}] "${dup.task2.title}" (${dup.task2.status})`);
        });
      }
    }

    // =========================================================================
    // SECTION 4: CROSS-PROJECT DEPENDENCIES
    // =========================================================================
    console.log('\n' + '='.repeat(80));
    console.log('SECTION 4: CROSS-PROJECT DEPENDENCIES');
    console.log('='.repeat(80));

    // Check project-level dependencies from depends_on field
    console.log('\n### Project-Level Dependencies (from depends_on field):');
    const projectDeps = [];
    projects.forEach(project => {
      if (project.depends_on && project.depends_on.length > 0) {
        project.depends_on.forEach(dep => {
          projectDeps.push({
            from: project.title,
            fromSlug: project.slug,
            to: dep,
            fromStatus: project.status
          });
        });
      }
    });

    if (projectDeps.length === 0) {
      console.log('No explicit project dependencies found');
    } else {
      projectDeps.forEach(dep => {
        const depProject = projects.find(p => p.slug === dep.to);
        console.log(`  "${dep.from}" depends on "${depProject?.title || dep.to}" (${depProject?.status || 'unknown'})`);
      });
    }

    // Check agent relationships
    console.log('\n### Agent Relationships (delegates_to, called_by):');
    const agentRelationships = [];
    projects.forEach(project => {
      if (project.agent_delegates_to && project.agent_delegates_to.length > 0) {
        project.agent_delegates_to.forEach(target => {
          agentRelationships.push({
            type: 'delegates_to',
            from: project.agent_name || project.title,
            to: target
          });
        });
      }
      if (project.agent_called_by && project.agent_called_by.length > 0) {
        project.agent_called_by.forEach(caller => {
          agentRelationships.push({
            type: 'called_by',
            from: project.agent_name || project.title,
            by: caller
          });
        });
      }
    });

    if (agentRelationships.length === 0) {
      console.log('No agent relationships defined');
    } else {
      const delegations = agentRelationships.filter(r => r.type === 'delegates_to');
      const calledBy = agentRelationships.filter(r => r.type === 'called_by');

      if (delegations.length > 0) {
        console.log('\n  Delegations:');
        delegations.forEach(r => {
          console.log(`    "${r.from}" delegates to "${r.to}"`);
        });
      }

      if (calledBy.length > 0) {
        console.log('\n  Called By:');
        calledBy.forEach(r => {
          console.log(`    "${r.from}" is called by "${r.by}"`);
        });
      }
    }

    // Task-level cross-project dependencies
    console.log('\n### Task-Level Cross-Project References:');
    const crossDeps = findCrossProjectDependencies(tasks, projects);

    const blockerDeps = crossDeps.filter(d => d.blockedBy);
    const refDeps = crossDeps.filter(d => d.matchedTerm);

    if (blockerDeps.length > 0) {
      console.log('\n  Tasks with blocked_by references:');
      blockerDeps.slice(0, 20).forEach(dep => {
        console.log(`    [${dep.fromProject}] "${dep.fromTask}"`);
        console.log(`      Blocked by: ${dep.blockedBy}`);
      });
      if (blockerDeps.length > 20) {
        console.log(`    ... and ${blockerDeps.length - 20} more`);
      }
    }

    if (refDeps.length > 0) {
      console.log('\n  Tasks referencing other projects:');
      // Group by target project
      const byTarget = {};
      refDeps.forEach(dep => {
        if (!byTarget[dep.toProject]) {
          byTarget[dep.toProject] = [];
        }
        byTarget[dep.toProject].push(dep);
      });

      for (const [target, deps] of Object.entries(byTarget)) {
        console.log(`\n    Referenced project: "${target}"`);
        deps.slice(0, 5).forEach(dep => {
          console.log(`      - [${dep.fromProject}] "${dep.fromTask}"`);
        });
        if (deps.length > 5) {
          console.log(`      ... and ${deps.length - 5} more references`);
        }
      }
    }

    if (blockerDeps.length === 0 && refDeps.length === 0) {
      console.log('No explicit task-level cross-project dependencies found');
    }

    // =========================================================================
    // SECTION 5: LOGICAL INCONSISTENCIES
    // =========================================================================
    console.log('\n' + '='.repeat(80));
    console.log('SECTION 5: LOGICAL INCONSISTENCIES');
    console.log('='.repeat(80));

    let hasIssues = false;

    // Check each project for phase ordering issues
    console.log('\n### Phase Ordering Issues:');
    for (const { project, tasks: projectTasks } of projectSummaries) {
      if (projectTasks.length === 0) continue;

      const issues = detectPhaseIssues(projectTasks);
      if (issues.length > 0) {
        hasIssues = true;
        console.log(`\n[${project.title}]`);
        issues.forEach(issue => {
          console.log(`  Issue: ${issue.message}`);
          if (issue.completedTasks) {
            console.log(`    Completed in later phase: ${issue.completedTasks.slice(0, 3).join(', ')}`);
          }
          if (issue.notStartedTasks) {
            console.log(`    Not started in earlier phase: ${issue.notStartedTasks.slice(0, 3).join(', ')}`);
          }
        });
      }
    }

    // Check for blocked tasks without blockers specified
    console.log('\n### Blocked Tasks Without Blockers:');
    const blockedNoReason = tasks.filter(t =>
      t.status === 'blocked' &&
      (!t.blocked_by || t.blocked_by.length === 0)
    );

    if (blockedNoReason.length > 0) {
      hasIssues = true;
      blockedNoReason.forEach(task => {
        const project = projectMap[task.project_id];
        console.log(`  [${project?.title || 'Unknown'}] "${task.title}" is blocked but has no blockers specified`);
      });
    } else {
      console.log('  None found');
    }

    // Check for completed dependencies of incomplete tasks
    console.log('\n### Task Dependencies Issues:');
    // Fetch task dependencies
    const taskDependencies = await supabaseQuery('task_dependencies', {
      select: '*'
    }).catch(() => []);

    if (taskDependencies.length > 0) {
      const taskMap = {};
      tasks.forEach(t => taskMap[t.id] = t);

      const issues = [];
      taskDependencies.forEach(dep => {
        const task = taskMap[dep.task_id];
        const dependsOn = taskMap[dep.depends_on_task_id];

        if (task && dependsOn) {
          // Check if dependent task is in progress/completed but dependency is not completed
          if ((task.status === 'in_progress' || task.status === 'completed') &&
              dependsOn.status !== 'completed') {
            issues.push({
              task: task.title,
              taskStatus: task.status,
              dependency: dependsOn.title,
              dependencyStatus: dependsOn.status,
              project: projectMap[task.project_id]?.title
            });
          }
        }
      });

      if (issues.length > 0) {
        hasIssues = true;
        issues.forEach(issue => {
          console.log(`  [${issue.project}] "${issue.task}" (${issue.taskStatus}) depends on`);
          console.log(`    "${issue.dependency}" which is ${issue.dependencyStatus}`);
        });
      } else {
        console.log('  No dependency issues found');
      }
    } else {
      console.log('  No task dependencies defined in the system');
    }

    // Check for high priority tasks that are not started
    console.log('\n### High Priority Tasks Not Started:');
    const highPriorityNotStarted = tasks.filter(t =>
      (t.priority === 'critical' || t.priority === 'high') &&
      t.status === 'not_started'
    );

    if (highPriorityNotStarted.length > 0) {
      highPriorityNotStarted.slice(0, 10).forEach(task => {
        const project = projectMap[task.project_id];
        console.log(`  [${project?.title || 'Unknown'}] "${task.title}" (${task.priority})`);
      });
      if (highPriorityNotStarted.length > 10) {
        console.log(`  ... and ${highPriorityNotStarted.length - 10} more`);
      }
    } else {
      console.log('  None found');
    }

    // Check for overdue tasks
    console.log('\n### Overdue Tasks (past due date):');
    const today = new Date();
    const overdueTasks = tasks.filter(t => {
      if (!t.due_date || t.status === 'completed' || t.status === 'cancelled') return false;
      return new Date(t.due_date) < today;
    });

    if (overdueTasks.length > 0) {
      hasIssues = true;
      overdueTasks.slice(0, 10).forEach(task => {
        const project = projectMap[task.project_id];
        const daysOverdue = Math.floor((today - new Date(task.due_date)) / (1000 * 60 * 60 * 24));
        console.log(`  [${project?.title || 'Unknown'}] "${task.title}"`);
        console.log(`    Due: ${task.due_date}, ${daysOverdue} days overdue, Status: ${task.status}`);
      });
      if (overdueTasks.length > 10) {
        console.log(`  ... and ${overdueTasks.length - 10} more`);
      }
    } else {
      console.log('  None found');
    }

    // Check for foundational/critical path tasks not started
    console.log('\n### Foundational/Critical Path Tasks Not Started:');
    const foundationalNotStarted = tasks.filter(t =>
      (t.is_foundational || t.is_critical_path) &&
      t.status === 'not_started'
    );

    if (foundationalNotStarted.length > 0) {
      foundationalNotStarted.slice(0, 10).forEach(task => {
        const project = projectMap[task.project_id];
        const flags = [];
        if (task.is_foundational) flags.push('foundational');
        if (task.is_critical_path) flags.push('critical path');
        console.log(`  [${project?.title || 'Unknown'}] "${task.title}" (${flags.join(', ')})`);
      });
      if (foundationalNotStarted.length > 10) {
        console.log(`  ... and ${foundationalNotStarted.length - 10} more`);
      }
    } else {
      console.log('  None found');
    }

    if (!hasIssues) {
      console.log('\nNo significant logical inconsistencies detected.');
    }

    // =========================================================================
    // SECTION 6: RECOMMENDATIONS
    // =========================================================================
    console.log('\n' + '='.repeat(80));
    console.log('SECTION 6: RECOMMENDATIONS');
    console.log('='.repeat(80));

    console.log('\n### Based on the analysis:');

    if (duplicates.length > 0) {
      console.log(`\n1. Review ${duplicates.length} potential duplicate tasks for consolidation`);
    }

    if (blockedNoReason.length > 0) {
      console.log(`\n2. Add blockers to ${blockedNoReason.length} blocked tasks without specified reasons`);
    }

    if (highPriorityNotStarted.length > 0) {
      console.log(`\n3. Consider prioritizing ${highPriorityNotStarted.length} high/critical priority tasks that haven't started`);
    }

    if (foundationalNotStarted.length > 0) {
      console.log(`\n4. Start ${foundationalNotStarted.length} foundational/critical path tasks to unblock dependent work`);
    }

    if (overdueTasks.length > 0) {
      console.log(`\n5. Address ${overdueTasks.length} overdue tasks - update due dates or priorities`);
    }

    // Key integration points
    console.log('\n### Key Integration Points to Watch:');
    const integrationProjects = projects.filter(p =>
      p.title.toLowerCase().includes('integration') ||
      p.title.toLowerCase().includes('protocol') ||
      p.title.toLowerCase().includes('unified') ||
      p.title.toLowerCase().includes('data layer')
    );

    if (integrationProjects.length > 0) {
      integrationProjects.forEach(p => {
        const pTasks = tasksByProject[p.id] || [];
        const completed = pTasks.filter(t => t.status === 'completed').length;
        console.log(`  - "${p.title}": ${completed}/${pTasks.length} tasks completed (${p.status})`);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('END OF ANALYSIS');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('Error during analysis:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the analysis
analyzeAllTasks();
