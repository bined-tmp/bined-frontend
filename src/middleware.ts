import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

export default withAuth(
  async function middleware(request: NextRequest) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    const isAuth = !!token;
    const isEmailVerified = token?.emailVerified;
    const isAuthPage =
      request.nextUrl.pathname.startsWith("/login") ||
      request.nextUrl.pathname.startsWith("/register");

    if (isAuthPage) {
      if (isAuth && isEmailVerified) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      if (isAuth && !isEmailVerified) {
        return NextResponse.redirect(new URL("/check-email", request.url));
      }

      return null;
    }

    // 認証済み かつ メール検証が済んでいない場合
    if (isAuth && !isEmailVerified) {
      return NextResponse.redirect(new URL("/check-email", request.url));
    }

    // 認証していない場合
    if (!isAuth) {
      let from = request.nextUrl.pathname;
      if (request.nextUrl.search) {
        from += request.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(from)}`, request.url)
      );
    }
  },
  {
    callbacks: {
      async authorized() {
        // This is a work-around for handling redirect on auth pages.
        // We return true here so that the middleware function above is always called.
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/register", "/login", "/dashboard/:path*"],
};
