import { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase, supabaseConfigured } from '../../lib/supabase';

export default function Login() {
  const { user, staff, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // If already authenticated AND has staff record → go to dashboard
  if (!loading && staff) return <Navigate to="/dashboard" replace />;

  // If authenticated but no staff record → show "no access" message
  const authenticatedButNoStaff = !loading && user && !staff;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabaseConfigured) {
      setError('Dashboard is not configured yet. Contact the administrator.');
      return;
    }
    setSubmitting(true);
    setError(null);
    setInfo('Connecting...');

    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (err) {
        setError(err.message);
        setInfo(null);
        setSubmitting(false);
        return;
      }

      if (data.user) {
        setInfo('Authenticated! Loading your profile...');
        // Give AuthContext time to pick up the session and load staff profile
        setTimeout(() => {
          setSubmitting(false);
          setInfo(null);
        }, 3000);
      }
    } catch (err: any) {
      setError(err?.message || 'Network error — check your connection and try again.');
      setInfo(null);
      setSubmitting(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setError(null);
    setInfo(null);
  }

  return (
    <div style={{minHeight:'100vh',background:'var(--bg-muted)',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{maxWidth:420,width:'100%',background:'white',borderRadius:20,padding:'48px 36px',boxShadow:'0 12px 48px rgba(26,58,92,0.12)',border:'1px solid var(--border)'}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <img src="/images/logo_final_v2.png" alt="MedResearch Academy" style={{height:48,marginBottom:16}} />
          <h1 style={{fontSize:'1.5rem',fontFamily:'var(--font-serif)',color:'var(--primary)',marginBottom:8}}>Research Team Login</h1>
          <p style={{fontSize:13,color:'var(--text-muted)',lineHeight:1.6}}>
            Access is restricted to authorized research personnel only.
          </p>
        </div>

        {authenticatedButNoStaff ? (
          <div>
            <div style={{background:'#fef3c7',border:'1px solid #fde68a',borderRadius:12,padding:'20px',textAlign:'center',marginBottom:16}}>
              <div style={{fontSize:28,marginBottom:8}}>🔒</div>
              <div style={{fontWeight:700,color:'#92400e',marginBottom:6}}>Account Not Linked</div>
              <div style={{fontSize:13,color:'#92400e',lineHeight:1.6}}>
                You are signed in as <strong>{user?.email}</strong> but your account is not linked to a staff profile yet. Ask the administrator to run the staff linking SQL.
              </div>
            </div>
            <button onClick={handleSignOut} className="btn btn-outline" style={{width:'100%',justifyContent:'center'}}>
              Sign Out
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label style={{display:'block',fontSize:12,fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:6}}>
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@squ.edu.om"
              style={{
                width:'100%',padding:'12px 16px',borderRadius:10,border:'1px solid var(--border)',
                fontSize:15,marginBottom:16,outline:'none',fontFamily:'var(--font-sans)',transition:'border 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <label style={{display:'block',fontSize:12,fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:6}}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width:'100%',padding:'12px 16px',borderRadius:10,border:'1px solid var(--border)',
                fontSize:15,marginBottom:16,outline:'none',fontFamily:'var(--font-sans)',transition:'border 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            {error && (
              <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:8,padding:'10px 14px',fontSize:13,color:'#991b1b',marginBottom:12}}>
                {error}
              </div>
            )}
            {info && (
              <div style={{background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:8,padding:'10px 14px',fontSize:13,color:'#1e40af',marginBottom:12}}>
                {info}
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{width:'100%',justifyContent:'center',padding:'14px',fontSize:15,opacity:submitting ? 0.6 : 1}}
            >
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        <div style={{textAlign:'center',marginTop:24,fontSize:13,color:'var(--text-muted)'}}>
          Not a team member?{' '}
          <Link to="/active-research" style={{color:'var(--primary)',fontWeight:600}}>← Back to research studies</Link>
        </div>
      </div>
    </div>
  );
}
