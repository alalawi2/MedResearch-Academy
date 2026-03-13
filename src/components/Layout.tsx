import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const active = (path: string) => location.pathname === path ? 'active' : '';

  return (
    <>
      <nav>
        <div className="nav-inner">
          <Link to="/" className="nav-logo">
            <img src="/images/logo_final_v2.png" alt="MedResearch Academy" style={{height:"52px",width:"auto",objectFit:"contain"}} />
          </Link>
          <div className="nav-links">
            <Link to="/" className={active('/')}>Home</Link>
            <Link to="/about" className={active('/about')}>About</Link>
            <Link to="/programs" className={active('/programs')}>Programs</Link>
            <Link to="/lectures" className={active('/lectures')}>Lectures</Link>
            <Link to="/resources" className={active('/resources')}>Resources</Link>
            <Link to="/wall-of-impact" className={active('/wall-of-impact')}>Wall of Impact</Link>
            <Link to="/active-research" className={active('/active-research')}>Active Research</Link>
            <Link to="/news" className={active('/news')}>News</Link>
            <Link to="/contact" className={`nav-cta ${active('/contact')}`}>Contact</Link>
          </div>
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        </div>
        <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
          {[['/', 'Home'], ['/about', 'About'], ['/programs', 'Programs'], ['/lectures', 'Lectures'],
            ['/resources', 'Resources'], ['/wall-of-impact', 'Wall of Impact'], ['/active-research', 'Active Research'],
            ['/news', 'News'], ['/contact', 'Contact']].map(([path, label]) => (
            <Link key={path} to={path} onClick={() => setMenuOpen(false)}>{label}</Link>
          ))}
        </div>
      </nav>
      <main>{children}</main>
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <img src="/images/logo_final_v2.png" alt="MedResearch Academy" className="footer-logo" style={{height:"70px",width:"auto",objectFit:"contain",marginBottom:"12px"}} />
              <p>A non-profit initiative dedicated to advancing medical research in Oman and beyond through open education, mentorship, and community service.</p>
            </div>
            <div>
              <h4>Quick Links</h4>
              <div className="footer-links">
                <Link to="/programs">Our Programs</Link>
                <Link to="/resources">Resources</Link>
                <Link to="/wall-of-impact">Wall of Impact</Link>
                <Link to="/news">News</Link>
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
    </>
  );
}
