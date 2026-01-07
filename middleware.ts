import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/admin"];

// Routes that should redirect to admin if already authenticated
const authRoutes = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for tokens in cookies (httpOnly cookies set by backend)
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  
  // User is authenticated if has valid access token OR has refresh token (can be refreshed)
  const isAuthenticated = !!accessToken;
  const canRefresh = !!refreshToken;

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if current path is auth route (login/register)
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Redirect to login if accessing protected route without any token
  // If has refreshToken but no accessToken, let client-side handle refresh
  if (isProtectedRoute && !isAuthenticated && !canRefresh) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    // Store callback URL in cookie for redirect after login
    response.cookies.set("callbackUrl", pathname, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 5, // 5 minutes
      path: "/",
    });
    return response;
  }

  // Redirect to admin if accessing auth routes while authenticated
  if (isAuthRoute && (isAuthenticated || canRefresh)) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)",
  ],
};
