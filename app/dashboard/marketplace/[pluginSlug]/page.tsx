import { PluginDetailPage } from "@/components/web/dashboard/marketplace/plugin-detail-page/plugin-detail-page";

type MarketplacePluginPageProps = {
  params: Promise<{ pluginSlug: string }>;
};

export default async function MarketplacePluginPage({
  params,
}: MarketplacePluginPageProps) {
  const { pluginSlug } = await params;
  return <PluginDetailPage pluginSlug={pluginSlug} />;
}