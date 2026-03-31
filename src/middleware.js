import { NextResponse } from "next/server";
const AUTH_COOKIE = "pdp_auth";

const PUBLIC_PATHS = ["/login", "/api/auth/login"];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const isPublic =
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon");

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const isAuthed = token === "ok";

  if (!isAuthed && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthed && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/form/:path*", "/api/:path*", "/login"],
};

