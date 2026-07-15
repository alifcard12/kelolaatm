"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deletePhoto } from "@/lib/cloudinary";

const MAX_FILES = 6;

type UploadedFile = {
  url: string;
  publicId: string;
  resourceType: "image" | "raw";
  filename: string;
};

/**
 * File (foto/PDF) sudah diupload langsung dari browser ke Cloudinary
 * (client-side upload), jadi di sini kita cuma perlu baca & validasi
 * teks JSON hasil upload-nya (bukan file mentah) dari field `filesJson`.
 */
function getUploadedFiles(formData: FormData): UploadedFile[] {
  const raw = String(formData.get("filesJson") ?? "[]");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Data lampiran tidak valid.");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Data lampiran tidak valid.");
  }
  if (parsed.length > MAX_FILES) {
    throw new Error(`Maksimal ${MAX_FILES} file per tiket.`);
  }
  for (const item of parsed) {
    const f = item as UploadedFile;
    if (
      typeof f !== "object" ||
      f === null ||
      typeof f.url !== "string" ||
      typeof f.publicId !== "string" ||
      (f.resourceType !== "image" && f.resourceType !== "raw")
    ) {
      throw new Error("Data lampiran tidak valid.");
    }
  }

  return parsed as UploadedFile[];
}

/** Ambil deviceId dari form, kosongkan jika "" (opsi "Tidak ada"). */
function getDeviceId(formData: FormData): string | null {
  const deviceId = String(formData.get("deviceId") ?? "").trim();
  return deviceId || null;
}

export async function createTicket(formData: FormData) {
  const atmId = String(formData.get("atmId") ?? "");
  const problem = String(formData.get("problem") ?? "").trim();
  const deviceId = getDeviceId(formData);

  if (!atmId || !problem) {
    throw new Error("ATM dan problem wajib diisi.");
  }

  await prisma.ticket.create({
    data: { atmId, problem, deviceId },
  });

  revalidatePath("/tickets");
  redirect("/tickets");
}

/** Edit problem & device rujukan tiket (bisa dipakai kapan saja, OPEN maupun CLOSED). */
export async function updateTicket(ticketId: string, formData: FormData) {
  const problem = String(formData.get("problem") ?? "").trim();
  const deviceId = getDeviceId(formData);

  if (!problem) {
    throw new Error("Problem wajib diisi.");
  }

  await prisma.ticket.update({
    where: { id: ticketId },
    data: { problem, deviceId },
  });

  revalidatePath(`/tickets/${ticketId}`);
  revalidatePath("/tickets");
}

/**
 * Tutup tiket (atau edit detail penutupan kalau sudah CLOSED sebelumnya):
 * isi nomor tiket, action, device rujukan, dan tambahkan lampiran foto/PDF.
 */
export async function closeTicket(ticketId: string, formData: FormData) {
  const ticketNumber = String(formData.get("ticketNumber") ?? "").trim();
  const action = String(formData.get("action") ?? "").trim();
  const deviceId = getDeviceId(formData);

  if (!ticketNumber || !action) {
    throw new Error("Nomor tiket dan action wajib diisi.");
  }

  const uploaded = getUploadedFiles(formData);

  await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      ticketNumber,
      action,
      deviceId,
      status: "CLOSED",
      closedAt: new Date(),
      attachments: {
        create: uploaded.map((f) => ({
          url: f.url,
          publicId: f.publicId,
          resourceType: f.resourceType,
          filename: f.filename,
        })),
      },
    },
  });

  revalidatePath(`/tickets/${ticketId}`);
  revalidatePath("/tickets");
}

export async function reopenTicket(ticketId: string) {
  await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      status: "OPEN",
      ticketNumber: null,
      action: null,
      closedAt: null,
    },
  });

  revalidatePath(`/tickets/${ticketId}`);
  revalidatePath("/tickets");
}

/** Hapus satu lampiran tiket (dari Cloudinary sekaligus dari DB). */
export async function deleteTicketAttachment(ticketId: string, attachmentId: string) {
  const attachment = await prisma.ticketAttachment.findUnique({ where: { id: attachmentId } });
  if (!attachment) return;

  await prisma.ticketAttachment.delete({ where: { id: attachmentId } });
  await deletePhoto(attachment.publicId).catch(() => {
    // best-effort: kalau gagal hapus di Cloudinary, data di DB tetap sudah bersih
  });

  revalidatePath(`/tickets/${ticketId}`);
}

export async function deleteTicket(id: string) {
  const attachments = await prisma.ticketAttachment.findMany({
    where: { ticketId: id },
    select: { publicId: true },
  });

  await prisma.ticket.delete({ where: { id } });

  await Promise.all(attachments.map((a) => deletePhoto(a.publicId).catch(() => {})));

  revalidatePath("/tickets");
}
