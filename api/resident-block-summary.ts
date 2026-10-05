import {authorizedJob} from '../shared/notification-safety.js';
export default async function handler(req:any,res:any){
 if(!authorizedJob(req))return res.status(401).json({error:'Unauthorized'});
 return res.json({paused:true,reason:'Personalized summary emails pending validated coverage and research interpretation.'});
}
