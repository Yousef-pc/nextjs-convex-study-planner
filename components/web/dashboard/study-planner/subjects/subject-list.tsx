"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BookOpen, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { toast } from "@/components/ui/toast";
import { Id } from "@/convex/_generated/dataModel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function SubjectList() {
  const subjects = useQuery(api.subjects.getSubjects);
  
  // 👈 Track which subject is currently pending deletion
  const [subjectToDelete, setSubjectToDelete] = useState<{ id: Id<"subjects">, name: string } | null>(null);

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

  const handleDeleteConfirm = async () => {
    if (!subjectToDelete) return;
    
    const id = subjectToDelete.id;
    setSubjectToDelete(null); // Close dialog instantly
    
    try {
      await deleteSubject({ subjectId: id });
      toast.add({ type: "success", description: "Subject deleted successfully" });
    } catch (error) {
      toast.add({
        type: "error",
        description: error instanceof Error ? error.message : "Failed to delete subject",
        priority: "high",
      });
    }
  };

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
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {subjects.map((sub) => (
          <Link href={`/dashboard/subjects/${sub._id}`} key={sub._id}>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full relative group">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-primary" />
                  {sub.subject}
                </CardTitle>
                
                {/* 👈 The button now just opens the dialog and passes the subject info */}
                <button
                  onClick={(e) => {
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    setSubjectToDelete({ id: sub._id, name: sub.subject });
                  }}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all p-1"
                >
                  <Trash2 className="size-4" />
                </button>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* 👈 One single Dialog for the entire list */}
      <AlertDialog 
        open={subjectToDelete !== null} 
        onOpenChange={(open) => !open && setSubjectToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{subjectToDelete?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this subject and all tasks inside it. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Subject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}