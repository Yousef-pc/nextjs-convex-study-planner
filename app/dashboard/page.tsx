"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { pluginRegistry } from "@/components/web/dashboard/plugins/registry";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Puzzle, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { renamePluginSchema } from "@/app/schemas/plugin";
import { toast } from "@/components/ui/toast";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { ConvexError } from "convex/values";

export default function DashboardPage() {
  const installedPlugins = useQuery(api.userPlugins.getInstalledPlugins);
  const renamePlugin = useMutation(api.userPlugins.renamePlugin);
  const setActivePluginMutation = useMutation(api.userPlugins.setActivePlugin);
  
  // 1. We only track manual clicks here (starts as null)
  const [manualSelection, setManualSelection] = useState<string | null>(null);
  const [isRenameOpen, setIsRenameOpen] = useState(false);

  const form = useForm<z.infer<typeof renamePluginSchema>>({
    resolver: zodResolver(renamePluginSchema),
    defaultValues: { customName: "" },
  });

  if (installedPlugins === undefined) {
    return <Skeleton className="w-full h-96 rounded-xl mt-8" />;
  }

  const defaultPlugin = { pluginSlug: "study-planner", customName: "Study Planner", isActive: false };
  const allPlugins = installedPlugins.some(p => p.pluginSlug === "study-planner")
    ? installedPlugins
    : [defaultPlugin, ...installedPlugins];

  // 2. Derive the active plugin directly during render
  // Priority: Manual click -> Database active -> Default
  const dbActivePlugin = installedPlugins.find(p => p.isActive)?.pluginSlug;
  const currentPluginSlug = manualSelection || dbActivePlugin || "study-planner";

  // 3. Security Check
  const isOwned = allPlugins.some((p) => p.pluginSlug === currentPluginSlug);
  const safeActivePlugin = isOwned ? currentPluginSlug : "study-planner";
  
  const ActiveComponent = pluginRegistry[safeActivePlugin];
  const activePluginData = allPlugins.find(p => p.pluginSlug === safeActivePlugin);

  // 4. Handle switching plugins
  const handlePluginChange = (value: string | null) => {
    const newValue = value || "study-planner";
    setManualSelection(newValue); // Update UI instantly
    setActivePluginMutation({ pluginSlug: newValue }); // Save to DB
  };

  const handleRenameSubmit = async (data: z.infer<typeof renamePluginSchema>) => {
    setIsRenameOpen(false);
    form.reset();

    const isDuplicate = allPlugins.some(
      (p) => p.pluginSlug !== safeActivePlugin && 
        p.customName.toLowerCase() === data.customName.toLowerCase()
    );

    if (isDuplicate) {
      toast.add({
        type: "error",
        title: "Name already exists",
        description: "You already have a plugin with this name.",
      });
      return;
    }

    try {
      await renamePlugin({ pluginSlug: safeActivePlugin, newName: data.customName });
      toast.add({ type: "success", description: "Plugin renamed successfully!" });
    } catch (error) {
      const errorMessage = error instanceof ConvexError ? String(error.data) : "Failed to rename plugin.";
      toast.add({ type: "error", description: errorMessage });
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>

        <div className="flex items-center gap-3">
          <Puzzle className="size-5 text-muted-foreground" />
          
          <Select 
            value={safeActivePlugin} 
            onValueChange={handlePluginChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a plugin">
                {activePluginData?.customName}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {allPlugins.map((plugin) => (
                <SelectItem key={plugin.pluginSlug} value={plugin.pluginSlug}>
                  {plugin.customName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => {
              form.setValue("customName", activePluginData?.customName || "");
              setIsRenameOpen(true);
            }}
            disabled={safeActivePlugin === "study-planner"} 
          >
            <Pencil className="size-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4">
        {ActiveComponent ? <ActiveComponent /> : <div>Plugin not found.</div>}
      </div>

      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Plugin</DialogTitle>
            <DialogDescription>
              Give this plugin a custom name for your dashboard.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleRenameSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pluginName">Name</Label>
              <Input id="pluginName" {...form.register("customName")} placeholder="e.g., English Vocab" />
              {form.formState.errors.customName && (
                <p className="text-sm text-red-500">{form.formState.errors.customName.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">Save Name</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}