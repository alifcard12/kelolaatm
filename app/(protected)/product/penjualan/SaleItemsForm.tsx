"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Field } from "@/components/ui/Field";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatRupiah } from "@/lib/date";
import { FiPlus, FiTrash2 } from "react-icons/fi";

export type ProductOption = {
  id: string;
  code: string;
  name: string;
  price: number;
  stock: number;
};

type Row = {
  key: string;
  productId: string;
  quantity: number;
};

let rowCounter = 0;
function newKey() {
  rowCounter += 1;
  return `row-${rowCounter}-${Date.now()}`;
}

/**
 * Daftar barang dinamis untuk form Penjualan. Menghasilkan satu hidden input
 * `itemsJson` berisi array {productId, quantity} yang dibaca server action,
 * plus tampilan subtotal per baris & total keseluruhan.
 */
export function SaleItemsForm({
  products,
  initialItems = [],
}: {
  products: ProductOption[];
  initialItems?: { productId: string; quantity: number }[];
}) {
  const [rows, setRows] = useState<Row[]>(() =>
    initialItems.length > 0
      ? initialItems.map((it) => ({ key: newKey(), productId: it.productId, quantity: it.quantity }))
      : [{ key: newKey(), productId: products[0]?.id ?? "", quantity: 1 }]
  );

  const itemsInputRef = useRef<HTMLInputElement>(null);

  const productById = useMemo(() => {
    const map = new Map<string, ProductOption>();
    for (const p of products) map.set(p.id, p);
    return map;
  }, [products]);

  const validRows = rows.filter((r) => r.productId && r.quantity > 0);
  const total = validRows.reduce((sum, r) => {
    const product = productById.get(r.productId);
    return sum + (product ? product.price * r.quantity : 0);
  }, 0);

  useEffect(() => {
    if (itemsInputRef.current) {
      itemsInputRef.current.value = JSON.stringify(
        validRows.map((r) => ({ productId: r.productId, quantity: r.quantity }))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  function addRow() {
    setRows((prev) => [...prev, { key: newKey(), productId: products[0]?.id ?? "", quantity: 1 }]);
  }

  function removeRow(key: string) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev));
  }

  function updateRow(key: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name="itemsJson" ref={itemsInputRef} defaultValue="[]" />

      <label className="block text-sm font-medium text-espresso-soft">Daftar Barang</label>

      {products.length === 0 && (
        <p className="text-xs text-danger">
          Belum ada product. Tambahkan product dulu di halaman Daftar Product.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {rows.map((row) => {
          const product = productById.get(row.productId);
          const subtotal = product ? product.price * row.quantity : 0;

          return (
            <div
              key={row.key}
              className="flex flex-col gap-2 rounded-xl border border-taupe-dark/40 p-3 sm:flex-row sm:items-end sm:gap-3"
            >
              <div className="flex-1 min-w-0">
                <Field label="Barang">
                  <Select
                    value={row.productId}
                    onChange={(e) => updateRow(row.key, { productId: e.target.value })}
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} — {p.name} (stock {p.stock})
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="w-full sm:w-28">
                <Field label="Jumlah">
                  <Input
                    type="number"
                    min={1}
                    step={1}
                    value={row.quantity}
                    onChange={(e) => updateRow(row.key, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                  />
                </Field>
              </div>

              <div className="w-full sm:w-36 text-sm text-espresso-soft sm:text-right sm:pb-2.5">
                {formatRupiah(subtotal)}
              </div>

              <button
                type="button"
                onClick={() => removeRow(row.key)}
                disabled={rows.length <= 1}
                aria-label="Hapus barang"
                className="flex items-center justify-center h-10 w-10 shrink-0 rounded-xl text-danger hover:bg-danger-soft transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                <FiTrash2 />
              </button>
            </div>
          );
        })}
      </div>

      <Button type="button" variant="secondary" size="sm" onClick={addRow} className="self-start">
        <FiPlus /> Tambah Barang
      </Button>

      <div className="flex items-center justify-between rounded-xl bg-cream px-4 py-3 mt-1">
        <span className="text-sm font-medium text-espresso-soft">Total Harga</span>
        <span className="font-display text-lg font-semibold text-espresso">{formatRupiah(total)}</span>
      </div>
    </div>
  );
}
