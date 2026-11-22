import Link from "next/link";
import { Doc } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Puzzle } from "lucide-react";
import { MarketplaceCardButton } from "./marketplace-card-button"; // 👈 Updated import name

interface MarketplaceCardProps {
  plugin: Doc<"plugins">;
}

const formatInstalls = (num: number) => {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num);
};

export function MarketplaceCard({ plugin }: MarketplaceCardProps) {
  const detailHref = `/dashboard/marketplace/${plugin.slug}`;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Puzzle className="size-6" />
          </div>
          <CardTitle className="text-xl">
            <Link href={detailHref} className="hover:text-primary hover:underline transition-colors">
              {plugin.name}
            </Link>
          </CardTitle>
        </div>
        <CardDescription className="line-clamp-2">
          <Link href={detailHref} className="hover:text-foreground hover:underline transition-colors">
            {plugin.description}
          </Link>
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Download className="size-4" />
          <span>{formatInstalls(plugin.installs)} installs</span>
        </div>
      </CardContent>

      <CardFooter>
        {/* 👈 The Client Island */}
        <MarketplaceCardButton 
          pluginSlug={plugin.slug} 
          pluginName={plugin.name} 
          isDefault={plugin.isDefault} 
        />
      </CardFooter>
    </Card>
  );
}