import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';

export default function ShiftStudyLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

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
            {error && (
              <div style={{
                background: '#fef2f2', color: '#b91c1c', padding: '10px 14px',
                borderRadius: 8, marginBottom: 18, fontSize: 14, fontFamily: 'var(--font-sans)',
              }}>
                {error}
              </div>
            )}

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
              <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 16, fontFamily: 'var(--font-sans)' }}>
                This study uses invitation-only enrollment. If you are a selected participant, use the credentials provided by the research team.
              </p>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
}
