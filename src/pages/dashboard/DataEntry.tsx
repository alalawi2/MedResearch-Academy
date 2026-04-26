import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function DataEntry() {
  const { studyRoles } = useAuth();
  return (
    <div>
      <h1 style={{fontSize:'1.8rem',fontFamily:'var(--font-serif)',color:'var(--primary)',marginBottom:8}}>Data Entry</h1>
      <p style={{color:'var(--text-muted)',fontSize:14,marginBottom:32}}>Enter and manage study data for {studyRoles[0]?.study_slug === 'resident-burnout' ? 'the Burnout Study' : studyRoles[0]?.study_slug}.</p>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:20}}>
        <Link to="/dashboard/import" style={{background:'white',borderRadius:14,padding:'28px',border:'1px solid var(--border)',textDecoration:'none',color:'inherit',display:'block'}}>
          <div style={{fontSize:32,marginBottom:12}}>📥</div>
          <h3 style={{fontFamily:'var(--font-serif)',color:'var(--primary)',marginBottom:8}}>Excel / CSV Import</h3>
          <p style={{fontSize:13,color:'var(--text-muted)',lineHeight:1.6,marginBottom:16}}>Bulk import questionnaire responses (CBI, PHQ-9, GAD-7, WHO-5) from Excel or CSV files with auto-scoring.</p>
          <span style={{padding:'8px 16px',borderRadius:50,fontSize:13,background:'var(--primary)',color:'white',fontWeight:600}}>Import Data →</span>
        </Link>

        <Link to="/dashboard/review" style={{background:'white',borderRadius:14,padding:'28px',border:'1px solid var(--border)',textDecoration:'none',color:'inherit',display:'block'}}>
          <div style={{fontSize:32,marginBottom:12}}>🔍</div>
          <h3 style={{fontFamily:'var(--font-serif)',color:'var(--primary)',marginBottom:8}}>Review Queue</h3>
          <p style={{fontSize:13,color:'var(--text-muted)',lineHeight:1.6,marginBottom:16}}>Review and verify submitted block assessments (CBI, WHO-5, PHQ-9, GAD-7). Flag concerning responses and add reviewer notes.</p>
          <span style={{padding:'8px 16px',borderRadius:50,fontSize:13,background:'var(--primary)',color:'white',fontWeight:600}}>Review →</span>
        </Link>

        <Link to="/dashboard/send-links" style={{background:'white',borderRadius:14,padding:'28px',border:'1px solid var(--border)',textDecoration:'none',color:'inherit',display:'block'}}>
          <div style={{fontSize:32,marginBottom:12}}>📧</div>
          <h3 style={{fontFamily:'var(--font-serif)',color:'var(--primary)',marginBottom:8}}>Send Questionnaire Links</h3>
          <p style={{fontSize:13,color:'var(--text-muted)',lineHeight:1.6,marginBottom:16}}>Share enrollment and assessment links with residents via WhatsApp or copy link. View completion status per participant.</p>
          <span style={{padding:'8px 16px',borderRadius:50,fontSize:13,background:'var(--primary)',color:'white',fontWeight:600}}>Send Links →</span>
        </Link>

        <Link to="/dashboard/exports" style={{background:'white',borderRadius:14,padding:'28px',border:'1px solid var(--border)',textDecoration:'none',color:'inherit',display:'block'}}>
          <div style={{fontSize:32,marginBottom:12}}>📦</div>
          <h3 style={{fontFamily:'var(--font-serif)',color:'var(--primary)',marginBottom:8}}>Export Data</h3>
          <p style={{fontSize:13,color:'var(--text-muted)',lineHeight:1.6,marginBottom:16}}>Download study data as CSV — participants, block assessments, weekly check-ins, event logs, and WHOOP biometrics.</p>
          <span style={{padding:'8px 16px',borderRadius:50,fontSize:13,background:'var(--primary)',color:'white',fontWeight:600}}>Export →</span>
        </Link>
      </div>
    </div>
  );
}
