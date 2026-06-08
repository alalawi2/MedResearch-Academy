import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';

/* ── Types ── */
interface Survey {
  id: string;
  title_en: string;
  title_ar: string;
  researcher_name: string;
  researcher_email: string;
  institution: string;
  status: string;
  language: string;
  estimated_minutes: number;
  response_count: number;
  created_at: string;
}

interface SurveyResponse {
  id: string;
  respondent_id: string;
  answers: Record<string, string | string[]>;
  language_used: string;
  completed: boolean;
  created_at: string;
}

interface Question {
  id: string;
  question_en: string;
  question_ar: string;
  type: string;
  section_id: string;
  order_num: number;
}

/* ── Helpers ── */
const SESSION_KEY = 'researcher_email';
const ORIGIN = typeof window !== 'undefined' ? window.location.origin : '';

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function statusColor(status: string) {
  switch (status) {
    case 'active': return { bg: 'rgba(22,163,74,0.1)', color: '#15803d' };
    case 'draft':  return { bg: 'rgba(200,151,42,0.12)', color: '#8a6515' };
    case 'closed': return { bg: 'rgba(100,116,139,0.1)', color: '#64748b' };
    default:       return { bg: 'var(--bg-muted)', color: 'var(--text-muted)' };
  }
}

/* ── Component ── */
export default function ResearcherPortal() {
  // Auth state
  const [step, setStep] = useState<'email' | 'code' | 'dashboard'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [researcherName, setResearcherName] = useState('');

  // Dashboard state
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<string | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responsePage, setResponsePage] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [showShareLink, setShowShareLink] = useState<string | null>(null);
  const [showQR, setShowQR] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const RESPONSES_PER_PAGE = 20;

  // Check session on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      setEmail(stored);
      setStep('dashboard');
    }
  }, []);

  // Load surveys when entering dashboard
  const loadSurveys = useCallback(async (researcherEmail: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('surveys')
      .select('id,title_en,title_ar,researcher_name,researcher_email,institution,status,language,estimated_minutes,response_count,created_at')
      .eq('researcher_email', researcherEmail)
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) {
      setSurveys(data);
      if (data.length > 0 && data[0].researcher_name) {
        setResearcherName(data[0].researcher_name);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (step === 'dashboard' && email) {
      loadSurveys(email);
    }
  }, [step, email, loadSurveys]);

  /* ── Auth handlers ── */
  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSending(true);

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) { setError('Please enter your email address.'); setSending(false); return; }

    // Check if email exists in surveys table
    const { data: surveyData, error: surveyErr } = await supabase
      .from('surveys')
      .select('id')
      .eq('researcher_email', trimmed)
      .limit(1);

    if (surveyErr || !surveyData || surveyData.length === 0) {
      setError('No surveys found for this email address. Only registered researchers can access the portal.');
      setSending(false);
      return;
    }

    // Generate and store code
    const newCode = generateCode();
    const { error: insertErr } = await supabase
      .from('researcher_access_codes')
      .insert({
        email: trimmed,
        code: newCode,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        used: false,
      });

    if (insertErr) {
      setError('Failed to generate access code. Please try again.');
      setSending(false);
      return;
    }

    setEmail(trimmed);
    setGeneratedCode(newCode);
    setStep('code');
    setSending(false);
  }

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSending(true);

    const trimmedCode = code.trim();
    if (trimmedCode.length !== 6) { setError('Please enter the 6-digit code.'); setSending(false); return; }

    // Verify code
    const { data: codeData, error: codeErr } = await supabase
      .from('researcher_access_codes')
      .select('id,expires_at,used')
      .eq('email', email)
      .eq('code', trimmedCode)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1);

    if (codeErr || !codeData || codeData.length === 0) {
      setError('Invalid code. Please check and try again.');
      setSending(false);
      return;
    }

    const record = codeData[0];
    if (new Date(record.expires_at) < new Date()) {
      setError('Code has expired. Please request a new one.');
      setSending(false);
      return;
    }

    // Mark code as used
    await supabase
      .from('researcher_access_codes')
      .update({ used: true })
      .eq('id', record.id);

    // Store session
    sessionStorage.setItem(SESSION_KEY, email);
    setStep('dashboard');
    setSending(false);
  }

  function handleLogout() {
    sessionStorage.removeItem(SESSION_KEY);
    setStep('email');
    setEmail('');
    setCode('');
    setGeneratedCode('');
    setSurveys([]);
    setSelectedSurvey(null);
    setResponses([]);
    setQuestions([]);
    setResearcherName('');
  }

  /* ── Response loading ── */
  async function loadResponses(surveyId: string) {
    if (selectedSurvey === surveyId) { setSelectedSurvey(null); return; }
    setSelectedSurvey(surveyId);
    setResponsePage(0);
    const [respResult, qResult] = await Promise.all([
      supabase.from('survey_responses').select('id,respondent_id,answers,language_used,completed,created_at').eq('survey_id', surveyId).eq('completed', true).order('created_at', { ascending: false }).limit(500),
      supabase.from('survey_questions').select('id,question_en,question_ar,type,section_id,order_num').eq('survey_id', surveyId).order('order_num', { ascending: true }).limit(200),
    ]);
    if (respResult.data) setResponses(respResult.data);
    if (qResult.data) setQuestions(qResult.data);
  }

  /* ── Export CSV ── */
  async function exportCSV(surveyId: string) {
    setExporting(true);
    const [respResult, qResult] = await Promise.all([
      supabase.from('survey_responses').select('*').eq('survey_id', surveyId).eq('completed', true).order('created_at', { ascending: true }).limit(5000),
      supabase.from('survey_questions').select('id,question_en,question_ar,type,order_num').eq('survey_id', surveyId).order('order_num', { ascending: true }).limit(200),
    ]);

    if (!respResult.data || !qResult.data) { setExporting(false); return; }

    const qs = qResult.data;
    const rs = respResult.data;

    const headers = ['Response #', 'Date', 'Language', ...qs.map((q, i) => `Q${i + 1}: ${q.question_en.slice(0, 60)}`)];
    const rows = rs.map((r, idx) => {
      const row = [
        String(idx + 1),
        new Date(r.created_at).toLocaleDateString(),
        r.language_used,
        ...qs.map(q => {
          const ans = r.answers[q.id];
          if (Array.isArray(ans)) return ans.join('; ');
          return ans || '';
        }),
      ];
      return row;
    });

    const csvContent = [headers, ...rows].map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const survey = surveys.find(s => s.id === surveyId);
    link.href = url;
    link.download = `survey_responses_${survey?.title_en?.slice(0, 30).replace(/\s+/g, '_') || surveyId.slice(0, 8)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }

  /* ── Export Excel ── */
  async function exportExcel(surveyId: string) {
    setExporting(true);
    const [respResult, qResult] = await Promise.all([
      supabase.from('survey_responses').select('*').eq('survey_id', surveyId).eq('completed', true).order('created_at', { ascending: true }).limit(5000),
      supabase.from('survey_questions').select('id,question_en,question_ar,type,order_num').eq('survey_id', surveyId).order('order_num', { ascending: true }).limit(200),
    ]);

    if (!respResult.data || !qResult.data) { setExporting(false); return; }

    try {
      const XLSX = await import('xlsx');
      const qs = qResult.data;
      const rs = respResult.data;

      const headers = ['Response #', 'Date', 'Language', ...qs.map((q, i) => `Q${i + 1}: ${q.question_en.slice(0, 60)}`)];
      const rows = rs.map((r, idx) => [
        idx + 1,
        new Date(r.created_at).toLocaleDateString(),
        r.language_used,
        ...qs.map(q => {
          const ans = r.answers[q.id];
          if (Array.isArray(ans)) return ans.join('; ');
          return ans || '';
        }),
      ]);

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Responses');

      // Add questions sheet
      const qHeaders = ['#', 'Question (EN)', 'Question (AR)', 'Type'];
      const qRows = qs.map((q, i) => [i + 1, q.question_en, q.question_ar || '', q.type]);
      const ws2 = XLSX.utils.aoa_to_sheet([qHeaders, ...qRows]);
      XLSX.utils.book_append_sheet(wb, ws2, 'Questions');

      const survey = surveys.find(s => s.id === surveyId);
      XLSX.writeFile(wb, `survey_${survey?.title_en?.slice(0, 30).replace(/\s+/g, '_') || surveyId.slice(0, 8)}.xlsx`);
    } catch {
      exportCSV(surveyId);
    }
    setExporting(false);
  }

  /* ── Share helpers ── */
  function getSurveyUrl(surveyId: string) {
    return `${ORIGIN}/survey/${surveyId}`;
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  /* ═══════════════════════════════════
     RENDER
  ═══════════════════════════════════ */

  // ── Login: Email Step ──
  if (step === 'email') {
    return (
      <Layout>
        <section style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #0f2847 100%)', color: 'white', padding: '80px 0', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', marginBottom: 16, fontFamily: 'var(--font-serif)' }}>Researcher Portal</h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', maxWidth: 520, margin: '0 auto', fontSize: '1.05rem' }}>Access your surveys, view responses, and export data.</p>
          </div>
        </section>

        <section className="section">
          <div className="container" style={{ maxWidth: 480, margin: '0 auto' }}>
            <div className="researcher-auth-card">
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{ width: 64, height: 64, background: 'rgba(26,58,92,0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontSize: '1.5rem', marginBottom: 8 }}>Sign In</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Enter the email address associated with your survey submissions.</p>
              </div>

              <form onSubmit={handleEmailSubmit}>
                <div className="form-group">
                  <label htmlFor="researcher-email" style={{ fontWeight: 600 }}>Email Address</label>
                  <input
                    id="researcher-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="researcher@institution.edu"
                    required
                    autoFocus
                  />
                </div>

                {error && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#b91c1c', fontSize: 13, fontWeight: 500 }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={sending}
                  style={{ width: '100%', justifyContent: 'center', fontSize: 15 }}
                >
                  {sending ? 'Verifying...' : 'Continue'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  // ── Login: Code Verification Step ──
  if (step === 'code') {
    return (
      <Layout>
        <section style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #0f2847 100%)', color: 'white', padding: '80px 0', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', marginBottom: 16, fontFamily: 'var(--font-serif)' }}>Researcher Portal</h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', maxWidth: 520, margin: '0 auto', fontSize: '1.05rem' }}>Enter the verification code to continue.</p>
          </div>
        </section>

        <section className="section">
          <div className="container" style={{ maxWidth: 480, margin: '0 auto' }}>
            <div className="researcher-auth-card">
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{ width: 64, height: 64, background: 'rgba(22,163,74,0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontSize: '1.5rem', marginBottom: 8 }}>Verify Your Identity</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                  A 6-digit code has been generated for <strong>{email}</strong>.
                </p>
              </div>

              {/* Fallback: show code on screen */}
              <div style={{ background: 'rgba(26,58,92,0.04)', border: '1px dashed var(--border)', borderRadius: 10, padding: '14px 20px', marginBottom: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>Your verification code (email sending coming soon)</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary)', letterSpacing: 8, fontFamily: 'monospace' }}>{generatedCode}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Expires in 15 minutes</div>
              </div>

              <form onSubmit={handleCodeSubmit}>
                <div className="form-group">
                  <label htmlFor="access-code" style={{ fontWeight: 600 }}>Verification Code</label>
                  <input
                    id="access-code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    required
                    autoFocus
                    style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8, fontWeight: 700, fontFamily: 'monospace' }}
                  />
                </div>

                {error && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#b91c1c', fontSize: 13, fontWeight: 500 }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={sending || code.length !== 6}
                  style={{ width: '100%', justifyContent: 'center', fontSize: 15 }}
                >
                  {sending ? 'Verifying...' : 'Verify & Access Portal'}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep('email'); setCode(''); setError(''); setGeneratedCode(''); }}
                  style={{ width: '100%', marginTop: 12, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
                >
                  Use a different email
                </button>
              </form>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  // ── Dashboard ──
  const pagedResponses = responses.slice(responsePage * RESPONSES_PER_PAGE, (responsePage + 1) * RESPONSES_PER_PAGE);
  const totalPages = Math.ceil(responses.length / RESPONSES_PER_PAGE);

  return (
    <Layout>
      {/* Header */}
      <section style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #0f2847 100%)', color: 'white', padding: '48px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', marginBottom: 6, fontFamily: 'var(--font-serif)' }}>
              Welcome{researcherName ? `, ${researcherName}` : ''}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14 }}>{email}</p>
          </div>
          <button onClick={handleLogout} className="btn btn-outline-white btn-sm" style={{ flexShrink: 0 }}>
            Logout
          </button>
        </div>
      </section>

      <section style={{ padding: '40px 0 80px' }}>
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading your surveys...</div>
          ) : surveys.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              <p style={{ fontSize: 16, marginBottom: 8 }}>No surveys found for your account.</p>
              <p style={{ fontSize: 13 }}>If you recently submitted a survey, it may still be under review.</p>
            </div>
          ) : (
            <>
              {/* Summary bar */}
              <div style={{ display: 'flex', gap: 20, marginBottom: 32, flexWrap: 'wrap' }}>
                {[
                  { label: 'Total Surveys', value: surveys.length, color: 'var(--primary)' },
                  { label: 'Active', value: surveys.filter(s => s.status === 'active').length, color: '#16a34a' },
                  { label: 'Total Responses', value: surveys.reduce((sum, s) => sum + (s.response_count || 0), 0), color: 'var(--accent)' },
                ].map(stat => (
                  <div key={stat.label} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 24px', minWidth: 140, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: stat.color, fontFamily: 'var(--font-serif)' }}>{stat.value}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Survey list */}
              <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontSize: '1.3rem', marginBottom: 20 }}>Your Surveys</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {surveys.map(s => {
                  const sc = statusColor(s.status);
                  const surveyUrl = getSurveyUrl(s.id);

                  return (
                    <div key={s.id} className="researcher-survey-card">
                      {/* Survey header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--primary)', marginBottom: 4, fontFamily: 'var(--font-serif)' }}>{s.title_en}</div>
                          {s.title_ar && <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 10, direction: 'rtl', fontFamily: 'var(--font-serif)' }}>{s.title_ar}</div>}
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 50, background: sc.bg, color: sc.color, fontWeight: 700, textTransform: 'capitalize' }}>{s.status}</span>
                            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 50, background: 'rgba(26,58,92,0.06)', color: 'var(--primary)', fontWeight: 600 }}>{s.language.toUpperCase()}</span>
                            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 50, background: 'rgba(22,163,74,0.08)', color: '#15803d', fontWeight: 700 }}>{s.response_count} responses</span>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Created {new Date(s.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
                          <button onClick={() => loadResponses(s.id)} className="researcher-btn researcher-btn-outline">
                            {selectedSurvey === s.id ? 'Hide Responses' : 'View Responses'}
                          </button>
                          <button onClick={() => exportCSV(s.id)} disabled={exporting} className="researcher-btn researcher-btn-outline">
                            {exporting ? 'Exporting...' : 'CSV'}
                          </button>
                          <button onClick={() => exportExcel(s.id)} disabled={exporting} className="researcher-btn researcher-btn-primary">
                            {exporting ? 'Exporting...' : 'Excel'}
                          </button>
                          <button onClick={() => { setShowShareLink(showShareLink === s.id ? null : s.id); setShowQR(null); }} className="researcher-btn researcher-btn-outline">
                            Share Link
                          </button>
                          <button onClick={() => { setShowQR(showQR === s.id ? null : s.id); setShowShareLink(null); }} className="researcher-btn researcher-btn-outline">
                            QR Code
                          </button>
                        </div>
                      </div>

                      {/* Share link panel */}
                      {showShareLink === s.id && (
                        <div style={{ marginTop: 16, padding: 16, background: 'var(--bg-muted)', borderRadius: 10, border: '1px solid var(--border)' }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginBottom: 10 }}>Public Survey Link</div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input
                              readOnly
                              value={surveyUrl}
                              style={{ flex: 1, fontSize: 13, padding: '8px 12px', background: 'white', fontFamily: 'monospace' }}
                              onFocus={e => e.target.select()}
                            />
                            <button onClick={() => copyToClipboard(surveyUrl)} className="researcher-btn researcher-btn-primary" style={{ whiteSpace: 'nowrap' }}>
                              {copied ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* QR code panel */}
                      {showQR === s.id && (
                        <div style={{ marginTop: 16, padding: 24, background: 'var(--bg-muted)', borderRadius: 10, border: '1px solid var(--border)', textAlign: 'center' }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginBottom: 14 }}>QR Code</div>
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(surveyUrl)}`}
                            alt="Survey QR Code"
                            width={200}
                            height={200}
                            style={{ borderRadius: 8, border: '1px solid var(--border)' }}
                          />
                          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>Scan to open survey</div>
                        </div>
                      )}

                      {/* Responses panel */}
                      {selectedSurvey === s.id && (
                        <div style={{ marginTop: 16, padding: 20, background: 'var(--bg-muted)', borderRadius: 10, border: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ margin: 0, fontSize: 15, color: 'var(--primary)', fontFamily: 'var(--font-serif)' }}>
                              Responses ({responses.length})
                            </h3>
                          </div>

                          {responses.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)', fontSize: 14 }}>
                              No responses yet. Share your survey link to start collecting data.
                            </div>
                          ) : (
                            <>
                              <div style={{ overflowX: 'auto', borderRadius: 8 }}>
                                <table className="researcher-table">
                                  <thead>
                                    <tr>
                                      <th>#</th>
                                      <th>Date</th>
                                      <th>Lang</th>
                                      {questions.slice(0, 8).map((_q, i) => (
                                        <th key={_q.id} title={_q.question_en}>Q{i + 1}</th>
                                      ))}
                                      {questions.length > 8 && <th>+{questions.length - 8} more</th>}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {pagedResponses.map((r, idx) => (
                                      <tr key={r.id}>
                                        <td style={{ fontWeight: 700 }}>{responsePage * RESPONSES_PER_PAGE + idx + 1}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                                        <td>{r.language_used?.toUpperCase()}</td>
                                        {questions.slice(0, 8).map(q => (
                                          <td key={q.id} style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {Array.isArray(r.answers[q.id]) ? (r.answers[q.id] as string[]).join(', ') : (r.answers[q.id] || '\u2014')}
                                          </td>
                                        ))}
                                        {questions.length > 8 && <td style={{ color: 'var(--text-muted)' }}>...</td>}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              {/* Pagination */}
                              {totalPages > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 16 }}>
                                  <button
                                    onClick={() => setResponsePage(p => Math.max(0, p - 1))}
                                    disabled={responsePage === 0}
                                    className="researcher-btn researcher-btn-outline btn-sm"
                                  >
                                    Previous
                                  </button>
                                  <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                                    Page {responsePage + 1} of {totalPages}
                                  </span>
                                  <button
                                    onClick={() => setResponsePage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={responsePage >= totalPages - 1}
                                    className="researcher-btn researcher-btn-outline btn-sm"
                                  >
                                    Next
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
