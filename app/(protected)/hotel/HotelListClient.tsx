"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatJakartaDate, formatRupiah } from "@/lib/date";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { HOTEL_ROOM_TYPE_LABEL, HOTEL_PAYMENT_METHOD_LABEL } from "@/lib/labels";
import {
  FiSearch,
  FiCalendar,
  FiDollarSign,
  FiArrowUp,
  FiArrowDown,
  FiMoreVertical,
  FiTrash2,
} from "react-icons/fi";

type HotelRow = {
  id: string;
  bookingNo: string;
  customerName: string;
  hotelName: string;
  hotelAddress: string;
  bookingDate: Date;
  checkinDate: Date;
  roomType: string;
  duration: number;
  guestCount: number;
  price: number;
  paymentMethod: string;
};

type SortField = "checkinDate" | "price";
type SortDir = "asc" | "desc";

// Palet warna tetap (bukan class Tailwind dinamis) supaya tidak kena purge,
// dan tetap selaras dengan tone palet utama aplikasi.
const HOTEL_PALETTE: { bg: string; text: string }[] = [
  { bg: "#f1dfe3", text: "#8f3f53" }, // rose
  { bg: "#e4ebf0", text: "#47607a" }, // biru
  { bg: "#e2ece2", text: "#3f6b4e" }, // hijau
  { bg: "#f3e6d2", text: "#9c6b2e" }, // amber
  { bg: "#e8e1f5", text: "#6b4f9c" }, // ungu
  { bg: "#dcf0ee", text: "#2f7a70" }, // teal
  { bg: "#fbe3ee", text: "#a13d73" }, // pink
  { bg: "#e1e6f5", text: "#4a5a9c" }, // indigo
];

function hotelStyle(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return HOTEL_PALETTE[hash % HOTEL_PALETTE.length];
}

function SortToggle({
  active,
  dir,
  icon,
  tooltip,
  onClick,
}: {
  active: boolean;
  dir: SortDir;
  icon: React.ReactNode;
  tooltip: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={tooltip}
      aria-label={tooltip}
      onClick={onClick}
      className={`flex h-9 items-center gap-1 rounded-xl border px-2.5 transition-colors ${
        active
          ? "border-rose bg-rose-soft text-rose-dark"
          : "border-taupe-dark/60 bg-paper text-espresso-soft hover:border-rose/50"
      }`}
    >
      {icon}
      {active ? (
        dir === "asc" ? (
          <FiArrowUp className="h-3.5 w-3.5" />
        ) : (
          <FiArrowDown className="h-3.5 w-3.5" />
        )
      ) : (
        <FiArrowUp className="h-3.5 w-3.5 opacity-30" />
      )}
    </button>
  );
}

function RowMenu({ onDelete }: { onDelete: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        aria-label="Menu"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="flex h-7 w-7 items-center justify-center rounded-full text-espresso-soft hover:bg-cream transition-colors"
      >
        <FiMoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
            }}
          />
          <div className="absolute right-0 top-full z-20 mt-1 rounded-xl border border-taupe/70 bg-paper shadow-[var(--shadow-pop)] p-1">
            <DeleteButton
              action={async () => onDelete()}
              label={<FiTrash2 className="h-4 w-4" />}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger-soft transition-colors disabled:opacity-50"
            />
          </div>
        </>
      )}
    </div>
  );
}

export function HotelListClient({
  hotels,
  onDelete,
}: {
  hotels: HotelRow[];
  onDelete: (id: string) => Promise<void>;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("checkinDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = hotels;
    if (q) {
      rows = hotels.filter((h) =>
        [h.bookingNo, h.customerName, h.hotelName, h.hotelAddress].some(
          (field) => field.toLowerCase().includes(q),
        ),
      );
    }
    const sorted = [...rows].sort((a, b) => {
      const cmp =
        sortField === "price"
          ? a.price - b.price
          : a.checkinDate.getTime() - b.checkinDate.getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [hotels, query, sortField, sortDir]);

  function goToDetail(id: string) {
    router.push(`/hotel/${id}`);
  }

  return (
    <div>
      <div className="mb-4 flex gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-espresso-soft/60" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari no. booking, pelanggan, atau hotel..."
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <SortToggle
            active={sortField === "checkinDate"}
            dir={sortDir}
            icon={<FiCalendar className="h-4 w-4" />}
            tooltip="Urutkan berdasarkan Tgl Checkin"
            onClick={() => toggleSort("checkinDate")}
          />
          <SortToggle
            active={sortField === "price"}
            dir={sortDir}
            icon={<FiDollarSign className="h-4 w-4" />}
            tooltip="Urutkan berdasarkan Harga"
            onClick={() => toggleSort("price")}
          />
        </div>
      </div>

      {hotels.length === 0 ? (
        <EmptyState
          title="Belum ada pemesanan hotel"
          description="Tambahkan pemesanan hotel pertama."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Tidak ditemukan"
          description="Tidak ada pemesanan yang cocok dengan pencarian tersebut."
        />
      ) : (
        <>
          {/* Kartu — mobile */}
          <div className="flex flex-col gap-1 md:hidden">
            {filtered.map((h) => {
              const style = hotelStyle(h.hotelName);
              return (
                <Card
                  key={h.id}
                  className="flex flex-col border-l-4 cursor-pointer active:opacity-80"
                  style={{ borderLeftColor: style.text }}
                  onClick={() => goToDetail(h.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex items-center">
                      <p className="font-display text-sm font-semibold text-espresso truncate">
                        {h.hotelName}
                      </p>
                    </div>
                    <RowMenu onDelete={() => onDelete(h.id)} />
                  </div>
                  <p className="text-xs text-espresso-soft">{h.customerName}</p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-espresso-soft">
                    <Badge tone="info">{HOTEL_ROOM_TYPE_LABEL[h.roomType]}</Badge>
                    <span>{h.duration} malam</span>
                    <span>{h.guestCount} tamu</span>
                    <span className="flex items-center gap-1">
                      <FiCalendar />
                      {formatJakartaDate(h.checkinDate)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <Badge tone="neutral">
                      {HOTEL_PAYMENT_METHOD_LABEL[h.paymentMethod]}
                    </Badge>
                    <span className="font-semibold text-espresso">
                      {formatRupiah(h.price)}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Tabel — desktop */}
          <Table>
            <Thead>
              <Th>No Booking</Th>
              <Th>Pelanggan</Th>
              <Th>Hotel</Th>
              <Th>Tgl Checkin</Th>
              <Th>Tipe Kamar</Th>
              <Th className="text-right">Malam</Th>
              <Th className="text-right">Tamu</Th>
              <Th>Pembayaran</Th>
              <Th className="text-right">Harga</Th>
              <Th></Th>
            </Thead>
            <Tbody>
              {filtered.map((h) => {
                const style = hotelStyle(h.hotelName);
                return (
                  <Tr
                    key={h.id}
                    className="cursor-pointer"
                    style={{ boxShadow: `inset 3px 0 0 0 ${style.text}` }}
                    onClick={() => goToDetail(h.id)}
                  >
                    <Td className="font-medium whitespace-nowrap">{h.bookingNo}</Td>
                    <Td>{h.customerName}</Td>
                    <Td className="text-espresso-soft">{h.hotelName}</Td>
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
                      <div className="flex items-center justify-end">
                        <RowMenu onDelete={() => onDelete(h.id)} />
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </>
      )}
    </div>
  );
}
