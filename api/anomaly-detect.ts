import {authorizedJob} from '../shared/notification-safety.js';
export default async function handler(req:any,res:any){
 if(!authorizedJob(req))return res.status(401).json({error:'Unauthorized'});
 return res.json({paused:true,reason:'Anomaly messaging suspended pending validated daily-data windows and research protocol review.'});
}
