import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteHotel } from "./actions";
import { formatJakartaDate, formatRupiah } from "@/lib/date";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { FiPlus } from "react-icons/fi";
import {
  HOTEL_ROOM_TYPE_LABEL,
  HOTEL_PAYMENT_METHOD_LABEL,
} from "@/lib/labels";

export default async function HotelListPage() {
  const hotels = await prisma.hotel.findMany({
    orderBy: { bookingDate: "desc" },
  });

  return (
    <div>
      <PageHeader
        title=""
        description=""
        action={
          <LinkButton href="/hotel/new">
            <FiPlus /> Tambah Pemesanan
          </LinkButton>
        }
      />

      {hotels.length === 0 && (
        <EmptyState
          title="Belum ada pemesanan hotel"
          description="Tambahkan pemesanan hotel pertama."
          action={
            <LinkButton href="/hotel/new" size="sm">
              <FiPlus /> Tambah Pemesanan
            </LinkButton>
          }
        />
      )}

      {/* Kartu — mobile */}
      <div className="flex flex-col gap-3 md:hidden">
        {hotels.map((h) => (
          <Card key={h.id} className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <Link href={`/hotel/${h.id}`} className="min-w-0">
                <p className="font-display font-semibold text-espresso truncate">
                  {h.hotelName}
                </p>
                <p className="text-xs text-espresso-soft">{h.customerName}</p>
              </Link>
              <DeleteButton action={deleteHotel.bind(null, h.id)} />
            </div>
            <p className="text-xs text-espresso-soft truncate">
              {h.hotelAddress}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-espresso-soft">
              <Badge tone="info">{HOTEL_ROOM_TYPE_LABEL[h.roomType]}</Badge>
              <span>{h.duration} malam</span>
              <span>{h.guestCount} tamu</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-espresso-soft">
              <span>Booking: {formatJakartaDate(h.bookingDate)}</span>
              <span>Checkin: {formatJakartaDate(h.checkinDate)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <Badge tone="neutral">
                {HOTEL_PAYMENT_METHOD_LABEL[h.paymentMethod]}
              </Badge>
              <span className="font-semibold text-espresso">
                {formatRupiah(h.price)}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabel — desktop */}
      {hotels.length > 0 && (
        <Table>
          <Thead>
            <Th>No Booking</Th>
            <Th>Pelanggan</Th>
            <Th>Hotel</Th>
            <Th>Tgl Booking</Th>
            <Th>Tgl Checkin</Th>
            <Th>Tipe Kamar</Th>
            <Th className="text-right">Malam</Th>
            <Th className="text-right">Tamu</Th>
            <Th>Pembayaran</Th>
            <Th className="text-right">Harga</Th>
            <Th></Th>
          </Thead>
          <Tbody>
            {hotels.map((h) => (
              <Tr key={h.id}>
                <Td className="font-medium whitespace-nowrap">
                  <Link
                    href={`/hotel/${h.id}`}
                    className="hover:text-rose transition-colors"
                  >
                    {h.bookingNo}
                  </Link>
                </Td>
                <Td>{h.customerName}</Td>
                <Td className="text-espresso-soft">{h.hotelName}</Td>
                <Td className="text-espresso-soft whitespace-nowrap">
                  {formatJakartaDate(h.bookingDate)}
                </Td>
                <Td className="text-espresso-soft whitespace-nowrap">
                  {formatJakartaDate(h.checkinDate)}
                </Td>
                <Td>
                  <Badge tone="info">{HOTEL_ROOM_TYPE_LABEL[h.roomType]}</Badge>
                </Td>
                <Td className="text-right">{h.duration}</Td>
                <Td className="text-right">{h.guestCount}</Td>
                <Td className="text-espresso-soft whitespace-nowrap">
                  {HOTEL_PAYMENT_METHOD_LABEL[h.paymentMethod]}
                </Td>
                <Td className="text-right font-semibold whitespace-nowrap">
                  {formatRupiah(h.price)}
                </Td>
                <Td className="text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/hotel/${h.id}`}
                      className="text-xs text-espresso-soft hover:text-rose"
                    >
                      Edit
                    </Link>
                    <DeleteButton action={deleteHotel.bind(null, h.id)} />
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
