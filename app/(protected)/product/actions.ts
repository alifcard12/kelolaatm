"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type ProductInput = {
  code: string;
  name: string;
  category: string;
  stock: number;
  price: number;
};

function parseProductForm(formData: FormData): ProductInput {
  const code = String(formData.get("code") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const stockRaw = String(formData.get("stock") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();

  if (!code || !name || !category) {
    throw new Error("Kode product, nama product, dan kategori wajib diisi.");
  }

  const stock = Math.round(Number(stockRaw));
  if (!Number.isFinite(stock) || stock < 0) {
    throw new Error("Stock harus berupa angka 0 atau lebih.");
  }

  const price = Math.round(Number(priceRaw));
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("Harga harus berupa angka lebih dari 0.");
  }

  return { code, name, category, stock, price };
}

export async function createProduct(formData: FormData) {
  const input = parseProductForm(formData);

  const existing = await prisma.product.findUnique({ where: { code: input.code } });
  if (existing) throw new Error("Kode product sudah dipakai product lain.");

  await prisma.product.create({ data: input });

  revalidatePath("/product/daftar");
  redirect("/product/daftar");
}

export async function updateProduct(id: string, formData: FormData) {
  const input = parseProductForm(formData);

  const duplicate = await prisma.product.findFirst({
    where: { code: input.code, NOT: { id } },
  });
  if (duplicate) throw new Error("Kode product sudah dipakai product lain.");

  await prisma.product.update({ where: { id }, data: input });

  revalidatePath("/product/daftar");
  redirect("/product/daftar");
}

export async function deleteProduct(id: string) {
  const used = await prisma.saleItem.findFirst({ where: { productId: id } });
  if (used) {
    throw new Error(
      "Product ini sudah pernah dipakai di transaksi Penjualan dan tidak bisa dihapus."
    );
  }

  await prisma.product.delete({ where: { id } });
  revalidatePath("/product/daftar");
}
