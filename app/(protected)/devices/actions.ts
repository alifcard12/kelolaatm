"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DeviceType, DeviceCondition } from "@prisma/client";
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

export async function createDevice(formData: FormData) {
  const type = String(formData.get("type")) as DeviceType;
  const brand = String(formData.get("brand") ?? "").trim();
  const serialNumber = String(formData.get("serialNumber") ?? "").trim();
  const condition = String(formData.get("condition")) as DeviceCondition;
  const note = String(formData.get("note") ?? "").trim() || null;
  const atmId = String(formData.get("atmId") ?? "");

  if (!type || !brand || !serialNumber || !condition || !atmId) {
    throw new Error("Semua field wajib diisi.");
  }

  await prisma.$transaction([
    prisma.device.create({
      data: { type, brand, serialNumber, condition, note, atmId },
    }),
    prisma.deviceHistory.create({
      data: { atmId, action: "ADDED", deviceType: type, brand, serialNumber, note },
    }),
  ]);

  revalidatePath("/devices");
  revalidatePath(`/atm/${atmId}`);
  redirect("/devices");
}

export async function deleteDevice(id: string) {
  const device = await prisma.device.findUnique({ where: { id } });
  if (!device) return;

  const logPhotos = await prisma.deviceLogPhoto.findMany({
    where: { log: { deviceId: id } },
    select: { publicId: true },
  });

  await prisma.$transaction([
    prisma.device.delete({ where: { id } }),
    prisma.deviceHistory.create({
      data: {
        atmId: device.atmId,
        action: "REMOVED",
        deviceType: device.type,
        brand: device.brand,
        serialNumber: device.serialNumber,
        note: device.note,
      },
    }),
  ]);

  await Promise.all(logPhotos.map((p) => deletePhoto(p.publicId).catch(() => {})));

  revalidatePath("/devices");
  revalidatePath(`/atm/${device.atmId}`);
}

/**
 * Ganti perangkat lama dengan yang baru di ATM yang sama: perangkat lama
 * dihapus, perangkat baru dibuat, dan satu baris riwayat "REPLACED" dicatat
 * (info perangkat lama disimpan di `note` supaya tidak hilang).
 */
export async function replaceDevice(oldDeviceId: string, formData: FormData) {
  const oldDevice = await prisma.device.findUnique({ where: { id: oldDeviceId } });
  if (!oldDevice) throw new Error("Perangkat lama tidak ditemukan.");

  const type = String(formData.get("type")) as DeviceType;
  const brand = String(formData.get("brand") ?? "").trim();
  const serialNumber = String(formData.get("serialNumber") ?? "").trim();
  const condition = String(formData.get("condition")) as DeviceCondition;
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!type || !brand || !serialNumber || !condition) {
    throw new Error("Semua field perangkat baru wajib diisi.");
  }

  const replaceNote = [
    `Ganti dari ${oldDevice.type} — ${oldDevice.brand} — SN ${oldDevice.serialNumber}`,
    note ? `Catatan: ${note}` : null,
  ]
    .filter(Boolean)
    .join(". ");

  const oldLogPhotos = await prisma.deviceLogPhoto.findMany({
    where: { log: { deviceId: oldDeviceId } },
    select: { publicId: true },
  });

  await prisma.$transaction([
    prisma.device.delete({ where: { id: oldDeviceId } }),
    prisma.device.create({
      data: { type, brand, serialNumber, condition, note, atmId: oldDevice.atmId },
    }),
    prisma.deviceHistory.create({
      data: {
        atmId: oldDevice.atmId,
        action: "REPLACED",
        deviceType: type,
        brand,
        serialNumber,
        note: replaceNote,
      },
    }),
  ]);

  await Promise.all(oldLogPhotos.map((p) => deletePhoto(p.publicId).catch(() => {})));

  revalidatePath("/devices");
  revalidatePath(`/atm/${oldDevice.atmId}`);
}

/** Edit info dasar sebuah perangkat (brand, SN, kondisi, catatan) tanpa mengubah tipe/ATM. */
export async function updateDevice(deviceId: string, formData: FormData) {
  const brand = String(formData.get("brand") ?? "").trim();
  const serialNumber = String(formData.get("serialNumber") ?? "").trim();
  const condition = String(formData.get("condition")) as DeviceCondition;
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!brand || !serialNumber || !condition) {
    throw new Error("Brand, SN, dan kondisi wajib diisi.");
  }

  const device = await prisma.device.update({
    where: { id: deviceId },
    data: { brand, serialNumber, condition, note },
  });

  revalidatePath(`/devices/${deviceId}`);
  revalidatePath("/devices");
  revalidatePath(`/atm/${device.atmId}`);
}

/** Tambah satu entri riwayat/foto untuk perangkat (mis. hasil pengecekan, temuan, dokumentasi). */
export async function addDeviceLog(deviceId: string, formData: FormData) {
  const note = String(formData.get("note") ?? "").trim() || null;
  const uploaded = getUploadedPhotos(formData);

  if (!note && uploaded.length === 0) {
    throw new Error("Isi catatan atau lampirkan minimal satu foto.");
  }

  await prisma.deviceLog.create({
    data: {
      deviceId,
      note,
      photos: { create: uploaded.map((p) => ({ url: p.url, publicId: p.publicId })) },
    },
  });

  revalidatePath(`/devices/${deviceId}`);
}

/** Hapus satu foto dari sebuah riwayat perangkat (dari Cloudinary sekaligus dari DB). */
export async function deleteDeviceLogPhoto(deviceId: string, photoId: string) {
  const photo = await prisma.deviceLogPhoto.findUnique({ where: { id: photoId } });
  if (!photo) return;

  await prisma.deviceLogPhoto.delete({ where: { id: photoId } });
  await deletePhoto(photo.publicId).catch(() => {
    // best-effort: kalau gagal hapus di Cloudinary, data di DB tetap sudah bersih
  });

  revalidatePath(`/devices/${deviceId}`);
}

/** Hapus satu riwayat perangkat beserta semua fotonya (DB + Cloudinary). */
export async function deleteDeviceLog(deviceId: string, logId: string) {
  const photos = await prisma.deviceLogPhoto.findMany({
    where: { logId },
    select: { publicId: true },
  });

  await prisma.deviceLog.delete({ where: { id: logId } });

  await Promise.all(photos.map((p) => deletePhoto(p.publicId).catch(() => {})));

  revalidatePath(`/devices/${deviceId}`);
}
