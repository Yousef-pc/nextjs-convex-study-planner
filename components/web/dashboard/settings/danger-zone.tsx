"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FunctionReturnType } from "convex/server"; // 👈 Imported for type inference

import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/components/ui/toast";
import { deleteAccountSchema } from "@/app/schemas/delete-account";
import { Id } from "@/convex/_generated/dataModel";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// 👈 Removed the unused 'z' import
type DeleteFormValues = {
  confirmation: string;
};

// 👈 Extracting the exact type returned by getCurrentUser to avoid using 'any'
type User = NonNullable<Awaited<FunctionReturnType<typeof api.auth.getCurrentUser>>>;

export function DangerZone({ user }: { user: User }) {
  const router = useRouter();
  const deleteFileById = useMutation(api.files.deleteFileById);
  const deleteUserData = useMutation(api.users.deleteUserData);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deleteForm = useForm<DeleteFormValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: { confirmation: "" }, 
  });

  const confirmationValue = useWatch({
    control: deleteForm.control,
    name: "confirmation",
  });

  const onDeleteSubmit = async () => {
    // Guard clause: Ensure the deletion process can only run once
    if (isDeleting) return; // Prevents concurrent mutations

    setIsDeleting(true);
    try {
      if (user?.image && !user.image.startsWith("http")) {
        try {
          await deleteFileById({ storageId: user.image as Id<"_storage"> });
        } catch (error) {
          console.warn("Avatar file missing", error);
        }
      }

      await deleteUserData();

      const { error } = await authClient.deleteUser();
      if (error) throw new Error(error.message);

      await authClient.signOut();
      
      toast.add({ type: "success", description: "Account deleted permanently." });
      
      router.push("/");
      router.refresh();
      
    } catch (error) {
      toast.add({
        type: "error",
        description: error instanceof Error ? error.message : "Failed to delete account",
        priority: "high",
      });
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="mt-12">
      <Separator className="my-8" />
      
      <div className="border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-500">
            <AlertTriangle className="size-6" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-500">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            
            <Button 
              type="button" 
              className="bg-red-700 hover:bg-red-800 text-gray-300"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account,
              remove your tasks, and erase all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <form onSubmit={deleteForm.handleSubmit(onDeleteSubmit)} className="space-y-4 py-4">
            <Controller
              name="confirmation"
              control={deleteForm.control}
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <Label>Type <span className="font-bold text-foreground">DELETE</span> to confirm.</Label>
                  <Input
                    {...field}
                    placeholder="DELETE"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.error && (
                    <p className="text-sm text-red-500">{fieldState.error.message}</p>
                  )}
                </div>
              )}
            />
            
            <AlertDialogFooter>
              <AlertDialogCancel type="button" disabled={isDeleting}>Cancel</AlertDialogCancel>
              <Button 
                type="submit" 
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={isDeleting || confirmationValue !== "DELETE"}
              >
                {isDeleting ? "Deleting..." : "Yes, delete my account"}
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}