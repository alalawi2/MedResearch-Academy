import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';

type Tab = 'login' | 'register';

export default function ShiftStudyLogin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [gender, setGender] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [residencyYear, setResidencyYear] = useState('');
  const [shiftType, setShiftType] = useState('');
  const [trainingSite, setTrainingSite] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const r = await fetch('/api/shift-study-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email: loginEmail, password: loginPassword }),
      });
      const result = await r.json();
      if (!r.ok) { setError(result.error || 'Login failed'); setLoading(false); return; }
      sessionStorage.setItem('shift_study_participant', JSON.stringify(result.participant));
      navigate('/active-research/cognitive-shifts/dashboard');
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !regEmail || !regPassword || !gender || !specialty || !residencyYear || !shiftType || !trainingSite) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const r = await fetch('/api/shift-study-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          email: regEmail,
          password: regPassword,
          full_name: fullName.trim(),
          gender,
          specialty,
          residency_year: residencyYear,
          shift_type: shiftType,
          training_site: trainingSite,
        }),
      });
      const result = await r.json();
      if (!r.ok) { setError(result.error || 'Registration failed'); setLoading(false); return; }
      sessionStorage.setItem('shift_study_participant', JSON.stringify(result.participant));
      navigate('/active-research/cognitive-shifts/dashboard');
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const cardStyle: React.CSSProperties = {
    maxWidth: 480,
    margin: '0 auto',
    background: '#fff',
    borderRadius: 16,
    border: '1px solid var(--border)',
    padding: '28px 20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    boxSizing: 'border-box',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    fontSize: 15,
    fontFamily: 'var(--font-sans)',
    color: 'var(--text)',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: 6,
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--text)',
    fontFamily: 'var(--font-sans)',
  };

  const fieldGroup: React.CSSProperties = {
    marginBottom: 18,
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: 'auto' as const,
  };

  return (
    <Layout>
      <section className="section" style={{ minHeight: '70vh', padding: '40px 16px' }}>
        <div className="container" style={{ maxWidth: 520, padding: '0' }}>
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <Link
              to="/active-research/cognitive-shifts"
              style={{ color: 'var(--primary)', fontSize: 14, textDecoration: 'none', fontFamily: 'var(--font-sans)' }}
            >
              &larr; Back to Study Overview
            </Link>
          </div>

          <h1 style={{ textAlign: 'center', fontFamily: 'var(--font-serif)', color: 'var(--text)', fontSize: 28, marginBottom: 8 }}>
            Cognitive Effects of Shift Work
          </h1>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 15, marginBottom: 32, fontFamily: 'var(--font-sans)' }}>
            OMSB Resident Participant Portal
          </p>

          <div style={cardStyle}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: 28 }}>
              {(['login', 'register'] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(''); }}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    background: 'none',
                    border: 'none',
                    borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent',
                    marginBottom: -2,
                    cursor: 'pointer',
                    fontWeight: tab === t ? 700 : 500,
                    color: tab === t ? 'var(--primary)' : 'var(--text-muted)',
                    fontSize: 15,
                    fontFamily: 'var(--font-sans)',
                    transition: 'all 0.2s',
                  }}
                >
                  {t === 'login' ? 'Login' : 'Register'}
                </button>
              ))}
            </div>

            {error && (
              <div style={{
                background: '#fef2f2', color: '#b91c1c', padding: '10px 14px',
                borderRadius: 8, marginBottom: 18, fontSize: 14, fontFamily: 'var(--font-sans)',
              }}>
                {error}
              </div>
            )}

            {tab === 'login' ? (
              <form onSubmit={handleLogin}>
                <div style={fieldGroup}>
                  <label style={labelStyle}>Email</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    style={inputStyle}
                    placeholder="your.email@omsb.org"
                    required
                  />
                </div>
                <div style={fieldGroup}>
                  <label style={labelStyle}>Password</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    style={inputStyle}
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: 16, borderRadius: 10, marginTop: 8 }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister}>
                <div style={fieldGroup}>
                  <label style={labelStyle}>Full Name</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} style={inputStyle} placeholder="Dr. Ahmed Al-Said" required />
                </div>
                <div style={fieldGroup}>
                  <label style={labelStyle}>Email</label>
                  <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} style={inputStyle} placeholder="your.email@omsb.org" required />
                </div>
                <div style={fieldGroup}>
                  <label style={labelStyle}>Password</label>
                  <input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} style={inputStyle} placeholder="Choose a password" required minLength={6} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
                  <div style={fieldGroup}>
                    <label style={labelStyle}>Gender</label>
                    <select value={gender} onChange={e => setGender(e.target.value)} style={selectStyle} required>
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div style={fieldGroup}>
                    <label style={labelStyle}>Residency Year</label>
                    <select value={residencyYear} onChange={e => setResidencyYear(e.target.value)} style={selectStyle} required>
                      <option value="">Select...</option>
                      {['R1', 'R2', 'R3', 'R4', 'R5', 'R6'].map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={fieldGroup}>
                  <label style={labelStyle}>Specialty</label>
                  <select value={specialty} onChange={e => setSpecialty(e.target.value)} style={selectStyle} required>
                    <option value="">Select specialty...</option>
                    <option value="Internal Medicine">Internal Medicine</option>
                    <option value="Pediatrics">Pediatrics</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
                  <div style={fieldGroup}>
                    <label style={labelStyle}>Training Site</label>
                    <select value={trainingSite} onChange={e => setTrainingSite(e.target.value)} style={selectStyle} required>
                      <option value="">Select...</option>
                      <option value="Royal Hospital">Royal Hospital</option>
                      <option value="SQUH">SQUH</option>
                    </select>
                  </div>
                  <div style={fieldGroup}>
                    <label style={labelStyle}>Shift Type</label>
                    <select value={shiftType} onChange={e => setShiftType(e.target.value)} style={selectStyle} required>
                      <option value="">Select...</option>
                      <option value="24-hour on-call">24-hour on-call</option>
                      <option value="12-hour night shift">12-hour night shift</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: 16, borderRadius: 10, marginTop: 8 }}
                >
                  {loading ? 'Registering...' : 'Register & Continue'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
