import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function SignIn() {
  return <Layout>
    <section className="page-hero centered"><div className="container"><h1>Choose your portal</h1><p>Use the portal for your study and role. Each portal has its own access requirements.</p></div></section>
    <section className="section"><div className="container public-grid">
      {[
        ['Burnout study participant', 'Complete assessments and check your WHOOP connection.', '/resident/login', 'Participant sign in'],
        ['Cognitive shifts participant', 'Access your scheduled cognitive study assessments.', '/active-research/cognitive-shifts/login', 'Cognitive study sign in'],
        ['Study team', 'For authorized investigators, coordinators and data-entry staff, including thalassemia teams.', '/login', 'Team sign in'],
        ['Survey researcher', 'Access your surveys using the verified-email researcher portal.', '/researcher', 'Researcher sign in'],
      ].map(([title, description, path, label]) => <article className="public-card" key={path}><h2>{title}</h2><p>{description}</p><Link to={path} className="btn btn-primary">{label} →</Link></article>)}
      <p>Not sure where to go? <Link to="/contact?subject=Study%20participation%20or%20technical%20support">Ask for study support</Link>. Do not create a second account to resolve an access problem.</p>
    </div></section>
  </Layout>;
}
