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
  Settings,
  BookOpen,
  Gauge,
  Building2,
  Cpu,
  Network,
  FileCode,
  Puzzle,
  CircleDot,
  Activity,
  MessageSquare,
  Send,
  ThumbsUp,
  ThumbsDown,
  LinkIcon,
  Newspaper,
  Globe,
  TrendingDown,
  Quote,
} from 'lucide-react';
import { Project, Pillar, AgentRole, VisionDocument, VisionAlignment } from '@/types/database';

type TabId = 'thesis' | 'pillars' | 'stack' | 'principles' | 'alignment' | 'research' | 'feedback';

// Industry Research Resources
const RESEARCH_RESOURCES = [
  {
    title: 'Agentic AI Strategy',
    source: 'Deloitte Insights',
    url: 'https://www.deloitte.com/us/en/insights/topics/technology-management/tech-trends/2026/agentic-ai-strategy.html',
    excerpt: 'Getting the fundamentals right—from microservice-based agent architectures to silicon-workforce management—can prepare enterprises for an agent-native business environment.',
    category: 'strategy',
    date: '2026',
  },
  {
    title: '5 Key Trends Shaping Agentic Development',
    source: 'The New Stack',
    url: 'https://thenewstack.io/5-key-trends-shaping-agentic-development-in-2026/',
    excerpt: 'The agentic AI field is going through its microservices revolution. Just as monolithic applications gave way to distributed service architectures, single all-purpose agents are being replaced by orchestrated teams of specialized agents.',
    category: 'technology',
    date: '2026',
  },
  {
    title: 'The Data Moat is the Only Moat',
    source: 'Brim Labs',
    url: 'https://brimlabs.ai/blog/the-data-moat-is-the-only-moat-why-proprietary-data-pipelines-define-the-next-generation-of-ai-startups/',
    excerpt: 'Proprietary data pipelines define the next generation of AI startups. The best moats are data moats, where each incremental customer, data point, or interaction makes the product better.',
    category: 'strategy',
    date: '2025',
  },
  {
    title: 'AI Agents Are Becoming Operating Systems',
    source: 'Klizos',
    url: 'https://klizos.com/ai-agents-are-becoming-operating-systems-in-2026/',
    excerpt: 'By 2026, AI agents will no longer sit at the edges of applications as optional features. They will sit at the center of the software ecosystem, orchestrating workflows and managing interactions.',
    category: 'architecture',
    date: '2026',
  },
  {
    title: 'Vertical SaaS: Transforming Industry-Specific Opportunities',
    source: 'Qubit Capital',
    url: 'https://qubit.capital/blog/rise-vertical-saas-sector-specific-opportunities',
    excerpt: 'Vertical SaaS 2.0 will offer "compound workflows"—integrated platforms solving multiple, interconnected problems for a single industry.',
    category: 'vertical',
    date: '2026',
  },
  {
    title: 'The Next Big Shift in Solar: AI Assistants',
    source: 'Solar Power World',
    url: 'https://www.solarpowerworldonline.com/2025/09/the-next-big-shift-in-the-solar-industry-ai-assistants/',
    excerpt: 'Solar AI assistants are no longer experimental — they are already streamlining critical workflows from site analysis to customer support.',
    category: 'solar',
    date: '2025',
  },
  {
    title: 'Will AI Agents Replace SaaS?',
    source: 'Glean',
    url: 'https://www.glean.com/perspectives/will-ai-agents-replace-saas-tools-as-the-new-operating-layer-of-work',
    excerpt: 'AI agents transforming from supplementary features to the primary interface for enterprise software—a shift that challenges the traditional SaaS business model.',
    category: 'disruption',
    date: '2025',
  },
  {
    title: 'AI Agents + Data Moats = Premium Valuation',
    source: 'Agile Growth Labs',
    url: 'https://www.agilegrowthlabs.com/blog/playbook-ai-agents-data-moats-premium-valuation-multiple',
    excerpt: 'AI agents and data moats create a feedback loop: AI agents generate valuable data, and data moats enhance AI performance, leading to faster growth and higher investor confidence.',
    category: 'investment',
    date: '2025',
  },
];

// Key industry statistics
const INDUSTRY_STATS = [
  { label: 'Agentic AI Market by 2030', value: '$52B', change: '+566%', source: 'Industry analysts' },
  { label: 'Enterprise Apps with AI Agents by 2026', value: '40%', change: 'from 5%', source: 'Gartner' },
  { label: 'Multi-agent System Inquiries', value: '1,445%', change: 'Q1 2024 → Q2 2025', source: 'Gartner' },
  { label: 'Business Software with Agentic AI by 2028', value: '33%', change: 'from <1%', source: 'Gartner' },
];

interface ProjectWithPillar extends Project {
  pillar?: Pillar;
}

const alignmentColors: Record<VisionAlignment, { bg: string; text: string; border: string }> = {
  strong: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  moderate: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  weak: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  misaligned: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
};

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
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [projects, setProjects] = useState<ProjectWithPillar[]>([]);
  const [visionDocs, setVisionDocs] = useState<VisionDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pillarsRes, projectsRes, visionRes] = await Promise.all([
        fetch('/api/pillars'),
        fetch('/api/projects'),
        fetch('/api/vision'),
      ]);

      if (pillarsRes.ok) {
        const pillarsData = await pillarsRes.json();
        setPillars(pillarsData);
      }

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(projectsData.projects || projectsData || []);
      }

      if (visionRes.ok) {
        const visionData = await visionRes.json();
        setVisionDocs(visionData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get vision documents by category
  const getDocsByCategory = (category: string) => visionDocs.filter(d => d.category === category);

  // Statistics calculations
  const getStats = () => {
    const agentProjects = projects.filter(p => p.agent_can_be_agent && p.agent_role !== 'not_agent');
    const dataProjects = projects.filter(p => p.agent_generates_proprietary_data || (p.agent_data_moat && p.agent_data_moat !== 'none'));

    return {
      total: projects.length,
      agentReady: agentProjects.length,
      dataProjects: dataProjects.length,
      orchestrators: projects.filter(p => p.agent_role === 'orchestrator'),
      specialists: projects.filter(p => p.agent_role === 'specialist'),
      dataCollectors: projects.filter(p => p.agent_role === 'data_collector'),
      enablers: projects.filter(p => p.agent_role === 'enabler'),
      interfaces: projects.filter(p => p.agent_role === 'interface'),
      traditional: projects.filter(p => !p.agent_can_be_agent || p.agent_role === 'not_agent'),
      strongAlignment: projects.filter(p => p.vision_alignment === 'strong'),
      moderateAlignment: projects.filter(p => p.vision_alignment === 'moderate'),
      weakAlignment: projects.filter(p => p.vision_alignment === 'weak'),
      misaligned: projects.filter(p => p.vision_alignment === 'misaligned'),
      unassessed: projects.filter(p => !p.vision_alignment),
    };
  };

  const stats = getStats();

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
    { id: 'pillars' as TabId, label: 'Three Pillars', icon: Building2 },
    { id: 'stack' as TabId, label: 'Agent Stack', icon: Bot },
    { id: 'principles' as TabId, label: 'Agent-Native', icon: Sparkles },
    { id: 'alignment' as TabId, label: 'Alignment', icon: Target },
    { id: 'research' as TabId, label: 'Industry Research', icon: Newspaper },
    { id: 'feedback' as TabId, label: 'Feedback', icon: MessageSquare },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  const coreThesis = visionDocs.find(d => d.slug === 'core-thesis');
  const strategicImperative = visionDocs.find(d => d.slug === 'strategic-imperative');
  const principles = getDocsByCategory('principle');
  const patterns = getDocsByCategory('pattern');
  const valueShifts = getDocsByCategory('imperative');

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/30">
                <Eye className="w-8 h-8 text-violet-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Strategic Vision</h1>
                <p className="text-zinc-400">Building for the agent-native future</p>
              </div>
            </div>
            <Link
              href="/api/vision/summary"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors text-sm"
            >
              <FileCode className="w-4 h-4" />
              API for Agents
            </Link>
          </div>

          {/* Quote banner */}
          <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-700/30 rounded-xl p-4 mb-6">
            <p className="text-amber-200/90 italic text-lg">
              "SaaS isn't dead. The easy SaaS moat is dead. The value is moving — from companies that captured value by being the middleman, to companies that capture value through execution, data, and infrastructure."
            </p>
          </div>

          {/* Quick Stats - Updated to show alignment */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
              <div className="flex items-center gap-2 text-zinc-400 mb-1">
                <Target className="w-4 h-4" />
                <span className="text-xs">Projects</span>
              </div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs">Strong Align</span>
              </div>
              <p className="text-2xl font-bold text-emerald-400">{stats.strongAlignment.length}</p>
            </div>
            <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-3">
              <div className="flex items-center gap-2 text-violet-400 mb-1">
                <Bot className="w-4 h-4" />
                <span className="text-xs">Agent-Ready</span>
              </div>
              <p className="text-2xl font-bold text-violet-400">{stats.agentReady}</p>
            </div>
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3">
              <div className="flex items-center gap-2 text-cyan-400 mb-1">
                <Database className="w-4 h-4" />
                <span className="text-xs">Data Moat</span>
              </div>
              <p className="text-2xl font-bold text-cyan-400">{stats.dataProjects}</p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
              <div className="flex items-center gap-2 text-yellow-400 mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs">Unassessed</span>
              </div>
              <p className="text-2xl font-bold text-yellow-400">{stats.unassessed.length}</p>
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
              {/* The Problem */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  The Problem We're Solving
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <Database className="w-6 h-6 text-red-400 mb-2" />
                    <h3 className="font-semibold text-white mb-1">Data in Silos</h3>
                    <p className="text-sm text-zinc-400">Zoho, Sheets, WhatsApp, Aircall — information scattered everywhere.</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <Target className="w-6 h-6 text-red-400 mb-2" />
                    <h3 className="font-semibold text-white mb-1">SDRs Flying Blind</h3>
                    <p className="text-sm text-zinc-400">No way to know which lead to call next or which installer is available.</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <Gauge className="w-6 h-6 text-red-400 mb-2" />
                    <h3 className="font-semibold text-white mb-1">Can't Measure What Works</h3>
                    <p className="text-sm text-zinc-400">Spending on ads without knowing which campaigns actually convert.</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <Activity className="w-6 h-6 text-red-400 mb-2" />
                    <h3 className="font-semibold text-white mb-1">Manual Doesn't Scale</h3>
                    <p className="text-sm text-zinc-400">More leads = more chaos. Growth is limited by operational capacity.</p>
                  </div>
                </div>
              </div>

              {/* The Thin Middle Squeeze */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  The Thin Middle Squeeze
                </h2>
                <p className="text-zinc-400 mb-6">
                  {coreThesis?.summary || 'Value moves to agent layer (execution) and data layer (proprietary data). The UI/SaaS "thin middle" gets crushed.'}
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
                              <strong>Abeto:</strong> {stats.orchestrators.length} orchestrators, {stats.specialists.length} specialists, {stats.dataCollectors.length} data collectors, {stats.interfaces.length} interfaces
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
                          <p className="text-xs text-red-300 mt-2">Traditional dashboards and workflows become shells for agent actions.</p>
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
                              <strong>Cortex:</strong> {stats.dataProjects} projects feeding proprietary data
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
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-red-400 line-through text-sm">Per-seat pricing</span>
                      <ArrowRight className="w-3 h-3 text-zinc-500" />
                      <span className="text-emerald-400 font-medium text-sm">Outcome-based</span>
                    </div>
                    <p className="text-xs text-zinc-500">$5 per contract reviewed, $2 per ticket resolved</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-red-400 line-through text-sm">UI as product</span>
                      <ArrowRight className="w-3 h-3 text-zinc-500" />
                      <span className="text-emerald-400 font-medium text-sm">Execution as product</span>
                    </div>
                    <p className="text-xs text-zinc-500">Don't show a dashboard — do the work</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-red-400 line-through text-sm">Feature roadmaps</span>
                      <ArrowRight className="w-3 h-3 text-zinc-500" />
                      <span className="text-emerald-400 font-medium text-sm">Emergent capabilities</span>
                    </div>
                    <p className="text-xs text-zinc-500">Discover needs through agent behavior</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-red-400 line-through text-sm">Switching costs</span>
                      <ArrowRight className="w-3 h-3 text-zinc-500" />
                      <span className="text-emerald-400 font-medium text-sm">Data ownership</span>
                    </div>
                    <p className="text-xs text-zinc-500">The moat is the data, not the interface</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-red-400 line-through text-sm">Headcount growth</span>
                      <ArrowRight className="w-3 h-3 text-zinc-500" />
                      <span className="text-emerald-400 font-medium text-sm">Agent efficiency</span>
                    </div>
                    <p className="text-xs text-zinc-500">10 agents do the work of 100 employees</p>
                  </div>
                </div>
              </div>

              {/* Strategic Imperative */}
              <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-700/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
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

          {/* THREE PILLARS */}
          {activeTab === 'pillars' && (
            <div className="space-y-6">
              {/* Intro */}
              <div className="bg-gradient-to-r from-violet-900/20 to-purple-900/20 border border-violet-700/30 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-2">The Three Pillars of Scalable Growth</h2>
                <p className="text-zinc-400">
                  Build in order. Each layer enables the next. You can't scale chaos.
                </p>
              </div>

              {/* Pillar 1: Data Foundation */}
              <div className="bg-zinc-900 border-l-4 border-emerald-500 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-emerald-500/20">
                    <Database className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">1. Data Foundation</h3>
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded">Building Now</span>
                    </div>
                    <p className="text-zinc-400 mb-4">
                      <strong>What:</strong> Reliable APIs, unified data layer, quality monitoring<br />
                      <strong>Why:</strong> Every AI feature, every dashboard, every automation depends on this. No foundation = no building.
                    </p>
                    <div className="bg-zinc-800/50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-zinc-300">
                        <span className="text-emerald-400">💡 Example:</span> Without knowing which installer is available and their performance history, we can't route leads intelligently.
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-zinc-500">
                        {pillarData.grouped[pillars.find(p => p.name.toLowerCase().includes('data'))?.id || '']?.length || 0} projects assigned
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pillar 2: Knowledge Generation */}
              <div className="bg-zinc-900 border-l-4 border-violet-500 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-violet-500/20">
                    <Brain className="w-8 h-8 text-violet-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">2. Knowledge Generation</h3>
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">Next Phase</span>
                    </div>
                    <p className="text-zinc-400 mb-4">
                      <strong>What:</strong> Tools that CREATE data while doing their job<br />
                      <strong>Why:</strong> The more leads we generate, the more data we have, the smarter our systems become. Growth feeds intelligence.
                    </p>
                    <div className="bg-zinc-800/50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-zinc-300">
                        <span className="text-violet-400">💡 Example:</span> SDR Portal captures call outcomes → AI learns which questions close deals → Future calls improve.
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-zinc-500">
                        {pillarData.grouped[pillars.find(p => p.name.toLowerCase().includes('knowledge'))?.id || '']?.length || 0} projects assigned
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pillar 3: Human Empowerment */}
              <div className="bg-zinc-900 border-l-4 border-amber-500 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-amber-500/20">
                    <Users className="w-8 h-8 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">3. Human Empowerment</h3>
                      <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded">The Goal</span>
                    </div>
                    <p className="text-zinc-400 mb-4">
                      <strong>What:</strong> AI copilots that amplify human capability<br />
                      <strong>Why:</strong> SDRs focus on relationships, not data entry. Managers see trends, not spreadsheets. Humans do what humans do best.
                    </p>
                    <div className="bg-zinc-800/50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-zinc-300">
                        <span className="text-amber-400">💡 Example:</span> Cortex summarizes 10 WhatsApp messages into 2-line context before the call. SDR walks in prepared.
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-zinc-500">
                        {pillarData.grouped[pillars.find(p => p.name.toLowerCase().includes('human'))?.id || '']?.length || 0} projects assigned
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dependency Flow */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Network className="w-5 h-5 text-blue-400" />
                  Why Order Matters
                </h3>
                <p className="text-zinc-400 mb-4">Each tool depends on the one before it. Skip a step and nothing works.</p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-center">
                      <Database className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                      <p className="text-sm text-emerald-400 font-medium">Unified Data Layer</p>
                      <p className="text-xs text-zinc-500">The source of truth</p>
                    </div>
                    <div className="text-center text-zinc-500">↓</div>
                    <div className="bg-zinc-800 rounded-lg p-2 text-center text-xs text-zinc-400">
                      Reporting Hub • SDR Portal • Campaign OS
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-3 text-center">
                      <Brain className="w-5 h-5 text-violet-400 mx-auto mb-1" />
                      <p className="text-sm text-violet-400 font-medium">AI Cortex</p>
                      <p className="text-xs text-zinc-500">The shared brain</p>
                    </div>
                    <div className="text-center text-zinc-500">↓</div>
                    <div className="bg-zinc-800 rounded-lg p-2 text-center text-xs text-zinc-400">
                      AI Optimization • Auto-allocate • Predictions
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-center">
                      <Users className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                      <p className="text-sm text-amber-400 font-medium">Human + AI</p>
                      <p className="text-xs text-zinc-500">Amplified capability</p>
                    </div>
                    <div className="text-center text-zinc-500">↓</div>
                    <div className="bg-zinc-800 rounded-lg p-2 text-center text-xs text-zinc-400">
                      3x productivity • Zero burnout • Full context
                    </div>
                  </div>
                </div>
              </div>

              {/* Manage Pillars Link */}
              <div className="flex justify-end">
                <Link
                  href="/settings?tab=pillars"
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm"
                >
                  <Settings className="w-4 h-4" />
                  Manage Pillars
                </Link>
              </div>
            </div>
          )}

          {/* AGENT STACK */}
          {activeTab === 'stack' && (
            <div className="space-y-6">
              {/* Intro */}
              <div className="bg-gradient-to-r from-violet-900/20 to-purple-900/20 border border-violet-700/30 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-2">The Agent Stack</h2>
                <p className="text-zinc-400">
                  Projects organized by their role in the agent architecture. Each type serves a specific function in the agent-native system.
                </p>
              </div>

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
                    {stats.orchestrators.length}
                  </span>
                </div>
                {stats.orchestrators.length > 0 ? (
                  <div className="grid gap-2">
                    {stats.orchestrators.map(p => (
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
                    {stats.specialists.length}
                  </span>
                </div>
                {stats.specialists.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-2">
                    {stats.specialists.map(p => (
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
                    {stats.dataCollectors.length}
                  </span>
                </div>
                {stats.dataCollectors.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-2">
                    {stats.dataCollectors.map(p => (
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
                  <p className="text-zinc-500 text-sm">No data collector projects defined yet — <span className="text-emerald-400">critical for building the data moat!</span></p>
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
                    {stats.enablers.length}
                  </span>
                </div>
                {stats.enablers.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-2">
                    {stats.enablers.map(p => (
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
                    {stats.interfaces.length}
                  </span>
                </div>
                {stats.interfaces.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-2">
                    {stats.interfaces.map(p => (
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

              {/* Not Yet Agent-Ready */}
              {stats.traditional.length > 0 && (
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
                      {stats.traditional.length}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500">
                    {stats.traditional.length} projects need agent role assignment.{' '}
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

              {/* Principles */}
              <div className="space-y-3">
                {[
                  { id: 'parity', name: 'Parity', icon: GitMerge, color: 'violet',
                    summary: 'Agents must accomplish whatever users can do through the interface.',
                    detail: 'If the UI supports an action, the agent needs tools to achieve that outcome. No second-class citizens. The test: Pick any UI action. Can the agent accomplish it?' },
                  { id: 'granularity', name: 'Granularity', icon: Puzzle, color: 'blue',
                    summary: 'Tools should be atomic primitives, not bundles of decision logic.',
                    detail: 'The agent makes the decisions; prompts describe the outcome. Keep tools simple and composable. The test: To change behavior, do you edit prompts or refactor code?' },
                  { id: 'composability', name: 'Composability', icon: Layers, color: 'cyan',
                    summary: 'New features emerge by writing new prompts, not shipping code.',
                    detail: 'With atomic tools and parity established, capabilities multiply through combination. Want a "weekly review" feature? That\'s just a prompt describing the outcome.' },
                  { id: 'emergence', name: 'Emergent Capability', icon: Sparkles, color: 'amber',
                    summary: 'Agents accomplish unanticipated tasks by combining tools creatively.',
                    detail: 'This reveals latent user demands that traditional product development would never discover. You\'re creating a capable foundation and learning from what emerges.' },
                  { id: 'improvement', name: 'Continuous Improvement', icon: TrendingUp, color: 'emerald',
                    summary: 'Applications improve through accumulated context and refined prompts.',
                    detail: 'No code updates needed. Accumulated context persists across sessions. Prompts can be refined at developer and user levels. The system learns through use.' },
                ].map((principle) => {
                  const isExpanded = expandedSection === principle.id;
                  const Icon = principle.icon;
                  return (
                    <div key={principle.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedSection(isExpanded ? null : principle.id)}
                        className="w-full p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg bg-${principle.color}-500/20`}>
                            <Icon className={`w-5 h-5 text-${principle.color}-400`} />
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-white">{principle.name}</h3>
                            <p className="text-sm text-zinc-400">{principle.summary}</p>
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

              {/* Implementation Patterns */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Key Implementation Patterns</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                      <CircleDot className="w-4 h-4 text-violet-400" />
                      Shared Workspace
                    </h4>
                    <p className="text-sm text-zinc-400">Agents and users work in the same data space. Transparency enables agents to build on user-created content.</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-400" />
                      Context Management
                    </h4>
                    <p className="text-sm text-zinc-400">Maintain persistent state through context files that agents read and update across sessions.</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-cyan-400" />
                      Atomic Tools
                    </h4>
                    <p className="text-sm text-zinc-400">Tools are simple primitives. The agent decides how to combine them to achieve outcomes.</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Explicit Completion
                    </h4>
                    <p className="text-sm text-zinc-400">Agents must declare "I'm done" rather than relying on heuristic detection.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ALIGNMENT */}
          {activeTab === 'alignment' && (
            <div className="space-y-6">
              {/* Intro */}
              <div className="bg-gradient-to-r from-emerald-900/20 to-green-900/20 border border-emerald-700/30 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-2">Vision Alignment</h2>
                <p className="text-zinc-400">
                  How well each project contributes to the strategic vision. A project is vision-aligned if it:
                  (1) builds agent capability, (2) collects proprietary data, or (3) enables human-agent collaboration.
                </p>
              </div>

              {/* Alignment Summary */}
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Strong</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.strongAlignment.length}</p>
                  <p className="text-xs text-zinc-500 mt-1">Core to the vision</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CircleDot className="w-5 h-5 text-blue-400" />
                    <span className="text-blue-400 font-medium">Moderate</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.moderateAlignment.length}</p>
                  <p className="text-xs text-zinc-500 mt-1">Supports the vision</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-400 font-medium">Weak</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.weakAlignment.length}</p>
                  <p className="text-xs text-zinc-500 mt-1">Tangential</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 font-medium">Misaligned</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.misaligned.length}</p>
                  <p className="text-xs text-zinc-500 mt-1">Reconsider priority</p>
                </div>
              </div>

              {/* Strongly Aligned Projects */}
              {stats.strongAlignment.length > 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    Strongly Aligned Projects
                  </h3>
                  <div className="space-y-2">
                    {stats.strongAlignment.map(p => (
                      <Link
                        key={p.id}
                        href={`/projects/${p.slug}`}
                        className="flex items-center justify-between p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/10 transition-colors"
                      >
                        <div>
                          <span className="text-white">{p.title}</span>
                          {p.vision_alignment_reason && (
                            <p className="text-xs text-zinc-400 mt-1">{p.vision_alignment_reason}</p>
                          )}
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Unassessed Projects */}
              {stats.unassessed.length > 0 && (
                <div className="bg-zinc-900 border border-yellow-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    Needs Assessment ({stats.unassessed.length})
                  </h3>
                  <p className="text-zinc-400 mb-4 text-sm">
                    These projects haven't been evaluated for vision alignment yet. Review each project and assign an alignment score.
                  </p>
                  <div className="grid md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {stats.unassessed.slice(0, 20).map(p => (
                      <Link
                        key={p.id}
                        href={`/projects/${p.slug}`}
                        className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
                      >
                        <span className="text-white text-sm truncate">{p.title}</span>
                        <ArrowUpRight className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                  {stats.unassessed.length > 20 && (
                    <p className="text-sm text-zinc-500 mt-3">
                      And {stats.unassessed.length - 20} more...{' '}
                      <Link href="/projects" className="text-violet-400 hover:underline">View all</Link>
                    </p>
                  )}
                </div>
              )}

              {/* Misaligned Projects */}
              {stats.misaligned.length > 0 && (
                <div className="bg-zinc-900 border border-red-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    Misaligned Projects
                  </h3>
                  <p className="text-zinc-400 mb-4 text-sm">
                    These projects may not contribute to the strategic vision. Consider deprioritizing or reframing them.
                  </p>
                  <div className="space-y-2">
                    {stats.misaligned.map(p => (
                      <Link
                        key={p.id}
                        href={`/projects/${p.slug}`}
                        className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        <div>
                          <span className="text-white">{p.title}</span>
                          {p.vision_alignment_reason && (
                            <p className="text-xs text-zinc-400 mt-1">{p.vision_alignment_reason}</p>
                          )}
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-red-400" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Guidance */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-400" />
                  Alignment Criteria
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4">
                    <h4 className="font-medium text-emerald-400 mb-2">Strong Alignment</h4>
                    <ul className="text-sm text-zinc-400 space-y-1">
                      <li>• Directly builds agent capability</li>
                      <li>• Collects proprietary data for Cortex</li>
                      <li>• Enables data foundation</li>
                      <li>• Creates defensible moat</li>
                    </ul>
                  </div>
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
                    <h4 className="font-medium text-blue-400 mb-2">Moderate Alignment</h4>
                    <ul className="text-sm text-zinc-400 space-y-1">
                      <li>• Supports human-agent collaboration</li>
                      <li>• Improves operational efficiency</li>
                      <li>• Generates useful analytics</li>
                      <li>• Can be agent-ified later</li>
                    </ul>
                  </div>
                  <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-400 mb-2">Weak Alignment</h4>
                    <ul className="text-sm text-zinc-400 space-y-1">
                      <li>• Pure UI/dashboard project</li>
                      <li>• Doesn't generate learning data</li>
                      <li>• No path to agentification</li>
                      <li>• Limited defensibility</li>
                    </ul>
                  </div>
                  <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                    <h4 className="font-medium text-red-400 mb-2">Misaligned</h4>
                    <ul className="text-sm text-zinc-400 space-y-1">
                      <li>• Works against agent architecture</li>
                      <li>• Builds non-defensible features</li>
                      <li>• Adds complexity without value</li>
                      <li>• Should be reconsidered</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* INDUSTRY RESEARCH */}
          {activeTab === 'research' && (
            <div className="space-y-6">
              {/* Intro */}
              <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-700/30 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <Globe className="w-6 h-6 text-blue-400" />
                  Industry Research & Trends
                </h2>
                <p className="text-zinc-400">
                  Curated research validating our strategic direction. The agentic AI revolution isn't coming — it's here.
                  Gartner predicts 40% of enterprise applications will embed AI agents by end of 2026.
                </p>
              </div>

              {/* Key Statistics */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Key Industry Statistics
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {INDUSTRY_STATS.map((stat, index) => (
                    <div key={index} className="bg-zinc-800/50 rounded-lg p-4">
                      <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                      <p className="text-sm text-zinc-400">{stat.label}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-emerald-400">{stat.change}</span>
                        <span className="text-xs text-zinc-500">• {stat.source}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Insight Banner */}
              <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-600/30 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <Quote className="w-8 h-8 text-amber-400 flex-shrink-0" />
                  <div>
                    <p className="text-amber-100 text-lg italic mb-2">
                      "A three-tier ecosystem is forming around agentic AI: Tier 1 hyperscalers providing infrastructure,
                      Tier 2 established vendors embedding agents into existing platforms, and an emerging Tier 3 of
                      'agent-native' startups building with agent-first architectures from the ground up."
                    </p>
                    <p className="text-amber-400 text-sm font-medium">— Industry Analysis, 2026</p>
                    <p className="text-zinc-400 text-sm mt-2">
                      <strong>Abeto is Tier 3</strong> — we're not adding AI to existing software. We're building agent-native from day one.
                    </p>
                  </div>
                </div>
              </div>

              {/* Research Articles */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-violet-400" />
                  Research & Articles
                </h3>
                <div className="space-y-4">
                  {RESEARCH_RESOURCES.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-zinc-800/50 rounded-lg p-4 hover:bg-zinc-800 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              resource.category === 'strategy' ? 'bg-violet-500/20 text-violet-400' :
                              resource.category === 'technology' ? 'bg-blue-500/20 text-blue-400' :
                              resource.category === 'solar' ? 'bg-amber-500/20 text-amber-400' :
                              resource.category === 'vertical' ? 'bg-cyan-500/20 text-cyan-400' :
                              resource.category === 'disruption' ? 'bg-red-500/20 text-red-400' :
                              resource.category === 'investment' ? 'bg-emerald-500/20 text-emerald-400' :
                              'bg-zinc-500/20 text-zinc-400'
                            }`}>
                              {resource.category}
                            </span>
                            <span className="text-xs text-zinc-500">{resource.date}</span>
                          </div>
                          <h4 className="font-medium text-white group-hover:text-violet-400 transition-colors">
                            {resource.title}
                          </h4>
                          <p className="text-sm text-zinc-500 mt-1">{resource.source}</p>
                          <p className="text-sm text-zinc-400 mt-2">{resource.excerpt}</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-violet-400 flex-shrink-0" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Relevance to Abeto */}
              <div className="bg-zinc-900 border border-emerald-500/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-400" />
                  Why This Validates Our Vision
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">We're Building Tier 3</h4>
                    <p className="text-sm text-zinc-400">
                      While others retrofit AI onto existing software, we're building agent-native from the ground up.
                      Our architecture assumes agents as primary actors, not add-ons.
                    </p>
                  </div>
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">Data Moat Focus is Correct</h4>
                    <p className="text-sm text-zinc-400">
                      Industry consensus: "The best moats are data moats." Our Cortex strategy — collecting proprietary
                      installer workflow data — creates compounding defensibility.
                    </p>
                  </div>
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">Vertical SaaS 2.0 = Us</h4>
                    <p className="text-sm text-zinc-400">
                      The industry predicts "compound workflows" for vertical SaaS — integrated platforms solving multiple
                      problems for one industry. That's exactly what we're building for solar installers.
                    </p>
                  </div>
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">Multi-Agent is the Future</h4>
                    <p className="text-sm text-zinc-400">
                      1,445% surge in multi-agent system inquiries. Our orchestrator/specialist/enabler architecture
                      is aligned with where the industry is heading — coordinated agent teams, not monolithic AI.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FEEDBACK TAB */}
          {activeTab === 'feedback' && (
            <div className="space-y-6">
              {/* Intro */}
              <div className="bg-gradient-to-r from-violet-900/20 to-purple-900/20 border border-violet-700/30 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-violet-400" />
                  Shape Our Vision
                </h2>
                <p className="text-zinc-400">
                  Our vision isn't set in stone. Challenge our assumptions, suggest improvements, share articles,
                  or propose alternative directions. The best ideas win.
                </p>
              </div>

              {/* How to Contribute */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <div className="p-2 rounded-lg bg-emerald-500/20 w-fit mb-3">
                    <ThumbsUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Support an Idea</h3>
                  <p className="text-sm text-zinc-400">
                    See something that resonates? Leave a comment supporting the direction with your reasoning.
                  </p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <div className="p-2 rounded-lg bg-red-500/20 w-fit mb-3">
                    <ThumbsDown className="w-5 h-5 text-red-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Challenge an Assumption</h3>
                  <p className="text-sm text-zinc-400">
                    Think we're wrong about something? Challenge our assumptions with evidence or alternative views.
                  </p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <div className="p-2 rounded-lg bg-blue-500/20 w-fit mb-3">
                    <LinkIcon className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Share Resources</h3>
                  <p className="text-sm text-zinc-400">
                    Found a relevant article, research, or case study? Share it so we can incorporate the insights.
                  </p>
                </div>
              </div>

              {/* Discussion Areas */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-400" />
                  Open Questions for Discussion
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      topic: 'Agent Autonomy Level',
                      question: 'How autonomous should our agents be? Full autonomy with human oversight, or human-in-the-loop for key decisions?',
                      status: 'open',
                    },
                    {
                      topic: 'Data Moat vs Workflow Lock-in',
                      question: 'Should we prioritize proprietary data collection or deep workflow integration? Can we do both equally well?',
                      status: 'open',
                    },
                    {
                      topic: 'Pricing Model',
                      question: 'Outcome-based pricing ($X per lead qualified) vs. subscription? What aligns incentives best?',
                      status: 'open',
                    },
                    {
                      topic: 'Build vs Buy for AI Infrastructure',
                      question: 'Should we build our own agent orchestration or use existing platforms like LangChain, AutoGPT?',
                      status: 'open',
                    },
                  ].map((item, index) => (
                    <div key={index} className="bg-zinc-800/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">{item.topic}</span>
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-400">
                          {item.status}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-400">{item.question}</p>
                      <Link
                        href="/activity"
                        className="inline-flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 mt-2"
                      >
                        View discussion <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Feedback Form Placeholder */}
              <div className="bg-zinc-900 border border-violet-500/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Send className="w-5 h-5 text-violet-400" />
                  Submit Feedback
                </h3>
                <p className="text-zinc-400 mb-4 text-sm">
                  Use the comment system on any project or task to share your thoughts. All vision-related comments
                  are reviewed by leadership and incorporated into our strategic planning.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">💡 Suggestion</h4>
                    <p className="text-xs text-zinc-400 mb-3">For new ideas or improvements to the vision</p>
                    <p className="text-xs text-zinc-500">
                      Add a comment with <span className="text-violet-400">[SUGGESTION]</span> prefix
                    </p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">🔍 Challenge</h4>
                    <p className="text-xs text-zinc-400 mb-3">For questioning assumptions or approaches</p>
                    <p className="text-xs text-zinc-500">
                      Add a comment with <span className="text-red-400">[CHALLENGE]</span> prefix
                    </p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">📚 Resource</h4>
                    <p className="text-xs text-zinc-400 mb-3">For sharing relevant articles or research</p>
                    <p className="text-xs text-zinc-500">
                      Add a comment with <span className="text-blue-400">[RESOURCE]</span> prefix
                    </p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">❓ Question</h4>
                    <p className="text-xs text-zinc-400 mb-3">For clarification or understanding</p>
                    <p className="text-xs text-zinc-500">
                      Add a comment with <span className="text-amber-400">[QUESTION]</span> prefix
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-violet-500/10 border border-violet-500/20 rounded-lg">
                  <p className="text-sm text-violet-300">
                    <strong>Coming soon:</strong> Direct feedback submission form and vision discussion board.
                    For now, use the Activity page or project comments to share your thoughts.
                  </p>
                </div>
              </div>

              {/* Recent Feedback */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  How Feedback Shapes Our Vision
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-zinc-400">All feedback is reviewed within 48 hours</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-zinc-400">Valid challenges trigger strategic review sessions</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-zinc-400">Accepted suggestions are tracked as vision updates</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-zinc-400">Contributors are credited in quarterly vision reviews</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
