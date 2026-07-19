import { createNote } from "../actions";
import { NoteFileUploader } from "@/components/NoteFileUploader";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ActionForm } from "@/components/ui/ActionForm";

export default function NewNotePage() {
  return (
    <div className="max-w-md">
      <PageHeader title="Tambah Catatan" />

      <Card>
        <ActionForm action={createNote} successMessage="Catatan berhasil ditambahkan" className="flex flex-col gap-4">
          <Field label="Judul" htmlFor="title">
            <Input id="title" name="title" type="text" required />
          </Field>

          <Field label="Kategori" htmlFor="category">
            <Select id="category" name="category" required defaultValue="MEDIUM">
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
              <option value="ARCHIVE">Archive</option>
            </Select>
          </Field>

          <Field label="Catatan (opsional)" htmlFor="content">
            <Textarea id="content" name="content" rows={4} placeholder="Catatan penting..." />
          </Field>

          <Field label="Link (opsional)" htmlFor="link">
            <Input id="link" name="link" type="url" placeholder="https://..." />
          </Field>

          <Field label="Lampiran (opsional, foto/PDF/Excel)">
            <NoteFileUploader />
          </Field>

          <Button type="submit" className="mt-2 self-start">
            Simpan
          </Button>
        </ActionForm>
      </Card>
    </div>
  );
}
