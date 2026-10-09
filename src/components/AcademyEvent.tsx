import { Link } from 'react-router-dom';
import { academyEvent, eventStatus } from '../lib/public-content';

export default function AcademyEvent() {
  const status = eventStatus();
  const past = status === 'Past event';
  return <article className="public-card">
    <p className="badge badge-primary">{status} · Virtual Research Series</p>
    <h2>{academyEvent.title}</h2>
    <p>{academyEvent.description}</p>
    <p><strong>{academyEvent.speaker}</strong></p>
    <p><time dateTime={academyEvent.start}>8 April 2026, 8:00–9:00 PM Oman time</time> · Online</p>
    {past ? <>
      <p>This event has ended. A recording for this session has not been linked here.</p>
      <Link className="btn btn-outline" to="/lectures">Browse available lecture recordings →</Link>
    </> : <a className="btn btn-primary" href={academyEvent.joinUrl} target="_blank" rel="noopener noreferrer">Join this lecture on Zoom ↗</a>}
  </article>;
}
