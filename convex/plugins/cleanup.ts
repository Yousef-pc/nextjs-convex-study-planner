import { MutationCtx } from "../_generated/server";

export const pluginCleanups: Record<
  string, 
  (ctx: MutationCtx, userId: string) => Promise<void>
> = {
  "study-planner": async (ctx, userId) => {
    // Delete tasks first
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("user", userId))
      .collect();
    for (const task of tasks) {
      await ctx.db.delete(task._id);
    }
    // Then delete subjects
    const subjects = await ctx.db
      .query("subjects")
      .withIndex("by_user", (q) => q.eq("user", userId))
      .collect();
    for (const subject of subjects) {
      await ctx.db.delete(subject._id);
    }
  },
  "word-bank": async (ctx, userId) => {
    // Delete all words for the user
    const words = await ctx.db
      .query("words")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const word of words) {
      await ctx.db.delete(word._id);
    }
  },
};