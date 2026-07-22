"use server";

import { revalidatePath } from "next/cache";
import {
  createAbsenSchedule,
  listAbsenSchedules,
  deleteAbsenSchedule,
} from "@/lib/absenSchedule";

export async function createAbsenScheduleAction(formData: FormData) {
  const scheduledAtLocal = String(formData.get("scheduled_at") ?? "");
  const keterangan = String(formData.get("keterangan") ?? "");
  const latitude = String(formData.get("latitude") ?? "");
  const longitude = String(formData.get("longitude") ?? "");
  const manualLocation = String(formData.get("manual_location") ?? "1") === "1";
  const accuracy = String(formData.get("accuracy") ?? "");
  const secureScore = String(formData.get("secure_score") ?? "");
  const alasanTerlambat = String(formData.get("alasan_terlambat") ?? "");

  if (!scheduledAtLocal) {
    throw new Error("Tanggal & jam jadwal wajib diisi.");
  }
  if (keterangan !== "masuk" && keterangan !== "pulang") {
    throw new Error("Keterangan absen wajib dipilih.");
  }
  if (!latitude || !longitude) {
    throw new Error("Latitude/longitude wajib diisi.");
  }
  if (!accuracy || !secureScore) {
    throw new Error("Accuracy dan Secure Score wajib diisi.");
  }

  // <input type="datetime-local"> mengirim waktu lokal browser (WIB), tanpa
  // info timezone. Karena aplikasi ini dipakai di Indonesia (WIB = UTC+7),
  // kita anggap nilainya WIB lalu konversi manual ke UTC untuk disimpan.
  const scheduledAt = new Date(`${scheduledAtLocal}:00+07:00`);
  if (Number.isNaN(scheduledAt.getTime())) {
    throw new Error("Format tanggal & jam jadwal tidak valid.");
  }

  await createAbsenSchedule({
    scheduledAt,
    keterangan,
    latitude,
    longitude,
    manualLocation,
    accuracy,
    secureScore,
    alasanTerlambat,
  });

  revalidatePath("/absensi");
}

export async function getAbsenSchedulesAction() {
  return listAbsenSchedules();
}

export async function deleteAbsenScheduleAction(id: string) {
  await deleteAbsenSchedule(id);
  revalidatePath("/absensi");
}
