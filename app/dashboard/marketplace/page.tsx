"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ConvexError } from "convex/values";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Puzzle, Loader2, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/toast";
// 👈 Import AlertDialog components
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

const formatInstalls = (num: number) => {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num);
};

export default function MarketplacePage() {
  const plugins = useQuery(api.plugins.getAllPlugins);
  const installedPlugins = useQuery(api.userPlugins.getInstalledPlugins);
  
  const [processing, setProcessing] = useState<{ id: string; action: "install" | "uninstall" } | null>(null);
  
  // 👈 State to manage the confirmation dialog
  const [pluginToUninstall, setPluginToUninstall] = useState<{ slug: string; name: string } | null>(null);

  const installPlugin = useMutation(api.userPlugins.installPlugin).withOptimisticUpdate(
    (localStore, args) => {
      const currentInstalled = localStore.getQuery(api.userPlugins.getInstalledPlugins, {});
      if (currentInstalled !== undefined) {
        const newPlugin: Doc<"userPlugins"> = {
          _id: `temp-${args.pluginSlug}` as Id<"userPlugins">,
          _creationTime: 0, 
          userId: "temp-user",
          pluginSlug: args.pluginSlug,
          customName: "temp-name",
          isActive: false,
        };
        localStore.setQuery(
          api.userPlugins.getInstalledPlugins,
          {},
          [...currentInstalled, newPlugin]
        );
      }
    }
  );

  const uninstallPlugin = useMutation(api.userPlugins.uninstallPlugin);

  const handleInstall = async (pluginSlug: string, pluginName: string) => {
    setProcessing({ id: pluginSlug, action: "install" });
    try {
      await installPlugin({ pluginSlug });
      toast.add({
        type: "success",
        title: "Plugin Installed",
        description: `${pluginName} has been added to your dashboard.`,
      });
    } catch (error) {
      const errorMessage = error instanceof ConvexError ? String(error.data) : "Could not install plugin.";
      toast.add({ type: "error", title: "Error", description: errorMessage });
    } finally {
      setProcessing(null);
    }
  };

  // 👈 This function is now called by the AlertDialogAction
  const confirmUninstall = async () => {
    if (!pluginToUninstall) return;
    
    const { slug, name } = pluginToUninstall;
    setPluginToUninstall(null); // Close dialog instantly
    setProcessing({ id: slug, action: "uninstall" });

    try {
      await uninstallPlugin({ pluginSlug: slug });
      toast.add({
        type: "success",
        title: "Plugin Uninstalled",
        description: `${name} and all its data have been removed.`,
      });
    } catch (error) {
      const errorMessage = error instanceof ConvexError ? String(error.data) : "Could not uninstall plugin.";
      toast.add({ type: "error", title: "Error", description: errorMessage });
    } finally {
      setProcessing(null);
    }
  };

  if (plugins === undefined || installedPlugins === undefined) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-5xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
          <p className="text-muted-foreground mt-1">
            Discover and install plugins to supercharge your StudyPro dashboard.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plugins.map((plugin) => {
            const isInstalled = installedPlugins.some(p => p.pluginSlug === plugin.slug);
            
            const isProcessingThis = processing?.id === plugin.slug;
            const isInstalling = isProcessingThis && processing.action === "install";
            const isUninstalling = isProcessingThis && processing.action === "uninstall";

            return (
              <Card key={plugin._id} className="flex flex-col h-full">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <Puzzle className="size-6" />
                    </div>
                    <CardTitle className="text-xl">{plugin.name}</CardTitle>
                  </div>
                  <CardDescription className="line-clamp-3">
                    {plugin.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Download className="size-4" />
                    <span>{formatInstalls(plugin.installs)} installs</span>
                  </div>
                </CardContent>

                <CardFooter>
                  {plugin.isDefault ? (
                    <Button className="w-full" disabled>
                      Pre-installed
                    </Button>
                  ) : (isInstalled || isUninstalling) ? (
                    <Button 
                      className="w-full bg-red-700 hover:bg-red-800 text-white opacity-90" 
                      // 👈 Opens the dialog instead of immediately uninstalling
                      onClick={() => setPluginToUninstall({ slug: plugin.slug, name: plugin.name })}
                      disabled={isProcessingThis}
                    >
                      {isUninstalling ? (
                        <><Loader2 className="mr-2 size-4 animate-spin" /> Uninstalling...</>
                      ) : (
                        <><Trash2 className="mr-2 size-4" /> Uninstall Plugin</>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={() => handleInstall(plugin.slug, plugin.name)}
                      disabled={isProcessingThis}
                    >
                      {isInstalling ? (
                        <><Loader2 className="mr-2 size-4 animate-spin" /> Installing...</>
                      ) : (
                        "Install Plugin"
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 👈 The Confirmation Dialog */}
      <AlertDialog 
        open={pluginToUninstall !== null} 
        onOpenChange={(open) => !open && setPluginToUninstall(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Uninstall {pluginToUninstall?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the plugin from your dashboard and permanently delete 
              all data associated with it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmUninstall}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Yes, Uninstall
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}