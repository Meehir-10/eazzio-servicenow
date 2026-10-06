import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Minimize2, RefreshCw, User } from 'lucide-react';
import { parseApiResponse } from '../utils/api';

export default function FloatingAiAssistant({ user, isOpen, setIsOpen }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello **${user?.name || 'there'}**! 🎓\n\nI am **SMARTCLASS AI**, your academic assistant. I am synchronized with your class schedule, attendance records, and assignments.\n\nHow can I assist your studies today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input.trim();
    if (!text || isLoading) return;

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const geminiKey = localStorage.getItem('smartclass_gemini_key') || undefined;
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          apiKey: geminiKey,
          provider: 'gemini',
        }),
      });

      const data = await parseApiResponse(res, 'Chat assistant response error');
      const fullReply = data?.reply || 'I processed your request.';

      // Streaming token generation animation
      setMessages((prev) => [...prev, { role: 'assistant', content: '', isGenerating: true }]);

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
              isGenerating: i < tokens.length - 1,
            };
            return next;
          });
          await new Promise((resolve) => setTimeout(resolve, 14));
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ *Communication notice:* Unable to fetch live response (${err.message}). Please verify your network connection or server status.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { label: "Today's Schedule", text: "What is my schedule and timetable for today?" },
    { label: 'My Attendance', text: "What is my attendance percentage and status?" },
    { label: 'Due Assignments', text: "What assignments or tests are coming up?" },
    { label: 'Campus Info', text: "What are the school hours and location details?" },
  ];

  const renderFormatted = (text) => {
    // Simple markdown-style renderer for bold and lists
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let content = line;
      // Handle bold
      const parts = content.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} style={{ color: 'var(--text-primary)' }}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div key={idx} style={{ display: 'flex', gap: '0.4rem', margin: '0.2rem 0', paddingLeft: '0.5rem' }}>
            <span style={{ color: 'var(--primary-light)' }}>•</span>
            <div>{renderedParts}</div>
          </div>
        );
      }

      return (
        <div key={idx} style={{ minHeight: line === '' ? '0.6rem' : 'auto', margin: '0.15rem 0' }}>
          {renderedParts}
        </div>
      );
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="floating-bot-bubble"
          aria-label="Ask SMARTCLASS AI Assistant"
          title="Ask SMARTCLASS AI Assistant"
        >
          <Sparkles size={24} />
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#10b981',
              border: '2px solid white',
            }}
          />
        </button>
      )}

      {/* Floating Chat Modal Window */}
      {isOpen && (
        <div className="floating-bot-window" role="dialog" aria-label="SMARTCLASS AI Chat Assistant">
          {/* Header */}
          <div
            style={{
              padding: '0.85rem 1rem',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.25), rgba(147, 51, 234, 0.25))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4f46e5, #9333ea)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <Bot size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                  SMARTCLASS AI
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.68rem', color: '#10b981' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                  <span>Context Synchronized ({user?.className || 'Faculty'})</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Minimize"
                style={{
                  padding: '0.35rem',
                  borderRadius: '6px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                <Minimize2 size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close"
                style={{
                  padding: '0.35rem',
                  borderRadius: '6px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div
            style={{
              padding: '0.5rem 0.75rem',
              display: 'flex',
              gap: '0.4rem',
              overflowX: 'auto',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'var(--input-bg)',
            }}
          >
            {quickPrompts.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip.text)}
                style={{
                  padding: '0.25rem 0.6rem',
                  borderRadius: '16px',
                  fontSize: '0.72rem',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div
            style={{
              flex: 1,
              padding: '1rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
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
                    gap: '0.5rem',
                  }}
                >
                  {isBot && (
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4f46e5, #9333ea)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    >
                      <Bot size={14} />
                    </div>
                  )}

                  <div
                    style={{
                      maxWidth: '82%',
                      padding: '0.75rem 0.95rem',
                      borderRadius: isBot ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
                      background: isBot ? 'var(--bg-surface)' : 'linear-gradient(135deg, var(--primary), #7c3aed)',
                      color: isBot ? 'var(--text-secondary)' : '#ffffff',
                      border: isBot ? '1px solid var(--border-subtle)' : 'none',
                      fontSize: '0.82rem',
                      lineHeight: '1.45',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  >
                    {renderFormatted(m.content)}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                <RefreshCw size={14} className="animate-spin" />
                <span>SMARTCLASS AI analyzing records...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: '0.75rem 1rem',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              display: 'flex',
              gap: '0.5rem',
            }}
          >
            <input
              type="text"
              placeholder="Ask about timetable, attendance, tests..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '0.65rem 0.9rem',
                borderRadius: '10px',
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="btn-primary-gradient"
              style={{
                padding: '0.65rem 0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '10px',
                opacity: input.trim() ? 1 : 0.6,
                cursor: input.trim() ? 'pointer' : 'default',
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
