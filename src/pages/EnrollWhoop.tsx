import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';

export default function EnrollWhoop() {
  const [params] = useSearchParams();
  const success = params.get('success');
  const error = params.get('error');
  const detail = params.get('detail');
  const participantId = params.get('id');
  const enrollEmail = params.get('email');

  const [connecting, setConnecting] = useState(false);
  const [pwStep, setPwStep] = useState(false);
  const [email, setEmail] = useState(enrollEmail || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwDone, setPwDone] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setPwError('Email is required'); return; }
    if (password.length < 8) { setPwError('Password must be at least 8 characters'); return; }
    if (password !== confirm) { setPwError('Passwords do not match'); return; }
    setPwLoading(true);
    setPwError(null);
    try {
      const res = await fetch('/api/create-resident-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) { setPwError(data.error || 'Failed to create account'); setPwLoading(false); return; }
      // Sign in immediately
      const { error: signErr } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (signErr) { setPwError('Account created but sign-in failed: ' + signErr.message); setPwLoading(false); return; }
      setPwDone(true);
    } catch (err: any) {
      setPwError(err.message || 'Network error');
    }
    setPwLoading(false);
  }

  return (
    <Layout>
      <section style={{background:'linear-gradient(135deg,var(--primary) 0%,#0f2847 100%)',color:'white',padding:'80px 0',textAlign:'center',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,opacity:0.04,backgroundImage:'radial-gradient(circle,white 1px,transparent 1px)',backgroundSize:'40px 40px'}}></div>
        <div className="container" style={{position:'relative',zIndex:1}}>
          <h1 style={{fontSize:'clamp(1.8rem,4vw,2.8rem)',marginBottom:16,fontFamily:'var(--font-serif)'}}>OMSB Burnout Study</h1>
          <p style={{color:'rgba(255,255,255,0.75)',maxWidth:540,margin:'0 auto',fontSize:'1.05rem'}}>Connect your WHOOP band to participate in the study</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{maxWidth:600,textAlign:'center'}}>

          {success === 'enrolled' ? (
            <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:20,padding:'48px 36px'}}>
              <div style={{fontSize:56,marginBottom:16}}>{pwDone ? '🎉' : '✅'}</div>
              <h2 style={{fontFamily:'var(--font-serif)',color:'#166534',fontSize:'1.6rem',marginBottom:12}}>
                {pwDone ? 'All Set!' : "You're Enrolled!"}
              </h2>

              {pwDone ? (
                <>
                  <p style={{fontSize:15,color:'#166534',lineHeight:1.7,marginBottom:24}}>
                    Your account is ready. You can now access the resident portal anytime.
                  </p>
                  <a href="/resident/dashboard" style={{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:8,padding:'14px 28px',borderRadius:10,background:'#166534',color:'white',fontWeight:600,fontSize:15,textDecoration:'none',width:'100%',maxWidth:320,margin:'0 auto'}}>
                    Go to Dashboard →
                  </a>
                </>
              ) : pwStep ? (
                <>
                  <p style={{fontSize:14,color:'#166534',lineHeight:1.6,marginBottom:16}}>
                    Create a password to access your study portal. You'll use this email and password to log in.
                  </p>
                  <form onSubmit={handleCreateAccount} style={{textAlign:'left',maxWidth:360,margin:'0 auto'}}>
                    <label style={{display:'block',fontSize:12,fontWeight:600,color:'#15803d',marginBottom:4}}>Email</label>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your.email@hospital.om"
                      style={{width:'100%',padding:'12px 14px',borderRadius:10,border:'1px solid #bbf7d0',fontSize:14,marginBottom:12,outline:'none',background:'white'}} />
                    <label style={{display:'block',fontSize:12,fontWeight:600,color:'#15803d',marginBottom:4}}>Password</label>
                    <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters"
                      style={{width:'100%',padding:'12px 14px',borderRadius:10,border:'1px solid #bbf7d0',fontSize:14,marginBottom:12,outline:'none',background:'white'}} />
                    <label style={{display:'block',fontSize:12,fontWeight:600,color:'#15803d',marginBottom:4}}>Confirm Password</label>
                    <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password"
                      style={{width:'100%',padding:'12px 14px',borderRadius:10,border:'1px solid #bbf7d0',fontSize:14,marginBottom:12,outline:'none',background:'white'}} />
                    {pwError && <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:8,padding:'8px 12px',fontSize:13,color:'#991b1b',marginBottom:12}}>{pwError}</div>}
                    <button type="submit" disabled={pwLoading} style={{width:'100%',padding:'14px',borderRadius:10,border:'none',background:'#166534',color:'white',fontWeight:600,fontSize:15,cursor:pwLoading?'not-allowed':'pointer',opacity:pwLoading?0.6:1}}>
                      {pwLoading ? 'Creating...' : 'Create Account'}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <p style={{fontSize:15,color:'#166534',lineHeight:1.7,marginBottom:12}}>
                    Your WHOOP band is now connected to the study. Your study ID is:
                  </p>
                  <div style={{background:'white',borderRadius:12,padding:'16px 24px',display:'inline-block',fontSize:'1.8rem',fontFamily:'monospace',fontWeight:700,color:'var(--primary)',border:'1px solid #bbf7d0',marginBottom:16}}>
                    {participantId}
                  </div>
                  <p style={{fontSize:13,color:'#15803d',lineHeight:1.6,marginBottom:24}}>
                    Next step: create your portal account to complete questionnaires and weekly check-ins.
                  </p>
                  <button onClick={() => setPwStep(true)} style={{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:8,padding:'14px 28px',borderRadius:10,background:'#166534',color:'white',fontWeight:600,fontSize:15,border:'none',cursor:'pointer',width:'100%',maxWidth:320,margin:'0 auto'}}>
                    Create Portal Account →
                  </button>
                  <div style={{marginTop:12}}>
                    <a href="/resident/login" style={{fontSize:13,color:'#15803d',textDecoration:'underline'}}>Already have an account? Sign in</a>
                  </div>
                </>
              )}
            </div>

          ) : success === 'reconnected' ? (
            <div style={{background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:20,padding:'48px 36px'}}>
              <div style={{fontSize:56,marginBottom:16}}>🔄</div>
              <h2 style={{fontFamily:'var(--font-serif)',color:'#1e40af',fontSize:'1.6rem',marginBottom:12}}>Reconnected!</h2>
              <p style={{fontSize:15,color:'#1e40af',lineHeight:1.7,marginBottom:24}}>
                Your WHOOP connection has been refreshed. Study ID: <strong>{participantId}</strong>.
              </p>
              <a href="/resident/login" style={{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:8,padding:'14px 28px',borderRadius:10,background:'#1e40af',color:'white',fontWeight:600,fontSize:15,textDecoration:'none',width:'100%',maxWidth:320,margin:'0 auto'}}>
                Go to Portal →
              </a>
            </div>

          ) : error ? (
            <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:20,padding:'48px 36px'}}>
              <div style={{fontSize:56,marginBottom:16}}>❌</div>
              <h2 style={{fontFamily:'var(--font-serif)',color:'#991b1b',fontSize:'1.6rem',marginBottom:12}}>Something went wrong</h2>
              <p style={{fontSize:15,color:'#991b1b',lineHeight:1.7,marginBottom:12}}>
                {error === 'denied' && 'You declined the WHOOP authorization. You can try again anytime.'}
                {error === 'token_failed' && 'WHOOP token exchange failed. Please try again.'}
                {error === 'token_save_failed' && 'Failed to save your connection. Please try again.'}
                {error === 'insert_failed' && 'There was a database error. Please contact the research team.'}
                {error === 'study_not_found' && 'Study configuration error. Please contact the research team.'}
                {error === 'server_error' && 'A server error occurred. Please try again or contact the research team.'}
                {!['denied','token_failed','token_save_failed','insert_failed','study_not_found','server_error'].includes(error!) && `Error: ${error}`}
              </p>
              {detail && (
                <p style={{fontSize:12,color:'#991b1b',background:'#fee2e2',borderRadius:8,padding:'10px 14px',marginBottom:20,wordBreak:'break-all'}}>
                  Detail: {detail}
                </p>
              )}
              <a href="/api/whoop/authorize" className="btn btn-primary">Try Again</a>
            </div>

          ) : (
            <div style={{background:'white',borderRadius:20,border:'1px solid var(--border)',padding:'48px 36px',boxShadow:'0 4px 24px rgba(0,0,0,0.08)'}}>
              <div style={{fontSize:56,marginBottom:16}}>⌚</div>
              <h2 style={{fontFamily:'var(--font-serif)',color:'var(--primary)',fontSize:'1.6rem',marginBottom:12}}>Connect Your WHOOP</h2>
              <p style={{fontSize:15,color:'var(--text-muted)',lineHeight:1.7,marginBottom:8}}>
                By connecting your WHOOP band, you agree to share your biophysical data (heart rate, sleep, recovery, strain) with the OMSB Burnout Study research team.
              </p>
              <p style={{fontSize:13,color:'var(--text-muted)',lineHeight:1.6,marginBottom:24}}>
                Your data will be pseudonymized and used exclusively for approved research (MREC #3190). You can revoke access anytime from the WHOOP app.
              </p>

              <button
                onClick={() => {
                  if (connecting) return;
                  setConnecting(true);
                  window.location.href = '/api/whoop/authorize';
                }}
                disabled={connecting}
                className="btn btn-primary btn-lg"
                style={{
                  width:'100%',justifyContent:'center',maxWidth:320,margin:'0 auto',
                  opacity: connecting ? 0.6 : 1,
                  cursor: connecting ? 'not-allowed' : 'pointer',
                  border: 'none',
                }}
              >
                {connecting ? 'Connecting to WHOOP...' : 'Connect WHOOP →'}
              </button>
              {connecting && (
                <p style={{fontSize:13,color:'var(--primary)',textAlign:'center',marginTop:12,fontWeight:600}}>
                  Please wait — do not tap again. You will be redirected to WHOOP.
                </p>
              )}

              <div style={{marginTop:24,fontSize:12,color:'var(--text-muted)'}}>
                <a href="/privacy" style={{color:'var(--primary)'}}>Privacy Policy</a> · <a href="/active-research/resident-burnout" style={{color:'var(--primary)'}}>Study Details</a>
              </div>
            </div>
          )}

        </div>
      </section>
    </Layout>
  );
}
