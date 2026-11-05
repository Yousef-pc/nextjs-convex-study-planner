import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(2, "Task must be at least 2 characters").max(200, "Task must be at most 200 characters"),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Must be YYYY-MM-DD"), 
});