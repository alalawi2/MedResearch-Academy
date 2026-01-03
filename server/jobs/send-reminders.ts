/**
 * Scheduled job to send email reminders for upcoming sessions
 * This job should run every 15 minutes to check for sessions that need reminders
 */

import { getDb } from "../db";
import { lectures, reminders } from "../../drizzle/schema";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { sendEmail, generate24HourReminderEmail, generate1HourReminderEmail } from "../lib/email";

/**
 * Check and send 24-hour reminders
 */
async function send24HourReminders() {
  const now = new Date();
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in24HoursPlus15Min = new Date(in24Hours.getTime() + 15 * 60 * 1000);

  console.log(`[24h Reminders] Checking for sessions between ${in24Hours.toISOString()} and ${in24HoursPlus15Min.toISOString()}`);

  try {
    // Find all reminders for sessions happening in ~24 hours that haven't been sent yet
    const db = await getDb();
    if (!db) {
      console.warn("[24h Reminders] Database not available");
      return;
    }
    
    const pendingReminders = await db
      .select({
        reminderId: reminders.id,
        email: reminders.email,
        lectureId: lectures.id,
        title: lectures.title,
        description: lectures.description,
        sessionDate: lectures.sessionDate,
        zoomLink: lectures.zoomLink,
      })
      .from(reminders)
      .innerJoin(lectures, eq(reminders.lectureId, lectures.id))
      .where(
        and(
          gte(lectures.sessionDate, in24Hours),
          lte(lectures.sessionDate, in24HoursPlus15Min),
          eq(reminders.reminderSent24h, 0),
          eq(reminders.unsubscribed, 0)
        )
      );

    console.log(`[24h Reminders] Found ${pendingReminders.length} reminders to send`);

    for (const reminder of pendingReminders) {
      if (!reminder.sessionDate || !reminder.zoomLink) {
        console.warn(`[24h Reminders] Skipping reminder ${reminder.reminderId}: missing sessionDate or zoomLink`);
        continue;
      }

      const emailHtml = generate24HourReminderEmail({
        title: reminder.title,
        description: reminder.description || undefined,
        sessionDate: reminder.sessionDate,
        zoomLink: reminder.zoomLink,
        reminderId: reminder.reminderId,
        email: reminder.email,
      });

      const success = await sendEmail({
        to: reminder.email,
        subject: `Reminder: ${reminder.title} starts in 24 hours`,
        html: emailHtml,
      });

      if (success) {
        // Mark as sent
        const dbUpdate = await getDb();
        if (!dbUpdate) continue;
        
        await dbUpdate
          .update(reminders)
          .set({ reminderSent24h: 1 })
          .where(eq(reminders.id, reminder.reminderId));
        
        console.log(`[24h Reminders] Sent to ${reminder.email} for session "${reminder.title}"`);
      } else {
        console.error(`[24h Reminders] Failed to send to ${reminder.email}`);
      }
    }
  } catch (error) {
    console.error("[24h Reminders] Error:", error);
  }
}

/**
 * Check and send 1-hour reminders
 */
async function send1HourReminders() {
  const now = new Date();
  const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);
  const in1HourPlus15Min = new Date(in1Hour.getTime() + 15 * 60 * 1000);

  console.log(`[1h Reminders] Checking for sessions between ${in1Hour.toISOString()} and ${in1HourPlus15Min.toISOString()}`);

  try {
    // Find all reminders for sessions happening in ~1 hour that haven't been sent yet
    const db = await getDb();
    if (!db) {
      console.warn("[1h Reminders] Database not available");
      return;
    }
    
    const pendingReminders = await db
      .select({
        reminderId: reminders.id,
        email: reminders.email,
        lectureId: lectures.id,
        title: lectures.title,
        description: lectures.description,
        sessionDate: lectures.sessionDate,
        zoomLink: lectures.zoomLink,
      })
      .from(reminders)
      .innerJoin(lectures, eq(reminders.lectureId, lectures.id))
      .where(
        and(
          gte(lectures.sessionDate, in1Hour),
          lte(lectures.sessionDate, in1HourPlus15Min),
          eq(reminders.reminderSent1h, 0),
          eq(reminders.unsubscribed, 0)
        )
      );

    console.log(`[1h Reminders] Found ${pendingReminders.length} reminders to send`);

    for (const reminder of pendingReminders) {
      if (!reminder.sessionDate || !reminder.zoomLink) {
        console.warn(`[1h Reminders] Skipping reminder ${reminder.reminderId}: missing sessionDate or zoomLink`);
        continue;
      }

      const emailHtml = generate1HourReminderEmail({
        title: reminder.title,
        description: reminder.description || undefined,
        sessionDate: reminder.sessionDate,
        zoomLink: reminder.zoomLink,
        reminderId: reminder.reminderId,
        email: reminder.email,
      });

      const success = await sendEmail({
        to: reminder.email,
        subject: `Starting Soon: ${reminder.title} in 1 hour!`,
        html: emailHtml,
      });

      if (success) {
        // Mark as sent
        const dbUpdate = await getDb();
        if (!dbUpdate) continue;
        
        await dbUpdate
          .update(reminders)
          .set({ reminderSent1h: 1 })
          .where(eq(reminders.id, reminder.reminderId));
        
        console.log(`[1h Reminders] Sent to ${reminder.email} for session "${reminder.title}"`);
      } else {
        console.error(`[1h Reminders] Failed to send to ${reminder.email}`);
      }
    }
  } catch (error) {
    console.error("[1h Reminders] Error:", error);
  }
}

/**
 * Main job function - runs both 24h and 1h reminder checks
 */
export async function sendRemindersJob() {
  console.log(`[Reminder Job] Starting at ${new Date().toISOString()}`);
  
  await send24HourReminders();
  await send1HourReminders();
  
  console.log(`[Reminder Job] Completed at ${new Date().toISOString()}`);
}

// If running directly (for testing)
if (require.main === module) {
  sendRemindersJob()
    .then(() => {
      console.log("Job completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Job failed:", error);
      process.exit(1);
    });
}
