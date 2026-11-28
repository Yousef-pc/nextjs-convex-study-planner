
import { describe, it, expect } from "vitest";
import { api } from "../_generated/api";
import { createAuthenticatedTest } from "../../lib/testUtils";

const getFutureDate = () =>
  new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

describe("Smart Import Validation", () => {
  // ==========================================
  // 1. STUDY PLANNER TESTS
  // ==========================================

  describe("Study Planner", () => {
    it("should reject importing more than 50 new subjects", async () => {
      const { asUser } = await createAuthenticatedTest();

      const dueDate = getFutureDate();

      const payload: Record<
        string,
        { task: string; dueDate: string }[]
      > = {};

      for (let i = 0; i < 51; i++) {
        payload[`Subject ${i}`] = [
          { task: `Task ${i}`, dueDate },
        ];
      }

      await expect(
        asUser.mutation(api.smartImport.importStudyData, {
          data: payload,
        })
      ).rejects.toThrow(
        "Import rejected: Cannot create more than 50 new subjects at once."
      );
    });

    it("should reject importing more than 500 tasks in total", async () => {
      const { asUser } = await createAuthenticatedTest();

      const dueDate = getFutureDate();

      // Distribute the tasks across two subjects.
      // This avoids the per-subject Zod limit of 500.
      const payload: Record<
        string,
        { task: string; dueDate: string }[]
      > = {
        "Subject A": Array.from({ length: 250 }, (_, i) => ({
          task: `Task A-${i}`,
          dueDate,
        })),

        "Subject B": Array.from({ length: 251 }, (_, i) => ({
          task: `Task B-${i}`,
          dueDate,
        })),
      };

      await expect(
        asUser.mutation(api.smartImport.importStudyData, {
          data: payload,
        })
      ).rejects.toThrow(
        "Import rejected: Cannot add more than 500 tasks at once."
      );
    });
  });

  // ==========================================
  // 2. WORD BANK TESTS
  // ==========================================

  describe("Word Bank", () => {
    it("should reject importing more than 200 words", async () => {
      const { asUser } = await createAuthenticatedTest();

      const payload = Array.from({ length: 201 }, (_, i) => ({
        word: `Word ${i}`,
        meaning: `Meaning ${i}`,
        examples: [],
      }));

      await expect(
        asUser.mutation(api.smartImport.importWordBankData, {
          data: payload,
        })
      ).rejects.toThrow(
        "Cannot import more than 200 words at once"
      );
    });

    it("should accept exactly 1000 examples across 200 words", async () => {
      const { t, asUser } = await createAuthenticatedTest();

      const payload = Array.from({ length: 200 }, (_, i) => ({
        word: `Word ${i}`,
        meaning: `Meaning ${i}`,
        examples: Array.from(
          { length: 5 },
          (_, j) => `Example ${j + 1}`
        ),
      }));

      const result = await asUser.mutation(
        api.smartImport.importWordBankData,
        { data: payload }
      );

      expect(result.newWordsCount).toBe(200);

      // Verify the actual database contents.
      const storedWords = await t.run((ctx) =>
        ctx.db.query("words").collect()
      );

      expect(storedWords).toHaveLength(200);

      const totalExamples = storedWords.reduce(
        (total, word) => total + word.examples.length,
        0
      );

      expect(totalExamples).toBe(1000);
    });
  });
});