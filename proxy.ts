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
  // Lindungi semua route KECUALI /login, static assets, file di /public,
  // dan /api/cron/* -- endpoint cron itu dipanggil dari luar (GitHub Actions),
  // jadi tidak punya cookie login sama sekali, dan sudah dilindungi sendiri
  // pakai CRON_SECRET di dalam route-nya (lihat app/api/cron/run-absen-schedule/route.ts).
  matcher: ["/((?!login|api/cron|_next/static|_next/image|favicon.ico).*)"],
};
