/**
 * Add demo_link column using direct Supabase REST API
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// Parse .env.local manually
const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex > 0) {
      const key = trimmed.substring(0, eqIndex);
      let value = trimmed.substring(eqIndex + 1);
      value = value.replace(/^["']|["']$/g, '').replace(/\\n$/, '').trim();
      env[key] = value;
    }
  }
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing env vars');
  process.exit(1);
}

async function runSQL(sql) {
  // Use the Supabase SQL endpoint
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({ sql }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`SQL Error: ${text}`);
  }

  return response.json();
}

async function main() {
  console.log('Attempting to add demo_link columns via Supabase SQL API...\n');

  // Method: Try adding the column via direct database function
  // Since we can't run DDL directly, we'll need to use Supabase's management API
  // or run the SQL in the dashboard

  console.log('='.repeat(60));
  console.log('PLEASE RUN THIS SQL IN SUPABASE SQL EDITOR:');
  console.log('='.repeat(60));
  console.log('');
  console.log('-- Add demo_link column to projects table');
  console.log('ALTER TABLE projects ADD COLUMN IF NOT EXISTS demo_link text;');
  console.log('');
  console.log('-- Add demo_link column to tasks table');
  console.log('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS demo_link text;');
  console.log('');
  console.log('-- Add comment for documentation');
  console.log("COMMENT ON COLUMN projects.demo_link IS 'Link to demo, Notion doc, or related artifact';");
  console.log("COMMENT ON COLUMN tasks.demo_link IS 'Link to demo, Notion doc, or related artifact';");
  console.log('');
  console.log('='.repeat(60));
  console.log('');
  console.log('Go to: https://supabase.com/dashboard/project/' + SUPABASE_URL.match(/https:\/\/([^.]+)/)?.[1] + '/sql/new');
}

main().catch(console.error);
