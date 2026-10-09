import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function Home() {
  return <Layout>
    <div className="editorial-home container">
      <header className="editorial-intro">
        <p className="editorial-kicker">Medical education & research · Oman</p>
        <h1>Research belongs <br />in everyday medicine.</h1>
        <div className="editorial-intro-bottom">
          <p>We help medical students, residents and clinicians turn clinical questions into research—through teaching, mentorship and collaborative studies.</p>
          <Link to="/programs" className="editorial-link">Find a learning opportunity ↗</Link>
        </div>
      </header>
      <div className="editorial-lead">
        <figure>
          <img src="/images/dr_salim_presentation.jpg" width="1600" height="1066" alt="A speaker addressing an audience during a medical teaching session" fetchPriority="high" />
          <figcaption>From the academy archive <span>Teaching & discussion</span></figcaption>
        </figure>
        <aside className="editorial-notices" aria-label="Learning and participant access">
          <p className="editorial-kicker">At the academy</p>
          <article><h2>Start with a question.</h2><p>Research methods, study design and scientific writing. Explore the teaching programme or work through recorded sessions at your own pace.</p><Link className="editorial-link" to="/programs">Programmes ↗</Link><Link className="editorial-link" to="/lectures">Lecture recordings ↗</Link></article>
          <article><p className="editorial-kicker">Already participating?</p><h2>Your study, one place.</h2><p>Access assessments and study tools through your participant or research-team portal.</p><Link className="editorial-link" to="/sign-in">Participant & team sign in ↗</Link><Link className="editorial-small-link" to="/contact?subject=Study%20participation%20or%20technical%20support">Need help accessing a study?</Link></article>
        </aside>
      </div>
      <section className="editorial-section" aria-labelledby="research-title">
        <div className="editorial-section-heading"><div><p className="editorial-kicker">Our work</p><h2 id="research-title">Questions we are studying</h2></div><Link className="editorial-link" to="/active-research">All studies ↗</Link></div>
        <Link className="editorial-study" to="/active-research/resident-burnout"><span className="editorial-kicker">Resident wellbeing</span><div><h3>Burnout during residency</h3><p>Following residents over time to understand wellbeing, sleep and the experience of training.</p></div><span aria-hidden="true">↗</span></Link>
        <Link className="editorial-study" to="/active-research/thalassemia-cardiac"><span className="editorial-kicker">Clinical research</span><div><h3>Cardiac health in thalassemia</h3><p>Study information for participants and clinical teams working on thalassemia and cardiac complications.</p></div><span aria-hidden="true">↗</span></Link>
        <p className="editorial-footnote">Eligibility and participation arrangements are specific to each study. Please consult the study team.</p>
      </section>
      <div className="editorial-desk editorial-section">
        <section aria-labelledby="reading-title"><p className="editorial-kicker">From the research desk</p><h2 id="reading-title">A paper to read</h2><article className="editorial-citation"><p className="editorial-citation-meta">Medical education · 2026</p><h3><a href="https://pubmed.ncbi.nlm.nih.gov/41873391/" target="_blank" rel="noopener noreferrer">Mixed-Methods Evaluation of Programmatic Interventions on Academic Performance and Resident Perspectives in Internal Medicine Residency</a></h3><p>Al Alawi AM, Al Busaidi S, Kashoub M, et al.</p><p><cite>Advances in Medical Education and Practice.</cite> 2026;17:583981.</p><a className="editorial-link" href="https://pubmed.ncbi.nlm.nih.gov/41873391/" target="_blank" rel="noopener noreferrer">Read on PubMed ↗</a></article><Link className="editorial-small-link" to="/resources">Browse publications and research resources</Link></section>
        <section className="editorial-updates" aria-labelledby="updates-title"><p className="editorial-kicker">Noticeboard</p><h2 id="updates-title">Around the academy</h2><article><time dateTime="2026-03">March 2026</time><h3><a href="https://www.bayan.edu.om" target="_blank" rel="noopener noreferrer">Bayan: medical board exam preparation</a></h3><p>A learning resource for residents preparing for their board examinations.</p></article><article><time dateTime="2026-03">March 2026</time><h3><a href="https://www.youtube.com/watch?v=SnowxT9f9r4" target="_blank" rel="noopener noreferrer">A conversation on Oman TV</a></h3><p>Dr. Abdullah Al Alawi on the Nabt Jinan programme.</p></article><Link className="editorial-link" to="/news">News archive ↗</Link></section>
      </div>
      <section className="editorial-people editorial-section" aria-labelledby="people-title"><div><p className="editorial-kicker">The people behind the work</p><h2 id="people-title">Teaching. Mentoring.<br />Working alongside you.</h2><Link className="editorial-link" to="/about">About the academy ↗</Link></div><div>{[['/images/dr-alawi.jpg','Dr. Abdullah Al Alawi','Founder & Lead Mentor'],['/mohamed-alrawahi.png','Dr. Mohamed Al Rawahi','Co-Founder & Senior Mentor']].map(([image,name,role]) => <div className="editorial-person" key={name}><img src={image} alt={name} width="76" height="88" loading="lazy" /><div><h3>{name}</h3><p>{role}</p></div></div>)}</div></section>
      <section className="editorial-contact"><h2>Have a clinical question worth exploring?</h2><Link className="editorial-link" to="/contact?subject=Collaboration%20inquiry">Talk to us about it ↗</Link></section>
    </div>
  </Layout>;
}
