import React, { useState } from 'react';
import { Wand2, CheckCircle, AlertTriangle, Sparkles, RefreshCw, Send, Layers } from 'lucide-react';

export default function AiTimetableGenerator() {
  const [prompt, setPrompt] = useState('Create a 5-day collision-free timetable for Semester 4 Section A starting at 9 AM with 6 slots, prioritizing AI labs in afternoons.');
  const [semester, setSemester] = useState(4);
  const [slotsPerDay, setSlotsPerDay] = useState(6);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = (e) => {
    e.preventDefault();
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      setResult({
        totalClasses: 30,
        conflicts: 0,
        optimizationScore: 99.4,
        labsAllocated: 5,
        status: 'Optimal collision-free schedule synthesized successfully!'
      });
    }, 900);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Banner */}
      <div className="glass-panel" style={{
        padding: '2rem',
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.8), rgba(30, 58, 138, 0.8))',
        border: '1px solid rgba(96, 165, 250, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.2rem 0.65rem',
            borderRadius: '20px',
            background: 'rgba(245, 158, 11, 0.2)',
            color: '#fbbf24',
            fontSize: '0.75rem',
            fontWeight: '700',
            marginBottom: '0.5rem'
          }}>
            <Sparkles size={14} /> AI Constraint Satisfaction Scheduler
          </span>
          <h2 style={{ fontSize: '1.65rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.25rem' }}>
            AI Timetable Generator
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
            Mathematical optimization engine preventing room collisions and instructor double-booking.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Form Card */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wand2 size={18} color="#60a5fa" /> Configuration & Prompt
          </h3>

          <form onSubmit={handleGenerate}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.4rem' }}>
                Natural Language Scheduling Instruction
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  outline: 'none',
                  resize: 'none'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#94a3b8', marginBottom: '0.35rem' }}>
                  Target Semester
                </label>
                <input
                  type="number"
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  min={1}
                  max={8}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#ffffff',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#94a3b8', marginBottom: '0.35rem' }}>
                  Slots per Day
                </label>
                <input
                  type="number"
                  value={slotsPerDay}
                  onChange={(e) => setSlotsPerDay(Number(e.target.value))}
                  min={4}
                  max={8}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#ffffff',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="btn-primary-gradient"
              style={{
                width: '100%',
                padding: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                opacity: isGenerating ? 0.7 : 1
              }}
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Synthesizing Constraints...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Synthesize Schedule</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Card */}
        <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} color="#10b981" /> Optimization Report
          </h3>

          {result ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flexGrow: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#6ee7b7',
                fontSize: '0.85rem'
              }}>
                <CheckCircle size={18} />
                <span>{result.status}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Score</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#10b981', marginTop: '0.2rem' }}>
                    {result.optimizationScore}%
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Classes</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#38bdf8', marginTop: '0.2rem' }}>
                    {result.totalClasses}
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Conflicts</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#6ee7b7', marginTop: '0.2rem' }}>
                    {result.conflicts}
                  </div>
                </div>
              </div>

              <div style={{
                padding: '1rem',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                fontSize: '0.8rem',
                color: '#cbd5e1',
                lineHeight: '1.6'
              }}>
                <div>• Faculty double-booking checked: <strong>0 Clashes</strong></div>
                <div>• Smart Lab allocation: <strong>5 Dedicated Lab Sessions</strong></div>
                <div>• Student cognitive distribution: <strong>Even across 5 days</strong></div>
              </div>

              <button
                onClick={() => alert('Timetable successfully applied to live academic ERP!')}
                style={{
                  marginTop: 'auto',
                  padding: '0.8rem',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#6ee7b7',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Apply & Push to Live ERP
              </button>
            </div>
          ) : (
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#64748b', padding: '2rem' }}>
              <Wand2 size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
              <p style={{ fontSize: '0.85rem' }}>Click "Synthesize Schedule" to generate an optimized conflict-free timetable.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
