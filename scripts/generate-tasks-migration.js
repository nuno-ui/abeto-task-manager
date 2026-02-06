/**
 * Script to generate SQL migration from static task data
 * Reads subtasks-coo.ts from API Dashboard and generates INSERT statements for Supabase
 */

const fs = require('fs');
const path = require('path');

// Read the subtasks file
const subtasksPath = path.join(__dirname, '../../abeto-api-dashboard/src/lib/subtasks-coo.ts');
const apiPath = path.join(__dirname, '../../abeto-api-dashboard/src/lib/api.ts');

console.log('Reading subtasks from:', subtasksPath);

// We need to parse the TypeScript file and extract the task data
// Since it's a complex structure, we'll use a different approach:
// Execute the TS code in a sandbox to get the actual data

const subtasksContent = fs.readFileSync(subtasksPath, 'utf8');

// Convert TypeScript to JavaScript by removing type annotations
let jsContent = subtasksContent
  // Remove imports
  .replace(/import.*from.*['"].*['"];?\n?/g, '')
  // Remove TypeScript type annotations in function parameters
  .replace(/function createTask\(\s*id: string,\s*title: string,\s*phase: SubTask\['phase'\],\s*owner: string,\s*data: Partial<SubTask>\s*\): SubTask/g,
           'function createTask(id, title, phase, owner, data)')
  // Remove return type annotations
  .replace(/: ProjectSubTasks\[\]/g, '')
  // Make it a module that exports the data
  .replace('export function getProjectSubTasksCOO()', 'module.exports = function getProjectSubTasksCOO()');

// Write temp JS file
const tempFile = path.join(__dirname, '_temp_subtasks.js');
fs.writeFileSync(tempFile, jsContent);

// Execute and get the data
const getProjectSubTasksCOO = require(tempFile);
const projectSubTasks = getProjectSubTasksCOO();

// Clean up temp file
fs.unlinkSync(tempFile);

console.log(`Found ${projectSubTasks.length} projects with tasks`);

// Get project IDs from database - we need to map slug to UUID
// For now, we'll use the slug as the lookup key

// Phase mapping (static data uses capitalized, DB uses lowercase)
const phaseMap = {
  'Discovery': 'discovery',
  'Planning': 'planning',
  'Development': 'development',
  'Testing': 'testing',
  'Training': 'training',
  'Rollout': 'rollout',
  'Monitoring': 'monitoring',
};

// Status mapping
const statusMap = {
  'Not Started': 'not_started',
  'In Progress': 'in_progress',
  'Blocked': 'blocked',
  'Done': 'completed',
};

// Difficulty mapping
const difficultyMap = {
  'Easy': 'easy',
  'Medium': 'medium',
  'Hard': 'hard',
};

// AI Potential mapping
const aiPotentialMap = {
  'High': 'high',
  'Medium': 'medium',
  'Low': 'low',
  'None': 'none',
};

// Escape SQL string
function sqlEscape(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + String(str).replace(/'/g, "''") + "'";
}

// Convert array to PostgreSQL array literal
function sqlArray(arr) {
  if (!arr || arr.length === 0) return 'ARRAY[]::TEXT[]';
  return 'ARRAY[' + arr.map(sqlEscape).join(', ') + ']';
}

// Generate SQL
let sql = `-- =============================================================================
-- TASK DATA MIGRATION
-- Generated from abeto-api-dashboard/src/lib/subtasks-coo.ts
-- This migrates all static task data to Supabase
-- Run this in Supabase SQL Editor
-- =============================================================================

-- First, clear existing tasks (optional - comment out if you want to keep existing tasks)
-- DELETE FROM tasks;

-- Then insert all tasks
DO $$
DECLARE
    project_record RECORD;
    task_order INTEGER;
    existing_task_count INTEGER;
BEGIN

`;

let totalTasks = 0;

for (const project of projectSubTasks) {
  const projectId = project.projectId;
  const tasks = project.subTasks;

  console.log(`Processing ${projectId}: ${tasks.length} tasks`);
  totalTasks += tasks.length;

  sql += `    -- =========================================================================\n`;
  sql += `    -- ${projectId.toUpperCase().replace(/-/g, ' ')}\n`;
  sql += `    -- =========================================================================\n`;
  sql += `    SELECT id INTO project_record FROM projects WHERE slug = '${projectId}';\n`;
  sql += `    IF project_record.id IS NOT NULL THEN\n`;
  sql += `        -- Check if project already has tasks\n`;
  sql += `        SELECT COUNT(*) INTO existing_task_count FROM tasks WHERE project_id = project_record.id;\n`;
  sql += `        IF existing_task_count = 0 THEN\n`;
  sql += `            task_order := 0;\n\n`;

  for (const task of tasks) {
    const phase = phaseMap[task.phase] || 'development';
    const status = statusMap[task.status] || 'not_started';
    const difficulty = difficultyMap[task.difficulty] || 'medium';
    const aiPotential = task.aiPotential ? aiPotentialMap[task.aiPotential] : null;

    sql += `        -- Task: ${task.title}\n`;
    sql += `        INSERT INTO tasks (\n`;
    sql += `            project_id, title, description, phase, status, difficulty,\n`;
    sql += `            estimated_hours, ai_potential, ai_assist_description,\n`;
    sql += `            tools_needed, knowledge_areas, acceptance_criteria,\n`;
    sql += `            success_metrics, risks, is_foundational, is_critical_path, order_index\n`;
    sql += `        ) VALUES (\n`;
    sql += `            project_record.id,\n`;
    sql += `            ${sqlEscape(task.title)},\n`;
    sql += `            ${sqlEscape(task.description)},\n`;
    sql += `            '${phase}',\n`;
    sql += `            '${status}',\n`;
    sql += `            '${difficulty}',\n`;
    sql += `            ${sqlEscape(task.estimatedHours)},\n`;
    sql += `            ${aiPotential ? "'" + aiPotential + "'" : 'NULL'},\n`;
    sql += `            ${sqlEscape(task.aiAssistDescription)},\n`;
    sql += `            ${sqlArray(task.toolsNeeded)},\n`;
    sql += `            ${sqlArray(task.knowledgeAreas)},\n`;
    sql += `            ${sqlArray(task.acceptanceCriteria)},\n`;
    sql += `            ${sqlArray(task.successMetrics || [])},\n`;
    sql += `            ${sqlArray(task.risks || [])},\n`;
    sql += `            ${task.isFoundational ? 'TRUE' : 'FALSE'},\n`;
    sql += `            ${project.criticalPath?.includes(task.id) ? 'TRUE' : 'FALSE'},\n`;
    sql += `            task_order\n`;
    sql += `        ) ON CONFLICT DO NOTHING;\n`;
    sql += `        task_order := task_order + 1;\n\n`;
  }

  sql += `        ELSE\n`;
  sql += `            RAISE NOTICE 'Skipping ${projectId} - already has % tasks', existing_task_count;\n`;
  sql += `        END IF;\n`;
  sql += `    END IF;\n\n`;
}

sql += `END $$;\n\n`;
sql += `-- Summary: ${totalTasks} tasks across ${projectSubTasks.length} projects\n`;

// Write the SQL file
const outputPath = path.join(__dirname, 'migrate-tasks-data.sql');
fs.writeFileSync(outputPath, sql);

console.log(`\nGenerated SQL migration: ${outputPath}`);
console.log(`Total tasks: ${totalTasks}`);
console.log(`Total projects: ${projectSubTasks.length}`);
