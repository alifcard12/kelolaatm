import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteSale } from "./actions";
import { formatJakartaDateTime, formatRupiah } from "@/lib/date";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { FiPlus } from "react-icons/fi";
import { ProductNav } from "../ProductNav";

export default async function SaleListPage() {
  const sales = await prisma.sale.findMany({
    orderBy: { saleDate: "desc" },
    include: { items: true },
  });

  return (
    <div>
      <PageHeader
        title="Penjualan"
        description="Setiap transaksi otomatis mengurangi stock product dan tercatat sebagai debit di Keuangan Operasional, satu baris per barang."
        action={
          <LinkButton href="/product/penjualan/new">
            <FiPlus /> Tambah Penjualan
          </LinkButton>
        }
      />

      <ProductNav />

      {sales.length === 0 && (
        <EmptyState
          title="Belum ada penjualan"
          description="Tambahkan transaksi penjualan pertama."
          action={
            <LinkButton href="/product/penjualan/new" size="sm">
              <FiPlus /> Tambah Penjualan
            </LinkButton>
          }
        />
      )}

      {/* Kartu — mobile */}
      <div className="flex flex-col gap-3 md:hidden">
        {sales.map((s) => (
          <Card key={s.id} className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <Link href={`/product/penjualan/${s.id}`} className="min-w-0">
                <p className="font-display font-semibold text-espresso truncate">{s.invoiceNo}</p>
                <p className="text-xs text-espresso-soft">{s.customerName}</p>
              </Link>
              <DeleteButton
                action={deleteSale.bind(null, s.id)}
                confirmDescription="Stock barang akan dikembalikan dan transaksi di Keuangan Operasional ikut terhapus."
              />
            </div>
            <p className="text-xs text-espresso-soft">{formatJakartaDateTime(s.saleDate)}</p>
            <p className="text-xs text-espresso-soft">{s.items.length} jenis barang</p>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-espresso">{formatRupiah(s.totalAmount)}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabel — desktop */}
      {sales.length > 0 && (
        <Table>
          <Thead>
            <Th>No Transaksi</Th>
            <Th>Tanggal & Jam</Th>
            <Th>Pelanggan</Th>
            <Th className="text-right">Jenis Barang</Th>
            <Th className="text-right">Total</Th>
            <Th></Th>
          </Thead>
          <Tbody>
            {sales.map((s) => (
              <Tr key={s.id}>
                <Td className="font-medium whitespace-nowrap">
                  <Link
                    href={`/product/penjualan/${s.id}`}
                    className="hover:text-rose transition-colors"
                  >
                    {s.invoiceNo}
                  </Link>
                </Td>
                <Td className="text-espresso-soft whitespace-nowrap">
                  {formatJakartaDateTime(s.saleDate)}
                </Td>
                <Td>{s.customerName}</Td>
                <Td className="text-right">{s.items.length}</Td>
                <Td className="text-right font-semibold whitespace-nowrap">
                  {formatRupiah(s.totalAmount)}
                </Td>
                <Td className="text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/product/penjualan/${s.id}`}
                      className="text-xs text-espresso-soft hover:text-rose"
                    >
                      Edit
                    </Link>
                    <DeleteButton
                      action={deleteSale.bind(null, s.id)}
                      confirmDescription="Stock barang akan dikembalikan dan transaksi di Keuangan Operasional ikut terhapus."
                    />
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
