"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation"; 
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/components/ui/toast";
import { ImageUploader } from "@/components/web/dashboard/settings/image-uploader";
import { userProfileSchema } from "@/app/schemas/user";
import { deleteAccountSchema } from "@/app/schemas/delete-account";
import { Id } from "@/convex/_generated/dataModel";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type DeleteFormValues = {
  confirmation: string;
};

export default function SettingsPage() {
  const router = useRouter();
  const user = useQuery(api.auth.getCurrentUser);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const deleteFileById = useMutation(api.files.deleteFileById);
  const deleteUserData = useMutation(api.users.deleteUserData);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [newAvatarBlob, setNewAvatarBlob] = useState<Blob | null>(null);
  const [newAvatarPreview, setNewAvatarPreview] = useState<string | null>(null);

  const profileForm = useForm<z.infer<typeof userProfileSchema>>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: { username: "" },
  });

    useEffect(() => {
    // Only reset the form if the user data exists AND the user hasn't started typing yet
    if (user?.name && !profileForm.formState.isDirty) {
      profileForm.reset({ username: user.name });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const deleteForm = useForm<DeleteFormValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: { confirmation: "" }, 
  });

  const confirmationValue = useWatch({
    control: deleteForm.control,
    name: "confirmation",
  });

  const currentImageUrl = useQuery(
    api.files.getUrl,
    user?.image && !user.image.startsWith("http") 
      ? { storageId: user.image as Id<"_storage"> } 
      : "skip"
  );

  const handleImageCropped = (blob: Blob) => {
    setNewAvatarBlob(blob);
    setNewAvatarPreview(URL.createObjectURL(blob));
  };

  const onProfileSubmit = async (data: z.infer<typeof userProfileSchema>) => {
    setIsSaving(true);
    const oldImageId = user?.image;
    let finalImageId = user?.image;

    try {
      if (newAvatarBlob) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": newAvatarBlob.type },
          body: newAvatarBlob,
        });
        const { storageId } = await result.json();
        finalImageId = storageId;
      }

      const { error } = await authClient.updateUser({
        image: finalImageId,
        name: data.username,
      });

      if (error) throw new Error(error.message);

      if (newAvatarBlob && oldImageId && !oldImageId.startsWith("http")) {
        try {
          await deleteFileById({ storageId: oldImageId as Id<"_storage"> });
        } catch (e) {
          console.warn("Old file was already deleted", e);
        }
      }

      toast.add({ type: "success", description: "Profile updated successfully!" });
      
      profileForm.reset({ username: data.username });
      setNewAvatarBlob(null); 
      setNewAvatarPreview(null);
      
    } catch (error) {
      toast.add({
        type: "error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        priority: "high",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const onDeleteSubmit = async () => {
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

  if (user === undefined) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <Skeleton className="w-full h-96 rounded-xl" />
      </div>
    );
  }

  if (user === null) {
    return null; 
  }

  const hasChanges = profileForm.formState.isDirty || newAvatarBlob !== null;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your public profile information.
        </p>
      </div>

      {/* --- PROFILE SECTION --- */}
      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8 bg-card border rounded-xl p-8">
        
        <div className="flex flex-col gap-4">
          <Label className="text-base font-semibold">Profile Picture</Label>
          <div className="flex items-center gap-6">
            
            <ImageUploader onImageCropped={handleImageCropped}>
              <div className="relative group">
                <Avatar className="size-24 border shadow-sm group-hover:opacity-80 transition-opacity">
                  <AvatarImage 
                    src={newAvatarPreview || currentImageUrl || `https://avatar.vercel.sh/${user._id}`} 
                    alt={user.name} 
                  />
                  <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-medium">Change</span>
                </div>
              </div>
            </ImageUploader>
            
            <div className="text-sm text-muted-foreground">
              <p>Click the avatar to upload a new picture.</p>
              <p>JPG, PNG or WEBP. Max 5MB.</p>
            </div>
          </div>
        </div>

        <div className="h-px bg-border w-full" />

        <Controller
          name="username"
          control={profileForm.control}
          render={({ field, fieldState }) => (
            <div className="space-y-2">
              <Label htmlFor="username" className="text-base font-semibold">Username</Label>
              <Input 
                id="username" 
                {...field}
                placeholder="Your display name" 
                aria-invalid={fieldState.invalid}
              />
              {fieldState.error ? (
                <p className="text-sm text-red-500">{fieldState.error.message}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  This is your public display name.
                </p>
              )}
            </div>
          )}
        />

        <div className="h-px bg-border w-full" />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving || !hasChanges}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>

      </form>

      {/* --- DANGER ZONE --- */}
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
      </div>

      {/* 👈 CONTROLLED DELETE DIALOG */}
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