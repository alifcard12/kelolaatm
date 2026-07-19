import ExcelJS from "exceljs";
import { monthKeyLabel } from "@/lib/date";

// Data header laporan — tidak ada di database, jadi disimpan sebagai konstanta.
// Ubah di sini kalau nama engineer / RO / penandatangan berubah.
export const FINANCE_REPORT_META = {
  companyName: "PT. INSAN TEKNOLOGI SEMESTA",
  engineerName: "ALIF AYATULLAH",
  ro: "BRI - MADIUN",
  signatures: {
    membuat: "Della Nopianty",
    mengetahui: "Alexs Ramadhani",
    menyetujui: "Ratna Safitri",
  },
};

// Urutan section persis seperti di file contoh. KETERANGAN tidak dapat baris
// judul kategori (langsung nempel di bawah header tabel), sisanya dapat.
const CATEGORY_ORDER = [
  "KETERANGAN",
  "TRANSPORTASI",
  "SPJ",
  "HOTEL",
  "PENGIRIMAN",
  "OPERASIONAL",
] as const;

type FinanceCategory = (typeof CATEGORY_ORDER)[number];

export type FinanceExportEntry = {
  date: Date;
  description: string;
  type: "DEBIT" | "CREDIT";
  amount: number;
  category: string;
};

const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFD9D9D9" },
};

const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: "thin" },
  bottom: { style: "thin" },
  left: { style: "thin" },
  right: { style: "thin" },
};

const ACCOUNTING_FMT = '_(* #,##0_);_(* (#,##0);_(* "-"??_);_(@_)';

function applyDataRowStyle(row: ExcelJS.Row) {
  for (let col = 1; col <= 6; col++) {
    const cell = row.getCell(col);
    cell.border = THIN_BORDER;
    cell.font = { name: "Calibri", size: 9 };
    if (col === 1) cell.alignment = { horizontal: "center" };
    if (col === 2) {
      cell.alignment = { horizontal: "center" };
      cell.numFmt = "d-mmm-yy";
    }
    if (col === 4 || col === 5 || col === 6) cell.numFmt = ACCOUNTING_FMT;
  }
}

/**
 * Membuat workbook Excel dengan format PERSIS seperti template
 * "Laporan Dana Operasional" — hanya data transaksi & bulan yang berubah.
 */
export function buildFinanceReportWorkbook(
  monthKey: string,
  entries: FinanceExportEntry[],
  logoBuffer?: Buffer,
): ExcelJS.Workbook {
  const wb = new ExcelJS.Workbook();
  // Excel butuh ini supaya semua formula dihitung ulang begitu file dibuka,
  // karena kita tidak menulis cached value ke cell formula.
  wb.calcProperties.fullCalcOnLoad = true;

  const ws = wb.addWorksheet(monthKeyToSheetName(monthKey), {
    pageSetup: { orientation: "portrait", paperSize: 9 },
    views: [{ showGridLines: true }],
  });

  ws.columns = [
    { width: 3.57 },
    { width: 9.71 },
    { width: 37.14 },
    { width: 12.86 },
    { width: 12.0 },
    { width: 11.43 },
  ];

  // Baris 1-3: spacer kosong (persis seperti template — ruang buat kop surat).
  for (let r = 1; r <= 3; r++) {
    ws.mergeCells(r, 1, r, 6);
  }

  if (logoBuffer) {
    const logoId = wb.addImage({ buffer: logoBuffer as any, extension: "png" });
    // Rasio asli logo ~4.6:1, ditempel di pojok kiri atas (baris 1-3).
    ws.addImage(logoId, {
      tl: { col: 0.05, row: 0.1 },
      ext: { width: 150, height: 33 },
    });
  }

  const monthLabel = monthKeyLabel(monthKey).toUpperCase();

  ws.mergeCells("A4:C4");
  ws.getCell("A4").value = `LAPORAN DANA OPERASIONAL BULAN ${monthLabel}`;
  ws.getCell("A4").font = { name: "Calibri", size: 11, bold: true };

  ws.mergeCells("D4:F4");
  ws.getCell("D4").value = FINANCE_REPORT_META.companyName;
  ws.getCell("D4").font = { name: "Calibri", size: 11, bold: true };
  ws.getCell("D4").alignment = { horizontal: "center" };

  ws.mergeCells("A5:C5");
  ws.getCell("A5").value = `ENGINEER : ${FINANCE_REPORT_META.engineerName}`;
  ws.getCell("A5").font = { name: "Calibri", size: 11, bold: true };

  ws.mergeCells("D5:F5");
  ws.getCell("D5").value = `RO : ${FINANCE_REPORT_META.ro}`;
  ws.getCell("D5").font = { name: "Calibri", size: 11, bold: true };
  ws.getCell("D5").alignment = { horizontal: "center" };

  // Header tabel — baris 6
  const headerRow = ws.getRow(6);
  const headerLabels = ["NO", "TANGGAL", "KETERANGAN", "DEBET", "KREDIT", "Saldo"];
  headerLabels.forEach((label, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = label;
    cell.font = { name: "Calibri", size: 11, bold: true };
    cell.alignment = { horizontal: "center" };
    cell.border = THIN_BORDER;
    cell.fill = HEADER_FILL;
  });

  // Kelompokkan entri sesuai urutan kategori, urut tanggal naik di tiap kelompok.
  const grouped = new Map<FinanceCategory, FinanceExportEntry[]>();
  for (const cat of CATEGORY_ORDER) grouped.set(cat, []);
  for (const entry of entries) {
    const cat = CATEGORY_ORDER.includes(entry.category as FinanceCategory)
      ? (entry.category as FinanceCategory)
      : "KETERANGAN";
    grouped.get(cat)!.push(entry);
  }
  for (const list of grouped.values()) {
    list.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  let currentRow = 7;
  let firstDataRow = 0;
  let lastBalanceRow = 0; // baris terakhir yang punya formula Saldo (lompati baris judul kategori)

  for (const category of CATEGORY_ORDER) {
    if (category !== "KETERANGAN") {
      // Baris judul kategori, full width, merge A:F.
      ws.mergeCells(currentRow, 1, currentRow, 6);
      const catCell = ws.getCell(currentRow, 1);
      catCell.value = category;
      catCell.font = { name: "Calibri", size: 9, bold: true };
      catCell.alignment = { horizontal: "center" };
      catCell.fill = HEADER_FILL;
      catCell.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" } };
      currentRow++;
    }

    const list = grouped.get(category)!;
    // Data + 1 baris kosong buffer di akhir section (persis pola di template).
    const rowsInSection = list.length + 1;

    for (let i = 0; i < rowsInSection; i++) {
      const row = ws.getRow(currentRow);
      const entry = list[i];

      row.getCell(1).value = i + 1;
      if (entry) {
        row.getCell(2).value = entry.date;
        row.getCell(3).value = entry.description;
        if (entry.type === "DEBIT") row.getCell(4).value = entry.amount;
        else row.getCell(5).value = entry.amount;
      }

      const saldoCell = row.getCell(6);
      if (firstDataRow === 0) {
        saldoCell.value = { formula: `D${currentRow}+E${currentRow}` };
        firstDataRow = currentRow;
      } else {
        saldoCell.value = {
          formula: `F${lastBalanceRow}-D${currentRow}+E${currentRow}`,
        };
      }
      lastBalanceRow = currentRow;

      applyDataRowStyle(row);
      currentRow++;
    }
  }

  const lastDataRow = currentRow - 1;
  const totalRow = currentRow;

  ws.mergeCells(totalRow, 1, totalRow, 3);
  const totalLabel = ws.getCell(totalRow, 1);
  totalLabel.value = "TOTAL";
  totalLabel.font = { name: "Calibri", size: 9, bold: true };
  totalLabel.alignment = { horizontal: "center" };
  totalLabel.fill = HEADER_FILL;
  totalLabel.border = THIN_BORDER;

  const debitTotal = ws.getCell(totalRow, 4);
  debitTotal.value = { formula: `SUM(D${firstDataRow}:D${lastDataRow})` };
  const kreditTotal = ws.getCell(totalRow, 5);
  kreditTotal.value = { formula: `SUM(E${firstDataRow}:E${lastDataRow})` };
  const saldoTotal = ws.getCell(totalRow, 6);
  saldoTotal.value = { formula: `E${totalRow}-D${totalRow}` };

  [debitTotal, kreditTotal, saldoTotal].forEach((c) => {
    c.font = { name: "Calibri", size: 9, bold: true };
    c.alignment = { horizontal: "right" };
    c.numFmt = ACCOUNTING_FMT;
    c.border = THIN_BORDER;
    c.fill = HEADER_FILL;
  });

  // Footer — tempat & tanggal, lalu blok tanda tangan.
  const footerDateRow = totalRow + 2;
  const today = new Date();
  const tanggalCetak = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(today);
  ws.getCell(footerDateRow, 1).value = `Jakarta, ${tanggalCetak}`;
  ws.getCell(footerDateRow, 1).font = { name: "Calibri", size: 11, bold: true };

  const signRoleRow = footerDateRow + 2;
  ws.mergeCells(signRoleRow, 1, signRoleRow, 2);
  ws.mergeCells(signRoleRow, 3, signRoleRow, 4);
  ws.mergeCells(signRoleRow, 5, signRoleRow, 6);
  const roles = ["Membuat", "Mengetahui", "Meyetujui"];
  roles.forEach((label, i) => {
    const cell = ws.getCell(signRoleRow, i * 2 + 1);
    cell.value = label;
    cell.font = { name: "Calibri", size: 11, bold: true };
    cell.alignment = { horizontal: "center" };
  });

  const signNameRow = signRoleRow + 5;
  ws.mergeCells(signNameRow, 1, signNameRow, 2);
  ws.mergeCells(signNameRow, 3, signNameRow, 4);
  ws.mergeCells(signNameRow, 5, signNameRow, 6);
  const names = [
    FINANCE_REPORT_META.signatures.membuat,
    FINANCE_REPORT_META.signatures.mengetahui,
    FINANCE_REPORT_META.signatures.menyetujui,
  ];
  names.forEach((label, i) => {
    const cell = ws.getCell(signNameRow, i * 2 + 1);
    cell.value = label;
    cell.font = { name: "Calibri", size: 11, bold: true, underline: true };
    cell.alignment = { horizontal: "center" };
  });

  return wb;
}

// "2026-01" -> "0126" — persis pola nama sheet di file contoh (MMYY).
function monthKeyToSheetName(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  return `${month}${year.slice(2)}`;
}
