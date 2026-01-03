import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { reminders } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const unsubscribeRouter = router({
  /**
   * Unsubscribe from email reminders
   */
  unsubscribe: publicProcedure
    .input(
      z.object({
        reminderId: z.number(),
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      // Verify the reminder exists and matches the email
      const reminder = await db
        .select()
        .from(reminders)
        .where(eq(reminders.id, input.reminderId))
        .limit(1);

      if (reminder.length === 0) {
        throw new Error("Reminder not found");
      }

      if (reminder[0].email !== input.email) {
        throw new Error("Email does not match");
      }

      if (reminder[0].unsubscribed === 1) {
        return { success: true, message: "Already unsubscribed" };
      }

      // Mark as unsubscribed
      await db
        .update(reminders)
        .set({
          unsubscribed: 1,
          unsubscribedAt: new Date(),
        })
        .where(eq(reminders.id, input.reminderId));

      return { success: true, message: "Successfully unsubscribed" };
    }),

  /**
   * Check unsubscribe status
   */
  checkStatus: publicProcedure
    .input(
      z.object({
        reminderId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const reminder = await db
        .select()
        .from(reminders)
        .where(eq(reminders.id, input.reminderId))
        .limit(1);

      if (reminder.length === 0) {
        return { found: false, unsubscribed: false };
      }

      return {
        found: true,
        unsubscribed: reminder[0].unsubscribed === 1,
        email: reminder[0].email,
        unsubscribedAt: reminder[0].unsubscribedAt,
      };
    }),
});
