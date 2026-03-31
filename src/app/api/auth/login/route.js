import { NextResponse } from "next/server";
import { AUTH_COOKIE, isValidCredentials } from "@/lib/server/auth";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { username = "", password = "" } = body;

  if (!isValidCredentials(username, password)) {
    return NextResponse.json(
      { message: "Invalid username or password" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, "ok", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  response.cookies.set("pdp_user", username, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}

