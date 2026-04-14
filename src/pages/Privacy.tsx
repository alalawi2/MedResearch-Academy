import Layout from '../components/Layout';

export default function Privacy() {
  return (
    <Layout>
      <section className="page-hero" style={{background:'var(--bg-muted)',color:'var(--text)',borderBottom:'1px solid var(--border)'}}>
        <div className="container">
          <h1 style={{color:'var(--primary)'}}>Privacy Policy</h1>
          <p style={{color:'var(--text-muted)'}}>Last updated: April 2026</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{maxWidth:800}}>
          <div style={{lineHeight:1.85,color:'var(--text-muted)',fontSize:'1.02rem'}}>

            <h2 style={{color:'var(--primary)',fontSize:'1.4rem',marginBottom:12,marginTop:0}}>1. Who We Are</h2>
            <p style={{marginBottom:20}}>
              MedResearch Academy is a non-profit research and education initiative led by Dr. Abdullah M. Al Alawi and Dr. Mohamed Al Rawahi, based at Sultan Qaboos University Hospital (SQUH), Muscat, Oman. This privacy policy applies to all research studies and services hosted on <strong>medresearch-academy.om</strong>, including the WHOOP wearable data integration for the Resident Burnout Study (MREC #3190).
            </p>

            <h2 style={{color:'var(--primary)',fontSize:'1.4rem',marginBottom:12}}>2. What Data We Collect</h2>
            <p style={{marginBottom:8}}>When you connect your WHOOP account to our research platform, we access the following data through the WHOOP API:</p>
            <ul style={{paddingLeft:24,marginBottom:20}}>
              <li>Profile information (name, email)</li>
              <li>Body measurements (height, weight)</li>
              <li>Recovery metrics (heart rate variability, resting heart rate, SpO2, skin temperature)</li>
              <li>Sleep data (duration, stages, efficiency, respiratory rate)</li>
              <li>Strain and workout data (daily strain, heart rate zones, energy expenditure)</li>
              <li>Cycle data (physiological cycles)</li>
            </ul>
            <p style={{marginBottom:20}}>
              For research questionnaires (CBI, PHQ-9, GAD-7, ISI), we collect your self-reported responses. Demographic data (age, sex, PGY level, program, site) is collected at enrollment.
            </p>

            <h2 style={{color:'var(--primary)',fontSize:'1.4rem',marginBottom:12}}>3. How We Use Your Data</h2>
            <p style={{marginBottom:8}}>Your data is used exclusively for:</p>
            <ul style={{paddingLeft:24,marginBottom:20}}>
              <li>Conducting ethically approved research (MREC #3190, SQU-EC/297/2023; MoH/CSR/24/28632)</li>
              <li>Analyzing the association between burnout and biophysical parameters</li>
              <li>Generating de-identified, aggregate statistical findings for publication</li>
            </ul>
            <p style={{marginBottom:20}}>We do <strong>not</strong> use your data for commercial purposes, advertising, or any purpose outside the approved research protocol.</p>

            <h2 style={{color:'var(--primary)',fontSize:'1.4rem',marginBottom:12}}>4. Data Protection & Pseudonymization</h2>
            <ul style={{paddingLeft:24,marginBottom:20}}>
              <li>All participant data is <strong>pseudonymized</strong> using unique study IDs (e.g., RES-001). Your name and email are stored separately from your biophysical and questionnaire data.</li>
              <li>Data is stored in encrypted databases with row-level security policies. Only authorized research personnel can access data relevant to their role.</li>
              <li>WHOOP API tokens are encrypted at rest and used solely for data retrieval.</li>
              <li>No identifiable information is included in publications, presentations, or reports.</li>
            </ul>

            <h2 style={{color:'var(--primary)',fontSize:'1.4rem',marginBottom:12}}>5. Who Has Access</h2>
            <p style={{marginBottom:8}}>Access is strictly limited to the authorized research team:</p>
            <ul style={{paddingLeft:24,marginBottom:20}}>
              <li><strong>Principal Investigator and Co-PI:</strong> Full access for study oversight</li>
              <li><strong>Co-Investigators:</strong> Access to de-identified data for analysis</li>
              <li><strong>Research Assistants:</strong> Data entry access only</li>
              <li><strong>Statisticians:</strong> De-identified, read-only access for analysis</li>
            </ul>

            <h2 style={{color:'var(--primary)',fontSize:'1.4rem',marginBottom:12}}>6. Your Rights</h2>
            <ul style={{paddingLeft:24,marginBottom:20}}>
              <li><strong>Withdraw at any time:</strong> You may withdraw from the study without penalty. Your WHOOP connection can be revoked from the WHOOP app (Settings → Connected Apps) or by contacting us.</li>
              <li><strong>Request data deletion:</strong> Upon withdrawal, your identifiable data will be deleted. De-identified data already included in aggregate analyses may be retained.</li>
              <li><strong>Access your data:</strong> You may request a copy of the data we hold about you.</li>
            </ul>

            <h2 style={{color:'var(--primary)',fontSize:'1.4rem',marginBottom:12}}>7. Data Retention</h2>
            <p style={{marginBottom:20}}>
              Research data will be retained for a minimum of 5 years after study completion, in accordance with institutional and national research data governance policies. WHOOP API tokens are deleted upon participant withdrawal or study completion.
            </p>

            <h2 style={{color:'var(--primary)',fontSize:'1.4rem',marginBottom:12}}>8. Third-Party Services</h2>
            <ul style={{paddingLeft:24,marginBottom:20}}>
              <li><strong>WHOOP:</strong> We access data via the WHOOP Developer API under their terms of service. We do not share your data with WHOOP beyond the standard API authentication.</li>
              <li><strong>Supabase:</strong> Our database provider, hosted in the Mumbai region. Data is encrypted in transit and at rest.</li>
              <li><strong>Vercel:</strong> Our web hosting provider. No participant data is stored on Vercel servers.</li>
            </ul>

            <h2 style={{color:'var(--primary)',fontSize:'1.4rem',marginBottom:12}}>9. Ethical Oversight</h2>
            <p style={{marginBottom:20}}>
              This research is approved by the Medical Research Ethics Committee of Sultan Qaboos University (MREC #3190, Ref. SQU-EC/297/2023) and the Royal Hospital Scientific Research Committee (MoH/CSR/24/28632). The study is funded by the Ministry of Higher Education, Research, and Innovation (MoHERI), Sultanate of Oman.
            </p>

            <h2 style={{color:'var(--primary)',fontSize:'1.4rem',marginBottom:12}}>10. Contact Us</h2>
            <p style={{marginBottom:8}}>For questions about this privacy policy or your data:</p>
            <div style={{background:'var(--bg-muted)',borderRadius:12,padding:'20px',border:'1px solid var(--border)'}}>
              <p style={{marginBottom:4}}><strong>Dr. Abdullah M. Al Alawi</strong> (Co-PI)</p>
              <p style={{marginBottom:4}}>Email: <a href="mailto:alalawi2@squ.edu.om" style={{color:'var(--primary)'}}>alalawi2@squ.edu.om</a></p>
              <p style={{marginBottom:4}}><strong>Dr. Mohamed Al Rawahi</strong> (PI)</p>
              <p>Email: <a href="mailto:mrawahi@squ.edu.om" style={{color:'var(--primary)'}}>mrawahi@squ.edu.om</a></p>
            </div>

          </div>
        </div>
      </section>
    </Layout>
  );
}
