import { createProduct } from "../actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ActionForm } from "@/components/ui/ActionForm";

export default function NewProductPage() {
  return (
    <div className="max-w-md">
      <PageHeader
        title="Tambah Product"
        description="Data product baru untuk dijual di halaman Penjualan."
      />

      <Card>
        <ActionForm
          action={createProduct}
          successMessage="Product berhasil ditambahkan"
          className="flex flex-col gap-4"
        >
          <Field label="Kode Product" htmlFor="code">
            <Input id="code" name="code" type="text" required placeholder="mis. PRD-001" />
          </Field>

          <Field label="Nama Product" htmlFor="name">
            <Input id="name" name="name" type="text" required />
          </Field>

          <Field label="Kategori" htmlFor="category">
            <Input id="category" name="category" type="text" required placeholder="mis. Sparepart" />
          </Field>

          <Field label="Stock" htmlFor="stock">
            <Input id="stock" name="stock" type="number" min={0} step={1} required placeholder="0" />
          </Field>

          <Field label="Harga (Rp)" htmlFor="price">
            <Input id="price" name="price" type="number" min={1} step={1} required placeholder="0" />
          </Field>

          <Button type="submit" className="mt-2 self-start">
            Simpan
          </Button>
        </ActionForm>
      </Card>
    </div>
  );
}
