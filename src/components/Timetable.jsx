import React, { useState } from 'react';
import { Clock, MapPin, User, BookOpen, Filter } from 'lucide-react';

export default function Timetable() {
  const [semester, setSemester] = useState(4);
  const [section, setSection] = useState('A');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const times = [
    { start: '09:00 AM', end: '09:55 AM', label: 'Period 1' },
    { start: '10:00 AM', end: '10:55 AM', label: 'Period 2' },
    { start: '11:15 AM', end: '12:10 PM', label: 'Period 3' },
    { start: '12:10 PM', end: '01:00 PM', label: 'Lunch Break', isBreak: true },
    { start: '01:00 PM', end: '02:30 PM', label: 'Lab Practical', isLab: true },
    { start: '02:40 PM', end: '03:45 PM', label: 'Period 5' },
  ];

  const scheduleData = {
    Monday: [
      { code: 'CS401', name: 'Design & Analysis of Algorithms', room: 'LH-101', faculty: 'Prof. Sharma', type: 'lecture' },
      { code: 'CS402', name: 'Database Management Systems', room: 'LH-101', faculty: 'Prof. Gupta', type: 'lecture' },
      { code: 'CS403', name: 'Artificial Intelligence & ML', room: 'LH-102', faculty: 'Prof. Sharma', type: 'lecture' },
      { isBreak: true },
      { code: 'CS405', name: 'AI & Data Science Practical Lab', room: 'AI Lab L-201', faculty: 'Prof. Sharma', type: 'lab' },
      { code: 'CS404', name: 'Computer Networks & Security', room: 'LH-102', faculty: 'Prof. Gupta', type: 'lecture' },
    ],
    Tuesday: [
      { code: 'CS402', name: 'Database Management Systems', room: 'LH-101', faculty: 'Prof. Gupta', type: 'lecture' },
      { code: 'CS401', name: 'Design & Analysis of Algorithms', room: 'LH-101', faculty: 'Prof. Sharma', type: 'lecture' },
      { code: 'CS404', name: 'Computer Networks & Security', room: 'LH-102', faculty: 'Prof. Gupta', type: 'lecture' },
      { isBreak: true },
      { code: 'CS406', name: 'Database Systems Implementation Lab', room: 'Cloud Lab L-202', faculty: 'Prof. Gupta', type: 'lab' },
      { code: 'CS403', name: 'Artificial Intelligence & ML', room: 'LH-102', faculty: 'Prof. Sharma', type: 'lecture' },
    ],
    Wednesday: [
      { code: 'CS403', name: 'Artificial Intelligence & ML', room: 'LH-101', faculty: 'Prof. Sharma', type: 'lecture' },
      { code: 'CS404', name: 'Computer Networks & Security', room: 'LH-101', faculty: 'Prof. Gupta', type: 'lecture' },
      { code: 'CS401', name: 'Design & Analysis of Algorithms', room: 'LH-102', faculty: 'Prof. Sharma', type: 'lecture' },
      { isBreak: true },
      { code: 'CS407', name: 'Machine Learning Model Deployment', room: 'AI Lab L-201', faculty: 'Prof. Sharma', type: 'lab' },
      { code: 'CS402', name: 'Database Management Systems', room: 'LH-102', faculty: 'Prof. Gupta', type: 'lecture' },
    ],
    Thursday: [
      { code: 'CS401', name: 'Design & Analysis of Algorithms', room: 'LH-101', faculty: 'Prof. Sharma', type: 'lecture' },
      { code: 'CS402', name: 'Database Management Systems', room: 'LH-101', faculty: 'Prof. Gupta', type: 'lecture' },
      { code: 'CS403', name: 'Artificial Intelligence & ML', room: 'LH-102', faculty: 'Prof. Sharma', type: 'lecture' },
      { isBreak: true },
      { code: 'CS408', name: 'Network Packet Analysis Workshop', room: 'Cyber Lab L-203', faculty: 'Prof. Gupta', type: 'lab' },
      { code: 'CS404', name: 'Computer Networks & Security', room: 'LH-102', faculty: 'Prof. Gupta', type: 'lecture' },
    ],
    Friday: [
      { code: 'CS404', name: 'Computer Networks & Security', room: 'LH-101', faculty: 'Prof. Gupta', type: 'lecture' },
      { code: 'CS403', name: 'Artificial Intelligence & ML', room: 'LH-101', faculty: 'Prof. Sharma', type: 'lecture' },
      { code: 'CS402', name: 'Database Management Systems', room: 'LH-102', faculty: 'Prof. Gupta', type: 'lecture' },
      { isBreak: true },
      { code: 'CS409', name: 'Capstone Project Mentorship Lab', room: 'AI Lab L-201', faculty: 'Prof. Sharma', type: 'lab' },
      { code: 'CS401', name: 'Design & Analysis of Algorithms', room: 'LH-102', faculty: 'Prof. Sharma', type: 'lecture' },
    ],
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header & Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff' }}>Smart Academic Timetable</h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Dynamic weekly schedule with real-time room allocations</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.06)', padding: '0.4rem 0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Filter size={15} color="#94a3b8" />
            <select
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
              style={{ background: 'transparent', color: '#fff', border: 'none', fontSize: '0.82rem', outline: 'none' }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s} style={{ background: '#0f172a' }}>Semester {s}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.06)', padding: '0.4rem 0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              style={{ background: 'transparent', color: '#fff', border: 'none', fontSize: '0.82rem', outline: 'none' }}
            >
              <option value="A" style={{ background: '#0f172a' }}>Section A</option>
              <option value="B" style={{ background: '#0f172a' }}>Section B</option>
            </select>
          </div>
        </div>
      </div>

      {/* Timetable Table Grid */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', width: '140px' }}>Time Slot</th>
                {days.map((day) => (
                  <th key={day} style={{ padding: '1rem', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '700' }}>
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {times.map((slot, sIdx) => {
                if (slot.isBreak) {
                  return (
                    <tr key={sIdx} style={{ background: 'rgba(245, 158, 11, 0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', color: '#f59e0b', fontWeight: '600' }}>
                        {slot.start} - {slot.end}
                      </td>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '0.75rem', color: '#fbbf24', fontSize: '0.82rem', fontWeight: '600', letterSpacing: '1px' }}>
                        ☕ LUNCH & REFRESHMENT BREAK
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={sIdx} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '1rem', fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', verticalAlign: 'top' }}>
                      <div style={{ color: '#e2e8f0', fontWeight: '700' }}>{slot.start}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>to {slot.end}</div>
                    </td>

                    {days.map((day) => {
                      const item = scheduleData[day][sIdx];
                      if (!item || item.isBreak) return <td key={day}></td>;

                      const isLab = item.type === 'lab';

                      return (
                        <td key={day} style={{ padding: '0.65rem', verticalAlign: 'top' }}>
                          <div style={{
                            background: isLab ? 'rgba(236, 72, 153, 0.12)' : 'rgba(59, 130, 246, 0.1)',
                            borderLeft: isLab ? '3px solid #ec4899' : '3px solid #3b82f6',
                            borderRadius: '8px',
                            padding: '0.6rem 0.75rem',
                            height: '100%',
                            transition: 'all 0.2s ease'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                              <span style={{
                                fontSize: '0.68rem',
                                padding: '0.15rem 0.4rem',
                                borderRadius: '4px',
                                background: isLab ? 'rgba(236, 72, 153, 0.25)' : 'rgba(59, 130, 246, 0.25)',
                                color: isLab ? '#f472b6' : '#93c5fd',
                                fontWeight: '700'
                              }}>
                                {item.code}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: '600' }}>
                                {item.room}
                              </span>
                            </div>

                            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.3rem', lineHeight: '1.25' }}>
                              {item.name}
                            </div>

                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <User size={12} color="#64748b" />
                              <span>{item.faculty}</span>
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
