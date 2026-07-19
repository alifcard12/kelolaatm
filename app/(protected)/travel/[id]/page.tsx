import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateTravel, deleteTravel } from "../actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input, Select } from "@/components/ui/Input";
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

export default async function TravelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const travel = await prisma.travel.findUnique({ where: { id } });
  if (!travel) notFound();

  const updateTravelWithId = updateTravel.bind(null, travel.id);

  async function deleteAndRedirect() {
    "use server";
    await deleteTravel(travel!.id);
    redirect("/travel");
  }

  return (
    <div className="max-w-md">
      <Link
        href="/travel"
        className="inline-flex items-center gap-1 text-xs text-espresso-soft hover:text-rose mb-2"
      >
        <FiArrowLeft /> Back to Travel
      </Link>

      <PageHeader
        title={travel.invoiceNo}
        description=""
        action={
          <DeleteButton
            action={deleteAndRedirect}
            label={
              <div className="inline-flex items-center px-2 py-1.5 rounded-lg gap-1 bg-rose text-paper hover:bg-rose-dark active:bg-rose-dark shadow-sm shadow-rose/20">
                <FiTrash /> Hapus Travel
              </div>
            }
          />
        }
      />

      <Card>
        <ActionForm
          action={updateTravelWithId}
          successMessage="Pemesanan travel berhasil diperbarui"
          className="flex flex-col gap-1"
        >
          <Field label="No Invoice">
            <Input value={travel.invoiceNo} type="text" disabled />
          </Field>

          <Field label="Nama Pelanggan" htmlFor="customerName">
            <Input
              id="customerName"
              name="customerName"
              type="text"
              required
              defaultValue={travel.customerName}
            />
          </Field>

          <Field label="Tanggal Pesan" htmlFor="orderDate">
            <Input
              id="orderDate"
              name="orderDate"
              type="date"
              required
              defaultValue={toDateInputValue(travel.orderDate)}
            />
          </Field>

          <Field label="Tanggal Berangkat" htmlFor="departureDate">
            <Input
              id="departureDate"
              name="departureDate"
              type="date"
              required
              defaultValue={toDateInputValue(travel.departureDate)}
            />
          </Field>

          <Field label="Berangkat Dari" htmlFor="origin">
            <Input
              id="origin"
              name="origin"
              type="text"
              required
              defaultValue={travel.origin}
            />
          </Field>

          <Field label="Tujuan" htmlFor="destination">
            <Input
              id="destination"
              name="destination"
              type="text"
              required
              defaultValue={travel.destination}
            />
          </Field>

          <Field label="Nama Kendaraan" htmlFor="vehicle">
            <Select
              id="vehicle"
              name="vehicle"
              required
              defaultValue={travel.vehicle}
            >
              <option value="AVANZA">Avanza</option>
              <option value="XENIA">Xenia</option>
              <option value="SIGRA">Sigra</option>
              <option value="XPANDER">Xpander</option>
            </Select>
          </Field>

          <Field label="Harga (Rp)" htmlFor="price">
            <Input
              id="price"
              name="price"
              type="number"
              min={1}
              step={1}
              required
              defaultValue={travel.price}
            />
          </Field>

          <Field label="Jumlah Orang" htmlFor="passengerCount">
            <Input
              id="passengerCount"
              name="passengerCount"
              type="number"
              min={1}
              step={1}
              required
              defaultValue={travel.passengerCount}
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
