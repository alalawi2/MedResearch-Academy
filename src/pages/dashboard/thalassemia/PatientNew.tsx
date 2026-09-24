import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import {
  fetchStudyId, generateVisitSchedule, fetchPatient, fetchIdentifiers,
  updatePatient, updateIdentifiers,
} from '../../../lib/thalassemia';

export default function ThalassemiaPatientNew() {
  const nav = useNavigate();
  const { id: editId } = useParams();
  const isEdit = !!editId;
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
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
    // Complications (edit only)
    heart_failure: false,
    af: false,
    vt: false,
    pacs: false,
    pvcs: false,
    pericarditis: false,
    myocarditis: false,
    pulmonary_hypertension: false,
    dm: false,
    liver_disease: false,
    stroke: false,
    hypothyroidism: false,
    kidney_disease: false,
    splenectomy_done: false,
    notes: '',
  });

  // Load existing data when editing
  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        const [patient, ident] = await Promise.all([
          fetchPatient(editId),
          fetchIdentifiers(editId),
        ]);
        if (!patient) { setErr('Patient not found'); setLoading(false); return; }
        setForm({
          patient_code: patient.patient_code ?? '',
          mrn: ident?.mrn ?? '',
          full_name: ident?.full_name ?? '',
          enrollment_date: patient.enrollment_date ?? new Date().toISOString().slice(0, 10),
          age_at_enrollment: patient.age_at_enrollment?.toString() ?? '',
          sex: patient.sex != null ? String(patient.sex) : '',
          bmi: patient.bmi?.toString() ?? '',
          diagnosis: patient.diagnosis ?? '',
          age_at_diagnosis: patient.age_at_diagnosis?.toString() ?? '',
          transfusion_frequency: patient.transfusion_frequency ?? '',
          chelation_therapy: patient.chelation_therapy ?? '',
          heart_failure: patient.heart_failure ?? false,
          af: patient.af ?? false,
          vt: patient.vt ?? false,
          pacs: patient.pacs ?? false,
          pvcs: patient.pvcs ?? false,
          pericarditis: patient.pericarditis ?? false,
          myocarditis: patient.myocarditis ?? false,
          pulmonary_hypertension: patient.pulmonary_hypertension ?? false,
          dm: patient.dm ?? false,
          liver_disease: patient.liver_disease ?? false,
          stroke: patient.stroke ?? false,
          hypothyroidism: patient.hypothyroidism ?? false,
          kidney_disease: patient.kidney_disease ?? false,
          splenectomy_done: patient.splenectomy_done ?? false,
          notes: patient.notes ?? '',
        });
      } catch (e: any) {
        setErr(e.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [editId]);

  const set = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setSaving(true);
    try {
      const patientPayload = {
        patient_code: form.patient_code.trim(),
        enrollment_date: form.enrollment_date,
        age_at_enrollment: form.age_at_enrollment ? Number(form.age_at_enrollment) : null,
        sex: form.sex === '' ? null : Number(form.sex) as 0 | 1 | null,
        bmi: form.bmi ? Number(form.bmi) : null,
        diagnosis: (form.diagnosis || null) as 'major' | 'intermedia' | null,
        age_at_diagnosis: form.age_at_diagnosis ? Number(form.age_at_diagnosis) : null,
        transfusion_frequency: form.transfusion_frequency || null,
        chelation_therapy: form.chelation_therapy || null,
      };

      if (isEdit && editId) {
        // Update patient demographics
        await updatePatient(editId, {
          ...patientPayload,
          heart_failure: form.heart_failure,
          af: form.af,
          vt: form.vt,
          pacs: form.pacs,
          pvcs: form.pvcs,
          pericarditis: form.pericarditis,
          myocarditis: form.myocarditis,
          pulmonary_hypertension: form.pulmonary_hypertension,
          dm: form.dm,
          liver_disease: form.liver_disease,
          stroke: form.stroke,
          hypothyroidism: form.hypothyroidism,
          kidney_disease: form.kidney_disease,
          splenectomy_done: form.splenectomy_done,
          notes: form.notes || null,
        });

        // Update identifiers if provided
        if (form.mrn.trim() || form.full_name.trim()) {
          try {
            await updateIdentifiers(editId, {
              mrn: form.mrn.trim(),
              full_name: form.full_name.trim(),
            });
          } catch {
            console.warn('Could not update identifiers — may lack permissions');
          }
        }

        nav(`/dashboard/thalassemia/patients/${editId}`);
      } else {
        // Create new patient
        const studyId = await fetchStudyId();
        if (!studyId) throw new Error('Study not found');

        const { data: patient, error: pErr } = await supabase
          .from('thalassemia_patients')
          .insert({ study_id: studyId, ...patientPayload, status: 'active' })
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
      }
    } catch (e: any) {
      setErr(e.message ?? String(e));
      setSaving(false);
    }
  }

  if (loading) return <div style={{padding:40,textAlign:'center',color:'var(--text-muted)'}}>Loading...</div>;

  const complications = [
    { k: 'heart_failure', l: 'Heart Failure' },
    { k: 'af', l: 'Atrial Fibrillation' },
    { k: 'vt', l: 'Ventricular Tachycardia' },
    { k: 'pacs', l: 'PACs' },
    { k: 'pvcs', l: 'PVCs' },
    { k: 'pericarditis', l: 'Pericarditis' },
    { k: 'myocarditis', l: 'Myocarditis' },
    { k: 'pulmonary_hypertension', l: 'Pulmonary Hypertension' },
    { k: 'dm', l: 'Diabetes Mellitus' },
    { k: 'liver_disease', l: 'Liver Disease' },
    { k: 'stroke', l: 'Stroke' },
    { k: 'hypothyroidism', l: 'Hypothyroidism' },
    { k: 'kidney_disease', l: 'Kidney Disease' },
    { k: 'splenectomy_done', l: 'Splenectomy Done' },
  ] as const;

  return (
    <div style={{padding:'28px',maxWidth:720}}>
      {isEdit && (
        <button onClick={() => nav(`/dashboard/thalassemia/patients/${editId}`)} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',fontSize:13,marginBottom:8}}>
          ← Back to patient
        </button>
      )}
      <h1 style={{margin:'0 0 6px',color:'var(--primary)',fontFamily:'var(--font-serif)'}}>
        {isEdit ? 'Edit Demographics' : 'Enroll New Patient'}
      </h1>
      <p style={{color:'var(--text-muted)',margin:'0 0 24px',fontSize:14}}>
        {isEdit
          ? 'Update patient demographics, clinical history, and complications.'
          : <>Only <strong>Patient Code</strong> is required. Baseline / 6mo / 12mo visits will be auto-scheduled.</>
        }
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

        {isEdit && (
          <>
            <Group title="Cardiac & Other Complications">
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:8}}>
                {complications.map(c => (
                  <label key={c.k} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 0',fontSize:13,cursor:'pointer'}}>
                    <input
                      type="checkbox"
                      checked={(form as any)[c.k] ?? false}
                      onChange={e => setForm(prev => ({ ...prev, [c.k]: e.target.checked }))}
                    />
                    {c.l}
                  </label>
                ))}
              </div>
            </Group>

            <Group title="Notes">
              <textarea
                value={form.notes}
                onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                placeholder="Clinical notes..."
                style={{...inputSt, fontFamily:'inherit', resize:'vertical'}}
              />
            </Group>
          </>
        )}

        <div style={{display:'flex',gap:10,marginTop:8}}>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Enroll & Continue'}
          </button>
          <button
            type="button"
            onClick={() => nav(isEdit ? `/dashboard/thalassemia/patients/${editId}` : '/dashboard/thalassemia/patients')}
            className="btn btn-outline"
          >
            Cancel
          </button>
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
