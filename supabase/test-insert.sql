-- Test: Insert a single project to verify it works
INSERT INTO projects (
  title, slug, description, why_it_matters, category, status, priority, difficulty,
  pillar_id, owner_team_id, estimated_hours_min, estimated_hours_max
) VALUES (
  'Test Project',
  'test-project',
  'A test project to verify inserts work.',
  'Testing the database connection.',
  'Test',
  'idea',
  'medium',
  'easy',
  (SELECT id FROM pillars WHERE slug = 'data-foundation'),
  (SELECT id FROM teams WHERE slug = 'technology'),
  10, 20
);

-- Check if it was inserted
SELECT id, title, slug, status FROM projects WHERE slug = 'test-project';
