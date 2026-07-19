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
              <option value="GOOD">Good</option>
              <option value="BAD">Bad</option>
              <option value="BROKEN">Broken</option>
              <option value="SCRAP">Scrap</option>
            </Select>
          </Field>

          <Field label="Problem (opsional)" htmlFor="problem">
            <Textarea id="problem" name="problem" rows={3} />
          </Field>

          <Field label="Action (opsional)" htmlFor="action">
            <Input id="action" name="action" type="text" />
          </Field>

          <Field label="Notes (opsional)" htmlFor="notes">
            <Textarea id="notes" name="notes" rows={2} />
          </Field>

          <Field label="Ganti Part (opsional)" htmlFor="gantiPart">
            <Select id="gantiPart" name="gantiPart" defaultValue="">
              <option value="">Tidak ada</option>
              <option value="STOCK">Stock</option>
              <option value="SCRAP">Scrap</option>
            </Select>
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
