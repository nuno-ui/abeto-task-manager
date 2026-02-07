'use client';

import { Bot, Brain, Wrench, Target, Link2, Database, Shield, Zap, ArrowRight } from 'lucide-react';
import type { Project, AgentRole, AutonomyLevel, DataMoatType } from '@/types/database';

interface AgentProfileProps {
  project: Project;
}

const ROLE_LABELS: Record<AgentRole, { label: string; color: string; icon: string }> = {
  orchestrator: { label: 'Orchestrator', color: 'violet', icon: '🎭' },
  specialist: { label: 'Specialist', color: 'blue', icon: '🎯' },
  data_collector: { label: 'Data Collector', color: 'cyan', icon: '📊' },
  interface: { label: 'Interface', color: 'green', icon: '🖥️' },
  enabler: { label: 'Enabler', color: 'orange', icon: '⚡' },
  not_agent: { label: 'Not an Agent', color: 'zinc', icon: '📦' },
};

const AUTONOMY_LABELS: Record<AutonomyLevel, { label: string; color: string; level: number }> = {
  manual: { label: 'Manual', color: 'red', level: 1 },
  assisted: { label: 'AI Assisted', color: 'yellow', level: 2 },
  autonomous: { label: 'Autonomous', color: 'blue', level: 3 },
  fully_autonomous: { label: 'Fully Autonomous', color: 'green', level: 4 },
};

const MOAT_LABELS: Record<DataMoatType, string> = {
  workflow_patterns: 'Workflow Patterns',
  customer_insights: 'Customer Insights',
  market_intelligence: 'Market Intelligence',
  performance_data: 'Performance Data',
  relationship_data: 'Relationship Data',
  none: 'None',
};

export function AgentProfile({ project }: AgentProfileProps) {
  // Don't render if not an agent
  if (!project.agent_can_be_agent) {
    return null;
  }

  const role = ROLE_LABELS[project.agent_role] || ROLE_LABELS.not_agent;
  const currentAutonomy = AUTONOMY_LABELS[project.agent_autonomy_current] || AUTONOMY_LABELS.manual;
  const targetAutonomy = AUTONOMY_LABELS[project.agent_autonomy_target] || AUTONOMY_LABELS.autonomous;
  const dataMoat = MOAT_LABELS[project.agent_data_moat] || 'None';

  return (
    <div className="bg-gradient-to-br from-violet-900/20 via-blue-900/10 to-cyan-900/10 border border-violet-800/30 rounded-xl p-6">
      <h3 className="text-sm font-medium text-violet-400 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Bot className="w-4 h-4" />
        Agent Profile
      </h3>

      {/* Agent Identity */}
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-16 h-16 rounded-xl bg-${role.color}-900/30 border border-${role.color}-700/50 flex items-center justify-center text-3xl`}>
          {role.icon}
        </div>
        <div>
          <h4 className="text-xl font-semibold text-white">
            {project.agent_name || 'Unnamed Agent'}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-0.5 rounded text-xs font-medium bg-${role.color}-900/40 text-${role.color}-300 border border-${role.color}-700/30`}>
              {role.label}
            </span>
            {project.agent_defensibility_score && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-900/40 text-amber-300 border border-amber-700/30 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Defensibility: {project.agent_defensibility_score}/5
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Autonomy Progress */}
      <div className="mb-6 bg-zinc-900/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-zinc-400">Autonomy Level</span>
          <div className="flex items-center gap-2 text-xs">
            <span className={`text-${currentAutonomy.color}-400`}>{currentAutonomy.label}</span>
            <ArrowRight className="w-3 h-3 text-zinc-500" />
            <span className={`text-${targetAutonomy.color}-400`}>{targetAutonomy.label}</span>
          </div>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r from-${currentAutonomy.color}-500 to-${targetAutonomy.color}-500 transition-all`}
            style={{ width: `${(currentAutonomy.level / 4) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-zinc-500">
          <span>Manual</span>
          <span>Assisted</span>
          <span>Autonomous</span>
          <span>Full Auto</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Tools Provided */}
        {project.agent_tools_provided && project.agent_tools_provided.length > 0 && (
          <div className="bg-zinc-900/50 rounded-lg p-4">
            <h5 className="text-xs font-medium text-emerald-400 uppercase flex items-center gap-1 mb-2">
              <Wrench className="w-3 h-3" />
              Tools Provided
            </h5>
            <ul className="space-y-1">
              {project.agent_tools_provided.map((tool, idx) => (
                <li key={idx} className="text-xs text-zinc-300 font-mono bg-emerald-900/20 px-2 py-1 rounded">
                  {tool}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tools Required */}
        {project.agent_tools_required && project.agent_tools_required.length > 0 && (
          <div className="bg-zinc-900/50 rounded-lg p-4">
            <h5 className="text-xs font-medium text-orange-400 uppercase flex items-center gap-1 mb-2">
              <Wrench className="w-3 h-3" />
              Tools Required
            </h5>
            <ul className="space-y-1">
              {project.agent_tools_required.map((tool, idx) => (
                <li key={idx} className="text-xs text-zinc-300 font-mono bg-orange-900/20 px-2 py-1 rounded">
                  {tool}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Autonomous Outcomes */}
      {project.agent_autonomous_outcomes && project.agent_autonomous_outcomes.length > 0 && (
        <div className="mt-4 bg-zinc-900/50 rounded-lg p-4">
          <h5 className="text-xs font-medium text-blue-400 uppercase flex items-center gap-1 mb-2">
            <Target className="w-3 h-3" />
            Autonomous Outcomes
          </h5>
          <ul className="grid md:grid-cols-2 gap-2">
            {project.agent_autonomous_outcomes.map((outcome, idx) => (
              <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2">
                <Zap className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                {outcome}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cortex Connection */}
      {((project.agent_cortex_feeds && project.agent_cortex_feeds.length > 0) ||
        (project.agent_cortex_consumes && project.agent_cortex_consumes.length > 0)) && (
        <div className="mt-4 bg-zinc-900/50 rounded-lg p-4">
          <h5 className="text-xs font-medium text-cyan-400 uppercase flex items-center gap-1 mb-3">
            <Brain className="w-3 h-3" />
            Cortex Connection
          </h5>
          <div className="grid md:grid-cols-2 gap-4">
            {project.agent_cortex_feeds && project.agent_cortex_feeds.length > 0 && (
              <div>
                <span className="text-[10px] text-zinc-500 uppercase">Feeds to Cortex:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {project.agent_cortex_feeds.map((feed, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-green-900/30 text-green-300 text-[10px] rounded">
                      ↑ {feed}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {project.agent_cortex_consumes && project.agent_cortex_consumes.length > 0 && (
              <div>
                <span className="text-[10px] text-zinc-500 uppercase">Consumes from Cortex:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {project.agent_cortex_consumes.map((consume, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-blue-900/30 text-blue-300 text-[10px] rounded">
                      ↓ {consume}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Agent Relationships */}
      {((project.agent_delegates_to && project.agent_delegates_to.length > 0) ||
        (project.agent_called_by && project.agent_called_by.length > 0) ||
        (project.agent_shares_context_with && project.agent_shares_context_with.length > 0)) && (
        <div className="mt-4 bg-zinc-900/50 rounded-lg p-4">
          <h5 className="text-xs font-medium text-purple-400 uppercase flex items-center gap-1 mb-3">
            <Link2 className="w-3 h-3" />
            Agent Relationships
          </h5>
          <div className="grid md:grid-cols-3 gap-3">
            {project.agent_delegates_to && project.agent_delegates_to.length > 0 && (
              <div>
                <span className="text-[10px] text-zinc-500 uppercase">Delegates To:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {project.agent_delegates_to.map((agent, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-purple-900/30 text-purple-300 text-[10px] rounded">
                      → {agent}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {project.agent_called_by && project.agent_called_by.length > 0 && (
              <div>
                <span className="text-[10px] text-zinc-500 uppercase">Called By:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {project.agent_called_by.map((agent, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-pink-900/30 text-pink-300 text-[10px] rounded">
                      ← {agent}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {project.agent_shares_context_with && project.agent_shares_context_with.length > 0 && (
              <div>
                <span className="text-[10px] text-zinc-500 uppercase">Shares Context:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {project.agent_shares_context_with.map((agent, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-indigo-900/30 text-indigo-300 text-[10px] rounded">
                      ↔ {agent}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Strategic Value */}
      {(project.agent_generates_proprietary_data || project.agent_data_moat !== 'none') && (
        <div className="mt-4 bg-zinc-900/50 rounded-lg p-4">
          <h5 className="text-xs font-medium text-amber-400 uppercase flex items-center gap-1 mb-2">
            <Database className="w-3 h-3" />
            Strategic Value
          </h5>
          <div className="flex flex-wrap gap-3">
            {project.agent_generates_proprietary_data && (
              <span className="px-2 py-1 bg-amber-900/30 text-amber-300 text-xs rounded flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Generates Proprietary Data
              </span>
            )}
            {project.agent_data_moat !== 'none' && (
              <span className="px-2 py-1 bg-amber-900/30 text-amber-300 text-xs rounded">
                Data Moat: {dataMoat}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Implementation Status */}
      <div className="mt-4 flex gap-2">
        <span className={`px-2 py-1 text-xs rounded ${project.agent_tools_defined ? 'bg-green-900/30 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}>
          {project.agent_tools_defined ? '✓' : '○'} Tools Defined
        </span>
        <span className={`px-2 py-1 text-xs rounded ${project.agent_ui_parity_possible ? 'bg-green-900/30 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}>
          {project.agent_ui_parity_possible ? '✓' : '○'} UI Parity Possible
        </span>
      </div>
    </div>
  );
}
