"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DeviceCondition, KasetType } from "@prisma/client";

export async function createKaset(formData: FormData) {
  const serialNumber = String(formData.get("serialNumber") ?? "").trim();
  const type = String(formData.get("type")) as KasetType;
  const condition = String(formData.get("condition")) as DeviceCondition;
  const problem = String(formData.get("problem") ?? "").trim() || null;

  if (!serialNumber || !type || !condition) {
    throw new Error("SN, tipe, dan kondisi wajib diisi.");
  }

  await prisma.kaset.create({
    data: {
      serialNumber,
      type,
      logs: {
        create: { condition, problem },
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
  const condition = String(formData.get("condition")) as DeviceCondition;
  const problem = String(formData.get("problem") ?? "").trim() || null;

  if (!condition) {
    throw new Error("Kondisi wajib diisi.");
  }

  await prisma.kasetLog.create({
    data: { kasetId, condition, problem },
  });

  revalidatePath(`/kaset/${kasetId}`);
  revalidatePath("/kaset");
}

export async function deleteKaset(id: string) {
  await prisma.kaset.delete({ where: { id } });
  revalidatePath("/kaset");
}
