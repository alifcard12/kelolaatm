import { createKaset } from "../actions";
import { PhotoUploader } from "@/components/PhotoUploader";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ActionForm } from "@/components/ui/ActionForm";

export default function NewKasetPage() {
  return (
    <div className="max-w-md">
      <PageHeader title="Tambah Kaset" />

      <Card>
        <ActionForm action={createKaset} successMessage="Kaset berhasil ditambahkan" className="flex flex-col gap-4">
          <Field label="Serial Number (SN)" htmlFor="serialNumber">
            <Input id="serialNumber" name="serialNumber" type="text" required />
          </Field>

          <Field label="Tipe Kaset" htmlFor="type">
            <Select id="type" name="type" required defaultValue="ALL_IN">
              <option value="ALL_IN">All in One</option>
              <option value="CURRENCY">Currency</option>
            </Select>
          </Field>

          <Field label="Kondisi Awal" htmlFor="condition">
            <Select id="condition" name="condition" required defaultValue="GOOD">
              <option value="GOOD">Baik</option>
              <option value="DAMAGED">Rusak</option>
              <option value="NEEDS_REPLACEMENT">Perlu Ganti</option>
            </Select>
          </Field>

          <Field label="Problem (opsional)" htmlFor="problem">
            <Textarea id="problem" name="problem" rows={3} />
          </Field>

          <Field label="Foto (opsional, bisa lebih dari 1)">
            <PhotoUploader />
          </Field>

          <Button type="submit" className="mt-2 self-start">
            Simpan
          </Button>
        </ActionForm>
      </Card>
    </div>
  );
}
