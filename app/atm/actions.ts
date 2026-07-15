"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

export async function deleteAtm(id: string) {
  await prisma.atm.delete({ where: { id } });
  revalidatePath("/atm");
}
