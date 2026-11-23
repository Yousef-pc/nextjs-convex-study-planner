import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { authComponent } from "./auth";
import { studyPlannerImportSchema, wordBankImportSchema } from "../app/schemas/smartImport";

export const importStudyData = mutation({
  args: {
    data: v.record(
      v.string(), 
      v.array(
        v.object({
          task: v.string(),
          dueDate: v.string(), 
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new ConvexError("Not authenticated");

    const parsed = studyPlannerImportSchema.safeParse(args.data);
    if (!parsed.success) {
      throw new ConvexError(parsed.error.issues[0].message);
    }

    const validData = parsed.data;
    
    // 1. Fetch existing subjects
    const existingSubjects = await ctx.db
      .query("subjects")
      .withIndex("by_user", (q) => q.eq("user", user._id))
      .collect();

    const subjectMap = new Map(
      existingSubjects.map((s) => [s.subject.toLowerCase(), s._id])
    );

    // 2. 👈 PRE-CALCULATE LIMITS (Before any DB writes)
    let potentialNewSubjects = 0;
    let totalTasks = 0;

    for (const [subjectName, tasks] of Object.entries(validData)) {
      totalTasks += tasks.length;
      if (!subjectMap.has(subjectName.toLowerCase())) {
        potentialNewSubjects++;
      }
    }

    if (potentialNewSubjects > 50) {
      throw new ConvexError(`Import rejected: Cannot create more than 50 new subjects at once. (You tried to create ${potentialNewSubjects}).`);
    }
    if (totalTasks > 500) {
      throw new ConvexError(`Import rejected: Cannot add more than 500 tasks at once. (You tried to add ${totalTasks}).`);
    }

    // 3. Loop through and insert
    const createdSubjectIds: string[] = [];
    const updatedSubjectIds: string[] = [];
    let newTasksCount = 0;

    for (const [subjectName, tasks] of Object.entries(validData)) {
      const normalizedName = subjectName.toLowerCase();
      let subjectId = subjectMap.get(normalizedName);

      if (!subjectId) {
        subjectId = await ctx.db.insert("subjects", {
          subject: subjectName,
          user: user._id,
          pluginSlug: "study-planner",
        });
        subjectMap.set(normalizedName, subjectId);
        createdSubjectIds.push(subjectId); 
      } else if (tasks.length > 0) {
        updatedSubjectIds.push(subjectId);
      }

      for (const task of tasks) {
        const timestamp = new Date(task.dueDate).getTime();
        await ctx.db.insert("tasks", {
          title: task.task,
          status: "pending",
          dueDate: timestamp,
          subjectId: subjectId,
          user: user._id,
          pluginSlug: "study-planner",
        });
        newTasksCount++;
      }
    }

    return { createdSubjectIds, updatedSubjectIds, newTasksCount };
  },
});

export const importWordBankData = mutation({
  args: {
    data: v.array(
      v.object({
        word: v.string(),
        meaning: v.string(),
        examples: v.optional(v.array(v.string())),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new ConvexError("Not authenticated");

    const parsed = wordBankImportSchema.safeParse(args.data);
    if (!parsed.success) {
      throw new ConvexError(parsed.error.issues[0].message);
    }

    // 👈 PRE-CALCULATE LIMITS
    let totalExamples = 0;
    for (const item of parsed.data) {
      totalExamples += item.examples.length;
    }
    
    // Zod already ensures max 200 words, but we check total examples here
    if (totalExamples > 1000) {
      throw new ConvexError(`Import rejected: Cannot add more than 1000 examples at once. (You tried to add ${totalExamples}).`);
    }

    let newWordsCount = 0;
    for (const item of parsed.data) {
      const cleanExamples = item.examples.filter((e) => e.trim() !== "");

      await ctx.db.insert("words", {
        word: item.word.trim(),
        meaning: item.meaning.trim(),
        examples: cleanExamples,
        userId: user._id,
      });
      newWordsCount++;
    }

    return { newWordsCount };
  },
});