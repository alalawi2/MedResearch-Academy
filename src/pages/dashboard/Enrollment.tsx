import { useAuth } from '../../context/AuthContext';

export default function Enrollment() {
  const { studyRoles } = useAuth();
  return (
    <div>
      <h1 style={{fontSize:'1.8rem',fontFamily:'var(--font-serif)',color:'var(--primary)',marginBottom:8}}>Enrollment</h1>
      <p style={{color:'var(--text-muted)',fontSize:14,marginBottom:32}}>Manage resident enrollment, consent tracking, WHOOP device assignment, and withdrawals for {studyRoles[0]?.study_slug}.</p>

      <div style={{background:'white',borderRadius:14,padding:'40px',border:'1px solid var(--border)',textAlign:'center'}}>
        <div style={{fontSize:40,marginBottom:12}}>🔗</div>
        <h3 style={{fontFamily:'var(--font-serif)',color:'var(--primary)',marginBottom:8}}>Enrollment Management</h3>
        <p style={{fontSize:14,color:'var(--text-muted)',maxWidth:480,margin:'0 auto',lineHeight:1.7}}>
          Enroll new residents, track consent status, assign WHOOP device serial numbers, and manage withdrawals. This module will also handle the WHOOP OAuth enrollment flow when API integration is activated.
        </p>
        <div style={{marginTop:20}}>
          <span style={{padding:'5px 12px',borderRadius:50,fontSize:11,background:'var(--bg-muted)',color:'var(--text-muted)',fontWeight:600}}>Coming soon</span>
        </div>
      </div>
    </div>
  );
}
