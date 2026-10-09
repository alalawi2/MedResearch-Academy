import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
    setMenuOpen(false);
    const heading = document.querySelector('main h1')?.textContent || 'Medical Research Training in Oman';
    document.title = `${heading} | MedResearch Academy`;
    const url = `https://www.medresearch-academy.om${location.pathname}`;
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', url);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', document.title);
  }, [location.pathname]);
  const active = (path: string) => location.pathname === path ? 'active' : '';

  return (
    <div className="academy-site">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <nav aria-label="Main navigation" onKeyDown={e => { if(e.key === 'Escape') { setMenuOpen(false); e.currentTarget.querySelector<HTMLButtonElement>('.hamburger')?.focus(); } }}>
        <div className="nav-inner">
          <Link to="/" className="nav-logo">
            <img src="/images/logo_final_v2.png" alt="MedResearch Academy" style={{height:"52px",width:"auto",objectFit:"contain"}} />
            <span className="nav-wordmark" aria-hidden="true">MedResearch<br/>Academy</span>
          </Link>
          <div className="nav-links">
            <Link to="/about" className={active('/about')}>About</Link>
            <Link to="/programs" className={active('/programs')}>Learn</Link>
            <Link to="/resources" className={active('/resources')}>Resources</Link>
            <Link to="/active-research" className={active('/active-research')}>Participate</Link>
            <Link to="/news" className={active('/news')}>News</Link>
            <Link to="/contact" className={active('/contact')}>Collaborate</Link>
            <Link to="/sign-in" className={`nav-cta ${active('/sign-in')}`}>Sign in</Link>
          </div>
          <button className="hamburger" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        </div>
        <div id="mobile-navigation" className={`mobile-menu ${menuOpen ? 'open' : ''}`} onKeyDown={e => { if(e.key === 'Escape') setMenuOpen(false); }}>
          {[['/', 'Home'], ['/about', 'About'], ['/programs', 'Programs'], ['/lectures', 'Lectures'],
            ['/resources', 'Resources'], ['/wall-of-impact', 'Wall of Impact'], ['/active-research', 'Active Research'],
            ['/surveys', 'Surveys'], ['/news', 'News'], ['/contact', 'Contact'], ['/sign-in', 'Sign in']].map(([path, label]) => (
            <Link key={path} to={path} onClick={() => setMenuOpen(false)}>{label}</Link>
          ))}
        </div>
      </nav>
      <main id="main-content" tabIndex={-1}>{children}
        {['resident-burnout','thalassemia-cardiac','cognitive-shifts','smartblock','parenthood','rafiq-reading'].some(slug => location.pathname === `/active-research/${slug}`) && <section className="section"><div className="container public-notice">
          <h2>Participation, privacy & support</h2>
          <p>Contact the named study team to confirm eligibility, recruitment availability, visit schedules and time commitment. Your study information sheet and consent process explain the procedures and withdrawal options.</p>
          <p>Research measurements are not a substitute for clinical care. Do not send identifiable patient information through the general contact form.</p>
          <Link to="/privacy">Privacy & research data</Link> · <Link to="/contact?subject=Study%20participation%20or%20technical%20support">Contact study support</Link> · <Link to="/sign-in">Choose your portal</Link>
        </div></section>}
      </main>
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <img src="/images/logo_transparent.png" alt="MedResearch Academy" className="footer-logo" style={{height:"70px",width:"auto",objectFit:"contain",marginBottom:"12px"}} />
              <p>A non-profit initiative dedicated to advancing medical research in Oman and beyond through open education, mentorship, and community service.</p>
            </div>
            <div>
              <h4>Quick Links</h4>
              <div className="footer-links">
                <Link to="/programs">Our Programs</Link>
                <Link to="/lectures">Lecture recordings</Link>
                <Link to="/events">Events</Link>
                <Link to="/surveys">Surveys</Link>
                <Link to="/resources">Resources</Link>
                <Link to="/wall-of-impact">Wall of Impact</Link>
                <Link to="/news">News</Link>
                <Link to="/researcher">Researcher Portal</Link>
                <Link to="/sign-in">Participant & team sign in</Link>
                <Link to="/privacy">Privacy & research data</Link>
                <Link to="/contact?subject=Study%20participation%20or%20technical%20support">Study support</Link>
              </div>
            </div>
            <div>
              <h4>Connect</h4>
              <div className="footer-links">
                <a href="https://www.linkedin.com/in/abdullah-al-alawi-4" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                <a href="https://x.com/Medresearch_om" target="_blank" rel="noopener noreferrer">X (Twitter)</a>
                <a href="https://www.researchgate.net/profile/Abdullah-Al-Alawi-4" target="_blank" rel="noopener noreferrer">ResearchGate</a>
                <a href="mailto:info@medresearch-academy.om">Email</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 MedResearch Academy. All rights reserved.</span>
            <div className="social-links">
              <a href="https://www.linkedin.com/in/abdullah-al-alawi-4" target="_blank" rel="noopener noreferrer" className="social-link">in</a>
              <a href="https://x.com/Medresearch_om" target="_blank" rel="noopener noreferrer" className="social-link">𝕏</a>
              <a href="https://whatsapp.com/channel/0029Vb7YmBo2ER6mtOHgja13" target="_blank" rel="noopener noreferrer" className="social-link">W</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
