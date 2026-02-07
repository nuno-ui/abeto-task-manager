// Script to run the seed-empty-projects-tasks.sql migration
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://pyxjwtyvmbltscayabsj.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  const sqlFile = path.join(__dirname, '..', 'supabase', 'seed-empty-projects-tasks.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');

  // Split by semicolons but keep statements together
  // We need to be careful with semicolons inside strings
  const statements = [];
  let currentStatement = '';
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const prevChar = i > 0 ? sql[i-1] : '';

    if ((char === "'" || char === '"') && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
    }

    currentStatement += char;

    if (char === ';' && !inString) {
      const trimmed = currentStatement.trim();
      if (trimmed && !trimmed.startsWith('--')) {
        statements.push(trimmed);
      }
      currentStatement = '';
    }
  }

  console.log(`Found ${statements.length} SQL statements`);

  // Execute each INSERT statement
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];

    // Skip comments and empty statements
    if (!stmt || stmt.startsWith('--')) continue;

    // Skip ALTER TABLE statements (RLS) for now - we'll handle differently
    if (stmt.toLowerCase().includes('alter table')) {
      console.log(`Skipping: ${stmt.substring(0, 50)}...`);
      continue;
    }

    // Skip SELECT statements (verification)
    if (stmt.toLowerCase().startsWith('select')) {
      console.log(`Skipping verification query`);
      continue;
    }

    console.log(`Executing statement ${i + 1}/${statements.length}: ${stmt.substring(0, 60)}...`);

    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql: stmt });
      if (error) {
        console.error(`Error: ${error.message}`);
      } else {
        console.log(`Success!`);
      }
    } catch (err) {
      console.error(`Exception: ${err.message}`);
    }
  }

  // Verify task counts
  console.log('\nVerifying task counts...');
  const { data, error } = await supabase
    .from('projects')
    .select(`
      title,
      slug,
      tasks(count)
    `)
    .in('slug', [
      'installer-gtm-value-prop',
      'ai-customer-success-agent',
      'installer-enablement-training',
      'incident-bug-management',
      'internal-ops-agent-suite',
      'agent-communication-protocol',
      'cortex-data-acquisition'
    ]);

  if (error) {
    console.error('Error verifying:', error);
  } else {
    console.log('Task counts:');
    data.forEach(p => {
      console.log(`  ${p.title}: ${p.tasks[0]?.count || 0} tasks`);
    });
  }
}

runMigration().catch(console.error);
