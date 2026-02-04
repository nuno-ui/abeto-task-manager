-- ============================================================================
-- SEED DATA: All 29 Projects and their Tasks from Abeto API Dashboard
-- Run this in Supabase SQL Editor after running schema.sql
-- ============================================================================

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
  (SELECT id FROM pillars WHERE slug = 'data-foundation'),
  (SELECT id FROM teams WHERE slug = 'technology'),
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
  (SELECT id FROM pillars WHERE slug = 'knowledge-generation'),
  (SELECT id FROM teams WHERE slug = 'operations'),
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
  (SELECT id FROM pillars WHERE slug = 'human-empowerment'),
  (SELECT id FROM teams WHERE slug = 'technology'),
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
  (SELECT id FROM pillars WHERE slug = 'human-empowerment'),
  (SELECT id FROM teams WHERE slug = 'technology'),
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
  (SELECT id FROM pillars WHERE slug = 'knowledge-generation'),
  (SELECT id FROM teams WHERE slug = 'technology'),
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
  (SELECT id FROM pillars WHERE slug = 'knowledge-generation'),
  (SELECT id FROM teams WHERE slug = 'marketing'),
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
  (SELECT id FROM pillars WHERE slug = 'data-foundation'),
  (SELECT id FROM teams WHERE slug = 'technology'),
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
  (SELECT id FROM pillars WHERE slug = 'human-empowerment'),
  (SELECT id FROM teams WHERE slug = 'operations'),
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
  (SELECT id FROM pillars WHERE slug = 'human-empowerment'),
  (SELECT id FROM teams WHERE slug = 'sales'),
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
  (SELECT id FROM pillars WHERE slug = 'human-empowerment'),
  (SELECT id FROM teams WHERE slug = 'finance'),
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
  (SELECT id FROM pillars WHERE slug = 'knowledge-generation'),
  (SELECT id FROM teams WHERE slug = 'operations'),
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
  (SELECT id FROM pillars WHERE slug = 'knowledge-generation'),
  (SELECT id FROM teams WHERE slug = 'technology'),
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
  (SELECT id FROM pillars WHERE slug = 'knowledge-generation'),
  (SELECT id FROM teams WHERE slug = 'technology'),
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
  (SELECT id FROM pillars WHERE slug = 'knowledge-generation'),
  (SELECT id FROM teams WHERE slug = 'technology'),
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
  (SELECT id FROM pillars WHERE slug = 'human-empowerment'),
  (SELECT id FROM teams WHERE slug = 'operations'),
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
  (SELECT id FROM pillars WHERE slug = 'data-foundation'),
  (SELECT id FROM teams WHERE slug = 'operations'),
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
  (SELECT id FROM pillars WHERE slug = 'data-foundation'),
  (SELECT id FROM teams WHERE slug = 'technology'),
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
  (SELECT id FROM pillars WHERE slug = 'knowledge-generation'),
  (SELECT id FROM teams WHERE slug = 'operations'),
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
  (SELECT id FROM pillars WHERE slug = 'data-foundation'),
  (SELECT id FROM teams WHERE slug = 'legal'),
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
  (SELECT id FROM pillars WHERE slug = 'human-empowerment'),
  (SELECT id FROM teams WHERE slug = 'finance'),
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
  (SELECT id FROM pillars WHERE slug = 'data-foundation'),
  (SELECT id FROM teams WHERE slug = 'technology'),
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
  (SELECT id FROM pillars WHERE slug = 'human-empowerment'),
  (SELECT id FROM teams WHERE slug = 'marketing'),
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
  (SELECT id FROM pillars WHERE slug = 'human-empowerment'),
  (SELECT id FROM teams WHERE slug = 'marketing'),
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
  (SELECT id FROM pillars WHERE slug = 'human-empowerment'),
  (SELECT id FROM teams WHERE slug = 'marketing'),
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
  (SELECT id FROM pillars WHERE slug = 'human-empowerment'),
  (SELECT id FROM teams WHERE slug = 'marketing'),
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
  (SELECT id FROM pillars WHERE slug = 'human-empowerment'),
  (SELECT id FROM teams WHERE slug = 'marketing'),
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
  (SELECT id FROM pillars WHERE slug = 'knowledge-generation'),
  (SELECT id FROM teams WHERE slug = 'marketing'),
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
  (SELECT id FROM pillars WHERE slug = 'data-foundation'),
  (SELECT id FROM teams WHERE slug = 'legal'),
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
  (SELECT id FROM pillars WHERE slug = 'data-foundation'),
  (SELECT id FROM teams WHERE slug = 'technology'),
  80, 100
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  why_it_matters = EXCLUDED.why_it_matters;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'Projects inserted: ' || COUNT(*)::text FROM projects;
