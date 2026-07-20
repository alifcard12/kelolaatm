import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { HotelInvoicePdfDoc } from "./HotelInvoicePdfDoc";

interface HotelInvoiceData {
  bookingNo: string;
  poBooking: string;
  bookingDate: Date;
  paymentMethod: string;
  transactionStatus: string;
  customerName: string;
  email: string;
  phone: string;
  hotelName: string;
  hotelAddress: string;
  checkInDate: Date;
  duration: number;
  roomType: string;
  guestCount: number;
  price: number;
  totalPrice: number;
}

// react-pdf butuh Node.js runtime (bukan Edge).
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get("ids") ?? undefined;
  const ids = idsParam ? idsParam.split(",").filter(Boolean) : undefined;

  // 1. Ambil data dari Prisma
  const rawHotels = await prisma.hotel.findMany({
    where: ids ? { id: { in: ids } } : undefined,
    orderBy: [{ checkinDate: "asc" }, { createdAt: "asc" }],
  });

  // 2. Transformasi (map) data Prisma agar sesuai dengan tipe HotelInvoiceData
  const formattedHotels: HotelInvoiceData[] = rawHotels.map((hotel) => ({
    bookingNo: hotel.bookingNo,
    poBooking: hotel.poBooking,
    bookingDate: hotel.bookingDate,
    paymentMethod: hotel.paymentMethod,
    transactionStatus: "Lunas", // Diisi manual karena tidak ada di DB
    customerName: hotel.customerName,
    email: hotel.email,
    phone: hotel.phone,
    hotelName: hotel.hotelName,
    hotelAddress: hotel.hotelAddress,
    checkInDate: hotel.checkinDate, // Memperbaiki perbedaan penulisan camelCase
    duration: hotel.duration,
    roomType: hotel.roomType,
    guestCount: hotel.guestCount,
    price: hotel.price,
    totalPrice: hotel.price * hotel.duration, // Kalkulasi manual total harga
  }));

  const logoPath = path.join(process.cwd(), "public", "logo-traveloka.png");
  const logoBuffer = await readFile(logoPath);
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  const paidLogoPath = path.join(process.cwd(), "public", "logo-paid.png");
  const paidLogoBuffer = await readFile(paidLogoPath);
  const paidLogoSrc = `data:image/png;base64,${paidLogoBuffer.toString("base64")}`;

  // 3. Masukkan formattedHotels ke dalam komponen
  const buffer = await renderToBuffer(
    <HotelInvoicePdfDoc
      hotels={formattedHotels}
      logoSrc={logoSrc}
      paidLogoSrc={paidLogoSrc}
    />,
  );

  const isInline = request.nextUrl.searchParams.get("inline") === "1";
  const disposition = isInline ? "inline" : "attachment";

  const currentDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const filename = `Invoice_Hotel_${currentDate}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${disposition}; filename="${filename}"`,
    },
  });
}
