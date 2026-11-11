"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileForm } from "@/components/web/dashboard/settings/profile-form";
import { DangerZone } from "@/components/web/dashboard/settings/danger-zone";

export default function SettingsPage() {
  const user = useQuery(api.auth.getCurrentUser);

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

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your public profile information.
        </p>
      </div>

      {/* Render the isolated components, passing the user data down as props */}
      <ProfileForm user={user} />
      <DangerZone user={user} />
    </div>
  );
}