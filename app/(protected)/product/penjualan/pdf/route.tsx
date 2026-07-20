import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { SaleInvoicePdfDoc, type SaleInvoiceData } from "./SaleInvoicePdfDoc";

// react-pdf butuh Node.js runtime (bukan Edge).
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get("ids") ?? undefined;
  const ids = idsParam ? idsParam.split(",").filter(Boolean) : undefined;

  const sales = await prisma.sale.findMany({
    where: ids ? { id: { in: ids } } : undefined,
    orderBy: { saleDate: "asc" },
    include: { items: true },
  });

  const logoPath = path.join(
    process.cwd(),
    "public",
    "branding",
    "surya-computer-logo.png",
  );
  const logoBuffer = await readFile(logoPath);
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  const invoiceData: SaleInvoiceData[] = sales.map((s) => ({
    invoiceNo: s.invoiceNo,
    customerName: s.customerName,
    saleDate: s.saleDate,
    totalAmount: s.totalAmount,
    items: s.items.map((it) => ({
      productName: it.productName,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      subtotal: it.subtotal,
    })),
  }));

  const buffer = await renderToBuffer(
    <SaleInvoicePdfDoc sales={invoiceData} logoSrc={logoSrc} />,
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
  const filename = `Invoice_Sale_${currentDate}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      // Masukkan filename dinamis ke dalam Content-Disposition
      "Content-Disposition": `${disposition}; filename="${filename}"`,
    },
  });
}
