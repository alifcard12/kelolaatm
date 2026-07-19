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
import { FiArrowLeft, FiSave, FiTrash } from "react-icons/fi";

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
    redirect("/product/daftar");
  }

  return (
    <div className="max-w-md">
      <Link
        href="/product/daftar"
        className="inline-flex items-center gap-1 text-xs text-espresso-soft hover:text-rose mb-2"
      >
        <FiArrowLeft /> Back to Product
      </Link>

      <PageHeader
        title={product.name}
        description=""
        action={
          <DeleteButton
            action={deleteAndRedirect}
            label={
              <div className="inline-flex items-center px-2 py-1.5 rounded-lg gap-1 bg-rose text-paper hover:bg-rose-dark active:bg-rose-dark shadow-sm shadow-rose/20">
                <FiTrash /> Hapus Product
              </div>
            }
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
            <Input
              id="code"
              name="code"
              type="text"
              required
              defaultValue={product.code}
            />
          </Field>

          <Field label="Nama Product" htmlFor="name">
            <Input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={product.name}
            />
          </Field>

          <Field label="Kategori" htmlFor="category">
            <Input
              id="category"
              name="category"
              type="text"
              required
              defaultValue={product.category}
            />
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

          <Button variant="success" type="submit" className="mt-2 self-start">
            <FiSave />
            Simpan
          </Button>
        </ActionForm>
      </Card>
    </div>
  );
}
