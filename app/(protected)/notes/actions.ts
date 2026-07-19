"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NoteCategory } from "@prisma/client";
import { deletePhoto } from "@/lib/cloudinary";

const MAX_FILES = 6;

type UploadedAttachment = {
  url: string;
  publicId: string;
  resourceType: "image" | "raw";
  fileKind: "image" | "pdf" | "excel";
  filename: string;
};

/**
 * File (foto/PDF/Excel) sudah diupload langsung dari browser ke Cloudinary
 * (client-side upload), jadi di sini kita cuma perlu baca & validasi teks
 * JSON hasil upload-nya (bukan file mentah) dari field `attachmentsJson`.
 */
function getUploadedAttachments(formData: FormData): UploadedAttachment[] {
  const raw = String(formData.get("attachmentsJson") ?? "[]");

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
    throw new Error(`Maksimal ${MAX_FILES} file per catatan.`);
  }
  for (const item of parsed) {
    const f = item as UploadedAttachment;
    if (
      typeof f !== "object" ||
      f === null ||
      typeof f.url !== "string" ||
      typeof f.publicId !== "string" ||
      (f.resourceType !== "image" && f.resourceType !== "raw") ||
      (f.fileKind !== "image" && f.fileKind !== "pdf" && f.fileKind !== "excel")
    ) {
      throw new Error("Data lampiran tidak valid.");
    }
  }

  return parsed as UploadedAttachment[];
}

export async function createNote(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim() || null;
  const link = String(formData.get("link") ?? "").trim() || null;
  const category = String(formData.get("category")) as NoteCategory;

  if (!title || !category) {
    throw new Error("Judul dan kategori wajib diisi.");
  }

  const uploaded = getUploadedAttachments(formData);

  await prisma.note.create({
    data: {
      title,
      content,
      link,
      category,
      attachments: {
        create: uploaded.map((f) => ({
          url: f.url,
          publicId: f.publicId,
          resourceType: f.resourceType,
          fileKind: f.fileKind,
          filename: f.filename,
        })),
      },
    },
  });

  revalidatePath("/notes");
  redirect("/notes");
}

export async function updateNote(noteId: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim() || null;
  const link = String(formData.get("link") ?? "").trim() || null;
  const category = String(formData.get("category")) as NoteCategory;

  if (!title || !category) {
    throw new Error("Judul dan kategori wajib diisi.");
  }

  await prisma.note.update({
    where: { id: noteId },
    data: { title, content, link, category },
  });

  revalidatePath(`/notes/${noteId}`);
  revalidatePath("/notes");
}

/** Tambah lampiran baru ke catatan yang sudah ada. */
export async function addNoteAttachments(noteId: string, formData: FormData) {
  const uploaded = getUploadedAttachments(formData);

  if (uploaded.length === 0) return;

  await prisma.note.update({
    where: { id: noteId },
    data: {
      attachments: {
        create: uploaded.map((f) => ({
          url: f.url,
          publicId: f.publicId,
          resourceType: f.resourceType,
          fileKind: f.fileKind,
          filename: f.filename,
        })),
      },
    },
  });

  revalidatePath(`/notes/${noteId}`);
}

/** Hapus satu lampiran (dari Cloudinary sekaligus dari DB). */
export async function deleteNoteAttachment(noteId: string, attachmentId: string) {
  const attachment = await prisma.noteAttachment.findUnique({ where: { id: attachmentId } });
  if (!attachment) return;

  await prisma.noteAttachment.delete({ where: { id: attachmentId } });
  await deletePhoto(attachment.publicId, attachment.resourceType as "image" | "raw").catch(() => {
    // best-effort: kalau gagal hapus di Cloudinary, data di DB tetap sudah bersih
  });

  revalidatePath(`/notes/${noteId}`);
}

export async function deleteNote(id: string) {
  const attachments = await prisma.noteAttachment.findMany({
    where: { noteId: id },
    select: { publicId: true, resourceType: true },
  });

  await prisma.note.delete({ where: { id } });

  await Promise.all(
    attachments.map((a) =>
      deletePhoto(a.publicId, a.resourceType as "image" | "raw").catch(() => {})
    )
  );

  revalidatePath("/notes");
}
