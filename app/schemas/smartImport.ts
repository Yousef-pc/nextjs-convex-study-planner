import { z } from "zod";

export const studyPlannerImportSchema = z.record(
  // .trim() removes spaces BEFORE checking the length
  z.string().trim().min(2, "Subject name must be at least 2 characters").max(50, "Subject name is too long"),
  z.array(
    z.object({
      task: z.string().trim().min(1, "Task cannot be empty").max(200, "Task is too long"),
      dueDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
        .refine((dateString) => {
          const inputDate = new Date(dateString);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          // Check if the date actually exists (e.g. catches 2026-02-30)
          const isValidCalendarDate = 
            inputDate.getFullYear() === parseInt(dateString.split("-")[0]) &&
            inputDate.getMonth() + 1 === parseInt(dateString.split("-")[1]) &&
            inputDate.getDate() === parseInt(dateString.split("-")[2]);

          return isValidCalendarDate && inputDate >= today;
        }, "Invalid date or date is in the past"),
    })
  ).max(500, "Cannot add more than 500 tasks in one import")
);

export const wordBankImportSchema = z.array(
  z.object({
    word: z.string().trim().min(1, "Word is required.").max(50, "Word is too long."),
    meaning: z.string().trim().min(1, "Meaning is required.").max(500, "Meaning is too long."),
    examples: z
      .array(z.string().trim().max(1000, "Example cannot be more than 1000 letters"))
      .max(5, "Maximum 5 examples per word")
      .optional()
      .default([]),
  })
).max(200, "Cannot import more than 200 words at once");

export const smartImportSchemas: Record<string, z.ZodSchema> = {
  "study-planner": studyPlannerImportSchema,
  "word-bank": wordBankImportSchema,
};