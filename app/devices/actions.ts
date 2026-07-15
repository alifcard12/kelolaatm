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

  await prisma.device.create({
    data: { type, brand, serialNumber, condition, note, atmId },
  });

  revalidatePath("/devices");
  redirect("/devices");
}

export async function deleteDevice(id: string) {
  await prisma.device.delete({ where: { id } });
  revalidatePath("/devices");
}
