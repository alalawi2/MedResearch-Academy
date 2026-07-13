import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// Unified Study Reminder & Report System
// Schedule: Daily at 05:00 UTC (09:00 Oman time)
//
// Combines three former endpoints:
//   1. Enrollment reminders (demographics + baseline)
//   2. Current block assessment escalation (5-level)
//   3. Missed past block reminders + coordinator/team reports
//
// Resident reminders:
//   Enrollment: Day 3 gentle, Day 7 urgent
//   Current block: 5-level escalation (Day 0→1→2→3→4→coordinator)
//   Missed blocks: reminder with list of missed blocks
//
// Team reports:
//   Daily enrollment summary (replaces daily-enrollment-report)
//   Coordinator reports for missed blocks (grouped by coordinator)
// ============================================================================

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const CRON_SECRET = process.env.CRON_SECRET || SUPABASE_KEY;
const SITE_URL = process.env.SITE_URL || 'https://www.medresearch-academy.om';

const TEAM_EMAILS = [
  'dr.abdullahalalawi@gmail.com',
  'mrawahi@squ.edu.om',
  'masoud.kashoob@gmail.com',
  'salim.sas1992@gmail.com',
  'jhsm41191@gmail.com',
  'dradil@squ.edu.om',
  'tamadhiralmahrouqi@gmail.com',
  'a.altoubi@squ.edu.om',
  'nuhahabsi7@gmail.com',
  'altaeiomar11@gmail.com',
  'd.alaamri@squ.edu.om',
];

const PI_EMAILS = ['dr.abdullahalalawi@gmail.com', 'mrawahi@squ.edu.om'];

const COORDINATOR_CC = [
  'tamadhiralmahrouqi@gmail.com',
  'dr.abdullahalalawi@gmail.com',
  'mrawahi@squ.edu.om',
];

// Block schedule: 13 blocks of ~4 weeks each (OMSB academic year Sep-Aug)
const BLOCK_DEFS = [
  { block: 1,  startMD: '09-01', endMD: '09-27' },
  { block: 2,  startMD: '09-28', endMD: '10-25' },
  { block: 3,  startMD: '10-27', endMD: '11-22' },
  { block: 4,  startMD: '11-23', endMD: '12-20' },
  { block: 5,  startMD: '12-21', endMD: '01-17' },
  { block: 6,  startMD: '01-18', endMD: '02-14' },
  { block: 7,  startMD: '02-15', endMD: '03-14' },
  { block: 8,  startMD: '03-15', endMD: '04-11' },
  { block: 9,  startMD: '04-12', endMD: '05-09' },
  { block: 10, startMD: '05-10', endMD: '06-06' },
  { block: 11, startMD: '06-07', endMD: '07-06' },
  { block: 12, startMD: '07-07', endMD: '08-01' },
  { block: 13, startMD: '08-02', endMD: '08-31' },
];

const ASSESSMENT_WINDOW_DAY = 15;

// ============================================================================
// Types
// ============================================================================

interface Participant {
  id: string;
  study_id: string;
  study_participant_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  enrollment_date: string | null;
  created_at: string;
  demographics_completed: boolean;
  baseline_completed: boolean;
  whoop_user_id: string | null;
  auth_user_id: string | null;
  coordinator_group: string | null;
  coordinator_name: string | null;
  coordinator_email: string | null;
}

interface BlockDates {
  block: number;
  start: Date;
  end: Date;
  label: string;
}

interface CurrentBlock extends BlockDates {
  windowOpened: Date;
  daysOverdue: number;
}

// ============================================================================
// Block helpers
// ============================================================================

function resolveAllBlocks(today: Date): BlockDates[] {
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const academicStartYear = month >= 9 ? year : year - 1;
  const results: BlockDates[] = [];

  for (const b of BLOCK_DEFS) {
    const [sm, sd] = b.startMD.split('-').map(Number);
    const [em, ed] = b.endMD.split('-').map(Number);
    let startYear = sm >= 9 ? academicStartYear : academicStartYear + 1;
    let endYear = em >= 9 ? academicStartYear : academicStartYear + 1;
    if (sm === 12 && em === 1) { startYear = academicStartYear; endYear = academicStartYear + 1; }

    const start = new Date(Date.UTC(startYear, sm - 1, sd));
    const end = new Date(Date.UTC(endYear, em - 1, ed));
    const sl = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
    const el = end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
    results.push({ block: b.block, start, end, label: `Block ${b.block}: ${sl} - ${el}` });
  }
  return results;
}

function getCurrentBlock(today: Date, allBlocks: BlockDates[]): CurrentBlock | null {
  const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

  for (const b of allBlocks) {
    if (todayUTC >= b.start && todayUTC <= b.end) {
      const windowOpened = new Date(b.start);
      windowOpened.setUTCDate(windowOpened.getUTCDate() + ASSESSMENT_WINDOW_DAY);
      const daysOverdue = Math.floor((todayUTC.getTime() - windowOpened.getTime()) / (1000 * 60 * 60 * 24));
      return { ...b, windowOpened, daysOverdue };
    }
  }
  return null;
}

function getEscalationLevel(daysOverdue: number): number {
  if (daysOverdue >= 7) return 5;
  if (daysOverdue >= 6) return 4;
  if (daysOverdue >= 4) return 3;
  if (daysOverdue >= 2) return 2;
  if (daysOverdue >= 0) return 1;
  return 0;
}

// ============================================================================
// Email sender
// ============================================================================

async function sendEmail(to: string[], subject: string, html: string, cc?: string[]) {
  const body: Record<string, unknown> = {
    from: 'OMSB Burnout Study <info@medresearch-academy.om>',
    to,
    subject,
    html,
  };
  if (cc && cc.length > 0) body.cc = cc;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

// ============================================================================
// Email templates
// ============================================================================

function enrollmentReminderHtml(name: string, missing: string[], loginUrl: string, daysSinceEnrollment: number): string {
  const isUrgent = daysSinceEnrollment >= 7;
  return `<div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #333;">
<div style="background: ${isUrgent ? '#ea580c' : '#0f766e'}; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
  <h1 style="color: white; margin: 0; font-size: 18px;">${isUrgent ? 'Please Complete Your Enrollment' : 'Welcome — Complete Your Setup'}</h1>
</div>
<div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
  <p>Dear ${name},</p>
  <p>Thank you for enrolling in the OMSB Resident Burnout Study. To begin collecting your data, we need you to complete the following:</p>
  <ul style="line-height: 1.8;">${missing.map(m => `<li><strong>${m}</strong></li>`).join('')}</ul>
  ${isUrgent ? '<p style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 12px; color: #9a3412;">Your enrollment forms are still incomplete after ' + daysSinceEnrollment + ' days. Please complete them so we can start analyzing your WHOOP data.</p>' : ''}
  <div style="text-align: center; margin: 24px 0;">
    <a href="${loginUrl}" style="display: inline-block; background: #0f766e; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Complete Setup</a>
  </div>
  <p style="font-size: 13px; color: #666;">Takes about 5 minutes. Your data is confidential.</p>
</div></div>`;
}

function blockReminderHtml(name: string, level: number, blockNum: number, loginUrl: string, missingItems: string[]): string {
  const style = { bg: '#0f766e', text: level === 1 ? 'Assessment Window Open' : level === 2 ? 'Gentle Reminder' : level === 3 ? 'Friendly Reminder' : 'Reminder' };
  const missingList = missingItems.map(i => `<li>${i}</li>`).join('');
  return `<div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #333;">
<div style="background: ${style.bg}; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
  <h1 style="color: white; margin: 0; font-size: 18px;">Block ${blockNum} — ${style.text}</h1>
</div>
<div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
  <p>Dear ${name},</p>
  <p>The assessment window for <strong>Block ${blockNum}</strong> of the OMSB Resident Burnout Study is now open. We need your input to correlate with your WHOOP biophysical data.</p>
  <p><strong>Outstanding items:</strong></p>
  <ul style="line-height: 1.8;">${missingList}</ul>
  <div style="text-align: center; margin: 24px 0;">
    <a href="${loginUrl}" style="display: inline-block; background: ${style.bg}; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Complete Assessment</a>
  </div>
  <p style="font-size: 13px; color: #666;">Estimated time: 8-10 minutes. Your responses are confidential and used only for research purposes.</p>
</div></div>`;
}

function missedBlockReminderHtml(name: string, missedBlocks: BlockDates[], loginUrl: string): string {
  const blockList = missedBlocks.map(b => `<li style="margin-bottom: 4px;"><strong>${b.label}</strong></li>`).join('');
  return `<div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #333;">
<div style="background: #b45309; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
  <h1 style="color: white; margin: 0; font-size: 18px;">Missed Block Assessment${missedBlocks.length > 1 ? 's' : ''}</h1>
</div>
<div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
  <p>Dear ${name},</p>
  <p>You have not yet completed your end-of-block assessment for:</p>
  <ul style="line-height: 1.8; color: #b45309;">${blockList}</ul>
  <p>Your assessment data is essential for correlating with your WHOOP biophysical measurements. <strong>Late submissions are now enabled</strong> — please reflect on your experience during that rotation period when answering.</p>
  <div style="text-align: center; margin: 24px 0;">
    <a href="${loginUrl}" style="display: inline-block; background: #b45309; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Complete Assessment</a>
  </div>
  <p style="font-size: 13px; color: #666;">Estimated time: 8-10 minutes per block. Your responses are confidential.</p>
</div></div>`;
}

function coordinatorEscalationHtml(
  coordName: string,
  currentBlockOverdue: Array<{ name: string; email: string | null; phone: string | null; daysOverdue: number }>,
  missedBlockResidents: Array<{ name: string; phone: string | null; missedBlocks: string[] }>,
  currentBlockNum: number | null,
): string {
  let sections = '';

  if (currentBlockOverdue.length > 0 && currentBlockNum) {
    const rows = currentBlockOverdue.map(r => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${r.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${r.phone || '-'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #dc2626; font-weight: 700;">${r.daysOverdue} days</td>
      </tr>`).join('');

    sections += `<h3 style="color: #dc2626; margin: 16px 0 8px;">Current Block ${currentBlockNum} — Overdue</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
      <thead><tr style="background: #f9fafb;">
        <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Name</th>
        <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Phone</th>
        <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Overdue</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  if (missedBlockResidents.length > 0) {
    const rows = missedBlockResidents.map(r => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${r.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${r.phone || '-'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #b45309;">${r.missedBlocks.join(', ')}</td>
      </tr>`).join('');

    sections += `<h3 style="color: #b45309; margin: 16px 0 8px;">Missed Past Blocks</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <thead><tr style="background: #f9fafb;">
        <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Name</th>
        <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Phone</th>
        <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Missed</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  return `<div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; color: #333;">
<div style="background: #dc2626; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
  <h1 style="color: white; margin: 0; font-size: 18px;">Your Residents — Action Required</h1>
</div>
<div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
  <p>Dear ${coordName},</p>
  <p>The following residents assigned to you need follow-up. Please contact them directly (phone or in-person).</p>
  ${sections}
  <p style="font-size: 13px; color: #666;">Once a resident completes their assessment, they are automatically removed from future reports.</p>
</div></div>`;
}

function dailyTeamReportHtml(
  today: string,
  participants: Participant[],
  submittedByResident: Map<string, Set<number>>,
  allBlocks: BlockDates[],
  currentBlock: CurrentBlock | null,
): string {
  const real = participants.filter(p => p.study_participant_id !== 'RES-TEST');
  const total = real.length;
  const whoopLinked = real.filter(p => p.whoop_user_id).length;
  const demoComplete = real.filter(p => p.demographics_completed).length;
  const baselineComplete = real.filter(p => p.baseline_completed).length;
  const formsComplete = real.filter(p => p.demographics_completed && p.baseline_completed).length;
  const incomplete = real.filter(p => !p.demographics_completed || !p.baseline_completed);

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const newToday = real.filter(p => p.enrollment_date === today);
  const newYesterday = real.filter(p => p.enrollment_date === yesterday);

  // Block completion summary
  const todayUTC = new Date(today + 'T00:00:00Z');
  const pastBlocks = allBlocks.filter(b => b.end < todayUTC);
  let blockSummaryRows = '';
  for (const b of pastBlocks) {
    const eligible = real.filter(p => {
      const enroll = p.enrollment_date ? new Date(p.enrollment_date + 'T00:00:00Z') : new Date('2026-04-01T00:00:00Z');
      return b.end >= enroll;
    });
    if (eligible.length === 0) continue;
    const completed = eligible.filter(p => (submittedByResident.get(p.id) || new Set()).has(b.block)).length;
    const rate = Math.round((completed / eligible.length) * 100);
    const color = rate >= 80 ? '#16a34a' : rate >= 50 ? '#d97706' : '#dc2626';
    blockSummaryRows += `<tr>
      <td style="padding:5px 8px;border-bottom:1px solid #eee;font-size:12px">${b.label}</td>
      <td style="padding:5px 8px;border-bottom:1px solid #eee;font-size:12px;text-align:center;color:${color};font-weight:700">${completed}/${eligible.length} (${rate}%)</td>
      <td style="padding:5px 8px;border-bottom:1px solid #eee;font-size:12px;text-align:center;color:${eligible.length - completed > 0 ? '#dc2626' : '#16a34a'}">${eligible.length - completed}</td>
    </tr>`;
  }

  if (currentBlock) {
    const eligible = real.filter(p => {
      const enroll = p.enrollment_date ? new Date(p.enrollment_date + 'T00:00:00Z') : new Date('2026-04-01T00:00:00Z');
      return currentBlock.start >= enroll || currentBlock.end >= enroll;
    });
    const completed = eligible.filter(p => (submittedByResident.get(p.id) || new Set()).has(currentBlock.block)).length;
    const rate = eligible.length > 0 ? Math.round((completed / eligible.length) * 100) : 0;
    const windowOpen = currentBlock.daysOverdue >= 0;
    blockSummaryRows += `<tr style="background:#f0f9ff;">
      <td style="padding:5px 8px;border-bottom:1px solid #eee;font-size:12px;font-weight:600">${currentBlock.label} (current${windowOpen ? '' : ' — not yet open'})</td>
      <td style="padding:5px 8px;border-bottom:1px solid #eee;font-size:12px;text-align:center;font-weight:600">${completed}/${eligible.length} (${rate}%)</td>
      <td style="padding:5px 8px;border-bottom:1px solid #eee;font-size:12px;text-align:center">${eligible.length - completed}</td>
    </tr>`;
  }

  // Incomplete enrollment list
  const incompleteRows = incomplete.map(p => {
    const missing = [];
    if (!p.demographics_completed) missing.push('Demographics');
    if (!p.baseline_completed) missing.push('Baseline');
    return `<tr><td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:12px">${p.full_name}</td><td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:12px">${p.phone || '-'}</td><td style="padding:4px 8px;border-bottom:1px solid #eee;font-size:12px;color:#dc2626">${missing.join(', ')}</td></tr>`;
  }).join('');

  return `<div style="font-family:Arial,sans-serif;max-width:750px;margin:0 auto;color:#333">
<div style="background:#1e3a5f;padding:20px;border-radius:12px 12px 0 0;text-align:center">
  <h1 style="color:white;margin:0;font-size:18px">Daily Study Report</h1>
  <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:13px">OMSB Resident Burnout Study — ${today}</p>
</div>
<div style="background:#fff;border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 12px 12px">

<table style="width:100%;font-size:14px;margin-bottom:20px;border-collapse:collapse">
  <tr>
    <td style="padding:8px;background:#f0fdf4;border-radius:8px;text-align:center;width:16%"><strong style="font-size:24px;color:#0f766e">${total}</strong><br><span style="font-size:11px;color:#666">Enrolled</span></td>
    <td style="padding:8px;background:#f0fdf4;border-radius:8px;text-align:center;width:16%"><strong style="font-size:24px;color:#0f766e">${whoopLinked}</strong><br><span style="font-size:11px;color:#666">WHOOP</span></td>
    <td style="padding:8px;background:#f0fdf4;border-radius:8px;text-align:center;width:16%"><strong style="font-size:24px;color:#0f766e">${demoComplete}</strong><br><span style="font-size:11px;color:#666">Demo</span></td>
    <td style="padding:8px;background:#f0fdf4;border-radius:8px;text-align:center;width:16%"><strong style="font-size:24px;color:#0f766e">${baselineComplete}</strong><br><span style="font-size:11px;color:#666">Baseline</span></td>
    <td style="padding:8px;background:${incomplete.length > 0 ? '#fef2f2' : '#f0fdf4'};border-radius:8px;text-align:center;width:16%"><strong style="font-size:24px;color:${incomplete.length > 0 ? '#dc2626' : '#0f766e'}">${incomplete.length}</strong><br><span style="font-size:11px;color:#666">Incomplete</span></td>
    <td style="padding:8px;background:${newToday.length > 0 ? '#fffbeb' : '#f0fdf4'};border-radius:8px;text-align:center;width:16%"><strong style="font-size:24px;color:#f59e0b">${newToday.length + newYesterday.length}</strong><br><span style="font-size:11px;color:#666">New (48h)</span></td>
  </tr>
</table>

${blockSummaryRows ? `<h3 style="font-size:13px;color:#1e3a5f;margin:16px 0 8px">Block Assessment Completion</h3>
<table style="width:100%;border-collapse:collapse;margin-bottom:16px">
<thead><tr style="background:#f0f9ff"><th style="padding:5px 8px;text-align:left;border-bottom:2px solid #bfdbfe;font-size:12px">Block</th><th style="padding:5px 8px;text-align:center;border-bottom:2px solid #bfdbfe;font-size:12px">Completed</th><th style="padding:5px 8px;text-align:center;border-bottom:2px solid #bfdbfe;font-size:12px">Missing</th></tr></thead>
<tbody>${blockSummaryRows}</tbody></table>` : ''}

${incomplete.length > 0 ? `<h3 style="font-size:13px;color:#dc2626;margin:16px 0 8px">Incomplete Enrollment (${incomplete.length})</h3>
<table style="width:100%;border-collapse:collapse;margin-bottom:16px">
<thead><tr style="background:#fef2f2"><th style="padding:5px 8px;text-align:left;border-bottom:1px solid #fecaca;font-size:12px">Name</th><th style="padding:5px 8px;text-align:left;border-bottom:1px solid #fecaca;font-size:12px">Phone</th><th style="padding:5px 8px;text-align:left;border-bottom:1px solid #fecaca;font-size:12px">Missing</th></tr></thead>
<tbody>${incompleteRows}</tbody></table>` : ''}

<hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
<p style="font-size:11px;color:#888">Automated daily report — OMSB Resident Burnout Study Platform</p>
</div></div>`;
}

// ============================================================================
// Handler
// ============================================================================

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers['authorization']?.replace('Bearer ', '') || req.headers['x-api-key'];
  if (authHeader !== CRON_SECRET && authHeader !== SUPABASE_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  const allBlocks = resolveAllBlocks(today);
  const currentBlock = getCurrentBlock(today, allBlocks);
  const loginUrl = `${SITE_URL}/resident/login`;

  // Get all active participants
  const { data: participants } = await supabase
    .from('burnout_participants')
    .select('id, study_id, study_participant_id, full_name, email, phone, enrollment_date, created_at, demographics_completed, baseline_completed, whoop_user_id, auth_user_id, coordinator_group, coordinator_name, coordinator_email')
    .eq('status', 'active')
    .limit(500);

  if (!participants || participants.length === 0) {
    return res.json({ message: 'No active participants' });
  }

  // Get all submitted block assessments
  const { data: allAssessments } = await supabase
    .from('block_assessments')
    .select('resident_id, block_number')
    .limit(5000);

  const submittedByResident = new Map<string, Set<number>>();
  for (const a of (allAssessments ?? [])) {
    if (a.block_number == null) continue;
    if (!submittedByResident.has(a.resident_id)) submittedByResident.set(a.resident_id, new Set());
    submittedByResident.get(a.resident_id)!.add(a.block_number);
  }

  // Get existing reminders to track escalation
  const { data: existingReminders } = await supabase
    .from('questionnaire_reminders')
    .select('resident_id, block_number, level')
    .limit(5000);

  const maxLevelByResidentBlock = new Map<string, number>();
  for (const r of (existingReminders ?? [])) {
    const key = `${r.resident_id}:${r.block_number}`;
    const current = maxLevelByResidentBlock.get(key) || 0;
    if (r.level > current) maxLevelByResidentBlock.set(key, r.level);
  }

  const summary = {
    date: todayStr,
    enrollment_reminders: 0,
    current_block_reminders: 0,
    missed_block_reminders: 0,
    coordinator_reports: 0,
  };

  // Per-coordinator data for combined report
  const coordCurrentOverdue = new Map<string, Array<{ name: string; email: string | null; phone: string | null; daysOverdue: number }>>();
  const coordMissedBlocks = new Map<string, Array<{ name: string; phone: string | null; missedBlocks: string[] }>>();
  const coordNames = new Map<string, string>();

  const pastBlocks = allBlocks.filter(b => b.end < todayUTC);

  for (const p of participants as Participant[]) {
    if (p.study_participant_id === 'RES-TEST') continue;
    if (!p.email) continue;

    const submitted = submittedByResident.get(p.id) || new Set();
    const enrollDate = p.enrollment_date ? new Date(p.enrollment_date + 'T00:00:00Z') : new Date('2026-04-01T00:00:00Z');

    // ── PART 1: Enrollment reminders ──
    if (!p.demographics_completed || !p.baseline_completed) {
      const daysSinceEnrollment = Math.floor((today.getTime() - enrollDate.getTime()) / (1000 * 60 * 60 * 24));
      const shouldSendDay3 = daysSinceEnrollment >= 3 && daysSinceEnrollment < 7;
      const shouldSendDay7 = daysSinceEnrollment >= 7;

      if (shouldSendDay3 || shouldSendDay7) {
        const targetLevel = shouldSendDay7 ? 2 : 1;
        const prevLevel = maxLevelByResidentBlock.get(`${p.id}:0`) || 0;

        if (targetLevel > prevLevel) {
          const missing: string[] = [];
          if (!p.demographics_completed) missing.push('Demographics form (personal info, medical history, lifestyle)');
          if (!p.baseline_completed) missing.push('Baseline assessment (WHO-5, CBI, PHQ-9, GAD-7, ISI)');

          await sendEmail(
            [p.email],
            shouldSendDay7 ? 'OMSB Burnout Study — Please Complete Your Enrollment Forms' : 'OMSB Burnout Study — Enrollment Setup Reminder',
            enrollmentReminderHtml(p.full_name || 'Participant', missing, loginUrl, daysSinceEnrollment),
            shouldSendDay7 ? PI_EMAILS : undefined,
          );

          await supabase.from('questionnaire_reminders').insert({
            study_id: p.study_id, resident_id: p.id, block_number: 0, level: targetLevel,
            reminder_type: shouldSendDay7 ? 'enrollment_urgent' : 'enrollment_gentle',
            sent_to: [p.email], missing_items: missing,
          });
          summary.enrollment_reminders++;
        }
      }
    }

    // ── PART 2: Current block assessment reminders ──
    if (currentBlock && currentBlock.daysOverdue >= 0 && !submitted.has(currentBlock.block)) {
      const level = getEscalationLevel(currentBlock.daysOverdue);
      const prevLevel = maxLevelByResidentBlock.get(`${p.id}:${currentBlock.block}`) || 0;

      if (level > prevLevel) {
        const missing: string[] = [];
        if (!p.demographics_completed) missing.push('Demographics form');
        if (!p.baseline_completed) missing.push('Baseline assessment');
        missing.push(`Block ${currentBlock.block} questionnaire (CBI, PHQ-9, GAD-7, ISI, WHO-5)`);

        if (level <= 4) {
          await sendEmail(
            [p.email],
            level === 1 ? `OMSB Burnout Study — Block ${currentBlock.block} Assessment Now Open`
              : level === 2 ? `Gentle Reminder: Block ${currentBlock.block} Assessment`
              : level === 3 ? `Friendly Reminder: Block ${currentBlock.block} Assessment — We Need Your Input`
              : `Reminder: Block ${currentBlock.block} Assessment — Your Input Matters`,
            blockReminderHtml(p.full_name || 'Participant', level, currentBlock.block, loginUrl, missing),
            PI_EMAILS,
          );
          summary.current_block_reminders++;
        }

        if (level >= 5 && p.coordinator_email) {
          const ce = p.coordinator_email;
          if (!coordCurrentOverdue.has(ce)) coordCurrentOverdue.set(ce, []);
          coordNames.set(ce, p.coordinator_name || 'Coordinator');
          coordCurrentOverdue.get(ce)!.push({ name: p.full_name || 'Unknown', email: p.email, phone: p.phone, daysOverdue: currentBlock.daysOverdue });
        }

        await supabase.from('questionnaire_reminders').insert({
          study_id: p.study_id, resident_id: p.id, block_number: currentBlock.block, level,
          reminder_type: level <= 2 ? 'email_gentle' : level <= 4 ? 'email_firm' : 'coordinator_escalation',
          sent_to: [p.email], missing_items: missing,
        });
      }
    }

    // ── PART 3: Missed past block reminders ──
    const missedPast: BlockDates[] = [];
    for (const b of pastBlocks) {
      if (b.end >= enrollDate && !submitted.has(b.block)) {
        missedPast.push(b);
      }
    }

    if (missedPast.length > 0) {
      // Only send missed block reminder once per day (check if we sent level 10 today)
      const missedKey = `${p.id}:missed`;
      const { data: todayMissed } = await supabase
        .from('questionnaire_reminders')
        .select('id')
        .eq('resident_id', p.id)
        .eq('reminder_type', 'missed_block')
        .gte('created_at', `${todayStr}T00:00:00Z`)
        .limit(1);

      if (!todayMissed || todayMissed.length === 0) {
        await sendEmail(
          [p.email],
          missedPast.length === 1
            ? `OMSB Burnout Study — Please Complete Your ${missedPast[0].label} Assessment`
            : `OMSB Burnout Study — You Have ${missedPast.length} Missed Block Assessments`,
          missedBlockReminderHtml(p.full_name || 'Participant', missedPast, loginUrl),
        );

        await supabase.from('questionnaire_reminders').insert({
          study_id: p.study_id, resident_id: p.id, block_number: missedPast[0].block, level: 10,
          reminder_type: 'missed_block',
          sent_to: [p.email], missing_items: missedPast.map(b => b.label),
        });
        summary.missed_block_reminders++;
      }

      // Collect for coordinator report
      if (p.coordinator_email) {
        const ce = p.coordinator_email;
        if (!coordMissedBlocks.has(ce)) coordMissedBlocks.set(ce, []);
        coordNames.set(ce, p.coordinator_name || 'Coordinator');
        coordMissedBlocks.get(ce)!.push({
          name: p.full_name || 'Unknown', phone: p.phone,
          missedBlocks: missedPast.map(b => `Block ${b.block}`),
        });
      }
    }
  }

  // ── Send coordinator reports ──
  const allCoordEmails = new Set([...Array.from(coordCurrentOverdue.keys()), ...Array.from(coordMissedBlocks.keys())]);
  for (const ce of Array.from(allCoordEmails)) {
    const currentOverdue = coordCurrentOverdue.get(ce) || [];
    const missed = coordMissedBlocks.get(ce) || [];
    const coordName = coordNames.get(ce) || 'Coordinator';
    const totalResidents = currentOverdue.length + missed.length;

    await sendEmail(
      [ce],
      `[ACTION REQUIRED] ${totalResidents} Resident${totalResidents > 1 ? 's' : ''} — Outstanding Assessments`,
      coordinatorEscalationHtml(coordName, currentOverdue, missed, currentBlock?.block || null),
      COORDINATOR_CC,
    );
    summary.coordinator_reports++;
  }

  // ── Send daily team report ──
  await sendEmail(
    TEAM_EMAILS,
    `Burnout Study — Daily Report (${todayStr})`,
    dailyTeamReportHtml(todayStr, participants as Participant[], submittedByResident, allBlocks, currentBlock),
  );

  return res.json({
    success: true,
    ...summary,
    current_block: currentBlock ? { block: currentBlock.block, daysOverdue: currentBlock.daysOverdue } : null,
  });
}
