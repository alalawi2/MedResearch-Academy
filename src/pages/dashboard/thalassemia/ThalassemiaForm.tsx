import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { Timepoint } from '../../../lib/thalassemia';

// ── Field schema types ──────────────────────────────────────────────────────
type FieldType = 'text' | 'number' | 'date' | 'bool' | 'select' | 'textarea';
interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  unit?: string;
  step?: string;
  min?: number;
  max?: number;
  section?: string;
  required?: boolean;
  placeholder?: string;
}

interface ModalitySchema {
  slug: string;                 // URL slug: 'lab', 'ecg', etc.
  label: string;
  table: string;                // Supabase table
  dateField: string;            // primary date column
  hasTimepoint: boolean;
  fields: FieldDef[];
}

// ── Schemas ─────────────────────────────────────────────────────────────────
const SCHEMAS: Record<string, ModalitySchema> = {
  lab: {
    slug: 'lab', label: 'Lab Biomarkers',
    table: 'thalassemia_lab', dateField: 'assessment_date', hasTimepoint: true,
    fields: [
      { key: 'hemoglobin',           label: 'Hemoglobin',        type: 'number', unit: 'g/dL',  step: '0.1', section: 'Iron / Hematology' },
      { key: 'ferritin',             label: 'Ferritin',          type: 'number', unit: 'ng/mL', step: '1',   section: 'Iron / Hematology' },
      { key: 'labile_plasma_iron',   label: 'Labile Plasma Iron (LPI)', type: 'number', unit: 'µmol/L', step: '0.01', section: 'Iron / Hematology' },
      { key: 'mmp_2',                label: 'MMP-2',             type: 'number', unit: 'ng/mL', step: '0.01', section: 'MMP Panel' },
      { key: 'mmp_9',                label: 'MMP-9',             type: 'number', unit: 'ng/mL', step: '0.01', section: 'MMP Panel' },
      { key: 'timp_1',               label: 'TIMP-1',            type: 'number', unit: 'ng/mL', step: '0.01', section: 'MMP Panel' },
      { key: 'galectin_3',           label: 'Galectin-3',        type: 'number', unit: 'ng/mL', step: '0.01', section: 'Cardiac Fibrosis' },
      { key: 'troponin',             label: 'Troponin',          type: 'number', unit: 'ng/mL', step: '0.001', section: 'Cardiac Markers' },
      { key: 'bnp',                  label: 'NT-proBNP',         type: 'number', unit: 'pg/mL', step: '1',   section: 'Cardiac Markers' },
      { key: 'creatinine',           label: 'Creatinine',        type: 'number', unit: 'µmol/L', step: '0.1', section: 'Renal' },
      { key: 'growth_hormone',       label: 'Growth Hormone',    type: 'number', unit: 'ng/mL', step: '0.1', section: 'Endocrine' },
      { key: 'pth',                  label: 'PTH',               type: 'number', unit: 'pmol/L', step: '0.1', section: 'Endocrine' },
      { key: 'calcium',              label: 'Calcium',           type: 'number', unit: 'mmol/L', step: '0.01', section: 'Endocrine' },
      { key: 'tsh',                  label: 'TSH',               type: 'number', unit: 'mIU/L', step: '0.01', section: 'Endocrine' },
      { key: 't4_t3',                label: 'T4 / T3',           type: 'text', section: 'Endocrine' },
      { key: 'fsh_lh',               label: 'FSH / LH',          type: 'text', section: 'Endocrine' },
      { key: 'ast',                  label: 'AST',               type: 'number', unit: 'U/L', step: '1', section: 'Liver' },
      { key: 'alt',                  label: 'ALT',               type: 'number', unit: 'U/L', step: '1', section: 'Liver' },
      { key: 'alp',                  label: 'ALP',               type: 'number', unit: 'U/L', step: '1', section: 'Liver' },
      { key: 'crp',                  label: 'CRP',               type: 'number', unit: 'mg/L', step: '0.1', section: 'Inflammation' },
      { key: 'notes',                label: 'Notes',             type: 'textarea', section: 'Notes' },
    ],
  },

  ecg: {
    slug: 'ecg', label: 'ECG',
    table: 'thalassemia_ecg', dateField: 'assessment_date', hasTimepoint: true,
    fields: [
      { key: 'rate',              label: 'Rate',        type: 'number', unit: 'bpm', step: '1' },
      { key: 'rhythm',            label: 'Rhythm',      type: 'text',   placeholder: 'sinus, AF, etc.' },
      { key: 'pr_ms',             label: 'PR interval', type: 'number', unit: 'ms', step: '1' },
      { key: 'qrs_ms',            label: 'QRS duration', type: 'number', unit: 'ms', step: '1' },
      { key: 'qtc_ms',            label: 'QTc',         type: 'number', unit: 'ms', step: '1' },
      { key: 'qrs_axis',          label: 'QRS axis',    type: 'text' },
      { key: 'qrs_morphology',    label: 'QRS morphology', type: 'text' },
      { key: 'rvh',               label: 'RVH',         type: 'bool' },
      { key: 'lvh',               label: 'LVH',         type: 'bool' },
      { key: 't_wave_abnormality', label: 'T-wave abnormality', type: 'text' },
      { key: 'other_findings',    label: 'Other findings', type: 'textarea' },
    ],
  },

  echo: {
    slug: 'echo', label: 'Echocardiography',
    table: 'thalassemia_echo', dateField: 'assessment_date', hasTimepoint: true,
    fields: [
      { key: 'lvef',                    label: 'LVEF',                type: 'number', unit: '%',    step: '0.1', section: 'Systolic' },
      { key: 'gls_pct',                 label: 'GLS',                 type: 'number', unit: '%',    step: '0.1', section: 'Systolic' },
      { key: 'lvidd_mm',                label: 'LVIDd',               type: 'number', unit: 'mm',   step: '0.1', section: 'LV Dimensions' },
      { key: 'lvids_mm',                label: 'LVIDs',               type: 'number', unit: 'mm',   step: '0.1', section: 'LV Dimensions' },
      { key: 'lvpwd_mm',                label: 'LVPWd',               type: 'number', unit: 'mm',   step: '0.1', section: 'LV Dimensions' },
      { key: 'ivsd_mm',                 label: 'IVSd',                type: 'number', unit: 'mm',   step: '0.1', section: 'LV Dimensions' },
      { key: 'lv_mass_index',           label: 'LV mass index',       type: 'number', unit: 'g/m²', step: '0.1', section: 'LV Dimensions' },
      { key: 'rwt',                     label: 'RWT',                 type: 'number',              step: '0.01', section: 'LV Dimensions' },
      { key: 'lvedv_ml',                label: 'LVEDV',               type: 'number', unit: 'ml',  step: '0.1', section: 'Volumes' },
      { key: 'lvedv_index',             label: 'LVEDV index',         type: 'number', unit: 'ml/m²', step: '0.1', section: 'Volumes' },
      { key: 'lvesv_ml',                label: 'LVESV',               type: 'number', unit: 'ml',  step: '0.1', section: 'Volumes' },
      { key: 'sv_ml',                   label: 'Stroke volume',       type: 'number', unit: 'ml',  step: '0.1', section: 'Volumes' },
      { key: 'co_l_min',                label: 'Cardiac output',      type: 'number', unit: 'L/min', step: '0.1', section: 'Volumes' },
      { key: 'lavi_ml_m2',              label: 'LAVi',                type: 'number', unit: 'ml/m²', step: '0.1', section: 'Left Atrium' },
      { key: 'la_reservoir_strain_pct', label: 'LA reservoir strain', type: 'number', unit: '%',   step: '0.1', section: 'Left Atrium' },
      { key: 'e_e_avg',                 label: 'E/E\' avg',           type: 'number',              step: '0.1', section: 'Diastology' },
      { key: 'medial_e_velocity',       label: 'Medial E velocity',   type: 'number', unit: 'cm/s', step: '0.1', section: 'Diastology' },
      { key: 'lateral_e_velocity',      label: 'Lateral E velocity',  type: 'number', unit: 'cm/s', step: '0.1', section: 'Diastology' },
      { key: 'pulmonary_vein_sd_ratio', label: 'Pulmonary vein S/D',  type: 'number',              step: '0.01', section: 'Diastology' },
      { key: 'rvsp_mmhg',               label: 'RVSP',                type: 'number', unit: 'mmHg', step: '0.1', section: 'Right Ventricle' },
      { key: 'tapse_mm',                label: 'TAPSE',               type: 'number', unit: 'mm',   step: '0.1', section: 'Right Ventricle' },
      { key: 'tdi_s_cm_s',              label: 'TDI S\'',             type: 'number', unit: 'cm/s', step: '0.1', section: 'Right Ventricle' },
      { key: 'fac_pct',                 label: 'FAC',                 type: 'number', unit: '%',    step: '0.1', section: 'Right Ventricle' },
      { key: 'rv_gls_pct',              label: 'RV GLS',              type: 'number', unit: '%',    step: '0.1', section: 'Right Ventricle' },
      { key: 'notes',                   label: 'Notes',               type: 'textarea', section: 'Notes' },
    ],
  },

  t2mri: {
    slug: 't2mri', label: 'Cardiac T2* MRI',
    table: 'thalassemia_t2mri', dateField: 'assessment_date', hasTimepoint: true,
    fields: [
      { key: 'cardiac_t2_star_ms', label: 'Cardiac T2*',   type: 'number', unit: 'ms', step: '0.1', placeholder: '<10 ms = severe MIO' },
      { key: 'liver_t2_star_ms',   label: 'Liver T2*',     type: 'number', unit: 'ms', step: '0.1' },
      { key: 'interpretation',     label: 'Interpretation', type: 'text', placeholder: 'e.g. severe/moderate/mild MIO' },
      { key: 'notes',              label: 'Notes',         type: 'textarea' },
    ],
  },

  polysomnography: {
    slug: 'polysomnography', label: 'Polysomnography (OSA)',
    table: 'thalassemia_polysomnography', dateField: 'study_date', hasTimepoint: false,
    fields: [
      { key: 'tst_minutes',             label: 'Total sleep time',     type: 'number', unit: 'min', step: '0.1', section: 'Sleep' },
      { key: 'sleep_efficiency_pct',    label: 'Sleep efficiency',     type: 'number', unit: '%',   step: '0.1', section: 'Sleep' },
      { key: 'ahi',                     label: 'AHI',                  type: 'number', unit: '/hr', step: '0.1', section: 'Apnea Indices' },
      { key: 'supine_ahi',              label: 'Supine AHI',           type: 'number', unit: '/hr', step: '0.1', section: 'Apnea Indices' },
      { key: 'non_supine_ahi',          label: 'Non-supine AHI',       type: 'number', unit: '/hr', step: '0.1', section: 'Apnea Indices' },
      { key: 'obstructive_apnea_index', label: 'Obstructive apnea idx', type: 'number', unit: '/hr', step: '0.1', section: 'Apnea Indices' },
      { key: 'central_apnea_index',     label: 'Central apnea index',  type: 'number', unit: '/hr', step: '0.1', section: 'Apnea Indices' },
      { key: 'mixed_apnea_index',       label: 'Mixed apnea index',    type: 'number', unit: '/hr', step: '0.1', section: 'Apnea Indices' },
      { key: 'total_apnea_index',       label: 'Total apnea index',    type: 'number', unit: '/hr', step: '0.1', section: 'Apnea Indices' },
      { key: 'hypopnea_index',          label: 'Hypopnea index',       type: 'number', unit: '/hr', step: '0.1', section: 'Apnea Indices' },
      { key: 'average_spo2',            label: 'Average SpO2',         type: 'number', unit: '%',   step: '0.1', section: 'Oxygenation' },
      { key: 'odi',                     label: 'ODI',                  type: 'number', unit: '/hr', step: '0.1', section: 'Oxygenation' },
      { key: 'average_hr',              label: 'Average HR',           type: 'number', unit: 'bpm', step: '1',   section: 'Vitals' },
      { key: 'osa_diagnosis',           label: 'OSA diagnosed',        type: 'bool', section: 'Diagnosis' },
      { key: 'osa_severity',            label: 'OSA severity',         type: 'select', section: 'Diagnosis',
        options: [
          { value: '',         label: '—' },
          { value: 'mild',     label: 'Mild (AHI 5–15)' },
          { value: 'moderate', label: 'Moderate (AHI 15–30)' },
          { value: 'severe',   label: 'Severe (AHI ≥30)' },
        ] },
      { key: 'notes',                   label: 'Notes',                type: 'textarea', section: 'Notes' },
    ],
  },

  scg: {
    slug: 'scg', label: 'Seismocardiography (SCG)',
    table: 'thalassemia_scg', dateField: 'assessment_date', hasTimepoint: true,
    fields: [
      { key: 'ejection_fraction_pct', label: 'Ejection fraction',  type: 'number', unit: '%',    step: '0.1' },
      { key: 'cardiac_output_l_min',  label: 'Cardiac output',     type: 'number', unit: 'L/min', step: '0.1' },
      { key: 'stroke_volume_ml',      label: 'Stroke volume',      type: 'number', unit: 'ml',   step: '0.1' },
      { key: 'ao_valve_findings',     label: 'Aortic valve findings', type: 'text' },
      { key: 'mv_findings',           label: 'Mitral valve findings', type: 'text' },
      { key: 'device_id',             label: 'Device ID',          type: 'text' },
      { key: 'ai_model_version',      label: 'AI model version',   type: 'text' },
      { key: 'ai_confidence_score',   label: 'AI confidence',      type: 'number', step: '0.001', min: 0, max: 1 },
      { key: 'notes',                 label: 'Notes',              type: 'textarea' },
    ],
  },

  transfusions: {
    slug: 'transfusions', label: 'Transfusion',
    table: 'thalassemia_transfusions', dateField: 'transfusion_date', hasTimepoint: false,
    fields: [
      { key: 'volume_ml',           label: 'Volume',           type: 'number', unit: 'ml',   step: '1' },
      { key: 'pre_transfusion_hb',  label: 'Pre-transfusion Hb', type: 'number', unit: 'g/dL', step: '0.1' },
      { key: 'chelation_at_visit',  label: 'Chelation at visit', type: 'text' },
      { key: 'notes',               label: 'Notes',            type: 'textarea' },
    ],
  },

  ae: {
    slug: 'ae', label: 'Adverse Event',
    table: 'thalassemia_adverse_events', dateField: 'event_date', hasTimepoint: false,
    fields: [
      { key: 'description',       label: 'Description',      type: 'textarea', required: true },
      { key: 'severity',          label: 'Severity',         type: 'select', required: true,
        options: [
          { value: 'mild',              label: 'Mild' },
          { value: 'moderate',          label: 'Moderate' },
          { value: 'severe',            label: 'Severe' },
          { value: 'life_threatening',  label: 'Life-threatening' },
          { value: 'fatal',             label: 'Fatal' },
        ] },
      { key: 'relatedness',       label: 'Relatedness',      type: 'select',
        options: [
          { value: '',         label: '—' },
          { value: 'unrelated', label: 'Unrelated' },
          { value: 'unlikely',  label: 'Unlikely' },
          { value: 'possible',  label: 'Possible' },
          { value: 'probable',  label: 'Probable' },
          { value: 'definite',  label: 'Definite' },
        ] },
      { key: 'serious',           label: 'Serious AE',       type: 'bool' },
      { key: 'procedure_related', label: 'Procedure related', type: 'select',
        options: [
          { value: '',                label: '—' },
          { value: 'MRI',             label: 'MRI' },
          { value: 'Polysomnography', label: 'Polysomnography' },
          { value: 'SCG',             label: 'SCG' },
          { value: 'Blood draw',      label: 'Blood draw' },
          { value: 'Transfusion',     label: 'Transfusion' },
          { value: 'Other',           label: 'Other' },
        ] },
      { key: 'action_taken',      label: 'Action taken',     type: 'textarea' },
      { key: 'outcome',           label: 'Outcome',          type: 'text' },
      { key: 'resolved_date',     label: 'Resolved date',    type: 'date' },
      { key: 'reported_to_mrec',  label: 'Reported to MREC', type: 'bool' },
      { key: 'reported_date',     label: 'Reported date',    type: 'date' },
    ],
  },
};

// ── The route component ─────────────────────────────────────────────────────
export default function ThalassemiaForm() {
  const { id = '', modality = '', rowId } = useParams();
  const nav = useNavigate();
  const schema = SCHEMAS[modality];
  const [values, setValues] = useState<Record<string, any>>({});
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [timepoint, setTimepoint] = useState<Timepoint>('unscheduled');
  const [loading, setLoading] = useState(!!rowId);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!schema || !rowId) return;
    (async () => {
      const { data, error } = await supabase.from(schema.table).select('*').eq('id', rowId).maybeSingle();
      if (error) { setErr(error.message); setLoading(false); return; }
      if (data) {
        const vals: Record<string, any> = {};
        for (const f of schema.fields) vals[f.key] = (data as any)[f.key];
        setValues(vals);
        setDate((data as any)[schema.dateField] ?? date);
        if (schema.hasTimepoint) setTimepoint((data as any).timepoint ?? 'unscheduled');
      }
      setLoading(false);
    })();
  }, [rowId, modality]);

  const sections = useMemo(() => {
    if (!schema) return [];
    const map = new Map<string, FieldDef[]>();
    for (const f of schema.fields) {
      const sec = f.section ?? '';
      if (!map.has(sec)) map.set(sec, []);
      map.get(sec)!.push(f);
    }
    return Array.from(map.entries());
  }, [schema]);

  if (!schema) {
    return <div style={{padding:40}}>Unknown modality: <code>{modality}</code>. <button onClick={() => nav(-1)}>Back</button></div>;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setSaving(true);
    try {
      const record: Record<string, any> = {
        patient_id: id,
        [schema.dateField]: date,
        ...values,
      };
      if (schema.hasTimepoint) record.timepoint = timepoint;

      const q = rowId
        ? supabase.from(schema.table).update(record).eq('id', rowId)
        : supabase.from(schema.table).insert(record);
      const { error } = await q;
      if (error) throw error;
      nav(`/dashboard/thalassemia/patients/${id}`);
    } catch (e: any) {
      setErr(e.message ?? String(e));
      setSaving(false);
    }
  }

  if (loading) return <div style={{padding:40}}>Loading…</div>;

  return (
    <div style={{padding:'28px',maxWidth:900}}>
      <button onClick={() => nav(-1)} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',fontSize:13,marginBottom:8}}>← Back</button>
      <h1 style={{margin:'0 0 4px',color:'var(--primary)',fontFamily:'var(--font-serif)'}}>
        {rowId ? 'Edit' : 'Add'} {schema.label}
      </h1>
      <p style={{color:'var(--text-muted)',margin:'0 0 20px',fontSize:14}}>
        Fields shown for {schema.slug} per protocol. Leave blank if not measured.
      </p>

      {err && (
        <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid #fecaca',color:'#dc2626',padding:14,borderRadius:8,marginBottom:16}}>
          {err}
        </div>
      )}

      <form onSubmit={onSubmit} style={{background:'white',border:'1px solid var(--border)',borderRadius:12,padding:24,display:'grid',gap:20}}>
        {/* Date + timepoint always at top */}
        <div style={{display:'grid',gridTemplateColumns: schema.hasTimepoint ? '1fr 1fr' : '1fr', gap:12,paddingBottom:16,borderBottom:'1px solid var(--border)'}}>
          <Field label={schema.dateField.replace('_', ' ')} required>
            <input required type="date" value={date} onChange={e => setDate(e.target.value)} style={inputSt} />
          </Field>
          {schema.hasTimepoint && (
            <Field label="Timepoint">
              <select value={timepoint} onChange={e => setTimepoint(e.target.value as Timepoint)} style={inputSt}>
                <option value="unscheduled">Unscheduled / ad-hoc</option>
                <option value="baseline">Baseline</option>
                <option value="6mo">6-month</option>
                <option value="12mo">12-month</option>
              </select>
            </Field>
          )}
        </div>

        {sections.map(([section, fields]) => (
          <div key={section}>
            {section && (
              <h3 style={{margin:'0 0 12px',fontSize:'0.85rem',color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em'}}>{section}</h3>
            )}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:12}}>
              {fields.map(f => (
                <Field key={f.key} label={`${f.label}${f.unit ? ` (${f.unit})` : ''}`} required={f.required}>
                  <FieldInput def={f} value={values[f.key]} onChange={v => setValues(prev => ({ ...prev, [f.key]: v }))} />
                </Field>
              ))}
            </div>
          </div>
        ))}

        <div style={{display:'flex',gap:10,marginTop:8,paddingTop:16,borderTop:'1px solid var(--border)'}}>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Saving…' : rowId ? 'Save Changes' : `Save ${schema.label}`}
          </button>
          <button type="button" onClick={() => nav(-1)} className="btn btn-outline">Cancel</button>
        </div>
      </form>
    </div>
  );
}

// ── Field input dispatcher ─────────────────────────────────────────────────
function FieldInput({ def, value, onChange }: { def: FieldDef; value: any; onChange: (v: any) => void }) {
  switch (def.type) {
    case 'text':
      return <input value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={def.placeholder} style={inputSt} />;
    case 'textarea':
      return <textarea value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={def.placeholder} rows={3} style={{...inputSt,fontFamily:'inherit',resize:'vertical'}} />;
    case 'number':
      return (
        <input
          type="number"
          step={def.step ?? 'any'}
          min={def.min}
          max={def.max}
          value={value ?? ''}
          onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}
          placeholder={def.placeholder}
          style={inputSt}
        />
      );
    case 'date':
      return <input type="date" value={value ?? ''} onChange={e => onChange(e.target.value || null)} style={inputSt} />;
    case 'bool':
      return (
        <label style={{display:'flex',alignItems:'center',gap:8,paddingTop:8}}>
          <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} />
          <span style={{fontSize:13,color:'var(--text-muted)'}}>{value ? 'Yes' : 'No'}</span>
        </label>
      );
    case 'select':
      return (
        <select value={value ?? ''} onChange={e => onChange(e.target.value || null)} style={inputSt}>
          {def.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
  }
}

const inputSt: React.CSSProperties = {
  width:'100%',padding:'8px 10px',border:'1px solid var(--border)',borderRadius:6,fontSize:14,background:'white',
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label style={{display:'block'}}>
      <div style={{fontSize:12,marginBottom:4,color:'var(--text)',fontWeight:500}}>
        {label} {required && <span style={{color:'#dc2626'}}>*</span>}
      </div>
      {children}
    </label>
  );
}
