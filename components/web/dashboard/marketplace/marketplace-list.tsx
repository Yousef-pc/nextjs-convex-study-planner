import { cacheLife } from "next/cache";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { MarketplaceCard } from "@/components/web/dashboard/marketplace/marketplace-card"; // 👈 Updated import

export async function MarketplaceList() {
  "use cache";
  cacheLife("hours"); 

  const plugins = await fetchQuery(api.plugins.getAllPlugins);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {plugins.map((plugin) => (
        <MarketplaceCard key={plugin._id} plugin={plugin} />
      ))}
    </div>
  );
}