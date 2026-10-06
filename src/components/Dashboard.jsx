import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, CheckCircle2, AlertCircle, BookOpen, 
  MapPin, ArrowRight, FileText, Users, Plus, ShieldCheck, Sparkles, AlertTriangle, Camera
} from 'lucide-react';
import { safeJson } from '../utils/api';

export default function Dashboard({ user, setActiveTab, onOpenAiBot }) {
  const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  // Live Real Clock
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // CCTV Stats
  const [cctvStats, setCctvStats] = useState(null);
  useEffect(() => {
    fetch('/api/cctv/stats', { credentials: 'include' })
      .then((res) => (res.ok ? safeJson(res) : null))
      .then((data) => {
        if (data) setCctvStats(data);
      })
      .catch(console.error);
  }, []);

  // Student Metrics State
  const [attendanceRate, setAttendanceRate] = useState(90);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [pendingAssignmentsCount, setPendingAssignmentsCount] = useState(0);
  const [upcomingTestsCount, setUpcomingTestsCount] = useState(0);
  const [todayClasses, setTodayClasses] = useState([]);

  // Teacher Metrics State
  const [teacherClass, setTeacherClass] = useState(user?.className || '10-A');
  const [totalStudentsCount, setTotalStudentsCount] = useState(0);
  const [assignmentsCount, setAssignmentsCount] = useState(0);

  const daysFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDayName = daysFull[now.getDay()];

  // Fetch student dashboard data
  useEffect(() => {
    if (!isTeacher) {
      // 1. Attendance
      fetch('/api/attendance/my', { credentials: 'include' })
        .then((res) => (res.ok ? safeJson(res) : null))
        .then((data) => {
          if (data?.stats) {
            setAttendanceRate(data.stats.percentage);
            setAttendanceStats(data.stats);
          }
        })
        .catch(console.error);

      // 2. Coursework
      fetch('/api/assignments', { credentials: 'include' })
        .then(async (res) => (res.ok ? (await safeJson(res)) || [] : []))
        .then((items) => {
          if (Array.isArray(items)) {
            const pending = items.filter((i) => !i.isDone && i.type === 'ASSIGNMENT').length;
            const tests = items.filter((i) => i.type === 'TEST').length;
            setPendingAssignmentsCount(pending);
            setUpcomingTestsCount(tests);
          }
        })
        .catch(console.error);

      // 3. Today's classes
      if (user?.className) {
        fetch(`/api/timetable/${user.className}`, { credentials: 'include' })
          .then(async (res) => (res.ok ? (await safeJson(res)) || [] : []))
          .then((entries) => {
            if (Array.isArray(entries)) {
              const forToday = entries.filter((e) => e.dayOfWeek === todayDayName);
              setTodayClasses(forToday);
            }
          })
          .catch(console.error);
      }
    } else {
      // Teacher stats
      // 1. Total students & assignments
      fetch('/api/attendance/summary', { credentials: 'include' })
        .then(async (res) => (res.ok ? (await safeJson(res)) || [] : []))
        .then((students) => {
          if (Array.isArray(students)) {
            setTotalStudentsCount(students.length);
          }
        })
        .catch(console.error);

      fetch('/api/assignments?className=10-A', { credentials: 'include' })
        .then(async (res) => (res.ok ? (await safeJson(res)) || [] : []))
        .then((items) => {
          if (Array.isArray(items)) {
            setAssignmentsCount(items.length);
          }
        })
        .catch(console.error);

      // 2. Today's classes for selected teacher class
      fetch(`/api/timetable/${teacherClass}`, { credentials: 'include' })
        .then(async (res) => (res.ok ? (await safeJson(res)) || [] : []))
        .then((entries) => {
          if (Array.isArray(entries)) {
            const forToday = entries.filter((e) => e.dayOfWeek === todayDayName);
            setTodayClasses(forToday);
          }
        })
        .catch(console.error);
    }
  }, [isTeacher, user, todayDayName, teacherClass]);

  const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
      {/* Welcome Hero Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.25), rgba(124, 58, 237, 0.25))',
          border: '1px solid var(--border-active)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                padding: '0.2rem 0.65rem',
                borderRadius: '20px',
                background: isTeacher ? 'rgba(245, 158, 11, 0.2)' : 'rgba(79, 70, 229, 0.2)',
                color: isTeacher ? 'var(--accent-gold)' : 'var(--primary-light)',
                border: '1px solid currentColor',
              }}
            >
              {isTeacher ? 'Faculty Command Center' : `Enrolled • Class ${user?.className || '10-A'}`}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {formattedDate}
            </span>
          </div>

          <h2 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
            Welcome back, {user?.name}! 🎓
          </h2>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            {isTeacher
              ? `Authorized Faculty Staff • Assigned Department: Academic Curriculum & Timetabling`
              : `Institutional Roll: ${user?.rollNo || '10A01'} • Arka Jain University (Gamharia)`}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {!isTeacher ? (
            <>
              <button
                onClick={() => setActiveTab('attendance')}
                className="btn-primary-gradient"
                style={{
                  padding: '0.65rem 1.25rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <MapPin size={16} />
                <span>Mark GPS Attendance</span>
              </button>

              <button
                onClick={() => setActiveTab('timetable')}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Calendar size={16} color="var(--primary-light)" />
                <span>View Full Week</span>
              </button>

              <button
                onClick={() => setActiveTab('cctv-attendance')}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  background: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid rgba(6, 182, 212, 0.35)',
                  color: '#06b6d4',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Camera size={16} />
                <span>CCTV Gate Monitor</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('attendance')}
                className="btn-primary-gradient"
                style={{
                  padding: '0.65rem 1.25rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <ShieldCheck size={16} />
                <span>Take Daily Roll Call</span>
              </button>

              <button
                onClick={() => setActiveTab('cctv-attendance')}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  background: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid rgba(6, 182, 212, 0.35)',
                  color: '#06b6d4',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Camera size={16} />
                <span>CCTV Gate Monitor</span>
              </button>

              <button
                onClick={() => setActiveTab('assignments')}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Plus size={16} color="var(--accent-gold)" />
                <span>Post Assignment / Test</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* KPI Statistic Cards */}
      {!isTeacher ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          {/* Attendance Health */}
          <div className="glass-panel" style={{ padding: '1.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                Attendance Rate
              </span>
              <CheckCircle2 size={20} color={attendanceRate >= 75 ? 'var(--accent-emerald)' : 'var(--accent-rose)'} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: attendanceRate >= 75 ? 'var(--accent-emerald)' : 'var(--accent-rose)', marginTop: '0.4rem' }}>
              {attendanceRate}%
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {attendanceRate < 75 ? '⚠️ Below 75% regulatory criteria' : '✓ Compliant with university criteria'}
            </div>
          </div>

          {/* Today's Lectures */}
          <div className="glass-panel" style={{ padding: '1.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                Today's Lectures ({todayDayName})
              </span>
              <Clock size={20} color="var(--primary-light)" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-light)', marginTop: '0.4rem' }}>
              {todayClasses.length} Sessions
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {todayClasses.length > 0 ? `Next up: ${todayClasses[0]?.subject}` : 'No scheduled lectures today'}
            </div>
          </div>

          {/* Pending Assignments */}
          <div className="glass-panel" style={{ padding: '1.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                Pending Homework
              </span>
              <BookOpen size={20} color="var(--accent-gold)" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-gold)', marginTop: '0.4rem' }}>
              {pendingAssignmentsCount} Active
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Track tasks in Coursework tab
            </div>
          </div>

          {/* Upcoming Tests */}
          <div className="glass-panel" style={{ padding: '1.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                Upcoming Tests
              </span>
              <Sparkles size={20} color="#ec4899" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ec4899', marginTop: '0.4rem' }}>
              {upcomingTestsCount} Scheduled
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Unit tests and midterm assessments
            </div>
          </div>

          {/* CCTV Gate Passages */}
          <div
            className="glass-panel"
            style={{ padding: '1.4rem', cursor: 'pointer' }}
            onClick={() => setActiveTab('cctv-attendance')}
            title="Click to view CCTV Gate Monitor"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                CCTV Gate Crossings
              </span>
              <Camera size={20} color="#06b6d4" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#06b6d4', marginTop: '0.4rem' }}>
              {attendanceStats?.todayPassCount || 0} Passes
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {attendanceStats?.todayVerifiedBy === 'CCTV_FACIAL_RECOGNITION' ? '✓ Auto-Attended via CCTV' : 'Turnstile facial recognition active'}
            </div>
          </div>
        </div>
      ) : (
        /* Teacher KPI Cards */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div className="glass-panel" style={{ padding: '1.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>Total Students</span>
              <Users size={20} color="var(--primary-light)" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-light)', marginTop: '0.4rem' }}>
              {totalStudentsCount} Enrolled
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Across Classes 10-A & 10-B</div>
          </div>

          <div className="glass-panel" style={{ padding: '1.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>Active Tasks & Tests</span>
              <BookOpen size={20} color="var(--accent-gold)" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-gold)', marginTop: '0.4rem' }}>
              {assignmentsCount} Broadcasted
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Current semester coursework</div>
          </div>

          <div
            className="glass-panel"
            style={{ padding: '1.4rem', cursor: 'pointer' }}
            onClick={() => setActiveTab('cctv-attendance')}
            title="Click to view live CCTV monitoring"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>CCTV Gate Crossings</span>
              <Camera size={20} color="#06b6d4" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#06b6d4', marginTop: '0.4rem' }}>
              {cctvStats?.totalPassages || 0} Today
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {cctvStats?.cctvAttendanceCount || 0} Auto-Attended via CCTV
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>Classes Today ({todayDayName})</span>
              <Clock size={20} color="var(--accent-cyan)" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-cyan)', marginTop: '0.4rem' }}>
              {todayClasses.length} Sessions
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>For Class {teacherClass}</div>
          </div>

          <div className="glass-panel" style={{ padding: '1.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>Geofence Security</span>
              <ShieldCheck size={20} color="var(--accent-emerald)" />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent-emerald)', marginTop: '0.5rem' }}>
              GPS Verified
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Server-side Haversine gate</div>
          </div>
        </div>
      )}

      {/* Today's Schedule & Academic Notices */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem' }}>
        {/* Today's Schedule Section */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} color="var(--primary-light)" />
                <span>Today's Classes ({todayDayName})</span>
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {isTeacher ? (
                  <span>
                    Viewing schedule for{' '}
                    <select
                      value={teacherClass}
                      onChange={(e) => setTeacherClass(e.target.value)}
                      style={{
                        background: 'transparent',
                        color: 'var(--primary-light)',
                        border: 'none',
                        fontWeight: '700',
                        fontSize: '0.75rem',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="10-A">Class 10-A</option>
                      <option value="10-B">Class 10-B</option>
                    </select>
                  </span>
                ) : (
                  `Schedule for Class ${user?.className || '10-A'}`
                )}
              </p>
            </div>

            <button
              onClick={() => setActiveTab('timetable')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-light)',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <span>Full Week</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {todayClasses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No classes scheduled for today. Enjoy your study and review time!
              </div>
            ) : (
              todayClasses.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--primary-light)', fontWeight: '800' }}>
                      Period {item.period} • {item.startTime} – {item.endTime}
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                      {item.subject}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {item.teacherName} • <em>{item.room}</em>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '12px',
                      background: item.room.toLowerCase().includes('lab')
                        ? 'rgba(236, 72, 153, 0.18)'
                        : 'rgba(79, 70, 229, 0.18)',
                      color: item.room.toLowerCase().includes('lab') ? '#f472b6' : 'var(--primary-light)',
                      fontWeight: '700',
                    }}
                  >
                    {item.room.toLowerCase().includes('lab') ? 'Practical Lab' : 'Lecture'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Academic Notices & Announcements */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} color="var(--accent-gold)" />
              <span>Official Announcements</span>
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Fall Academic Session</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ padding: '0.9rem', borderRadius: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem', borderRadius: '6px', background: 'rgba(244, 63, 94, 0.18)', color: 'var(--accent-rose)', fontWeight: '800' }}>
                  URGENT COMPLIANCE
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Yesterday</span>
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                75% Minimum Attendance Requirement
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: '1.4' }}>
                Arka Jain University mandates 75% attendance for examination eligibility. Daily GPS check-in is mandatory.
              </p>
            </div>

            <div style={{ padding: '0.9rem', borderRadius: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem', borderRadius: '6px', background: 'rgba(79, 70, 229, 0.18)', color: 'var(--primary-light)', fontWeight: '800' }}>
                  AI INNOVATION
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>3 days ago</span>
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                SMARTCLASS AI Autonomous Schedule Assistant Live
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: '1.4' }}>
                You can now query the intelligent floating chatbot from anywhere in the portal to check timetables, coursework, and deadlines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
