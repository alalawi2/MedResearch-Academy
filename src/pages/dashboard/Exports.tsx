import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function Exports() {
  const { studyRoles, getRoleForStudy } = useAuth();
  const studySlug = studyRoles[0]?.study_slug;
  const role = getRoleForStudy(studySlug);
  const canExport = role && ['super_admin', 'research_admin', 'statistician'].includes(role);
  const [exporting, setExporting] = useState(false);
  const [msg, setMsg] = useState('');

  async function exportCsv(table: string, label: string) {
    if (!canExport) return;
    setExporting(true);
    setMsg('');

    const studyId = studyRoles[0]?.study_id;
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('study_id', studyId)
      .limit(1000);

    if (error || !data) {
      setMsg(`Error: ${error?.message ?? 'No data found'}`);
      setExporting(false);
      return;
    }

    if (data.length === 0) {
      setMsg(`No ${label} data found for this study.`);
      setExporting(false);
      return;
    }

    // Convert to CSV
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(h => {
          const val = (row as any)[h];
          if (val == null) return '';
          const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
          return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str;
        }).join(',')
      ),
    ];
    const csv = csvRows.join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${studySlug}_${table}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    setMsg(`Exported ${data.length} rows from ${label}.`);
    setExporting(false);
  }

  return (
    <div>
      <h1 style={{fontSize:'1.8rem',fontFamily:'var(--font-serif)',color:'var(--primary)',marginBottom:8}}>Data Exports</h1>
      <p style={{color:'var(--text-muted)',fontSize:14,marginBottom:32}}>Download de-identified datasets for statistical analysis.</p>

      {!canExport ? (
        <div style={{background:'#fef3c7',border:'1px solid #fde68a',borderRadius:12,padding:'20px',fontSize:14,color:'#92400e'}}>
          Your role ({role}) does not have export permissions. Contact the PI to request access.
        </div>
      ) : (
        <>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:16,marginBottom:24}}>
            {[
              {table:'residents',label:'Residents',icon:'👥',desc:'Demographics, program, PGY level, site, enrollment status'},
              {table:'rotation_blocks',label:'Rotation Blocks',icon:'📅',desc:'Block-by-block rotation details, call counts, hours worked/slept'},
              {table:'mbi_responses',label:'MBI Responses',icon:'📋',desc:'All MBI submissions with EE/DP/PA scores and burnout classification'},
              {table:'promis29_responses',label:'PROMIS-29',icon:'🧠',desc:'All PROMIS-29 assessments with 8 domain T-scores'},
              {table:'whoop_pulls',label:'WHOOP Data',icon:'⌚',desc:'4-week averaged biophysical metrics (HRV, RHR, sleep, strain, etc.)'},
            ].map(item => (
              <div key={item.table} style={{background:'white',borderRadius:14,padding:'24px',border:'1px solid var(--border)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                  <span style={{fontSize:28}}>{item.icon}</span>
                </div>
                <h3 style={{fontFamily:'var(--font-serif)',color:'var(--primary)',fontSize:'1.05rem',marginBottom:6}}>{item.label}</h3>
                <p style={{fontSize:12,color:'var(--text-muted)',lineHeight:1.5,marginBottom:14}}>{item.desc}</p>
                <button
                  onClick={() => exportCsv(item.table, item.label)}
                  disabled={exporting}
                  className="btn btn-outline"
                  style={{padding:'8px 16px',fontSize:12,width:'100%',justifyContent:'center'}}
                >
                  Download CSV
                </button>
              </div>
            ))}
          </div>

          {msg && (
            <div style={{background:'var(--bg-muted)',borderRadius:8,padding:'12px 16px',fontSize:13,color:'var(--text-muted)'}}>
              {msg}
            </div>
          )}
        </>
      )}
    </div>
  );
}
