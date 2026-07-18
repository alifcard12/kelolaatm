import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateHotel, deleteHotel } from "../actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ActionForm } from "@/components/ui/ActionForm";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { FiChevronLeft } from "react-icons/fi";

function toDateInputValue(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export default async function HotelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const hotel = await prisma.hotel.findUnique({ where: { id } });
  if (!hotel) notFound();

  const updateHotelWithId = updateHotel.bind(null, hotel.id);

  async function deleteAndRedirect() {
    "use server";
    await deleteHotel(hotel!.id);
    redirect("/hotel");
  }

  return (
    <div className="max-w-md">
      <Link
        href="/hotel"
        className="inline-flex items-center gap-1 text-xs text-espresso-soft hover:text-rose mb-2"
      >
        <FiChevronLeft /> Kembali ke Hotel
      </Link>

      <PageHeader
        title={hotel.hotelName}
        description="Perubahan di sini juga akan memperbarui transaksi terkait di Keuangan Operasional."
        action={<DeleteButton action={deleteAndRedirect} label="Hapus Pemesanan" />}
      />

      <Card>
        <ActionForm
          action={updateHotelWithId}
          successMessage="Pemesanan hotel berhasil diperbarui"
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label="No Booking">
              <Input value={hotel.bookingNo} type="text" disabled />
            </Field>
            <Field label="PO Booking">
              <Input value={hotel.poBooking} type="text" disabled />
            </Field>
          </div>

          <Field label="Nama Pelanggan" htmlFor="customerName">
            <Input
              id="customerName"
              name="customerName"
              type="text"
              required
              defaultValue={hotel.customerName}
            />
          </Field>

          <Field label="Email" htmlFor="email">
            <Input id="email" name="email" type="email" required defaultValue={hotel.email} />
          </Field>

          <Field label="Telepon" htmlFor="phone">
            <Input id="phone" name="phone" type="tel" required defaultValue={hotel.phone} />
          </Field>

          <Field label="Tanggal Booking" htmlFor="bookingDate">
            <Input
              id="bookingDate"
              name="bookingDate"
              type="date"
              required
              defaultValue={toDateInputValue(hotel.bookingDate)}
            />
          </Field>

          <Field label="Tanggal Checkin" htmlFor="checkinDate">
            <Input
              id="checkinDate"
              name="checkinDate"
              type="date"
              required
              defaultValue={toDateInputValue(hotel.checkinDate)}
            />
          </Field>

          <Field label="Nama Hotel" htmlFor="hotelName">
            <Input id="hotelName" name="hotelName" type="text" required defaultValue={hotel.hotelName} />
          </Field>

          <Field label="Alamat Hotel" htmlFor="hotelAddress">
            <Input
              id="hotelAddress"
              name="hotelAddress"
              type="text"
              required
              defaultValue={hotel.hotelAddress}
            />
          </Field>

          <Field label="Tipe Kamar" htmlFor="roomType">
            <Select id="roomType" name="roomType" required defaultValue={hotel.roomType}>
              <option value="SUPER_SINGLE">Super Single</option>
              <option value="DELUXE_DOUBLE">Deluxe Double</option>
              <option value="DELUXE_TWIN">Deluxe Twin</option>
              <option value="EXECUTIVE">Executive</option>
            </Select>
          </Field>

          <Field label="Durasi (malam)" htmlFor="duration">
            <Input
              id="duration"
              name="duration"
              type="number"
              min={1}
              step={1}
              required
              defaultValue={hotel.duration}
            />
          </Field>

          <Field label="Jumlah Tamu" htmlFor="guestCount">
            <Input
              id="guestCount"
              name="guestCount"
              type="number"
              min={1}
              step={1}
              required
              defaultValue={hotel.guestCount}
            />
          </Field>

          <Field label="Harga (Rp)" htmlFor="price">
            <Input
              id="price"
              name="price"
              type="number"
              min={1}
              step={1}
              required
              defaultValue={hotel.price}
            />
          </Field>

          <Field label="Metode Pembayaran" htmlFor="paymentMethod">
            <Select id="paymentMethod" name="paymentMethod" required defaultValue={hotel.paymentMethod}>
              <option value="ALFAMART">Alfamart</option>
              <option value="BRIVA">BRIVA</option>
              <option value="INDOMARET">Indomaret</option>
              <option value="OVO">OVO</option>
              <option value="SHOPEEPAY">ShopeePay</option>
              <option value="QRIS">QRIS</option>
            </Select>
          </Field>

          <Button type="submit" className="mt-2 self-start">
            Simpan Perubahan
          </Button>
        </ActionForm>
      </Card>
    </div>
  );
}
