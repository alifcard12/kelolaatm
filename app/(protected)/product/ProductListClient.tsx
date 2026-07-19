"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/date";
import { Card } from "@/components/ui/Card";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  FiSearch,
  FiTag,
  FiBox,
  FiArrowUp,
  FiArrowDown,
  FiMoreVertical,
  FiTrash2,
} from "react-icons/fi";

type ProductRow = {
  id: string;
  code: string;
  name: string;
  category: string;
  stock: number;
  price: number;
};

type SortField = "name" | "stock" | "price";
type SortDir = "asc" | "desc";

// Palet warna tetap (bukan class Tailwind dinamis) supaya tidak kena purge,
// dan tetap selaras dengan tone palet utama aplikasi.
const CATEGORY_PALETTE: { bg: string; text: string }[] = [
  { bg: "#f1dfe3", text: "#8f3f53" }, // rose
  { bg: "#e4ebf0", text: "#47607a" }, // biru
  { bg: "#e2ece2", text: "#3f6b4e" }, // hijau
  { bg: "#f3e6d2", text: "#9c6b2e" }, // amber
  { bg: "#e8e1f5", text: "#6b4f9c" }, // ungu
  { bg: "#dcf0ee", text: "#2f7a70" }, // teal
  { bg: "#fbe3ee", text: "#a13d73" }, // pink
  { bg: "#e1e6f5", text: "#4a5a9c" }, // indigo
];

function categoryStyle(category: string) {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
  }
  return CATEGORY_PALETTE[hash % CATEGORY_PALETTE.length];
}

function CategoryBadge({ category }: { category: string }) {
  const style = categoryStyle(category);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      <FiTag className="h-3 w-3" />
      {category}
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
              confirmDescription="Product yang sudah pernah dipakai di transaksi penjualan tidak bisa dihapus."
              className="flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger-soft transition-colors disabled:opacity-50"
            />
          </div>
        </>
      )}
    </div>
  );
}

export function ProductListClient({
  products,
  onDelete,
}: {
  products: ProductRow[];
  onDelete: (id: string) => Promise<void>;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
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
    let rows = products;
    if (q) {
      rows = products.filter((p) =>
        [p.code, p.name, p.category].some((field) =>
          field.toLowerCase().includes(q),
        ),
      );
    }
    const sorted = [...rows].sort((a, b) => {
      const cmp =
        sortField === "stock"
          ? a.stock - b.stock
          : sortField === "price"
            ? a.price - b.price
            : a.name.localeCompare(b.name, "id");
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [products, query, sortField, sortDir]);

  function goToDetail(id: string) {
    router.push(`/product/${id}`);
  }

  return (
    <div>
      <div className="mb-4 flex gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-espresso-soft/60" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari kode, nama, atau kategori..."
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <SortToggle
            active={sortField === "stock"}
            dir={sortDir}
            icon={<FiBox className="h-4 w-4" />}
            tooltip="Urutkan berdasarkan Stock"
            onClick={() => toggleSort("stock")}
          />
          <SortToggle
            active={sortField === "price"}
            dir={sortDir}
            icon={<span className="text-xs font-semibold">Rp</span>}
            tooltip="Urutkan berdasarkan Harga"
            onClick={() => toggleSort("price")}
          />
        </div>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="Belum ada product"
          description="Tambahkan product pertama."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Tidak ditemukan"
          description="Tidak ada product yang cocok dengan pencarian tersebut."
        />
      ) : (
        <>
          {/* Kartu — mobile */}
          <div className="flex flex-col gap-1 md:hidden">
            {filtered.map((p) => {
              const style = categoryStyle(p.category);
              return (
                <Card
                  key={p.id}
                  className="flex flex-col border-l-4 cursor-pointer active:opacity-80"
                  style={{ borderLeftColor: style.text }}
                  onClick={() => goToDetail(p.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex items-center">
                      <p className="font-display text-sm font-semibold text-espresso truncate">
                        {p.name}
                      </p>
                    </div>
                    <RowMenu onDelete={() => onDelete(p.id)} />
                  </div>
                  <p className="text-xs text-espresso-soft">{p.code}</p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-espresso-soft">
                    <CategoryBadge category={p.category} />
                    <span className="flex items-center gap-1">
                      <FiBox />
                      Stock: {p.stock}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="font-semibold text-espresso">
                      {formatRupiah(p.price)}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Tabel — desktop */}
          <Table>
            <Thead>
              <Th>Kode Product</Th>
              <Th>Nama Product</Th>
              <Th>Kategori</Th>
              <Th className="text-right">Stock</Th>
              <Th className="text-right">Harga</Th>
              <Th></Th>
            </Thead>
            <Tbody>
              {filtered.map((p) => {
                const style = categoryStyle(p.category);
                return (
                  <Tr
                    key={p.id}
                    className="cursor-pointer"
                    style={{ boxShadow: `inset 3px 0 0 0 ${style.text}` }}
                    onClick={() => goToDetail(p.id)}
                  >
                    <Td className="font-medium whitespace-nowrap">{p.code}</Td>
                    <Td>{p.name}</Td>
                    <Td>
                      <CategoryBadge category={p.category} />
                    </Td>
                    <Td className="text-right">{p.stock}</Td>
                    <Td className="text-right font-semibold whitespace-nowrap">
                      {formatRupiah(p.price)}
                    </Td>
                    <Td className="text-right">
                      <div className="flex items-center justify-end">
                        <RowMenu onDelete={() => onDelete(p.id)} />
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
