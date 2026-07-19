import { prisma } from "@/lib/prisma";
import { deleteFinanceEntry } from "./actions";
import { MonthFilter } from "./MonthFilter";
import {
  formatRupiah,
  monthKeyToJakartaRange,
  normalizeMonthKey,
} from "@/lib/date";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { FiPlus, FiDownload } from "react-icons/fi";
import { FinanceListClient } from "./FinanceListClient";
import { FinanceStatCards } from "./FinanceStatCards";

function signedAmount(entry: { type: string; amount: number }) {
  return entry.type === "CREDIT" ? entry.amount : -entry.amount;
}

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month: monthParam } = await searchParams;
  const month = normalizeMonthKey(monthParam);
  const { start, end } = monthKeyToJakartaRange(month);

  const [allEntriesForBalance, monthEntries] = await Promise.all([
    // Semua entri sampai akhir bulan yang dipilih, buat hitung saldo berjalan.
    prisma.financeEntry.findMany({
      where: { date: { lt: end } },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
      select: { date: true, type: true, amount: true },
    }),
    prisma.financeEntry.findMany({
      where: { date: { gte: start, lt: end } },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  // Saldo terakhir = saldo berjalan sampai transaksi paling akhir yang tercatat (all time).
  // Sekaligus hitung total credit & debit sepanjang waktu (all time).
  const allEntriesEver = await prisma.financeEntry.findMany({
    select: { type: true, amount: true },
  });
  const saldoTerakhir = allEntriesEver.reduce(
    (acc, r) => acc + signedAmount(r),
    0,
  );
  const totalCreditAllTime = allEntriesEver
    .filter((e) => e.type === "CREDIT")
    .reduce((acc, r) => acc + r.amount, 0);
  const totalDebitAllTime = allEntriesEver
    .filter((e) => e.type === "DEBIT")
    .reduce((acc, r) => acc + r.amount, 0);

  const saldoAwalBulan = allEntriesForBalance
    .filter((e) => e.date < start)
    .reduce((acc, r) => acc + signedAmount(r), 0);

  const totalDebitBulan = monthEntries
    .filter((e) => e.type === "DEBIT")
    .reduce((acc, r) => acc + r.amount, 0);
  const totalCreditBulan = monthEntries
    .filter((e) => e.type === "CREDIT")
    .reduce((acc, r) => acc + r.amount, 0);
  const saldoAkhirBulan = saldoAwalBulan + totalCreditBulan - totalDebitBulan;

  // Saldo berjalan per baris, dihitung berurutan mulai dari saldo awal bulan.
  let running = saldoAwalBulan;
  const rows = monthEntries.map((e) => {
    running += signedAmount(e);
    return { ...e, runningBalance: running };
  });
  // Tampilkan yang terbaru di atas, tapi saldo berjalan tetap dihitung kronologis (asc) di atas.
  const rowsDesc = [...rows].reverse();

  const deleteFinanceEntryWithMonth = async (id: string) => {
    "use server";
    await deleteFinanceEntry(id);
  };

  return (
    <div>
      <PageHeader
        title=""
        description=""
        action={
          <div className="flex items-center gap-2">
            <a
              href={`/finance/export?month=${month}`}
              className="inline-flex items-center justify-center rounded-xl font-semibold transition-colors duration-150 text-sm px-4 py-2.5 gap-2 bg-paper text-espresso border border-taupe-dark/70 hover:bg-cream active:bg-cream"
            >
              <FiDownload /> Export Excel
            </a>
            <LinkButton href="/finance/new">
              <FiPlus /> Tambah
            </LinkButton>
          </div>
        }
      />

      {/* Statistik keuangan */}
      <FinanceStatCards
        saldoTerakhir={formatRupiah(saldoTerakhir)}
        totalCredit={formatRupiah(totalCreditAllTime)}
        totalDebit={formatRupiah(totalDebitAllTime)}
        saldoBulanIni={formatRupiah(saldoAkhirBulan)}
        debitBulanIni={formatRupiah(totalDebitBulan)}
        creditBulanIni={formatRupiah(totalCreditBulan)}
      />

      <Card className="mb-1 flex flex-col gap-3 !bg-transparent border-none shadow-none">
        <div className="flex flex-col justify-center md:flex-row md:items-center md:justify-between gap-3">
          <MonthFilter month={month} />
        </div>
      </Card>

      <FinanceListClient
        entries={rowsDesc}
        onDelete={deleteFinanceEntryWithMonth}
      />
    </div>
  );
}
