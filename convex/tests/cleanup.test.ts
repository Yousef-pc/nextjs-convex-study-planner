import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import schema from "../schema";
import { pluginCleanups } from "../plugins/cleanup";

const modules = (import.meta as ImportMeta & {
  glob: (pattern: string) => Record<string, () => Promise<unknown>>;
}).glob("../**/*.ts");

describe("Plugin Uninstall Cleanup", () => {
  it("should delete all words when Word Bank cleanup is triggered", async () => {
    const t = convexTest(schema, modules);
    const userId = "test-user-123";

    // 1. Seed the database with 3 words
    await t.run(async (ctx) => {
      await ctx.db.insert("words", { word: "Apple", meaning: "Fruit", examples: [], userId });
      await ctx.db.insert("words", { word: "Banana", meaning: "Fruit", examples: [], userId });
      await ctx.db.insert("words", { word: "Car", meaning: "Vehicle", examples: [], userId });
    });

    // 2. Call the cleanup function directly
    await t.run(async (ctx) => {
      const cleanupFn = pluginCleanups["word-bank"];
      if (cleanupFn) {
        await cleanupFn(ctx, userId);
      }
    });

    // 3. Verify the words are gone
    await t.run(async (ctx) => {
      const remainingWords = await ctx.db
        .query("words")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
      expect(remainingWords.length).toBe(0);
    });
  });
});