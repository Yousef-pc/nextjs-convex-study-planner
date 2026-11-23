import { mutation, query, internalMutation  } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { authComponent } from "./auth";
import { pluginCleanups } from "./plugins/cleanup";

export const getInstalledPlugins = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("userPlugins")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const installPlugin = mutation({
  args: { pluginSlug: v.string() },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new ConvexError("Not authenticated");

    const existing = await ctx.db
      .query("userPlugins")
      .withIndex("by_user_and_slug", (q) => 
        q.eq("userId", user._id).eq("pluginSlug", args.pluginSlug)
      )
      .first();

    if (existing) throw new ConvexError("Plugin already installed");

    const plugin = await ctx.db
      .query("plugins")
      .withIndex("by_slug", (q) => q.eq("slug", args.pluginSlug))
      .first();

    if (!plugin) throw new ConvexError("Plugin not found");

    // Increment the install count
    await ctx.db.patch(plugin._id, { installs: plugin.installs + 1 });

    // Automatically use the plugin's default name for customName
    await ctx.db.insert("userPlugins", {
      userId: user._id,
      pluginSlug: args.pluginSlug,
      customName: plugin.name, 
      isActive: false,
    });
  },
});

export const uninstallPlugin = mutation({
  args: { pluginSlug: v.string() },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new ConvexError("Not authenticated");

    const installedPlugin = await ctx.db
      .query("userPlugins")
      .withIndex("by_user_and_slug", (q) => 
        q.eq("userId", user._id).eq("pluginSlug", args.pluginSlug)
      )
      .first();

    if (!installedPlugin) throw new ConvexError("Plugin not installed");
    
    // 1. Delete the installation record
    await ctx.db.delete(installedPlugin._id);

    // 2. Run the specific cleanup function for the plugin if it exists
    const cleanupFn = pluginCleanups[args.pluginSlug];
    if (cleanupFn) {
      await cleanupFn(ctx, user._id);
    }
  },
});

export const renamePlugin = mutation({
  args: { pluginSlug: v.string(), newName: v.string() },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new ConvexError("Not authenticated");

    // Server-side validation
    const trimmedName = args.newName.trim();
    if (trimmedName.length < 1 || trimmedName.length > 30) {
      throw new ConvexError("Name must be between 1 and 30 characters.");
    }

    // Check for duplicate custom names
    const allUserPlugins = await ctx.db
      .query("userPlugins")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const isDuplicate = allUserPlugins.some(
      (p) => p.pluginSlug !== args.pluginSlug && 
        p.customName.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      throw new ConvexError("You already have a plugin with this name.");
    }

    const installedPlugin = await ctx.db
      .query("userPlugins")
      .withIndex("by_user_and_slug", (q) => 
        q.eq("userId", user._id).eq("pluginSlug", args.pluginSlug)
      )
      .first();

    if (!installedPlugin) throw new ConvexError("Plugin not found");

    await ctx.db.patch(installedPlugin._id, { customName: trimmedName });
  },
});

export const setActivePlugin = mutation({
  args: { pluginSlug: v.string() },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) throw new ConvexError("Not authenticated");

    // 1. Set all installed plugins to isActive: false
    const installed = await ctx.db
      .query("userPlugins")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const plugin of installed) {
      if (plugin.isActive) {
        await ctx.db.patch(plugin._id, { isActive: false });
      }
    }

    // 2. Set the new active plugin to isActive: true
    const targetPlugin = installed.find(p => p.pluginSlug === args.pluginSlug);
    if (targetPlugin) {
      await ctx.db.patch(targetPlugin._id, { isActive: true });
    }
  },
});

export const initializeDefaultPlugin = internalMutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const defaultSlug = "study-planner";
    
    // 1. Find the Study Planner plugin
    const plugin = await ctx.db
      .query("plugins")
      .withIndex("by_slug", (q) => q.eq("slug", defaultSlug))
      .first();

    if (!plugin) {
      console.error("Default plugin 'study-planner' not found in database!");
      return;
    }

    // 2. Increment the installs counter
    await ctx.db.patch(plugin._id, { installs: plugin.installs + 1 });

    // 3. Link the new user to the plugin (auto-install)
    await ctx.db.insert("userPlugins", {
      userId: args.userId,
      pluginSlug: defaultSlug,
      customName: plugin.name,
      isActive: true, // Make it active by default so they land on it
    });
  },
});