export function omanMonday(now=new Date()){
 const d=new Date(now.getTime()+4*3600000);
 d.setUTCHours(0,0,0,0);
 d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7));
 return d.toISOString().slice(0,10);
}
export function shiftDate(date:string,days:number){return new Date(Date.parse(date+'T00:00:00Z')+days*86400000).toISOString().slice(0,10)}
export function availableWeeks(enrollment:string|null,now=new Date()){
 if(!enrollment)return [];
 const first=omanMonday(new Date(enrollment+'T12:00:00+04:00'));
 const end=shiftDate(enrollment,364);
 const latest=omanMonday(new Date(Math.min(now.getTime(),Date.parse(end+'T23:59:59+04:00'))));
 const weeks:string[]=[];
 for(let day=latest;day>=first&&weeks.length<54;day=shiftDate(day,-7))weeks.push(day);
 return weeks;
}
