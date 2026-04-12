import { Link } from 'react-router-dom';

export interface StudyCardData {
  slug: string;                              // URL slug, e.g. 'resident-burnout'
  title: string;
  shortDescription: string;
  status: 'recruiting' | 'follow_up' | 'data_analysis' | 'published' | 'closed';
  ethicsIds: string[];                       // e.g. ['MREC #3190', 'SQU-EC297-2023']
  pi: string;
  coPi?: string;
  studyType: string;                         // e.g. 'Multi-center cohort', 'Mixed-methods'
  targetPopulation: string;
  icon?: string;                             // emoji
}

const statusStyles: Record<StudyCardData['status'], { label: string; bg: string; color: string; dot: string }> = {
  recruiting:    { label: 'Recruiting Now',   bg: 'rgba(34,197,94,0.15)',  color: '#16a34a', dot: '#22c55e' },
  follow_up:     { label: 'Follow-up Phase',  bg: 'rgba(200,151,42,0.15)', color: '#8a6515', dot: '#c8972a' },
  data_analysis: { label: 'Data Analysis',    bg: 'rgba(59,130,246,0.15)', color: '#1d4ed8', dot: '#3b82f6' },
  published:     { label: 'Published',        bg: 'rgba(124,58,237,0.15)', color: '#6d28d9', dot: '#7c3aed' },
  closed:        { label: 'Closed',           bg: 'rgba(100,116,139,0.15)',color: '#475569', dot: '#64748b' },
};

export default function StudyCard({ study }: { study: StudyCardData }) {
  const s = statusStyles[study.status];
  return (
    <div style={{
      background: 'white',
      borderRadius: 20,
      border: '1px solid var(--border)',
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.07)'; }}
    >
      <div style={{
        background: 'linear-gradient(90deg, var(--primary), var(--primary-light))',
        padding: '20px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {study.icon && <span style={{ fontSize: 22 }}>{study.icon}</span>}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: s.bg,
              color: 'white',
              padding: '3px 10px',
              borderRadius: 50,
              fontSize: 11,
              fontWeight: 600,
              marginBottom: 4,
            }}>
              <span style={{ width: 6, height: 6, background: s.dot, borderRadius: '50%' }} />
              {s.label}
            </div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>{study.studyType}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {study.ethicsIds.map(id => (
            <span key={id} style={{
              background: 'rgba(255,255,255,0.15)',
              color: 'white',
              padding: '3px 10px',
              borderRadius: 50,
              fontSize: 11,
            }}>{id}</span>
          ))}
        </div>
      </div>

      <div style={{ padding: '28px 32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.5rem',
          color: 'var(--primary)',
          marginBottom: 12,
          lineHeight: 1.3,
        }}>{study.title}</h2>

        <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
          {study.shortDescription}
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 16,
          padding: 16,
          background: 'var(--bg-muted)',
          borderRadius: 10,
          marginBottom: 20,
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Principal Investigator</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{study.pi}</div>
          </div>
          {study.coPi && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Co-PI</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{study.coPi}</div>
            </div>
          )}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Population</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{study.targetPopulation}</div>
          </div>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to={`/active-research/${study.slug}`} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', minWidth: 180 }}>
            View Study Details →
          </Link>
        </div>
      </div>
    </div>
  );
}
