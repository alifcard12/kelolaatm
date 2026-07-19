"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { KasetType, KasetCondition, GantiPartSource } from "@prisma/client";
import { deletePhoto } from "@/lib/cloudinary";

const MAX_PHOTOS = 6;

type UploadedPhoto = { url: string; publicId: string };

/**
 * Foto sudah diupload langsung dari browser ke Cloudinary (client-side upload),
 * jadi di sini kita cuma perlu baca & validasi teks JSON hasil upload-nya
 * (bukan file mentah lagi) dari field `photosJson`.
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

export async function createKaset(formData: FormData) {
  const serialNumber = String(formData.get("serialNumber") ?? "").trim();
  const type = String(formData.get("type")) as KasetType;
  const condition = String(formData.get("condition")) as KasetCondition;
  const problem = String(formData.get("problem") ?? "").trim() || null;
  const action = String(formData.get("action") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const gantiPartRaw = String(formData.get("gantiPart") ?? "").trim();
  const gantiPart = gantiPartRaw ? (gantiPartRaw as GantiPartSource) : null;

  if (!serialNumber || !type || !condition) {
    throw new Error("SN, tipe, dan kondisi wajib diisi.");
  }

  const uploaded = getUploadedPhotos(formData);

  await prisma.kaset.create({
    data: {
      serialNumber,
      type,
      logs: {
        create: {
          condition,
          problem,
          action,
          notes,
          gantiPart,
          photos: { create: uploaded.map((p) => ({ url: p.url, publicId: p.publicId })) },
        },
      },
    },
  });

  revalidatePath("/kaset");
  redirect("/kaset");
}

export async function updateKasetType(kasetId: string, formData: FormData) {
  const type = String(formData.get("type")) as KasetType;

  if (!type) {
    throw new Error("Tipe wajib diisi.");
  }

  await prisma.kaset.update({
    where: { id: kasetId },
    data: { type },
  });

  revalidatePath(`/kaset/${kasetId}`);
  revalidatePath("/kaset");
}

export async function addKasetLog(kasetId: string, formData: FormData) {
  const condition = String(formData.get("condition")) as KasetCondition;
  const problem = String(formData.get("problem") ?? "").trim() || null;
  const action = String(formData.get("action") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const gantiPartRaw = String(formData.get("gantiPart") ?? "").trim();
  const gantiPart = gantiPartRaw ? (gantiPartRaw as GantiPartSource) : null;

  if (!condition) {
    throw new Error("Kondisi wajib diisi.");
  }

  const uploaded = getUploadedPhotos(formData);

  await prisma.kasetLog.create({
    data: {
      kasetId,
      condition,
      problem,
      action,
      notes,
      gantiPart,
      photos: { create: uploaded.map((p) => ({ url: p.url, publicId: p.publicId })) },
    },
  });

  revalidatePath(`/kaset/${kasetId}`);
  revalidatePath("/kaset");
}

/** Hapus satu foto dari sebuah log (dari Cloudinary sekaligus dari DB). */
export async function deleteKasetLogPhoto(kasetId: string, photoId: string) {
  const photo = await prisma.kasetLogPhoto.findUnique({ where: { id: photoId } });
  if (!photo) return;

  await prisma.kasetLogPhoto.delete({ where: { id: photoId } });
  await deletePhoto(photo.publicId).catch(() => {
    // best-effort: kalau gagal hapus di Cloudinary, data di DB tetap sudah bersih
  });

  revalidatePath(`/kaset/${kasetId}`);
}

/** Hapus satu riwayat log (kondisi) beserta semua fotonya (DB + Cloudinary). */
export async function deleteKasetLog(kasetId: string, logId: string) {
  const photos = await prisma.kasetLogPhoto.findMany({
    where: { logId },
    select: { publicId: true },
  });

  await prisma.kasetLog.delete({ where: { id: logId } });

  // best-effort: hapus juga file-nya di Cloudinary supaya tidak numpuk
  await Promise.all(photos.map((p) => deletePhoto(p.publicId).catch(() => {})));

  revalidatePath(`/kaset/${kasetId}`);
}

export async function deleteKaset(id: string) {
  const photos = await prisma.kasetLogPhoto.findMany({
    where: { log: { kasetId: id } },
    select: { publicId: true },
  });

  await prisma.kaset.delete({ where: { id } });

  // best-effort: hapus juga file-nya di Cloudinary supaya tidak numpuk
  await Promise.all(photos.map((p) => deletePhoto(p.publicId).catch(() => {})));

  revalidatePath("/kaset");
}
