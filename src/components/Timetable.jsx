import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Clock, User, MapPin, Edit3, 
  Check, X, AlertCircle, RefreshCw, Sparkles 
} from 'lucide-react';
import { parseApiResponse } from '../utils/api';

export default function Timetable({ user }) {
  const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN';
  const [selectedClass, setSelectedClass] = useState(user?.className || '10-A');
  const [timetableEntries, setTimetableEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Modal State (for Teachers)
  const [editingCell, setEditingCell] = useState(null);
  const [editSubject, setEditSubject] = useState('');
  const [editTeacher, setEditTeacher] = useState('');
  const [editRoom, setEditRoom] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Real clock interval for live day & period highlighting
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000); // recompute every 10s
    return () => clearInterval(timer);
  }, []);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const dayNamesFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDayName = dayNamesFull[now.getDay()];

  const periods = [
    { period: 1, start: '09:00', end: '09:50', label: 'Period 1' },
    { period: 2, start: '09:55', end: '10:45', label: 'Period 2' },
    { period: 3, start: '10:50', end: '11:40', label: 'Period 3' },
    { period: 4, start: '11:45', end: '12:35', label: 'Period 4' },
    { period: 5, start: '13:30', end: '14:20', label: 'Period 5' },
    { period: 6, start: '14:25', end: '15:15', label: 'Period 6' },
  ];

  // Helper: check if a period is current active based on real clock
  const isPeriodActive = (day, pStart, pEnd) => {
    if (day !== todayDayName) return false;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [sh, sm] = pStart.split(':').map(Number);
    const [eh, em] = pEnd.split(':').map(Number);
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;

    return currentMinutes >= startMins && currentMinutes <= endMins;
  };

  // Fetch timetable from backend
  const fetchTimetable = async (className) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/timetable/${className}`, {
        credentials: 'include',
      });
      const data = await parseApiResponse(res, 'Failed to fetch schedule from server');
      setTimetableEntries(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable(selectedClass);
  }, [selectedClass]);

  // Open Edit Modal for a cell
  const handleCellClick = (day, pNum, currentEntry) => {
    if (!isTeacher) return;
    setEditingCell({ day, period: pNum, entry: currentEntry });
    setEditSubject(currentEntry?.subject || '');
    setEditTeacher(currentEntry?.teacherName || user?.name || '');
    setEditRoom(currentEntry?.room || 'Lecture Hall 101');
  };

  // Save modified cell to server
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingCell || !editSubject.trim()) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/timetable/entry', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          className: selectedClass,
          dayOfWeek: editingCell.day,
          period: editingCell.period,
          subject: editSubject.trim(),
          teacherName: editTeacher.trim(),
          room: editRoom.trim(),
        }),
      });

      const updated = await parseApiResponse(res, 'Failed to update schedule');

      // Update state locally
      setTimetableEntries((prev) => {
        const filtered = prev.filter(
          (e) => !(e.dayOfWeek === updated.dayOfWeek && e.period === updated.period)
        );
        return [...filtered, updated];
      });

      setEditingCell(null);
    } catch (err) {
      alert(`Save error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Build a lookup map: `${day}_${period}` -> entry
  const entryMap = new Map();
  timetableEntries.forEach((e) => {
    entryMap.set(`${e.dayOfWeek}_${e.period}`, e);
  });

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header & Class Switcher */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarIcon size={24} color="var(--primary-light)" />
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              Class Timetable
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Live period tracker • Today is <strong>{todayDayName}</strong>
            {isTeacher && <span style={{ color: 'var(--accent-gold)' }}> • Click any period cell to edit</span>}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isTeacher ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                Class Section:
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '10px',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="10-A">Class 10-A (Engineering & Math)</option>
                <option value="10-B">Class 10-B (Computer Systems)</option>
              </select>
            </div>
          ) : (
            <div
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '10px',
                background: 'var(--input-bg)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.82rem',
                fontWeight: '700',
                color: 'var(--primary-light)',
              }}
            >
              Enrolled: Class {user?.className || '10-A'}
            </div>
          )}

          <button
            onClick={() => fetchTimetable(selectedClass)}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: '10px',
              background: 'var(--input-bg)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8rem',
            }}
            title="Refresh Schedule"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div
          style={{
            padding: '1rem',
            borderRadius: '12px',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: 'var(--accent-rose)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem' }} />
          <p>Loading academic timetable for Class {selectedClass}...</p>
        </div>
      ) : (
        /* Timetable Grid */
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '920px' }}>
              <thead>
                <tr style={{ background: 'var(--input-bg)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th
                    style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      width: '130px',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Period / Time
                  </th>
                  {daysOfWeek.map((day) => {
                    const isToday = day === todayDayName;
                    return (
                      <th
                        key={day}
                        style={{
                          padding: '0.85rem 1rem',
                          textAlign: 'left',
                          fontSize: '0.85rem',
                          fontWeight: '700',
                          color: isToday ? 'var(--accent-gold)' : 'var(--text-primary)',
                          background: isToday ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
                          borderLeft: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span>{day}</span>
                          {isToday && (
                            <span
                              style={{
                                fontSize: '0.65rem',
                                padding: '0.1rem 0.4rem',
                                borderRadius: '10px',
                                background: 'var(--accent-gold)',
                                color: '#000',
                                fontWeight: '800',
                              }}
                            >
                              TODAY
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {periods.map((p, pIdx) => {
                  return (
                    <tr key={p.period} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      {/* Period Header */}
                      <td
                        style={{
                          padding: '0.85rem 1rem',
                          verticalAlign: 'top',
                          background: 'var(--input-bg)',
                          borderRight: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                          {p.label}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          {p.start} – {p.end}
                        </div>
                      </td>

                      {/* Day Cells */}
                      {daysOfWeek.map((day) => {
                        const entry = entryMap.get(`${day}_${p.period}`);
                        const active = isPeriodActive(day, p.start, p.end);
                        const isLab = entry?.room?.toLowerCase().includes('lab');

                        return (
                          <td
                            key={day}
                            onClick={() => handleCellClick(day, p.period, entry)}
                            style={{
                              padding: '0.55rem',
                              verticalAlign: 'top',
                              borderLeft: '1px solid var(--border-subtle)',
                              cursor: isTeacher ? 'pointer' : 'default',
                              background: active ? 'var(--active-period-bg)' : 'transparent',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {entry ? (
                              <div
                                style={{
                                  padding: '0.65rem 0.75rem',
                                  borderRadius: '10px',
                                  background: active
                                    ? 'rgba(245, 158, 11, 0.18)'
                                    : isLab
                                    ? 'rgba(236, 72, 153, 0.12)'
                                    : 'var(--input-bg)',
                                  border: active
                                    ? '2px solid var(--active-period-border)'
                                    : isLab
                                    ? '1px solid rgba(236, 72, 153, 0.3)'
                                    : '1px solid var(--border-subtle)',
                                  height: '100%',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '0.3rem',
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span
                                    style={{
                                      fontSize: '0.68rem',
                                      fontWeight: '700',
                                      padding: '0.1rem 0.35rem',
                                      borderRadius: '4px',
                                      background: isLab ? 'rgba(236, 72, 153, 0.25)' : 'rgba(79, 70, 229, 0.2)',
                                      color: isLab ? '#f472b6' : 'var(--primary-light)',
                                    }}
                                  >
                                    {isLab ? 'PRACTICAL LAB' : 'THEORY'}
                                  </span>

                                  {active && (
                                    <span
                                      style={{
                                        fontSize: '0.65rem',
                                        fontWeight: '800',
                                        color: 'var(--accent-gold)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.2rem',
                                      }}
                                    >
                                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-gold)' }} />
                                      LIVE NOW
                                    </span>
                                  )}

                                  {isTeacher && (
                                    <Edit3 size={12} color="var(--text-muted)" style={{ opacity: 0.6 }} />
                                  )}
                                </div>

                                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1.25 }}>
                                  {entry.subject}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                  <User size={12} color="var(--text-muted)" />
                                  <span>{entry.teacherName}</span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                  <MapPin size={11} color="var(--accent-cyan)" />
                                  <span>{entry.room}</span>
                                </div>
                              </div>
                            ) : (
                              <div
                                style={{
                                  padding: '1rem 0.5rem',
                                  textAlign: 'center',
                                  fontSize: '0.72rem',
                                  color: 'var(--text-muted)',
                                  fontStyle: 'italic',
                                }}
                              >
                                {isTeacher ? '+ Add Session' : 'Free Period'}
                              </div>
                            )}
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
      )}

      {/* Teacher Edit Modal */}
      {editingCell && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '460px',
              padding: '1.75rem',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                  Edit Timetable Period
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {editingCell.day} • Period {editingCell.period} • Class {selectedClass}
                </p>
              </div>
              <button
                onClick={() => setEditingCell(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '0.35rem' }}>
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  placeholder="e.g. Mathematics, AI & ML"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '0.35rem' }}>
                  Assigned Faculty
                </label>
                <input
                  type="text"
                  required
                  value={editTeacher}
                  onChange={(e) => setEditTeacher(e.target.value)}
                  placeholder="e.g. Prof. Rajesh Sharma"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '0.35rem' }}>
                  Venue / Classroom / Lab
                </label>
                <input
                  type="text"
                  required
                  value={editRoom}
                  onChange={(e) => setEditRoom(e.target.value)}
                  placeholder="e.g. Lecture Hall 301, AI Computing Lab 4"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setEditingCell(null)}
                  style={{
                    padding: '0.65rem 1.1rem',
                    borderRadius: '10px',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary-gradient"
                  style={{
                    padding: '0.65rem 1.25rem',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    opacity: isSaving ? 0.7 : 1,
                  }}
                >
                  {isSaving ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
