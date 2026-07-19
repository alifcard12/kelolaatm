import { prisma } from "@/lib/prisma";
import { deleteProduct } from "./actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { FiPlus } from "react-icons/fi";
import { ProductNav } from "./ProductNav";
import { ProductListClient } from "./ProductListClient";

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

      <ProductListClient products={products} onDelete={deleteProduct} />
    </div>
  );
}
