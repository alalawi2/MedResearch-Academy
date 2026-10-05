import {createClient} from '@supabase/supabase-js';
import {authorizedJob,allRows,checked,deliverEmail,escapeHtml} from '../shared/notification-safety.js';
import {loadCoverage} from '../shared/whoop-coverage.js';
export default async function handler(req:any,res:any){
 if(!authorizedJob(req))return res.status(401).json({error:'Unauthorized'});
 if(!['GET','POST'].includes(req.method))return res.status(405).end();
 try{
  const db=createClient(process.env.VITE_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const participants=(await allRows(()=>db.from('burnout_participants').select('id,study_id,study_participant_id,full_name,email,enrollment_date').eq('status','active').not('whoop_user_id','is',null).order('id'))).filter(p=>/^RES-\d+$/.test(p.study_participant_id));
  const coverage=await loadCoverage(db,participants);
  const alerts=await allRows(()=>db.from('adherence_alerts').select('id,resident_id').is('invalidated_at',null).gte('created_at',new Date(Date.now()-7*86400000).toISOString()).order('id'));
  const cooldown=new Set(alerts.map(a=>a.resident_id));
  const dryRun=req.query?.dry_run==='true';const results=[];
  for(const p of participants){
   const c=coverage.get(p.id)!;
   let action=c.state;
   if(c.state==='ready')action=c.pct!>=70?'ok':cooldown.has(p.id)?'cooldown':!p.email?'no_email':'data_gap_reminder';
   if(action==='data_gap_reminder'&&!dryRun){
    const body={from:'WHOOP Resident Study Team <info@medresearch-academy.om>',to:[p.email],subject:'OMSB Burnout Study — WHOOP data check',html:`<p>Dear ${escapeHtml(p.full_name||'Participant')},</p><p>Our research database contains WHOOP data on ${c.recorded} of ${c.expected} completed days (${c.pct}%) in the period starting ${c.start} and ending before ${c.end} (Oman time).</p><p>This measures available research data, not continuous wear time. Missing records do not establish that you were not wearing your device.</p><p>Please check that your WHOOP app is syncing. If you have been wearing it normally, let us know so we can investigate the connection. You do not need to repeat any completed assessment.</p><p>WHOOP Resident Study Team</p>`};
    await deliverEmail(body,`whoop-gap-${p.id}-${c.end}`);
    checked(await db.from('adherence_alerts').insert({study_id:p.study_id,resident_id:p.id,alert_type:'warning',pct_recorded:c.pct,days_with_data:c.recorded,message_sent_to:[p.email]}));
   }
   results.push({participant:p.study_participant_id,...c,action});
  }
  return res.json({dry_run:dryRun,checked:results.length,results});
 }catch(e:any){return res.status(503).json({error:e.message});}
}
