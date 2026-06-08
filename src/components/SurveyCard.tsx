import { Link } from 'react-router-dom';

export interface SurveyCardData {
  id: string;
  title_en: string;
  title_ar: string | null;
  description_en: string | null;
  description_ar: string | null;
  researcher_name: string;
  institution: string | null;
  language: 'en' | 'ar' | 'both';
  estimated_minutes: number | null;
  response_count: number;
  ethics_approved: boolean;
  ethics_reference: string | null;
}

const langLabel: Record<string, { label: string; bg: string; color: string }> = {
  en:   { label: 'English',          bg: 'rgba(59,130,246,0.12)',  color: '#1d4ed8' },
  ar:   { label: 'العربية',          bg: 'rgba(34,197,94,0.12)',   color: '#15803d' },
  both: { label: 'EN / AR',          bg: 'rgba(200,151,42,0.15)', color: '#8a6515' },
};

export default function SurveyCard({ survey }: { survey: SurveyCardData }) {
  const lang = langLabel[survey.language] || langLabel.both;

  return (
    <div
      style={{
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
      {/* Header strip */}
      <div style={{
        background: 'linear-gradient(90deg, var(--primary), var(--primary-light))',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>📋</span>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>Research Survey</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{
            background: lang.bg,
            color: 'white',
            padding: '3px 10px',
            borderRadius: 50,
            fontSize: 11,
            fontWeight: 600,
          }}>{lang.label}</span>
          {survey.ethics_approved && (
            <span style={{
              background: 'rgba(34,197,94,0.2)',
              color: 'white',
              padding: '3px 10px',
              borderRadius: 50,
              fontSize: 11,
              fontWeight: 600,
            }}>Ethics Approved</span>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '24px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.3rem',
          color: 'var(--primary)',
          marginBottom: 6,
          lineHeight: 1.3,
        }}>{survey.title_en}</h3>

        {survey.title_ar && (
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'var(--text-muted)', marginBottom: 8, direction: 'rtl', textAlign: 'right' }}>
            {survey.title_ar}
          </p>
        )}

        {survey.description_en && (
          <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            {survey.description_en.length > 150 ? survey.description_en.slice(0, 150) + '...' : survey.description_en}
          </p>
        )}

        {/* Meta grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 12,
          padding: 14,
          background: 'var(--bg-muted)',
          borderRadius: 10,
          marginBottom: 20,
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Researcher</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{survey.researcher_name}</div>
          </div>
          {survey.institution && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Institution</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{survey.institution}</div>
            </div>
          )}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Est. Time</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{survey.estimated_minutes || '~10'} min</div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Responses</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{survey.response_count}</div>
          </div>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <Link to={`/survey/${survey.id}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Take Survey →
          </Link>
        </div>
      </div>
    </div>
  );
}
