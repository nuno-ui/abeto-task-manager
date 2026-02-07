// Script to add project and task dependencies
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pyxjwtyvmbltscayabsj.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addDependencies() {
  console.log('='.repeat(80));
  console.log('ADDING PROJECT DEPENDENCIES');
  console.log('='.repeat(80));

  // Get all projects
  const { data: projects, error: projError } = await supabase
    .from('projects')
    .select('id, title, slug');

  if (projError) {
    console.error('Error fetching projects:', projError);
    return;
  }

  const projectBySlug = {};
  projects.forEach(p => {
    projectBySlug[p.slug] = p;
  });

  // Infrastructure project IDs
  const infraProjects = {
    agentComm: projectBySlug['agent-communication-protocol'],
    dataLayer: projectBySlug['unified-data-layer'],
    quoteApi: projectBySlug['unified-quote-api'],
    cortex: projectBySlug['ai-cortex']
  };

  console.log('\nInfrastructure projects:');
  Object.entries(infraProjects).forEach(([key, p]) => {
    if (p) {
      console.log(`  ${key}: ${p.title} (${p.id})`);
    } else {
      console.log(`  ${key}: NOT FOUND`);
    }
  });

  // ================================================================
  // PROJECT DEPENDENCIES TO ADD
  // ================================================================

  const projectDependencies = [];

  // Agent projects depend on Agent Communication Protocol
  const agentProjectSlugs = [
    'ai-agent-factory',
    'ai-voice-agent-inbound',
    'competitor-intel-agent',
    'ai-customer-success-agent',
    'internal-ops-agent-suite'
  ];

  agentProjectSlugs.forEach(slug => {
    const project = projectBySlug[slug];
    if (project && infraProjects.agentComm) {
      projectDependencies.push({
        project_id: project.id,
        depends_on_project_id: infraProjects.agentComm.id,
        dependency_type: 'blocks'
      });
    }
  });

  // Data/Dashboard projects depend on Unified Data Layer
  const dataProjectSlugs = [
    'answer-rate-monitoring',
    'sdr-portal',
    'admin-hr-automation-suite',
    'pan-european-expansion-engine',
    'reporting-hub',
    'campaign-os',
    'installer-performance-tracking',
    'data-quality-monitor',
    'investor-portal'
  ];

  dataProjectSlugs.forEach(slug => {
    const project = projectBySlug[slug];
    if (project && infraProjects.dataLayer) {
      projectDependencies.push({
        project_id: project.id,
        depends_on_project_id: infraProjects.dataLayer.id,
        dependency_type: 'blocks'
      });
    }
  });

  // Quote/Pricing projects depend on Unified Quote API
  const quoteProjectSlugs = [
    'installer-portal-product',
    'dynamic-pricing-engine',
    'installer-quote-sync',
    'product-diversification-platform'
  ];

  quoteProjectSlugs.forEach(slug => {
    const project = projectBySlug[slug];
    if (project && infraProjects.quoteApi) {
      projectDependencies.push({
        project_id: project.id,
        depends_on_project_id: infraProjects.quoteApi.id,
        dependency_type: 'blocks'
      });
    }
  });

  // AI-heavy projects depend on AI Cortex
  const aiProjectSlugs = [
    'ai-agent-factory',
    'ai-voice-agent-inbound',
    'ai-customer-success-agent',
    'ai-omnichannel-chatbot-platform',
    'intelligent-document-processing',
    'contact-prioritization-engine',
    'dynamic-allocation-engine'
  ];

  aiProjectSlugs.forEach(slug => {
    const project = projectBySlug[slug];
    if (project && infraProjects.cortex) {
      projectDependencies.push({
        project_id: project.id,
        depends_on_project_id: infraProjects.cortex.id,
        dependency_type: 'enables' // Cortex enables but doesn't strictly block
      });
    }
  });

  // Cortex depends on Agent Communication Protocol
  if (infraProjects.cortex && infraProjects.agentComm) {
    projectDependencies.push({
      project_id: infraProjects.cortex.id,
      depends_on_project_id: infraProjects.agentComm.id,
      dependency_type: 'blocks'
    });
  }

  // Cortex depends on Unified Data Layer
  if (infraProjects.cortex && infraProjects.dataLayer) {
    projectDependencies.push({
      project_id: infraProjects.cortex.id,
      depends_on_project_id: infraProjects.dataLayer.id,
      dependency_type: 'blocks'
    });
  }

  console.log(`\n\nAdding ${projectDependencies.length} project dependencies...`);

  // Insert project dependencies
  let addedCount = 0;
  let skipCount = 0;

  for (const dep of projectDependencies) {
    const { error } = await supabase
      .from('project_dependencies')
      .upsert(dep, { onConflict: 'project_id,depends_on_project_id' });

    if (error) {
      if (error.code === '23505') { // Duplicate
        skipCount++;
      } else {
        console.log(`  Error: ${error.message}`);
      }
    } else {
      addedCount++;
      const proj = projects.find(p => p.id === dep.project_id);
      const depProj = projects.find(p => p.id === dep.depends_on_project_id);
      console.log(`  ✓ ${proj?.title} → depends on → ${depProj?.title} (${dep.dependency_type})`);
    }
  }

  console.log(`\nAdded: ${addedCount}, Skipped (already exist): ${skipCount}`);

  // ================================================================
  // VERIFY PROJECT EXECUTION ORDER
  // ================================================================
  console.log('\n' + '='.repeat(80));
  console.log('PROJECT EXECUTION ORDER (based on dependencies)');
  console.log('='.repeat(80));

  // Get all dependencies
  const { data: allDeps } = await supabase
    .from('project_dependencies')
    .select(`
      project_id,
      depends_on_project_id,
      dependency_type,
      project:projects!project_dependencies_project_id_fkey(title),
      depends_on:projects!project_dependencies_depends_on_project_id_fkey(title)
    `);

  // Build dependency graph
  const dependsOn = {};
  const dependedOnBy = {};

  allDeps?.forEach(d => {
    if (!dependsOn[d.project_id]) dependsOn[d.project_id] = [];
    if (!dependedOnBy[d.depends_on_project_id]) dependedOnBy[d.depends_on_project_id] = [];

    dependsOn[d.project_id].push(d.depends_on_project_id);
    dependedOnBy[d.depends_on_project_id].push(d.project_id);
  });

  // Projects with no dependencies (should start first)
  const tier0 = projects.filter(p => !dependsOn[p.id] || dependsOn[p.id].length === 0);
  const infraIds = Object.values(infraProjects).filter(p => p).map(p => p.id);

  console.log('\n🏗️  TIER 0 - Foundation (start first):');
  tier0.filter(p => infraIds.includes(p.id)).forEach(p => {
    const dependents = dependedOnBy[p.id]?.length || 0;
    console.log(`  - ${p.title} (${dependents} projects depend on this)`);
  });

  console.log('\n📊 TIER 1 - After foundations complete:');
  projects.filter(p => {
    const deps = dependsOn[p.id] || [];
    return deps.length > 0 && deps.every(d => infraIds.includes(d));
  }).slice(0, 10).forEach(p => {
    const deps = dependsOn[p.id]?.map(d => projects.find(x => x.id === d)?.title).join(', ');
    console.log(`  - ${p.title} (depends on: ${deps})`);
  });

  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));

  console.log(`
✅ Added ${addedCount} project dependencies
📊 Total projects: ${projects.length}
🔗 Total dependencies: ${allDeps?.length || 0}

RECOMMENDED EXECUTION ORDER:
1. Agent Communication Protocol
2. Unified Data Layer
3. Unified Quote API
4. AI Cortex (depends on 1 & 2)
5. All other projects (based on their dependencies)
`);
}

addDependencies().catch(console.error);
