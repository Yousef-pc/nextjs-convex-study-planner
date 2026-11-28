import { MetadataRoute } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

const siteUrl = process.env.SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let plugins: { slug: string }[] = [];
  try {
    plugins = await fetchQuery(api.plugins.getAllPlugins);
  } catch (error) {
    console.warn("Failed to fetch plugins for sitemap", error);
  }

  const pluginUrls: MetadataRoute.Sitemap = plugins.map((plugin) => ({
    url: `${siteUrl}/dashboard/marketplace/${plugin.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/dashboard/marketplace`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  return [...staticUrls, ...pluginUrls];
}