import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = ['/', '/auth/login', '/auth/register', '/auth/forgot-password'];

export default withAuth(
  function middleware(req: NextRequest) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const path = req.nextUrl.pathname;
        
        // Allow access to public routes
        if (publicRoutes.includes(path)) {
          return true;
        }

        // Require authentication for all other pages
        if (!token) {
          return false;
        }

        // Admin-only routes
        if ((path.startsWith("/admin") || path.startsWith("/products")) && 
            token.role !== "ADMIN") {
          return false;
        }

        // Sales clerk and admin routes
        if ((path.startsWith("/sales") || path.startsWith("/customers") || path.startsWith("/purchases")) && 
            !["ADMIN", "SALES_CLERK", "INVENTORY_MANAGER"].includes(token.role as string)) {
          return false;
        }

        return true;
      }
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
     * - public files
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*|$).*)",
  ],
}; 