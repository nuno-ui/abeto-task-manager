'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Send, Loader2, Check, ChevronRight } from 'lucide-react';
import { ProjectData, AIQuestion } from '@/lib/ai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  questions?: AIQuestion[];
}

interface AIProjectCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
}

export function AIProjectCreator({ isOpen, onClose, onProjectCreated }: AIProjectCreatorProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<ProjectData>({});
  const [currentQuestions, setCurrentQuestions] = useState<AIQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [creating, setCreating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmitDescription = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/ai/create-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: userMessage })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process');
      }

      setProject(prev => ({ ...prev, ...data.project }));
      setCurrentQuestions(data.questions || []);
      setIsComplete(data.complete);

      const assistantContent = data.summary || 'I understand. Let me help you create this project.';
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: assistantContent,
        questions: data.questions
      }]);

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerQuestions = async () => {
    if (Object.keys(answers).length === 0 || loading) return;

    // Display user's answers
    const answersText = Object.entries(answers)
      .map(([field, value]) => `${field}: ${value}`)
      .join('\n');

    setMessages(prev => [...prev, { role: 'user', content: answersText }]);
    setLoading(true);

    try {
      const response = await fetch('/api/ai/create-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          currentProject: project
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process');
      }

      setProject(prev => ({ ...prev, ...data.project }));
      setCurrentQuestions(data.questions || []);
      setIsComplete(data.complete);
      setAnswers({});

      const assistantContent = data.summary || 'Thanks for the information!';
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: assistantContent,
        questions: data.questions
      }]);

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (creating) return;
    setCreating(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create project');
      }

      onProjectCreated();
      handleClose();

    } catch (error) {
      console.error('Error creating project:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]);
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setMessages([]);
    setInput('');
    setProject({});
    setCurrentQuestions([]);
    setAnswers({});
    setIsComplete(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Create Project with AI</h2>
              <p className="text-sm text-zinc-400">Describe your project in natural language</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 text-violet-400 mx-auto mb-4" />
                  <p className="text-zinc-300 mb-2">Describe your project idea</p>
                  <p className="text-sm text-zinc-500">
                    For example: "I need a dashboard to track SDR performance metrics with weekly reports"
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-violet-600 text-white'
                        : 'bg-zinc-800 text-zinc-100'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}

              {/* Questions */}
              {currentQuestions.length > 0 && !isComplete && (
                <div className="bg-zinc-800/50 rounded-xl p-4 space-y-4">
                  <p className="text-sm text-zinc-400 font-medium">Please answer these questions:</p>
                  {currentQuestions.map((q, i) => (
                    <div key={i} className="space-y-2">
                      <label className="text-sm text-zinc-300">{q.question}</label>
                      {q.options && q.options.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {q.options.map((opt, j) => (
                            <button
                              key={j}
                              onClick={() => setAnswers(prev => ({ ...prev, [q.field]: opt }))}
                              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                answers[q.field] === opt
                                  ? 'bg-violet-600 text-white'
                                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <input
                          type={q.type === 'date' ? 'date' : q.type === 'number' ? 'number' : 'text'}
                          value={answers[q.field] || ''}
                          onChange={(e) => setAnswers(prev => ({ ...prev, [q.field]: e.target.value }))}
                          className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
                          placeholder={`Enter ${q.field}...`}
                        />
                      )}
                    </div>
                  ))}
                  <button
                    onClick={handleAnswerQuestions}
                    disabled={Object.keys(answers).length === 0 || loading}
                    className="w-full py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Continue
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {loading && messages.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-zinc-800 rounded-2xl px-4 py-3">
                    <Loader2 className="w-5 h-5 animate-spin text-violet-400" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {messages.length === 0 && (
              <div className="p-4 border-t border-zinc-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitDescription()}
                    placeholder="Describe your project..."
                    className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                    disabled={loading}
                  />
                  <button
                    onClick={handleSubmitDescription}
                    disabled={!input.trim() || loading}
                    className="px-4 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white transition-colors"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Project Preview */}
          {Object.keys(project).length > 0 && (
            <div className="w-64 border-l border-zinc-800 p-4 overflow-y-auto">
              <h3 className="text-sm font-medium text-zinc-400 mb-3">Project Preview</h3>
              <div className="space-y-3">
                {project.title && (
                  <div>
                    <p className="text-xs text-zinc-500">Title</p>
                    <p className="text-sm text-white">{project.title}</p>
                  </div>
                )}
                {project.slug && (
                  <div>
                    <p className="text-xs text-zinc-500">Slug</p>
                    <p className="text-sm text-zinc-400 font-mono">{project.slug}</p>
                  </div>
                )}
                {project.description && (
                  <div>
                    <p className="text-xs text-zinc-500">Description</p>
                    <p className="text-sm text-zinc-300 line-clamp-3">{project.description}</p>
                  </div>
                )}
                {project.status && (
                  <div>
                    <p className="text-xs text-zinc-500">Status</p>
                    <span className="inline-block px-2 py-0.5 bg-zinc-700 rounded text-xs text-white capitalize">
                      {project.status}
                    </span>
                  </div>
                )}
                {project.priority && (
                  <div>
                    <p className="text-xs text-zinc-500">Priority</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs capitalize ${
                      project.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                      project.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      project.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {project.priority}
                    </span>
                  </div>
                )}
                {project.target_date && (
                  <div>
                    <p className="text-xs text-zinc-500">Target Date</p>
                    <p className="text-sm text-zinc-300">{project.target_date}</p>
                  </div>
                )}
              </div>

              {isComplete && (
                <button
                  onClick={handleCreateProject}
                  disabled={creating}
                  className="w-full mt-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Create Project
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
