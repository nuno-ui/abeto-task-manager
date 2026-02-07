import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/vision/summary
 * Returns a structured summary of the strategic vision for agent/companion use
 * This is the primary endpoint for agents to understand the company's strategic direction
 */
export async function GET() {
  const supabase = await createClient();

  try {
    // Get all active vision documents
    const { data: documents, error: docError } = await supabase
      .from('vision_documents')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (docError) {
      console.error('Error fetching vision documents:', docError);
      return NextResponse.json({ error: docError.message }, { status: 500 });
    }

    // Get project alignment statistics
    const { data: projects, error: projError } = await supabase
      .from('projects')
      .select(`
        id,
        title,
        slug,
        vision_alignment,
        vision_alignment_reason,
        agent_can_be_agent,
        agent_role,
        agent_generates_proprietary_data,
        agent_data_moat,
        status,
        priority
      `)
      .eq('is_archived', false);

    if (projError) {
      console.error('Error fetching projects:', projError);
      return NextResponse.json({ error: projError.message }, { status: 500 });
    }

    // Organize documents by category
    const thesis = documents?.filter(d => d.category === 'thesis') || [];
    const principles = documents?.filter(d => d.category === 'principle') || [];
    const pillars = documents?.filter(d => d.category === 'pillar') || [];
    const imperatives = documents?.filter(d => d.category === 'imperative') || [];
    const patterns = documents?.filter(d => d.category === 'pattern') || [];

    // Calculate project statistics
    const alignmentStats = {
      strong: projects?.filter(p => p.vision_alignment === 'strong').length || 0,
      moderate: projects?.filter(p => p.vision_alignment === 'moderate').length || 0,
      weak: projects?.filter(p => p.vision_alignment === 'weak').length || 0,
      misaligned: projects?.filter(p => p.vision_alignment === 'misaligned').length || 0,
      unassessed: projects?.filter(p => !p.vision_alignment).length || 0,
    };

    const agentStats = {
      total: projects?.length || 0,
      agentReady: projects?.filter(p => p.agent_can_be_agent && p.agent_role !== 'not_agent').length || 0,
      orchestrators: projects?.filter(p => p.agent_role === 'orchestrator').length || 0,
      specialists: projects?.filter(p => p.agent_role === 'specialist').length || 0,
      dataCollectors: projects?.filter(p => p.agent_role === 'data_collector').length || 0,
      enablers: projects?.filter(p => p.agent_role === 'enabler').length || 0,
      interfaces: projects?.filter(p => p.agent_role === 'interface').length || 0,
      dataProjects: projects?.filter(p => p.agent_generates_proprietary_data || (p.agent_data_moat && p.agent_data_moat !== 'none')).length || 0,
    };

    // Build structured response optimized for agent consumption
    const response = {
      meta: {
        generated_at: new Date().toISOString(),
        purpose: 'Strategic vision knowledge base for agents and companions',
      },

      core_thesis: {
        summary: thesis.find(d => d.slug === 'core-thesis')?.summary || 'Value moves to agent layer and data layer.',
        full: thesis.find(d => d.slug === 'core-thesis')?.content,
        strategic_imperative: thesis.find(d => d.slug === 'strategic-imperative')?.content,
      },

      principles: principles.map(p => ({
        name: p.title,
        summary: p.summary,
        full: p.content,
      })),

      pillars: pillars.map(p => ({
        name: p.title,
        summary: p.summary,
        full: p.content,
        metadata: p.metadata,
      })),

      value_shifts: imperatives.map(p => ({
        name: p.title,
        summary: p.summary,
      })),

      implementation_patterns: patterns.map(p => ({
        name: p.title,
        summary: p.summary,
        full: p.content,
      })),

      current_state: {
        alignment: alignmentStats,
        agents: agentStats,
        strongly_aligned_projects: projects
          ?.filter(p => p.vision_alignment === 'strong')
          .map(p => ({ title: p.title, slug: p.slug, reason: p.vision_alignment_reason })) || [],
        misaligned_projects: projects
          ?.filter(p => p.vision_alignment === 'misaligned')
          .map(p => ({ title: p.title, slug: p.slug, reason: p.vision_alignment_reason })) || [],
      },

      guidance_for_agents: {
        when_creating_projects: 'Every new project should contribute to either the agent layer (execution capability) or the data layer (proprietary data). Avoid pure UI/dashboard projects unless they enable human-agent collaboration.',
        when_evaluating_features: 'Ask: Does this make our agents smarter? Does this collect proprietary data? Does this give us defensible advantage?',
        prioritization_rules: [
          'Data Foundation projects are prerequisite for everything else',
          'Knowledge Generation projects should create data while doing their job',
          'Human Empowerment projects should amplify humans, not replace them',
        ],
        success_criteria: 'A project is vision-aligned if it: (1) builds agent capability, (2) collects proprietary data, or (3) enables human-agent collaboration.',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in vision summary API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
