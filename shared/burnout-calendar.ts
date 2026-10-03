interface BlockDef {
  block: number;
  start: string; // MM-DD
  end: string;   // MM-DD
  label: string;
}

// Block dates per academic year — keyed by AY start year
// AY 2025-2026 uses the old schedule, AY 2026-2027+ uses the official OMSB calendar
const BLOCK_SCHEDULES: Record<string, BlockDef[]> = {
  '2025': [
    { block: 1,  start: '09-01', end: '09-27', label: 'Block 1: Sep 1 - Sep 27' },
    { block: 2,  start: '09-28', end: '10-25', label: 'Block 2: Sep 28 - Oct 25' },
    { block: 3,  start: '10-27', end: '11-22', label: 'Block 3: Oct 27 - Nov 22' },
    { block: 4,  start: '11-23', end: '12-20', label: 'Block 4: Nov 23 - Dec 20' },
    { block: 5,  start: '12-21', end: '01-17', label: 'Block 5: Dec 21 - Jan 17' },
    { block: 6,  start: '01-18', end: '02-14', label: 'Block 6: Jan 18 - Feb 14' },
    { block: 7,  start: '02-15', end: '03-14', label: 'Block 7: Feb 15 - Mar 14' },
    { block: 8,  start: '03-15', end: '04-11', label: 'Block 8: Mar 15 - Apr 11' },
    { block: 9,  start: '04-12', end: '05-09', label: 'Block 9: Apr 12 - May 9' },
    { block: 10, start: '05-10', end: '06-06', label: 'Block 10: May 10 - Jun 6' },
    { block: 11, start: '06-07', end: '07-06', label: 'Block 11: Jun 7 - Jul 6' },
    { block: 12, start: '07-07', end: '08-01', label: 'Block 12: Jul 7 - Aug 1' },
    { block: 13, start: '08-02', end: '08-31', label: 'Block 13: Aug 2 - Aug 31' },
  ],
  '2026': [
    { block: 1,  start: '09-01', end: '09-26', label: 'Block 1: Sep 1 - Sep 26' },
    { block: 2,  start: '09-27', end: '10-24', label: 'Block 2: Sep 27 - Oct 24' },
    { block: 3,  start: '10-25', end: '11-21', label: 'Block 3: Oct 25 - Nov 21' },
    { block: 4,  start: '11-22', end: '12-19', label: 'Block 4: Nov 22 - Dec 19' },
    { block: 5,  start: '12-20', end: '01-16', label: 'Block 5: Dec 20 - Jan 16' },
    { block: 6,  start: '01-17', end: '02-13', label: 'Block 6: Jan 17 - Feb 13' },
    { block: 7,  start: '02-14', end: '03-13', label: 'Block 7: Feb 14 - Mar 13' },
    { block: 8,  start: '03-14', end: '04-10', label: 'Block 8: Mar 14 - Apr 10' },
    { block: 9,  start: '04-11', end: '05-08', label: 'Block 9: Apr 11 - May 8' },
    { block: 10, start: '05-09', end: '06-05', label: 'Block 10: May 9 - Jun 5' },
    { block: 11, start: '06-06', end: '07-03', label: 'Block 11: Jun 6 - Jul 3' },
    { block: 12, start: '07-04', end: '07-31', label: 'Block 12: Jul 4 - Jul 31' },
    { block: 13, start: '08-01', end: '08-31', label: 'Block 13: Aug 1 - Aug 31' },
  ],
  '2027': [
    { block: 1,  start: '09-01', end: '09-25', label: 'Block 1: Sep 1 - Sep 25' },
    { block: 2,  start: '09-26', end: '10-23', label: 'Block 2: Sep 26 - Oct 23' },
    { block: 3,  start: '10-24', end: '11-20', label: 'Block 3: Oct 24 - Nov 20' },
    { block: 4,  start: '11-21', end: '12-18', label: 'Block 4: Nov 21 - Dec 18' },
    { block: 5,  start: '12-19', end: '01-15', label: 'Block 5: Dec 19 - Jan 15' },
    { block: 6,  start: '01-16', end: '02-12', label: 'Block 6: Jan 16 - Feb 12' },
    { block: 7,  start: '02-13', end: '03-11', label: 'Block 7: Feb 13 - Mar 11' },
    { block: 8,  start: '03-12', end: '04-08', label: 'Block 8: Mar 12 - Apr 8' },
    { block: 9,  start: '04-09', end: '05-06', label: 'Block 9: Apr 9 - May 6' },
    { block: 10, start: '05-07', end: '06-03', label: 'Block 10: May 7 - Jun 3' },
    { block: 11, start: '06-04', end: '07-01', label: 'Block 11: Jun 4 - Jul 1' },
    { block: 12, start: '07-02', end: '07-29', label: 'Block 12: Jul 2 - Jul 29' },
    { block: 13, start: '07-30', end: '08-31', label: 'Block 13: Jul 30 - Aug 31' },
  ],
};


export interface CurrentBlockInfo {
 block:number; label:string; startDate:Date; endDate:Date; canSubmit:boolean;
 submissionOpensDate:Date; daysUntilOpen:number; academicYear:string;
}
const DAY = 86400000;
export function omanToday(now = new Date()): Date {
 return new Date(new Date(now.getTime()+4*3600000).toISOString().slice(0,10)+'T00:00:00Z');
}
export function academicYearStart(now = new Date()): number {
 const day=omanToday(now); return day.getUTCFullYear()-(day.getUTCMonth()<8?1:0);
}
export function blocksForYear(year:number, now=new Date()): CurrentBlockInfo[] {
 const schedule=BLOCK_SCHEDULES[String(year)];
 if (!schedule) return [];
 const today=omanToday(now);
 return schedule.map(b=>{
  const [sm,sd]=b.start.split('-').map(Number), [em,ed]=b.end.split('-').map(Number);
  const startDate=new Date(Date.UTC(year+(sm<9?1:0),sm-1,sd));
  const endDate=new Date(Date.UTC(year+(em<9?1:0),em-1,ed));
  const submissionOpensDate=new Date(startDate.getTime()+14*DAY);
  return {block:b.block,label:b.label,startDate,endDate,submissionOpensDate,
   academicYear:`${year}-${year+1}`,canSubmit:today>=submissionOpensDate,
   daysUntilOpen:Math.max(0,Math.ceil((submissionOpensDate.getTime()-today.getTime())/DAY))};
 });
}
export function getCurrentBlock(now=new Date()):CurrentBlockInfo|null {
 const day=omanToday(now);
 return blocksForYear(academicYearStart(now),now).find(b=>day>=b.startDate&&day<=b.endDate)??null;
}
export function getPastBlocksSinceEnrollment(enrollmentDate:Date,now=new Date()):CurrentBlockInfo[] {
 const day=omanToday(now), year=academicYearStart(now);
 return [year,year-1].flatMap(y=>blocksForYear(y,now))
  .filter(b=>b.endDate<day&&enrollmentDate<=b.endDate)
  .sort((a,b)=>b.endDate.getTime()-a.endDate.getTime());
}
export function validateBlockSubmission(block:number,ay:string,enrollment:string|null,now=new Date()):string|null {
 if (!Number.isInteger(block)||!/^\d{4}-\d{4}$/.test(ay)) return 'Invalid block or academic year.';
 const year=Number(ay.slice(0,4));
 const target=blocksForYear(year,now).find(b=>b.block===block&&b.academicYear===ay);
 if (!target) return 'Unknown block calendar.';
 if (!enrollment || !Number.isFinite(Date.parse(enrollment))) return 'Enrollment date requires coordinator review.';
 if (new Date(enrollment.slice(0,10)+'T00:00:00Z')>target.endDate) return 'This block ended before your enrollment.';
 if (!target.canSubmit) return `Block ${block} opens on ${target.submissionOpensDate.toISOString().slice(0,10)} (Oman time).`;
 return null;
}

