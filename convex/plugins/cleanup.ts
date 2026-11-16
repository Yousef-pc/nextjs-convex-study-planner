import { MutationCtx } from "../_generated/server";

// 👈 Define the type for a cleanup function
type CleanupFunction = (ctx: MutationCtx, userId: string) => Promise<void>;

// 👈 The Registry: Maps a plugin slug to its specific cleanup logic
export const pluginCleanups: Record<string, CleanupFunction> = {
  "study-planner": async (ctx, userId) => {
    const subjects = await ctx.db
      .query("subjects")
      .withIndex("by_user", (q) => q.eq("user", userId))
      .collect();
    
    for (const sub of subjects) {
      const tasks = await ctx.db
        .query("tasks")
        .withIndex("by_subject", (q) => q.eq("subjectId", sub._id))
        .collect();
      for (const t of tasks) await ctx.db.delete(t._id);
      await ctx.db.delete(sub._id);
    }
  },

  "word-bank": async (ctx, userId) => {
    // 👈 TODO: We will write the word-bank cleanup logic here once we build the Word Bank schema!
    // Example: Delete all words for this user.
    console.log("Word bank cleanup logic will go here");
  },
};