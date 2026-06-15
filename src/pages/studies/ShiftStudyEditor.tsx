import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, supabaseConfigured } from '../../lib/supabase';
import Layout from '../../components/Layout';

interface ConfigRow { key: string; value: string; }

const CONFIG_KEYS = [
  { key: 'testmybrain_pre_url', label: 'Pre-Shift Cognitive Assessment URL', type: 'url' as const, help: 'The link participants click before their shift to take the cognitive assessment' },
  { key: 'testmybrain_post_url', label: 'Post-Shift Cognitive Assessment URL', type: 'url' as const, help: 'The link participants click after their shift to take the cognitive assessment' },
  { key: 'pre_shift_instructions', label: 'Pre-Shift Instructions', type: 'textarea' as const, help: 'One instruction per line. Shown as bullet points before the cognitive assessment.' },
  { key: 'post_shift_instructions', label: 'Post-Shift Instructions', type: 'textarea' as const, help: 'One instruction per line. Shown as bullet points after the shift.' },
];

export default function ShiftStudyEditor() {
  const navigate = useNavigate();
  const [participant, setParticipant] = useState<{ id: string; role: string; full_name: string } | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [original, setOriginal] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('shift_study_participant');
    if (!stored) { navigate('/active-research/cognitive-shifts/login'); return; }
    const p = JSON.parse(stored);
    if (p.role !== 'investigator') { navigate('/active-research/cognitive-shifts/dashboard'); return; }
    setParticipant(p);

    if (!supabaseConfigured) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase.from('shift_study_config').select('key,value').limit(20);
      if (data) {
        const map: Record<string, string> = {};
        (data as ConfigRow[]).forEach(r => { map[r.key] = r.value; });
        setValues(map);
        setOriginal(map);
      }
      setLoading(false);
    })();
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    for (const cfg of CONFIG_KEYS) {
      if (values[cfg.key] !== original[cfg.key]) {
        const r = await fetch('/api/shift-study-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'update_config', participant_id: participant?.id, key: cfg.key, value: values[cfg.key] }),
        });
        if (!r.ok) {
          const err = await r.json();
          alert(err.error || 'Failed to save');
          setSaving(false);
          return;
        }
      }
    }
    setOriginal({ ...values });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const hasChanges = CONFIG_KEYS.some(c => values[c.key] !== original[c.key]);

  if (!participant) return null;

  return (
    <Layout>
      <section className="section" style={{ minHeight: '70vh' }}>
        <div className="container" style={{ maxWidth: 700 }}>
          <div style={{ marginBottom: 16 }}>
            <Link to="/active-research/cognitive-shifts/investigator" style={{ color: 'var(--primary)', fontSize: 14, textDecoration: 'none', fontFamily: 'var(--font-sans)' }}>
              &larr; Back to Investigator Dashboard
            </Link>
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text)', fontSize: 24, marginBottom: 6 }}>
            Study Settings
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, fontFamily: 'var(--font-sans)', marginBottom: 28 }}>
            Edit the cognitive assessment link and participant instructions. Changes take effect immediately.
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading...</div>
          ) : (
            <>
              {CONFIG_KEYS.map(cfg => (
                <div key={cfg.key} style={{ marginBottom: 24, background: '#fff', borderRadius: 12, border: '1px solid var(--border)', padding: '20px 24px' }}>
                  <label style={{ display: 'block', fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 6, fontFamily: 'var(--font-sans)' }}>
                    {cfg.label}
                  </label>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10, fontFamily: 'var(--font-sans)' }}>
                    {cfg.help}
                  </p>
                  {cfg.type === 'url' ? (
                    <input
                      type="url"
                      value={values[cfg.key] || ''}
                      onChange={e => setValues(prev => ({ ...prev, [cfg.key]: e.target.value }))}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)',
                        fontSize: 15, fontFamily: 'var(--font-sans)', color: 'var(--text)', outline: 'none', boxSizing: 'border-box',
                      }}
                      placeholder="https://www.testmybrain.org/..."
                    />
                  ) : (
                    <textarea
                      value={values[cfg.key] || ''}
                      onChange={e => setValues(prev => ({ ...prev, [cfg.key]: e.target.value }))}
                      rows={8}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)',
                        fontSize: 14, fontFamily: 'var(--font-sans)', color: 'var(--text)', outline: 'none',
                        boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.7,
                      }}
                      placeholder="One instruction per line..."
                    />
                  )}

                  {/* Preview for textarea */}
                  {cfg.type === 'textarea' && values[cfg.key] && (
                    <div style={{ marginTop: 12, background: '#f8fafc', borderRadius: 8, padding: '12px 16px', border: '1px solid #e2e8f0' }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8, fontFamily: 'var(--font-sans)' }}>Preview:</p>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.8, color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>
                        {values[cfg.key].split('\n').filter(Boolean).map((line, i) => (
                          <li key={i}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}

              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || saving}
                  className="btn btn-primary"
                  style={{ padding: '12px 32px', fontSize: 15, borderRadius: 10, opacity: !hasChanges ? 0.5 : 1 }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                {saved && (
                  <span style={{ color: '#15803d', fontSize: 14, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                    Saved successfully
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
