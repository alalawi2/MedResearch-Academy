import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import './HolterReview.css';

const API = (import.meta.env.VITE_HOLTER_API_URL || '').replace(/\/$/, '');
const RATINGS = ['Not reviewed','Accept unchanged','Minor edits','Major edits','Reject','Insufficient source evidence'];
const DIMENSIONS = ['Not assessed','No concern','Minor concern','Major concern','Insufficient evidence'];
type Review = {version:number;rating:string;notes:string;edited_report:string;numerical_accuracy:string;omissions:string;unsupported_claims:string;clinical_safety:string;submitted:boolean;updated?:string};
type Case = {id:string;measurements:{label:string;value:number|null;unit:string}[];reference:string;candidate:string;review:Review};
type Index = {role:string;cases:{id:string;rating:string;submitted:boolean;version:number}[];verdict:null|{decision:string;notes:string}};

export default function HolterReview() {
  const {user,loading} = useAuth();
  const [index,setIndex]=useState<Index|null>(null),[current,setCurrent]=useState<Case|null>(null);
  const [draft,setDraft]=useState<Review|null>(null),[dirty,setDirty]=useState(false),[busy,setBusy]=useState(false);
  const [status,setStatus]=useState(''),[error,setError]=useState('');
  const [email,setEmail]=useState(''),[password,setPassword]=useState('');
  const [decision,setDecision]=useState('Further development required'),[verdictNotes,setVerdictNotes]=useState('');
  const [progress,setProgress]=useState<any>(null),[history,setHistory]=useState<any[]|null>(null);
  const serial=useRef(0);
  async function request(path:string,method='GET',body?:unknown) {
    if (!API) throw new Error('The local pilot connection has not been configured yet.');
    const {data}=await supabase.auth.getSession();
    if (!data.session) throw new Error('Sign in again to continue.');
    const res=await fetch(`${API}/holter/v1${path}`,{method,cache:'no-store',headers:{Authorization:`Bearer ${data.session.access_token}`,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(20000)});
    const result=await res.json();
    if (!res.ok) throw new Error(typeof result.detail==='string'?result.detail:'The service could not save this assessment. Check the form and retry.');
    return result;
  }
  async function refresh() {
    const epoch=serial.current;
    const result=await request('/cases');
    const ownerProgress=result.role==='owner'?await request('/progress'):null;
    if(epoch===serial.current){setIndex(result);setProgress(ownerProgress);}
    return result as Index;
  }
  async function openCase(id:string) {
    const epoch=serial.current;setBusy(true);setError('');setHistory(null);
    try {const result=await request(`/cases/${id}`);if(epoch!==serial.current)return;setCurrent(result);setDraft(result.review);setDirty(false);setStatus(result.review.updated?'Saved on laptop':'No changes yet');}
    catch(e){if(epoch===serial.current)setError((e as Error).message);}finally{if(epoch===serial.current)setBusy(false);}
  }
  useEffect(()=>{
    serial.current++;setCurrent(null);setDraft(null);setIndex(null);setProgress(null);setHistory(null);setDirty(false);setBusy(false);setError('');
    if(!user)return;
    let active=true;
    refresh().then(result=>{if(active && result.role==='reviewer' && result.cases.length)openCase(result.cases.find(c=>!c.submitted)?.id||result.cases[0].id);}).catch(e=>{if(active)setError(e.message);});
    return ()=>{active=false;serial.current++;};
  },[user?.id]);
  useEffect(()=>{if(index?.role!=='owner')return;const timer=setInterval(()=>refresh().catch(e=>setError(e.message)),15000);return()=>clearInterval(timer);},[index?.role]);
  useEffect(()=>{const handler=(e:BeforeUnloadEvent)=>{if(dirty||busy){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',handler);return()=>window.removeEventListener('beforeunload',handler);},[dirty,busy]);
  async function save(submitted=false) {
    if(!draft||!current||busy)return;
    const epoch=serial.current;setBusy(true);setStatus('Saving to laptop…');setError('');
    try {const saved=await request(`/cases/${current.id}`,'PUT',{...draft,submitted});if(epoch!==serial.current)return;setDraft(saved);setDirty(false);setStatus(submitted?'Assessment submitted and locked':'Saved on laptop · '+new Date(saved.updated).toLocaleTimeString());await refresh();}
    catch(e){if(epoch===serial.current){setError((e as Error).message);setStatus('Not saved — keep this page open and retry.');}}
    finally{if(epoch===serial.current)setBusy(false);}
  }
  useEffect(()=>{if(!dirty||busy||error)return;const timer=setTimeout(()=>save(),1200);return()=>clearTimeout(timer);},[draft,dirty,busy,error]);
  function change(key:keyof Review,value:string) {if(!draft)return;setDraft({...draft,[key]:value});setDirty(true);setStatus('Unsaved changes');setError('');}
  async function login(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');try{const result=await supabase.auth.signInWithPassword({email:email.trim(),password});setPassword('');if(result.error)throw result.error;}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
  async function finalVerdict(){setBusy(true);setError('');try{await request('/verdict','POST',{version:0,decision,notes:verdictNotes});await refresh();setStatus('Final research verdict recorded.');}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
  const completed=index?.cases.filter(c=>c.submitted).length||0;
  return <Layout><main className="holter-review container">
    <Link to="/active-research">← Research studies</Link>
    <div className="holter-heading"><div><p className="holter-eyebrow">PRIVATE RESEARCH REVIEW · HOLTER</p><h1>Holter report review</h1><p>Independent assessment of computer-generated reports from exported XML measurements.</p></div><span className="holter-badge">Research pilot</span></div>
    <div className="holter-notice">This workspace is separate from the burnout and thalassemia studies. Reports and revisions are stored on the study laptop. A research verdict is not clinical sign-off. The laptop must be awake and connected.</div>
    {error&&<div role="alert" className="holter-error">{error} {user&&!dirty&&<button onClick={()=>refresh().then(r=>{setError('');if(r.role==='reviewer'&&r.cases.length)openCase(r.cases[0].id);}).catch(e=>setError(e.message))}>Retry connection</button>}</div>}
    {loading?<p role="status">Checking your Academy session…</p>:!user?<form onSubmit={login} className="holter-panel holter-login"><h2>Use your existing Academy account</h2><p>Holter access is assigned separately. You do not need a new account.</p><label>Email<input type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required/></label><button className="btn btn-primary" disabled={busy}>Sign in to Holter</button><p><Link to="/login">Account or password help</Link></p></form>:<>
      <div className="holter-toolbar"><span>Signed in as {user.email}</span><button disabled={dirty||busy} onClick={()=>supabase.auth.signOut()}>Sign out</button><strong role="status" aria-live="polite">{status}</strong></div>
      {index?.role==='owner'&&progress&&<section className="holter-panel"><h2>Reviewer progress</h2><p>{progress.reviews.filter((r:any)=>r.submitted).length} submitted assessments · {progress.total_assessments} assigned per reviewer. Updates every 15 seconds.</p><div className="holter-table-scroll"><table><thead><tr><th>Assessment</th><th>Rating</th><th>Status</th><th>Saved</th><th>History</th></tr></thead><tbody>{progress.reviews.map((r:any)=><tr key={`${r.user_id}-${r.case_id}`}><td>{r.case_id}</td><td>{r.rating}</td><td>{r.submitted?'Submitted':'Draft'}</td><td>{new Date(r.updated).toLocaleString()}</td><td><button onClick={()=>request(`/history/${r.case_id}`).then(setHistory).catch(e=>setError(e.message))}>View revisions</button></td></tr>)}</tbody></table></div>{progress.verdicts.map((v:any)=><article key={v.user_id}><h3>{v.decision}</h3><p className="holter-report">{v.notes}</p></article>)}</section>}
      {index?.role==='reviewer'&&<><div className="holter-toolbar"><label>Assessment<select aria-label="Assessment" value={current?.id||''} disabled={busy||dirty} onChange={e=>openCase(e.target.value)}>{index.cases.map(c=><option key={c.id} value={c.id}>{c.id}{c.submitted?' · submitted':''}</option>)}</select></label><strong>{completed} / {index.cases.length} submitted</strong><span>Model identities remain hidden.</span></div>
      {current&&draft&&<><div className="holter-grid"><section className="holter-panel"><h2>XML measurements</h2><p>Software measurements, not independently verified ECG findings. “Not supplied” does not mean normal or absent.</p><table><thead><tr><th>Measurement</th><th>Value</th></tr></thead><tbody>{current.measurements.map(m=><tr key={m.label}><th scope="row">{m.label}</th><td>{m.value===null||m.value===undefined?'Not supplied':`${m.value} ${m.unit}`}</td></tr>)}</tbody></table></section><section className="holter-panel"><h2>Blinded generated report</h2><p className="holter-report">{current.candidate}</p><hr/><h2>Original cardiologist report</h2><p className="holter-report">{current.reference}</p><p>Use the reference for comparison. If the XML and reference disagree or waveforms are needed, mark insufficient evidence.</p></section></div>
      <section className="holter-panel"><h2>Your assessment — {current.id}</h2><fieldset disabled={busy||draft.submitted}><div className="holter-grid"><label>Overall rating<select value={draft.rating} onChange={e=>change('rating',e.target.value)}>{RATINGS.map(r=><option key={r}>{r}</option>)}</select></label>{([['numerical_accuracy','Numerical accuracy'],['omissions','Clinically important omissions'],['unsupported_claims','Unsupported interpretations'],['clinical_safety','Clinical safety']] as const).map(([k,label])=><label key={k}>{label}<select value={draft[k]} onChange={e=>change(k,e.target.value)}>{DIMENSIONS.map(r=><option key={r}>{r}</option>)}</select></label>)}</div><label>Reviewer notes — describe errors, missing findings, or needed evidence<textarea rows={4} maxLength={20000} value={draft.notes} onChange={e=>change('notes',e.target.value)}/></label><label>Suggested corrected report (optional)<textarea rows={5} maxLength={20000} value={draft.edited_report} onChange={e=>change('edited_report',e.target.value)}/></label></fieldset><p>Changes save automatically after a short pause. Wait for “Saved on laptop” before closing. Submitting locks this assessment.</p><div className="holter-toolbar"><button disabled={busy||!dirty||draft.submitted} onClick={()=>save()}>Save now / retry</button><button className="btn btn-primary" disabled={busy||dirty||draft.submitted||draft.rating==='Not reviewed'} onClick={()=>{if(window.confirm('Submit and lock this assessment? Please check your ratings and notes first.'))save(true);}}>Submit assessment</button><button disabled={busy} onClick={()=>request(`/history/${current.id}`).then(setHistory).catch(e=>setError(e.message))}>View saved revisions</button></div></section></>}
      <section className="holter-panel"><h2>Final research verdict</h2>{index.verdict?<><h3>{index.verdict.decision}</h3><p className="holter-report">{index.verdict.notes}</p></>:<><p>Available after all {index.cases.length} assessments are submitted. This evaluates readiness for further validation, not autonomous clinical use.</p><fieldset disabled={busy||completed!==index.cases.length||!completed}><label>Decision<select value={decision} onChange={e=>setDecision(e.target.value)}>{['Further development required','Suitable for further prospective validation','Insufficient evidence to judge'].map(v=><option key={v}>{v}</option>)}</select></label><label>Rationale and required improvements<textarea rows={4} value={verdictNotes} onChange={e=>setVerdictNotes(e.target.value)} maxLength={20000}/></label><button className="btn btn-primary" disabled={verdictNotes.trim().length<10} onClick={()=>{if(window.confirm('Submit your final research verdict? This will be recorded and locked.'))finalVerdict();}}>Submit final verdict</button></fieldset></>}</section></>}
      {history&&<section className="holter-panel"><h2>Saved revision history</h2><button onClick={()=>setHistory(null)}>Close history</button>{history.length===0?<p>No saved revisions yet.</p>:history.map((h,i)=><article key={i}><h3>Version {h.version} · {h.event} · {new Date(h.created).toLocaleString()}</h3><p>{h.review.rating}</p><p className="holter-report">{h.review.notes}</p>{h.review.edited_report&&<p className="holter-report">{h.review.edited_report}</p>}</article>)}</section>}
    </>}
  </main></Layout>;
}
