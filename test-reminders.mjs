/**
 * Test script to manually trigger the reminder job
 * Run with: node test-reminders.mjs
 */

import { sendRemindersJob } from "./server/jobs/send-reminders.ts";

console.log("=".repeat(60));
console.log("Testing Email Reminder System");
console.log("=".repeat(60));
console.log("");

sendRemindersJob()
  .then(() => {
    console.log("");
    console.log("=".repeat(60));
    console.log("Test completed successfully");
    console.log("=".repeat(60));
    process.exit(0);
  })
  .catch((error) => {
    console.error("");
    console.error("=".repeat(60));
    console.error("Test failed:", error);
    console.error("=".repeat(60));
    process.exit(1);
  });
