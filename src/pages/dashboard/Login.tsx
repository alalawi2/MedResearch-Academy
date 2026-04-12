import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const { staff, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && staff) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setSubmitting(false);
    if (err) setError(err.message);
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
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{width:'100%',justifyContent:'center',padding:'14px',fontSize:15,opacity:submitting ? 0.6 : 1}}
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{textAlign:'center',marginTop:24,fontSize:13,color:'var(--text-muted)'}}>
          Not a team member?{' '}
          <Link to="/active-research" style={{color:'var(--primary)',fontWeight:600}}>← Back to research studies</Link>
        </div>
      </div>
    </div>
  );
}
