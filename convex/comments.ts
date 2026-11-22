import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { authComponent } from "./auth";

export const getComments = query({
  args: { pluginId: v.id("plugins") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comments")
      .withIndex("by_plugin", (q) => q.eq("pluginId", args.pluginId))
      .order("desc") // Newest comments first
      .collect();
  },
});

export const addComment = mutation({
  args: {
    pluginId: v.id("plugins"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new ConvexError("Not authenticated");

    const trimmedText = args.text.trim();
    if (!trimmedText) throw new ConvexError("Comment cannot be empty");
    if (trimmedText.length > 1000) throw new ConvexError("Comment is too long (max 1000 characters)");

    await ctx.db.insert("comments", {
      pluginId: args.pluginId,
      userId: user._id,
      userName: user.name || "Anonymous User", // Fallback if no name
      userImage: user.image || undefined,
      text: trimmedText,
    });
  },
});

export const deleteComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new ConvexError("Not authenticated");

    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new ConvexError("Comment not found");

    // SECURITY CHECK: Ensure the user requesting deletion actually owns the comment
    if (comment.userId !== user._id) {
      throw new ConvexError("You can only delete your own comments");
    }

    await ctx.db.delete(args.commentId);
  },
});