import React, { useState } from 'react';
import { Bot, Send, Sparkles, User, HelpCircle } from 'lucide-react';

export default function AiChatbot({ user }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello ${user?.name || 'Scholar'}! I am your SMART CLASS AI Assistant. How can I assist your lectures, attendance, or schedule today?`
    }
  ]);
  const [input, setInput] = useState('');

  const quickChips = [
    "What classes do I have today?",
    "What is my attendance percentage?",
    "When is the next academic holiday?",
    "Where is the AI & ML Lab located?",
    "What assignments are due this week?"
  ];

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = { sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Generate intelligent academic contextual reply
    setTimeout(() => {
      let reply = '';
      const q = query.toLowerCase();

      if (q.includes('class') || q.includes('today') || q.includes('schedule') || q.includes('lecture')) {
        reply = `Today is Wednesday. For Semester 4 Section A, you have 4 classes:
• 09:00 AM - Design & Analysis of Algorithms (LH-101)
• 10:00 AM - Database Management Systems (LH-101)
• 11:15 AM - Artificial Intelligence & ML (LH-102)
• 01:00 PM - Machine Learning Model Deployment Practical (AI Lab L-201)`;
      } else if (q.includes('attendance')) {
        reply = `Your overall verified attendance is 88.5% across 26 recorded classes. You are safely above the 75% university eligibility threshold!`;
      } else if (q.includes('holiday') || q.includes('break') || q.includes('vacation')) {
        reply = `The next upcoming institutional holiday is 'National Science & Innovation Day' scheduled in 12 days.`;
      } else if (q.includes('lab') || q.includes('room')) {
        reply = `The Advanced AI & Machine Learning Lab is located at L-201 (Second Floor, Tech Wing). It is equipped with 45 high-performance GPU workstations and smart projector.`;
      } else if (q.includes('assignment') || q.includes('deadline')) {
        reply = `You have 1 pending submission: 'Lab Assignment 1: Minimax & Alpha-Beta Search' for CS403, due this Friday at 11:59 PM.`;
      } else {
        reply = `I can help you monitor daily lectures, compute attendance compliance, find labs, or track coursework deadlines. Feel free to click any of the suggestion chips!`;
      }

      setMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    }, 450);
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div className="glass-panel" style={{
        display: 'flex',
        flexDirection: 'column',
        height: '75vh',
        minHeight: '520px',
        overflow: 'hidden'
      }}>
        {/* Chat Header */}
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'rgba(255,255,255,0.02)'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Bot size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff' }}>SMART CLASS AI Assistant</div>
            <div style={{ fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span> Active Context Engine
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '0.65rem',
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%'
              }}
            >
              {m.sender === 'ai' && (
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'rgba(59, 130, 246, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#60a5fa',
                  flexShrink: 0
                }}>
                  <Bot size={16} />
                </div>
              )}

              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: m.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: m.sender === 'user' ? 'linear-gradient(135deg, #2563eb, #4f46e5)' : 'rgba(255,255,255,0.06)',
                color: '#ffffff',
                fontSize: '0.85rem',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap',
                border: m.sender === 'ai' ? '1px solid rgba(255,255,255,0.08)' : 'none'
              }}>
                {m.text}
              </div>

              {m.sender === 'user' && (
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  flexShrink: 0
                }}>
                  <User size={16} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Chips */}
        <div style={{
          padding: '0.5rem 1.25rem',
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(0,0,0,0.2)'
        }}>
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              style={{
                whiteSpace: 'nowrap',
                fontSize: '0.75rem',
                padding: '0.3rem 0.65rem',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#93c5fd',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            gap: '0.5rem'
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about timetable, attendance, holidays, lab venues..."
            style={{
              flexGrow: 1,
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            className="btn-primary-gradient"
            style={{
              padding: '0.75rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px'
            }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
