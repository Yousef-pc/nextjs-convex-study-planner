"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BookOpen, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { toast } from "@/components/ui/toast";

export default function SubjectList() {
  const subjects = useQuery(api.subjects.getSubjects);
  
  // Add the optimistic update
  const deleteSubject = useMutation(api.subjects.deleteSubject).withOptimisticUpdate(
    (localStore, args) => {
      const currentSubjects = localStore.getQuery(api.subjects.getSubjects, {});
      if (currentSubjects !== undefined) {
        localStore.setQuery(
          api.subjects.getSubjects,
          {},
          currentSubjects.filter((s) => s._id !== args.subjectId)
        );
      }
    }
  );

  if (subjects === undefined) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/20">
        <BookOpen className="mx-auto size-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No subjects yet</h3>
        <p className="text-muted-foreground">Create your first subject to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {subjects.map((sub) => (
        <Link href={`/dashboard/subjects/${sub._id}`} key={sub._id}>
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full relative group">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-primary" />
                {sub.subject}
              </CardTitle>
              
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Add try/catch for error handling
                  try {
                    await deleteSubject({ subjectId: sub._id });
                  } catch (error) {
                    toast.add({
                      type: "error",
                      description: "Could not delete subject.",
                      priority: "high",
                    });
                  }
                }}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1"
              >
                <Trash2 className="size-4" />
              </button>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}