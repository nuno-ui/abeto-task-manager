-- ============================================================================
-- SEED DATA: All 29 Projects and their Tasks from Abeto API Dashboard
-- Run this in Supabase SQL Editor after running schema.sql
-- ============================================================================

-- First, insert the pillars
INSERT INTO pillars (id, name, description, color) VALUES
  (gen_random_uuid(), 'Data Foundation', 'Building the data infrastructure that powers everything', '#3B82F6'),
  (gen_random_uuid(), 'Knowledge Generation', 'Turning data into actionable insights', '#10B981'),
  (gen_random_uuid(), 'Human Empowerment', 'Tools that make people more effective', '#8B5CF6')
ON CONFLICT (name) DO NOTHING;

-- Insert teams
INSERT INTO teams (id, name, description, color) VALUES
  (gen_random_uuid(), 'Technology', 'Engineering and development', '#3B82F6'),
  (gen_random_uuid(), 'Operations', 'Business operations and processes', '#10B981'),
  (gen_random_uuid(), 'Marketing', 'Marketing and growth', '#F59E0B'),
  (gen_random_uuid(), 'Sales', 'Sales team', '#EF4444'),
  (gen_random_uuid(), 'Finance', 'Finance and accounting', '#6366F1'),
  (gen_random_uuid(), 'Legal', 'Legal and compliance', '#EC4899'),
  (gen_random_uuid(), 'Product', 'Product management', '#14B8A6')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- PROJECTS
-- ============================================================================

-- 1. Unified Data Layer
INSERT INTO projects (
  title, slug, description, why_it_matters, category, status, priority, difficulty,
  pillar_id, owner_team_id, estimated_hours_min, estimated_hours_max
) VALUES (
  'Unified Data Layer',
  'unified-data-layer',
  'Central API that aggregates all data sources (Zoho, Woztell, Aircall, Holded) into a unified, consistent interface.',
  'Foundation for all other projects. Without clean, unified data, nothing else works properly.',
  'Data Infrastructure',
  'in_progress',
  'critical',
  'hard',
  (SELECT id FROM pillars WHERE name = 'Data Foundation'),
  (SELECT id FROM teams WHERE name = 'Technology'),
  180, 240
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  why_it_matters = EXCLUDED.why_it_matters,
  category = EXCLUDED.category,
  status = EXCLUDED.status,
  priority = EXCLUDED.priority,
  difficulty = EXCLUDED.difficulty;

-- 2. Reporting Hub
INSERT INTO projects (
  title, slug, description, why_it_matters, category, status, priority, difficulty,
  pillar_id, owner_team_id, estimated_hours_min, estimated_hours_max
) VALUES (
  'Reporting Hub',
  'reporting-hub',
  'Centralized reporting dashboard with automated weekly digests, provider ROI analysis, and performance metrics.',
  'Gives leadership visibility into operations without manual report generation.',
  'Analytics',
  'planning',
  'high',
  'medium',
  (SELECT id FROM pillars WHERE name = 'Knowledge Generation'),
  (SELECT id FROM teams WHERE name = 'Operations'),
  100, 140
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  why_it_matters = EXCLUDED.why_it_matters;

-- 3. SDR Portal
INSERT INTO projects (
  title, slug, description, why_it_matters, category, status, priority, difficulty,
  pillar_id, owner_team_id, estimated_hours_min, estimated_hours_max
) VALUES (
  'SDR Portal',
  'sdr-portal',
  'Dedicated portal for SDRs with prioritized contact lists, WhatsApp summaries, AI qualification notes, and call prep tools.',
  'Empowers SDRs to work more efficiently and make better contact decisions.',
  'Sales Tools',
  'in_progress',
  'critical',
  'hard',
  (SELECT id FROM pillars WHERE name = 'Human Empowerment'),
  (SELECT id FROM teams WHERE name = 'Technology'),
  150, 200
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  why_it_matters = EXCLUDED.why_it_matters;

-- 4. Installer Portal & Product
INSERT INTO projects (
  title, slug, description, why_it_matters, category, status, priority, difficulty,
  pillar_id, owner_team_id, estimated_hours_min, estimated_hours_max
) VALUES (
  'Installer Portal & Product',
  'installer-portal-product',
  'Self-service portal for installers to manage leads, submit quotes, provide feedback, and track performance.',
  'Reduces ops overhead and gives installers ownership of their pipeline.',
  'Partner Tools',
  'planning',
  'high',
  'hard',
  (SELECT id FROM pillars WHERE name = 'Human Empowerment'),
  (SELECT id FROM teams WHERE name = 'Technology'),
  160, 220
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  why_it_matters = EXCLUDED.why_it_matters;

-- 5. AI Cortex
INSERT INTO projects (
  title, slug, description, why_it_matters, category, status, priority, difficulty,
  pillar_id, owner_team_id, estimated_hours_min, estimated_hours_max
) VALUES (
  'AI Cortex',
  'ai-cortex',
  'Central AI/ML platform for lead scoring, conversation analysis, qualification automation, and predictive insights.',
  'Leverages AI to augment human decision-making across all touchpoints.',
  'AI/ML',
  'idea',
  'high',
  'hard',
  (SELECT id FROM pillars WHERE name = 'Knowledge Generation'),
  (SELECT id FROM teams WHERE name = 'Technology'),
  200, 280
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  why_it_matters = EXCLUDED.why_it_matters;

-- 6. Campaign OS
INSERT INTO projects (
  title, slug, description, why_it_matters, category, status, priority, difficulty,
  pillar_id, owner_team_id, estimated_hours_min, estimated_hours_max
) VALUES (
  'Campaign OS',
  'campaign-os',
  'Lead provider management system with ROI tracking, validation automation, and performance optimization.',
  'Optimizes marketing spend by identifying best-performing lead sources.',
  'Marketing',
  'planning',
  'high',
  'medium',
  (SELECT id FROM pillars WHERE name = 'Knowledge Generation'),
  (SELECT id FROM teams WHERE name = 'Marketing'),
  100, 140
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  why_it_matters = EXCLUDED.why_it_matters;

-- 7. Data Quality Monitor
INSERT INTO projects (
  title, slug, description, why_it_matters, category, status, priority, difficulty,
  pillar_id, owner_team_id, estimated_hours_min, estimated_hours_max
) VALUES (
  'Data Quality Monitor',
  'data-quality-monitor',
  'Real-time monitoring of data quality across all systems with alerts for anomalies and degradation.',
  'Ensures data integrity and catches issues before they impact operations.',
  'Data Infrastructure',
  'idea',
  'medium',
  'medium',
  (SELECT id FROM pillars WHERE name = 'Data Foundation'),
  (SELECT id FROM teams WHERE name = 'Technology'),
  60, 90
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  why_it_matters = EXCLUDED.why_it_matters;

-- 8. Funnel Automation OS
INSERT INTO projects (
  title, slug, description, why_it_matters, category, status, priority, difficulty,
  pillar_id, owner_team_id, estimated_hours_min, estimated_hours_max
) VALUES (
  'Funnel Automation OS',
  'funnel-automation-os',
  'Automated lead nurturing flows via WhatsApp and email based on lead behavior and stage.',
  'Increases contact rates and conversions through timely, relevant outreach.',
  'Automation',
  'planning',
  'high',
  'medium',
  (SELECT id FROM pillars WHERE name = 'Human Empowerment'),
  (SELECT id FROM teams WHERE name = 'Operations'),
  120, 160
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  why_it_matters = EXCLUDED.why_it_matters;

-- 9. Partner Expansion Tool
INSERT INTO projects (
  title, slug, description, why_it_matters, category, status, priority, difficulty,
  pillar_id, owner_team_id, estimated_hours_min, estimated_hours_max
) VALUES (
  'Partner Expansion Tool',
  'partner-expansion-tool',
  'CRM and outreach automation for recruiting new installer partners.',
  'Scales installer network to handle growth in lead volume.',
  'Partner Tools',
  'idea',
  'medium',
  'medium',
  (SELECT id FROM pillars WHERE name = 'Human Empowerment'),
  (SELECT id FROM teams WHERE name = 'Sales'),
  120, 160
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  why_it_matters = EXCLUDED.why_it_matters;

-- 10. Investor Portal
INSERT INTO projects (
  title, slug, description, why_it_matters, category, status, priority, difficulty,
  pillar_id, owner_team_id, estimated_hours_min, estimated_hours_max
) VALUES (
  'Investor Portal',
  'investor-portal',
  'Secure portal for investors with real-time KPIs, document room, and AI Q&A.',
  'Reduces investor reporting overhead and provides transparency.',
  'Finance',
  'idea',
  'low',
  'medium',
  (SELECT id FROM pillars WHERE name = 'Human Empowerment'),
  (SELECT id FROM teams WHERE name = 'Finance'),
  100, 140
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  why_it_matters = EXCLUDED.why_it_matters;

-- 11. Installer Performance Tracking
INSERT INTO projects (
  title, slug, description, why_it_matters, category, status, priority, difficulty,
  pillar_id, owner_team_id, estimated_hours_min, estimated_hours_max
) VALUES (
  'Installer Performance Tracking',
  'installer-performance-tracking',
  'Dashboard and alerting for installer SLAs, conversion rates, and quality metrics.',
  'Identifies underperforming installers and rewards top performers.',
  'Analytics',
  'planning',
  'high',
  'medium',
  (SELECT id FROM pillars WHERE name = 'Knowledge Generation'),
  (SELECT id FROM teams WHERE name = 'Operations'),
  90, 120
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  why_it_matters = EXCLUDED.why_it_matters;

-- 12. Dynamic Allocation Engine
INSERT INTO projects (
  title, slug, description, why_it_matters, category, status, priority, difficulty,
  pillar_id, owner_team_id, estimated_hours_min, estimated_hours_max
) VALUES (
  'Dynamic Allocation Engine',
  'dynamic-allocation-engine',
  'Real-time lead-to-installer matching based on capacity, performance, and geography.',
  'Maximizes conversion by matching leads with best-fit installers.',
  'Automation',
  'idea',
  'high',
  'hard',
  (SELECT id FROM pillars WHERE name = 'Knowledge Generation'),
  (SELECT id FROM teams WHERE name = 'Technology'),
  140, 180
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  why_it_matters = EXCLUDED.why_it_matters;

-- 13. WhatsApp Conversation Summary
INSERT INTO projects (
  title, slug, description, why_it_matters, category, status, priority, difficulty,
  pillar_id, owner_team_id, estimated_hours_min, estimated_hours_max
) VALUES (
  'WhatsApp Conversation Summary',
  'whatsapp-conversation-summary',
  'AI-powered summaries of WhatsApp conversations for SDR call prep.',
  'Saves SDR time and improves call quality with context.',
  'AI/ML',
  'idea',
  'medium',
  'medium',
  (SELECT id FROM pillars WHERE name = 'Knowledge Generation'),
  (SELECT id FROM teams WHERE name = 'Technology'),
  60, 80
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  why_it_matters = EXCLUDED.why_it_matters;

-- 14. Contact Prioritization Engine
INSERT INTO projects (
  title, slug, description, why_it_matters, category, status, priority, difficulty,
  pillar_id, owner_team_id, estimated_hours_min, estimated_hours_max
) VALUES (
  'Contact Prioritization Engine',
  'contact-prioritization-engine',
  'Scoring algorithm to prioritize which leads to contact first based on conversion likelihood.',
  'Focuses SDR effort on highest-potential leads.',
  'AI/ML',
  'idea',
  'high',
  'hard',
  (SELECT id FROM pillars WHERE name = 'Knowledge Generation'),
  (SELECT id FROM teams WHERE name = 'Technology'),
  80, 110
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  why_it_matters = EXCLUDED.why_it_matters;

-- 15. Lead Recycling Workflow
INSERT INTO projects (
  title, slug, description, why_it_matters, category, status, priority, difficulty,
  pillar_id, owner_team_id, estimated_hours_min, estimated_hours_max
) VALUES (
  'Lead Recycling Workflow',
  'lead-recycling-workflow',
  'Automated re-engagement of lost leads based on timing and reason for loss.',
  'Recovers value from leads that would otherwise be wasted.',
  'Automation',
  'idea',
  'medium',
  'medium',
  (SELECT id FROM pillars WHERE name = 'Human Empowerment'),
  (SELECT id FROM teams WHERE name = 'Operations'),
  70, 90
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  why_it_matters = EXCLUDED.why_it_matters;

-- 16. Installer Feedback System
INSERT INTO projects (
  title, slug, description, why_it_matters, category, status, priority, difficulty,
  pillar_id, owner_team_id, estimated_hours_min, estimated_hours_max
) VALUES (
  'Installer Feedback System',
  'installer-feedback-system',
  'Structured feedback collection from installers on lead quality.',
  'Closes the loop on lead quality and informs provider decisions.',
  'Data Infrastructure',
  'idea',
  'medium',
  'easy',
  (SELECT id FROM pillars WHERE name = 'Data Foundation'),
  (SELECT id FROM teams WHERE name = 'Operations'),
  50, 70
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  why_it_matters = EXCLUDED.why_it_matters;

-- 17. Installer Quote Sync
INSERT INTO projects (
  title, slug, description, why_it_matters, category, status, priority, difficulty,
  pillar_id, owner_team_id, estimated_hours_min, estimated_hours_max
) VALUES (
  'Installer Quote Sync',
  'installer-quote-sync',
  'Real-time sync of installer quotes back to CRM.',
  'Eliminates manual quote entry and provides visibility.',
  'Data Infrastructure',
  'idea',
  'medium',
  'easy',
  (SELECT id FROM pillars WHERE name = 'Data Foundation'),
  (SELECT id FROM teams WHERE name = 'Technology'),
  45, 60
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  why_it_matters = EXCLUDED.why_it_matters;

-- 18. Answer Rate Monitoring
INSERT INTO projects (
  title, slug, description, why_it_matters, category, status, priority, difficulty,
  pillar_id, owner_team_id, estimated_hours_min, estimated_hours_max
) VALUES (
  'Answer Rate Monitoring',
  'answer-rate-monitoring',
  'Real-time tracking of call answer rates by segment with alerting.',
  'Identifies contact rate issues quickly.',
  'Analytics',
  'idea',
  'low',
  'easy',
  (SELECT id FROM pillars WHERE name = 'Knowledge Generation'),
  (SELECT id FROM teams WHERE name = 'Operations'),
  40, 55
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  why_it_matters = EXCLUDED.why_it_matters;

-- 19. GDPR Compliance Tracker
INSERT INTO projects (
  title, slug, description, why_it_matters, category, status, priority, difficulty,
  pillar_id, owner_team_id, estimated_hours_min, estimated_hours_max
) VALUES (
  'GDPR Compliance Tracker',
  'gdpr-compliance-tracker',
  'Consent management and data subject rights portal.',
  'Ensures legal compliance and avoids fines.',
  'Compliance',
  'idea',
  'medium',
  'hard',
  (SELECT id FROM pillars WHERE name = 'Data Foundation'),
  (SELECT id FROM teams WHERE name = 'Legal'),
  60, 80
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  why_it_matters = EXCLUDED.why_it_matters;

-- 20. Automated Invoicing
INSERT INTO projects (
  title, slug, description, why_it_matters, category, status, priority, difficulty,
  pillar_id, owner_team_id, estimated_hours_min, estimated_hours_max
) VALUES (
  'Automated Invoicing',
  'automated-invoicing',
  'Automatic invoice generation based on lead outcomes.',
  'Eliminates manual invoicing and reduces errors.',
  'Finance',
  'idea',
  'medium',
  'medium',
  (SELECT id FROM pillars WHERE name = 'Human Empowerment'),
  (SELECT id FROM teams WHERE name = 'Finance'),
  70, 90
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  why_it_matters = EXCLUDED.why_it_matters;

-- 21. API Self-Service Portal
INSERT INTO projects (
  title, slug, description, why_it_matters, category, status, priority, difficulty,
  pillar_id, owner_team_id, estimated_hours_min, estimated_hours_max
) VALUES (
  'API Self-Service Portal',
  'api-self-service-portal',
  'Developer portal for lead providers to integrate directly.',
  'Reduces integration overhead and scales provider onboarding.',
  'Data Infrastructure',
  'idea',
  'low',
  'hard',
  (SELECT id FROM pillars WHERE name = 'Data Foundation'),
  (SELECT id FROM teams WHERE name = 'Technology'),
  80, 100
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  why_it_matters = EXCLUDED.why_it_matters;

-- 22. Programmatic SEO Pages
INSERT INTO projects (
  title, slug, description, why_it_matters, category, status, priority, difficulty,
  pillar_id, owner_team_id, estimated_hours_min, estimated_hours_max
) VALUES (
  'Programmatic SEO Pages',
  'programmatic-seo-pages',
  'Auto-generated location and topic pages for organic traffic.',
  'Drives free organic leads at scale.',
  'Marketing',
  'idea',
  'medium',
  'hard',
  (SELECT id FROM pillars WHERE name = 'Human Empowerment'),
  (SELECT id FROM teams WHERE name = 'Marketing'),
  100, 130
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  why_it_matters = EXCLUDED.why_it_matters;

-- 23. PVPC Savings Widget
INSERT INTO projects (
  title, slug, description, why_it_matters, category, status, priority, difficulty,
  pillar_id, owner_team_id, estimated_hours_min, estimated_hours_max
) VALUES (
  'PVPC Savings Widget',
  'pvpc-savings-widget',
  'Embeddable widget showing real-time electricity savings.',
  'Engages visitors with personalized value prop.',
  'Marketing',
  'idea',
  'low',
  'medium',
  (SELECT id FROM pillars WHERE name = 'Human Empowerment'),
  (SELECT id FROM teams WHERE name = 'Marketing'),
  35, 50
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  why_it_matters = EXCLUDED.why_it_matters;

-- 24. IRPF Calculator
INSERT INTO projects (
  title, slug, description, why_it_matters, category, status, priority, difficulty,
  pillar_id, owner_team_id, estimated_hours_min, estimated_hours_max
) VALUES (
  'IRPF Calculator',
  'irpf-calculator',
  'Tax deduction calculator for solar installations.',
  'Helps customers understand financial benefits.',
  'Marketing',
  'idea',
  'low',
  'easy',
  (SELECT id FROM pillars WHERE name = 'Human Empowerment'),
  (SELECT id FROM teams WHERE name = 'Marketing'),
  25, 35
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  why_it_matters = EXCLUDED.why_it_matters;

-- 25. GMB Automation
INSERT INTO projects (
  title, slug, description, why_it_matters, category, status, priority, difficulty,
  pillar_id, owner_team_id, estimated_hours_min, estimated_hours_max
) VALUES (
  'GMB Automation',
  'gmb-automation',
  'Automated Google Business Profile management.',
  'Improves local SEO and manages reviews at scale.',
  'Marketing',
  'idea',
  'low',
  'medium',
  (SELECT id FROM pillars WHERE name = 'Human Empowerment'),
  (SELECT id FROM teams WHERE name = 'Marketing'),
  55, 75
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  why_it_matters = EXCLUDED.why_it_matters;

-- 26. Review Generation System
INSERT INTO projects (
  title, slug, description, why_it_matters, category, status, priority, difficulty,
  pillar_id, owner_team_id, estimated_hours_min, estimated_hours_max
) VALUES (
  'Review Generation System',
  'review-generation-system',
  'Automated review request system post-installation.',
  'Builds social proof and improves local rankings.',
  'Marketing',
  'idea',
  'low',
  'medium',
  (SELECT id FROM pillars WHERE name = 'Human Empowerment'),
  (SELECT id FROM teams WHERE name = 'Marketing'),
  45, 60
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  why_it_matters = EXCLUDED.why_it_matters;

-- 27. Competitor Intel Agent
INSERT INTO projects (
  title, slug, description, why_it_matters, category, status, priority, difficulty,
  pillar_id, owner_team_id, estimated_hours_min, estimated_hours_max
) VALUES (
  'Competitor Intel Agent',
  'competitor-intel-agent',
  'Automated monitoring of competitor ads, pricing, and activity.',
  'Keeps us informed of market dynamics.',
  'Marketing',
  'idea',
  'low',
  'hard',
  (SELECT id FROM pillars WHERE name = 'Knowledge Generation'),
  (SELECT id FROM teams WHERE name = 'Marketing'),
  50, 70
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  why_it_matters = EXCLUDED.why_it_matters;

-- 28. Robinson Suppressor
INSERT INTO projects (
  title, slug, description, why_it_matters, category, status, priority, difficulty,
  pillar_id, owner_team_id, estimated_hours_min, estimated_hours_max
) VALUES (
  'Robinson Suppressor',
  'robinson-suppressor',
  'Integration with Robinson List for contact suppression.',
  'Ensures legal compliance with do-not-call lists.',
  'Compliance',
  'idea',
  'medium',
  'medium',
  (SELECT id FROM pillars WHERE name = 'Data Foundation'),
  (SELECT id FROM teams WHERE name = 'Legal'),
  35, 50
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  why_it_matters = EXCLUDED.why_it_matters;

-- 29. Unified Quote API
INSERT INTO projects (
  title, slug, description, why_it_matters, category, status, priority, difficulty,
  pillar_id, owner_team_id, estimated_hours_min, estimated_hours_max
) VALUES (
  'Unified Quote API',
  'unified-quote-api',
  'Standardized quote flow across all installer types.',
  'Simplifies quote management and improves data quality.',
  'Data Infrastructure',
  'idea',
  'medium',
  'hard',
  (SELECT id FROM pillars WHERE name = 'Data Foundation'),
  (SELECT id FROM teams WHERE name = 'Technology'),
  80, 100
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  why_it_matters = EXCLUDED.why_it_matters;

-- ============================================================================
-- TASKS FOR ALL PROJECTS
-- ============================================================================

-- Helper function to safely insert tasks
CREATE OR REPLACE FUNCTION insert_task(
  p_project_slug TEXT,
  p_title TEXT,
  p_description TEXT,
  p_phase task_phase,
  p_owner_team TEXT,
  p_estimated_hours TEXT,
  p_difficulty task_difficulty,
  p_ai_potential ai_potential_level,
  p_ai_assist_description TEXT,
  p_tools_needed TEXT[],
  p_knowledge_areas TEXT[],
  p_acceptance_criteria TEXT[],
  p_success_metrics TEXT[],
  p_risks TEXT[],
  p_is_foundational BOOLEAN,
  p_is_critical_path BOOLEAN,
  p_order_index INTEGER
) RETURNS void AS $$
BEGIN
  INSERT INTO tasks (
    project_id, title, description, phase, owner_team_id, estimated_hours,
    difficulty, ai_potential, ai_assist_description, tools_needed, knowledge_areas,
    acceptance_criteria, success_metrics, risks, is_foundational, is_critical_path, order_index, status
  ) VALUES (
    (SELECT id FROM projects WHERE slug = p_project_slug),
    p_title,
    p_description,
    p_phase,
    (SELECT id FROM teams WHERE name = p_owner_team),
    p_estimated_hours,
    p_difficulty,
    p_ai_potential,
    p_ai_assist_description,
    p_tools_needed,
    p_knowledge_areas,
    p_acceptance_criteria,
    p_success_metrics,
    p_risks,
    p_is_foundational,
    p_is_critical_path,
    p_order_index,
    'not_started'
  );
EXCEPTION WHEN unique_violation THEN
  -- Task already exists, skip
  NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- UNIFIED DATA LAYER TASKS
-- ============================================================================

SELECT insert_task('unified-data-layer', 'Data Audit & Gap Analysis',
  'Audit all existing data sources (Zoho, Woztell, Aircall, Holded). Document current data flows, identify gaps, inconsistencies, and missing fields. Create data dictionary.',
  'discovery', 'Technology', '16-24h', 'medium', 'medium',
  'Can help analyze data schemas and generate documentation templates',
  ARRAY['Notion', 'Spreadsheets', 'Existing system access'],
  ARRAY['Data Analytics', 'Business Logic'],
  ARRAY['Complete inventory of all data sources', 'Data dictionary with field definitions', 'Gap analysis document', 'Data flow diagrams'],
  ARRAY['100% of data sources documented', 'All critical gaps identified'],
  ARRAY['Access delays to production systems', 'Undocumented legacy data'],
  true, true, 0);

SELECT insert_task('unified-data-layer', 'Stakeholder Requirements Workshop',
  'Conduct workshops with Sales, Ops, Finance, and Leadership to understand data needs. Document use cases, reporting requirements, and pain points.',
  'discovery', 'Operations', '8-12h', 'easy', 'low',
  'Can help structure workshop agenda and document outputs',
  ARRAY['Meeting tools', 'Notion', 'Whiteboard'],
  ARRAY['Stakeholder Management', 'Business Logic'],
  ARRAY['Workshop conducted with all key stakeholders', 'Requirements document approved', 'Priority ranking of data needs'],
  ARRAY[]::TEXT[],
  ARRAY['Stakeholder availability', 'Conflicting requirements'],
  false, true, 1);

SELECT insert_task('unified-data-layer', 'API Architecture Design',
  'Design API architecture including endpoints, authentication, rate limiting, caching strategy. Define data models and relationships.',
  'planning', 'Technology', '20-30h', 'hard', 'high',
  'Can generate OpenAPI specs, data models, and architecture diagrams',
  ARRAY['Architecture tools', 'Documentation'],
  ARRAY['API Integration', 'Database/SQL', 'Security/Auth'],
  ARRAY['OpenAPI specification document', 'Database schema design', 'Authentication flow documented', 'Rate limiting strategy defined'],
  ARRAY[]::TEXT[],
  ARRAY['Over-engineering', 'Missing edge cases'],
  true, true, 2);

SELECT insert_task('unified-data-layer', 'Zoho CRM Integration',
  'Build integration with Zoho CRM for opportunities, contacts, and accounts. Handle pagination, rate limits, and incremental sync.',
  'development', 'Technology', '30-40h', 'hard', 'high',
  'Can generate API client code, data transformations, and error handling',
  ARRAY['Node.js', 'Zoho API', 'PostgreSQL'],
  ARRAY['API Integration', 'Database/SQL'],
  ARRAY['All opportunity fields syncing', 'Incremental sync working', 'Error handling and retries', 'Audit logging'],
  ARRAY['99.9% sync reliability', '<5 min sync delay'],
  ARRAY['Zoho API rate limits', 'Data model changes'],
  true, true, 3);

SELECT insert_task('unified-data-layer', 'Aircall Integration',
  'Integrate Aircall API for call logs, recordings, and transcripts. Build real-time webhook handler.',
  'development', 'Technology', '25-35h', 'hard', 'medium',
  'Can generate API integration boilerplate and webhook handlers',
  ARRAY['Aircall API', 'Node.js', 'PostgreSQL'],
  ARRAY['API Integration', 'Database/SQL'],
  ARRAY['Call logs syncing', 'Recordings accessible', 'Webhooks processing in real-time'],
  ARRAY['All calls captured', 'Real-time webhook latency <1s'],
  ARRAY['Aircall API access', 'Webhook reliability'],
  true, false, 4);

SELECT insert_task('unified-data-layer', 'Woztell WhatsApp Integration',
  'Integrate Woztell API for WhatsApp conversation history, message direction, and timestamps.',
  'development', 'Technology', '20-30h', 'medium', 'medium',
  'Can help with data mapping and pagination handling',
  ARRAY['Woztell API', 'Node.js', 'PostgreSQL'],
  ARRAY['API Integration', 'Database/SQL'],
  ARRAY['Full conversation history syncing', 'Message direction tracked', 'Timestamps accurate'],
  ARRAY['All conversations captured', 'Historical data imported'],
  ARRAY['Woztell API documentation', 'Rate limits'],
  true, false, 5);

SELECT insert_task('unified-data-layer', 'Unit & Integration Testing',
  'Comprehensive test suite for all API endpoints and integrations.',
  'testing', 'Technology', '20-25h', 'medium', 'high',
  'Can generate test cases and mock data',
  ARRAY['Jest', 'Supertest'],
  ARRAY['API Integration', 'Database/SQL'],
  ARRAY['80% code coverage', 'All critical paths tested', 'Integration tests passing'],
  ARRAY['Zero critical bugs in production'],
  ARRAY['Test environment stability'],
  false, true, 6);

SELECT insert_task('unified-data-layer', 'API Documentation',
  'Complete API documentation with examples, authentication guide, and error handling.',
  'training', 'Technology', '10-15h', 'easy', 'high',
  'Can generate documentation from OpenAPI spec',
  ARRAY['Documentation tools'],
  ARRAY['API Integration'],
  ARRAY['All endpoints documented', 'Examples for each endpoint', 'Authentication guide complete'],
  ARRAY['Team can use API without support'],
  ARRAY[]::TEXT[],
  false, false, 7);

SELECT insert_task('unified-data-layer', 'Production Deployment',
  'Deploy API to production with monitoring, logging, and alerting.',
  'rollout', 'Technology', '15-20h', 'medium', 'medium',
  'Can generate deployment scripts and monitoring configs',
  ARRAY['AWS/GCP', 'Docker', 'Monitoring tools'],
  ARRAY['DevOps', 'Security/Auth'],
  ARRAY['API deployed to production', 'Monitoring active', 'Alerts configured', 'Rollback plan tested'],
  ARRAY['99.9% uptime', '<100ms response time'],
  ARRAY['Production stability', 'Data migration'],
  false, true, 8);

SELECT insert_task('unified-data-layer', 'Performance Monitoring & Optimization',
  'Ongoing monitoring and optimization of API performance.',
  'monitoring', 'Technology', 'Ongoing (5h/week)', 'medium', 'medium',
  'Can analyze performance data and suggest optimizations',
  ARRAY['Monitoring tools', 'Analytics'],
  ARRAY['DevOps', 'Database/SQL'],
  ARRAY['Weekly performance reviews', 'SLOs met', 'Capacity planning active'],
  ARRAY['99.9% uptime', 'Response times within SLA'],
  ARRAY['Scaling issues', 'Cost overruns'],
  false, false, 9);

-- ============================================================================
-- REPORTING HUB TASKS
-- ============================================================================

SELECT insert_task('reporting-hub', 'Reporting Requirements Discovery',
  'Interview stakeholders to understand reporting needs, frequency, and preferred formats.',
  'discovery', 'Operations', '10-15h', 'easy', 'low',
  'Can help structure interview questions',
  ARRAY['Meeting tools', 'Documentation'],
  ARRAY['Stakeholder Management', 'Business Logic'],
  ARRAY['All stakeholders interviewed', 'Requirements documented', 'Report types prioritized'],
  ARRAY[]::TEXT[],
  ARRAY['Stakeholder availability'],
  false, true, 0);

SELECT insert_task('reporting-hub', 'KPI Framework Design',
  'Design comprehensive KPI framework covering all business areas.',
  'planning', 'Operations', '15-20h', 'medium', 'medium',
  'Can suggest industry-standard KPIs',
  ARRAY['Documentation', 'Spreadsheets'],
  ARRAY['Data Analytics', 'Business Logic'],
  ARRAY['KPIs defined', 'Calculation methods documented', 'Data sources mapped'],
  ARRAY[]::TEXT[],
  ARRAY['Metric alignment'],
  true, true, 1);

SELECT insert_task('reporting-hub', 'Dashboard Development',
  'Build interactive dashboard with drill-downs and filters.',
  'development', 'Technology', '35-45h', 'hard', 'high',
  'Can generate chart components and data queries',
  ARRAY['React', 'Chart.js', 'API'],
  ARRAY['Frontend/React', 'Data Analytics'],
  ARRAY['All KPIs displayed', 'Drill-downs working', 'Filters functional'],
  ARRAY['<3s load time'],
  ARRAY['Data accuracy', 'Performance'],
  false, true, 2);

SELECT insert_task('reporting-hub', 'Automated Report Generation',
  'Build automated weekly/monthly report generation and distribution.',
  'development', 'Technology', '20-25h', 'medium', 'high',
  'Can generate report templates and scheduling logic',
  ARRAY['Node.js', 'PDF generation', 'Email'],
  ARRAY['API Integration', 'Business Logic'],
  ARRAY['Reports generating correctly', 'Distribution working', 'Scheduling flexible'],
  ARRAY['100% report delivery rate'],
  ARRAY['Email deliverability'],
  false, false, 3);

SELECT insert_task('reporting-hub', 'User Acceptance Testing',
  'Test dashboard with end users and gather feedback.',
  'testing', 'Operations', '10-15h', 'easy', 'low',
  '',
  ARRAY['Feedback forms'],
  ARRAY['Stakeholder Management'],
  ARRAY['UAT completed', 'Feedback addressed', 'Sign-off obtained'],
  ARRAY['User satisfaction >4/5'],
  ARRAY['Scope changes from feedback'],
  false, true, 4);

SELECT insert_task('reporting-hub', 'Launch & Monitor',
  'Launch reporting hub and establish review cadence.',
  'rollout', 'Operations', '8-12h', 'easy', 'low',
  '',
  ARRAY['Communication tools'],
  ARRAY['Change Management'],
  ARRAY['Hub live', 'Users onboarded', 'Review cadence established'],
  ARRAY['80% weekly active usage'],
  ARRAY['Adoption'],
  false, true, 5);

-- ============================================================================
-- SDR PORTAL TASKS
-- ============================================================================

SELECT insert_task('sdr-portal', 'SDR Workflow Discovery',
  'Shadow SDRs to understand current workflow, pain points, and time allocation. Document key use cases.',
  'discovery', 'Operations', '12-16h', 'easy', 'low',
  'Can help structure findings and identify patterns',
  ARRAY['Screen recording', 'Documentation'],
  ARRAY['Business Logic', 'Process Design'],
  ARRAY['Workflow documented', 'Pain points identified', 'Time allocation mapped'],
  ARRAY[]::TEXT[],
  ARRAY['SDR availability'],
  false, true, 0);

SELECT insert_task('sdr-portal', 'Portal UI/UX Design',
  'Design intuitive interface for SDR daily workflow including contact queue, call prep, and notes.',
  'planning', 'Product', '20-30h', 'medium', 'medium',
  'Can generate wireframes and suggest UX patterns',
  ARRAY['Figma', 'Design system'],
  ARRAY['UX Design', 'Frontend/React'],
  ARRAY['Wireframes approved', 'Design system applied', 'Mobile-responsive'],
  ARRAY['SDR approval of designs'],
  ARRAY['Scope creep', 'Conflicting requirements'],
  false, true, 1);

SELECT insert_task('sdr-portal', 'Contact Queue Component',
  'Build prioritized contact queue with filtering, sorting, and real-time updates.',
  'development', 'Technology', '25-35h', 'hard', 'high',
  'Can generate React components and state management',
  ARRAY['React', 'TypeScript', 'API'],
  ARRAY['Frontend/React', 'API Integration'],
  ARRAY['Queue displaying correctly', 'Filters working', 'Real-time updates'],
  ARRAY['<500ms load time'],
  ARRAY['Performance with large lists'],
  false, true, 2);

SELECT insert_task('sdr-portal', 'WhatsApp Summary Integration',
  'Integrate AI-powered WhatsApp conversation summaries in call prep view.',
  'development', 'Technology', '15-20h', 'medium', 'high',
  'Can generate LLM prompts and integration code',
  ARRAY['LLM API', 'React'],
  ARRAY['LLM/Prompt Engineering', 'Frontend/React'],
  ARRAY['Summaries generating', 'Quality validated', 'Latency acceptable'],
  ARRAY['2+ min saved per call prep'],
  ARRAY['LLM costs', 'Summary quality'],
  false, false, 3);

SELECT insert_task('sdr-portal', 'Call Notes & Outcomes',
  'Build call notes interface with outcome tracking and CRM sync.',
  'development', 'Technology', '20-25h', 'medium', 'high',
  'Can generate form components and API handlers',
  ARRAY['React', 'Zoho API'],
  ARRAY['Frontend/React', 'API Integration'],
  ARRAY['Notes saving', 'Outcomes syncing to CRM', 'Auto-save working'],
  ARRAY['100% outcome capture rate'],
  ARRAY['CRM sync reliability'],
  false, false, 4);

SELECT insert_task('sdr-portal', 'SDR Pilot Testing',
  'Pilot with 2-3 SDRs to validate usability and gather feedback.',
  'testing', 'Operations', '16-24h', 'easy', 'low',
  '',
  ARRAY['Feedback forms', 'Analytics'],
  ARRAY['Stakeholder Management'],
  ARRAY['Pilot completed', 'Feedback collected', 'Critical issues fixed'],
  ARRAY['SDR satisfaction >4/5'],
  ARRAY['Pilot disruption to work'],
  false, true, 5);

SELECT insert_task('sdr-portal', 'SDR Training',
  'Train all SDRs on using the new portal effectively.',
  'training', 'Operations', '8-12h', 'easy', 'medium',
  'Can generate training materials',
  ARRAY['Training materials', 'Meeting tools'],
  ARRAY['Training & Documentation'],
  ARRAY['All SDRs trained', 'Documentation complete', 'Q&A session done'],
  ARRAY['100% SDR adoption'],
  ARRAY['Resistance to change'],
  false, false, 6);

SELECT insert_task('sdr-portal', 'Full Team Rollout',
  'Roll out portal to all SDRs and deprecate old workflow.',
  'rollout', 'Operations', '10-15h', 'medium', 'low',
  '',
  ARRAY['Communication tools'],
  ARRAY['Change Management'],
  ARRAY['All SDRs using portal', 'Old workflow deprecated', 'Support process active'],
  ARRAY['100% adoption within 2 weeks'],
  ARRAY['Adoption resistance', 'Support overload'],
  false, true, 7);

-- ============================================================================
-- INSTALLER PORTAL TASKS
-- ============================================================================

SELECT insert_task('installer-portal-product', 'Installer Needs Assessment',
  'Survey and interview installers to understand their needs, pain points with current process.',
  'discovery', 'Operations', '15-20h', 'easy', 'low',
  'Can help design survey questions',
  ARRAY['Survey tools', 'Meeting tools'],
  ARRAY['Stakeholder Management', 'Business Logic'],
  ARRAY['Survey completed', 'Key pain points identified', 'Feature priorities defined'],
  ARRAY['80% installer response rate'],
  ARRAY['Low response rate'],
  false, true, 0);

SELECT insert_task('installer-portal-product', 'Authentication System Design',
  'Design secure authentication system for installers including SSO options.',
  'planning', 'Technology', '15-20h', 'hard', 'low',
  'Security critical - limited AI assistance',
  ARRAY['Auth0', 'Security tools'],
  ARRAY['Security/Auth', 'API Integration'],
  ARRAY['Auth flow documented', 'Security review passed', 'SSO options evaluated'],
  ARRAY[]::TEXT[],
  ARRAY['Security vulnerabilities'],
  true, true, 1);

SELECT insert_task('installer-portal-product', 'Lead Management Dashboard',
  'Build dashboard for installers to view, filter, and manage assigned leads.',
  'development', 'Technology', '25-35h', 'hard', 'high',
  'Can generate dashboard components',
  ARRAY['React', 'TypeScript', 'API'],
  ARRAY['Frontend/React', 'API Integration'],
  ARRAY['Lead list displaying', 'Filters working', 'Status updates syncing'],
  ARRAY['<2s load time'],
  ARRAY['Performance with large datasets'],
  false, true, 2);

SELECT insert_task('installer-portal-product', 'Quote Submission System',
  'Build quote submission interface with validation and CRM sync.',
  'development', 'Technology', '20-25h', 'medium', 'high',
  'Can generate form components',
  ARRAY['React', 'Zoho API'],
  ARRAY['Frontend/React', 'API Integration'],
  ARRAY['Quote form working', 'Validation in place', 'CRM sync active'],
  ARRAY['100% quote capture rate'],
  ARRAY['Data validation errors'],
  false, true, 3);

SELECT insert_task('installer-portal-product', 'Performance Metrics View',
  'Build view showing installer conversion rates, SLA compliance, and rankings.',
  'development', 'Technology', '15-20h', 'medium', 'high',
  'Can generate chart components',
  ARRAY['React', 'Chart.js'],
  ARRAY['Frontend/React', 'Data Analytics'],
  ARRAY['Metrics displaying correctly', 'Historical trends visible'],
  ARRAY[]::TEXT[],
  ARRAY['Data accuracy'],
  false, false, 4);

SELECT insert_task('installer-portal-product', 'Installer Pilot Program',
  'Pilot portal with 3-5 installers and gather feedback.',
  'testing', 'Operations', '20-25h', 'easy', 'low',
  '',
  ARRAY['Feedback forms', 'Support channels'],
  ARRAY['Stakeholder Management'],
  ARRAY['Pilot completed', 'Critical bugs fixed', 'Positive feedback'],
  ARRAY['Installer satisfaction >4/5'],
  ARRAY['Pilot disruption'],
  false, true, 5);

SELECT insert_task('installer-portal-product', 'Full Installer Rollout',
  'Roll out portal to all installers with training and support.',
  'rollout', 'Operations', '15-20h', 'medium', 'low',
  '',
  ARRAY['Communication tools', 'Training materials'],
  ARRAY['Change Management'],
  ARRAY['All installers onboarded', 'Support process active'],
  ARRAY['80% portal adoption'],
  ARRAY['Adoption resistance'],
  false, true, 6);

-- ============================================================================
-- AI CORTEX TASKS
-- ============================================================================

SELECT insert_task('ai-cortex', 'AI Use Case Prioritization',
  'Identify and prioritize AI use cases across all business functions.',
  'discovery', 'Operations', '15-20h', 'medium', 'medium',
  'Can help identify common AI use cases',
  ARRAY['Documentation', 'Stakeholder interviews'],
  ARRAY['Business Logic', 'AI/ML'],
  ARRAY['Use cases documented', 'ROI estimates', 'Priority ranking'],
  ARRAY[]::TEXT[],
  ARRAY['Unclear ROI'],
  false, true, 0);

SELECT insert_task('ai-cortex', 'LLM Integration Architecture',
  'Design architecture for integrating LLMs (Claude, OpenAI) across the platform.',
  'planning', 'Technology', '20-25h', 'hard', 'high',
  'Can suggest architectural patterns',
  ARRAY['Architecture tools'],
  ARRAY['LLM/Prompt Engineering', 'API Integration'],
  ARRAY['Architecture documented', 'Cost model defined', 'Fallback strategy'],
  ARRAY[]::TEXT[],
  ARRAY['Cost control', 'Vendor lock-in'],
  true, true, 1);

SELECT insert_task('ai-cortex', 'Prompt Template System',
  'Build versioned prompt template system with A/B testing capability.',
  'development', 'Technology', '15-20h', 'medium', 'high',
  'Can generate prompt management code',
  ARRAY['Node.js', 'PostgreSQL'],
  ARRAY['LLM/Prompt Engineering', 'Database/SQL'],
  ARRAY['Templates versioned', 'A/B testing working', 'Performance tracking'],
  ARRAY[]::TEXT[],
  ARRAY['Prompt quality variance'],
  false, true, 2);

SELECT insert_task('ai-cortex', 'Lead Scoring Model',
  'Build AI-powered lead scoring model using historical conversion data.',
  'development', 'Technology', '30-40h', 'hard', 'medium',
  'Can help with feature engineering',
  ARRAY['Python', 'ML libraries', 'Data pipeline'],
  ARRAY['AI/ML', 'Data Analytics'],
  ARRAY['Model trained', 'Accuracy validated', 'API deployed'],
  ARRAY['10% improvement in conversion targeting'],
  ARRAY['Data quality', 'Model drift'],
  false, true, 3);

SELECT insert_task('ai-cortex', 'Conversation Analysis Pipeline',
  'Build pipeline for analyzing call and chat conversations for insights.',
  'development', 'Technology', '25-30h', 'hard', 'high',
  'Can generate analysis prompts',
  ARRAY['LLM API', 'Data pipeline'],
  ARRAY['LLM/Prompt Engineering', 'Data Analytics'],
  ARRAY['Pipeline running', 'Insights generating', 'Quality validated'],
  ARRAY['Actionable insights per conversation'],
  ARRAY['Processing costs', 'Quality variance'],
  false, false, 4);

SELECT insert_task('ai-cortex', 'AI Feedback Loop',
  'Implement feedback mechanism to improve AI outputs over time.',
  'development', 'Technology', '15-20h', 'medium', 'medium',
  'Can suggest feedback patterns',
  ARRAY['Node.js', 'PostgreSQL'],
  ARRAY['AI/ML', 'Database/SQL'],
  ARRAY['Feedback collecting', 'Metrics improving', 'Human review process'],
  ARRAY['Continuous quality improvement'],
  ARRAY['Bias in feedback'],
  false, false, 5);

SELECT insert_task('ai-cortex', 'AI Model Evaluation',
  'Comprehensive evaluation of AI models before production deployment.',
  'testing', 'Technology', '15-20h', 'hard', 'medium',
  'Can help design evaluation criteria',
  ARRAY['Evaluation frameworks'],
  ARRAY['AI/ML', 'Quality Assurance'],
  ARRAY['Evaluation complete', 'Benchmarks met', 'Edge cases tested'],
  ARRAY['Model accuracy >90%'],
  ARRAY['Hidden biases'],
  false, true, 6);

-- ============================================================================
-- CAMPAIGN OS TASKS
-- ============================================================================

SELECT insert_task('campaign-os', 'Provider Data Audit',
  'Audit all current lead providers and their historical performance data.',
  'discovery', 'Operations', '10-15h', 'easy', 'medium',
  'Can help analyze performance patterns',
  ARRAY['Spreadsheets', 'CRM data'],
  ARRAY['Data Analytics', 'Business Logic'],
  ARRAY['All providers documented', 'Historical metrics compiled'],
  ARRAY[]::TEXT[],
  ARRAY['Data availability'],
  false, true, 0);

SELECT insert_task('campaign-os', 'ROI Tracking Framework',
  'Design framework for tracking provider ROI including attribution model.',
  'planning', 'Operations', '15-20h', 'medium', 'medium',
  'Can suggest attribution models',
  ARRAY['Documentation', 'Spreadsheets'],
  ARRAY['Data Analytics', 'Business Logic'],
  ARRAY['Framework documented', 'Attribution model chosen', 'Metrics defined'],
  ARRAY[]::TEXT[],
  ARRAY['Attribution complexity'],
  true, true, 1);

SELECT insert_task('campaign-os', 'Provider Dashboard',
  'Build dashboard showing provider performance, costs, and ROI.',
  'development', 'Technology', '25-30h', 'medium', 'high',
  'Can generate dashboard components',
  ARRAY['React', 'Chart.js', 'API'],
  ARRAY['Frontend/React', 'Data Analytics'],
  ARRAY['Dashboard live', 'All providers visible', 'ROI calculated'],
  ARRAY['Clear visibility into provider performance'],
  ARRAY['Data accuracy'],
  false, true, 2);

SELECT insert_task('campaign-os', 'Lead Validation Automation',
  'Automate lead validation checks (phone, email, duplicate detection).',
  'development', 'Technology', '20-25h', 'medium', 'high',
  'Can generate validation logic',
  ARRAY['Node.js', 'Validation APIs'],
  ARRAY['API Integration', 'Business Logic'],
  ARRAY['Validation running', 'Invalid leads flagged', 'Provider notified'],
  ARRAY['<5% invalid lead rate'],
  ARRAY['Validation API costs'],
  false, false, 3);

SELECT insert_task('campaign-os', 'Provider Onboarding Flow',
  'Create streamlined onboarding flow for new lead providers.',
  'development', 'Technology', '15-20h', 'medium', 'high',
  'Can generate onboarding forms',
  ARRAY['React', 'Documentation'],
  ARRAY['Frontend/React', 'Business Logic'],
  ARRAY['Onboarding flow complete', 'Documentation automated'],
  ARRAY['<2 day provider onboarding'],
  ARRAY['Provider compliance'],
  false, false, 4);

SELECT insert_task('campaign-os', 'Campaign Optimization Alerts',
  'Build alerting system for campaign performance anomalies.',
  'development', 'Technology', '10-15h', 'easy', 'high',
  'Can generate alerting rules',
  ARRAY['Node.js', 'Slack API'],
  ARRAY['API Integration', 'Business Logic'],
  ARRAY['Alerts configured', 'Thresholds defined', 'Notifications working'],
  ARRAY['<1 hour anomaly detection'],
  ARRAY['Alert fatigue'],
  false, false, 5);

-- ============================================================================
-- DATA QUALITY MONITOR TASKS
-- ============================================================================

SELECT insert_task('data-quality-monitor', 'Quality Rules Definition',
  'Define data quality rules and thresholds for all data sources.',
  'discovery', 'Operations', '10-15h', 'medium', 'medium',
  'Can suggest common quality rules',
  ARRAY['Documentation', 'Spreadsheets'],
  ARRAY['Data Analytics', 'Business Logic'],
  ARRAY['Rules documented', 'Thresholds defined', 'Stakeholder sign-off'],
  ARRAY[]::TEXT[],
  ARRAY['Rule completeness'],
  false, true, 0);

SELECT insert_task('data-quality-monitor', 'Quality Scoring Engine',
  'Build engine to calculate data quality scores per source and field.',
  'development', 'Technology', '20-25h', 'medium', 'high',
  'Can generate scoring algorithms',
  ARRAY['Node.js', 'PostgreSQL'],
  ARRAY['Database/SQL', 'Data Analytics'],
  ARRAY['Scoring running', 'Metrics accurate', 'Historical tracking'],
  ARRAY['Quality score available for all sources'],
  ARRAY['False positives'],
  false, true, 1);

SELECT insert_task('data-quality-monitor', 'Quality Dashboard',
  'Build dashboard showing data quality scores and trends.',
  'development', 'Technology', '15-20h', 'medium', 'high',
  'Can generate dashboard components',
  ARRAY['React', 'Chart.js'],
  ARRAY['Frontend/React', 'Data Analytics'],
  ARRAY['Dashboard live', 'Trends visible', 'Drill-downs working'],
  ARRAY[]::TEXT[],
  ARRAY['Dashboard performance'],
  false, true, 2);

SELECT insert_task('data-quality-monitor', 'Alerting System',
  'Build alerting for quality degradation and anomalies.',
  'development', 'Technology', '10-15h', 'easy', 'high',
  'Can generate alerting logic',
  ARRAY['Node.js', 'Slack API', 'Email'],
  ARRAY['API Integration'],
  ARRAY['Alerts working', 'Escalation paths defined'],
  ARRAY['<15 min alert latency'],
  ARRAY['Alert fatigue'],
  false, false, 3);

-- ============================================================================
-- FUNNEL AUTOMATION OS TASKS
-- ============================================================================

SELECT insert_task('funnel-automation-os', 'Current Funnel Mapping',
  'Map current lead funnel stages, touchpoints, and conversion rates.',
  'discovery', 'Operations', '12-15h', 'easy', 'medium',
  'Can help visualize funnel flows',
  ARRAY['Flowchart tools', 'CRM data'],
  ARRAY['Business Logic', 'Data Analytics'],
  ARRAY['Funnel mapped', 'Conversion rates documented', 'Drop-off points identified'],
  ARRAY[]::TEXT[],
  ARRAY['Data availability'],
  false, true, 0);

SELECT insert_task('funnel-automation-os', 'Automation Flow Design',
  'Design automated nurturing flows for each funnel stage.',
  'planning', 'Operations', '15-20h', 'medium', 'medium',
  'Can suggest automation patterns',
  ARRAY['Flow design tools'],
  ARRAY['Business Logic', 'Marketing Automation'],
  ARRAY['Flows designed', 'Triggers defined', 'Content mapped'],
  ARRAY[]::TEXT[],
  ARRAY['Over-automation'],
  false, true, 1);

SELECT insert_task('funnel-automation-os', 'WhatsApp Flow Builder',
  'Build visual editor for creating WhatsApp automation flows.',
  'development', 'Technology', '30-40h', 'hard', 'high',
  'Can generate flow builder components',
  ARRAY['React', 'Node.js'],
  ARRAY['Frontend/React', 'API Integration'],
  ARRAY['Builder functional', 'Flows saving', 'Preview working'],
  ARRAY[]::TEXT[],
  ARRAY['UX complexity'],
  false, true, 2);

SELECT insert_task('funnel-automation-os', 'WhatsApp API Integration',
  'Integrate with WhatsApp Business API for automated messaging.',
  'development', 'Technology', '25-30h', 'hard', 'medium',
  'Platform-specific integration',
  ARRAY['WhatsApp Business API', 'Node.js'],
  ARRAY['API Integration'],
  ARRAY['API connected', 'Templates approved', 'Sending working'],
  ARRAY['Message delivery rate >95%'],
  ARRAY['WhatsApp approval delays'],
  true, true, 3);

SELECT insert_task('funnel-automation-os', 'A/B Testing Framework',
  'Build framework for A/B testing automation flows.',
  'development', 'Technology', '15-20h', 'medium', 'high',
  'Can generate testing framework',
  ARRAY['Node.js', 'PostgreSQL'],
  ARRAY['Data Analytics', 'API Integration'],
  ARRAY['A/B testing working', 'Results tracking', 'Statistical significance'],
  ARRAY[]::TEXT[],
  ARRAY['Sample size requirements'],
  false, false, 4);

SELECT insert_task('funnel-automation-os', 'Automation Analytics',
  'Build analytics dashboard for automation performance.',
  'development', 'Technology', '15-20h', 'medium', 'high',
  'Can generate analytics components',
  ARRAY['React', 'Chart.js'],
  ARRAY['Frontend/React', 'Data Analytics'],
  ARRAY['Analytics live', 'Flow performance visible'],
  ARRAY['Clear ROI visibility'],
  ARRAY['Attribution complexity'],
  false, false, 5);

-- ============================================================================
-- PARTNER EXPANSION TOOL TASKS
-- ============================================================================

SELECT insert_task('partner-expansion-tool', 'Target Market Definition',
  'Define ideal installer profile and target markets for expansion.',
  'discovery', 'Sales', '10-15h', 'easy', 'medium',
  'Can help analyze market data',
  ARRAY['Market research', 'CRM data'],
  ARRAY['Business Logic', 'Sales'],
  ARRAY['ICP defined', 'Target markets prioritized'],
  ARRAY[]::TEXT[],
  ARRAY['Market assumptions'],
  false, true, 0);

SELECT insert_task('partner-expansion-tool', 'Prospect Database Setup',
  'Set up database for tracking potential installer partners.',
  'planning', 'Technology', '10-15h', 'medium', 'high',
  'Can generate schema design',
  ARRAY['PostgreSQL', 'Airtable'],
  ARRAY['Database/SQL'],
  ARRAY['Database schema ready', 'Import process working'],
  ARRAY[]::TEXT[],
  ARRAY['Data quality'],
  false, true, 1);

SELECT insert_task('partner-expansion-tool', 'Outreach Sequence Builder',
  'Build email/phone outreach sequence management system.',
  'development', 'Technology', '20-25h', 'medium', 'high',
  'Can generate sequence templates',
  ARRAY['Node.js', 'Email API'],
  ARRAY['API Integration', 'Marketing Automation'],
  ARRAY['Sequences configurable', 'Tracking working', 'Templates ready'],
  ARRAY[]::TEXT[],
  ARRAY['Deliverability'],
  false, true, 2);

SELECT insert_task('partner-expansion-tool', 'Engagement Scoring',
  'Build scoring system to prioritize engaged prospects.',
  'development', 'Technology', '15-20h', 'medium', 'high',
  'Can generate scoring algorithms',
  ARRAY['Node.js', 'PostgreSQL'],
  ARRAY['Data Analytics', 'Business Logic'],
  ARRAY['Scoring active', 'Priorities updating', 'Accuracy validated'],
  ARRAY['Improved conversion rate'],
  ARRAY['Score accuracy'],
  false, false, 3);

SELECT insert_task('partner-expansion-tool', 'Pipeline Dashboard',
  'Build dashboard to track partner acquisition pipeline.',
  'development', 'Technology', '15-20h', 'medium', 'high',
  'Can generate dashboard components',
  ARRAY['React', 'Chart.js'],
  ARRAY['Frontend/React'],
  ARRAY['Pipeline visible', 'Metrics tracking', 'Forecasting working'],
  ARRAY[]::TEXT[],
  ARRAY['Data freshness'],
  false, false, 4);

-- ============================================================================
-- INVESTOR PORTAL TASKS
-- ============================================================================

SELECT insert_task('investor-portal', 'Investor Reporting Requirements',
  'Document current investor reporting needs and frequency.',
  'discovery', 'Finance', '8-10h', 'easy', 'low',
  'Can help structure requirements',
  ARRAY['Documentation', 'Meetings'],
  ARRAY['Finance', 'Stakeholder Management'],
  ARRAY['Requirements documented', 'Report types defined'],
  ARRAY[]::TEXT[],
  ARRAY['Varying investor needs'],
  false, true, 0);

SELECT insert_task('investor-portal', 'KPI Dashboard Design',
  'Design investor-facing KPI dashboard with key metrics.',
  'planning', 'Finance', '10-15h', 'medium', 'medium',
  'Can suggest investor metrics',
  ARRAY['Design tools'],
  ARRAY['Finance', 'Data Analytics'],
  ARRAY['Dashboard designed', 'Metrics approved', 'Security considered'],
  ARRAY[]::TEXT[],
  ARRAY['Metric sensitivity'],
  false, true, 1);

SELECT insert_task('investor-portal', 'Secure Document Room',
  'Build secure document storage and sharing for investor materials.',
  'development', 'Technology', '20-25h', 'hard', 'medium',
  'Security-critical feature',
  ARRAY['Storage service', 'Auth system'],
  ARRAY['Security/Auth', 'API Integration'],
  ARRAY['Upload working', 'Access controls', 'Audit logging'],
  ARRAY['Zero security incidents'],
  ARRAY['Security vulnerabilities'],
  true, true, 2);

SELECT insert_task('investor-portal', 'AI Q&A System',
  'Build AI-powered Q&A for investor queries about company data.',
  'development', 'Technology', '25-30h', 'hard', 'high',
  'Can generate Q&A prompts',
  ARRAY['LLM API', 'RAG system'],
  ARRAY['LLM/Prompt Engineering', 'API Integration'],
  ARRAY['Q&A working', 'Accuracy validated', 'Sources cited'],
  ARRAY['Reduced investor query volume'],
  ARRAY['Accuracy of responses'],
  false, false, 3);

-- ============================================================================
-- INSTALLER PERFORMANCE TRACKING TASKS
-- ============================================================================

SELECT insert_task('installer-performance-tracking', 'SLA Definition',
  'Define SLA metrics and thresholds for installer performance.',
  'discovery', 'Operations', '8-10h', 'easy', 'medium',
  'Can suggest industry SLAs',
  ARRAY['Documentation', 'Stakeholder input'],
  ARRAY['Business Logic', 'Operations'],
  ARRAY['SLAs defined', 'Thresholds set', 'Installer buy-in'],
  ARRAY[]::TEXT[],
  ARRAY['Installer pushback'],
  false, true, 0);

SELECT insert_task('installer-performance-tracking', 'Performance Calculation Engine',
  'Build engine to calculate installer performance metrics.',
  'development', 'Technology', '20-25h', 'medium', 'high',
  'Can generate calculation logic',
  ARRAY['Node.js', 'PostgreSQL'],
  ARRAY['Database/SQL', 'Data Analytics'],
  ARRAY['Calculations accurate', 'Historical data processing', 'Real-time updates'],
  ARRAY[]::TEXT[],
  ARRAY['Data accuracy'],
  false, true, 1);

SELECT insert_task('installer-performance-tracking', 'Performance Dashboard',
  'Build dashboard showing installer rankings and metrics.',
  'development', 'Technology', '20-25h', 'medium', 'high',
  'Can generate dashboard components',
  ARRAY['React', 'Chart.js'],
  ARRAY['Frontend/React', 'Data Analytics'],
  ARRAY['Dashboard live', 'Rankings visible', 'Drill-downs working'],
  ARRAY['Clear performance visibility'],
  ARRAY['Dashboard performance'],
  false, true, 2);

SELECT insert_task('installer-performance-tracking', 'Alert System',
  'Build alerting for SLA breaches and performance issues.',
  'development', 'Technology', '10-15h', 'easy', 'high',
  'Can generate alert rules',
  ARRAY['Node.js', 'Slack API'],
  ARRAY['API Integration'],
  ARRAY['Alerts working', 'Escalation paths defined'],
  ARRAY['<1 hour breach detection'],
  ARRAY['Alert fatigue'],
  false, false, 3);

-- ============================================================================
-- DYNAMIC ALLOCATION ENGINE TASKS
-- ============================================================================

SELECT insert_task('dynamic-allocation-engine', 'Allocation Rules Discovery',
  'Document current allocation rules and desired improvements.',
  'discovery', 'Operations', '10-15h', 'medium', 'medium',
  'Can help document rules',
  ARRAY['Documentation', 'Stakeholder input'],
  ARRAY['Business Logic', 'Operations'],
  ARRAY['Current rules documented', 'Improvement opportunities identified'],
  ARRAY[]::TEXT[],
  ARRAY['Rule complexity'],
  false, true, 0);

SELECT insert_task('dynamic-allocation-engine', 'Scoring Model Design',
  'Design lead-installer matching scoring model.',
  'planning', 'Technology', '20-25h', 'hard', 'medium',
  'Can suggest scoring factors',
  ARRAY['Data analysis', 'ML tools'],
  ARRAY['AI/ML', 'Business Logic'],
  ARRAY['Model designed', 'Factors weighted', 'Validation plan'],
  ARRAY[]::TEXT[],
  ARRAY['Model complexity'],
  true, true, 1);

SELECT insert_task('dynamic-allocation-engine', 'Real-time Router',
  'Build real-time lead routing engine.',
  'development', 'Technology', '35-45h', 'hard', 'medium',
  'Performance-critical system',
  ARRAY['Node.js', 'Redis', 'PostgreSQL'],
  ARRAY['API Integration', 'Database/SQL'],
  ARRAY['Router working', '<100ms latency', 'Fallback logic'],
  ARRAY['Improved conversion rate'],
  ARRAY['System reliability'],
  false, true, 2);

SELECT insert_task('dynamic-allocation-engine', 'Capacity Management',
  'Build installer capacity tracking and management.',
  'development', 'Technology', '20-25h', 'medium', 'high',
  'Can generate capacity logic',
  ARRAY['Node.js', 'PostgreSQL'],
  ARRAY['Database/SQL', 'Business Logic'],
  ARRAY['Capacity tracking', 'Real-time updates', 'Override capability'],
  ARRAY['No over-allocation'],
  ARRAY['Capacity accuracy'],
  false, false, 3);

SELECT insert_task('dynamic-allocation-engine', 'Allocation Dashboard',
  'Build dashboard showing allocation decisions and performance.',
  'development', 'Technology', '15-20h', 'medium', 'high',
  'Can generate dashboard components',
  ARRAY['React', 'Chart.js'],
  ARRAY['Frontend/React'],
  ARRAY['Dashboard live', 'Decisions visible', 'Override UI'],
  ARRAY[]::TEXT[],
  ARRAY['Dashboard performance'],
  false, false, 4);

-- ============================================================================
-- WHATSAPP CONVERSATION SUMMARY TASKS
-- ============================================================================

SELECT insert_task('whatsapp-conversation-summary', 'Summary Requirements',
  'Define what information should be included in conversation summaries.',
  'discovery', 'Operations', '6-8h', 'easy', 'medium',
  'Can suggest summary formats',
  ARRAY['SDR interviews', 'Documentation'],
  ARRAY['Business Logic'],
  ARRAY['Summary format defined', 'Key points identified'],
  ARRAY[]::TEXT[],
  ARRAY['SDR preferences vary'],
  false, true, 0);

SELECT insert_task('whatsapp-conversation-summary', 'LLM Prompt Engineering',
  'Design and test prompts for generating accurate summaries.',
  'development', 'Technology', '15-20h', 'medium', 'high',
  'Core AI task',
  ARRAY['LLM API', 'Testing tools'],
  ARRAY['LLM/Prompt Engineering'],
  ARRAY['Prompts tested', 'Quality validated', 'Edge cases handled'],
  ARRAY['Summary accuracy >90%'],
  ARRAY['Quality variance'],
  false, true, 1);

SELECT insert_task('whatsapp-conversation-summary', 'Summary API',
  'Build API endpoint for generating conversation summaries.',
  'development', 'Technology', '15-20h', 'medium', 'high',
  'Can generate API code',
  ARRAY['Node.js', 'LLM API'],
  ARRAY['API Integration', 'LLM/Prompt Engineering'],
  ARRAY['API working', 'Caching implemented', 'Error handling'],
  ARRAY['<3s summary generation'],
  ARRAY['LLM costs', 'Latency'],
  false, true, 2);

SELECT insert_task('whatsapp-conversation-summary', 'SDR Portal Integration',
  'Integrate summaries into SDR portal call prep view.',
  'development', 'Technology', '10-15h', 'medium', 'high',
  'Can generate integration code',
  ARRAY['React'],
  ARRAY['Frontend/React'],
  ARRAY['Integration complete', 'UX validated'],
  ARRAY['SDR satisfaction'],
  ARRAY['Portal changes'],
  false, false, 3);

-- ============================================================================
-- CONTACT PRIORITIZATION ENGINE TASKS
-- ============================================================================

SELECT insert_task('contact-prioritization-engine', 'Prioritization Factors Analysis',
  'Analyze historical data to identify factors that predict conversion.',
  'discovery', 'Technology', '15-20h', 'hard', 'medium',
  'Can help with data analysis',
  ARRAY['Data analysis tools', 'CRM data'],
  ARRAY['Data Analytics', 'AI/ML'],
  ARRAY['Factors identified', 'Correlations validated'],
  ARRAY[]::TEXT[],
  ARRAY['Data quality'],
  false, true, 0);

SELECT insert_task('contact-prioritization-engine', 'Scoring Model Development',
  'Develop ML model for contact prioritization.',
  'development', 'Technology', '30-40h', 'hard', 'medium',
  'Can assist with feature engineering',
  ARRAY['Python', 'ML libraries'],
  ARRAY['AI/ML', 'Data Analytics'],
  ARRAY['Model trained', 'Accuracy validated', 'Bias checked'],
  ARRAY['Improved contact rate'],
  ARRAY['Model accuracy', 'Data drift'],
  true, true, 1);

SELECT insert_task('contact-prioritization-engine', 'Scoring API',
  'Build API for real-time contact scoring.',
  'development', 'Technology', '15-20h', 'medium', 'high',
  'Can generate API code',
  ARRAY['Node.js', 'ML model serving'],
  ARRAY['API Integration', 'AI/ML'],
  ARRAY['API working', '<100ms latency', 'Batch scoring'],
  ARRAY[]::TEXT[],
  ARRAY['Latency requirements'],
  false, true, 2);

SELECT insert_task('contact-prioritization-engine', 'SDR Queue Integration',
  'Integrate scoring into SDR contact queue.',
  'development', 'Technology', '15-20h', 'medium', 'high',
  'Can generate integration code',
  ARRAY['React'],
  ARRAY['Frontend/React'],
  ARRAY['Queue sorted by score', 'Score visible', 'Manual override'],
  ARRAY['SDR productivity improvement'],
  ARRAY['SDR trust in scores'],
  false, false, 3);

-- ============================================================================
-- REMAINING PROJECTS - SIMPLER TASK STRUCTURES
-- ============================================================================

-- Lead Recycling Workflow
SELECT insert_task('lead-recycling-workflow', 'Recycling Rules Definition',
  'Define rules for when and how to recycle lost leads.',
  'discovery', 'Operations', '8-10h', 'easy', 'medium',
  'Can suggest recycling patterns',
  ARRAY['Documentation', 'CRM data'],
  ARRAY['Business Logic'],
  ARRAY['Rules defined', 'Timing documented'],
  ARRAY[]::TEXT[],
  ARRAY['Rule complexity'],
  false, true, 0);

SELECT insert_task('lead-recycling-workflow', 'Recycling Automation',
  'Build automated workflow for lead recycling.',
  'development', 'Technology', '25-30h', 'medium', 'high',
  'Can generate automation logic',
  ARRAY['Node.js', 'CRM API'],
  ARRAY['API Integration', 'Business Logic'],
  ARRAY['Automation working', 'Rules executing', 'Tracking active'],
  ARRAY['Recycled lead conversion rate'],
  ARRAY['Over-contacting'],
  false, true, 1);

SELECT insert_task('lead-recycling-workflow', 'Recycling Dashboard',
  'Build dashboard for recycling performance.',
  'development', 'Technology', '15-20h', 'medium', 'high',
  'Can generate dashboard components',
  ARRAY['React', 'Chart.js'],
  ARRAY['Frontend/React'],
  ARRAY['Dashboard live', 'Metrics visible'],
  ARRAY[]::TEXT[],
  ARRAY['Data accuracy'],
  false, false, 2);

-- Installer Feedback System
SELECT insert_task('installer-feedback-system', 'Feedback Form Design',
  'Design structured feedback form for installers.',
  'planning', 'Operations', '6-8h', 'easy', 'medium',
  'Can suggest feedback questions',
  ARRAY['Form tools'],
  ARRAY['UX Design', 'Business Logic'],
  ARRAY['Form designed', 'Questions validated'],
  ARRAY[]::TEXT[],
  ARRAY['Low completion rate'],
  false, true, 0);

SELECT insert_task('installer-feedback-system', 'Feedback Collection System',
  'Build system to collect and store installer feedback.',
  'development', 'Technology', '20-25h', 'medium', 'high',
  'Can generate form and API code',
  ARRAY['React', 'Node.js', 'PostgreSQL'],
  ARRAY['Frontend/React', 'API Integration'],
  ARRAY['Collection working', 'Data stored', 'Notifications sent'],
  ARRAY['80% feedback submission rate'],
  ARRAY['Installer adoption'],
  false, true, 1);

SELECT insert_task('installer-feedback-system', 'Feedback Analytics',
  'Build analytics for feedback trends and insights.',
  'development', 'Technology', '12-15h', 'medium', 'high',
  'Can generate analytics code',
  ARRAY['React', 'Chart.js'],
  ARRAY['Data Analytics'],
  ARRAY['Analytics live', 'Trends visible'],
  ARRAY['Actionable insights'],
  ARRAY['Data volume'],
  false, false, 2);

-- Installer Quote Sync
SELECT insert_task('installer-quote-sync', 'Quote Data Mapping',
  'Map quote data fields between installer systems and CRM.',
  'planning', 'Technology', '6-8h', 'easy', 'medium',
  'Can help with data mapping',
  ARRAY['Documentation'],
  ARRAY['Database/SQL', 'Business Logic'],
  ARRAY['Mapping complete', 'Validation rules defined'],
  ARRAY[]::TEXT[],
  ARRAY['Data inconsistencies'],
  false, true, 0);

SELECT insert_task('installer-quote-sync', 'Quote Sync API',
  'Build API for real-time quote synchronization.',
  'development', 'Technology', '20-25h', 'medium', 'high',
  'Can generate sync code',
  ARRAY['Node.js', 'CRM API'],
  ARRAY['API Integration'],
  ARRAY['Sync working', 'Conflicts handled', 'Audit logging'],
  ARRAY['<5 min sync delay'],
  ARRAY['Data conflicts'],
  false, true, 1);

-- Answer Rate Monitoring
SELECT insert_task('answer-rate-monitoring', 'Metric Definitions',
  'Define answer rate metrics and segmentation.',
  'planning', 'Operations', '4-6h', 'easy', 'medium',
  'Can suggest metrics',
  ARRAY['Documentation'],
  ARRAY['Data Analytics'],
  ARRAY['Metrics defined', 'Segments identified'],
  ARRAY[]::TEXT[],
  ARRAY['Segment complexity'],
  false, true, 0);

SELECT insert_task('answer-rate-monitoring', 'Monitoring Dashboard',
  'Build real-time answer rate monitoring dashboard.',
  'development', 'Technology', '20-25h', 'medium', 'high',
  'Can generate dashboard components',
  ARRAY['React', 'Chart.js', 'Aircall API'],
  ARRAY['Frontend/React', 'API Integration'],
  ARRAY['Dashboard live', 'Real-time updates', 'Alerts working'],
  ARRAY['<5 min latency'],
  ARRAY['API reliability'],
  false, true, 1);

-- GDPR Compliance Tracker
SELECT insert_task('gdpr-compliance-tracker', 'Compliance Requirements Analysis',
  'Analyze GDPR requirements and current gaps.',
  'discovery', 'Legal', '15-20h', 'hard', 'low',
  'Legal expertise required',
  ARRAY['Legal documentation'],
  ARRAY['Compliance', 'Legal'],
  ARRAY['Requirements documented', 'Gaps identified'],
  ARRAY[]::TEXT[],
  ARRAY['Regulatory complexity'],
  false, true, 0);

SELECT insert_task('gdpr-compliance-tracker', 'Consent Management System',
  'Build consent collection and management system.',
  'development', 'Technology', '25-30h', 'hard', 'medium',
  'Can generate consent UI',
  ARRAY['React', 'Node.js', 'PostgreSQL'],
  ARRAY['Security/Auth', 'Frontend/React'],
  ARRAY['Consent collection', 'Audit trail', 'Withdrawal process'],
  ARRAY['100% consent tracking'],
  ARRAY['Legal compliance'],
  true, true, 1);

SELECT insert_task('gdpr-compliance-tracker', 'Data Subject Rights Portal',
  'Build portal for data subject access requests.',
  'development', 'Technology', '15-20h', 'medium', 'medium',
  'Can generate portal UI',
  ARRAY['React', 'Node.js'],
  ARRAY['Frontend/React', 'Compliance'],
  ARRAY['Portal working', 'Request tracking', 'Response automation'],
  ARRAY['<30 day request fulfillment'],
  ARRAY['Request volume'],
  false, false, 2);

-- Automated Invoicing
SELECT insert_task('automated-invoicing', 'Invoicing Rules Definition',
  'Define invoicing rules based on lead outcomes.',
  'planning', 'Finance', '10-12h', 'medium', 'low',
  'Business logic heavy',
  ARRAY['Documentation', 'Accounting input'],
  ARRAY['Finance', 'Business Logic'],
  ARRAY['Rules defined', 'Edge cases documented'],
  ARRAY[]::TEXT[],
  ARRAY['Rule complexity'],
  false, true, 0);

SELECT insert_task('automated-invoicing', 'Invoice Generation Engine',
  'Build automated invoice generation system.',
  'development', 'Technology', '30-35h', 'hard', 'medium',
  'Can help with generation logic',
  ARRAY['Node.js', 'PDF generation', 'Accounting API'],
  ARRAY['API Integration', 'Finance'],
  ARRAY['Generation working', 'Calculations accurate', 'PDF output'],
  ARRAY['Zero invoicing errors'],
  ARRAY['Calculation errors'],
  true, true, 1);

SELECT insert_task('automated-invoicing', 'Invoice Dashboard',
  'Build dashboard for invoice tracking and reconciliation.',
  'development', 'Technology', '15-20h', 'medium', 'high',
  'Can generate dashboard components',
  ARRAY['React', 'Chart.js'],
  ARRAY['Frontend/React', 'Finance'],
  ARRAY['Dashboard live', 'Reconciliation working'],
  ARRAY['Reduced invoicing time'],
  ARRAY['Data accuracy'],
  false, false, 2);

-- API Self-Service Portal
SELECT insert_task('api-self-service-portal', 'Developer Experience Design',
  'Design developer portal UX and documentation structure.',
  'planning', 'Product', '12-15h', 'medium', 'medium',
  'Can suggest DX patterns',
  ARRAY['Design tools'],
  ARRAY['UX Design', 'API Integration'],
  ARRAY['Portal design complete', 'Documentation structure'],
  ARRAY[]::TEXT[],
  ARRAY['Scope creep'],
  false, true, 0);

SELECT insert_task('api-self-service-portal', 'API Key Management',
  'Build API key generation and management system.',
  'development', 'Technology', '20-25h', 'hard', 'medium',
  'Security critical',
  ARRAY['Node.js', 'PostgreSQL'],
  ARRAY['Security/Auth', 'API Integration'],
  ARRAY['Key generation', 'Rate limiting', 'Usage tracking'],
  ARRAY['Zero unauthorized access'],
  ARRAY['Security vulnerabilities'],
  true, true, 1);

SELECT insert_task('api-self-service-portal', 'Documentation Portal',
  'Build interactive API documentation portal.',
  'development', 'Technology', '25-30h', 'medium', 'high',
  'Can generate documentation',
  ARRAY['React', 'OpenAPI'],
  ARRAY['Frontend/React', 'API Integration'],
  ARRAY['Documentation live', 'Try-it-out working', 'Code samples'],
  ARRAY['Provider onboarding time'],
  ARRAY['Documentation maintenance'],
  false, true, 2);

-- Programmatic SEO Pages
SELECT insert_task('programmatic-seo-pages', 'Keyword Research',
  'Research location and topic keywords for SEO pages.',
  'discovery', 'Marketing', '15-20h', 'medium', 'medium',
  'Can help with keyword analysis',
  ARRAY['SEO tools', 'Keyword research'],
  ARRAY['Marketing', 'SEO'],
  ARRAY['Keywords identified', 'Search volume mapped'],
  ARRAY[]::TEXT[],
  ARRAY['Competition analysis'],
  false, true, 0);

SELECT insert_task('programmatic-seo-pages', 'Page Template Design',
  'Design SEO-optimized page templates.',
  'planning', 'Marketing', '12-15h', 'medium', 'high',
  'Can suggest SEO patterns',
  ARRAY['Design tools', 'SEO guidelines'],
  ARRAY['Marketing', 'Frontend/React'],
  ARRAY['Templates designed', 'SEO elements included'],
  ARRAY[]::TEXT[],
  ARRAY['Template quality'],
  false, true, 1);

SELECT insert_task('programmatic-seo-pages', 'Page Generation System',
  'Build system for generating thousands of SEO pages.',
  'development', 'Technology', '35-45h', 'hard', 'high',
  'Can generate page templates',
  ARRAY['Next.js', 'PostgreSQL', 'Content APIs'],
  ARRAY['Frontend/React', 'Database/SQL'],
  ARRAY['Generation working', 'Pages indexed', 'Performance optimized'],
  ARRAY['Organic traffic increase'],
  ARRAY['Content quality', 'Indexing issues'],
  false, true, 2);

SELECT insert_task('programmatic-seo-pages', 'Municipal Data Integration',
  'Integrate municipal and location data for page content.',
  'development', 'Technology', '20-25h', 'medium', 'high',
  'Can help with data integration',
  ARRAY['Data APIs', 'PostgreSQL'],
  ARRAY['API Integration', 'Database/SQL'],
  ARRAY['Data integrated', 'Accuracy validated'],
  ARRAY[]::TEXT[],
  ARRAY['Data availability'],
  false, false, 3);

-- PVPC Savings Widget
SELECT insert_task('pvpc-savings-widget', 'Widget Design',
  'Design interactive savings calculator widget.',
  'planning', 'Marketing', '6-8h', 'easy', 'high',
  'Can generate widget design',
  ARRAY['Design tools'],
  ARRAY['UX Design', 'Marketing'],
  ARRAY['Widget designed', 'Calculations defined'],
  ARRAY[]::TEXT[],
  ARRAY['Calculation accuracy'],
  false, true, 0);

SELECT insert_task('pvpc-savings-widget', 'ESIOS API Integration',
  'Integrate ESIOS API for real-time electricity prices.',
  'development', 'Technology', '10-15h', 'medium', 'high',
  'Can generate integration code',
  ARRAY['Node.js', 'ESIOS API'],
  ARRAY['API Integration'],
  ARRAY['API connected', 'Prices updating', 'Caching working'],
  ARRAY[]::TEXT[],
  ARRAY['API availability'],
  true, true, 1);

SELECT insert_task('pvpc-savings-widget', 'Widget Development',
  'Build embeddable savings calculator widget.',
  'development', 'Technology', '15-20h', 'medium', 'high',
  'Can generate widget code',
  ARRAY['React', 'JavaScript'],
  ARRAY['Frontend/React'],
  ARRAY['Widget working', 'Embed script ready', 'Responsive design'],
  ARRAY['Widget engagement rate'],
  ARRAY['Browser compatibility'],
  false, true, 2);

-- IRPF Calculator
SELECT insert_task('irpf-calculator', 'Tax Rules Research',
  'Research current IRPF deduction rules for solar.',
  'discovery', 'Finance', '4-6h', 'easy', 'low',
  'Requires legal/tax expertise',
  ARRAY['Tax documentation'],
  ARRAY['Finance', 'Legal'],
  ARRAY['Rules documented', 'Thresholds identified'],
  ARRAY[]::TEXT[],
  ARRAY['Rule changes'],
  false, true, 0);

SELECT insert_task('irpf-calculator', 'Calculator Development',
  'Build interactive tax calculator.',
  'development', 'Technology', '12-15h', 'easy', 'high',
  'Can generate calculator logic',
  ARRAY['React', 'TypeScript'],
  ARRAY['Frontend/React'],
  ARRAY['Calculator working', 'Calculations validated', 'Mobile responsive'],
  ARRAY['Calculator usage'],
  ARRAY['Calculation errors'],
  false, true, 1);

-- GMB Automation
SELECT insert_task('gmb-automation', 'GMB Strategy Definition',
  'Define Google Business Profile strategy and content plan.',
  'planning', 'Marketing', '8-10h', 'easy', 'medium',
  'Can suggest GMB best practices',
  ARRAY['Documentation'],
  ARRAY['Marketing', 'SEO'],
  ARRAY['Strategy defined', 'Content calendar created'],
  ARRAY[]::TEXT[],
  ARRAY['Content volume'],
  false, true, 0);

SELECT insert_task('gmb-automation', 'GMB API Integration',
  'Integrate Google Business Profile API.',
  'development', 'Technology', '20-25h', 'hard', 'medium',
  'Platform-specific API',
  ARRAY['Google Business API', 'Node.js'],
  ARRAY['API Integration'],
  ARRAY['API connected', 'Posting working', 'Review management'],
  ARRAY[]::TEXT[],
  ARRAY['API restrictions'],
  true, true, 1);

SELECT insert_task('gmb-automation', 'Post Scheduling System',
  'Build post scheduling and automation system.',
  'development', 'Technology', '15-20h', 'medium', 'high',
  'Can generate scheduling logic',
  ARRAY['Node.js', 'PostgreSQL'],
  ARRAY['API Integration', 'Database/SQL'],
  ARRAY['Scheduling working', 'Multi-location support'],
  ARRAY['Posting consistency'],
  ARRAY['API rate limits'],
  false, false, 2);

-- Review Generation System
SELECT insert_task('review-generation-system', 'Review Strategy Definition',
  'Define review request timing and messaging strategy.',
  'planning', 'Operations', '6-8h', 'easy', 'medium',
  'Can suggest review patterns',
  ARRAY['Documentation'],
  ARRAY['Marketing', 'Operations'],
  ARRAY['Strategy defined', 'Timing rules set'],
  ARRAY[]::TEXT[],
  ARRAY['Customer fatigue'],
  false, true, 0);

SELECT insert_task('review-generation-system', 'Review Request Automation',
  'Build automated review request system.',
  'development', 'Technology', '20-25h', 'medium', 'high',
  'Can generate automation code',
  ARRAY['Node.js', 'Email/SMS APIs'],
  ARRAY['API Integration', 'Marketing Automation'],
  ARRAY['Requests sending', 'Timing optimized', 'Tracking active'],
  ARRAY['Review generation rate'],
  ARRAY['Spam concerns'],
  false, true, 1);

SELECT insert_task('review-generation-system', 'AI Review Responses',
  'Build AI-powered review response suggestions.',
  'development', 'Technology', '12-15h', 'medium', 'high',
  'Core AI task',
  ARRAY['LLM API'],
  ARRAY['LLM/Prompt Engineering'],
  ARRAY['Responses generating', 'Quality validated'],
  ARRAY['Response time reduction'],
  ARRAY['Response quality'],
  false, false, 2);

-- Competitor Intel Agent
SELECT insert_task('competitor-intel-agent', 'Competitor Identification',
  'Identify key competitors and monitoring priorities.',
  'discovery', 'Marketing', '6-8h', 'easy', 'medium',
  'Can help with research',
  ARRAY['Market research'],
  ARRAY['Marketing', 'Business Logic'],
  ARRAY['Competitors listed', 'Priorities set'],
  ARRAY[]::TEXT[],
  ARRAY['Market coverage'],
  false, true, 0);

SELECT insert_task('competitor-intel-agent', 'Ad Library Scraper',
  'Build scraper for competitor ad monitoring.',
  'development', 'Technology', '20-25h', 'hard', 'medium',
  'Platform restrictions apply',
  ARRAY['Scraping tools', 'Node.js'],
  ARRAY['API Integration', 'Web Scraping'],
  ARRAY['Scraper working', 'Ads collecting', 'Legal compliance'],
  ARRAY[]::TEXT[],
  ARRAY['Platform blocking', 'Legal concerns'],
  false, true, 1);

SELECT insert_task('competitor-intel-agent', 'AI Analysis System',
  'Build AI system for analyzing competitor activity.',
  'development', 'Technology', '15-20h', 'medium', 'high',
  'Core AI task',
  ARRAY['LLM API', 'Node.js'],
  ARRAY['LLM/Prompt Engineering', 'Data Analytics'],
  ARRAY['Analysis generating', 'Insights actionable'],
  ARRAY['Competitive insights'],
  ARRAY['Analysis quality'],
  false, false, 2);

-- Robinson Suppressor
SELECT insert_task('robinson-suppressor', 'Robinson List Integration Research',
  'Research Robinson List API and integration requirements.',
  'discovery', 'Legal', '6-8h', 'medium', 'low',
  'Compliance-specific',
  ARRAY['Documentation', 'API research'],
  ARRAY['Compliance', 'API Integration'],
  ARRAY['Requirements documented', 'Integration plan'],
  ARRAY[]::TEXT[],
  ARRAY['API availability'],
  false, true, 0);

SELECT insert_task('robinson-suppressor', 'Suppression System',
  'Build system for suppressing Robinson-listed contacts.',
  'development', 'Technology', '20-25h', 'medium', 'high',
  'Can generate suppression logic',
  ARRAY['Node.js', 'PostgreSQL'],
  ARRAY['API Integration', 'Database/SQL'],
  ARRAY['Suppression working', 'Audit logging', 'Real-time checking'],
  ARRAY['Zero Robinson violations'],
  ARRAY['API reliability'],
  true, true, 1);

-- Unified Quote API
SELECT insert_task('unified-quote-api', 'Quote Flow Analysis',
  'Analyze current quote flows across installer types.',
  'discovery', 'Operations', '10-12h', 'medium', 'medium',
  'Can help document flows',
  ARRAY['Documentation', 'Stakeholder input'],
  ARRAY['Business Logic', 'Operations'],
  ARRAY['Flows documented', 'Variations identified'],
  ARRAY[]::TEXT[],
  ARRAY['Installer diversity'],
  false, true, 0);

SELECT insert_task('unified-quote-api', 'Unified Quote Schema',
  'Design unified quote data schema.',
  'planning', 'Technology', '10-15h', 'hard', 'high',
  'Can generate schema',
  ARRAY['Documentation'],
  ARRAY['Database/SQL', 'Business Logic'],
  ARRAY['Schema designed', 'Validation rules'],
  ARRAY[]::TEXT[],
  ARRAY['Schema flexibility'],
  true, true, 1);

SELECT insert_task('unified-quote-api', 'Quote API Development',
  'Build unified quote submission and retrieval API.',
  'development', 'Technology', '35-40h', 'hard', 'high',
  'Can generate API code',
  ARRAY['Node.js', 'PostgreSQL', 'CRM API'],
  ARRAY['API Integration', 'Database/SQL'],
  ARRAY['API working', 'All installer types supported', 'CRM sync'],
  ARRAY['Quote submission rate'],
  ARRAY['Migration complexity'],
  false, true, 2);

SELECT insert_task('unified-quote-api', 'Quote Dashboard',
  'Build dashboard for quote management and analytics.',
  'development', 'Technology', '15-20h', 'medium', 'high',
  'Can generate dashboard',
  ARRAY['React', 'Chart.js'],
  ARRAY['Frontend/React', 'Data Analytics'],
  ARRAY['Dashboard live', 'Analytics working'],
  ARRAY[]::TEXT[],
  ARRAY['Data accuracy'],
  false, false, 3);

-- Clean up the helper function
DROP FUNCTION IF EXISTS insert_task;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check project counts
SELECT 'Projects' as type, COUNT(*) as count FROM projects
UNION ALL
SELECT 'Tasks' as type, COUNT(*) as count FROM tasks
UNION ALL
SELECT 'Teams' as type, COUNT(*) as count FROM teams
UNION ALL
SELECT 'Pillars' as type, COUNT(*) as count FROM pillars;

-- Show projects by pillar
SELECT p.name as pillar, COUNT(proj.id) as project_count
FROM pillars p
LEFT JOIN projects proj ON proj.pillar_id = p.id
GROUP BY p.name
ORDER BY p.name;

-- Show tasks per project
SELECT proj.title, COUNT(t.id) as task_count
FROM projects proj
LEFT JOIN tasks t ON t.project_id = proj.id
GROUP BY proj.title
ORDER BY task_count DESC;
