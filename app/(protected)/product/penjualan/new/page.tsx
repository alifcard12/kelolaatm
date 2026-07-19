import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createSale } from "../actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ActionForm } from "@/components/ui/ActionForm";
import { SaleItemsForm } from "../SaleItemsForm";
import { FiChevronLeft } from "react-icons/fi";

function todayJakarta(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function nowJakartaTime(): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date());
}

export default async function NewSalePage() {
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } });

  const nowValue = `${todayJakarta()}T${nowJakartaTime()}`;

  return (
    <div className="max-w-xl">
      <Link
        href="/product/penjualan"
        className="inline-flex items-center gap-1 text-xs text-espresso-soft hover:text-rose mb-2"
      >
        <FiChevronLeft /> Kembali ke Penjualan
      </Link>

      <PageHeader
        title="Tambah Penjualan"
        description="No. Transaksi dibuat otomatis. Setiap barang akan otomatis mengurangi stock dan tercatat di Keuangan Operasional."
      />

      <Card>
        <ActionForm
          action={createSale}
          successMessage="Penjualan berhasil ditambahkan"
          className="flex flex-col gap-4"
        >
          <Field label="Tanggal & Jam Penjualan" htmlFor="saleDateTime">
            <Input
              id="saleDateTime"
              name="saleDateTime"
              type="datetime-local"
              required
              defaultValue={nowValue}
            />
          </Field>

          <Field label="Pelanggan" htmlFor="customerName">
            <Input
              id="customerName"
              name="customerName"
              type="text"
              required
              defaultValue="Alif Ayatullah"
            />
          </Field>

          <SaleItemsForm
            products={products.map((p) => ({
              id: p.id,
              code: p.code,
              name: p.name,
              price: p.price,
              stock: p.stock,
            }))}
          />

          <Button type="submit" className="mt-2 self-start" disabled={products.length === 0}>
            Simpan
          </Button>
        </ActionForm>
      </Card>
    </div>
  );
}
