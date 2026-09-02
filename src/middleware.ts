import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/coach") && token?.role !== "COACH") {
      return NextResponse.redirect(new URL("/moderator", req.url));
    }
    if (path.startsWith("/moderator") && token?.role !== "MODERATOR" && token?.role !== "COACH") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/coach/:path*", "/moderator/:path*"],
};
