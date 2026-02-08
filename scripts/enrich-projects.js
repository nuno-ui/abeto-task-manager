// Script to enrich all projects with vision alignment and missing fields
// Vision: Abeto builds AI agents that empower solar/energy installers and SDRs
// Data moat strategy: Each interaction generates proprietary data

const SUPABASE_URL = 'https://pyxjwtyvmbltscayabsj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5eGp3dHl2bWJsdHNjYXlhYnNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIzMjAzOSwiZXhwIjoyMDg1ODA4MDM5fQ.4CO0_gKZQrmKWolIzcb-vuGmKNQAdLVKjIwRXTbd0JQ';

// Project enrichment data - comprehensive updates for all 49 projects
const PROJECT_UPDATES = {
  // === CRITICAL INFRASTRUCTURE ===
  'Agent Communication Protocol': {
    vision_alignment: 'strong',
    vision_alignment_reason: 'Core infrastructure enabling specialized AI agents to collaborate autonomously - the foundation of our multi-agent architecture that will orchestrate solar operations across Europe',
    why_it_matters: 'Without standardized communication protocols, AI agents work in silos. This protocol enables our agents to share context, delegate tasks, and coordinate complex workflows - turning isolated tools into an intelligent operating system for the energy transition.'
  },

  'Unified Data Layer': {
    vision_alignment: 'strong',
    vision_alignment_reason: 'Foundation for building a proprietary data moat - centralizes all solar operations data enabling AI agents to learn from every interaction across the European market',
    why_it_matters: 'Scattered data across CRMs, WhatsApp, and spreadsheets prevents AI from understanding the full picture. A unified layer creates the proprietary dataset that makes our AI agents smarter with every lead, every installation, every customer interaction.'
  },

  'AI Cortex': {
    vision_alignment: 'strong',
    vision_alignment_reason: 'The intelligence layer that transforms raw operational data into actionable insights - the brain powering all Abeto AI agents',
    why_it_matters: 'Individual AI tools hit a ceiling without centralized intelligence. The Cortex continuously learns from all data sources, creating compound intelligence that improves every agent in the ecosystem - a true data moat accelerator.'
  },

  'Cortex Data Acquisition Strategy': {
    vision_alignment: 'strong',
    vision_alignment_reason: 'Direct execution of our data moat strategy - systematically acquiring the proprietary solar market data that competitors cannot access',
    why_it_matters: 'AI is only as good as its training data. This strategy identifies, prioritizes, and acquires high-value data sources - installer performance metrics, regional conversion patterns, customer behavior data - that will make our AI agents unbeatable in the solar vertical.'
  },

  'AI Agent Factory': {
    vision_alignment: 'strong',
    vision_alignment_reason: 'Enables rapid deployment of specialized agents for any solar operations workflow - the manufacturing plant for our agentic AI strategy',
    why_it_matters: 'Building each agent from scratch is slow and expensive. The Agent Factory creates a standardized framework for spinning up new specialized agents in days, not months - accelerating our path to a full solar operations OS.'
  },

  // === SDR & SALES AUTOMATION ===
  'SDR Portal': {
    vision_alignment: 'strong',
    vision_alignment_reason: 'Primary interface empowering SDRs with AI copilots - transforms sales reps from data entry clerks into high-performance closers',
    why_it_matters: 'SDRs spend 70% of their time on administrative tasks. This portal puts AI agents at their fingertips - prioritizing leads, summarizing conversations, automating follow-ups - so humans can focus on building relationships and closing deals.'
  },

  'AI-Driven Omnichannel Chatbot Platform': {
    vision_alignment: 'strong',
    vision_alignment_reason: 'First-contact AI agent across all channels - captures every lead interaction as training data while providing instant, intelligent responses',
    why_it_matters: 'Leads expect instant responses on WhatsApp, web, and phone. A unified AI chatbot ensures no lead falls through the cracks while capturing every interaction as proprietary data to improve conversion predictions.'
  },

  'AI Voice Agent for Inbound Calls': {
    vision_alignment: 'strong',
    vision_alignment_reason: 'Extends AI-first engagement to voice channel - the fastest-growing contact method in European solar sales',
    why_it_matters: '40% of solar leads prefer phone calls. An AI voice agent handles initial qualification, books appointments, and ensures 24/7 availability - while recording every conversation for continuous improvement.'
  },

  'AI Customer Success Agent': {
    vision_alignment: 'strong',
    vision_alignment_reason: 'Post-sale AI engagement driving referrals and upsells - turns satisfied customers into a growth engine',
    why_it_matters: 'Customer success in solar is reactive and manual. An AI agent proactively monitors system performance, addresses issues before customers notice, and identifies upsell opportunities - maximizing lifetime value.'
  },

  'Contact Prioritization Engine': {
    vision_alignment: 'strong',
    vision_alignment_reason: 'AI-powered lead scoring using proprietary conversion data - ensures SDRs always work the highest-value opportunities',
    why_it_matters: 'Not all leads are equal. Using our accumulated data on what converts, this engine dynamically ranks every contact so SDRs spend their time on leads most likely to close - boosting conversion rates 30%+.'
  },

  'Dynamic Allocation Engine': {
    vision_alignment: 'strong',
    vision_alignment_reason: 'AI matching leads to optimal installers based on performance, capacity, and location - the intelligence layer for installer marketplace efficiency',
    why_it_matters: 'Manual lead allocation creates mismatches - overloading top performers while underutilizing others. AI allocation optimizes for conversion probability, installer capacity, and geography - maximizing close rates across the network.'
  },

  'Funnel Automation OS': {
    vision_alignment: 'strong',
    vision_alignment_reason: 'Automated sales pipeline with AI agents handling each stage - from first touch to closed deal',
    why_it_matters: 'Manual funnel management leaks leads at every stage. An AI-orchestrated funnel automatically moves leads forward, triggers interventions when deals stall, and provides real-time visibility into pipeline health.'
  },

  'Campaign OS': {
    vision_alignment: 'moderate',
    vision_alignment_reason: 'Supports lead generation feeding the AI-powered sales funnel - important but upstream of core agent workflows',
    why_it_matters: 'Effective campaigns generate quality leads for AI agents to process. This OS coordinates multi-channel campaigns, tracks attribution, and optimizes spend based on downstream conversion data from our AI systems.'
  },

  'WhatsApp Conversation Summary': {
    vision_alignment: 'strong',
    vision_alignment_reason: 'AI agent extracting structured insights from unstructured conversations - feeds the Cortex with rich interaction data',
    why_it_matters: 'Critical context lives in WhatsApp threads but is invisible to CRM systems. AI summarization extracts key information, updates records automatically, and ensures every conversation becomes searchable, actionable data.'
  },

  'Lead Recycling Workflow': {
    vision_alignment: 'moderate',
    vision_alignment_reason: 'Re-engages dormant leads with AI-powered outreach - extracts value from existing database',
    why_it_matters: 'Databases contain thousands of cold leads that went dark. AI analyzes past interactions, identifies re-engagement triggers, and automates personalized outreach - turning dead leads into new opportunities.'
  },

  // === INSTALLER ECOSYSTEM ===
  'Installer Portal & Product': {
    vision_alignment: 'strong',
    vision_alignment_reason: 'Primary interface for installer network - the platform where AI agents enhance installer productivity and capture installation data',
    why_it_matters: 'Installers are overwhelmed with admin tasks, quoting, and coordination. The portal provides AI-powered tools that 10x their efficiency while every interaction generates data improving the entire ecosystem.'
  },

  'Installer Performance Tracking': {
    vision_alignment: 'strong',
    vision_alignment_reason: 'Real-time installer metrics feeding AI allocation and quality systems - the data foundation for network optimization',
    why_it_matters: 'Without performance data, allocation is guesswork. Tracking conversion rates, installation quality, and customer satisfaction per installer enables AI to route leads optimally and identify coaching opportunities.'
  },

  'Installer GTM & Value Proposition': {
    vision_alignment: 'strong',
    vision_alignment_reason: 'Growth strategy for expanding the installer network that feeds our AI agents with diverse operational data',
    why_it_matters: 'More installers = more data = smarter AI. A compelling GTM strategy attracts quality installers to the platform, expanding our geographic coverage and enriching our proprietary dataset across different markets and installation types.'
  },

  'Installer Enablement & Training Platform': {
    vision_alignment: 'moderate',
    vision_alignment_reason: 'AI-assisted training improving installer quality - enhances the humans that work alongside our agents',
    why_it_matters: 'Better-trained installers convert more leads and deliver higher quality. AI-powered training identifies skill gaps, delivers personalized content, and tracks competency development across the network.'
  },

  'Installer Feedback System': {
    vision_alignment: 'moderate',
    vision_alignment_reason: 'Captures installer insights to improve platform and AI agents - closes the feedback loop',
    why_it_matters: 'Installers see problems and opportunities the system misses. A structured feedback mechanism captures this frontline intelligence, prioritizes improvements, and demonstrates that their input drives platform evolution.'
  },

  'Installer Quote Sync': {
    vision_alignment: 'moderate',
    vision_alignment_reason: 'Standardizes quoting data across installer network - enables AI-powered pricing optimization',
    why_it_matters: 'Inconsistent quoting loses deals and erodes margins. Syncing quotes across the network reveals pricing patterns, identifies winning configurations, and enables AI to suggest optimal quotes based on historical success.'
  },

  // === DATA & REPORTING ===
  'Reporting Hub': {
    vision_alignment: 'moderate',
    vision_alignment_reason: 'Provides visibility into AI agent performance and business metrics - the command center for operations leaders',
    why_it_matters: 'Without clear reporting, you cannot improve what you cannot measure. The hub consolidates AI agent metrics, conversion data, and business KPIs into actionable dashboards that drive strategic decisions.'
  },

  'Data Quality Monitor': {
    vision_alignment: 'strong',
    vision_alignment_reason: 'Ensures AI agents operate on clean, accurate data - garbage in, garbage out protection',
    why_it_matters: 'AI agents are only as good as their data. Continuous monitoring catches data quality issues before they corrupt predictions, identifies missing fields, and maintains the integrity of our data moat.'
  },

  'Incident & Bug Management System': {
    vision_alignment: 'moderate',
    vision_alignment_reason: 'Maintains platform reliability for AI agent operations - essential infrastructure',
    why_it_matters: 'Downtime directly impacts lead conversion and installer productivity. A robust incident system ensures rapid detection, response, and resolution - maintaining the trust that makes users rely on AI agents.'
  },

  // === INTERNAL OPERATIONS ===
  'Internal Operations Agent Suite': {
    vision_alignment: 'moderate',
    vision_alignment_reason: 'Applies our AI agent capabilities internally - dogfooding while improving team efficiency',
    why_it_matters: 'Our team should benefit from the same AI automation we sell. Internal agents handling HR, finance, and operations free up bandwidth for customer-facing innovation while validating our technology.'
  },

  'Admin & HR Automation Suite': {
    vision_alignment: 'moderate',
    vision_alignment_reason: 'AI agents for internal HR workflows - reduces overhead and demonstrates capability',
    why_it_matters: 'Administrative tasks drain resources from growth activities. AI handling onboarding, PTO, and routine HR workflows keeps the team focused on building and selling while proving our own technology.'
  },

  'Accounting & Finance Automation': {
    vision_alignment: 'moderate',
    vision_alignment_reason: 'AI agents for financial workflows - improves accuracy and frees finance team',
    why_it_matters: 'Manual accounting is error-prone and time-consuming. AI automation handles invoice processing, expense categorization, and reconciliation - reducing costs and enabling real-time financial visibility.'
  },

  // === MARKET EXPANSION ===
  'Pan-European Expansion Engine': {
    vision_alignment: 'strong',
    vision_alignment_reason: 'Scales our AI-powered platform across European solar markets - multiplying our data moat and market opportunity',
    why_it_matters: 'The European energy transition is continent-wide. A systematic expansion engine replicates our success across markets - adapting AI agents to local regulations, languages, and installer ecosystems while building a pan-European data advantage.'
  },

  'Competitor Intel Agent': {
    vision_alignment: 'moderate',
    vision_alignment_reason: 'AI-powered market intelligence - informs product and go-to-market strategy',
    why_it_matters: 'The solar software market is evolving rapidly. An AI agent continuously monitoring competitor moves, pricing, and features ensures we stay ahead and identify opportunities for differentiation.'
  },

  'Partner Expansion Tool': {
    vision_alignment: 'moderate',
    vision_alignment_reason: 'Accelerates partnership development expanding our ecosystem reach',
    why_it_matters: 'Strategic partnerships extend our platform into new customer segments and geographies. AI-assisted partner identification and management accelerates relationship development and integration.'
  },

  // === PRODUCT CAPABILITIES ===
  'Intelligent Document Processing': {
    vision_alignment: 'strong',
    vision_alignment_reason: 'AI extracting structured data from solar documents - automating manual data entry across the value chain',
    why_it_matters: 'Solar operations drown in documents - permits, contracts, technical specs. AI that automatically extracts and structures this information eliminates hours of manual work and ensures no critical detail is missed.'
  },

  'Loan Integration Platform': {
    vision_alignment: 'strong',
    vision_alignment_reason: 'Streamlines solar financing - a critical conversion barrier where AI can accelerate decisions',
    why_it_matters: 'Many solar deals die waiting for financing. Integrated loan processing with AI-assisted qualification and document handling closes the financing gap faster - boosting conversion at a critical funnel stage.'
  },

  'Dynamic Pricing Engine': {
    vision_alignment: 'strong',
    vision_alignment_reason: 'AI-optimized pricing using conversion and margin data - directly improves unit economics',
    why_it_matters: 'Static pricing leaves money on the table or loses competitive deals. AI analyzing market conditions, lead characteristics, and installer capacity suggests optimal pricing in real-time - maximizing both volume and margin.'
  },

  'Unified Quote API': {
    vision_alignment: 'moderate',
    vision_alignment_reason: 'Standardizes quoting across channels and installers - enables AI pricing optimization',
    why_it_matters: 'Fragmented quoting creates inconsistency and delays. A unified API ensures quotes are generated correctly, priced optimally, and tracked for continuous improvement across all channels.'
  },

  'Predictive Maintenance & Monitoring': {
    vision_alignment: 'strong',
    vision_alignment_reason: 'AI monitoring installed systems - extends customer relationship and generates post-sale data moat',
    why_it_matters: 'The relationship shouldnt end at installation. AI monitoring solar systems predicts failures, optimizes performance, and identifies upgrade opportunities - generating ongoing value and unique operational data.'
  },

  'Automated Invoicing': {
    vision_alignment: 'moderate',
    vision_alignment_reason: 'Streamlines financial operations in the solar value chain',
    why_it_matters: 'Manual invoicing creates delays and errors. Automated invoice generation, delivery, and tracking ensures installers and customers have clear financial visibility while reducing administrative burden.'
  },

  // === SPECIALIZED TOOLS ===
  'GDPR Compliance Tracker': {
    vision_alignment: 'moderate',
    vision_alignment_reason: 'Ensures AI agents operate within European data regulations - essential for trust and compliance',
    why_it_matters: 'GDPR violations can destroy a business. Automated compliance tracking ensures our AI agents handle personal data correctly, consent is managed properly, and we maintain the trust essential for enterprise adoption.'
  },

  'Robinson Suppressor': {
    vision_alignment: 'moderate',
    vision_alignment_reason: 'Prevents outreach to opted-out contacts - compliance enabler for AI communication agents',
    why_it_matters: 'Contacting Robinson list members risks fines and reputation damage. Automated suppression ensures our AI agents never reach out to people who have opted out - a legal necessity for automated communications.'
  },

  'Product Diversification Platform': {
    vision_alignment: 'moderate',
    vision_alignment_reason: 'Expands offering beyond solar to related energy products - grows addressable market',
    why_it_matters: 'Solar installers increasingly offer batteries, EV chargers, and heat pumps. A platform supporting product diversification helps installers grow revenue while expanding our data and AI capabilities across the energy ecosystem.'
  },

  // === MARKETING & GROWTH ===
  'Community & Referral Engine': {
    vision_alignment: 'moderate',
    vision_alignment_reason: 'AI-enhanced community building and referral tracking - organic growth channel',
    why_it_matters: 'Solar buyers trust peer recommendations. An AI-powered community surfaces testimonials, tracks referrals, and incentivizes word-of-mouth - the highest-quality, lowest-cost lead source.'
  },

  'Review Generation System': {
    vision_alignment: 'weak',
    vision_alignment_reason: 'Supports reputation but tangential to core AI agent operations',
    why_it_matters: 'Online reviews influence solar purchase decisions. Automated review solicitation from happy customers builds installer reputation - supporting conversion but not a core AI capability.'
  },

  'Programmatic SEO Pages': {
    vision_alignment: 'weak',
    vision_alignment_reason: 'Supports lead generation but not core to AI agent value proposition',
    why_it_matters: 'Location-specific SEO pages capture search traffic for solar services. While important for lead volume, this is a marketing tactic rather than a core AI capability.'
  },

  'GMB Automation': {
    vision_alignment: 'weak',
    vision_alignment_reason: 'Supports local SEO presence - useful but not core to AI agent strategy',
    why_it_matters: 'Google My Business profiles drive local discovery. Automated management keeps profiles current across installer network - supporting visibility but not a strategic AI initiative.',
    description: 'Automated management of Google My Business profiles across the installer network - keeping locations, hours, photos, and posts current to maximize local search visibility and lead capture.'
  },

  'Answer Rate Monitoring': {
    vision_alignment: 'moderate',
    vision_alignment_reason: 'Measures responsiveness that AI agents can improve - operational metric',
    why_it_matters: 'Leads that go unanswered are lost forever. Monitoring answer rates identifies gaps where AI agents can step in - ensuring 24/7 responsiveness that humans cannot provide.'
  },

  // === INFRASTRUCTURE ===
  'API Self-Service Portal': {
    vision_alignment: 'moderate',
    vision_alignment_reason: 'Enables partners and developers to build on our platform - ecosystem expansion',
    why_it_matters: 'API access enables third-party integrations that extend platform value. Self-service reduces onboarding friction while documentation and sandbox environments accelerate developer adoption.'
  },

  'Procurement & Supplier Platform': {
    vision_alignment: 'moderate',
    vision_alignment_reason: 'Supports installer operations with equipment procurement - operational efficiency',
    why_it_matters: 'Equipment procurement is fragmented and time-consuming for installers. A centralized platform with AI-suggested suppliers and pricing improves margins and reduces procurement overhead.'
  },

  'Investor Portal': {
    vision_alignment: 'weak',
    vision_alignment_reason: 'Supports fundraising but not core to AI agent product strategy',
    why_it_matters: 'Transparent investor communications support fundraising. A dedicated portal provides real-time metrics and updates - important for capital raising but not a product priority.'
  },

  // === SPECIALIZED/REGIONAL ===
  'PVPC Savings Widget': {
    vision_alignment: 'weak',
    vision_alignment_reason: 'Spanish market-specific tool - limited scope but supports local value proposition',
    why_it_matters: 'PVPC (regulated Spanish electricity rate) savings calculators help homeowners understand solar ROI. A widget makes this calculation accessible - supporting Spanish market penetration.'
  },

  'IRPF Calculator': {
    vision_alignment: 'weak',
    vision_alignment_reason: 'Spanish tax tool - supporting local sales conversations but not core AI capability',
    why_it_matters: 'Spanish solar buyers can deduct installation costs from IRPF taxes. A calculator helps quantify savings - supporting sales conversations in the Spanish market.',
    description: 'Tax deduction calculator for Spanish solar installations - helping homeowners understand IRPF (personal income tax) benefits and total savings from going solar, supporting sales conversations with clear financial projections.'
  }
};

async function updateProject(title, updates) {
  // First find the project by title
  const findResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/projects?title=eq.${encodeURIComponent(title)}&select=id,title`,
    {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    }
  );

  const projects = await findResponse.json();

  if (projects.length === 0) {
    console.log(`  ❌ Project not found: ${title}`);
    return false;
  }

  const projectId = projects[0].id;

  // Update the project
  const updateResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/projects?id=eq.${projectId}`,
    {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(updates)
    }
  );

  if (!updateResponse.ok) {
    const error = await updateResponse.text();
    console.log(`  ❌ Failed to update ${title}: ${error}`);
    return false;
  }

  return true;
}

async function main() {
  console.log('🚀 Starting project enrichment...\n');

  let successCount = 0;
  let failCount = 0;

  const titles = Object.keys(PROJECT_UPDATES);

  for (let i = 0; i < titles.length; i++) {
    const title = titles[i];
    const updates = PROJECT_UPDATES[title];

    console.log(`[${i + 1}/${titles.length}] Updating: ${title}`);
    console.log(`   Vision: ${updates.vision_alignment}`);

    const success = await updateProject(title, updates);

    if (success) {
      console.log(`  ✅ Updated successfully\n`);
      successCount++;
    } else {
      failCount++;
    }

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 100));
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅ Successfully updated: ${successCount} projects`);
  console.log(`   ❌ Failed: ${failCount} projects`);
}

main().catch(console.error);
