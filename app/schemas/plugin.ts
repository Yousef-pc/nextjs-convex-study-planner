import { z } from "zod";

export const renamePluginSchema = z.object({
  customName: z
    .string()
    .trim()
    .min(1, "Name must be at least 1 character.")
    .max(30, "Name cannot exceed 30 characters."),
});