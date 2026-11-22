import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { authComponent } from "./auth";
import { studyPlannerImportSchema } from "../app/schemas/smartImport";
import { wordBankImportSchema } from "../app/schemas/smartImport";

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

    // 1. Backend Validation (Security)
    const parsed = studyPlannerImportSchema.safeParse(args.data);
    if (!parsed.success) {
      throw new ConvexError(parsed.error.issues[0].message);
    }

    const validData = parsed.data;
    
    // 👈 Track IDs for the frontend UI indicators
    const createdSubjectIds: string[] = [];
    const updatedSubjectIds: string[] = [];
    let newTasksCount = 0;

    // 2. Fetch existing subjects
    const existingSubjects = await ctx.db
      .query("subjects")
      .withIndex("by_user", (q) => q.eq("user", user._id))
      .collect();

    const subjectMap = new Map(
      existingSubjects.map((s) => [s.subject.toLowerCase(), s._id])
    );

    // 3. Loop through data
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
        
        // 👈 Add to new subjects list
        createdSubjectIds.push(subjectId); 
      } else if (tasks.length > 0) {
        // 👈 If the subject exists AND we are adding tasks to it, mark as updated
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

    // 👈 Return the IDs so the frontend can show the dots
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

    // 1. Backend Validation (Security)
    const parsed = wordBankImportSchema.safeParse(args.data);
    if (!parsed.success) {
      throw new ConvexError(parsed.error.issues[0].message);
    }

    // 2. Insert into database
    let newWordsCount = 0;
    for (const item of parsed.data) {
      // Filter out empty strings from examples just in case
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