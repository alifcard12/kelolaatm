"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { VisitType } from "@prisma/client";

export async function createVisit(formData: FormData) {
  const atmId = String(formData.get("atmId") ?? "");
  const visitType = String(formData.get("visitType")) as VisitType;
  const visitDateRaw = String(formData.get("visitDate") ?? "");
  const keterangan = String(formData.get("keterangan") ?? "").trim() || null;
  const photoUrl = String(formData.get("photoUrl") ?? "").trim() || null;

  if (!atmId || !visitType) {
    throw new Error("ATM dan tipe kunjungan wajib diisi.");
  }

  // Pencatatan manual di halaman ini hanya untuk kunjungan PM. Kunjungan CM
  // otomatis dibuat sistem saat tiket ditutup di halaman Tiket.
  if (visitType !== "PM") {
    throw new Error(
      "Kunjungan tipe CM otomatis tercatat saat tiket ditutup dan tidak bisa diinput manual di sini."
    );
  }

  const visitDate = visitDateRaw ? new Date(visitDateRaw) : new Date();

  // PM: nomor tiket diisi manual, tidak terkait tabel Ticket
  const ticketNumber = String(formData.get("ticketNumber") ?? "").trim() || null;
  if (!ticketNumber) {
    throw new Error("Nomor tiket wajib diisi untuk kunjungan PM.");
  }

  await prisma.visit.create({
    data: {
      atmId,
      visitType,
      visitDate,
      ticketId: null,
      ticketNumber,
      keterangan,
      photoUrl,
    },
  });

  revalidatePath("/visits");
  redirect("/visits");
}

export async function deleteVisit(id: string) {
  await prisma.visit.delete({ where: { id } });
  revalidatePath("/visits");
}
