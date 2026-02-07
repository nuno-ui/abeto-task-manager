// Script to fix generic task descriptions with project-specific content
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pyxjwtyvmbltscayabsj.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Generic phrases to detect
const genericPhrases = [
  /^Complete .* according to requirements/i,
  /^Build and train machine learning model with proper validation/i,
  /^Implement comprehensive test coverage including/i,
  /^Build user interface with focus on usability/i,
  /^Implement notification system with email, push/i,
  /^Build an interactive dashboard with real-time/i,
  /^Implement API integration with proper authentication/i,
  /^Build data synchronization between systems/i,
  /^Analyze and optimize performance by identifying/i,
  /^Design and implement.*with proper/i
];

// Project context for generating better descriptions
const projectContext = {
  'ai-cortex': {
    domain: 'AI/ML intelligence layer',
    users: 'all Abeto products and teams',
    goal: 'unified AI capabilities across the platform'
  },
  'unified-data-layer': {
    domain: 'data infrastructure',
    users: 'all internal systems and dashboards',
    goal: 'single source of truth for all business data'
  },
  'agent-communication-protocol': {
    domain: 'inter-agent messaging',
    users: 'AI agents across the platform',
    goal: 'reliable agent-to-agent communication'
  },
  'sdr-portal': {
    domain: 'sales development',
    users: 'SDR team members',
    goal: 'streamlined lead management and outreach'
  },
  'installer-portal-product': {
    domain: 'installer management',
    users: 'solar installers and operations team',
    goal: 'efficient installer onboarding and management'
  },
  'campaign-os': {
    domain: 'marketing campaigns',
    users: 'marketing team',
    goal: 'automated campaign management and optimization'
  },
  'reporting-hub': {
    domain: 'business intelligence',
    users: 'leadership and all teams',
    goal: 'comprehensive reporting and insights'
  },
  'data-quality-monitor': {
    domain: 'data quality',
    users: 'data and operations teams',
    goal: 'proactive data issue detection and resolution'
  },
  'dynamic-pricing-engine': {
    domain: 'pricing optimization',
    users: 'sales and finance teams',
    goal: 'competitive and profitable pricing'
  },
  'installer-performance-tracking': {
    domain: 'installer analytics',
    users: 'operations and installer success teams',
    goal: 'data-driven installer performance improvement'
  },
  'funnel-automation-os': {
    domain: 'sales funnel',
    users: 'sales and marketing teams',
    goal: 'automated lead nurturing and conversion'
  },
  'ai-agent-factory': {
    domain: 'agent development',
    users: 'engineering team',
    goal: 'rapid AI agent creation and deployment'
  },
  'ai-voice-agent-inbound': {
    domain: 'voice AI',
    users: 'customer service and sales teams',
    goal: 'intelligent call handling and routing'
  },
  'contact-prioritization-engine': {
    domain: 'lead scoring',
    users: 'SDR and sales teams',
    goal: 'optimal contact prioritization for conversion'
  },
  'dynamic-allocation-engine': {
    domain: 'resource allocation',
    users: 'operations team',
    goal: 'intelligent workload distribution'
  },
  'whatsapp-conversation-summary': {
    domain: 'conversation intelligence',
    users: 'SDR and sales teams',
    goal: 'actionable insights from WhatsApp conversations'
  },
  'answer-rate-monitoring': {
    domain: 'call analytics',
    users: 'SDR managers',
    goal: 'improved answer rates and call effectiveness'
  },
  'installer-quote-sync': {
    domain: 'quote management',
    users: 'installers and sales team',
    goal: 'synchronized quotes across all channels'
  },
  'pvpc-savings-widget': {
    domain: 'energy savings',
    users: 'customers and sales team',
    goal: 'clear visualization of potential savings'
  },
  'loan-integration-platform': {
    domain: 'financing',
    users: 'customers and sales team',
    goal: 'seamless financing options for solar purchases'
  },
  'investor-portal': {
    domain: 'investor relations',
    users: 'investors and leadership',
    goal: 'transparent investment tracking and reporting'
  },
  'gmb-automation': {
    domain: 'local SEO',
    users: 'marketing team',
    goal: 'automated Google My Business optimization'
  },
  'programmatic-seo-pages': {
    domain: 'SEO',
    users: 'marketing team',
    goal: 'scalable organic traffic generation'
  },
  'competitor-intel-agent': {
    domain: 'competitive intelligence',
    users: 'sales and marketing teams',
    goal: 'real-time competitor insights'
  },
  'review-generation-system': {
    domain: 'reputation management',
    users: 'customer success team',
    goal: 'increased positive reviews and social proof'
  },
  'lead-recycling-workflow': {
    domain: 'lead management',
    users: 'SDR team',
    goal: 'maximize value from unconverted leads'
  },
  'installer-feedback-system': {
    domain: 'installer relations',
    users: 'operations and installer success teams',
    goal: 'continuous improvement through installer feedback'
  },
  'predictive-maintenance-monitoring': {
    domain: 'system maintenance',
    users: 'operations and customer success teams',
    goal: 'proactive issue prevention'
  },
  'intelligent-document-processing': {
    domain: 'document automation',
    users: 'operations and finance teams',
    goal: 'automated document handling and extraction'
  },
  'admin-hr-automation-suite': {
    domain: 'HR and admin',
    users: 'HR and admin teams',
    goal: 'streamlined internal operations'
  },
  'accounting-finance-automation': {
    domain: 'finance',
    users: 'finance team',
    goal: 'automated financial processes'
  },
  'gdpr-compliance-tracker': {
    domain: 'compliance',
    users: 'legal and data teams',
    goal: 'GDPR compliance and data protection'
  },
  'pan-european-expansion-engine': {
    domain: 'market expansion',
    users: 'leadership and operations',
    goal: 'successful expansion into new European markets'
  },
  'product-diversification-platform': {
    domain: 'product expansion',
    users: 'product and sales teams',
    goal: 'new product offerings and revenue streams'
  },
  'procurement-supplier-platform': {
    domain: 'procurement',
    users: 'operations and finance teams',
    goal: 'optimized supplier management'
  },
  'community-referral-engine': {
    domain: 'referrals',
    users: 'marketing and customer success',
    goal: 'viral growth through customer referrals'
  },
  'automated-invoicing': {
    domain: 'invoicing',
    users: 'finance team',
    goal: 'automated invoice generation and tracking'
  },
  'robinson-suppressor': {
    domain: 'compliance',
    users: 'sales and legal teams',
    goal: 'Robinson list compliance for outreach'
  },
  'irpf-calculator': {
    domain: 'tax calculations',
    users: 'customers and sales team',
    goal: 'accurate tax benefit calculations'
  },
  'unified-quote-api': {
    domain: 'quoting infrastructure',
    users: 'all quoting systems',
    goal: 'unified quote generation across channels'
  },
  'api-self-service-portal': {
    domain: 'API access',
    users: 'external partners and developers',
    goal: 'self-service API integration for partners'
  },
  'ai-customer-success-agent': {
    domain: 'customer success',
    users: 'CS team and installers',
    goal: 'proactive customer health management'
  },
  'internal-ops-agent-suite': {
    domain: 'internal automation',
    users: 'all internal teams',
    goal: 'automated repetitive internal tasks'
  },
  'installer-gtm-value-prop': {
    domain: 'installer acquisition',
    users: 'sales and marketing teams',
    goal: 'compelling value proposition for installers'
  },
  'installer-enablement-training': {
    domain: 'installer training',
    users: 'installers and operations team',
    goal: 'skilled and certified installer network'
  },
  'incident-bug-management': {
    domain: 'incident management',
    users: 'engineering and support teams',
    goal: 'rapid incident resolution and learning'
  },
  'cortex-data-acquisition': {
    domain: 'AI training data',
    users: 'AI/ML team',
    goal: 'high-quality data for AI model training'
  },
  'ai-omnichannel-chatbot-platform': {
    domain: 'conversational AI',
    users: 'customers and support team',
    goal: 'intelligent omnichannel customer support'
  }
};

// Better description templates based on task type
function generateBetterDescription(task, project) {
  const ctx = projectContext[project.slug] || {
    domain: project.title.toLowerCase(),
    users: 'relevant team members',
    goal: 'project objectives'
  };

  const title = task.title.toLowerCase();
  const phase = task.phase;

  // Dashboard tasks
  if (title.includes('dashboard')) {
    return `Build a real-time ${ctx.domain} dashboard for ${ctx.users}. Display key metrics, trends, and actionable insights. Include filtering by date range, team, and relevant dimensions. Optimize for quick decision-making with clear visualizations and drill-down capabilities.`;
  }

  // Monitoring tasks
  if (title.includes('monitoring') || title.includes('monitor')) {
    return `Implement continuous monitoring for ${ctx.domain} to support ${ctx.goal}. Track key health indicators, detect anomalies early, and provide real-time alerts. Include historical trend analysis and predictive capabilities where applicable.`;
  }

  // Integration tasks
  if (title.includes('integration')) {
    return `Build robust integration connecting ${ctx.domain} systems. Implement proper authentication, error handling, retry logic, and rate limiting. Ensure data consistency, handle edge cases gracefully, and provide clear logging for troubleshooting.`;
  }

  // Testing tasks
  if (title.includes('testing') || title.includes('validation')) {
    return `Comprehensive testing for ${ctx.domain} functionality. Validate all user workflows, edge cases, and error scenarios. Include unit tests for core logic, integration tests for system boundaries, and end-to-end tests for critical paths. Target 80%+ coverage on business-critical code.`;
  }

  // Launch/Rollout tasks
  if (title.includes('launch') || title.includes('rollout')) {
    return `Execute phased launch of ${ctx.domain} capabilities. Start with pilot users, gather feedback, and iterate before wider rollout. Monitor adoption metrics, address issues quickly, and ensure ${ctx.users} have proper training and support materials.`;
  }

  // Training tasks
  if (title.includes('training')) {
    return `Develop training program for ${ctx.users} on ${ctx.domain}. Create hands-on tutorials, reference documentation, and quick-start guides. Include video walkthroughs for complex workflows and establish certification criteria to ensure competency.`;
  }

  // API tasks
  if (title.includes('api')) {
    return `Design and implement ${ctx.domain} API endpoints. Follow RESTful conventions, implement proper authentication and authorization, and provide comprehensive documentation. Include rate limiting, versioning strategy, and clear error responses.`;
  }

  // Alerting tasks
  if (title.includes('alert')) {
    return `Implement intelligent alerting for ${ctx.domain}. Define alert thresholds based on business impact, route alerts to appropriate teams, and prevent alert fatigue through smart grouping and severity levels. Include escalation paths for critical issues.`;
  }

  // Requirements/Discovery tasks
  if (phase === 'discovery' || title.includes('requirement') || title.includes('analysis')) {
    return `Gather and document requirements for ${ctx.domain} from ${ctx.users}. Conduct stakeholder interviews, analyze existing workflows, and identify pain points. Prioritize features based on impact and effort, and create clear acceptance criteria for each requirement.`;
  }

  // Architecture/Design tasks
  if (title.includes('architecture') || title.includes('design') || phase === 'planning') {
    return `Design the technical architecture for ${ctx.domain} to achieve ${ctx.goal}. Consider scalability, maintainability, and integration with existing systems. Document key decisions, trade-offs, and create diagrams for team alignment.`;
  }

  // Model/ML tasks
  if (title.includes('model') || title.includes('scoring') || title.includes('prediction')) {
    return `Develop ML model for ${ctx.domain} predictions. Analyze available data, engineer relevant features, and select appropriate algorithms. Implement proper train/test splits, cross-validation, and establish baseline metrics. Target model performance that meaningfully improves ${ctx.goal}.`;
  }

  // Pipeline/Data tasks
  if (title.includes('pipeline') || title.includes('data')) {
    return `Build data pipeline for ${ctx.domain}. Implement reliable data extraction, transformation, and loading with proper error handling and monitoring. Ensure data quality checks, maintain lineage tracking, and optimize for both batch and real-time processing needs.`;
  }

  // Calculation/Engine tasks
  if (title.includes('calculation') || title.includes('engine')) {
    return `Implement ${ctx.domain} calculation engine to support ${ctx.goal}. Ensure accuracy through comprehensive test cases, optimize for performance, and handle edge cases gracefully. Include audit logging for traceability and support for configuration changes without code deployment.`;
  }

  // Default - make it specific to the project
  return `Implement ${task.title.replace(/ - .*$/, '')} for ${ctx.domain}. This supports ${ctx.goal} by providing ${ctx.users} with essential functionality. Follow project standards, ensure thorough testing, and document any integration points or dependencies.`;
}

async function fixDescriptions() {
  console.log('='.repeat(80));
  console.log('FIXING GENERIC TASK DESCRIPTIONS');
  console.log('='.repeat(80));

  // Fetch all tasks with project info
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select(`
      id,
      title,
      description,
      phase,
      projects!inner(id, title, slug)
    `);

  if (error) {
    console.error('Error fetching tasks:', error);
    return;
  }

  console.log(`\nLoaded ${tasks.length} tasks`);

  // Find tasks with generic descriptions
  const genericTasks = tasks.filter(t => {
    if (!t.description) return true;
    return genericPhrases.some(phrase => phrase.test(t.description));
  });

  console.log(`Found ${genericTasks.length} tasks with generic descriptions\n`);

  // Fix each task
  let fixedCount = 0;
  let errorCount = 0;

  for (const task of genericTasks) {
    const newDescription = generateBetterDescription(task, task.projects);

    const { error: updateError } = await supabase
      .from('tasks')
      .update({ description: newDescription })
      .eq('id', task.id);

    if (updateError) {
      console.log(`❌ Error updating "${task.title}": ${updateError.message}`);
      errorCount++;
    } else {
      console.log(`✅ Fixed: "${task.title}" [${task.projects.slug}]`);
      console.log(`   Old: ${task.description?.substring(0, 60)}...`);
      console.log(`   New: ${newDescription.substring(0, 60)}...`);
      console.log('');
      fixedCount++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log(`
✅ Fixed: ${fixedCount} tasks
❌ Errors: ${errorCount} tasks
📊 Total generic tasks found: ${genericTasks.length}
`);
}

fixDescriptions().catch(console.error);
