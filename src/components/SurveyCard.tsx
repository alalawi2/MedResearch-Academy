import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatSurveyAnswer } from '../lib/survey-utils';

export interface SurveyCardData {
  id: string;
  title_en: string;
  title_ar: string | null;
  description_en: string | null;
  description_ar: string | null;
  researcher_name: string;
  researcher_email?: string;
  institution: string | null;
  language: 'en' | 'ar' | 'both';
  estimated_minutes: number | null;
  response_count: number;
  ethics_approved: boolean;
  ethics_reference: string | null;
}

interface Response {
  id: string;
  respondent_id: string;
  answers: Record<string, unknown>;
  language_used: string;
  completed: boolean;
  created_at: string;
}

interface Question {
  id: string;
  question_en: string;
  order_num: number;
  type?: string;
  options_en?: unknown[];
  options_ar?: unknown[];
}

const langLabel: Record<string, { label: string; bg: string; color: string }> = {
  en:   { label: 'English',  bg: 'rgba(59,130,246,0.12)',  color: '#1d4ed8' },
  ar:   { label: 'العربية',  bg: 'rgba(34,197,94,0.12)',   color: '#15803d' },
  both: { label: 'EN / AR',  bg: 'rgba(200,151,42,0.15)',  color: '#8a6515' },
};

export default function SurveyCard({ survey }: { survey: SurveyCardData }) {
  const lang = langLabel[survey.language] || langLabel.both;

  // Researcher login state
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'login' | 'dashboard' | 'reset'>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Dashboard state
  const [responses, setResponses] = useState<Response[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showResponses, setShowResponses] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Check if already logged in for this survey
  const sessionKey = `researcher_${survey.id}`;
  const isLoggedIn = sessionStorage.getItem(sessionKey) === 'true';

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    const { data } = await supabase
      .from('surveys')
      .select('researcher_email,researcher_password')
      .eq('id', survey.id)
      .single();

    if (!data || data.researcher_email !== email) {
      setError('Email does not match the survey owner.');
      setLoading(false);
      return;
    }
    if (data.researcher_password !== password) {
      setError('Incorrect password.');
      setLoading(false);
      return;
    }

    sessionStorage.setItem(sessionKey, 'true');
    setStep('dashboard');
    setLoading(false);
    loadDashboard();
  };

  const handleResetPassword = async () => {
    setError('');
    setLoading(true);
    const { data } = await supabase
      .from('surveys')
      .select('researcher_email')
      .eq('id', survey.id)
      .single();

    if (!data || data.researcher_email !== resetEmail) {
      setError('Email does not match the survey owner.');
      setLoading(false);
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      setError('Password must be at least 4 characters.');
      setLoading(false);
      return;
    }

    await supabase
      .from('surveys')
      .update({ researcher_password: newPassword })
      .eq('id', survey.id);

    setResetSuccess(true);
    setLoading(false);
    setTimeout(() => { setStep('login'); setResetSuccess(false); setResetEmail(''); setNewPassword(''); }, 2000);
  };

  const loadDashboard = async () => {
    const [respResult, qResult] = await Promise.all([
      supabase.from('survey_responses').select('*').eq('survey_id', survey.id).eq('completed', true).order('created_at', { ascending: false }).limit(500),
      supabase.from('survey_questions').select('id,question_en,type,order_num,options_en,options_ar').eq('survey_id', survey.id).order('order_num').limit(200),
    ]);
    if (respResult.data) setResponses(respResult.data);
    if (qResult.data) setQuestions(qResult.data);
  };

  const exportCSV = async () => {
    setExporting(true);
    const qs = questions;
    const rs = responses;
    const headers = ['#', 'Date', 'Language', ...qs.map((q, i) => `Q${i + 1}`)];
    const rows = rs.map((r, idx) => [
      idx + 1,
      new Date(r.created_at).toLocaleDateString(),
      r.language_used,
      ...qs.map(q => formatSurveyAnswer(q, r.answers, r.language_used === 'ar' ? 'ar' : 'en')),
    ]);
    const csv = [headers, ...rows].map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `survey_${survey.title_en.slice(0, 20).replace(/\s+/g, '_')}_responses.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  const exportExcel = async () => {
    setExporting(true);
    try {
      const XLSX = await import('xlsx');
      const qs = questions;
      const rs = responses;
      const headers = ['#', 'Date', 'Language', ...qs.map((q, i) => `Q${i + 1}: ${q.question_en.slice(0, 50)}`)];
      const rows = rs.map((r, idx) => [
        idx + 1,
        new Date(r.created_at).toLocaleDateString(),
        r.language_used,
        ...qs.map(q => formatSurveyAnswer(q, r.answers, r.language_used === 'ar' ? 'ar' : 'en')),
      ]);
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Responses');
      XLSX.writeFile(wb, `survey_${survey.title_en.slice(0, 20).replace(/\s+/g, '_')}.xlsx`);
    } catch { exportCSV(); }
    setExporting(false);
  };

  const surveyUrl = `${window.location.origin}/survey/${survey.id}`;

  const handleLogout = () => {
    sessionStorage.removeItem(sessionKey);
    setStep('login');
    setShowLogin(false);
    setEmail('');
    setPassword('');
    setResponses([]);
    setQuestions([]);
    setShowResponses(false);
  };

  const dashboardActive = step === 'dashboard' || isLoggedIn;

  return (
    <div style={{
      background: 'white', borderRadius: 20, border: '1px solid var(--border)',
      overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
      display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => { if (!showLogin && !dashboardActive) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)'; } }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.07)'; }}
    >
      {/* Header strip */}
      <div style={{
        background: 'linear-gradient(90deg, var(--primary), var(--primary-light))',
        padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>📋</span>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>Research Survey</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ background: lang.bg, color: 'white', padding: '3px 10px', borderRadius: 50, fontSize: 11, fontWeight: 600 }}>{lang.label}</span>
          {survey.ethics_approved && (
            <span style={{ background: 'rgba(34,197,94,0.2)', color: 'white', padding: '3px 10px', borderRadius: 50, fontSize: 11, fontWeight: 600 }}>Ethics Approved</span>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '24px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--primary)', marginBottom: 6, lineHeight: 1.3 }}>{survey.title_en}</h3>
        {survey.title_ar && (
          <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 8, direction: 'rtl', textAlign: 'right' }}>{survey.title_ar}</p>
        )}
        {survey.description_en && (
          <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            {survey.description_en.length > 150 ? survey.description_en.slice(0, 150) + '...' : survey.description_en}
          </p>
        )}

        {/* Meta grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, padding: 14, background: 'var(--bg-muted)', borderRadius: 10, marginBottom: 20 }}>
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

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 'auto', flexWrap: 'wrap' }}>
          <Link to={`/survey/${survey.id}`} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', minWidth: 140 }}>
            Take Survey →
          </Link>
          <button
            onClick={() => {
              if (isLoggedIn && !dashboardActive) {
                setStep('dashboard');
                setShowLogin(true);
                loadDashboard();
              } else {
                setShowLogin(!showLogin);
              }
            }}
            className="btn btn-outline"
            style={{ flex: 1, justifyContent: 'center', minWidth: 140, cursor: 'pointer', background: dashboardActive ? 'rgba(26,58,92,0.06)' : undefined }}
          >
            🔑 {dashboardActive ? 'Researcher Dashboard' : 'Researcher Login'}
          </button>
        </div>

        {/* ── Inline Researcher Login / Dashboard ── */}
        {(showLogin || dashboardActive) && (
          <div style={{ marginTop: 20, padding: 20, background: 'var(--bg-muted)', borderRadius: 14, border: '1px solid var(--border)' }}>

            {/* Login */}
            {step === 'login' && !isLoggedIn && (
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', marginBottom: 10 }}>🔑 Researcher Login</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="Email"
                    style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, outline: 'none' }}
                  />
                  <input
                    type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Password"
                    style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, outline: 'none' }}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  />
                  <button onClick={handleLogin} disabled={loading || !email || !password} className="btn btn-primary" style={{ cursor: 'pointer', justifyContent: 'center' }}>
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </div>
                {error && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 8 }}>{error}</p>}
                <button onClick={() => { setStep('reset'); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 12, marginTop: 10, textDecoration: 'underline', padding: 0 }}>
                  Forgot password?
                </button>
              </div>
            )}

            {/* Reset Password */}
            {step === 'reset' && !isLoggedIn && (
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', marginBottom: 10 }}>Reset Password</h4>
                {resetSuccess ? (
                  <div style={{ background: 'rgba(34,197,94,0.08)', padding: '14px', borderRadius: 8, color: '#15803d', fontSize: 13, border: '1px solid rgba(34,197,94,0.2)' }}>
                    Password reset successfully! Redirecting to login...
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <input
                        type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)}
                        placeholder="Your email"
                        style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, outline: 'none' }}
                      />
                      <input
                        type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                        placeholder="New password"
                        style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, outline: 'none' }}
                        onKeyDown={e => e.key === 'Enter' && handleResetPassword()}
                      />
                      <button onClick={handleResetPassword} disabled={loading || !resetEmail || !newPassword} className="btn btn-primary" style={{ cursor: 'pointer', justifyContent: 'center' }}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                      </button>
                    </div>
                    {error && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 8 }}>{error}</p>}
                    <button onClick={() => { setStep('login'); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, marginTop: 10, textDecoration: 'underline', padding: 0 }}>
                      Back to login
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Step 3: Dashboard */}
            {(step === 'dashboard' || isLoggedIn) && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', margin: 0 }}>📊 Researcher Dashboard</h4>
                  <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}>Logout</button>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                  <div style={{ background: 'white', padding: 14, borderRadius: 10, border: '1px solid var(--border)', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)' }}>{responses.length}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Responses</div>
                  </div>
                  <div style={{ background: 'white', padding: 14, borderRadius: 10, border: '1px solid var(--border)', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#1d4ed8' }}>{responses.filter(r => r.language_used === 'en').length}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>English</div>
                  </div>
                  <div style={{ background: 'white', padding: 14, borderRadius: 10, border: '1px solid var(--border)', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#15803d' }}>{responses.filter(r => r.language_used === 'ar').length}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Arabic</div>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  <button onClick={() => setShowResponses(!showResponses)} className="btn btn-outline btn-sm" style={{ cursor: 'pointer', fontSize: 12 }}>
                    {showResponses ? 'Hide Responses' : 'View Responses'}
                  </button>
                  <button onClick={exportCSV} disabled={exporting || responses.length === 0} className="btn btn-outline btn-sm" style={{ cursor: 'pointer', fontSize: 12 }}>
                    {exporting ? '...' : 'Export CSV'}
                  </button>
                  <button onClick={exportExcel} disabled={exporting || responses.length === 0} className="btn btn-primary btn-sm" style={{ cursor: 'pointer', fontSize: 12 }}>
                    {exporting ? '...' : 'Export Excel'}
                  </button>
                  <button onClick={() => setShowQR(!showQR)} className="btn btn-outline btn-sm" style={{ cursor: 'pointer', fontSize: 12 }}>
                    {showQR ? 'Hide QR' : 'QR Code'}
                  </button>
                  <Link to={`/researcher`} className="btn btn-outline btn-sm" style={{ fontSize: 12 }}>
                    Full Analytics →
                  </Link>
                </div>

                {/* Share link */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                  <input type="text" readOnly value={surveyUrl} style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)', background: 'white' }} />
                  <button onClick={() => { navigator.clipboard.writeText(surveyUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                    style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: copied ? '#16a34a' : 'white', color: copied ? 'white' : 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>
                    {copied ? '✓ Copied' : 'Copy Link'}
                  </button>
                </div>

                {/* QR Code */}
                {showQR && (
                  <div style={{ textAlign: 'center', padding: 16, background: 'white', borderRadius: 10, border: '1px solid var(--border)', marginBottom: 12 }}>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(surveyUrl)}`} alt="Survey QR Code" style={{ margin: '0 auto', borderRadius: 8 }} />
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Scan to open survey</p>
                  </div>
                )}

                {/* Response table */}
                {showResponses && (
                  <div style={{ overflowX: 'auto', marginTop: 8 }}>
                    {responses.length === 0 ? (
                      <p style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', fontSize: 13 }}>No responses yet.</p>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                        <thead>
                          <tr>
                            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '2px solid var(--border)', fontWeight: 700, color: 'var(--primary)', fontSize: 10 }}>#</th>
                            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '2px solid var(--border)', fontWeight: 700, color: 'var(--primary)', fontSize: 10 }}>Date</th>
                            <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '2px solid var(--border)', fontWeight: 700, color: 'var(--primary)', fontSize: 10 }}>Lang</th>
                            {questions.slice(0, 6).map((q, i) => (
                              <th key={q.id} style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '2px solid var(--border)', fontWeight: 600, fontSize: 10, color: 'var(--text-muted)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Q{i + 1}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {responses.slice(0, 10).map((r, idx) => (
                            <tr key={r.id} style={{ background: idx % 2 === 0 ? 'white' : 'var(--bg-muted)' }}>
                              <td style={{ padding: '5px 8px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>{idx + 1}</td>
                              <td style={{ padding: '5px 8px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                              <td style={{ padding: '5px 8px', borderBottom: '1px solid var(--border)' }}>{r.language_used?.toUpperCase()}</td>
                              {questions.slice(0, 6).map(q => (
                                <td key={q.id} style={{ padding: '5px 8px', borderBottom: '1px solid var(--border)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {formatSurveyAnswer(q, r.answers, r.language_used === 'ar' ? 'ar' : 'en') || '—'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    {responses.length > 10 && (
                      <p style={{ textAlign: 'center', padding: 8, fontSize: 11, color: 'var(--text-muted)' }}>Showing 10 of {responses.length}. Export for full data.</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
