import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import {
  fetchPatient, fetchIdentifiers, fetchVisitSchedule, fetchModalityRows,
  buildChecklist, INVESTIGATION_LABEL,
  ThalPatient, ThalIdentifiers, VisitScheduleRow,
  LabRow, EcgRow, EchoRow, T2mriRow, PolysomnographyRow, ScgRow, TransfusionRow, AdverseEventRow,
  ChecklistCell, Timepoint,
} from '../../../lib/thalassemia';

type Tab = 'checklist' | 'demographics' | 'lab' | 'ecg' | 'echo' | 't2mri' | 'polysomnography' | 'scg' | 'transfusions' | 'ae' | 'meds';

const TABS: { id: Tab; label: string }[] = [
  { id: 'checklist',       label: 'Checklist' },
  { id: 'demographics',    label: 'Demographics' },
  { id: 'lab',             label: 'Labs' },
  { id: 'ecg',             label: 'ECG' },
  { id: 'echo',            label: 'Echo' },
  { id: 't2mri',           label: 'T2* MRI' },
  { id: 'polysomnography', label: 'PSG' },
  { id: 'scg',             label: 'SCG' },
  { id: 'transfusions',    label: 'Transfusions' },
  { id: 'meds',            label: 'Medications' },
  { id: 'ae',              label: 'Adverse Events' },
];

export default function ThalassemiaPatientDetail() {
  const { id = '' } = useParams();
  const [tab, setTab] = useState<Tab>('checklist');
  const [patient, setPatient] = useState<ThalPatient | null>(null);
  const [ident, setIdent] = useState<ThalIdentifiers | null>(null);
  const [visits, setVisits] = useState<VisitScheduleRow[]>([]);
  const [lab, setLab] = useState<LabRow[]>([]);
  const [ecg, setEcg] = useState<EcgRow[]>([]);
  const [echoRows, setEchoRows] = useState<EchoRow[]>([]);
  const [t2mri, setT2mri] = useState<T2mriRow[]>([]);
  const [psg, setPsg] = useState<PolysomnographyRow[]>([]);
  const [scg, setScg] = useState<ScgRow[]>([]);
  const [tx, setTx] = useState<TransfusionRow[]>([]);
  const [ae, setAe] = useState<AdverseEventRow[]>([]);
  const [meds, setMeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [p, i, v, l, ec, ech, t2, ps, sc, tr, aev, medsData] = await Promise.all([
          fetchPatient(id),
          fetchIdentifiers(id),
          fetchVisitSchedule(id),
          fetchModalityRows<LabRow>('thalassemia_lab', id),
          fetchModalityRows<EcgRow>('thalassemia_ecg', id),
          fetchModalityRows<EchoRow>('thalassemia_echo', id),
          fetchModalityRows<T2mriRow>('thalassemia_t2mri', id),
          fetchModalityRows<PolysomnographyRow>('thalassemia_polysomnography', id, 'study_date'),
          fetchModalityRows<ScgRow>('thalassemia_scg', id),
          fetchModalityRows<TransfusionRow>('thalassemia_transfusions', id, 'transfusion_date'),
          fetchModalityRows<AdverseEventRow>('thalassemia_adverse_events', id, 'event_date'),
          fetchModalityRows<any>('thalassemia_concomitant_meds', id, 'start_date'),
        ]);
        setPatient(p); setIdent(i); setVisits(v);
        setLab(l); setEcg(ec); setEchoRows(ech); setT2mri(t2);
        setPsg(ps); setScg(sc); setTx(tr); setAe(aev); setMeds(medsData);
      } catch (e: any) {
        setErr(e.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div style={{padding:40,textAlign:'center',color:'var(--text-muted)'}}>Loading…</div>;
  if (err) return <div style={{padding:40,color:'#dc2626'}}>Error: {err}</div>;
  if (!patient) return <div style={{padding:40}}>Patient not found. <Link to="/dashboard/thalassemia/patients">Back</Link></div>;

  const checklist = buildChecklist(patient, visits, {
    lab, ecg, echo: echoRows, t2mri, polysomnography: psg, scg,
  });

  return (
    <div style={{padding:'28px'}}>
      {/* Header */}
      <div style={{marginBottom:20}}>
        <Link to="/dashboard/thalassemia/patients" style={{fontSize:13,color:'var(--text-muted)',textDecoration:'none'}}>← Patients</Link>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginTop:8,flexWrap:'wrap',gap:12}}>
          <div>
            <h1 style={{margin:0,color:'var(--primary)',fontFamily:'var(--font-serif)'}}>
              {patient.patient_code}
              {ident && <span style={{fontSize:'0.8rem',color:'var(--text-muted)',marginLeft:12}}>· {ident.full_name}</span>}
            </h1>
            <div style={{color:'var(--text-muted)',fontSize:13,marginTop:4}}>
              {patient.diagnosis === 'major' ? 'Thalassemia Major' : patient.diagnosis === 'intermedia' ? 'Thalassemia Intermedia' : 'Diagnosis not set'}
              {' · '}Enrolled {patient.enrollment_date ?? '—'}
              {patient.age_at_enrollment != null && ` · Age ${patient.age_at_enrollment}`}
              {patient.sex != null && ` · ${patient.sex === 1 ? 'M' : 'F'}`}
              {patient.bmi != null && ` · BMI ${patient.bmi}`}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:2,borderBottom:'1px solid var(--border)',marginBottom:24,overflowX:'auto'}}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background:'none',border:'none',padding:'10px 16px',cursor:'pointer',
              borderBottom: tab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
              color: tab === t.id ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: tab === t.id ? 600 : 500,
              fontSize:14,whiteSpace:'nowrap',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Panels */}
      {tab === 'checklist' && <ChecklistPanel cells={checklist} visits={visits} patientId={id} />}
      {tab === 'demographics' && <DemographicsPanel patient={patient} ident={ident} />}
      {tab === 'lab' && <ModalityListPanel title="Lab Biomarkers" rows={lab} columns={LAB_COLS} dateCol="assessment_date" patientId={id} modality="lab" />}
      {tab === 'ecg' && <ModalityListPanel title="ECG" rows={ecg} columns={ECG_COLS} dateCol="assessment_date" patientId={id} modality="ecg" />}
      {tab === 'echo' && <ModalityListPanel title="Echocardiography" rows={echoRows} columns={ECHO_COLS} dateCol="assessment_date" patientId={id} modality="echo" />}
      {tab === 't2mri' && <ModalityListPanel title="Cardiac T2* MRI" rows={t2mri} columns={T2MRI_COLS} dateCol="assessment_date" patientId={id} modality="t2mri" />}
      {tab === 'polysomnography' && <ModalityListPanel title="Polysomnography" rows={psg} columns={PSG_COLS} dateCol="study_date" patientId={id} modality="polysomnography" />}
      {tab === 'scg' && <ModalityListPanel title="Seismocardiography" rows={scg} columns={SCG_COLS} dateCol="assessment_date" patientId={id} modality="scg" />}
      {tab === 'transfusions' && <ModalityListPanel title="Transfusion Log" rows={tx} columns={TX_COLS} dateCol="transfusion_date" patientId={id} modality="transfusions" />}
      {tab === 'meds' && <ModalityListPanel title="Concomitant Medications" rows={meds} columns={MEDS_COLS} dateCol="start_date" patientId={id} modality="meds" />}
      {tab === 'ae' && <AdverseEventsPanel rows={ae} patientId={id} />}
    </div>
  );
}

// ── Checklist matrix ─────────────────────────────────────────────────────────
const INV_TO_MODALITY: Record<string, string | null> = {
  demographics: null, lab: 'lab', ecg: 'ecg', echo: 'echo',
  t2mri: 't2mri', polysomnography: 'polysomnography', scg: 'scg',
};

function ChecklistPanel({ cells, visits, patientId }: { cells: ChecklistCell[]; visits: VisitScheduleRow[]; patientId: string }) {
  const investigations = Array.from(new Set(cells.map(c => c.investigation)));
  const timepoints: Timepoint[] = ['baseline', '6mo', '12mo'];
  const cell = (inv: string, tp: Timepoint) => cells.find(c => c.investigation === inv && c.timepoint === tp);
  const visitLabel = (tp: Timepoint) => {
    const v = visits.find(vv => vv.timepoint === tp);
    return v ? { expected: v.expected_date, status: v.computed_status } : null;
  };

  return (
    <div style={{background:'white',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden'}}>
      <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)'}}>
        <h2 style={{margin:0,fontSize:'1.1rem',color:'var(--primary)'}}>Follow-Up Checklist</h2>
        <div style={{fontSize:13,color:'var(--text-muted)',marginTop:4}}>Per-protocol investigations by timepoint · auto-computed from data entered</div>
      </div>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead>
          <tr style={{background:'var(--bg-muted)',borderBottom:'1px solid var(--border)'}}>
            <th style={{textAlign:'left',padding:'12px 20px',fontSize:12,textTransform:'uppercase',color:'var(--text-muted)'}}>Investigation</th>
            {timepoints.map(tp => {
              const v = visitLabel(tp);
              return (
                <th key={tp} style={{textAlign:'left',padding:'12px 20px',fontSize:12,textTransform:'uppercase',color:'var(--text-muted)'}}>
                  <div>{tp}</div>
                  {v && <div style={{fontSize:11,fontWeight:400,marginTop:2,textTransform:'none'}}>Due {v.expected}</div>}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {investigations.map(inv => (
            <tr key={inv} style={{borderBottom:'1px solid var(--border)'}}>
              <td style={{padding:'14px 20px',fontSize:14,fontWeight:500,color:'var(--text)'}}>{INVESTIGATION_LABEL[inv]}</td>
              {timepoints.map(tp => {
                const c = cell(inv, tp);
                if (!c) return <td key={tp} style={{padding:'14px 20px',color:'var(--text-muted)'}}>—</td>;
                if (c.done) {
                  return (
                    <td key={tp} style={{padding:'14px 20px'}}>
                      <span style={{color:'#16a34a',fontWeight:600}}>✓ Done</span>
                      {c.date && <div style={{fontSize:12,color:'var(--text-muted)'}}>{c.date}</div>}
                    </td>
                  );
                }
                const modality = INV_TO_MODALITY[inv];
                const addLink = modality ? `/dashboard/thalassemia/patients/${patientId}/${modality}/new` : null;
                if (c.overdue) {
                  return (
                    <td key={tp} style={{padding:'14px 20px'}}>
                      <span style={{background:'rgba(239,68,68,0.12)',color:'#dc2626',padding:'2px 8px',borderRadius:4,fontSize:12,fontWeight:600}}>⚠ Overdue</span>
                      {addLink && <div><Link to={addLink} style={{fontSize:12,color:'var(--primary)'}}>+ Enter now</Link></div>}
                    </td>
                  );
                }
                return (
                  <td key={tp} style={{padding:'14px 20px'}}>
                    <span style={{color:'var(--text-muted)'}}>□ Not entered</span>
                    {addLink && <div><Link to={addLink} style={{fontSize:12,color:'var(--primary)'}}>+ Enter</Link></div>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Demographics view (read-only summary) ────────────────────────────────────
function DemographicsPanel({ patient, ident }: { patient: ThalPatient; ident: ThalIdentifiers | null }) {
  const complications = [
    { k: 'heart_failure', l: 'Heart Failure' }, { k: 'af', l: 'Atrial Fibrillation' },
    { k: 'vt', l: 'Ventricular Tachycardia' }, { k: 'pacs', l: 'PACs' }, { k: 'pvcs', l: 'PVCs' },
    { k: 'pericarditis', l: 'Pericarditis' }, { k: 'myocarditis', l: 'Myocarditis' },
    { k: 'pulmonary_hypertension', l: 'Pulmonary HTN' }, { k: 'dm', l: 'Diabetes Mellitus' },
    { k: 'liver_disease', l: 'Liver disease' }, { k: 'stroke', l: 'Stroke' },
    { k: 'hypothyroidism', l: 'Hypothyroidism' }, { k: 'kidney_disease', l: 'Kidney disease' },
  ];
  return (
    <div style={{background:'white',border:'1px solid var(--border)',borderRadius:12,padding:24}}>
      <h2 style={{margin:'0 0 16px',fontSize:'1.1rem',color:'var(--primary)'}}>Demographics & Clinical Profile</h2>
      <Row label="Patient Code" value={patient.patient_code} />
      {ident && <Row label="MRN" value={ident.mrn} />}
      {ident && <Row label="Full Name" value={ident.full_name} />}
      <Row label="Enrollment date" value={patient.enrollment_date} />
      <Row label="Diagnosis" value={patient.diagnosis === 'major' ? 'Thalassemia Major' : patient.diagnosis === 'intermedia' ? 'Thalassemia Intermedia' : null} />
      <Row label="Age at diagnosis" value={patient.age_at_diagnosis?.toString()} />
      <Row label="Age at enrollment" value={patient.age_at_enrollment?.toString()} />
      <Row label="Sex" value={patient.sex === 1 ? 'Male' : patient.sex === 0 ? 'Female' : null} />
      <Row label="BMI" value={patient.bmi?.toString()} />
      <Row label="Transfusion frequency" value={patient.transfusion_frequency} />
      <Row label="Chelation therapy" value={patient.chelation_therapy} />

      <h3 style={{margin:'24px 0 12px',fontSize:'0.95rem',color:'var(--primary)'}}>Cardiac + Other Complications</h3>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:8}}>
        {complications.map(c => (
          <div key={c.k} style={{padding:'6px 10px',fontSize:13,color: (patient as any)[c.k] ? '#dc2626' : 'var(--text-muted)'}}>
            {(patient as any)[c.k] ? '● ' : '○ '}{c.l}
          </div>
        ))}
      </div>

      {patient.notes && (
        <>
          <h3 style={{margin:'24px 0 8px',fontSize:'0.95rem',color:'var(--primary)'}}>Notes</h3>
          <div style={{fontSize:14,color:'var(--text-muted)',whiteSpace:'pre-wrap'}}>{patient.notes}</div>
        </>
      )}

      <div style={{marginTop:24,padding:14,background:'var(--bg-muted)',borderRadius:8,fontSize:13,color:'var(--text-muted)'}}>
        <em>Editing demographics is not yet implemented — data-entry forms coming in the next commit.</em>
      </div>
    </div>
  );
}

// ── Reusable modality list ───────────────────────────────────────────────────
function ModalityListPanel({ title, rows, columns, dateCol, patientId, modality }: {
  title: string; rows: any[]; columns: { key: string; label: string }[]; dateCol: string;
  patientId: string; modality: string;
}) {
  const hasTimepoint = modality !== 'polysomnography' && modality !== 'transfusions';
  return (
    <div style={{background:'white',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden'}}>
      <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2 style={{margin:0,fontSize:'1.1rem',color:'var(--primary)'}}>{title}</h2>
        <Link to={`/dashboard/thalassemia/patients/${patientId}/${modality}/new`} className="btn btn-primary">+ Add {title}</Link>
      </div>
      {rows.length === 0 ? (
        <div style={{padding:40,textAlign:'center',color:'var(--text-muted)'}}>No {title.toLowerCase()} entries yet.</div>
      ) : (
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
          <thead>
            <tr style={{background:'var(--bg-muted)',borderBottom:'1px solid var(--border)'}}>
              <th style={thSt}>Date</th>
              {hasTimepoint && <th style={thSt}>Timepoint</th>}
              {columns.map(c => <th key={c.key} style={thSt}>{c.label}</th>)}
              <th style={thSt}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} style={{borderBottom:'1px solid var(--border)'}}>
                <td style={tdSt}>{r[dateCol] ?? '—'}</td>
                {hasTimepoint && <td style={tdSt}>{r.timepoint ?? '—'}</td>}
                {columns.map(c => <td key={c.key} style={tdSt}>{formatCell(r[c.key])}</td>)}
                <td style={tdSt}>
                  <Link to={`/dashboard/thalassemia/patients/${patientId}/${modality}/${r.id}`} style={{fontSize:12}}>Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function formatCell(v: any) {
  if (v == null || v === '') return '—';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  return String(v);
}

const thSt: React.CSSProperties = { textAlign:'left',padding:'10px 14px',fontSize:11,fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em' };
const tdSt: React.CSSProperties = { padding:'10px 14px',color:'var(--text)' };

const LAB_COLS   = [ {key:'hemoglobin',label:'Hb'}, {key:'ferritin',label:'Ferritin'}, {key:'mmp_2',label:'MMP-2'}, {key:'mmp_9',label:'MMP-9'}, {key:'timp_1',label:'TIMP-1'}, {key:'bnp',label:'NT-proBNP'} ];
const ECG_COLS   = [ {key:'rate',label:'Rate'}, {key:'rhythm',label:'Rhythm'}, {key:'qtc_ms',label:'QTc'}, {key:'lvh',label:'LVH'}, {key:'rvh',label:'RVH'}, {key:'t_wave_abnormality',label:'T-wave abn'} ];
const ECHO_COLS  = [ {key:'lvef',label:'LVEF %'}, {key:'gls_pct',label:'GLS %'}, {key:'lavi_ml_m2',label:'LAVi'}, {key:'e_e_avg',label:'E/E\'avg'}, {key:'rvsp_mmhg',label:'RVSP'} ];
const T2MRI_COLS = [ {key:'cardiac_t2_star_ms',label:'Cardiac T2*'}, {key:'liver_t2_star_ms',label:'Liver T2*'}, {key:'interpretation',label:'Interpretation'} ];
const PSG_COLS   = [ {key:'ahi',label:'AHI'}, {key:'sleep_efficiency_pct',label:'Sleep eff %'}, {key:'average_spo2',label:'Avg SpO2'}, {key:'osa_severity',label:'OSA severity'} ];
const SCG_COLS   = [ {key:'ejection_fraction_pct',label:'EF %'}, {key:'cardiac_output_l_min',label:'CO'}, {key:'stroke_volume_ml',label:'SV'} ];
const TX_COLS    = [ {key:'volume_ml',label:'Volume (ml)'}, {key:'pre_transfusion_hb',label:'Pre-tx Hb'}, {key:'chelation_at_visit',label:'Chelation'} ];
const MEDS_COLS  = [ {key:'medication_name',label:'Medication'}, {key:'dose',label:'Dose'}, {key:'frequency',label:'Frequency'}, {key:'indication',label:'Indication'}, {key:'ongoing',label:'Ongoing'} ];

// ── Adverse events ───────────────────────────────────────────────────────────
function AdverseEventsPanel({ rows, patientId }: { rows: AdverseEventRow[]; patientId: string }) {
  return (
    <div style={{background:'white',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden'}}>
      <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2 style={{margin:0,fontSize:'1.1rem',color:'var(--primary)'}}>Adverse Events</h2>
        <Link to={`/dashboard/thalassemia/patients/${patientId}/ae/new`} className="btn btn-primary">+ Report AE</Link>
      </div>
      {rows.length === 0 ? (
        <div style={{padding:40,textAlign:'center',color:'var(--text-muted)'}}>No adverse events reported. Good news.</div>
      ) : (
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
          <thead>
            <tr style={{background:'var(--bg-muted)'}}>
              <th style={thSt}>Date</th><th style={thSt}>Description</th><th style={thSt}>Severity</th><th style={thSt}>Related to</th><th style={thSt}>Serious</th><th style={thSt}>Resolved</th><th style={thSt}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} style={{borderBottom:'1px solid var(--border)'}}>
                <td style={tdSt}>{r.event_date}</td>
                <td style={tdSt}>{r.description}</td>
                <td style={tdSt}>{r.severity}</td>
                <td style={tdSt}>{r.procedure_related ?? '—'}</td>
                <td style={tdSt}>{r.serious ? <span style={{color:'#dc2626',fontWeight:600}}>Yes</span> : 'No'}</td>
                <td style={tdSt}>{r.resolved_date ?? 'Ongoing'}</td>
                <td style={tdSt}><Link to={`/dashboard/thalassemia/patients/${patientId}/ae/${r.id}`} style={{fontSize:12}}>Edit</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div style={{display:'flex',padding:'6px 0',borderBottom:'1px dashed var(--border)'}}>
      <div style={{width:200,fontSize:13,color:'var(--text-muted)'}}>{label}</div>
      <div style={{flex:1,fontSize:14,color:'var(--text)'}}>{value ?? '—'}</div>
    </div>
  );
}
