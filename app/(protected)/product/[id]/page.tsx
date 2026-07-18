import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateProduct, deleteProduct } from "../actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ActionForm } from "@/components/ui/ActionForm";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { FiChevronLeft } from "react-icons/fi";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  const updateProductWithId = updateProduct.bind(null, product.id);

  async function deleteAndRedirect() {
    "use server";
    await deleteProduct(product!.id);
    redirect("/product");
  }

  return (
    <div className="max-w-md">
      <Link
        href="/product"
        className="inline-flex items-center gap-1 text-xs text-espresso-soft hover:text-rose mb-2"
      >
        <FiChevronLeft /> Kembali ke Product
      </Link>

      <PageHeader
        title={product.name}
        description="Perubahan stock & harga di sini tidak mengubah transaksi penjualan yang sudah pernah dibuat."
        action={
          <DeleteButton
            action={deleteAndRedirect}
            label="Hapus Product"
            confirmDescription="Product yang sudah pernah dipakai di transaksi penjualan tidak bisa dihapus."
          />
        }
      />

      <Card>
        <ActionForm
          action={updateProductWithId}
          successMessage="Product berhasil diperbarui"
          className="flex flex-col gap-4"
        >
          <Field label="Kode Product" htmlFor="code">
            <Input id="code" name="code" type="text" required defaultValue={product.code} />
          </Field>

          <Field label="Nama Product" htmlFor="name">
            <Input id="name" name="name" type="text" required defaultValue={product.name} />
          </Field>

          <Field label="Kategori" htmlFor="category">
            <Input id="category" name="category" type="text" required defaultValue={product.category} />
          </Field>

          <Field label="Stock" htmlFor="stock">
            <Input
              id="stock"
              name="stock"
              type="number"
              min={0}
              step={1}
              required
              defaultValue={product.stock}
            />
          </Field>

          <Field label="Harga (Rp)" htmlFor="price">
            <Input
              id="price"
              name="price"
              type="number"
              min={1}
              step={1}
              required
              defaultValue={product.price}
            />
          </Field>

          <Button type="submit" className="mt-2 self-start">
            Simpan Perubahan
          </Button>
        </ActionForm>
      </Card>
    </div>
  );
}
