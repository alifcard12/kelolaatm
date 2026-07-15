const JAKARTA_TZ = "Asia/Jakarta";

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
