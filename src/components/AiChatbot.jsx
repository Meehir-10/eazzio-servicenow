import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, User, RefreshCw, BookOpen, Clock, MapPin, CheckCircle2 } from 'lucide-react';

export default function AiChatbot({ user }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello **${user?.name || 'there'}**! 🎓\n\nI am **SMARTCLASS AI**, your dedicated academic intelligence engine for Apex International Academy.\n\nI have direct read access to your **live timetable**, **attendance records**, **homework deadlines**, and **campus geofence**. How can I help you today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply || 'Request processed successfully.' },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ *Communication Error:* Could not connect to the academic AI server (${err.message}). Ensure the backend is operational.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQuestions = [
    { icon: Clock, label: "What is my full schedule today?", query: "What is my full schedule and timetable for today?" },
    { icon: CheckCircle2, label: "Check my attendance percentage", query: "What is my current attendance percentage and record?" },
    { icon: BookOpen, label: "Any pending assignments or tests?", query: "What assignments or upcoming tests are due?" },
    { icon: MapPin, label: "What are the school location boundaries?", query: "What is the campus GPS location and attendance radius?" },
  ];

  const renderFormatted = (text) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let content = line;
      const parts = content.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} style={{ color: 'var(--text-primary)' }}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div key={idx} style={{ display: 'flex', gap: '0.5rem', margin: '0.3rem 0', paddingLeft: '0.5rem' }}>
            <span style={{ color: 'var(--primary-light)' }}>•</span>
            <div>{renderedParts}</div>
          </div>
        );
      }

      return (
        <div key={idx} style={{ minHeight: line === '' ? '0.75rem' : 'auto', margin: '0.2rem 0' }}>
          {renderedParts}
        </div>
      );
    });
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
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
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              SMARTCLASS AI Assistant
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Real-time context synchronization with Class {user?.className || 'Faculty'} records
            </p>
          </div>
        </div>
      </div>

      {/* Main Chat Panel */}
      <div
        className="glass-panel"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Sample Prompt Shortcuts */}
        <div
          style={{
            padding: '0.75rem 1.25rem',
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
            gap: '1rem',
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

                <div
                  style={{
                    maxWidth: '80%',
                    padding: '0.85rem 1.15rem',
                    borderRadius: isBot ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                    background: isBot ? 'var(--input-bg)' : 'linear-gradient(135deg, var(--primary), #7c3aed)',
                    color: isBot ? 'var(--text-secondary)' : '#ffffff',
                    border: isBot ? '1px solid var(--border-subtle)' : 'none',
                    fontSize: '0.88rem',
                    lineHeight: '1.5',
                  }}
                >
                  {renderFormatted(m.content)}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.82rem', padding: '0.5rem' }}>
              <RefreshCw size={16} className="animate-spin" />
              <span>Analyzing live database and drafting response...</span>
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
            placeholder="Type your question here (e.g. 'What is my attendance?', 'Next class?', 'Explain Newton's laws')..."
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
    </div>
  );
}
