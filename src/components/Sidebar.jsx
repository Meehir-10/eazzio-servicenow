import React, { useState, useEffect } from 'react';
import { 
  Menu, X, LayoutDashboard, Calendar, MapPin, BookOpenCheck, 
  Bot, Settings, LogOut, Sun, Moon, GraduationCap, Shield, User as UserIcon, Clock, Wand2, Camera
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  user, 
  onLogout, 
  theme, 
  toggleTheme, 
  onOpenAiBot 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live real clock interval
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'timetable', label: 'Academic Timetable', icon: Calendar },
    { id: 'attendance', label: 'Geo-Attendance', icon: MapPin },
    { id: 'cctv-attendance', label: 'CCTV Face & Passage', icon: Camera, badge: 'AI CCTV' },
    { id: 'assignments', label: 'Assignments & Tests', icon: BookOpenCheck },
    ...(user?.role === 'TEACHER' || user?.role === 'ADMIN'
      ? [{ id: 'ai-generator', label: 'AI Schedule Optimizer', icon: Wand2 }]
      : []),
    { id: 'ai-assistant', label: 'SMARTCLASS Assistant', icon: Bot },
    { id: 'settings', label: 'Campus & GPS Settings', icon: Settings },
  ];

  const handleNavClick = (id) => {
    if (id === 'ai-assistant') {
      if (onOpenAiBot) onOpenAiBot();
    }
    setActiveTab(id);
    setIsOpen(false);
  };

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <>
      {/* Top Header Bar with Hamburger Trigger */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'var(--nav-bg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0.65rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        {/* Left: Hamburger & Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Open Navigation Menu"
            style={{
              padding: '0.5rem',
              borderRadius: '10px',
              background: 'var(--input-bg)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Menu size={20} />
          </button>

          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}
            onClick={() => setActiveTab('dashboard')}
          >
            <img src="/logo.svg" alt="SMARTCLASS AI" style={{ width: '32px', height: '32px' }} />
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.3px', lineHeight: 1.1 }}>
                SMARTCLASS <span style={{
                  background: 'linear-gradient(135deg, #4f46e5, #9333ea)',
                  color: '#fff',
                  fontSize: '0.7rem',
                  padding: '0.1rem 0.35rem',
                  borderRadius: '5px',
                  fontWeight: '700'
                }}>AI</span>
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Arka Jain University</div>
            </div>
          </div>
        </div>

        {/* Center: Live Digital Clock */}
        <div style={{
          display: 'none',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 0.85rem',
          borderRadius: '20px',
          background: 'var(--input-bg)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
        }} className="desktop-clock">
          <Clock size={14} color="var(--accent-gold)" />
          <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{formattedTime}</span>
          <span>•</span>
          <span>{formattedDate}</span>
        </div>

        {/* Right: Theme Toggle & User Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Day / Night Theme Switcher */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Light/Dark Theme"
            style={{
              padding: '0.45rem',
              borderRadius: '10px',
              background: 'var(--input-bg)',
              border: '1px solid var(--border-subtle)',
              color: theme === 'day' ? '#d97706' : '#f59e0b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={theme === 'day' ? 'Switch to Night Mode' : 'Switch to Day Mode'}
          >
            {theme === 'day' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Role Badge */}
          <span
            style={{
              fontSize: '0.72rem',
              padding: '0.25rem 0.65rem',
              borderRadius: '20px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              background:
                user?.role === 'STUDENT'
                  ? 'rgba(79, 70, 229, 0.15)'
                  : user?.role === 'TEACHER'
                  ? 'rgba(245, 158, 11, 0.15)'
                  : 'rgba(239, 68, 68, 0.15)',
              color:
                user?.role === 'STUDENT'
                  ? 'var(--primary-light)'
                  : user?.role === 'TEACHER'
                  ? 'var(--accent-gold)'
                  : 'var(--accent-rose)',
              border: '1px solid currentColor',
            }}
          >
            {user?.role === 'STUDENT' ? `Student ${user?.className ? `(${user.className})` : ''}` : user?.role === 'TEACHER' ? 'Faculty' : 'Admin'}
          </span>

          {/* User Avatar */}
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '0.85rem',
            }}
            title={user?.name}
          >
            {user?.name?.charAt(0) || 'U'}
          </div>

          {/* Sign Out Button */}
          <button
            onClick={onLogout}
            aria-label="Logout"
            style={{
              padding: '0.45rem',
              borderRadius: '10px',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              color: 'var(--accent-rose)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Sign out of ERP"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Side Hamburger Drawer & Backdrop */}
      {isOpen && (
        <>
          <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />
          <aside className="sidebar-drawer" aria-label="Main Navigation">
            {/* Drawer Header */}
            <div
              style={{
                padding: '1.25rem 1.25rem 1rem',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <img src="/logo.svg" alt="Logo" style={{ width: '30px', height: '30px' }} />
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                    SMARTCLASS
                  </h3>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>School Management System</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close Menu"
                style={{
                  padding: '0.4rem',
                  borderRadius: '8px',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* User Profile Card */}
            <div
              style={{
                padding: '1rem 1.25rem',
                margin: '0.75rem 1rem',
                borderRadius: '12px',
                background: 'var(--input-bg)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4f46e5, #9333ea)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                  }}
                >
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {user?.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {user?.role === 'STUDENT' ? `Class ${user?.className || 'N/A'} • ${user?.rollNo || ''}` : user?.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Menu List */}
            <nav style={{ flex: 1, padding: '0.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto' }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      fontSize: '0.85rem',
                      fontWeight: isActive ? '700' : '600',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      background: isActive
                        ? 'linear-gradient(135deg, rgba(79, 70, 229, 0.22), rgba(124, 58, 237, 0.22))'
                        : 'transparent',
                      color: isActive ? 'var(--primary-light)' : 'var(--text-secondary)',
                      boxShadow: isActive ? 'inset 0 0 0 1px var(--border-active)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Icon size={18} color={isActive ? 'var(--primary-light)' : 'var(--text-muted)'} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        style={{
                          marginLeft: 'auto',
                          fontSize: '0.62rem',
                          fontWeight: '800',
                          padding: '0.12rem 0.45rem',
                          borderRadius: '6px',
                          background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                          color: '#ffffff',
                          letterSpacing: '0.3px',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Drawer Footer */}
            <div
              style={{
                padding: '1rem',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0 0.25rem' }}>
                <span>Theme Mode</span>
                <button
                  onClick={toggleTheme}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.3rem 0.6rem',
                    borderRadius: '8px',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                  }}
                >
                  {theme === 'day' ? <Sun size={14} color="#d97706" /> : <Moon size={14} color="#f59e0b" />}
                  <span>{theme === 'day' ? 'Day Theme' : 'Night Theme'}</span>
                </button>
              </div>

              <button
                onClick={onLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  padding: '0.6rem',
                  borderRadius: '10px',
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.25)',
                  color: 'var(--accent-rose)',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          </aside>
        </>
      )}
      <style>{`
        @media (min-width: 768px) {
          .desktop-clock { display: flex !important; }
        }
      `}</style>
    </>
  );
}
