"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatJakartaDateTime, formatRelativeTime } from "@/lib/date";
import { Card } from "@/components/ui/Card";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  FiSearch,
  FiHome,
  FiHash,
  FiArrowUp,
  FiArrowDown,
  FiMoreVertical,
  FiTrash2,
  FiClock,
} from "react-icons/fi";

type AtmRow = {
  id: string;
  tid: number;
  location: string;
  branch: string;
  ssb: string;
  updatedAt: Date;
};

type SortField = "branch" | "tid";
type SortDir = "asc" | "desc";

// Palet warna tetap (bukan class Tailwind dinamis) supaya tidak kena purge,
// dan tetap selaras dengan tone palet utama aplikasi.
const BRANCH_PALETTE: { bg: string; text: string }[] = [
  { bg: "#f1dfe3", text: "#8f3f53" }, // rose
  { bg: "#e4ebf0", text: "#47607a" }, // biru
  { bg: "#e2ece2", text: "#3f6b4e" }, // hijau
  { bg: "#f3e6d2", text: "#9c6b2e" }, // amber
  { bg: "#e8e1f5", text: "#6b4f9c" }, // ungu
  { bg: "#dcf0ee", text: "#2f7a70" }, // teal
  { bg: "#fbe3ee", text: "#a13d73" }, // pink
  { bg: "#e1e6f5", text: "#4a5a9c" }, // indigo
  { bg: "#f5ecd9", text: "#8a6d2f" }, // gold
  { bg: "#e6f0e1", text: "#5a7a3f" }, // olive
];

function branchStyle(branch: string) {
  let hash = 0;
  for (let i = 0; i < branch.length; i++) {
    hash = (hash * 31 + branch.charCodeAt(i)) >>> 0;
  }
  return BRANCH_PALETTE[hash % BRANCH_PALETTE.length];
}

function branchInitials(branch: string) {
  const words = branch.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function BranchBadge({ branch }: { branch: string }) {
  const style = branchStyle(branch);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      <span
        className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold"
        style={{ backgroundColor: style.text, color: style.bg }}
      >
        {branchInitials(branch)}
      </span>
      {branch}
    </span>
  );
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

export function AtmListClient({
  atms,
  onDelete,
}: {
  atms: AtmRow[];
  onDelete: (id: string) => Promise<void>;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("branch");
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
    let rows = atms;
    if (q) {
      rows = atms.filter((atm) =>
        [String(atm.tid), atm.location, atm.branch, atm.ssb].some((field) =>
          field.toLowerCase().includes(q),
        ),
      );
    }
    const sorted = [...rows].sort((a, b) => {
      let cmp =
        sortField === "tid"
          ? a.tid - b.tid
          : a.branch.localeCompare(b.branch, "id");
      if (cmp === 0 && sortField === "branch") cmp = a.tid - b.tid;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [atms, query, sortField, sortDir]);

  function goToDetail(id: string) {
    router.push(`/atm/${id}`);
  }

  return (
    <div>
      <div className="mb-4 flex  gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-espresso-soft/60" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari TID, lokasi, branch, atau SSB..."
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <SortToggle
            active={sortField === "branch"}
            dir={sortDir}
            icon={<FiHome className="h-4 w-4" />}
            tooltip="Urutkan berdasarkan Branch"
            onClick={() => toggleSort("branch")}
          />
          <SortToggle
            active={sortField === "tid"}
            dir={sortDir}
            icon={<FiHash className="h-4 w-4" />}
            tooltip="Urutkan berdasarkan TID"
            onClick={() => toggleSort("tid")}
          />
        </div>
      </div>

      {atms.length === 0 ? (
        <EmptyState
          title="Belum ada data ATM"
          description="Tambahkan unit ATM pertama untuk mulai mengelola perangkat, tiket, dan kunjungan."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Tidak ditemukan"
          description="Tidak ada ATM yang cocok dengan pencarian tersebut."
        />
      ) : (
        <>
          {/* Kartu — mobile */}
          <div className="flex flex-col gap-1 md:hidden">
            {filtered.map((atm) => {
              const style = branchStyle(atm.branch);
              return (
                <Card
                  key={atm.id}
                  className="flex flex-col gap-2 border-l-4 cursor-pointer active:opacity-80"
                  style={{ borderLeftColor: style.text }}
                  onClick={() => goToDetail(atm.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex items-center">
                      <p className="font-display font-semibold text-espresso">
                        {atm.tid} - {atm.location}
                      </p>
                    </div>
                    <RowMenu onDelete={() => onDelete(atm.id)} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-espresso-soft">
                    <BranchBadge branch={atm.branch} />
                    <span className="flex items-center gap-1">
                      <FiHome />
                      {atm.ssb}
                    </span>

                    <span
                      className="flex items-center gap-1"
                      title={formatJakartaDateTime(atm.updatedAt)}
                    >
                      <FiClock />
                      {formatRelativeTime(atm.updatedAt)}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Tabel — desktop */}
          <Table>
            <Thead>
              <Th>TID</Th>
              <Th>Lokasi</Th>
              <Th>Branch</Th>
              <Th>SSB</Th>
              <Th>Last Update</Th>
              <Th></Th>
            </Thead>
            <Tbody>
              {filtered.map((atm) => {
                const style = branchStyle(atm.branch);
                return (
                  <Tr
                    key={atm.id}
                    className="cursor-pointer"
                    style={{ boxShadow: `inset 3px 0 0 0 ${style.text}` }}
                    onClick={() => goToDetail(atm.id)}
                  >
                    <Td className="font-medium">{atm.tid}</Td>
                    <Td>{atm.location}</Td>
                    <Td>
                      <BranchBadge branch={atm.branch} />
                    </Td>

                    <Td className="text-espresso-soft">
                      <span title={formatJakartaDateTime(atm.updatedAt)}>
                        {formatRelativeTime(atm.updatedAt)}
                      </span>
                    </Td>
                    <Td className="text-right">
                      <div className="flex items-center justify-end">
                        <RowMenu onDelete={() => onDelete(atm.id)} />
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
