'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  Database,
  Bot,
  Shield,
  Target,
  Zap,
  TrendingUp,
  Users,
  Brain,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Workflow,
  GitMerge,
  Eye,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  RefreshCw,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';
import { Project, Pillar, AgentRole, AutonomyLevel, DataMoatType } from '@/types/database';

type TabId = 'thesis' | 'stack' | 'principles' | 'pillars';

interface ProjectWithPillar extends Project {
  pillar?: Pillar;
}

interface StackLayerProject {
  id: string;
  title: string;
  slug: string;
  agent_role: AgentRole;
  agent_autonomy_target: AutonomyLevel;
  agent_data_moat: DataMoatType;
  agent_generates_proprietary_data: boolean;
  agent_cortex_feeds: string[];
  agent_cortex_consumes: string[];
  status: string;
  priority: string;
}

const agentNativePrinciples = [
  {
    id: 'parity',
    name: 'Parity',
    description: 'Agents must accomplish whatever users can do through the interface.',
    detail: 'If the UI supports an action, the agent needs tools to achieve that outcome. No second-class citizens.',
    icon: GitMerge,
  },
  {
    id: 'granularity',
    name: 'Granularity',
    description: 'Tools should be atomic primitives, not bundles of decision logic.',
    detail: 'The agent makes the decisions; prompts describe the outcome. Keep tools simple and composable.',
    icon: Workflow,
  },
  {
    id: 'composability',
    name: 'Composability',
    description: 'New features emerge by writing new prompts, not shipping code.',
    detail: 'With atomic tools and parity established, capabilities multiply through combination.',
    icon: Layers,
  },
  {
    id: 'emergence',
    name: 'Emergent Capability',
    description: 'Agents accomplish unanticipated tasks by combining tools creatively.',
    detail: 'This reveals latent user demands that traditional product development would never discover.',
    icon: Sparkles,
  },
  {
    id: 'improvement',
    name: 'Continuous Improvement',
    description: 'Applications improve through accumulated context and refined prompts.',
    detail: 'No code updates needed. The system learns and adapts through use.',
    icon: TrendingUp,
  },
];

const valueShifts = [
  { from: 'Per-seat pricing', to: 'Outcome-based pricing', example: '$5 per contract reviewed, $2 per ticket resolved' },
  { from: 'UI as the product', to: 'Execution as the product', example: "Don't show a dashboard — do the work" },
  { from: 'Feature roadmaps', to: 'Emergent capabilities', example: 'Discover what users need through agent behavior' },
  { from: 'Switching costs', to: 'Data ownership', example: 'The moat is the data, not the interface' },
  { from: 'Headcount growth', to: 'Agent efficiency', example: '10 agents do the work of 100 employees' },
];

const roleColors: Record<AgentRole, string> = {
  orchestrator: 'violet',
  specialist: 'blue',
  data_collector: 'emerald',
  interface: 'amber',
  enabler: 'cyan',
  not_agent: 'zinc',
};

const roleLabels: Record<AgentRole, string> = {
  orchestrator: 'Orchestrator',
  specialist: 'Specialist',
  data_collector: 'Data Collector',
  interface: 'Interface',
  enabler: 'Enabler',
  not_agent: 'Traditional',
};

export default function VisionPage() {
  const [activeTab, setActiveTab] = useState<TabId>('thesis');
  const [expandedPrinciple, setExpandedPrinciple] = useState<string | null>(null);
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [projects, setProjects] = useState<ProjectWithPillar[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pillarsRes, projectsRes] = await Promise.all([
        fetch('/api/pillars'),
        fetch('/api/projects'),
      ]);

      if (pillarsRes.ok) {
        const pillarsData = await pillarsRes.json();
        setPillars(pillarsData);
      }

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(projectsData.projects || projectsData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group projects by stack layer based on agent_role
  const getStackLayers = () => {
    const agentProjects = projects.filter(p => p.agent_can_be_agent && p.agent_role !== 'not_agent');
    const dataProjects = projects.filter(p => p.agent_generates_proprietary_data || p.agent_data_moat !== 'none');
    const orchestrators = agentProjects.filter(p => p.agent_role === 'orchestrator');
    const specialists = agentProjects.filter(p => p.agent_role === 'specialist');
    const enablers = agentProjects.filter(p => p.agent_role === 'enabler');
    const dataCollectors = agentProjects.filter(p => p.agent_role === 'data_collector');
    const interfaces = agentProjects.filter(p => p.agent_role === 'interface');
    const traditional = projects.filter(p => !p.agent_can_be_agent || p.agent_role === 'not_agent');

    return {
      orchestrators,
      specialists,
      dataCollectors,
      interfaces,
      enablers,
      dataProjects,
      traditional,
      total: projects.length,
      agentReady: agentProjects.length,
    };
  };

  const stackData = getStackLayers();

  // Group projects by pillar
  const getProjectsByPillar = () => {
    const grouped: Record<string, ProjectWithPillar[]> = {};
    const unassigned: ProjectWithPillar[] = [];

    projects.forEach(project => {
      if (project.pillar_id) {
        if (!grouped[project.pillar_id]) {
          grouped[project.pillar_id] = [];
        }
        grouped[project.pillar_id].push(project);
      } else {
        unassigned.push(project);
      }
    });

    return { grouped, unassigned };
  };

  const pillarData = getProjectsByPillar();

  const tabs = [
    { id: 'thesis' as TabId, label: 'The Thesis', icon: Lightbulb },
    { id: 'stack' as TabId, label: 'Agent Stack', icon: Bot },
    { id: 'principles' as TabId, label: 'Agent-Native', icon: Sparkles },
    { id: 'pillars' as TabId, label: 'Strategic Pillars', icon: Layers },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/30">
              <Eye className="w-8 h-8 text-violet-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Strategic Vision</h1>
              <p className="text-zinc-400">Building for the agent-native future</p>
            </div>
          </div>

          {/* Quote banner */}
          <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-700/30 rounded-xl p-4 mb-6">
            <p className="text-amber-200/90 italic text-lg">
              "SaaS isn't dead. The easy SaaS moat is dead. The value is moving — from companies that captured value by being the middleman, to companies that capture value through execution, data, and infrastructure."
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-2 text-zinc-400 mb-1">
                <Target className="w-4 h-4" />
                <span className="text-xs">Total Projects</span>
              </div>
              <p className="text-2xl font-bold text-white">{stackData.total}</p>
            </div>
            <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-violet-400 mb-1">
                <Bot className="w-4 h-4" />
                <span className="text-xs">Agent-Ready</span>
              </div>
              <p className="text-2xl font-bold text-violet-400">{stackData.agentReady}</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <Database className="w-4 h-4" />
                <span className="text-xs">Data Moat</span>
              </div>
              <p className="text-2xl font-bold text-emerald-400">{stackData.dataProjects.length}</p>
            </div>
            <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4">
              <div className="flex items-center gap-2 text-zinc-400 mb-1">
                <Layers className="w-4 h-4" />
                <span className="text-xs">Pillars</span>
              </div>
              <p className="text-2xl font-bold text-white">{pillars.length}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-zinc-800 pb-4 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-violet-600 text-white'
                    : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* THE THESIS */}
          {activeTab === 'thesis' && (
            <div className="space-y-8">
              {/* The Thin Middle Squeeze */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  The Thin Middle Squeeze
                </h2>
                <p className="text-zinc-400 mb-6">
                  Value is getting sucked upward into the agent layer and downward into the data layer.
                  Everything in the thin middle gets crushed.
                </p>

                {/* Stack Visualization */}
                <div className="space-y-4">
                  {/* Agent Layer */}
                  <div className="relative p-4 rounded-xl border bg-violet-500/5 border-violet-500/30">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-violet-500/20">
                          <Bot className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">Agent Layer</h3>
                          <p className="text-sm text-zinc-400 mt-1">AI agents that execute workflows autonomously.</p>
                          <div className="mt-3 p-2 bg-violet-500/10 border border-violet-500/20 rounded-lg">
                            <span className="text-xs text-violet-300">
                              <strong>Abeto:</strong> {stackData.orchestrators.length} orchestrators, {stackData.specialists.length} specialists, {stackData.dataCollectors.length} data collectors
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-emerald-500/20 text-emerald-400">↑ Growing</span>
                    </div>
                  </div>

                  {/* UI Layer */}
                  <div className="relative p-4 rounded-xl border bg-red-500/5 border-red-500/30">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-red-500/20">
                          <Layers className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">UI/SaaS Layer</h3>
                          <p className="text-sm text-zinc-400 mt-1">The "thin middle" getting squeezed from both directions.</p>
                          <p className="text-xs text-red-300 mt-2">Traditional dashboards and workflows become shells.</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400">↓ Squeezed</span>
                    </div>
                  </div>

                  {/* Data Layer */}
                  <div className="relative p-4 rounded-xl border bg-emerald-500/5 border-emerald-500/30">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-emerald-500/20">
                          <Database className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">Data/Systems of Record</h3>
                          <p className="text-sm text-zinc-400 mt-1">The canonical data that agents need to act on.</p>
                          <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                            <span className="text-xs text-emerald-300">
                              <strong>Cortex:</strong> {stackData.dataProjects.length} projects feeding proprietary data
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-emerald-500/20 text-emerald-400">↑ Growing</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Value Shifts */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-blue-400" />
                  The Value Shift
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {valueShifts.map((shift, index) => (
                    <div key={index} className="bg-zinc-800/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-red-400 line-through text-sm">{shift.from}</span>
                        <ArrowRight className="w-3 h-3 text-zinc-500" />
                        <span className="text-emerald-400 font-medium text-sm">{shift.to}</span>
                      </div>
                      <p className="text-xs text-zinc-500">{shift.example}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strategic Imperative */}
              <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-700/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Strategic Imperative
                </h3>
                <p className="text-zinc-300 mb-4">
                  "We need to get access to the disparate data across SME installers as fast as we can to build the Cortex
                  and enhance defensibility of our business."
                </p>
                <p className="text-blue-300 font-medium">
                  The value is that we understand intimately the solar installer processes and workflows —
                  so we can build better agents. Pricing should just enable us to cover costs and build the Cortex as fast as possible.
                </p>
              </div>
            </div>
          )}

          {/* AGENT STACK */}
          {activeTab === 'stack' && (
            <div className="space-y-6">
              {/* Orchestrators */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-violet-500/20">
                    <Brain className="w-6 h-6 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Orchestrators</h3>
                    <p className="text-sm text-zinc-400">Control and coordinate other agents (e.g., Cortex)</p>
                  </div>
                  <span className="ml-auto px-3 py-1 bg-violet-500/20 text-violet-400 rounded-full text-sm font-medium">
                    {stackData.orchestrators.length}
                  </span>
                </div>
                {stackData.orchestrators.length > 0 ? (
                  <div className="grid gap-2">
                    {stackData.orchestrators.map(p => (
                      <Link
                        key={p.id}
                        href={`/projects/${p.slug}`}
                        className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
                      >
                        <span className="text-white">{p.title}</span>
                        <ArrowUpRight className="w-4 h-4 text-zinc-500" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 text-sm">No orchestrator projects defined yet</p>
                )}
              </div>

              {/* Specialists */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Zap className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Specialists</h3>
                    <p className="text-sm text-zinc-400">Do one thing well (e.g., Quote Generator, Lead Scorer)</p>
                  </div>
                  <span className="ml-auto px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                    {stackData.specialists.length}
                  </span>
                </div>
                {stackData.specialists.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-2">
                    {stackData.specialists.map(p => (
                      <Link
                        key={p.id}
                        href={`/projects/${p.slug}`}
                        className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
                      >
                        <span className="text-white text-sm">{p.title}</span>
                        <ArrowUpRight className="w-4 h-4 text-zinc-500" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 text-sm">No specialist projects defined yet</p>
                )}
              </div>

              {/* Data Collectors */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <Database className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Data Collectors</h3>
                    <p className="text-sm text-zinc-400">Gather data for Cortex (building the moat)</p>
                  </div>
                  <span className="ml-auto px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium">
                    {stackData.dataCollectors.length}
                  </span>
                </div>
                {stackData.dataCollectors.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-2">
                    {stackData.dataCollectors.map(p => (
                      <Link
                        key={p.id}
                        href={`/projects/${p.slug}`}
                        className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
                      >
                        <span className="text-white text-sm">{p.title}</span>
                        <ArrowUpRight className="w-4 h-4 text-zinc-500" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 text-sm">No data collector projects defined yet</p>
                )}
              </div>

              {/* Enablers */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-cyan-500/20">
                    <Shield className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Enablers</h3>
                    <p className="text-sm text-zinc-400">Infrastructure that enables other agents (APIs, data layers)</p>
                  </div>
                  <span className="ml-auto px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-medium">
                    {stackData.enablers.length}
                  </span>
                </div>
                {stackData.enablers.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-2">
                    {stackData.enablers.map(p => (
                      <Link
                        key={p.id}
                        href={`/projects/${p.slug}`}
                        className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
                      >
                        <span className="text-white text-sm">{p.title}</span>
                        <ArrowUpRight className="w-4 h-4 text-zinc-500" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 text-sm">No enabler projects defined yet</p>
                )}
              </div>

              {/* Interfaces */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-amber-500/20">
                    <Users className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Interfaces</h3>
                    <p className="text-sm text-zinc-400">Human-agent interaction points (portals, dashboards)</p>
                  </div>
                  <span className="ml-auto px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium">
                    {stackData.interfaces.length}
                  </span>
                </div>
                {stackData.interfaces.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-2">
                    {stackData.interfaces.map(p => (
                      <Link
                        key={p.id}
                        href={`/projects/${p.slug}`}
                        className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
                      >
                        <span className="text-white text-sm">{p.title}</span>
                        <ArrowUpRight className="w-4 h-4 text-zinc-500" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 text-sm">No interface projects defined yet</p>
                )}
              </div>

              {/* Traditional (not yet agent-ified) */}
              {stackData.traditional.length > 0 && (
                <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 opacity-75">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-zinc-700">
                      <Layers className="w-6 h-6 text-zinc-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Not Yet Agent-Ready</h3>
                      <p className="text-sm text-zinc-400">Projects that need agentification planning</p>
                    </div>
                    <span className="ml-auto px-3 py-1 bg-zinc-700 text-zinc-400 rounded-full text-sm font-medium">
                      {stackData.traditional.length}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500">
                    {stackData.traditional.length} projects need agent role assignment.{' '}
                    <Link href="/projects" className="text-violet-400 hover:underline">
                      Review projects →
                    </Link>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* AGENT-NATIVE PRINCIPLES */}
          {activeTab === 'principles' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-violet-900/20 to-purple-900/20 border border-violet-700/30 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-2">Agent-Native Architecture</h2>
                <p className="text-zinc-400">
                  Instead of encoding features as code, describe outcomes and let AI agents pursue them autonomously.
                  Features are outcomes achieved by an agent operating in a loop.
                </p>
              </div>

              <div className="space-y-3">
                {agentNativePrinciples.map((principle) => {
                  const isExpanded = expandedPrinciple === principle.id;
                  return (
                    <div key={principle.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedPrinciple(isExpanded ? null : principle.id)}
                        className="w-full p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-violet-500/20">
                            <principle.icon className="w-5 h-5 text-violet-400" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-white">{principle.name}</h3>
                            <p className="text-sm text-zinc-400">{principle.description}</p>
                          </div>
                        </div>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-4">
                          <div className="p-4 bg-zinc-800/50 rounded-lg ml-14">
                            <p className="text-sm text-zinc-300">{principle.detail}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Implementation Notes */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Key Implementation Patterns</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">Shared Workspace</h4>
                    <p className="text-sm text-zinc-400">Agents and users work in the same data space. Transparency enables agents to build on user-created content.</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">Context Management</h4>
                    <p className="text-sm text-zinc-400">Maintain persistent state through context files that agents read and update across sessions.</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">Atomic Tools</h4>
                    <p className="text-sm text-zinc-400">Tools are simple primitives. The agent decides how to combine them to achieve outcomes.</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">Explicit Completion</h4>
                    <p className="text-sm text-zinc-400">Agents must declare "I'm done" rather than relying on heuristic detection.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STRATEGIC PILLARS */}
          {activeTab === 'pillars' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Strategic Pillars</h2>
                  <p className="text-sm text-zinc-400">Projects organized by business objectives</p>
                </div>
                <Link
                  href="/settings?tab=pillars"
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Manage Pillars
                </Link>
              </div>

              {pillars.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
                  <Layers className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-400 mb-4">No strategic pillars defined yet</p>
                  <Link
                    href="/settings?tab=pillars"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
                  >
                    Create Pillars
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {pillars.map(pillar => {
                    const pillarProjects = pillarData.grouped[pillar.id] || [];
                    const isExpanded = expandedPillar === pillar.id;
                    const agentReadyCount = pillarProjects.filter(p => p.agent_can_be_agent && p.agent_role !== 'not_agent').length;

                    return (
                      <div
                        key={pillar.id}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
                        style={{ borderLeftColor: pillar.color, borderLeftWidth: '4px' }}
                      >
                        <button
                          onClick={() => setExpandedPillar(isExpanded ? null : pillar.id)}
                          className="w-full p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg" style={{ backgroundColor: pillar.color + '20' }}>
                              <Layers className="w-5 h-5" style={{ color: pillar.color }} />
                            </div>
                            <div className="text-left">
                              <h3 className="font-semibold text-white">{pillar.name}</h3>
                              {pillar.description && (
                                <p className="text-sm text-zinc-400">{pillar.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-sm text-white">{pillarProjects.length} projects</p>
                              <p className="text-xs text-violet-400">{agentReadyCount} agent-ready</p>
                            </div>
                            {isExpanded ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
                          </div>
                        </button>
                        {isExpanded && pillarProjects.length > 0 && (
                          <div className="px-4 pb-4">
                            <div className="grid gap-2">
                              {pillarProjects.map(project => (
                                <Link
                                  key={project.id}
                                  href={`/projects/${project.slug}`}
                                  className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-white">{project.title}</span>
                                    {project.agent_can_be_agent && project.agent_role !== 'not_agent' && (
                                      <span
                                        className={`px-2 py-0.5 text-xs rounded-full bg-${roleColors[project.agent_role]}-500/20 text-${roleColors[project.agent_role]}-400`}
                                      >
                                        {roleLabels[project.agent_role]}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-xs ${
                                      project.status === 'in_progress' ? 'text-yellow-400' :
                                      project.status === 'completed' ? 'text-green-400' : 'text-zinc-500'
                                    }`}>
                                      {project.status}
                                    </span>
                                    <ArrowUpRight className="w-4 h-4 text-zinc-500" />
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Unassigned Projects */}
                  {pillarData.unassigned.length > 0 && (
                    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 opacity-75">
                      <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        <div>
                          <h3 className="font-bold text-white">Unassigned to Pillars</h3>
                          <p className="text-sm text-zinc-400">{pillarData.unassigned.length} projects need pillar assignment</p>
                        </div>
                      </div>
                      <Link href="/projects" className="text-sm text-violet-400 hover:underline">
                        Review and assign →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
