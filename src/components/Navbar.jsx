import React from 'react';
import { 
  Calendar, Wand2, MapPin, Bot, LayoutDashboard, LogOut, Shield, User, GraduationCap
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, user, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'ai-generator', label: 'AI Generator', icon: Wand2, highlight: true },
    { id: 'geo-attendance', label: 'Geo-Attendance', icon: MapPin },
    { id: 'ai-chatbot', label: 'AI Assistant', icon: Bot },
  ];

  return (
    <header className="glass-nav" style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0.65rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      flexWrap: 'wrap'
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>
        <img src="/logo.svg" alt="SMART CLASS AI" style={{ width: '38px', height: '38px' }} />
        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: '800', letterSpacing: '-0.3px', color: '#ffffff' }}>
            SMART CLASS <span style={{
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              padding: '0.1rem 0.4rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              color: 'white',
              verticalAlign: 'middle'
            }}>AI</span>
          </div>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Academic ERP System</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.5rem 0.85rem',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                background: isActive 
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(99, 102, 241, 0.25))' 
                  : 'transparent',
                color: isActive ? '#60a5fa' : item.highlight ? '#38bdf8' : '#cbd5e1',
                boxShadow: isActive ? 'inset 0 0 0 1px rgba(96, 165, 250, 0.4)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{
          fontSize: '0.75rem',
          padding: '0.25rem 0.75rem',
          borderRadius: '20px',
          fontWeight: '600',
          background: user?.role === 'student' ? 'rgba(59, 130, 246, 0.18)' : user?.role === 'teacher' ? 'rgba(245, 158, 11, 0.18)' : 'rgba(239, 68, 68, 0.18)',
          color: user?.role === 'student' ? '#93c5fd' : user?.role === 'teacher' ? '#fde047' : '#fca5a5',
          border: '1px solid currentColor'
        }}>
          {user?.role === 'student' ? 'Student' : user?.role === 'teacher' ? 'Faculty' : 'Admin'}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            color: '#fff'
          }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <button
            onClick={onLogout}
            style={{
              padding: '0.4rem',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
