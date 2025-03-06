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
  function middleware(req) {
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

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        console.log('=== Auth Callback Debug ===');
        console.log('Token exists:', !!token);
        console.log('Request path:', req.nextUrl.pathname);
        console.log('========================');
        
        // Only require authentication for protected routes
        const isProtectedRoute = [
          '/admin',
          '/sales',
          '/customers',
          '/products',
          '/purchases',
          '/dashboard'
        ].some(prefix => req.nextUrl.pathname.startsWith(prefix));

        if (!isProtectedRoute) {
          console.log('Public route - allowing access');
          return true;
        }

        return !!token;
      }
    }
  }
);

export const config = {
  matcher: [
    // Protected routes that require authentication
    "/admin/:path*",
    "/sales/:path*",
    "/customers/:path*",
    "/products/:path*",
    "/purchases/:path*",
    "/dashboard/:path*",
    // Add public routes that still go through middleware for debugging
    "/",
    "/auth/login",
    "/auth/signup"
  ]
}; 