import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";
import { cookies } from "next/headers";

export const {
  handler,
  preloadAuthQuery,
  isAuthenticated,
  getToken,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
} = convexBetterAuthNextJs({
  convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL!,
  convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
  // Optional, defaults to "/api/auth"
  basePath: "/custom/auth/path",
});

export async function getAuthToken() {
  const cookieStore = await cookies();
  // Read the JWT directly from the browser's cookies
  return cookieStore.get("better-auth.convex_jwt")?.value;
}