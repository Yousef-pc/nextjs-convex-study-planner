import { z } from "zod";

export const subjectSchema = z.object({
  subject: z.string().min(2, "Subject must be at least 2 characters").max(50),
});