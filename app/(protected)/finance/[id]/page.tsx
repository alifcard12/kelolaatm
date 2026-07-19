import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateFinanceEntry, deleteFinanceEntry } from "../actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ActionForm } from "@/components/ui/ActionForm";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { FiArrowLeft, FiSave, FiTrash } from "react-icons/fi";

function toDateInputValue(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export default async function FinanceEntryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const entry = await prisma.financeEntry.findUnique({ where: { id } });
  if (!entry) notFound();

  const updateFinanceEntryWithId = updateFinanceEntry.bind(null, entry.id);

  async function deleteAndRedirect() {
    "use server";
    await deleteFinanceEntry(entry!.id);
    redirect("/finance");
  }

  return (
    <div className="max-w-md">
      <Link
        href="/finance"
        className="inline-flex items-center gap-1 text-xs text-espresso-soft hover:text-rose mb-2"
      >
        <FiArrowLeft /> Back to Keuangan
      </Link>

      <PageHeader
        title="Edit Transaksi"
        action={
          <DeleteButton
            action={deleteAndRedirect}
            label={
              <div className="inline-flex items-center px-2 py-1.5 rounded-lg gap-1 bg-rose text-paper hover:bg-rose-dark active:bg-rose-dark shadow-sm shadow-rose/20">
                <FiTrash /> Hapus Transaksi
              </div>
            }
          />
        }
      />

      <Card>
        <ActionForm
          action={updateFinanceEntryWithId}
          successMessage="Transaksi berhasil diperbarui"
          className="flex flex-col gap-4"
        >
          <Field label="Tanggal" htmlFor="date">
            <Input
              id="date"
              name="date"
              type="date"
              required
              defaultValue={toDateInputValue(entry.date)}
            />
          </Field>

          <Field label="Deskripsi" htmlFor="description">
            <Input
              id="description"
              name="description"
              type="text"
              required
              defaultValue={entry.description}
            />
          </Field>

          <Field label="Tipe Transaksi" htmlFor="type">
            <Select id="type" name="type" required defaultValue={entry.type}>
              <option value="DEBIT">Debit (Uang Keluar)</option>
              <option value="CREDIT">Credit (Uang Masuk)</option>
            </Select>
          </Field>

          <Field label="Jumlah (Rp)" htmlFor="amount">
            <Input
              id="amount"
              name="amount"
              type="number"
              min={1}
              step={1}
              required
              defaultValue={entry.amount}
            />
          </Field>

          <Field label="Kategori" htmlFor="category">
            <Select
              id="category"
              name="category"
              required
              defaultValue={entry.category}
            >
              <option value="KETERANGAN">Keterangan</option>
              <option value="TRANSPORTASI">Transportasi</option>
              <option value="SPJ">SPJ</option>
              <option value="HOTEL">Hotel</option>
              <option value="PENGIRIMAN">Pengiriman</option>
              <option value="OPERASIONAL">Operasional</option>
            </Select>
          </Field>

          <Field label="Catatan (opsional)" htmlFor="notes">
            <Textarea
              id="notes"
              name="notes"
              rows={2}
              defaultValue={entry.notes ?? ""}
            />
          </Field>

          <Button variant="success" type="submit" className="mt-2 self-start">
            <FiSave />
            Simpan
          </Button>
        </ActionForm>
      </Card>
    </div>
  );
}
