import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteProduct } from "./actions";
import { formatRupiah } from "@/lib/date";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { FiPlus } from "react-icons/fi";
import { ProductNav } from "./ProductNav";

export default async function ProductListPage() {
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader
        title="Product"
        description="Data master barang. Stock berkurang otomatis setiap ada transaksi Penjualan."
        action={
          <LinkButton href="/product/new">
            <FiPlus /> Tambah Product
          </LinkButton>
        }
      />

      <ProductNav />

      {products.length === 0 && (
        <EmptyState
          title="Belum ada product"
          description="Tambahkan product pertama."
          action={
            <LinkButton href="/product/new" size="sm">
              <FiPlus /> Tambah Product
            </LinkButton>
          }
        />
      )}

      {/* Kartu — mobile */}
      <div className="flex flex-col gap-3 md:hidden">
        {products.map((p) => (
          <Card key={p.id} className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <Link href={`/product/${p.id}`} className="min-w-0">
                <p className="font-display font-semibold text-espresso truncate">{p.name}</p>
                <p className="text-xs text-espresso-soft">{p.code}</p>
              </Link>
              <DeleteButton
                action={deleteProduct.bind(null, p.id)}
                confirmDescription="Product yang sudah pernah dipakai di transaksi penjualan tidak bisa dihapus."
              />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-espresso-soft">
              <Badge tone="info">{p.category}</Badge>
              <span>Stock: {p.stock}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-espresso">{formatRupiah(p.price)}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabel — desktop */}
      {products.length > 0 && (
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
            {products.map((p) => (
              <Tr key={p.id}>
                <Td className="font-medium whitespace-nowrap">
                  <Link href={`/product/${p.id}`} className="hover:text-rose transition-colors">
                    {p.code}
                  </Link>
                </Td>
                <Td>{p.name}</Td>
                <Td>
                  <Badge tone="info">{p.category}</Badge>
                </Td>
                <Td className="text-right">{p.stock}</Td>
                <Td className="text-right font-semibold whitespace-nowrap">
                  {formatRupiah(p.price)}
                </Td>
                <Td className="text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/product/${p.id}`} className="text-xs text-espresso-soft hover:text-rose">
                      Edit
                    </Link>
                    <DeleteButton
                      action={deleteProduct.bind(null, p.id)}
                      confirmDescription="Product yang sudah pernah dipakai di transaksi penjualan tidak bisa dihapus."
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
