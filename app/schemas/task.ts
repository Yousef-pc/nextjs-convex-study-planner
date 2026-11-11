import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(2, "Task must be at least 2 characters").max(200, "Task must be at most 200 characters"),
  dueDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
    .refine((dateString) => {
      // 1. Convert the string to a Date object
      const selectedDate = new Date(dateString);
      
      // 2. Get today's date, but reset the time to midnight (00:00:00)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // 3. Return true if the selected date is today or in the future
      return selectedDate >= today;
    }, "Due date cannot be in the past"),
});