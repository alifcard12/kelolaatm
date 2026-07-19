"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatJakartaDateTime, formatRelativeTime } from "@/lib/date";
import { KASET_TYPE_LABEL, KASET_CONDITION_LABEL, KASET_CONDITION_TONE } from "@/lib/labels";
import {
  FiSearch,
  FiTag,
  FiClock,
  FiArrowUp,
  FiArrowDown,
  FiMoreVertical,
  FiTrash2,
} from "react-icons/fi";

type KasetRow = {
  id: string;
  serialNumber: string;
  type: string;
  latestCondition: string | null;
  latestProblem: string | null;
  latestAt: Date | null;
};

type SortField = "type" | "date";
type SortDir = "asc" | "desc";

// Warna tetap per kondisi terakhir (selaras dengan tone Badge).
const CONDITION_COLOR: Record<string, string> = {
  GOOD: "var(--color-success)",
  BAD: "var(--color-warning)",
  BROKEN: "var(--color-danger)",
  SCRAP: "var(--color-taupe-dark)",
};

function conditionColor(condition: string | null) {
  if (!condition) return "var(--color-taupe-dark)";
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

export function KasetListClient({
  kasetList,
  onDelete,
}: {
  kasetList: KasetRow[];
  onDelete: (id: string) => Promise<void>;
}) {
  const router = useRouter();
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
    let rows = kasetList;
    if (q) {
      rows = kasetList.filter((k) =>
        [k.serialNumber, KASET_TYPE_LABEL[k.type] ?? k.type, k.latestProblem ?? ""].some(
          (field) => field.toLowerCase().includes(q),
        ),
      );
    }
    const sorted = [...rows].sort((a, b) => {
      let cmp =
        sortField === "date"
          ? (a.latestAt?.getTime() ?? 0) - (b.latestAt?.getTime() ?? 0)
          : a.type.localeCompare(b.type, "id");
      if (cmp === 0 && sortField === "type") {
        cmp = (a.latestAt?.getTime() ?? 0) - (b.latestAt?.getTime() ?? 0);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [kasetList, query, sortField, sortDir]);

  function goToDetail(id: string) {
    router.push(`/kaset/${id}`);
  }

  return (
    <div>
      <div className="mb-4 flex gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-espresso-soft/60" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari SN, tipe, atau problem..."
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <SortToggle
            active={sortField === "type"}
            dir={sortDir}
            icon={<FiTag className="h-4 w-4" />}
            tooltip="Urutkan berdasarkan Tipe"
            onClick={() => toggleSort("type")}
          />
          <SortToggle
            active={sortField === "date"}
            dir={sortDir}
            icon={<FiClock className="h-4 w-4" />}
            tooltip="Urutkan berdasarkan Last Update"
            onClick={() => toggleSort("date")}
          />
        </div>
      </div>

      {kasetList.length === 0 ? (
        <EmptyState
          title="Belum ada data kaset"
          description="Tambahkan kaset pertama untuk mulai mencatat kondisinya."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Tidak ditemukan"
          description="Tidak ada kaset yang cocok dengan pencarian tersebut."
        />
      ) : (
        <>
          {/* Kartu — mobile */}
          <div className="flex flex-col gap-1 md:hidden">
            {filtered.map((k) => (
              <Card
                key={k.id}
                className="flex flex-col border-l-4 cursor-pointer active:opacity-80"
                style={{ borderLeftColor: conditionColor(k.latestCondition) }}
                onClick={() => goToDetail(k.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-sm font-semibold text-espresso">
                      {k.serialNumber}
                    </p>
                    <p className="text-xs text-espresso-soft">{KASET_TYPE_LABEL[k.type]}</p>
                  </div>
                  <RowMenu onDelete={() => onDelete(k.id)} />
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-espresso-soft">
                  {k.latestCondition && (
                    <Badge tone={KASET_CONDITION_TONE[k.latestCondition]}>
                      {KASET_CONDITION_LABEL[k.latestCondition]}
                    </Badge>
                  )}
                  {k.latestProblem && <span className="truncate">{k.latestProblem}</span>}
                  {k.latestAt && (
                    <span className="flex items-center gap-1" title={formatJakartaDateTime(k.latestAt)}>
                      <FiClock />
                      {formatRelativeTime(k.latestAt)}
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Tabel — desktop */}
          <Table>
            <Thead>
              <Th>SN</Th>
              <Th>Tipe</Th>
              <Th>Kondisi Terakhir</Th>
              <Th>Problem Terakhir</Th>
              <Th>Last Update</Th>
              <Th></Th>
            </Thead>
            <Tbody>
              {filtered.map((k) => (
                <Tr
                  key={k.id}
                  className="cursor-pointer"
                  style={{ boxShadow: `inset 3px 0 0 0 ${conditionColor(k.latestCondition)}` }}
                  onClick={() => goToDetail(k.id)}
                >
                  <Td className="font-medium">{k.serialNumber}</Td>
                  <Td className="text-espresso-soft">{KASET_TYPE_LABEL[k.type]}</Td>
                  <Td>
                    {k.latestCondition ? (
                      <Badge tone={KASET_CONDITION_TONE[k.latestCondition]}>
                        {KASET_CONDITION_LABEL[k.latestCondition]}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </Td>
                  <Td className="text-espresso-soft">{k.latestProblem ?? "-"}</Td>
                  <Td className="text-espresso-soft">
                    {k.latestAt ? (
                      <span title={formatJakartaDateTime(k.latestAt)}>
                        {formatRelativeTime(k.latestAt)}
                      </span>
                    ) : (
                      "-"
                    )}
                  </Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end">
                      <RowMenu onDelete={() => onDelete(k.id)} />
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
