"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CheckCircle2, Circle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TaskList({ subjectId }: { subjectId: Id<"subjects"> }) {
  const tasks = useQuery(api.tasks.getTasksBySubject, { subjectId });

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
              {task.status === "completed" ? (
                <CheckCircle2 className="size-5 text-primary" />
              ) : (
                <Circle className="size-5 text-muted-foreground" />
              )}
              <div>
                <p className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                  {task.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            {/* We will add a delete/edit button here later */}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}