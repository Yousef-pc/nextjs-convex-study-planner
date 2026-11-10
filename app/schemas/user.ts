import { z } from "zod";

export const userProfileSchema = z.object({
  username: z
    .string()
    .min(2, "Username must be at least 2 characters.")
    .max(30, "Username cannot exceed 30 characters."),
});