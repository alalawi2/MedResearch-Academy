import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase, supabaseConfigured } from '../../lib/supabase';
import Layout from '../../components/Layout';

interface Participant {
  id: string;
  full_name: string;
  participant_id: string;
  role: string;
}

interface Section {
  id: string;
  title_en: string;
  description_en: string | null;
  order_num: number;
}

interface Question {
  id: string;
  section_id: string;
  question_en: string;
  type: 'radio' | 'checkbox' | 'likert' | 'text' | 'number' | 'dropdown';
  options_en: string[];
  required: boolean;
  order_num: number;
}

type Answers = Record<string, string | number | string[]>;

const SURVEY_ID = 'd1d1d1d1-0001-4000-8000-000000000001';
const NASA_TLX_SECTION_ORDER = 9; // Section 9 = NASA-TLX

const TIMEPOINT_LABELS: Record<string, string> = {
  baseline: 'Baseline Assessment',
  pre_shift_1: 'Pre-Shift Assessment 1',
  post_shift_1: 'Post-Shift Assessment 1',
  pre_shift_2: 'Pre-Shift Assessment 2',
  post_shift_2: 'Post-Shift Assessment 2',
  pre_shift_3: 'Pre-Shift Assessment 3',
  post_shift_3: 'Post-Shift Assessment 3',
};

function isPreShift(tp: string) { return tp.startsWith('pre_shift_'); }
function isPostShift(tp: string) { return tp.startsWith('post_shift_'); }
function getShiftNumber(tp: string) { return tp.replace(/^(pre|post)_shift_/, ''); }

export default function ShiftStudyAssessment() {
  const { timepoint } = useParams<{ timepoint: string }>();
  const navigate = useNavigate();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answers>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [existingTimepointId, setExistingTimepointId] = useState<string | null>(null);
  const [cogLinkConfirmed, setCogLinkConfirmed] = useState(false);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('shift_study_participant');
    if (!stored) { navigate('/active-research/cognitive-shifts/login'); return; }
    const p = JSON.parse(stored) as Participant;
    setParticipant(p);
    if (!supabaseConfigured || !timepoint) { setLoading(false); return; }
    setLoadError('');

    (async () => {
      try {
        const [sectionsRes, questionsRes, timepointRes, cfgRes] = await Promise.all([
          supabase.from('survey_sections').select('id,title_en,description_en,order_num').eq('survey_id', SURVEY_ID).order('order_num').limit(100),
          supabase.from('survey_questions').select('id,section_id,question_en,type,options_en,required,order_num').eq('survey_id', SURVEY_ID).order('order_num').limit(500),
          supabase.from('shift_study_timepoints').select('id,answers,completed').eq('participant_id', p.id).eq('timepoint', timepoint).limit(1),
          supabase.from('shift_study_config').select('key,value').limit(20),
        ]);

        if (sectionsRes.error || questionsRes.error) {
          throw new Error('Failed to load assessment data');
        }

        const loadedSections = (sectionsRes.data || []) as Section[];
        const loadedQuestions = (questionsRes.data || []) as Question[];
        setSections(loadedSections);
        setQuestions(loadedQuestions);

        if (cfgRes.data) {
          const map: Record<string, string> = {};
          cfgRes.data.forEach((r: any) => { map[r.key] = r.value; });
          setConfig(map);
        }

        if (timepointRes.data && timepointRes.data.length > 0) {
          const existing = timepointRes.data[0];
          setExistingTimepointId(existing.id);
          if (existing.completed) setAlreadyCompleted(true);
          else if (existing.answers) {
            const saved = existing.answers as Answers & { cognitive_link_confirmed?: boolean };
            setAnswers(saved);
            setCogLinkConfirmed(Boolean(saved.cognitive_link_confirmed));
          }
        }

        // Validate required data loaded
        if (timepoint === 'baseline' && (loadedSections.length === 0 || loadedQuestions.length === 0)) {
          setLoadError('The baseline questionnaire could not be loaded. Please contact the study team.');
        } else if (isPostShift(timepoint) && !loadedSections.some(s => s.order_num === NASA_TLX_SECTION_ORDER)) {
          setLoadError('The post-shift workload questionnaire is unavailable. Please contact the study team.');
        }
      } catch {
        setLoadError('Unable to load this assessment. Please try again or contact the study team.');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate, timepoint]);

  // Baseline: sections 1-8 (exclude NASA-TLX which is post-shift only)
  // Post-shift: NASA-TLX only (section 9)
  // Pre-shift: no questionnaire sections (cognitive link only)
  const filteredSections = useMemo(() => {
    if (!timepoint || timepoint === 'baseline') return sections.filter(s => s.order_num !== NASA_TLX_SECTION_ORDER);
    if (isPostShift(timepoint)) return sections.filter(s => s.order_num === NASA_TLX_SECTION_ORDER);
    return [];
  }, [sections, timepoint]);

  const totalSections = filteredSections.length;
  const currentSectionData = filteredSections[currentSection];
  const sectionQuestions = useMemo(() => {
    if (!currentSectionData) return [];
    return questions.filter(q => q.section_id === currentSectionData.id).sort((a, b) => a.order_num - b.order_num);
  }, [currentSectionData, questions]);

  const progress = totalSections > 0 ? Math.round(((currentSection + 1) / totalSections) * 100) : 0;

  const setAnswer = (questionId: string, value: string | number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[questionId]; return n; });
  };

  const toggleCheckbox = (questionId: string, optionValue: string) => {
    setAnswers(prev => {
      const current = Array.isArray(prev[questionId]) ? [...(prev[questionId] as string[])] : [];
      const next = current.includes(optionValue) ? current.filter(v => v !== optionValue) : [...current, optionValue];
      return { ...prev, [questionId]: next };
    });
    setErrors(prev => { const n = { ...prev }; delete n[questionId]; return n; });
  };

  const validateSection = (): boolean => {
    const errs: Record<string, string> = {};
    for (const q of sectionQuestions) {
      if (!q.required) continue;
      const val = answers[q.id];
      if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
        errs[q.id] = 'This question is required';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const saveProgress = async () => {
    if (!participant || !timepoint) return;
    try {
      const r = await fetch('/api/shift-study-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_timepoint', participant_id: participant.id, timepoint, answers, completed: false }),
      });
      const result = await r.json();
      if (result.id && !existingTimepointId) setExistingTimepointId(result.id);
    } catch { /* allow offline progress */ }
  };

  const handleNext = async () => {
    if (!validateSection()) return;
    await saveProgress();
    if (currentSection < totalSections - 1) { setCurrentSection(prev => prev + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };

  const handlePrev = () => {
    if (currentSection > 0) { setCurrentSection(prev => prev - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };

  const handleSubmit = async () => {
    if (!participant || !timepoint || !supabaseConfigured) return;

    // Server-side timepoint validation (runs for ALL timepoints including pre-shift)
    setSubmitting(true);
    try {
      const vr = await fetch('/api/shift-study-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validate_timepoint', participant_id: participant.id, timepoint }),
      });
      if (!vr.ok) {
        const err = await vr.json();
        alert(err.error || 'Cannot submit this assessment');
        setSubmitting(false);
        return;
      }
    } catch {
      alert('Network error. Please check your connection and try again.');
      setSubmitting(false);
      return;
    }

    // For pre-shift, just mark as completed (no questionnaire answers)
    if (isPreShift(timepoint)) {
      await fetch('/api/shift-study-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_timepoint', participant_id: participant.id, timepoint, answers: { cognitive_link_confirmed: true }, completed: true }),
      });
      setSubmitting(false);
      navigate('/active-research/cognitive-shifts/dashboard');
      return;
    }

    if (!validateSection()) { setSubmitting(false); return; }

    const finalAnswers = isPostShift(timepoint) ? { ...answers, cognitive_link_confirmed: true } : answers;

    await fetch('/api/shift-study-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save_timepoint', participant_id: participant.id, timepoint, answers: finalAnswers, completed: true }),
    });
    setSubmitting(false);
    navigate('/active-research/cognitive-shifts/dashboard');
  };

  if (!participant) return null;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)',
    fontSize: 15, fontFamily: 'var(--font-sans)', color: 'var(--text)', outline: 'none', boxSizing: 'border-box',
  };

  // Use button-style pills for short options (like burnout study), radio list for long options
  const useButtonStyle = (opts: string[]) => {
    const maxLen = Math.max(...opts.map(o => o.length));
    return opts.length <= 6 && maxLen <= 30;
  };

  const renderQuestion = (q: Question) => {
    const hasError = !!errors[q.id];
    const opts: string[] = Array.isArray(q.options_en) ? q.options_en.map(o => typeof o === 'object' && o !== null ? (o as any).label || (o as any).value || String(o) : String(o)) : [];
    const isButton = (q.type === 'radio' || q.type === 'likert') && useButtonStyle(opts);

    return (
      <div key={q.id} style={{ marginBottom: 16, padding: '16px 18px', borderRadius: 12, border: hasError ? '1px solid #fca5a5' : '1px solid var(--border)', background: hasError ? '#fef2f2' : '#fff' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--text)', marginBottom: 12, fontWeight: 500, lineHeight: 1.5 }}>
          {q.question_en}{q.required && <span style={{ color: '#ef4444', marginLeft: 4 }}>*</span>}
        </p>

        {/* Button-style options (like burnout study) */}
        {isButton && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {opts.map((opt, i) => {
              const selected = answers[q.id] === opt;
              return (
                <button key={i} type="button" onClick={() => setAnswer(q.id, opt)}
                  style={{
                    minHeight: 44, padding: '8px 14px', borderRadius: 8,
                    border: selected ? '2px solid var(--primary)' : '2px solid var(--border)',
                    background: selected ? 'var(--primary)' : 'white',
                    color: selected ? 'white' : 'var(--text)',
                    fontSize: 13, fontWeight: selected ? 600 : 400,
                    cursor: 'pointer', transition: 'all 0.15s ease',
                    flex: '1 1 auto', textAlign: 'center',
                    fontFamily: 'var(--font-sans)',
                  }}>
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {/* Radio list for long options */}
        {(q.type === 'radio' || q.type === 'likert') && !isButton && opts.map((opt, i) => (
          <label key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 2, background: answers[q.id] === opt ? '#eef2ff' : 'transparent', border: answers[q.id] === opt ? '1px solid #c7d2fe' : '1px solid transparent', transition: 'all 0.15s', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--text)', lineHeight: 1.4 }}>
            <input type="radio" name={q.id} value={opt} checked={answers[q.id] === opt} onChange={() => setAnswer(q.id, opt)} style={{ accentColor: 'var(--primary)', flexShrink: 0, marginTop: 2, width: 18, height: 18 }} />
            <span>{opt}</span>
          </label>
        ))}

        {q.type === 'checkbox' && opts.map((opt, i) => {
          const selected = Array.isArray(answers[q.id]) ? (answers[q.id] as string[]).includes(opt) : false;
          return (
            <label key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 2, background: selected ? '#eef2ff' : 'transparent', border: selected ? '1px solid #c7d2fe' : '1px solid transparent', transition: 'all 0.15s', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--text)', lineHeight: 1.4 }}>
              <input type="checkbox" checked={selected} onChange={() => toggleCheckbox(q.id, opt)} style={{ accentColor: 'var(--primary)', flexShrink: 0, marginTop: 2, width: 18, height: 18 }} />
              <span>{opt}</span>
            </label>
          );
        })}
        {q.type === 'text' && <textarea value={(answers[q.id] as string) || ''} onChange={e => setAnswer(q.id, e.target.value)} style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} placeholder="Type your answer..." />}
        {q.type === 'number' && <input type="number" value={(answers[q.id] as number) ?? ''} onChange={e => setAnswer(q.id, e.target.value ? Number(e.target.value) : '')} style={{ ...inputStyle, maxWidth: 200 }} placeholder="Enter a number" />}
        {q.type === 'dropdown' && (
          <select value={(answers[q.id] as string) || ''} onChange={e => setAnswer(q.id, e.target.value)} style={{ ...inputStyle, appearance: 'auto' as const }}>
            <option value="">Select...</option>
            {opts.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
          </select>
        )}
        {hasError && <p style={{ color: '#ef4444', fontSize: 13, marginTop: 8, marginBottom: 0, fontFamily: 'var(--font-sans)' }}>{errors[q.id]}</p>}
      </div>
    );
  };

  // ── PRE-SHIFT: Instructions + external cognitive link ──
  const renderPreShift = () => {
    const shiftNum = getShiftNumber(timepoint || '');
    return (
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', padding: '36px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>&#129504;</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontSize: 22, marginBottom: 8 }}>
            Pre-Shift Cognitive Assessment {shiftNum}
          </h2>
        </div>

        <div style={{ background: '#eff6ff', borderRadius: 12, padding: '20px 24px', marginBottom: 24, border: '1px solid #bfdbfe' }}>
          <h3 style={{ fontSize: 16, color: '#1e40af', marginBottom: 12, fontFamily: 'var(--font-sans)' }}>Standardized Instructions</h3>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.8, color: '#1e3a5f', fontFamily: 'var(--font-sans)' }}>
            {(config.pre_shift_instructions || '').split('\n').filter(Boolean).map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>

        <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '20px 24px', marginBottom: 24, border: '1px solid #bbf7d0', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#166534', marginBottom: 14, fontFamily: 'var(--font-sans)' }}>
            Click the link below to open the cognitive assessment on TestMyBrain:
          </p>
          <a
            href={config.testmybrain_pre_url || config.testmybrain_url || 'https://www.testmybrain.org'}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ padding: '12px 32px', fontSize: 16, borderRadius: 10, display: 'inline-block', textDecoration: 'none' }}
          >
            Open Cognitive Assessment &rarr;
          </a>
          <p style={{ fontSize: 12, color: '#6b7280', marginTop: 12, fontFamily: 'var(--font-sans)' }}>
            Opens in a new tab. Return here after completing the assessment.
          </p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--text)' }}>
            <input
              type="checkbox"
              checked={cogLinkConfirmed}
              onChange={e => setCogLinkConfirmed(e.target.checked)}
              style={{ accentColor: 'var(--primary)', marginTop: 2 }}
            />
            I confirm that I have completed the cognitive assessment on TestMyBrain before starting my shift.
          </label>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!cogLinkConfirmed || submitting}
          className="btn btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: 16, borderRadius: 10, opacity: !cogLinkConfirmed ? 0.5 : 1 }}
        >
          {submitting ? 'Submitting...' : 'Confirm & Continue'}
        </button>
      </div>
    );
  };

  // ── POST-SHIFT: Cognitive link + NASA-TLX ──
  const renderPostShift = () => {
    const shiftNum = getShiftNumber(timepoint || '');
    const showNasaTlx = cogLinkConfirmed;

    return (
      <>
        {/* Step 1: Cognitive assessment */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', padding: '36px 32px', marginBottom: 24 }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontSize: 22, marginBottom: 4 }}>
              Post-Shift Assessment {shiftNum} — Step 1 of 2
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, fontFamily: 'var(--font-sans)' }}>Cognitive Assessment</p>
          </div>

          <div style={{ background: '#eff6ff', borderRadius: 12, padding: '20px 24px', marginBottom: 24, border: '1px solid #bfdbfe' }}>
            <h3 style={{ fontSize: 16, color: '#1e40af', marginBottom: 12, fontFamily: 'var(--font-sans)' }}>Standardized Instructions</h3>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.8, color: '#1e3a5f', fontFamily: 'var(--font-sans)' }}>
              {(config.post_shift_instructions || '').split('\n').filter(Boolean).map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <a
              href={config.testmybrain_post_url || config.testmybrain_url || 'https://www.testmybrain.org'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ padding: '12px 32px', fontSize: 16, borderRadius: 10, display: 'inline-block', textDecoration: 'none' }}
            >
              Open Cognitive Assessment &rarr;
            </a>
          </div>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--text)' }}>
            <input type="checkbox" checked={cogLinkConfirmed} onChange={e => setCogLinkConfirmed(e.target.checked)} style={{ accentColor: 'var(--primary)', marginTop: 2 }} />
            I confirm that I have completed the post-shift cognitive assessment on TestMyBrain.
          </label>
        </div>

        {/* Step 2: NASA-TLX (shown after confirming cognitive assessment) */}
        {showNasaTlx && filteredSections.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', padding: '36px 32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontSize: 22, marginBottom: 4 }}>
              Post-Shift Assessment {shiftNum} — Step 2 of 2
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, fontFamily: 'var(--font-sans)', marginBottom: 8 }}>
              NASA Task Load Index (NASA-TLX)
            </p>
            {currentSectionData?.description_en && (
              <p style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--font-sans)', marginBottom: 20, lineHeight: 1.5 }}>
                {currentSectionData.description_en}
              </p>
            )}

            {sectionQuestions.map(q => renderQuestion(q))}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: 16, borderRadius: 10, marginTop: 16, background: '#15803d' }}
            >
              {submitting ? 'Submitting...' : 'Submit Post-Shift Assessment'}
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <Layout>
      <section className="section" style={{ minHeight: '70vh' }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <div style={{ marginBottom: 16 }}>
            <button onClick={() => navigate('/active-research/cognitive-shifts/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-sans)', padding: 0 }}>
              &larr; Back to Dashboard
            </button>
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text)', fontSize: 24, marginBottom: 6 }}>
            {TIMEPOINT_LABELS[timepoint || ''] || 'Assessment'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, fontFamily: 'var(--font-sans)', marginBottom: 24 }}>
            Participant: {participant.full_name} ({participant.participant_id})
          </p>

          {/* Already completed */}
          {alreadyCompleted && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, padding: '32px 28px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>&#10003;</div>
              <h2 style={{ fontFamily: 'var(--font-serif)', color: '#15803d', fontSize: 20, marginBottom: 8 }}>Assessment Already Completed</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, fontFamily: 'var(--font-sans)', marginBottom: 20 }}>
                You have already completed the {TIMEPOINT_LABELS[timepoint || '']} assessment.
              </p>
              <button onClick={() => navigate('/active-research/cognitive-shifts/dashboard')} className="btn btn-primary" style={{ padding: '10px 28px', borderRadius: 8, fontSize: 14 }}>
                Return to Dashboard
              </button>
            </div>
          )}

          {loading && !alreadyCompleted && (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>Loading assessment...</div>
          )}

          {/* ── Load error ── */}
          {!loading && !alreadyCompleted && loadError && (
            <div style={{ background: '#fff7ed', border: '1px solid #fdba74', borderRadius: 14, padding: '28px 24px', color: '#9a3412' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, marginBottom: 8 }}>Assessment Unavailable</h2>
              <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 18, fontFamily: 'var(--font-sans)' }}>{loadError}</p>
              <button onClick={() => navigate('/active-research/cognitive-shifts/dashboard')} className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: 8, fontSize: 14 }}>
                Return to Dashboard
              </button>
            </div>
          )}

          {/* ── PRE-SHIFT: cognitive link only ── */}
          {!loading && !alreadyCompleted && !loadError && timepoint && isPreShift(timepoint) && renderPreShift()}

          {/* ── POST-SHIFT: cognitive link + NASA-TLX ── */}
          {!loading && !alreadyCompleted && !loadError && timepoint && isPostShift(timepoint) && renderPostShift()}

          {/* ── BASELINE: sections 1-8 questionnaire ── */}
          {!loading && !alreadyCompleted && !loadError && timepoint === 'baseline' && filteredSections.length > 0 && (
            <>
              {/* Progress Bar */}
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', padding: '16px 20px', marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>Section {currentSection + 1} of {totalSections}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>{progress}%</span>
                </div>
                <div style={{ background: 'var(--bg-muted)', borderRadius: 6, height: 6, overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)', borderRadius: 6, transition: 'width 0.3s ease' }} />
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                  {filteredSections.map((s, i) => (
                    <button key={s.id} onClick={() => { if (i <= currentSection) { setCurrentSection(i); window.scrollTo({ top: 0, behavior: 'smooth' }); } }} title={s.title_en}
                      style={{ width: 24, height: 24, borderRadius: '50%', border: i === currentSection ? '2px solid var(--primary)' : '1px solid var(--border)', background: i < currentSection ? 'var(--primary)' : i === currentSection ? 'var(--accent-light)' : '#fff', color: i < currentSection ? '#fff' : 'var(--text)', fontSize: 11, fontWeight: 600, cursor: i <= currentSection ? 'pointer' : 'default', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: i > currentSection ? 0.4 : 1 }}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section Header */}
              {currentSectionData && (
                <div style={{ marginBottom: 20 }}>
                  <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text)', fontSize: 20, marginBottom: 4 }}>{currentSectionData.title_en}</h2>
                  {currentSectionData.description_en && (
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, fontFamily: 'var(--font-sans)', lineHeight: 1.5 }}>{currentSectionData.description_en}</p>
                  )}
                </div>
              )}

              {sectionQuestions.map(q => renderQuestion(q))}

              {/* Navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                <button onClick={handlePrev} disabled={currentSection === 0}
                  style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid var(--border)', background: '#fff', color: currentSection === 0 ? 'var(--text-muted)' : 'var(--text)', cursor: currentSection === 0 ? 'not-allowed' : 'pointer', fontSize: 14, fontFamily: 'var(--font-sans)', fontWeight: 500, opacity: currentSection === 0 ? 0.5 : 1 }}>
                  Previous
                </button>
                {currentSection < totalSections - 1 ? (
                  <button onClick={handleNext} className="btn btn-primary" style={{ padding: '10px 28px', borderRadius: 8, fontSize: 14 }}>Next Section</button>
                ) : (
                  <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary" style={{ padding: '10px 28px', borderRadius: 8, fontSize: 14, background: '#15803d' }}>
                    {submitting ? 'Submitting...' : 'Submit Baseline Assessment'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
