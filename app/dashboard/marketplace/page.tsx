import { MarketplaceList } from "@/components/web/dashboard/marketplace/marketplace-list";

export default function MarketplacePage() {
  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
        <p className="text-muted-foreground mt-1">
          Discover and install plugins to supercharge your StudyPro dashboard.
        </p>
      </div>

      {/* 👈 This is where the magic happens. The page delegates the heavy lifting! */}
      <MarketplaceList />
    </div>
  );
}