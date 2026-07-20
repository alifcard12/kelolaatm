import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { TravelInvoicePdfDoc } from "./TravelInvoicePdfDoc";

// react-pdf butuh Node.js runtime (bukan Edge).
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get("ids") ?? undefined;
  const ids = idsParam ? idsParam.split(",").filter(Boolean) : undefined;

  const travels = await prisma.travel.findMany({
    where: ids ? { id: { in: ids } } : undefined,
    orderBy: [{ departureDate: "asc" }, { createdAt: "asc" }],
  });

  const logoPath = path.join(
    process.cwd(),
    "public",
    "branding",
    "travel-bus.png",
  );
  const logoBuffer = await readFile(logoPath);
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  const buffer = await renderToBuffer(
    <TravelInvoicePdfDoc travels={travels} logoSrc={logoSrc} />,
  );

  const isInline = request.nextUrl.searchParams.get("inline") === "1";
  const disposition = isInline ? "inline" : "attachment";

  // Dapatkan tanggal hari ini (YYYY-MM-DD) di zona waktu Jakarta
  const currentDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  // Buat string nama file yang dinamis
  const filename = `Invoice_Travel_${currentDate}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      // Masukkan filename dinamis ke dalam Content-Disposition
      "Content-Disposition": `${disposition}; filename="${filename}"`,
    },
  });
}
