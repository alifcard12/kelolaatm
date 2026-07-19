"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatJakartaDateTime } from "@/lib/date";
import { VISIT_TYPE_LABEL, VISIT_TYPE_TONE } from "@/lib/labels";
import {
  FiSearch,
  FiTool,
  FiCalendar,
  FiArrowUp,
  FiArrowDown,
  FiMoreVertical,
  FiTrash2,
} from "react-icons/fi";

type VisitRow = {
  id: string;
  visitType: string;
  visitDate: Date;
  ticketNumber: string | null;
  keterangan: string | null;
  photoUrl: string | null;
  atm: { tid: number; location: string; branch: string; ssb: string };
  ticket: { ticketNumber: string | null; problem: string } | null;
};

type SortField = "type" | "date";
type SortDir = "asc" | "desc";

// Warna tetap per tipe kunjungan (selaras dengan tone Badge: PM = info, CM = warning).
const TYPE_COLOR: Record<string, string> = {
  PM: "var(--color-info)",
  CM: "var(--color-warning)",
};

function typeColor(visitType: string) {
  return TYPE_COLOR[visitType] ?? "var(--color-info)";
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
    <div className="relative">
      <button
        type="button"
        aria-label="Menu"
        onClick={() => setOpen((v) => !v)}
        className="flex h-7 w-7 items-center justify-center rounded-full text-espresso-soft hover:bg-cream transition-colors"
      >
        <FiMoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
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

export function VisitListClient({
  visits,
  onDelete,
}: {
  visits: VisitRow[];
  onDelete: (id: string) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

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
    let rows = visits;
    if (q) {
      rows = visits.filter((v) =>
        [
          String(v.atm.tid),
          v.atm.location,
          v.atm.branch,
          v.atm.ssb,
          v.keterangan ?? "",
          v.ticketNumber ?? "",
          v.ticket?.ticketNumber ?? "",
          v.ticket?.problem ?? "",
        ].some((field) => field.toLowerCase().includes(q)),
      );
    }
    const sorted = [...rows].sort((a, b) => {
      let cmp =
        sortField === "date"
          ? a.visitDate.getTime() - b.visitDate.getTime()
          : a.visitType.localeCompare(b.visitType, "id");
      if (cmp === 0 && sortField === "type") cmp = b.visitDate.getTime() - a.visitDate.getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [visits, query, sortField, sortDir]);

  return (
    <div>
      <div className="mb-4 flex gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-espresso-soft/60" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari TID, lokasi, branch, SSB, atau keterangan..."
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <SortToggle
            active={sortField === "type"}
            dir={sortDir}
            icon={<FiTool className="h-4 w-4" />}
            tooltip="Urutkan berdasarkan Tipe Kunjungan"
            onClick={() => toggleSort("type")}
          />
          <SortToggle
            active={sortField === "date"}
            dir={sortDir}
            icon={<FiCalendar className="h-4 w-4" />}
            tooltip="Urutkan berdasarkan Tanggal"
            onClick={() => toggleSort("date")}
          />
        </div>
      </div>

      {visits.length === 0 ? (
        <EmptyState
          title="Belum ada data kunjungan"
          description="Catat kunjungan preventive maintenance pertama di sini."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Tidak ditemukan"
          description="Tidak ada kunjungan yang cocok dengan pencarian tersebut."
        />
      ) : (
        <div className="flex flex-col gap-3 md:gap-4">
          {filtered.map((v) => (
            <Card
              key={v.id}
              className="border-l-4"
              style={{ borderLeftColor: typeColor(v.visitType) }}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <Badge tone={VISIT_TYPE_TONE[v.visitType]}>
                    {VISIT_TYPE_LABEL[v.visitType]}
                  </Badge>
                  <div className="text-sm font-medium text-espresso mt-2">
                    {v.atm.tid} — {v.atm.location} ({v.atm.branch})
                  </div>
                  <div className="text-xs text-espresso-soft/70">SSB: {v.atm.ssb}</div>
                </div>

                <RowMenu onDelete={() => onDelete(v.id)} />
              </div>

              <div className="text-xs text-espresso-soft/70 mb-2">
                {formatJakartaDateTime(v.visitDate)}
                {v.visitType === "PM" && v.ticketNumber && <> · No. Tiket: {v.ticketNumber}</>}
                {v.visitType === "CM" && v.ticket && (
                  <>
                    {" "}
                    · No. Tiket: {v.ticket.ticketNumber ?? "(belum ada nomor)"} — {v.ticket.problem}
                  </>
                )}
              </div>

              {v.keterangan && (
                <div className="text-sm text-espresso mb-2">
                  <span className="text-espresso-soft/70">Keterangan: </span>
                  {v.keterangan}
                </div>
              )}

              {v.photoUrl && (
                <a
                  href={v.photoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-rose hover:underline"
                >
                  Lihat Foto
                </a>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
