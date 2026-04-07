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
              <img src="/images/logo_transparent.png" alt="MedResearch Academy" className="footer-logo" style={{height:"70px",width:"auto",objectFit:"contain",marginBottom:"12px"}} />
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
    {/* WhatsApp Floating Button */}
      <a
        href="https://whatsapp.com/channel/0029Vb7YmBo2ER6mtOHgja13"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join our WhatsApp Channel"
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          zIndex: 9999,
          backgroundColor: '#25D366',
          borderRadius: '50%',
          width: '58px',
          height: '58px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          textDecoration: 'none',
          transition: 'transform 0.2s ease',
        }}
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </>
  );
}
