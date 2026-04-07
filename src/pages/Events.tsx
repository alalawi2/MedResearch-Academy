import Layout from '../components/Layout';

const ZOOM_LINK = "https://us02web.zoom.us/j/86479840360?pwd=cl9IYzFAcAb1oIxbZoVbW8GzhxiPOS.1";

export default function Events() {
  return (
    <Layout>
      <section className="page-hero centered">
        <div className="container">
          <h1>Upcoming Events</h1>
          <p>Join our free virtual lectures, workshops, and research sessions — open to all healthcare professionals.</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{maxWidth:860}}>

          {/* ── FEATURED EVENT CARD ── */}
          <div className="event-featured-card">
            <div className="event-featured-top">
              <div className="event-live-badge">
                <span className="event-live-dot"></span>
                Upcoming — Tomorrow
              </div>
              <span className="event-series-badge">Virtual Research Series</span>
            </div>

            <div className="event-featured-body">
              <div className="event-featured-main">
                <div className="event-featured-label">Featured Lecture</div>
                <h2 className="event-featured-title">AI in Medical Education</h2>
                <p className="event-featured-desc">
                  From global evidence to local implementation — showcasing Bayan, an AI-powered board prep platform built for residents in Oman and the region.
                </p>

                {/* Speaker */}
                <div className="event-speaker-row">
                  <img
                    src="/images/dr-alawi.jpg"
                    alt="Dr. Abdullah Al Alawi"
                    className="event-speaker-photo"
                    onError={e => (e.currentTarget.style.display='none')}
                  />
                  <div>
                    <div className="event-speaker-name">Dr. Abdullah M. Al Alawi</div>
                    <div className="event-speaker-creds">BSc, MD, MSc, FRACP, FACP</div>
                    <div className="event-speaker-role">
                      Senior Consultant, Internal Medicine · Program Director, OMSB-IM Residency · Founder, MedResearch Academy
                    </div>
                  </div>
                </div>

                {/* Details grid */}
                <div className="event-details-grid">
                  <div className="event-detail">
                    <span className="event-detail-icon">📅</span>
                    <div>
                      <div className="event-detail-label">Date</div>
                      <div className="event-detail-val">Wednesday, Apr 8, 2026</div>
                    </div>
                  </div>
                  <div className="event-detail">
                    <span className="event-detail-icon">🕗</span>
                    <div>
                      <div className="event-detail-label">Time</div>
                      <div className="event-detail-val">8:00 PM — Muscat (GST)</div>
                    </div>
                  </div>
                  <div className="event-detail">
                    <span className="event-detail-icon">💻</span>
                    <div>
                      <div className="event-detail-label">Platform</div>
                      <div className="event-detail-val">Zoom</div>
                    </div>
                  </div>
                  <div className="event-detail">
                    <span className="event-detail-icon">⏱</span>
                    <div>
                      <div className="event-detail-label">Duration</div>
                      <div className="event-detail-val">60 Minutes</div>
                    </div>
                  </div>
                </div>

                {/* Join info */}
                <div className="event-join-box">
                  <div className="event-join-label">Zoom Meeting Details</div>
                  <div className="event-join-row">
                    <span className="event-join-item"><strong>Meeting ID:</strong> 864 7984 0360</span>
                    <span className="event-join-item"><strong>Passcode:</strong> 857478</span>
                  </div>
                  <a href={ZOOM_LINK} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg" style={{marginTop:16}}>
                    🎥 Join on Zoom →
                  </a>
                </div>
              </div>

              {/* QR code side */}
              <div className="event-featured-qr">
                <div className="event-qr-inner">
                  <div className="event-qr-label">Scan to Join</div>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(ZOOM_LINK)}&color=1a3a5c&bgcolor=ffffff`}
                    alt="QR Code to join Zoom"
                    style={{width:160,height:160,borderRadius:10,display:'block',margin:'0 auto'}}
                  />
                  <div className="event-qr-link">us02web.zoom.us/j/86479840360</div>
                  <div className="event-qr-free">Free · Open to All Healthcare Professionals</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </Layout>
  );
}
