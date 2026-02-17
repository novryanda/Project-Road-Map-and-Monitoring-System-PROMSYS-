import { type NextRequest, NextResponse } from "next/server";

const publicPaths = ["/auth", "/unauthorized"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;

  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // If user is logged in and tries to access auth pages, redirect to dashboard
  if (isPublicPath && sessionToken) {
    return NextResponse.redirect(new URL("/dashboard/project-management/project", request.url));
  }

  // Allow public paths without session
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Protected routes: redirect to login if no session
  if (!sessionToken) {
    const loginUrl = new URL("/auth/v2/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
