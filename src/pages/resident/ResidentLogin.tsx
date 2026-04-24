import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase, supabaseConfigured } from '../../lib/supabase';

type Mode = 'password' | 'magic' | 'magic-sent';

export default function ResidentLogin() {
  const { user, residentProfile, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<Mode>('magic');

  if (!loading && residentProfile) return <Navigate to="/resident/dashboard" replace />;

  const authenticatedButNoProfile = !loading && user && !residentProfile;

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!supabaseConfigured) { setError('System not configured.'); return; }
    setSubmitting(true);
    setError(null);
    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/resident/dashboard` },
      });
      if (err) setError(err.message);
      else setMode('magic-sent');
    } catch (err: any) {
      setError(err?.message || 'Network error.');
    }
    setSubmitting(false);
  }

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!supabaseConfigured) { setError('System not configured.'); return; }
    setSubmitting(true);
    setError(null);
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (err) setError(err.message);
    } catch (err: any) {
      setError(err?.message || 'Network error.');
    }
    setSubmitting(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setError(null);
  }

  function switchMode(m: Mode) {
    setMode(m);
    setError(null);
  }

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    border: '1px solid var(--border)', fontSize: 15,
    marginBottom: 16, outline: 'none', fontFamily: 'var(--font-sans)',
    transition: 'border 0.2s',
  };

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-muted)',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{maxWidth:420,width:'100%',background:'white',borderRadius:20,padding:'48px 36px',boxShadow:'0 12px 48px rgba(26,58,92,0.12)',border:'1px solid var(--border)'}}>
        <div style={{textAlign:'center',marginBottom:28}}>
          <img src="/images/logo_final_v2.png" alt="MedResearch Academy" style={{height:48,marginBottom:16}} />
          <h1 style={{fontSize:'1.5rem',fontFamily:'var(--font-serif)',color:'var(--primary)',marginBottom:8}}>Resident Portal</h1>
          <p style={{fontSize:13,color:'var(--text-muted)',lineHeight:1.6}}>
            Welcome, study participant. Sign in with the email you enrolled with.
          </p>
        </div>

        {authenticatedButNoProfile ? (
          <div>
            <div style={{background:'#fef3c7',border:'1px solid #fde68a',borderRadius:12,padding:'20px',textAlign:'center',marginBottom:16}}>
              <div style={{fontSize:28,marginBottom:8}}>🔒</div>
              <div style={{fontWeight:700,color:'#92400e',marginBottom:6}}>Not Enrolled</div>
              <div style={{fontSize:13,color:'#92400e',lineHeight:1.6}}>
                Signed in as <strong>{user?.email}</strong> but no participant record found. Please contact the research team if you believe this is an error.
              </div>
            </div>
            <button onClick={handleSignOut} className="btn btn-outline" style={{width:'100%',justifyContent:'center'}}>Sign Out</button>
          </div>

        ) : mode === 'magic-sent' ? (
          <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:12,padding:'20px',textAlign:'center'}}>
            <div style={{fontSize:28,marginBottom:8}}>📧</div>
            <div style={{fontWeight:700,color:'#166534',marginBottom:6}}>Check your email</div>
            <div style={{fontSize:13,color:'#166534',lineHeight:1.6}}>
              We sent a login link to <strong>{email}</strong>.<br />Click the link to access the resident portal.
            </div>
            <button onClick={() => switchMode('magic')} style={{marginTop:16,background:'none',border:'none',color:'var(--primary)',cursor:'pointer',fontSize:13,fontWeight:600}}>
              ← Back to login
            </button>
          </div>

        ) : mode === 'password' ? (
          <form onSubmit={handlePasswordLogin}>
            <label style={{display:'block',fontSize:12,fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:6}}>
              Email address
            </label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="your.email@hospital.om" style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            <label style={{display:'block',fontSize:12,fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:6}}>
              Password
            </label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            {error && <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:8,padding:'10px 14px',fontSize:13,color:'#991b1b',marginBottom:12}}>{error}</div>}
            <button type="submit" disabled={submitting} className="btn btn-primary"
              style={{width:'100%',justifyContent:'center',padding:'14px',fontSize:15,opacity:submitting?0.6:1}}>
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
            <button type="button" onClick={() => switchMode('magic')}
              style={{width:'100%',marginTop:10,background:'none',border:'none',color:'var(--primary)',cursor:'pointer',fontSize:13,fontWeight:600}}>
              ← Use magic link instead
            </button>
          </form>

        ) : (
          /* magic link mode (default) */
          <form onSubmit={handleMagicLink}>
            <label style={{display:'block',fontSize:12,fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:6}}>
              Email address
            </label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="your.email@hospital.om" style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            {error && <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:8,padding:'10px 14px',fontSize:13,color:'#991b1b',marginBottom:12}}>{error}</div>}
            <button type="submit" disabled={submitting} className="btn btn-primary"
              style={{width:'100%',justifyContent:'center',padding:'14px',fontSize:15,opacity:submitting?0.6:1}}>
              {submitting ? 'Sending...' : 'Send Login Link'}
            </button>
            <button type="button" onClick={() => switchMode('password')}
              style={{width:'100%',marginTop:10,background:'none',border:'none',color:'var(--primary)',cursor:'pointer',fontSize:13,fontWeight:600}}>
              Sign in with password instead
            </button>
          </form>
        )}

        <div style={{textAlign:'center',marginTop:24,fontSize:13,color:'var(--text-muted)'}}>
          Research team member?{' '}
          <Link to="/login" style={{color:'var(--primary)',fontWeight:600}}>Staff login →</Link>
        </div>
      </div>
    </div>
  );
}
