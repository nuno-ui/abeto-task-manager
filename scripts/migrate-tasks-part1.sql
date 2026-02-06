-- =============================================================================
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

    -- =========================================================================
    -- UNIFIED DATA LAYER
    -- =========================================================================
    SELECT id INTO project_record FROM projects WHERE slug = 'unified-data-layer';
    IF project_record.id IS NOT NULL THEN
        -- Check if project already has tasks
        SELECT COUNT(*) INTO existing_task_count FROM tasks WHERE project_id = project_record.id;
        IF existing_task_count = 0 THEN
            task_order := 0;

        -- Task: Data Audit & Gap Analysis
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Data Audit & Gap Analysis',
            'Audit all existing data sources (Zoho, Woztell, Aircall, Holded). Document current data flows, identify gaps, inconsistencies, and missing fields. Create data dictionary.',
            'discovery',
            'not_started',
            'medium',
            '16-24h',
            'medium',
            'Can help analyze data schemas and generate documentation templates',
            ARRAY['Notion', 'Spreadsheets', 'Existing system access'],
            ARRAY['Data Analytics', 'Business Logic'],
            ARRAY['Complete inventory of all data sources', 'Data dictionary with field definitions', 'Gap analysis document with prioritized missing data', 'Data flow diagrams for current state'],
            ARRAY['100% of data sources documented', 'All critical gaps identified'],
            ARRAY['Access delays to production systems', 'Undocumented legacy data'],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Stakeholder Requirements Workshop
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Stakeholder Requirements Workshop',
            'Conduct workshops with Sales, Ops, Finance, and Leadership to understand data needs. Document use cases, reporting requirements, and pain points.',
            'discovery',
            'not_started',
            'easy',
            '8-12h',
            'low',
            'Can help structure workshop agenda and document outputs',
            ARRAY['Meeting tools', 'Notion', 'Whiteboard'],
            ARRAY['Stakeholder Management', 'Business Logic'],
            ARRAY['Workshop conducted with all key stakeholders', 'Requirements document approved by stakeholders', 'Priority ranking of data needs', 'Success criteria defined for each use case'],
            ARRAY[]::TEXT[],
            ARRAY['Stakeholder availability', 'Conflicting requirements'],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: API Architecture Design
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'API Architecture Design',
            'Design API architecture including endpoints, authentication, rate limiting, caching strategy. Define data models and relationships. Create technical specification document.',
            'planning',
            'not_started',
            'hard',
            '20-30h',
            'high',
            'Can generate OpenAPI specs, data models, and architecture diagrams',
            ARRAY['Architecture tools', 'Documentation'],
            ARRAY['API Integration', 'Database/SQL', 'Security/Auth'],
            ARRAY['OpenAPI specification document', 'Database schema design', 'Authentication flow documented', 'Caching strategy defined', 'Rate limiting rules specified'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            TRUE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Third-Party API Access & Contracts
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Third-Party API Access & Contracts',
            'Secure API access and documentation for all third-party systems. Negotiate contracts if needed. Document API limits, costs, and SLAs.',
            'planning',
            'not_started',
            'medium',
            '8-16h',
            'low',
            'Vendor negotiation requires human judgment',
            ARRAY['Contract management', 'Vendor portals'],
            ARRAY['Vendor Management', 'Compliance/Legal'],
            ARRAY['Zoho API access confirmed with documented limits', 'Woztell API access and documentation obtained', 'Aircall API credentials and documentation', 'Holded API access for financial data', 'All API rate limits and costs documented'],
            ARRAY[]::TEXT[],
            ARRAY['Vendor delays', 'Unexpected costs', 'API limitations'],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Core API Infrastructure Setup
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Core API Infrastructure Setup',
            'Set up API server, database, authentication system, logging, and monitoring. Deploy to staging environment.',
            'development',
            'not_started',
            'hard',
            '24-32h',
            'high',
            'Can generate boilerplate code, database migrations, and deployment configs',
            ARRAY['Node.js', 'PostgreSQL', 'Vercel/Railway', 'Auth0/JWT'],
            ARRAY['API Integration', 'Database/SQL', 'DevOps', 'Security/Auth'],
            ARRAY['API server running in staging', 'Database deployed and accessible', 'Authentication system working', 'Logging and monitoring active', 'CI/CD pipeline configured'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            TRUE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Deals & Opportunities Endpoints
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Deals & Opportunities Endpoints',
            'Build endpoints for Deals and Opportunities including CRUD operations, filtering, pagination, and Zoho sync.',
            'development',
            'not_started',
            'medium',
            '20-28h',
            'high',
            'Can generate CRUD endpoints, data models, and sync logic',
            ARRAY['Node.js', 'PostgreSQL', 'Zoho API'],
            ARRAY['API Integration', 'Database/SQL'],
            ARRAY['GET /deals with pagination and filters', 'GET /deals/:id with full details', 'GET /deals/stats with aggregations', 'GET /opportunities with installer filter', 'Real-time sync with Zoho CRM', 'Stage change timestamps captured'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Calls & Qualifications Endpoints
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Calls & Qualifications Endpoints',
            'Build endpoints for Calls and Qualifications data. Integrate with Aircall for call data. Support transcription storage.',
            'development',
            'not_started',
            'medium',
            '16-24h',
            'medium',
            'Can generate API integration code and data models',
            ARRAY['Node.js', 'PostgreSQL', 'Aircall API'],
            ARRAY['API Integration', 'Database/SQL', 'External APIs'],
            ARRAY['GET /calls with pagination and date filters', 'GET /calls/:id with recording URL', 'Call transcripts stored and searchable', 'GET /qualifications with deal linkage', 'Aircall webhook integration working'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: WhatsApp Conversation History
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'WhatsApp Conversation History',
            'Build endpoints for WhatsApp conversation history. Integrate with Woztell API to pull full message history per deal.',
            'development',
            'not_started',
            'hard',
            '20-30h',
            'medium',
            'Can help with data mapping and pagination handling',
            ARRAY['Node.js', 'PostgreSQL', 'Woztell API'],
            ARRAY['API Integration', 'Database/SQL', 'External APIs'],
            ARRAY['GET /deals/:id/messages with full history', 'Message direction (inbound/outbound) tracked', 'Timestamps accurate to the second', 'Media attachments referenced', 'Webhook for real-time updates'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            TRUE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Installers & Regions Endpoints
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Installers & Regions Endpoints',
            'Build endpoints for Installers and Regions data. Include performance metrics, capacity, and geographic coverage.',
            'development',
            'not_started',
            'medium',
            '12-18h',
            'high',
            'Can generate CRUD endpoints and relationship models',
            ARRAY['Node.js', 'PostgreSQL'],
            ARRAY['API Integration', 'Database/SQL'],
            ARRAY['GET /installers with active/inactive filter', 'GET /installers/:id with regions and metrics', 'GET /regions with postal code coverage', 'Installer capacity and quota tracking', 'Performance metrics per installer'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: API Testing & Quality Assurance
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'API Testing & Quality Assurance',
            'Comprehensive testing of all API endpoints. Load testing, security audit, edge case handling. Fix bugs and optimize performance.',
            'testing',
            'not_started',
            'medium',
            '16-24h',
            'high',
            'Can generate test cases, mocks, and load test scripts',
            ARRAY['Jest', 'Postman', 'Load testing tools'],
            ARRAY['API Integration', 'Security/Auth', 'DevOps'],
            ARRAY['Unit tests for all endpoints (>80% coverage)', 'Integration tests passing', 'Load test: handles 100 req/s', 'Security audit completed', 'No critical/high bugs', 'Response times <500ms for 95% of requests'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: API Documentation & Developer Guide
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'API Documentation & Developer Guide',
            'Create comprehensive API documentation with examples. Build interactive API explorer. Write developer onboarding guide.',
            'training',
            'not_started',
            'easy',
            '12-16h',
            'high',
            'Can generate documentation from OpenAPI spec and code comments',
            ARRAY['Swagger/OpenAPI', 'Documentation platform'],
            ARRAY['Training & Documentation', 'API Integration'],
            ARRAY['Interactive API documentation live', 'All endpoints documented with examples', 'Authentication guide complete', 'Error code reference', 'Developer quickstart guide', 'Postman collection published'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Production Deployment & Monitoring
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Production Deployment & Monitoring',
            'Deploy API to production. Set up monitoring, alerting, and dashboards. Configure backup and disaster recovery.',
            'rollout',
            'not_started',
            'medium',
            '8-12h',
            'medium',
            'Can help with deployment configs and monitoring setup',
            ARRAY['Vercel/Railway', 'Monitoring tools', 'Alerting'],
            ARRAY['DevOps', 'Security/Auth'],
            ARRAY['API live in production', 'Health check endpoint responding', 'Monitoring dashboard configured', 'Alerts set for errors and latency', 'Database backups scheduled', 'Runbook for incident response'],
            ARRAY['99.9% uptime', '<200ms avg response time', 'Zero data loss'],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Ongoing Maintenance & Iteration
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Ongoing Maintenance & Iteration',
            'Establish ongoing maintenance process. Weekly review of API health, performance optimization, bug fixes, and feature requests.',
            'monitoring',
            'not_started',
            'easy',
            'Ongoing (4h/week)',
            'medium',
            'Can help analyze logs, identify patterns, and suggest optimizations',
            ARRAY['Monitoring tools', 'Issue tracker'],
            ARRAY['DevOps', 'Stakeholder Management'],
            ARRAY['Weekly health review process established', 'SLA monitoring in place', 'Feature request backlog maintained', 'Incident response process documented'],
            ARRAY['API health score >95%', 'All critical bugs fixed within 24h'],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        ELSE
            RAISE NOTICE 'Skipping unified-data-layer - already has % tasks', existing_task_count;
        END IF;
    END IF;

    -- =========================================================================
    -- REPORTING HUB
    -- =========================================================================
    SELECT id INTO project_record FROM projects WHERE slug = 'reporting-hub';
    IF project_record.id IS NOT NULL THEN
        -- Check if project already has tasks
        SELECT COUNT(*) INTO existing_task_count FROM tasks WHERE project_id = project_record.id;
        IF existing_task_count = 0 THEN
            task_order := 0;

        -- Task: KPI Discovery & Stakeholder Alignment
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'KPI Discovery & Stakeholder Alignment',
            'Meet with all department heads to understand reporting needs. Define KPIs, formulas, and success thresholds. Get sign-off on metrics definitions.',
            'discovery',
            'not_started',
            'medium',
            '12-16h',
            'medium',
            'Can suggest industry-standard KPIs and help document formulas',
            ARRAY['Meeting tools', 'Notion', 'Spreadsheets'],
            ARRAY['Stakeholder Management', 'Data Analytics', 'Business Logic'],
            ARRAY['KPI catalog with definitions approved by stakeholders', 'Formulas documented and validated', 'Thresholds defined (good/warning/critical)', 'Data sources identified for each KPI', 'Reporting frequency agreed (real-time, daily, weekly)'],
            ARRAY[]::TEXT[],
            ARRAY['Conflicting priorities between departments', 'Undefined metrics'],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Current State Analysis
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Current State Analysis',
            'Audit existing reports and dashboards. Identify manual reporting processes that can be automated. Document pain points and gaps.',
            'discovery',
            'not_started',
            'easy',
            '8-12h',
            'medium',
            'Can help analyze and categorize existing reports',
            ARRAY['Existing tools', 'Documentation'],
            ARRAY['Data Analytics', 'Process Design'],
            ARRAY['Inventory of all existing reports', 'Time spent on manual reporting quantified', 'Pain points documented', 'Automation opportunities identified'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Dashboard Design & Wireframes
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Dashboard Design & Wireframes',
            'Design dashboard layouts, information hierarchy, and user flows. Create wireframes for each stakeholder view. Get design approval.',
            'planning',
            'not_started',
            'medium',
            '12-16h',
            'medium',
            'Can suggest dashboard layouts and best practices',
            ARRAY['Figma', 'Wireframing tools'],
            ARRAY['UX Design', 'Data Analytics'],
            ARRAY['Wireframes for executive dashboard', 'Wireframes for department-specific views', 'Mobile-responsive design considered', 'Design approved by key stakeholders'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Data Pipeline Architecture
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Data Pipeline Architecture',
            'Design data pipeline for KPI calculations. Define aggregation schedules, caching strategy, and historical data retention.',
            'planning',
            'not_started',
            'hard',
            '8-12h',
            'high',
            'Can help design data models and aggregation logic',
            ARRAY['Architecture tools', 'Documentation'],
            ARRAY['Database/SQL', 'Data Analytics', 'DevOps'],
            ARRAY['Data pipeline architecture documented', 'Aggregation schedules defined', 'Caching strategy for real-time KPIs', 'Historical data retention policy', 'API endpoints defined for dashboard'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            TRUE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
