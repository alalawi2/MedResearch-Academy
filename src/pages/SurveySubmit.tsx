import Layout from '../components/Layout';
import { useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';

interface QuestionDraft {
  key: string;
  question_en: string;
  question_ar: string;
  type: 'radio' | 'checkbox' | 'likert' | 'text' | 'number' | 'dropdown';
  options_en: string[];
  options_ar: string[];
  required: boolean;
}

interface SectionDraft {
  key: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  questions: QuestionDraft[];
}

const QUESTION_TYPES = [
  { value: 'radio', label: 'Single Choice (Radio)' },
  { value: 'checkbox', label: 'Multiple Choice (Checkbox)' },
  { value: 'likert', label: 'Likert Scale (1-5)' },
  { value: 'text', label: 'Free Text' },
  { value: 'number', label: 'Number' },
  { value: 'dropdown', label: 'Dropdown' },
];

let keyCounter = 0;
const newKey = () => `k_${++keyCounter}_${Date.now()}`;

const emptyQuestion = (): QuestionDraft => ({
  key: newKey(),
  question_en: '',
  question_ar: '',
  type: 'radio',
  options_en: ['', ''],
  options_ar: ['', ''],
  required: true,
});

const emptySection = (): SectionDraft => ({
  key: newKey(),
  title_en: '',
  title_ar: '',
  description_en: '',
  description_ar: '',
  questions: [emptyQuestion()],
});

export default function SurveySubmit() {
  const [form, setForm] = useState({
    title_en: '',
    title_ar: '',
    description_en: '',
    description_ar: '',
    researcher_name: '',
    researcher_email: '',
    institution: '',
    language: 'both' as 'en' | 'ar' | 'both',
    estimated_minutes: 10,
    ethics_approved: false,
    ethics_reference: '',
  });

  const [sections, setSections] = useState<SectionDraft[]>([emptySection()]);
  const [preview, setPreview] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle');

  const updateForm = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const updateSection = (sIdx: number, field: string, value: any) => {
    setSections(prev => prev.map((s, i) => i === sIdx ? { ...s, [field]: value } : s));
  };

  const addSection = () => setSections(prev => [...prev, emptySection()]);
  const removeSection = (sIdx: number) => setSections(prev => prev.filter((_, i) => i !== sIdx));

  const updateQuestion = (sIdx: number, qIdx: number, field: string, value: any) => {
    setSections(prev => prev.map((s, si) =>
      si === sIdx ? { ...s, questions: s.questions.map((q, qi) => qi === qIdx ? { ...q, [field]: value } : q) } : s
    ));
  };

  const addQuestion = (sIdx: number) => {
    setSections(prev => prev.map((s, i) => i === sIdx ? { ...s, questions: [...s.questions, emptyQuestion()] } : s));
  };

  const removeQuestion = (sIdx: number, qIdx: number) => {
    setSections(prev => prev.map((s, i) => i === sIdx ? { ...s, questions: s.questions.filter((_, qi) => qi !== qIdx) } : s));
  };

  const updateOption = (sIdx: number, qIdx: number, oIdx: number, lang: 'en' | 'ar', value: string) => {
    setSections(prev => prev.map((s, si) =>
      si === sIdx
        ? {
            ...s,
            questions: s.questions.map((q, qi) =>
              qi === qIdx
                ? {
                    ...q,
                    [lang === 'en' ? 'options_en' : 'options_ar']:
                      (lang === 'en' ? q.options_en : q.options_ar).map((o, oi) => oi === oIdx ? value : o)
                  }
                : q
            ),
          }
        : s
    ));
  };

  const addOption = (sIdx: number, qIdx: number) => {
    setSections(prev => prev.map((s, si) =>
      si === sIdx
        ? {
            ...s,
            questions: s.questions.map((q, qi) =>
              qi === qIdx ? { ...q, options_en: [...q.options_en, ''], options_ar: [...q.options_ar, ''] } : q
            ),
          }
        : s
    ));
  };

  const removeOption = (sIdx: number, qIdx: number, oIdx: number) => {
    setSections(prev => prev.map((s, si) =>
      si === sIdx
        ? {
            ...s,
            questions: s.questions.map((q, qi) =>
              qi === qIdx
                ? { ...q, options_en: q.options_en.filter((_, oi) => oi !== oIdx), options_ar: q.options_ar.filter((_, oi) => oi !== oIdx) }
                : q
            ),
          }
        : s
    ));
  };

  const handleSubmit = async () => {
    if (!supabaseConfigured) return;
    if (!form.title_en || !form.researcher_name || !form.researcher_email) return;
    setStatus('submitting');

    try {
      // 1. Insert survey
      const { data: surveyData, error: surveyErr } = await supabase
        .from('surveys')
        .insert({
          title_en: form.title_en,
          title_ar: form.title_ar || null,
          description_en: form.description_en || null,
          description_ar: form.description_ar || null,
          researcher_name: form.researcher_name,
          researcher_email: form.researcher_email,
          institution: form.institution || null,
          language: form.language,
          estimated_minutes: form.estimated_minutes,
          ethics_approved: form.ethics_approved,
          ethics_reference: form.ethics_reference || null,
          status: 'draft',
        })
        .select('id')
        .single();

      if (surveyErr || !surveyData) throw surveyErr;
      const surveyId = surveyData.id;

      // 2. Insert sections
      for (let si = 0; si < sections.length; si++) {
        const sec = sections[si];
        const { data: secData, error: secErr } = await supabase
          .from('survey_sections')
          .insert({
            survey_id: surveyId,
            title_en: sec.title_en || `Section ${si + 1}`,
            title_ar: sec.title_ar || null,
            description_en: sec.description_en || null,
            description_ar: sec.description_ar || null,
            order_num: si,
          })
          .select('id')
          .single();

        if (secErr || !secData) throw secErr;

        // 3. Insert questions
        const questionsToInsert = sec.questions.map((q, qi) => ({
          section_id: secData.id,
          survey_id: surveyId,
          question_en: q.question_en,
          question_ar: q.question_ar || null,
          type: q.type,
          options_en: ['radio', 'checkbox', 'dropdown'].includes(q.type) ? q.options_en.filter(o => o.trim()) : [],
          options_ar: ['radio', 'checkbox', 'dropdown'].includes(q.type) ? q.options_ar.filter(o => o.trim()) : [],
          required: q.required,
          order_num: qi,
        }));

        if (questionsToInsert.length > 0) {
          const { error: qErr } = await supabase.from('survey_questions').insert(questionsToInsert);
          if (qErr) throw qErr;
        }
      }

      setStatus('submitted');
    } catch (err) {
      console.error('Survey submission error:', err);
      setStatus('error');
    }
  };

  const needsOptions = (type: string) => ['radio', 'checkbox', 'dropdown'].includes(type);

  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-sans)' };

  // Submitted state
  if (status === 'submitted') {
    return (
      <Layout>
        <section className="section">
          <div className="container" style={{ maxWidth: 640, textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', marginBottom: 12 }}>Survey Submitted!</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, maxWidth: 480, margin: '0 auto 24px' }}>
              Your survey has been submitted for review. Our team will review it and activate it once approved. You'll receive an email notification at <strong>{form.researcher_email}</strong>.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <a href="/surveys" className="btn btn-primary">Browse Surveys →</a>
              <a href="/contact" className="btn btn-outline">Contact Us</a>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  // Preview mode
  if (preview) {
    return (
      <Layout>
        <section style={{ background: 'linear-gradient(135deg,var(--primary) 0%,#0f2847 100%)', color: 'white', padding: '60px 0', textAlign: 'center' }}>
          <div className="container">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(200,151,42,0.2)', border: '1px solid rgba(200,151,42,0.4)', borderRadius: 50, padding: '6px 20px', fontSize: 13, marginBottom: 16 }}>Preview Mode</div>
            <h1 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontFamily: 'var(--font-serif)', marginBottom: 12 }}>{form.title_en}</h1>
            {form.title_ar && <p style={{ direction: 'rtl', opacity: 0.7, fontSize: 15, marginBottom: 8 }}>{form.title_ar}</p>}
            <p style={{ opacity: 0.6, fontSize: 14 }}>{form.researcher_name} {form.institution ? `| ${form.institution}` : ''}</p>
          </div>
        </section>

        <section className="section">
          <div className="container" style={{ maxWidth: 720 }}>
            {form.description_en && (
              <div style={{ marginBottom: 32, padding: 20, background: 'var(--bg-muted)', borderRadius: 12, borderLeft: '4px solid var(--accent)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7 }}>{form.description_en}</p>
              </div>
            )}

            {sections.map((sec, si) => (
              <div key={sec.key} style={{ marginBottom: 32, background: 'white', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ background: 'linear-gradient(90deg, var(--primary), var(--primary-light))', padding: '16px 24px', color: 'white' }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem' }}>{sec.title_en || `Section ${si + 1}`}</h3>
                  {sec.description_en && <p style={{ fontSize: 13, opacity: 0.7, margin: '4px 0 0' }}>{sec.description_en}</p>}
                </div>
                <div style={{ padding: '20px 24px' }}>
                  {sec.questions.map((q, qi) => (
                    <div key={q.key} style={{ marginBottom: 20, padding: 16, background: 'var(--bg-muted)', borderRadius: 10 }}>
                      <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
                        {qi + 1}. {q.question_en}
                        {q.required && <span style={{ color: '#ef4444', marginLeft: 4 }}>*</span>}
                      </p>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        Type: {QUESTION_TYPES.find(t => t.value === q.type)?.label}
                        {needsOptions(q.type) && ` | Options: ${q.options_en.filter(o => o.trim()).join(', ')}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24 }}>
              <button onClick={() => setPreview(false)} className="btn btn-outline">← Back to Editing</button>
              <button onClick={handleSubmit} disabled={status === 'submitting'} className="btn btn-primary">
                {status === 'submitting' ? 'Submitting...' : 'Submit Survey for Review →'}
              </button>
            </div>

            {status === 'error' && (
              <div style={{ marginTop: 16, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#b91c1c', textAlign: 'center' }}>
                Something went wrong. Please try again or contact us at <a href="mailto:info@medresearch-academy.om" style={{ color: '#b91c1c', fontWeight: 600 }}>info@medresearch-academy.om</a>
              </div>
            )}
          </div>
        </section>
      </Layout>
    );
  }

  // Main form
  return (
    <Layout>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg,var(--primary) 0%,#0f2847 100%)', color: 'white', padding: '80px 0', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(circle,white 1px,transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: 'clamp(1.8rem,5vw,2.8rem)', marginBottom: 16, fontFamily: 'var(--font-serif)' }}>Submit Your Research Survey</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', maxWidth: 560, margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.7 }}>
            Create a bilingual survey and distribute it to healthcare professionals across the region. Your survey will be reviewed and activated by our team.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 800 }}>
          {/* Survey Details */}
          <div style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border)', padding: 36, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontSize: '1.3rem', marginBottom: 24 }}>Survey Details</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Title (English) *</label>
                <input value={form.title_en} onChange={e => updateForm('title_en', e.target.value)} placeholder="Survey title in English" style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>Title (Arabic)</label>
                <input value={form.title_ar} onChange={e => updateForm('title_ar', e.target.value)} placeholder="عنوان الاستبيان بالعربية" style={{ ...inputStyle, direction: 'rtl' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Description (English)</label>
                <textarea value={form.description_en} onChange={e => updateForm('description_en', e.target.value)} placeholder="Brief description of the survey..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div>
                <label style={labelStyle}>Description (Arabic)</label>
                <textarea value={form.description_ar} onChange={e => updateForm('description_ar', e.target.value)} placeholder="وصف مختصر للاستبيان..." rows={3} style={{ ...inputStyle, resize: 'vertical', direction: 'rtl' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Researcher Name *</label>
                <input value={form.researcher_name} onChange={e => updateForm('researcher_name', e.target.value)} placeholder="Dr. Ahmed..." style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>Email *</label>
                <input type="email" value={form.researcher_email} onChange={e => updateForm('researcher_email', e.target.value)} placeholder="researcher@university.edu" style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>Institution</label>
                <input value={form.institution} onChange={e => updateForm('institution', e.target.value)} placeholder="University / Hospital" style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Language</label>
                <select value={form.language} onChange={e => updateForm('language', e.target.value)} style={{ ...inputStyle, background: 'white' }}>
                  <option value="both">English + Arabic</option>
                  <option value="en">English Only</option>
                  <option value="ar">Arabic Only</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Estimated Minutes</label>
                <input type="number" min={1} max={120} value={form.estimated_minutes} onChange={e => updateForm('estimated_minutes', parseInt(e.target.value) || 10)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Ethics Reference</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    <input type="checkbox" checked={form.ethics_approved} onChange={e => updateForm('ethics_approved', e.target.checked)} />
                    Approved
                  </label>
                  <input value={form.ethics_reference} onChange={e => updateForm('ethics_reference', e.target.value)} placeholder="MREC #..." style={{ ...inputStyle, flex: 1 }} />
                </div>
              </div>
            </div>
          </div>

          {/* Sections */}
          {sections.map((sec, si) => (
            <div key={sec.key} style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border)', padding: 36, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontSize: '1.1rem' }}>
                  Section {si + 1}
                </h3>
                {sections.length > 1 && (
                  <button onClick={() => removeSection(si)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                    Remove Section
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Section Title (English)</label>
                  <input value={sec.title_en} onChange={e => updateSection(si, 'title_en', e.target.value)} placeholder="e.g. Demographics" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Section Title (Arabic)</label>
                  <input value={sec.title_ar} onChange={e => updateSection(si, 'title_ar', e.target.value)} placeholder="مثال: المعلومات الديموغرافية" style={{ ...inputStyle, direction: 'rtl' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>Section Description (EN)</label>
                  <input value={sec.description_en} onChange={e => updateSection(si, 'description_en', e.target.value)} placeholder="Optional description..." style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Section Description (AR)</label>
                  <input value={sec.description_ar} onChange={e => updateSection(si, 'description_ar', e.target.value)} placeholder="وصف اختياري..." style={{ ...inputStyle, direction: 'rtl' }} />
                </div>
              </div>

              {/* Questions */}
              {sec.questions.map((q, qi) => (
                <div key={q.key} style={{ background: 'var(--bg-muted)', borderRadius: 12, padding: 20, marginBottom: 16, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>Question {qi + 1}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <input type="checkbox" checked={q.required} onChange={e => updateQuestion(si, qi, 'required', e.target.checked)} />
                        Required
                      </label>
                      {sec.questions.length > 1 && (
                        <button onClick={() => removeQuestion(si, qi)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Remove</button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <input value={q.question_en} onChange={e => updateQuestion(si, qi, 'question_en', e.target.value)} placeholder="Question in English *" style={inputStyle} />
                    <input value={q.question_ar} onChange={e => updateQuestion(si, qi, 'question_ar', e.target.value)} placeholder="السؤال بالعربية" style={{ ...inputStyle, direction: 'rtl' }} />
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label style={labelStyle}>Question Type</label>
                    <select value={q.type} onChange={e => updateQuestion(si, qi, 'type', e.target.value)} style={{ ...inputStyle, maxWidth: 280, background: 'white' }}>
                      {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>

                  {needsOptions(q.type) && (
                    <div>
                      <label style={labelStyle}>Options</label>
                      {q.options_en.map((opt, oi) => (
                        <div key={oi} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                          <input value={opt} onChange={e => updateOption(si, qi, oi, 'en', e.target.value)} placeholder={`Option ${oi + 1} (EN)`} style={{ ...inputStyle, flex: 1 }} />
                          <input value={q.options_ar[oi] || ''} onChange={e => updateOption(si, qi, oi, 'ar', e.target.value)} placeholder={`الخيار ${oi + 1} (AR)`} style={{ ...inputStyle, flex: 1, direction: 'rtl' }} />
                          {q.options_en.length > 2 && (
                            <button onClick={() => removeOption(si, qi, oi)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 16, cursor: 'pointer', fontWeight: 700, flexShrink: 0 }}>x</button>
                          )}
                        </div>
                      ))}
                      <button onClick={() => addOption(si, qi)} className="btn btn-sm btn-outline" style={{ marginTop: 4, fontSize: 12 }}>+ Add Option</button>
                    </div>
                  )}
                </div>
              ))}

              <button onClick={() => addQuestion(si)} className="btn btn-sm btn-outline" style={{ marginTop: 4 }}>
                + Add Question
              </button>
            </div>
          ))}

          <button onClick={addSection} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', marginBottom: 32 }}>
            + Add Section
          </button>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={() => setPreview(true)} className="btn btn-outline btn-lg">Preview Survey</button>
            <button onClick={handleSubmit} disabled={status === 'submitting' || !form.title_en || !form.researcher_name || !form.researcher_email} className="btn btn-primary btn-lg">
              {status === 'submitting' ? 'Submitting...' : 'Submit for Review →'}
            </button>
          </div>

          {status === 'error' && (
            <div style={{ marginTop: 16, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#b91c1c', textAlign: 'center' }}>
              Something went wrong. Please try again or email <a href="mailto:info@medresearch-academy.om" style={{ color: '#b91c1c', fontWeight: 600 }}>info@medresearch-academy.om</a>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
