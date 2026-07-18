import { createFinanceEntry } from "../actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ActionForm } from "@/components/ui/ActionForm";

function todayJakarta(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default function NewFinanceEntryPage() {
  return (
    <div className="max-w-md">
      <PageHeader title="Tambah Transaksi" description="Catat uang masuk atau keluar operasional." />

      <Card>
        <ActionForm
          action={createFinanceEntry}
          successMessage="Transaksi berhasil ditambahkan"
          className="flex flex-col gap-4"
        >
          <Field label="Tanggal" htmlFor="date">
            <Input id="date" name="date" type="date" required defaultValue={todayJakarta()} />
          </Field>

          <Field label="Deskripsi" htmlFor="description">
            <Input
              id="description"
              name="description"
              type="text"
              required
              placeholder="mis. Isi bensin motor teknisi"
            />
          </Field>

          <Field label="Tipe Transaksi" htmlFor="type">
            <Select id="type" name="type" required defaultValue="DEBIT">
              <option value="DEBIT">Debit (Uang Keluar)</option>
              <option value="CREDIT">Credit (Uang Masuk)</option>
            </Select>
          </Field>

          <Field label="Jumlah (Rp)" htmlFor="amount">
            <Input id="amount" name="amount" type="number" min={1} step={1} required placeholder="0" />
          </Field>

          <Field label="Kategori" htmlFor="category">
            <Select id="category" name="category" required defaultValue="OPERASIONAL">
              <option value="KETERANGAN">Keterangan</option>
              <option value="TRANSPORTASI">Transportasi</option>
              <option value="SPJ">SPJ</option>
              <option value="HOTEL">Hotel</option>
              <option value="PENGIRIMAN">Pengiriman</option>
              <option value="OPERASIONAL">Operasional</option>
            </Select>
          </Field>

          <Field label="Catatan (opsional)" htmlFor="notes">
            <Textarea id="notes" name="notes" rows={2} placeholder="Catatan tambahan" />
          </Field>

          <Button type="submit" className="mt-2 self-start">
            Simpan
          </Button>
        </ActionForm>
      </Card>
    </div>
  );
}
