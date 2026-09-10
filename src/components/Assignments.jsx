import React, { useState, useEffect } from 'react';
import { 
  BookOpenCheck, Plus, Trash2, CheckCircle2, Circle, AlertCircle, 
  Clock, Calendar, Filter, FileText, Sparkles, RefreshCw, X 
} from 'lucide-react';

export default function Assignments({ user }) {
  const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN';
  const [selectedClass, setSelectedClass] = useState(user?.className || '10-A');
  const [items, setItems] = useState([]);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'ASSIGNMENT' | 'TEST'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State for Teachers
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newType, setNewType] = useState('ASSIGNMENT');
  const [newClass, setNewClass] = useState(selectedClass);
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Fetch assignments
  const fetchAssignments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/assignments?className=${selectedClass}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Failed to load coursework records');
      }
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [selectedClass]);

  // Student toggle done
  const handleToggleDone = async (id) => {
    try {
      const res = await fetch(`/api/assignments/${id}/toggle-done`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, isDone: data.isDone } : item))
        );
      }
    } catch (e) {
      console.error('Failed to toggle completion', e);
    }
  };

  // Teacher delete item
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coursework entry?')) return;
    try {
      const res = await fetch(`/api/assignments/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (e) {
      alert('Delete failed');
    }
  };

  // Teacher create new item
  const handleCreate = async (e) => {
    e.preventDefault();
    setModalError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: newTitle.trim(),
          className: newClass,
          subject: newSubject.trim(),
          type: newType,
          description: newDescription.trim(),
          dueDate: newDueDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to publish coursework');
      }

      setShowCreateModal(false);
      setNewTitle('');
      setNewSubject('');
      setNewDescription('');
      setNewDueDate('');
      fetchAssignments();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = items.filter((item) => {
    if (filterType === 'ALL') return true;
    return item.type === filterType;
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Header */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <BookOpenCheck size={26} color="var(--accent-gold)" />
            <h2 style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              Assignments & Tests
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Curriculum deadlines, problem sets, and unit assessments for Class {selectedClass}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isTeacher ? (
            <>
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
                }}
              >
                <option value="10-A">Class 10-A</option>
                <option value="10-B">Class 10-B</option>
              </select>

              <button
                onClick={() => {
                  setNewClass(selectedClass);
                  setShowCreateModal(true);
                }}
                className="btn-primary-gradient"
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Plus size={16} />
                <span>Post New Item</span>
              </button>
            </>
          ) : (
            <div
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '10px',
                background: 'var(--input-bg)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.82rem',
                fontWeight: '700',
                color: 'var(--accent-gold)',
              }}
            >
              Class {user?.className} Portal
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {[
          { id: 'ALL', label: 'All Tasks' },
          { id: 'ASSIGNMENT', label: 'Assignments' },
          { id: 'TEST', label: 'Tests & Exams' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterType(f.id)}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              background: filterType === f.id ? 'linear-gradient(135deg, var(--primary), #7c3aed)' : 'var(--input-bg)',
              color: filterType === f.id ? '#fff' : 'var(--text-secondary)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
          <p>Loading curriculum coursework...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <BookOpenCheck size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
          <p>No coursework or tests found for this filter.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredItems.map((item) => {
            const isTest = item.type === 'TEST';
            return (
              <div
                key={item.id}
                className="glass-panel"
                style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  borderLeft: isTest ? '4px solid #ec4899' : '4px solid var(--primary-light)',
                  opacity: item.isDone ? 0.75 : 1,
                  background: item.isDone ? 'rgba(15, 23, 42, 0.4)' : 'var(--bg-card)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', flex: 1 }}>
                  {!isTeacher && (
                    <button
                      onClick={() => handleToggleDone(item.id)}
                      aria-label={item.isDone ? 'Mark Incomplete' : 'Mark Complete'}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: item.isDone ? 'var(--accent-emerald)' : 'var(--text-muted)',
                        padding: '2px',
                        marginTop: '2px',
                      }}
                    >
                      {item.isDone ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                    </button>
                  )}

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: '800',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '6px',
                          background: isTest ? 'rgba(236, 72, 153, 0.2)' : 'rgba(79, 70, 229, 0.2)',
                          color: isTest ? '#f472b6' : 'var(--primary-light)',
                        }}
                      >
                        {item.type}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-gold)' }}>
                        {item.subject}
                      </span>
                      {item.isOverdue && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: '800',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '6px',
                            background: 'rgba(244, 63, 94, 0.18)',
                            color: 'var(--accent-rose)',
                          }}
                        >
                          ⚠️ OVERDUE
                        </span>
                      )}
                      {item.isDone && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: '800',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '6px',
                            background: 'rgba(16, 185, 129, 0.18)',
                            color: 'var(--accent-emerald)',
                          }}
                        >
                          ✓ COMPLETED
                        </span>
                      )}
                    </div>

                    <h3
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: '700',
                        color: 'var(--text-primary)',
                        textDecoration: item.isDone ? 'line-through' : 'none',
                        margin: 0,
                      }}
                    >
                      {item.title}
                    </h3>

                    {item.description && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: '1.45' }}>
                        {item.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.6rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={13} /> Due: <strong>{item.dueDate}</strong>
                      </span>
                      <span>•</span>
                      <span>Faculty: {item.teacherName}</span>
                    </div>
                  </div>
                </div>

                {isTeacher && (
                  <button
                    onClick={() => handleDelete(item.id)}
                    aria-label="Delete coursework"
                    style={{
                      padding: '0.45rem',
                      borderRadius: '8px',
                      background: 'rgba(244, 63, 94, 0.12)',
                      border: '1px solid rgba(244, 63, 94, 0.25)',
                      color: 'var(--accent-rose)',
                      cursor: 'pointer',
                    }}
                    title="Delete item"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal for Teachers */}
      {showCreateModal && (
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
              maxWidth: '520px',
              padding: '1.75rem',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                  Publish Coursework or Test
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Broadcast task details to enrolled student portals
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: 'var(--accent-rose)',
                  fontSize: '0.8rem',
                  marginBottom: '1rem',
                }}
              >
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '0.35rem' }}>
                    Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
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
                  >
                    <option value="ASSIGNMENT">Assignment / Homework</option>
                    <option value="TEST">Timed Unit Test / Exam</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '0.35rem' }}>
                    Target Class
                  </label>
                  <select
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
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
                  >
                    <option value="10-A">Class 10-A</option>
                    <option value="10-B">Class 10-B</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '0.35rem' }}>
                  Subject
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics, Computer Science, Physics"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
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
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '0.35rem' }}>
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Calculus Derivatives Problem Set 4"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
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
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '0.35rem' }}>
                  Due / Examination Date
                </label>
                <input
                  type="date"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
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

              {newType === 'ASSIGNMENT' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '0.35rem' }}>
                    Instructions / Problem Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide guidelines, chapter exercises, or submission requirements..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--input-border)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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
                  disabled={isSubmitting}
                  className="btn-primary-gradient"
                  style={{
                    padding: '0.65rem 1.25rem',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <span>Broadcast Task</span>
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
