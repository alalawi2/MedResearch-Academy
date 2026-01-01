import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createLecture, createQuestion, deleteLecture, deleteQuestion, getAllLectures, getAllQuestions, getPublishedQuestionsByLectureId, getQuestionsByLectureId, updateQuestion } from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  lectures: router({
    list: publicProcedure.query(async () => {
      return await getAllLectures();
    }),
    upload: adminProcedure
      .input(
        z.object({
          title: z.string().min(1),
          description: z.string().optional(),
          videoUrl: z.string().optional(),
          fileData: z.string().optional(), // base64 encoded file
          fileName: z.string().optional(),
          mimeType: z.string().optional(),
          fileSize: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        let fileUrl: string | null = null;
        let fileKey: string | null = null;
        
        // Upload file if provided
        if (input.fileData && input.fileName && input.mimeType && input.fileSize) {
          const fileBuffer = Buffer.from(input.fileData, "base64");
          fileKey = `lectures/${nanoid()}-${input.fileName}`;
          const result = await storagePut(fileKey, fileBuffer, input.mimeType);
          fileUrl = result.url;
        }
        
        // Save to database
        await createLecture({
          title: input.title,
          description: input.description || null,
          videoUrl: input.videoUrl || null,
          fileUrl,
          fileKey,
          fileName: input.fileName || null,
          fileSize: input.fileSize || null,
          mimeType: input.mimeType || null,
          uploadedBy: ctx.user.id,
        });
        
        return { success: true, url: fileUrl || input.videoUrl };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteLecture(input.id);
        return { success: true };
      }),
  }),
  questions: router({
    listByLecture: publicProcedure
      .input(z.object({ lectureId: z.number() }))
      .query(async ({ input }) => {
        return await getPublishedQuestionsByLectureId(input.lectureId);
      }),
    listAll: adminProcedure
      .query(async () => {
        return await getAllQuestions();
      }),
    ask: publicProcedure
      .input(
        z.object({
          lectureId: z.number(),
          question: z.string().min(10),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) {
          throw new Error("You must be logged in to ask a question");
        }
        await createQuestion({
          lectureId: input.lectureId,
          userId: ctx.user.id,
          userName: ctx.user.name || "Anonymous",
          userEmail: ctx.user.email || null,
          question: input.question,
          answer: null,
          answeredBy: null,
          answeredAt: null,
          isPublished: 0, // Not published by default
        });
        return { success: true };
      }),
    answer: adminProcedure
      .input(
        z.object({
          questionId: z.number(),
          answer: z.string().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await updateQuestion(input.questionId, {
          answer: input.answer,
          answeredBy: ctx.user.id,
          answeredAt: new Date(),
          isPublished: 1, // Publish when answered
        });
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ questionId: z.number() }))
      .mutation(async ({ input }) => {
        await deleteQuestion(input.questionId);
        return { success: true };
      }),
    togglePublish: adminProcedure
      .input(z.object({ id: z.number(), isPublished: z.boolean() }))
      .mutation(async ({ input }) => {
        await updateQuestion(input.id, {
          isPublished: input.isPublished ? 1 : 0,
        });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
