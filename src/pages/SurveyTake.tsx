import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { supabase, supabaseConfigured } from '../lib/supabase';

interface Survey {
  id: string;
  title_en: string;
  title_ar: string | null;
  description_en: string | null;
  description_ar: string | null;
  researcher_name: string;
  institution: string | null;
  language: 'en' | 'ar' | 'both';
  estimated_minutes: number | null;
  ethics_approved: boolean;
  ethics_reference: string | null;
}

interface Section {
  id: string;
  title_en: string;
  title_ar: string | null;
  description_en: string | null;
  description_ar: string | null;
  order_num: number;
}

interface Question {
  id: string;
  section_id: string;
  question_en: string;
  question_ar: string | null;
  type: 'radio' | 'checkbox' | 'likert' | 'text' | 'number' | 'dropdown';
  options_en: string[];
  options_ar: string[];
  required: boolean;
  order_num: number;
  skip_logic: any;
}

const LIKERT_LABELS_EN = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
const LIKERT_LABELS_AR = ['أعارض بشدة', 'أعارض', 'محايد', 'أوافق', 'أوافق بشدة'];

export default function SurveyTake() {
  const { id } = useParams<{ id: string }>();
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [started, setStarted] = useState(false);

  const isRtl = lang === 'ar';

  useEffect(() => {
    if (!supabaseConfigured || !id) { setLoading(false); return; }
    (async () => {
      const [surveyRes, sectionsRes, questionsRes] = await Promise.all([
        supabase.from('surveys').select('id,title_en,title_ar,description_en,description_ar,researcher_name,institution,language,estimated_minutes,ethics_approved,ethics_reference').eq('id', id).single(),
        supabase.from('survey_sections').select('id,title_en,title_ar,description_en,description_ar,order_num').eq('survey_id', id).order('order_num').limit(100),
        supabase.from('survey_questions').select('id,section_id,question_en,question_ar,type,options_en,options_ar,required,order_num,skip_logic').eq('survey_id', id).order('order_num').limit(500),
      ]);
      if (surveyRes.data) {
        const s = surveyRes.data as Survey;
        setSurvey(s);
        if (s.language === 'ar') setLang('ar');
      }
      if (sectionsRes.data) setSections(sectionsRes.data as Section[]);
      if (questionsRes.data) setQuestions(questionsRes.data as Question[]);
      setLoading(false);
    })();
  }, [id]);

  // Evaluate skip logic for a question
  const isQuestionVisible = (q: Question): boolean => {
    if (!q.skip_logic) return true;
    const logic = q.skip_logic;
    if (logic.show_if) {
      const cond = logic.show_if;
      const val = answers[cond.question_id];
      if (cond.equals !== undefined) {
        return val === cond.equals || (Array.isArray(val) && val.includes(cond.equals));
      }
      if (cond.not_equals !== undefined) {
        return val !== cond.not_equals && !(Array.isArray(val) && val.includes(cond.not_equals));
      }
      return true;
    }
    return true;
  };

  // Questions for current section
  const currentSectionData = sections[currentSection];
  const sectionQuestions = useMemo(() => {
    if (!currentSectionData) return [];
    return questions
      .filter(q => q.section_id === currentSectionData.id)
      .filter(isQuestionVisible);
  }, [currentSectionData, questions, answers]);

  const totalSections = sections.length;
  const progress = totalSections > 0 ? Math.round(((currentSection + 1) / totalSections) * 100) : 0;

  const t = (en: string | null, ar: string | null) => {
    if (lang === 'ar' && ar) return ar;
    return en || '';
  };

  const setAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    setErrors(prev => { const next = { ...prev }; delete next[questionId]; return next; });
  };

  const toggleCheckbox = (questionId: string, option: string) => {
    setAnswers(prev => {
      const current: string[] = prev[questionId] || [];
      const next = current.includes(option) ? current.filter(o => o !== option) : [...current, option];
      return { ...prev, [questionId]: next };
    });
    setErrors(prev => { const next = { ...prev }; delete next[questionId]; return next; });
  };

  const validateSection = (): boolean => {
    const errs: Record<string, string> = {};
    for (const q of sectionQuestions) {
      if (!q.required) continue;
      const val = answers[q.id];
      if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
        errs[q.id] = lang === 'ar' ? 'هذا السؤال مطلوب' : 'This question is required';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validateSection()) return;

    // Check for section-skip logic in current section's questions
    const currentQuestions = questions.filter(q => q.section_id === currentSectionData?.id);
    for (const q of currentQuestions) {
      if (q.skip_logic && q.skip_logic.skip_to_section) {
        const logic = q.skip_logic;
        const questionVal = answers[logic.if_question];
        let shouldSkip = false;

        // Check equals_any (e.g., Yanqul/Ibri/Dhank)
        if (logic.equals_any && Array.isArray(logic.equals_any)) {
          shouldSkip = logic.equals_any.includes(questionVal);
        }

        // Check compound AND condition (e.g., AND nationality = Omani)
        if (shouldSkip && logic.and_question && logic.and_equals) {
          const andVal = answers[logic.and_question];
          shouldSkip = andVal === logic.and_equals;
        }

        if (shouldSkip) {
          // Find the target section index
          const targetIdx = sections.findIndex(s => s.id === logic.skip_to_section);
          if (targetIdx > currentSection) {
            setCurrentSection(targetIdx);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }
        }
      }
    }

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
    if (!id) return;
    setSubmitting(true);
    const { error } = await supabase.from('survey_responses').insert({
      survey_id: id,
      answers,
      language_used: lang,
      completed: true,
    });
    setSubmitting(false);
    if (!error) setSubmitted(true);
  };

  // Render question based on type
  const renderQuestion = (q: Question) => {
    const label = t(q.question_en, q.question_ar);
    const opts = lang === 'ar' && q.options_ar && q.options_ar.length > 0 ? q.options_ar : q.options_en || [];
    const hasError = !!errors[q.id];

    return (
      <div key={q.id} className="survey-question" style={{ marginBottom: 28, padding: 20, background: hasError ? 'rgba(239,68,68,0.04)' : 'var(--bg-muted)', borderRadius: 12, border: hasError ? '1px solid rgba(239,68,68,0.3)' : '1px solid transparent' }}>
        <label className="survey-question-label" style={{ display: 'block', fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 12, lineHeight: 1.5 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', color: 'white', fontSize: 12, fontWeight: 700, marginRight: isRtl ? 0 : 10, marginLeft: isRtl ? 10 : 0, flexShrink: 0, verticalAlign: 'middle' }}>
            {lang === 'ar' ? `${q.order_num}` : `${q.order_num}`}
          </span>
          {label}
          {q.required && <span style={{ color: '#ef4444', marginLeft: isRtl ? 0 : 4, marginRight: isRtl ? 4 : 0 }}>*</span>}
        </label>

        {q.type === 'radio' && (
          <div className="survey-radio-group">
            {opts.map((opt, i) => (
              <label key={i} className={`survey-radio-option ${answers[q.id] === opt ? 'selected' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, background: answers[q.id] === opt ? 'rgba(26,58,92,0.08)' : 'white', border: answers[q.id] === opt ? '1.5px solid var(--primary)' : '1px solid var(--border)', cursor: 'pointer', marginBottom: 6, transition: 'all 0.15s' }}>
                <span className="survey-radio-dot" style={{ width: 18, height: 18, borderRadius: '50%', border: answers[q.id] === opt ? '5px solid var(--primary)' : '2px solid var(--border)', flexShrink: 0, transition: 'all 0.15s', background: 'white' }} />
                <input type="radio" name={q.id} value={opt} checked={answers[q.id] === opt} onChange={() => setAnswer(q.id, opt)} style={{ display: 'none' }} />
                <span style={{ fontSize: 14 }}>{opt}</span>
              </label>
            ))}
          </div>
        )}

        {q.type === 'checkbox' && (
          <div className="survey-checkbox-group">
            {opts.map((opt, i) => {
              const checked = (answers[q.id] || []).includes(opt);
              return (
                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, background: checked ? 'rgba(26,58,92,0.08)' : 'white', border: checked ? '1.5px solid var(--primary)' : '1px solid var(--border)', cursor: 'pointer', marginBottom: 6, transition: 'all 0.15s' }}>
                  <span style={{ width: 18, height: 18, borderRadius: 4, border: checked ? 'none' : '2px solid var(--border)', background: checked ? 'var(--primary)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s', color: 'white', fontSize: 12, fontWeight: 700 }}>
                    {checked ? '✓' : ''}
                  </span>
                  <input type="checkbox" checked={checked} onChange={() => toggleCheckbox(q.id, opt)} style={{ display: 'none' }} />
                  <span style={{ fontSize: 14 }}>{opt}</span>
                </label>
              );
            })}
          </div>
        )}

        {q.type === 'likert' && (
          <div className="survey-likert-group" style={{ display: 'flex', gap: 0, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
            {[1, 2, 3, 4, 5].map(n => {
              const selected = answers[q.id] === n;
              const labels = lang === 'ar' ? LIKERT_LABELS_AR : LIKERT_LABELS_EN;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setAnswer(q.id, n)}
                  className={`survey-likert-btn ${selected ? 'selected' : ''}`}
                  style={{
                    flex: 1,
                    padding: '12px 4px',
                    background: selected ? 'var(--primary)' : 'white',
                    color: selected ? 'white' : 'var(--text)',
                    border: 'none',
                    borderRight: n < 5 ? '1px solid var(--border)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: 16 }}>{n}</span>
                  <span style={{ fontSize: 10, opacity: 0.7, lineHeight: 1.2, textAlign: 'center' }}>{labels[n - 1]}</span>
                </button>
              );
            })}
          </div>
        )}

        {q.type === 'text' && (
          <textarea
            value={answers[q.id] || ''}
            onChange={e => setAnswer(q.id, e.target.value)}
            rows={3}
            placeholder={lang === 'ar' ? 'اكتب إجابتك هنا...' : 'Type your answer here...'}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, fontFamily: 'var(--font-sans)', resize: 'vertical', outline: 'none', boxSizing: 'border-box', direction: isRtl ? 'rtl' : 'ltr' }}
          />
        )}

        {q.type === 'number' && (
          <input
            type="number"
            value={answers[q.id] || ''}
            onChange={e => setAnswer(q.id, e.target.value)}
            placeholder={lang === 'ar' ? 'أدخل رقمًا' : 'Enter a number'}
            style={{ width: '100%', maxWidth: 200, padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, fontFamily: 'var(--font-sans)', outline: 'none', boxSizing: 'border-box' }}
          />
        )}

        {q.type === 'dropdown' && (
          <select
            value={answers[q.id] || ''}
            onChange={e => setAnswer(q.id, e.target.value)}
            style={{ width: '100%', maxWidth: 400, padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, fontFamily: 'var(--font-sans)', outline: 'none', background: 'white' }}
          >
            <option value="">{lang === 'ar' ? 'اختر...' : 'Select...'}</option>
            {opts.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
          </select>
        )}

        {hasError && (
          <p style={{ color: '#ef4444', fontSize: 12, marginTop: 6, fontWeight: 500 }}>{errors[q.id]}</p>
        )}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-muted)' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>Loading survey...</p>
      </div>
    );
  }

  // Not found
  if (!survey) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-muted)', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 48 }}>📋</div>
        <h2 style={{ color: 'var(--primary)', fontFamily: 'var(--font-serif)' }}>Survey Not Found</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>This survey may have been closed or does not exist.</p>
        <a href="/surveys" className="btn btn-primary">Browse Surveys →</a>
      </div>
    );
  }

  // Thank you page
  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-muted)', flexDirection: 'column', gap: 16, padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 8 }}>✅</div>
        <h2 style={{ color: 'var(--primary)', fontFamily: 'var(--font-serif)', fontSize: '2rem' }}>
          {lang === 'ar' ? 'شكرًا لك!' : 'Thank You!'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 480, lineHeight: 1.7 }}>
          {lang === 'ar'
            ? 'تم تسجيل إجابتك بنجاح. مشاركتك تساهم في تطوير البحث الطبي.'
            : 'Your response has been recorded successfully. Your participation contributes to advancing medical research.'}
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <a href="/surveys" className="btn btn-primary">
            {lang === 'ar' ? 'عرض الاستبيانات الأخرى' : 'Browse More Surveys'}
          </a>
        </div>
        <div className="survey-powered-footer" style={{ marginTop: 40, padding: '16px 24px', background: 'white', borderRadius: 10, border: '1px solid var(--border)' }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Powered by <strong style={{ color: 'var(--primary)' }}>MedResearch Academy</strong> | medresearch-academy.om</p>
        </div>
      </div>
    );
  }

  // Consent / intro page
  if (!started) {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: 'var(--bg-muted)', padding: '40px 24px' }}>
        {/* Language toggle */}
        {survey.language === 'both' && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
            <div className="survey-lang-toggle" style={{ display: 'inline-flex', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', background: 'white' }}>
              <button onClick={() => setLang('en')} style={{ padding: '8px 20px', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', background: lang === 'en' ? 'var(--primary)' : 'white', color: lang === 'en' ? 'white' : 'var(--text-muted)', fontFamily: 'var(--font-sans)', transition: 'all 0.15s' }}>
                English
              </button>
              <button onClick={() => setLang('ar')} style={{ padding: '8px 20px', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', background: lang === 'ar' ? 'var(--primary)' : 'white', color: lang === 'ar' ? 'white' : 'var(--text-muted)', fontFamily: 'var(--font-sans)', transition: 'all 0.15s' }}>
                العربية
              </button>
            </div>
          </div>
        )}

        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #0f2847 100%)', padding: '32px 36px', color: 'white' }}>
              <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 8 }}>{lang === 'ar' ? 'استبيان بحثي' : 'Research Survey'}</div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.4rem,3vw,1.8rem)', marginBottom: 8, lineHeight: 1.3 }}>
                {t(survey.title_en, survey.title_ar)}
              </h1>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, opacity: 0.7, marginTop: 12 }}>
                <span>{survey.researcher_name}</span>
                {survey.institution && <span>{survey.institution}</span>}
              </div>
            </div>

            <div style={{ padding: '32px 36px' }}>
              {/* Description */}
              {(survey.description_en || survey.description_ar) && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)', marginBottom: 8 }}>
                    {lang === 'ar' ? 'حول هذا الاستبيان' : 'About This Survey'}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7 }}>
                    {t(survey.description_en, survey.description_ar)}
                  </p>
                </div>
              )}

              {/* Meta */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                <div style={{ padding: 14, background: 'var(--bg-muted)', borderRadius: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                    {lang === 'ar' ? 'الوقت المقدر' : 'Estimated Time'}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{survey.estimated_minutes || '~10'} {lang === 'ar' ? 'دقائق' : 'minutes'}</div>
                </div>
                <div style={{ padding: 14, background: 'var(--bg-muted)', borderRadius: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                    {lang === 'ar' ? 'الأقسام' : 'Sections'}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{sections.length}</div>
                </div>
              </div>

              {survey.ethics_approved && survey.ethics_reference && (
                <div style={{ padding: 14, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>✅</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#15803d' }}>{lang === 'ar' ? 'موافقة أخلاقية' : 'Ethics Approved'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{survey.ethics_reference}</div>
                  </div>
                </div>
              )}

              {/* Consent text */}
              <div style={{ padding: 16, background: 'var(--bg-muted)', borderRadius: 10, marginBottom: 28, borderLeft: isRtl ? 'none' : '4px solid var(--accent)', borderRight: isRtl ? '4px solid var(--accent)' : 'none' }}>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  {lang === 'ar'
                    ? 'بالنقر على "ابدأ الاستبيان"، فإنك توافق على المشاركة طوعيًا في هذا البحث. إجاباتك مجهولة الهوية ولن يتم ربطها بمعلوماتك الشخصية. يمكنك الانسحاب في أي وقت.'
                    : 'By clicking "Start Survey", you consent to voluntarily participate in this research. Your responses are anonymous and will not be linked to your personal information. You may withdraw at any time.'}
                </p>
              </div>

              <button onClick={() => setStarted(true)} className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                {lang === 'ar' ? 'ابدأ الاستبيان →' : 'Start Survey →'}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Powered by <strong style={{ color: 'var(--primary)' }}>MedResearch Academy</strong> | medresearch-academy.om</p>
          </div>
        </div>
      </div>
    );
  }

  // Main survey-taking view
  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: 'var(--bg-muted)', padding: '24px 24px 60px' }}>
      {/* Top bar: language toggle + progress */}
      <div style={{ maxWidth: 720, margin: '0 auto 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--primary)', margin: 0 }}>
            {t(survey.title_en, survey.title_ar)}
          </h2>
          {survey.language === 'both' && (
            <div className="survey-lang-toggle" style={{ display: 'inline-flex', borderRadius: 6, overflow: 'hidden', border: '1px solid var(--border)', background: 'white', flexShrink: 0, marginLeft: isRtl ? 0 : 12, marginRight: isRtl ? 12 : 0 }}>
              <button onClick={() => setLang('en')} style={{ padding: '5px 14px', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', background: lang === 'en' ? 'var(--primary)' : 'white', color: lang === 'en' ? 'white' : 'var(--text-muted)', fontFamily: 'var(--font-sans)', transition: 'all 0.15s' }}>EN</button>
              <button onClick={() => setLang('ar')} style={{ padding: '5px 14px', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', background: lang === 'ar' ? 'var(--primary)' : 'white', color: lang === 'ar' ? 'white' : 'var(--text-muted)', fontFamily: 'var(--font-sans)', transition: 'all 0.15s' }}>AR</button>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="survey-progress-wrap" style={{ background: 'white', borderRadius: 8, padding: '10px 16px', border: '1px solid var(--border)', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
              {lang === 'ar' ? `القسم ${currentSection + 1} من ${totalSections}` : `Section ${currentSection + 1} of ${totalSections}`}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>{progress}%</span>
          </div>
          <div className="survey-progress-bar" style={{ height: 6, background: 'var(--bg-muted)', borderRadius: 3, overflow: 'hidden' }}>
            <div className="survey-progress-fill" style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, var(--primary), var(--accent))', borderRadius: 3, transition: 'width 0.3s ease' }} />
          </div>
        </div>
      </div>

      {/* Section content */}
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {currentSectionData && (
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
            {/* Section header */}
            <div style={{ background: 'linear-gradient(90deg, var(--primary), var(--primary-light))', padding: '20px 28px', color: 'white' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: 4 }}>
                {lang === 'ar'
                  ? `القسم ${currentSection + 1}: ${currentSectionData.title_ar || currentSectionData.title_en}`
                  : `Section ${currentSection + 1}: ${currentSectionData.title_en}`
                }
              </h3>
              {(currentSectionData.description_en || currentSectionData.description_ar) && (
                <p style={{ fontSize: 13, opacity: 0.75, margin: 0 }}>
                  {t(currentSectionData.description_en, currentSectionData.description_ar)}
                </p>
              )}
            </div>

            {/* Questions */}
            <div style={{ padding: '24px 28px' }}>
              {sectionQuestions.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: 20 }}>
                  {lang === 'ar' ? 'لا توجد أسئلة في هذا القسم.' : 'No questions in this section.'}
                </p>
              ) : (
                sectionQuestions.map(renderQuestion)
              )}
            </div>

            {/* Navigation */}
            <div style={{ padding: '16px 28px 24px', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <button
                onClick={handlePrev}
                disabled={currentSection === 0}
                className="btn btn-outline"
                style={{ opacity: currentSection === 0 ? 0.4 : 1 }}
              >
                {lang === 'ar' ? '← السابق' : '← Previous'}
              </button>

              {currentSection < totalSections - 1 ? (
                <button onClick={handleNext} className="btn btn-primary">
                  {lang === 'ar' ? 'التالي →' : 'Next →'}
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={submitting} className="btn btn-accent" style={{ minWidth: 140 }}>
                  {submitting
                    ? (lang === 'ar' ? 'جارٍ الإرسال...' : 'Submitting...')
                    : (lang === 'ar' ? 'إرسال ✓' : 'Submit ✓')}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Footer branding */}
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Powered by <strong style={{ color: 'var(--primary)' }}>MedResearch Academy</strong> | medresearch-academy.om</p>
        </div>
      </div>
    </div>
  );
}
