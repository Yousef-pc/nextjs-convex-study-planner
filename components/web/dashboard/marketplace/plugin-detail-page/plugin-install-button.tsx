"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ConvexError } from "convex/values";
import { authClient } from "@/lib/auth-client";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PluginInstallButtonProps {
  pluginSlug: string;
  pluginName: string;
  isDefault: boolean;
}

export function PluginInstallButton({ pluginSlug, pluginName, isDefault }: PluginInstallButtonProps) {
  const installedPlugins = useQuery(api.userPlugins.getInstalledPlugins);
  const { data: session, isPending: isSessionLoading } = authClient.useSession();
  
  const installPlugin = useMutation(api.userPlugins.installPlugin);
  const uninstallPlugin = useMutation(api.userPlugins.uninstallPlugin);

  const [processingAction, setProcessingAction] = useState<"install" | "uninstall" | null>(null);
  const [showUninstallDialog, setShowUninstallDialog] = useState(false);

  if (installedPlugins === undefined || isSessionLoading) {
    return <div className="h-10 w-32 animate-pulse rounded-md bg-muted" />;
  }

  const isGuest = !session?.user;
  const isInstalled = installedPlugins.some((p) => p.pluginSlug === pluginSlug);

  const handleInstall = async () => {
    setProcessingAction("install");
    try {
      await installPlugin({ pluginSlug });
      toast.add({ type: "success", description: `${pluginName} installed!` });
    } catch (error) {
      toast.add({ type: "error", description: error instanceof ConvexError ? String(error.data) : "Failed" });
    } finally {
      setProcessingAction(null);
    }
  };

  const confirmUninstall = async () => {
    setShowUninstallDialog(false);
    setProcessingAction("uninstall");
    try {
      await uninstallPlugin({ pluginSlug });
      toast.add({ type: "success", description: `${pluginName} uninstalled!` });
    } catch (error) {
      toast.add({ type: "error", description: error instanceof ConvexError ? String(error.data) : "Failed" });
    } finally {
      setProcessingAction(null);
    }
  };

  return (
    <>
      {isDefault ? (
        <Button disabled className="w-full md:w-auto">Pre-installed</Button>
      ) : isGuest ? (
        <Button variant="default" className="w-full md:w-auto" render={<Link href="/auth/login" />}>
          Sign in to Install
        </Button>
      ) : isInstalled ? (
        <Button
          className="w-full md:w-auto bg-red-700 hover:bg-red-800 text-white opacity-90"
          onClick={() => setShowUninstallDialog(true)}
          disabled={processingAction !== null}
        >
          {processingAction === "uninstall" ? (
            <><Loader2 className="mr-2 size-4 animate-spin" /> Uninstalling...</>
          ) : (
            <><Trash2 className="mr-2 size-4" /> Uninstall Plugin</>
          )}
        </Button>
      ) : (
        <Button className="w-full md:w-auto text-white" onClick={handleInstall} disabled={processingAction !== null}>
          {processingAction === "install" ? (
            <><Loader2 className="mr-2 size-4 animate-spin" /> Installing...</>
          ) : (
            "Install Plugin"
          )}
        </Button>
      )}

      <AlertDialog open={showUninstallDialog} onOpenChange={setShowUninstallDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Uninstall {pluginName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the plugin and permanently delete all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUninstall} className="bg-red-600 hover:bg-red-700 text-white">
              Yes, Uninstall
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}