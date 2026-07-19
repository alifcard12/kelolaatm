const JAKARTA_TZ = "Asia/Jakarta";

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// "2026-07" — key bulan yang dipakai di query string ?month=
export function currentJakartaMonthKey(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: JAKARTA_TZ,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((p) => p.type === "year")?.value ?? "1970";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  return `${year}-${month}`;
}

// Validasi & normalisasi key bulan dari searchParams; fallback ke bulan berjalan kalau tidak valid.
export function normalizeMonthKey(input: string | undefined): string {
  if (input && /^\d{4}-\d{2}$/.test(input)) {
    const month = Number(input.slice(5, 7));
    if (month >= 1 && month <= 12) return input;
  }
  return currentJakartaMonthKey();
}

// Rentang [start, end) UTC dari sebuah "YYYY-MM" berdasarkan zona waktu Jakarta (UTC+7, tanpa DST).
export function monthKeyToJakartaRange(monthKey: string): { start: Date; end: Date } {
  const [year, month] = monthKey.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1, -7, 0, 0));
  const end = new Date(Date.UTC(year, month, 1, -7, 0, 0));
  return { start, end };
}

export function shiftMonthKey(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function monthKeyLabel(monthKey: string): string {
  const { start } = monthKeyToJakartaRange(monthKey);
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: JAKARTA_TZ,
    month: "long",
    year: "numeric",
  }).format(start);
}

export function formatJakartaDateTime(date: Date): string {
  return (
    new Intl.DateTimeFormat("id-ID", {
      timeZone: JAKARTA_TZ,
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date) + " WIB"
  );
}

export function formatJakartaDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: JAKARTA_TZ,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

// "13 Juli 2026" — nama bulan lengkap, dipakai di dokumen cetak/invoice.
export function formatJakartaDateLong(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: JAKARTA_TZ,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

// Format "15-07-2026" — dipakai di teks tiket OPEN/CLOSE yang di-copy
export function formatJakartaDateDMY(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: JAKARTA_TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(date);

  const day = parts.find((p) => p.type === "day")?.value ?? "";
  const month = parts.find((p) => p.type === "month")?.value ?? "";
  const year = parts.find((p) => p.type === "year")?.value ?? "";

  return `${day}-${month}-${year}`;
}

// Untuk "waktu relatif" seperti "3 jam lalu", "kemarin" di kolom Last Update
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay === 1) return "Kemarin";
  if (diffDay < 7) return `${diffDay} hari lalu`;

  return formatJakartaDate(date);
}
