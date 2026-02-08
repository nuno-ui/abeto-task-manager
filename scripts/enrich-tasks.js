// Script to enrich tasks with acceptance criteria based on their context
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://pyxjwtyvmbltscayabsj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5eGp3dHl2bWJsdHNjYXlhYnNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIzMjAzOSwiZXhwIjoyMDg1ODA4MDM5fQ.4CO0_gKZQrmKWolIzcb-vuGmKNQAdLVKjIwRXTbd0JQ';

// Read tasks to update
const tasksPath = path.join(__dirname, 'tasks-to-update.json');
const tasksToUpdate = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));

// Acceptance criteria templates based on task type/keywords
function generateAcceptanceCriteria(task) {
  const title = task.title.toLowerCase();
  const criteria = [];

  // Phase-based criteria
  if (title.includes('testing') || title.includes('test')) {
    criteria.push('All test cases documented and reviewed');
    criteria.push('Unit test coverage > 80%');
    criteria.push('Integration tests passing');
    criteria.push('No critical bugs remaining');
    criteria.push('Performance benchmarks met');
  } else if (title.includes('training') || title.includes('pilot')) {
    criteria.push('Training materials prepared');
    criteria.push('All participants trained');
    criteria.push('Feedback collected and documented');
    criteria.push('Post-training assessment completed');
    criteria.push('Go-live readiness confirmed');
  } else if (title.includes('integration')) {
    criteria.push('API connection established');
    criteria.push('Data sync working correctly');
    criteria.push('Error handling implemented');
    criteria.push('Monitoring configured');
    criteria.push('Documentation updated');
  } else if (title.includes('design') || title.includes('architecture')) {
    criteria.push('Design document completed');
    criteria.push('Technical review approved');
    criteria.push('Security considerations addressed');
    criteria.push('Scalability plan documented');
    criteria.push('Stakeholder sign-off obtained');
  } else if (title.includes('analysis') || title.includes('mapping') || title.includes('discovery')) {
    criteria.push('Requirements documented');
    criteria.push('Current state analyzed');
    criteria.push('Gap analysis completed');
    criteria.push('Recommendations prioritized');
    criteria.push('Stakeholder validation obtained');
  } else if (title.includes('portal') || title.includes('dashboard')) {
    criteria.push('UI/UX design approved');
    criteria.push('Core features implemented');
    criteria.push('Responsive design verified');
    criteria.push('Accessibility standards met');
    criteria.push('User acceptance testing passed');
  } else if (title.includes('engine') || title.includes('system') || title.includes('api')) {
    criteria.push('Core logic implemented');
    criteria.push('Edge cases handled');
    criteria.push('Performance optimized');
    criteria.push('Security review passed');
    criteria.push('Integration tests green');
  } else if (title.includes('supplier') || title.includes('procurement')) {
    criteria.push('Vendor requirements defined');
    criteria.push('Integration specs documented');
    criteria.push('Security requirements met');
    criteria.push('SLA terms agreed');
    criteria.push('Pilot vendor onboarded');
  } else if (title.includes('protocol') || title.includes('registry') || title.includes('queue')) {
    criteria.push('Protocol specification complete');
    criteria.push('Reference implementation working');
    criteria.push('Performance benchmarks met');
    criteria.push('Documentation and examples ready');
    criteria.push('Integration guide published');
  } else if (title.includes('rollout') || title.includes('deployment') || title.includes('launch')) {
    criteria.push('Staging deployment validated');
    criteria.push('Rollback plan tested');
    criteria.push('Monitoring configured');
    criteria.push('Stakeholders notified');
    criteria.push('Post-launch verification complete');
  } else {
    // Default criteria
    criteria.push('Requirements fully addressed');
    criteria.push('Code reviewed and approved');
    criteria.push('Tests passing');
    criteria.push('Documentation updated');
    criteria.push('Stakeholder acceptance obtained');
  }

  return criteria;
}

// Enrich description if too short
function enrichDescription(task) {
  if (task.currentDescription && task.currentDescription !== 'NO DESCRIPTION' && task.currentDescription.length >= 30) {
    return null; // No update needed
  }

  const title = task.title;

  // Generate description based on title
  const descriptions = {
    'Pilot with 3 Teams': 'Execute pilot program with 3 internal teams to validate functionality, gather feedback, and identify issues before broader rollout. Track adoption metrics, user satisfaction, and system performance during pilot period.',
    'Gradual Rollout': 'Phase the system rollout across all teams, starting with early adopters and expanding based on pilot learnings. Monitor adoption rates, provide support, and adjust based on feedback.',
    'Supplier Portal': 'Build a dedicated portal for suppliers to manage their profiles, view orders, submit quotes, and track payments. Enable self-service capabilities to reduce manual coordination overhead.',
    'Finance Team Training - Accounting &': 'Comprehensive training program for the finance team on new accounting automation tools. Includes hands-on workshops, documentation, and assessment to ensure proficient usage.',
    'Procurement Team Training': 'Training program for procurement team on new supplier management and ordering systems. Covers workflows, best practices, and troubleshooting for daily operations.',
    'Pilot Launch - AI Voice': 'Launch pilot of AI voice agent with select customers to validate conversation quality, intent recognition, and handoff processes. Measure customer satisfaction and call resolution rates.',
    'Team Training - Intelligent Document': 'Train relevant teams on the intelligent document processing system. Cover document upload, verification workflows, and exception handling procedures.',
    'Pilot Launch - Loan Integration': 'Pilot the loan integration with select financing partners. Validate API connectivity, application flow, and approval processes with real transactions.',
    'Design Agent Communication Protocol': 'Design the core protocol specification for agent-to-agent communication. Define message formats, routing rules, authentication, and error handling mechanisms for reliable inter-agent collaboration.',
    'Build Agent Registry Service': 'Implement a central registry where agents can register their capabilities, discover other agents, and query available services. Enable dynamic agent orchestration.',
    'Implement Context Sharing API': 'Build the API layer that enables agents to share context, state, and artifacts. Support secure context handoff between agents during workflow execution.',
    'Create Message Queue System': 'Implement the message queue infrastructure for reliable, ordered message delivery between agents. Support both synchronous and asynchronous communication patterns.',
    'Build Agent Observability Layer': 'Create comprehensive observability for agent interactions including tracing, logging, and metrics. Enable debugging and performance analysis of multi-agent workflows.',
    'Implement Agent Discovery Protocol': 'Build the protocol that allows agents to dynamically discover and connect with other agents based on capabilities and requirements. Support service mesh patterns.',
    'Integration Testing - Procurement &': 'Test all procurement integrations with supplier systems and internal tools. Validate data flows, error handling, and performance under load.',
    'Integration Testing - Community &': 'Test community platform integrations including authentication, notifications, and data sync. Validate user workflows end-to-end.'
  };

  return descriptions[title] || null;
}

async function updateTask(taskId, updates) {
  const response = await fetch(
    SUPABASE_URL + '/rest/v1/tasks?id=eq.' + taskId,
    {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(updates)
    }
  );

  if (!response.ok) {
    const error = await response.text();
    return { success: false, error: error };
  }

  return { success: true };
}

async function main() {
  console.log('Starting task enrichment...\n');
  console.log('Total tasks to process: ' + tasksToUpdate.length + '\n');

  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (let i = 0; i < tasksToUpdate.length; i++) {
    const task = tasksToUpdate[i];
    const updates = {};

    // Check if needs acceptance criteria
    if (task.issues.includes('MISSING: acceptance_criteria')) {
      updates.acceptance_criteria = generateAcceptanceCriteria(task);
    }

    // Check if needs description enhancement
    if (task.issues.includes('WEAK: description too short') || task.issues.includes('MISSING: description')) {
      const newDesc = enrichDescription(task);
      if (newDesc) {
        updates.description = newDesc;
      }
    }

    if (Object.keys(updates).length === 0) {
      skipCount++;
      continue;
    }

    console.log('[' + (i + 1) + '/' + tasksToUpdate.length + '] Updating: ' + task.title.substring(0, 40) + '...');

    const result = await updateTask(task.id, updates);

    if (result.success) {
      console.log('  Updated (' + Object.keys(updates).join(', ') + ')');
      successCount++;
    } else {
      console.log('  Failed: ' + result.error);
      failCount++;
    }

    // Small delay
    await new Promise(function(r) { setTimeout(r, 50); });
  }

  console.log('\nSummary:');
  console.log('   Successfully updated: ' + successCount + ' tasks');
  console.log('   Skipped: ' + skipCount + ' tasks');
  console.log('   Failed: ' + failCount + ' tasks');
}

main().catch(console.error);
