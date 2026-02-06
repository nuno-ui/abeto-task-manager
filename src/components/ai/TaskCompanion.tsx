'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Slack,
  X,
  Zap,
  Star,
  Calendar,
  Lightbulb,
} from 'lucide-react';
import Link from 'next/link';
import type { Task, Project } from '@/types/database';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: ActionItem[];
}

interface ActionItem {
  type: 'task' | 'project' | 'link';
  label: string;
  href?: string;
  taskId?: string;
  projectSlug?: string;
}

interface TaskAlert {
  type: 'overdue' | 'due_soon' | 'blocked' | 'critical' | 'review';
  task?: Task;
  project?: Project;
  message: string;
  href?: string;
}

interface TaskCompanionProps {
  tasks: Task[];
  projects: Project[];
  userArea?: string;
  userName?: string;
}

export function TaskCompanion({ tasks, projects, userArea = 'all', userName = 'there' }: TaskCompanionProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSlackSetup, setShowSlackSetup] = useState(false);
  const [alerts, setAlerts] = useState<TaskAlert[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Calculate alerts on mount and when tasks change
  useEffect(() => {
    calculateAlerts();
  }, [tasks, projects]);

  // Generate dynamic welcome message based on current state
  useEffect(() => {
    if (tasks.length === 0 && projects.length === 0) return;

    const now = new Date();

    // Calculate issues
    const overdueTasks = tasks.filter(t => {
      if (!t.due_date || t.status === 'completed') return false;
      return new Date(t.due_date) < now;
    });

    const projectsNeedingReview = projects.filter(p =>
      (p.status === 'planning' || p.status === 'in_progress') && !p.pain_point_level
    );

    const blockedTasks = tasks.filter(t => t.status === 'blocked');
    const criticalNotStarted = tasks.filter(t => t.is_critical_path && t.status === 'not_started');

    // Build a proactive message
    let content = `Hey ${userName}! 🤖 Here's what I'm seeing:\n\n`;

    const issues: string[] = [];

    if (projectsNeedingReview.length > 0) {
      issues.push(`📋 **${projectsNeedingReview.length} project${projectsNeedingReview.length > 1 ? 's' : ''} need stakeholder review** — These are missing pain point assessments. [Start reviewing →](/reviews)`);
    }

    if (overdueTasks.length > 0) {
      issues.push(`🚨 **${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}** — "${overdueTasks[0].title}"${overdueTasks.length > 1 ? ` and ${overdueTasks.length - 1} more` : ''}`);
    }

    if (blockedTasks.length > 0) {
      issues.push(`⚠️ **${blockedTasks.length} blocked task${blockedTasks.length > 1 ? 's' : ''}** — These need attention to unblock progress`);
    }

    if (criticalNotStarted.length > 0) {
      issues.push(`⚡ **${criticalNotStarted.length} critical path task${criticalNotStarted.length > 1 ? 's' : ''} not started** — These could delay other work`);
    }

    if (issues.length > 0) {
      content += issues.join('\n\n');
      content += '\n\n---\nAsk me anything or click on an alert above to take action!';
    } else {
      content = `Hey ${userName}! 🤖 Looking good — no urgent issues right now!\n\nI can help you:\n• Find what to work on next\n• Check project status\n• Track upcoming deadlines\n\nWhat would you like to know?`;
    }

    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, [userName, tasks, projects]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const calculateAlerts = () => {
    const now = new Date();
    const newAlerts: TaskAlert[] = [];

    // Check for projects needing review
    const projectsNeedingReview = projects.filter(p =>
      (p.status === 'planning' || p.status === 'in_progress') && !p.pain_point_level
    );
    if (projectsNeedingReview.length > 0) {
      newAlerts.push({
        type: 'review',
        project: projectsNeedingReview[0],
        message: `${projectsNeedingReview.length} project${projectsNeedingReview.length > 1 ? 's' : ''} need${projectsNeedingReview.length === 1 ? 's' : ''} review`,
        href: '/reviews',
      });
    }

    tasks.forEach((task) => {
      // Skip completed tasks
      if (task.status === 'completed' || task.status === 'cancelled') return;

      // Check for overdue tasks
      if (task.due_date) {
        const dueDate = new Date(task.due_date);
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilDue < 0) {
          newAlerts.push({
            type: 'overdue',
            task,
            message: `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) > 1 ? 's' : ''}`,
          });
        } else if (daysUntilDue <= 3) {
          newAlerts.push({
            type: 'due_soon',
            task,
            message: daysUntilDue === 0 ? 'Due today!' : `Due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`,
          });
        }
      }

      // Check for blocked tasks
      if (task.status === 'blocked') {
        newAlerts.push({
          type: 'blocked',
          task,
          message: 'Task is blocked and needs attention',
        });
      }

      // Check for critical path tasks not started
      if (task.is_critical_path && task.status === 'not_started') {
        newAlerts.push({
          type: 'critical',
          task,
          message: 'Critical path task not yet started',
        });
      }
    });

    // Sort by severity
    newAlerts.sort((a, b) => {
      const severityOrder: Record<string, number> = { overdue: 0, critical: 1, blocked: 2, review: 3, due_soon: 4 };
      return (severityOrder[a.type] ?? 5) - (severityOrder[b.type] ?? 5);
    });

    setAlerts(newAlerts.slice(0, 6)); // Show top 6 alerts
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/task-companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input.trim(),
          tasks: tasks.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            status: t.status,
            phase: t.phase,
            priority: t.priority,
            difficulty: t.difficulty,
            ai_potential: t.ai_potential,
            ai_assist_description: t.ai_assist_description,
            due_date: t.due_date,
            is_critical_path: t.is_critical_path,
            is_foundational: t.is_foundational,
            project: t.project ? { title: t.project.title, slug: t.project.slug } : null,
            owner_team: t.owner_team?.name,
          })),
          projects: projects.map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            description: p.description,
            status: p.status,
            priority: p.priority,
            progress_percentage: p.progress_percentage,
            total_tasks: p.total_tasks,
            completed_tasks: p.completed_tasks,
            pain_point_level: p.pain_point_level,
          })),
          userArea,
          conversationHistory: messages.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || "I'm sorry, I couldn't process that request. Please try again.",
        timestamp: new Date(),
        actions: data.actions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { label: "What should I work on?" },
    { label: "What's due this week?" },
    { label: "Show blocked tasks" },
    { label: "Project status" },
  ];

  const getAlertColor = (type: TaskAlert['type']) => {
    switch (type) {
      case 'overdue':
        return 'text-red-400 bg-red-900/20 border-red-900/30';
      case 'critical':
        return 'text-orange-400 bg-orange-900/20 border-orange-900/30';
      case 'blocked':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-900/30';
      case 'review':
        return 'text-purple-400 bg-purple-900/20 border-purple-900/30';
      case 'due_soon':
        return 'text-blue-400 bg-blue-900/20 border-blue-900/30';
      default:
        return 'text-zinc-400 bg-zinc-900/20 border-zinc-800';
    }
  };

  const getAlertIcon = (type: TaskAlert['type']) => {
    switch (type) {
      case 'overdue':
        return <Clock className="w-4 h-4" />;
      case 'critical':
        return <Zap className="w-4 h-4" />;
      case 'blocked':
        return <AlertTriangle className="w-4 h-4" />;
      case 'review':
        return <Star className="w-4 h-4" />;
      case 'due_soon':
        return <Calendar className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-gradient-to-r from-violet-900/20 to-blue-900/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-white text-sm">Task Companion</h2>
            <p className="text-xs text-zinc-500">AI assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Slack Button - More visible */}
          <button
            onClick={() => setShowSlackSetup(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#4A154B]/80 hover:bg-[#4A154B] text-white text-xs rounded-lg transition-colors"
          >
            <Slack className="w-4 h-4" />
            <span className="hidden sm:inline">Add to Slack</span>
          </button>
        </div>
      </div>

      {/* Compact Alerts Bar - only shows count, clicking expands in chat */}
      {alerts.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 border-b border-zinc-800">
          <span className="text-xs text-zinc-400">Quick alerts:</span>
          <div className="flex items-center gap-1.5">
            {alerts.slice(0, 4).map((alert, idx) => {
              const href = alert.href
                ? alert.href
                : alert.task?.project
                  ? `/projects/${alert.task.project.slug}`
                  : alert.project
                    ? `/projects/${alert.project.slug}`
                    : '#';
              return (
                <Link
                  key={idx}
                  href={href}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getAlertColor(alert.type)} hover:opacity-80 transition-opacity`}
                  title={alert.task?.title || alert.project?.title || alert.message}
                >
                  {getAlertIcon(alert.type)}
                  <span className="hidden sm:inline">{alert.type === 'review' ? 'Reviews' : alert.type}</span>
                </Link>
              );
            })}
            {alerts.length > 4 && (
              <span className="text-xs text-zinc-500">+{alerts.length - 4}</span>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-violet-600 text-white rounded-br-md'
                  : 'bg-zinc-800 text-zinc-100 rounded-bl-md'
              }`}
            >
              <div
                className="text-sm whitespace-pre-wrap prose prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: message.content
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br />'),
                }}
              />
              {message.actions && message.actions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-zinc-700 space-y-2">
                  {message.actions.map((action, idx) => (
                    <Link
                      key={idx}
                      href={action.href || (action.projectSlug ? `/projects/${action.projectSlug}` : '#')}
                      className="flex items-center gap-2 text-sm text-violet-300 hover:text-violet-200 transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                      {action.label}
                    </Link>
                  ))}
                </div>
              )}
              <p className="text-xs opacity-50 mt-2">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2 text-zinc-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-zinc-800">
        {/* Quick Actions - only show when no conversation yet */}
        {messages.length <= 1 && (
          <div className="px-4 pt-3 pb-2">
            <div className="flex flex-wrap gap-1.5">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInput(action.label);
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                  className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-full text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-3">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="p-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Slack Setup Modal */}
      {showSlackSetup && (
        <SlackSetupModal onClose={() => setShowSlackSetup(false)} />
      )}
    </div>
  );
}

// Slack Info Modal Component - Shows how to use Slack (already connected)
function SlackSetupModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#4A154B] flex items-center justify-center">
              <Slack className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-white">Abeto in Slack</h2>
                <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  Connected
                </span>
              </div>
              <p className="text-sm text-zinc-400">AI assistant at your fingertips</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* How to use */}
          <div>
            <h3 className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              How to Use
            </h3>
            <div className="p-4 bg-violet-900/20 border border-violet-800/30 rounded-lg">
              <p className="text-sm text-violet-200 mb-2">
                Just mention <code className="px-1.5 py-0.5 bg-zinc-800 rounded text-violet-300 font-mono">@Abeto</code> in any channel and ask anything!
              </p>
              <p className="text-xs text-zinc-400">
                The AI knows about your projects, tasks, and can help you prioritize work.
              </p>
            </div>
          </div>

          {/* Available Commands */}
          <div>
            <h3 className="text-sm font-medium text-zinc-300 mb-3">Available Commands</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg">
                <code className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs font-mono rounded shrink-0">@Abeto help</code>
                <span className="text-sm text-zinc-400">Show all available commands</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg">
                <code className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs font-mono rounded shrink-0">@Abeto my tasks</code>
                <span className="text-sm text-zinc-400">See your assigned tasks and status</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg">
                <code className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs font-mono rounded shrink-0">@Abeto projects</code>
                <span className="text-sm text-zinc-400">List active projects and progress</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg">
                <code className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs font-mono rounded shrink-0">@Abeto summary</code>
                <span className="text-sm text-zinc-400">Quick overview of what needs attention</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg">
                <code className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs font-mono rounded shrink-0">@Abeto blocked</code>
                <span className="text-sm text-zinc-400">Show blocked tasks that need help</span>
              </div>
            </div>
          </div>

          {/* Example questions */}
          <div>
            <h3 className="text-sm font-medium text-zinc-300 mb-3">Or Ask Anything</h3>
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <div className="space-y-2 text-sm text-zinc-300">
                <p>• &quot;What should I work on today?&quot;</p>
                <p>• &quot;What&apos;s the status of the Automation project?&quot;</p>
                <p>• &quot;Show me overdue tasks&quot;</p>
                <p>• &quot;Which tasks have high AI potential?&quot;</p>
                <p>• &quot;Summarize this week&apos;s progress&quot;</p>
              </div>
            </div>
          </div>

          {/* Automatic notifications */}
          <div>
            <h3 className="text-sm font-medium text-zinc-300 mb-3">Automatic Notifications</h3>
            <p className="text-xs text-zinc-500 mb-2">You&apos;ll receive Slack messages when:</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 p-2 bg-zinc-800/30 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs text-zinc-300">New task assigned</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-zinc-800/30 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-xs text-zinc-300">Deadline approaching</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-zinc-800/30 rounded-lg">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs text-zinc-300">Task blocked</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-zinc-800/30 rounded-lg">
                <Star className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-xs text-zinc-300">Review needed</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-[#4A154B] hover:bg-[#3a1139] text-white font-medium rounded-lg transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
