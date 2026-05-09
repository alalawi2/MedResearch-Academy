import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function ResidentSetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setSubmitting(true);
    setError(null);

    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) setError(err.message);
      else {
        setSuccess(true);
        setTimeout(() => navigate('/resident/dashboard'), 2000);
      }
    } catch (err: any) {
      setError(err?.message || 'Network error.');
    }
    setSubmitting(false);
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    border: '1px solid var(--border)', fontSize: 15,
    marginBottom: 16, outline: 'none', fontFamily: 'var(--font-sans)',
  };

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', padding: '24px 0' }}>
      <h1 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-serif)', color: '#0f172a', marginBottom: 8 }}>
        Set Your Password
      </h1>
      <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 24 }}>
        Create a password so you can sign in directly next time. You can always use a magic link instead.
      </p>

      {success ? (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>&#9989;</div>
          <div style={{ fontWeight: 700, color: '#166534', marginBottom: 6 }}>Password set!</div>
          <div style={{ fontSize: 13, color: '#166534' }}>Redirecting to dashboard...</div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            New password
          </label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Min 8 characters" style={inputStyle} />
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            Confirm password
          </label>
          <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
            placeholder="Repeat password" style={inputStyle} />
          {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#991b1b', marginBottom: 12 }}>{error}</div>}
          <button type="submit" disabled={submitting} className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15, opacity: submitting ? 0.6 : 1 }}>
            {submitting ? 'Saving...' : 'Set Password'}
          </button>
        </form>
      )}
    </div>
  );
}
