"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentJakartaMonthKey } from "@/lib/date";

const FINANCE_TYPES = ["DEBIT", "CREDIT"] as const;
const FINANCE_CATEGORIES = [
  "KETERANGAN",
  "TRANSPORTASI",
  "SPJ",
  "HOTEL",
  "PENGIRIMAN",
  "OPERASIONAL",
] as const;

type FinanceInput = {
  date: Date;
  description: string;
  type: (typeof FINANCE_TYPES)[number];
  amount: number;
  category: (typeof FINANCE_CATEGORIES)[number];
  notes: string | null;
};

function parseFinanceForm(formData: FormData): FinanceInput {
  const dateRaw = String(formData.get("date") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!dateRaw || !description || !amountRaw) {
    throw new Error("Tanggal, deskripsi, dan jumlah wajib diisi.");
  }

  // Input <input type="date"> berformat "YYYY-MM-DD". Kita perlakukan sebagai
  // tanggal Jakarta jam 00:00, disimpan sebagai UTC 00:00 - 7 jam supaya
  // konsisten dengan monthKeyToJakartaRange di lib/date.ts.
  const date = new Date(`${dateRaw}T00:00:00+07:00`);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Tanggal tidak valid.");
  }

  if (!FINANCE_TYPES.includes(type as (typeof FINANCE_TYPES)[number])) {
    throw new Error("Tipe transaksi tidak valid.");
  }
  if (!FINANCE_CATEGORIES.includes(category as (typeof FINANCE_CATEGORIES)[number])) {
    throw new Error("Kategori tidak valid.");
  }

  const amount = Math.round(Number(amountRaw));
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Jumlah harus berupa angka lebih dari 0.");
  }

  return {
    date,
    description,
    type: type as (typeof FINANCE_TYPES)[number],
    amount,
    category: category as (typeof FINANCE_CATEGORIES)[number],
    notes,
  };
}

function monthKeyOf(date: Date): string {
  // date sudah kita simpan sebagai "tengah malam Jakarta", jadi ambil tahun/bulan dari komponen UTC + koreksi kecil aman
  const jakarta = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return `${jakarta.getUTCFullYear()}-${String(jakarta.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function createFinanceEntry(formData: FormData) {
  const data = parseFinanceForm(formData);

  await prisma.financeEntry.create({ data });

  const month = monthKeyOf(data.date) || currentJakartaMonthKey();
  revalidatePath("/finance");
  redirect(`/finance?month=${month}`);
}

export async function updateFinanceEntry(id: string, formData: FormData) {
  const data = parseFinanceForm(formData);

  await prisma.financeEntry.update({ where: { id }, data });

  const month = monthKeyOf(data.date) || currentJakartaMonthKey();
  revalidatePath("/finance");
  redirect(`/finance?month=${month}`);
}

export async function deleteFinanceEntry(id: string) {
  await prisma.financeEntry.delete({ where: { id } });
  revalidatePath("/finance");
}
