"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatJakartaDateTime } from "@/lib/date";
import { buildOpenTicketText, buildCloseTicketText } from "@/lib/ticketText";
import CopyTextButton from "@/components/CopyTextButton";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { TICKET_STATUS_LABEL, TICKET_STATUS_TONE } from "@/lib/labels";
import {
  FiSearch,
  FiAlertCircle,
  FiCalendar,
  FiArrowUp,
  FiArrowDown,
  FiMoreVertical,
  FiTrash2,
  FiCopy,
} from "react-icons/fi";

type TicketRow = {
  id: string;
  status: string;
  problem: string;
  action: string | null;
  ticketNumber: string | null;
  openedAt: Date;
  closedAt: Date | null;
  attachments: { id: string }[];
  atm: { tid: number; location: string; branch: string; ssb: string };
  device: { type: string; brand: string; serialNumber: string } | null;
};

type SortField = "status" | "date";
type SortDir = "asc" | "desc";

// Warna tetap per status (selaras dengan tone Badge: OPEN = warning, CLOSED = success).
const STATUS_COLOR: Record<string, string> = {
  OPEN: "var(--color-warning)",
  CLOSED: "var(--color-success)",
};

function statusColor(status: string) {
  return STATUS_COLOR[status] ?? "var(--color-info)";
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

export function TicketListClient({
  tickets,
  onDelete,
}: {
  tickets: TicketRow[];
  onDelete: (id: string) => Promise<void>;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("status");
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
    let rows = tickets;
    if (q) {
      rows = tickets.filter((t) =>
        [
          String(t.atm.tid),
          t.atm.location,
          t.problem,
          t.ticketNumber ?? "",
          t.device?.type ?? "",
          t.device?.brand ?? "",
          t.device?.serialNumber ?? "",
        ].some((field) => field.toLowerCase().includes(q)),
      );
    }
    const sorted = [...rows].sort((a, b) => {
      let cmp =
        sortField === "date"
          ? a.openedAt.getTime() - b.openedAt.getTime()
          : a.status === b.status
            ? 0
            : a.status === "OPEN"
              ? -1
              : 1;
      if (cmp === 0 && sortField === "status")
        cmp = b.openedAt.getTime() - a.openedAt.getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [tickets, query, sortField, sortDir]);

  function goToDetail(id: string) {
    router.push(`/tickets/${id}`);
  }

  return (
    <div>
      <div className="mb-4 flex gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-espresso-soft/60" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari TID, lokasi, branch, SSB, atau problem..."
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <SortToggle
            active={sortField === "status"}
            dir={sortDir}
            icon={<FiAlertCircle className="h-4 w-4" />}
            tooltip="Urutkan berdasarkan Status"
            onClick={() => toggleSort("status")}
          />
          <SortToggle
            active={sortField === "date"}
            dir={sortDir}
            icon={<FiCalendar className="h-4 w-4" />}
            tooltip="Urutkan berdasarkan Tanggal Dibuka"
            onClick={() => toggleSort("date")}
          />
        </div>
      </div>

      {tickets.length === 0 ? (
        <EmptyState
          title="Belum ada tiket"
          description="Tiket gangguan yang dibuka akan tercatat di sini."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Tidak ditemukan"
          description="Tidak ada tiket yang cocok dengan pencarian tersebut."
        />
      ) : (
        <div className="flex flex-col gap-3 md:gap-4">
          {filtered.map((t) => {
            const openText = buildOpenTicketText({
              date: t.openedAt,
              location: t.atm.location,
              branch: t.atm.branch,
              tid: t.atm.tid,
              ssb: t.atm.ssb,
              problem: t.problem,
            });

            const closeText =
              t.status === "CLOSED"
                ? buildCloseTicketText({
                    date: t.openedAt,
                    location: t.atm.location,
                    branch: t.atm.branch,
                    tid: t.atm.tid,
                    ssb: t.atm.ssb,
                    problem: t.problem,
                    ticketNumber: t.ticketNumber ?? "",
                    action: t.action ?? "",
                  })
                : "";

            return (
              <Card
                key={t.id}
                className="border-l-4 cursor-pointer active:opacity-80"
                style={{ borderLeftColor: statusColor(t.status) }}
                onClick={() => goToDetail(t.id)}
              >
                <div className="flex items-start justify-between gap-4 ">
                  <div>
                    <div>
                      <Badge tone={TICKET_STATUS_TONE[t.status]}>
                        {TICKET_STATUS_LABEL[t.status]}
                      </Badge>
                    </div>
                    <div className="text-sm font-medium text-espresso mt-2">
                      {t.atm.tid} — {t.atm.location}
                    </div>

                    {t.device && (
                      <div className="text-xs text-espresso-soft/70">
                        Device: {t.device.type} — {t.device.brand} — SN{" "}
                        {t.device.serialNumber}
                      </div>
                    )}
                  </div>

                  <RowMenu onDelete={() => onDelete(t.id)} />
                </div>

                <div className="text-sm text-espresso mb-1">
                  <span className="text-espresso-soft/70">Problem: </span>
                  {t.problem}
                </div>
                <div className="text-xs text-espresso-soft/70 mb-">
                  Open: {formatJakartaDateTime(t.openedAt)}
                  {t.status === "CLOSED" && t.closedAt && (
                    <> · Closed: {formatJakartaDateTime(t.closedAt)}</>
                  )}
                  {t.status === "CLOSED" && t.ticketNumber && (
                    <> · No. Tiket: {t.ticketNumber}</>
                  )}
                  {t.attachments.length > 0 && (
                    <> · Lampiran: {t.attachments.length}</>
                  )}
                </div>

                {t.status === "CLOSED" && t.action && (
                  <div className="text-sm text-espresso mb-4">
                    <span className="text-espresso-soft/70">Action: </span>
                    {t.action}
                  </div>
                )}

                <div
                  className="flex flex-wrap items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CopyTextButton
                    text={openText}
                    label={
                      <span className="flex items-center gap-2">
                        <FiCopy /> Open
                      </span>
                    }
                  />

                  {t.status === "CLOSED" && (
                    <CopyTextButton
                      text={closeText}
                      label={
                        <span className="flex items-center gap-2">
                          <FiCopy /> Close
                        </span>
                      }
                      className="bg-success text-paper text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-success/90 transition-colors"
                    />
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
