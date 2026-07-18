import { createTravel } from "../actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input, Select } from "@/components/ui/Input";
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

export default function NewTravelPage() {
  const today = todayJakarta();

  return (
    <div className="max-w-md">
      <PageHeader
        title="Tambah Pemesanan Travel"
        description="No. invoice dibuat otomatis. Pemesanan ini akan otomatis tercatat sebagai transaksi debit di Keuangan Operasional."
      />

      <Card>
        <ActionForm
          action={createTravel}
          successMessage="Pemesanan travel berhasil ditambahkan"
          className="flex flex-col gap-4"
        >
          <Field label="Nama Pelanggan" htmlFor="customerName">
            <Input id="customerName" name="customerName" type="text" required />
          </Field>

          <Field label="Tanggal Pesan" htmlFor="orderDate">
            <Input id="orderDate" name="orderDate" type="date" required defaultValue={today} />
          </Field>

          <Field label="Tanggal Berangkat" htmlFor="departureDate">
            <Input id="departureDate" name="departureDate" type="date" required defaultValue={today} />
          </Field>

          <Field label="Berangkat Dari" htmlFor="origin">
            <Input id="origin" name="origin" type="text" required placeholder="mis. Malang" />
          </Field>

          <Field label="Tujuan" htmlFor="destination">
            <Input id="destination" name="destination" type="text" required placeholder="mis. Surabaya" />
          </Field>

          <Field label="Nama Kendaraan" htmlFor="vehicle">
            <Select id="vehicle" name="vehicle" required defaultValue="AVANZA">
              <option value="AVANZA">Avanza</option>
              <option value="XENIA">Xenia</option>
              <option value="SIGRA">Sigra</option>
              <option value="XPANDER">Xpander</option>
            </Select>
          </Field>

          <Field label="Harga (Rp)" htmlFor="price">
            <Input id="price" name="price" type="number" min={1} step={1} required placeholder="0" />
          </Field>

          <Field label="Jumlah Orang" htmlFor="passengerCount">
            <Input
              id="passengerCount"
              name="passengerCount"
              type="number"
              min={1}
              step={1}
              required
              placeholder="0"
            />
          </Field>

          <Button type="submit" className="mt-2 self-start">
            Simpan
          </Button>
        </ActionForm>
      </Card>
    </div>
  );
}
