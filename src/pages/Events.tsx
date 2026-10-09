import Layout from '../components/Layout';
import AcademyEvent from '../components/AcademyEvent';
import { eventStatus } from '../lib/public-content';
import { Link } from 'react-router-dom';

export default function Events() {
  const past = eventStatus() === 'Past event';
  return <Layout>
    <section className="page-hero centered"><div className="container"><h1>Events & recordings</h1><p>Research lectures and workshops, with dates shown in Oman time.</p></div></section>
    <section className="section"><div className="container" style={{maxWidth:900}}>
      <h2>{past ? 'Upcoming events' : 'Next lecture'}</h2>
      {past && <p className="public-notice">No future event is currently listed. <Link to="/contact?subject=Joining%20a%20program">Ask about the next session</Link> or <Link to="/lectures">browse lecture recordings</Link>.</p>}
      {past && <h2>Event archive</h2>}
      <AcademyEvent />
    </div></section>
  </Layout>;
}
