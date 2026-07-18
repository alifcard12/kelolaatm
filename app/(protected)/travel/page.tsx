import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteTravel } from "./actions";
import { formatJakartaDate, formatRupiah } from "@/lib/date";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { FiPlus } from "react-icons/fi";
import { TRAVEL_VEHICLE_LABEL } from "@/lib/labels";

export default async function TravelListPage() {
  const travels = await prisma.travel.findMany({ orderBy: { orderDate: "desc" } });

  return (
    <div>
      <PageHeader
        title="Travel"
        description="Data pemesanan travel. Setiap pemesanan otomatis tercatat di Keuangan Operasional."
        action={
          <LinkButton href="/travel/new">
            <FiPlus /> Tambah Pemesanan
          </LinkButton>
        }
      />

      {travels.length === 0 && (
        <EmptyState
          title="Belum ada pemesanan travel"
          description="Tambahkan pemesanan travel pertama."
          action={
            <LinkButton href="/travel/new" size="sm">
              <FiPlus /> Tambah Pemesanan
            </LinkButton>
          }
        />
      )}

      {/* Kartu — mobile */}
      <div className="flex flex-col gap-3 md:hidden">
        {travels.map((t) => (
          <Card key={t.id} className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <Link href={`/travel/${t.id}`} className="min-w-0">
                <p className="font-display font-semibold text-espresso truncate">{t.customerName}</p>
                <p className="text-xs text-espresso-soft">{t.invoiceNo}</p>
              </Link>
              <DeleteButton action={deleteTravel.bind(null, t.id)} />
            </div>
            <p className="text-sm text-espresso">
              {t.origin} → {t.destination}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-espresso-soft">
              <Badge tone="info">{TRAVEL_VEHICLE_LABEL[t.vehicle]}</Badge>
              <span>{t.passengerCount} orang</span>
              <span>Berangkat: {formatJakartaDate(t.departureDate)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-xs text-espresso-soft">Pesan: {formatJakartaDate(t.orderDate)}</span>
              <span className="font-semibold text-espresso">{formatRupiah(t.price)}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabel — desktop */}
      {travels.length > 0 && (
        <Table>
          <Thead>
            <Th>No Invoice</Th>
            <Th>Pelanggan</Th>
            <Th>Tgl Pesan</Th>
            <Th>Tgl Berangkat</Th>
            <Th>Rute</Th>
            <Th>Kendaraan</Th>
            <Th className="text-right">Orang</Th>
            <Th className="text-right">Harga</Th>
            <Th></Th>
          </Thead>
          <Tbody>
            {travels.map((t) => (
              <Tr key={t.id}>
                <Td className="font-medium whitespace-nowrap">
                  <Link href={`/travel/${t.id}`} className="hover:text-rose transition-colors">
                    {t.invoiceNo}
                  </Link>
                </Td>
                <Td>{t.customerName}</Td>
                <Td className="text-espresso-soft whitespace-nowrap">{formatJakartaDate(t.orderDate)}</Td>
                <Td className="text-espresso-soft whitespace-nowrap">
                  {formatJakartaDate(t.departureDate)}
                </Td>
                <Td className="text-espresso-soft">
                  {t.origin} → {t.destination}
                </Td>
                <Td>
                  <Badge tone="info">{TRAVEL_VEHICLE_LABEL[t.vehicle]}</Badge>
                </Td>
                <Td className="text-right">{t.passengerCount}</Td>
                <Td className="text-right font-semibold whitespace-nowrap">{formatRupiah(t.price)}</Td>
                <Td className="text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/travel/${t.id}`} className="text-xs text-espresso-soft hover:text-rose">
                      Edit
                    </Link>
                    <DeleteButton action={deleteTravel.bind(null, t.id)} />
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
