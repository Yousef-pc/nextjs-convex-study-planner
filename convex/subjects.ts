import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { authComponent } from "./auth";
import { subjectSchema } from "../app/schemas/subject";

export const createSubject = mutation({
  args: {
    subject: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);

    if (!user) {
      throw new ConvexError("Not authenticated");
    }

    const parsed = subjectSchema.safeParse({ subject: args.subject });

    if (!parsed.success) {
      throw new ConvexError("Invalid input: Subject must be between 2 and 50 characters");
    }

    const subjectId = await ctx.db.insert("subjects", {
      subject: parsed.data.subject,
      user: user._id,
    });

    return subjectId;
  }
});

export const getSubjects = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);

    if (!user) return []; // If not logged in, return empty array

    return await ctx.db
      .query("subjects")
      .withIndex("by_user", (q) => q.eq("user", user._id))
      .collect();
  },
});

export const getSubjectById = query({
  args: { subjectId: v.id("subjects") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);

    console.log("USER:", user?._id, "SUBJECT ID:", args.subjectId);

    if (!user) return null;

    const subject = await ctx.db.get(args.subjectId);

    console.log("SUBJECT FOUND:", subject);
    
    // Security check: Make sure the user owns this subject
    if (!subject || subject.user !== user._id) return null;
    
    return subject;
  }
});

export const deleteSubject = mutation({
  args: { subjectId: v.id("subjects") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new ConvexError("Not authenticated");

    const subject = await ctx.db.get(args.subjectId);
    if (!subject || subject.user !== user._id) throw new ConvexError("Subject not found");

    // 1. Find all tasks for this subject
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
      .collect();

    // 2. Delete all those tasks
    for (const task of tasks) {
      await ctx.db.delete(task._id);
    }

    // 3. Finally, delete the subject itself
    await ctx.db.delete(args.subjectId);
  },
});