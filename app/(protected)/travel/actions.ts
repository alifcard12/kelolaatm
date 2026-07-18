"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const VEHICLES = ["AVANZA", "XENIA", "SIGRA", "XPANDER"] as const;
const INVOICE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function randomInvoiceCode(): string {
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += INVOICE_CHARS[Math.floor(Math.random() * INVOICE_CHARS.length)];
  }
  return out;
}

async function generateUniqueInvoiceNo(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = randomInvoiceCode();
    const exists = await prisma.travel.findUnique({ where: { invoiceNo: code } });
    if (!exists) return code;
  }
  throw new Error("Gagal membuat nomor invoice. Coba simpan ulang.");
}

// Parse "YYYY-MM-DD" dari <input type="date"> sebagai tengah malam Jakarta (UTC+7).
function parseJakartaDate(raw: string, label: string): Date {
  const value = raw.trim();
  if (!value) throw new Error(`${label} wajib diisi.`);
  const date = new Date(`${value}T00:00:00+07:00`);
  if (Number.isNaN(date.getTime())) throw new Error(`${label} tidak valid.`);
  return date;
}

type TravelInput = {
  customerName: string;
  orderDate: Date;
  departureDate: Date;
  origin: string;
  destination: string;
  vehicle: (typeof VEHICLES)[number];
  price: number;
  passengerCount: number;
};

function parseTravelForm(formData: FormData): TravelInput {
  const customerName = String(formData.get("customerName") ?? "").trim();
  const origin = String(formData.get("origin") ?? "").trim();
  const destination = String(formData.get("destination") ?? "").trim();
  const vehicle = String(formData.get("vehicle") ?? "");
  const priceRaw = String(formData.get("price") ?? "").trim();
  const passengerRaw = String(formData.get("passengerCount") ?? "").trim();

  if (!customerName || !origin || !destination) {
    throw new Error("Nama pelanggan, asal, dan tujuan wajib diisi.");
  }
  if (!VEHICLES.includes(vehicle as (typeof VEHICLES)[number])) {
    throw new Error("Kendaraan tidak valid.");
  }

  const orderDate = parseJakartaDate(String(formData.get("orderDate") ?? ""), "Tanggal pesan");
  const departureDate = parseJakartaDate(
    String(formData.get("departureDate") ?? ""),
    "Tanggal berangkat"
  );

  const price = Math.round(Number(priceRaw));
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("Harga harus berupa angka lebih dari 0.");
  }

  const passengerCount = Math.round(Number(passengerRaw));
  if (!Number.isFinite(passengerCount) || passengerCount <= 0) {
    throw new Error("Jumlah orang harus berupa angka lebih dari 0.");
  }

  return {
    customerName,
    orderDate,
    departureDate,
    origin,
    destination,
    vehicle: vehicle as (typeof VEHICLES)[number],
    price,
    passengerCount,
  };
}

function financeDataFor(input: TravelInput) {
  return {
    date: input.orderDate,
    description: `Transport ${input.origin} - ${input.destination}`,
    type: "DEBIT" as const,
    amount: input.price,
    category: "TRANSPORTASI" as const,
  };
}

export async function createTravel(formData: FormData) {
  const input = parseTravelForm(formData);
  const invoiceNo = await generateUniqueInvoiceNo();

  await prisma.$transaction(async (tx) => {
    const financeEntry = await tx.financeEntry.create({ data: financeDataFor(input) });

    await tx.travel.create({
      data: {
        invoiceNo,
        customerName: input.customerName,
        orderDate: input.orderDate,
        departureDate: input.departureDate,
        origin: input.origin,
        destination: input.destination,
        vehicle: input.vehicle,
        price: input.price,
        passengerCount: input.passengerCount,
        financeEntryId: financeEntry.id,
      },
    });
  });

  revalidatePath("/travel");
  revalidatePath("/finance");
  redirect("/travel");
}

export async function updateTravel(id: string, formData: FormData) {
  const input = parseTravelForm(formData);

  await prisma.$transaction(async (tx) => {
    const existing = await tx.travel.findUnique({ where: { id } });
    if (!existing) throw new Error("Data travel tidak ditemukan.");

    if (existing.financeEntryId) {
      await tx.financeEntry.update({
        where: { id: existing.financeEntryId },
        data: financeDataFor(input),
      });
    } else {
      // Data lama sebelum fitur sinkronisasi ada — buatkan finance entry-nya sekarang.
      const financeEntry = await tx.financeEntry.create({ data: financeDataFor(input) });
      await tx.travel.update({
        where: { id },
        data: { financeEntryId: financeEntry.id },
      });
    }

    await tx.travel.update({
      where: { id },
      data: {
        customerName: input.customerName,
        orderDate: input.orderDate,
        departureDate: input.departureDate,
        origin: input.origin,
        destination: input.destination,
        vehicle: input.vehicle,
        price: input.price,
        passengerCount: input.passengerCount,
      },
    });
  });

  revalidatePath("/travel");
  revalidatePath("/finance");
  redirect("/travel");
}

export async function deleteTravel(id: string) {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.travel.findUnique({ where: { id } });
    if (!existing) return;

    await tx.travel.delete({ where: { id } });

    if (existing.financeEntryId) {
      await tx.financeEntry.delete({ where: { id: existing.financeEntryId } }).catch(() => {
        // best-effort: kalau entri financenya sudah kehapus/berubah duluan, abaikan
      });
    }
  });

  revalidatePath("/travel");
  revalidatePath("/finance");
}
