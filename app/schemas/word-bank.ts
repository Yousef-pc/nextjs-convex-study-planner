import { z } from "zod";

export const addWordSchema = z.object({
  word: z.string().min(1, "Word is required.").max(50, "Word is too long."),
  meaning: z.string().min(1, "Meaning is required.").max(500, "Meaning is too long."), // Increased max for longer definitions
  examples: z.array(
    z.object({
      text: z.string().max(1000,  "Example cannot be more than 1000 letters"),
    })
  ),
});