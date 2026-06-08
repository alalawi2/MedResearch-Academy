import Layout from '../components/Layout';
import SurveyCard, { SurveyCardData } from '../components/SurveyCard';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Surveys() {
  const [surveys, setSurveys] = useState<SurveyCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabaseConfigured) { setLoading(false); return; }
    (async () => {
      const { data, error } = await supabase
        .from('surveys')
        .select('id,title_en,title_ar,description_en,description_ar,researcher_name,institution,language,estimated_minutes,response_count,ethics_approved,ethics_reference')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50);
      if (!error && data) setSurveys(data as SurveyCardData[]);
      setLoading(false);
    })();
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg,var(--primary) 0%,#0f2847 100%)', color: 'white', padding: '80px 0', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'radial-gradient(circle,white 1px,transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(200,151,42,0.2)', border: '1px solid rgba(200,151,42,0.4)', borderRadius: 50, padding: '6px 20px', fontSize: 13, marginBottom: 24 }}>
            <span style={{ fontSize: 16 }}>📋</span>
            Research Surveys
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem,5vw,3rem)', marginBottom: 16, fontFamily: 'var(--font-serif)' }}>
            Research Survey Platform
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', maxWidth: 620, margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.7 }}>
            Participate in medical research surveys from institutions across the region. Your responses help advance evidence-based healthcare and medical education.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 620, margin: '12px auto 0', fontSize: '0.95rem', direction: 'rtl' }}>
            شارك في استبيانات البحث الطبي من مؤسسات المنطقة. إجاباتك تساهم في تطوير الرعاية الصحية والتعليم الطبي.
          </p>
        </div>
      </section>

      {/* Survey listing */}
      <section className="section">
        <div className="container" style={{ maxWidth: 1200 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>...</div>
              <p style={{ color: 'var(--text-muted)' }}>Loading surveys...</p>
            </div>
          ) : surveys.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
              <h3 style={{ color: 'var(--primary)', marginBottom: 8, fontFamily: 'var(--font-serif)' }}>No Active Surveys</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 400, margin: '0 auto' }}>
                There are no surveys currently accepting responses. Check back soon or submit your own research survey below.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(380px,1fr))', gap: 28, marginBottom: 56 }}>
              {surveys.map(s => <SurveyCard key={s.id} survey={s} />)}
            </div>
          )}

          {/* CTA: Submit your survey */}
          <div style={{ background: 'var(--bg-muted)', borderRadius: 16, padding: 40, textAlign: 'center', border: '1px solid var(--border)', marginTop: 24 }}>
            <div style={{ fontSize: 38, marginBottom: 12 }}>🔬</div>
            <h3 style={{ fontSize: '1.35rem', color: 'var(--primary)', marginBottom: 10, fontFamily: 'var(--font-serif)' }}>
              Submit Your Research Survey
            </h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto 8px', fontSize: 14, lineHeight: 1.7 }}>
              Are you a researcher looking to distribute a survey? Submit your survey through our platform and reach healthcare professionals and trainees across the region.
            </p>
            <p style={{ color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto 24px', fontSize: 13, lineHeight: 1.7, direction: 'rtl' }}>
              هل أنت باحث تبحث عن توزيع استبيان؟ أرسل استبيانك عبر منصتنا للوصول إلى المتخصصين في الرعاية الصحية.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
              <Link to="/surveys/submit" className="btn btn-primary">Submit a Survey →</Link>
              <Link to="/contact" className="btn btn-outline">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
