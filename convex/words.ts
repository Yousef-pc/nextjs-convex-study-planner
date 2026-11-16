import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { authComponent } from "./auth";

export const getWords = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("words")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const addWord = mutation({
  args: {
    word: v.string(),
    meaning: v.string(),
    examples: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new ConvexError("Not authenticated");

    if (!args.word.trim() || !args.meaning.trim()) {
      throw new ConvexError("Word and meaning cannot be empty");
    }

    return await ctx.db.insert("words", {
      word: args.word.trim(),
      meaning: args.meaning.trim(),
      examples: args.examples.filter((e) => e.trim() !== ""),
      userId: user._id,
    });
  },
});

export const deleteWord = mutation({
  args: { id: v.id("words") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new ConvexError("Not authenticated");

    const word = await ctx.db.get(args.id);
    if (!word || word.userId !== user._id) {
      throw new ConvexError("Word not found or unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});

export const updateWord = mutation({
  args: {
    id: v.id("words"),
    word: v.string(),
    meaning: v.string(),
    examples: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new ConvexError("Not authenticated");

    const existingWord = await ctx.db.get(args.id);
    if (!existingWord || existingWord.userId !== user._id) {
      throw new ConvexError("Word not found or unauthorized");
    }

    await ctx.db.patch(args.id, {
      word: args.word.trim(),
      meaning: args.meaning.trim(),
      examples: args.examples.filter((e) => e.trim() !== ""),
    });
  },
});