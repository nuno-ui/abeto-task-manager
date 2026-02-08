// Script to analyze all projects and identify gaps
const fs = require('fs');

// Read the projects data
const projectsData = fs.readFileSync('C:\\Users\\nunog\\.claude\\projects\\C--Users-nunog-Projects\\39caf157-3fea-48fc-ab35-e63a640afc76\\tool-results\\toolu_01XfGUkBCwYYvK2tALkkED1p.txt', 'utf8');
const projects = JSON.parse(projectsData);

console.log(`Total projects: ${projects.length}\n`);

// Analyze each project
const issues = [];
const projectAnalysis = [];

projects.forEach((p, index) => {
  const projectIssues = [];

  // Check for missing critical fields
  if (!p.why_it_matters || p.why_it_matters === null || p.why_it_matters === '') {
    projectIssues.push('MISSING: why_it_matters');
  }

  if (!p.description || p.description.length < 50) {
    projectIssues.push('WEAK: description too short');
  }

  if (!p.problem_statement || p.problem_statement === null) {
    projectIssues.push('MISSING: problem_statement');
  }

  if (!p.deliverables || p.deliverables.length === 0) {
    projectIssues.push('MISSING: deliverables');
  }

  if (!p.human_role_before || p.human_role_before === null) {
    projectIssues.push('MISSING: human_role_before');
  }

  if (!p.human_role_after || p.human_role_after === null) {
    projectIssues.push('MISSING: human_role_after');
  }

  if (!p.who_is_empowered || p.who_is_empowered.length === 0) {
    projectIssues.push('MISSING: who_is_empowered');
  }

  if (!p.data_required || p.data_required.length === 0) {
    projectIssues.push('MISSING: data_required');
  }

  if (!p.data_generates || p.data_generates.length === 0) {
    projectIssues.push('MISSING: data_generates');
  }

  // Check vision_alignment
  if (!p.vision_alignment || p.vision_alignment === null) {
    projectIssues.push('MISSING: vision_alignment');
  }

  // Check agent fields
  if (!p.agent_role || p.agent_role === null) {
    projectIssues.push('MISSING: agent_role');
  }

  if (!p.agent_data_moat || p.agent_data_moat === null) {
    projectIssues.push('MISSING: agent_data_moat');
  }

  if (p.agent_can_be_agent === null || p.agent_can_be_agent === undefined) {
    projectIssues.push('MISSING: agent_can_be_agent');
  }

  if (p.agent_generates_proprietary_data === null || p.agent_generates_proprietary_data === undefined) {
    projectIssues.push('MISSING: agent_generates_proprietary_data');
  }

  // Check estimated hours
  if (!p.estimated_hours_min || !p.estimated_hours_max) {
    projectIssues.push('MISSING: estimated_hours');
  }

  if (projectIssues.length > 0) {
    projectAnalysis.push({
      id: p.id,
      title: p.title,
      status: p.status,
      priority: p.priority,
      issueCount: projectIssues.length,
      issues: projectIssues,
      currentDescription: p.description ? p.description.substring(0, 100) + '...' : 'NO DESCRIPTION',
      hasWhyItMatters: !!p.why_it_matters,
      hasProblemStatement: !!p.problem_statement,
      visionAlignment: p.vision_alignment
    });
  }
});

// Sort by issue count (most issues first)
projectAnalysis.sort((a, b) => b.issueCount - a.issueCount);

console.log('=== PROJECTS WITH ISSUES ===\n');
projectAnalysis.forEach((p, i) => {
  console.log(`${i+1}. ${p.title} (${p.status}, ${p.priority})`);
  console.log(`   ID: ${p.id}`);
  console.log(`   Issues (${p.issueCount}):`);
  p.issues.forEach(issue => {
    console.log(`   - ${issue}`);
  });
  console.log(`   Vision Alignment: ${p.visionAlignment || 'NOT SET'}`);
  console.log('');
});

console.log('\n=== SUMMARY ===');
console.log(`Total projects: ${projects.length}`);
console.log(`Projects with issues: ${projectAnalysis.length}`);
console.log(`Projects without issues: ${projects.length - projectAnalysis.length}`);

// Count by issue type
const issueCounts = {};
projectAnalysis.forEach(p => {
  p.issues.forEach(issue => {
    issueCounts[issue] = (issueCounts[issue] || 0) + 1;
  });
});

console.log('\nIssue breakdown:');
Object.entries(issueCounts).sort((a, b) => b[1] - a[1]).forEach(([issue, count]) => {
  console.log(`  ${issue}: ${count} projects`);
});

// Export projects that need updates
const toUpdate = projectAnalysis.map(p => ({
  id: p.id,
  title: p.title,
  issues: p.issues
}));

fs.writeFileSync('C:\\Users\\nunog\\Projects\\abeto-task-manager\\scripts\\projects-to-update.json', JSON.stringify(toUpdate, null, 2));
console.log('\nProjects to update exported to projects-to-update.json');
