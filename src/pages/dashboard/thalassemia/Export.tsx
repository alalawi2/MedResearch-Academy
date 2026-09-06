import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { THAL_STUDY_SLUG } from '../../../lib/thalassemia';

interface ModalityExport {
  table: string;
  label: string;
  dateField: string;
  joinsPatients: boolean; // if true, we add patient_code from a lookup
}

const EXPORTS: ModalityExport[] = [
  { table: 'thalassemia_patients',         label: 'Patients + Demographics', dateField: 'enrollment_date',   joinsPatients: false },
  { table: 'thalassemia_visit_schedule',   label: 'Visit Schedule',          dateField: 'expected_date',     joinsPatients: true  },
  { table: 'thalassemia_lab',              label: 'Lab Biomarkers',          dateField: 'assessment_date',   joinsPatients: true  },
  { table: 'thalassemia_ecg',              label: 'ECG',                     dateField: 'assessment_date',   joinsPatients: true  },
  { table: 'thalassemia_echo',             label: 'Echocardiography',        dateField: 'assessment_date',   joinsPatients: true  },
  { table: 'thalassemia_t2mri',            label: 'Cardiac T2* MRI',         dateField: 'assessment_date',   joinsPatients: true  },
  { table: 'thalassemia_polysomnography',  label: 'Polysomnography',         dateField: 'study_date',        joinsPatients: true  },
  { table: 'thalassemia_scg',              label: 'Seismocardiography',      dateField: 'assessment_date',   joinsPatients: true  },
  { table: 'thalassemia_transfusions',     label: 'Transfusion Log',         dateField: 'transfusion_date',  joinsPatients: true  },
  { table: 'thalassemia_adverse_events',   label: 'Adverse Events',          dateField: 'event_date',        joinsPatients: true  },
  { table: 'thalassemia_concomitant_meds', label: 'Concomitant Medications', dateField: 'start_date',        joinsPatients: true  },
];

export default function ThalassemiaExport() {
  const { studyRoles, getRoleForStudy } = useAuth();
  const thalRole = getRoleForStudy?.(THAL_STUDY_SLUG) ?? studyRoles.find(r => r.study_slug === THAL_STUDY_SLUG)?.role;
  const canExport = thalRole && ['super_admin', 'research_admin', 'statistician'].includes(thalRole);
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  async function download(spec: ModalityExport) {
    if (!canExport) { setErr('You do not have permission to export.'); return; }
    setErr(''); setBusy(spec.table);
    try {
      // Fetch patient lookup once (pseudonymized codes only — never MRN/name)
      let codeByPatient: Record<string, string> = {};
      if (spec.joinsPatients) {
        const { data: patients } = await supabase
          .from('thalassemia_patients')
          .select('id, patient_code');
        (patients ?? []).forEach(p => { codeByPatient[p.id] = p.patient_code; });
      }

      // Fetch the modality data with optional date filter
      let q = supabase.from(spec.table).select('*');
      if (dateFrom) q = q.gte(spec.dateField, dateFrom);
      if (dateTo)   q = q.lte(spec.dateField, dateTo);
      const { data, error } = await q;
      if (error) throw error;
      if (!data || data.length === 0) {
        setErr(`No ${spec.label} entries in the selected range.`);
        setBusy('');
        return;
      }

      // Enrich with patient_code, drop patient_id (keep the pseudonym in front)
      const enriched = data.map(row => {
        const patient_code = spec.joinsPatients ? codeByPatient[(row as any).patient_id] ?? '' : (row as any).patient_code ?? '';
        const { patient_id, id, ...rest } = row as any;
        return spec.joinsPatients ? { patient_code, ...rest } : { patient_code, ...rest };
      });

      const csv = toCsv(enriched);
      const filename = `${spec.table.replace('thalassemia_', 'thal_')}_${today()}.csv`;
      triggerDownload(csv, filename);
      setBusy('');
    } catch (e: any) {
      setErr(e.message ?? String(e));
      setBusy('');
    }
  }

  async function downloadAllZipStyle() {
    // Simpler: run each export sequentially — browser will download each file
    for (const spec of EXPORTS) {
      await download(spec);
      await new Promise(r => setTimeout(r, 400)); // small gap between downloads
    }
  }

  if (!canExport) {
    return (
      <div style={{padding:'28px',maxWidth:720}}>
        <h1 style={{margin:0,color:'var(--primary)',fontFamily:'var(--font-serif)'}}>Export</h1>
        <div style={{background:'rgba(200,151,42,0.10)',border:'1px solid rgba(200,151,42,0.4)',color:'#8a6515',padding:16,borderRadius:8,marginTop:20}}>
          🔒 Export requires <strong>super_admin</strong>, <strong>research_admin</strong>, or <strong>statistician</strong> role on this study. Your current role is <strong>{thalRole ?? 'unknown'}</strong>.
        </div>
      </div>
    );
  }

  return (
    <div style={{padding:'28px',maxWidth:960}}>
      <h1 style={{margin:'0 0 6px',color:'var(--primary)',fontFamily:'var(--font-serif)'}}>Export Study Data</h1>
      <p style={{color:'var(--text-muted)',margin:'0 0 20px',fontSize:14}}>
        CSV exports are pseudonymized — <strong>patient_code</strong> is used as the identifier, MRN and full name are never included.
      </p>

      {err && (
        <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid #fecaca',color:'#dc2626',padding:14,borderRadius:8,marginBottom:16}}>
          {err}
        </div>
      )}

      {/* Date filter */}
      <div style={{background:'white',border:'1px solid var(--border)',borderRadius:12,padding:20,marginBottom:20,display:'flex',gap:16,alignItems:'end',flexWrap:'wrap'}}>
        <div>
          <div style={{fontSize:12,color:'var(--text-muted)',marginBottom:4}}>From (optional)</div>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={inputSt} />
        </div>
        <div>
          <div style={{fontSize:12,color:'var(--text-muted)',marginBottom:4}}>To (optional)</div>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={inputSt} />
        </div>
        <button className="btn btn-outline" onClick={() => { setDateFrom(''); setDateTo(''); }}>Clear</button>
        <button className="btn btn-primary" disabled={!!busy} onClick={downloadAllZipStyle} style={{marginLeft:'auto'}}>
          📦 Download All ({EXPORTS.length} files)
        </button>
      </div>

      {/* Per-modality */}
      <div style={{background:'white',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'var(--bg-muted)',borderBottom:'1px solid var(--border)'}}>
              <th style={thSt}>Modality</th>
              <th style={thSt}>Table</th>
              <th style={thSt}>Date column filtered</th>
              <th style={thSt}></th>
            </tr>
          </thead>
          <tbody>
            {EXPORTS.map(e => (
              <tr key={e.table} style={{borderBottom:'1px solid var(--border)'}}>
                <td style={tdSt}><strong>{e.label}</strong></td>
                <td style={tdSt}><code style={{fontSize:12,color:'var(--text-muted)'}}>{e.table}</code></td>
                <td style={tdSt}><code style={{fontSize:12,color:'var(--text-muted)'}}>{e.dateField}</code></td>
                <td style={tdSt}>
                  <button className="btn btn-outline" disabled={!!busy} onClick={() => download(e)}>
                    {busy === e.table ? 'Downloading…' : 'Download CSV'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{marginTop:20,padding:14,background:'var(--bg-muted)',borderRadius:8,fontSize:12,color:'var(--text-muted)'}}>
        <strong>Data governance:</strong> Exports contain pseudonymized study data only. To link back to MRN, use the identifier lookup restricted to PI/Co-PI in Supabase directly. Do not email CSVs or upload to unsecured storage.
      </div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function toCsv(rows: any[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v: any) => {
    if (v == null) return '';
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push(headers.map(h => escape(r[h])).join(','));
  }
  return lines.join('\n');
}

function triggerDownload(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

const inputSt: React.CSSProperties = { padding:'8px 12px',border:'1px solid var(--border)',borderRadius:8,fontSize:14,background:'white' };
const thSt: React.CSSProperties = { textAlign:'left',padding:'12px 16px',fontSize:12,fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em' };
const tdSt: React.CSSProperties = { padding:'12px 16px',fontSize:14,color:'var(--text)' };
