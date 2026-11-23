import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DescriptionRenderer } from "./description-renderer";
import { PluginInstallButton } from "./plugin-install-button";
import { CommentsSection } from "./comments-section";

async function getCachedPlugin(slug: string) {
  "use cache";
  cacheLife({ 
    stale: 300, 
    revalidate: 300, 
    expire: 3600 
  });
  cacheTag(`plugin-${slug}`);

  return await fetchQuery(api.plugins.getPluginBySlug, { slug });
}

export async function PluginDetailPage({ pluginSlug }: { pluginSlug: string }) {
  const plugin = await getCachedPlugin(pluginSlug);

  if (!plugin) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Plugin not found</h1>
        <p className="text-muted-foreground">No plugin exists with the slug {pluginSlug}.</p>
        <Button variant="outline" render={<Link href="/dashboard/marketplace" />}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Marketplace
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6 pb-20">
      <Button variant="outline" size="sm" render={<Link href="/dashboard/marketplace" />}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Marketplace
      </Button>

      <div className="group relative aspect-[21/9] w-full overflow-hidden rounded-xl border bg-muted">
        <Image
          src={plugin.imageUrl}
          alt={plugin.name}
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
        />
      </div>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">{plugin.name}</h1>
        </div>
        <div className="shrink-0 mt-4 md:mt-0">
          <PluginInstallButton 
            pluginSlug={plugin.slug} 
            pluginName={plugin.name} 
            isDefault={plugin.isDefault} 
          />
        </div>
      </div>

      <hr className="border-border" />

      <div className="prose prose-sm dark:prose-invert max-w-none">
        <h2 className="text-xl font-semibold mb-4">About this plugin</h2>
        <DescriptionRenderer content={plugin.description} />
      </div>

      <div className="mt-12">
        <Suspense 
          fallback={
            <div className="flex justify-center items-center h-40 border border-dashed rounded-xl">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <CommentsSection pluginId={plugin._id} />
        </Suspense>
      </div>
    </div>
  );
}