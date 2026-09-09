import React, { useState } from 'react';
import { User, Lock, ArrowRight, GraduationCap, ShieldCheck, Sparkles } from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('rohit_kumar');
  const [password, setPassword] = useState('student123');
  const [role, setRole] = useState('student');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate smart role login
    let userObj = {
      username,
      role,
      name: role === 'student' ? 'Rohit Kumar' : role === 'teacher' ? 'Prof. Rajesh Sharma' : 'Dean of Academics',
      department: 'Computer Science & Engineering',
      idNumber: role === 'student' ? '21CS042' : role === 'teacher' ? 'FAC-CS-101' : 'EMP-001',
      semester: 4,
      section: 'A'
    };
    onLogin(userObj);
  };

  const setDemoUser = (u, p, r) => {
    setUsername(u);
    setPassword(p);
    setRole(r);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      position: 'relative',
      zIndex: 10
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '460px',
        padding: '2.5rem 2.25rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px rgba(59, 130, 246, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.12)'
      }}>
        {/* Custom Logo & Branding */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <img 
            src="/logo.svg" 
            alt="SMART CLASS AI Logo" 
            style={{ width: '72px', height: '72px', marginBottom: '0.75rem', filter: 'drop-shadow(0 8px 16px rgba(59,130,246,0.4))' }} 
          />
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.5px', color: '#ffffff' }}>
            SMART CLASS <span style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              padding: '0.15rem 0.5rem',
              borderRadius: '8px',
              fontSize: '0.85em',
              verticalAlign: 'middle'
            }}>AI</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.35rem' }}>
            Intelligent Academic ERP & Timetable Optimizer
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Select Role
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              {['student', 'teacher', 'admin'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '10px',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    textTransform: 'capitalize',
                    background: role === r ? 'linear-gradient(135deg, #3b82f6, #4f46e5)' : 'rgba(255,255,255,0.06)',
                    color: role === r ? '#ffffff' : '#94a3b8',
                    border: role === r ? '1px solid #60a5fa' : '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {r === 'teacher' ? 'Faculty' : r}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Username or Roll No
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', color: '#64748b' }} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', color: '#64748b' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary-gradient"
            style={{
              width: '100%',
              padding: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.95rem'
            }}
          >
            <span>Enter Portal</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* 1-Click Quick Demo Sign-in */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.6rem' }}>
            ⚡ 1-Click Demo Accounts
          </span>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setDemoUser('rohit_kumar', 'student123', 'student')}
              style={{
                fontSize: '0.75rem',
                padding: '0.35rem 0.65rem',
                borderRadius: '20px',
                background: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#93c5fd',
                cursor: 'pointer'
              }}
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => setDemoUser('prof_sharma', 'teacher123', 'teacher')}
              style={{
                fontSize: '0.75rem',
                padding: '0.35rem 0.65rem',
                borderRadius: '20px',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#fcd34d',
                cursor: 'pointer'
              }}
            >
              👨‍🏫 Faculty
            </button>
            <button
              type="button"
              onClick={() => setDemoUser('admin', 'admin123', 'admin')}
              style={{
                fontSize: '0.75rem',
                padding: '0.35rem 0.65rem',
                borderRadius: '20px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                cursor: 'pointer'
              }}
            >
              🛡️ Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
