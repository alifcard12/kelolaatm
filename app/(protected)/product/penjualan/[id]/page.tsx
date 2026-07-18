import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateSale, deleteSale } from "../actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ActionForm } from "@/components/ui/ActionForm";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { SaleItemsForm } from "../SaleItemsForm";
import { FiChevronLeft } from "react-icons/fi";

function toDateInputValue(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function toTimeInputValue(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

export default async function SaleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const sale = await prisma.sale.findUnique({ where: { id }, include: { items: true } });
  if (!sale) notFound();

  // Product yang dipakai di transaksi ini (termasuk yang stock-nya sekarang 0)
  // digabung dengan semua product lain, supaya bisa dipilih ulang saat edit.
  const allProducts = await prisma.product.findMany({ orderBy: { name: "asc" } });
  const productIdsInSale = new Set(sale.items.map((it) => it.productId).filter(Boolean) as string[]);

  // Stock yang ditampilkan untuk product yang sudah dipakai di transaksi ini
  // ditambah kembali kuantitas lama, supaya jumlah lama tetap valid dipilih ulang.
  const oldQtyByProduct = new Map<string, number>();
  for (const item of sale.items) {
    if (item.productId) {
      oldQtyByProduct.set(item.productId, (oldQtyByProduct.get(item.productId) ?? 0) + item.quantity);
    }
  }

  const productOptions = allProducts.map((p) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    price: p.price,
    stock: p.stock + (oldQtyByProduct.get(p.id) ?? 0),
  }));

  const updateSaleWithId = updateSale.bind(null, sale.id);

  async function deleteAndRedirect() {
    "use server";
    await deleteSale(sale!.id);
    redirect("/product/penjualan");
  }

  return (
    <div className="max-w-xl">
      <Link
        href="/product/penjualan"
        className="inline-flex items-center gap-1 text-xs text-espresso-soft hover:text-rose mb-2"
      >
        <FiChevronLeft /> Kembali ke Penjualan
      </Link>

      <PageHeader
        title={sale.invoiceNo}
        description="Perubahan di sini akan menyesuaikan ulang stock product dan transaksi terkait di Keuangan Operasional."
        action={
          <DeleteButton
            action={deleteAndRedirect}
            label="Hapus Penjualan"
            confirmDescription="Stock barang akan dikembalikan dan transaksi di Keuangan Operasional ikut terhapus."
          />
        }
      />

      <Card>
        <ActionForm
          action={updateSaleWithId}
          successMessage="Penjualan berhasil diperbarui"
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tanggal Penjualan" htmlFor="saleDate">
              <Input
                id="saleDate"
                name="saleDate"
                type="date"
                required
                defaultValue={toDateInputValue(sale.saleDate)}
              />
            </Field>
            <Field label="Jam Penjualan" htmlFor="saleTime">
              <Input
                id="saleTime"
                name="saleTime"
                type="time"
                required
                defaultValue={toTimeInputValue(sale.saleDate)}
              />
            </Field>
          </div>

          <Field label="Pelanggan" htmlFor="customerName">
            <Input
              id="customerName"
              name="customerName"
              type="text"
              required
              defaultValue={sale.customerName}
            />
          </Field>

          <SaleItemsForm
            products={productOptions}
            initialItems={sale.items
              .filter((it) => it.productId && productIdsInSale.has(it.productId))
              .map((it) => ({ productId: it.productId as string, quantity: it.quantity }))}
          />

          <Button type="submit" className="mt-2 self-start">
            Simpan Perubahan
          </Button>
        </ActionForm>
      </Card>
    </div>
  );
}
