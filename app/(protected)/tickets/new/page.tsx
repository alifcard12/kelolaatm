import { prisma } from "@/lib/prisma";
import { createTicket } from "../actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Select, Textarea } from "@/components/ui/Input";
import { Button, LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ActionForm } from "@/components/ui/ActionForm";

export default async function NewTicketPage() {
  const atms = await prisma.atm.findMany({ orderBy: { tid: "asc" } });

  return (
    <div className="max-w-md">
      <PageHeader title="Buka Tiket Baru" />

      {atms.length === 0 ? (
        <EmptyState
          title="Belum ada data ATM"
          description="Tambahkan ATM dulu sebelum membuka tiket."
          action={<LinkButton href="/atm/new" size="sm">Tambah ATM</LinkButton>}
        />
      ) : (
        <Card>
          <ActionForm action={createTicket} successMessage="Tiket berhasil dibuka" className="flex flex-col gap-4">
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

            <Field label="Problem" htmlFor="problem">
              <Textarea id="problem" name="problem" rows={3} required placeholder="mis. GROUNDING TINGGI" />
            </Field>

            <Button type="submit" className="mt-2 self-start">
              Buka Tiket
            </Button>
          </ActionForm>
        </Card>
      )}
    </div>
  );
}
