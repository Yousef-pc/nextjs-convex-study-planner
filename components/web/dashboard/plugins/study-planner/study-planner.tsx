"use client";

import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import CreateSubjectDialog from "@/components/web/dashboard/study-planner/subjects/create-subject-dialog";
import SubjectList from "@/components/web/dashboard/study-planner/subjects/subject-list";
import { smartImportSchemas } from "@/app/schemas/smartImport";
import { toast } from "@/components/ui/toast";
import { ConvexError } from "convex/values";

export const instant = false;

type StudyPlannerImportData = Record<string, { task: string; dueDate: string }[]>;

const StudyPlannerPlugin = () => {
  const importStudyData = useMutation(api.smartImport.importStudyData);
  const [isImporting, setIsImporting] = useState(false);
  
  const [newSubjectIds, setNewSubjectIds] = useState<Set<string>>(new Set());
  const [updatedSubjectIds, setUpdatedSubjectIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (isImporting) return;

      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      const pastedText = e.clipboardData?.getData("text");
      if (!pastedText) return;

      let parsedData: unknown;
      try {
        parsedData = JSON.parse(pastedText);
      } catch (error) {
        return; 
      }

      const pluginSlug = "study-planner";
      const schema = smartImportSchemas[pluginSlug];

      if (!schema) {
        toast.add({ type: "error", title: "Unsupported Plugin", description: "Smart Import is not supported yet." });
        return;
      }

      const validation = schema.safeParse(parsedData);

      if (!validation.success) {
        const errorMessage = validation.error.issues[0]?.message || "Invalid data format.";
        toast.add({
          type: "error",
          title: "Validation Failed",
          description: errorMessage,
        });
        return;
      }

      e.preventDefault();
      setIsImporting(true);

      try {
        const result = await importStudyData({ 
          data: validation.data as StudyPlannerImportData 
        });
        
        setNewSubjectIds(new Set(result.createdSubjectIds));
        setUpdatedSubjectIds(new Set(result.updatedSubjectIds));

        toast.add({
          type: "success",
          title: "Import Successful",
          description: `Added ${result.createdSubjectIds.length} subjects and ${result.newTasksCount} tasks.`,
        });
      } catch (error) {
        const errorMessage = error instanceof ConvexError ? String(error.data) : "Failed to import data.";
        toast.add({
          type: "error",
          title: "Import Failed",
          description: errorMessage,
        });
      } finally {
        setIsImporting(false);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [isImporting, importStudyData]);

  const handleSubjectClick = (subjectId: string) => {
    setNewSubjectIds((prev) => {
      const next = new Set(prev);
      next.delete(subjectId);
      return next;
    });
    setUpdatedSubjectIds((prev) => {
      const next = new Set(prev);
      next.delete(subjectId);
      return next;
    });
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {isImporting && (
        // 👈 Changed z-[100] to z-50
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 bg-background p-8 rounded-xl shadow-2xl border">
            <Loader2 className="size-10 animate-spin text-primary" />
            <div className="text-center space-y-1">
              <p className="font-semibold text-lg">Importing Data</p>
              <p className="text-sm text-muted-foreground">This will only take a moment...</p>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-5xl w-full mx-auto p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Subjects</h1>
            <p className="text-muted-foreground mt-1">
              Manage your classes and track your study material.
            </p>
          </div>
          
          <CreateSubjectDialog 
            // 👈 Added the ': string' type definition here
            onSubjectCreated={(newId: string) => {
              setNewSubjectIds((prev) => new Set(prev).add(newId));
            }}
          >
            <Button disabled={isImporting}>
              <Plus className="mr-2 size-4" />
              Create Subject
            </Button>
          </CreateSubjectDialog>
        </div>

        <SubjectList 
          newSubjectIds={newSubjectIds}
          updatedSubjectIds={updatedSubjectIds}
          onSubjectClick={handleSubjectClick}
        />
      </main>
    </div>
  );
};

export default StudyPlannerPlugin;