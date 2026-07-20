"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const ROOM_TYPES = ["SUPER_SINGLE", "DELUXE_DOUBLE", "DELUXE_TWIN", "EXECUTIVE"] as const;
const PAYMENT_METHODS = ["ALFAMART", "BRIVA", "INDOMARET", "OVO", "SHOPEEPAY", "QRIS"] as const;

function randomDigits(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += Math.floor(Math.random() * 10).toString();
  }
  return out;
}

async function generateUniqueBookingNo(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = randomDigits(19);
    const exists = await prisma.hotel.findUnique({ where: { bookingNo: code } });
    if (!exists) return code;
  }
  throw new Error("Gagal membuat No. Booking. Coba simpan ulang.");
}

async function generateUniquePoBooking(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = randomDigits(9);
    const exists = await prisma.hotel.findUnique({ where: { poBooking: code } });
    if (!exists) return code;
  }
  throw new Error("Gagal membuat PO Booking. Coba simpan ulang.");
}

// Parse "YYYY-MM-DD" dari <input type="date"> sebagai tengah malam Jakarta (UTC+7).
function parseJakartaDate(raw: string, label: string): Date {
  const value = raw.trim();
  if (!value) throw new Error(`${label} wajib diisi.`);
  const date = new Date(`${value}T00:00:00+07:00`);
  if (Number.isNaN(date.getTime())) throw new Error(`${label} tidak valid.`);
  return date;
}

type HotelInput = {
  customerName: string;
  email: string;
  phone: string;
  bookingDate: Date;
  checkinDate: Date;
  hotelName: string;
  hotelAddress: string;
  roomType: (typeof ROOM_TYPES)[number];
  duration: number;
  guestCount: number;
  price: number;
  paymentMethod: (typeof PAYMENT_METHODS)[number];
};

function parseHotelForm(formData: FormData): HotelInput {
  const customerName = String(formData.get("customerName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const hotelName = String(formData.get("hotelName") ?? "").trim();
  const hotelAddress = String(formData.get("hotelAddress") ?? "").trim();
  const roomType = String(formData.get("roomType") ?? "");
  const paymentMethod = String(formData.get("paymentMethod") ?? "");
  const durationRaw = String(formData.get("duration") ?? "").trim();
  const guestRaw = String(formData.get("guestCount") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();

  if (!customerName || !email || !phone || !hotelName || !hotelAddress) {
    throw new Error("Nama pelanggan, email, telepon, nama hotel, dan alamat hotel wajib diisi.");
  }
  if (!ROOM_TYPES.includes(roomType as (typeof ROOM_TYPES)[number])) {
    throw new Error("Tipe kamar tidak valid.");
  }
  if (!PAYMENT_METHODS.includes(paymentMethod as (typeof PAYMENT_METHODS)[number])) {
    throw new Error("Metode pembayaran tidak valid.");
  }

  const bookingDate = parseJakartaDate(String(formData.get("bookingDate") ?? ""), "Tanggal booking");
  const checkinDate = parseJakartaDate(String(formData.get("checkinDate") ?? ""), "Tanggal checkin");

  const duration = Math.round(Number(durationRaw));
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error("Durasi harus berupa angka lebih dari 0.");
  }

  const guestCount = Math.round(Number(guestRaw));
  if (!Number.isFinite(guestCount) || guestCount <= 0) {
    throw new Error("Jumlah tamu harus berupa angka lebih dari 0.");
  }

  const price = Math.round(Number(priceRaw));
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("Harga harus berupa angka lebih dari 0.");
  }

  return {
    customerName,
    email,
    phone,
    bookingDate,
    checkinDate,
    hotelName,
    hotelAddress,
    roomType: roomType as (typeof ROOM_TYPES)[number],
    duration,
    guestCount,
    price,
    paymentMethod: paymentMethod as (typeof PAYMENT_METHODS)[number],
  };
}

function financeDataFor(input: HotelInput) {
  return {
    date: input.bookingDate,
    description: input.hotelName,
    type: "DEBIT" as const,
    amount: input.price,
    category: "HOTEL" as const,
  };
}

export async function createHotel(formData: FormData) {
  const input = parseHotelForm(formData);
  const bookingNo = await generateUniqueBookingNo();
  const poBooking = await generateUniquePoBooking();

  await prisma.$transaction(async (tx) => {
    const financeEntry = await tx.financeEntry.create({ data: financeDataFor(input) });

    await tx.hotel.create({
      data: {
        bookingNo,
        poBooking,
        customerName: input.customerName,
        email: input.email,
        phone: input.phone,
        bookingDate: input.bookingDate,
        checkinDate: input.checkinDate,
        hotelName: input.hotelName,
        hotelAddress: input.hotelAddress,
        roomType: input.roomType,
        duration: input.duration,
        guestCount: input.guestCount,
        price: input.price,
        paymentMethod: input.paymentMethod,
        financeEntryId: financeEntry.id,
      },
    });
  });

  revalidatePath("/hotel");
  revalidatePath("/finance");
  redirect("/hotel");
}

export async function updateHotel(id: string, formData: FormData) {
  const input = parseHotelForm(formData);

  await prisma.$transaction(async (tx) => {
    const existing = await tx.hotel.findUnique({ where: { id } });
    if (!existing) throw new Error("Data hotel tidak ditemukan.");

    if (existing.financeEntryId) {
      await tx.financeEntry.update({
        where: { id: existing.financeEntryId },
        data: financeDataFor(input),
      });
    } else {
      // Data lama sebelum fitur sinkronisasi ada — buatkan finance entry-nya sekarang.
      const financeEntry = await tx.financeEntry.create({ data: financeDataFor(input) });
      await tx.hotel.update({
        where: { id },
        data: { financeEntryId: financeEntry.id },
      });
    }

    await tx.hotel.update({
      where: { id },
      data: {
        customerName: input.customerName,
        email: input.email,
        phone: input.phone,
        bookingDate: input.bookingDate,
        checkinDate: input.checkinDate,
        hotelName: input.hotelName,
        hotelAddress: input.hotelAddress,
        roomType: input.roomType,
        duration: input.duration,
        guestCount: input.guestCount,
        price: input.price,
        paymentMethod: input.paymentMethod,
      },
    });
  });

  revalidatePath("/hotel");
  revalidatePath("/finance");
  redirect("/hotel");
}

export async function deleteHotel(id: string) {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.hotel.findUnique({ where: { id } });
    if (!existing) return;

    await tx.hotel.delete({ where: { id } });

    if (existing.financeEntryId) {
      await tx.financeEntry.delete({ where: { id: existing.financeEntryId } }).catch(() => {
        // best-effort: kalau entri financenya sudah kehapus/berubah duluan, abaikan
      });
    }
  });

  revalidatePath("/hotel");
  revalidatePath("/finance");
}
