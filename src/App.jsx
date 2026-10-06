import React, { useState, useEffect } from 'react';
import AnimatedBackground from './components/AnimatedBackground';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Timetable from './components/Timetable';
import AiTimetableGenerator from './components/AiTimetableGenerator';
import GeoAttendance from './components/GeoAttendance';
import CctvFaceAttendance from './components/CctvFaceAttendance';
import AiChatbot from './components/AiChatbot';
import Assignments from './components/Assignments';
import SettingsView from './components/SettingsView';
import FloatingAiAssistant from './components/FloatingAiAssistant';
import { RefreshCw } from 'lucide-react';
import { safeJson } from './utils/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAiBotOpen, setIsAiBotOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Theme Management (Night / Day mode)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('smartclass_theme') || 'night';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('smartclass_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'night' ? 'day' : 'night'));
  };

  // Restore authenticated session on initial mount
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => (res.ok ? safeJson(res) : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        }
      })
      .catch((err) => console.error('Session check error:', err))
      .finally(() => setIsCheckingAuth(false));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    setUser(null);
    setActiveTab('dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      {/* Dynamic Ambient Constellation Canvas */}
      <AnimatedBackground theme={theme} />

      {isCheckingAuth ? (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            position: 'relative',
            zIndex: 10,
            color: 'var(--text-secondary)',
          }}
        >
          <img src="/logo.svg" alt="SMARTCLASS AI" style={{ width: '48px', height: '48px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem' }}>
            <RefreshCw size={18} className="animate-spin" style={{ color: 'var(--primary-light)' }} />
            <span>Connecting to SMARTCLASS Academic Portal...</span>
          </div>
        </div>
      ) : !user ? (
        <LoginPage onLogin={(userObj) => setUser(userObj)} />
      ) : (
        <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          {/* Header & Collapsible Drawer Navigation */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            user={user}
            onLogout={handleLogout}
            theme={theme}
            toggleTheme={toggleTheme}
            onOpenAiBot={() => setIsAiBotOpen(true)}
          />

          <main style={{ flexGrow: 1, padding: '1.5rem', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
            {activeTab === 'dashboard' && (
              <Dashboard
                user={user}
                setActiveTab={setActiveTab}
                onOpenAiBot={() => setIsAiBotOpen(true)}
              />
            )}
            {activeTab === 'timetable' && <Timetable user={user} />}
            {(activeTab === 'attendance' || activeTab === 'geo-attendance') && <GeoAttendance user={user} onOpenCctv={() => setActiveTab('cctv-attendance')} />}
            {activeTab === 'cctv-attendance' && <CctvFaceAttendance user={user} />}
            {activeTab === 'assignments' && <Assignments user={user} />}
            {activeTab === 'ai-generator' && <AiTimetableGenerator />}
            {(activeTab === 'ai-assistant' || activeTab === 'ai-chatbot') && <AiChatbot user={user} />}
            {activeTab === 'settings' && <SettingsView user={user} />}
          </main>

          {/* Persistent Floating AI Assistant Widget */}
          <FloatingAiAssistant
            user={user}
            isOpen={isAiBotOpen}
            setIsOpen={setIsAiBotOpen}
          />

          <footer
            style={{
              textAlign: 'center',
              padding: '1.25rem',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
            }}
          >
            © 2026 SMARTCLASS AI • Autonomous Collegiate ERP & Intelligent Timetable Scheduler • Apex International Academy
          </footer>
        </div>
      )}
    </div>
  );
}
