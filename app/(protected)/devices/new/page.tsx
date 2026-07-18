import { prisma } from "@/lib/prisma";
import { createDevice } from "../actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button, LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ActionForm } from "@/components/ui/ActionForm";

export default async function NewDevicePage() {
  const atms = await prisma.atm.findMany({ orderBy: { tid: "asc" } });

  return (
    <div className="max-w-md">
      <PageHeader title="Tambah Perangkat" />

      {atms.length === 0 ? (
        <EmptyState
          title="Belum ada data ATM"
          description="Tambahkan ATM dulu sebelum menambah perangkat."
          action={<LinkButton href="/atm/new" size="sm">Tambah ATM</LinkButton>}
        />
      ) : (
        <Card>
          <ActionForm action={createDevice} successMessage="Perangkat berhasil ditambahkan" className="flex flex-col gap-4">
            <Field label="ATM" htmlFor="atmId">
              <Select id="atmId" name="atmId" required defaultValue="">
                <option value="" disabled>
                  Pilih ATM
                </option>
                {atms.map((atm) => (
                  <option key={atm.id} value={atm.id}>
                    {atm.tid} — {atm.location}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Tipe Perangkat" htmlFor="type">
              <Select id="type" name="type" required defaultValue="NVR">
                <option value="NVR">NVR</option>
                <option value="MONITOR">Monitor</option>
                <option value="CCTV">CCTV</option>
                <option value="UPS">UPS</option>
              </Select>
            </Field>

            <Field label="Brand" htmlFor="brand">
              <Input id="brand" name="brand" type="text" required placeholder="mis. Hikvision, APC, Samsung" />
            </Field>

            <Field label="Serial Number" htmlFor="serialNumber">
              <Input id="serialNumber" name="serialNumber" type="text" required />
            </Field>

            <Field label="Kondisi" htmlFor="condition">
              <Select id="condition" name="condition" required defaultValue="GOOD">
                <option value="GOOD">Baik</option>
                <option value="DAMAGED">Rusak</option>
                <option value="NEEDS_REPLACEMENT">Perlu Ganti</option>
              </Select>
            </Field>

            <Field label="Catatan (opsional)" htmlFor="note">
              <Textarea id="note" name="note" rows={3} />
            </Field>

            <Button type="submit" className="mt-2 self-start">
              Simpan
            </Button>
          </ActionForm>
        </Card>
      )}
    </div>
  );
}
