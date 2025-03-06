import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
    const path = req.nextUrl.pathname;
    
    // Debug logging
    console.log('=== Middleware Debug ===');
    console.log('Path:', path);
    console.log('Headers:', safeStringify(Object.fromEntries(req.headers)));
    console.log('=====================');

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const path = req.nextUrl.pathname;
        
        // Allow access to auth pages
        if (path.startsWith('/auth/')) {
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
        if ((path.startsWith("/sales") || path.startsWith("/customers")) && 
            !["ADMIN", "SALES_CLERK"].includes(token.role as string)) {
          return false;
        }

        // Inventory manager and admin routes
        if (path.startsWith("/purchases") && 
            !["ADMIN", "INVENTORY_MANAGER"].includes(token.role as string)) {
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
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
}; 