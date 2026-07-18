import { prisma } from "@/lib/prisma";
import { createVisit } from "../actions";
import VisitTypeFields from "../VisitTypeFields";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button, LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ActionForm } from "@/components/ui/ActionForm";

// Nilai default untuk <input type="datetime-local">, mengikuti waktu Jakarta (WIB, UTC+7)
function defaultDatetimeLocalValue(date: Date): string {
  const jakarta = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return jakarta.toISOString().slice(0, 16);
}

export default async function NewVisitPage() {
  const atms = await prisma.atm.findMany({ orderBy: { tid: "asc" } });

  return (
    <div className="max-w-md">
      <PageHeader title="Tambah Jadwal Kunjungan (PM)" />

      {atms.length === 0 ? (
        <EmptyState
          title="Belum ada data ATM"
          description="Tambahkan ATM dulu sebelum mencatat kunjungan."
          action={<LinkButton href="/atm/new" size="sm">Tambah ATM</LinkButton>}
        />
      ) : (
        <Card>
          <ActionForm action={createVisit} successMessage="Kunjungan berhasil dicatat" className="flex flex-col gap-4">
            <Field
              label="ATM"
              htmlFor="atmId"
              hint="Lokasi, kanca, TID, dan SSB otomatis diambil dari data ATM ini."
            >
              <Select id="atmId" name="atmId" required defaultValue="">
                <option value="" disabled>
                  Pilih ATM
                </option>
                {atms.map((atm) => (
                  <option key={atm.id} value={atm.id}>
                    {atm.tid} — {atm.location} ({atm.branch})
                  </option>
                ))}
              </Select>
            </Field>

            <VisitTypeFields />

            <Field label="Tanggal & Waktu Kunjungan" htmlFor="visitDate">
              <Input
                id="visitDate"
                name="visitDate"
                type="datetime-local"
                required
                defaultValue={defaultDatetimeLocalValue(new Date())}
              />
            </Field>

            <Field label="Keterangan (opsional)" htmlFor="keterangan">
              <Textarea
                id="keterangan"
                name="keterangan"
                rows={3}
                placeholder="mis. Cek fisik mesin, bersih-bersih kaset, cek grounding"
              />
            </Field>

            <Field
              label="URL Foto (opsional)"
              htmlFor="photoUrl"
              hint="Sementara tempel link foto (mis. dari Cloudinary/Google Drive). Upload langsung bisa menyusul."
            >
              <Input id="photoUrl" name="photoUrl" type="url" placeholder="https://..." />
            </Field>

            <Button type="submit" className="mt-2 self-start">
              Simpan Kunjungan
            </Button>
          </ActionForm>
        </Card>
      )}
    </div>
  );
}
