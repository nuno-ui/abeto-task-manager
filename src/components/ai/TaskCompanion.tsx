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
  MessageSquare,
  Lightbulb,
  Target,
  Calendar,
  TrendingUp,
  Slack,
  Settings,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Zap,
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
  type: 'overdue' | 'due_soon' | 'blocked' | 'critical';
  task: Task;
  message: string;
}

interface TaskRecommendation {
  task: Task;
  reason: string;
  priority: 'high' | 'medium' | 'low';
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
  const [recommendations, setRecommendations] = useState<TaskRecommendation[]>([]);
  const [showAlerts, setShowAlerts] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Calculate alerts and recommendations on mount and when tasks change
  useEffect(() => {
    calculateAlerts();
    calculateRecommendations();
  }, [tasks]);

  // Add welcome message on mount
  useEffect(() => {
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    if (hour >= 17) greeting = 'Good evening';

    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: `${greeting}, ${userName}! I'm your Task Companion. I can help you:

- **Find tasks** - "What should I work on today?"
- **Get status updates** - "How is Project X progressing?"
- **Manage priorities** - "What's blocking our team?"
- **Track deadlines** - "What's due this week?"
- **Answer questions** - Ask me anything about your projects and tasks!

What would you like to know?`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, [userName]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const calculateAlerts = () => {
    const now = new Date();
    const newAlerts: TaskAlert[] = [];

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
      const severityOrder = { overdue: 0, critical: 1, blocked: 2, due_soon: 3 };
      return severityOrder[a.type] - severityOrder[b.type];
    });

    setAlerts(newAlerts.slice(0, 5)); // Show top 5 alerts
  };

  const calculateRecommendations = () => {
    const newRecommendations: TaskRecommendation[] = [];

    // Filter to relevant tasks (not completed, not cancelled)
    const activeTasks = tasks.filter(
      (t) => t.status !== 'completed' && t.status !== 'cancelled'
    );

    // Prioritize critical path tasks
    activeTasks
      .filter((t) => t.is_critical_path && t.status === 'not_started')
      .slice(0, 2)
      .forEach((task) => {
        newRecommendations.push({
          task,
          reason: 'Critical path - start this to unblock other work',
          priority: 'high',
        });
      });

    // Prioritize foundational tasks
    activeTasks
      .filter((t) => t.is_foundational && t.status === 'not_started')
      .slice(0, 2)
      .forEach((task) => {
        if (!newRecommendations.find((r) => r.task.id === task.id)) {
          newRecommendations.push({
            task,
            reason: 'Foundational - builds base for other tasks',
            priority: 'high',
          });
        }
      });

    // Add high AI potential tasks
    activeTasks
      .filter((t) => t.ai_potential === 'high' && t.status === 'not_started')
      .slice(0, 2)
      .forEach((task) => {
        if (!newRecommendations.find((r) => r.task.id === task.id)) {
          newRecommendations.push({
            task,
            reason: 'High AI potential - can be accelerated with AI assistance',
            priority: 'medium',
          });
        }
      });

    // Add in-progress tasks to continue
    activeTasks
      .filter((t) => t.status === 'in_progress')
      .slice(0, 2)
      .forEach((task) => {
        if (!newRecommendations.find((r) => r.task.id === task.id)) {
          newRecommendations.push({
            task,
            reason: 'In progress - continue to completion',
            priority: 'medium',
          });
        }
      });

    setRecommendations(newRecommendations.slice(0, 5));
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
    { label: "What should I work on?", icon: Target },
    { label: "What's due this week?", icon: Calendar },
    { label: "Show blocked tasks", icon: AlertTriangle },
    { label: "Project status summary", icon: TrendingUp },
  ];

  const getAlertColor = (type: TaskAlert['type']) => {
    switch (type) {
      case 'overdue':
        return 'text-red-400 bg-red-900/20 border-red-900/30';
      case 'critical':
        return 'text-orange-400 bg-orange-900/20 border-orange-900/30';
      case 'blocked':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-900/30';
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
      case 'due_soon':
        return <Calendar className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-gradient-to-r from-violet-900/20 to-blue-900/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-white flex items-center gap-2">
              Task Companion
              <Sparkles className="w-4 h-4 text-violet-400" />
            </h2>
            <p className="text-xs text-zinc-400">Your AI-powered task assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSlackSetup(true)}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            title="Connect to Slack"
          >
            <Slack className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="border-b border-zinc-800">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="w-full flex items-center justify-between px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              <span className="font-medium">Alerts</span>
              <span className="px-2 py-0.5 bg-orange-900/30 text-orange-400 text-xs rounded-full">
                {alerts.length}
              </span>
            </div>
            {showAlerts ? (
              <ChevronUp className="w-4 h-4 text-zinc-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-500" />
            )}
          </button>

          {showAlerts && (
            <div className="px-4 pb-3 space-y-2">
              {alerts.map((alert, idx) => (
                <Link
                  key={idx}
                  href={alert.task.project ? `/projects/${alert.task.project.slug}` : '#'}
                  className={`flex items-start gap-3 p-2 rounded-lg border ${getAlertColor(alert.type)} hover:opacity-90 transition-opacity`}
                >
                  <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{alert.task.title}</p>
                    <p className="text-xs opacity-80">{alert.message}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 mt-1 opacity-50" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recommendations Section */}
      {recommendations.length > 0 && messages.length <= 1 && (
        <div className="px-4 py-3 border-b border-zinc-800">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-zinc-300">Recommended Next</span>
          </div>
          <div className="space-y-2">
            {recommendations.slice(0, 3).map((rec, idx) => (
              <Link
                key={idx}
                href={rec.task.project ? `/projects/${rec.task.project.slug}` : '#'}
                className="flex items-start gap-3 p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors group"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    rec.priority === 'high'
                      ? 'bg-red-400'
                      : rec.priority === 'medium'
                      ? 'bg-yellow-400'
                      : 'bg-green-400'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate group-hover:text-violet-300 transition-colors">
                    {rec.task.title}
                  </p>
                  <p className="text-xs text-zinc-500">{rec.reason}</p>
                </div>
                <ArrowRight className="w-4 h-4 mt-1 text-zinc-600 group-hover:text-violet-400 transition-colors" />
              </Link>
            ))}
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

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="px-4 py-3 border-t border-zinc-800">
          <p className="text-xs text-zinc-500 mb-2">Quick actions</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInput(action.label);
                  setTimeout(() => handleSendMessage(), 100);
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-full text-sm text-zinc-300 transition-colors"
              >
                <action.icon className="w-3.5 h-3.5 text-zinc-500" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about your tasks..."
            className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Slack Setup Modal */}
      {showSlackSetup && (
        <SlackSetupModal onClose={() => setShowSlackSetup(false)} />
      )}
    </div>
  );
}

// Slack Setup Modal Component
function SlackSetupModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [channelName, setChannelName] = useState('task-companion');
  const [isCreating, setIsCreating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');

  const handleCreateChannel = async () => {
    setIsCreating(true);

    // Simulate API call - in production this would create the Slack channel
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsComplete(true);
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#4A154B] flex items-center justify-center">
              <Slack className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Connect to Slack</h2>
              <p className="text-sm text-zinc-400">Get Task Companion in your workspace</p>
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
        <div className="p-6">
          {!isComplete ? (
            <>
              {step === 1 && (
                <div className="space-y-4">
                  <div className="p-4 bg-zinc-800/50 rounded-lg">
                    <h3 className="font-medium text-white mb-2">What you'll get:</h3>
                    <ul className="space-y-2 text-sm text-zinc-300">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        Same AI-powered task assistance in Slack
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        Real-time alerts for overdue and critical tasks
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        Daily task summaries and recommendations
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        Ask questions about projects and tasks
                      </li>
                    </ul>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Slack Channel Name
                    </label>
                    <div className="flex items-center">
                      <span className="px-3 py-2 bg-zinc-800 border border-r-0 border-zinc-700 rounded-l-lg text-zinc-500 text-sm">
                        #
                      </span>
                      <input
                        type="text"
                        value={channelName}
                        onChange={(e) => setChannelName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                        className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-r-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        placeholder="task-companion"
                      />
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      This channel will be created in your Slack workspace
                    </p>
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    className="w-full py-3 bg-[#4A154B] hover:bg-[#3a1139] text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    Continue with Slack
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-900/20 border border-blue-900/30 rounded-lg">
                    <h3 className="font-medium text-blue-300 mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Quick Setup Option
                    </h3>
                    <p className="text-sm text-blue-200/80">
                      If you have a Slack Incoming Webhook URL, paste it below. Otherwise, we'll guide you through creating one.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Slack Webhook URL (Optional)
                    </label>
                    <input
                      type="text"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                      placeholder="https://hooks.slack.com/services/..."
                    />
                  </div>

                  <div className="p-4 bg-zinc-800/50 rounded-lg">
                    <h4 className="text-sm font-medium text-white mb-2">To create a webhook:</h4>
                    <ol className="space-y-2 text-sm text-zinc-400">
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-zinc-700 text-zinc-300 text-xs flex items-center justify-center flex-shrink-0">1</span>
                        Go to <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">api.slack.com/apps</a>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-zinc-700 text-zinc-300 text-xs flex items-center justify-center flex-shrink-0">2</span>
                        Create a new app or select existing
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-zinc-700 text-zinc-300 text-xs flex items-center justify-center flex-shrink-0">3</span>
                        Enable "Incoming Webhooks" and create one
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-zinc-700 text-zinc-300 text-xs flex items-center justify-center flex-shrink-0">4</span>
                        Copy the webhook URL and paste above
                      </li>
                    </ol>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleCreateChannel}
                      disabled={isCreating}
                      className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Complete Setup
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Connected!</h3>
              <p className="text-zinc-400 mb-6">
                Task Companion is now available in <strong className="text-white">#{channelName}</strong>
              </p>
              <div className="p-4 bg-zinc-800/50 rounded-lg text-left mb-6">
                <p className="text-sm text-zinc-300 mb-2">Try these commands in Slack:</p>
                <ul className="space-y-1 text-sm text-zinc-400 font-mono">
                  <li>@task-companion what should I work on?</li>
                  <li>@task-companion show my alerts</li>
                  <li>@task-companion project status</li>
                </ul>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
