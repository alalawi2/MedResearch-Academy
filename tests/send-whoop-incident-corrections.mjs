// Explicit one-time incident remediation. Never run as part of automated tests.
// Requires --send and a production environment file. Stable provider keys prevent immediate retries duplicating mail.
import {createClient} from '@supabase/supabase-js';
if(process.argv[2]!=='--send')throw new Error('Requires explicit --send');
const db=createClient(process.env.VITE_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
const check=r=>{if(r.error)throw r.error;return r.data;};
const alerts=check(await db.from('adherence_alerts').select('id,resident_id,message_sent_to,correction_sent_at').gte('created_at','2026-10-03').not('invalidated_at','is',null).eq('invalidation_reason','Importer omitted percentage; reminder converted unknown to zero.'));
const ids=[...new Set(alerts.map(a=>a.resident_id))];
const people=check(await db.from('burnout_participants').select('id,study_participant_id,email').in('id',ids));
for(const p of people){
 const related=alerts.filter(a=>a.resident_id===p.id);
 if(related.every(a=>a.correction_sent_at)){console.log(p.study_participant_id,'already corrected');continue;}
 if(!p.email||!related.some(a=>a.message_sent_to?.includes(p.email)))throw new Error('Recipient mismatch; requires review');
 const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`whoop-zero-incident-20261004-${p.id}`},body:JSON.stringify({from:'WHOOP Resident Study Team <info@medresearch-academy.om>',to:[p.email],subject:'Correction: your recent WHOOP adherence warning',text:'Dear Participant,\n\nPlease disregard the recent WHOOP warning that reported 0% despite showing recorded days. We identified an error in our research platform: a missing calculated percentage was incorrectly displayed as zero. That warning does not establish poor device wear or poor data quality.\n\nWe have corrected the warning logic and marked the incorrect alert invalid in our records. No repeat assessment or WHOOP reconnection is needed because of that warning. Please continue your usual device use. If your portal still shows a problem, reply so we can investigate.\n\nWe apologise for the confusion and appreciate your participation.\n\nWHOOP Resident Study Team'})});
 if(!response.ok)throw new Error(`Provider ${response.status}; stopped`);
 const result=await response.json();
 check(await db.from('adherence_alerts').update({correction_sent_at:new Date().toISOString(),correction_provider_id:result.id}).in('id',related.map(a=>a.id)));
 console.log(p.study_participant_id,'correction accepted by email provider');
 await new Promise(r=>setTimeout(r,700));
}
const teamRecipients=['dr.abdullahalalawi@gmail.com','mrawahi@squ.edu.om'].filter(email=>alerts.some(a=>a.message_sent_to?.includes(email)));
const previous=check(await db.from('audit_log').select('id').eq('action','whoop_zero_incident_team_correction_20261004').limit(1));
if(teamRecipients.length&&!previous.length){
 const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':'whoop-zero-incident-team-20261004'},body:JSON.stringify({from:'WHOOP Resident Study Team <info@medresearch-academy.om>',to:teamRecipients,subject:'Correction: five WHOOP adherence alerts on 4 October',text:`The 0% WHOOP alerts for ${people.map(p=>p.study_participant_id).sort().join(', ')} were generated incorrectly: a missing summary percentage was converted to zero despite recorded days. Please disregard those alerts and do not classify these residents as noncompliant on that basis.\n\nThe five alerts have been marked invalid, and correction emails have been sent individually. Reminder logic now separates incomplete imports and connection problems from measured data gaps. Enrollment dates overwritten by WHOOP reconnection have been restored using original linking events.\n\nNo repeat assessments are required because of these false warnings. Biometric anomaly and personalized summary emails are paused pending validation of their comparison windows and interpretation.`})});
 if(!r.ok)throw new Error('Team correction rejected: '+r.status);
 const value=await r.json();check(await db.from('audit_log').insert({action:'whoop_zero_incident_team_correction_20261004',entity_type:'adherence_alerts',details:{provider_id:value.id,recipients:teamRecipients}}));
 console.log('Research-team correction accepted by email provider');
}
