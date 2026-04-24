import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface Resident {
  id: string;
  study_participant_id: string;
  full_name: string | null;
  sex: string | null;
  age_at_enrollment: number | null;
  program: string | null;
  pgy_level: number | null;
  primary_site: string | null;
  status: string;
  enrollment_date: string | null;
}

export default function Residents() {
  const { studyRoles, getRoleForStudy } = useAuth();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [filterProgram, setFilterProgram] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const studyId = studyRoles[0]?.study_id;
  const studySlug = studyRoles[0]?.study_slug;
  const role = getRoleForStudy(studySlug);
  const canSeePii = role && ['super_admin', 'research_admin', 'site_coordinator'].includes(role);

  useEffect(() => {
    if (!studyId) return;
    loadResidents();
  }, [studyId]);

  async function loadResidents() {
    setLoading(true);
    const { data } = await supabase
      .from('burnout_participants')
      .select('id, study_participant_id, full_name, sex, age_at_enrollment, program, pgy_level, primary_site, status, enrollment_date')
      .eq('study_id', studyId)
      .order('study_participant_id')
      .limit(500);

    setResidents(data ?? []);
    setLoading(false);
  }

  const filtered = residents.filter(r => {
    if (search && !r.study_participant_id.toLowerCase().includes(search.toLowerCase()) &&
        !(r.full_name && r.full_name.toLowerCase().includes(search.toLowerCase()))) return false;
    if (filterSite && r.primary_site !== filterSite) return false;
    if (filterProgram && r.program !== filterProgram) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    return true;
  });

  const sites = [...new Set(residents.map(r => r.primary_site).filter(Boolean))];
  const programs = [...new Set(residents.map(r => r.program).filter(Boolean))];
  const statuses = [...new Set(residents.map(r => r.status))];

  const statusColors: Record<string, string> = {
    active: '#16a34a', pending: '#f59e0b', consented: '#3b82f6',
    withdrawn: '#dc2626', completed: '#6b7280',
  };

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24,flexWrap:'wrap',gap:16}}>
        <div>
          <h1 style={{fontSize:'1.8rem',fontFamily:'var(--font-serif)',color:'var(--primary)',marginBottom:4}}>Residents</h1>
          <p style={{color:'var(--text-muted)',fontSize:14}}>{residents.length} enrolled · {residents.filter(r => r.status === 'active').length} active</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{display:'flex',gap:10,marginBottom:20,flexWrap:'wrap'}}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by ID or name..."
          style={{padding:'9px 14px',borderRadius:8,border:'1px solid var(--border)',fontSize:14,minWidth:220,fontFamily:'var(--font-sans)'}}
        />
        <select value={filterSite} onChange={e => setFilterSite(e.target.value)}
          style={{padding:'9px 14px',borderRadius:8,border:'1px solid var(--border)',fontSize:14,background:'white',fontFamily:'var(--font-sans)'}}>
          <option value="">All Sites</option>
          {sites.map(s => <option key={s} value={s!}>{s}</option>)}
        </select>
        <select value={filterProgram} onChange={e => setFilterProgram(e.target.value)}
          style={{padding:'9px 14px',borderRadius:8,border:'1px solid var(--border)',fontSize:14,background:'white',fontFamily:'var(--font-sans)'}}>
          <option value="">All Programs</option>
          {programs.map(p => <option key={p} value={p!}>{p!.replace(/_/g,' ')}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{padding:'9px 14px',borderRadius:8,border:'1px solid var(--border)',fontSize:14,background:'white',fontFamily:'var(--font-sans)'}}>
          <option value="">All Statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{background:'white',borderRadius:14,border:'1px solid var(--border)',overflow:'auto',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
        {loading ? (
          <div style={{padding:48,textAlign:'center',color:'var(--text-muted)'}}>Loading residents...</div>
        ) : filtered.length === 0 ? (
          <div style={{padding:48,textAlign:'center',color:'var(--text-muted)'}}>
            {residents.length === 0 ? 'No residents enrolled yet.' : 'No residents match your filters.'}
          </div>
        ) : (
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:14}}>
            <thead>
              <tr style={{borderBottom:'2px solid var(--border)',textAlign:'left'}}>
                <th style={{padding:'12px 16px',fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em'}}>Study ID</th>
                {canSeePii && <th style={{padding:'12px 16px',fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em'}}>Name</th>}
                <th style={{padding:'12px 16px',fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em'}}>Program</th>
                <th style={{padding:'12px 16px',fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em'}}>PGY</th>
                <th style={{padding:'12px 16px',fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em'}}>Site</th>
                <th style={{padding:'12px 16px',fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em'}}>Sex</th>
                <th style={{padding:'12px 16px',fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em'}}>Age</th>
                <th style={{padding:'12px 16px',fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em'}}>Status</th>
                <th style={{padding:'12px 16px',fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em'}}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id} style={{borderBottom:'1px solid var(--border)',background:i%2===0?'white':'var(--bg-muted)'}}>
                  <td style={{padding:'12px 16px',fontWeight:600,fontFamily:'monospace'}}>{r.study_participant_id}</td>
                  {canSeePii && <td style={{padding:'12px 16px'}}>{r.full_name ?? '—'}</td>}
                  <td style={{padding:'12px 16px'}}>{r.program?.replace(/_/g,' ') ?? '—'}</td>
                  <td style={{padding:'12px 16px'}}>{r.pgy_level ?? '—'}</td>
                  <td style={{padding:'12px 16px'}}>{r.primary_site ?? '—'}</td>
                  <td style={{padding:'12px 16px'}}>{r.sex ?? '—'}</td>
                  <td style={{padding:'12px 16px'}}>{r.age_at_enrollment ?? '—'}</td>
                  <td style={{padding:'12px 16px'}}>
                    <span style={{
                      padding:'3px 10px',borderRadius:50,fontSize:11,fontWeight:600,
                      background:`${statusColors[r.status] ?? '#6b7280'}18`,
                      color:statusColors[r.status] ?? '#6b7280',
                    }}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{padding:'12px 16px'}}>
                    <Link to={`/dashboard/residents/${r.id}`} style={{color:'var(--primary)',fontSize:13,fontWeight:600}}>View →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
