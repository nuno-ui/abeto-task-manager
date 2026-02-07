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
  userId?: string;
}

export function TaskCompanion({ tasks, projects, userArea = 'all', userName = 'there', userId }: TaskCompanionProps) {
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

    // Get user's personal tasks vs team tasks
    const myTasks = userId ? tasks.filter(t => t.assignee_id === userId) : [];
    const myActiveTasks = myTasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled');
    const myInProgress = myTasks.filter(t => t.status === 'in_progress');
    const myBlocked = myTasks.filter(t => t.status === 'blocked');
    const myOverdue = myTasks.filter(t => {
      if (!t.due_date || t.status === 'completed' || t.status === 'cancelled') return false;
      return new Date(t.due_date) < now;
    });

    // Calculate team stats
    const activeProjects = projects.filter(p =>
      p.status === 'in_progress' || p.status === 'planning' || p.status === 'idea'
    );
    const totalTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled');

    const blockedTasks = tasks.filter(t => t.status === 'blocked');

    const highAIPotentialTasks = tasks.filter(t =>
      t.ai_potential === 'high' && t.status !== 'completed'
    );
    const myHighAIPotential = userId ? highAIPotentialTasks.filter(t => t.assignee_id === userId) : [];

    const projectsNeedingReview = projects.filter(p =>
      (p.status === 'planning' || p.status === 'in_progress') && !p.pain_point_level
    );

    // Historical events by month-day - REAL "This Day in History" events
    const historicalEvents: Record<string, { fact: string; ending: string }> = {
      // January
      '01-01': { fact: "On this day in 1983, the Internet was born when ARPANET switched to TCP/IP", ending: "Every great network starts with a connection. What will you connect today? 🌐" },
      '01-03': { fact: "On this day in 1977, Apple Computer was incorporated", ending: "Some of the greatest companies started with just an idea. Keep building! 🍎" },
      '01-09': { fact: "On this day in 2007, Steve Jobs unveiled the first iPhone", ending: "Innovation often looks impossible until it's done. What will you create? 📱" },
      '01-15': { fact: "On this day in 2001, Wikipedia went live", ending: "Knowledge grows when shared. Collaborate and learn! 📚" },
      '01-27': { fact: "On this day in 1926, the first demonstration of television was given", ending: "Today's impossible is tomorrow's everyday. Dream bigger! 📺" },
      // February
      '02-04': { fact: "On this day in 2004, Mark Zuckerberg launched Facebook from his Harvard dorm", ending: "Side projects can change the world. What's yours? 👍" },
      '02-06': { fact: "On this day in 1959, Jack Kilby filed the first patent for an integrated circuit", ending: "One invention sparked the entire digital age. Your work matters! 💡" },
      '02-07': { fact: "On this day in 1984, astronauts Bruce McCandless and Robert Stewart made the first untethered spacewalk", ending: "Sometimes you have to let go of the safety line to reach new heights! 🚀" },
      '02-14': { fact: "On this day in 1946, ENIAC, the first electronic computer, was unveiled", ending: "From room-sized machines to pocket phones — progress never stops! 💻" },
      '02-18': { fact: "On this day in 1930, Pluto was discovered by Clyde Tombaugh", ending: "Persistence reveals what others miss. Keep looking! 🔭" },
      '02-21': { fact: "On this day in 1878, the first telephone directory was published (50 names)", ending: "Every network starts small. Grow yours! 📞" },
      '02-28': { fact: "On this day in 1983, M*A*S*H aired its final episode to 106 million viewers", ending: "Great endings are earned through consistent effort. Keep going! 🌟" },
      // March
      '03-10': { fact: "On this day in 1876, Alexander Graham Bell made the first telephone call", ending: "The first call was just 'Mr. Watson, come here.' Simple beginnings, massive impact! 📞" },
      '03-12': { fact: "On this day in 1989, Tim Berners-Lee proposed the World Wide Web", ending: "A memo changed human history. Never underestimate your ideas! 🕸️" },
      '03-14': { fact: "On this day we celebrate Pi Day (3.14) — Einstein's birthday too!", ending: "Math and genius go hand in hand. Embrace the details! 🥧" },
      '03-21': { fact: "On this day in 2006, Twitter was launched with Jack Dorsey's first tweet", ending: "140 characters started a revolution. Sometimes less is more! 🐦" },
      '03-29': { fact: "On this day in 1886, Coca-Cola was invented by John Pemberton", ending: "Even accidents can become global phenomena. Stay curious! 🥤" },
      // April
      '04-01': { fact: "On this day in 1976, Steve Jobs and Steve Wozniak founded Apple in a garage", ending: "The garage-to-greatness story is real. Start where you are! 🍏" },
      '04-03': { fact: "On this day in 1973, the first mobile phone call was made by Martin Cooper", ending: "That first call was to a competitor. Competition drives innovation! 📱" },
      '04-12': { fact: "On this day in 1961, Yuri Gagarin became the first human in space", ending: "The first step is always the hardest. Take yours today! 🚀" },
      '04-22': { fact: "On this day in 1970, the first Earth Day was celebrated", ending: "Every action for the planet counts. Build sustainably! 🌍" },
      '04-28': { fact: "On this day in 2001, Dennis Tito became the first space tourist", ending: "Once-impossible dreams become reality. Keep dreaming! ✨" },
      // May
      '05-01': { fact: "On this day in 1931, the Empire State Building opened in 410 days", ending: "Speed and ambition can coexist. Move fast! 🏢" },
      '05-14': { fact: "On this day in 1998, the final episode of Seinfeld aired", ending: "Knowing when to end is as important as starting. Focus on quality! 📺" },
      '05-19': { fact: "On this day in 1999, Star Wars: Episode I premiered", ending: "Every saga needs a beginning. Start your next chapter! ⭐" },
      '05-25': { fact: "On this day in 1977, Star Wars was released and changed cinema forever", ending: "A galaxy far, far away started with one vision. Trust yours! 🌌" },
      // June
      '06-16': { fact: "On this day in 1903, Ford Motor Company was incorporated", ending: "Henry Ford failed twice before succeeding. Persistence wins! 🚗" },
      '06-21': { fact: "On this day in 2004, SpaceShipOne became the first private spacecraft in space", ending: "Private innovation reaches new heights. Aim high! 🚀" },
      '06-29': { fact: "On this day in 2007, the first iPhone went on sale", ending: "Technology that fits in your pocket changed everything. Think portable! 📱" },
      // July
      '07-05': { fact: "On this day in 1996, Dolly the sheep became the first cloned mammal", ending: "Science fiction becomes science fact. Stay ahead of the curve! 🐑" },
      '07-10': { fact: "On this day in 2016, Portugal won Euro 2016 against France", ending: "Underdogs can win championships. Believe in your team! ⚽🏆" },
      '07-16': { fact: "On this day in 1969, Apollo 11 launched for the Moon", ending: "The impossible mission succeeded. What's your moonshot? 🌙" },
      '07-20': { fact: "On this day in 1969, Neil Armstrong walked on the Moon", ending: "One small step, one giant leap. Take your step today! 👨‍🚀" },
      // August
      '08-06': { fact: "On this day in 1991, the World Wide Web went public", ending: "What started as a project became the backbone of modern life. Build for impact! 🌐" },
      '08-12': { fact: "On this day in 1981, IBM introduced the Personal Computer", ending: "The PC revolution started here. Every revolution needs a spark! 💻" },
      '08-19': { fact: "On this day in 2004, Google went public at $85/share", ending: "From Stanford dorm to trillion-dollar company. Start scrappy! 🔍" },
      // September
      '09-02': { fact: "On this day in 1998, Google was founded in a garage", ending: "A search engine from a garage now organizes the world's information. Think big! 🔎" },
      '09-09': { fact: "On this day in 2014, Apple Watch was announced", ending: "Wearable tech went mainstream. What's the next frontier? ⌚" },
      '09-12': { fact: "On this day in 1958, Jack Kilby demonstrated the first integrated circuit", ending: "One chip sparked the entire computing revolution. Small can be mighty! 🔬" },
      '09-28': { fact: "On this day in 1928, Alexander Fleming discovered penicillin by accident", ending: "Accidents can lead to breakthroughs. Stay observant! 🔬" },
      // October
      '10-04': { fact: "On this day in 1957, Sputnik 1 became the first artificial satellite", ending: "The space age began with a beep. What signal will you send? 🛰️" },
      '10-06': { fact: "On this day in 2010, Instagram was launched", ending: "Simple ideas executed well can reach billions. Keep it simple! 📷" },
      '10-23': { fact: "On this day in 2001, Apple launched the iPod", ending: "1,000 songs in your pocket changed music forever. Reimagine the ordinary! 🎵" },
      '10-29': { fact: "On this day in 1969, the first ARPANET message was sent", ending: "That first message was 'LO' (it crashed). Even the internet had bugs! 🌐" },
      // November
      '11-10': { fact: "On this day in 1983, Microsoft Word was released", ending: "The tool billions use to write started here. Build for users! 📝" },
      '11-12': { fact: "On this day in 1990, Tim Berners-Lee published a formal proposal for the Web", ending: "One proposal connected the world. Documentation matters! 📄" },
      '11-18': { fact: "On this day in 1928, Mickey Mouse debuted in Steamboat Willie", ending: "A mouse built an entertainment empire. Imagination wins! 🐭" },
      '11-22': { fact: "On this day in 2005, the Xbox 360 was released", ending: "Gaming went mainstream. Entertainment evolves — so should you! 🎮" },
      // December
      '12-03': { fact: "On this day in 1992, the first SMS text message was sent", ending: "'Merry Christmas' changed communication forever. Short and sweet wins! 💬" },
      '12-17': { fact: "On this day in 1903, the Wright Brothers achieved first powered flight (12 seconds)", ending: "12 seconds changed human history. Every second counts! ✈️" },
      '12-21': { fact: "On this day in 2015, SpaceX landed its first rocket successfully", ending: "Failure after failure, then success. Never give up! 🚀" },
      '12-25': { fact: "On this day in 1990, Tim Berners-Lee achieved the first Web communication", ending: "A Christmas gift to humanity — the connected world! 🎄" },
    };

    // Get today's date key (MM-DD format)
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayKey = `${month}-${day}`;

    // Get today's fact, or use a fallback
    const todaysFact = historicalEvents[todayKey] || {
      fact: `On this day, countless innovations were made by people who just started`,
      ending: "Today is perfect to add your own achievement to history! 🌟"
    };

    // Build a COMPACT welcome message (to fit without scrolling)
    let content = `Hey ${userName}! 👋\n\n`;

    // Always show team overview first
    content += `📊 **${activeProjects.length} active projects** with **${totalTasks.length} open tasks**`;

    // User-specific info if available
    if (userId && myActiveTasks.length > 0) {
      content += `\n👤 **${myActiveTasks.length}** assigned to you`;
      if (myInProgress.length > 0) {
        content += ` (${myInProgress.length} in progress)`;
      }
    }

    // Alerts on same line to save space
    const alertParts: string[] = [];
    if (myOverdue.length > 0) {
      alertParts.push(`🚨 ${myOverdue.length} overdue`);
    } else if (userId) {
      // Check team overdue if no personal overdue
      const teamOverdue = tasks.filter(t => {
        if (!t.due_date || t.status === 'completed' || t.status === 'cancelled') return false;
        return new Date(t.due_date) < now;
      });
      if (teamOverdue.length > 0) {
        alertParts.push(`🚨 ${teamOverdue.length} team overdue`);
      }
    }
    if (myBlocked.length > 0) {
      alertParts.push(`⚠️ ${myBlocked.length} blocked`);
    } else if (blockedTasks.length > 0) {
      alertParts.push(`⚠️ ${blockedTasks.length} blocked`);
    }
    if (alertParts.length > 0) {
      content += `\n${alertParts.join(' • ')}`;
    }

    // Reviews and AI opportunities on one line
    const extraInfo: string[] = [];
    if (projectsNeedingReview.length > 0) {
      extraInfo.push(`📋 ${projectsNeedingReview.length} need review`);
    }
    if (highAIPotentialTasks.length > 0) {
      extraInfo.push(`✨ ${highAIPotentialTasks.length} AI-ready`);
    }
    if (extraInfo.length > 0) {
      content += `\n${extraInfo.join(' • ')}`;
    }

    // Fun fact - more compact
    content += `\n\n💡 *${todaysFact.fact.length > 70 ? todaysFact.fact.substring(0, 67) + '...' : todaysFact.fact}*`;

    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, [userName, userId, tasks, projects]);

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
    <div className="flex flex-col h-full max-h-[520px] bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
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
              // Get a short label for the alert (truncate task/project titles)
              const getAlertLabel = () => {
                if (alert.type === 'review') return 'Reviews';
                if (alert.task?.title) {
                  // Truncate to ~15 chars
                  const title = alert.task.title;
                  return title.length > 15 ? title.slice(0, 14) + '…' : title;
                }
                if (alert.project?.title) {
                  const title = alert.project.title;
                  return title.length > 15 ? title.slice(0, 14) + '…' : title;
                }
                return alert.type;
              };
              return (
                <Link
                  key={idx}
                  href={href}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getAlertColor(alert.type)} hover:opacity-80 transition-opacity`}
                  title={alert.task?.title || alert.project?.title || alert.message}
                >
                  {getAlertIcon(alert.type)}
                  <span className="hidden sm:inline">{getAlertLabel()}</span>
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
                Just mention <code className="px-1.5 py-0.5 bg-zinc-800 rounded text-violet-300 font-mono">@Task-Companion</code> in any channel and ask anything!
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
                <code className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs font-mono rounded shrink-0">@Task-Companion help</code>
                <span className="text-sm text-zinc-400">Show all available commands</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg">
                <code className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs font-mono rounded shrink-0">@Task-Companion my tasks</code>
                <span className="text-sm text-zinc-400">See your assigned tasks and status</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg">
                <code className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs font-mono rounded shrink-0">@Task-Companion projects</code>
                <span className="text-sm text-zinc-400">List active projects and progress</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg">
                <code className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs font-mono rounded shrink-0">@Task-Companion summary</code>
                <span className="text-sm text-zinc-400">Quick overview of what needs attention</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg">
                <code className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs font-mono rounded shrink-0">@Task-Companion blocked</code>
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
