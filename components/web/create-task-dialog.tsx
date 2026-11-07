"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { taskSchema } from "@/app/schemas/task";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";

export default function CreateTaskDialog({ 
  children, 
  subjectId 
}: { 
  children: React.ReactElement;
  subjectId: Id<"subjects">;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // 👈 Optimistic Update added here
  const createTask = useMutation(api.tasks.createTask).withOptimisticUpdate(
    (localStore, args) => {
      // 1. Get the current tasks from the cache
      const currentTasks = localStore.getQuery(api.tasks.getTasksBySubject, { 
        subjectId: args.subjectId 
      });

      if (currentTasks !== undefined) {
        // 2. Create a fake task object
        const newTask = {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          _id: `temp-${args.title}` as any,
          _creationTime: 0,
          title: args.title,
          dueDate: args.dueDate,
          subjectId: args.subjectId,
          user: "temp-user",
          status: "pending",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;

        // 3. Push the new task into the cached list instantly
        localStore.setQuery(
          api.tasks.getTasksBySubject,
          { subjectId: args.subjectId },
          [newTask, ...currentTasks]
        );
      }
    }
  );

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: "", dueDate: "" },
  });

  async function onSubmit(data: z.infer<typeof taskSchema>) {
    // 1. Close the dialog and reset the form IMMEDIATELY
    setOpen(false);
    form.reset();

    try {
      // Convert the "YYYY-MM-DD" string into a JavaScript timestamp number
      const timestamp = new Date(data.dueDate).getTime();
      
      // 2. Send to the backend in the background
      await createTask({ 
        title: data.title, 
        dueDate: timestamp,
        subjectId: subjectId,
      });
      
      // Optional: You can still show a success toast here if you want
      // toast.add({ type: "success", description: "Task added successfully" });
      
    } catch (error) {
      // 3. If it fails (e.g., offline), show the error toast
      toast.add({
        type: "error",
        description: error instanceof Error ? error.message : "Failed to add task",
        priority: "high",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
          <DialogDescription>Add a new assignment or study goal.</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="grid gap-2">
                <Label>Task Title</Label>
                <Input placeholder="e.g., Read Chapter 4" {...field} />
                {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
              </div>
            )}
          />

          <Controller
            name="dueDate"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="grid gap-2">
                <Label>Due Date</Label>
                <Input type="date" {...field} />
                {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
              </div>
            )}
          />

          <DialogFooter>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Adding..." : "Add Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}