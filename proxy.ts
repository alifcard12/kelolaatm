import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

export function proxy(request: NextRequest) {
  const session = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const authSecret = process.env.AUTH_SECRET;

  const isAuthed = Boolean(session && authSecret && session === authSecret);

  if (!isAuthed) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Lindungi semua route KECUALI /login, static assets, dan file di /public
  matcher: [
    "/((?!login|_next/static|_next/image|favicon.ico).*)",
  ],
};
