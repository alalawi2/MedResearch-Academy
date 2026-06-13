import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

const TIMEPOINT_LABELS: Record<string, string> = {
  baseline: 'Baseline Assessment',
  pre_shift_1: 'Pre-Shift 1',
  post_shift_1: 'Post-Shift 1',
  pre_shift_2: 'Pre-Shift 2',
  post_shift_2: 'Post-Shift 2',
  pre_shift_3: 'Pre-Shift 3',
  post_shift_3: 'Post-Shift 3',
};

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

  useEffect(() => {
    const stored = sessionStorage.getItem('shift_study_participant');
    if (!stored) {
      navigate('/active-research/cognitive-shifts/login');
      return;
    }
    const p = JSON.parse(stored) as Participant;
    setParticipant(p);

    if (!supabaseConfigured || !timepoint) { setLoading(false); return; }

    (async () => {
      // Fetch survey structure and existing answers in parallel
      const [sectionsRes, questionsRes, timepointRes] = await Promise.all([
        supabase
          .from('survey_sections')
          .select('id,title_en,description_en,order_num')
          .eq('survey_id', SURVEY_ID)
          .order('order_num')
          .limit(100),
        supabase
          .from('survey_questions')
          .select('id,section_id,question_en,type,options_en,required,order_num')
          .eq('survey_id', SURVEY_ID)
          .order('order_num')
          .limit(500),
        supabase
          .from('shift_study_timepoints')
          .select('id,answers,completed,started_at,completed_at')
          .eq('participant_id', p.id)
          .eq('timepoint', timepoint)
          .limit(1),
      ]);

      if (sectionsRes.data) setSections(sectionsRes.data as Section[]);
      if (questionsRes.data) setQuestions(questionsRes.data as Question[]);

      if (timepointRes.data && timepointRes.data.length > 0) {
        const existing = timepointRes.data[0];
        setExistingTimepointId(existing.id);
        if (existing.completed) {
          setAlreadyCompleted(true);
        } else if (existing.answers) {
          setAnswers(existing.answers as Answers);
        }
      }

      setLoading(false);
    })();
  }, [navigate, timepoint]);

  const currentSectionData = sections[currentSection];
  const sectionQuestions = useMemo(() => {
    if (!currentSectionData) return [];
    return questions
      .filter(q => q.section_id === currentSectionData.id)
      .sort((a, b) => a.order_num - b.order_num);
  }, [currentSectionData, questions]);

  const totalSections = sections.length;
  const progress = totalSections > 0 ? Math.round(((currentSection + 1) / totalSections) * 100) : 0;

  const setAnswer = (questionId: string, value: string | number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    setErrors(prev => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  const toggleCheckbox = (questionId: string, optionValue: string) => {
    setAnswers(prev => {
      const current = Array.isArray(prev[questionId]) ? [...(prev[questionId] as string[])] : [];
      const next = current.includes(optionValue)
        ? current.filter(v => v !== optionValue)
        : [...current, optionValue];
      return { ...prev, [questionId]: next };
    });
    setErrors(prev => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
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
    if (!participant || !timepoint || !supabaseConfigured) return;

    if (existingTimepointId) {
      await supabase
        .from('shift_study_timepoints')
        .update({ answers })
        .eq('id', existingTimepointId);
    } else {
      const { data } = await supabase
        .from('shift_study_timepoints')
        .insert({
          participant_id: participant.id,
          timepoint,
          answers,
          completed: false,
          started_at: new Date().toISOString(),
        })
        .select('id')
        .single();
      if (data) setExistingTimepointId(data.id);
    }
  };

  const handleNext = async () => {
    if (!validateSection()) return;
    await saveProgress();
    if (currentSection < totalSections - 1) {
      setCurrentSection(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!validateSection()) return;
    if (!participant || !timepoint || !supabaseConfigured) return;

    setSubmitting(true);

    // Server-side timepoint validation
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
      // If validation endpoint is unreachable, allow submission (graceful degradation)
    }

    const now = new Date().toISOString();
    if (existingTimepointId) {
      await supabase
        .from('shift_study_timepoints')
        .update({ answers, completed: true, completed_at: now })
        .eq('id', existingTimepointId);
    } else {
      await supabase
        .from('shift_study_timepoints')
        .insert({
          participant_id: participant.id,
          timepoint,
          answers,
          completed: true,
          started_at: now,
          completed_at: now,
        });
    }

    setSubmitting(false);
    navigate('/active-research/cognitive-shifts/dashboard');
  };

  if (!participant) return null;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    fontSize: 15,
    fontFamily: 'var(--font-sans)',
    color: 'var(--text)',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const renderQuestion = (q: Question) => {
    const hasError = !!errors[q.id];
    const opts: string[] = Array.isArray(q.options_en) ? q.options_en.map(o => typeof o === 'object' && o !== null ? (o as { value?: string; label?: string }).label || (o as { value?: string }).value || String(o) : String(o)) : [];

    return (
      <div
        key={q.id}
        style={{
          marginBottom: 24,
          padding: '18px 20px',
          borderRadius: 12,
          border: hasError ? '1px solid #fca5a5' : '1px solid var(--border)',
          background: hasError ? '#fef2f2' : '#fff',
        }}
      >
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 15,
          color: 'var(--text)',
          marginBottom: 14,
          fontWeight: 500,
          lineHeight: 1.5,
        }}>
          {q.question_en}
          {q.required && <span style={{ color: '#ef4444', marginLeft: 4 }}>*</span>}
        </p>

        {(q.type === 'radio' || q.type === 'likert') && opts.map((opt, i) => (
          <label
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              borderRadius: 8,
              cursor: 'pointer',
              marginBottom: 4,
              background: answers[q.id] === opt ? 'var(--accent-light)' : 'transparent',
              transition: 'background 0.15s',
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              color: 'var(--text)',
            }}
          >
            <input
              type="radio"
              name={q.id}
              value={opt}
              checked={answers[q.id] === opt}
              onChange={() => setAnswer(q.id, opt)}
              style={{ accentColor: 'var(--primary)' }}
            />
            {opt}
          </label>
        ))}

        {q.type === 'checkbox' && opts.map((opt, i) => {
          const selected = Array.isArray(answers[q.id]) ? (answers[q.id] as string[]).includes(opt) : false;
          return (
            <label
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                borderRadius: 8,
                cursor: 'pointer',
                marginBottom: 4,
                background: selected ? 'var(--accent-light)' : 'transparent',
                transition: 'background 0.15s',
                fontFamily: 'var(--font-sans)',
                fontSize: 14,
                color: 'var(--text)',
              }}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => toggleCheckbox(q.id, opt)}
                style={{ accentColor: 'var(--primary)' }}
              />
              {opt}
            </label>
          );
        })}

        {q.type === 'text' && (
          <textarea
            value={(answers[q.id] as string) || ''}
            onChange={e => setAnswer(q.id, e.target.value)}
            style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
            placeholder="Type your answer..."
          />
        )}

        {q.type === 'number' && (
          <input
            type="number"
            value={(answers[q.id] as number) ?? ''}
            onChange={e => setAnswer(q.id, e.target.value ? Number(e.target.value) : '')}
            style={{ ...inputStyle, maxWidth: 200 }}
            placeholder="Enter a number"
          />
        )}

        {q.type === 'dropdown' && (
          <select
            value={(answers[q.id] as string) || ''}
            onChange={e => setAnswer(q.id, e.target.value)}
            style={{ ...inputStyle, appearance: 'auto' as const }}
          >
            <option value="">Select...</option>
            {opts.map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        )}

        {hasError && (
          <p style={{ color: '#ef4444', fontSize: 13, marginTop: 8, marginBottom: 0, fontFamily: 'var(--font-sans)' }}>
            {errors[q.id]}
          </p>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <section className="section" style={{ minHeight: '70vh' }}>
        <div className="container" style={{ maxWidth: 760 }}>
          {/* Back link */}
          <div style={{ marginBottom: 16 }}>
            <button
              onClick={() => navigate('/active-research/cognitive-shifts/dashboard')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                cursor: 'pointer',
                fontSize: 14,
                fontFamily: 'var(--font-sans)',
                padding: 0,
              }}
            >
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
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 14,
              padding: '32px 28px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>&#10003;</div>
              <h2 style={{ fontFamily: 'var(--font-serif)', color: '#15803d', fontSize: 20, marginBottom: 8 }}>
                Assessment Already Completed
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, fontFamily: 'var(--font-sans)', marginBottom: 20 }}>
                You have already completed the {TIMEPOINT_LABELS[timepoint || '']} assessment. Your responses have been saved.
              </p>
              <button
                onClick={() => navigate('/active-research/cognitive-shifts/dashboard')}
                className="btn btn-primary"
                style={{ padding: '10px 28px', borderRadius: 8, fontSize: 14 }}
              >
                Return to Dashboard
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && !alreadyCompleted && (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>
              Loading assessment...
            </div>
          )}

          {/* Assessment Form */}
          {!loading && !alreadyCompleted && sections.length > 0 && (
            <>
              {/* Progress Bar */}
              <div style={{
                background: '#fff',
                borderRadius: 12,
                border: '1px solid var(--border)',
                padding: '16px 20px',
                marginBottom: 24,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>
                    Section {currentSection + 1} of {totalSections}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>
                    {progress}%
                  </span>
                </div>
                <div style={{ background: 'var(--bg-muted)', borderRadius: 6, height: 6, overflow: 'hidden' }}>
                  <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: 'var(--primary)',
                    borderRadius: 6,
                    transition: 'width 0.3s ease',
                  }} />
                </div>
                {/* Section nav dots */}
                <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                  {sections.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        if (i <= currentSection) {
                          setCurrentSection(i);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      title={s.title_en}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        border: i === currentSection ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: i < currentSection ? 'var(--primary)' : i === currentSection ? 'var(--accent-light)' : '#fff',
                        color: i < currentSection ? '#fff' : 'var(--text)',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: i <= currentSection ? 'pointer' : 'default',
                        fontFamily: 'var(--font-sans)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: i > currentSection ? 0.4 : 1,
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section Header */}
              {currentSectionData && (
                <div style={{ marginBottom: 20 }}>
                  <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text)', fontSize: 20, marginBottom: 4 }}>
                    {currentSectionData.title_en}
                  </h2>
                  {currentSectionData.description_en && (
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, fontFamily: 'var(--font-sans)', lineHeight: 1.5 }}>
                      {currentSectionData.description_en}
                    </p>
                  )}
                </div>
              )}

              {/* Questions */}
              {sectionQuestions.map(q => renderQuestion(q))}

              {/* Navigation Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 28,
                paddingTop: 20,
                borderTop: '1px solid var(--border)',
              }}>
                <button
                  onClick={handlePrev}
                  disabled={currentSection === 0}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: '#fff',
                    color: currentSection === 0 ? 'var(--text-muted)' : 'var(--text)',
                    cursor: currentSection === 0 ? 'not-allowed' : 'pointer',
                    fontSize: 14,
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 500,
                    opacity: currentSection === 0 ? 0.5 : 1,
                  }}
                >
                  Previous
                </button>

                {currentSection < totalSections - 1 ? (
                  <button
                    onClick={handleNext}
                    className="btn btn-primary"
                    style={{ padding: '10px 28px', borderRadius: 8, fontSize: 14 }}
                  >
                    Next Section
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="btn btn-primary"
                    style={{
                      padding: '10px 28px',
                      borderRadius: 8,
                      fontSize: 14,
                      background: '#15803d',
                    }}
                  >
                    {submitting ? 'Submitting...' : 'Submit Assessment'}
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
