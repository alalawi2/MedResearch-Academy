/**
 * Job scheduler that runs the reminder job every 15 minutes
 * This runs in the background when the server starts
 */

import { sendRemindersJob } from "./send-reminders";

const INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

let intervalId: NodeJS.Timeout | null = null;

/**
 * Start the scheduler
 */
export function startScheduler() {
  if (intervalId) {
    console.log("[Scheduler] Already running");
    return;
  }

  console.log("[Scheduler] Starting reminder job scheduler (runs every 15 minutes)");
  
  // Run immediately on start
  sendRemindersJob().catch((error) => {
    console.error("[Scheduler] Initial job run failed:", error);
  });

  // Then run every 15 minutes
  intervalId = setInterval(() => {
    sendRemindersJob().catch((error) => {
      console.error("[Scheduler] Scheduled job run failed:", error);
    });
  }, INTERVAL_MS);

  console.log("[Scheduler] Started successfully");
}

/**
 * Stop the scheduler
 */
export function stopScheduler() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log("[Scheduler] Stopped");
  }
}

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("[Scheduler] Received SIGINT, stopping scheduler...");
  stopScheduler();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("[Scheduler] Received SIGTERM, stopping scheduler...");
  stopScheduler();
  process.exit(0);
});
