import Link from "next/link";
import Image from "next/image";
import { cacheLife, cacheTag } from "next/cache";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DescriptionRenderer } from "./description-renderer";
import { PluginInstallButton } from "./plugin-install-button"; // Client
import { CommentForm } from "./comment-form"; // Client
import { CommentsList } from "./comments-list"; // Mostly Static

// 👈 Function to get cached data
async function getCachedData(slug: string) {
  "use cache";
  cacheLife("days");
  cacheTag(`plugin-${slug}`);

  const plugin = await fetchQuery(api.plugins.getPluginBySlug, { slug });
  if (!plugin) return { plugin: null, comments: [] };

  const comments = await fetchQuery(api.comments.getComments, { pluginId: plugin._id });
  cacheTag(`comments-${plugin._id}`); // Tag comments separately for invalidation

  return { plugin, comments };
}

// 👈 Note: We need to pass isGuest from the server layout or use a trick.
// For now, we'll let the client islands handle their own auth checks!
export async function PluginDetailPage({ pluginSlug }: { pluginSlug: string }) {
  const { plugin, comments } = await getCachedData(pluginSlug);

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
          {/* 👈 Client Island 1: Install Button */}
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
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <MessageSquare className="size-5" /> {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* 👈 Client Island 2: Comment Form (Passes isGuest from a client hook) */}
            <CommentForm pluginId={plugin._id} isGuest={false} /> 
            
            <hr className="border-border" />

            {/* 👈 Static List (Cached Data) */}
            <CommentsList comments={comments} pluginId={plugin._id} />
            
          </CardContent>
        </Card>
      </div>
    </div>
  );
}