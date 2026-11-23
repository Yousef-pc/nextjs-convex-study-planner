import { z } from "zod";

export const studyPlannerImportSchema = z.record(
  z.string().min(2, "Subject name must be at least 2 characters").max(50, "Subject name is too long"),
  z.array(
    z.object({
      task: z.string().min(1, "Task cannot be empty").max(200, "Task is too long"),
      dueDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
        .refine((dateString) => {
          const inputDate = new Date(dateString);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return inputDate >= today;
        }, "Due date cannot be in the past"),
    })
  ).max(500, "Cannot add more than 500 tasks in one import") // Max tasks per subject (safety net)
);

export const wordBankImportSchema = z.array(
  z.object({
    word: z.string().min(1, "Word is required.").max(50, "Word is too long."),
    meaning: z.string().min(1, "Meaning is required.").max(500, "Meaning is too long."),
    examples: z
      .array(z.string().max(1000, "Example cannot be more than 1000 letters"))
      .max(5, "Maximum 5 examples per word") // Max examples per word
      .optional()
      .default([]),
  })
).max(200, "Cannot import more than 200 words at once"); // Max words per import

export const smartImportSchemas: Record<string, z.ZodSchema> = {
  "study-planner": studyPlannerImportSchema,
  "word-bank": wordBankImportSchema,
};