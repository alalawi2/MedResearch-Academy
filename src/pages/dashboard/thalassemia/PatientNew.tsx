import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { CHELATORS, parseChelation, serializeChelation, ChelationDrug } from '../../../lib/thalassemia-chelation';
import {
  fetchStudyId, generateVisitSchedule, fetchPatient, fetchIdentifiers,
  updatePatient, updateIdentifiers,
} from '../../../lib/thalassemia';

export default function ThalassemiaPatientNew() {
  const { getRoleForStudy } = useAuth();
  const canIdentify = ['super_admin', 'research_admin'].includes(getRoleForStudy('thalassemia-cardiac') ?? '');
  const [chelation, setChelation] = useState<ChelationDrug[]>([]);
  const [recordReady, setRecordReady] = useState(false);
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
    date_of_birth: '',
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
        if (!ident?.mrn) throw new Error('Patient MRN is unavailable. Editing is blocked until identity can be confirmed.');
        setChelation(parseChelation(patient.chelation_therapy ?? ''));
        setRecordReady(true);
        setForm({
          patient_code: patient.patient_code ?? '',
          mrn: ident?.mrn ?? '',
          full_name: ident?.full_name ?? '',
          date_of_birth: ident?.date_of_birth ?? '',
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
          splenectomy_done: patient.splenectomy ?? false,
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
    if (!canIdentify || (isEdit && !recordReady)) return;
    setErr('');
    setSaving(true);
    try {
      const patientPayload = {
        patient_code: form.patient_code.trim() || `TDT-${crypto.randomUUID()}`,
        enrollment_date: form.enrollment_date,
        age_at_enrollment: form.age_at_enrollment ? Number(form.age_at_enrollment) : null,
        sex: form.sex === '' ? null : Number(form.sex) as 0 | 1 | null,
        bmi: form.bmi ? Number(form.bmi) : null,
        diagnosis: (form.diagnosis || null) as 'major' | 'intermedia' | null,
        age_at_diagnosis: form.age_at_diagnosis ? Number(form.age_at_diagnosis) : null,
        transfusion_frequency: form.transfusion_frequency || null,
        chelation_therapy: serializeChelation(chelation) || null,
      };

      const { data: savedId, error } = await supabase.rpc('save_thalassemia_patient', {
        existing_id: editId ?? null,
        patient_data: { ...patientPayload, ...(isEdit ? {
          heart_failure: form.heart_failure, af: form.af, vt: form.vt,
          pacs: form.pacs, pvcs: form.pvcs, pericarditis: form.pericarditis,
          myocarditis: form.myocarditis, pulmonary_hypertension: form.pulmonary_hypertension,
          dm: form.dm, liver_disease: form.liver_disease, stroke: form.stroke,
          hypothyroidism: form.hypothyroidism, kidney_disease: form.kidney_disease,
          splenectomy: form.splenectomy_done, notes: form.notes || null,
        } : {}) },
        identifier_data: { mrn: form.mrn.trim(), full_name: form.full_name.trim(), date_of_birth: form.date_of_birth || null },
        visits: generateVisitSchedule(form.enrollment_date),
      });
      if (error) throw error;
      if (!savedId) throw new Error('The patient save was not confirmed.');
      nav(`/dashboard/thalassemia/patients/${savedId}`);
    } catch (e: any) {
      setErr(e.message ?? String(e));
      setSaving(false);
    }
  }

  if (loading) return <div style={{padding:40,textAlign:'center',color:'var(--text-muted)'}}>Loading...</div>;
  if (!canIdentify || (isEdit && !recordReady)) return <div role="alert" style={{padding:40}}>{err || 'Enrollment and demographic editing require authorized study administrator access to patient identifiers.'} <button onClick={() => nav(-1)}>Back</button></div>;

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
          : <>Identify the patient by <strong>MRN</strong>. Baseline / 6mo / 12mo visits will be auto-scheduled.</>
        }
      </p>

      {err && (
        <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid #fecaca',color:'#dc2626',padding:14,borderRadius:8,marginBottom:16}}>
          {err}
        </div>
      )}

      <form onSubmit={onSubmit} style={{background:'white',border:'1px solid var(--border)',borderRadius:12,padding:24,display:'grid',gap:16}}>
        <Group title="Identification">
          <Row2>
            <Field label="Patient MRN" required><input required value={form.mrn} onChange={e => set('mrn', e.target.value)} style={inputSt} /></Field>
            <Field label="Full Name (identifier)"><input value={form.full_name} onChange={e => set('full_name', e.target.value)} style={inputSt} /></Field>
          </Row2>
        </Group>

        <Group title="Enrollment">
          <Field label="Date of birth"><input type="date" max={form.enrollment_date} value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} style={inputSt} /></Field>
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
              <div>Select all prescribed chelators:</div>
              {CHELATORS.map(drug => <label key={drug} style={{display:'block'}}><input type="checkbox" checked={chelation.some(item => item.drug === drug)} onChange={e => setChelation(items => e.target.checked ? [...items, {drug, dose:''}] : items.filter(item => item.drug !== drug))} /> {drug}</label>)}
              {chelation.map((item, index) => <div key={`${item.drug}-${index}`}><label>{item.drug} dose and frequency<input aria-label={`${item.drug} dose and frequency`} value={item.dose} onChange={e => setChelation(items => items.map((entry, i) => i === index ? {...entry, dose:e.target.value.replace(/;/g, ',')} : entry))} style={inputSt} /></label>{!CHELATORS.includes(item.drug) && <button type="button" onClick={() => setChelation(items => items.filter((_, i) => i !== index))}>Remove legacy entry</button>}</div>)}
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
