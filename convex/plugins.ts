import { mutation, query } from "./_generated/server";
import { pluginsToSeed } from "./plugins/seedData"; // 👈 Import the array

export const seedPlugins = mutation({
  args: {},
  handler: async (ctx) => {
    for (const plugin of pluginsToSeed) {
      const existing = await ctx.db
        .query("plugins")
        .withIndex("by_slug", (q) => q.eq("slug", plugin.slug))
        .first();
      if (!existing) {
        await ctx.db.insert("plugins", plugin);
      }
    }
    return "Plugins seeded/updated successfully";
  },
});

export const getAllPlugins = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("plugins").collect();
  },
});