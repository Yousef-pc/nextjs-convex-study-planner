import { mutation } from "./_generated/server";
import { authComponent } from "./auth";
import { ConvexError } from "convex/values";

export const deleteUserData = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new ConvexError("Not authenticated");

    const userId = user._id;

    // 1. Delete all of the user's tasks
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("user", userId))
      .collect();
    for (const task of tasks) {
      await ctx.db.delete(task._id);
    }

    // 2. Delete all of the user's subjects
    const subjects = await ctx.db
      .query("subjects")
      .withIndex("by_user", (q) => q.eq("user", userId))
      .collect();
    for (const subject of subjects) {
      await ctx.db.delete(subject._id);
    }

    // 3. Delete all of the user's words (Word Bank)
    const words = await ctx.db
      .query("words")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const word of words) {
      await ctx.db.delete(word._id);
    }

    // 4. Delete all of the user's comments
    // Note: comments table uses `userId`, so we can't use an index by user. 
    // We have to filter, which is fine for a single user's deletion.
    const comments = await ctx.db
      .query("comments")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    // 5. Delete all of the user's installed plugins
    const userPlugins = await ctx.db
      .query("userPlugins")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const plugin of userPlugins) {
      await ctx.db.delete(plugin._id);
    }
  },
});