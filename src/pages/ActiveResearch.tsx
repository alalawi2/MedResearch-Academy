import Layout from '../components/Layout';
import StudyCard, { StudyCardData } from '../components/StudyCard';

// Study portfolio — add new studies by appending to this array.
const STUDIES: StudyCardData[] = [
  {
    slug: 'resident-burnout',
    title: "The Association Between Healthcare Workers' Burnout and Biophysical Parameters",
    shortDescription: 'A multi-center prospective cohort using the Maslach Burnout Inventory and WHOOP wearable biosensors to quantify the relationship between burnout severity and objective biophysical markers (HRV, sleep, autonomic tone). Current phase: a resident-focused pilot at OMSB across three hospitals in Muscat.',
    status: 'recruiting',
    ethicsIds: ['MREC #3190', 'Royal Hospital EC'],
    pi: 'Dr. Mohamed Al Rawahi',
    coPi: 'Dr. Masoud Kashoub',
    studyType: 'Multi-center Prospective Cohort',
    targetPopulation: 'OMSB Residents (Oman)',
    icon: '⌚',
  },
  {
    slug: 'parenthood',
    title: 'Perspectives on Parenthood During Residency Training in Oman',
    shortDescription: 'A mixed-methods study exploring how residency training affects family planning decisions and the experiences of resident physicians who are also parents — with the goal of informing humane, family-supportive training policies.',
    status: 'recruiting',
    ethicsIds: ['MREC #3679', 'SQU-EC/228/2025'],
    pi: 'Dr. Abdullah M. Al Alawi',
    coPi: 'Dr. Fatma Al Mahruqi',
    studyType: 'Mixed-methods Study',
    targetPopulation: 'OMSB Residents (Oman)',
    icon: '👨‍👩‍👧',
  },
];

export default function ActiveResearch() {
  const recruitingCount = STUDIES.filter(s => s.status === 'recruiting').length;

  return (
    <Layout>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section style={{background:'linear-gradient(135deg,var(--primary) 0%,#0f2847 100%)',color:'white',padding:'80px 0',textAlign:'center',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,opacity:0.04,backgroundImage:'radial-gradient(circle,white 1px,transparent 1px)',backgroundSize:'40px 40px'}}></div>
        <div className="container" style={{position:'relative',zIndex:1}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(34,197,94,0.15)',border:'1px solid rgba(34,197,94,0.35)',borderRadius:50,padding:'6px 20px',fontSize:13,marginBottom:24}}>
            <span style={{width:8,height:8,background:'#22c55e',borderRadius:'50%',display:'inline-block',animation:'pulse 2s infinite'}}></span>
            {recruitingCount} {recruitingCount === 1 ? 'Study' : 'Studies'} Recruiting
          </div>
          <h1 style={{fontSize:'clamp(1.8rem,5vw,3rem)',marginBottom:16,fontFamily:'var(--font-serif)'}}>Active Research Studies</h1>
          <p style={{color:'rgba(255,255,255,0.75)',maxWidth:620,margin:'0 auto',fontSize:'1.05rem',lineHeight:1.7}}>
            Participate in research that shapes medical education policy and clinician well-being in Oman and the region. All studies are ethically approved and follow rigorous research standards.
          </p>
        </div>
      </section>

      {/* ── Study portfolio ───────────────────────────────────────────── */}
      <section className="section">
        <div className="container" style={{maxWidth:1200}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(380px,1fr))',gap:28,marginBottom:56}}>
            {STUDIES.map(study => <StudyCard key={study.slug} study={study} />)}
          </div>

          {/* ── Join future studies CTA ─────────────────────────────── */}
          <div style={{background:'var(--bg-muted)',borderRadius:16,padding:'40px',textAlign:'center',border:'1px solid var(--border)'}}>
            <div style={{fontSize:38,marginBottom:12}}>🔬</div>
            <h3 style={{fontSize:'1.35rem',color:'var(--primary)',marginBottom:10,fontFamily:'var(--font-serif)'}}>Interested in Joining Future Research?</h3>
            <p style={{color:'var(--text-muted)',maxWidth:520,margin:'0 auto 24px',fontSize:14,lineHeight:1.7}}>
              MedResearch Academy regularly conducts studies on medical education, clinical practice, physician well-being, and healthcare quality. Get in touch to be notified of future opportunities — or to propose a collaboration.
            </p>
            <div style={{display:'flex',justifyContent:'center',gap:10,flexWrap:'wrap'}}>
              <a href="/contact" className="btn btn-primary">Contact Us →</a>
              <a href="mailto:info@medresearch-academy.om" className="btn btn-outline">Propose a Collaboration</a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
