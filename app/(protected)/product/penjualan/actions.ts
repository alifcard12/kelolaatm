"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function randomAlnum(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

async function generateUniqueInvoiceNo(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = `INV-${randomAlnum(8)}`;
    const exists = await prisma.sale.findUnique({ where: { invoiceNo: code } });
    if (!exists) return code;
  }
  throw new Error("Gagal membuat No. Transaksi. Coba simpan ulang.");
}

// Parse value input datetime-local ("YYYY-MM-DDTHH:mm") jadi satu Date,
// diperlakukan sebagai waktu Jakarta (UTC+7).
function parseJakartaDateTime(dateTimeRaw: string): Date {
  const raw = dateTimeRaw.trim();
  if (!raw) throw new Error("Tanggal & jam penjualan wajib diisi.");
  const [date, time] = raw.split("T");
  if (!date) throw new Error("Tanggal & jam penjualan tidak valid.");
  const safeTime = (time || "00:00").slice(0, 5);
  const parsed = new Date(`${date}T${safeTime}:00+07:00`);
  if (Number.isNaN(parsed.getTime())) throw new Error("Tanggal & jam penjualan tidak valid.");
  return parsed;
}

type ParsedItem = { productId: string; quantity: number };

type SaleInput = {
  saleDate: Date;
  customerName: string;
  items: ParsedItem[];
};

function parseSaleForm(formData: FormData): SaleInput {
  const customerName = String(formData.get("customerName") ?? "").trim();
  const dateTimeRaw = String(formData.get("saleDateTime") ?? "");
  const itemsRaw = String(formData.get("itemsJson") ?? "[]");

  if (!customerName) {
    throw new Error("Nama pelanggan wajib diisi.");
  }

  const saleDate = parseJakartaDateTime(dateTimeRaw);

  let parsed: unknown;
  try {
    parsed = JSON.parse(itemsRaw);
  } catch {
    throw new Error("Data barang tidak valid.");
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Pilih minimal 1 barang untuk penjualan ini.");
  }

  const items: ParsedItem[] = parsed.map((raw) => {
    const item = raw as { productId?: unknown; quantity?: unknown };
    const productId = String(item.productId ?? "").trim();
    const quantity = Math.round(Number(item.quantity ?? 0));
    if (!productId) throw new Error("Barang tidak valid dipilih.");
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new Error("Jumlah barang harus lebih dari 0.");
    }
    return { productId, quantity };
  });

  // Gabungkan kalau ada barang yang sama dipilih di lebih dari 1 baris.
  const merged = new Map<string, number>();
  for (const it of items) {
    merged.set(it.productId, (merged.get(it.productId) ?? 0) + it.quantity);
  }

  return {
    saleDate,
    customerName,
    items: Array.from(merged.entries()).map(([productId, quantity]) => ({ productId, quantity })),
  };
}

export async function createSale(formData: FormData) {
  const input = parseSaleForm(formData);
  const invoiceNo = await generateUniqueInvoiceNo();

  await prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany({
      where: { id: { in: input.items.map((i) => i.productId) } },
    });
    const productById = new Map(products.map((p) => [p.id, p]));

    let totalAmount = 0;
    const itemsData: {
      productId: string;
      productName: string;
      productCode: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }[] = [];

    for (const item of input.items) {
      const product = productById.get(item.productId);
      if (!product) throw new Error("Salah satu barang yang dipilih tidak ditemukan.");
      if (product.stock < item.quantity) {
        throw new Error(`Stock "${product.name}" tidak cukup (tersisa ${product.stock}).`);
      }
      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;
      itemsData.push({
        productId: product.id,
        productName: product.name,
        productCode: product.code,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal,
      });
    }

    const sale = await tx.sale.create({
      data: {
        invoiceNo,
        saleDate: input.saleDate,
        customerName: input.customerName,
        totalAmount,
      },
    });

    for (const item of itemsData) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });

      const financeEntry = await tx.financeEntry.create({
        data: {
          date: input.saleDate,
          description: item.productName,
          type: "DEBIT",
          amount: item.subtotal,
          category: "OPERASIONAL",
        },
      });

      await tx.saleItem.create({
        data: {
          saleId: sale.id,
          productId: item.productId,
          productName: item.productName,
          productCode: item.productCode,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          financeEntryId: financeEntry.id,
        },
      });
    }
  });

  revalidatePath("/product/daftar");
  revalidatePath("/product/penjualan");
  revalidatePath("/finance");
  redirect("/product/penjualan");
}

export async function updateSale(id: string, formData: FormData) {
  const input = parseSaleForm(formData);

  await prisma.$transaction(async (tx) => {
    const existing = await tx.sale.findUnique({ where: { id }, include: { items: true } });
    if (!existing) throw new Error("Data penjualan tidak ditemukan.");

    // Kembalikan stock dari item-item lama sebelum menghitung ulang.
    for (const oldItem of existing.items) {
      if (oldItem.productId) {
        await tx.product.update({
          where: { id: oldItem.productId },
          data: { stock: { increment: oldItem.quantity } },
        });
      }
    }

    const products = await tx.product.findMany({
      where: { id: { in: input.items.map((i) => i.productId) } },
    });
    const productById = new Map(products.map((p) => [p.id, p]));

    let totalAmount = 0;
    const itemsData: {
      productId: string;
      productName: string;
      productCode: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }[] = [];

    for (const item of input.items) {
      const product = productById.get(item.productId);
      if (!product) throw new Error("Salah satu barang yang dipilih tidak ditemukan.");
      if (product.stock < item.quantity) {
        throw new Error(`Stock "${product.name}" tidak cukup (tersisa ${product.stock}).`);
      }
      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;
      itemsData.push({
        productId: product.id,
        productName: product.name,
        productCode: product.code,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal,
      });
    }

    // Hapus item & finance entry lama, lalu buat ulang sesuai data baru.
    const oldFinanceEntryIds = existing.items
      .map((it) => it.financeEntryId)
      .filter((v): v is string => Boolean(v));

    await tx.saleItem.deleteMany({ where: { saleId: id } });
    if (oldFinanceEntryIds.length > 0) {
      await tx.financeEntry.deleteMany({ where: { id: { in: oldFinanceEntryIds } } });
    }

    await tx.sale.update({
      where: { id },
      data: {
        saleDate: input.saleDate,
        customerName: input.customerName,
        totalAmount,
      },
    });

    for (const item of itemsData) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });

      const financeEntry = await tx.financeEntry.create({
        data: {
          date: input.saleDate,
          description: item.productName,
          type: "DEBIT",
          amount: item.subtotal,
          category: "OPERASIONAL",
        },
      });

      await tx.saleItem.create({
        data: {
          saleId: id,
          productId: item.productId,
          productName: item.productName,
          productCode: item.productCode,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          financeEntryId: financeEntry.id,
        },
      });
    }
  });

  revalidatePath("/product/daftar");
  revalidatePath("/product/penjualan");
  revalidatePath("/finance");
  redirect("/product/penjualan");
}

export async function deleteSale(id: string) {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.sale.findUnique({ where: { id }, include: { items: true } });
    if (!existing) return;

    // Kembalikan stock tiap barang yang masih terhubung ke product-nya.
    for (const item of existing.items) {
      if (item.productId) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    const financeEntryIds = existing.items
      .map((it) => it.financeEntryId)
      .filter((v): v is string => Boolean(v));

    await tx.sale.delete({ where: { id } });

    if (financeEntryIds.length > 0) {
      await tx.financeEntry.deleteMany({ where: { id: { in: financeEntryIds } } }).catch(() => {
        // best-effort: kalau entri financenya sudah kehapus/berubah duluan, abaikan
      });
    }
  });

  revalidatePath("/product/daftar");
  revalidatePath("/product/penjualan");
  revalidatePath("/finance");
}
