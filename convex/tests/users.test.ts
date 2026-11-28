
import { describe, it, expect } from "vitest";
import { api } from "../_generated/api";
import {
  createAuthenticatedTest,
  createTestInstance,
} from "../../lib/testUtils";

describe("User Data Deletion", () => {
  it("should delete all of the authenticated user's data while preserving other users' data", async () => {
    const { t, asUser, userId } = await createAuthenticatedTest();

    const anotherUserId = "another-user-123";

    // 1. Seed the database with data belonging to both users.
    await t.run(async (ctx) => {
      // Create the global plugin catalog.
      const studyPlannerPluginId = await ctx.db.insert("plugins", {
        name: "Study Planner",
        slug: "study-planner",
        description: "Manage subjects and tasks",
        installs: 10,
        isDefault: true,
        imageUrl: "",
      });

      await ctx.db.insert("plugins", {
        name: "Word Bank",
        slug: "word-bank",
        description: "Manage vocabulary",
        installs: 5,
        isDefault: false,
        imageUrl: "",
      });

      // Create subjects for both users.
      const mathematicsId = await ctx.db.insert("subjects", {
        subject: "Mathematics",
        user: userId,
        pluginSlug: "study-planner",
      });

      const physicsId = await ctx.db.insert("subjects", {
        subject: "Physics",
        user: userId,
        pluginSlug: "study-planner",
      });

      const chemistryId = await ctx.db.insert("subjects", {
        subject: "Chemistry",
        user: anotherUserId,
        pluginSlug: "study-planner",
      });

      // Create tasks for both users.
      await ctx.db.insert("tasks", {
        title: "Complete algebra exercises",
        status: "pending",
        dueDate: Date.now(),
        subjectId: mathematicsId,
        user: userId,
        pluginSlug: "study-planner",
      });

      await ctx.db.insert("tasks", {
        title: "Study Newton's laws",
        status: "completed",
        dueDate: Date.now(),
        subjectId: physicsId,
        user: userId,
        pluginSlug: "study-planner",
      });

      await ctx.db.insert("tasks", {
        title: "Study chemical reactions",
        status: "pending",
        dueDate: Date.now(),
        subjectId: chemistryId,
        user: anotherUserId,
        pluginSlug: "study-planner",
      });

      // Create Word Bank entries for both users.
      await ctx.db.insert("words", {
        word: "Ambitious",
        meaning: "Having a strong desire to succeed",
        examples: ["He is an ambitious student."],
        userId,
      });

      await ctx.db.insert("words", {
        word: "Persistent",
        meaning: "Continuing despite difficulties",
        examples: ["She remained persistent."],
        userId,
      });

      await ctx.db.insert("words", {
        word: "Resilient",
        meaning: "Able to recover quickly",
        examples: ["Children can be resilient."],
        userId: anotherUserId,
      });

      // Create comments for both users.
      await ctx.db.insert("comments", {
        pluginId: studyPlannerPluginId,
        userId,
        userName: "Test User",
        text: "This plugin is useful!",
      });

      await ctx.db.insert("comments", {
        pluginId: studyPlannerPluginId,
        userId,
        userName: "Test User",
        text: "I like the interface.",
      });

      await ctx.db.insert("comments", {
        pluginId: studyPlannerPluginId,
        userId: anotherUserId,
        userName: "Another User",
        text: "This is a great plugin.",
      });

      // Install plugins for both users.
      await ctx.db.insert("userPlugins", {
        userId,
        pluginSlug: "study-planner",
        customName: "My Study Planner",
        isActive: true,
      });

      await ctx.db.insert("userPlugins", {
        userId,
        pluginSlug: "word-bank",
        customName: "My Word Bank",
        isActive: false,
      });

      await ctx.db.insert("userPlugins", {
        userId: anotherUserId,
        pluginSlug: "word-bank",
        customName: "Vocabulary",
        isActive: true,
      });
    });

    // 2. Call the actual deleteUserData mutation.
    await asUser.mutation(api.users.deleteUserData, {});

    // 3. Inspect the database after deletion.
    const remaining = await t.run(async (ctx) => {
      const tasks = await ctx.db.query("tasks").collect();
      const subjects = await ctx.db.query("subjects").collect();
      const words = await ctx.db.query("words").collect();
      const comments = await ctx.db.query("comments").collect();
      const userPlugins = await ctx.db.query("userPlugins").collect();
      const plugins = await ctx.db.query("plugins").collect();

      return {
        tasks,
        subjects,
        words,
        comments,
        userPlugins,
        plugins,
      };
    });

    // 4. Verify that the authenticated user's data is gone.
    expect(remaining.tasks.filter((task) => task.user === userId))
      .toHaveLength(0);

    expect(remaining.subjects.filter((subject) => subject.user === userId))
      .toHaveLength(0);

    expect(remaining.words.filter((word) => word.userId === userId))
      .toHaveLength(0);

    expect(remaining.comments.filter((comment) => comment.userId === userId))
      .toHaveLength(0);

    expect(remaining.userPlugins.filter((plugin) => plugin.userId === userId))
      .toHaveLength(0);

    // 5. Verify that the other user's data still exists.
    expect(remaining.tasks.filter((task) => task.user === anotherUserId))
      .toHaveLength(1);

    expect(remaining.subjects.filter((subject) => subject.user === anotherUserId))
      .toHaveLength(1);

    expect(remaining.words.filter((word) => word.userId === anotherUserId))
      .toHaveLength(1);

    expect(remaining.comments.filter((comment) => comment.userId === anotherUserId))
      .toHaveLength(1);

    expect(remaining.userPlugins.filter((plugin) => plugin.userId === anotherUserId))
      .toHaveLength(1);

    // 6. The global plugin catalog must not be deleted.
    expect(remaining.plugins).toHaveLength(2);
  });

  it("should reject requests from unauthenticated users", async () => {
    const { t } = createTestInstance();

    // Seed a record that must remain untouched.
    await t.run(async (ctx) => {
      await ctx.db.insert("subjects", {
        subject: "Protected Subject",
        user: "some-user",
        pluginSlug: "study-planner",
      });
    });

    // An unauthenticated request must fail.
    await expect(
      t.mutation(api.users.deleteUserData, {})
    ).rejects.toThrow("Not authenticated");

    // Verify that the record was not deleted.
    const subjects = await t.run((ctx) =>
      ctx.db.query("subjects").collect()
    );

    expect(subjects).toHaveLength(1);
    expect(subjects[0].subject).toBe("Protected Subject");
  });
});