import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { pluginsToSeed } from "./plugins/seedData";

export const seedPlugins = mutation({
  args: {},
  handler: async (ctx) => {
    let inserted = 0;
    let updated = 0;
    let unchanged = 0;

    for (const plugin of pluginsToSeed) {
      const existing = await ctx.db
        .query("plugins")
        .withIndex("by_slug", (q) => q.eq("slug", plugin.slug))
        .first();

      if (!existing) {
        await ctx.db.insert("plugins", plugin);
        inserted++;
        continue;
      }

      const changes: Partial<{
        name: string;
        description: string;
        isDefault: boolean;
        imageUrl: string;
      }> = {};

      if (existing.name !== plugin.name) changes.name = plugin.name;
      if (existing.description !== plugin.description) changes.description = plugin.description;
      if (existing.isDefault !== plugin.isDefault) changes.isDefault = plugin.isDefault;
      if (existing.imageUrl !== plugin.imageUrl) changes.imageUrl = plugin.imageUrl;

      if (Object.keys(changes).length > 0) {
        await ctx.db.patch(existing._id, changes);
        updated++;
      } else {
        unchanged++;
      }
    }

    return `Seeded: ${inserted} inserted, ${updated} updated, ${unchanged} unchanged`;
  },
});

export const getAllPlugins = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("plugins").collect();
  },
});

export const getPluginBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("plugins")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});