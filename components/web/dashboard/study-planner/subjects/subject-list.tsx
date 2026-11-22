"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BookOpen, Trash2, Search, X } from "lucide-react"; // 👈 Added Search and X icons
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input"; // 👈 Added Input
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

interface SubjectListProps {
  newSubjectIds: Set<string>;
  updatedSubjectIds: Set<string>;
  onSubjectClick: (subjectId: string) => void;
}

export default function SubjectList({ 
  newSubjectIds, 
  updatedSubjectIds, 
  onSubjectClick 
}: SubjectListProps) {
  const subjects = useQuery(api.subjects.getSubjects);
  
  // 👈 State for the search input
  const [searchQuery, setSearchQuery] = useState("");
  
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
    setSubjectToDelete(null); 
    
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

  // 👈 1. Create a derived array that filters the subjects based on the search query
  const filteredSubjects = subjects.filter((sub) =>
    sub.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 👈 2. If the user has NO subjects at all, show the empty state
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
      {/* 👈 3. The Search Input UI */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search subjects..."
          className="pl-9 pr-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* 👈 4. Show a "No results" message if search yields nothing */}
      {filteredSubjects.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/20">
          <Search className="mx-auto size-8 text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold">No subjects found</h3>
          <p className="text-muted-foreground">No subjects match &quot;{searchQuery}&quot;</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* 👈 5. Map over the filteredSubjects instead of the original subjects */}
          {filteredSubjects.map((sub) => {
            const isNew = newSubjectIds.has(sub._id);
            const isUpdated = updatedSubjectIds.has(sub._id);

            return (
              <Link 
                href={`/dashboard/subjects/${sub._id}`} 
                key={sub._id}
                onClick={() => onSubjectClick(sub._id)}
              >
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full relative group">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <div 
                        className={`size-3 rounded-full transition-colors duration-500 ${
                          isNew 
                            ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" 
                            : isUpdated 
                              ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" 
                              : "bg-primary"
                        }`} 
                      />
                      {sub.subject}
                    </CardTitle>
                    
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
            );
          })}
        </div>
      )}

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