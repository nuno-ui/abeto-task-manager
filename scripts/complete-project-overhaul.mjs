#!/usr/bin/env node

/**
 * Complete Project Overhaul Script
 *
 * This script:
 * 1. Deletes unwanted projects (Energy Trading, merges Knowledge Management into AI Cortex)
 * 2. Marks predicted projects with is_predicted = true
 * 3. Fills in complete details for all new projects
 * 4. Adds comprehensive tasks to all new projects
 * 5. Updates all project interconnections
 */

import https from 'https';
import http from 'http';

const BASE_URL = process.env.API_URL || 'https://abeto-task-manager.vercel.app';

// Helper to make API requests
function apiRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = lib.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// ============================================================================
// PROJECTS TO DELETE
// ============================================================================
const projectsToDelete = [
  'energy-trading-grid-services',  // User doesn't like it
  'knowledge-management-system',   // Duplicates AI Cortex functionality
];

// ============================================================================
// PREDICTED PROJECTS (to be marked as is_predicted = true)
// ============================================================================
const predictedProjectSlugs = [
  'ai-voice-agent-inbound',
  'predictive-maintenance-monitoring',
  'community-referral-engine',
  'intelligent-document-processing',
];

// ============================================================================
// COMPLETE PROJECT DETAILS
// All new projects with FULL details like existing projects
// ============================================================================
const completeProjectDetails = {
  'admin-hr-automation-suite': {
    description: `Comprehensive AI-powered back-office automation covering payroll, vacation management, working hours tracking, document management, and HR workflows. Instead of manual spreadsheets and approval chains:

- AI processes payroll with anomaly detection and auto-correction
- Employees self-serve vacation requests with AI-powered approval routing
- Working hours auto-tracked and validated against contracts
- Documents auto-categorized, stored, and retrievable via natural language
- HR workflows (onboarding, offboarding, reviews) fully automated

Goal: reduce back-office headcount needs by 70% while improving accuracy and compliance.`,
    why_it_matters: `Admin and HR are necessary but don't create direct value. Every hour saved on admin is an hour that can go to sales, installer relations, or product development. AI automation ensures compliance while eliminating busywork.`,
    status: 'idea',
    priority: 'medium',
    difficulty: 'medium',
    category: 'operations',
    tags: ['hr', 'automation', 'payroll', 'admin', 'compliance', 'ai-agents'],
    human_role_before: 'HR and admin staff manually process every request, chase approvals, and maintain spreadsheets',
    human_role_after: 'HR focuses on culture and strategic initiatives while AI handles all transactional work',
    who_is_empowered: ['HR Team', 'All Employees', 'Finance', 'Operations'],
    new_capabilities: [
      'AI-powered payroll processing with error detection',
      'Self-service employee portal for all HR requests',
      'Automated compliance checking and reporting',
      'Natural language document search and retrieval',
      'Predictive workforce planning'
    ],
    data_required: ['Employee contracts', 'Payroll data', 'Working hours logs', 'Leave balances'],
    data_generates: ['Compliance reports', 'HR analytics', 'Workforce insights', 'Audit trails'],
    data_improves: ['Payroll accuracy', 'Compliance metrics', 'Employee satisfaction data'],
    integrations_needed: ['Holded', 'Banking APIs', 'Government portals (Seguridad Social)', 'Calendar systems'],
    benefits: [
      'Reduce HR admin time by 70%',
      'Eliminate payroll errors',
      'Instant compliance reporting',
      'Employee self-service satisfaction',
      'Faster onboarding (days to hours)'
    ],
    prerequisites: ['Unified Data Layer', 'Document storage system'],
    resources_used: ['LLM for document understanding', 'OCR for document processing'],
    primary_users: ['HR Team', 'All Employees', 'Finance Team', 'Management'],
    estimated_hours_min: 300,
    estimated_hours_max: 500,
    problem_statement: 'HR and admin tasks consume significant time and are error-prone, diverting resources from value-creating activities',
    deliverables: [
      'Employee self-service portal',
      'Automated payroll processing system',
      'Document management with AI search',
      'Vacation/leave management system',
      'Compliance reporting dashboard',
      'Onboarding/offboarding automation'
    ],
    depends_on: ['unified-data-layer'],
    enables: [],
    related_to: ['accounting-finance-automation']
  },

  'pan-european-expansion-engine': {
    description: `AI-powered market expansion framework that enables rapid entry into new European markets with minimal manual effort. Instead of 6-month market entry projects:

- AI analyzes market potential, regulations, and competition automatically
- Auto-generates localized content, legal documents, and marketing materials
- Clones and adapts all operational playbooks for new markets
- Trains market-specific AI models from Spain data + local adjustments
- Monitors market performance and auto-adjusts strategies

Goal: enter a new market in weeks, not months, with 90% of work done by AI.`,
    why_it_matters: `Solar adoption is growing across Europe but expansion is slow because it requires rebuilding everything for each market. AI can tropicalize content, adapt processes, and learn local patterns—making expansion a configuration exercise rather than a project.`,
    status: 'idea',
    priority: 'high',
    difficulty: 'hard',
    category: 'growth',
    tags: ['expansion', 'international', 'automation', 'localization', 'ai-agents', 'europe'],
    human_role_before: 'Teams spend months researching markets, translating content, hiring local staff, and adapting processes manually',
    human_role_after: 'Leadership selects target markets; AI handles 90% of market entry preparation automatically',
    who_is_empowered: ['Leadership', 'Operations', 'Marketing', 'Sales', 'Partner Management'],
    new_capabilities: [
      'AI-powered market analysis and opportunity scoring',
      'Auto-translation and cultural adaptation of all content',
      'Regulatory compliance checking per country',
      'Automated partner/installer discovery in new markets',
      'Cross-market performance comparison and learning'
    ],
    data_required: ['Spain operational data', 'Market research databases', 'Regulatory information per country', 'Competitor data'],
    data_generates: ['Market entry playbooks', 'Localized content', 'Expansion analytics', 'Market comparison reports'],
    data_improves: ['Market selection accuracy', 'Expansion success rate', 'Time to market'],
    integrations_needed: ['Translation APIs', 'Market data providers', 'Local CRMs', 'Regulatory databases', 'Local payment systems'],
    benefits: [
      'Reduce market entry time from 6 months to 6 weeks',
      '90% reduction in expansion costs',
      'Consistent brand experience across markets',
      'Faster learning from cross-market data',
      'Scalable expansion without proportional headcount'
    ],
    prerequisites: ['Unified Data Layer', 'AI Cortex', 'SDR Portal', 'Funnel Automation OS'],
    resources_used: ['LLM for translation and adaptation', 'Market intelligence APIs', 'Legal document templates'],
    primary_users: ['Leadership', 'Country Managers', 'Marketing', 'Operations'],
    estimated_hours_min: 500,
    estimated_hours_max: 800,
    problem_statement: 'European expansion is slow and expensive because each market requires manual replication of all systems and content',
    deliverables: [
      'Market analysis and scoring system',
      'Content localization engine',
      'Regulatory compliance checker',
      'Partner discovery and outreach system',
      'Market launch playbook generator',
      'Cross-market analytics dashboard'
    ],
    depends_on: ['unified-data-layer', 'ai-cortex', 'sdr-portal', 'funnel-automation-os'],
    enables: [],
    related_to: ['product-diversification-platform', 'partner-expansion-tool']
  },

  'product-diversification-platform': {
    description: `Framework for rapidly launching adjacent products (battery storage, EV chargers, heat pumps) using the existing lead generation and installer infrastructure. Instead of building from scratch for each product:

- AI identifies which existing leads are candidates for new products
- Auto-generates product-specific qualification flows and content
- Matches leads to installers with relevant certifications
- Adapts pricing, quoting, and operations for each product type
- Cross-sells based on customer profiles and behavior

Goal: launch a new product line with 80% infrastructure reuse and 2-week time to market.`,
    why_it_matters: `The solar lead generation infrastructure is valuable for many adjacent products. Manual product launches waste this asset. AI-powered diversification turns every new product into a marginal addition rather than a major project.`,
    status: 'idea',
    priority: 'medium',
    difficulty: 'medium',
    category: 'growth',
    tags: ['diversification', 'products', 'batteries', 'ev-chargers', 'heat-pumps', 'cross-sell'],
    human_role_before: 'Teams build entire new funnels, train new staff, and create all content from scratch for each product',
    human_role_after: 'Product managers configure new products in the platform; AI handles launch execution',
    who_is_empowered: ['Product Team', 'Sales', 'Marketing', 'Operations', 'Partner Management'],
    new_capabilities: [
      'AI product-market fit analysis',
      'Auto-generated product qualification flows',
      'Cross-sell recommendation engine',
      'Dynamic installer matching by certification',
      'Product-specific pricing optimization'
    ],
    data_required: ['Lead database', 'Installer certifications', 'Product specifications', 'Market demand data'],
    data_generates: ['Cross-sell opportunities', 'Product performance analytics', 'Installer capability mapping'],
    data_improves: ['Lead utilization rate', 'Revenue per lead', 'Installer productivity'],
    integrations_needed: ['Product catalogs', 'Certification databases', 'Manufacturer APIs', 'Pricing engines'],
    benefits: [
      '80% infrastructure reuse for new products',
      '2-week time to market vs 3+ months',
      'Maximize value of existing leads',
      'Diversified revenue streams',
      'Stronger installer relationships through more business'
    ],
    prerequisites: ['Unified Data Layer', 'SDR Portal', 'Installer Portal'],
    resources_used: ['Product configuration system', 'AI recommendation engine', 'Content generation'],
    primary_users: ['Product Team', 'Sales', 'Operations', 'Installers'],
    estimated_hours_min: 250,
    estimated_hours_max: 400,
    problem_statement: 'Launching new product lines is expensive and slow, failing to leverage existing infrastructure and customer base',
    deliverables: [
      'Product configuration engine',
      'Lead scoring for new products',
      'Cross-sell recommendation system',
      'Installer certification matching',
      'Product-specific quote builder',
      'Multi-product analytics dashboard'
    ],
    depends_on: ['unified-data-layer', 'sdr-portal', 'installer-portal-product'],
    enables: [],
    related_to: ['loan-integration-platform', 'dynamic-pricing-engine']
  },

  'ai-agent-factory': {
    description: `Platform for rapidly creating, deploying, and managing specialized AI agents for every business function. Instead of one-off AI implementations:

- Visual agent builder for non-technical users
- Pre-built agent templates for common use cases (SDR agent, ops agent, support agent)
- Shared memory and context across all agents via AI Cortex
- Built-in guardrails and human oversight
- Agent performance monitoring and auto-improvement

Goal: anyone in the company can create an AI agent for their workflow in hours, not months.`,
    why_it_matters: `AI value comes from broad adoption, not just a few projects. A factory approach democratizes AI, letting every team automate their workflows without waiting for IT. This compounds Abeto's AI advantage across all functions.`,
    status: 'idea',
    priority: 'high',
    difficulty: 'hard',
    category: 'platform',
    tags: ['ai-agents', 'platform', 'automation', 'no-code', 'agentification', 'llm'],
    human_role_before: 'Every AI use case requires engineering resources and months of development',
    human_role_after: 'Business users create and deploy AI agents themselves; engineering focuses on platform capabilities',
    who_is_empowered: ['All Teams', 'Operations', 'Sales', 'Marketing', 'Finance', 'HR'],
    new_capabilities: [
      'No-code agent builder with visual workflow design',
      'Pre-built agent templates library',
      'Cross-agent memory and learning via Cortex',
      'Built-in compliance and safety guardrails',
      'Agent marketplace for sharing across teams'
    ],
    data_required: ['Business process documentation', 'API specifications', 'Historical task data'],
    data_generates: ['Agent performance metrics', 'Automation ROI analytics', 'Task completion data'],
    data_improves: ['Process efficiency', 'Task completion time', 'Error rates'],
    integrations_needed: ['All internal systems', 'LLM providers', 'AI Cortex', 'Authentication systems'],
    benefits: [
      'Democratize AI across the organization',
      'Reduce IT backlog by 80%',
      'Faster experimentation with AI use cases',
      'Compound AI advantage over competitors',
      'Knowledge capture in agent logic'
    ],
    prerequisites: ['AI Cortex', 'Unified Data Layer'],
    resources_used: ['LLM APIs', 'Agent orchestration framework', 'Visual workflow builder'],
    primary_users: ['All Teams', 'Business Analysts', 'Operations', 'IT'],
    estimated_hours_min: 400,
    estimated_hours_max: 600,
    problem_statement: 'AI adoption is bottlenecked by engineering capacity; business users cannot create their own AI solutions',
    deliverables: [
      'Visual agent builder interface',
      'Agent template library (10+ templates)',
      'Agent deployment and hosting system',
      'Performance monitoring dashboard',
      'Safety and compliance guardrails',
      'Agent sharing marketplace'
    ],
    depends_on: ['ai-cortex', 'unified-data-layer'],
    enables: ['admin-hr-automation-suite'],
    related_to: ['ai-cortex', 'funnel-automation-os']
  },

  'loan-integration-platform': {
    description: `Embedded financing solution that integrates external loan providers directly into the solar sales funnel. Instead of customers arranging their own financing:

- AI pre-qualifies customers for financing options during lead qualification
- Presents personalized loan offers based on customer profile
- Handles entire loan application within the Abeto flow
- Automated document collection and verification
- Revenue share tracking and settlement with loan providers

Goal: increase conversion by 20% by removing financing friction, while adding new revenue stream.`,
    why_it_matters: `Financing is the #1 barrier to solar adoption. Customers who arrange their own financing have 40% lower conversion. Embedded financing removes this friction and positions Abeto as a full-service provider, not just lead generation.`,
    status: 'idea',
    priority: 'high',
    difficulty: 'hard',
    category: 'product',
    tags: ['financing', 'loans', 'conversion', 'revenue', 'partnerships', 'fintech'],
    human_role_before: 'Customers must independently find and apply for financing, causing many to drop out',
    human_role_after: 'Financing is seamlessly embedded; customers see personalized options without extra effort',
    who_is_empowered: ['Sales Team', 'Customers', 'Finance', 'Operations'],
    new_capabilities: [
      'Real-time loan pre-qualification',
      'Multi-lender comparison and matching',
      'In-flow document collection and verification',
      'Automated settlement and reconciliation',
      'Financing conversion analytics'
    ],
    data_required: ['Customer financial data', 'Property information', 'Quote details', 'Credit scoring data'],
    data_generates: ['Loan performance data', 'Financing revenue', 'Conversion analytics', 'Customer financial profiles'],
    data_improves: ['Conversion rate', 'Average deal size', 'Customer satisfaction'],
    integrations_needed: ['Loan provider APIs', 'Credit bureaus', 'Banking systems', 'Document verification services'],
    benefits: [
      'Increase conversion by 20%',
      'New revenue stream from financing commissions',
      'Higher average deal sizes',
      'Competitive differentiation',
      'Stronger customer relationships'
    ],
    prerequisites: ['Unified Data Layer', 'SDR Portal'],
    resources_used: ['Loan provider APIs', 'Credit scoring', 'Document processing'],
    primary_users: ['SDR Team', 'Customers', 'Finance', 'Partner Management'],
    estimated_hours_min: 350,
    estimated_hours_max: 550,
    problem_statement: 'Customers drop out of the funnel because financing is complex and separate from the solar buying process',
    deliverables: [
      'Loan pre-qualification engine',
      'Multi-lender integration hub',
      'Financing options UI in SDR Portal',
      'Document collection workflow',
      'Lender settlement system',
      'Financing analytics dashboard'
    ],
    depends_on: ['unified-data-layer', 'sdr-portal'],
    enables: [],
    related_to: ['dynamic-pricing-engine', 'installer-quote-sync']
  },

  'dynamic-pricing-engine': {
    description: `AI-powered pricing optimization that maximizes revenue while maintaining partner relationships. Instead of fixed pricing models:

- Supports multiple pricing models (CPL, CPS, fee-based, hybrid)
- AI optimizes pricing per partner based on performance and market conditions
- Real-time price adjustments based on demand and capacity
- Automated contract generation for custom pricing agreements
- Revenue simulation and forecasting

Goal: increase revenue per lead by 15% through intelligent pricing without losing partners.`,
    why_it_matters: `One-size-fits-all pricing leaves money on the table. High-performing partners can pay more; struggling partners need support. AI can optimize this balance in real-time, maximizing revenue while maintaining a healthy ecosystem.`,
    status: 'idea',
    priority: 'medium',
    difficulty: 'medium',
    category: 'operations',
    tags: ['pricing', 'revenue', 'optimization', 'partners', 'ai', 'contracts'],
    human_role_before: 'Finance team manually sets and negotiates prices, missing optimization opportunities',
    human_role_after: 'Finance sets strategy and constraints; AI handles pricing optimization and execution',
    who_is_empowered: ['Finance', 'Partner Management', 'Leadership', 'Sales'],
    new_capabilities: [
      'Multi-model pricing support (CPL, CPS, hybrid)',
      'Real-time price optimization',
      'Partner-specific pricing recommendations',
      'Revenue impact simulation',
      'Automated contract generation'
    ],
    data_required: ['Partner performance data', 'Market rates', 'Historical pricing', 'Conversion data'],
    data_generates: ['Pricing analytics', 'Revenue forecasts', 'Partner profitability metrics'],
    data_improves: ['Revenue per lead', 'Partner retention', 'Pricing accuracy'],
    integrations_needed: ['CRM', 'Invoicing system', 'Contract management', 'Partner portal'],
    benefits: [
      'Increase revenue per lead by 15%',
      'Optimize partner economics',
      'Faster contract negotiations',
      'Better revenue predictability',
      'Dynamic market response'
    ],
    prerequisites: ['Unified Data Layer', 'Reporting Hub'],
    resources_used: ['ML pricing models', 'Contract templates', 'Revenue analytics'],
    primary_users: ['Finance', 'Partner Management', 'Leadership'],
    estimated_hours_min: 200,
    estimated_hours_max: 350,
    problem_statement: 'Static pricing fails to capture value from high-performers and struggles to support partners who need different terms',
    deliverables: [
      'Multi-model pricing engine',
      'Partner pricing dashboard',
      'Price optimization algorithm',
      'Contract generation system',
      'Revenue simulation tool',
      'Pricing analytics dashboard'
    ],
    depends_on: ['unified-data-layer', 'reporting-hub'],
    enables: [],
    related_to: ['installer-performance-tracking', 'automated-invoicing']
  },

  'procurement-supplier-platform': {
    description: `AI-powered procurement system that optimizes supplier relationships and equipment costs. Instead of manual vendor management:

- AI aggregates and compares supplier pricing in real-time
- Predicts equipment price trends and optimal purchase timing
- Automates RFQ processes and negotiations
- Manages supplier performance and compliance
- Optimizes inventory levels based on demand forecasting

Goal: reduce equipment costs by 10% and procurement admin time by 80%.`,
    why_it_matters: `Equipment costs directly impact margins. Manual procurement can't keep up with market dynamics or optimize across all suppliers. AI procurement ensures best prices, reliable supply, and minimal admin overhead.`,
    status: 'idea',
    priority: 'medium',
    difficulty: 'medium',
    category: 'operations',
    tags: ['procurement', 'suppliers', 'cost-optimization', 'inventory', 'automation'],
    human_role_before: 'Procurement team manually manages vendors, compares quotes, and tracks inventory',
    human_role_after: 'Procurement sets strategy; AI handles vendor management and optimization',
    who_is_empowered: ['Operations', 'Finance', 'Installers', 'Procurement'],
    new_capabilities: [
      'Real-time price comparison across suppliers',
      'AI-powered demand forecasting',
      'Automated RFQ and negotiation',
      'Supplier performance scoring',
      'Inventory optimization'
    ],
    data_required: ['Supplier catalogs', 'Historical orders', 'Market prices', 'Demand data'],
    data_generates: ['Cost savings analytics', 'Supplier scorecards', 'Demand forecasts', 'Inventory reports'],
    data_improves: ['Equipment costs', 'Supplier performance', 'Inventory turnover'],
    integrations_needed: ['Supplier systems', 'Inventory management', 'ERP', 'Logistics providers'],
    benefits: [
      'Reduce equipment costs by 10%',
      '80% reduction in procurement admin time',
      'Better supplier relationships',
      'Optimal inventory levels',
      'Price trend visibility'
    ],
    prerequisites: ['Unified Data Layer'],
    resources_used: ['Supplier APIs', 'ML demand forecasting', 'Price comparison engine'],
    primary_users: ['Procurement', 'Operations', 'Finance'],
    estimated_hours_min: 250,
    estimated_hours_max: 400,
    problem_statement: 'Manual procurement is slow, misses best prices, and cannot optimize across suppliers and time',
    deliverables: [
      'Supplier management portal',
      'Price comparison engine',
      'Automated RFQ system',
      'Demand forecasting dashboard',
      'Inventory optimization tool',
      'Supplier performance scorecards'
    ],
    depends_on: ['unified-data-layer'],
    enables: [],
    related_to: ['automated-invoicing', 'installer-quote-sync']
  },

  'accounting-finance-automation': {
    description: `AI-powered financial operations platform that automates accounting, reconciliation, and financial reporting. Instead of manual bookkeeping:

- AI categorizes and reconciles transactions automatically
- Generates financial reports with natural language explanations
- Predicts cash flow and flags potential issues
- Automates month-end close processes
- Handles multi-entity and multi-currency complexity

Goal: reduce finance team admin time by 60% while improving accuracy and speed of reporting.`,
    why_it_matters: `Finance accuracy is critical but time-consuming. Manual processes are error-prone and slow. AI automation ensures accurate, real-time financial visibility while freeing finance team for strategic work.`,
    status: 'idea',
    priority: 'medium',
    difficulty: 'medium',
    category: 'operations',
    tags: ['accounting', 'finance', 'automation', 'reporting', 'compliance', 'bookkeeping'],
    human_role_before: 'Finance team manually categorizes transactions, reconciles accounts, and builds reports',
    human_role_after: 'Finance focuses on strategy and analysis while AI handles all transactional work',
    who_is_empowered: ['Finance Team', 'Leadership', 'Investors', 'Operations'],
    new_capabilities: [
      'AI transaction categorization and reconciliation',
      'Automated financial report generation',
      'Cash flow prediction and alerting',
      'Anomaly detection in financial data',
      'Natural language financial queries'
    ],
    data_required: ['Bank feeds', 'Invoices', 'Contracts', 'Expense data'],
    data_generates: ['Financial reports', 'Cash flow forecasts', 'Audit trails', 'Variance analysis'],
    data_improves: ['Financial accuracy', 'Reporting speed', 'Cash flow visibility'],
    integrations_needed: ['Holded', 'Banking APIs', 'Payment processors', 'Tax systems'],
    benefits: [
      '60% reduction in finance admin time',
      'Real-time financial visibility',
      'Fewer errors and discrepancies',
      'Faster month-end close',
      'Better cash flow management'
    ],
    prerequisites: ['Unified Data Layer'],
    resources_used: ['Banking APIs', 'ML categorization', 'Report generation'],
    primary_users: ['Finance Team', 'Leadership', 'Investors'],
    estimated_hours_min: 250,
    estimated_hours_max: 400,
    problem_statement: 'Manual accounting is slow, error-prone, and delays financial visibility needed for decision-making',
    deliverables: [
      'Transaction categorization engine',
      'Bank reconciliation automation',
      'Financial reporting dashboard',
      'Cash flow forecasting tool',
      'Month-end close automation',
      'Audit trail system'
    ],
    depends_on: ['unified-data-layer'],
    enables: ['investor-portal'],
    related_to: ['admin-hr-automation-suite', 'automated-invoicing']
  },

  // PREDICTED PROJECTS (to be shown in separate section)
  'ai-voice-agent-inbound': {
    description: `Deploy AI voice agents to handle inbound customer calls 24/7. Instead of voicemail or limited call center hours:

- AI answers calls instantly, in natural conversational Spanish
- Qualifies leads through intelligent conversation
- Schedules callbacks for complex inquiries
- Handles common questions without human involvement
- Seamlessly escalates to humans when needed

Goal: handle 60% of inbound calls without human involvement while improving customer experience.`,
    why_it_matters: `Every missed call is a potentially lost customer. Humans can't answer phones 24/7, but AI can. Voice AI is now good enough for production use—this is a clear quick win for customer experience and efficiency.`,
    status: 'idea',
    priority: 'high',
    difficulty: 'medium',
    category: 'product',
    tags: ['voice-ai', 'customer-service', 'automation', 'inbound', 'ai-agents', 'telephony'],
    human_role_before: 'Calls go to voicemail outside hours or wait in queue during busy times',
    human_role_after: 'Every call answered instantly; humans handle only complex escalations',
    who_is_empowered: ['Customers', 'SDR Team', 'Customer Support', 'Operations'],
    new_capabilities: [
      '24/7 instant call answering',
      'Natural conversational AI in Spanish',
      'Real-time lead qualification',
      'Intelligent callback scheduling',
      'Seamless human handoff'
    ],
    data_required: ['Call scripts', 'FAQ database', 'Lead qualification criteria', 'Calendar availability'],
    data_generates: ['Call transcripts', 'Lead qualifications', 'Common question analytics', 'Escalation patterns'],
    data_improves: ['Call answer rate', 'Lead response time', 'Customer satisfaction'],
    integrations_needed: ['Telephony system (Aircall)', 'CRM (Zoho)', 'Calendar', 'AI Cortex'],
    benefits: [
      'Handle 60% of calls without humans',
      '24/7 availability',
      'Zero wait time for customers',
      'Consistent qualification',
      'Reduced SDR admin time'
    ],
    prerequisites: ['AI Cortex', 'Unified Data Layer'],
    resources_used: ['Voice AI APIs', 'Speech-to-text', 'Text-to-speech', 'NLU'],
    primary_users: ['Customers', 'SDR Team', 'Operations'],
    estimated_hours_min: 200,
    estimated_hours_max: 350,
    problem_statement: 'Inbound calls are missed outside hours and during busy times, losing potential customers',
    deliverables: [
      'Voice AI agent for inbound calls',
      'Spanish natural language model',
      'Lead qualification flow',
      'Human escalation system',
      'Call analytics dashboard',
      'Agent training interface'
    ],
    depends_on: ['ai-cortex', 'unified-data-layer'],
    enables: ['ai-omnichannel-chatbot-platform'],
    related_to: ['sdr-portal', 'funnel-automation-os'],
    is_predicted: true
  },

  'predictive-maintenance-monitoring': {
    description: `AI-powered post-installation monitoring that predicts issues before they affect customers. Instead of reactive support:

- Monitors installation performance data from inverters and monitoring systems
- Predicts failures before they happen using ML models
- Automatically dispatches maintenance before customers notice issues
- Provides customers with production insights and optimization tips
- Creates new revenue stream through premium monitoring services

Goal: reduce customer support tickets by 40% while creating new recurring revenue.`,
    why_it_matters: `Post-sale customer experience determines referrals and brand reputation. Proactive monitoring turns potential problems into demonstrations of excellent service, while creating new revenue opportunities.`,
    status: 'idea',
    priority: 'medium',
    difficulty: 'hard',
    category: 'product',
    tags: ['monitoring', 'maintenance', 'iot', 'customer-success', 'recurring-revenue', 'ml'],
    human_role_before: 'Support waits for customer complaints to learn about issues',
    human_role_after: 'AI detects and resolves issues proactively; support focuses on relationship building',
    who_is_empowered: ['Customers', 'Support Team', 'Installers', 'Operations'],
    new_capabilities: [
      'Real-time installation performance monitoring',
      'Predictive failure detection',
      'Automated maintenance dispatch',
      'Customer production dashboards',
      'Performance optimization recommendations'
    ],
    data_required: ['Inverter telemetry', 'Weather data', 'Installation specs', 'Historical performance'],
    data_generates: ['Performance analytics', 'Failure predictions', 'Maintenance schedules', 'Customer insights'],
    data_improves: ['System uptime', 'Customer satisfaction', 'Maintenance efficiency'],
    integrations_needed: ['Inverter APIs (SolarEdge, Huawei, etc.)', 'Weather APIs', 'Maintenance scheduling', 'Customer portal'],
    benefits: [
      '40% reduction in support tickets',
      'New recurring revenue stream',
      'Improved customer satisfaction',
      'Better installer feedback',
      'Data for future improvements'
    ],
    prerequisites: ['Unified Data Layer', 'Installer Portal'],
    resources_used: ['IoT data pipelines', 'ML prediction models', 'Alerting system'],
    primary_users: ['Customers', 'Support', 'Installers'],
    estimated_hours_min: 400,
    estimated_hours_max: 600,
    problem_statement: 'Post-installation issues are discovered by customers, damaging satisfaction and reputation',
    deliverables: [
      'Inverter data integration hub',
      'Predictive ML models',
      'Customer monitoring dashboard',
      'Automated alerting system',
      'Maintenance dispatch workflow',
      'Premium monitoring subscription'
    ],
    depends_on: ['unified-data-layer', 'installer-portal-product'],
    enables: [],
    related_to: ['installer-feedback-system', 'review-generation-system'],
    is_predicted: true
  },

  'community-referral-engine': {
    description: `Platform to turn satisfied customers into active promoters and lead sources. Instead of passive word-of-mouth:

- AI identifies optimal timing and customers for referral requests
- Gamified referral program with intelligent incentive optimization
- Community features for solar owners to share experiences
- AI-generated testimonials and case studies from customer data
- Integration with social proof across all marketing channels

Goal: generate 25% of leads from referrals, reducing CAC by 40% for this segment.`,
    why_it_matters: `Referred leads convert 3x better and have 2x higher lifetime value. Building a systematic referral engine turns the customer base into a growth asset that compounds over time.`,
    status: 'idea',
    priority: 'medium',
    difficulty: 'medium',
    category: 'growth',
    tags: ['referrals', 'community', 'growth', 'viral', 'customer-advocacy', 'marketing'],
    human_role_before: 'Referrals happen organically without systematic capture or incentivization',
    human_role_after: 'AI orchestrates referral program; marketing focuses on community building',
    who_is_empowered: ['Customers', 'Marketing', 'Sales', 'Growth'],
    new_capabilities: [
      'AI-optimized referral timing and targeting',
      'Gamified referral tracking and rewards',
      'Community platform for solar owners',
      'Auto-generated testimonials and case studies',
      'Social proof integration across channels'
    ],
    data_required: ['Customer satisfaction data', 'Installation history', 'Social connections', 'Referral history'],
    data_generates: ['Referral leads', 'Customer advocacy scores', 'Community engagement metrics', 'Testimonial content'],
    data_improves: ['Customer lifetime value', 'CAC', 'Brand sentiment'],
    integrations_needed: ['CRM', 'Marketing automation', 'Social media', 'Review platforms'],
    benefits: [
      '25% of leads from referrals',
      '40% lower CAC for referral leads',
      '3x better conversion',
      'Organic brand advocacy',
      'Community-driven content'
    ],
    prerequisites: ['Unified Data Layer', 'Customer data from installations'],
    resources_used: ['Referral platform', 'Community software', 'AI content generation'],
    primary_users: ['Customers', 'Marketing', 'Sales'],
    estimated_hours_min: 200,
    estimated_hours_max: 350,
    problem_statement: 'Referral potential is untapped; satisfied customers are not systematically activated as promoters',
    deliverables: [
      'Referral program platform',
      'Customer community portal',
      'Gamification and rewards system',
      'Testimonial generation engine',
      'Social proof widgets',
      'Referral analytics dashboard'
    ],
    depends_on: ['unified-data-layer'],
    enables: ['programmatic-seo-pages'],
    related_to: ['review-generation-system', 'campaign-os'],
    is_predicted: true
  },

  'intelligent-document-processing': {
    description: `AI-powered document handling that eliminates manual data entry across all business processes. Instead of humans reading and typing:

- Auto-extracts data from electricity bills, IDs, property documents
- Validates extracted data against business rules
- Routes documents to appropriate workflows automatically
- Handles multi-format, multi-language documents
- Learns from corrections to improve over time

Goal: eliminate 95% of manual document processing while improving accuracy.`,
    why_it_matters: `Document processing is hidden labor across every function. Every minute spent reading and typing is a minute not spent on value creation. AI document processing is mature enough for production deployment.`,
    status: 'idea',
    priority: 'high',
    difficulty: 'medium',
    category: 'operations',
    tags: ['document-processing', 'ocr', 'automation', 'data-entry', 'ai', 'extraction'],
    human_role_before: 'Staff manually read documents, extract data, and enter into systems',
    human_role_after: 'AI processes all documents; humans handle only exceptions',
    who_is_empowered: ['All Teams', 'Operations', 'Sales', 'Finance', 'HR'],
    new_capabilities: [
      'Multi-format document understanding',
      'Automatic data extraction and validation',
      'Intelligent document routing',
      'Self-improving accuracy through feedback',
      'Audit trail for all processed documents'
    ],
    data_required: ['Document templates', 'Validation rules', 'Workflow definitions'],
    data_generates: ['Extracted structured data', 'Processing analytics', 'Accuracy metrics'],
    data_improves: ['Data entry accuracy', 'Processing speed', 'Operational efficiency'],
    integrations_needed: ['All internal systems', 'OCR services', 'Document storage', 'Workflow engine'],
    benefits: [
      '95% reduction in manual data entry',
      'Faster processing times',
      'Fewer errors',
      'Complete audit trail',
      'Scalable without headcount'
    ],
    prerequisites: ['Unified Data Layer'],
    resources_used: ['OCR APIs', 'LLM for understanding', 'Document classification ML'],
    primary_users: ['All Teams', 'Operations', 'Finance'],
    estimated_hours_min: 200,
    estimated_hours_max: 350,
    problem_statement: 'Manual document processing is slow, error-prone, and consumes significant staff time across functions',
    deliverables: [
      'Document ingestion system',
      'Multi-format extraction engine',
      'Validation rules engine',
      'Workflow routing system',
      'Human review interface',
      'Processing analytics dashboard'
    ],
    depends_on: ['unified-data-layer'],
    enables: ['admin-hr-automation-suite', 'loan-integration-platform'],
    related_to: ['accounting-finance-automation', 'gdpr-compliance-tracker'],
    is_predicted: true
  }
};

// ============================================================================
// TASKS FOR NEW PROJECTS
// ============================================================================
const tasksForNewProjects = {
  'admin-hr-automation-suite': [
    { title: 'HR Process Mapping', phase: 'discovery', difficulty: 'easy', ai_potential: 'high', ai_assist_description: 'AI can analyze existing HR documents, interview stakeholders via chat, and generate comprehensive process maps automatically', estimated_hours: '16-24h', is_critical_path: true, tools_needed: ['Process mapping tools', 'Documentation'], knowledge_areas: ['HR processes', 'Compliance'] },
    { title: 'Payroll Integration Analysis', phase: 'discovery', difficulty: 'medium', ai_potential: 'medium', ai_assist_description: 'AI can analyze Holded API documentation and generate integration requirements', estimated_hours: '8-12h', tools_needed: ['Holded API docs', 'Payroll data samples'], knowledge_areas: ['Payroll systems', 'API integration'] },
    { title: 'Employee Portal Design', phase: 'planning', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI generates UI mockups and user flows based on process requirements', estimated_hours: '24-32h', tools_needed: ['Design tools', 'Figma'], knowledge_areas: ['UX design', 'HR workflows'] },
    { title: 'Payroll Processing Engine', phase: 'development', difficulty: 'hard', ai_potential: 'high', ai_assist_description: 'AI assists with anomaly detection algorithms and validation rules', estimated_hours: '60-80h', is_critical_path: true, tools_needed: ['Node.js', 'Holded API'], knowledge_areas: ['Payroll calculations', 'Tax rules'] },
    { title: 'Leave Management System', phase: 'development', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI generates approval routing logic and calendar integration code', estimated_hours: '40-60h', tools_needed: ['Calendar APIs', 'Workflow engine'], knowledge_areas: ['Leave policies', 'Approval workflows'] },
    { title: 'Document Management with AI Search', phase: 'development', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'LLM provides natural language search and document classification', estimated_hours: '40-60h', tools_needed: ['Vector database', 'LLM API'], knowledge_areas: ['Document management', 'Embeddings'] },
    { title: 'Compliance Reporting Dashboard', phase: 'development', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI generates compliance checks and report templates', estimated_hours: '24-32h', tools_needed: ['Reporting tools', 'Compliance rules'], knowledge_areas: ['Labor law', 'Reporting'] },
    { title: 'Integration Testing', phase: 'testing', difficulty: 'medium', ai_potential: 'medium', ai_assist_description: 'AI generates test cases and validates data flows', estimated_hours: '24-32h', tools_needed: ['Testing framework'], knowledge_areas: ['Integration testing'] },
    { title: 'HR Team Training', phase: 'training', difficulty: 'easy', ai_potential: 'high', ai_assist_description: 'AI generates training materials and interactive tutorials', estimated_hours: '16-24h', tools_needed: ['Documentation tools'], knowledge_areas: ['Training'] },
    { title: 'Phased Rollout', phase: 'rollout', difficulty: 'easy', ai_potential: 'low', ai_assist_description: 'AI monitors adoption metrics and flags issues', estimated_hours: '16-24h', tools_needed: ['Monitoring'], knowledge_areas: ['Change management'] }
  ],

  'pan-european-expansion-engine': [
    { title: 'Market Analysis Framework', phase: 'discovery', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI automatically researches market data, regulations, and competition for target countries', estimated_hours: '40-60h', is_critical_path: true, tools_needed: ['Market research APIs', 'Web scraping'], knowledge_areas: ['Market analysis', 'European markets'] },
    { title: 'Regulatory Compliance Database', phase: 'discovery', difficulty: 'hard', ai_potential: 'high', ai_assist_description: 'AI extracts and structures regulatory requirements from government sources', estimated_hours: '60-80h', tools_needed: ['Legal databases', 'Translation'], knowledge_areas: ['Solar regulations', 'EU law'] },
    { title: 'Content Localization Engine', phase: 'development', difficulty: 'hard', ai_potential: 'high', ai_assist_description: 'LLM handles translation and cultural adaptation of all content', estimated_hours: '80-120h', is_critical_path: true, tools_needed: ['Translation APIs', 'LLM'], knowledge_areas: ['Localization', 'Content strategy'] },
    { title: 'Playbook Cloning System', phase: 'development', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI adapts operational playbooks for local requirements', estimated_hours: '40-60h', tools_needed: ['Template engine'], knowledge_areas: ['Operations', 'Process design'] },
    { title: 'Partner Discovery Automation', phase: 'development', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI finds and scores potential installers in new markets', estimated_hours: '40-60h', tools_needed: ['Web scraping', 'LinkedIn API'], knowledge_areas: ['Partner identification', 'Scoring'] },
    { title: 'Market Launch Dashboard', phase: 'development', difficulty: 'medium', ai_potential: 'medium', ai_assist_description: 'AI generates market comparison views and launch readiness scores', estimated_hours: '32-48h', tools_needed: ['Dashboard framework'], knowledge_areas: ['Analytics', 'Visualization'] },
    { title: 'Cross-Market Analytics', phase: 'development', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI identifies patterns and learnings across markets', estimated_hours: '24-32h', tools_needed: ['Analytics platform'], knowledge_areas: ['Business intelligence'] },
    { title: 'Pilot Market Launch (Portugal)', phase: 'rollout', difficulty: 'medium', ai_potential: 'low', ai_assist_description: 'AI monitors launch metrics and flags issues', estimated_hours: '80-120h', is_critical_path: true, tools_needed: ['All systems'], knowledge_areas: ['Market launch', 'Operations'] },
    { title: 'Launch Playbook Documentation', phase: 'training', difficulty: 'easy', ai_potential: 'high', ai_assist_description: 'AI generates documentation from launch experience', estimated_hours: '16-24h', tools_needed: ['Documentation'], knowledge_areas: ['Process documentation'] }
  ],

  'product-diversification-platform': [
    { title: 'Product Configuration Requirements', phase: 'discovery', difficulty: 'easy', ai_potential: 'high', ai_assist_description: 'AI analyzes product differences and generates configuration schema', estimated_hours: '16-24h', is_critical_path: true, tools_needed: ['Product specs'], knowledge_areas: ['Product management'] },
    { title: 'Lead Scoring for New Products', phase: 'planning', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI designs scoring model based on customer data patterns', estimated_hours: '24-32h', tools_needed: ['ML framework', 'Customer data'], knowledge_areas: ['Lead scoring', 'ML'] },
    { title: 'Product Configuration Engine', phase: 'development', difficulty: 'medium', ai_potential: 'medium', ai_assist_description: 'AI assists with configuration logic and validation', estimated_hours: '40-60h', is_critical_path: true, tools_needed: ['Config management'], knowledge_areas: ['Product configuration'] },
    { title: 'Cross-Sell Recommendation System', phase: 'development', difficulty: 'hard', ai_potential: 'high', ai_assist_description: 'ML model for identifying cross-sell opportunities', estimated_hours: '60-80h', tools_needed: ['ML framework', 'Customer data'], knowledge_areas: ['Recommendations', 'ML'] },
    { title: 'Installer Certification Matching', phase: 'development', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI matches leads to installers based on product certifications', estimated_hours: '24-32h', tools_needed: ['Certification database'], knowledge_areas: ['Matching algorithms'] },
    { title: 'Product-Specific Quote Builder', phase: 'development', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI generates product-specific quote templates and calculations', estimated_hours: '32-48h', tools_needed: ['Quote system'], knowledge_areas: ['Quoting', 'Pricing'] },
    { title: 'Multi-Product Analytics', phase: 'development', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI provides insights across product performance', estimated_hours: '24-32h', tools_needed: ['Analytics platform'], knowledge_areas: ['Product analytics'] },
    { title: 'Integration Testing', phase: 'testing', difficulty: 'medium', ai_potential: 'medium', ai_assist_description: 'AI generates test scenarios for product combinations', estimated_hours: '24-32h', tools_needed: ['Testing framework'], knowledge_areas: ['Testing'] },
    { title: 'Team Training on New Products', phase: 'training', difficulty: 'easy', ai_potential: 'high', ai_assist_description: 'AI creates product training materials', estimated_hours: '16-24h', tools_needed: ['Training platform'], knowledge_areas: ['Training'] }
  ],

  'ai-agent-factory': [
    { title: 'Agent Platform Requirements', phase: 'discovery', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI interviews teams to identify common agent use cases and requirements', estimated_hours: '24-32h', is_critical_path: true, tools_needed: ['Research tools'], knowledge_areas: ['AI agents', 'Requirements'] },
    { title: 'Agent Architecture Design', phase: 'planning', difficulty: 'hard', ai_potential: 'high', ai_assist_description: 'AI helps design agent orchestration patterns and memory systems', estimated_hours: '40-60h', is_critical_path: true, tools_needed: ['Architecture tools'], knowledge_areas: ['Agent architecture', 'LLM'] },
    { title: 'Visual Agent Builder UI', phase: 'development', difficulty: 'hard', ai_potential: 'medium', ai_assist_description: 'AI assists with workflow visualization components', estimated_hours: '80-120h', is_critical_path: true, tools_needed: ['React', 'Flow libraries'], knowledge_areas: ['UI development', 'Workflow design'] },
    { title: 'Agent Template Library', phase: 'development', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI generates initial templates for common use cases (SDR, support, ops)', estimated_hours: '60-80h', tools_needed: ['LLM', 'Template system'], knowledge_areas: ['Agent design', 'Business processes'] },
    { title: 'Cortex Integration Layer', phase: 'development', difficulty: 'hard', ai_potential: 'medium', ai_assist_description: 'AI assists with memory and context sharing architecture', estimated_hours: '60-80h', is_critical_path: true, tools_needed: ['AI Cortex API'], knowledge_areas: ['Integration', 'Memory systems'] },
    { title: 'Guardrails and Safety System', phase: 'development', difficulty: 'hard', ai_potential: 'high', ai_assist_description: 'AI helps design safety checks and human oversight mechanisms', estimated_hours: '40-60h', is_critical_path: true, tools_needed: ['Safety frameworks'], knowledge_areas: ['AI safety', 'Compliance'] },
    { title: 'Agent Monitoring Dashboard', phase: 'development', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI generates monitoring metrics and alerting rules', estimated_hours: '32-48h', tools_needed: ['Monitoring tools'], knowledge_areas: ['Observability'] },
    { title: 'Agent Marketplace', phase: 'development', difficulty: 'medium', ai_potential: 'medium', ai_assist_description: 'AI helps categorize and recommend agents', estimated_hours: '24-32h', tools_needed: ['Marketplace framework'], knowledge_areas: ['Platform design'] },
    { title: 'Security Review', phase: 'testing', difficulty: 'hard', ai_potential: 'medium', ai_assist_description: 'AI assists with security testing scenarios', estimated_hours: '24-32h', tools_needed: ['Security tools'], knowledge_areas: ['Security'] },
    { title: 'User Training Program', phase: 'training', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI creates interactive tutorials for agent building', estimated_hours: '24-32h', tools_needed: ['Training platform'], knowledge_areas: ['Training', 'Documentation'] },
    { title: 'Pilot with 3 Teams', phase: 'rollout', difficulty: 'medium', ai_potential: 'low', ai_assist_description: 'AI monitors pilot metrics', estimated_hours: '40-60h', tools_needed: ['Monitoring'], knowledge_areas: ['Pilot management'] }
  ],

  'loan-integration-platform': [
    { title: 'Lender Partnership Research', phase: 'discovery', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI researches and compares solar loan providers in Spain', estimated_hours: '24-32h', is_critical_path: true, tools_needed: ['Research tools'], knowledge_areas: ['Financial products', 'Partnerships'] },
    { title: 'Integration Requirements', phase: 'discovery', difficulty: 'medium', ai_potential: 'medium', ai_assist_description: 'AI analyzes lender API documentation', estimated_hours: '16-24h', tools_needed: ['API documentation'], knowledge_areas: ['API integration'] },
    { title: 'Pre-Qualification Engine Design', phase: 'planning', difficulty: 'hard', ai_potential: 'high', ai_assist_description: 'AI helps design credit scoring rules and qualification logic', estimated_hours: '32-48h', is_critical_path: true, tools_needed: ['Credit scoring models'], knowledge_areas: ['Credit assessment', 'Financial modeling'] },
    { title: 'Lender API Integration Hub', phase: 'development', difficulty: 'hard', ai_potential: 'medium', ai_assist_description: 'AI assists with API integration patterns', estimated_hours: '80-120h', is_critical_path: true, tools_needed: ['API framework'], knowledge_areas: ['API development', 'Financial APIs'] },
    { title: 'Financing Options UI', phase: 'development', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI generates financing comparison interfaces', estimated_hours: '40-60h', tools_needed: ['React', 'UI components'], knowledge_areas: ['UI development', 'Financial UX'] },
    { title: 'Document Collection Workflow', phase: 'development', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI automates document verification and processing', estimated_hours: '40-60h', tools_needed: ['Document processing'], knowledge_areas: ['Document automation'] },
    { title: 'Settlement and Reconciliation', phase: 'development', difficulty: 'hard', ai_potential: 'medium', ai_assist_description: 'AI helps design settlement workflows', estimated_hours: '40-60h', tools_needed: ['Financial systems'], knowledge_areas: ['Financial reconciliation'] },
    { title: 'Financing Analytics Dashboard', phase: 'development', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI generates financing performance metrics', estimated_hours: '24-32h', tools_needed: ['Analytics tools'], knowledge_areas: ['Financial analytics'] },
    { title: 'Compliance Review', phase: 'testing', difficulty: 'hard', ai_potential: 'medium', ai_assist_description: 'AI assists with compliance checking', estimated_hours: '24-32h', tools_needed: ['Compliance framework'], knowledge_areas: ['Financial compliance'] },
    { title: 'SDR Training on Financing', phase: 'training', difficulty: 'easy', ai_potential: 'high', ai_assist_description: 'AI creates financing training materials', estimated_hours: '16-24h', tools_needed: ['Training platform'], knowledge_areas: ['Training'] },
    { title: 'Pilot Launch', phase: 'rollout', difficulty: 'medium', ai_potential: 'low', ai_assist_description: 'AI monitors financing metrics', estimated_hours: '24-32h', tools_needed: ['Monitoring'], knowledge_areas: ['Launch management'] }
  ],

  'dynamic-pricing-engine': [
    { title: 'Pricing Model Analysis', phase: 'discovery', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI analyzes current pricing and identifies optimization opportunities', estimated_hours: '24-32h', is_critical_path: true, tools_needed: ['Analytics tools'], knowledge_areas: ['Pricing strategy'] },
    { title: 'Partner Segmentation', phase: 'discovery', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI clusters partners by performance and potential', estimated_hours: '16-24h', tools_needed: ['ML clustering'], knowledge_areas: ['Segmentation'] },
    { title: 'Pricing Algorithm Design', phase: 'planning', difficulty: 'hard', ai_potential: 'high', ai_assist_description: 'AI helps design multi-factor pricing models', estimated_hours: '40-60h', is_critical_path: true, tools_needed: ['ML framework'], knowledge_areas: ['Pricing algorithms', 'ML'] },
    { title: 'Multi-Model Pricing Engine', phase: 'development', difficulty: 'hard', ai_potential: 'medium', ai_assist_description: 'AI assists with pricing calculation logic', estimated_hours: '60-80h', is_critical_path: true, tools_needed: ['Pricing framework'], knowledge_areas: ['Pricing systems'] },
    { title: 'Partner Pricing Dashboard', phase: 'development', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI generates pricing visualization and recommendations', estimated_hours: '32-48h', tools_needed: ['Dashboard framework'], knowledge_areas: ['Visualization'] },
    { title: 'Price Simulation Tool', phase: 'development', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI models pricing scenarios and impact', estimated_hours: '24-32h', tools_needed: ['Simulation tools'], knowledge_areas: ['Financial modeling'] },
    { title: 'Contract Generation System', phase: 'development', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI generates custom pricing contracts', estimated_hours: '24-32h', tools_needed: ['Document generation'], knowledge_areas: ['Contract management'] },
    { title: 'A/B Testing Framework', phase: 'development', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI designs and analyzes pricing experiments', estimated_hours: '24-32h', tools_needed: ['Testing framework'], knowledge_areas: ['Experimentation'] },
    { title: 'Finance Team Training', phase: 'training', difficulty: 'easy', ai_potential: 'high', ai_assist_description: 'AI creates pricing training materials', estimated_hours: '8-12h', tools_needed: ['Training tools'], knowledge_areas: ['Training'] },
    { title: 'Gradual Rollout', phase: 'rollout', difficulty: 'easy', ai_potential: 'low', ai_assist_description: 'AI monitors pricing impact', estimated_hours: '16-24h', tools_needed: ['Monitoring'], knowledge_areas: ['Change management'] }
  ],

  'procurement-supplier-platform': [
    { title: 'Supplier Landscape Analysis', phase: 'discovery', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI maps supplier ecosystem and identifies opportunities', estimated_hours: '24-32h', is_critical_path: true, tools_needed: ['Research tools'], knowledge_areas: ['Supplier management'] },
    { title: 'Current Procurement Process Mapping', phase: 'discovery', difficulty: 'easy', ai_potential: 'high', ai_assist_description: 'AI interviews stakeholders and maps current processes', estimated_hours: '16-24h', tools_needed: ['Process mapping'], knowledge_areas: ['Procurement'] },
    { title: 'Price Comparison Engine', phase: 'development', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI aggregates and normalizes supplier pricing', estimated_hours: '40-60h', is_critical_path: true, tools_needed: ['Data integration'], knowledge_areas: ['Pricing analysis'] },
    { title: 'Demand Forecasting Model', phase: 'development', difficulty: 'hard', ai_potential: 'high', ai_assist_description: 'ML model predicts equipment demand', estimated_hours: '60-80h', tools_needed: ['ML framework'], knowledge_areas: ['Forecasting', 'ML'] },
    { title: 'Automated RFQ System', phase: 'development', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI generates and processes RFQ documents', estimated_hours: '40-60h', tools_needed: ['Document generation'], knowledge_areas: ['RFQ process'] },
    { title: 'Supplier Scorecard System', phase: 'development', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI calculates and tracks supplier performance', estimated_hours: '24-32h', tools_needed: ['Scoring framework'], knowledge_areas: ['Supplier performance'] },
    { title: 'Inventory Optimization Module', phase: 'development', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI optimizes stock levels based on demand', estimated_hours: '32-48h', tools_needed: ['Inventory tools'], knowledge_areas: ['Inventory management'] },
    { title: 'Supplier Portal', phase: 'development', difficulty: 'medium', ai_potential: 'medium', ai_assist_description: 'AI assists with portal UX', estimated_hours: '40-60h', tools_needed: ['Portal framework'], knowledge_areas: ['Portal development'] },
    { title: 'Integration Testing', phase: 'testing', difficulty: 'medium', ai_potential: 'medium', ai_assist_description: 'AI generates test scenarios', estimated_hours: '16-24h', tools_needed: ['Testing tools'], knowledge_areas: ['Testing'] },
    { title: 'Procurement Team Training', phase: 'training', difficulty: 'easy', ai_potential: 'high', ai_assist_description: 'AI creates training materials', estimated_hours: '8-12h', tools_needed: ['Training tools'], knowledge_areas: ['Training'] }
  ],

  'accounting-finance-automation': [
    { title: 'Current Finance Process Audit', phase: 'discovery', difficulty: 'easy', ai_potential: 'high', ai_assist_description: 'AI analyzes current processes and identifies automation opportunities', estimated_hours: '16-24h', is_critical_path: true, tools_needed: ['Process mapping'], knowledge_areas: ['Finance processes'] },
    { title: 'Holded Integration Analysis', phase: 'discovery', difficulty: 'medium', ai_potential: 'medium', ai_assist_description: 'AI reviews Holded API capabilities', estimated_hours: '8-12h', tools_needed: ['Holded API docs'], knowledge_areas: ['API integration'] },
    { title: 'Transaction Categorization Engine', phase: 'development', difficulty: 'hard', ai_potential: 'high', ai_assist_description: 'ML model for automatic transaction classification', estimated_hours: '60-80h', is_critical_path: true, tools_needed: ['ML framework', 'Transaction data'], knowledge_areas: ['ML', 'Accounting'] },
    { title: 'Bank Reconciliation Automation', phase: 'development', difficulty: 'hard', ai_potential: 'high', ai_assist_description: 'AI matches and reconciles transactions automatically', estimated_hours: '60-80h', is_critical_path: true, tools_needed: ['Banking APIs', 'Matching algorithms'], knowledge_areas: ['Reconciliation'] },
    { title: 'Financial Reporting Dashboard', phase: 'development', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI generates reports with natural language insights', estimated_hours: '40-60h', tools_needed: ['Reporting framework', 'LLM'], knowledge_areas: ['Financial reporting'] },
    { title: 'Cash Flow Forecasting', phase: 'development', difficulty: 'hard', ai_potential: 'high', ai_assist_description: 'ML model for cash flow prediction', estimated_hours: '40-60h', tools_needed: ['ML framework'], knowledge_areas: ['Cash flow', 'Forecasting'] },
    { title: 'Month-End Close Automation', phase: 'development', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI automates close checklists and reconciliations', estimated_hours: '32-48h', tools_needed: ['Workflow engine'], knowledge_areas: ['Month-end close'] },
    { title: 'Audit Trail System', phase: 'development', difficulty: 'medium', ai_potential: 'medium', ai_assist_description: 'AI assists with audit logging design', estimated_hours: '24-32h', tools_needed: ['Logging framework'], knowledge_areas: ['Audit', 'Compliance'] },
    { title: 'Compliance Testing', phase: 'testing', difficulty: 'medium', ai_potential: 'medium', ai_assist_description: 'AI validates compliance requirements', estimated_hours: '16-24h', tools_needed: ['Compliance framework'], knowledge_areas: ['Financial compliance'] },
    { title: 'Finance Team Training', phase: 'training', difficulty: 'easy', ai_potential: 'high', ai_assist_description: 'AI creates training materials', estimated_hours: '8-12h', tools_needed: ['Training tools'], knowledge_areas: ['Training'] }
  ],

  // Tasks for predicted projects
  'ai-voice-agent-inbound': [
    { title: 'Voice AI Provider Evaluation', phase: 'discovery', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI researches and compares voice AI providers (ElevenLabs, Play.ht, etc.)', estimated_hours: '16-24h', is_critical_path: true, tools_needed: ['Research tools'], knowledge_areas: ['Voice AI', 'Telephony'] },
    { title: 'Call Flow Design', phase: 'planning', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI designs conversation flows for common scenarios', estimated_hours: '24-32h', is_critical_path: true, tools_needed: ['Flow design tools'], knowledge_areas: ['Conversation design'] },
    { title: 'Spanish Language Model Training', phase: 'development', difficulty: 'hard', ai_potential: 'high', ai_assist_description: 'Fine-tune voice model for Spanish solar conversations', estimated_hours: '60-80h', is_critical_path: true, tools_needed: ['Voice AI platform', 'Training data'], knowledge_areas: ['NLU', 'Voice AI'] },
    { title: 'Telephony Integration', phase: 'development', difficulty: 'medium', ai_potential: 'medium', ai_assist_description: 'AI assists with Aircall integration patterns', estimated_hours: '40-60h', tools_needed: ['Aircall API'], knowledge_areas: ['Telephony integration'] },
    { title: 'Lead Qualification Logic', phase: 'development', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI implements qualification rules in conversation', estimated_hours: '24-32h', tools_needed: ['Qualification criteria'], knowledge_areas: ['Lead qualification'] },
    { title: 'Human Handoff System', phase: 'development', difficulty: 'medium', ai_potential: 'medium', ai_assist_description: 'AI designs escalation triggers and handoff flow', estimated_hours: '24-32h', tools_needed: ['Routing system'], knowledge_areas: ['Call routing'] },
    { title: 'Call Analytics Dashboard', phase: 'development', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI generates call metrics and insights', estimated_hours: '24-32h', tools_needed: ['Analytics platform'], knowledge_areas: ['Analytics'] },
    { title: 'Voice Quality Testing', phase: 'testing', difficulty: 'medium', ai_potential: 'medium', ai_assist_description: 'AI assists with test scenario generation', estimated_hours: '16-24h', tools_needed: ['Testing tools'], knowledge_areas: ['Voice testing'] },
    { title: 'SDR Training on Handoffs', phase: 'training', difficulty: 'easy', ai_potential: 'high', ai_assist_description: 'AI creates handoff training materials', estimated_hours: '8-12h', tools_needed: ['Training tools'], knowledge_areas: ['Training'] },
    { title: 'Pilot Launch', phase: 'rollout', difficulty: 'easy', ai_potential: 'low', ai_assist_description: 'AI monitors call metrics', estimated_hours: '16-24h', tools_needed: ['Monitoring'], knowledge_areas: ['Pilot management'] }
  ],

  'predictive-maintenance-monitoring': [
    { title: 'Inverter API Research', phase: 'discovery', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI researches and documents inverter monitoring APIs', estimated_hours: '24-32h', is_critical_path: true, tools_needed: ['API documentation'], knowledge_areas: ['Solar inverters', 'APIs'] },
    { title: 'Data Collection Architecture', phase: 'planning', difficulty: 'hard', ai_potential: 'medium', ai_assist_description: 'AI assists with IoT data pipeline design', estimated_hours: '40-60h', is_critical_path: true, tools_needed: ['Data architecture tools'], knowledge_areas: ['IoT', 'Data engineering'] },
    { title: 'Inverter Data Integration', phase: 'development', difficulty: 'hard', ai_potential: 'medium', ai_assist_description: 'AI helps normalize data across inverter brands', estimated_hours: '80-120h', is_critical_path: true, tools_needed: ['Integration framework'], knowledge_areas: ['Data integration'] },
    { title: 'Failure Prediction Model', phase: 'development', difficulty: 'hard', ai_potential: 'high', ai_assist_description: 'ML model trained on performance data to predict failures', estimated_hours: '80-120h', is_critical_path: true, tools_needed: ['ML framework', 'Historical data'], knowledge_areas: ['ML', 'Predictive maintenance'] },
    { title: 'Customer Monitoring Dashboard', phase: 'development', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI generates customer-friendly performance views', estimated_hours: '40-60h', tools_needed: ['Dashboard framework'], knowledge_areas: ['UI/UX'] },
    { title: 'Alerting and Dispatch System', phase: 'development', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI designs alert rules and dispatch logic', estimated_hours: '32-48h', tools_needed: ['Alerting system'], knowledge_areas: ['Alerting'] },
    { title: 'Maintenance Scheduling Integration', phase: 'development', difficulty: 'medium', ai_potential: 'medium', ai_assist_description: 'AI assists with installer calendar integration', estimated_hours: '24-32h', tools_needed: ['Calendar APIs'], knowledge_areas: ['Scheduling'] },
    { title: 'Premium Subscription System', phase: 'development', difficulty: 'medium', ai_potential: 'medium', ai_assist_description: 'AI assists with subscription management', estimated_hours: '24-32h', tools_needed: ['Subscription tools'], knowledge_areas: ['SaaS'] },
    { title: 'Model Validation', phase: 'testing', difficulty: 'hard', ai_potential: 'high', ai_assist_description: 'AI validates prediction accuracy', estimated_hours: '24-32h', tools_needed: ['ML testing'], knowledge_areas: ['ML validation'] },
    { title: 'Installer Training', phase: 'training', difficulty: 'easy', ai_potential: 'high', ai_assist_description: 'AI creates installer training materials', estimated_hours: '8-12h', tools_needed: ['Training tools'], knowledge_areas: ['Training'] }
  ],

  'community-referral-engine': [
    { title: 'Referral Program Design', phase: 'discovery', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI researches best practices and designs referral incentives', estimated_hours: '16-24h', is_critical_path: true, tools_needed: ['Research tools'], knowledge_areas: ['Growth', 'Referrals'] },
    { title: 'Customer Advocacy Scoring', phase: 'planning', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI designs NPS-based advocacy scoring model', estimated_hours: '16-24h', tools_needed: ['Scoring framework'], knowledge_areas: ['Customer success'] },
    { title: 'Referral Platform Build', phase: 'development', difficulty: 'medium', ai_potential: 'medium', ai_assist_description: 'AI assists with referral tracking logic', estimated_hours: '60-80h', is_critical_path: true, tools_needed: ['Platform framework'], knowledge_areas: ['Platform development'] },
    { title: 'Gamification System', phase: 'development', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI designs gamification mechanics and rewards', estimated_hours: '32-48h', tools_needed: ['Gamification tools'], knowledge_areas: ['Gamification'] },
    { title: 'Community Portal', phase: 'development', difficulty: 'medium', ai_potential: 'medium', ai_assist_description: 'AI assists with community features', estimated_hours: '40-60h', tools_needed: ['Community platform'], knowledge_areas: ['Community building'] },
    { title: 'Testimonial Generation Engine', phase: 'development', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI generates testimonials from customer data', estimated_hours: '24-32h', tools_needed: ['LLM', 'Customer data'], knowledge_areas: ['Content generation'] },
    { title: 'Social Proof Widgets', phase: 'development', difficulty: 'easy', ai_potential: 'high', ai_assist_description: 'AI generates embeddable social proof', estimated_hours: '16-24h', tools_needed: ['Widget framework'], knowledge_areas: ['Widgets'] },
    { title: 'Referral Analytics Dashboard', phase: 'development', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI generates referral metrics and insights', estimated_hours: '24-32h', tools_needed: ['Analytics platform'], knowledge_areas: ['Analytics'] },
    { title: 'Integration Testing', phase: 'testing', difficulty: 'easy', ai_potential: 'medium', ai_assist_description: 'AI generates test cases', estimated_hours: '8-12h', tools_needed: ['Testing tools'], knowledge_areas: ['Testing'] },
    { title: 'Customer Launch Communication', phase: 'rollout', difficulty: 'easy', ai_potential: 'high', ai_assist_description: 'AI generates launch communications', estimated_hours: '8-12h', tools_needed: ['Email tools'], knowledge_areas: ['Communications'] }
  ],

  'intelligent-document-processing': [
    { title: 'Document Type Inventory', phase: 'discovery', difficulty: 'easy', ai_potential: 'high', ai_assist_description: 'AI catalogs all document types and extraction requirements', estimated_hours: '16-24h', is_critical_path: true, tools_needed: ['Documentation'], knowledge_areas: ['Document management'] },
    { title: 'OCR Provider Evaluation', phase: 'discovery', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI compares OCR providers for Spanish documents', estimated_hours: '16-24h', tools_needed: ['OCR tools'], knowledge_areas: ['OCR'] },
    { title: 'Document Ingestion Pipeline', phase: 'development', difficulty: 'medium', ai_potential: 'medium', ai_assist_description: 'AI assists with pipeline architecture', estimated_hours: '32-48h', is_critical_path: true, tools_needed: ['Data pipeline tools'], knowledge_areas: ['Data engineering'] },
    { title: 'Extraction Models per Document Type', phase: 'development', difficulty: 'hard', ai_potential: 'high', ai_assist_description: 'LLM extracts structured data from documents', estimated_hours: '80-120h', is_critical_path: true, tools_needed: ['LLM', 'OCR'], knowledge_areas: ['Document understanding'] },
    { title: 'Validation Rules Engine', phase: 'development', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI implements business rule validation', estimated_hours: '24-32h', tools_needed: ['Rules engine'], knowledge_areas: ['Data validation'] },
    { title: 'Workflow Routing System', phase: 'development', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI designs document routing logic', estimated_hours: '24-32h', tools_needed: ['Workflow engine'], knowledge_areas: ['Workflow automation'] },
    { title: 'Human Review Interface', phase: 'development', difficulty: 'medium', ai_potential: 'medium', ai_assist_description: 'AI assists with review UI design', estimated_hours: '24-32h', tools_needed: ['UI framework'], knowledge_areas: ['UI development'] },
    { title: 'Processing Analytics', phase: 'development', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI generates processing metrics', estimated_hours: '16-24h', tools_needed: ['Analytics platform'], knowledge_areas: ['Analytics'] },
    { title: 'Accuracy Testing', phase: 'testing', difficulty: 'medium', ai_potential: 'high', ai_assist_description: 'AI validates extraction accuracy', estimated_hours: '16-24h', tools_needed: ['Testing framework'], knowledge_areas: ['Testing'] },
    { title: 'Team Training', phase: 'training', difficulty: 'easy', ai_potential: 'high', ai_assist_description: 'AI creates training materials', estimated_hours: '8-12h', tools_needed: ['Training tools'], knowledge_areas: ['Training'] }
  ]
};

// ============================================================================
// PROJECT INTERCONNECTIONS UPDATE
// ============================================================================
const interconnectionUpdates = {
  'sdr-portal': {
    depends_on: ['unified-data-layer'],
    enables: ['funnel-automation-os', 'contact-prioritization-engine', 'whatsapp-conversation-summary'],
    related_to: ['ai-cortex', 'installer-portal-product', 'ai-voice-agent-inbound']
  },
  'unified-data-layer': {
    depends_on: [],
    enables: ['sdr-portal', 'reporting-hub', 'ai-cortex', 'data-quality-monitor', 'installer-portal-product', 'campaign-os', 'funnel-automation-os'],
    related_to: []
  },
  'funnel-automation-os': {
    depends_on: ['unified-data-layer', 'sdr-portal'],
    enables: ['campaign-os', 'ai-omnichannel-chatbot-platform'],
    related_to: ['contact-prioritization-engine', 'lead-recycling-workflow']
  },
  'ai-cortex': {
    depends_on: ['unified-data-layer'],
    enables: ['ai-agent-factory', 'ai-voice-agent-inbound', 'ai-omnichannel-chatbot-platform'],
    related_to: ['sdr-portal', 'campaign-os', 'funnel-automation-os']
  },
  'installer-portal-product': {
    depends_on: ['unified-data-layer', 'dynamic-allocation-engine'],
    enables: ['installer-performance-tracking', 'installer-feedback-system', 'predictive-maintenance-monitoring'],
    related_to: ['sdr-portal', 'installer-quote-sync']
  },
  'reporting-hub': {
    depends_on: ['unified-data-layer'],
    enables: ['investor-portal', 'dynamic-pricing-engine'],
    related_to: ['data-quality-monitor', 'installer-performance-tracking']
  },
  'campaign-os': {
    depends_on: ['unified-data-layer'],
    enables: ['programmatic-seo-pages'],
    related_to: ['funnel-automation-os', 'community-referral-engine']
  },
  'dynamic-allocation-engine': {
    depends_on: ['unified-data-layer', 'installer-performance-tracking'],
    enables: ['installer-portal-product'],
    related_to: ['contact-prioritization-engine']
  },
  'contact-prioritization-engine': {
    depends_on: ['unified-data-layer', 'ai-cortex'],
    enables: [],
    related_to: ['sdr-portal', 'funnel-automation-os', 'dynamic-allocation-engine']
  },
  'investor-portal': {
    depends_on: ['reporting-hub', 'unified-data-layer'],
    enables: [],
    related_to: ['accounting-finance-automation']
  }
};

// ============================================================================
// MAIN EXECUTION
// ============================================================================
async function main() {
  console.log('🚀 Complete Project Overhaul Script\n');
  console.log('='.repeat(60));

  // Fetch existing data
  console.log('\n📊 Fetching existing data...');
  const projects = await apiRequest('GET', '/api/projects');
  const teams = await apiRequest('GET', '/api/teams');

  const projectMap = {};
  projects.forEach(p => {
    projectMap[p.slug] = p;
  });

  const techTeam = teams.find(t => t.slug === 'technology') || teams[0];
  const opsTeam = teams.find(t => t.slug === 'operations') || teams[0];

  console.log(`Found ${projects.length} projects\n`);

  // ============================================================================
  // STEP 1: Delete unwanted projects
  // ============================================================================
  console.log('='.repeat(60));
  console.log('STEP 1: Deleting Unwanted Projects');
  console.log('='.repeat(60));

  for (const slug of projectsToDelete) {
    const project = projectMap[slug];
    if (project) {
      try {
        await apiRequest('DELETE', `/api/projects?id=${project.id}`);
        console.log(`✅ Deleted: ${slug}`);
        delete projectMap[slug];
      } catch (error) {
        console.log(`❌ Failed to delete ${slug}: ${error.message}`);
      }
    } else {
      console.log(`⏭️  Not found: ${slug}`);
    }
  }

  // ============================================================================
  // STEP 2: Update existing projects with complete details
  // ============================================================================
  console.log('\n' + '='.repeat(60));
  console.log('STEP 2: Updating Projects with Complete Details');
  console.log('='.repeat(60));

  let projectsUpdated = 0;
  for (const [slug, details] of Object.entries(completeProjectDetails)) {
    const project = projectMap[slug];

    if (project) {
      // Update existing project
      try {
        await apiRequest('PATCH', '/api/projects', {
          id: project.id,
          ...details,
          owner_team_id: details.category === 'operations' ? opsTeam?.id : techTeam?.id
        });
        console.log(`✅ Updated: ${slug}`);
        projectsUpdated++;
      } catch (error) {
        console.log(`❌ Failed to update ${slug}: ${error.message}`);
      }
    } else {
      // Create new project
      try {
        const newProject = await apiRequest('POST', '/api/projects', {
          title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          slug: slug,
          owner_team_id: details.category === 'operations' ? opsTeam?.id : techTeam?.id,
          ...details
        });
        if (newProject.id) {
          projectMap[slug] = newProject;
          console.log(`✅ Created: ${slug}`);
          projectsUpdated++;
        }
      } catch (error) {
        console.log(`❌ Failed to create ${slug}: ${error.message}`);
      }
    }
  }
  console.log(`\n📈 Updated/Created ${projectsUpdated} projects`);

  // ============================================================================
  // STEP 3: Mark predicted projects
  // ============================================================================
  console.log('\n' + '='.repeat(60));
  console.log('STEP 3: Marking Predicted Projects');
  console.log('='.repeat(60));

  for (const slug of predictedProjectSlugs) {
    const project = projectMap[slug];
    if (project) {
      try {
        await apiRequest('PATCH', '/api/projects', {
          id: project.id,
          is_predicted: true
        });
        console.log(`✅ Marked as predicted: ${slug}`);
      } catch (error) {
        console.log(`❌ Failed to mark ${slug}: ${error.message}`);
      }
    }
  }

  // ============================================================================
  // STEP 4: Add tasks to new projects
  // ============================================================================
  console.log('\n' + '='.repeat(60));
  console.log('STEP 4: Adding Tasks to New Projects');
  console.log('='.repeat(60));

  let tasksCreated = 0;
  for (const [projectSlug, tasks] of Object.entries(tasksForNewProjects)) {
    const project = projectMap[projectSlug];
    if (!project) {
      console.log(`⚠️  Project not found: ${projectSlug}`);
      continue;
    }

    console.log(`\n📁 Adding tasks to: ${projectSlug}`);

    for (const task of tasks) {
      try {
        await apiRequest('POST', '/api/tasks', {
          project_id: project.id,
          title: task.title,
          description: task.ai_assist_description,
          phase: task.phase,
          difficulty: task.difficulty,
          ai_potential: task.ai_potential,
          ai_assist_description: task.ai_assist_description,
          estimated_hours: task.estimated_hours,
          is_critical_path: task.is_critical_path || false,
          is_foundational: task.is_foundational || false,
          tools_needed: task.tools_needed || [],
          knowledge_areas: task.knowledge_areas || [],
          status: 'not_started',
          owner_team_id: project.owner_team_id
        });
        console.log(`  ✅ ${task.title}`);
        tasksCreated++;
      } catch (error) {
        console.log(`  ❌ ${task.title}: ${error.message}`);
      }
    }
  }
  console.log(`\n📈 Created ${tasksCreated} new tasks`);

  // ============================================================================
  // STEP 5: Update project interconnections
  // ============================================================================
  console.log('\n' + '='.repeat(60));
  console.log('STEP 5: Updating Project Interconnections');
  console.log('='.repeat(60));

  let connectionsUpdated = 0;
  for (const [slug, connections] of Object.entries(interconnectionUpdates)) {
    const project = projectMap[slug];
    if (!project) {
      console.log(`⚠️  Project not found: ${slug}`);
      continue;
    }

    try {
      await apiRequest('PATCH', '/api/projects', {
        id: project.id,
        depends_on: connections.depends_on,
        enables: connections.enables,
        related_to: connections.related_to
      });
      console.log(`✅ Updated connections: ${slug}`);
      connectionsUpdated++;
    } catch (error) {
      console.log(`❌ Failed to update ${slug}: ${error.message}`);
    }
  }
  console.log(`\n📈 Updated ${connectionsUpdated} project connections`);

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Projects deleted: ${projectsToDelete.length}`);
  console.log(`✅ Projects updated/created: ${projectsUpdated}`);
  console.log(`✅ Projects marked as predicted: ${predictedProjectSlugs.length}`);
  console.log(`✅ Tasks created: ${tasksCreated}`);
  console.log(`✅ Interconnections updated: ${connectionsUpdated}`);
  console.log('\n🎉 Complete project overhaul finished!');
}

main().catch(console.error);
