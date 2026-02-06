/**
 * Script to update project and task content in Supabase
 *
 * Run with: node scripts/run-improvements.js
 *
 * Requires environment variables:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

const { createClient } = require('@supabase/supabase-js');

// Get env vars - try multiple sources
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing required environment variables!');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('Example:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/run-improvements.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Project improvements data
const projectUpdates = [
  {
    slug: 'ai-driven-omnichannel-chatbot-platform',
    updates: {
      description: 'Build an AI-powered omnichannel communication platform that unifies WhatsApp, voice calls, and web chat into a single intelligent system. The platform will leverage GPT-4 for natural conversations, provide real-time lead qualification, and enable SDRs to manage all interactions from one dashboard with AI-suggested responses and automatic lead scoring.',
      problem_statement: 'SDRs currently juggle 4-5 different tools to manage conversations. WhatsApp messages in Woztell, calls in Aircall, CRM data in Zoho - leading to missed follow-ups, inconsistent responses, and no unified customer history. Average response time is 47 minutes, causing 23% lead abandonment.',
      why_it_matters: 'This is the backbone of our lead nurturing strategy. By unifying all communication channels with AI assistance, we can reduce response time from 47 min to under 5 min, increase lead conversion by 35%, and enable each SDR to handle 3x more conversations without quality degradation.',
      deliverables: ['Omnichannel chatbot platform with WhatsApp, voice, and web integration', 'Real-time AI-powered response suggestions for SDRs', 'Automatic lead scoring and qualification engine', 'Unified conversation history dashboard', 'Voice call transcription and sentiment analysis', 'Integration with Zoho CRM for automatic lead updates']
    }
  },
  {
    slug: 'ai-sdr-copilot-interface',
    updates: {
      description: 'Create an intelligent assistant interface that sits alongside the SDR workflow, providing real-time coaching, conversation summaries, next-best-action recommendations, and automatic data entry. The copilot learns from successful conversions to continuously improve suggestions.',
      problem_statement: 'SDRs spend 40% of their time on administrative tasks - updating CRM records, writing follow-up summaries, researching leads. New SDRs take 3 months to reach full productivity and top performers have tacit knowledge that is not transferred to the team.',
      why_it_matters: 'By automating administrative burden and encoding best practices into AI suggestions, we can reclaim 15+ hours per SDR per week, reduce new hire ramp-up from 3 months to 3 weeks, and improve overall conversion rates by leveraging patterns from our best performers.',
      deliverables: ['Real-time AI coaching sidebar during calls', 'Automatic conversation summarization and CRM updates', 'Next-best-action recommendations based on lead signals', 'Knowledge base integration for instant information retrieval', 'Performance analytics comparing AI suggestions vs outcomes', 'Customizable prompts for different conversation stages']
    }
  },
  {
    slug: 'whatsapp-business-api-integration',
    updates: {
      description: 'Implement native WhatsApp Business API integration replacing the current Woztell middleware. This provides direct access to all WhatsApp features, lower costs per message, template message management, and the foundation for chatbot automation.',
      problem_statement: 'Woztell adds €0.03 per message overhead and limits access to advanced WhatsApp features. We cannot send proactive template messages at scale, have no read receipts integration, and experience 4-6 hour delays during peak times.',
      why_it_matters: 'WhatsApp is our #1 lead communication channel with 78% of conversations happening there. Direct API integration saves €2,400/month in messaging fees, enables proactive outreach campaigns, and provides the technical foundation for chatbot automation.',
      deliverables: ['Direct WhatsApp Business API connection via Meta Cloud API', 'Template message management and approval workflow', 'Webhook handlers for real-time message delivery status', 'Media message support (images, documents, location)', 'Message analytics and delivery reporting', 'Migration path from Woztell with zero conversation loss']
    }
  },
  {
    slug: 'voice-call-intelligence-system',
    updates: {
      description: 'Deploy AI-powered voice call analysis that transcribes all Aircall conversations in real-time, extracts key information, identifies customer sentiment, and provides actionable insights. Includes automatic call outcome classification and quality scoring.',
      problem_statement: 'We make 200+ calls daily but have no systematic way to learn from them. Managers can only review 5% of calls manually, leaving 95% as black boxes. Successful techniques are not identified and spread, while problems go undetected until leads are lost.',
      why_it_matters: 'Voice calls convert 3x better than text but are currently our least understood channel. AI analysis enables 100% call review, identifies winning patterns from top performers, catches issues in real-time, and provides coaching data that can improve team performance by 25%.',
      deliverables: ['Real-time call transcription via Aircall API and Whisper', 'Sentiment analysis throughout call duration', 'Automatic extraction of key entities (address, budget, timeline)', 'Call quality scoring algorithm based on best practices', 'Searchable call library with AI-generated summaries', 'Integration with SDR performance dashboards']
    }
  },
  {
    slug: 'lead-scoring-ai-engine',
    updates: {
      description: 'Build a machine learning model that predicts lead quality and conversion probability based on demographic data, behavioral signals, engagement patterns, and installer availability. The model continuously learns from outcomes to improve accuracy.',
      problem_statement: 'All leads currently receive equal treatment regardless of conversion likelihood. SDRs waste time on low-quality leads while hot prospects wait. We have no data-driven way to prioritize the 150+ new leads we receive daily.',
      why_it_matters: 'Intelligent lead scoring ensures our limited SDR capacity focuses on highest-potential opportunities. Expected outcomes: 40% increase in qualified lead throughput, 25% improvement in SDR productivity, and reduction in lead-to-quote time from 72h to 24h.',
      deliverables: ['ML model trained on 18 months of conversion data', 'Real-time scoring API integrated with Zoho CRM', 'Score explanation dashboard showing contributing factors', 'Lead prioritization queue for SDRs', 'A/B testing framework to validate model accuracy', 'Monthly model retraining pipeline']
    }
  },
  {
    slug: 'installer-matching-algorithm',
    updates: {
      description: 'Develop an intelligent matching system that pairs leads with the optimal installer based on location, capacity, specialization, customer preferences, and historical performance. Includes real-time availability tracking and automatic workload balancing.',
      problem_statement: 'Installer assignment is currently manual and based on basic zip code rules. We have no visibility into installer capacity, leading to 35% of assignments requiring reassignment. Some installers are overloaded while others have capacity gaps.',
      why_it_matters: 'Optimal matching increases installation success rate from 68% to expected 85%, improves installer satisfaction, and reduces time-to-installation by 2 weeks. This directly impacts our revenue since we earn commission on completed installations.',
      deliverables: ['Multi-factor matching algorithm (location, capacity, rating, specialization)', 'Real-time installer availability calendar integration', 'Automatic workload balancing across installer network', 'Match quality scoring and feedback loop', 'Installer capacity forecasting', 'Customer-installer compatibility predictions']
    }
  },
  {
    slug: 'quote-generation-automation',
    updates: {
      description: 'Automate the solar installation quote generation process by integrating satellite imagery analysis, electricity bill parsing, and equipment pricing. Generate accurate, professional quotes in under 5 minutes instead of the current 48-hour manual process.',
      problem_statement: 'Quote generation requires manual roof analysis, electricity consumption calculation, and equipment specification. Each quote takes 2-3 hours of engineer time. Customers wait 48+ hours for quotes, during which 30% lose interest and go to competitors.',
      why_it_matters: 'Speed-to-quote is the #1 factor in solar lead conversion. Reducing quote time from 48h to 5 minutes will capture leads while interest is hot. Expected 45% increase in quote-to-sale conversion plus significant reduction in engineering overhead.',
      deliverables: ['Satellite roof analysis for panel placement optimization', 'Electricity bill OCR and consumption pattern analysis', 'Equipment recommendation engine based on requirements', 'Dynamic pricing calculator with current component costs', 'Professional PDF quote generation', 'Self-service quote request portal for leads']
    }
  },
  {
    slug: 'customer-journey-analytics-dashboard',
    updates: {
      description: 'Build a comprehensive analytics platform that visualizes the entire lead-to-installation customer journey. Track conversion funnels, identify drop-off points, measure channel attribution, and provide actionable insights for optimization.',
      problem_statement: 'We have data in 5 different systems with no unified view of customer journey. Cannot answer basic questions like: Which marketing channel delivers best ROI? Where do leads drop off? What is our true cost per acquisition?',
      why_it_matters: 'Data-driven decision making is impossible without journey visibility. This dashboard will reveal optimization opportunities worth €50K+ annually in improved conversion rates and reduced wasted marketing spend.',
      deliverables: ['Unified customer journey visualization', 'Conversion funnel analysis by channel and segment', 'Drop-off point identification with root cause analysis', 'Marketing attribution modeling', 'Cohort analysis for LTV prediction', 'Real-time KPI dashboards for management']
    }
  },
  {
    slug: 'zoho-crm-enhancement',
    updates: {
      description: 'Optimize and extend our Zoho CRM configuration to support advanced automation workflows, custom fields for solar-specific data, and improved reporting. Create a single source of truth for all lead and customer data.',
      problem_statement: 'Zoho CRM is underutilized with only 30% of features configured. Custom fields are missing for key solar data (roof type, shading, existing systems). Workflows are basic and data quality is inconsistent.',
      why_it_matters: 'CRM is the foundation of all our operations. Proper configuration enables automation, improves data quality, and supports all other projects that depend on CRM data. This is a prerequisite for AI initiatives.',
      deliverables: ['Custom field architecture for solar industry needs', 'Automated workflow rules for lead lifecycle', 'Data validation and quality enforcement', 'Duplicate detection and merge workflows', 'Custom reports for sales and operations', 'Integration readiness for all planned systems']
    }
  },
  {
    slug: 'automated-follow-up-sequences',
    updates: {
      description: 'Implement intelligent, multi-channel follow-up sequences that automatically nurture leads based on their engagement and stage. Personalized messaging via WhatsApp, email, and SMS with AI-optimized timing and content.',
      problem_statement: 'Manual follow-ups are inconsistent - some leads get 10 touches, others get forgotten. SDRs decide timing based on gut feeling, missing optimal contact windows. No personalization beyond basic name insertion.',
      why_it_matters: 'Consistent, personalized follow-up is proven to increase conversion by 50%. Automation ensures no lead falls through cracks while freeing SDRs to focus on high-value conversations instead of routine touches.',
      deliverables: ['Multi-step nurture sequences for each lead stage', 'AI-optimized send time prediction', 'Personalization engine using lead data and behavior', 'A/B testing for message variants', 'Engagement tracking and sequence adjustment', 'SDR override and manual intervention points']
    }
  },
  {
    slug: 'installer-portal',
    updates: {
      description: 'Develop a self-service web portal where installers can manage their leads, update job status, access documentation, and communicate with Abeto. Reduces coordination overhead and provides installers with real-time visibility.',
      problem_statement: 'Installers currently receive leads via email and update status via phone calls or WhatsApp. This creates delays, lost messages, and requires significant Abeto staff time to coordinate. Installers complain about lack of visibility.',
      why_it_matters: 'A professional installer portal strengthens our installer relationships, reduces coordination overhead by 60%, improves data accuracy, and positions Abeto as a technology-forward partner installers want to work with.',
      deliverables: ['Installer dashboard with lead pipeline view', 'Lead acceptance and status update interface', 'Document library (contracts, technical specs, guides)', 'Communication hub with Abeto team', 'Performance metrics and earnings dashboard', 'Mobile-responsive design for field use']
    }
  },
  {
    slug: 'performance-analytics-platform',
    updates: {
      description: 'Create a comprehensive analytics platform for measuring SDR, installer, and marketing performance. Automated reporting, goal tracking, and benchmarking to drive continuous improvement across all teams.',
      problem_statement: 'Performance data is scattered across systems and compiled manually in spreadsheets. Weekly reports take 4 hours to create, are often outdated, and provide limited actionable insights. No benchmarking or trend analysis.',
      why_it_matters: 'What gets measured gets improved. Real-time performance visibility enables quick coaching interventions, healthy competition, and data-driven resource allocation. Expected 20% productivity improvement through better management.',
      deliverables: ['SDR performance dashboard (calls, conversions, speed)', 'Installer scorecard (close rate, time-to-install, satisfaction)', 'Marketing channel effectiveness reporting', 'Automated daily/weekly/monthly report generation', 'Goal setting and progress tracking', 'Leaderboards and gamification elements']
    }
  },
  {
    slug: 'document-processing-pipeline',
    updates: {
      description: 'Build an AI-powered document processing system that automatically extracts data from electricity bills, contracts, and property documents. OCR, classification, and structured data extraction with human-in-the-loop validation.',
      problem_statement: 'Processing customer documents (bills, contracts, IDs) is manual and error-prone. Each electricity bill takes 10 minutes to manually enter consumption data. Errors cause incorrect quotes and frustrated customers.',
      why_it_matters: 'Document processing is a bottleneck in the quote workflow. Automation reduces processing time by 90%, eliminates data entry errors, and enables instant quote generation - a key competitive advantage.',
      deliverables: ['Multi-format document OCR (PDF, images, scans)', 'Electricity bill parser extracting consumption patterns', 'Contract data extraction and validation', 'Confidence scoring with human review queue', 'Integration with quote generation system', 'Document archive with full-text search']
    }
  },
  {
    slug: 'real-time-data-sync-hub',
    updates: {
      description: 'Implement a central data synchronization layer that keeps Zoho CRM, WhatsApp, Aircall, and internal databases in real-time sync. Event-driven architecture ensuring all systems have consistent, up-to-date information.',
      problem_statement: 'Data inconsistencies between systems cause confusion and errors. Lead status in CRM does not match WhatsApp conversation history. SDRs waste time cross-referencing systems and sometimes work on already-converted leads.',
      why_it_matters: 'Data consistency is foundational for automation and AI. Every project depends on reliable, synchronized data. This hub eliminates the "source of truth" problem and enables confident decision-making.',
      deliverables: ['Event-driven sync architecture using webhooks', 'Bidirectional CRM-WhatsApp synchronization', 'Aircall call log integration with lead records', 'Conflict resolution rules and audit logging', 'Sync health monitoring dashboard', 'API gateway for all internal integrations']
    }
  },
  {
    slug: 'customer-self-service-portal',
    updates: {
      description: 'Launch a customer-facing portal where leads can track their solar project status, upload documents, view quotes, and communicate with their assigned contact. Reduces support inquiries and improves transparency.',
      problem_statement: 'Customers frequently call asking "What is the status of my quote?" or "Did you receive my documents?". These support calls consume SDR time and indicate poor communication. No self-service options exist.',
      why_it_matters: 'Self-service portals reduce support calls by 50%, improve customer satisfaction, and position Abeto as a professional, transparent company. Customers who can track progress are 40% less likely to abandon.',
      deliverables: ['Project status tracking with milestone visualization', 'Secure document upload interface', 'Quote viewing and comparison tools', 'Direct messaging with assigned SDR', 'FAQ and knowledge base', 'Mobile app for status notifications']
    }
  },
  {
    slug: 'marketing-automation-platform',
    updates: {
      description: 'Deploy a full marketing automation stack for lead generation campaigns, email marketing, landing page optimization, and conversion tracking. Integrated with CRM for closed-loop reporting.',
      problem_statement: 'Marketing campaigns run in isolation from sales data. No way to track which campaigns generate quality leads vs. tire-kickers. Landing pages are static and not optimized for conversion.',
      why_it_matters: 'Marketing spend optimization could save €3K/month while improving lead quality. Closed-loop reporting enables data-driven budget allocation and continuous campaign improvement.',
      deliverables: ['Marketing automation platform integration', 'Lead scoring based on marketing engagement', 'Landing page A/B testing framework', 'Email campaign automation and personalization', 'Campaign ROI tracking and attribution', 'Retargeting audience management']
    }
  },
  {
    slug: 'quality-assurance-framework',
    updates: {
      description: 'Establish a systematic quality assurance program for lead handling, including call quality scorecards, mystery shopping, compliance checks, and continuous improvement processes.',
      problem_statement: 'Quality is inconsistent and mostly reactive - we only know about problems when customers complain or leads are lost. No systematic quality monitoring or improvement process exists.',
      why_it_matters: 'Consistent quality differentiates Abeto from competitors and builds installer trust. QA framework enables early issue detection, targeted coaching, and continuous improvement culture.',
      deliverables: ['Call quality scorecard with weighted criteria', 'Automated compliance checking system', 'Mystery shopping program design', 'Quality trend dashboards', 'Calibration process for consistent scoring', 'Coaching recommendation engine']
    }
  },
  {
    slug: 'knowledge-management-system',
    updates: {
      description: 'Build a centralized knowledge base for SDRs containing product information, objection handling scripts, competitive intelligence, and best practices. AI-powered search and contextual suggestions.',
      problem_statement: 'Knowledge is trapped in individual heads and scattered documents. New SDRs struggle to find information. The same questions are answered repeatedly. Best practices are not documented or shared.',
      why_it_matters: 'Accessible knowledge accelerates onboarding, improves response quality, and ensures consistency. AI-powered retrieval means SDRs get instant answers during live conversations.',
      deliverables: ['Structured knowledge base with categories and tags', 'AI-powered semantic search', 'Contextual suggestions during calls', 'Version control and update workflows', 'Usage analytics to identify gaps', 'Contribution and feedback mechanisms']
    }
  },
  {
    slug: 'inventory-and-availability-tracker',
    updates: {
      description: 'Track solar equipment availability, pricing, and delivery times across suppliers. Ensure quotes include available equipment with accurate lead times and pricing.',
      problem_statement: 'Equipment availability changes frequently but quotes use static assumptions. Sometimes we quote unavailable panels, causing delays and customer frustration. No visibility into supplier stock levels.',
      why_it_matters: 'Accurate availability data prevents promise-delivery gaps that damage customer relationships. Real-time pricing ensures profitable quotes. This is essential for scaling quote automation.',
      deliverables: ['Supplier inventory integration API', 'Real-time availability dashboard', 'Price tracking and alert system', 'Quote system integration for live pricing', 'Delivery time estimation engine', 'Alternative equipment recommendations']
    }
  },
  {
    slug: 'installer-certification-program',
    updates: {
      description: 'Develop an online training and certification program for installers joining the Abeto network. Ensures quality standards, teaches Abeto processes, and creates a tiered installer network.',
      problem_statement: 'New installers join without understanding Abeto processes and quality expectations. This leads to inconsistent customer experience and support overhead. No formal vetting or training process.',
      why_it_matters: 'Certified installers deliver better customer experience and require less coordination. Certification creates a quality moat and enables premium pricing for certified installer services.',
      deliverables: ['Online training curriculum with video modules', 'Certification exam and scoring system', 'Installer tier system (Bronze, Silver, Gold)', 'Continuing education requirements', 'Badge and certificate generation', 'Integration with installer portal']
    }
  },
  {
    slug: 'predictive-maintenance-alerts',
    updates: {
      description: 'Implement a system to monitor installed solar systems and alert customers and installers about maintenance needs before problems occur. Extends customer relationship beyond installation.',
      problem_statement: 'After installation, we lose touch with customers. We have no way to know if systems are performing well or need maintenance. This is a missed opportunity for ongoing relationship and referrals.',
      why_it_matters: 'Post-installation engagement generates referrals (worth €200 each) and maintenance revenue for installers. Proactive alerts prevent customer dissatisfaction and build long-term loyalty.',
      deliverables: ['System performance monitoring integration', 'Anomaly detection algorithms', 'Automated maintenance alerts', 'Customer notification system', 'Installer work order generation', 'Performance reporting dashboard']
    }
  },
  {
    slug: 'financial-integration-hub',
    updates: {
      description: 'Connect financial systems (Holded) with operational data for automated invoicing, commission tracking, and financial reporting. Eliminate manual reconciliation and provide real-time financial visibility.',
      problem_statement: 'Finance team spends 3 days/month reconciling spreadsheets. Invoice generation is manual and error-prone. Commission calculations require cross-referencing multiple systems.',
      why_it_matters: 'Financial automation saves 40 hours/month in manual work, eliminates errors, and provides real-time cash flow visibility. Essential for scaling without proportionally scaling finance headcount.',
      deliverables: ['Holded API integration for invoicing', 'Automated installer commission calculations', 'Revenue recognition automation', 'Financial reporting dashboards', 'Cash flow forecasting', 'Audit trail for all financial transactions']
    }
  },
  {
    slug: 'multi-region-expansion-framework',
    updates: {
      description: 'Prepare systems and processes for expansion beyond Spain. Multi-language support, region-specific configurations, and scalable architecture for international growth.',
      problem_statement: 'All systems are hardcoded for Spain. Expanding to Portugal or other markets would require significant rework. No framework for managing regional differences in regulations, pricing, or processes.',
      why_it_matters: 'Geographic expansion is a key growth strategy. Building multi-region capability now prevents costly rewrites later and reduces time-to-market for new regions from 6 months to 6 weeks.',
      deliverables: ['Multi-language support architecture', 'Regional configuration framework', 'Currency and tax handling', 'Local compliance rule engine', 'Market-specific workflow templates', 'Centralized vs. decentralized operations design']
    }
  },
  {
    slug: 'api-platform-for-partners',
    updates: {
      description: 'Build a partner API platform enabling third-party integrations, white-label solutions, and ecosystem growth. Documentation, developer portal, and self-service onboarding.',
      problem_statement: 'Partners who want to integrate with Abeto require custom development for each case. No standard APIs, documentation, or partner program exists. Limits ecosystem growth.',
      why_it_matters: 'API platform enables scalable partner growth without proportional engineering investment. Opens new revenue streams through white-label services and creates competitive moats.',
      deliverables: ['RESTful API layer with authentication', 'Developer portal with documentation', 'Sandbox environment for testing', 'Webhook notifications for events', 'Rate limiting and usage analytics', 'Partner onboarding automation']
    }
  },
  {
    slug: 'competitive-intelligence-system',
    updates: {
      description: 'Systematically track competitor activities, pricing, and positioning. Automated monitoring of competitor websites, review sites, and market trends with regular intelligence reports.',
      problem_statement: 'Competitive knowledge is anecdotal and outdated. We do not know competitor pricing changes until customers tell us. No systematic way to track market movements.',
      why_it_matters: 'Real-time competitive intelligence enables faster pricing responses, better positioning, and identification of market opportunities. Critical for maintaining competitive advantage.',
      deliverables: ['Competitor website monitoring automation', 'Pricing intelligence database', 'Review site aggregation and analysis', 'Market share estimation model', 'Monthly competitive intelligence reports', 'Sales team competitive alerts']
    }
  },
  {
    slug: 'sustainability-impact-dashboard',
    updates: {
      description: 'Calculate and display the environmental impact of solar installations facilitated by Abeto. CO2 savings, renewable energy generation, and tree equivalent metrics for marketing and reporting.',
      problem_statement: 'We cannot quantify our environmental impact beyond installation count. Missing an opportunity to differentiate on sustainability messaging and attract eco-conscious customers.',
      why_it_matters: 'Environmental impact metrics are powerful marketing tools and increasingly required for corporate reporting. Differentiates Abeto as a purpose-driven company.',
      deliverables: ['CO2 savings calculator per installation', 'Cumulative impact tracking and visualization', 'Customer-facing impact certificates', 'Annual sustainability report automation', 'Marketing asset generation', 'API for impact data access']
    }
  },
  {
    slug: 'advanced-reporting-suite',
    updates: {
      description: 'Comprehensive business intelligence platform with customizable dashboards, automated reports, and ad-hoc query capabilities. Enables data-driven decision making across all departments.',
      problem_statement: 'Reports are created manually in spreadsheets, taking significant time and prone to errors. Managers cannot self-serve data questions. No unified view of business health.',
      why_it_matters: 'Business intelligence is essential for scaling. Automated reporting saves 20+ hours/week and enables faster, better decisions. Foundation for data-driven culture.',
      deliverables: ['Executive dashboard with key metrics', 'Department-specific operational dashboards', 'Automated report scheduling and distribution', 'Self-service query interface', 'Data visualization library', 'Mobile dashboard access']
    }
  },
  {
    slug: 'chatbot-training-pipeline',
    updates: {
      description: 'Build infrastructure for continuous chatbot improvement through conversation analysis, feedback loops, and systematic prompt engineering. Ensures chatbot quality improves over time.',
      problem_statement: 'Once deployed, chatbots degrade without continuous improvement. We have no systematic way to identify poor responses, gather feedback, or improve prompts based on outcomes.',
      why_it_matters: 'Chatbot quality directly impacts lead conversion. Continuous improvement infrastructure ensures ROI grows over time instead of degrading. Differentiates from static chatbot deployments.',
      deliverables: ['Conversation analytics and tagging system', 'Quality scoring for chatbot responses', 'Feedback collection interface for SDRs', 'Prompt version control and A/B testing', 'Improvement prioritization dashboard', 'Automated regression testing']
    }
  },
  {
    slug: 'mobile-sdr-application',
    updates: {
      description: 'Native mobile app for SDRs enabling full functionality on-the-go. Lead management, calling, WhatsApp integration, and AI copilot features optimized for mobile workflows.',
      problem_statement: 'SDRs are desk-bound due to web-only tools. Cannot effectively work during commutes, at events, or during off-site meetings. Mobile web experience is poor.',
      why_it_matters: 'Mobile capability increases SDR flexibility and utilization. Enables new use cases like event lead capture and outdoor follow-ups. Attractive for recruiting modern sales talent.',
      deliverables: ['iOS and Android native applications', 'Offline capability for core functions', 'Push notifications for high-priority leads', 'Voice and WhatsApp integration', 'Quick-action widgets for common tasks', 'Biometric security and device management']
    }
  },
  {
    slug: 'customer-feedback-system',
    updates: {
      description: 'Implement systematic collection and analysis of customer feedback throughout the journey. NPS surveys, review solicitation, and feedback-to-action workflows.',
      problem_statement: 'We do not systematically collect customer feedback. Reviews on Google are random. No way to measure or improve customer satisfaction. Missing early warning signs of issues.',
      why_it_matters: 'Customer feedback is essential for continuous improvement and generates social proof for marketing. NPS tracking enables benchmarking and improvement over time.',
      deliverables: ['Automated NPS survey at key touchpoints', 'Review solicitation workflow for happy customers', 'Negative feedback escalation system', 'Feedback analytics dashboard', 'Integration with quality assurance framework', 'Customer satisfaction trend reporting']
    }
  }
];

async function updateProjects() {
  console.log('Starting project updates...\n');
  let successCount = 0;
  let errorCount = 0;

  for (const project of projectUpdates) {
    try {
      // First get the project ID by slug
      const { data: existingProject, error: fetchError } = await supabase
        .from('projects')
        .select('id, title')
        .eq('slug', project.slug)
        .single();

      if (fetchError) {
        console.log(`⚠️  Project not found: ${project.slug}`);
        continue;
      }

      // Update the project
      const { error: updateError } = await supabase
        .from('projects')
        .update(project.updates)
        .eq('id', existingProject.id);

      if (updateError) {
        console.log(`❌ Error updating ${project.slug}: ${updateError.message}`);
        errorCount++;
      } else {
        console.log(`✅ Updated: ${existingProject.title}`);
        successCount++;
      }
    } catch (err) {
      console.log(`❌ Exception for ${project.slug}: ${err.message}`);
      errorCount++;
    }
  }

  console.log(`\nProject updates complete: ${successCount} succeeded, ${errorCount} failed\n`);
  return successCount;
}

async function updateTasks() {
  console.log('Starting task updates...\n');

  // Get all tasks with their project info
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('id, title, project_id, projects(slug)')
    .order('project_id');

  if (error) {
    console.log('Error fetching tasks:', error.message);
    return 0;
  }

  let successCount = 0;
  let errorCount = 0;

  // Group tasks by project for smarter updates
  const tasksByProject = {};
  for (const task of tasks) {
    const projectSlug = task.projects?.slug || 'unknown';
    if (!tasksByProject[projectSlug]) {
      tasksByProject[projectSlug] = [];
    }
    tasksByProject[projectSlug].push(task);
  }

  // Update tasks with improved descriptions based on title patterns
  for (const task of tasks) {
    const updates = getTaskImprovements(task.title, task.projects?.slug);

    if (updates && Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', task.id);

      if (updateError) {
        console.log(`❌ Error updating task "${task.title}": ${updateError.message}`);
        errorCount++;
      } else {
        console.log(`✅ Updated task: ${task.title.substring(0, 50)}...`);
        successCount++;
      }
    }
  }

  console.log(`\nTask updates complete: ${successCount} succeeded, ${errorCount} failed\n`);
  return successCount;
}

function getTaskImprovements(title, projectSlug) {
  const titleLower = title.toLowerCase();

  // Pattern-based improvements
  if (titleLower.includes('design') && titleLower.includes('architecture')) {
    return {
      description: `Design and document the complete system architecture. Define component boundaries, data flows, integration points, and scalability considerations. Include security requirements and deployment topology.`,
      acceptance_criteria: ['Architecture diagram with all components', 'Data flow documentation', 'API specifications drafted', 'Security considerations documented', 'Deployment topology defined', 'Review completed by technical lead']
    };
  }

  if (titleLower.includes('api') && titleLower.includes('integration')) {
    return {
      description: `Implement API integration with proper authentication, error handling, rate limiting, and monitoring. Include comprehensive logging and graceful degradation for API failures.`,
      acceptance_criteria: ['API connection established and tested', 'Authentication working correctly', 'Error handling implemented', 'Rate limiting respected', 'Monitoring and alerts configured', 'Integration tests passing']
    };
  }

  if (titleLower.includes('dashboard')) {
    return {
      description: `Build an interactive dashboard with real-time data visualization, filtering capabilities, and responsive design. Optimize for fast loading and intuitive user experience.`,
      acceptance_criteria: ['All required metrics displayed', 'Real-time updates working', 'Filters function correctly', 'Mobile responsive design', 'Page load under 2 seconds', 'User testing feedback positive']
    };
  }

  if (titleLower.includes('database') || titleLower.includes('schema')) {
    return {
      description: `Design and implement database schema with proper indexing, constraints, and relationships. Plan for data growth and query performance. Include migration scripts and rollback procedures.`,
      acceptance_criteria: ['Schema supports all use cases', 'Indexes optimized for queries', 'Constraints enforce data integrity', 'Migration scripts tested', 'Rollback procedure documented', 'Performance benchmarks met']
    };
  }

  if (titleLower.includes('test')) {
    return {
      description: `Implement comprehensive test coverage including unit tests, integration tests, and end-to-end tests. Ensure tests are maintainable, fast, and provide good coverage of critical paths.`,
      acceptance_criteria: ['Unit test coverage > 80%', 'Integration tests for key flows', 'E2E tests for critical paths', 'Tests run in under 5 minutes', 'CI/CD pipeline integration', 'Test documentation complete']
    };
  }

  if (titleLower.includes('deploy') || titleLower.includes('release')) {
    return {
      description: `Prepare and execute deployment with proper staging validation, monitoring setup, and rollback plan. Coordinate with stakeholders and document deployment procedures.`,
      acceptance_criteria: ['Staging deployment successful', 'Monitoring configured', 'Rollback plan tested', 'Stakeholders notified', 'Production deployment completed', 'Post-deployment verification passed']
    };
  }

  if (titleLower.includes('document') || titleLower.includes('documentation')) {
    return {
      description: `Create comprehensive documentation including user guides, API references, and troubleshooting guides. Ensure documentation is accurate, up-to-date, and accessible.`,
      acceptance_criteria: ['User guide completed', 'API documentation updated', 'Examples and tutorials included', 'Troubleshooting section added', 'Review by target audience', 'Published to documentation site']
    };
  }

  if (titleLower.includes('security') || titleLower.includes('auth')) {
    return {
      description: `Implement security controls including authentication, authorization, input validation, and encryption. Follow security best practices and conduct security review.`,
      acceptance_criteria: ['Authentication implemented correctly', 'Authorization rules enforced', 'Input validation complete', 'Sensitive data encrypted', 'Security review passed', 'Penetration testing completed']
    };
  }

  if (titleLower.includes('performance') || titleLower.includes('optimize')) {
    return {
      description: `Analyze and optimize performance by identifying bottlenecks, implementing caching strategies, and optimizing queries. Measure improvements with before/after benchmarks.`,
      acceptance_criteria: ['Baseline metrics recorded', 'Bottlenecks identified', 'Optimizations implemented', 'Cache strategy effective', 'Performance targets met', 'Monitoring for regression']
    };
  }

  if (titleLower.includes('ui') || titleLower.includes('interface') || titleLower.includes('frontend')) {
    return {
      description: `Build user interface with focus on usability, accessibility, and responsive design. Implement with modern frontend practices and ensure cross-browser compatibility.`,
      acceptance_criteria: ['UI matches design specifications', 'Accessible (WCAG 2.1 AA)', 'Responsive across devices', 'Cross-browser tested', 'User testing completed', 'Performance optimized']
    };
  }

  if (titleLower.includes('email') || titleLower.includes('notification')) {
    return {
      description: `Implement notification system with email, push, and in-app notifications. Include user preferences, delivery tracking, and unsubscribe management.`,
      acceptance_criteria: ['All notification types working', 'User preferences respected', 'Delivery tracking implemented', 'Unsubscribe flow working', 'Email deliverability tested', 'Templates approved']
    };
  }

  if (titleLower.includes('report')) {
    return {
      description: `Build reporting functionality with data aggregation, visualization, and export capabilities. Support scheduling, filtering, and multiple output formats.`,
      acceptance_criteria: ['Report data accurate', 'Visualizations clear', 'Export formats working', 'Scheduling functional', 'Filters work correctly', 'Performance acceptable']
    };
  }

  if (titleLower.includes('workflow') || titleLower.includes('automation')) {
    return {
      description: `Design and implement automated workflow with trigger conditions, actions, and exception handling. Include logging, monitoring, and manual override capabilities.`,
      acceptance_criteria: ['Triggers fire correctly', 'Actions execute reliably', 'Exception handling works', 'Logging comprehensive', 'Manual override available', 'Monitoring in place']
    };
  }

  if (titleLower.includes('search')) {
    return {
      description: `Implement search functionality with full-text search, filtering, faceting, and relevance ranking. Optimize for speed and user experience.`,
      acceptance_criteria: ['Search returns relevant results', 'Filters work correctly', 'Response time under 500ms', 'Typo tolerance implemented', 'Facets accurate', 'Mobile-friendly interface']
    };
  }

  if (titleLower.includes('sync') || titleLower.includes('integration')) {
    return {
      description: `Build data synchronization between systems with conflict resolution, retry logic, and monitoring. Ensure data consistency and handle edge cases gracefully.`,
      acceptance_criteria: ['Sync completes reliably', 'Conflicts resolved correctly', 'Retry logic works', 'Monitoring alerts configured', 'Data consistency verified', 'Edge cases handled']
    };
  }

  // Default improvement for any task without specific pattern
  return {
    acceptance_criteria: ['Requirements met', 'Code reviewed', 'Tests passing', 'Documentation updated', 'Stakeholder approval obtained']
  };
}

async function main() {
  console.log('='.repeat(60));
  console.log('ABETO CONTENT IMPROVEMENT SCRIPT');
  console.log('='.repeat(60));
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log('');

  const projectsUpdated = await updateProjects();
  const tasksUpdated = await updateTasks();

  console.log('='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Projects updated: ${projectsUpdated}`);
  console.log(`Tasks updated: ${tasksUpdated}`);
  console.log('');
  console.log('Done!');
}

main().catch(console.error);
