"use server";

import { revalidateTag } from "next/cache";

export async function invalidateCommentsCache(pluginId: string) {
  revalidateTag(`comments-${pluginId}`, "max");
}