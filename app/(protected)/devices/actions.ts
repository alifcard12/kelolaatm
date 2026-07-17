"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DeviceType, DeviceCondition } from "@prisma/client";

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

  revalidatePath("/devices");
  revalidatePath(`/atm/${oldDevice.atmId}`);
}
