import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPatients, ThalPatient } from '../../../lib/thalassemia';

export default function ThalassemiaPatientList() {
  const [patients, setPatients] = useState<ThalPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchPatients()
      .then(setPatients)
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return patients.filter(p => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (q && !p.patient_code.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [patients, q, statusFilter]);

  return (
    <div style={{padding:'28px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div>
          <h1 style={{margin:0,color:'var(--primary)',fontFamily:'var(--font-serif)'}}>Patients</h1>
          <p style={{color:'var(--text-muted)',margin:'4px 0 0',fontSize:14}}>{filtered.length} of {patients.length} shown · pseudonymized view</p>
        </div>
        <Link to="/dashboard/thalassemia/patients/new" className="btn btn-primary">+ Enroll New Patient</Link>
      </div>

      <div style={{background:'white',border:'1px solid var(--border)',borderRadius:12,padding:16,marginBottom:16,display:'flex',gap:12,flexWrap:'wrap'}}>
        <input
          type="text"
          placeholder="Filter by patient code (e.g. TDT-001)"
          value={q}
          onChange={e => setQ(e.target.value)}
          style={{flex:1,minWidth:220,padding:'8px 12px',border:'1px solid var(--border)',borderRadius:8}}
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{padding:'8px 12px',border:'1px solid var(--border)',borderRadius:8,background:'white'}}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="consented">Consented</option>
          <option value="withdrawn">Withdrawn</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {loading && <div style={{textAlign:'center',padding:40,color:'var(--text-muted)'}}>Loading…</div>}
      {err && <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid #fecaca',color:'#dc2626',padding:14,borderRadius:8}}>Error: {err}</div>}

      {!loading && !err && (
        <div style={{background:'white',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'var(--bg-muted)',borderBottom:'1px solid var(--border)'}}>
                <Th>Code</Th>
                <Th>Enrolled</Th>
                <Th>Age</Th>
                <Th>Sex</Th>
                <Th>Diagnosis</Th>
                <Th>BMI</Th>
                <Th>Status</Th>
                <Th> </Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{padding:40,textAlign:'center',color:'var(--text-muted)'}}>
                    No patients yet. <Link to="/dashboard/thalassemia/patients/new">Enroll the first one →</Link>
                  </td>
                </tr>
              )}
              {filtered.map(p => (
                <tr key={p.id} style={{borderBottom:'1px solid var(--border)'}}>
                  <Td><strong style={{color:'var(--primary)'}}>{p.patient_code}</strong></Td>
                  <Td>{p.enrollment_date ?? '—'}</Td>
                  <Td>{p.age_at_enrollment ?? '—'}</Td>
                  <Td>{p.sex === 1 ? 'M' : p.sex === 0 ? 'F' : '—'}</Td>
                  <Td>{p.diagnosis ? (p.diagnosis === 'major' ? 'TM' : 'TI') : '—'}</Td>
                  <Td>{p.bmi ?? '—'}</Td>
                  <Td>
                    <span style={{
                      display:'inline-block',padding:'2px 10px',borderRadius:12,fontSize:12,
                      background: p.status==='active' ? 'rgba(34,197,94,0.15)' : 'var(--bg-muted)',
                      color: p.status==='active' ? '#15803d' : 'var(--text-muted)',
                    }}>{p.status}</span>
                  </Td>
                  <Td><Link to={`/dashboard/thalassemia/patients/${p.id}`}>Open →</Link></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const Th = ({ children }: { children: React.ReactNode }) => (
  <th style={{textAlign:'left',padding:'12px 16px',fontSize:12,fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em'}}>{children}</th>
);
const Td = ({ children }: { children: React.ReactNode }) => (
  <td style={{padding:'12px 16px',fontSize:14,color:'var(--text)'}}>{children}</td>
);
