import React, { useState } from 'react';
import AnimatedBackground from './components/AnimatedBackground';
import LoginPage from './components/LoginPage';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Timetable from './components/Timetable';
import AiTimetableGenerator from './components/AiTimetableGenerator';
import GeoAttendance from './components/GeoAttendance';
import AiChatbot from './components/AiChatbot';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      {/* 60FPS Ambient Constellation Background */}
      <AnimatedBackground />

      {!user ? (
        <LoginPage onLogin={(userObj) => setUser(userObj)} />
      ) : (
        <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            user={user} 
            onLogout={() => setUser(null)} 
          />

          <main style={{ flexGrow: 1, padding: '1.5rem', width: '100%' }}>
            {activeTab === 'dashboard' && <Dashboard user={user} setActiveTab={setActiveTab} />}
            {activeTab === 'timetable' && <Timetable />}
            {activeTab === 'ai-generator' && <AiTimetableGenerator />}
            {activeTab === 'geo-attendance' && <GeoAttendance user={user} />}
            {activeTab === 'ai-chatbot' && <AiChatbot user={user} />}
          </main>

          <footer style={{
            textAlign: 'center',
            padding: '1.25rem',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            fontSize: '0.78rem',
            color: '#64748b'
          }}>
            © 2026 SMART CLASS AI • Autonomous College ERP & Intelligent Timetable Scheduler
          </footer>
        </div>
      )}
    </div>
  );
}
