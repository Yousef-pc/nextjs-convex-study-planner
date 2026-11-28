import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  // 1. Set the current pathname in the headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  // 2. Optimistic check: If not marketplace, check for cookie
  if (!request.nextUrl.pathname.startsWith("/dashboard/marketplace")) {
    
    // 👈 Manually check for BOTH production (__Secure-) and development cookies
    const sessionCookie = 
      request.cookies.get("__Secure-better-auth.session_token")?.value ||
      request.cookies.get("better-auth.session_token")?.value;

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