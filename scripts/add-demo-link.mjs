/**
 * Add demo_link column to projects and tasks tables
 */

import { createClient } from '@supabase/supabase-js';
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
  console.error('Missing SUPABASE_URL or SUPABASE_KEY from .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log('Adding demo_link columns...');

  // Test if columns exist by trying to select them
  const { data: testProject, error: projectError } = await supabase
    .from('projects')
    .select('id, demo_link')
    .limit(1);

  if (projectError && projectError.message.includes('demo_link')) {
    console.log('demo_link column does not exist in projects table');
    console.log('Please run this SQL in Supabase SQL Editor:');
    console.log('');
    console.log('ALTER TABLE projects ADD COLUMN IF NOT EXISTS demo_link text;');
    console.log('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS demo_link text;');
    console.log('');
  } else {
    console.log('✅ demo_link column already exists in projects table');
  }

  const { data: testTask, error: taskError } = await supabase
    .from('tasks')
    .select('id, demo_link')
    .limit(1);

  if (taskError && taskError.message.includes('demo_link')) {
    console.log('demo_link column does not exist in tasks table');
  } else {
    console.log('✅ demo_link column already exists in tasks table');
  }
}

main().catch(console.error);
