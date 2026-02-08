const fs = require('fs');
const path = require('path');

const tasksPath = path.join(__dirname, 'all-tasks.json');
const tasksData = fs.readFileSync(tasksPath, 'utf8');
const tasks = JSON.parse(tasksData);

console.log("Total tasks: " + tasks.length + "\n");

const taskAnalysis = [];

tasks.forEach((t) => {
  const taskIssues = [];

  if (!t.description || t.description === null || t.description === '') {
    taskIssues.push('MISSING: description');
  } else if (t.description.length < 30) {
    taskIssues.push('WEAK: description too short');
  }

  if (!t.acceptance_criteria || t.acceptance_criteria === null || t.acceptance_criteria.length === 0) {
    taskIssues.push('MISSING: acceptance_criteria');
  }

  if (!t.priority || t.priority === null) {
    taskIssues.push('MISSING: priority');
  }

  if (!t.estimated_hours || t.estimated_hours === null) {
    taskIssues.push('MISSING: estimated_hours');
  }

  if (taskIssues.length > 0) {
    taskAnalysis.push({
      id: t.id,
      title: t.title,
      project_id: t.project_id,
      status: t.status,
      priority: t.priority,
      issueCount: taskIssues.length,
      issues: taskIssues,
      currentDescription: t.description ? t.description.substring(0, 80) : 'NO DESCRIPTION'
    });
  }
});

taskAnalysis.sort((a, b) => b.issueCount - a.issueCount);

console.log('=== TASKS WITH ISSUES (first 30) ===\n');
taskAnalysis.slice(0, 30).forEach((t, i) => {
  console.log((i+1) + ". " + t.title);
  console.log("   Issues: " + t.issues.join(", "));
  console.log("");
});

console.log('\n=== SUMMARY ===');
console.log("Total tasks: " + tasks.length);
console.log("Tasks with issues: " + taskAnalysis.length);
console.log("Tasks OK: " + (tasks.length - taskAnalysis.length));

const issueCounts = {};
taskAnalysis.forEach(t => {
  t.issues.forEach(issue => {
    issueCounts[issue] = (issueCounts[issue] || 0) + 1;
  });
});

console.log('\nIssue breakdown:');
Object.entries(issueCounts).sort((a, b) => b[1] - a[1]).forEach(([issue, count]) => {
  console.log("  " + issue + ": " + count);
});

const outputPath = path.join(__dirname, 'tasks-to-update.json');
fs.writeFileSync(outputPath, JSON.stringify(taskAnalysis, null, 2));
console.log('\nExported to tasks-to-update.json');
