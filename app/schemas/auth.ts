import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.email("Invalid email address").max(200, "Email cannot be more than 200 characters"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100, "Password must have 100 characters at maximum"),
});