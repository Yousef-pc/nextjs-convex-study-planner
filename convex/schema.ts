import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 1. The Master List of Available Plugins
  plugins: defineTable({
    name: v.string(),           // e.g., "Study Planner"
    slug: v.string(),           // e.g., "study-planner" (used for URLs)
    description: v.string(),    // e.g., "Track your subjects and tasks"
    installs: v.number(),       // The download counter
    isDefault: v.boolean(),     // True for the Study Planner
  }).index("by_slug", ["slug"]),

  // 2. The Mapping of User -> Plugins (What they installed)
  userPlugins: defineTable({
    userId: v.string(),
    pluginSlug: v.string(),     // e.g., "study-planner"
    customName: v.string(),     // e.g., "My Tasks"
    isActive: v.boolean(),      // Tracks the last used plugin
  })
  .index("by_user", ["userId"])
  .index("by_user_and_slug", ["userId", "pluginSlug"]),

  // Isolated Data for the Study Planner.
  subjects: defineTable({
    subject: v.string(),
    user: v.string(),
    pluginSlug: v.string(),     // Ties this subject to the "study-planner" plugin
  }).index("by_user", ["user"]),

  tasks: defineTable({
    title: v.string(),
    status: v.union(v.literal("pending"), v.literal("completed")),
    dueDate: v.number(),
    subjectId: v.id("subjects"),
    user: v.string(),
    pluginSlug: v.string(),     // Ties this task to the "study-planner" plugin
  })
  .index("by_subject", ["subjectId"])
  .index("by_user", ["user"]),

  // Isolated Data for the Word Bank.
  words: defineTable({
    word: v.string(),
    meaning: v.string(),
    examples: v.array(v.string()),
    userId: v.string(),
  }).index("by_user", ["userId"]),
});