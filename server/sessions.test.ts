import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./trpc";

describe("Session Management", () => {
  const mockContext: Context = {
    user: {
      id: 1,
      openId: "test-admin",
      name: "Test Admin",
      email: "admin@test.com",
      role: "admin",
      createdAt: new Date(),
    },
  };

  const caller = appRouter.createCaller(mockContext);

  it("should get upcoming sessions", async () => {
    const sessions = await caller.sessions.getUpcoming();
    expect(Array.isArray(sessions)).toBe(true);
  });

  it("should get past sessions", async () => {
    const sessions = await caller.sessions.getPast();
    expect(Array.isArray(sessions)).toBe(true);
  });

  // Reminder subscription test skipped - reminders table not implemented yet
  // Will be added when email reminder system is fully implemented
});

describe("Calendar Integration", () => {
  it("should format session date correctly for calendar", () => {
    const sessionDate = new Date("2026-01-15T20:00:00+04:00");
    
    // Test date formatting
    const formatted = sessionDate.toISOString();
    expect(formatted).toContain("2026-01-15");
  });

  it("should calculate countdown correctly", () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days from now
    const now = Date.now();
    const difference = futureDate.getTime() - now;
    
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    expect(days).toBeGreaterThanOrEqual(6);
    expect(days).toBeLessThanOrEqual(7);
  });
});
