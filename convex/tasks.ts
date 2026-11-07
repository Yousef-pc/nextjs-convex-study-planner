import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { authComponent } from "./auth";

export const createTask = mutation({
  args: {
    title: v.string(),
    dueDate: v.number(),
    subjectId: v.id("subjects"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new ConvexError("Not authenticated");

    return await ctx.db.insert("tasks", {
      title: args.title,
      status: "pending", // Default status
      dueDate: args.dueDate,
      subjectId: args.subjectId,
      user: user._id,
    });
  },
});

export const getTasksBySubject = query({
  args: { subjectId: v.id("subjects") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return [];

    // Fetch tasks for this subject, sorted by due date
    return await ctx.db
      .query("tasks")
      .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
      .order("desc")
      .collect();
  },
});

export const toggleTaskStatus = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new ConvexError("Not authenticated");

    const task = await ctx.db.get(args.taskId);
    if (!task || task.user !== user._id) throw new ConvexError("Task not found");

    await ctx.db.patch(args.taskId, {
      status: task.status === "pending" ? "completed" : "pending",
    });
  },
});

export const deleteTask = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new ConvexError("Not authenticated");

    const task = await ctx.db.get(args.taskId);
    if (!task || task.user !== user._id) throw new ConvexError("Task not found");

    await ctx.db.delete(args.taskId);
  },
});