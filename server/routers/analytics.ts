import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { reminders, lectures } from "../../drizzle/schema";
import { eq, gte, sql } from "drizzle-orm";

export const analyticsRouter = router({
  /**
   * Get overall reminder statistics
   */
  getReminderStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Total subscriptions
    const totalResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(reminders);
    const totalSubscriptions = totalResult[0]?.count || 0;

    // Active subscriptions (not unsubscribed)
    const activeResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(reminders)
      .where(eq(reminders.unsubscribed, 0));
    const activeSubscriptions = activeResult[0]?.count || 0;

    // Unsubscribed count
    const unsubscribedResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(reminders)
      .where(eq(reminders.unsubscribed, 1));
    const unsubscribed = unsubscribedResult[0]?.count || 0;

    // 24h reminders sent
    const sent24hResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(reminders)
      .where(eq(reminders.reminderSent24h, 1));
    const remindersSent24h = sent24hResult[0]?.count || 0;

    // 1h reminders sent
    const sent1hResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(reminders)
      .where(eq(reminders.reminderSent1h, 1));
    const remindersSent1h = sent1hResult[0]?.count || 0;

    // Upcoming sessions (sessions in the future)
    const now = new Date();
    const upcomingResult = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${lectures.id})` })
      .from(lectures)
      .where(gte(lectures.sessionDate, now));
    const upcomingSessions = upcomingResult[0]?.count || 0;

    // Pending reminders (active subscriptions for future sessions that haven't been sent)
    const pendingResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(reminders)
      .innerJoin(lectures, eq(reminders.lectureId, lectures.id))
      .where(
        sql`${lectures.sessionDate} >= ${now} 
        AND ${reminders.unsubscribed} = 0 
        AND (${reminders.reminderSent24h} = 0 OR ${reminders.reminderSent1h} = 0)`
      );
    const pendingReminders = pendingResult[0]?.count || 0;

    return {
      totalSubscriptions,
      activeSubscriptions,
      unsubscribed,
      remindersSent24h,
      remindersSent1h,
      upcomingSessions,
      pendingReminders,
    };
  }),

  /**
   * Get per-session reminder statistics
   */
  getSessionReminders: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const now = new Date();

    // Get all upcoming sessions with reminder counts
    const sessions = await db
      .select({
        lectureId: lectures.id,
        sessionTitle: lectures.title,
        sessionDate: lectures.sessionDate,
        totalSubscribers: sql<number>`COUNT(${reminders.id})`,
        activeSubscribers: sql<number>`SUM(CASE WHEN ${reminders.unsubscribed} = 0 THEN 1 ELSE 0 END)`,
        sent24h: sql<number>`SUM(CASE WHEN ${reminders.reminderSent24h} = 1 THEN 1 ELSE 0 END)`,
        sent1h: sql<number>`SUM(CASE WHEN ${reminders.reminderSent1h} = 1 THEN 1 ELSE 0 END)`,
      })
      .from(lectures)
      .leftJoin(reminders, eq(lectures.id, reminders.lectureId))
      .where(gte(lectures.sessionDate, now))
      .groupBy(lectures.id, lectures.title, lectures.sessionDate)
      .orderBy(lectures.sessionDate);

    return sessions.map((session) => ({
      sessionTitle: session.sessionTitle,
      sessionDate: session.sessionDate,
      totalSubscribers: Number(session.totalSubscribers) || 0,
      activeSubscribers: Number(session.activeSubscribers) || 0,
      sent24h: Number(session.sent24h) || 0,
      sent1h: Number(session.sent1h) || 0,
    }));
  }),
});
