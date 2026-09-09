import React from 'react';
import { 
  Calendar, Clock, CheckCircle2, AlertCircle, BookOpen, 
  Sparkles, MapPin, ArrowRight, FileText, Users, Building
} from 'lucide-react';

export default function Dashboard({ user, setActiveTab }) {
  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Welcome Hero Card */}
      <div className="glass-panel" style={{
        padding: '2rem',
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.7), rgba(49, 46, 129, 0.7))',
        border: '1px solid rgba(255,255,255,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div>
          <span style={{
            fontSize: '0.75rem',
            padding: '0.2rem 0.65rem',
            borderRadius: '20px',
            background: 'rgba(255,255,255,0.15)',
            color: '#93c5fd',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {user?.role} Portal
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', marginTop: '0.35rem' }}>
            Welcome back, {user?.name}! 🎓
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
            ID: <strong>{user?.idNumber}</strong> • Semester <strong>{user?.semester}</strong> (Sec {user?.section}) • {user?.department}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setActiveTab('timetable')}
            className="btn-primary-gradient"
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Calendar size={16} /> My Timetable
          </button>
          <button
            onClick={() => setActiveTab('geo-attendance')}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: '600',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <MapPin size={16} color="#38bdf8" /> GPS Check-in
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' }}>Attendance Health</span>
            <CheckCircle2 size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#10b981', marginTop: '0.5rem' }}>
            88.5%
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem' }}>23 / 26 Verified Lectures</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' }}>Today's Classes</span>
            <Clock size={20} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#38bdf8', marginTop: '0.5rem' }}>
            4 Lectures
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem' }}>Next: AI & ML Lab at 1:00 PM</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' }}>Coursework Due</span>
            <BookOpen size={20} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fbbf24', marginTop: '0.5rem' }}>
            1 Pending
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem' }}>Minimax Lab due Friday</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' }}>Upcoming Break</span>
            <Sparkles size={20} color="#ec4899" />
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#f472b6', marginTop: '0.65rem' }}>
            In 12 Days
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem' }}>Science & Innovation Day</div>
        </div>
      </div>

      {/* Main Section: Schedule & Notices */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Today's Schedule Card */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="#60a5fa" /> Today's Classes
            </h3>
            <button
              onClick={() => setActiveTab('timetable')}
              style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '0.8rem', cursor: 'pointer' }}
            >
              Full Week &rarr;
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { time: '09:00 - 09:55 AM', code: 'CS401', name: 'Design & Analysis of Algorithms', room: 'LH-101', faculty: 'Prof. Sharma', done: true },
              { time: '10:00 - 10:55 AM', code: 'CS402', name: 'Database Management Systems', room: 'LH-101', faculty: 'Prof. Gupta', done: true },
              { time: '11:15 - 12:10 PM', code: 'CS403', name: 'Artificial Intelligence & ML', room: 'LH-102', faculty: 'Prof. Sharma', active: true },
              { time: '01:00 - 02:30 PM', code: 'CS405', name: 'AI & Data Science Practical Lab', room: 'AI Lab L-201', faculty: 'Prof. Sharma', isLab: true },
            ].map((slot, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.85rem',
                  borderRadius: '12px',
                  background: slot.active ? 'rgba(59, 130, 246, 0.18)' : 'rgba(255,255,255,0.03)',
                  border: slot.active ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', color: slot.active ? '#93c5fd' : '#94a3b8', fontWeight: '700' }}>
                    {slot.time} • {slot.room}
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff', marginTop: '0.15rem' }}>
                    {slot.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '0.15rem' }}>
                    {slot.faculty}
                  </div>
                </div>

                <div>
                  {slot.done && (
                    <span style={{ fontSize: '0.7rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '0.2rem 0.5rem', borderRadius: '12px' }}>
                      Attended
                    </span>
                  )}
                  {slot.active && (
                    <span style={{ fontSize: '0.7rem', color: '#60a5fa', background: 'rgba(59, 130, 246, 0.25)', padding: '0.2rem 0.5rem', borderRadius: '12px', fontWeight: 'bold' }}>
                      In Progress
                    </span>
                  )}
                  {slot.isLab && (
                    <span style={{ fontSize: '0.7rem', color: '#f472b6', background: 'rgba(236, 72, 153, 0.2)', padding: '0.2rem 0.5rem', borderRadius: '12px', fontWeight: 'bold' }}>
                      Lab Practical
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notices & Announcements */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} color="#f59e0b" /> Academic Notice Board
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ padding: '0.85rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontWeight: '700' }}>
                  URGENT
                </span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Yesterday</span>
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff', marginTop: '0.35rem' }}>
                Mid-Term Theory Examination Schedule Released
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem', lineHeight: '1.4' }}>
                Semester 4 mid-term evaluations commence on the 15th. Syllabus blueprints published.
              </p>
            </div>

            <div style={{ padding: '0.85rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', fontWeight: '700' }}>
                  GENERAL
                </span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>3 days ago</span>
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff', marginTop: '0.35rem' }}>
                Annual 48-Hour AI Student Hackathon
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem', lineHeight: '1.4' }}>
                Registrations now open for inter-college AI development sprint in Lab L-201.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
