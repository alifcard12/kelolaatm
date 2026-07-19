import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatJakartaDateTime } from "@/lib/date";
import { updateNote, deleteNote, addNoteAttachments, deleteNoteAttachment } from "../actions";
import { NoteFileUploader } from "@/components/NoteFileUploader";
import { NoteAttachments } from "@/components/NoteAttachments";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { ActionForm } from "@/components/ui/ActionForm";
import { FiChevronLeft, FiExternalLink } from "react-icons/fi";
import { NOTE_CATEGORY_LABEL, NOTE_CATEGORY_TONE } from "@/lib/labels";

export default async function NoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const note = await prisma.note.findUnique({
    where: { id },
    include: { attachments: { orderBy: { createdAt: "desc" } } },
  });

  if (!note) notFound();

  const updateNoteWithId = updateNote.bind(null, note.id);
  const addAttachmentsWithId = addNoteAttachments.bind(null, note.id);
  const deleteAttachmentWithId = deleteNoteAttachment.bind(null, note.id);

  return (
    <div className="max-w-2xl">
      <Link href="/notes" className="inline-flex items-center gap-1 text-xs text-espresso-soft hover:text-rose mb-2">
        <FiChevronLeft /> Kembali ke Catatan
      </Link>

      <PageHeader
        title={note.title}
        action={<DeleteButton action={deleteNote.bind(null, note.id)} label="Hapus Catatan" />}
      />

      <div className="flex items-center gap-2 mb-6 -mt-2">
        <Badge tone={NOTE_CATEGORY_TONE[note.category]}>{NOTE_CATEGORY_LABEL[note.category]}</Badge>
        <span className="text-xs text-espresso-soft/70">
          Update terakhir: {formatJakartaDateTime(note.updatedAt)}
        </span>
      </div>

      {/* Edit catatan */}
      <Card className="flex flex-col gap-4 mb-8">
        <CardTitle>Edit Catatan</CardTitle>
        <ActionForm action={updateNoteWithId} successMessage="Catatan berhasil disimpan" className="flex flex-col gap-4">
          <Field label="Judul" htmlFor="title">
            <Input id="title" name="title" type="text" required defaultValue={note.title} />
          </Field>

          <Field label="Kategori" htmlFor="category">
            <Select id="category" name="category" required defaultValue={note.category}>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
              <option value="ARCHIVE">Archive</option>
            </Select>
          </Field>

          <Field label="Catatan (opsional)" htmlFor="content">
            <Textarea id="content" name="content" rows={4} defaultValue={note.content ?? ""} />
          </Field>

          <Field label="Link (opsional)" htmlFor="link">
            <Input id="link" name="link" type="url" placeholder="https://..." defaultValue={note.link ?? ""} />
          </Field>

          <Button type="submit" className="self-start">
            Simpan Perubahan
          </Button>
        </ActionForm>

        {note.link && (
          <a
            href={note.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-rose hover:underline self-start"
          >
            <FiExternalLink className="h-3.5 w-3.5" />
            Buka Link
          </a>
        )}
      </Card>

      {/* Tambah lampiran */}
      <Card className="flex flex-col gap-4 mb-8">
        <CardTitle>Tambah Lampiran</CardTitle>
        <ActionForm
          action={addAttachmentsWithId}
          successMessage="Lampiran berhasil ditambahkan"
          resetOnSuccess
          className="flex flex-col gap-4"
        >
          <Field label="Foto / PDF / Excel (opsional, bisa lebih dari 1)">
            <NoteFileUploader />
          </Field>
          <Button type="submit" className="self-start">
            Simpan Lampiran
          </Button>
        </ActionForm>
      </Card>

      {/* Daftar lampiran */}
      <h3 className="font-display text-sm font-semibold text-espresso mb-3">Lampiran</h3>
      <Card>
        <NoteAttachments attachments={note.attachments} onDelete={deleteAttachmentWithId} />
        {note.attachments.length === 0 && (
          <p className="text-sm text-espresso-soft/70">Belum ada lampiran.</p>
        )}
      </Card>
    </div>
  );
}
