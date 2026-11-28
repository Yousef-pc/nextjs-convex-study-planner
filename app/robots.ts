import { MetadataRoute } from "next";

const siteUrl = process.env.SITE_URL || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/dashboard/marketplace",
        "/dashboard/marketplace/*",
      ],
      disallow: [
        "/dashboard",
        "/dashboard/subjects",
        "/dashboard/settings",
        "/auth/*",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}