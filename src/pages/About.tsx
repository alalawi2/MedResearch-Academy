import Layout from '../components/Layout';

export default function About() {
  return (
    <Layout>
      <section className="page-hero" style={{background:'var(--bg-muted)',color:'var(--text)',borderBottom:'1px solid var(--border)'}}>
        <div className="container">
          <h1 style={{color:'var(--primary)'}}>About MedResearch Academy</h1>
          <p>Our mission is to serve the community by building a robust research ecosystem in Oman. As a non-profit initiative, we are dedicated to equipping healthcare professionals with the skills, mentorship, and open-access resources needed to conduct world-class research.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 style={{fontSize:'2rem',marginBottom:24,color:'var(--primary)'}}>Our Vision</h2>
          <p style={{color:'var(--text-muted)',marginBottom:16,lineHeight:1.8}}>At MedResearch Academy, we believe that research is not just an academic exercise but a vital tool for improving patient care and health outcomes. We envision a future where every healthcare professional in Oman is empowered to contribute to the global body of medical knowledge.</p>
          <p style={{color:'var(--text-muted)',marginBottom:16,lineHeight:1.8}}>Our academy provides a structured pathway for research development, offering comprehensive training programs in research methodology, biostatistics, scientific writing, and critical appraisal. We bridge the gap between theoretical knowledge and practical application.</p>
          <p style={{color:'var(--text-muted)',lineHeight:1.8}}>Through mentorship and collaboration, we aim to foster a culture of inquiry and innovation. Whether you are a medical student taking your first steps in research or a seasoned clinician looking to refine your skills, MedResearch Academy is your partner in academic excellence.</p>

          <div className="separator"></div>

          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:40}}>
            <span style={{fontSize:24}}>👥</span>
            <h2 style={{fontSize:'2rem'}}>Leadership Team</h2>
          </div>

          <div className="grid-2">
            {/* Dr. Al Alawi */}
            <div className="profile-card">
              <img src="/images/dr-alawi.jpg" alt="Dr. Abdullah M. Al Alawi" className="profile-img" />
              <div className="profile-name">Dr. Abdullah M. Al Alawi</div>
              <div className="profile-creds">BSc, MD, MSc, FRACP, FACP</div>
              <div className="profile-role">Founder & Lead Mentor</div>
              <div className="profile-detail"><span>🏥</span><span>Senior Consultant, General Medicine (SQUH)</span></div>
              <div className="profile-detail"><span>💼</span><span>Program Director, Internal Medicine Residency (OMSB)</span></div>
              <div className="profile-detail"><span>✏️</span><span>Associate Editor, SQUMJ</span></div>
              <p style={{fontSize:14,color:'var(--text-muted)',marginTop:16,lineHeight:1.7}}>Dr. Abdullah Al Alawi is a Senior Consultant Physician at Sultan Qaboos University Hospital. As <strong>Program Director of the Internal Medicine Residency Program</strong> at OMSB, he plays a pivotal role in shaping the next generation of physicians in Oman.</p>
              <p style={{fontSize:14,color:'var(--text-muted)',marginTop:10,lineHeight:1.7}}>With a fellowship from the <strong>Royal Australasian College of Physicians (FRACP)</strong> and a Master of Clinical Epidemiology with Distinction from the University of Newcastle, Australia, he brings deep expertise in research methodology and evidence-based medicine.</p>
              <p style={{fontSize:14,color:'var(--text-muted)',marginTop:10,lineHeight:1.7}}>A prolific researcher, Dr. Al Alawi has been honored with the <strong>National Research Award</strong> for two consecutive years (2023 & 2024) and the Best Researcher Award from SQUH.</p>
              <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:16}}>
                {['Research Methodology','Biostatistics','Scientific Writing','Clinical Epidemiology'].map(b => <span key={b} className="badge badge-primary">{b}</span>)}
              </div>
              <a href="https://pubmed.ncbi.nlm.nih.gov/?term=Al+Alawi+AM" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{width:'100%',marginTop:20,justifyContent:'center'}}>View Publications →</a>
            </div>

            {/* Dr. Al Rawahi */}
            <div className="profile-card">
              <img src="/mohamed-alrawahi.png" alt="Dr. Mohamed Al Rawahi" className="profile-img" />
              <div className="profile-name">Dr. Mohamed Al Rawahi</div>
              <div className="profile-creds">MD, MSc, FRCPC, ABIM</div>
              <div className="profile-role">Co-Founder & Senior Mentor</div>
              <div className="profile-detail"><span>🏥</span><span>Senior Consultant, Cardiac Electrophysiologist (SQUH & Royal Hospital)</span></div>
              <div className="profile-detail"><span>💼</span><span>Associate Program Director, Internal Medicine Residency (OMSB)</span></div>
              <div className="profile-detail"><span>🏆</span><span>First American Board Certified Cardiac Electrophysiologist in Oman</span></div>
              <p style={{fontSize:14,color:'var(--text-muted)',marginTop:16,lineHeight:1.7}}>A pioneer in cardiac electrophysiology in Oman, Dr. Al Rawahi is the <strong>first American Board-certified Cardiac Electrophysiologist</strong> in the country. He holds a <strong>Master of Experimental Medicine</strong> from McGill University, Canada, and is pursuing a <strong>PhD</strong> at Maastricht University, Netherlands.</p>
              <p style={{fontSize:14,color:'var(--text-muted)',marginTop:10,lineHeight:1.7}}>His research leadership includes the <strong>Eric N. Prystowsky Fellows Clinical Research Award</strong> (Heart Rhythm Society, Boston) and the <strong>Best Researcher Award</strong> from SQUH.</p>
              <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:16}}>
                {['Cardiac Electrophysiology','AI in Medicine','Clinical Trials'].map(b => <span key={b} className="badge badge-primary">{b}</span>)}
              </div>
              <a href="https://pubmed.ncbi.nlm.nih.gov/?term=Al-Rawahi+M&sort=date" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{width:'100%',marginTop:20,justifyContent:'center'}}>View Publications →</a>
            </div>
          </div>

          <div className="separator"></div>

          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:32}}>
            <span style={{fontSize:20}}>🎓</span>
            <h2 style={{fontSize:'1.8rem'}}>Our Combined Expertise</h2>
          </div>
          <div className="expertise-grid">
            {[
              ['Advanced Degrees','Masters in Clinical Epidemiology (Australia) and Experimental Medicine (Canada), combining rigorous statistical training with translational research skills.'],
              ['Global Certification','Fellowships from Royal Australasian College of Physicians (FRACP), Royal College of Physicians of Canada (FRCPC), and American Boards (ABIM).'],
              ['Research Impact','Over 100+ combined peer-reviewed publications, national research awards, and leadership in major clinical trials and registries in Oman.'],
            ].map(([title, desc]) => (
              <div key={title as string} className="expertise-card">
                <h3 style={{fontSize:'1.1rem',marginBottom:8}}>{title}</h3>
                <p style={{fontSize:14,color:'var(--text-muted)'}}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
