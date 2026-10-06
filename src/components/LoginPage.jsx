import React, { useState } from 'react';
import { User, Lock, ArrowRight, ShieldCheck, Sparkles, GraduationCap, AlertCircle, RefreshCw } from 'lucide-react';
import { parseApiResponse } from '../utils/api';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('rohit_kumar');
  const [password, setPassword] = useState('student123');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await parseApiResponse(res, 'Authentication failed');
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSelect = async (u, p) => {
    setUsername(u);
    setPassword(p);
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: u, password: p }),
      });

      const data = await parseApiResponse(res, 'Authentication failed');
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '2.5rem 2.25rem',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 40px rgba(79, 70, 229, 0.15)',
        }}
      >
        {/* Academic Seal & Branding */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <img
            src="/logo.svg"
            alt="SMARTCLASS AI Logo"
            style={{
              width: '74px',
              height: '74px',
              marginBottom: '0.85rem',
              filter: 'drop-shadow(0 8px 20px rgba(79, 70, 229, 0.45))',
            }}
          />
          <h2 style={{ fontSize: '1.85rem', fontWeight: '800', letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
            SMARTCLASS{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #4f46e5, #9333ea)',
                padding: '0.15rem 0.55rem',
                borderRadius: '8px',
                fontSize: '0.85em',
                color: '#fff',
                verticalAlign: 'middle',
              }}
            >
              AI
            </span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Autonomous College ERP & Timetable Optimizer
          </p>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Arka Jain University Portal (Gamharia)
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--accent-rose)',
              fontSize: '0.82rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.2rem' }}>
            <label
              htmlFor="login-username"
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                marginBottom: '0.4rem',
              }}
            >
              Username / Institutional ID
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="e.g. rohit_kumar"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  borderRadius: '12px',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="login-password"
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                marginBottom: '0.4rem',
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  borderRadius: '12px',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary-gradient"
            style={{
              width: '100%',
              padding: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontSize: '0.95rem',
              cursor: isLoading ? 'default' : 'pointer',
              opacity: isLoading ? 0.75 : 1,
            }}
          >
            {isLoading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Enter Institutional Portal</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Profiles */}
        <div
          style={{
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginBottom: '0.75rem',
            }}
          >
            <Sparkles size={14} color="var(--accent-gold)" />
            <span>Instant Demo Accounts (Click to log in directly)</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleDemoSelect('rohit_kumar', 'student123')}
              style={{
                fontSize: '0.74rem',
                padding: '0.5rem 0.65rem',
                borderRadius: '10px',
                background: 'rgba(79, 70, 229, 0.12)',
                border: '1px solid rgba(79, 70, 229, 0.25)',
                color: 'var(--primary-light)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              🎓 <strong>Rohit (10-A)</strong>
              <div style={{ fontSize: '0.66rem', opacity: 0.8 }}>Student • 90% Att.</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoSelect('rahul_verma', 'student123')}
              style={{
                fontSize: '0.74rem',
                padding: '0.5rem 0.65rem',
                borderRadius: '10px',
                background: 'rgba(6, 182, 212, 0.12)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                color: 'var(--accent-cyan)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              🎓 <strong>Rahul (10-B)</strong>
              <div style={{ fontSize: '0.66rem', opacity: 0.8 }}>Student • 70% Att.</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoSelect('prof_sharma', 'teacher123')}
              style={{
                fontSize: '0.74rem',
                padding: '0.5rem 0.65rem',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                color: 'var(--accent-gold)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              👨‍🏫 <strong>Prof. Sharma</strong>
              <div style={{ fontSize: '0.66rem', opacity: 0.8 }}>Faculty • Math/Phys</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoSelect('admin', 'admin123')}
              style={{
                fontSize: '0.74rem',
                padding: '0.5rem 0.65rem',
                borderRadius: '10px',
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.25)',
                color: 'var(--accent-rose)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              🏛️ <strong>Dean Vance</strong>
              <div style={{ fontSize: '0.66rem', opacity: 0.8 }}>Admin Controller</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
