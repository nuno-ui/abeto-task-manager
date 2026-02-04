const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pyxjwtyvmbltscayabsj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5eGp3dHl2bWJsdHNjYXlhYnNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMzIwMzksImV4cCI6MjA4NTgwODAzOX0.O6Spt_DddZ6UUF4_HA5shW3OU1IeKidm661gaNEUBXA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedProjects() {
  console.log('Fetching pillars and teams...');

  // Get pillars
  const { data: pillars, error: pillarsError } = await supabase.from('pillars').select('*');
  if (pillarsError) {
    console.error('Error fetching pillars:', pillarsError);
    return;
  }

  // Get teams
  const { data: teams, error: teamsError } = await supabase.from('teams').select('*');
  if (teamsError) {
    console.error('Error fetching teams:', teamsError);
    return;
  }

  console.log('Pillars:', pillars.map(p => `${p.name} (${p.slug})`).join(', '));
  console.log('Teams:', teams.map(t => `${t.name} (${t.slug})`).join(', '));

  // Create lookup maps
  const pillarMap = {};
  pillars.forEach(p => { pillarMap[p.slug] = p.id; });

  const teamMap = {};
  teams.forEach(t => { teamMap[t.slug] = t.id; });

  // Define all 29 projects
  const projects = [
    {
      title: 'Unified Data Layer',
      slug: 'unified-data-layer',
      description: 'Central API that aggregates all data sources (Zoho, Woztell, Aircall, Holded) into a unified, consistent interface.',
      why_it_matters: 'Foundation for all other projects. Without clean, unified data, nothing else works properly.',
      category: 'Data Infrastructure',
      status: 'in_progress',
      priority: 'critical',
      difficulty: 'hard',
      pillar_id: pillarMap['data-foundation'],
      owner_team_id: teamMap['technology'],
      estimated_hours_min: 180,
      estimated_hours_max: 240
    },
    {
      title: 'Reporting Hub',
      slug: 'reporting-hub',
      description: 'Centralized reporting dashboard with automated weekly digests, provider ROI analysis, and performance metrics.',
      why_it_matters: 'Gives leadership visibility into operations without manual report generation.',
      category: 'Analytics',
      status: 'planning',
      priority: 'high',
      difficulty: 'medium',
      pillar_id: pillarMap['knowledge-generation'],
      owner_team_id: teamMap['operations'],
      estimated_hours_min: 100,
      estimated_hours_max: 140
    },
    {
      title: 'SDR Portal',
      slug: 'sdr-portal',
      description: 'Dedicated portal for SDRs with prioritized contact lists, WhatsApp summaries, AI qualification notes, and call prep tools.',
      why_it_matters: 'Empowers SDRs to work more efficiently and make better contact decisions.',
      category: 'Sales Tools',
      status: 'in_progress',
      priority: 'critical',
      difficulty: 'hard',
      pillar_id: pillarMap['human-empowerment'],
      owner_team_id: teamMap['technology'],
      estimated_hours_min: 150,
      estimated_hours_max: 200
    },
    {
      title: 'Installer Portal & Product',
      slug: 'installer-portal-product',
      description: 'Self-service portal for installers to manage leads, submit quotes, provide feedback, and track performance.',
      why_it_matters: 'Reduces ops overhead and gives installers ownership of their pipeline.',
      category: 'Partner Tools',
      status: 'planning',
      priority: 'high',
      difficulty: 'hard',
      pillar_id: pillarMap['human-empowerment'],
      owner_team_id: teamMap['technology'],
      estimated_hours_min: 160,
      estimated_hours_max: 220
    },
    {
      title: 'AI Cortex',
      slug: 'ai-cortex',
      description: 'Central AI/ML platform for lead scoring, conversation analysis, qualification automation, and predictive insights.',
      why_it_matters: 'Leverages AI to augment human decision-making across all touchpoints.',
      category: 'AI/ML',
      status: 'idea',
      priority: 'high',
      difficulty: 'hard',
      pillar_id: pillarMap['knowledge-generation'],
      owner_team_id: teamMap['technology'],
      estimated_hours_min: 200,
      estimated_hours_max: 280
    },
    {
      title: 'Campaign OS',
      slug: 'campaign-os',
      description: 'Lead provider management system with ROI tracking, validation automation, and performance optimization.',
      why_it_matters: 'Optimizes marketing spend by identifying best-performing lead sources.',
      category: 'Marketing',
      status: 'planning',
      priority: 'high',
      difficulty: 'medium',
      pillar_id: pillarMap['knowledge-generation'],
      owner_team_id: teamMap['marketing'],
      estimated_hours_min: 100,
      estimated_hours_max: 140
    },
    {
      title: 'Data Quality Monitor',
      slug: 'data-quality-monitor',
      description: 'Real-time monitoring of data quality across all systems with alerts for anomalies and degradation.',
      why_it_matters: 'Ensures data integrity and catches issues before they impact operations.',
      category: 'Data Infrastructure',
      status: 'idea',
      priority: 'medium',
      difficulty: 'medium',
      pillar_id: pillarMap['data-foundation'],
      owner_team_id: teamMap['technology'],
      estimated_hours_min: 60,
      estimated_hours_max: 90
    },
    {
      title: 'Funnel Automation OS',
      slug: 'funnel-automation-os',
      description: 'Automated lead nurturing flows via WhatsApp and email based on lead behavior and stage.',
      why_it_matters: 'Increases contact rates and conversions through timely, relevant outreach.',
      category: 'Automation',
      status: 'planning',
      priority: 'high',
      difficulty: 'medium',
      pillar_id: pillarMap['human-empowerment'],
      owner_team_id: teamMap['operations'],
      estimated_hours_min: 120,
      estimated_hours_max: 160
    },
    {
      title: 'Partner Expansion Tool',
      slug: 'partner-expansion-tool',
      description: 'CRM and outreach automation for recruiting new installer partners.',
      why_it_matters: 'Scales installer network to handle growth in lead volume.',
      category: 'Partner Tools',
      status: 'idea',
      priority: 'medium',
      difficulty: 'medium',
      pillar_id: pillarMap['human-empowerment'],
      owner_team_id: teamMap['sales'],
      estimated_hours_min: 120,
      estimated_hours_max: 160
    },
    {
      title: 'Investor Portal',
      slug: 'investor-portal',
      description: 'Secure portal for investors with real-time KPIs, document room, and AI Q&A.',
      why_it_matters: 'Reduces investor reporting overhead and provides transparency.',
      category: 'Finance',
      status: 'idea',
      priority: 'low',
      difficulty: 'medium',
      pillar_id: pillarMap['human-empowerment'],
      owner_team_id: teamMap['finance'],
      estimated_hours_min: 100,
      estimated_hours_max: 140
    },
    {
      title: 'Installer Performance Tracking',
      slug: 'installer-performance-tracking',
      description: 'Dashboard and alerting for installer SLAs, conversion rates, and quality metrics.',
      why_it_matters: 'Identifies underperforming installers and rewards top performers.',
      category: 'Analytics',
      status: 'planning',
      priority: 'high',
      difficulty: 'medium',
      pillar_id: pillarMap['knowledge-generation'],
      owner_team_id: teamMap['operations'],
      estimated_hours_min: 90,
      estimated_hours_max: 120
    },
    {
      title: 'Dynamic Allocation Engine',
      slug: 'dynamic-allocation-engine',
      description: 'Real-time lead-to-installer matching based on capacity, performance, and geography.',
      why_it_matters: 'Maximizes conversion by matching leads with best-fit installers.',
      category: 'Automation',
      status: 'idea',
      priority: 'high',
      difficulty: 'hard',
      pillar_id: pillarMap['knowledge-generation'],
      owner_team_id: teamMap['technology'],
      estimated_hours_min: 140,
      estimated_hours_max: 180
    },
    {
      title: 'WhatsApp Conversation Summary',
      slug: 'whatsapp-conversation-summary',
      description: 'AI-powered summaries of WhatsApp conversations for SDR call prep.',
      why_it_matters: 'Saves SDR time and improves call quality with context.',
      category: 'AI/ML',
      status: 'idea',
      priority: 'medium',
      difficulty: 'medium',
      pillar_id: pillarMap['knowledge-generation'],
      owner_team_id: teamMap['technology'],
      estimated_hours_min: 60,
      estimated_hours_max: 80
    },
    {
      title: 'Contact Prioritization Engine',
      slug: 'contact-prioritization-engine',
      description: 'Scoring algorithm to prioritize which leads to contact first based on conversion likelihood.',
      why_it_matters: 'Focuses SDR effort on highest-potential leads.',
      category: 'AI/ML',
      status: 'idea',
      priority: 'high',
      difficulty: 'hard',
      pillar_id: pillarMap['knowledge-generation'],
      owner_team_id: teamMap['technology'],
      estimated_hours_min: 80,
      estimated_hours_max: 110
    },
    {
      title: 'Lead Recycling Workflow',
      slug: 'lead-recycling-workflow',
      description: 'Automated re-engagement of lost leads based on timing and reason for loss.',
      why_it_matters: 'Recovers value from leads that would otherwise be wasted.',
      category: 'Automation',
      status: 'idea',
      priority: 'medium',
      difficulty: 'medium',
      pillar_id: pillarMap['human-empowerment'],
      owner_team_id: teamMap['operations'],
      estimated_hours_min: 70,
      estimated_hours_max: 90
    },
    {
      title: 'Installer Feedback System',
      slug: 'installer-feedback-system',
      description: 'Structured feedback collection from installers on lead quality.',
      why_it_matters: 'Closes the loop on lead quality and informs provider decisions.',
      category: 'Data Infrastructure',
      status: 'idea',
      priority: 'medium',
      difficulty: 'easy',
      pillar_id: pillarMap['data-foundation'],
      owner_team_id: teamMap['operations'],
      estimated_hours_min: 50,
      estimated_hours_max: 70
    },
    {
      title: 'Installer Quote Sync',
      slug: 'installer-quote-sync',
      description: 'Real-time sync of installer quotes back to CRM.',
      why_it_matters: 'Eliminates manual quote entry and provides visibility.',
      category: 'Data Infrastructure',
      status: 'idea',
      priority: 'medium',
      difficulty: 'easy',
      pillar_id: pillarMap['data-foundation'],
      owner_team_id: teamMap['technology'],
      estimated_hours_min: 45,
      estimated_hours_max: 60
    },
    {
      title: 'Answer Rate Monitoring',
      slug: 'answer-rate-monitoring',
      description: 'Real-time tracking of call answer rates by segment with alerting.',
      why_it_matters: 'Identifies contact rate issues quickly.',
      category: 'Analytics',
      status: 'idea',
      priority: 'low',
      difficulty: 'easy',
      pillar_id: pillarMap['knowledge-generation'],
      owner_team_id: teamMap['operations'],
      estimated_hours_min: 40,
      estimated_hours_max: 55
    },
    {
      title: 'GDPR Compliance Tracker',
      slug: 'gdpr-compliance-tracker',
      description: 'Consent management and data subject rights portal.',
      why_it_matters: 'Ensures legal compliance and avoids fines.',
      category: 'Compliance',
      status: 'idea',
      priority: 'medium',
      difficulty: 'hard',
      pillar_id: pillarMap['data-foundation'],
      owner_team_id: teamMap['legal'],
      estimated_hours_min: 60,
      estimated_hours_max: 80
    },
    {
      title: 'Automated Invoicing',
      slug: 'automated-invoicing',
      description: 'Automatic invoice generation based on lead outcomes.',
      why_it_matters: 'Eliminates manual invoicing and reduces errors.',
      category: 'Finance',
      status: 'idea',
      priority: 'medium',
      difficulty: 'medium',
      pillar_id: pillarMap['human-empowerment'],
      owner_team_id: teamMap['finance'],
      estimated_hours_min: 70,
      estimated_hours_max: 90
    },
    {
      title: 'API Self-Service Portal',
      slug: 'api-self-service-portal',
      description: 'Developer portal for lead providers to integrate directly.',
      why_it_matters: 'Reduces integration overhead and scales provider onboarding.',
      category: 'Data Infrastructure',
      status: 'idea',
      priority: 'low',
      difficulty: 'hard',
      pillar_id: pillarMap['data-foundation'],
      owner_team_id: teamMap['technology'],
      estimated_hours_min: 80,
      estimated_hours_max: 100
    },
    {
      title: 'Programmatic SEO Pages',
      slug: 'programmatic-seo-pages',
      description: 'Auto-generated location and topic pages for organic traffic.',
      why_it_matters: 'Drives free organic leads at scale.',
      category: 'Marketing',
      status: 'idea',
      priority: 'medium',
      difficulty: 'hard',
      pillar_id: pillarMap['human-empowerment'],
      owner_team_id: teamMap['marketing'],
      estimated_hours_min: 100,
      estimated_hours_max: 130
    },
    {
      title: 'PVPC Savings Widget',
      slug: 'pvpc-savings-widget',
      description: 'Embeddable widget showing real-time electricity savings.',
      why_it_matters: 'Engages visitors with personalized value prop.',
      category: 'Marketing',
      status: 'idea',
      priority: 'low',
      difficulty: 'medium',
      pillar_id: pillarMap['human-empowerment'],
      owner_team_id: teamMap['marketing'],
      estimated_hours_min: 35,
      estimated_hours_max: 50
    },
    {
      title: 'IRPF Calculator',
      slug: 'irpf-calculator',
      description: 'Tax deduction calculator for solar installations.',
      why_it_matters: 'Helps customers understand financial benefits.',
      category: 'Marketing',
      status: 'idea',
      priority: 'low',
      difficulty: 'easy',
      pillar_id: pillarMap['human-empowerment'],
      owner_team_id: teamMap['marketing'],
      estimated_hours_min: 25,
      estimated_hours_max: 35
    },
    {
      title: 'GMB Automation',
      slug: 'gmb-automation',
      description: 'Automated Google Business Profile management.',
      why_it_matters: 'Improves local SEO and manages reviews at scale.',
      category: 'Marketing',
      status: 'idea',
      priority: 'low',
      difficulty: 'medium',
      pillar_id: pillarMap['human-empowerment'],
      owner_team_id: teamMap['marketing'],
      estimated_hours_min: 55,
      estimated_hours_max: 75
    },
    {
      title: 'Review Generation System',
      slug: 'review-generation-system',
      description: 'Automated review request system post-installation.',
      why_it_matters: 'Builds social proof and improves local rankings.',
      category: 'Marketing',
      status: 'idea',
      priority: 'low',
      difficulty: 'medium',
      pillar_id: pillarMap['human-empowerment'],
      owner_team_id: teamMap['marketing'],
      estimated_hours_min: 45,
      estimated_hours_max: 60
    },
    {
      title: 'Competitor Intel Agent',
      slug: 'competitor-intel-agent',
      description: 'Automated monitoring of competitor ads, pricing, and activity.',
      why_it_matters: 'Keeps us informed of market dynamics.',
      category: 'Marketing',
      status: 'idea',
      priority: 'low',
      difficulty: 'hard',
      pillar_id: pillarMap['knowledge-generation'],
      owner_team_id: teamMap['marketing'],
      estimated_hours_min: 50,
      estimated_hours_max: 70
    },
    {
      title: 'Robinson Suppressor',
      slug: 'robinson-suppressor',
      description: 'Integration with Robinson List for contact suppression.',
      why_it_matters: 'Ensures legal compliance with do-not-call lists.',
      category: 'Compliance',
      status: 'idea',
      priority: 'medium',
      difficulty: 'medium',
      pillar_id: pillarMap['data-foundation'],
      owner_team_id: teamMap['legal'],
      estimated_hours_min: 35,
      estimated_hours_max: 50
    },
    {
      title: 'Unified Quote API',
      slug: 'unified-quote-api',
      description: 'Standardized quote flow across all installer types.',
      why_it_matters: 'Simplifies quote management and improves data quality.',
      category: 'Data Infrastructure',
      status: 'idea',
      priority: 'medium',
      difficulty: 'hard',
      pillar_id: pillarMap['data-foundation'],
      owner_team_id: teamMap['technology'],
      estimated_hours_min: 80,
      estimated_hours_max: 100
    }
  ];

  console.log(`\nInserting ${projects.length} projects...`);

  // Insert projects one by one to see errors
  let successCount = 0;
  for (const project of projects) {
    const { data, error } = await supabase
      .from('projects')
      .upsert(project, { onConflict: 'slug' })
      .select();

    if (error) {
      console.error(`Error inserting ${project.title}:`, error.message);
    } else {
      successCount++;
      process.stdout.write('.');
    }
  }

  console.log(`\n\nSuccessfully inserted ${successCount} of ${projects.length} projects`);

  // Verify
  const { data: allProjects, error: verifyError } = await supabase
    .from('projects')
    .select('title, status, priority')
    .order('priority');

  if (verifyError) {
    console.error('Error verifying:', verifyError);
  } else {
    console.log(`\nVerified ${allProjects.length} projects in database:`);
    allProjects.slice(0, 5).forEach(p => console.log(`  - ${p.title} (${p.status}, ${p.priority})`));
    if (allProjects.length > 5) console.log(`  ... and ${allProjects.length - 5} more`);
  }
}

seedProjects();
