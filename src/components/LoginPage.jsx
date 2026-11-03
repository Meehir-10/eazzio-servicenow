import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, Sparkles, GraduationCap, AlertCircle, RefreshCw, BookOpen, Crown } from 'lucide-react';
import { parseApiResponse } from '../utils/api';

const PROFILES = [
  {
    username: 'admin',
    role: 'ADMIN',
    name: 'Dr. Alistair Vance',
    designation: 'Dean & Administrator',
    badge: 'Admin Access',
    icon: Crown,
    color: '#f43f5e',
    bgColor: 'rgba(244, 63, 94, 0.12)',
    borderColor: 'rgba(244, 63, 94, 0.3)',
    description: 'Full Campus ERP control, timetable optimizer, CCTV & analytics',
  },
  {
    username: 'prof_sharma',
    role: 'TEACHER',
    name: 'Prof. Rajesh Sharma',
    designation: 'Faculty (Math & Physics)',
    badge: 'Faculty Portal',
    icon: BookOpen,
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    description: 'Lecture schedules, class attendance, and assignment grading',
  },
  {
    username: 'rohit_kumar',
    role: 'STUDENT',
    name: 'Rohit Kumar',
    designation: 'Student (Section 10-A)',
    badge: 'Student Portal',
    icon: GraduationCap,
    color: '#4f46e5',
    bgColor: 'rgba(79, 70, 229, 0.12)',
    borderColor: 'rgba(79, 70, 229, 0.3)',
    description: 'Personal timetable, GPS attendance, grades & AI tutor',
  },
];

export default function LoginPage({ onLogin }) {
  const [selectedUsername, setSelectedUsername] = useState('admin');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (usernameToLogin) => {
    const userToAuth = usernameToLogin || selectedUsername;
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: userToAuth }),
      });

      const data = await parseApiResponse(res, 'Login failed');
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
          maxWidth: '520px',
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

        {/* Select Portal Persona */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
            }}
          >
            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Select Portal Persona:
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                color: 'var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <Sparkles size={12} /> Passwordless Direct Access
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {PROFILES.map((profile) => {
              const Icon = profile.icon;
              const isSelected = selectedUsername === profile.username;

              return (
                <div
                  key={profile.username}
                  onClick={() => setSelectedUsername(profile.username)}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: isSelected ? profile.bgColor : 'rgba(255, 255, 255, 0.03)',
                    border: `1.5px solid ${isSelected ? profile.borderColor : 'var(--border-subtle)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: isSelected ? `0 0 15px ${profile.bgColor}` : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: profile.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: profile.color,
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {profile.name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {profile.designation}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: '600',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        background: profile.bgColor,
                        color: profile.color,
                        border: `1px solid ${profile.borderColor}`,
                      }}
                    >
                      {profile.badge}
                    </span>
                    <input
                      type="radio"
                      name="persona"
                      checked={isSelected}
                      onChange={() => setSelectedUsername(profile.username)}
                      style={{ accentColor: profile.color, cursor: 'pointer' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 1-Click Login to Dashboard Button */}
        <button
          type="button"
          onClick={() => handleLogin()}
          disabled={isLoading}
          className="btn-primary-gradient"
          style={{
            width: '100%',
            padding: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: isLoading ? 'default' : 'pointer',
            opacity: isLoading ? 0.75 : 1,
            boxShadow: '0 8px 24px rgba(79, 70, 229, 0.4)',
          }}
        >
          {isLoading ? (
            <>
              <RefreshCw size={20} className="animate-spin" />
              <span>Entering Dashboard...</span>
            </>
          ) : (
            <>
              <span>Log In to Dashboard</span>
              <ArrowRight size={20} />
            </>
          )}
        </button>

        <div
          style={{
            marginTop: '1.25rem',
            textAlign: 'center',
            fontSize: '0.74rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
          }}
        >
          <ShieldCheck size={14} color="var(--accent-emerald)" />
          <span>Zero passwords needed • Single click institutional dashboard access</span>
        </div>
      </div>
    </div>
  );
}
