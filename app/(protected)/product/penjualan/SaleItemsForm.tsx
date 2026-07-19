"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/Input";
import { formatRupiah } from "@/lib/date";
import { FiPlus, FiMinus, FiCheck, FiTrash2 } from "react-icons/fi";

export type ProductOption = {
  id: string;
  code: string;
  name: string;
  price: number;
  stock: number;
};

type SelectedItem = {
  productId: string;
  quantity: number;
};

/**
 * Daftar barang untuk form Penjualan. Product dipilih dengan klik langsung
 * dari daftar (bukan dropdown), lalu muncul di bagian "Barang Dipilih" di
 * bawahnya dengan kontrol jumlah (+/-, atau ketik manual). Menghasilkan satu
 * hidden input `itemsJson` berisi array {productId, quantity} yang dibaca
 * server action, plus tampilan subtotal per baris & total keseluruhan.
 */
export function SaleItemsForm({
  products,
  initialItems = [],
}: {
  products: ProductOption[];
  initialItems?: { productId: string; quantity: number }[];
}) {
  const [items, setItems] = useState<SelectedItem[]>(() =>
    initialItems
      .filter((it) => products.some((p) => p.id === it.productId))
      .map((it) => ({ productId: it.productId, quantity: it.quantity })),
  );

  const itemsInputRef = useRef<HTMLInputElement>(null);

  const productById = useMemo(() => {
    const map = new Map<string, ProductOption>();
    for (const p of products) map.set(p.id, p);
    return map;
  }, [products]);

  const validItems = items.filter((it) => it.quantity > 0);
  const total = validItems.reduce((sum, it) => {
    const product = productById.get(it.productId);
    return sum + (product ? product.price * it.quantity : 0);
  }, 0);

  useEffect(() => {
    if (itemsInputRef.current) {
      itemsInputRef.current.value = JSON.stringify(validItems);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  function selectProduct(productId: string) {
    setItems((prev) => {
      const existing = prev.find((it) => it.productId === productId);
      if (existing) {
        return prev.map((it) =>
          it.productId === productId ? { ...it, quantity: it.quantity + 1 } : it,
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  }

  function updateQuantity(productId: string, quantity: number) {
    const safe = Math.max(1, Math.round(Number.isFinite(quantity) ? quantity : 1));
    setItems((prev) =>
      prev.map((it) => (it.productId === productId ? { ...it, quantity: safe } : it)),
    );
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((it) => it.productId !== productId));
  }

  const selectedIds = new Set(items.map((it) => it.productId));

  return (
    <div className="flex flex-col gap-4">
      <input type="hidden" name="itemsJson" ref={itemsInputRef} defaultValue="[]" />

      <div>
        <label className="block text-sm font-medium text-espresso-soft mb-1.5">
          Daftar Barang
        </label>

        {products.length === 0 ? (
          <p className="text-xs text-danger">
            Belum ada product. Tambahkan product dulu di halaman Daftar Product.
          </p>
        ) : (
          <div className="max-h-[13.5rem] overflow-y-auto rounded-xl border border-taupe-dark/40 divide-y divide-taupe/50">
            {products.map((p) => {
              const selected = selectedIds.has(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => selectProduct(p.id)}
                  className={`flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors ${
                    selected ? "bg-rose-soft/60" : "hover:bg-cream"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-espresso truncate">{p.name}</p>
                    <p className="text-xs text-espresso-soft">
                      {p.code} · Stock {p.stock} · {formatRupiah(p.price)}
                    </p>
                  </div>
                  {selected ? (
                    <FiCheck className="h-4 w-4 shrink-0 text-rose-dark" />
                  ) : (
                    <FiPlus className="h-4 w-4 shrink-0 text-espresso-soft" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="block text-sm font-medium text-espresso-soft">Barang Dipilih</label>

          {items.map((it) => {
            const product = productById.get(it.productId);
            if (!product) return null;
            const subtotal = product.price * it.quantity;

            return (
              <div
                key={it.productId}
                className="flex flex-col gap-2.5 rounded-xl border border-taupe-dark/40 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-espresso truncate">{product.name}</p>
                    <p className="text-xs text-espresso-soft">
                      {product.code} · {formatRupiah(product.price)} / barang
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(it.productId)}
                    aria-label="Hapus barang"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-danger hover:bg-danger-soft transition-colors"
                  >
                    <FiTrash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => updateQuantity(it.productId, it.quantity - 1)}
                      disabled={it.quantity <= 1}
                      aria-label="Kurangi jumlah"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-taupe-dark/60 text-espresso hover:bg-cream transition-colors disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <FiMinus className="h-3.5 w-3.5" />
                    </button>
                    <div className="w-16">
                      <Input
                        type="number"
                        min={1}
                        step={1}
                        value={it.quantity}
                        onChange={(e) =>
                          updateQuantity(it.productId, Number(e.target.value))
                        }
                        className="text-center"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => updateQuantity(it.productId, it.quantity + 1)}
                      aria-label="Tambah jumlah"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-taupe-dark/60 text-espresso hover:bg-cream transition-colors"
                    >
                      <FiPlus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <span className="text-sm font-semibold text-espresso">
                    {formatRupiah(subtotal)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between rounded-xl bg-cream px-4 py-3 mt-1">
        <span className="text-sm font-medium text-espresso-soft">Total Harga</span>
        <span className="font-display text-lg font-semibold text-espresso">
          {formatRupiah(total)}
        </span>
      </div>
    </div>
  );
}
