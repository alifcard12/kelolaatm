"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  ABSENSI_COOKIE_NAME,
  ABSENSI_USERNAME_COOKIE_NAME,
  loginAbsensi,
  submitAbsen,
  listAbsensiLogs,
  type SubmitAbsenResult,
} from "@/lib/absensi";

export async function loginAbsensiAction(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    throw new Error("Username dan password wajib diisi.");
  }

  const sessionValue = await loginAbsensi(username, password);

  const cookieStore = await cookies();
  cookieStore.set(ABSENSI_COOKIE_NAME, sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // Mengikuti masa berlaku ci_session dari server absensi (~1 hari).
    maxAge: 60 * 60 * 24,
  });
  cookieStore.set(ABSENSI_USERNAME_COOKIE_NAME, username, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  revalidatePath("/absensi");
}

export async function logoutAbsensiAction() {
  const cookieStore = await cookies();
  cookieStore.delete(ABSENSI_COOKIE_NAME);
  cookieStore.delete(ABSENSI_USERNAME_COOKIE_NAME);
  revalidatePath("/absensi");
}

export async function submitAbsenAction(
  formData: FormData
): Promise<SubmitAbsenResult> {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(ABSENSI_COOKIE_NAME)?.value;
  const username = cookieStore.get(ABSENSI_USERNAME_COOKIE_NAME)?.value;

  if (!sessionValue || !username) {
    throw new Error("Belum login ke sistem absensi.");
  }

  const keterangan = String(formData.get("keterangan") ?? "");
  const latitude = String(formData.get("latitude") ?? "");
  const longitude = String(formData.get("longitude") ?? "");
  const manualLocation = String(formData.get("manual_location") ?? "0");
  const alasanTerlambat = String(formData.get("alasan_terlambat") ?? "");
  const secureScore = String(formData.get("secure_score") ?? "");
  const accuracy = String(formData.get("accuracy") ?? "");

  if (!keterangan) {
    throw new Error("Keterangan absen wajib dipilih.");
  }
  if (!latitude || !longitude) {
    throw new Error("Lokasi (latitude/longitude) belum tersedia. Izinkan akses lokasi lalu coba lagi.");
  }

  const result = await submitAbsen({
    sessionValue,
    username,
    keterangan,
    latitude,
    longitude,
    manualLocation,
    alasanTerlambat,
    secureScore,
    accuracy,
  });

  revalidatePath("/absensi");
  return result;
}

export async function getAbsensiLogsAction() {
  return listAbsensiLogs();
}

export async function deleteAbsensiLogAction(id: string) {
  await prisma.absensiLog.delete({ where: { id } });
  revalidatePath("/absensi");
}
