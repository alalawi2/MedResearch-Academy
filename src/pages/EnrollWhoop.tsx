import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';

export default function EnrollWhoop() {
  const [params] = useSearchParams();
  const success = params.get('success');
  const error = params.get('error');
  const detail = params.get('detail');
  const participantId = params.get('id');

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
              <div style={{fontSize:56,marginBottom:16}}>✅</div>
              <h2 style={{fontFamily:'var(--font-serif)',color:'#166534',fontSize:'1.6rem',marginBottom:12}}>You're Enrolled!</h2>
              <p style={{fontSize:15,color:'#166534',lineHeight:1.7,marginBottom:16}}>
                Your WHOOP band is now connected to the study. Your study ID is:
              </p>
              <div style={{background:'white',borderRadius:12,padding:'16px 24px',display:'inline-block',fontSize:'1.8rem',fontFamily:'monospace',fontWeight:700,color:'var(--primary)',border:'1px solid #bbf7d0',marginBottom:20}}>
                {participantId}
              </div>
              <p style={{fontSize:13,color:'#15803d',lineHeight:1.6,marginBottom:24}}>
                Your biophysical data will be collected automatically. Next step: set up your study portal account to complete questionnaires and check-ins.
              </p>
              <a href="/resident/login" style={{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:8,padding:'14px 28px',borderRadius:10,background:'#166534',color:'white',fontWeight:600,fontSize:15,textDecoration:'none',width:'100%',maxWidth:320,margin:'0 auto'}}>
                Set Up Portal Account →
              </a>
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

              <a href="/api/whoop/authorize" className="btn btn-primary btn-lg" style={{width:'100%',justifyContent:'center',maxWidth:320,margin:'0 auto'}}>
                Connect WHOOP →
              </a>

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
