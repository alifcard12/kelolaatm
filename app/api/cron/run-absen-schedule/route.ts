import { NextResponse } from "next/server";
import { runDueAbsenSchedules } from "@/lib/absenSchedule";

// Jangan di-cache & kasih waktu eksekusi cukup panjang (kalau ada beberapa
// jadwal jatuh tempo bersamaan, masing-masing perlu 1x login + 1x submit).
export const dynamic = "force-dynamic";
export const maxDuration = 60; // detik. Naikkan kalau plan Vercel mendukung (Pro: sampai 300s).

function isAuthorized(req: Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false; // wajib di-set, jangan biarkan endpoint terbuka tanpa secret

  const header = req.headers.get("authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : null;

  // Vercel Cron mengirim header Authorization: Bearer <CRON_SECRET> secara
  // otomatis. GitHub Actions kita set manual header yang sama.
  return bearer === expected;
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await runDueAbsenSchedules();
    return NextResponse.json({ ok: true, executed: results.length, results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gagal menjalankan jadwal.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

// Diizinkan juga lewat GET supaya gampang dites manual dari browser/curl.
export async function GET(req: Request) {
  return POST(req);
}
