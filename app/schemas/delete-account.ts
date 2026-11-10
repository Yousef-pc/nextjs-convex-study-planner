import { z } from "zod";

export const deleteAccountSchema = z.object({
  confirmation: z
    .string()
    .refine((val) => val === "DELETE", {
      message: "You must type DELETE exactly as shown.",
    }),
});