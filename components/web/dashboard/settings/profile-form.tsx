"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react"; // 👈 Added useQuery
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FunctionReturnType } from "convex/server"; // 👈 Imported for type inference

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

// 👈 Extracting the exact type returned by getCurrentUser to avoid using 'any'
type User = NonNullable<Awaited<FunctionReturnType<typeof api.auth.getCurrentUser>>>;

export function ProfileForm({ user }: { user: User }) {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const deleteFileById = useMutation(api.files.deleteFileById);

  const [isSaving, setIsSaving] = useState(false);
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
    // Guard clause: Prevent double submissions if the user clicks too fast
    if (isSaving) return; // Prevents concurrent mutations

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
  );
}