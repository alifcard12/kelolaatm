import { prisma } from "@/lib/prisma";
import { loginAbsensi, submitAbsen, AbsensiError } from "@/lib/absensi";

// Kredensial login absensi buat eksekusi otomatis (dipanggil dari cron /
// GitHub Actions, jadi TIDAK bisa pakai cookie session dari browser).
// Diisi lewat Environment Variables di Vercel, bukan hardcode.
const CRON_USERNAME = process.env.ABSENSI_USERNAME;
const CRON_PASSWORD = process.env.ABSENSI_PASSWORD;

export type CreateAbsenScheduleInput = {
  scheduledAt: Date;
  keterangan: "masuk" | "pulang";
  latitude: string;
  longitude: string;
  manualLocation: boolean;
  accuracy: string;
  secureScore: string;
  alasanTerlambat?: string;
};

export async function createAbsenSchedule(input: CreateAbsenScheduleInput) {
  return prisma.absenSchedule.create({
    data: {
      scheduledAt: input.scheduledAt,
      keterangan: input.keterangan,
      latitude: input.latitude,
      longitude: input.longitude,
      manualLocation: input.manualLocation,
      accuracy: input.accuracy,
      secureScore: input.secureScore,
      alasanTerlambat: input.alasanTerlambat || null,
    },
  });
}

export async function listAbsenSchedules() {
  return prisma.absenSchedule.findMany({
    orderBy: { scheduledAt: "desc" },
    take: 100,
  });
}

export async function deleteAbsenSchedule(id: string) {
  await prisma.absenSchedule.delete({ where: { id } });
}

/**
 * Dipanggil oleh /api/cron/run-absen-schedule. Cari semua jadwal PENDING yang
 * sudah "jatuh tempo" (scheduledAt <= now), lalu untuk masing-masing: login ke
 * absensi.itsview.id pakai kredensial dari env, kirim absen dengan parameter
 * (lat/lon/accuracy/secureScore) yang disimpan di jadwal itu sendiri, lalu
 * tandai hasilnya. Satu jadwal = satu siklus login+submit yang berdiri
 * sendiri, jadi tidak bergantung pada cookie/session lama sama sekali.
 */
export async function runDueAbsenSchedules() {
  if (!CRON_USERNAME || !CRON_PASSWORD) {
    throw new Error(
      "ABSENSI_USERNAME / ABSENSI_PASSWORD belum di-set di environment variables."
    );
  }

  const due = await prisma.absenSchedule.findMany({
    where: { status: "PENDING", scheduledAt: { lte: new Date() } },
    orderBy: { scheduledAt: "asc" },
  });

  const results: Array<{ id: string; ok: boolean; message: string }> = [];

  for (const schedule of due) {
    try {
      const sessionValue = await loginAbsensi(CRON_USERNAME, CRON_PASSWORD);

      const result = await submitAbsen({
        sessionValue,
        username: CRON_USERNAME,
        keterangan: schedule.keterangan,
        latitude: schedule.latitude,
        longitude: schedule.longitude,
        manualLocation: schedule.manualLocation ? "1" : "0",
        alasanTerlambat: schedule.alasanTerlambat ?? "",
        secureScore: schedule.secureScore,
        accuracy: schedule.accuracy,
      });

      const message = result.warning ?? "Absen terkirim.";

      await prisma.absenSchedule.update({
        where: { id: schedule.id },
        data: {
          status: "DONE",
          resultMessage: message,
          executedAt: new Date(),
        },
      });

      results.push({ id: schedule.id, ok: true, message });
    } catch (err) {
      const message =
        err instanceof AbsensiError || err instanceof Error
          ? err.message
          : "Gagal menjalankan jadwal absen.";

      await prisma.absenSchedule.update({
        where: { id: schedule.id },
        data: {
          status: "FAILED",
          resultMessage: message,
          executedAt: new Date(),
        },
      });

      results.push({ id: schedule.id, ok: false, message });
    }
  }

  return results;
}
