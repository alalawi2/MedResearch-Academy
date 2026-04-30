import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      padding: '48px 24px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 64, fontWeight: 700, color: 'var(--primary, #1e3a5f)', fontFamily: 'var(--font-serif, Georgia, serif)', lineHeight: 1 }}>
        404
      </div>
      <h1 style={{ fontSize: '1.4rem', color: 'var(--text, #1f2937)', margin: '16px 0 8px', fontFamily: 'var(--font-serif, Georgia, serif)' }}>
        Page not found
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-muted, #6b7280)', maxWidth: 400, lineHeight: 1.6, margin: '0 0 32px' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <Link
          to="/"
          style={{
            padding: '12px 24px',
            borderRadius: 10,
            background: 'var(--primary, #1e3a5f)',
            color: 'white',
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Go Home
        </Link>
        <Link
          to="/login"
          style={{
            padding: '12px 24px',
            borderRadius: 10,
            border: '2px solid var(--border, #e5e7eb)',
            background: 'white',
            color: 'var(--text, #1f2937)',
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Staff Login
        </Link>
      </div>
    </div>
  );
}
