import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const publicRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/",
];

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const isPrivateRoute = !publicRoutes.includes(request.nextUrl.pathname);

  if (!sessionCookie && isPrivateRoute) {
    // return NextResponse.redirect(new URL("/login?redirect=" + request.url, request.url));
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // 下記のmatcherは、APIルート（/api）、静的ファイル（/static）、Next.jsの内部ファイル（_next）や拡張子付きファイル（画像やアイコンなど）を除外し、
  // 通常のページルートのみをmiddlewareの対象。
  matcher: ["/((?!api|static|.*\\..*|_next).*)"],
};
