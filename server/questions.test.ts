import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

describe("questions.listByLecture", () => {
  it("returns an array of published questions", async () => {
    const caller = appRouter.createCaller({ user: null });
    const result = await caller.questions.listByLecture({ lectureId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });
});
