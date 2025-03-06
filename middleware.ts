import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { JWT } from "next-auth/jwt";

// Debug function to safely stringify objects
function safeStringify(obj: any) {
  try {
    return JSON.stringify(obj, (key, value) => {
      if (key === 'password') return undefined; // Don't log sensitive data
      return value;
    }, 2);
  } catch (error) {
    return '[Error serializing object]';
  }
}

export default withAuth(
  function middleware(req: NextRequest) {
    // Debug logging
    console.log('=== Middleware Debug ===');
    console.log('Path:', req.nextUrl.pathname);
    console.log('Token:', req.nextauth?.token ? 'exists' : 'not found');
    console.log('Headers:', safeStringify(Object.fromEntries(req.headers)));
    console.log('=====================');

    const token = req.nextauth?.token as JWT | null;
    const path = req.nextUrl.pathname;

    // Admin-only routes
    if ((path.startsWith("/admin") || path.startsWith("/products")) && 
        token?.role !== "ADMIN") {
      console.log('Unauthorized: Admin access required');
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Sales clerk and admin routes
    if ((path.startsWith("/sales") || path.startsWith("/customers")) && 
        !["ADMIN", "SALES_CLERK"].includes(token?.role || "")) {
      console.log('Unauthorized: Sales clerk or admin access required');
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Inventory manager and admin routes
    if (path.startsWith("/purchases") && 
        !["ADMIN", "INVENTORY_MANAGER"].includes(token?.role || "")) {
      console.log('Unauthorized: Inventory manager or admin access required');
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // If the user is authenticated and trying to access auth pages, redirect to dashboard
    if (path.startsWith("/auth/")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
    pages: {
      signIn: "/auth/login",
    }
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/login (login page)
     * - auth/signup (signup page)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|auth/login|auth/signup).*)",
  ],
}; 