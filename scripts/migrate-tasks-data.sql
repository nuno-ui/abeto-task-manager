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
        task_order := task_order + 1;

        -- Task: KPI Calculation Engine
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'KPI Calculation Engine',
            'Build backend service for computing KPIs. Implement aggregations, calculations, and caching. Create API endpoints for dashboard.',
            'development',
            'not_started',
            'hard',
            '24-32h',
            'high',
            'Can generate SQL queries, aggregation logic, and API handlers',
            ARRAY['Node.js', 'PostgreSQL', 'Redis'],
            ARRAY['Database/SQL', 'Data Analytics', 'API Integration'],
            ARRAY['All KPIs calculating correctly', 'Real-time KPIs updating within 5 seconds', 'Historical snapshots stored daily', 'API endpoints returning correct data', 'Performance: calculations complete in <2s'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Dashboard Frontend Development
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Dashboard Frontend Development',
            'Build React dashboard with charts, tables, and filters. Implement responsive design and real-time updates.',
            'development',
            'not_started',
            'medium',
            '32-40h',
            'high',
            'Can generate chart components, layouts, and styling',
            ARRAY['React', 'Recharts/Chart.js', 'Tailwind'],
            ARRAY['Frontend/React', 'UX Design', 'Data Analytics'],
            ARRAY['Executive dashboard complete', 'Department views implemented', 'Charts rendering correctly', 'Filters and date ranges working', 'Mobile responsive', 'Real-time updates functioning'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            TRUE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Export & Scheduling Features
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Export & Scheduling Features',
            'Add PDF/Excel export functionality. Implement scheduled email reports with customizable frequency.',
            'development',
            'not_started',
            'medium',
            '12-16h',
            'high',
            'Can generate PDF templates and scheduling logic',
            ARRAY['React-PDF', 'Node-cron', 'SendGrid'],
            ARRAY['Frontend/React', 'DevOps', 'API Integration'],
            ARRAY['PDF export working for all dashboards', 'Excel export with proper formatting', 'Scheduled reports configurable', 'Email delivery reliable'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Data Validation & UAT
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Data Validation & UAT',
            'Validate KPI calculations against manual calculations. Conduct user acceptance testing with stakeholders. Fix discrepancies.',
            'testing',
            'not_started',
            'medium',
            '16-24h',
            'medium',
            'Can help generate test cases and validation scripts',
            ARRAY['Spreadsheets', 'Testing tools'],
            ARRAY['Data Analytics', 'Business Logic'],
            ARRAY['All KPIs validated against source data', 'Finance sign-off on financial metrics', 'Sales sign-off on pipeline metrics', 'No calculation discrepancies', 'UAT sign-off from all stakeholders'],
            ARRAY[]::TEXT[],
            ARRAY['Discrepancies between systems', 'Stakeholder availability for UAT'],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Training & Documentation
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Training & Documentation',
            'Create user guides and video tutorials. Conduct training sessions for each department. Document KPI definitions and interpretations.',
            'training',
            'not_started',
            'easy',
            '12-16h',
            'high',
            'Can generate documentation and training materials',
            ARRAY['Documentation', 'Video recording', 'Training tools'],
            ARRAY['Training & Documentation', 'Change Management'],
            ARRAY['User guide published', 'Video tutorials recorded', 'Training sessions completed', 'KPI glossary published', 'FAQ documented'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Production Launch & Adoption
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Production Launch & Adoption',
            'Deploy to production. Announce to company. Monitor adoption and gather feedback. Iterate based on user input.',
            'rollout',
            'not_started',
            'easy',
            '8-12h',
            'low',
            'Human change management required',
            ARRAY['Communication tools', 'Analytics'],
            ARRAY['Change Management', 'Stakeholder Management'],
            ARRAY['Dashboard live in production', 'Company announcement sent', 'Adoption tracking in place', 'Feedback channel established', 'First week issues resolved'],
            ARRAY['80% of target users accessing weekly', 'Manual reporting time reduced by 60%'],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        ELSE
            RAISE NOTICE 'Skipping reporting-hub - already has % tasks', existing_task_count;
        END IF;
    END IF;

    -- =========================================================================
    -- SDR PORTAL
    -- =========================================================================
    SELECT id INTO project_record FROM projects WHERE slug = 'sdr-portal';
    IF project_record.id IS NOT NULL THEN
        -- Check if project already has tasks
        SELECT COUNT(*) INTO existing_task_count FROM tasks WHERE project_id = project_record.id;
        IF existing_task_count = 0 THEN
            task_order := 0;

        -- Task: SDR Workflow Analysis & Pain Points
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'SDR Workflow Analysis & Pain Points',
            'Shadow SDR team for a full week. Document current workflow, tools used, time spent on each activity. Identify pain points and inefficiencies.',
            'discovery',
            'not_started',
            'easy',
            '16-20h',
            'low',
            'Human observation required for authentic workflow understanding',
            ARRAY['Observation', 'Documentation'],
            ARRAY['Process Design', 'Stakeholder Management'],
            ARRAY['Complete SDR workflow documented', 'Time breakdown by activity', 'Pain points ranked by impact', 'Tool usage mapped', 'Improvement opportunities identified'],
            ARRAY[]::TEXT[],
            ARRAY['SDR availability', 'Biased self-reporting'],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Competitive Tool Analysis
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Competitive Tool Analysis',
            'Research competitor SDR tools (Salesloft, Outreach, etc.). Identify best practices and features to incorporate.',
            'discovery',
            'not_started',
            'easy',
            '8-12h',
            'high',
            'Can help research and summarize competitor features',
            ARRAY['Research', 'Demo accounts'],
            ARRAY['UX Design', 'Business Logic'],
            ARRAY['Competitor feature matrix created', 'Best practices documented', 'Features prioritized for Abeto context'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: AI Use Cases Definition
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'AI Use Cases Definition',
            'Define specific AI use cases: conversation summaries, prioritization, scripts, objection handling. Get SDR team input on most valuable.',
            'discovery',
            'not_started',
            'medium',
            '8-12h',
            'medium',
            'Can suggest AI use cases and help design prompts',
            ARRAY['Workshops', 'Documentation'],
            ARRAY['LLM/Prompt Engineering', 'Business Logic'],
            ARRAY['AI use cases documented with expected impact', 'SDR team buy-in achieved', 'Priority ranking agreed', 'Success metrics defined per use case'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Portal UX Design & Prototyping
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Portal UX Design & Prototyping',
            'Design portal layout, information architecture, and key screens. Create clickable prototype. User test with SDRs.',
            'planning',
            'not_started',
            'medium',
            '16-24h',
            'medium',
            'Can suggest layouts and help with design patterns',
            ARRAY['Figma', 'Prototyping tools'],
            ARRAY['UX Design', 'Frontend/React'],
            ARRAY['Wireframes for all key screens', 'Clickable prototype created', 'User testing completed with 3+ SDRs', 'Feedback incorporated', 'Final design approved'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Technical Architecture
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Technical Architecture',
            'Design technical architecture including frontend, API integrations, real-time features, and AI components.',
            'planning',
            'not_started',
            'hard',
            '12-16h',
            'high',
            'Can help design architecture and generate specs',
            ARRAY['Architecture tools', 'Documentation'],
            ARRAY['API Integration', 'Frontend/React', 'LLM/Prompt Engineering'],
            ARRAY['Architecture diagram complete', 'API endpoints defined', 'Real-time strategy documented', 'AI integration approach defined', 'Performance requirements specified'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            TRUE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Core Portal Framework
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Core Portal Framework',
            'Build core portal: authentication, navigation, responsive layout. Set up API connections to unified data layer.',
            'development',
            'not_started',
            'medium',
            '20-28h',
            'high',
            'Can generate component structure, layouts, and auth flow',
            ARRAY['React', 'Next.js', 'Tailwind'],
            ARRAY['Frontend/React', 'Security/Auth'],
            ARRAY['Authentication working', 'Responsive layout complete', 'Navigation implemented', 'API connections established', 'Core pages rendering'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Contact List & Queue Management
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Contact List & Queue Management',
            'Build contact list with filtering, sorting, and queue management. Implement click-to-call and status updates.',
            'development',
            'not_started',
            'medium',
            '16-24h',
            'high',
            'Can generate list components and filter logic',
            ARRAY['React', 'Backend APIs'],
            ARRAY['Frontend/React', 'API Integration'],
            ARRAY['Contact list with pagination', 'Filters working (status, date, etc.)', 'Sorting options available', 'Click-to-call integration', 'Status updates in real-time'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: WhatsApp Conversation Summary (AI)
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'WhatsApp Conversation Summary (AI)',
            'Integrate LLM to generate conversation summaries before calls. Show key points, sentiment, last topics discussed.',
            'development',
            'not_started',
            'hard',
            '24-32h',
            'high',
            'Core AI feature - can generate prompts and UI components',
            ARRAY['Claude/OpenAI API', 'React'],
            ARRAY['LLM/Prompt Engineering', 'Frontend/React'],
            ARRAY['Summary generating for each contact', 'Key points extracted accurately', 'Sentiment indicator shown', 'Last topics highlighted', 'Summary loads in <3 seconds'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            TRUE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: AI Prioritization Engine
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'AI Prioritization Engine',
            'Build contact prioritization using AI scoring. Consider engagement, timing, lead quality, and conversion probability.',
            'development',
            'not_started',
            'hard',
            '20-28h',
            'high',
            'Can help design scoring algorithm and prompts',
            ARRAY['Node.js', 'LLM APIs', 'PostgreSQL'],
            ARRAY['LLM/Prompt Engineering', 'Data Analytics', 'Business Logic'],
            ARRAY['Scoring algorithm implemented', 'Factors explained to user', 'Queue auto-sorted by priority', 'Manual override available', 'Score accuracy >70% (validated against outcomes)'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Real-time AI Copilot
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Real-time AI Copilot',
            'Build AI copilot panel that provides real-time suggestions, objection handling tips, and next best actions during calls.',
            'development',
            'not_started',
            'hard',
            '24-32h',
            'high',
            'Core AI feature - can generate prompts and interaction patterns',
            ARRAY['WebSockets', 'LLM APIs', 'React'],
            ARRAY['LLM/Prompt Engineering', 'Frontend/React', 'DevOps'],
            ARRAY['Copilot panel implemented', 'Suggestions contextually relevant', 'Objection handling tips accurate', 'Response time <2 seconds', 'Can be minimized/expanded'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            TRUE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Performance Dashboard
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Performance Dashboard',
            'Build SDR performance dashboard: calls made, conversions, response times, comparison to goals.',
            'development',
            'not_started',
            'medium',
            '12-16h',
            'high',
            'Can generate dashboard components and visualizations',
            ARRAY['React', 'Charts'],
            ARRAY['Frontend/React', 'Data Analytics'],
            ARRAY['Daily/weekly/monthly views', 'Key metrics displayed', 'Goal progress shown', 'Team comparison (optional)', 'Export functionality'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: SDR Beta Testing
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'SDR Beta Testing',
            'Run beta with 2-3 SDRs for 2 weeks. Collect feedback daily. Fix critical issues. Validate AI accuracy.',
            'testing',
            'not_started',
            'medium',
            '20-30h',
            'low',
            'Human testing and feedback collection required',
            ARRAY['Feedback tools', 'Analytics'],
            ARRAY['Process Design', 'Data Analytics'],
            ARRAY['Beta running for 2 weeks', 'Daily feedback collected', 'Critical bugs fixed', 'AI accuracy validated (>70%)', 'SDR satisfaction >7/10'],
            ARRAY[]::TEXT[],
            ARRAY['SDR resistance to change', 'AI hallucinations'],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: SDR Training Program
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'SDR Training Program',
            'Create training materials. Conduct hands-on training sessions. Document best practices for using AI features.',
            'training',
            'not_started',
            'easy',
            '12-16h',
            'high',
            'Can generate training materials and documentation',
            ARRAY['Training materials', 'Video recording'],
            ARRAY['Training & Documentation', 'Change Management'],
            ARRAY['Training materials created', 'All SDRs trained', 'Best practices documented', 'Quick reference guide published', 'Training satisfaction >8/10'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Full Team Rollout
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Full Team Rollout',
            'Roll out to full SDR team. Monitor adoption and performance. Provide support. Iterate based on feedback.',
            'rollout',
            'not_started',
            'medium',
            '12-20h',
            'low',
            'Human change management required',
            ARRAY['Support tools', 'Analytics'],
            ARRAY['Change Management', 'Stakeholder Management'],
            ARRAY['All SDRs using portal daily', 'Old tools deprecated', 'Support process established', 'Weekly feedback reviews', 'Performance baseline established'],
            ARRAY['100% SDR adoption within 2 weeks', '20% reduction in time per lead', '15% improvement in contact rate', 'SDR satisfaction >8/10'],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Continuous Improvement
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Continuous Improvement',
            'Establish continuous improvement process. Track KPIs, collect feedback, prioritize enhancements.',
            'monitoring',
            'not_started',
            'easy',
            'Ongoing (4h/week)',
            'medium',
            'Can analyze usage patterns and suggest improvements',
            ARRAY['Analytics', 'Feedback tools'],
            ARRAY['Data Analytics', 'Stakeholder Management'],
            ARRAY['KPI tracking dashboard live', 'Monthly feedback review process', 'Enhancement backlog maintained', 'Quarterly improvement targets set'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        ELSE
            RAISE NOTICE 'Skipping sdr-portal - already has % tasks', existing_task_count;
        END IF;
    END IF;

    -- =========================================================================
    -- INSTALLER PORTAL PRODUCT
    -- =========================================================================
    SELECT id INTO project_record FROM projects WHERE slug = 'installer-portal-product';
    IF project_record.id IS NOT NULL THEN
        -- Check if project already has tasks
        SELECT COUNT(*) INTO existing_task_count FROM tasks WHERE project_id = project_record.id;
        IF existing_task_count = 0 THEN
            task_order := 0;

        -- Task: Installer Needs Assessment
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Installer Needs Assessment',
            'Interview 5+ installers to understand their workflow, pain points, and portal needs. Document current communication methods and inefficiencies.',
            'discovery',
            'not_started',
            'easy',
            '12-16h',
            'low',
            'Human relationship building required',
            ARRAY['Interviews', 'Documentation'],
            ARRAY['Stakeholder Management', 'Process Design'],
            ARRAY['5+ installer interviews completed', 'Pain points documented and prioritized', 'Feature wishlist created', 'Current workflow mapped', 'Success criteria defined with installers'],
            ARRAY[]::TEXT[],
            ARRAY['Installer availability', 'Varied needs across installers'],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Legal & Compliance Review
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Legal & Compliance Review',
            'Review legal requirements for installer portal: data access, GDPR, terms of service, liability. Engage legal counsel if needed.',
            'discovery',
            'not_started',
            'medium',
            '8-12h',
            'low',
            'Legal expertise required',
            ARRAY['Legal review', 'Documentation'],
            ARRAY['Compliance/Legal'],
            ARRAY['Data access policy defined', 'Terms of service drafted', 'GDPR compliance verified', 'Liability boundaries clear', 'Legal sign-off obtained'],
            ARRAY[]::TEXT[],
            ARRAY['Legal delays', 'Compliance gaps'],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Portal Feature Specification
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Portal Feature Specification',
            'Define portal features in detail: lead management, performance metrics, feedback, quotes, notifications. Prioritize MVP vs. future.',
            'planning',
            'not_started',
            'medium',
            '12-16h',
            'medium',
            'Can help structure feature specs and user stories',
            ARRAY['Documentation', 'Prioritization frameworks'],
            ARRAY['Business Logic', 'UX Design'],
            ARRAY['Feature list with priorities', 'User stories for MVP features', 'Acceptance criteria defined', 'MVP scope agreed', 'Stakeholder sign-off'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: UX Design & Prototyping
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'UX Design & Prototyping',
            'Design mobile-first portal interface. Create prototypes and test with installers. Ensure simplicity for field use.',
            'planning',
            'not_started',
            'medium',
            '16-24h',
            'medium',
            'Can suggest mobile UX patterns',
            ARRAY['Figma', 'Mobile prototyping'],
            ARRAY['UX Design'],
            ARRAY['Mobile-first designs complete', 'Prototype tested with 3+ installers', 'Feedback incorporated', 'Final designs approved', 'Design system documented'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Authentication & Security Architecture
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Authentication & Security Architecture',
            'Design secure authentication for installers. Define role-based access, session management, and security measures.',
            'planning',
            'not_started',
            'hard',
            '12-16h',
            'medium',
            'Can help with security architecture but needs expert review',
            ARRAY['Auth0', 'Security documentation'],
            ARRAY['Security/Auth', 'Compliance/Legal'],
            ARRAY['Auth flow documented', 'Role-based access defined', 'Session management specified', 'Security requirements met', 'Penetration testing plan'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            TRUE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Authentication System Implementation
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Authentication System Implementation',
            'Implement installer authentication with secure login, password reset, and session management.',
            'development',
            'not_started',
            'hard',
            '24-32h',
            'medium',
            'Can generate auth boilerplate but security needs review',
            ARRAY['Auth0/Custom', 'JWT', 'Node.js'],
            ARRAY['Security/Auth', 'API Integration'],
            ARRAY['Login/logout working', 'Password reset functional', 'Session management implemented', 'Security audit passed', 'Multi-device support'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            TRUE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Lead Management Dashboard
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Lead Management Dashboard',
            'Build lead management view: assigned leads, status updates, filtering, contact details, conversion tracking.',
            'development',
            'not_started',
            'medium',
            '24-32h',
            'high',
            'Can generate dashboard components and data tables',
            ARRAY['React', 'Backend APIs'],
            ARRAY['Frontend/React', 'API Integration'],
            ARRAY['Lead list with filters', 'Lead detail view', 'Status update functionality', 'Contact info accessible', 'Conversion tracking visible', 'Mobile optimized'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Performance Metrics View
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Performance Metrics View',
            'Build performance dashboard: conversion rate, response time SLA, comparison to peers, trends.',
            'development',
            'not_started',
            'medium',
            '16-24h',
            'high',
            'Can generate chart components and metrics displays',
            ARRAY['React', 'Charts'],
            ARRAY['Frontend/React', 'Data Analytics'],
            ARRAY['Conversion rate displayed', 'SLA compliance shown', 'Trend charts working', 'Peer comparison (anonymized)', 'Goals and targets visible'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Feedback & Quote Submission
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Feedback & Quote Submission',
            'Build feedback forms and quote submission. Allow installers to report lead quality issues and submit offer amounts.',
            'development',
            'not_started',
            'easy',
            '16-20h',
            'high',
            'Can generate form components and validation',
            ARRAY['React', 'Backend APIs'],
            ARRAY['Frontend/React', 'Business Logic'],
            ARRAY['Feedback form working', 'Quote submission functional', 'Validation in place', 'Confirmation messages', 'Data syncing to backend'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Notification System
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Notification System',
            'Implement push notifications, email, and SMS for new leads and important updates.',
            'development',
            'not_started',
            'medium',
            '12-16h',
            'high',
            'Can generate notification templates and logic',
            ARRAY['SendGrid', 'Twilio', 'Push notifications'],
            ARRAY['API Integration', 'DevOps'],
            ARRAY['Email notifications working', 'SMS notifications working', 'Push notifications (if app)', 'Preference management', 'Delivery tracking'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Installer Beta Program
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Installer Beta Program',
            'Run beta with 3-5 installers for 3 weeks. Collect daily feedback. Fix issues. Validate usability in field conditions.',
            'testing',
            'not_started',
            'medium',
            '24-36h',
            'low',
            'Human relationship management required',
            ARRAY['Feedback tools', 'Support channel'],
            ARRAY['Stakeholder Management', 'Process Design'],
            ARRAY['Beta running 3+ weeks', 'Daily feedback collected', 'Critical bugs fixed', 'Field usability validated', 'Installer satisfaction >7/10'],
            ARRAY[]::TEXT[],
            ARRAY['Installer churn during beta', 'Field connectivity issues'],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Installer Onboarding Program
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Installer Onboarding Program',
            'Create onboarding materials: videos, guides, FAQ. Design self-service onboarding flow. Prepare support documentation.',
            'training',
            'not_started',
            'easy',
            '16-24h',
            'high',
            'Can generate documentation and help scripts',
            ARRAY['Video recording', 'Documentation'],
            ARRAY['Training & Documentation', 'Change Management'],
            ARRAY['Onboarding videos created', 'User guides published', 'FAQ documented', 'Self-service onboarding flow', 'Support process defined'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Phased Installer Rollout
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Phased Installer Rollout',
            'Roll out to all installers in phases. Week 1: top performers. Week 2-3: remaining active. Provide hands-on support.',
            'rollout',
            'not_started',
            'medium',
            '20-30h',
            'low',
            'Human change management required',
            ARRAY['Communication', 'Support tools'],
            ARRAY['Change Management', 'Stakeholder Management'],
            ARRAY['All active installers onboarded', 'Login success rate >95%', 'Support tickets resolved <24h', 'Old process deprecated', 'Feedback positive >80%'],
            ARRAY['100% installer adoption within 4 weeks', '50% reduction in lead response time', '30% increase in feedback submission'],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Portal Performance & Iteration
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Portal Performance & Iteration',
            'Monitor portal usage, performance, and satisfaction. Establish feedback loop. Plan and deliver enhancements.',
            'monitoring',
            'not_started',
            'easy',
            'Ongoing (6h/week)',
            'medium',
            'Can analyze usage patterns and suggest improvements',
            ARRAY['Analytics', 'Feedback tools'],
            ARRAY['Data Analytics', 'Stakeholder Management'],
            ARRAY['Usage analytics dashboard live', 'Monthly NPS survey running', 'Enhancement backlog maintained', 'Quarterly release cycle established'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        ELSE
            RAISE NOTICE 'Skipping installer-portal-product - already has % tasks', existing_task_count;
        END IF;
    END IF;

    -- =========================================================================
    -- AI CORTEX
    -- =========================================================================
    SELECT id INTO project_record FROM projects WHERE slug = 'ai-cortex';
    IF project_record.id IS NOT NULL THEN
        -- Check if project already has tasks
        SELECT COUNT(*) INTO existing_task_count FROM tasks WHERE project_id = project_record.id;
        IF existing_task_count = 0 THEN
            task_order := 0;

        -- Task: AI Use Case Prioritization
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'AI Use Case Prioritization',
            'Catalog all potential AI use cases across the business. Score by impact, feasibility, and data availability. Select top 5 for MVP.',
            'discovery',
            'not_started',
            'medium',
            '16-24h',
            'medium',
            'Can help research AI capabilities and suggest use cases',
            ARRAY['Workshops', 'Prioritization matrix'],
            ARRAY['Business Logic', 'LLM/Prompt Engineering', 'Stakeholder Management'],
            ARRAY['Use case catalog complete (20+ ideas)', 'Scoring matrix with impact/feasibility', 'Top 5 MVP use cases selected', 'Stakeholder alignment achieved', 'Success metrics defined per use case'],
            ARRAY[]::TEXT[],
            ARRAY['Over-ambition', 'Data availability gaps'],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Data Readiness Assessment
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Data Readiness Assessment',
            'Assess data quality and availability for top AI use cases. Identify gaps, cleaning needs, and labeling requirements.',
            'discovery',
            'not_started',
            'medium',
            '12-16h',
            'medium',
            'Can help analyze data patterns and quality',
            ARRAY['Data analysis tools', 'Documentation'],
            ARRAY['Data Analytics', 'Database/SQL'],
            ARRAY['Data availability mapped per use case', 'Quality issues documented', 'Cleaning requirements defined', 'Labeling needs identified', 'Data pipeline requirements specified'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: AI Architecture Design
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'AI Architecture Design',
            'Design Cortex architecture: LLM integration layer, context aggregation, prompt management, agent framework, feedback loop.',
            'planning',
            'not_started',
            'hard',
            '20-28h',
            'high',
            'Can help design architecture and suggest patterns',
            ARRAY['Architecture tools', 'Documentation'],
            ARRAY['LLM/Prompt Engineering', 'API Integration', 'Database/SQL'],
            ARRAY['Architecture diagram complete', 'LLM provider strategy defined', 'Context aggregation approach', 'Prompt versioning strategy', 'Agent framework selection', 'Feedback loop design', 'Cost estimation'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            TRUE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: LLM Provider Evaluation
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'LLM Provider Evaluation',
            'Evaluate LLM providers (Claude, OpenAI, etc.) for cost, performance, and capabilities. Select primary and fallback providers.',
            'planning',
            'not_started',
            'medium',
            '8-12h',
            'high',
            'Can help benchmark and compare providers',
            ARRAY['API access', 'Benchmarking'],
            ARRAY['LLM/Prompt Engineering', 'Vendor Management'],
            ARRAY['Provider comparison matrix', 'Cost analysis per use case', 'Performance benchmarks', 'Primary provider selected', 'Fallback strategy defined'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: LLM Integration Layer
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'LLM Integration Layer',
            'Build unified LLM integration layer with API abstraction, caching, rate limiting, error handling, and cost tracking.',
            'development',
            'not_started',
            'hard',
            '24-32h',
            'high',
            'Can generate SDK wrappers and caching logic',
            ARRAY['Node.js', 'API SDKs', 'Redis'],
            ARRAY['API Integration', 'LLM/Prompt Engineering', 'DevOps'],
            ARRAY['API abstraction working', 'Provider switching seamless', 'Caching implemented', 'Rate limiting in place', 'Error handling robust', 'Cost tracking enabled'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            TRUE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Context Aggregation Service
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Context Aggregation Service',
            'Build service to aggregate relevant context for AI queries: deal history, conversations, calls, lead attributes.',
            'development',
            'not_started',
            'hard',
            '24-32h',
            'medium',
            'Can help with query optimization and data aggregation',
            ARRAY['Node.js', 'PostgreSQL', 'Redis'],
            ARRAY['Database/SQL', 'Data Analytics', 'API Integration'],
            ARRAY['Context aggregation working', 'All relevant data sources included', 'Performance <500ms for context fetch', 'Caching for repeated queries', 'Token budget management'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            TRUE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Prompt Template System
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Prompt Template System',
            'Build prompt management system with versioning, A/B testing, variables, and performance tracking.',
            'development',
            'not_started',
            'medium',
            '16-20h',
            'high',
            'Can generate prompt templates and management logic',
            ARRAY['Node.js', 'PostgreSQL'],
            ARRAY['LLM/Prompt Engineering', 'Database/SQL'],
            ARRAY['Prompt versioning working', 'Variables system functional', 'A/B testing capability', 'Performance tracking', 'Rollback capability'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: MVP Use Case Implementation
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'MVP Use Case Implementation',
            'Implement top 5 MVP AI use cases: conversation summaries, prioritization, script assistance, pattern detection, recommendations.',
            'development',
            'not_started',
            'hard',
            '40-56h',
            'high',
            'Core AI work - heavy AI assistance possible',
            ARRAY['Full Cortex stack'],
            ARRAY['LLM/Prompt Engineering', 'Business Logic'],
            ARRAY['All 5 MVP use cases working', 'Accuracy >70% per use case', 'Response time <3s', 'Edge cases handled', 'Fallback behavior defined'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: AI Quality & Accuracy Testing
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'AI Quality & Accuracy Testing',
            'Comprehensive testing of AI outputs. Create test datasets, measure accuracy, identify failure modes, tune prompts.',
            'testing',
            'not_started',
            'hard',
            '24-36h',
            'medium',
            'Can help generate test cases and analyze results',
            ARRAY['Test datasets', 'Evaluation tools'],
            ARRAY['Data Analytics', 'LLM/Prompt Engineering'],
            ARRAY['Test datasets created per use case', 'Accuracy metrics established', 'Failure modes documented', 'Prompts tuned for accuracy', 'Performance baseline established'],
            ARRAY[]::TEXT[],
            ARRAY['AI hallucinations', 'Edge case failures'],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: User Acceptance Testing
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'User Acceptance Testing',
            'UAT with SDR team and stakeholders. Validate AI outputs are useful and accurate in real workflows.',
            'testing',
            'not_started',
            'medium',
            '16-24h',
            'low',
            'Human judgment required',
            ARRAY['UAT process', 'Feedback tools'],
            ARRAY['Stakeholder Management', 'Process Design'],
            ARRAY['UAT with 5+ users completed', 'Usefulness validated >7/10', 'Critical feedback addressed', 'Sign-off from stakeholders'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: AI User Training & Guidelines
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'AI User Training & Guidelines',
            'Train users on AI capabilities, limitations, and best practices. Create guidelines for when to trust vs. verify AI outputs.',
            'training',
            'not_started',
            'easy',
            '12-16h',
            'high',
            'Can generate training materials and guidelines',
            ARRAY['Training materials', 'Documentation'],
            ARRAY['Training & Documentation', 'Change Management'],
            ARRAY['Training materials created', 'AI usage guidelines published', 'Training sessions completed', 'FAQ documented', 'Escalation process for AI errors'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Gradual Cortex Rollout
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Gradual Cortex Rollout',
            'Roll out Cortex features gradually. Start with low-risk use cases, expand based on performance and feedback.',
            'rollout',
            'not_started',
            'medium',
            '16-24h',
            'low',
            'Human judgment on rollout pace required',
            ARRAY['Feature flags', 'Analytics'],
            ARRAY['Change Management', 'DevOps'],
            ARRAY['Phased rollout plan executed', 'Feature flags working', 'Rollback plan tested', 'Adoption tracking active', 'Feedback loop established'],
            ARRAY['All MVP features live within 4 weeks', 'Zero critical AI failures', 'User satisfaction >8/10'],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Continuous AI Improvement
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Continuous AI Improvement',
            'Establish continuous improvement: monitor accuracy, collect feedback, tune prompts, add use cases.',
            'monitoring',
            'not_started',
            'medium',
            'Ongoing (8h/week)',
            'high',
            'Can help analyze patterns and suggest prompt improvements',
            ARRAY['Analytics', 'Feedback tools', 'Prompt tuning'],
            ARRAY['LLM/Prompt Engineering', 'Data Analytics'],
            ARRAY['Accuracy monitoring dashboard', 'Weekly prompt review process', 'User feedback integration', 'New use case pipeline', 'Cost optimization ongoing'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        ELSE
            RAISE NOTICE 'Skipping ai-cortex - already has % tasks', existing_task_count;
        END IF;
    END IF;

    -- =========================================================================
    -- CAMPAIGN OS
    -- =========================================================================
    SELECT id INTO project_record FROM projects WHERE slug = 'campaign-os';
    IF project_record.id IS NOT NULL THEN
        -- Check if project already has tasks
        SELECT COUNT(*) INTO existing_task_count FROM tasks WHERE project_id = project_record.id;
        IF existing_task_count = 0 THEN
            task_order := 0;

        -- Task: Marketing Workflow Analysis
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Marketing Workflow Analysis',
            'Document current paid media workflow: platforms used, reporting process, optimization methods, pain points.',
            'discovery',
            'not_started',
            'easy',
            '8-12h',
            'low',
            'Human domain expertise required',
            ARRAY['Interviews', 'Documentation'],
            ARRAY['Process Design', 'Business Logic'],
            ARRAY['Current workflow documented', 'Tools inventory complete', 'Pain points prioritized', 'Opportunity areas identified'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Platform API Access & Permissions
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Platform API Access & Permissions',
            'Secure API access for Meta, Google, TikTok. Document rate limits, data available, and permissions needed.',
            'discovery',
            'not_started',
            'medium',
            '8-12h',
            'low',
            'Platform-specific setup required',
            ARRAY['Platform developer consoles'],
            ARRAY['Vendor Management', 'External APIs'],
            ARRAY['Meta Ads API access confirmed', 'Google Ads API access confirmed', 'TikTok API access confirmed (if used)', 'Rate limits documented', 'Data availability mapped'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Attribution Model Definition
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Attribution Model Definition',
            'Define attribution model: first-touch, last-touch, multi-touch. Map UTM parameters to CRM. Specify data requirements.',
            'planning',
            'not_started',
            'hard',
            '12-16h',
            'medium',
            'Can help research attribution models and best practices',
            ARRAY['Analytics', 'Documentation'],
            ARRAY['Data Analytics', 'Business Logic'],
            ARRAY['Attribution model selected', 'UTM parameter standard defined', 'CRM mapping documented', 'Data pipeline requirements', 'Stakeholder agreement'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            TRUE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Technical Architecture
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Technical Architecture',
            'Design Campaign OS architecture: API integrations, data warehouse, dashboard, AI components.',
            'planning',
            'not_started',
            'hard',
            '12-16h',
            'high',
            'Can help design architecture and integration patterns',
            ARRAY['Architecture tools'],
            ARRAY['API Integration', 'Database/SQL', 'External APIs'],
            ARRAY['Architecture diagram complete', 'Integration approach defined', 'Data model designed', 'Performance requirements'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Ad Platform Integrations
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Ad Platform Integrations',
            'Build integrations with Meta and Google Ads APIs. Pull campaign data, spend, and performance metrics.',
            'development',
            'not_started',
            'hard',
            '32-44h',
            'medium',
            'Can help with API integration patterns but platform-specific',
            ARRAY['Meta Ads API', 'Google Ads API', 'Node.js'],
            ARRAY['API Integration', 'External APIs'],
            ARRAY['Meta data syncing daily', 'Google data syncing daily', 'Campaign metrics accurate', 'Spend data reconciled', 'Error handling robust'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Attribution Pipeline
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Attribution Pipeline',
            'Build attribution pipeline: UTM capture, CRM linking, conversion tracking, multi-touch attribution calculations.',
            'development',
            'not_started',
            'hard',
            '20-28h',
            'medium',
            'Can help with attribution logic but business rules complex',
            ARRAY['Node.js', 'PostgreSQL'],
            ARRAY['Data Analytics', 'Database/SQL', 'Business Logic'],
            ARRAY['UTM capture working', 'CRM linking accurate', 'Conversion tracking functional', 'Attribution calculated correctly', 'Validated against manual calcs'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Campaign Dashboard
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Campaign Dashboard',
            'Build dashboard: spend by channel, ROI by campaign, conversion funnel, creative performance.',
            'development',
            'not_started',
            'medium',
            '24-32h',
            'high',
            'Can generate dashboard components and visualizations',
            ARRAY['React', 'Charts'],
            ARRAY['Frontend/React', 'Data Analytics'],
            ARRAY['Spend breakdown by channel', 'ROI calculations correct', 'Funnel visualization', 'Creative performance view', 'Date range filters'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: AI Creative Analysis
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'AI Creative Analysis',
            'Build AI feature to analyze winning ads and suggest variations. Identify patterns in high-performing creatives.',
            'development',
            'not_started',
            'medium',
            '16-24h',
            'high',
            'Core AI feature - can generate analysis prompts',
            ARRAY['LLM APIs', 'Node.js'],
            ARRAY['LLM/Prompt Engineering'],
            ARRAY['Creative analysis working', 'Patterns identified accurately', 'Suggestions actionable', 'Performance correlation shown'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Data Validation & UAT
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Data Validation & UAT',
            'Validate all data against ad platform dashboards. User testing with marketing team.',
            'testing',
            'not_started',
            'medium',
            '16-24h',
            'low',
            'Human validation required',
            ARRAY['Spreadsheets', 'Platform dashboards'],
            ARRAY['Data Analytics'],
            ARRAY['Data matches platform dashboards', 'ROI calculations validated by Finance', 'UAT completed with Marketing', 'Discrepancies documented and explained'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Marketing Team Training
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Marketing Team Training',
            'Train marketing team on Campaign OS. Document workflows and best practices.',
            'training',
            'not_started',
            'easy',
            '8-12h',
            'high',
            'Can generate training materials',
            ARRAY['Training materials'],
            ARRAY['Training & Documentation'],
            ARRAY['Training completed', 'Documentation published', 'Best practices defined'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Production Launch
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Production Launch',
            'Launch Campaign OS. Migrate from old reporting process. Monitor accuracy and adoption.',
            'rollout',
            'not_started',
            'easy',
            '8-12h',
            'low',
            'Human change management',
            ARRAY['Deployment'],
            ARRAY['Change Management'],
            ARRAY['System live', 'Team using daily', 'Old process deprecated'],
            ARRAY['100% of reporting through Campaign OS', '75% reduction in reporting time', 'ROI visibility within 24h of spend'],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Ongoing Optimization
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Ongoing Optimization',
            'Continuous improvement: data quality monitoring, new features, AI enhancement.',
            'monitoring',
            'not_started',
            'easy',
            'Ongoing (4h/week)',
            'medium',
            'Can help analyze patterns',
            ARRAY['Analytics'],
            ARRAY['Data Analytics'],
            ARRAY['Weekly data quality review', 'Feature backlog maintained', 'AI suggestions improving'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        ELSE
            RAISE NOTICE 'Skipping campaign-os - already has % tasks', existing_task_count;
        END IF;
    END IF;

    -- =========================================================================
    -- DATA QUALITY MONITOR
    -- =========================================================================
    SELECT id INTO project_record FROM projects WHERE slug = 'data-quality-monitor';
    IF project_record.id IS NOT NULL THEN
        -- Check if project already has tasks
        SELECT COUNT(*) INTO existing_task_count FROM tasks WHERE project_id = project_record.id;
        IF existing_task_count = 0 THEN
            task_order := 0;

        -- Task: Data Quality Requirements Gathering
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Data Quality Requirements Gathering',
            'Define data quality rules with all stakeholders. Document thresholds for freshness, completeness, accuracy.',
            'discovery',
            'not_started',
            'medium',
            '8-12h',
            'medium',
            'Can suggest data quality metrics',
            ARRAY['Workshops', 'Documentation'],
            ARRAY['Data Analytics', 'Business Logic'],
            ARRAY['Quality rules documented', 'Thresholds agreed'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Alert Channel Setup
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Alert Channel Setup',
            'Set up Slack channels and email lists for data quality alerts. Define escalation paths.',
            'planning',
            'not_started',
            'easy',
            '4-6h',
            'high',
            'Can generate channel structure',
            ARRAY['Slack', 'Email'],
            ARRAY['DevOps'],
            ARRAY['Channels created', 'Escalation defined'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Quality Scoring Engine
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Quality Scoring Engine',
            'Build engine to calculate quality scores for each data source. Store historical scores.',
            'development',
            'not_started',
            'medium',
            '16-24h',
            'high',
            'Can generate scoring algorithms',
            ARRAY['Node.js', 'PostgreSQL'],
            ARRAY['Database/SQL', 'Data Analytics'],
            ARRAY['Scoring working', 'Historical tracking', 'API endpoint'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Alerting System
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Alerting System',
            'Implement alerts for quality degradation. Send to Slack and email based on severity.',
            'development',
            'not_started',
            'easy',
            '12-16h',
            'high',
            'Can generate alert logic',
            ARRAY['Slack API', 'SendGrid'],
            ARRAY['API Integration'],
            ARRAY['Alerts firing correctly', 'Severity levels working'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            TRUE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Monitoring Dashboard
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Monitoring Dashboard',
            'Build dashboard showing quality scores, trends, and active alerts.',
            'development',
            'not_started',
            'medium',
            '12-16h',
            'high',
            'Can generate dashboard components',
            ARRAY['React', 'Charts'],
            ARRAY['Frontend/React', 'Data Analytics'],
            ARRAY['Dashboard live', 'Quality scores visible', 'Trends shown'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Auto-Remediation Scripts
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Auto-Remediation Scripts',
            'Build auto-remediation for common issues: re-sync stale data, fill missing fields from sources.',
            'development',
            'not_started',
            'medium',
            '8-12h',
            'medium',
            'Can help with remediation patterns',
            ARRAY['Node.js'],
            ARRAY['DevOps', 'Database/SQL'],
            ARRAY['Auto-fix working for top 3 issues'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Testing & Validation
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Testing & Validation',
            'Test quality scoring accuracy. Validate alerts fire correctly. Test auto-remediation.',
            'testing',
            'not_started',
            'easy',
            '8-12h',
            'medium',
            'Can generate test cases',
            ARRAY['Test scenarios'],
            ARRAY['Data Analytics'],
            ARRAY['Scoring validated', 'Alerts tested', 'Remediation working'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Ops Team Training
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Ops Team Training',
            'Train ops team on responding to data quality alerts. Document runbooks.',
            'training',
            'not_started',
            'easy',
            '6-8h',
            'high',
            'Can generate runbooks',
            ARRAY['Documentation'],
            ARRAY['Training & Documentation'],
            ARRAY['Training complete', 'Runbooks published'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Production Deployment
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Production Deployment',
            'Deploy to production. Enable monitoring for all data sources.',
            'rollout',
            'not_started',
            'easy',
            '4-6h',
            'medium',
            'Can help with deployment config',
            ARRAY['Deployment'],
            ARRAY['DevOps'],
            ARRAY['Monitoring active', 'All sources covered'],
            ARRAY['Data quality score >95%', 'Alert response <1h'],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        ELSE
            RAISE NOTICE 'Skipping data-quality-monitor - already has % tasks', existing_task_count;
        END IF;
    END IF;

    -- =========================================================================
    -- FUNNEL AUTOMATION OS
    -- =========================================================================
    SELECT id INTO project_record FROM projects WHERE slug = 'funnel-automation-os';
    IF project_record.id IS NOT NULL THEN
        -- Check if project already has tasks
        SELECT COUNT(*) INTO existing_task_count FROM tasks WHERE project_id = project_record.id;
        IF existing_task_count = 0 THEN
            task_order := 0;

        -- Task: Current Funnel Analysis
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Current Funnel Analysis',
            'Map current lead funnel: touchpoints, conversion rates, drop-off points, manual interventions.',
            'discovery',
            'not_started',
            'medium',
            '12-16h',
            'medium',
            'Can help analyze funnel data',
            ARRAY['Analytics', 'Interviews'],
            ARRAY['Process Design', 'Data Analytics'],
            ARRAY['Funnel map complete', 'Drop-offs quantified', 'Automation opportunities identified'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: WhatsApp Bot Strategy
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'WhatsApp Bot Strategy',
            'Define bot conversation flows for qualification, scheduling, and FAQs. Design handoff to human.',
            'planning',
            'not_started',
            'medium',
            '16-20h',
            'high',
            'Can help design conversation flows',
            ARRAY['Flow design tools'],
            ARRAY['Business Logic', 'UX Design'],
            ARRAY['Flows documented', 'Handoff rules defined', 'SDR approval'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: WhatsApp API Integration
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'WhatsApp API Integration',
            'Integrate with WhatsApp Business API via Woztell for programmatic messaging.',
            'development',
            'not_started',
            'hard',
            '24-32h',
            'medium',
            'Can help with integration patterns',
            ARRAY['Woztell API', 'Node.js'],
            ARRAY['API Integration', 'External APIs'],
            ARRAY['Send messages working', 'Receive webhooks working', 'Error handling robust'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            TRUE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Flow Builder UI
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Flow Builder UI',
            'Build visual flow builder for creating and editing conversation flows.',
            'development',
            'not_started',
            'hard',
            '32-44h',
            'medium',
            'Can help with component architecture',
            ARRAY['React', 'React Flow'],
            ARRAY['Frontend/React', 'UX Design'],
            ARRAY['Drag-drop flow building', 'Conditions and branches', 'Preview functionality'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Routing Engine
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Routing Engine',
            'Build lead routing engine: rules-based assignment, availability check, performance-based distribution.',
            'development',
            'not_started',
            'medium',
            '20-28h',
            'medium',
            'Can help with routing logic',
            ARRAY['Node.js', 'Redis'],
            ARRAY['Business Logic', 'Database/SQL'],
            ARRAY['Rule-based routing working', 'Availability considered', 'Performance weighting'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            TRUE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: A/B Testing Framework
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'A/B Testing Framework',
            'Build A/B testing for flows: split traffic, track conversions, statistical significance.',
            'development',
            'not_started',
            'medium',
            '16-20h',
            'high',
            'Can generate A/B testing logic',
            ARRAY['Node.js', 'PostgreSQL'],
            ARRAY['Data Analytics', 'Business Logic'],
            ARRAY['Traffic splitting working', 'Conversion tracking', 'Significance calculations'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Analytics Dashboard
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Analytics Dashboard',
            'Build funnel analytics: flow performance, conversion rates, drop-off analysis.',
            'development',
            'not_started',
            'medium',
            '16-20h',
            'high',
            'Can generate dashboard components',
            ARRAY['React', 'Charts'],
            ARRAY['Frontend/React', 'Data Analytics'],
            ARRAY['Funnel metrics visible', 'Flow comparison', 'Drop-off identification'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Integration Testing
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Integration Testing',
            'End-to-end testing of flows. Test all branches, error cases, and edge scenarios.',
            'testing',
            'not_started',
            'medium',
            '16-24h',
            'medium',
            'Can help generate test cases',
            ARRAY['Test scenarios', 'WhatsApp sandbox'],
            ARRAY['API Integration'],
            ARRAY['All flows tested', 'Error handling verified', 'Edge cases covered'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Ops Training & Documentation
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Ops Training & Documentation',
            'Train ops team on flow builder and monitoring. Document best practices.',
            'training',
            'not_started',
            'easy',
            '12-16h',
            'high',
            'Can generate training materials',
            ARRAY['Training materials'],
            ARRAY['Training & Documentation'],
            ARRAY['Training complete', 'Documentation published'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Pilot Launch
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Pilot Launch',
            'Launch pilot with subset of leads. Monitor performance and iterate.',
            'rollout',
            'not_started',
            'medium',
            '16-24h',
            'low',
            'Human judgment for pilot',
            ARRAY['Monitoring'],
            ARRAY['Change Management'],
            ARRAY['Pilot running', 'Metrics tracking', 'Issues resolved'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Full Rollout
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Full Rollout',
            'Expand to all eligible leads. Deprecate manual processes where automated.',
            'rollout',
            'not_started',
            'easy',
            '8-12h',
            'low',
            'Human change management',
            ARRAY['Communication'],
            ARRAY['Change Management'],
            ARRAY['All leads processed through system', 'Manual processes deprecated'],
            ARRAY['50% increase in contact rate', '30% reduction in SDR time on initial contact', '25% improvement in qualification rate'],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Continuous Optimization
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Continuous Optimization',
            'Ongoing flow optimization based on data. A/B test improvements. Add new flows.',
            'monitoring',
            'not_started',
            'medium',
            'Ongoing (8h/week)',
            'high',
            'Can analyze flow performance and suggest improvements',
            ARRAY['Analytics'],
            ARRAY['Data Analytics', 'Business Logic'],
            ARRAY['Weekly optimization reviews', 'Continuous A/B testing', 'Flow performance improving'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        ELSE
            RAISE NOTICE 'Skipping funnel-automation-os - already has % tasks', existing_task_count;
        END IF;
    END IF;

    -- =========================================================================
    -- PARTNER EXPANSION TOOL
    -- =========================================================================
    SELECT id INTO project_record FROM projects WHERE slug = 'partner-expansion-tool';
    IF project_record.id IS NOT NULL THEN
        -- Check if project already has tasks
        SELECT COUNT(*) INTO existing_task_count FROM tasks WHERE project_id = project_record.id;
        IF existing_task_count = 0 THEN
            task_order := 0;

        -- Task: Installer Market Research
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Installer Market Research',
            'Research target installer segments, regions with coverage gaps, and ideal partner profiles.',
            'discovery',
            'not_started',
            'medium',
            '16-24h',
            'medium',
            '',
            ARRAY['Market research tools', 'CRM data'],
            ARRAY['Business Logic', 'Data Analytics'],
            ARRAY['Target segments defined', 'Coverage gap map created', 'Ideal partner profile documented'],
            ARRAY['50+ potential partners identified', 'Coverage gaps quantified'],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Outreach Strategy Design
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Outreach Strategy Design',
            'Design multi-channel outreach approach including email sequences, LinkedIn, and direct calls.',
            'planning',
            'not_started',
            'medium',
            '12-16h',
            'high',
            '',
            ARRAY['Email tools', 'LinkedIn Sales Navigator'],
            ARRAY['Business Logic', 'Process Design'],
            ARRAY['Email sequences designed', 'LinkedIn playbook created', 'Call scripts prepared'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Prospect Database Setup
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Prospect Database Setup',
            'Build database to track prospects, engagement scores, and pipeline stages.',
            'development',
            'not_started',
            'medium',
            '20-30h',
            'high',
            '',
            ARRAY['PostgreSQL', 'Node.js'],
            ARRAY['Database/SQL', 'API Integration'],
            ARRAY['Database schema deployed', 'CRUD APIs working', 'Integration with CRM'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Email Sequence Builder
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Email Sequence Builder',
            'Create automated email sequences with personalization and tracking.',
            'development',
            'not_started',
            'medium',
            '16-24h',
            'high',
            '',
            ARRAY['SendGrid', 'Node.js'],
            ARRAY['API Integration', 'Business Logic'],
            ARRAY['Sequences automated', 'Open/click tracking working', 'Personalization functional'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Engagement Scoring Model
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Engagement Scoring Model',
            'Build scoring algorithm based on email engagement, website visits, and responses.',
            'development',
            'not_started',
            'medium',
            '12-16h',
            'high',
            '',
            ARRAY['Node.js', 'Analytics'],
            ARRAY['Data Analytics', 'Business Logic'],
            ARRAY['Scoring algorithm deployed', 'Scores updating in real-time', 'Thresholds calibrated'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Pipeline Dashboard
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Pipeline Dashboard',
            'Build dashboard to track prospects through recruitment funnel.',
            'development',
            'not_started',
            'medium',
            '16-20h',
            'high',
            '',
            ARRAY['React', 'Chart.js'],
            ARRAY['Frontend/React', 'Data Analytics'],
            ARRAY['Dashboard deployed', 'Pipeline stages visible', 'Conversion metrics shown'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Pilot with 10 Prospects
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Pilot with 10 Prospects',
            'Run pilot campaign with 10 high-potential prospects to validate approach.',
            'testing',
            'not_started',
            'medium',
            '20-30h',
            'low',
            '',
            ARRAY['CRM', 'Email tools'],
            ARRAY['Business Logic', 'Stakeholder Management'],
            ARRAY['10 prospects contacted', 'Response rate measured', 'Feedback collected'],
            ARRAY['30%+ response rate', '2+ partners signed from pilot'],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Sales Team Training
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Sales Team Training',
            'Train sales team on using the partner expansion tools and processes.',
            'training',
            'not_started',
            'easy',
            '8-12h',
            'medium',
            '',
            ARRAY['Training materials'],
            ARRAY['Training & Documentation'],
            ARRAY['All sales team trained', 'Documentation complete', 'Q&A session done'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Full Launch
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Full Launch',
            'Launch partner expansion program at scale across all target regions.',
            'rollout',
            'not_started',
            'medium',
            '16-24h',
            'low',
            '',
            ARRAY['CRM', 'Dashboards'],
            ARRAY['Change Management', 'Business Logic'],
            ARRAY['Program live in all regions', 'Weekly targets set', 'Reporting active'],
            ARRAY['10+ new partners/month', '20% reduction in acquisition cost'],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        ELSE
            RAISE NOTICE 'Skipping partner-expansion-tool - already has % tasks', existing_task_count;
        END IF;
    END IF;

    -- =========================================================================
    -- INVESTOR PORTAL
    -- =========================================================================
    SELECT id INTO project_record FROM projects WHERE slug = 'investor-portal';
    IF project_record.id IS NOT NULL THEN
        -- Check if project already has tasks
        SELECT COUNT(*) INTO existing_task_count FROM tasks WHERE project_id = project_record.id;
        IF existing_task_count = 0 THEN
            task_order := 0;

        -- Task: Investor Requirements Discovery
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Investor Requirements Discovery',
            'Interview investors to understand their reporting needs, frequency, and preferred metrics.',
            'discovery',
            'not_started',
            'easy',
            '8-12h',
            'low',
            '',
            ARRAY['Meeting tools', 'Documentation'],
            ARRAY['Stakeholder Management', 'Business Logic'],
            ARRAY['All investors interviewed', 'Requirements documented', 'Priority metrics identified'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: KPI Framework Design
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'KPI Framework Design',
            'Design KPI framework covering financial, operational, and growth metrics.',
            'planning',
            'not_started',
            'medium',
            '12-16h',
            'medium',
            '',
            ARRAY['Spreadsheets', 'Documentation'],
            ARRAY['Data Analytics', 'Business Logic'],
            ARRAY['KPI definitions finalized', 'Calculation methods documented', 'Data sources mapped'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Secure Authentication System
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Secure Authentication System',
            'Build secure login with MFA for investor access.',
            'development',
            'not_started',
            'hard',
            '20-30h',
            'medium',
            '',
            ARRAY['Auth0', 'Node.js'],
            ARRAY['Security/Auth', 'API Integration'],
            ARRAY['MFA working', 'Role-based access implemented', 'Security audit passed'],
            ARRAY[]::TEXT[],
            ARRAY['Security vulnerabilities', 'Compliance requirements'],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: KPI Dashboard Development
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'KPI Dashboard Development',
            'Build dashboard with real-time KPIs, trends, and drill-down capabilities.',
            'development',
            'not_started',
            'medium',
            '24-32h',
            'high',
            '',
            ARRAY['React', 'Chart.js', 'APIs'],
            ARRAY['Frontend/React', 'Data Analytics'],
            ARRAY['All KPIs displayed', 'Historical trends working', 'Drill-downs functional'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Document Room
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Document Room',
            'Build secure document repository for board materials, financials, and reports.',
            'development',
            'not_started',
            'medium',
            '16-20h',
            'high',
            '',
            ARRAY['S3', 'Node.js'],
            ARRAY['API Integration', 'Security/Auth'],
            ARRAY['Upload/download working', 'Version control implemented', 'Access logging active'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: AI Q&A Integration
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'AI Q&A Integration',
            'Add AI assistant to answer investor questions about metrics and performance.',
            'development',
            'not_started',
            'hard',
            '16-24h',
            'high',
            '',
            ARRAY['LLM API', 'Node.js'],
            ARRAY['LLM/Prompt Engineering', 'API Integration'],
            ARRAY['Q&A functional', 'Responses accurate', 'Sources cited'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Security Testing
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Security Testing',
            'Conduct security penetration testing and vulnerability assessment.',
            'testing',
            'not_started',
            'hard',
            '12-16h',
            'low',
            '',
            ARRAY['Security tools'],
            ARRAY['Security/Auth', 'Compliance/Legal'],
            ARRAY['Pen test completed', 'Vulnerabilities fixed', 'Compliance verified'],
            ARRAY[]::TEXT[],
            ARRAY['Security findings delaying launch'],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Investor Onboarding
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Investor Onboarding',
            'Onboard investors to the portal with guided walkthroughs.',
            'training',
            'not_started',
            'easy',
            '8-12h',
            'medium',
            '',
            ARRAY['Training materials', 'Meeting tools'],
            ARRAY['Training & Documentation', 'Stakeholder Management'],
            ARRAY['All investors onboarded', 'Documentation provided', 'Support channel established'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Launch & Monitor
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Launch & Monitor',
            'Launch portal and establish ongoing reporting cadence.',
            'rollout',
            'not_started',
            'easy',
            '8-12h',
            'low',
            '',
            ARRAY['Dashboards', 'Communication tools'],
            ARRAY['Change Management'],
            ARRAY['Portal live', 'Monthly reporting scheduled', 'Feedback mechanism active'],
            ARRAY['100% investor adoption', '50% reduction in ad-hoc reporting requests'],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        ELSE
            RAISE NOTICE 'Skipping investor-portal - already has % tasks', existing_task_count;
        END IF;
    END IF;

    -- =========================================================================
    -- INSTALLER PERFORMANCE TRACKING
    -- =========================================================================
    SELECT id INTO project_record FROM projects WHERE slug = 'installer-performance-tracking';
    IF project_record.id IS NOT NULL THEN
        -- Check if project already has tasks
        SELECT COUNT(*) INTO existing_task_count FROM tasks WHERE project_id = project_record.id;
        IF existing_task_count = 0 THEN
            task_order := 0;

        -- Task: SLA & Metrics Definition
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'SLA & Metrics Definition',
            'Define SLAs and performance metrics with installer network input.',
            'discovery',
            'not_started',
            'medium',
            '12-16h',
            'medium',
            '',
            ARRAY['Documentation', 'Spreadsheets'],
            ARRAY['Business Logic', 'Stakeholder Management'],
            ARRAY['SLAs defined', 'Metrics agreed upon', 'Thresholds set'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Data Pipeline Design
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Data Pipeline Design',
            'Design data pipeline to aggregate installer performance from all touchpoints.',
            'planning',
            'not_started',
            'medium',
            '8-12h',
            'high',
            '',
            ARRAY['Architecture tools'],
            ARRAY['Database/SQL', 'Data Analytics'],
            ARRAY['Pipeline architecture documented', 'Data sources identified', 'Refresh rates defined'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Metrics Calculation Engine
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Metrics Calculation Engine',
            'Build backend to calculate conversion rates, response times, and quality scores.',
            'development',
            'not_started',
            'hard',
            '20-28h',
            'high',
            '',
            ARRAY['Node.js', 'PostgreSQL'],
            ARRAY['Database/SQL', 'Business Logic'],
            ARRAY['All metrics calculating correctly', 'Historical data processed', 'Real-time updates working'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Performance Dashboard
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Performance Dashboard',
            'Build dashboard showing installer rankings, trends, and SLA status.',
            'development',
            'not_started',
            'medium',
            '16-24h',
            'high',
            '',
            ARRAY['React', 'Chart.js'],
            ARRAY['Frontend/React', 'Data Analytics'],
            ARRAY['Rankings displayed', 'Trend charts working', 'SLA indicators visible'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Alerting System
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Alerting System',
            'Build alerts for SLA breaches and performance degradation.',
            'development',
            'not_started',
            'medium',
            '12-16h',
            'high',
            '',
            ARRAY['Slack API', 'Node.js'],
            ARRAY['API Integration', 'Business Logic'],
            ARRAY['Slack alerts working', 'Thresholds configurable', 'Escalation rules active'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Installer Leaderboard
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Installer Leaderboard',
            'Create public leaderboard to motivate installer performance.',
            'development',
            'not_started',
            'easy',
            '8-12h',
            'high',
            '',
            ARRAY['React'],
            ARRAY['Frontend/React'],
            ARRAY['Leaderboard deployed', 'Rankings updating', 'Privacy settings respected'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Validation & Calibration
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Validation & Calibration',
            'Validate metrics with historical data and calibrate thresholds.',
            'testing',
            'not_started',
            'medium',
            '12-16h',
            'medium',
            '',
            ARRAY['Analytics tools'],
            ARRAY['Data Analytics', 'Business Logic'],
            ARRAY['Metrics validated against manual calculations', 'Thresholds adjusted', 'Edge cases handled'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Installer Communication
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Installer Communication',
            'Communicate new tracking system to installers and address concerns.',
            'training',
            'not_started',
            'easy',
            '8-12h',
            'medium',
            '',
            ARRAY['Communication tools'],
            ARRAY['Change Management', 'Stakeholder Management'],
            ARRAY['All installers informed', 'FAQ document created', 'Feedback collected'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Launch & Optimize
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Launch & Optimize',
            'Launch tracking system and establish review cadence.',
            'rollout',
            'not_started',
            'easy',
            '8-12h',
            'low',
            '',
            ARRAY['Dashboards'],
            ARRAY['Change Management'],
            ARRAY['System live', 'Weekly reviews scheduled', 'Improvement actions tracked'],
            ARRAY['15% improvement in average conversion rate', '20% reduction in SLA breaches'],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        ELSE
            RAISE NOTICE 'Skipping installer-performance-tracking - already has % tasks', existing_task_count;
        END IF;
    END IF;

    -- =========================================================================
    -- DYNAMIC ALLOCATION ENGINE
    -- =========================================================================
    SELECT id INTO project_record FROM projects WHERE slug = 'dynamic-allocation-engine';
    IF project_record.id IS NOT NULL THEN
        -- Check if project already has tasks
        SELECT COUNT(*) INTO existing_task_count FROM tasks WHERE project_id = project_record.id;
        IF existing_task_count = 0 THEN
            task_order := 0;

        -- Task: Allocation Rules Discovery
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Allocation Rules Discovery',
            'Document current allocation rules, pain points, and desired improvements.',
            'discovery',
            'not_started',
            'medium',
            '12-16h',
            'medium',
            '',
            ARRAY['Documentation', 'Analytics'],
            ARRAY['Business Logic', 'Data Analytics'],
            ARRAY['Current rules documented', 'Pain points identified', 'Success criteria defined'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Scoring Model Design
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Scoring Model Design',
            'Design lead-installer matching algorithm considering capacity, performance, location.',
            'planning',
            'not_started',
            'hard',
            '16-24h',
            'high',
            '',
            ARRAY['Documentation', 'Analytics'],
            ARRAY['Data Analytics', 'Business Logic'],
            ARRAY['Algorithm specification complete', 'Weighting factors defined', 'Edge cases documented'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Real-time Capacity Tracking
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Real-time Capacity Tracking',
            'Build system to track installer capacity in real-time.',
            'development',
            'not_started',
            'hard',
            '20-28h',
            'medium',
            '',
            ARRAY['Node.js', 'PostgreSQL', 'Redis'],
            ARRAY['Database/SQL', 'API Integration'],
            ARRAY['Capacity updating in real-time', 'Installer self-service working', 'Historical tracking active'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Scoring Engine Implementation
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Scoring Engine Implementation',
            'Implement the lead-installer matching algorithm.',
            'development',
            'not_started',
            'hard',
            '24-32h',
            'high',
            '',
            ARRAY['Node.js', 'PostgreSQL'],
            ARRAY['Business Logic', 'Database/SQL'],
            ARRAY['Algorithm deployed', 'Scores calculating correctly', 'Performance optimized'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Allocation Router
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Allocation Router',
            'Build router that allocates leads based on scores and capacity.',
            'development',
            'not_started',
            'hard',
            '16-24h',
            'medium',
            '',
            ARRAY['Node.js', 'Zoho API'],
            ARRAY['API Integration', 'Business Logic'],
            ARRAY['Automatic allocation working', 'Fallback rules implemented', 'Manual override available'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Admin Dashboard
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Admin Dashboard',
            'Build dashboard for ops to monitor and adjust allocation rules.',
            'development',
            'not_started',
            'medium',
            '16-20h',
            'high',
            '',
            ARRAY['React'],
            ARRAY['Frontend/React'],
            ARRAY['Dashboard deployed', 'Rules editable', 'Allocation history visible'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Deviation Alerts
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Deviation Alerts',
            'Build alerts when allocation deviates from expected patterns.',
            'development',
            'not_started',
            'medium',
            '8-12h',
            'high',
            '',
            ARRAY['Slack API', 'Node.js'],
            ARRAY['API Integration', 'Business Logic'],
            ARRAY['Alerts configured', 'Thresholds set', 'Escalation working'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: A/B Testing Framework
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'A/B Testing Framework',
            'Build framework to test allocation algorithm variations.',
            'testing',
            'not_started',
            'hard',
            '12-16h',
            'high',
            '',
            ARRAY['Node.js', 'Analytics'],
            ARRAY['Data Analytics', 'Business Logic'],
            ARRAY['A/B framework deployed', 'Traffic splitting working', 'Results tracking active'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Installer Training
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Installer Training',
            'Train installers on new allocation system and capacity management.',
            'training',
            'not_started',
            'easy',
            '8-12h',
            'medium',
            '',
            ARRAY['Training materials'],
            ARRAY['Training & Documentation', 'Change Management'],
            ARRAY['All installers trained', 'Documentation complete', 'FAQ published'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Phased Rollout
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Phased Rollout',
            'Roll out new allocation engine starting with pilot regions.',
            'rollout',
            'not_started',
            'medium',
            '16-24h',
            'low',
            '',
            ARRAY['Dashboards', 'Communication tools'],
            ARRAY['Change Management'],
            ARRAY['Pilot successful', 'Full rollout complete', 'Old system deprecated'],
            ARRAY['10% improvement in conversion rate', '15% better installer utilization'],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        ELSE
            RAISE NOTICE 'Skipping dynamic-allocation-engine - already has % tasks', existing_task_count;
        END IF;
    END IF;

    -- =========================================================================
    -- WHATSAPP CONVERSATION SUMMARY
    -- =========================================================================
    SELECT id INTO project_record FROM projects WHERE slug = 'whatsapp-conversation-summary';
    IF project_record.id IS NOT NULL THEN
        -- Check if project already has tasks
        SELECT COUNT(*) INTO existing_task_count FROM tasks WHERE project_id = project_record.id;
        IF existing_task_count = 0 THEN
            task_order := 0;

        -- Task: SDR Workflow Analysis
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'SDR Workflow Analysis',
            'Observe SDR call prep workflow. Identify time spent reading WhatsApp history.',
            'discovery',
            'not_started',
            'easy',
            '8-12h',
            'low',
            '',
            ARRAY['Screen recording', 'Documentation'],
            ARRAY['Business Logic', 'Process Design'],
            ARRAY['Current workflow documented', 'Time spent measured', 'Pain points identified'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Summary Format Design
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Summary Format Design',
            'Design summary format - what info to include, length, structure.',
            'planning',
            'not_started',
            'easy',
            '6-8h',
            'medium',
            '',
            ARRAY['Documentation'],
            ARRAY['UX Design', 'Business Logic'],
            ARRAY['Summary template approved', 'Key fields identified', 'Length guidelines set'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: WhatsApp API Integration
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'WhatsApp API Integration',
            'Build integration to fetch conversation history from Woztell.',
            'development',
            'not_started',
            'medium',
            '16-24h',
            'medium',
            '',
            ARRAY['Woztell API', 'Node.js'],
            ARRAY['API Integration'],
            ARRAY['History fetching working', 'Pagination handled', 'Error handling robust'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            TRUE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: LLM Summary Generator
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'LLM Summary Generator',
            'Build LLM-based summarizer using Claude/GPT.',
            'development',
            'not_started',
            'medium',
            '12-16h',
            'high',
            '',
            ARRAY['LLM API', 'Node.js'],
            ARRAY['LLM/Prompt Engineering'],
            ARRAY['Summaries generating', 'Quality validated', 'Latency acceptable'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: SDR Portal Integration
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'SDR Portal Integration',
            'Embed summary view in SDR portal before call screens.',
            'development',
            'not_started',
            'easy',
            '8-12h',
            'high',
            '',
            ARRAY['React'],
            ARRAY['Frontend/React'],
            ARRAY['Summary visible in portal', 'Loading states handled', 'Refresh working'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Pilot with SDR Team
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Pilot with SDR Team',
            'Pilot with 2-3 SDRs and collect feedback on summary quality.',
            'testing',
            'not_started',
            'easy',
            '8-12h',
            'low',
            '',
            ARRAY['Feedback forms'],
            ARRAY['Stakeholder Management'],
            ARRAY['Pilot completed', 'Feedback collected', 'Improvements identified'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Launch to All SDRs
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Launch to All SDRs',
            'Roll out to full SDR team with training.',
            'rollout',
            'not_started',
            'easy',
            '6-8h',
            'low',
            '',
            ARRAY['Training materials'],
            ARRAY['Change Management'],
            ARRAY['All SDRs using feature', 'Documentation complete'],
            ARRAY['2+ min saved per call prep', '90% SDR adoption'],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        ELSE
            RAISE NOTICE 'Skipping whatsapp-conversation-summary - already has % tasks', existing_task_count;
        END IF;
    END IF;

    -- =========================================================================
    -- CONTACT PRIORITIZATION ENGINE
    -- =========================================================================
    SELECT id INTO project_record FROM projects WHERE slug = 'contact-prioritization-engine';
    IF project_record.id IS NOT NULL THEN
        -- Check if project already has tasks
        SELECT COUNT(*) INTO existing_task_count FROM tasks WHERE project_id = project_record.id;
        IF existing_task_count = 0 THEN
            task_order := 0;

        -- Task: Conversion Factor Analysis
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Conversion Factor Analysis',
            'Analyze historical data to identify factors that predict conversion.',
            'discovery',
            'not_started',
            'hard',
            '16-24h',
            'high',
            '',
            ARRAY['Analytics tools', 'SQL'],
            ARRAY['Data Analytics', 'Business Logic'],
            ARRAY['Key factors identified', 'Correlation analysis complete', 'Insights documented'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Scoring Model Design
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Scoring Model Design',
            'Design scoring algorithm incorporating identified conversion factors.',
            'planning',
            'not_started',
            'hard',
            '12-16h',
            'high',
            '',
            ARRAY['Documentation', 'Analytics'],
            ARRAY['Data Analytics', 'Business Logic'],
            ARRAY['Algorithm specification complete', 'Weighting defined', 'Edge cases documented'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Scoring Engine Development
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Scoring Engine Development',
            'Build real-time scoring engine for contact prioritization.',
            'development',
            'not_started',
            'hard',
            '20-28h',
            'high',
            '',
            ARRAY['Node.js', 'PostgreSQL', 'Redis'],
            ARRAY['Database/SQL', 'API Integration'],
            ARRAY['Scores calculating correctly', 'Real-time updates working', 'API endpoints ready'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Best Time-to-Call Analysis
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Best Time-to-Call Analysis',
            'Analyze call patterns to determine optimal contact times per lead.',
            'development',
            'not_started',
            'medium',
            '12-16h',
            'high',
            '',
            ARRAY['Analytics', 'Aircall data'],
            ARRAY['Data Analytics'],
            ARRAY['Optimal times identified', 'Model trained', 'Recommendations generating'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Prioritized Queue UI
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Prioritized Queue UI',
            'Build UI showing contacts ranked by score with call time recommendations.',
            'development',
            'not_started',
            'medium',
            '12-16h',
            'high',
            '',
            ARRAY['React'],
            ARRAY['Frontend/React', 'UX Design'],
            ARRAY['Queue displayed', 'Scores visible', 'Best time shown'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Integration with SDR Portal
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Integration with SDR Portal',
            'Embed prioritization in SDR daily workflow.',
            'development',
            'not_started',
            'easy',
            '8-12h',
            'high',
            '',
            ARRAY['React'],
            ARRAY['Frontend/React'],
            ARRAY['Integrated in portal', 'Workflow updated', 'SDRs can access'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: A/B Test vs Random
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'A/B Test vs Random',
            'Run A/B test comparing prioritized vs random contact order.',
            'testing',
            'not_started',
            'medium',
            '16-24h',
            'medium',
            '',
            ARRAY['Analytics'],
            ARRAY['Data Analytics', 'Business Logic'],
            ARRAY['Test designed', 'Results statistically significant', 'Winner determined'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: SDR Training
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'SDR Training',
            'Train SDRs on using prioritization effectively.',
            'training',
            'not_started',
            'easy',
            '6-8h',
            'medium',
            '',
            ARRAY['Training materials'],
            ARRAY['Training & Documentation'],
            ARRAY['All SDRs trained', 'Documentation complete'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Launch & Monitor
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Launch & Monitor',
            'Launch prioritization engine and monitor impact.',
            'rollout',
            'not_started',
            'easy',
            '8-12h',
            'low',
            '',
            ARRAY['Dashboards'],
            ARRAY['Change Management'],
            ARRAY['System live', 'Metrics tracked', 'Weekly reviews established'],
            ARRAY['15% improvement in conversion rate', '20% more contacts per day'],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        ELSE
            RAISE NOTICE 'Skipping contact-prioritization-engine - already has % tasks', existing_task_count;
        END IF;
    END IF;

    -- =========================================================================
    -- LEAD RECYCLING WORKFLOW
    -- =========================================================================
    SELECT id INTO project_record FROM projects WHERE slug = 'lead-recycling-workflow';
    IF project_record.id IS NOT NULL THEN
        -- Check if project already has tasks
        SELECT COUNT(*) INTO existing_task_count FROM tasks WHERE project_id = project_record.id;
        IF existing_task_count = 0 THEN
            task_order := 0;

        -- Task: Lost Lead Analysis
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Lost Lead Analysis',
            'Analyze reasons for lead loss and identify recyclable segments.',
            'discovery',
            'not_started',
            'medium',
            '12-16h',
            'high',
            '',
            ARRAY['Analytics', 'CRM data'],
            ARRAY['Data Analytics', 'Business Logic'],
            ARRAY['Loss reasons categorized', 'Recyclable segments identified', 'Volume quantified'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Recycling Rules Design
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Recycling Rules Design',
            'Design rules for when and how to recycle leads.',
            'planning',
            'not_started',
            'medium',
            '8-12h',
            'medium',
            '',
            ARRAY['Documentation'],
            ARRAY['Business Logic', 'Process Design'],
            ARRAY['Rules documented', 'Cooldown periods defined', 'Re-engagement triggers set'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Recycling Queue Builder
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Recycling Queue Builder',
            'Build automated queue that surfaces recyclable leads.',
            'development',
            'not_started',
            'medium',
            '16-24h',
            'high',
            '',
            ARRAY['Node.js', 'PostgreSQL'],
            ARRAY['Database/SQL', 'Business Logic'],
            ARRAY['Queue populating correctly', 'Rules engine working', 'Priority sorting active'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Re-engagement Sequences
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Re-engagement Sequences',
            'Create email/WhatsApp sequences for different recycling segments.',
            'development',
            'not_started',
            'medium',
            '12-16h',
            'high',
            '',
            ARRAY['Email tools', 'WhatsApp'],
            ARRAY['Business Logic'],
            ARRAY['Sequences created per segment', 'Personalization working', 'Tracking active'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: SDR Portal Integration
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'SDR Portal Integration',
            'Add recycling queue to SDR daily workflow.',
            'development',
            'not_started',
            'easy',
            '8-12h',
            'high',
            '',
            ARRAY['React'],
            ARRAY['Frontend/React'],
            ARRAY['Queue visible in portal', 'Easy to work leads', 'Stats tracked'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Pilot Campaign
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Pilot Campaign',
            'Run pilot recycling campaign with subset of lost leads.',
            'testing',
            'not_started',
            'medium',
            '16-20h',
            'low',
            '',
            ARRAY['CRM', 'Analytics'],
            ARRAY['Business Logic'],
            ARRAY['Pilot completed', 'Conversion measured', 'Feedback collected'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Launch & Scale
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Launch & Scale',
            'Launch recycling workflow at scale.',
            'rollout',
            'not_started',
            'easy',
            '8-12h',
            'low',
            '',
            ARRAY['Dashboards'],
            ARRAY['Change Management'],
            ARRAY['System live', 'All segments active', 'Metrics tracked'],
            ARRAY['5% of recycled leads convert', '10% increase in total conversions'],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        ELSE
            RAISE NOTICE 'Skipping lead-recycling-workflow - already has % tasks', existing_task_count;
        END IF;
    END IF;

    -- =========================================================================
    -- INSTALLER FEEDBACK SYSTEM
    -- =========================================================================
    SELECT id INTO project_record FROM projects WHERE slug = 'installer-feedback-system';
    IF project_record.id IS NOT NULL THEN
        -- Check if project already has tasks
        SELECT COUNT(*) INTO existing_task_count FROM tasks WHERE project_id = project_record.id;
        IF existing_task_count = 0 THEN
            task_order := 0;

        -- Task: Feedback Requirements
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Feedback Requirements',
            'Define what feedback to collect and when in the lead lifecycle.',
            'discovery',
            'not_started',
            'easy',
            '8-12h',
            'medium',
            '',
            ARRAY['Documentation'],
            ARRAY['Business Logic', 'Stakeholder Management'],
            ARRAY['Feedback fields defined', 'Timing rules set', 'Installer input gathered'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Feedback Form Design
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Feedback Form Design',
            'Design simple feedback form optimized for mobile.',
            'planning',
            'not_started',
            'easy',
            '6-8h',
            'medium',
            '',
            ARRAY['Design tools'],
            ARRAY['UX Design'],
            ARRAY['Form designed', 'Mobile-friendly', 'Quick to complete'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Feedback API & Storage
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Feedback API & Storage',
            'Build API to receive and store installer feedback.',
            'development',
            'not_started',
            'medium',
            '12-16h',
            'high',
            '',
            ARRAY['Node.js', 'PostgreSQL'],
            ARRAY['API Integration', 'Database/SQL'],
            ARRAY['API working', 'Data storing correctly', 'Validation in place'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Feedback UI in Installer Portal
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Feedback UI in Installer Portal',
            'Add feedback submission to installer portal.',
            'development',
            'not_started',
            'easy',
            '8-12h',
            'high',
            '',
            ARRAY['React'],
            ARRAY['Frontend/React'],
            ARRAY['Form in portal', 'Submission working', 'Confirmation shown'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Feedback Analytics Dashboard
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Feedback Analytics Dashboard',
            'Build dashboard to analyze feedback patterns.',
            'development',
            'not_started',
            'medium',
            '10-14h',
            'high',
            '',
            ARRAY['React', 'Chart.js'],
            ARRAY['Frontend/React', 'Data Analytics'],
            ARRAY['Dashboard deployed', 'Trends visible', 'Filtering working'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Installer Training
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Installer Training',
            'Train installers on providing quality feedback.',
            'training',
            'not_started',
            'easy',
            '6-8h',
            'medium',
            '',
            ARRAY['Training materials'],
            ARRAY['Training & Documentation'],
            ARRAY['All installers trained', 'Guidelines documented'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Launch & Monitor
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Launch & Monitor',
            'Launch feedback system and establish review process.',
            'rollout',
            'not_started',
            'easy',
            '6-8h',
            'low',
            '',
            ARRAY['Dashboards'],
            ARRAY['Change Management'],
            ARRAY['System live', 'Feedback flowing', 'Weekly reviews scheduled'],
            ARRAY['80% feedback submission rate', 'Actionable insights weekly'],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        ELSE
            RAISE NOTICE 'Skipping installer-feedback-system - already has % tasks', existing_task_count;
        END IF;
    END IF;

    -- =========================================================================
    -- INSTALLER QUOTE SYNC
    -- =========================================================================
    SELECT id INTO project_record FROM projects WHERE slug = 'installer-quote-sync';
    IF project_record.id IS NOT NULL THEN
        -- Check if project already has tasks
        SELECT COUNT(*) INTO existing_task_count FROM tasks WHERE project_id = project_record.id;
        IF existing_task_count = 0 THEN
            task_order := 0;

        -- Task: Quote Process Mapping
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Quote Process Mapping',
            'Map current quote submission process and identify gaps.',
            'discovery',
            'not_started',
            'easy',
            '6-8h',
            'low',
            '',
            ARRAY['Documentation'],
            ARRAY['Process Design', 'Business Logic'],
            ARRAY['Current process documented', 'Gaps identified', 'Requirements defined'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Quote Data Model
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Quote Data Model',
            'Design data model for quote information.',
            'planning',
            'not_started',
            'easy',
            '4-6h',
            'high',
            '',
            ARRAY['Documentation'],
            ARRAY['Database/SQL'],
            ARRAY['Data model defined', 'Fields agreed upon', 'Validation rules set'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Quote Submission API
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Quote Submission API',
            'Build API for installers to submit quotes.',
            'development',
            'not_started',
            'medium',
            '12-16h',
            'high',
            '',
            ARRAY['Node.js', 'PostgreSQL', 'Zoho API'],
            ARRAY['API Integration', 'Database/SQL'],
            ARRAY['API working', 'Zoho sync active', 'Validation in place'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Quote Form in Portal
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Quote Form in Portal',
            'Add quote submission form to installer portal.',
            'development',
            'not_started',
            'easy',
            '8-10h',
            'high',
            '',
            ARRAY['React'],
            ARRAY['Frontend/React'],
            ARRAY['Form working', 'Validation messages shown', 'Confirmation displayed'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Testing & Validation
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Testing & Validation',
            'Test quote flow end-to-end with real installers.',
            'testing',
            'not_started',
            'easy',
            '8-12h',
            'low',
            '',
            ARRAY['Test cases'],
            ARRAY['Business Logic'],
            ARRAY['All flows tested', 'Edge cases covered', 'Data syncing correctly'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Launch
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Launch',
            'Launch quote sync to all installers.',
            'rollout',
            'not_started',
            'easy',
            '6-8h',
            'low',
            '',
            ARRAY['Communication tools'],
            ARRAY['Change Management'],
            ARRAY['All installers using new flow', 'Manual process deprecated'],
            ARRAY['100% quote capture rate', '50% faster quote turnaround'],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        ELSE
            RAISE NOTICE 'Skipping installer-quote-sync - already has % tasks', existing_task_count;
        END IF;
    END IF;

    -- =========================================================================
    -- ANSWER RATE MONITORING
    -- =========================================================================
    SELECT id INTO project_record FROM projects WHERE slug = 'answer-rate-monitoring';
    IF project_record.id IS NOT NULL THEN
        -- Check if project already has tasks
        SELECT COUNT(*) INTO existing_task_count FROM tasks WHERE project_id = project_record.id;
        IF existing_task_count = 0 THEN
            task_order := 0;

        -- Task: Metrics Definition
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Metrics Definition',
            'Define answer rate metrics, thresholds, and segments to track.',
            'discovery',
            'not_started',
            'easy',
            '6-8h',
            'medium',
            '',
            ARRAY['Documentation', 'Analytics'],
            ARRAY['Business Logic', 'Data Analytics'],
            ARRAY['Metrics defined', 'Thresholds set', 'Segments identified'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Data Pipeline Setup
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Data Pipeline Setup',
            'Design pipeline to aggregate call data from Aircall.',
            'planning',
            'not_started',
            'medium',
            '6-8h',
            'high',
            '',
            ARRAY['Aircall API', 'Documentation'],
            ARRAY['API Integration', 'Data Analytics'],
            ARRAY['Pipeline architecture defined', 'Refresh rates set'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Metrics Calculation Engine
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Metrics Calculation Engine',
            'Build backend to calculate answer rates by various dimensions.',
            'development',
            'not_started',
            'medium',
            '12-16h',
            'high',
            '',
            ARRAY['Node.js', 'PostgreSQL', 'Aircall API'],
            ARRAY['Database/SQL', 'API Integration'],
            ARRAY['Metrics calculating correctly', 'Historical data processed'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Monitoring Dashboard
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Monitoring Dashboard',
            'Build dashboard showing answer rates and trends.',
            'development',
            'not_started',
            'medium',
            '10-14h',
            'high',
            '',
            ARRAY['React', 'Chart.js'],
            ARRAY['Frontend/React', 'Data Analytics'],
            ARRAY['Dashboard deployed', 'All metrics visible', 'Drill-downs working'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Alerting Setup
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Alerting Setup',
            'Configure alerts for answer rate drops.',
            'development',
            'not_started',
            'easy',
            '6-8h',
            'high',
            '',
            ARRAY['Slack API'],
            ARRAY['API Integration'],
            ARRAY['Alerts configured', 'Thresholds set', 'Escalation working'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Launch & Monitor
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Launch & Monitor',
            'Launch monitoring and establish review cadence.',
            'rollout',
            'not_started',
            'easy',
            '4-6h',
            'low',
            '',
            ARRAY['Dashboards'],
            ARRAY['Change Management'],
            ARRAY['Monitoring live', 'Weekly reviews scheduled'],
            ARRAY['Issues identified within 1 hour', '5% improvement in answer rates'],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        ELSE
            RAISE NOTICE 'Skipping answer-rate-monitoring - already has % tasks', existing_task_count;
        END IF;
    END IF;

    -- =========================================================================
    -- GDPR COMPLIANCE TRACKER
    -- =========================================================================
    SELECT id INTO project_record FROM projects WHERE slug = 'gdpr-compliance-tracker';
    IF project_record.id IS NOT NULL THEN
        -- Check if project already has tasks
        SELECT COUNT(*) INTO existing_task_count FROM tasks WHERE project_id = project_record.id;
        IF existing_task_count = 0 THEN
            task_order := 0;

        -- Task: Compliance Requirements Audit
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Compliance Requirements Audit',
            'Audit current GDPR compliance status and identify gaps.',
            'discovery',
            'not_started',
            'hard',
            '12-16h',
            'medium',
            '',
            ARRAY['Documentation', 'GDPR guidelines'],
            ARRAY['Compliance/Legal', 'Business Logic'],
            ARRAY['Compliance gaps identified', 'Risk areas documented', 'Remediation plan created'],
            ARRAY[]::TEXT[],
            ARRAY['Legal exposure from non-compliance'],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Consent Management Design
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Consent Management Design',
            'Design consent tracking system across all touchpoints.',
            'planning',
            'not_started',
            'medium',
            '8-12h',
            'medium',
            '',
            ARRAY['Documentation'],
            ARRAY['Compliance/Legal', 'Database/SQL'],
            ARRAY['Consent flows documented', 'Data model defined', 'Audit trail designed'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Consent Tracking Implementation
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Consent Tracking Implementation',
            'Build consent tracking database and APIs.',
            'development',
            'not_started',
            'hard',
            '16-24h',
            'medium',
            '',
            ARRAY['Node.js', 'PostgreSQL'],
            ARRAY['Database/SQL', 'API Integration', 'Compliance/Legal'],
            ARRAY['Consent database live', 'APIs working', 'Audit trail active'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Data Subject Rights Portal
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Data Subject Rights Portal',
            'Build portal for data access, deletion, and portability requests.',
            'development',
            'not_started',
            'medium',
            '12-16h',
            'high',
            '',
            ARRAY['React', 'Node.js'],
            ARRAY['Frontend/React', 'Compliance/Legal'],
            ARRAY['Portal deployed', 'Request workflows working', 'Response times tracked'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Compliance Dashboard
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Compliance Dashboard',
            'Build dashboard showing compliance status and pending requests.',
            'development',
            'not_started',
            'medium',
            '10-14h',
            'high',
            '',
            ARRAY['React', 'Chart.js'],
            ARRAY['Frontend/React', 'Compliance/Legal'],
            ARRAY['Dashboard deployed', 'Metrics visible', 'Alerts configured'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Team Training
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Team Training',
            'Train relevant teams on GDPR compliance procedures.',
            'training',
            'not_started',
            'easy',
            '8-12h',
            'medium',
            '',
            ARRAY['Training materials'],
            ARRAY['Training & Documentation', 'Compliance/Legal'],
            ARRAY['All teams trained', 'Procedures documented', 'Certification complete'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Launch & Audit
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Launch & Audit',
            'Launch compliance system and schedule regular audits.',
            'rollout',
            'not_started',
            'easy',
            '6-8h',
            'low',
            '',
            ARRAY['Dashboards'],
            ARRAY['Compliance/Legal', 'Change Management'],
            ARRAY['System live', 'Quarterly audits scheduled', 'Incident response tested'],
            ARRAY['100% consent tracking', 'All requests handled within SLA'],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        ELSE
            RAISE NOTICE 'Skipping gdpr-compliance-tracker - already has % tasks', existing_task_count;
        END IF;
    END IF;

    -- =========================================================================
    -- AUTOMATED INVOICING
    -- =========================================================================
    SELECT id INTO project_record FROM projects WHERE slug = 'automated-invoicing';
    IF project_record.id IS NOT NULL THEN
        -- Check if project already has tasks
        SELECT COUNT(*) INTO existing_task_count FROM tasks WHERE project_id = project_record.id;
        IF existing_task_count = 0 THEN
            task_order := 0;

        -- Task: Invoicing Rules Discovery
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Invoicing Rules Discovery',
            'Document all invoicing rules, edge cases, and current manual process.',
            'discovery',
            'not_started',
            'medium',
            '10-14h',
            'low',
            '',
            ARRAY['Documentation', 'Spreadsheets'],
            ARRAY['Business Logic', 'Process Design'],
            ARRAY['All rules documented', 'Edge cases identified', 'Current process mapped'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Invoice Template Design
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Invoice Template Design',
            'Design invoice templates meeting legal and brand requirements.',
            'planning',
            'not_started',
            'easy',
            '6-8h',
            'medium',
            '',
            ARRAY['Design tools'],
            ARRAY['Business Logic', 'Compliance/Legal'],
            ARRAY['Templates approved', 'Legal requirements met', 'Brand consistent'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Invoicing Rules Engine
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Invoicing Rules Engine',
            'Build rules engine to calculate invoice amounts based on lead outcomes.',
            'development',
            'not_started',
            'hard',
            '20-28h',
            'medium',
            '',
            ARRAY['Node.js', 'PostgreSQL'],
            ARRAY['Business Logic', 'Database/SQL'],
            ARRAY['Rules engine working', 'All scenarios covered', 'Audit trail active'],
            ARRAY[]::TEXT[],
            ARRAY['Incorrect calculations causing financial issues'],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: PDF Generation System
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'PDF Generation System',
            'Build system to generate PDF invoices from templates.',
            'development',
            'not_started',
            'medium',
            '10-14h',
            'high',
            '',
            ARRAY['Node.js', 'PDF libraries'],
            ARRAY['API Integration'],
            ARRAY['PDFs generating correctly', 'Templates rendering', 'Numbering working'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Holded Integration
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Holded Integration',
            'Integrate with Holded accounting system for invoice sync.',
            'development',
            'not_started',
            'medium',
            '12-16h',
            'medium',
            '',
            ARRAY['Holded API', 'Node.js'],
            ARRAY['API Integration', 'Business Logic'],
            ARRAY['Invoices syncing to Holded', 'Reconciliation working', 'Error handling robust'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Reconciliation Dashboard
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Reconciliation Dashboard',
            'Build dashboard to track invoicing status and discrepancies.',
            'development',
            'not_started',
            'medium',
            '10-14h',
            'high',
            '',
            ARRAY['React', 'Chart.js'],
            ARRAY['Frontend/React', 'Data Analytics'],
            ARRAY['Dashboard deployed', 'Discrepancies highlighted', 'Drill-downs working'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Parallel Testing
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Parallel Testing',
            'Run automated system in parallel with manual for validation.',
            'testing',
            'not_started',
            'medium',
            '16-20h',
            'low',
            '',
            ARRAY['Spreadsheets', 'Analytics'],
            ARRAY['Business Logic', 'Data Analytics'],
            ARRAY['One month parallel run', 'Discrepancies under 1%', 'Edge cases validated'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Go Live
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Go Live',
            'Switch to automated invoicing and deprecate manual process.',
            'rollout',
            'not_started',
            'medium',
            '6-8h',
            'low',
            '',
            ARRAY['Communication tools'],
            ARRAY['Change Management'],
            ARRAY['Automated system live', 'Manual process deprecated', 'Monitoring active'],
            ARRAY['99.5% invoice accuracy', '80% reduction in invoicing time'],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        ELSE
            RAISE NOTICE 'Skipping automated-invoicing - already has % tasks', existing_task_count;
        END IF;
    END IF;

    -- =========================================================================
    -- API SELF SERVICE PORTAL
    -- =========================================================================
    SELECT id INTO project_record FROM projects WHERE slug = 'api-self-service-portal';
    IF project_record.id IS NOT NULL THEN
        -- Check if project already has tasks
        SELECT COUNT(*) INTO existing_task_count FROM tasks WHERE project_id = project_record.id;
        IF existing_task_count = 0 THEN
            task_order := 0;

        -- Task: Provider Requirements Discovery
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Provider Requirements Discovery',
            'Interview lead providers to understand API integration needs.',
            'discovery',
            'not_started',
            'medium',
            '10-14h',
            'low',
            '',
            ARRAY['Meeting tools', 'Documentation'],
            ARRAY['Stakeholder Management', 'API Integration'],
            ARRAY['Provider needs documented', 'Common patterns identified', 'Requirements prioritized'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: API Documentation Design
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'API Documentation Design',
            'Design comprehensive API documentation and onboarding flow.',
            'planning',
            'not_started',
            'medium',
            '12-16h',
            'high',
            '',
            ARRAY['Documentation tools', 'OpenAPI'],
            ARRAY['API Integration', 'UX Design'],
            ARRAY['Documentation structure approved', 'Examples defined', 'Sandbox spec complete'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Developer Portal Build
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Developer Portal Build',
            'Build self-service portal with documentation and API keys.',
            'development',
            'not_started',
            'hard',
            '24-32h',
            'high',
            '',
            ARRAY['React', 'Node.js'],
            ARRAY['Frontend/React', 'API Integration', 'Security/Auth'],
            ARRAY['Portal deployed', 'Documentation live', 'API key generation working'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Sandbox Environment
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Sandbox Environment',
            'Build sandbox environment for providers to test integrations.',
            'development',
            'not_started',
            'hard',
            '16-20h',
            'medium',
            '',
            ARRAY['Node.js', 'Docker'],
            ARRAY['DevOps', 'API Integration'],
            ARRAY['Sandbox deployed', 'Test data available', 'Isolated from production'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Usage Analytics & Billing
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Usage Analytics & Billing',
            'Build usage tracking and automated billing for API access.',
            'development',
            'not_started',
            'medium',
            '12-16h',
            'high',
            '',
            ARRAY['Node.js', 'PostgreSQL'],
            ARRAY['Database/SQL', 'Business Logic'],
            ARRAY['Usage tracking active', 'Billing calculations correct', 'Invoices automated'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Rate Limiting & Security
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Rate Limiting & Security',
            'Implement rate limiting, quotas, and security measures.',
            'development',
            'not_started',
            'hard',
            '10-14h',
            'medium',
            '',
            ARRAY['Redis', 'Node.js'],
            ARRAY['Security/Auth', 'API Integration'],
            ARRAY['Rate limits enforced', 'Quotas working', 'Security audit passed'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Beta Testing with Providers
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Beta Testing with Providers',
            'Beta test portal with 2-3 existing providers.',
            'testing',
            'not_started',
            'medium',
            '12-16h',
            'low',
            '',
            ARRAY['Support tools'],
            ARRAY['Stakeholder Management'],
            ARRAY['Beta completed', 'Feedback collected', 'Issues resolved'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Support Process Setup
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Support Process Setup',
            'Set up support process for provider API questions.',
            'training',
            'not_started',
            'easy',
            '6-8h',
            'medium',
            '',
            ARRAY['Support tools', 'Documentation'],
            ARRAY['Process Design'],
            ARRAY['Support channels defined', 'SLAs set', 'FAQ created'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Launch
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Launch',
            'Launch self-service portal to all providers.',
            'rollout',
            'not_started',
            'easy',
            '6-8h',
            'low',
            '',
            ARRAY['Communication tools'],
            ARRAY['Change Management'],
            ARRAY['Portal live', 'Providers notified', 'Support active'],
            ARRAY['50% reduction in integration support', '2 week avg onboarding time'],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        ELSE
            RAISE NOTICE 'Skipping api-self-service-portal - already has % tasks', existing_task_count;
        END IF;
    END IF;

    -- =========================================================================
    -- PROGRAMMATIC SEO PAGES
    -- =========================================================================
    SELECT id INTO project_record FROM projects WHERE slug = 'programmatic-seo-pages';
    IF project_record.id IS NOT NULL THEN
        -- Check if project already has tasks
        SELECT COUNT(*) INTO existing_task_count FROM tasks WHERE project_id = project_record.id;
        IF existing_task_count = 0 THEN
            task_order := 0;

        -- Task: Keyword & Market Research
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Keyword & Market Research',
            'Research high-intent keywords and identify page opportunities.',
            'discovery',
            'not_started',
            'medium',
            '16-24h',
            'high',
            '',
            ARRAY['SEO tools', 'Keyword research'],
            ARRAY['Business Logic', 'Data Analytics'],
            ARRAY['Keywords identified', 'Search volume analyzed', 'Page templates defined'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Content Template Design
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Content Template Design',
            'Design page templates for different content types.',
            'planning',
            'not_started',
            'medium',
            '12-16h',
            'high',
            '',
            ARRAY['Design tools', 'Documentation'],
            ARRAY['UX Design', 'Business Logic'],
            ARRAY['Templates designed', 'SEO elements defined', 'Content structure set'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: PVGIS Integration
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'PVGIS Integration',
            'Integrate PVGIS API for location-specific solar yield data.',
            'development',
            'not_started',
            'medium',
            '12-16h',
            'high',
            '',
            ARRAY['PVGIS API', 'Node.js'],
            ARRAY['API Integration', 'External APIs'],
            ARRAY['API integrated', 'Data caching working', 'Error handling robust'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            TRUE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Municipal Data Scraper
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Municipal Data Scraper',
            'Build scraper for municipal incentives and regulations.',
            'development',
            'not_started',
            'hard',
            '16-20h',
            'medium',
            '',
            ARRAY['Node.js', 'Puppeteer'],
            ARRAY['External APIs', 'Database/SQL'],
            ARRAY['Scraper working', 'Data updating regularly', 'Coverage tracking active'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Page Generation Engine
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Page Generation Engine',
            'Build engine to generate pages from templates and data.',
            'development',
            'not_started',
            'hard',
            '20-28h',
            'high',
            '',
            ARRAY['Next.js', 'Node.js'],
            ARRAY['Frontend/React', 'Database/SQL'],
            ARRAY['Pages generating correctly', 'SEO elements rendering', 'Performance optimized'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: AI Content Enhancement
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'AI Content Enhancement',
            'Use AI to enhance page content with local context.',
            'development',
            'not_started',
            'medium',
            '12-16h',
            'high',
            '',
            ARRAY['LLM API'],
            ARRAY['LLM/Prompt Engineering'],
            ARRAY['Content enhancing correctly', 'Quality validated', 'Not detected as AI'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Internal Linking System
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Internal Linking System',
            'Build intelligent internal linking between pages.',
            'development',
            'not_started',
            'medium',
            '8-12h',
            'high',
            '',
            ARRAY['Node.js'],
            ARRAY['Business Logic'],
            ARRAY['Linking working', 'Relevance optimized', 'Orphan pages avoided'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: SEO Validation
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'SEO Validation',
            'Validate pages for SEO best practices and performance.',
            'testing',
            'not_started',
            'medium',
            '12-16h',
            'high',
            '',
            ARRAY['SEO tools', 'Lighthouse'],
            ARRAY['Business Logic', 'Data Analytics'],
            ARRAY['All pages passing Lighthouse', 'Schema markup valid', 'Core Web Vitals green'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Indexing & Sitemap
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Indexing & Sitemap',
            'Set up sitemap generation and Google Search Console.',
            'development',
            'not_started',
            'easy',
            '6-8h',
            'high',
            '',
            ARRAY['Google Search Console'],
            ARRAY['External APIs'],
            ARRAY['Sitemap generating', 'GSC configured', 'Indexing tracking active'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Launch & Monitor
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Launch & Monitor',
            'Launch pages and monitor rankings.',
            'rollout',
            'not_started',
            'easy',
            '8-12h',
            'medium',
            '',
            ARRAY['SEO tools', 'Analytics'],
            ARRAY['Data Analytics'],
            ARRAY['Pages live', 'Tracking active', 'Weekly rank monitoring'],
            ARRAY['1000+ pages indexed', '20% organic traffic increase'],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        ELSE
            RAISE NOTICE 'Skipping programmatic-seo-pages - already has % tasks', existing_task_count;
        END IF;
    END IF;

    -- =========================================================================
    -- PVPC SAVINGS WIDGET
    -- =========================================================================
    SELECT id INTO project_record FROM projects WHERE slug = 'pvpc-savings-widget';
    IF project_record.id IS NOT NULL THEN
        -- Check if project already has tasks
        SELECT COUNT(*) INTO existing_task_count FROM tasks WHERE project_id = project_record.id;
        IF existing_task_count = 0 THEN
            task_order := 0;

        -- Task: Widget Requirements
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Widget Requirements',
            'Define widget features, embed requirements, and target pages.',
            'discovery',
            'not_started',
            'easy',
            '4-6h',
            'medium',
            '',
            ARRAY['Documentation'],
            ARRAY['Business Logic', 'UX Design'],
            ARRAY['Features defined', 'Embed specs documented', 'Target pages identified'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: ESIOS API Integration
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'ESIOS API Integration',
            'Integrate ESIOS API for real-time electricity prices.',
            'development',
            'not_started',
            'medium',
            '8-12h',
            'high',
            '',
            ARRAY['ESIOS API', 'Node.js'],
            ARRAY['API Integration', 'External APIs'],
            ARRAY['API integrated', 'Data caching working', 'Error handling robust'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            TRUE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Widget Component Build
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Widget Component Build',
            'Build embeddable React widget with savings calculator.',
            'development',
            'not_started',
            'medium',
            '12-16h',
            'high',
            '',
            ARRAY['React', 'Chart.js'],
            ARRAY['Frontend/React', 'Business Logic'],
            ARRAY['Widget functional', 'Calculations accurate', 'Design approved'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Embed Script Creation
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Embed Script Creation',
            'Create lightweight embed script for third-party sites.',
            'development',
            'not_started',
            'medium',
            '6-8h',
            'high',
            '',
            ARRAY['JavaScript'],
            ARRAY['Frontend/React'],
            ARRAY['Script working', 'Load time minimal', 'Cross-browser compatible'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Testing & Validation
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Testing & Validation',
            'Test widget across browsers and validate calculations.',
            'testing',
            'not_started',
            'easy',
            '6-8h',
            'medium',
            '',
            ARRAY['Testing tools'],
            ARRAY['Business Logic'],
            ARRAY['Cross-browser tested', 'Calculations validated', 'Performance optimized'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Launch & Embed
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Launch & Embed',
            'Launch widget and embed on target pages.',
            'rollout',
            'not_started',
            'easy',
            '4-6h',
            'low',
            '',
            ARRAY['CMS access'],
            ARRAY['Business Logic'],
            ARRAY['Widget live', 'Embedded on all target pages', 'Tracking active'],
            ARRAY['10% conversion on widget users', '5000+ monthly interactions'],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        ELSE
            RAISE NOTICE 'Skipping pvpc-savings-widget - already has % tasks', existing_task_count;
        END IF;
    END IF;

    -- =========================================================================
    -- IRPF CALCULATOR
    -- =========================================================================
    SELECT id INTO project_record FROM projects WHERE slug = 'irpf-calculator';
    IF project_record.id IS NOT NULL THEN
        -- Check if project already has tasks
        SELECT COUNT(*) INTO existing_task_count FROM tasks WHERE project_id = project_record.id;
        IF existing_task_count = 0 THEN
            task_order := 0;

        -- Task: Tax Rules Research
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Tax Rules Research',
            'Research current IRPF deduction rules for solar installations.',
            'discovery',
            'not_started',
            'medium',
            '6-8h',
            'medium',
            '',
            ARRAY['Tax documentation'],
            ARRAY['Compliance/Legal', 'Business Logic'],
            ARRAY['Rules documented', 'Edge cases identified', 'Calculation formulas defined'],
            ARRAY[]::TEXT[],
            ARRAY['Tax law changes'],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Calculator UI Design
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Calculator UI Design',
            'Design simple, user-friendly calculator interface.',
            'planning',
            'not_started',
            'easy',
            '4-6h',
            'high',
            '',
            ARRAY['Design tools'],
            ARRAY['UX Design'],
            ARRAY['Design approved', 'Mobile-friendly', 'Clear input/output'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Calculator Implementation
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Calculator Implementation',
            'Build IRPF calculator with all deduction scenarios.',
            'development',
            'not_started',
            'medium',
            '10-14h',
            'high',
            '',
            ARRAY['React', 'Node.js'],
            ARRAY['Frontend/React', 'Business Logic'],
            ARRAY['Calculator working', 'All scenarios covered', 'Calculations accurate'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Validation with Examples
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Validation with Examples',
            'Validate calculator against known tax examples.',
            'testing',
            'not_started',
            'easy',
            '4-6h',
            'medium',
            '',
            ARRAY['Test cases'],
            ARRAY['Business Logic'],
            ARRAY['All test cases passing', 'Edge cases validated'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Launch
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Launch',
            'Launch calculator and promote.',
            'rollout',
            'not_started',
            'easy',
            '3-4h',
            'low',
            '',
            ARRAY['CMS'],
            ARRAY['Business Logic'],
            ARRAY['Calculator live', 'Tracking active'],
            ARRAY['1000+ monthly calculations', '5% lead conversion'],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        ELSE
            RAISE NOTICE 'Skipping irpf-calculator - already has % tasks', existing_task_count;
        END IF;
    END IF;

    -- =========================================================================
    -- GMB AUTOMATION
    -- =========================================================================
    SELECT id INTO project_record FROM projects WHERE slug = 'gmb-automation';
    IF project_record.id IS NOT NULL THEN
        -- Check if project already has tasks
        SELECT COUNT(*) INTO existing_task_count FROM tasks WHERE project_id = project_record.id;
        IF existing_task_count = 0 THEN
            task_order := 0;

        -- Task: GMB Profile Audit
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'GMB Profile Audit',
            'Audit existing GMB profiles and identify optimization opportunities.',
            'discovery',
            'not_started',
            'easy',
            '8-12h',
            'medium',
            '',
            ARRAY['GMB access', 'Documentation'],
            ARRAY['Business Logic'],
            ARRAY['All profiles audited', 'Issues documented', 'Priorities set'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Automation Strategy
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Automation Strategy',
            'Design automation strategy for posts, responses, and updates.',
            'planning',
            'not_started',
            'easy',
            '6-8h',
            'medium',
            '',
            ARRAY['Documentation'],
            ARRAY['Business Logic', 'Process Design'],
            ARRAY['Strategy approved', 'Content calendar created', 'Response templates defined'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: GMB API Integration
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'GMB API Integration',
            'Integrate Google Business Profile API for automated management.',
            'development',
            'not_started',
            'hard',
            '16-20h',
            'medium',
            '',
            ARRAY['Google Business API', 'Node.js'],
            ARRAY['API Integration', 'External APIs'],
            ARRAY['API connected', 'Read/write working', 'Rate limits handled'],
            ARRAY[]::TEXT[],
            ARRAY['API access approval delays'],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Post Scheduler
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Post Scheduler',
            'Build automated post scheduling system.',
            'development',
            'not_started',
            'medium',
            '10-14h',
            'high',
            '',
            ARRAY['Node.js', 'Cron'],
            ARRAY['API Integration', 'Business Logic'],
            ARRAY['Scheduler working', 'Posts publishing correctly', 'Calendar integration active'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: AI Response Generator
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'AI Response Generator',
            'Build AI-powered response generator for reviews and questions.',
            'development',
            'not_started',
            'medium',
            '12-16h',
            'high',
            '',
            ARRAY['LLM API', 'Node.js'],
            ARRAY['LLM/Prompt Engineering'],
            ARRAY['Responses generating', 'Quality validated', 'Human review workflow working'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Management Dashboard
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Management Dashboard',
            'Build dashboard to manage all GMB profiles centrally.',
            'development',
            'not_started',
            'medium',
            '10-14h',
            'high',
            '',
            ARRAY['React'],
            ARRAY['Frontend/React'],
            ARRAY['Dashboard deployed', 'All profiles visible', 'Actions working'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Launch & Monitor
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Launch & Monitor',
            'Launch automation and monitor performance.',
            'rollout',
            'not_started',
            'easy',
            '6-8h',
            'low',
            '',
            ARRAY['Analytics'],
            ARRAY['Data Analytics'],
            ARRAY['Automation live', 'Metrics tracked', 'Weekly reviews scheduled'],
            ARRAY['50% faster response time', '20% more profile engagement'],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        ELSE
            RAISE NOTICE 'Skipping gmb-automation - already has % tasks', existing_task_count;
        END IF;
    END IF;

    -- =========================================================================
    -- REVIEW GENERATION SYSTEM
    -- =========================================================================
    SELECT id INTO project_record FROM projects WHERE slug = 'review-generation-system';
    IF project_record.id IS NOT NULL THEN
        -- Check if project already has tasks
        SELECT COUNT(*) INTO existing_task_count FROM tasks WHERE project_id = project_record.id;
        IF existing_task_count = 0 THEN
            task_order := 0;

        -- Task: Review Strategy Design
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Review Strategy Design',
            'Design review generation strategy including timing and channels.',
            'discovery',
            'not_started',
            'easy',
            '6-8h',
            'medium',
            '',
            ARRAY['Documentation'],
            ARRAY['Business Logic', 'Process Design'],
            ARRAY['Strategy documented', 'Timing rules defined', 'Channel priorities set'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Trigger System Design
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Trigger System Design',
            'Design triggers for review request automation.',
            'planning',
            'not_started',
            'easy',
            '4-6h',
            'high',
            '',
            ARRAY['Documentation'],
            ARRAY['Business Logic'],
            ARRAY['Triggers defined', 'Rules documented', 'Edge cases covered'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Automated Request System
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Automated Request System',
            'Build automated review request via email/SMS/WhatsApp.',
            'development',
            'not_started',
            'medium',
            '14-18h',
            'high',
            '',
            ARRAY['Node.js', 'SendGrid', 'WhatsApp API'],
            ARRAY['API Integration', 'Business Logic'],
            ARRAY['Requests sending correctly', 'Timing accurate', 'Opt-out working'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Landing Page Builder
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Landing Page Builder',
            'Build personalized landing pages for easy review submission.',
            'development',
            'not_started',
            'medium',
            '8-12h',
            'high',
            '',
            ARRAY['React'],
            ARRAY['Frontend/React', 'UX Design'],
            ARRAY['Pages generating', 'Platform links working', 'Mobile-optimized'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: AI Response Suggestions
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'AI Response Suggestions',
            'Build AI to suggest responses to reviews.',
            'development',
            'not_started',
            'medium',
            '8-12h',
            'high',
            '',
            ARRAY['LLM API'],
            ARRAY['LLM/Prompt Engineering'],
            ARRAY['Suggestions generating', 'Quality validated', 'Approval workflow working'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Review Dashboard
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Review Dashboard',
            'Build dashboard to track review metrics and sentiment.',
            'development',
            'not_started',
            'medium',
            '8-10h',
            'high',
            '',
            ARRAY['React', 'Chart.js'],
            ARRAY['Frontend/React', 'Data Analytics'],
            ARRAY['Dashboard deployed', 'Metrics visible', 'Sentiment tracked'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Launch & Optimize
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Launch & Optimize',
            'Launch review system and optimize based on results.',
            'rollout',
            'not_started',
            'easy',
            '6-8h',
            'low',
            '',
            ARRAY['Analytics'],
            ARRAY['Data Analytics'],
            ARRAY['System live', 'Metrics improving', 'A/B testing active'],
            ARRAY['30% response rate', '4.5+ average rating maintained'],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        ELSE
            RAISE NOTICE 'Skipping review-generation-system - already has % tasks', existing_task_count;
        END IF;
    END IF;

    -- =========================================================================
    -- COMPETITOR INTEL AGENT
    -- =========================================================================
    SELECT id INTO project_record FROM projects WHERE slug = 'competitor-intel-agent';
    IF project_record.id IS NOT NULL THEN
        -- Check if project already has tasks
        SELECT COUNT(*) INTO existing_task_count FROM tasks WHERE project_id = project_record.id;
        IF existing_task_count = 0 THEN
            task_order := 0;

        -- Task: Competitor Mapping
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Competitor Mapping',
            'Identify key competitors and intel priorities.',
            'discovery',
            'not_started',
            'easy',
            '8-12h',
            'medium',
            '',
            ARRAY['Research tools'],
            ARRAY['Business Logic'],
            ARRAY['Competitors listed', 'Intel priorities ranked', 'Data sources identified'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Data Collection Strategy
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Data Collection Strategy',
            'Design ethical data collection approach.',
            'planning',
            'not_started',
            'medium',
            '6-8h',
            'medium',
            '',
            ARRAY['Documentation'],
            ARRAY['Business Logic', 'Compliance/Legal'],
            ARRAY['Strategy approved', 'Legal review complete', 'Sources documented'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Ad Library Scrapers
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Ad Library Scrapers',
            'Build scrapers for Meta/Google ad libraries.',
            'development',
            'not_started',
            'hard',
            '14-18h',
            'medium',
            '',
            ARRAY['Node.js', 'Puppeteer'],
            ARRAY['External APIs', 'Database/SQL'],
            ARRAY['Scrapers working', 'Data storing correctly', 'Rate limits respected'],
            ARRAY[]::TEXT[],
            ARRAY['Platform blocking'],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Pricing Monitor
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Pricing Monitor',
            'Build system to track competitor pricing changes.',
            'development',
            'not_started',
            'medium',
            '10-14h',
            'medium',
            '',
            ARRAY['Node.js', 'Puppeteer'],
            ARRAY['External APIs', 'Business Logic'],
            ARRAY['Prices tracking', 'Change alerts working', 'Historical data stored'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: AI Analysis Engine
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'AI Analysis Engine',
            'Build AI to analyze competitor data and surface insights.',
            'development',
            'not_started',
            'hard',
            '12-16h',
            'high',
            '',
            ARRAY['LLM API', 'Node.js'],
            ARRAY['LLM/Prompt Engineering', 'Data Analytics'],
            ARRAY['Analysis generating', 'Insights actionable', 'Weekly reports automated'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Intel Dashboard
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Intel Dashboard',
            'Build dashboard to view competitor intelligence.',
            'development',
            'not_started',
            'medium',
            '10-14h',
            'high',
            '',
            ARRAY['React'],
            ARRAY['Frontend/React', 'Data Analytics'],
            ARRAY['Dashboard deployed', 'All intel visible', 'Filtering working'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Launch & Monitor
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Launch & Monitor',
            'Launch intel system and establish review process.',
            'rollout',
            'not_started',
            'easy',
            '4-6h',
            'low',
            '',
            ARRAY['Dashboards'],
            ARRAY['Business Logic'],
            ARRAY['System live', 'Weekly intel reviews', 'Action tracking active'],
            ARRAY['Weekly actionable insights', 'Competitive response time under 1 week'],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        ELSE
            RAISE NOTICE 'Skipping competitor-intel-agent - already has % tasks', existing_task_count;
        END IF;
    END IF;

    -- =========================================================================
    -- ROBINSON SUPPRESSOR
    -- =========================================================================
    SELECT id INTO project_record FROM projects WHERE slug = 'robinson-suppressor';
    IF project_record.id IS NOT NULL THEN
        -- Check if project already has tasks
        SELECT COUNT(*) INTO existing_task_count FROM tasks WHERE project_id = project_record.id;
        IF existing_task_count = 0 THEN
            task_order := 0;

        -- Task: Robinson List Research
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Robinson List Research',
            'Research Robinson List requirements and integration options.',
            'discovery',
            'not_started',
            'medium',
            '6-8h',
            'medium',
            '',
            ARRAY['Documentation'],
            ARRAY['Compliance/Legal', 'Business Logic'],
            ARRAY['Requirements documented', 'API/data options identified', 'Compliance rules clear'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Suppression Process Design
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Suppression Process Design',
            'Design suppression workflow for all contact channels.',
            'planning',
            'not_started',
            'easy',
            '4-6h',
            'medium',
            '',
            ARRAY['Documentation'],
            ARRAY['Process Design', 'Compliance/Legal'],
            ARRAY['Process documented', 'All channels covered', 'Audit trail designed'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Robinson List Integration
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Robinson List Integration',
            'Build integration with Robinson List data source.',
            'development',
            'not_started',
            'medium',
            '10-14h',
            'medium',
            '',
            ARRAY['Node.js', 'PostgreSQL'],
            ARRAY['API Integration', 'Database/SQL'],
            ARRAY['Integration working', 'Data syncing', 'Refresh schedule set'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Suppression Engine
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Suppression Engine',
            'Build real-time suppression engine for all outbound.',
            'development',
            'not_started',
            'hard',
            '12-16h',
            'high',
            '',
            ARRAY['Node.js', 'Redis'],
            ARRAY['API Integration', 'Business Logic'],
            ARRAY['Suppression working', 'Real-time check active', 'Audit logging complete'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Compliance Verification
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Compliance Verification',
            'Verify suppression system meets all legal requirements.',
            'testing',
            'not_started',
            'medium',
            '6-8h',
            'low',
            '',
            ARRAY['Test cases'],
            ARRAY['Compliance/Legal'],
            ARRAY['All scenarios tested', 'Legal sign-off obtained', 'Documentation complete'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Launch
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Launch',
            'Launch suppression system and deprecate manual checks.',
            'rollout',
            'not_started',
            'easy',
            '4-6h',
            'low',
            '',
            ARRAY['Communication tools'],
            ARRAY['Change Management'],
            ARRAY['System live', 'Manual checks deprecated', 'Monitoring active'],
            ARRAY['100% suppression compliance', 'Zero legal incidents'],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        ELSE
            RAISE NOTICE 'Skipping robinson-suppressor - already has % tasks', existing_task_count;
        END IF;
    END IF;

    -- =========================================================================
    -- UNIFIED QUOTE API
    -- =========================================================================
    SELECT id INTO project_record FROM projects WHERE slug = 'unified-quote-api';
    IF project_record.id IS NOT NULL THEN
        -- Check if project already has tasks
        SELECT COUNT(*) INTO existing_task_count FROM tasks WHERE project_id = project_record.id;
        IF existing_task_count = 0 THEN
            task_order := 0;

        -- Task: Quote Flow Analysis
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Quote Flow Analysis',
            'Map all quote flows and identify standardization opportunities.',
            'discovery',
            'not_started',
            'medium',
            '10-14h',
            'medium',
            '',
            ARRAY['Documentation', 'Process mapping'],
            ARRAY['Process Design', 'Business Logic'],
            ARRAY['All flows mapped', 'Variations documented', 'Standardization plan created'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: API Specification
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'API Specification',
            'Design unified quote API specification.',
            'planning',
            'not_started',
            'hard',
            '12-16h',
            'high',
            '',
            ARRAY['OpenAPI', 'Documentation'],
            ARRAY['API Integration', 'Business Logic'],
            ARRAY['OpenAPI spec complete', 'All scenarios covered', 'Validation rules defined'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Core Quote Engine
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Core Quote Engine',
            'Build unified quote calculation and storage engine.',
            'development',
            'not_started',
            'hard',
            '24-32h',
            'high',
            '',
            ARRAY['Node.js', 'PostgreSQL'],
            ARRAY['Database/SQL', 'Business Logic', 'API Integration'],
            ARRAY['Engine deployed', 'Calculations correct', 'All scenarios supported'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Multi-source Integration
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Multi-source Integration',
            'Integrate quotes from all sources (portal, API, manual).',
            'development',
            'not_started',
            'hard',
            '16-20h',
            'medium',
            '',
            ARRAY['Node.js', 'Various APIs'],
            ARRAY['API Integration'],
            ARRAY['All sources integrated', 'Data normalizing correctly', 'Sync working'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Quote Comparison Tools
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Quote Comparison Tools',
            'Build tools for customers to compare quotes.',
            'development',
            'not_started',
            'medium',
            '12-16h',
            'high',
            '',
            ARRAY['React'],
            ARRAY['Frontend/React', 'UX Design'],
            ARRAY['Comparison working', 'Clear presentation', 'Selection easy'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Analytics & Reporting
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Analytics & Reporting',
            'Build quote analytics and conversion reporting.',
            'development',
            'not_started',
            'medium',
            '10-14h',
            'high',
            '',
            ARRAY['React', 'Chart.js'],
            ARRAY['Frontend/React', 'Data Analytics'],
            ARRAY['Dashboard deployed', 'Conversion funnel visible', 'Comparison metrics active'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: End-to-End Testing
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'End-to-End Testing',
            'Test unified quote flow with all installer types.',
            'testing',
            'not_started',
            'medium',
            '12-16h',
            'low',
            '',
            ARRAY['Test cases'],
            ARRAY['Business Logic'],
            ARRAY['All flows tested', 'Edge cases covered', 'Performance validated'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Migration & Training
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Migration & Training',
            'Migrate existing quotes and train users.',
            'training',
            'not_started',
            'medium',
            '10-14h',
            'medium',
            '',
            ARRAY['Migration scripts', 'Training materials'],
            ARRAY['Change Management', 'Training & Documentation'],
            ARRAY['Data migrated', 'Users trained', 'Support active'],
            ARRAY[]::TEXT[],
            ARRAY[]::TEXT[],
            FALSE,
            FALSE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        -- Task: Launch
        INSERT INTO tasks (
            project_id, title, description, phase, status, difficulty,
            estimated_hours, ai_potential, ai_assist_description,
            tools_needed, knowledge_areas, acceptance_criteria,
            success_metrics, risks, is_foundational, is_critical_path, order_index
        ) VALUES (
            project_record.id,
            'Launch',
            'Launch unified quote API and deprecate legacy systems.',
            'rollout',
            'not_started',
            'medium',
            '8-12h',
            'low',
            '',
            ARRAY['Communication tools'],
            ARRAY['Change Management'],
            ARRAY['API live', 'Legacy deprecated', 'Monitoring active'],
            ARRAY['100% quote capture', '30% faster quote turnaround'],
            ARRAY[]::TEXT[],
            FALSE,
            TRUE,
            task_order
        ) ON CONFLICT DO NOTHING;
        task_order := task_order + 1;

        ELSE
            RAISE NOTICE 'Skipping unified-quote-api - already has % tasks', existing_task_count;
        END IF;
    END IF;

END $$;

-- Summary: 258 tasks across 29 projects
