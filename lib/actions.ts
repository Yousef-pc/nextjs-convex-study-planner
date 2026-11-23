"use server";

import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { revalidateTag } from "next/cache";

// This can be used if we are planning to have an admin dashboard.
export async function seedAndInvalidateCache() {
  try {
    // 1. Run the Convex seed mutation
    const result = await fetchMutation(api.plugins.seedPlugins);
    console.log("Convex Seeding Result:", result);

    // 2. Clear the Next.js cache for the plugins
    // If you have more plugins, add their slugs here
    revalidateTag("plugin-study-planner", "max");
    revalidateTag("plugin-word-bank", "max");
    
    // 3. Clear the marketplace list cache
    revalidateTag("marketplace-plugins", "max");

    return { success: true, message: result };
  } catch (error) {
    console.error("Failed to seed and invalidate:", error);
    return { success: false, message: "Failed to seed database." };
  }
}