import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";
import { ConvexError } from "convex/values";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new ConvexError("Not authenticated");

    return await ctx.storage.generateUploadUrl();
  },
});

export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    // Public images (like avatars) don't strictly need an ownership check 
    // to be viewed, because the ID is a random UUID.
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const deleteFileById = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new ConvexError("Not authenticated");

    // Verify the user is only deleting their own avatar
    if (user.image !== args.storageId) {
      throw new ConvexError("Unauthorized to delete this file");
    }

    await ctx.storage.delete(args.storageId); 
  },
});