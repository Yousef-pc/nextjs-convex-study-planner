"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FunctionReturnType } from "convex/server";
import { Trash2 } from "lucide-react"; // 👈 Import Trash2

import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/components/ui/toast";
import { ImageUploader } from "./image-uploader";
import { userProfileSchema } from "@/app/schemas/user";
import { Id } from "@/convex/_generated/dataModel";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // 👈 Import AlertDialog

type User = NonNullable<Awaited<FunctionReturnType<typeof api.auth.getCurrentUser>>>;

export function ProfileForm({ user }: { user: User }) {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const deleteFileById = useMutation(api.files.deleteFileById);

  const [isSaving, setIsSaving] = useState(false);
  const [newAvatarBlob, setNewAvatarBlob] = useState<Blob | null>(null);
  const [newAvatarPreview, setNewAvatarPreview] = useState<string | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  const profileForm = useForm<z.infer<typeof userProfileSchema>>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: { username: "" },
  });

  useEffect(() => {
    if (user?.name && !profileForm.formState.isDirty) {
      profileForm.reset({ username: user.name });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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

  // 👈 Check if the user has a custom uploaded image (not a Vercel avatar)
  const isCustomImage = !!user.image && !user.image.startsWith("http");
  const hasImage = isCustomImage || !!newAvatarBlob;

  const handleRemoveImageClick = () => {
    // If they just staged a new upload but haven't saved, just clear the preview
    if (newAvatarBlob) {
      setNewAvatarBlob(null);
      setNewAvatarPreview(null);
      toast.add({ type: "success", description: "Image removed from preview." });
      return;
    }
    
    // If it's a saved custom image, trigger the confirmation dialog
    setShowRemoveDialog(true);
  };

  const handleRemoveImageConfirm = async () => {
    setShowRemoveDialog(false);
    setIsSaving(true);
    const oldImageId = user?.image;

    // 👈 THE HACKER GUARD: Strict check to prevent bypassing the UI
    if (!oldImageId || oldImageId.startsWith("http")) {
      toast.add({ 
        type: "error", 
        description: "Security Error: You can only remove custom uploaded images.",
        priority: "high"
      });
      setIsSaving(false);
      return;
    }

    try {
      // 1. Update Better Auth to set image to null
      const { error } = await authClient.updateUser({ image: null });
      if (error) throw new Error(error.message);

      // 2. Delete the file from Convex storage
      try {
        await deleteFileById({ storageId: oldImageId as Id<"_storage"> });
      } catch (e) {
        console.warn("File was already deleted or missing", e);
      }

      toast.add({ type: "success", description: "Profile picture removed." });
      setNewAvatarBlob(null);
      setNewAvatarPreview(null);
      
    } catch (error) {
      toast.add({
        type: "error",
        description: error instanceof Error ? error.message : "Failed to remove profile picture",
        priority: "high",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const onProfileSubmit = async (data: z.infer<typeof userProfileSchema>) => {
    if (isSaving) return;

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

  const hasChanges = profileForm.formState.isDirty || newAvatarBlob !== null;

  return (
    <>
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
            
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Click the avatar to upload a new picture.</p>
              <p>JPG, PNG or WEBP. Max 5MB.</p>
              
              {/* 👈 Show Remove Button ONLY if they have a custom image */}
              {hasImage && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="sm" 
                  className="mt-2"
                  onClick={handleRemoveImageClick}
                  disabled={isSaving}
                >
                  <Trash2 className="mr-2 size-4" />
                  Remove Picture
                </Button>
              )}
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

      {/* 👈 Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Profile Picture?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your custom profile picture and revert to the default generated avatar. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveImageConfirm} className="bg-red-600 hover:bg-red-700 text-white">
              Yes, Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}