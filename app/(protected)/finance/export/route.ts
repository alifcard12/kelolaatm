import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { monthKeyLabel, monthKeyToJakartaRange, normalizeMonthKey } from "@/lib/date";
import { buildFinanceReportWorkbook } from "@/lib/financeExportTemplate";

export async function GET(request: NextRequest) {
  const monthParam = request.nextUrl.searchParams.get("month") ?? undefined;
  const month = normalizeMonthKey(monthParam);
  const { start, end } = monthKeyToJakartaRange(month);

  const entries = await prisma.financeEntry.findMany({
    where: { date: { gte: start, lt: end } },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    select: { date: true, description: true, type: true, amount: true, category: true },
  });

  const logoPath = path.join(process.cwd(), "public", "branding", "logo.png");
  const logoBuffer = await readFile(logoPath).catch(() => undefined);

  const workbook = buildFinanceReportWorkbook(month, entries, logoBuffer);
  const buffer = await workbook.xlsx.writeBuffer();

  // "Laporan Operasional Alif Januari 2026.xlsx"
  const filename = `Laporan Operasional Alif ${monthKeyLabel(month)}.xlsx`;
  const encodedFilename = encodeURIComponent(filename);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodedFilename}`,
    },
  });
}
