"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface MarketplaceCardInstallsProps {
  slug: string;
}

const formatInstalls = (num: number) => {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num);
};

export function MarketplaceCardInstalls({ slug }: MarketplaceCardInstallsProps) {
  // 👈 Live data fetch via WebSocket
  const plugin = useQuery(api.plugins.getPluginBySlug, { slug });

  if (plugin === undefined) {
    // 👈 The Skeleton loading state you requested
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Download className="size-4" />
        <Skeleton className="h-4 w-16" />
      </div>
    );
  }

  if (plugin === null) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Download className="size-4" />
      <span>{formatInstalls(plugin.installs)} installs</span>
    </div>
  );
}