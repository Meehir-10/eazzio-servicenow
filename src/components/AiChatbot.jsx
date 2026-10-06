import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  RefreshCw,
  BookOpen,
  Clock,
  MapPin,
  CheckCircle2,
  Trophy,
  Users,
  Video,
  Coffee,
  HelpCircle,
  Key,
  ExternalLink,
  X,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { parseApiResponse, safeJson } from '../utils/api';

export default function AiChatbot({ user }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello **${user?.name || 'there'}**! 🎓\n\nI am **SMARTCLASS AI**, your collegiate companion for **Arka Jain University**.\n\nYou can talk freely to me about **anything** — ask about **college activities, fests (Aarohan, TechStorm, Spardha)**, **clubs**, **sports**, **cafeteria & hostel**, **how many times you passed the CCTV turnstiles today**, or get **academic tutoring** in math, physics, and computer science!\n\n💡 *Pro-Tip:* To unlock 100% unrestricted live generative AI token streaming, click **"Connect Google Gemini"** in the top bar!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('smartclass_gemini_key') || '');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyInput, setKeyInput] = useState(geminiKey);
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);
  const [keyStatusMsg, setKeyStatusMsg] = useState(null);
  const [activeModel, setActiveModel] = useState('Gemini 1.5 Flash');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load any server-configured key on mount
  useEffect(() => {
    fetch('/api/settings', { credentials: 'include' })
      .then((r) => safeJson(r))
      .then((data) => {
        if (data?.aiApiKey && !geminiKey) {
          setGeminiKey(data.aiApiKey);
          setKeyInput(data.aiApiKey);
          localStorage.setItem('smartclass_gemini_key', data.aiApiKey);
        }
      })
      .catch(() => {});
  }, []);

  const handleVerifyAndSaveKey = async (e) => {
    if (e) e.preventDefault();
    if (!keyInput.trim()) {
      setKeyStatusMsg({ type: 'error', text: 'Please enter a valid Gemini API key' });
      return;
    }

    setIsVerifyingKey(true);
    setKeyStatusMsg(null);

    try {
      const res = await fetch('/api/ai/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          apiKey: keyInput.trim(),
          provider: 'gemini',
          save: true,
        }),
      });

      const data = await parseApiResponse(res, 'Verification failed');
      setGeminiKey(keyInput.trim());
      localStorage.setItem('smartclass_gemini_key', keyInput.trim());
      setActiveModel(data.model || 'Gemini 1.5 Flash');
      setKeyStatusMsg({
        type: 'success',
        text: `✨ Connected successfully! Real-time generation powered by ${data.model || 'Google Gemini 1.5 Flash'}.`,
      });

      setTimeout(() => {
        setShowKeyModal(false);
        setKeyStatusMsg(null);
      }, 1400);
    } catch (err) {
      setKeyStatusMsg({ type: 'error', text: err.message || 'Key validation failed' });
    } finally {
      setIsVerifyingKey(false);
    }
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || input.trim();
    if (!text || isLoading) return;

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          apiKey: geminiKey || undefined,
          provider: 'gemini',
        }),
      });

      const data = await parseApiResponse(res, 'Chat service response error');
      const fullReply = data?.reply || 'Request processed.';
      const source = data?.source || 'smartclass-autonomous-engine';

      // Real-time word-by-word streaming generation effect
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '', source, isGenerating: true },
      ]);

      const tokens = fullReply.split(/(\s+)/);
      let accumulated = '';

      for (let i = 0; i < tokens.length; i++) {
        accumulated += tokens[i];
        if (i % 2 === 0 || i === tokens.length - 1) {
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = {
              role: 'assistant',
              content: accumulated,
              source,
              isGenerating: i < tokens.length - 1,
            };
            return next;
          });
          await new Promise((resolve) => setTimeout(resolve, 14));
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ *Communication Error:* Could not connect to AI service (${err.message}). Ensure your internet or local server is active.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQuestions = [
    { icon: Trophy, label: "College Fests & Sports", query: "Tell me about college sports and fests like Aarohan, TechStorm, and Spardha!" },
    { icon: Users, label: "Clubs & Activities", query: "What student clubs and extracurricular activities can I join at the university?" },
    { icon: Video, label: "CCTV Passage Count", query: "How does the CCTV facial recognition work and how many times did I pass the gates today?" },
    { icon: Clock, label: "Today's Timetable", query: "What is my full schedule and timetable for today?" },
    { icon: CheckCircle2, label: "Attendance & 75% Rule", query: "What is my current attendance percentage and what is the 75% attendance rule?" },
    { icon: Coffee, label: "Cafeteria & Library", query: "What are the campus cafeteria and central library operating hours and facilities?" },
    { icon: BookOpen, label: "CS: Database 3NF", query: "Explain database normalization up to 3NF with clear examples." },
  ];

  const renderFormatted = (text) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let content = line;

      // Render headers
      if (content.startsWith('### ')) {
        return (
          <div key={idx} style={{ fontSize: '0.96rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0.6rem 0 0.2rem' }}>
            {content.slice(4)}
          </div>
        );
      }
      if (content.startsWith('## ')) {
        return (
          <div key={idx} style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0.7rem 0 0.3rem' }}>
            {content.slice(3)}
          </div>
        );
      }

      // Render bold and inline code
      const parts = content.split(/(\*\*.*?\*\*|`.*?`)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} style={{ color: 'var(--text-primary)' }}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code
              key={pIdx}
              style={{
                background: 'rgba(79, 70, 229, 0.15)',
                padding: '0.1rem 0.35rem',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '0.82rem',
                color: 'var(--primary-light)',
              }}
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      });

      // Render bullet list
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div key={idx} style={{ display: 'flex', gap: '0.5rem', margin: '0.25rem 0', paddingLeft: '0.5rem' }}>
            <span style={{ color: 'var(--primary-light)', flexShrink: 0 }}>•</span>
            <div>{renderedParts}</div>
          </div>
        );
      }

      // Render numbered list (e.g. "1. ", "2. ")
      const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <div key={idx} style={{ display: 'flex', gap: '0.5rem', margin: '0.25rem 0', paddingLeft: '0.5rem' }}>
            <span style={{ color: 'var(--primary-light)', fontWeight: '700', flexShrink: 0 }}>{numMatch[1]}.</span>
            <div>{renderedParts}</div>
          </div>
        );
      }

      return (
        <div key={idx} style={{ minHeight: line === '' ? '0.6rem' : 'auto', margin: '0.2rem 0' }}>
          {renderedParts}
        </div>
      );
    });
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header with Gemini Status */}
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4f46e5, #9333ea)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <Bot size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>SMARTCLASS AI Assistant</span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  padding: '0.15rem 0.55rem',
                  borderRadius: '12px',
                  background: geminiKey ? 'rgba(16, 185, 129, 0.15)' : 'rgba(147, 51, 234, 0.15)',
                  color: geminiKey ? 'var(--accent-emerald)' : 'var(--primary-light)',
                  border: `1px solid ${geminiKey ? 'rgba(16, 185, 129, 0.3)' : 'rgba(147, 51, 234, 0.3)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <Sparkles size={11} />
                <span>{geminiKey ? activeModel : 'Campus AI Active'}</span>
              </span>
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
              Free conversational intelligence synchronized with {user?.name}'s timetable, turnstiles, and attendance
            </p>
          </div>
        </div>

        {/* Gemini Connect Action Button */}
        <button
          type="button"
          onClick={() => setShowKeyModal(true)}
          style={{
            padding: '0.45rem 0.85rem',
            borderRadius: '10px',
            background: geminiKey ? 'rgba(16, 185, 129, 0.12)' : 'linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(168, 85, 247, 0.2))',
            border: `1px solid ${geminiKey ? 'rgba(16, 185, 129, 0.3)' : 'rgba(168, 85, 247, 0.4)'}`,
            color: geminiKey ? 'var(--accent-emerald)' : 'var(--text-primary)',
            fontSize: '0.78rem',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.2s ease',
          }}
        >
          <Key size={14} color={geminiKey ? 'var(--accent-emerald)' : 'var(--primary-light)'} />
          <span>{geminiKey ? 'Gemini Key Configured ⚙️' : '⚡ Connect Google Gemini'}</span>
        </button>
      </div>

      {/* Main Chat Panel */}
      <div
        className="glass-panel"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Gemini Engine Banner */}
        <div
          style={{
            padding: '0.55rem 1.25rem',
            background: geminiKey
              ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.08), rgba(59, 130, 246, 0.08))'
              : 'linear-gradient(90deg, rgba(79, 70, 229, 0.1), rgba(168, 85, 247, 0.12))',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.76rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <Zap size={14} color={geminiKey ? 'var(--accent-emerald)' : 'var(--accent-cyan)'} />
            <span>
              {geminiKey ? (
                <>
                  Running in <strong>Live Generative Mode</strong> via Google Gemini 1.5 Flash TPU Clusters.
                </>
              ) : (
                <>
                  Running in <strong>Collegiate Autonomous Mode</strong>. Connect a free Google Gemini key for 100% unrestricted live token streaming!
                </>
              )}
            </span>
          </div>
          {!geminiKey && (
            <button
              onClick={() => setShowKeyModal(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-light)',
                fontWeight: '700',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '0.74rem',
              }}
            >
              Get Free Key
            </button>
          )}
        </div>

        {/* Sample Prompt Shortcuts */}
        <div
          style={{
            padding: '0.65rem 1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--input-bg)',
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
          }}
        >
          {sampleQuestions.map((q, idx) => {
            const Icon = q.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSend(q.query)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '20px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Icon size={13} color="var(--primary-light)" />
                <span>{q.label}</span>
              </button>
            );
          })}
        </div>

        {/* Message Thread */}
        <div
          style={{
            flex: 1,
            padding: '1.25rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.1rem',
          }}
        >
          {messages.map((m, idx) => {
            const isBot = m.role === 'assistant';
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: isBot ? 'flex-start' : 'flex-end',
                  gap: '0.75rem',
                }}
              >
                {isBot && (
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4f46e5, #9333ea)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      flexShrink: 0,
                    }}
                  >
                    <Bot size={18} />
                  </div>
                )}

                <div style={{ maxWidth: '82%', display: 'flex', flexDirection: 'column' }}>
                  <div
                    style={{
                      padding: '0.85rem 1.15rem',
                      borderRadius: isBot ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                      background: isBot ? 'var(--input-bg)' : 'linear-gradient(135deg, var(--primary), #7c3aed)',
                      color: isBot ? 'var(--text-secondary)' : '#ffffff',
                      border: isBot ? '1px solid var(--border-subtle)' : 'none',
                      fontSize: '0.88rem',
                      lineHeight: '1.55',
                    }}
                  >
                    {renderFormatted(m.content)}
                    {m.isGenerating && (
                      <span
                        className="animate-pulse"
                        style={{
                          display: 'inline-block',
                          width: '7px',
                          height: '14px',
                          background: 'var(--primary-light)',
                          marginLeft: '4px',
                          verticalAlign: 'middle',
                        }}
                      />
                    )}
                  </div>
                  {isBot && m.source && (
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.3rem', paddingLeft: '0.2rem' }}>
                      {m.source.includes('gemini') ? '✨ Synthesized by Google Gemini' : '🎓 Synthesized by SmartClass Campus Engine'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && !messages[messages.length - 1]?.isGenerating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.82rem', padding: '0.5rem' }}>
              <RefreshCw size={16} className="animate-spin" />
              <span>{geminiKey ? 'Gemini 1.5 Flash is thinking & synthesizing response...' : 'Consulting campus databases and synthesizing response...'}</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
            display: 'flex',
            gap: '0.75rem',
          }}
        >
          <input
            type="text"
            placeholder="Ask anything freely (e.g. 'fests & sports', 'how many times did I pass CCTV?', 'explain calculus', 'tell me a joke')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              background: 'var(--input-bg)',
              border: '1px solid var(--input-border)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="btn-primary-gradient"
            style={{
              padding: '0.75rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              opacity: input.trim() ? 1 : 0.6,
              cursor: input.trim() ? 'pointer' : 'default',
            }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      {/* Gemini Key Modal */}
      {showKeyModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '520px',
              background: 'var(--bg-card)',
              borderRadius: '16px',
              padding: '1.75rem',
              border: '1px solid rgba(147, 51, 234, 0.3)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={22} color="var(--primary-light)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                  Connect Google Gemini AI
                </h3>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Enable 100% unconstrained generative AI responses powered by <strong>Google Gemini 1.5 Flash</strong>. Every answer is synthesized dynamically in real-time with full contextual access to university schedules and CCTV turnstiles.
            </p>

            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                background: 'rgba(79, 70, 229, 0.08)',
                border: '1px solid rgba(79, 70, 229, 0.2)',
                marginBottom: '1.25rem',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>Need a free API Key?</span>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Get it in 15 seconds from Google AI Studio</div>
              </div>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  background: 'var(--primary)',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  textDecoration: 'none',
                }}
              >
                <span>Get Free Key</span>
                <ExternalLink size={12} />
              </a>
            </div>

            {keyStatusMsg && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  marginBottom: '1.25rem',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: keyStatusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                  border: `1px solid ${keyStatusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                  color: keyStatusMsg.type === 'success' ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                }}
              >
                {keyStatusMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{keyStatusMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleVerifyAndSaveKey}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '0.4rem' }}>
                  Google Gemini API Key (starts with AIzaSy...)
                </label>
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  style={{
                    padding: '0.65rem 1rem',
                    borderRadius: '10px',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifyingKey}
                  className="btn-primary-gradient"
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    opacity: isVerifyingKey ? 0.7 : 1,
                  }}
                >
                  {isVerifyingKey ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Verifying with Google...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      <span>Test & Connect Gemini</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
