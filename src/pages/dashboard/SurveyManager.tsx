import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { formatSurveyAnswer } from '../../lib/survey-utils';

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
  ethics_approved: boolean;
  created_at: string;
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
  question_ar: string;
  type: string;
  section_id: string;
  order_num: number;
  options_en?: unknown[];
  options_ar?: unknown[];
}

export default function SurveyManager() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [tab, setTab] = useState<'draft' | 'active' | 'closed'>('draft');
  const [loading, setLoading] = useState(true);
  const [selectedSurvey, setSelectedSurvey] = useState<string | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadSurveys();
  }, [tab]);

  async function loadSurveys() {
    setLoading(true);
    const { data } = await supabase
      .from('surveys')
      .select('*')
      .eq('status', tab)
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setSurveys(data);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('surveys').update({ status }).eq('id', id);
    loadSurveys();
  }

  async function loadResponses(surveyId: string) {
    setSelectedSurvey(surveyId);
    const [respResult, qResult] = await Promise.all([
      supabase.from('survey_responses').select('*').eq('survey_id', surveyId).eq('completed', true).order('created_at', { ascending: false }).limit(500),
      supabase.from('survey_questions').select('id,question_en,question_ar,type,section_id,order_num,options_en,options_ar').eq('survey_id', surveyId).order('order_num', { ascending: true }).limit(200),
    ]);
    if (respResult.data) setResponses(respResult.data);
    if (qResult.data) setQuestions(qResult.data);
  }

  async function exportCSV(surveyId: string) {
    setExporting(true);
    const [respResult, qResult] = await Promise.all([
      supabase.from('survey_responses').select('*').eq('survey_id', surveyId).eq('completed', true).order('created_at', { ascending: true }).limit(5000),
      supabase.from('survey_questions').select('id,question_en,question_ar,type,order_num,options_en,options_ar').eq('survey_id', surveyId).order('order_num', { ascending: true }).limit(200),
    ]);

    if (!respResult.data || !qResult.data) { setExporting(false); return; }

    const qs = qResult.data;
    const rs = respResult.data;

    // Build CSV header
    const headers = ['Response ID', 'Date', 'Language', ...qs.map((q, i) => `Q${i + 1}: ${q.question_en.slice(0, 60)}`)];
    const rows = rs.map(r => {
      const row = [
        r.respondent_id.slice(0, 8),
        new Date(r.created_at).toLocaleDateString(),
        r.language_used,
        ...qs.map(q => formatSurveyAnswer(q, r.answers, r.language_used === 'ar' ? 'ar' : 'en')),
      ];
      return row;
    });

    // Generate CSV
    const csvContent = [headers, ...rows].map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    // Download
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

  async function exportExcel(surveyId: string) {
    setExporting(true);
    const [respResult, qResult] = await Promise.all([
      supabase.from('survey_responses').select('*').eq('survey_id', surveyId).eq('completed', true).order('created_at', { ascending: true }).limit(5000),
      supabase.from('survey_questions').select('id,question_en,question_ar,type,order_num,options_en,options_ar').eq('survey_id', surveyId).order('order_num', { ascending: true }).limit(200),
    ]);

    if (!respResult.data || !qResult.data) { setExporting(false); return; }

    try {
      const XLSX = await import('xlsx');
      const qs = qResult.data;
      const rs = respResult.data;

      const headers = ['Response ID', 'Date', 'Language', ...qs.map((q, i) => `Q${i + 1}: ${q.question_en.slice(0, 60)}`)];
      const rows = rs.map(r => [
        r.respondent_id.slice(0, 8),
        new Date(r.created_at).toLocaleDateString(),
        r.language_used,
        ...qs.map(q => formatSurveyAnswer(q, r.answers, r.language_used === 'ar' ? 'ar' : 'en')),
      ]);

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Responses');

      // Add questions sheet
      const qHeaders = ['#', 'Question (EN)', 'Question (AR)', 'Type', 'Required'];
      const qRows = qs.map((q, i) => [i + 1, q.question_en, q.question_ar || '', q.type, 'Yes']);
      const ws2 = XLSX.utils.aoa_to_sheet([qHeaders, ...qRows]);
      XLSX.utils.book_append_sheet(wb, ws2, 'Questions');

      const survey = surveys.find(s => s.id === surveyId);
      XLSX.writeFile(wb, `survey_${survey?.title_en?.slice(0, 30).replace(/\s+/g, '_') || surveyId.slice(0, 8)}.xlsx`);
    } catch {
      // Fallback to CSV if xlsx not available
      exportCSV(surveyId);
    }
    setExporting(false);
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.6rem', margin: 0 }}>Survey Manager</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {(['draft', 'active', 'closed'] as const).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setSelectedSurvey(null); }}
            style={{
              padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border)',
              background: tab === t ? 'var(--primary)' : 'white',
              color: tab === t ? 'white' : 'var(--text)',
              cursor: 'pointer', fontWeight: 600, fontSize: 14, textTransform: 'capitalize',
            }}
          >
            {t === 'draft' ? 'Pending Review' : t === 'active' ? 'Active' : 'Closed'} ({surveys.length})
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading surveys...</div>
      ) : surveys.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No surveys in this category.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {surveys.map(s => (
            <div key={s.id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{s.title_en}</div>
                  {s.title_ar && <div style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-muted)', fontSize: 14, marginBottom: 8, direction: 'rtl' }}>{s.title_ar}</div>}
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {s.researcher_name} &middot; {s.institution || 'No institution'} &middot; {s.researcher_email}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 50, background: 'rgba(26,58,92,0.08)', color: 'var(--primary)', fontWeight: 600 }}>{s.language.toUpperCase()}</span>
                    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 50, background: 'rgba(22,163,74,0.08)', color: '#15803d', fontWeight: 600 }}>{s.response_count} responses</span>
                    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 50, background: 'var(--bg-muted)', color: 'var(--text-muted)' }}>{s.estimated_minutes} min</span>
                    {s.ethics_approved && <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 50, background: 'rgba(200,151,42,0.1)', color: '#8a6515', fontWeight: 600 }}>Ethics Approved</span>}
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Created: {new Date(s.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                  {tab === 'draft' && (
                    <>
                      <button onClick={() => updateStatus(s.id, 'active')} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: '#16a34a', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Approve</button>
                      <button onClick={() => updateStatus(s.id, 'closed')} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #fecaca', background: '#fef2f2', color: '#b91c1c', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Reject</button>
                    </>
                  )}
                  {tab === 'active' && (
                    <button onClick={() => updateStatus(s.id, 'closed')} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border)', background: 'white', color: 'var(--text)', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Close</button>
                  )}
                  {tab === 'closed' && (
                    <button onClick={() => updateStatus(s.id, 'active')} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border)', background: 'white', color: 'var(--text)', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Reopen</button>
                  )}
                  <button onClick={() => loadResponses(s.id)} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border)', background: 'white', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>View Responses</button>
                  <button onClick={() => window.open(`/survey/${s.id}`, '_blank')} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border)', background: 'white', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Preview</button>
                </div>
              </div>

              {/* Responses panel */}
              {selectedSurvey === s.id && (
                <div style={{ marginTop: 16, padding: 16, background: 'var(--bg-muted)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h3 style={{ margin: 0, fontSize: 14 }}>Responses ({responses.length})</h3>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => exportCSV(s.id)}
                        disabled={exporting || responses.length === 0}
                        style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'white', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}
                      >
                        {exporting ? 'Exporting...' : 'Export CSV'}
                      </button>
                      <button
                        onClick={() => exportExcel(s.id)}
                        disabled={exporting || responses.length === 0}
                        style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid var(--primary)', background: 'var(--primary)', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}
                      >
                        {exporting ? 'Exporting...' : 'Export Excel'}
                      </button>
                    </div>
                  </div>

                  {responses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', fontSize: 13 }}>No responses yet.</div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead>
                          <tr>
                            <th style={{ padding: '8px 10px', textAlign: 'left', borderBottom: '2px solid var(--border)', fontWeight: 700, color: 'var(--primary)', fontSize: 11, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>#</th>
                            <th style={{ padding: '8px 10px', textAlign: 'left', borderBottom: '2px solid var(--border)', fontWeight: 700, color: 'var(--primary)', fontSize: 11, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Date</th>
                            <th style={{ padding: '8px 10px', textAlign: 'left', borderBottom: '2px solid var(--border)', fontWeight: 700, color: 'var(--primary)', fontSize: 11, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Lang</th>
                            {questions.slice(0, 8).map((q, i) => (
                              <th key={q.id} style={{ padding: '8px 10px', textAlign: 'left', borderBottom: '2px solid var(--border)', fontWeight: 600, fontSize: 11, color: 'var(--text-muted)', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                Q{i + 1}
                              </th>
                            ))}
                            {questions.length > 8 && <th style={{ padding: '8px 10px', borderBottom: '2px solid var(--border)', fontSize: 11, color: 'var(--text-muted)' }}>+{questions.length - 8} more</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {responses.slice(0, 20).map((r, idx) => (
                            <tr key={r.id} style={{ background: idx % 2 === 0 ? 'white' : 'var(--bg-muted)' }}>
                              <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>{idx + 1}</td>
                              <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                              <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--border)' }}>{r.language_used?.toUpperCase()}</td>
                              {questions.slice(0, 8).map(q => (
                                <td key={q.id} style={{ padding: '6px 10px', borderBottom: '1px solid var(--border)', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {formatSurveyAnswer(q, r.answers, r.language_used === 'ar' ? 'ar' : 'en') || '—'}
                                </td>
                              ))}
                              {questions.length > 8 && <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>...</td>}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {responses.length > 20 && (
                        <div style={{ padding: 10, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                          Showing 20 of {responses.length} responses. Export for full data.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
