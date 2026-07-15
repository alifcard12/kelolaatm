// Semua timestamp disimpan di database sebagai UTC (standar Prisma/Postgres).
// Fungsi ini yang bertanggung jawab menampilkannya secara konsisten sebagai
// waktu Jakarta (GMT+7), terlepas dari timezone server (Vercel default = UTC).

const JAKARTA_TZ = "Asia/Jakarta";

export function formatJakartaDateTime(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: JAKARTA_TZ,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date) + " WIB";
}

export function formatJakartaDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: JAKARTA_TZ,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
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
