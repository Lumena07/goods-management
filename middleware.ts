import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin-only routes
    if ((path.startsWith("/admin") || path.startsWith("/products")) && 
        token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Sales clerk and admin routes
    if ((path.startsWith("/sales") || path.startsWith("/customers")) && 
        !["ADMIN", "SALES_CLERK"].includes(token?.role || "")) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Inventory manager and admin routes
    if (path.startsWith("/purchases") && 
        !["ADMIN", "INVENTORY_MANAGER"].includes(token?.role || "")) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
);

export const config = {
  matcher: ["/admin/:path*", "/sales/:path*", "/customers/:path*", "/products/:path*", "/purchases/:path*"]
}; 