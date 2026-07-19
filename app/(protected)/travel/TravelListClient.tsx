"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatJakartaDate, formatRupiah } from "@/lib/date";
import { TRAVEL_VEHICLE_LABEL } from "@/lib/labels";
import {
  FiSearch,
  FiTruck,
  FiCalendar,
  FiArrowUp,
  FiArrowDown,
  FiMoreVertical,
  FiTrash2,
  FiPrinter,
} from "react-icons/fi";

type TravelRow = {
  id: string;
  invoiceNo: string;
  customerName: string;
  origin: string;
  destination: string;
  vehicle: string;
  passengerCount: number;
  price: number;
  orderDate: Date;
  departureDate: Date;
};

type SortField = "vehicle" | "date";
type SortDir = "asc" | "desc";

// Warna tetap per jenis kendaraan (bukan class Tailwind dinamis), supaya konsisten & tidak kena purge.
const VEHICLE_COLOR: Record<string, string> = {
  AVANZA: "#47607a", // biru
  XENIA: "#3f6b4e", // hijau
  SIGRA: "#9c6b2e", // amber
  XPANDER: "#6b4f9c", // ungu
};

function vehicleColor(vehicle: string) {
  return VEHICLE_COLOR[vehicle] ?? "var(--color-info)";
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

function RowMenu({ id, onDelete }: { id: string; onDelete: () => void }) {
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
          <div className="absolute right-0 top-full z-20 mt-1 flex rounded-xl border border-taupe/70 bg-paper shadow-[var(--shadow-pop)] p-1 gap-1">
            <a
              href={`/travel/print?ids=${id}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Cetak / Export PDF"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-espresso-soft hover:bg-taupe/40 transition-colors"
            >
              <FiPrinter className="h-4 w-4" />
            </a>
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

export function TravelListClient({
  travels,
  onDelete,
}: {
  travels: TravelRow[];
  onDelete: (id: string) => Promise<void>;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAllFiltered() {
    setSelected((prev) => {
      const allSelected = filtered.every((t) => prev.has(t.id));
      if (allSelected) {
        const next = new Set(prev);
        filtered.forEach((t) => next.delete(t.id));
        return next;
      }
      const next = new Set(prev);
      filtered.forEach((t) => next.add(t.id));
      return next;
    });
  }

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "date" ? "desc" : "asc");
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = travels;
    if (q) {
      rows = travels.filter((t) =>
        [t.invoiceNo, t.customerName, t.origin, t.destination].some((field) =>
          field.toLowerCase().includes(q),
        ),
      );
    }
    const sorted = [...rows].sort((a, b) => {
      let cmp =
        sortField === "date"
          ? a.departureDate.getTime() - b.departureDate.getTime()
          : a.vehicle.localeCompare(b.vehicle, "id");
      if (cmp === 0 && sortField === "vehicle") {
        cmp = b.departureDate.getTime() - a.departureDate.getTime();
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [travels, query, sortField, sortDir]);

  function goToDetail(id: string) {
    router.push(`/travel/${id}`);
  }

  return (
    <div>
      <div className="mb-4 flex gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-espresso-soft/60" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari no invoice, pelanggan, asal, atau tujuan..."
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <SortToggle
            active={sortField === "vehicle"}
            dir={sortDir}
            icon={<FiTruck className="h-4 w-4" />}
            tooltip="Urutkan berdasarkan Kendaraan"
            onClick={() => toggleSort("vehicle")}
          />
          <SortToggle
            active={sortField === "date"}
            dir={sortDir}
            icon={<FiCalendar className="h-4 w-4" />}
            tooltip="Urutkan berdasarkan Tanggal Berangkat"
            onClick={() => toggleSort("date")}
          />
        </div>
      </div>

      {selected.size > 0 && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-taupe-dark/60 bg-cream px-4 py-2.5">
          <span className="text-sm font-semibold text-espresso">
            {selected.size} dipilih
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-xs font-semibold text-espresso-soft hover:text-espresso transition-colors"
            >
              Batal
            </button>
            <a
              href={`/travel/print?ids=${Array.from(selected).join(",")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-espresso text-paper text-xs font-semibold px-3 py-2 hover:bg-espresso/90 transition-colors"
            >
              <FiPrinter className="h-3.5 w-3.5" /> Cetak Terpilih
            </a>
          </div>
        </div>
      )}

      {travels.length === 0 ? (
        <EmptyState
          title="Belum ada pemesanan travel"
          description="Tambahkan pemesanan travel pertama."
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
            {filtered.map((t) => (
              <Card
                key={t.id}
                className="flex flex-col border-l-4 cursor-pointer active:opacity-80"
                style={{ borderLeftColor: vehicleColor(t.vehicle) }}
                onClick={() => goToDetail(t.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 min-w-0">
                    <input
                      type="checkbox"
                      checked={selected.has(t.id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleSelect(t.id)}
                      className="mt-1 h-4 w-4 shrink-0 accent-espresso"
                    />
                    <div className="min-w-0">
                      <p className="font-display text-sm font-semibold text-espresso truncate">
                        {t.customerName}
                      </p>
                      <p className="text-xs text-espresso-soft">{t.invoiceNo}</p>
                    </div>
                  </div>
                  <RowMenu id={t.id} onDelete={() => onDelete(t.id)} />
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
          <Table>
            <Thead>
              <Th className="w-8">
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && filtered.every((t) => selected.has(t.id))}
                  onChange={toggleSelectAllFiltered}
                  className="h-4 w-4 accent-espresso"
                />
              </Th>
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
              {filtered.map((t) => (
                <Tr
                  key={t.id}
                  className="cursor-pointer"
                  style={{ boxShadow: `inset 3px 0 0 0 ${vehicleColor(t.vehicle)}` }}
                  onClick={() => goToDetail(t.id)}
                >
                  <Td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.has(t.id)}
                      onChange={() => toggleSelect(t.id)}
                      className="h-4 w-4 accent-espresso"
                    />
                  </Td>
                  <Td className="font-medium whitespace-nowrap">{t.invoiceNo}</Td>
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
                    <div className="flex items-center justify-end">
                      <RowMenu id={t.id} onDelete={() => onDelete(t.id)} />
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </>
      )}
    </div>
  );
}
