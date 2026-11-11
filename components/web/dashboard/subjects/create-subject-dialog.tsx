"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { subjectSchema } from "@/app/schemas/subject";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";

export default function CreateSubjectDialog({ children }: { children: React.ReactElement }) {
  const [open, setOpen] = useState(false);

  const createSubject = useMutation(api.subjects.createSubject).withOptimisticUpdate(
    (localStore, args) => {
      const currentSubjects = localStore.getQuery(api.subjects.getSubjects, {});
      
      if (currentSubjects !== undefined) {
        const isDuplicate = currentSubjects.some(
          (s) => s.subject.toLowerCase() === args.subject.toLowerCase()
        );

        if (isDuplicate) return; 

        const newSubject = {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          _id: `temp-${args.subject}` as any, 
          _creationTime: 0,
          subject: args.subject,
          user: "temp-user", 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;

        localStore.setQuery(
          api.subjects.getSubjects,
          {},
          [newSubject, ...currentSubjects] 
        );
      }
    }
  );

  const form = useForm<z.infer<typeof subjectSchema>>({
    resolver: zodResolver(subjectSchema),
    defaultValues: { subject: "" },
  });

  async function onSubmit(data: z.infer<typeof subjectSchema>) {
    setOpen(false);
    form.reset();

    try {
      await createSubject({ subject: data.subject });
      toast.add({ 
        type: "success", 
        title: "Success", // Added title
        description: "Subject created successfully" 
      });
    } catch (error) {
      // HARDCODED error message for debugging
      toast.add({
        type: "error",
        title: "Error", // Added title
        description: "You already have a subject with this name.",
      });
    } 
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Subject</DialogTitle>
          <DialogDescription>
            Add a new subject to your study planner.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="subject"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject Name</Label>
                <Input placeholder="e.g., Mathematics" {...field} />
                {fieldState.error && (
                  <p className="text-sm text-red-500">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />

          <DialogFooter>
            <Button type="submit" className="w-full">
              Create Subject
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}