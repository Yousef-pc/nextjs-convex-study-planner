"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CheckCircle2, Circle, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";

export default function TaskList({ subjectId }: { subjectId: Id<"subjects"> }) {
  const tasks = useQuery(api.tasks.getTasksBySubject, { subjectId });

  const toggleTask = useMutation(api.tasks.toggleTaskStatus).withOptimisticUpdate(
    (localStore, args) => {
      // 1. Get the current tasks from the local cache
      const currentTasks = localStore.getQuery(api.tasks.getTasksBySubject, { subjectId });

      if (currentTasks !== undefined) {
        // 2. Map through them and flip the status of the clicked task
        const updatedTasks = currentTasks.map((task) => {
          if (task._id === args.taskId) {
            return {
              ...task,
              status: task.status === "pending" ? "completed" : "pending"
            } as typeof task; // Type assertion to satisfy TS
          }
          return task;
        });

        // 3. Set the updated list back into the cache
        localStore.setQuery(api.tasks.getTasksBySubject, { subjectId }, updatedTasks);
      }
    }
  );
  const deleteTask = useMutation(api.tasks.deleteTask).withOptimisticUpdate(
    (localStore, args) => {
      const currentTasks = localStore.getQuery(api.tasks.getTasksBySubject, { subjectId });

      if (currentTasks !== undefined) {
        // Filter out the task that we are deleting
        const updatedTasks = currentTasks.filter((task) => task._id !== args.taskId);

        localStore.setQuery(api.tasks.getTasksBySubject, { subjectId }, updatedTasks);
      }
    }
  );

  if (tasks === undefined) {
    return <Skeleton className="h-24 w-full rounded-xl" />;
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed rounded-xl bg-muted/20">
        <p className="text-muted-foreground">No tasks yet. Add one to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <Card key={task._id}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">

              {/* 👈 Clickable Status Toggle */}
              <button
                onClick={async () => {
                  try {
                    await toggleTask({ taskId: task._id });
                  } catch (error) {
                    toast.add({
                      type: "error",
                      description: "Could not update task. Check your connection.",
                      priority: "high",
                    });
                  }
                }}

                className="hover:opacity-70 transition-opacity focus:outline-none"
              >
                {task.status === "completed" ? (
                  <CheckCircle2 className="size-5 text-primary" />
                ) : (
                  <Circle className="size-5 text-muted-foreground" />
                )}
              </button>

              <div>
                <p className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                  {task.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* 👈 Delete Button */}
            <button
              onClick={async () => {
                try {
                  await deleteTask({ taskId: task._id });
                } catch (error) {
                  toast.add({
                    type: "error",
                    description: "Could not delete task. Check your connection.",
                    priority: "high",
                  });
                }
              }}

              className="text-muted-foreground hover:text-destructive transition-colors p-2"
            >
              <Trash2 className="size-4" />
            </button>

          </CardContent>
        </Card>
      ))}
    </div>
  );
}