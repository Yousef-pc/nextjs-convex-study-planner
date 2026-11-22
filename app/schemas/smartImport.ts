import { z } from "zod";

// 1. STUDY PLANNER SCHEMA
export const studyPlannerImportSchema = z.record(
  z.string().min(2, "Subject name must be at least 2 characters"),
  // 👈 Because we use z.array(), it already allows empty arrays! 
  // { "Math": [] } is perfectly valid. It will just create the subject.
  z.array(
    z.object({
      task: z.string().min(1, "Task cannot be empty"),
      // 👈 We enforce YYYY-MM-DD, then use .refine() to check if it's in the past
      dueDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
        .refine((dateString) => {
          const inputDate = new Date(dateString);
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Set time to midnight so today's date is allowed
          return inputDate >= today;
        }, "Due date cannot be in the past"),
    })
  )
);

// 2. WORD BANK SCHEMA (For later)
export const wordBankImportSchema = z.array(
  z.object({
    word: z.string().min(1, "Word is required.").max(50, "Word is too long."),
    meaning: z.string().min(1, "Meaning is required.").max(500, "Meaning is too long."),
    examples: z
      .array(z.string().max(1000, "Example cannot be more than 1000 letters"))
      .optional()
      .default([]),
  })
);

export const smartImportSchemas: Record<string, z.ZodSchema> = {
  "study-planner": studyPlannerImportSchema,
  "word-bank": wordBankImportSchema,
};