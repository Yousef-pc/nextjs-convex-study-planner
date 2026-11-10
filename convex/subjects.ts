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
    if (!user) throw new ConvexError("Not authenticated");

    const parsed = subjectSchema.safeParse({ subject: args.subject });
    if (!parsed.success) {
      throw new ConvexError("Invalid input: Subject must be between 2 and 50 characters");
    }

    const trimmedSubject = parsed.data.subject.trim();

    // 1. Fetch all existing subjects for this user
    const userSubjects = await ctx.db
      .query("subjects")
      .withIndex("by_user", (q) => q.eq("user", user._id))
      .collect();

    // 2. Check for duplicates (case-insensitive comparison)
    const isDuplicate = userSubjects.some(
      (sub) => sub.subject.toLowerCase() === trimmedSubject.toLowerCase()
    );

    if (isDuplicate) {
      throw new ConvexError("You already have a subject with this name.");
    }

    // 3. Save exactly what the user typed (preserving casing)
    const subjectId = await ctx.db.insert("subjects", {
      subject: trimmedSubject,
      user: user._id,
    });

    return subjectId;
  }
});

export const getSubjects = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return []; 

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
    if (!user) return null;

    const subject = await ctx.db.get(args.subjectId);
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
    if (!subject || subject.user !== user._id) {
      throw new ConvexError("Subject not found or unauthorized");
    }

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
      .collect();

    for (const task of tasks) {
      await ctx.db.delete(task._id);
    }

    await ctx.db.delete(args.subjectId);
  },
});