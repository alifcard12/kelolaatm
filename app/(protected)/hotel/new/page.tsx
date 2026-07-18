import { createHotel } from "../actions";
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

export default function NewHotelPage() {
  const today = todayJakarta();

  return (
    <div className="max-w-md">
      <PageHeader
        title="Tambah Pemesanan Hotel"
        description="No. Booking & PO Booking dibuat otomatis. Pemesanan ini akan otomatis tercatat sebagai transaksi debit di Keuangan Operasional."
      />

      <Card>
        <ActionForm
          action={createHotel}
          successMessage="Pemesanan hotel berhasil ditambahkan"
          className="flex flex-col gap-4"
        >
          <Field label="Nama Pelanggan" htmlFor="customerName">
            <Input id="customerName" name="customerName" type="text" required />
          </Field>

          <Field label="Email" htmlFor="email">
            <Input id="email" name="email" type="email" required />
          </Field>

          <Field label="Telepon" htmlFor="phone">
            <Input id="phone" name="phone" type="tel" required placeholder="mis. 081234567890" />
          </Field>

          <Field label="Tanggal Booking" htmlFor="bookingDate">
            <Input id="bookingDate" name="bookingDate" type="date" required defaultValue={today} />
          </Field>

          <Field label="Tanggal Checkin" htmlFor="checkinDate">
            <Input id="checkinDate" name="checkinDate" type="date" required defaultValue={today} />
          </Field>

          <Field label="Nama Hotel" htmlFor="hotelName">
            <Input id="hotelName" name="hotelName" type="text" required />
          </Field>

          <Field label="Alamat Hotel" htmlFor="hotelAddress">
            <Input id="hotelAddress" name="hotelAddress" type="text" required />
          </Field>

          <Field label="Tipe Kamar" htmlFor="roomType">
            <Select id="roomType" name="roomType" required defaultValue="SUPER_SINGLE">
              <option value="SUPER_SINGLE">Super Single</option>
              <option value="DELUXE_DOUBLE">Deluxe Double</option>
              <option value="DELUXE_TWIN">Deluxe Twin</option>
              <option value="EXECUTIVE">Executive</option>
            </Select>
          </Field>

          <Field label="Durasi (malam)" htmlFor="duration">
            <Input id="duration" name="duration" type="number" min={1} step={1} required placeholder="0" />
          </Field>

          <Field label="Jumlah Tamu" htmlFor="guestCount">
            <Input
              id="guestCount"
              name="guestCount"
              type="number"
              min={1}
              step={1}
              required
              placeholder="0"
            />
          </Field>

          <Field label="Harga (Rp)" htmlFor="price">
            <Input id="price" name="price" type="number" min={1} step={1} required placeholder="0" />
          </Field>

          <Field label="Metode Pembayaran" htmlFor="paymentMethod">
            <Select id="paymentMethod" name="paymentMethod" required defaultValue="QRIS">
              <option value="ALFAMART">Alfamart</option>
              <option value="BRIVA">BRIVA</option>
              <option value="INDOMARET">Indomaret</option>
              <option value="OVO">OVO</option>
              <option value="SHOPEEPAY">ShopeePay</option>
              <option value="QRIS">QRIS</option>
            </Select>
          </Field>

          <Button type="submit" className="mt-2 self-start">
            Simpan
          </Button>
        </ActionForm>
      </Card>
    </div>
  );
}
