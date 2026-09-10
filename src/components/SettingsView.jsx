import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Compass, CheckCircle2, AlertCircle, RefreshCw, Building } from 'lucide-react';

export default function SettingsView({ user }) {
  const isAuthorized = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  const [schoolName, setSchoolName] = useState('Apex International Academy');
  const [latitude, setLatitude] = useState(28.6139);
  const [longitude, setLongitude] = useState(77.2090);
  const [attendanceRadiusMeters, setAttendanceRadiusMeters] = useState(250);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isReadingGps, setIsReadingGps] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/settings', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSchoolName(data.schoolName);
        setLatitude(data.latitude);
        setLongitude(data.longitude);
        setAttendanceRadiusMeters(data.attendanceRadiusMeters);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          schoolName,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          attendanceRadiusMeters: parseFloat(attendanceRadiusMeters),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save settings');
      }

      const updated = await res.json();
      setMessage({ type: 'success', text: 'School configuration and attendance geofence updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetToCurrentLocation = () => {
    setIsReadingGps(true);
    setMessage(null);

    if (!navigator.geolocation) {
      setMessage({ type: 'error', text: 'Geolocation is not supported by this browser.' });
      setIsReadingGps(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(Number(pos.coords.latitude.toFixed(6)));
        setLongitude(Number(pos.coords.longitude.toFixed(6)));
        setIsReadingGps(false);
        setMessage({
          type: 'success',
          text: `Retrieved your current coordinates (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}). Click 'Save Configuration' to apply!`,
        });
      },
      (err) => {
        setIsReadingGps(false);
        setMessage({ type: 'error', text: `GPS error: ${err.message}` });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <SettingsIcon size={26} color="var(--primary-light)" />
          <h2 style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
            Campus & Geofence Settings
          </h2>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Configure institutional identity, physical campus center coordinates, and attendance perimeter radius
        </p>
      </div>

      {message && (
        <div
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
            color: message.type === 'success' ? 'var(--accent-emerald)' : 'var(--accent-rose)',
          }}
        >
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {!isAuthorized && (
        <div
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(79, 70, 229, 0.12)',
            border: '1px solid rgba(79, 70, 229, 0.25)',
            color: 'var(--primary-light)',
          }}
        >
          <Building size={18} />
          <span>Institutional Policy: Campus GPS coordinates and perimeter boundary can only be adjusted by Faculty and Administrators.</span>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '2rem' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
            <p>Loading school parameters...</p>
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '0.4rem' }}>
                Institution / School Name
              </label>
              <input
                type="text"
                required
                disabled={!isAuthorized}
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '0.4rem' }}>
                  Campus Latitude (°N)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  disabled={!isAuthorized}
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                    outline: 'none',
                    opacity: !isAuthorized ? 0.7 : 1,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '0.4rem' }}>
                  Campus Longitude (°E)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  disabled={!isAuthorized}
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    background: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                    outline: 'none',
                    opacity: !isAuthorized ? 0.7 : 1,
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '0.4rem' }}>
                Attendance Geofence Boundary Radius (Meters)
              </label>
              <input
                type="number"
                min="20"
                max="5000"
                required
                disabled={!isAuthorized}
                value={attendanceRadiusMeters}
                onChange={(e) => setAttendanceRadiusMeters(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--input-border)',
                  color: 'var(--text-primary)',
                  fontSize: '0.88rem',
                  outline: 'none',
                  opacity: !isAuthorized ? 0.7 : 1,
                }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
                Students further than this distance from the center coordinates will be rejected with an out-of-bounds error.
              </span>
            </div>

            {isAuthorized && (
              <>
                {/* Quick Calibration Button */}
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    background: 'rgba(79, 70, 229, 0.08)',
                    border: '1px solid rgba(79, 70, 229, 0.2)',
                    marginBottom: '1.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      Testing & Live Demo Calibration
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      Auto-fill coordinates with your physical device's current GPS fix
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSetToCurrentLocation}
                    disabled={isReadingGps}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: '8px',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--primary-light)',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <Compass size={15} className={isReadingGps ? 'animate-spin' : ''} />
                    <span>Fill My Current GPS</span>
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn-primary-gradient"
                    style={{
                      padding: '0.75rem 1.5rem',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      opacity: isSaving ? 0.7 : 1,
                    }}
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Save Configuration</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
