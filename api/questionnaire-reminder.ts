import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// Questionnaire Escalation System
// Schedule: Daily at 05:00 UTC (09:00 Oman time)
//
// 4-level escalation for overdue block assessments:
//   Level 1 (Day 1):   Assessment window opens → invitation email
//   Level 2 (Day 4):   Gentle reminder
//   Level 3 (Day 8):   Firm reminder
//   Level 4 (Day 12):  Final warning — next step is coordinator call
//   Level 5 (Day 14+): Escalate to coordinators (Tamdaher, Aseel, Omar, Nuha)
// ============================================================================

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const CRON_SECRET = process.env.CRON_SECRET || SUPABASE_KEY;
const SITE_URL = process.env.SITE_URL || 'https://www.medresearch-academy.om';

// Coordinators who can follow up by phone
const COORDINATORS = [
  { name: 'Dr. Tamadhir Al Mahrouqi', email: 'tamadhiralmahrouqi@gmail.com' },
  { name: 'Aseel Al Toubi', email: 'a.altoubi@squ.edu.om' },
  { name: 'Dr. Omar Al Taei', email: 'altaeiomar11@gmail.com' },
  { name: 'Dr. Nuha Al Habsi', email: 'nuhahabsi7@gmail.com' },
];

// Research team always CC'd on escalations
const TEAM_EMAILS = ['dr.abdullahalalawi@gmail.com', 'mrawahi@squ.edu.om'];

// Master block schedule: 13 blocks of ~4 weeks each (OMSB academic year)
// Assessment window opens week 3 (day 15). Coordinator escalation by week 4 (day 22).
// MM-DD format; Block 5 crosses year boundary (Dec→Jan).
const BLOCK_DEFS = [
  { block: 1,  startMD: '09-01', endMD: '09-27' },
  { block: 2,  startMD: '09-28', endMD: '10-25' },
  { block: 3,  startMD: '10-27', endMD: '11-22' },
  { block: 4,  startMD: '11-23', endMD: '12-20' },
  { block: 5,  startMD: '12-21', endMD: '01-17' }, // crosses year
  { block: 6,  startMD: '01-18', endMD: '02-14' },
  { block: 7,  startMD: '02-15', endMD: '03-14' },
  { block: 8,  startMD: '03-15', endMD: '04-11' },
  { block: 9,  startMD: '04-12', endMD: '05-09' },
  { block: 10, startMD: '05-10', endMD: '06-06' },
  { block: 11, startMD: '06-07', endMD: '07-06' },
  { block: 12, startMD: '07-07', endMD: '08-01' },
  { block: 13, startMD: '08-02', endMD: '08-31' },
];

const ASSESSMENT_WINDOW_DAY = 15; // Window opens on day 15 of each block (week 3)

interface Participant {
  id: string;
  study_id: string;
  study_participant_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  demographics_completed: boolean;
  baseline_completed: boolean;
}

interface ReminderRecord {
  resident_id: string;
  level: number;
  created_at: string;
}

function getCurrentBlock(today: Date): { block: number; start: Date; end: Date; windowOpened: Date; daysOverdue: number } | null {
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // 1-12

  // Determine the academic year: Sep-Aug cycle
  // If we're in Jan-Aug, the academic year started the previous Sep
  const academicStartYear = month >= 9 ? year : year - 1;

  for (const b of BLOCK_DEFS) {
    const [sm, sd] = b.startMD.split('-').map(Number);
    const [em, ed] = b.endMD.split('-').map(Number);

    // Resolve actual years for start and end
    let startYear = sm >= 9 ? academicStartYear : academicStartYear + 1;
    let endYear = em >= 9 ? academicStartYear : academicStartYear + 1;

    // Block 5 special: Dec→Jan crosses year
    if (sm === 12 && em === 1) {
      startYear = academicStartYear;
      endYear = academicStartYear + 1;
    }

    const start = new Date(Date.UTC(startYear, sm - 1, sd));
    const end = new Date(Date.UTC(endYear, em - 1, ed));
    const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

    if (todayUTC >= start && todayUTC <= end) {
      const windowOpened = new Date(start);
      windowOpened.setUTCDate(windowOpened.getUTCDate() + ASSESSMENT_WINDOW_DAY);

      const daysOverdue = Math.floor((todayUTC.getTime() - windowOpened.getTime()) / (1000 * 60 * 60 * 24));

      return {
        block: b.block,
        start,
        end,
        windowOpened,
        daysOverdue,
      };
    }
  }
  return null;
}

// Tighter timeline for 4-week blocks:
// Day 0 (week 3 start): Window opens → invitation
// Day 2: Gentle reminder
// Day 4: Firm reminder + CC team
// Day 6: Final warning — "coordinator will call you"
// Day 7+ (week 4): Escalate to coordinators (Omar, Aseel, etc.)
function getEscalationLevel(daysOverdue: number): number {
  if (daysOverdue >= 7) return 5;  // Coordinator escalation (week 4)
  if (daysOverdue >= 6) return 4;  // Final warning
  if (daysOverdue >= 4) return 3;  // Firm reminder + CC team
  if (daysOverdue >= 2) return 2;  // Gentle reminder
  if (daysOverdue >= 0) return 1;  // Initial invitation
  return 0; // Window not open yet
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

function residentEmailHtml(
  name: string,
  level: number,
  blockNum: number,
  daysOverdue: number,
  loginUrl: string,
  missingItems: string[],
): string {
  const colors: Record<number, { bg: string; border: string; text: string }> = {
    1: { bg: '#0f766e', border: '#0d9488', text: 'Assessment Window Open' },
    2: { bg: '#f59e0b', border: '#fbbf24', text: 'Friendly Reminder' },
    3: { bg: '#ea580c', border: '#f97316', text: 'Action Required' },
    4: { bg: '#dc2626', border: '#ef4444', text: 'Final Reminder — Coordinator Follow-up Next' },
  };
  const style = colors[level] || colors[4];

  const urgencyNote = level >= 3
    ? `<p style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; color: #991b1b; font-weight: 600;">
        ${level === 4
          ? 'This is your final reminder. If not completed within 2 days, your program coordinator will be notified for follow-up.'
          : `Your assessment is ${daysOverdue} days overdue. Please complete it at your earliest convenience.`
        }
      </p>`
    : '';

  const missingList = missingItems.map(i => `<li>${i}</li>`).join('');

  return `<div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #333;">
<div style="background: ${style.bg}; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
  <h1 style="color: white; margin: 0; font-size: 18px;">Block ${blockNum} — ${style.text}</h1>
</div>
<div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
  <p>Dear ${name},</p>
  <p>The assessment window for <strong>Block ${blockNum}</strong> of the OMSB Resident Burnout Study is now open. We need your input to correlate with your WHOOP biophysical data.</p>
  ${urgencyNote}
  <p><strong>Outstanding items:</strong></p>
  <ul style="line-height: 1.8;">${missingList}</ul>
  <div style="text-align: center; margin: 24px 0;">
    <a href="${loginUrl}" style="display: inline-block; background: ${style.bg}; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Complete Assessment</a>
  </div>
  <p style="font-size: 13px; color: #666;">Estimated time: 8-10 minutes. Your responses are confidential and used only for research purposes.</p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
  <p style="font-size: 13px; color: #666;">OMSB Burnout Study Team — <a href="mailto:info@medresearch-academy.om" style="color: #0f766e;">info@medresearch-academy.om</a></p>
</div></div>`;
}

function coordinatorEscalationHtml(
  overdue: Array<{ pid: string; name: string; email: string | null; phone: string | null; daysOverdue: number; missing: string[] }>,
  blockNum: number,
): string {
  // NOTE: Never include study_participant_id alongside names — use name + contact only for coordinators
  const rows = overdue.map(r => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">${r.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${r.email || '—'}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${r.phone || '—'}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #dc2626; font-weight: 700;">${r.daysOverdue} days</td>
    </tr>
  `).join('');

  return `<div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; color: #333;">
<div style="background: #dc2626; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
  <h1 style="color: white; margin: 0; font-size: 18px;">Questionnaire Escalation — Block ${blockNum}</h1>
</div>
<div style="background: #fff; border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
  <p>The following residents have <strong>not completed</strong> their Block ${blockNum} assessment despite 3 email reminders. Please follow up with them directly (phone call or in-person).</p>
  <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 16px 0;">
    <thead>
      <tr style="background: #f9fafb;">
        <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Name</th>
        <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Email</th>
        <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Phone</th>
        <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Overdue</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <p style="font-size: 13px; color: #666;">Once the resident completes the assessment, they will automatically be removed from future reminders for this block.</p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
  <p style="font-size: 13px; color: #666;">OMSB Burnout Study — Automated Escalation System</p>
</div></div>`;
}

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
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
  <p style="font-size: 13px; color: #666;">OMSB Burnout Study Team — <a href="mailto:info@medresearch-academy.om" style="color: #0f766e;">info@medresearch-academy.om</a></p>
</div></div>`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleEnrollmentReminders(
  supabase: any,
  today: Date,
): Promise<{ sent: number; skipped: number; details: Array<{ pid: string; action: string }> }> {
  const loginUrl = `${SITE_URL}/resident/login`;
  const details: Array<{ pid: string; action: string }> = [];
  let sent = 0;

  // Find participants with incomplete enrollment (demographics or baseline not done)
  const { data: incomplete } = await supabase
    .from('burnout_participants')
    .select('id, study_id, study_participant_id, full_name, email, demographics_completed, baseline_completed, enrollment_date')
    .eq('status', 'active')
    .not('email', 'is', null)
    .limit(1000);

  if (!incomplete) return { sent: 0, skipped: 0, details };

  for (const p of incomplete) {
    if (p.demographics_completed && p.baseline_completed) continue; // All done

    const enrollDate = p.enrollment_date ? new Date(p.enrollment_date) : new Date(p.created_at);
    const daysSinceEnrollment = Math.floor((today.getTime() - enrollDate.getTime()) / (1000 * 60 * 60 * 24));

    // Only send at day 3 and day 7 after enrollment
    const shouldSendDay3 = daysSinceEnrollment >= 3 && daysSinceEnrollment < 7;
    const shouldSendDay7 = daysSinceEnrollment >= 7;
    if (!shouldSendDay3 && !shouldSendDay7) {
      details.push({ pid: p.study_participant_id, action: 'too_early' });
      continue;
    }

    const targetLevel = shouldSendDay7 ? 2 : 1;

    // Check if we already sent this level for enrollment (block_number = 0 = enrollment)
    const { data: existing } = await supabase
      .from('questionnaire_reminders')
      .select('id')
      .eq('resident_id', p.id)
      .eq('block_number', 0) // 0 = enrollment reminder
      .eq('level', targetLevel)
      .limit(1);

    if (existing && existing.length > 0) {
      details.push({ pid: p.study_participant_id, action: 'already_sent' });
      continue;
    }

    const missing: string[] = [];
    if (!p.demographics_completed) missing.push('Demographics form (personal info, medical history, lifestyle)');
    if (!p.baseline_completed) missing.push('Baseline assessment (WHO-5, CBI, PHQ-9, GAD-7, ISI)');

    await sendEmail(
      [p.email],
      shouldSendDay7
        ? 'OMSB Burnout Study — Please Complete Your Enrollment Forms'
        : 'OMSB Burnout Study — Enrollment Setup Reminder',
      enrollmentReminderHtml(p.full_name || 'Participant', missing, loginUrl, daysSinceEnrollment),
      shouldSendDay7 ? TEAM_EMAILS : undefined,
    );

    await supabase
      .from('questionnaire_reminders')
      .insert({
        study_id: p.study_id,
        resident_id: p.id,
        block_number: 0, // 0 = enrollment
        level: targetLevel,
        reminder_type: shouldSendDay7 ? 'enrollment_urgent' : 'enrollment_gentle',
        sent_to: [p.email, ...(shouldSendDay7 ? TEAM_EMAILS : [])],
        missing_items: missing,
      });

    sent++;
    details.push({ pid: p.study_participant_id, action: `enrollment_level_${targetLevel}_sent` });
  }

  return { sent, skipped: details.filter(d => d.action === 'already_sent').length, details };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Auth
  const authHeader = req.headers['authorization']?.replace('Bearer ', '') || req.headers['x-api-key'];
  if (authHeader !== CRON_SECRET && authHeader !== SUPABASE_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const today = new Date();
  const currentBlock = getCurrentBlock(today);

  // ── PART 1: Enrollment reminders (demographics + baseline) ──
  // These are independent of block schedule. Remind 3 days and 7 days after enrollment.
  const enrollmentResults = await handleEnrollmentReminders(supabase, today);

  // ── PART 2: Block assessment reminders ──
  if (!currentBlock) {
    return res.json({
      message: 'No active block — between rotation periods',
      today: today.toISOString(),
      enrollment_reminders: enrollmentResults,
    });
  }

  if (currentBlock.daysOverdue < 0) {
    return res.json({
      message: `Block ${currentBlock.block} active but assessment window not yet open`,
      windowOpens: currentBlock.windowOpened.toISOString().slice(0, 10),
      daysUntilWindow: Math.abs(currentBlock.daysOverdue),
      enrollment_reminders: enrollmentResults,
    });
  }

  const level = getEscalationLevel(currentBlock.daysOverdue);

  // Get all active participants
  const { data: participants } = await supabase
    .from('burnout_participants')
    .select('id, study_id, study_participant_id, full_name, email, phone, demographics_completed, baseline_completed')
    .eq('status', 'active')
    .not('email', 'is', null)
    .limit(1000);

  if (!participants || participants.length === 0) {
    return res.json({ message: 'No active participants found' });
  }

  // Check who has already submitted block assessment for this block
  const blockStart = currentBlock.start.toISOString().slice(0, 10);
  const blockEnd = currentBlock.end.toISOString().slice(0, 10);

  const { data: completedAssessments } = await supabase
    .from('block_assessments')
    .select('resident_id')
    .gte('assessment_date', blockStart)
    .lte('assessment_date', blockEnd)
    .limit(1000);

  const completedSet = new Set((completedAssessments ?? []).map(a => a.resident_id));

  // Check who has completed demographics & baseline
  // (These are one-time, but if not done, we include them in missing items)

  // Get existing reminders for this block to track escalation level already sent
  const { data: existingReminders } = await supabase
    .from('questionnaire_reminders')
    .select('resident_id, level, created_at')
    .eq('block_number', currentBlock.block)
    .limit(1000);

  const maxLevelSent = new Map<string, number>();
  for (const r of (existingReminders ?? []) as ReminderRecord[]) {
    const current = maxLevelSent.get(r.resident_id) || 0;
    if (r.level > current) maxLevelSent.set(r.resident_id, r.level);
  }

  const results: Array<{
    pid: string;
    name: string | null;
    action: string;
    level: number;
  }> = [];

  const escalateToCoordinators: Array<{
    pid: string;
    name: string;
    email: string | null;
    phone: string | null;
    daysOverdue: number;
    missing: string[];
  }> = [];

  const loginUrl = `${SITE_URL}/resident/login`;

  for (const p of participants as Participant[]) {
    // Skip if assessment already completed for this block
    if (completedSet.has(p.id)) {
      results.push({ pid: p.study_participant_id, name: p.full_name, action: 'completed', level: 0 });
      continue;
    }

    // Determine what's missing
    const missing: string[] = [];
    if (!p.demographics_completed) missing.push('Demographics form');
    if (!p.baseline_completed) missing.push('Baseline assessment');
    missing.push(`Block ${currentBlock.block} questionnaire (CBI, PHQ-9, GAD-7, ISI, WHO-5)`);

    // Check what level we already sent
    const previousLevel = maxLevelSent.get(p.id) || 0;

    // Only send if current escalation level > what we already sent
    if (level <= previousLevel) {
      results.push({ pid: p.study_participant_id, name: p.full_name, action: 'already_notified_this_level', level: previousLevel });
      continue;
    }

    if (level <= 4 && p.email) {
      // Send reminder email to resident
      await sendEmail(
        [p.email],
        level === 1
          ? `OMSB Burnout Study — Block ${currentBlock.block} Assessment Now Open`
          : level === 2
          ? `Reminder: Block ${currentBlock.block} Assessment — Please Complete`
          : level === 3
          ? `Action Required: Block ${currentBlock.block} Assessment Overdue`
          : `FINAL REMINDER: Block ${currentBlock.block} Assessment — Coordinator Follow-up Next`,
        residentEmailHtml(
          p.full_name || 'Participant',
          level,
          currentBlock.block,
          currentBlock.daysOverdue,
          loginUrl,
          missing,
        ),
        TEAM_EMAILS, // Always CC PI team on all reminders
      );

      // Log the reminder
      await supabase
        .from('questionnaire_reminders')
        .insert({
          study_id: p.study_id,
          resident_id: p.id,
          block_number: currentBlock.block,
          level,
          reminder_type: level <= 2 ? 'email_gentle' : level === 3 ? 'email_firm' : 'email_final',
          sent_to: [p.email, ...TEAM_EMAILS],
          missing_items: missing,
        });

      results.push({ pid: p.study_participant_id, name: p.full_name, action: `level_${level}_sent`, level });
    }

    if (level >= 5) {
      // Collect for coordinator escalation
      escalateToCoordinators.push({
        pid: p.study_participant_id,
        name: p.full_name || 'Unknown',
        email: p.email,
        phone: p.phone,
        daysOverdue: currentBlock.daysOverdue,
        missing,
      });
    }
  }

  // Send coordinator escalation email (single email with all overdue residents)
  if (escalateToCoordinators.length > 0) {
    // Check if we already escalated to coordinators today
    const todayStr = today.toISOString().slice(0, 10);
    const { data: todayEscalations } = await supabase
      .from('questionnaire_reminders')
      .select('id')
      .eq('block_number', currentBlock.block)
      .eq('level', 5)
      .gte('created_at', `${todayStr}T00:00:00Z`)
      .limit(1);

    if (!todayEscalations || todayEscalations.length === 0) {
      const coordinatorEmails = COORDINATORS.map(c => c.email);
      await sendEmail(
        coordinatorEmails,
        `[ACTION REQUIRED] ${escalateToCoordinators.length} Residents — Block ${currentBlock.block} Assessment Overdue`,
        coordinatorEscalationHtml(escalateToCoordinators, currentBlock.block),
        TEAM_EMAILS,
      );

      // Log escalation for each resident
      for (const r of escalateToCoordinators) {
        const participant = participants.find(
          (p: Participant) => p.study_participant_id === r.pid
        ) as Participant | undefined;
        if (participant) {
          await supabase
            .from('questionnaire_reminders')
            .insert({
              study_id: participant.study_id,
              resident_id: participant.id,
              block_number: currentBlock.block,
              level: 5,
              reminder_type: 'coordinator_escalation',
              sent_to: [...coordinatorEmails, ...TEAM_EMAILS],
              missing_items: r.missing,
            });
        }
      }

      results.push(
        ...escalateToCoordinators.map(r => ({
          pid: r.pid,
          name: r.name,
          action: 'escalated_to_coordinators',
          level: 5,
        })),
      );
    }
  }

  const summary = {
    checked_at: today.toISOString(),
    enrollment_reminders: enrollmentResults,
    block_assessment: {
      block: currentBlock.block,
      days_since_window_opened: currentBlock.daysOverdue,
      escalation_level: level,
      total_participants: participants.length,
      completed: results.filter(r => r.action === 'completed').length,
      reminders_sent: results.filter(r => r.action.startsWith('level_')).length,
      already_notified: results.filter(r => r.action === 'already_notified_this_level').length,
      escalated: results.filter(r => r.action === 'escalated_to_coordinators').length,
      results,
    },
  };

  return res.json(summary);
}
