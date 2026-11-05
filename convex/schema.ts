import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  subjects: defineTable({
    subject: v.string(),
    user: v.string(),
  }).index("by_user", ["user"]),

  tasks: defineTable({
    title: v.string(),
    status: v.union(v.literal("pending"), v.literal("completed")),
    dueDate: v.number(), // Store dates as timestamps
    subjectId: v.id("subjects"),
    user: v.string(),
  })
  .index("by_subject", ["subjectId"])
  .index("by_user", ["user"]),
});
