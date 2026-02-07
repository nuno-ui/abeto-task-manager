// Script to seed tasks for empty projects
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pyxjwtyvmbltscayabsj.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY not set. Set it with:');
  console.error('export SUPABASE_SERVICE_ROLE_KEY="your-key"');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getProjectId(slug) {
  const { data, error } = await supabase
    .from('projects')
    .select('id')
    .eq('slug', slug)
    .single();
  if (error) throw new Error(`Project ${slug} not found: ${error.message}`);
  return data.id;
}

async function getTeamId(slug) {
  const { data, error } = await supabase
    .from('teams')
    .select('id')
    .eq('slug', slug)
    .single();
  if (error) throw new Error(`Team ${slug} not found: ${error.message}`);
  return data.id;
}

async function seedTasks() {
  console.log('Fetching project and team IDs...');

  // Get project IDs
  const projectIds = {};
  const projectSlugs = [
    'installer-gtm-value-prop',
    'ai-customer-success-agent',
    'installer-enablement-training',
    'incident-bug-management',
    'internal-ops-agent-suite',
    'agent-communication-protocol',
    'cortex-data-acquisition'
  ];

  for (const slug of projectSlugs) {
    try {
      projectIds[slug] = await getProjectId(slug);
      console.log(`  Project ${slug}: ${projectIds[slug]}`);
    } catch (e) {
      console.error(`  Error getting project ${slug}: ${e.message}`);
    }
  }

  // Get team IDs
  const teamIds = {};
  const teamSlugs = ['sales', 'marketing', 'operations', 'technology', 'finance'];
  for (const slug of teamSlugs) {
    try {
      teamIds[slug] = await getTeamId(slug);
      console.log(`  Team ${slug}: ${teamIds[slug]}`);
    } catch (e) {
      console.error(`  Error getting team ${slug}: ${e.message}`);
    }
  }

  // First, delete any existing tasks for these projects (in case of re-run)
  console.log('\nClearing existing tasks for these projects...');
  for (const slug of projectSlugs) {
    if (projectIds[slug]) {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('project_id', projectIds[slug]);
      if (error) {
        console.log(`  Error clearing tasks for ${slug}: ${error.message}`);
      } else {
        console.log(`  Cleared tasks for ${slug}`);
      }
    }
  }

  // Define all tasks
  // Valid phases: discovery, planning, development, testing, training, rollout, monitoring
  const allTasks = [
    // 1. INSTALLER GTM & VALUE PROPOSITION TASKS
    {
      project_id: projectIds['installer-gtm-value-prop'],
      title: 'Installer Persona Research',
      description: 'Conduct interviews with 10-15 current installers to understand their needs, pain points, and decision criteria. Document installer archetypes and buying journey.',
      phase: 'discovery', status: 'not_started', priority: 'high', difficulty: 'medium',
      owner_team_id: teamIds['sales'],
      estimated_hours: '16-24h', ai_potential: 'medium',
      ai_assist_description: 'Can help analyze interview transcripts and identify patterns',
      tools_needed: ['Interview tools', 'Notion', 'Recording software'],
      knowledge_areas: ['Customer Research', 'Market Analysis'],
      acceptance_criteria: ['10+ installer interviews conducted', 'Persona documents created', 'Buying journey mapped', 'Key pain points identified'],
      success_metrics: ['Complete persona documentation', 'Validated by sales team'],
      risks: ['Installer availability', 'Bias in sample'],
      is_foundational: true, is_critical_path: true, order_index: 0
    },
    {
      project_id: projectIds['installer-gtm-value-prop'],
      title: 'Competitive Landscape Analysis',
      description: 'Analyze competing installer platforms and their value propositions. Document feature comparisons, pricing strategies, and market positioning.',
      phase: 'discovery', status: 'not_started', priority: 'high', difficulty: 'medium',
      owner_team_id: teamIds['marketing'],
      estimated_hours: '12-16h', ai_potential: 'high',
      ai_assist_description: 'Can research competitors and generate comparison matrices',
      tools_needed: ['Web research', 'Spreadsheets', 'Notion'],
      knowledge_areas: ['Market Analysis', 'Competitive Intelligence'],
      acceptance_criteria: ['5+ competitors analyzed', 'Feature comparison matrix', 'Pricing analysis complete', 'Differentiators identified'],
      success_metrics: ['Comprehensive competitive database'],
      risks: ['Incomplete public information', 'Rapidly changing landscape'],
      is_foundational: true, is_critical_path: false, order_index: 1
    },
    {
      project_id: projectIds['installer-gtm-value-prop'],
      title: 'Value Proposition Framework Development',
      description: 'Develop clear value proposition framework articulating why installers should join Abeto. Include ROI calculator, success stories framework, and key messaging.',
      phase: 'planning', status: 'not_started', priority: 'critical', difficulty: 'hard',
      owner_team_id: teamIds['marketing'],
      estimated_hours: '20-28h', ai_potential: 'medium',
      ai_assist_description: 'Can help draft messaging and calculate ROI scenarios',
      tools_needed: ['Copywriting tools', 'Spreadsheets', 'Design tools'],
      knowledge_areas: ['Marketing Strategy', 'Value Communication'],
      acceptance_criteria: ['Core value proposition statement', 'Supporting proof points', 'ROI calculator model', 'Message testing plan'],
      success_metrics: ['Value prop approved by leadership'],
      risks: ['Internal alignment', 'Unclear differentiation'],
      is_foundational: true, is_critical_path: true, order_index: 2
    },
    {
      project_id: projectIds['installer-gtm-value-prop'],
      title: 'Pricing Strategy Definition',
      description: 'Define installer pricing tiers, commission structures, and incentive programs. Model unit economics and margin analysis.',
      phase: 'planning', status: 'not_started', priority: 'critical', difficulty: 'hard',
      owner_team_id: teamIds['finance'],
      estimated_hours: '16-24h', ai_potential: 'medium',
      ai_assist_description: 'Can model financial scenarios and create pricing simulations',
      tools_needed: ['Spreadsheets', 'Financial modeling tools'],
      knowledge_areas: ['Financial Analysis', 'Pricing Strategy'],
      acceptance_criteria: ['Pricing tiers defined', 'Commission structure documented', 'Unit economics validated', 'Competitive pricing analysis'],
      success_metrics: ['Profitable pricing model approved'],
      risks: ['Market rejection', 'Margin pressure'],
      is_foundational: true, is_critical_path: true, order_index: 3
    },
    {
      project_id: projectIds['installer-gtm-value-prop'],
      title: 'Sales Deck & Materials Creation',
      description: 'Create comprehensive sales deck, one-pagers, and leave-behind materials for installer acquisition. Include case studies and testimonials.',
      phase: 'development', status: 'not_started', priority: 'high', difficulty: 'medium',
      owner_team_id: teamIds['marketing'],
      estimated_hours: '24-32h', ai_potential: 'high',
      ai_assist_description: 'Can draft content and suggest design improvements',
      tools_needed: ['Figma', 'Google Slides', 'Canva'],
      knowledge_areas: ['Content Creation', 'Sales Enablement'],
      acceptance_criteria: ['Sales deck completed', 'One-pagers for each segment', 'Case study templates', 'Leave-behind materials'],
      success_metrics: ['Materials approved by sales'],
      risks: ['Design delays', 'Content approval'],
      is_foundational: false, is_critical_path: false, order_index: 4
    },
    {
      project_id: projectIds['installer-gtm-value-prop'],
      title: 'Installer Onboarding Journey Design',
      description: 'Design the complete installer onboarding experience from signup to first installation. Include training requirements, certification process, and support touchpoints.',
      phase: 'development', status: 'not_started', priority: 'high', difficulty: 'hard',
      owner_team_id: teamIds['operations'],
      estimated_hours: '20-28h', ai_potential: 'medium',
      ai_assist_description: 'Can map journey and identify automation opportunities',
      tools_needed: ['Journey mapping tools', 'Notion', 'Process design'],
      knowledge_areas: ['Process Design', 'Customer Experience'],
      acceptance_criteria: ['Onboarding journey mapped', 'Training curriculum defined', 'Certification requirements set', 'Support touchpoints identified'],
      success_metrics: ['Onboarding time under 48 hours'],
      risks: ['Complexity', 'Drop-off rates'],
      is_foundational: true, is_critical_path: true, order_index: 5
    },
    {
      project_id: projectIds['installer-gtm-value-prop'],
      title: 'GTM Launch Campaign',
      description: 'Execute go-to-market launch campaign for installer acquisition. Include digital marketing, events, partnerships, and referral programs.',
      phase: 'rollout', status: 'not_started', priority: 'critical', difficulty: 'hard',
      owner_team_id: teamIds['marketing'],
      estimated_hours: '40-60h', ai_potential: 'medium',
      ai_assist_description: 'Can help with content creation and campaign optimization',
      tools_needed: ['Marketing automation', 'Analytics', 'Ad platforms'],
      knowledge_areas: ['Marketing Execution', 'Lead Generation'],
      acceptance_criteria: ['Campaign live across channels', 'Lead tracking operational', 'Referral program active', 'Event calendar set'],
      success_metrics: ['50+ qualified installer leads per month'],
      risks: ['Budget constraints', 'Market timing'],
      is_foundational: false, is_critical_path: true, order_index: 6
    },
    {
      project_id: projectIds['installer-gtm-value-prop'],
      title: 'Sales Enablement & Training',
      description: 'Train sales team on value proposition, objection handling, and demo process. Create sales playbook and competition battle cards.',
      phase: 'training', status: 'not_started', priority: 'high', difficulty: 'medium',
      owner_team_id: teamIds['sales'],
      estimated_hours: '16-24h', ai_potential: 'medium',
      ai_assist_description: 'Can generate training materials and role-play scenarios',
      tools_needed: ['Training platform', 'Sales tools', 'Documentation'],
      knowledge_areas: ['Sales Training', 'Enablement'],
      acceptance_criteria: ['Sales playbook complete', 'Team trained', 'Battle cards created', 'Demo scripts ready'],
      success_metrics: ['100% sales team certified'],
      risks: ['Training adoption', 'Time constraints'],
      is_foundational: false, is_critical_path: false, order_index: 7
    },

    // 2. AI CUSTOMER SUCCESS AGENT TASKS
    {
      project_id: projectIds['ai-customer-success-agent'],
      title: 'CS Agent Requirements & Use Cases',
      description: 'Document all customer success scenarios the AI agent should handle. Include proactive outreach triggers, health scoring criteria, and escalation rules.',
      phase: 'discovery', status: 'not_started', priority: 'critical', difficulty: 'medium',
      owner_team_id: teamIds['operations'],
      estimated_hours: '16-20h', ai_potential: 'medium',
      ai_assist_description: 'Can help categorize use cases and suggest automation opportunities',
      tools_needed: ['Notion', 'CRM data', 'Support tickets'],
      knowledge_areas: ['Customer Success', 'Process Design'],
      acceptance_criteria: ['All CS scenarios documented', 'Health scoring model defined', 'Escalation matrix created', 'Automation opportunities identified'],
      success_metrics: ['Comprehensive use case library'],
      risks: ['Missing edge cases', 'Changing requirements'],
      is_foundational: true, is_critical_path: true, order_index: 0
    },
    {
      project_id: projectIds['ai-customer-success-agent'],
      title: 'Churn Prediction Model Design',
      description: 'Design machine learning model to predict customer churn risk. Identify key signals, data requirements, and intervention thresholds.',
      phase: 'planning', status: 'not_started', priority: 'critical', difficulty: 'hard',
      owner_team_id: teamIds['technology'],
      estimated_hours: '24-32h', ai_potential: 'high',
      ai_assist_description: 'Can design model architecture and feature engineering',
      tools_needed: ['Python', 'ML frameworks', 'Data warehouse'],
      knowledge_areas: ['Machine Learning', 'Data Science'],
      acceptance_criteria: ['Model architecture defined', 'Features identified', 'Training data requirements', 'Accuracy targets set'],
      success_metrics: ['Model design approved by data team'],
      risks: ['Data quality issues', 'Model complexity'],
      is_foundational: true, is_critical_path: true, order_index: 1
    },
    {
      project_id: projectIds['ai-customer-success-agent'],
      title: 'Proactive Intervention Workflows',
      description: 'Build automated workflows for proactive customer outreach based on health scores and behavior signals.',
      phase: 'development', status: 'not_started', priority: 'high', difficulty: 'hard',
      owner_team_id: teamIds['technology'],
      estimated_hours: '28-36h', ai_potential: 'high',
      ai_assist_description: 'Can generate workflow logic and message templates',
      tools_needed: ['Workflow automation', 'Messaging APIs', 'CRM'],
      knowledge_areas: ['Automation', 'Customer Communication'],
      acceptance_criteria: ['Workflows deployed', 'Trigger conditions working', 'Message personalization active', 'A/B testing enabled'],
      success_metrics: ['Workflows processing 100+ customers/day'],
      risks: ['Over-communication', 'Timing issues'],
      is_foundational: false, is_critical_path: true, order_index: 2
    },
    {
      project_id: projectIds['ai-customer-success-agent'],
      title: 'CS Agent Conversation Handling',
      description: 'Implement AI-powered conversation handling for common customer inquiries. Include intent recognition, response generation, and handoff to humans.',
      phase: 'development', status: 'not_started', priority: 'critical', difficulty: 'hard',
      owner_team_id: teamIds['technology'],
      estimated_hours: '32-40h', ai_potential: 'high',
      ai_assist_description: 'This IS the AI agent - will use LLM for conversations',
      tools_needed: ['LLM APIs', 'Chat platform', 'Knowledge base'],
      knowledge_areas: ['NLP', 'Conversational AI'],
      acceptance_criteria: ['Intent recognition working', 'Response quality validated', 'Handoff logic implemented', 'Conversation history tracked'],
      success_metrics: ['80% query resolution without human'],
      risks: ['Response quality', 'Edge cases'],
      is_foundational: true, is_critical_path: true, order_index: 3
    },
    {
      project_id: projectIds['ai-customer-success-agent'],
      title: 'Installer Health Dashboard',
      description: 'Build dashboard showing installer health scores, engagement metrics, and recommended actions for CS team.',
      phase: 'development', status: 'not_started', priority: 'high', difficulty: 'medium',
      owner_team_id: teamIds['technology'],
      estimated_hours: '20-28h', ai_potential: 'medium',
      ai_assist_description: 'Can help design dashboard layout and metrics',
      tools_needed: ['React', 'Chart libraries', 'API'],
      knowledge_areas: ['Frontend', 'Data Visualization'],
      acceptance_criteria: ['Dashboard deployed', 'Health scores visible', 'Action recommendations shown', 'Filtering and search working'],
      success_metrics: ['Dashboard used daily by CS team'],
      risks: ['Performance', 'Data freshness'],
      is_foundational: false, is_critical_path: false, order_index: 4
    },
    {
      project_id: projectIds['ai-customer-success-agent'],
      title: 'CS Agent Testing & Validation',
      description: 'Comprehensive testing of AI agent including accuracy testing, edge case handling, and user acceptance testing with CS team.',
      phase: 'testing', status: 'not_started', priority: 'critical', difficulty: 'medium',
      owner_team_id: teamIds['operations'],
      estimated_hours: '16-24h', ai_potential: 'medium',
      ai_assist_description: 'Can generate test cases and analyze results',
      tools_needed: ['Testing tools', 'Staging environment'],
      knowledge_areas: ['QA', 'User Testing'],
      acceptance_criteria: ['Test cases executed', 'Accuracy benchmarks met', 'CS team validated', 'Edge cases handled'],
      success_metrics: ['95% test pass rate'],
      risks: ['Hidden issues', 'User adoption'],
      is_foundational: false, is_critical_path: true, order_index: 5
    },

    // 3. INSTALLER ENABLEMENT & TRAINING PLATFORM TASKS
    {
      project_id: projectIds['installer-enablement-training'],
      title: 'Training Needs Assessment',
      description: 'Survey installers and analyze support tickets to identify knowledge gaps. Document required competencies and skill levels.',
      phase: 'discovery', status: 'not_started', priority: 'high', difficulty: 'medium',
      owner_team_id: teamIds['operations'],
      estimated_hours: '12-16h', ai_potential: 'medium',
      ai_assist_description: 'Can analyze support data and identify patterns',
      tools_needed: ['Survey tools', 'Support data', 'Notion'],
      knowledge_areas: ['Training Design', 'Customer Research'],
      acceptance_criteria: ['Survey completed with 50+ responses', 'Knowledge gaps documented', 'Competency matrix created', 'Priority topics identified'],
      success_metrics: ['Complete training needs assessment'],
      risks: ['Low survey response', 'Bias in responses'],
      is_foundational: true, is_critical_path: true, order_index: 0
    },
    {
      project_id: projectIds['installer-enablement-training'],
      title: 'Curriculum Design & Structure',
      description: 'Design training curriculum including modules, progression paths, and certification levels. Map content to installer journey stages.',
      phase: 'planning', status: 'not_started', priority: 'critical', difficulty: 'hard',
      owner_team_id: teamIds['operations'],
      estimated_hours: '20-28h', ai_potential: 'medium',
      ai_assist_description: 'Can suggest content structure and learning objectives',
      tools_needed: ['Notion', 'LMS research', 'Instructional design'],
      knowledge_areas: ['Instructional Design', 'Content Strategy'],
      acceptance_criteria: ['Curriculum outline complete', 'Module descriptions written', 'Progression paths defined', 'Certification criteria set'],
      success_metrics: ['Curriculum approved by leadership'],
      risks: ['Scope creep', 'Content gaps'],
      is_foundational: true, is_critical_path: true, order_index: 1
    },
    {
      project_id: projectIds['installer-enablement-training'],
      title: 'LMS Platform Selection & Setup',
      description: 'Evaluate and select learning management system. Configure platform, set up user management, and integrate with installer database.',
      phase: 'planning', status: 'not_started', priority: 'high', difficulty: 'medium',
      owner_team_id: teamIds['technology'],
      estimated_hours: '16-24h', ai_potential: 'low',
      ai_assist_description: 'Platform selection requires human evaluation',
      tools_needed: ['LMS platforms', 'Integration tools'],
      knowledge_areas: ['Platform Evaluation', 'Integration'],
      acceptance_criteria: ['3+ LMS evaluated', 'Platform selected', 'Basic setup complete', 'User management configured'],
      success_metrics: ['LMS operational'],
      risks: ['Integration complexity', 'Cost overruns'],
      is_foundational: true, is_critical_path: false, order_index: 2
    },
    {
      project_id: projectIds['installer-enablement-training'],
      title: 'Video Training Content Production',
      description: 'Produce video training content for core modules including platform tutorials, best practices, and troubleshooting guides.',
      phase: 'development', status: 'not_started', priority: 'high', difficulty: 'hard',
      owner_team_id: teamIds['marketing'],
      estimated_hours: '40-60h', ai_potential: 'medium',
      ai_assist_description: 'Can help script videos and suggest visuals',
      tools_needed: ['Video production', 'Screen recording', 'Editing software'],
      knowledge_areas: ['Video Production', 'Content Creation'],
      acceptance_criteria: ['10+ training videos produced', 'Videos under 10 min each', 'Quizzes integrated', 'Captions added'],
      success_metrics: ['80% video completion rate'],
      risks: ['Production delays', 'Quality issues'],
      is_foundational: false, is_critical_path: true, order_index: 3
    },
    {
      project_id: projectIds['installer-enablement-training'],
      title: 'Interactive Practice Simulations',
      description: 'Build interactive simulations for installers to practice key workflows in a safe environment.',
      phase: 'development', status: 'not_started', priority: 'medium', difficulty: 'hard',
      owner_team_id: teamIds['technology'],
      estimated_hours: '24-32h', ai_potential: 'high',
      ai_assist_description: 'Can help design simulation scenarios',
      tools_needed: ['Simulation tools', 'Frontend', 'Staging data'],
      knowledge_areas: ['Interactive Design', 'Simulation'],
      acceptance_criteria: ['3+ simulations built', 'Realistic scenarios', 'Feedback provided', 'Progress tracked'],
      success_metrics: ['Simulations used by 50% of installers'],
      risks: ['Complexity', 'Maintenance burden'],
      is_foundational: false, is_critical_path: false, order_index: 4
    },
    {
      project_id: projectIds['installer-enablement-training'],
      title: 'Certification Program Launch',
      description: 'Launch installer certification program with exams, badges, and recognition. Track certification rates and correlate with performance.',
      phase: 'rollout', status: 'not_started', priority: 'high', difficulty: 'medium',
      owner_team_id: teamIds['operations'],
      estimated_hours: '16-24h', ai_potential: 'medium',
      ai_assist_description: 'Can help design exam questions and track metrics',
      tools_needed: ['LMS', 'Badge system', 'Analytics'],
      knowledge_areas: ['Program Management', 'Assessment'],
      acceptance_criteria: ['Certification exams live', 'Badges awarded', 'Public recognition system', 'Performance correlation tracked'],
      success_metrics: ['30% installers certified in 3 months'],
      risks: ['Low adoption', 'Exam gaming'],
      is_foundational: false, is_critical_path: true, order_index: 5
    },

    // 4. INCIDENT & BUG MANAGEMENT SYSTEM TASKS
    {
      project_id: projectIds['incident-bug-management'],
      title: 'Incident Classification Framework',
      description: 'Define incident severity levels, categories, and response SLAs. Create decision tree for triage and escalation.',
      phase: 'discovery', status: 'not_started', priority: 'critical', difficulty: 'medium',
      owner_team_id: teamIds['technology'],
      estimated_hours: '12-16h', ai_potential: 'medium',
      ai_assist_description: 'Can help define categories based on historical data',
      tools_needed: ['Notion', 'Historical incident data'],
      knowledge_areas: ['Incident Management', 'Process Design'],
      acceptance_criteria: ['Severity levels defined', 'Categories documented', 'SLAs established', 'Escalation paths clear'],
      success_metrics: ['Framework approved by all teams'],
      risks: ['Edge cases', 'Team disagreement'],
      is_foundational: true, is_critical_path: true, order_index: 0
    },
    {
      project_id: projectIds['incident-bug-management'],
      title: 'Bug Tracking System Setup',
      description: 'Configure bug tracking system with custom fields, workflows, and integrations. Set up reporting and dashboards.',
      phase: 'planning', status: 'not_started', priority: 'high', difficulty: 'medium',
      owner_team_id: teamIds['technology'],
      estimated_hours: '16-24h', ai_potential: 'medium',
      ai_assist_description: 'Can help design workflows and custom fields',
      tools_needed: ['Bug tracking tool', 'Integrations'],
      knowledge_areas: ['Tool Configuration', 'Workflow Design'],
      acceptance_criteria: ['System configured', 'Workflows set up', 'Integrations working', 'Dashboards created'],
      success_metrics: ['System adopted by all teams'],
      risks: ['Adoption resistance', 'Configuration complexity'],
      is_foundational: true, is_critical_path: true, order_index: 1
    },
    {
      project_id: projectIds['incident-bug-management'],
      title: 'AI Bug Triage Automation',
      description: 'Implement AI-powered bug triage to automatically categorize, prioritize, and assign incoming bugs based on content and historical patterns.',
      phase: 'development', status: 'not_started', priority: 'high', difficulty: 'hard',
      owner_team_id: teamIds['technology'],
      estimated_hours: '24-32h', ai_potential: 'high',
      ai_assist_description: 'This IS AI automation - will use ML for classification',
      tools_needed: ['ML models', 'Bug tracker API', 'Training data'],
      knowledge_areas: ['Machine Learning', 'NLP'],
      acceptance_criteria: ['Auto-categorization working', 'Priority prediction accurate', 'Assignment logic implemented', 'Override capability exists'],
      success_metrics: ['80% triage accuracy'],
      risks: ['Model accuracy', 'Edge cases'],
      is_foundational: false, is_critical_path: true, order_index: 2
    },
    {
      project_id: projectIds['incident-bug-management'],
      title: 'Customer Notification System',
      description: 'Build automated customer notification system for incident updates. Include status page, email notifications, and in-app alerts.',
      phase: 'development', status: 'not_started', priority: 'high', difficulty: 'medium',
      owner_team_id: teamIds['technology'],
      estimated_hours: '20-28h', ai_potential: 'high',
      ai_assist_description: 'Can generate notification templates and logic',
      tools_needed: ['Notification service', 'Status page tool', 'Email service'],
      knowledge_areas: ['Communication', 'Integration'],
      acceptance_criteria: ['Status page live', 'Email notifications working', 'In-app alerts functional', 'Subscriber management active'],
      success_metrics: ['Customers notified within 5 min of incidents'],
      risks: ['Notification fatigue', 'Delivery issues'],
      is_foundational: false, is_critical_path: false, order_index: 3
    },
    {
      project_id: projectIds['incident-bug-management'],
      title: 'Post-Mortem Process & Templates',
      description: 'Create post-mortem process and templates for significant incidents. Include root cause analysis, action items, and learning documentation.',
      phase: 'development', status: 'not_started', priority: 'medium', difficulty: 'easy',
      owner_team_id: teamIds['technology'],
      estimated_hours: '8-12h', ai_potential: 'medium',
      ai_assist_description: 'Can help generate templates and analysis frameworks',
      tools_needed: ['Notion', 'Templates'],
      knowledge_areas: ['Process Design', 'Documentation'],
      acceptance_criteria: ['Post-mortem template created', 'Process documented', 'Meeting cadence set', 'Action tracking in place'],
      success_metrics: ['Post-mortems completed for all P0/P1'],
      risks: ['Process fatigue', 'Blame culture'],
      is_foundational: false, is_critical_path: false, order_index: 4
    },
    {
      project_id: projectIds['incident-bug-management'],
      title: 'Resolution Tracking Dashboard',
      description: 'Build dashboard tracking bug resolution metrics, SLA compliance, and team performance. Include trend analysis and forecasting.',
      phase: 'monitoring', status: 'not_started', priority: 'medium', difficulty: 'medium',
      owner_team_id: teamIds['technology'],
      estimated_hours: '16-24h', ai_potential: 'medium',
      ai_assist_description: 'Can help design metrics and visualizations',
      tools_needed: ['Dashboard tools', 'Data warehouse', 'Chart libraries'],
      knowledge_areas: ['Data Visualization', 'Metrics'],
      acceptance_criteria: ['Dashboard deployed', 'Key metrics visible', 'SLA tracking working', 'Trend analysis available'],
      success_metrics: ['Dashboard used in weekly reviews'],
      risks: ['Data accuracy', 'Performance'],
      is_foundational: false, is_critical_path: false, order_index: 5
    },

    // 5. INTERNAL OPERATIONS AGENT SUITE TASKS
    {
      project_id: projectIds['internal-ops-agent-suite'],
      title: 'Internal Process Audit',
      description: 'Audit all internal operations processes to identify repetitive tasks suitable for AI automation. Document time spent and automation potential.',
      phase: 'discovery', status: 'not_started', priority: 'high', difficulty: 'medium',
      owner_team_id: teamIds['operations'],
      estimated_hours: '16-24h', ai_potential: 'medium',
      ai_assist_description: 'Can help analyze processes and identify patterns',
      tools_needed: ['Process documentation', 'Time tracking', 'Interviews'],
      knowledge_areas: ['Process Analysis', 'Operations'],
      acceptance_criteria: ['All processes documented', 'Time analysis complete', 'Automation candidates ranked', 'ROI estimated'],
      success_metrics: ['Comprehensive process inventory'],
      risks: ['Incomplete documentation', 'Resistance to change'],
      is_foundational: true, is_critical_path: true, order_index: 0
    },
    {
      project_id: projectIds['internal-ops-agent-suite'],
      title: 'Agent Architecture Design',
      description: 'Design the architecture for internal AI agents including shared components, agent-specific modules, and orchestration layer.',
      phase: 'planning', status: 'not_started', priority: 'critical', difficulty: 'hard',
      owner_team_id: teamIds['technology'],
      estimated_hours: '20-28h', ai_potential: 'high',
      ai_assist_description: 'Can help design agent architecture and patterns',
      tools_needed: ['Architecture tools', 'Documentation'],
      knowledge_areas: ['System Architecture', 'AI Design'],
      acceptance_criteria: ['Architecture documented', 'Shared components identified', 'Agent interfaces defined', 'Orchestration approach set'],
      success_metrics: ['Architecture approved by tech lead'],
      risks: ['Over-engineering', 'Integration complexity'],
      is_foundational: true, is_critical_path: true, order_index: 1
    },
    {
      project_id: projectIds['internal-ops-agent-suite'],
      title: 'Data Entry Automation Agent',
      description: 'Build AI agent to automate repetitive data entry tasks across systems. Include validation, error handling, and audit logging.',
      phase: 'development', status: 'not_started', priority: 'high', difficulty: 'hard',
      owner_team_id: teamIds['technology'],
      estimated_hours: '28-36h', ai_potential: 'high',
      ai_assist_description: 'This IS the AI agent for data entry automation',
      tools_needed: ['RPA tools', 'API integrations', 'LLM'],
      knowledge_areas: ['Automation', 'Integration'],
      acceptance_criteria: ['Agent operational', 'Data entry automated', 'Validation working', 'Error handling robust'],
      success_metrics: ['50% reduction in manual data entry'],
      risks: ['Data quality', 'System changes'],
      is_foundational: false, is_critical_path: true, order_index: 2
    },
    {
      project_id: projectIds['internal-ops-agent-suite'],
      title: 'Report Generation Agent',
      description: 'Build AI agent to automatically generate routine reports by pulling data from multiple sources and formatting outputs.',
      phase: 'development', status: 'not_started', priority: 'high', difficulty: 'medium',
      owner_team_id: teamIds['technology'],
      estimated_hours: '24-32h', ai_potential: 'high',
      ai_assist_description: 'This IS the AI agent for report generation',
      tools_needed: ['Data connectors', 'Report templates', 'LLM'],
      knowledge_areas: ['Data Processing', 'Reporting'],
      acceptance_criteria: ['Agent generating reports', 'Multiple formats supported', 'Scheduling working', 'Distribution automated'],
      success_metrics: ['10+ hours/week saved on reporting'],
      risks: ['Data accuracy', 'Format requirements'],
      is_foundational: false, is_critical_path: false, order_index: 3
    },
    {
      project_id: projectIds['internal-ops-agent-suite'],
      title: 'Meeting Scheduling Agent',
      description: 'Build AI agent to handle internal meeting scheduling, calendar management, and follow-up coordination.',
      phase: 'development', status: 'not_started', priority: 'medium', difficulty: 'medium',
      owner_team_id: teamIds['technology'],
      estimated_hours: '20-28h', ai_potential: 'high',
      ai_assist_description: 'This IS the AI agent for scheduling',
      tools_needed: ['Calendar APIs', 'Email integration', 'LLM'],
      knowledge_areas: ['Calendar Management', 'Communication'],
      acceptance_criteria: ['Agent scheduling meetings', 'Calendar conflicts resolved', 'Follow-ups automated', 'Preferences learned'],
      success_metrics: ['80% scheduling handled by agent'],
      risks: ['Calendar complexity', 'User preferences'],
      is_foundational: false, is_critical_path: false, order_index: 4
    },
    {
      project_id: projectIds['internal-ops-agent-suite'],
      title: 'Agent Monitoring & Analytics',
      description: 'Build monitoring dashboard for all internal agents including performance metrics, error rates, and usage analytics.',
      phase: 'monitoring', status: 'not_started', priority: 'medium', difficulty: 'medium',
      owner_team_id: teamIds['technology'],
      estimated_hours: '16-24h', ai_potential: 'medium',
      ai_assist_description: 'Can help design metrics and alerts',
      tools_needed: ['Monitoring tools', 'Dashboard', 'Alerting'],
      knowledge_areas: ['Monitoring', 'Analytics'],
      acceptance_criteria: ['Dashboard live', 'All agents monitored', 'Alerts configured', 'Usage tracked'],
      success_metrics: ['99%+ agent uptime'],
      risks: ['Alert fatigue', 'Missing metrics'],
      is_foundational: false, is_critical_path: false, order_index: 5
    },

    // 6. AGENT COMMUNICATION PROTOCOL TASKS
    {
      project_id: projectIds['agent-communication-protocol'],
      title: 'Protocol Requirements Analysis',
      description: 'Analyze communication requirements between all AI agents. Document message types, data formats, and interaction patterns.',
      phase: 'discovery', status: 'not_started', priority: 'critical', difficulty: 'hard',
      owner_team_id: teamIds['technology'],
      estimated_hours: '16-24h', ai_potential: 'medium',
      ai_assist_description: 'Can help analyze patterns and suggest standards',
      tools_needed: ['Documentation', 'Agent specs', 'Message analysis'],
      knowledge_areas: ['Protocol Design', 'System Analysis'],
      acceptance_criteria: ['All agent interactions mapped', 'Message types cataloged', 'Data formats documented', 'Patterns identified'],
      success_metrics: ['Complete interaction matrix'],
      risks: ['Missing use cases', 'Evolving requirements'],
      is_foundational: true, is_critical_path: true, order_index: 0
    },
    {
      project_id: projectIds['agent-communication-protocol'],
      title: 'Message Schema Design',
      description: 'Design standardized message schemas for agent-to-agent communication. Include versioning, validation, and extensibility.',
      phase: 'planning', status: 'not_started', priority: 'critical', difficulty: 'hard',
      owner_team_id: teamIds['technology'],
      estimated_hours: '20-28h', ai_potential: 'high',
      ai_assist_description: 'Can help design schemas and generate documentation',
      tools_needed: ['Schema tools', 'Documentation', 'Validation'],
      knowledge_areas: ['Schema Design', 'API Design'],
      acceptance_criteria: ['Schema specification complete', 'Versioning strategy defined', 'Validation rules set', 'Extension points documented'],
      success_metrics: ['Schema approved by all agent teams'],
      risks: ['Breaking changes', 'Over-complexity'],
      is_foundational: true, is_critical_path: true, order_index: 1
    },
    {
      project_id: projectIds['agent-communication-protocol'],
      title: 'Message Queue Infrastructure',
      description: 'Set up message queue infrastructure for asynchronous agent communication. Include routing, retry logic, and dead letter handling.',
      phase: 'development', status: 'not_started', priority: 'critical', difficulty: 'hard',
      owner_team_id: teamIds['technology'],
      estimated_hours: '24-32h', ai_potential: 'medium',
      ai_assist_description: 'Can help configure queues and routing rules',
      tools_needed: ['Message queue', 'Infrastructure', 'Monitoring'],
      knowledge_areas: ['Infrastructure', 'Message Queues'],
      acceptance_criteria: ['Queue infrastructure deployed', 'Routing working', 'Retry logic implemented', 'Dead letter handling active'],
      success_metrics: ['99.9% message delivery'],
      risks: ['Infrastructure costs', 'Complexity'],
      is_foundational: true, is_critical_path: true, order_index: 2
    },
    {
      project_id: projectIds['agent-communication-protocol'],
      title: 'Protocol SDK Development',
      description: 'Build SDK/library for agents to easily implement communication protocol. Include documentation and examples.',
      phase: 'development', status: 'not_started', priority: 'high', difficulty: 'hard',
      owner_team_id: teamIds['technology'],
      estimated_hours: '28-36h', ai_potential: 'high',
      ai_assist_description: 'Can help generate SDK code and documentation',
      tools_needed: ['SDK tools', 'Multiple languages', 'Testing'],
      knowledge_areas: ['SDK Development', 'Documentation'],
      acceptance_criteria: ['SDK published', 'Documentation complete', 'Examples provided', 'Tests passing'],
      success_metrics: ['SDK adopted by all agents'],
      risks: ['Adoption friction', 'Maintenance burden'],
      is_foundational: false, is_critical_path: true, order_index: 3
    },
    {
      project_id: projectIds['agent-communication-protocol'],
      title: 'Protocol Security & Authentication',
      description: 'Implement security layer for agent communication including authentication, encryption, and audit logging.',
      phase: 'development', status: 'not_started', priority: 'critical', difficulty: 'hard',
      owner_team_id: teamIds['technology'],
      estimated_hours: '20-28h', ai_potential: 'medium',
      ai_assist_description: 'Can help design security patterns',
      tools_needed: ['Security tools', 'Encryption', 'Audit logging'],
      knowledge_areas: ['Security', 'Authentication'],
      acceptance_criteria: ['Authentication implemented', 'Encryption in transit', 'Audit logging active', 'Security reviewed'],
      success_metrics: ['Zero unauthorized access'],
      risks: ['Security vulnerabilities', 'Performance impact'],
      is_foundational: true, is_critical_path: false, order_index: 4
    },
    {
      project_id: projectIds['agent-communication-protocol'],
      title: 'Protocol Testing & Validation',
      description: 'Comprehensive testing of communication protocol including load testing, failure scenarios, and integration testing.',
      phase: 'testing', status: 'not_started', priority: 'high', difficulty: 'medium',
      owner_team_id: teamIds['technology'],
      estimated_hours: '16-24h', ai_potential: 'medium',
      ai_assist_description: 'Can help generate test scenarios',
      tools_needed: ['Testing tools', 'Load testing', 'Chaos engineering'],
      knowledge_areas: ['Testing', 'QA'],
      acceptance_criteria: ['Unit tests complete', 'Integration tests passing', 'Load testing done', 'Failure scenarios tested'],
      success_metrics: ['100% test coverage'],
      risks: ['Hidden bugs', 'Edge cases'],
      is_foundational: false, is_critical_path: true, order_index: 5
    },

    // 7. CORTEX DATA ACQUISITION STRATEGY TASKS
    {
      project_id: projectIds['cortex-data-acquisition'],
      title: 'Data Source Inventory',
      description: 'Create comprehensive inventory of all potential data sources for Cortex training. Evaluate quality, accessibility, and legal considerations.',
      phase: 'discovery', status: 'not_started', priority: 'critical', difficulty: 'medium',
      owner_team_id: teamIds['technology'],
      estimated_hours: '16-24h', ai_potential: 'medium',
      ai_assist_description: 'Can help research data sources and evaluate quality',
      tools_needed: ['Research tools', 'Documentation', 'Legal review'],
      knowledge_areas: ['Data Research', 'Legal Compliance'],
      acceptance_criteria: ['All data sources identified', 'Quality scores assigned', 'Access methods documented', 'Legal review complete'],
      success_metrics: ['100+ potential data sources evaluated'],
      risks: ['Data access issues', 'Legal restrictions'],
      is_foundational: true, is_critical_path: true, order_index: 0
    },
    {
      project_id: projectIds['cortex-data-acquisition'],
      title: 'Data Quality Framework',
      description: 'Define data quality standards and validation rules for Cortex training data. Include quality metrics and remediation processes.',
      phase: 'planning', status: 'not_started', priority: 'critical', difficulty: 'hard',
      owner_team_id: teamIds['technology'],
      estimated_hours: '20-28h', ai_potential: 'high',
      ai_assist_description: 'Can help define quality rules and validation logic',
      tools_needed: ['Data quality tools', 'Documentation', 'Validation'],
      knowledge_areas: ['Data Quality', 'Standards'],
      acceptance_criteria: ['Quality standards defined', 'Validation rules created', 'Metrics established', 'Remediation process set'],
      success_metrics: ['Quality framework approved'],
      risks: ['Evolving requirements', 'Enforcement challenges'],
      is_foundational: true, is_critical_path: true, order_index: 1
    },
    {
      project_id: projectIds['cortex-data-acquisition'],
      title: 'Data Pipeline Architecture',
      description: 'Design data pipeline architecture for collecting, processing, and storing training data. Include ETL processes and data lineage.',
      phase: 'planning', status: 'not_started', priority: 'critical', difficulty: 'hard',
      owner_team_id: teamIds['technology'],
      estimated_hours: '24-32h', ai_potential: 'high',
      ai_assist_description: 'Can help design pipeline and generate configs',
      tools_needed: ['Data pipeline tools', 'Architecture', 'Storage'],
      knowledge_areas: ['Data Engineering', 'Architecture'],
      acceptance_criteria: ['Pipeline architecture documented', 'ETL processes defined', 'Storage strategy set', 'Lineage tracking planned'],
      success_metrics: ['Architecture approved by data team'],
      risks: ['Complexity', 'Scale challenges'],
      is_foundational: true, is_critical_path: true, order_index: 2
    },
    {
      project_id: projectIds['cortex-data-acquisition'],
      title: 'Installer Interaction Data Collection',
      description: 'Implement collection of installer interaction data including platform usage, support conversations, and performance metrics.',
      phase: 'development', status: 'not_started', priority: 'high', difficulty: 'medium',
      owner_team_id: teamIds['technology'],
      estimated_hours: '20-28h', ai_potential: 'medium',
      ai_assist_description: 'Can help design collection points and schemas',
      tools_needed: ['Event tracking', 'Data pipeline', 'Storage'],
      knowledge_areas: ['Data Collection', 'Privacy'],
      acceptance_criteria: ['Collection points implemented', 'Data flowing to pipeline', 'Privacy compliance verified', 'Quality checks active'],
      success_metrics: ['90% of interactions captured'],
      risks: ['Privacy concerns', 'Data volume'],
      is_foundational: false, is_critical_path: true, order_index: 3
    },
    {
      project_id: projectIds['cortex-data-acquisition'],
      title: 'External Data Integration',
      description: 'Integrate external data sources including market data, weather, energy prices, and regulatory information.',
      phase: 'development', status: 'not_started', priority: 'high', difficulty: 'hard',
      owner_team_id: teamIds['technology'],
      estimated_hours: '28-36h', ai_potential: 'medium',
      ai_assist_description: 'Can help design integrations and transformations',
      tools_needed: ['API integrations', 'Data transformation', 'Scheduling'],
      knowledge_areas: ['Integration', 'Data Processing'],
      acceptance_criteria: ['External sources connected', 'Data transformations working', 'Refresh schedules set', 'Quality monitoring active'],
      success_metrics: ['5+ external sources integrated'],
      risks: ['API changes', 'Data costs'],
      is_foundational: false, is_critical_path: false, order_index: 4
    },
    {
      project_id: projectIds['cortex-data-acquisition'],
      title: 'Data Labeling & Annotation',
      description: 'Set up data labeling process for supervised learning datasets. Include annotation tools, guidelines, and quality control.',
      phase: 'development', status: 'not_started', priority: 'high', difficulty: 'medium',
      owner_team_id: teamIds['operations'],
      estimated_hours: '24-32h', ai_potential: 'medium',
      ai_assist_description: 'Can assist with annotation guidelines and QC',
      tools_needed: ['Labeling tools', 'Guidelines', 'QC process'],
      knowledge_areas: ['Data Annotation', 'Quality Control'],
      acceptance_criteria: ['Labeling tool configured', 'Guidelines documented', 'QC process established', 'Initial dataset labeled'],
      success_metrics: ['10,000+ labeled examples'],
      risks: ['Labeling quality', 'Time investment'],
      is_foundational: false, is_critical_path: true, order_index: 5
    }
  ];

  // Filter out tasks with missing project IDs
  const validTasks = allTasks.filter(t => t.project_id && t.owner_team_id);
  console.log(`\nInserting ${validTasks.length} tasks...`);

  // Insert in batches
  const batchSize = 10;
  for (let i = 0; i < validTasks.length; i += batchSize) {
    const batch = validTasks.slice(i, i + batchSize);
    console.log(`  Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(validTasks.length/batchSize)}: ${batch.length} tasks`);

    const { data, error } = await supabase
      .from('tasks')
      .insert(batch);

    if (error) {
      console.error(`    Error: ${error.message}`);
      console.error(`    Details: ${JSON.stringify(error)}`);
    } else {
      console.log(`    Success!`);
    }
  }

  // Verify task counts
  console.log('\nVerifying task counts...');
  const { data: projects, error: verifyError } = await supabase
    .from('projects')
    .select(`
      title,
      slug,
      tasks(count)
    `)
    .in('slug', projectSlugs);

  if (verifyError) {
    console.error('Error verifying:', verifyError);
  } else {
    console.log('Task counts:');
    projects.forEach(p => {
      console.log(`  ${p.title}: ${p.tasks[0]?.count || 0} tasks`);
    });
  }
}

seedTasks().catch(console.error);
