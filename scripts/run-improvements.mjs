/**
 * Script to update project and task content in Supabase
 * Run with: node scripts/run-improvements.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Parse .env.local manually
const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex > 0) {
      const key = trimmed.substring(0, eqIndex);
      let value = trimmed.substring(eqIndex + 1);
      // Remove quotes and \n
      value = value.replace(/^["']|["']$/g, '').replace(/\\n$/, '').trim();
      env[key] = value;
    }
  }
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY from .env.local');
  process.exit(1);
}

console.log('Supabase URL:', SUPABASE_URL);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// First, let's fetch all actual project slugs from the database
async function getProjectSlugs() {
  const { data, error } = await supabase
    .from('projects')
    .select('id, slug, title');

  if (error) {
    console.error('Error fetching projects:', error.message);
    return [];
  }

  console.log(`\nFound ${data.length} projects in database:\n`);
  data.forEach(p => console.log(`  - ${p.slug}: ${p.title}`));
  console.log('');

  return data;
}

// Create improvements based on actual project data
function createProjectImprovements(projects) {
  const improvements = [];

  for (const project of projects) {
    const slug = project.slug;
    const title = project.title?.toLowerCase() || '';

    let update = { id: project.id };

    // Match by keywords in title
    if (title.includes('chatbot') || title.includes('omnichannel')) {
      update = {
        ...update,
        description: 'Build an AI-powered omnichannel communication platform that unifies WhatsApp, voice calls, and web chat into a single intelligent system. The platform will leverage GPT-4 for natural conversations, provide real-time lead qualification, and enable SDRs to manage all interactions from one dashboard with AI-suggested responses and automatic lead scoring.',
        problem_statement: 'SDRs currently juggle 4-5 different tools to manage conversations. WhatsApp messages in Woztell, calls in Aircall, CRM data in Zoho - leading to missed follow-ups, inconsistent responses, and no unified customer history. Average response time is 47 minutes, causing 23% lead abandonment.',
        why_it_matters: 'This is the backbone of our lead nurturing strategy. By unifying all communication channels with AI assistance, we can reduce response time from 47 min to under 5 min, increase lead conversion by 35%, and enable each SDR to handle 3x more conversations without quality degradation.',
        deliverables: ['Omnichannel chatbot platform with WhatsApp, voice, and web integration', 'Real-time AI-powered response suggestions for SDRs', 'Automatic lead scoring and qualification engine', 'Unified conversation history dashboard', 'Voice call transcription and sentiment analysis', 'Integration with Zoho CRM for automatic lead updates']
      };
    } else if (title.includes('copilot') || title.includes('sdr') && title.includes('ai')) {
      update = {
        ...update,
        description: 'Create an intelligent assistant interface that sits alongside the SDR workflow, providing real-time coaching, conversation summaries, next-best-action recommendations, and automatic data entry. The copilot learns from successful conversions to continuously improve suggestions.',
        problem_statement: 'SDRs spend 40% of their time on administrative tasks - updating CRM records, writing follow-up summaries, researching leads. New SDRs take 3 months to reach full productivity and top performers have tacit knowledge that is not transferred to the team.',
        why_it_matters: 'By automating administrative burden and encoding best practices into AI suggestions, we can reclaim 15+ hours per SDR per week, reduce new hire ramp-up from 3 months to 3 weeks, and improve overall conversion rates by leveraging patterns from our best performers.',
        deliverables: ['Real-time AI coaching sidebar during calls', 'Automatic conversation summarization and CRM updates', 'Next-best-action recommendations based on lead signals', 'Knowledge base integration for instant information retrieval', 'Performance analytics comparing AI suggestions vs outcomes']
      };
    } else if (title.includes('whatsapp')) {
      update = {
        ...update,
        description: 'Implement native WhatsApp Business API integration replacing the current Woztell middleware. This provides direct access to all WhatsApp features, lower costs per message, template message management, and the foundation for chatbot automation.',
        problem_statement: 'Woztell adds €0.03 per message overhead and limits access to advanced WhatsApp features. We cannot send proactive template messages at scale, have no read receipts integration, and experience 4-6 hour delays during peak times.',
        why_it_matters: 'WhatsApp is our #1 lead communication channel with 78% of conversations happening there. Direct API integration saves €2,400/month in messaging fees, enables proactive outreach campaigns, and provides the technical foundation for chatbot automation.',
        deliverables: ['Direct WhatsApp Business API connection via Meta Cloud API', 'Template message management and approval workflow', 'Webhook handlers for real-time message delivery status', 'Media message support (images, documents, location)', 'Message analytics and delivery reporting']
      };
    } else if (title.includes('voice') || title.includes('call') && title.includes('intelligence')) {
      update = {
        ...update,
        description: 'Deploy AI-powered voice call analysis that transcribes all Aircall conversations in real-time, extracts key information, identifies customer sentiment, and provides actionable insights. Includes automatic call outcome classification and quality scoring.',
        problem_statement: 'We make 200+ calls daily but have no systematic way to learn from them. Managers can only review 5% of calls manually, leaving 95% as black boxes. Successful techniques are not identified and spread.',
        why_it_matters: 'Voice calls convert 3x better than text but are currently our least understood channel. AI analysis enables 100% call review, identifies winning patterns from top performers, and catches issues in real-time.',
        deliverables: ['Real-time call transcription via Aircall API and Whisper', 'Sentiment analysis throughout call duration', 'Automatic extraction of key entities', 'Call quality scoring algorithm', 'Searchable call library with AI-generated summaries']
      };
    } else if (title.includes('lead scoring') || title.includes('scoring')) {
      update = {
        ...update,
        description: 'Build a machine learning model that predicts lead quality and conversion probability based on demographic data, behavioral signals, engagement patterns, and installer availability. The model continuously learns from outcomes to improve accuracy.',
        problem_statement: 'All leads currently receive equal treatment regardless of conversion likelihood. SDRs waste time on low-quality leads while hot prospects wait. We have no data-driven way to prioritize the 150+ new leads we receive daily.',
        why_it_matters: 'Intelligent lead scoring ensures our limited SDR capacity focuses on highest-potential opportunities. Expected outcomes: 40% increase in qualified lead throughput, 25% improvement in SDR productivity.',
        deliverables: ['ML model trained on 18 months of conversion data', 'Real-time scoring API integrated with Zoho CRM', 'Score explanation dashboard', 'Lead prioritization queue for SDRs', 'A/B testing framework']
      };
    } else if (title.includes('installer') && title.includes('match')) {
      update = {
        ...update,
        description: 'Develop an intelligent matching system that pairs leads with the optimal installer based on location, capacity, specialization, customer preferences, and historical performance. Includes real-time availability tracking and automatic workload balancing.',
        problem_statement: 'Installer assignment is currently manual and based on basic zip code rules. We have no visibility into installer capacity, leading to 35% of assignments requiring reassignment.',
        why_it_matters: 'Optimal matching increases installation success rate from 68% to expected 85%, improves installer satisfaction, and reduces time-to-installation by 2 weeks.',
        deliverables: ['Multi-factor matching algorithm', 'Real-time installer availability calendar integration', 'Automatic workload balancing', 'Match quality scoring and feedback loop']
      };
    } else if (title.includes('quote') || title.includes('generation')) {
      update = {
        ...update,
        description: 'Automate the solar installation quote generation process by integrating satellite imagery analysis, electricity bill parsing, and equipment pricing. Generate accurate, professional quotes in under 5 minutes instead of the current 48-hour manual process.',
        problem_statement: 'Quote generation requires manual roof analysis, electricity consumption calculation, and equipment specification. Each quote takes 2-3 hours of engineer time. Customers wait 48+ hours for quotes, during which 30% lose interest.',
        why_it_matters: 'Speed-to-quote is the #1 factor in solar lead conversion. Reducing quote time from 48h to 5 minutes will capture leads while interest is hot.',
        deliverables: ['Satellite roof analysis for panel placement', 'Electricity bill OCR and consumption analysis', 'Equipment recommendation engine', 'Dynamic pricing calculator', 'Professional PDF quote generation']
      };
    } else if (title.includes('journey') || title.includes('analytics')) {
      update = {
        ...update,
        description: 'Build a comprehensive analytics platform that visualizes the entire lead-to-installation customer journey. Track conversion funnels, identify drop-off points, measure channel attribution, and provide actionable insights.',
        problem_statement: 'We have data in 5 different systems with no unified view of customer journey. Cannot answer basic questions like: Which marketing channel delivers best ROI? Where do leads drop off?',
        why_it_matters: 'Data-driven decision making is impossible without journey visibility. This dashboard will reveal optimization opportunities worth €50K+ annually.',
        deliverables: ['Unified customer journey visualization', 'Conversion funnel analysis by channel', 'Drop-off point identification', 'Marketing attribution modeling', 'Real-time KPI dashboards']
      };
    } else if (title.includes('zoho') || title.includes('crm')) {
      update = {
        ...update,
        description: 'Optimize and extend our Zoho CRM configuration to support advanced automation workflows, custom fields for solar-specific data, and improved reporting. Create a single source of truth for all lead and customer data.',
        problem_statement: 'Zoho CRM is underutilized with only 30% of features configured. Custom fields are missing for key solar data. Workflows are basic and data quality is inconsistent.',
        why_it_matters: 'CRM is the foundation of all our operations. Proper configuration enables automation, improves data quality, and supports all other projects.',
        deliverables: ['Custom field architecture for solar industry', 'Automated workflow rules for lead lifecycle', 'Data validation and quality enforcement', 'Custom reports for sales and operations']
      };
    } else if (title.includes('follow-up') || title.includes('sequence')) {
      update = {
        ...update,
        description: 'Implement intelligent, multi-channel follow-up sequences that automatically nurture leads based on their engagement and stage. Personalized messaging via WhatsApp, email, and SMS with AI-optimized timing.',
        problem_statement: 'Manual follow-ups are inconsistent - some leads get 10 touches, others get forgotten. SDRs decide timing based on gut feeling, missing optimal contact windows.',
        why_it_matters: 'Consistent, personalized follow-up is proven to increase conversion by 50%. Automation ensures no lead falls through cracks.',
        deliverables: ['Multi-step nurture sequences for each lead stage', 'AI-optimized send time prediction', 'Personalization engine', 'A/B testing for message variants']
      };
    } else if (title.includes('installer') && title.includes('portal')) {
      update = {
        ...update,
        description: 'Develop a self-service web portal where installers can manage their leads, update job status, access documentation, and communicate with Abeto. Reduces coordination overhead and provides installers with real-time visibility.',
        problem_statement: 'Installers currently receive leads via email and update status via phone calls or WhatsApp. This creates delays, lost messages, and requires significant staff time to coordinate.',
        why_it_matters: 'A professional installer portal strengthens relationships, reduces coordination overhead by 60%, and improves data accuracy.',
        deliverables: ['Installer dashboard with lead pipeline view', 'Lead acceptance and status update interface', 'Document library', 'Performance metrics and earnings dashboard']
      };
    } else if (title.includes('performance') && !title.includes('maintenance')) {
      update = {
        ...update,
        description: 'Create a comprehensive analytics platform for measuring SDR, installer, and marketing performance. Automated reporting, goal tracking, and benchmarking to drive continuous improvement.',
        problem_statement: 'Performance data is scattered across systems and compiled manually in spreadsheets. Weekly reports take 4 hours to create and are often outdated.',
        why_it_matters: 'What gets measured gets improved. Real-time performance visibility enables quick coaching interventions and data-driven resource allocation.',
        deliverables: ['SDR performance dashboard', 'Installer scorecard', 'Marketing channel effectiveness reporting', 'Automated report generation', 'Goal setting and progress tracking']
      };
    } else if (title.includes('document') && title.includes('process')) {
      update = {
        ...update,
        description: 'Build an AI-powered document processing system that automatically extracts data from electricity bills, contracts, and property documents. OCR, classification, and structured data extraction with human-in-the-loop validation.',
        problem_statement: 'Processing customer documents is manual and error-prone. Each electricity bill takes 10 minutes to manually enter. Errors cause incorrect quotes and frustrated customers.',
        why_it_matters: 'Document processing is a bottleneck in the quote workflow. Automation reduces processing time by 90% and eliminates data entry errors.',
        deliverables: ['Multi-format document OCR', 'Electricity bill parser', 'Contract data extraction', 'Confidence scoring with human review queue']
      };
    } else if (title.includes('sync') || title.includes('data hub')) {
      update = {
        ...update,
        description: 'Implement a central data synchronization layer that keeps Zoho CRM, WhatsApp, Aircall, and internal databases in real-time sync. Event-driven architecture ensuring all systems have consistent, up-to-date information.',
        problem_statement: 'Data inconsistencies between systems cause confusion and errors. Lead status in CRM does not match WhatsApp conversation history. SDRs waste time cross-referencing systems.',
        why_it_matters: 'Data consistency is foundational for automation and AI. Every project depends on reliable, synchronized data.',
        deliverables: ['Event-driven sync architecture', 'Bidirectional CRM-WhatsApp synchronization', 'Aircall call log integration', 'Sync health monitoring dashboard']
      };
    } else if (title.includes('customer') && title.includes('portal')) {
      update = {
        ...update,
        description: 'Launch a customer-facing portal where leads can track their solar project status, upload documents, view quotes, and communicate with their assigned contact. Reduces support inquiries and improves transparency.',
        problem_statement: 'Customers frequently call asking "What is the status of my quote?" These support calls consume SDR time. No self-service options exist.',
        why_it_matters: 'Self-service portals reduce support calls by 50%, improve customer satisfaction, and position Abeto as a professional company.',
        deliverables: ['Project status tracking with milestone visualization', 'Secure document upload interface', 'Quote viewing tools', 'Direct messaging with assigned SDR']
      };
    } else if (title.includes('marketing') && title.includes('automation')) {
      update = {
        ...update,
        description: 'Deploy a full marketing automation stack for lead generation campaigns, email marketing, landing page optimization, and conversion tracking. Integrated with CRM for closed-loop reporting.',
        problem_statement: 'Marketing campaigns run in isolation from sales data. No way to track which campaigns generate quality leads vs. tire-kickers.',
        why_it_matters: 'Marketing spend optimization could save €3K/month while improving lead quality. Closed-loop reporting enables data-driven budget allocation.',
        deliverables: ['Marketing automation platform integration', 'Lead scoring based on engagement', 'Landing page A/B testing', 'Campaign ROI tracking']
      };
    } else if (title.includes('quality') || title.includes('qa')) {
      update = {
        ...update,
        description: 'Establish a systematic quality assurance program for lead handling, including call quality scorecards, mystery shopping, compliance checks, and continuous improvement processes.',
        problem_statement: 'Quality is inconsistent and mostly reactive - we only know about problems when customers complain or leads are lost.',
        why_it_matters: 'Consistent quality differentiates Abeto from competitors. QA framework enables early issue detection and targeted coaching.',
        deliverables: ['Call quality scorecard with weighted criteria', 'Automated compliance checking', 'Mystery shopping program', 'Quality trend dashboards']
      };
    } else if (title.includes('knowledge') && title.includes('management')) {
      update = {
        ...update,
        description: 'Build a centralized knowledge base for SDRs containing product information, objection handling scripts, competitive intelligence, and best practices. AI-powered search and contextual suggestions.',
        problem_statement: 'Knowledge is trapped in individual heads and scattered documents. New SDRs struggle to find information. Best practices are not shared.',
        why_it_matters: 'Accessible knowledge accelerates onboarding, improves response quality, and ensures consistency.',
        deliverables: ['Structured knowledge base', 'AI-powered semantic search', 'Contextual suggestions during calls', 'Version control and update workflows']
      };
    } else if (title.includes('inventory') || title.includes('availability')) {
      update = {
        ...update,
        description: 'Track solar equipment availability, pricing, and delivery times across suppliers. Ensure quotes include available equipment with accurate lead times and pricing.',
        problem_statement: 'Equipment availability changes frequently but quotes use static assumptions. Sometimes we quote unavailable panels, causing delays.',
        why_it_matters: 'Accurate availability data prevents promise-delivery gaps. Real-time pricing ensures profitable quotes.',
        deliverables: ['Supplier inventory integration API', 'Real-time availability dashboard', 'Price tracking and alert system', 'Quote system integration']
      };
    } else if (title.includes('certification') || title.includes('training')) {
      update = {
        ...update,
        description: 'Develop an online training and certification program for installers joining the Abeto network. Ensures quality standards, teaches processes, and creates a tiered installer network.',
        problem_statement: 'New installers join without understanding Abeto processes and quality expectations. This leads to inconsistent customer experience.',
        why_it_matters: 'Certified installers deliver better customer experience and require less coordination.',
        deliverables: ['Online training curriculum', 'Certification exam system', 'Installer tier system (Bronze, Silver, Gold)', 'Badge and certificate generation']
      };
    } else if (title.includes('maintenance') || title.includes('predictive')) {
      update = {
        ...update,
        description: 'Implement a system to monitor installed solar systems and alert customers and installers about maintenance needs before problems occur. Extends customer relationship beyond installation.',
        problem_statement: 'After installation, we lose touch with customers. We have no way to know if systems need maintenance.',
        why_it_matters: 'Post-installation engagement generates referrals (worth €200 each) and maintenance revenue.',
        deliverables: ['System performance monitoring', 'Anomaly detection algorithms', 'Automated maintenance alerts', 'Customer notification system']
      };
    } else if (title.includes('financial') || title.includes('holded')) {
      update = {
        ...update,
        description: 'Connect financial systems (Holded) with operational data for automated invoicing, commission tracking, and financial reporting. Eliminate manual reconciliation.',
        problem_statement: 'Finance team spends 3 days/month reconciling spreadsheets. Invoice generation is manual and error-prone.',
        why_it_matters: 'Financial automation saves 40 hours/month in manual work, eliminates errors, and provides real-time cash flow visibility.',
        deliverables: ['Holded API integration for invoicing', 'Automated installer commission calculations', 'Financial reporting dashboards', 'Cash flow forecasting']
      };
    } else if (title.includes('expansion') || title.includes('multi-region')) {
      update = {
        ...update,
        description: 'Prepare systems and processes for expansion beyond Spain. Multi-language support, region-specific configurations, and scalable architecture.',
        problem_statement: 'All systems are hardcoded for Spain. Expanding to Portugal would require significant rework.',
        why_it_matters: 'Geographic expansion is a key growth strategy. Building multi-region capability now prevents costly rewrites later.',
        deliverables: ['Multi-language support architecture', 'Regional configuration framework', 'Currency and tax handling', 'Local compliance rule engine']
      };
    } else if (title.includes('api') && title.includes('partner')) {
      update = {
        ...update,
        description: 'Build a partner API platform enabling third-party integrations, white-label solutions, and ecosystem growth. Documentation, developer portal, and self-service onboarding.',
        problem_statement: 'Partners who want to integrate with Abeto require custom development for each case. No standard APIs or documentation.',
        why_it_matters: 'API platform enables scalable partner growth without proportional engineering investment.',
        deliverables: ['RESTful API layer with authentication', 'Developer portal with documentation', 'Sandbox environment', 'Webhook notifications']
      };
    } else if (title.includes('competitive') || title.includes('intelligence')) {
      update = {
        ...update,
        description: 'Systematically track competitor activities, pricing, and positioning. Automated monitoring of competitor websites and review sites.',
        problem_statement: 'Competitive knowledge is anecdotal and outdated. We do not know competitor pricing changes until customers tell us.',
        why_it_matters: 'Real-time competitive intelligence enables faster pricing responses and better positioning.',
        deliverables: ['Competitor website monitoring', 'Pricing intelligence database', 'Review site aggregation', 'Monthly intelligence reports']
      };
    } else if (title.includes('sustainability') || title.includes('impact')) {
      update = {
        ...update,
        description: 'Calculate and display the environmental impact of solar installations facilitated by Abeto. CO2 savings, renewable energy generation, and tree equivalent metrics.',
        problem_statement: 'We cannot quantify our environmental impact beyond installation count. Missing opportunity to differentiate on sustainability.',
        why_it_matters: 'Environmental impact metrics are powerful marketing tools and increasingly required for reporting.',
        deliverables: ['CO2 savings calculator', 'Cumulative impact tracking', 'Customer-facing impact certificates', 'Annual sustainability report']
      };
    } else if (title.includes('report') && title.includes('suite')) {
      update = {
        ...update,
        description: 'Comprehensive business intelligence platform with customizable dashboards, automated reports, and ad-hoc query capabilities.',
        problem_statement: 'Reports are created manually in spreadsheets, taking significant time and prone to errors. Managers cannot self-serve data.',
        why_it_matters: 'Business intelligence is essential for scaling. Automated reporting saves 20+ hours/week.',
        deliverables: ['Executive dashboard with key metrics', 'Department-specific dashboards', 'Automated report scheduling', 'Self-service query interface']
      };
    } else if (title.includes('chatbot') && title.includes('training')) {
      update = {
        ...update,
        description: 'Build infrastructure for continuous chatbot improvement through conversation analysis, feedback loops, and systematic prompt engineering.',
        problem_statement: 'Once deployed, chatbots degrade without continuous improvement. We have no systematic way to identify poor responses.',
        why_it_matters: 'Chatbot quality directly impacts lead conversion. Continuous improvement ensures ROI grows over time.',
        deliverables: ['Conversation analytics and tagging', 'Quality scoring for chatbot responses', 'Feedback collection interface', 'Prompt version control']
      };
    } else if (title.includes('mobile') && title.includes('app')) {
      update = {
        ...update,
        description: 'Native mobile app for SDRs enabling full functionality on-the-go. Lead management, calling, WhatsApp integration, and AI copilot features.',
        problem_statement: 'SDRs are desk-bound due to web-only tools. Cannot effectively work during commutes or at events.',
        why_it_matters: 'Mobile capability increases SDR flexibility and utilization. Enables new use cases like event lead capture.',
        deliverables: ['iOS and Android native applications', 'Offline capability for core functions', 'Push notifications', 'Voice and WhatsApp integration']
      };
    } else if (title.includes('feedback') && title.includes('customer')) {
      update = {
        ...update,
        description: 'Implement systematic collection and analysis of customer feedback throughout the journey. NPS surveys, review solicitation, and feedback-to-action workflows.',
        problem_statement: 'We do not systematically collect customer feedback. Reviews on Google are random. No way to measure satisfaction.',
        why_it_matters: 'Customer feedback is essential for continuous improvement and generates social proof for marketing.',
        deliverables: ['Automated NPS survey at key touchpoints', 'Review solicitation workflow', 'Negative feedback escalation', 'Feedback analytics dashboard']
      };
    } else {
      // Generic improvement for unmatched projects
      update = {
        ...update,
        why_it_matters: 'This project contributes to Abeto\'s mission of connecting Spanish homeowners with quality solar installers through technology-driven efficiency improvements.',
      };
    }

    improvements.push(update);
  }

  return improvements;
}

// Run the updates
async function main() {
  console.log('='.repeat(60));
  console.log('ABETO CONTENT IMPROVEMENT SCRIPT');
  console.log('='.repeat(60));

  // Get actual projects from DB
  const projects = await getProjectSlugs();

  if (projects.length === 0) {
    console.log('No projects found in database!');
    return;
  }

  const improvements = createProjectImprovements(projects);

  console.log('Starting project updates...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const improvement of improvements) {
    const { id, ...updateData } = improvement;

    // Only update if we have meaningful changes
    if (Object.keys(updateData).length > 1) {
      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.log(`❌ Error updating project ${id}: ${error.message}`);
        errorCount++;
      } else {
        const project = projects.find(p => p.id === id);
        console.log(`✅ Updated: ${project?.title || id}`);
        successCount++;
      }
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`COMPLETE: ${successCount} projects updated, ${errorCount} errors`);
  console.log('='.repeat(60));

  // Now update tasks
  console.log('\nUpdating tasks with improved descriptions...\n');

  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('id, title, description, project_id');

  if (tasksError) {
    console.log('Error fetching tasks:', tasksError.message);
    return;
  }

  console.log(`Found ${tasks.length} tasks to review...\n`);

  let taskSuccessCount = 0;
  let taskSkipCount = 0;

  for (const task of tasks) {
    const improvement = getTaskImprovement(task.title, task.description);

    if (improvement) {
      const { error } = await supabase
        .from('tasks')
        .update(improvement)
        .eq('id', task.id);

      if (error) {
        console.log(`❌ Error updating task "${task.title.substring(0, 40)}...": ${error.message}`);
      } else {
        console.log(`✅ Updated task: ${task.title.substring(0, 50)}...`);
        taskSuccessCount++;
      }
    } else {
      taskSkipCount++;
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`TASKS COMPLETE: ${taskSuccessCount} updated, ${taskSkipCount} skipped (already detailed)`);
  console.log('='.repeat(60));
}

function getTaskImprovement(title, currentDesc) {
  const titleLower = title.toLowerCase();

  // Skip if already has a detailed description (more than 200 chars)
  if (currentDesc && currentDesc.length > 200) {
    return null;
  }

  let description = null;
  let acceptance_criteria = null;

  // Pattern-based improvements
  if (titleLower.includes('design') && (titleLower.includes('architecture') || titleLower.includes('system'))) {
    description = 'Design and document the complete system architecture including component boundaries, data flows, integration points, and scalability considerations. Include security requirements, deployment topology, and technical decision rationale.';
    acceptance_criteria = ['Architecture diagram with all components', 'Data flow documentation', 'API specifications drafted', 'Security considerations documented', 'Deployment topology defined', 'Review completed by technical lead'];
  } else if (titleLower.includes('api') && titleLower.includes('integr')) {
    description = 'Implement API integration with proper authentication, error handling, rate limiting, and monitoring. Include comprehensive logging, retry logic, and graceful degradation for API failures.';
    acceptance_criteria = ['API connection established and tested', 'Authentication working correctly', 'Error handling implemented', 'Rate limiting respected', 'Monitoring configured', 'Integration tests passing'];
  } else if (titleLower.includes('dashboard')) {
    description = 'Build an interactive dashboard with real-time data visualization, filtering capabilities, and responsive design. Optimize for fast loading and intuitive user experience across devices.';
    acceptance_criteria = ['All required metrics displayed', 'Real-time updates working', 'Filters function correctly', 'Mobile responsive design', 'Page load under 2 seconds', 'User testing feedback incorporated'];
  } else if (titleLower.includes('database') || titleLower.includes('schema')) {
    description = 'Design and implement database schema with proper indexing, constraints, and relationships. Plan for data growth and query performance. Include migration scripts and rollback procedures.';
    acceptance_criteria = ['Schema supports all use cases', 'Indexes optimized for queries', 'Constraints enforce data integrity', 'Migration scripts tested', 'Rollback procedure documented', 'Performance benchmarks met'];
  } else if (titleLower.includes('test')) {
    description = 'Implement comprehensive test coverage including unit tests, integration tests, and end-to-end tests. Ensure tests are maintainable, fast, and provide good coverage of critical paths.';
    acceptance_criteria = ['Unit test coverage > 80%', 'Integration tests for key flows', 'E2E tests for critical paths', 'Tests run in under 5 minutes', 'CI/CD pipeline integration', 'Test documentation complete'];
  } else if (titleLower.includes('deploy')) {
    description = 'Prepare and execute deployment with proper staging validation, monitoring setup, and rollback plan. Coordinate with stakeholders and document deployment procedures.';
    acceptance_criteria = ['Staging deployment successful', 'Monitoring configured', 'Rollback plan tested', 'Stakeholders notified', 'Production deployment completed', 'Post-deployment verification passed'];
  } else if (titleLower.includes('document')) {
    description = 'Create comprehensive documentation including user guides, API references, and troubleshooting guides. Ensure documentation is accurate, up-to-date, and accessible to all stakeholders.';
    acceptance_criteria = ['User guide completed', 'API documentation updated', 'Examples and tutorials included', 'Troubleshooting section added', 'Review by target audience', 'Published to documentation site'];
  } else if (titleLower.includes('security') || titleLower.includes('auth')) {
    description = 'Implement security controls including authentication, authorization, input validation, and encryption. Follow security best practices and OWASP guidelines.';
    acceptance_criteria = ['Authentication implemented correctly', 'Authorization rules enforced', 'Input validation complete', 'Sensitive data encrypted', 'Security review passed', 'Vulnerability scan clean'];
  } else if (titleLower.includes('performance') || titleLower.includes('optimiz')) {
    description = 'Analyze and optimize performance by identifying bottlenecks, implementing caching strategies, and optimizing queries. Measure improvements with before/after benchmarks.';
    acceptance_criteria = ['Baseline metrics recorded', 'Bottlenecks identified', 'Optimizations implemented', 'Cache strategy effective', 'Performance targets met', 'Monitoring for regression'];
  } else if (titleLower.includes('ui') || titleLower.includes('interface') || titleLower.includes('frontend')) {
    description = 'Build user interface with focus on usability, accessibility, and responsive design. Implement with modern frontend practices and ensure cross-browser compatibility.';
    acceptance_criteria = ['UI matches design specifications', 'Accessible (WCAG 2.1 AA)', 'Responsive across devices', 'Cross-browser tested', 'User testing completed', 'Performance optimized'];
  } else if (titleLower.includes('notification') || titleLower.includes('email') || titleLower.includes('alert')) {
    description = 'Implement notification system with email, push, and in-app notifications as needed. Include user preferences, delivery tracking, and unsubscribe management.';
    acceptance_criteria = ['All notification types working', 'User preferences respected', 'Delivery tracking implemented', 'Unsubscribe flow working', 'Email deliverability tested', 'Templates approved'];
  } else if (titleLower.includes('report')) {
    description = 'Build reporting functionality with data aggregation, visualization, and export capabilities. Support scheduling, filtering, and multiple output formats.';
    acceptance_criteria = ['Report data accurate', 'Visualizations clear', 'Export formats working', 'Scheduling functional', 'Filters work correctly', 'Performance acceptable'];
  } else if (titleLower.includes('workflow') || titleLower.includes('automation')) {
    description = 'Design and implement automated workflow with trigger conditions, actions, and exception handling. Include logging, monitoring, and manual override capabilities.';
    acceptance_criteria = ['Triggers fire correctly', 'Actions execute reliably', 'Exception handling works', 'Logging comprehensive', 'Manual override available', 'Monitoring in place'];
  } else if (titleLower.includes('search')) {
    description = 'Implement search functionality with full-text search, filtering, and relevance ranking. Optimize for speed and user experience.';
    acceptance_criteria = ['Search returns relevant results', 'Filters work correctly', 'Response time under 500ms', 'Typo tolerance implemented', 'Results well-ranked', 'Mobile-friendly interface'];
  } else if (titleLower.includes('sync') || (titleLower.includes('integr') && !titleLower.includes('api'))) {
    description = 'Build data synchronization between systems with conflict resolution, retry logic, and monitoring. Ensure data consistency and handle edge cases gracefully.';
    acceptance_criteria = ['Sync completes reliably', 'Conflicts resolved correctly', 'Retry logic works', 'Monitoring alerts configured', 'Data consistency verified', 'Edge cases handled'];
  } else if (titleLower.includes('model') || titleLower.includes('ml') || titleLower.includes('ai')) {
    description = 'Build and train machine learning model with proper validation, feature engineering, and hyperparameter tuning. Document model performance and deployment requirements.';
    acceptance_criteria = ['Model achieves accuracy targets', 'Validation methodology sound', 'Feature importance documented', 'Model deployable', 'Performance monitoring planned', 'Documentation complete'];
  } else if (titleLower.includes('webhook')) {
    description = 'Implement webhook handlers for receiving real-time events from external systems. Include signature verification, retry handling, and idempotency for reliable event processing.';
    acceptance_criteria = ['Webhook endpoint secured', 'Signature verification working', 'Events processed correctly', 'Retry handling implemented', 'Idempotency ensured', 'Monitoring configured'];
  } else if (titleLower.includes('data') && titleLower.includes('analys')) {
    description = 'Analyze data to extract insights, identify patterns, and inform decision making. Document findings with visualizations and actionable recommendations.';
    acceptance_criteria = ['Data sources identified', 'Analysis methodology documented', 'Key insights extracted', 'Visualizations clear', 'Recommendations actionable', 'Findings presented to stakeholders'];
  } else if (titleLower.includes('implement') || titleLower.includes('build') || titleLower.includes('create') || titleLower.includes('develop')) {
    description = `Complete implementation of ${title.replace(/^(implement|build|create|develop)\s+/i, '')} with all required functionality, proper error handling, and documentation.`;
    acceptance_criteria = ['Functionality complete', 'Error handling implemented', 'Code reviewed', 'Tests passing', 'Documentation updated', 'Ready for deployment'];
  } else if (titleLower.includes('configur') || titleLower.includes('setup') || titleLower.includes('set up')) {
    description = `Configure and set up ${title.replace(/^(configure|setup|set up)\s+/i, '')} with proper settings, documentation, and validation of correct operation.`;
    acceptance_criteria = ['Configuration complete', 'Settings validated', 'Documentation updated', 'Testing passed', 'Stakeholder approval', 'Ready for use'];
  } else {
    // Generic improvement for any remaining tasks
    description = `Complete ${title} according to requirements with proper implementation, testing, and documentation. Ensure quality and alignment with project standards.`;
    acceptance_criteria = ['Requirements met', 'Code reviewed', 'Tests passing', 'Documentation updated', 'Stakeholder approval obtained'];
  }

  return { description, acceptance_criteria };
}

main().catch(console.error);
