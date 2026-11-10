// convex/users.ts
import { mutation } from "./_generated/server";
import { authComponent } from "./auth";
import { ConvexError } from "convex/values";

export const deleteUserData = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new ConvexError("Not authenticated");

    // 1. Delete all of the user's tasks
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("user", user._id))
      .collect();
    for (const task of tasks) {
      await ctx.db.delete(task._id);
    }

    // 2. Delete all of the user's subjects
    const subjects = await ctx.db
      .query("subjects")
      .withIndex("by_user", (q) => q.eq("user", user._id))
      .collect();
    for (const subject of subjects) {
      await ctx.db.delete(subject._id);
    }
  },
});