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

  const visitDate = visitDateRaw ? new Date(visitDateRaw) : new Date();

  let ticketId: string | null = null;
  let ticketNumber: string | null = null;

  if (visitType === "PM") {
    // PM: nomor tiket diisi manual, tidak terkait tabel Ticket
    ticketNumber = String(formData.get("ticketNumber") ?? "").trim() || null;
    if (!ticketNumber) {
      throw new Error("Nomor tiket wajib diisi untuk kunjungan PM.");
    }
  } else {
    // CM: wajib pilih tiket yang statusnya CLOSED, nomor tiket ikut dari tiket tsb
    ticketId = String(formData.get("ticketId") ?? "").trim() || null;
    if (!ticketId) {
      throw new Error("Tiket wajib dipilih untuk kunjungan CM.");
    }

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket || ticket.status !== "CLOSED") {
      throw new Error("Tiket yang dipilih tidak valid atau belum CLOSED.");
    }
  }

  await prisma.visit.create({
    data: {
      atmId,
      visitType,
      visitDate,
      ticketId,
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
