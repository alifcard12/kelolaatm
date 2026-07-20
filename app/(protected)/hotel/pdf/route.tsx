import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { HotelInvoicePdfDoc } from "./HotelInvoicePdfDoc";

// react-pdf butuh Node.js runtime (bukan Edge).
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get("ids") ?? undefined;
  const ids = idsParam ? idsParam.split(",").filter(Boolean) : undefined;

  const hotels = await prisma.hotel.findMany({
    where: ids ? { id: { in: ids } } : undefined,
    orderBy: [{ checkinDate: "asc" }, { createdAt: "asc" }],
  });

  // Pakai logo bisnis sendiri — sama dengan yang dipakai di invoice travel.
  // Ganti file di public/branding kalau mau logo khusus hotel.
  const logoPath = path.join(process.cwd(), "public", "logo-traveloka.png");
  const logoBuffer = await readFile(logoPath);
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  const paidLogoPath = path.join(process.cwd(), "public", "logo-paid.png");
  const paidLogoBuffer = await readFile(paidLogoPath);
  const paidLogoSrc = `data:image/png;base64,${paidLogoBuffer.toString("base64")}`;

  const buffer = await renderToBuffer(
    <HotelInvoicePdfDoc
      hotels={hotels}
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
