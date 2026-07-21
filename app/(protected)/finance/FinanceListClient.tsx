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
import {
  FINANCE_TYPE_LABEL,
  FINANCE_TYPE_TONE,
  FINANCE_CATEGORY_LABEL,
  FINANCE_CATEGORY_TONE,
} from "@/lib/labels";
import {
  FiSearch,
  FiArrowUpCircle,
  FiArrowDownCircle,
  FiMoreVertical,
  FiTrash2,
  FiClock,
} from "react-icons/fi";

type FinanceRow = {
  id: string;
  date: Date;
  description: string;
  type: string;
  category: string;
  amount: number;
  notes: string | null;
  runningBalance: number;
};

type TypeFilter = "ALL" | "DEBIT" | "CREDIT";

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

export function FinanceListClient({
  entries,
  onDelete,
}: {
  entries: FinanceRow[];
  onDelete: (id: string) => Promise<void>;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = entries;
    if (typeFilter !== "ALL") {
      rows = rows.filter((e) => e.type === typeFilter);
    }
    if (q) {
      rows = rows.filter((e) =>
        [e.description, e.notes ?? ""].some((field) =>
          field.toLowerCase().includes(q),
        ),
      );
    }
    // Urutan (dan saldo berjalan) tetap mengikuti urutan yang sudah dihitung
    // kronologis dari server — di sini hanya memfilter, tidak mengurutkan ulang.
    return rows;
  }, [entries, query, typeFilter]);

  function goToDetail(id: string) {
    router.push(`/finance/${id}`);
  }

  return (
    <div>
      <div className="mb-4 flex gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-espresso-soft/60" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari deskripsi atau catatan..."
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTypeFilter("ALL")}
            className={`flex h-9 items-center gap-1 rounded-xl border px-3 text-sm font-medium transition-colors ${
              typeFilter === "ALL"
                ? "border-rose bg-rose-soft text-rose-dark"
                : "border-taupe-dark/60 bg-paper text-espresso-soft hover:border-rose/50"
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            title="Tampilkan Credit saja"
            aria-label="Tampilkan Credit saja"
            onClick={() => setTypeFilter("CREDIT")}
            className={`flex h-9 items-center gap-1 rounded-xl border px-2.5 transition-colors ${
              typeFilter === "CREDIT"
                ? "border-rose bg-rose-soft text-rose-dark"
                : "border-taupe-dark/60 bg-paper text-espresso-soft hover:border-rose/50"
            }`}
          >
            <FiArrowUpCircle className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Tampilkan Debit saja"
            aria-label="Tampilkan Debit saja"
            onClick={() => setTypeFilter("DEBIT")}
            className={`flex h-9 items-center gap-1 rounded-xl border px-2.5 transition-colors ${
              typeFilter === "DEBIT"
                ? "border-rose bg-rose-soft text-rose-dark"
                : "border-taupe-dark/60 bg-paper text-espresso-soft hover:border-rose/50"
            }`}
          >
            <FiArrowDownCircle className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          title="Belum ada transaksi bulan ini"
          description="Belum ada catatan uang operasional untuk bulan ini."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Tidak ditemukan"
          description="Tidak ada transaksi yang cocok dengan pencarian tersebut."
        />
      ) : (
        <>
          {/* Kartu — mobile */}
          <div className="flex flex-col gap-1 md:hidden">
            {filtered.map((e) => (
              <Card
                key={e.id}
                className="flex flex-col border-l-4 cursor-pointer active:opacity-80"
                style={{
                  borderLeftColor:
                    e.type === "DEBIT"
                      ? "var(--color-danger)"
                      : "var(--color-success)",
                }}
                onClick={() => goToDetail(e.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex items-center">
                    <p className="font-display text-sm font-semibold text-espresso truncate">
                      {e.description}
                    </p>
                  </div>
                  <RowMenu onDelete={() => onDelete(e.id)} />
                </div>

                <div className="flex items-center justify-between text-sm ">
                  <span
                    className={
                      e.type === "DEBIT"
                        ? "text-danger font-semibold"
                        : "text-success font-semibold"
                    }
                  >
                    {e.type === "DEBIT" ? "-" : "+"}
                    {formatRupiah(e.amount)}
                  </span>
                  <Badge tone={FINANCE_CATEGORY_TONE[e.category]}>
                    {FINANCE_CATEGORY_LABEL[e.category]}
                  </Badge>
                  <p className="text-xs text-espresso-soft flex items-center gap-1">
                    <FiClock />
                    {formatJakartaDate(e.date)}
                  </p>
                </div>
                {e.notes && (
                  <p className="text-xs text-espresso-soft/80">{e.notes}</p>
                )}
              </Card>
            ))}
          </div>

          {/* Tabel — desktop */}
          <Table>
            <Thead>
              <Th>Tanggal</Th>
              <Th>Deskripsi</Th>
              <Th>Kategori</Th>
              <Th>Tipe</Th>
              <Th className="text-right">Jumlah</Th>
              <Th className="text-right">Saldo</Th>
              <Th></Th>
            </Thead>
            <Tbody>
              {filtered.map((e) => (
                <Tr
                  key={e.id}
                  className="cursor-pointer"
                  style={{
                    boxShadow: `inset 3px 0 0 0 ${
                      e.type === "DEBIT"
                        ? "var(--color-danger)"
                        : "var(--color-success)"
                    }`,
                  }}
                  onClick={() => goToDetail(e.id)}
                >
                  <Td className="whitespace-nowrap text-espresso-soft">
                    {formatJakartaDate(e.date)}
                  </Td>
                  <Td className="font-medium">
                    {e.description}
                    {e.notes && (
                      <div className="text-xs text-espresso-soft/70 mt-0.5">
                        {e.notes}
                      </div>
                    )}
                  </Td>
                  <Td>
                    <Badge tone={FINANCE_CATEGORY_TONE[e.category]}>
                      {FINANCE_CATEGORY_LABEL[e.category]}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge tone={FINANCE_TYPE_TONE[e.type]}>
                      {FINANCE_TYPE_LABEL[e.type]}
                    </Badge>
                  </Td>
                  <Td
                    className={`text-right font-semibold whitespace-nowrap ${
                      e.type === "DEBIT" ? "text-danger" : "text-success"
                    }`}
                  >
                    {e.type === "DEBIT" ? "-" : "+"}
                    {formatRupiah(e.amount)}
                  </Td>
                  <Td className="text-right whitespace-nowrap text-espresso-soft">
                    {formatRupiah(e.runningBalance)}
                  </Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end">
                      <RowMenu onDelete={() => onDelete(e.id)} />
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
