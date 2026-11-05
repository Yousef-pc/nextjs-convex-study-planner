import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  // Optimistic check: If there is no session cookie, kick them to login immediately
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Protect the dashboard and its sub-routes
  matcher: ["/dashboard/:path*"], 
};