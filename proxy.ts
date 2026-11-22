import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
  // 1. Set the current pathname in the headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  // 2. Optimistic check: If not marketplace, check for cookie
  if (!request.nextUrl.pathname.startsWith("/dashboard/marketplace")) {
    const sessionCookie = getSessionCookie(request);
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // 3. Pass the headers forward
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/dashboard/:path*"], 
};