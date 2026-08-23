import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { fetchStudyId, generateVisitSchedule } from '../../../lib/thalassemia';

export default function ThalassemiaPatientNew() {
  const nav = useNavigate();
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({
    patient_code: '',
    mrn: '',
    full_name: '',
    enrollment_date: new Date().toISOString().slice(0, 10),
    age_at_enrollment: '',
    sex: '',
    bmi: '',
    diagnosis: '',
    age_at_diagnosis: '',
    transfusion_frequency: '',
    chelation_therapy: '',
  });

  const set = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setSaving(true);
    try {
      const studyId = await fetchStudyId();
      if (!studyId) throw new Error('Study not found');

      // Insert patient (pseudonymized data — patient_code is the study ID)
      const { data: patient, error: pErr } = await supabase
        .from('thalassemia_patients')
        .insert({
          study_id: studyId,
          patient_code: form.patient_code.trim(),
          enrollment_date: form.enrollment_date,
          age_at_enrollment: form.age_at_enrollment ? Number(form.age_at_enrollment) : null,
          sex: form.sex === '' ? null : Number(form.sex),
          bmi: form.bmi ? Number(form.bmi) : null,
          diagnosis: form.diagnosis || null,
          age_at_diagnosis: form.age_at_diagnosis ? Number(form.age_at_diagnosis) : null,
          transfusion_frequency: form.transfusion_frequency || null,
          chelation_therapy: form.chelation_therapy || null,
          status: 'active',
        })
        .select()
        .single();
      if (pErr) throw pErr;

      // Insert identifiers (restricted table — only PI/Co-PI can access)
      if (form.mrn.trim() && form.full_name.trim()) {
        const { error: iErr } = await supabase
          .from('thalassemia_patient_identifiers')
          .insert({
            patient_id: patient.id,
            study_id: studyId,
            mrn: form.mrn.trim(),
            full_name: form.full_name.trim(),
          });
        if (iErr) {
          // Non-fatal — user may not have identifier permissions
          console.warn('Could not save identifiers:', iErr.message);
        }
      }

      // Generate baseline / 6mo / 12mo visit schedule
      const schedule = generateVisitSchedule(form.enrollment_date);
      const visitRows = schedule.map(v => ({
        patient_id: patient.id,
        study_id: studyId,
        timepoint: v.timepoint,
        expected_date: v.expected_date,
        window_start: v.window_start,
        window_end: v.window_end,
      }));
      await supabase.from('thalassemia_visit_schedule').insert(visitRows);

      nav(`/dashboard/thalassemia/patients/${patient.id}`);
    } catch (e: any) {
      setErr(e.message ?? String(e));
      setSaving(false);
    }
  }

  return (
    <div style={{padding:'28px',maxWidth:720}}>
      <h1 style={{margin:'0 0 6px',color:'var(--primary)',fontFamily:'var(--font-serif)'}}>Enroll New Patient</h1>
      <p style={{color:'var(--text-muted)',margin:'0 0 24px',fontSize:14}}>
        Only <strong>Patient Code</strong> is required. Baseline / 6mo / 12mo visits will be auto-scheduled.
      </p>

      {err && (
        <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid #fecaca',color:'#dc2626',padding:14,borderRadius:8,marginBottom:16}}>
          {err}
        </div>
      )}

      <form onSubmit={onSubmit} style={{background:'white',border:'1px solid var(--border)',borderRadius:12,padding:24,display:'grid',gap:16}}>
        <Group title="Identification">
          <Field label="Patient Code (study pseudonym)" required>
            <input required value={form.patient_code} onChange={e => set('patient_code', e.target.value)} placeholder="TDT-001" style={inputSt} />
          </Field>
          <Row2>
            <Field label="MRN (identifier — PI/Co-PI only)"><input value={form.mrn} onChange={e => set('mrn', e.target.value)} style={inputSt} /></Field>
            <Field label="Full Name (identifier)"><input value={form.full_name} onChange={e => set('full_name', e.target.value)} style={inputSt} /></Field>
          </Row2>
        </Group>

        <Group title="Enrollment">
          <Row2>
            <Field label="Enrollment Date" required>
              <input required type="date" value={form.enrollment_date} onChange={e => set('enrollment_date', e.target.value)} style={inputSt} />
            </Field>
            <Field label="Age at Enrollment">
              <input type="number" min={18} max={120} value={form.age_at_enrollment} onChange={e => set('age_at_enrollment', e.target.value)} style={inputSt} />
            </Field>
          </Row2>
          <Row2>
            <Field label="Sex">
              <select value={form.sex} onChange={e => set('sex', e.target.value)} style={inputSt}>
                <option value="">—</option>
                <option value="0">Female</option>
                <option value="1">Male</option>
              </select>
            </Field>
            <Field label="BMI">
              <input type="number" step="0.1" value={form.bmi} onChange={e => set('bmi', e.target.value)} style={inputSt} />
            </Field>
          </Row2>
        </Group>

        <Group title="Diagnosis">
          <Row2>
            <Field label="Type">
              <select value={form.diagnosis} onChange={e => set('diagnosis', e.target.value)} style={inputSt}>
                <option value="">—</option>
                <option value="major">Thalassemia Major</option>
                <option value="intermedia">Thalassemia Intermedia</option>
              </select>
            </Field>
            <Field label="Age at Diagnosis">
              <input type="number" value={form.age_at_diagnosis} onChange={e => set('age_at_diagnosis', e.target.value)} style={inputSt} />
            </Field>
          </Row2>
          <Row2>
            <Field label="Transfusion Frequency">
              <input placeholder="e.g. every 3-4 weeks" value={form.transfusion_frequency} onChange={e => set('transfusion_frequency', e.target.value)} style={inputSt} />
            </Field>
            <Field label="Chelation Therapy">
              <input placeholder="e.g. deferasirox 1000mg" value={form.chelation_therapy} onChange={e => set('chelation_therapy', e.target.value)} style={inputSt} />
            </Field>
          </Row2>
        </Group>

        <div style={{display:'flex',gap:10,marginTop:8}}>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Saving…' : 'Enroll & Continue'}
          </button>
          <button type="button" onClick={() => nav('/dashboard/thalassemia/patients')} className="btn btn-outline">Cancel</button>
        </div>
      </form>
    </div>
  );
}

const inputSt: React.CSSProperties = {
  width:'100%',padding:'8px 12px',border:'1px solid var(--border)',borderRadius:8,fontSize:14,background:'white',
};

const Group = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h3 style={{margin:'0 0 12px',fontSize:'0.9rem',color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em'}}>{title}</h3>
    <div style={{display:'grid',gap:12}}>{children}</div>
  </div>
);

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <label style={{display:'block'}}>
    <div style={{fontSize:12,marginBottom:4,color:'var(--text)'}}>{label} {required && <span style={{color:'#dc2626'}}>*</span>}</div>
    {children}
  </label>
);

const Row2 = ({ children }: { children: React.ReactNode }) => (
  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>{children}</div>
);
