"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deletePhoto } from "@/lib/cloudinary";

const MAX_PHOTOS = 6;

type UploadedPhoto = { url: string; publicId: string };

/**
 * Foto sudah diupload langsung dari browser ke Cloudinary (client-side upload),
 * jadi di sini kita cuma perlu baca & validasi teks JSON hasil upload-nya
 * (bukan file mentah) dari field `photosJson`.
 */
function getUploadedPhotos(formData: FormData): UploadedPhoto[] {
  const raw = String(formData.get("photosJson") ?? "[]");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Data foto tidak valid.");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Data foto tidak valid.");
  }
  if (parsed.length > MAX_PHOTOS) {
    throw new Error(`Maksimal ${MAX_PHOTOS} foto per update.`);
  }
  for (const item of parsed) {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof (item as UploadedPhoto).url !== "string" ||
      typeof (item as UploadedPhoto).publicId !== "string"
    ) {
      throw new Error("Data foto tidak valid.");
    }
  }

  return parsed as UploadedPhoto[];
}

export async function createAtm(formData: FormData) {
  const tid = Number(formData.get("tid"));
  const location = String(formData.get("location") ?? "").trim();
  const branch = String(formData.get("branch") ?? "").trim();
  const ssb = String(formData.get("ssb") ?? "").trim();

  if (!tid || !location || !branch || !ssb) {
    throw new Error("Semua field wajib diisi.");
  }

  await prisma.atm.create({
    data: { tid, location, branch, ssb },
  });

  revalidatePath("/atm");
  redirect("/atm");
}

export async function updateAtm(atmId: string, formData: FormData) {
  const location = String(formData.get("location") ?? "").trim();
  const branch = String(formData.get("branch") ?? "").trim();
  const ssb = String(formData.get("ssb") ?? "").trim();

  if (!location || !branch || !ssb) {
    throw new Error("Location, branch, dan SSB wajib diisi.");
  }

  await prisma.atm.update({
    where: { id: atmId },
    data: { location, branch, ssb },
  });

  revalidatePath(`/atm/${atmId}`);
  revalidatePath("/atm");
}

/** Tambah satu entri riwayat/foto untuk ATM (mis. hasil kunjungan, temuan, dokumentasi). */
export async function addAtmLog(atmId: string, formData: FormData) {
  const note = String(formData.get("note") ?? "").trim() || null;
  const uploaded = getUploadedPhotos(formData);

  if (!note && uploaded.length === 0) {
    throw new Error("Isi catatan atau lampirkan minimal satu foto.");
  }

  await prisma.atmLog.create({
    data: {
      atmId,
      note,
      photos: { create: uploaded.map((p) => ({ url: p.url, publicId: p.publicId })) },
    },
  });

  revalidatePath(`/atm/${atmId}`);
}

/** Hapus satu foto dari sebuah riwayat ATM (dari Cloudinary sekaligus dari DB). */
export async function deleteAtmLogPhoto(atmId: string, photoId: string) {
  const photo = await prisma.atmLogPhoto.findUnique({ where: { id: photoId } });
  if (!photo) return;

  await prisma.atmLogPhoto.delete({ where: { id: photoId } });
  await deletePhoto(photo.publicId).catch(() => {
    // best-effort: kalau gagal hapus di Cloudinary, data di DB tetap sudah bersih
  });

  revalidatePath(`/atm/${atmId}`);
}

/** Hapus satu riwayat ATM beserta semua fotonya (DB + Cloudinary). */
export async function deleteAtmLog(atmId: string, logId: string) {
  const photos = await prisma.atmLogPhoto.findMany({
    where: { logId },
    select: { publicId: true },
  });

  await prisma.atmLog.delete({ where: { id: logId } });

  await Promise.all(photos.map((p) => deletePhoto(p.publicId).catch(() => {})));

  revalidatePath(`/atm/${atmId}`);
}

export async function deleteAtm(id: string) {
  const photos = await prisma.atmLogPhoto.findMany({
    where: { log: { atmId: id } },
    select: { publicId: true },
  });

  await prisma.atm.delete({ where: { id } });

  await Promise.all(photos.map((p) => deletePhoto(p.publicId).catch(() => {})));

  revalidatePath("/atm");
}
