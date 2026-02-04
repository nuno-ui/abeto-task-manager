-- ============================================================================
-- SEED DATA: All 29 Projects
-- This script temporarily disables RLS to insert data
-- Run this in Supabase SQL Editor (which uses service role)
-- ============================================================================

-- Temporarily disable RLS on projects table
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

-- Insert all 29 projects
INSERT INTO projects (title, slug, description, why_it_matters, category, status, priority, difficulty, pillar_id, owner_team_id, estimated_hours_min, estimated_hours_max)
VALUES
  ('Unified Data Layer', 'unified-data-layer', 'Central API that aggregates all data sources (Zoho, Woztell, Aircall, Holded) into a unified, consistent interface.', 'Foundation for all other projects. Without clean, unified data, nothing else works properly.', 'Data Infrastructure', 'in_progress', 'critical', 'hard', (SELECT id FROM pillars WHERE slug = 'data-foundation'), (SELECT id FROM teams WHERE slug = 'technology'), 180, 240),
  ('Reporting Hub', 'reporting-hub', 'Centralized reporting dashboard with automated weekly digests, provider ROI analysis, and performance metrics.', 'Gives leadership visibility into operations without manual report generation.', 'Analytics', 'planning', 'high', 'medium', (SELECT id FROM pillars WHERE slug = 'knowledge-generation'), (SELECT id FROM teams WHERE slug = 'operations'), 100, 140),
  ('SDR Portal', 'sdr-portal', 'Dedicated portal for SDRs with prioritized contact lists, WhatsApp summaries, AI qualification notes, and call prep tools.', 'Empowers SDRs to work more efficiently and make better contact decisions.', 'Sales Tools', 'in_progress', 'critical', 'hard', (SELECT id FROM pillars WHERE slug = 'human-empowerment'), (SELECT id FROM teams WHERE slug = 'technology'), 150, 200),
  ('Installer Portal & Product', 'installer-portal-product', 'Self-service portal for installers to manage leads, submit quotes, provide feedback, and track performance.', 'Reduces ops overhead and gives installers ownership of their pipeline.', 'Partner Tools', 'planning', 'high', 'hard', (SELECT id FROM pillars WHERE slug = 'human-empowerment'), (SELECT id FROM teams WHERE slug = 'technology'), 160, 220),
  ('AI Cortex', 'ai-cortex', 'Central AI/ML platform for lead scoring, conversation analysis, qualification automation, and predictive insights.', 'Leverages AI to augment human decision-making across all touchpoints.', 'AI/ML', 'idea', 'high', 'hard', (SELECT id FROM pillars WHERE slug = 'knowledge-generation'), (SELECT id FROM teams WHERE slug = 'technology'), 200, 280),
  ('Campaign OS', 'campaign-os', 'Lead provider management system with ROI tracking, validation automation, and performance optimization.', 'Optimizes marketing spend by identifying best-performing lead sources.', 'Marketing', 'planning', 'high', 'medium', (SELECT id FROM pillars WHERE slug = 'knowledge-generation'), (SELECT id FROM teams WHERE slug = 'marketing'), 100, 140),
  ('Data Quality Monitor', 'data-quality-monitor', 'Real-time monitoring of data quality across all systems with alerts for anomalies and degradation.', 'Ensures data integrity and catches issues before they impact operations.', 'Data Infrastructure', 'idea', 'medium', 'medium', (SELECT id FROM pillars WHERE slug = 'data-foundation'), (SELECT id FROM teams WHERE slug = 'technology'), 60, 90),
  ('Funnel Automation OS', 'funnel-automation-os', 'Automated lead nurturing flows via WhatsApp and email based on lead behavior and stage.', 'Increases contact rates and conversions through timely, relevant outreach.', 'Automation', 'planning', 'high', 'medium', (SELECT id FROM pillars WHERE slug = 'human-empowerment'), (SELECT id FROM teams WHERE slug = 'operations'), 120, 160),
  ('Partner Expansion Tool', 'partner-expansion-tool', 'CRM and outreach automation for recruiting new installer partners.', 'Scales installer network to handle growth in lead volume.', 'Partner Tools', 'idea', 'medium', 'medium', (SELECT id FROM pillars WHERE slug = 'human-empowerment'), (SELECT id FROM teams WHERE slug = 'sales'), 120, 160),
  ('Investor Portal', 'investor-portal', 'Secure portal for investors with real-time KPIs, document room, and AI Q&A.', 'Reduces investor reporting overhead and provides transparency.', 'Finance', 'idea', 'low', 'medium', (SELECT id FROM pillars WHERE slug = 'human-empowerment'), (SELECT id FROM teams WHERE slug = 'finance'), 100, 140),
  ('Installer Performance Tracking', 'installer-performance-tracking', 'Dashboard and alerting for installer SLAs, conversion rates, and quality metrics.', 'Identifies underperforming installers and rewards top performers.', 'Analytics', 'planning', 'high', 'medium', (SELECT id FROM pillars WHERE slug = 'knowledge-generation'), (SELECT id FROM teams WHERE slug = 'operations'), 90, 120),
  ('Dynamic Allocation Engine', 'dynamic-allocation-engine', 'Real-time lead-to-installer matching based on capacity, performance, and geography.', 'Maximizes conversion by matching leads with best-fit installers.', 'Automation', 'idea', 'high', 'hard', (SELECT id FROM pillars WHERE slug = 'knowledge-generation'), (SELECT id FROM teams WHERE slug = 'technology'), 140, 180),
  ('WhatsApp Conversation Summary', 'whatsapp-conversation-summary', 'AI-powered summaries of WhatsApp conversations for SDR call prep.', 'Saves SDR time and improves call quality with context.', 'AI/ML', 'idea', 'medium', 'medium', (SELECT id FROM pillars WHERE slug = 'knowledge-generation'), (SELECT id FROM teams WHERE slug = 'technology'), 60, 80),
  ('Contact Prioritization Engine', 'contact-prioritization-engine', 'Scoring algorithm to prioritize which leads to contact first based on conversion likelihood.', 'Focuses SDR effort on highest-potential leads.', 'AI/ML', 'idea', 'high', 'hard', (SELECT id FROM pillars WHERE slug = 'knowledge-generation'), (SELECT id FROM teams WHERE slug = 'technology'), 80, 110),
  ('Lead Recycling Workflow', 'lead-recycling-workflow', 'Automated re-engagement of lost leads based on timing and reason for loss.', 'Recovers value from leads that would otherwise be wasted.', 'Automation', 'idea', 'medium', 'medium', (SELECT id FROM pillars WHERE slug = 'human-empowerment'), (SELECT id FROM teams WHERE slug = 'operations'), 70, 90),
  ('Installer Feedback System', 'installer-feedback-system', 'Structured feedback collection from installers on lead quality.', 'Closes the loop on lead quality and informs provider decisions.', 'Data Infrastructure', 'idea', 'medium', 'easy', (SELECT id FROM pillars WHERE slug = 'data-foundation'), (SELECT id FROM teams WHERE slug = 'operations'), 50, 70),
  ('Installer Quote Sync', 'installer-quote-sync', 'Real-time sync of installer quotes back to CRM.', 'Eliminates manual quote entry and provides visibility.', 'Data Infrastructure', 'idea', 'medium', 'easy', (SELECT id FROM pillars WHERE slug = 'data-foundation'), (SELECT id FROM teams WHERE slug = 'technology'), 45, 60),
  ('Answer Rate Monitoring', 'answer-rate-monitoring', 'Real-time tracking of call answer rates by segment with alerting.', 'Identifies contact rate issues quickly.', 'Analytics', 'idea', 'low', 'easy', (SELECT id FROM pillars WHERE slug = 'knowledge-generation'), (SELECT id FROM teams WHERE slug = 'operations'), 40, 55),
  ('GDPR Compliance Tracker', 'gdpr-compliance-tracker', 'Consent management and data subject rights portal.', 'Ensures legal compliance and avoids fines.', 'Compliance', 'idea', 'medium', 'hard', (SELECT id FROM pillars WHERE slug = 'data-foundation'), (SELECT id FROM teams WHERE slug = 'legal'), 60, 80),
  ('Automated Invoicing', 'automated-invoicing', 'Automatic invoice generation based on lead outcomes.', 'Eliminates manual invoicing and reduces errors.', 'Finance', 'idea', 'medium', 'medium', (SELECT id FROM pillars WHERE slug = 'human-empowerment'), (SELECT id FROM teams WHERE slug = 'finance'), 70, 90),
  ('API Self-Service Portal', 'api-self-service-portal', 'Developer portal for lead providers to integrate directly.', 'Reduces integration overhead and scales provider onboarding.', 'Data Infrastructure', 'idea', 'low', 'hard', (SELECT id FROM pillars WHERE slug = 'data-foundation'), (SELECT id FROM teams WHERE slug = 'technology'), 80, 100),
  ('Programmatic SEO Pages', 'programmatic-seo-pages', 'Auto-generated location and topic pages for organic traffic.', 'Drives free organic leads at scale.', 'Marketing', 'idea', 'medium', 'hard', (SELECT id FROM pillars WHERE slug = 'human-empowerment'), (SELECT id FROM teams WHERE slug = 'marketing'), 100, 130),
  ('PVPC Savings Widget', 'pvpc-savings-widget', 'Embeddable widget showing real-time electricity savings.', 'Engages visitors with personalized value prop.', 'Marketing', 'idea', 'low', 'medium', (SELECT id FROM pillars WHERE slug = 'human-empowerment'), (SELECT id FROM teams WHERE slug = 'marketing'), 35, 50),
  ('IRPF Calculator', 'irpf-calculator', 'Tax deduction calculator for solar installations.', 'Helps customers understand financial benefits.', 'Marketing', 'idea', 'low', 'easy', (SELECT id FROM pillars WHERE slug = 'human-empowerment'), (SELECT id FROM teams WHERE slug = 'marketing'), 25, 35),
  ('GMB Automation', 'gmb-automation', 'Automated Google Business Profile management.', 'Improves local SEO and manages reviews at scale.', 'Marketing', 'idea', 'low', 'medium', (SELECT id FROM pillars WHERE slug = 'human-empowerment'), (SELECT id FROM teams WHERE slug = 'marketing'), 55, 75),
  ('Review Generation System', 'review-generation-system', 'Automated review request system post-installation.', 'Builds social proof and improves local rankings.', 'Marketing', 'idea', 'low', 'medium', (SELECT id FROM pillars WHERE slug = 'human-empowerment'), (SELECT id FROM teams WHERE slug = 'marketing'), 45, 60),
  ('Competitor Intel Agent', 'competitor-intel-agent', 'Automated monitoring of competitor ads, pricing, and activity.', 'Keeps us informed of market dynamics.', 'Marketing', 'idea', 'low', 'hard', (SELECT id FROM pillars WHERE slug = 'knowledge-generation'), (SELECT id FROM teams WHERE slug = 'marketing'), 50, 70),
  ('Robinson Suppressor', 'robinson-suppressor', 'Integration with Robinson List for contact suppression.', 'Ensures legal compliance with do-not-call lists.', 'Compliance', 'idea', 'medium', 'medium', (SELECT id FROM pillars WHERE slug = 'data-foundation'), (SELECT id FROM teams WHERE slug = 'legal'), 35, 50),
  ('Unified Quote API', 'unified-quote-api', 'Standardized quote flow across all installer types.', 'Simplifies quote management and improves data quality.', 'Data Infrastructure', 'idea', 'medium', 'hard', (SELECT id FROM pillars WHERE slug = 'data-foundation'), (SELECT id FROM teams WHERE slug = 'technology'), 80, 100)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  why_it_matters = EXCLUDED.why_it_matters,
  category = EXCLUDED.category,
  status = EXCLUDED.status,
  priority = EXCLUDED.priority,
  difficulty = EXCLUDED.difficulty,
  pillar_id = EXCLUDED.pillar_id,
  owner_team_id = EXCLUDED.owner_team_id,
  estimated_hours_min = EXCLUDED.estimated_hours_min,
  estimated_hours_max = EXCLUDED.estimated_hours_max;

-- Re-enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Verify the insert
SELECT 'Projects inserted: ' || COUNT(*)::text as result FROM projects;
