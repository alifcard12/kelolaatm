"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatJakartaDateTime, formatRelativeTime } from "@/lib/date";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { CONDITION_LABEL, CONDITION_TONE } from "@/lib/labels";
import {
  FiSearch,
  FiHardDrive,
  FiHash,
  FiArrowUp,
  FiArrowDown,
  FiMoreVertical,
  FiTrash2,
  FiClock,
  FiHome,
} from "react-icons/fi";

type DeviceRow = {
  id: string;
  type: string;
  brand: string;
  serialNumber: string;
  condition: string;
  updatedAt: Date;
  atm: { id: string; tid: number; location: string };
};

type SortField = "type" | "tid";
type SortDir = "asc" | "desc";

// Warna tetap per kondisi (pakai token warna semantik yang sama dengan Badge),
// bukan class Tailwind dinamis, supaya tidak kena purge dan konsisten dengan tema.
const CONDITION_COLOR: Record<string, string> = {
  GOOD: "var(--color-success)",
  DAMAGED: "var(--color-danger)",
  NEEDS_REPLACEMENT: "var(--color-warning)",
};

function conditionColor(condition: string) {
  return CONDITION_COLOR[condition] ?? "var(--color-info)";
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

export function DeviceListClient({
  devices,
  onDelete,
}: {
  devices: DeviceRow[];
  onDelete: (id: string) => Promise<void>;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("type");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

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
    let rows = devices;
    if (q) {
      rows = devices.filter((d) =>
        [
          d.type,
          d.brand,
          d.serialNumber,
          String(d.atm.tid),
          d.atm.location,
        ].some((field) => field.toLowerCase().includes(q)),
      );
    }
    const sorted = [...rows].sort((a, b) => {
      let cmp =
        sortField === "tid"
          ? a.atm.tid - b.atm.tid
          : a.type.localeCompare(b.type, "id");
      if (cmp === 0 && sortField === "type") cmp = a.atm.tid - b.atm.tid;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [devices, query, sortField, sortDir]);

  function goToDetail(id: string) {
    router.push(`/devices/${id}`);
  }

  return (
    <div>
      <div className="mb-4 flex gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-espresso-soft/60" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari tipe, brand, SN, TID, atau lokasi..."
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <SortToggle
            active={sortField === "type"}
            dir={sortDir}
            icon={<FiHardDrive className="h-4 w-4" />}
            tooltip="Urutkan berdasarkan Tipe"
            onClick={() => toggleSort("type")}
          />
          <SortToggle
            active={sortField === "tid"}
            dir={sortDir}
            icon={<FiHash className="h-4 w-4" />}
            tooltip="Urutkan berdasarkan TID ATM"
            onClick={() => toggleSort("tid")}
          />
        </div>
      </div>

      {devices.length === 0 ? (
        <EmptyState
          title="Belum ada data perangkat"
          description="Tambahkan perangkat pendukung untuk mulai mencatat kondisi dan riwayatnya."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Tidak ditemukan"
          description="Tidak ada perangkat yang cocok dengan pencarian tersebut."
        />
      ) : (
        <>
          {/* Kartu — mobile */}
          <div className="flex flex-col gap-1 md:hidden">
            {filtered.map((d) => (
              <Card
                key={d.id}
                className="flex flex-col border-l-4 cursor-pointer active:opacity-80"
                style={{ borderLeftColor: conditionColor(d.condition) }}
                onClick={() => goToDetail(d.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex items-center gap-2">
                    <Badge tone={CONDITION_TONE[d.condition]}>
                      {CONDITION_LABEL[d.condition]}
                    </Badge>
                    <p className="font-display text-sm font-semibold text-espresso">
                      {d.type} — {d.brand}
                    </p>
                  </div>
                  <RowMenu onDelete={() => onDelete(d.id)} />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 text-xs text-espresso-soft">
                  <span className="flex items-center gap-1">
                    <FiHome />
                    {d.atm.tid} — {d.atm.location}
                  </span>
                  <span
                    className="flex items-center gap-1"
                    title={formatJakartaDateTime(d.updatedAt)}
                  >
                    <FiClock />
                    {formatRelativeTime(d.updatedAt)}
                  </span>
                </div>
              </Card>
            ))}
          </div>

          {/* Tabel — desktop */}
          <Table>
            <Thead>
              <Th>Tipe</Th>
              <Th>Brand</Th>
              <Th>SN</Th>
              <Th>ATM (TID)</Th>
              <Th>Kondisi</Th>
              <Th>Last Update</Th>
              <Th></Th>
            </Thead>
            <Tbody>
              {filtered.map((d) => (
                <Tr
                  key={d.id}
                  className="cursor-pointer"
                  style={{
                    boxShadow: `inset 3px 0 0 0 ${conditionColor(d.condition)}`,
                  }}
                  onClick={() => goToDetail(d.id)}
                >
                  <Td className="font-medium">{d.type}</Td>
                  <Td>{d.brand}</Td>
                  <Td className="text-espresso-soft">{d.serialNumber}</Td>
                  <Td>
                    {d.atm.tid} — {d.atm.location}
                  </Td>
                  <Td>
                    <Badge tone={CONDITION_TONE[d.condition]}>
                      {CONDITION_LABEL[d.condition]}
                    </Badge>
                  </Td>
                  <Td className="text-espresso-soft">
                    <span title={formatJakartaDateTime(d.updatedAt)}>
                      {formatRelativeTime(d.updatedAt)}
                    </span>
                  </Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end">
                      <RowMenu onDelete={() => onDelete(d.id)} />
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
