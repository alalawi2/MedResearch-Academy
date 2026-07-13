import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// Missed Block Reminder & Study Team Report
// Sends reminder emails to residents who missed past block assessments,
// and a summary report to coordinators + study team.
//
// Trigger: manual or cron (twice weekly — Sun & Wed at 06:00 UTC / 10:00 Oman)
// ============================================================================

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const CRON_SECRET = process.env.CRON_SECRET || SUPABASE_KEY;
const SITE_URL = process.env.SITE_URL || 'https://www.medresearch-academy.om';

const STUDY_TEAM = [
  { name: 'Dr. Abdullah M. Al Alawi', email: 'dr.abdullahalalawi@gmail.com', role: 'Co-PI' },
  { name: 'Dr. Mohamed Al Rawahi', email: 'mrawahi@squ.edu.om', role: 'PI' },
  { name: 'Dr. Tamadhir Al Mahrouqi', email: 'tamadhiralmahrouqi@gmail.com', role: 'Psychometrics' },
  { name: 'Aseel Al Toubi', email: 'a.altoubi@squ.edu.om', role: 'Coordinator' },
  { name: 'Dawood Al Amri', email: 'd.alaamri@squ.edu.om', role: 'WHOOP Coordinator' },
  { name: 'Dr. Nuha Al Habsi', email: 'nuhahabsi7@gmail.com', role: 'Research Team' },
];

const TEAM_EMAILS = STUDY_TEAM.map(t => t.email);

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

interface BlockDates { block: number; start: Date; end: Date; label: string }

function resolveBlockDates(today: Date): BlockDates[] {
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
    const startLabel = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
    const endLabel = end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
    results.push({ block: b.block, start, end, label: `Block ${b.block}: ${startLabel} - ${endLabel}` });
  }
  return results;
}

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

function residentReminderHtml(
  name: string,
  missedBlocks: BlockDates[],
  loginUrl: string,
): string {
  const blockList = missedBlocks.map(b =>
    `<li style="margin-bottom: 4px;"><strong>${b.label}</strong></li>`
  ).join('');

  return `<div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #333;">
<div style="background: #b45309; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
  <h1 style="color: white; margin: 0; font-size: 18px;">Missed Block Assessment${missedBlocks.length > 1 ? 's' : ''}</h1>
</div>
<div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
  <p>Dear ${name},</p>
  <p>We noticed you have not yet completed your end-of-block assessment for the following rotation block${missedBlocks.length > 1 ? 's' : ''}:</p>
  <ul style="line-height: 1.8; color: #b45309;">${blockList}</ul>
  <p>Your assessment data is essential for correlating with your WHOOP biophysical measurements. We have now enabled <strong>late submissions</strong> so you can complete these at any time.</p>
  <p>Please reflect on your experience during that rotation period when answering the questions.</p>
  <div style="text-align: center; margin: 24px 0;">
    <a href="${loginUrl}" style="display: inline-block; background: #b45309; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Complete Assessment</a>
  </div>
  <p style="font-size: 13px; color: #666;">Estimated time: 8-10 minutes per block. Your responses are confidential and used only for research purposes.</p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
  <p style="font-size: 13px; color: #666;">OMSB Burnout Study Team</p>
</div></div>`;
}

function teamReportHtml(
  missedByBlock: Map<number, Array<{ pid: string; name: string; email: string | null; phone: string | null; coordinator: string | null }>>,
  allBlocks: BlockDates[],
  totalParticipants: number,
  totalCompleted: Map<number, number>,
): string {
  let blockSections = '';

  for (const [blockNum, residents] of Array.from(missedByBlock).sort((a, b) => a[0] - b[0])) {
    const bd = allBlocks.find(b => b.block === blockNum);
    const completed = totalCompleted.get(blockNum) || 0;
    const rate = totalParticipants > 0 ? Math.round((completed / totalParticipants) * 100) : 0;

    const rows = residents.map(r => `
      <tr>
        <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb; font-size: 13px;">${r.pid}</td>
        <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb; font-size: 13px; font-weight: 600;">${r.name}</td>
        <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb; font-size: 13px;">${r.phone || '-'}</td>
        <td style="padding: 6px 8px; border-bottom: 1px solid #e5e7eb; font-size: 13px;">${r.coordinator || '-'}</td>
      </tr>
    `).join('');

    blockSections += `
    <div style="margin-bottom: 24px;">
      <h3 style="color: #b45309; margin: 0 0 4px;">${bd?.label || 'Block ' + blockNum}</h3>
      <p style="font-size: 13px; color: #666; margin: 0 0 12px;">
        Completion: <strong style="color: ${rate >= 80 ? '#16a34a' : rate >= 50 ? '#d97706' : '#dc2626'};">${completed}/${totalParticipants} (${rate}%)</strong>
        &mdash; ${residents.length} resident${residents.length > 1 ? 's' : ''} outstanding
      </p>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <thead>
          <tr style="background: #f9fafb;">
            <th style="padding: 6px 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">ID</th>
            <th style="padding: 6px 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Name</th>
            <th style="padding: 6px 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Phone</th>
            <th style="padding: 6px 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Coordinator</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  }

  const totalMissed = Array.from(missedByBlock.values()).reduce((sum, arr) => sum + arr.length, 0);

  return `<div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; color: #333;">
<div style="background: #1e3a5f; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
  <h1 style="color: white; margin: 0; font-size: 18px;">Missed Block Assessments Report</h1>
  <p style="color: rgba(255,255,255,0.7); margin: 4px 0 0; font-size: 13px;">${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
</div>
<div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
  <div style="display: flex; gap: 24px; margin-bottom: 24px; flex-wrap: wrap;">
    <div style="text-align: center; flex: 1; min-width: 120px;">
      <div style="font-size: 28px; font-weight: 700; color: #1e3a5f;">${totalParticipants}</div>
      <div style="font-size: 12px; color: #666;">Total Enrolled</div>
    </div>
    <div style="text-align: center; flex: 1; min-width: 120px;">
      <div style="font-size: 28px; font-weight: 700; color: #dc2626;">${totalMissed}</div>
      <div style="font-size: 12px; color: #666;">Missing Assessments</div>
    </div>
  </div>

  ${blockSections}

  <p style="font-size: 13px; color: #666; margin-top: 16px;">
    Late submission is now enabled. Residents have been sent reminder emails. Please follow up with your assigned residents by phone or in person.
  </p>
  <div style="text-align: center; margin: 20px 0;">
    <a href="${SITE_URL}/login" style="display: inline-block; background: #1e3a5f; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Open Dashboard</a>
  </div>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
  <p style="font-size: 12px; color: #999;">Automated report from OMSB Burnout Study Platform</p>
</div></div>`;
}

function coordinatorReportHtml(
  coordinatorName: string,
  residents: Array<{ pid: string; name: string; email: string | null; phone: string | null; missedBlocks: string[] }>,
): string {
  const rows = residents.map(r => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${r.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${r.phone || '-'}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #b45309;">${r.missedBlocks.join(', ')}</td>
    </tr>
  `).join('');

  return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
<div style="background: #dc2626; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
  <h1 style="color: white; margin: 0; font-size: 18px;">Your Residents — Missed Assessments</h1>
</div>
<div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
  <p>Dear ${coordinatorName},</p>
  <p>The following residents assigned to you have <strong>not completed</strong> their end-of-block assessment. Late submission is now enabled. Please follow up with them directly.</p>
  <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 16px 0;">
    <thead>
      <tr style="background: #f9fafb;">
        <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Name</th>
        <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Phone</th>
        <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Missed Blocks</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <p style="font-size: 13px; color: #666;">Once a resident completes the assessment, they will be removed from future reports.</p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
  <p style="font-size: 13px; color: #666;">OMSB Burnout Study — Automated Report</p>
</div></div>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers['authorization']?.replace('Bearer ', '') || req.headers['x-api-key'];
  if (authHeader !== CRON_SECRET && authHeader !== SUPABASE_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const today = new Date();
  const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  const allBlocks = resolveBlockDates(today);
  const loginUrl = `${SITE_URL}/resident/login`;

  // Get all active participants
  const { data: participants } = await supabase
    .from('burnout_participants')
    .select('id, study_id, study_participant_id, full_name, email, phone, enrollment_date, coordinator_name, coordinator_email, status')
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

  // Find past blocks (ended before today)
  const pastBlocks = allBlocks.filter(b => b.end < todayUTC);

  // Build missed-block map
  const missedByBlock = new Map<number, Array<{ pid: string; name: string; email: string | null; phone: string | null; coordinator: string | null }>>();
  const completedByBlock = new Map<number, number>();

  // Per-resident missed blocks (for coordinator report)
  const residentMissed = new Map<string, { pid: string; name: string; email: string | null; phone: string | null; coordinatorEmail: string | null; coordinatorName: string | null; missedBlocks: BlockDates[] }>();

  let remindersSent = 0;

  for (const p of participants) {
    if (p.study_participant_id === 'RES-TEST') continue;

    const enrollDate = p.enrollment_date ? new Date(p.enrollment_date + 'T00:00:00Z') : new Date('2026-04-01T00:00:00Z');
    const submitted = submittedByResident.get(p.id) || new Set();

    // Find blocks this resident missed (block ended after enrollment, ended before today)
    const missed: BlockDates[] = [];
    for (const b of pastBlocks) {
      if (b.end >= enrollDate && !submitted.has(b.block)) {
        missed.push(b);

        if (!missedByBlock.has(b.block)) missedByBlock.set(b.block, []);
        missedByBlock.get(b.block)!.push({
          pid: p.study_participant_id,
          name: p.full_name || 'Unknown',
          email: p.email,
          phone: p.phone,
          coordinator: p.coordinator_name,
        });
      }

      // Count completions per block
      if (b.end >= enrollDate) {
        if (!completedByBlock.has(b.block)) completedByBlock.set(b.block, 0);
        if (submitted.has(b.block)) {
          completedByBlock.set(b.block, (completedByBlock.get(b.block) || 0) + 1);
        }
      }
    }

    if (missed.length > 0) {
      residentMissed.set(p.id, {
        pid: p.study_participant_id,
        name: p.full_name || 'Unknown',
        email: p.email,
        phone: p.phone,
        coordinatorEmail: p.coordinator_email,
        coordinatorName: p.coordinator_name,
        missedBlocks: missed,
      });

      // Send reminder to resident
      if (p.email) {
        await sendEmail(
          [p.email],
          missed.length === 1
            ? `OMSB Burnout Study — Please Complete Your ${missed[0].label} Assessment`
            : `OMSB Burnout Study — You Have ${missed.length} Missed Block Assessments`,
          residentReminderHtml(p.full_name || 'Participant', missed, loginUrl),
        );
        remindersSent++;
      }
    }
  }

  // Send coordinator reports (grouped by coordinator)
  const byCoordinator = new Map<string, Array<{ pid: string; name: string; email: string | null; phone: string | null; missedBlocks: string[] }>>();
  const coordinatorNames = new Map<string, string>();

  for (const [, r] of Array.from(residentMissed)) {
    const coordEmail = r.coordinatorEmail || 'unassigned';
    if (coordEmail === 'unassigned') continue;
    if (!byCoordinator.has(coordEmail)) byCoordinator.set(coordEmail, []);
    coordinatorNames.set(coordEmail, r.coordinatorName || 'Coordinator');
    byCoordinator.get(coordEmail)!.push({
      pid: r.pid,
      name: r.name,
      email: r.email,
      phone: r.phone,
      missedBlocks: r.missedBlocks.map(b => `Block ${b.block}`),
    });
  }

  for (const [coordEmail, residents] of Array.from(byCoordinator)) {
    const coordName = coordinatorNames.get(coordEmail) || 'Coordinator';
    await sendEmail(
      [coordEmail],
      `[ACTION REQUIRED] ${residents.length} Resident${residents.length > 1 ? 's' : ''} — Missed Block Assessments`,
      coordinatorReportHtml(coordName, residents),
      TEAM_EMAILS,
    );
  }

  // Send study team summary report
  const totalActive = participants.filter(p => p.study_participant_id !== 'RES-TEST').length;
  await sendEmail(
    TEAM_EMAILS,
    `Burnout Study — Missed Block Assessments Report (${todayUTC.toISOString().slice(0, 10)})`,
    teamReportHtml(missedByBlock, allBlocks, totalActive, completedByBlock),
  );

  return res.json({
    success: true,
    date: todayUTC.toISOString().slice(0, 10),
    total_participants: totalActive,
    missed_blocks: Object.fromEntries(
      Array.from(missedByBlock).map(([block, residents]) => [
        `block_${block}`,
        { missed: residents.length, completed: completedByBlock.get(block) || 0 },
      ])
    ),
    reminders_sent_to_residents: remindersSent,
    coordinator_reports_sent: byCoordinator.size,
    team_report_sent: true,
  });
}
