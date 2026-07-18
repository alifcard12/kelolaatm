import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteFinanceEntry } from "./actions";
import { MonthFilter } from "./MonthFilter";
import {
  formatJakartaDate,
  formatRupiah,
  monthKeyToJakartaRange,
  normalizeMonthKey,
  monthKeyLabel,
} from "@/lib/date";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Table, Thead, Th, Tbody, Tr, Td } from "@/components/ui/Table";
import { FiPlus } from "react-icons/fi";
import {
  FINANCE_TYPE_LABEL,
  FINANCE_TYPE_TONE,
  FINANCE_CATEGORY_LABEL,
  FINANCE_CATEGORY_TONE,
} from "@/lib/labels";

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
  const saldoTerakhir = await prisma.financeEntry
    .findMany({ select: { type: true, amount: true } })
    .then((rows) => rows.reduce((acc, r) => acc + signedAmount(r), 0));

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
        title="Keuangan Operasional"
        description="Catatan uang masuk dan uang keluar operasional."
        action={
          <LinkButton href="/finance/new">
            <FiPlus /> Tambah Transaksi
          </LinkButton>
        }
      />

      {/* Saldo terakhir — paling atas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="col-span-2 lg:col-span-1">
          <StatCard label="Saldo Terakhir" value={formatRupiah(saldoTerakhir)} tone="rose" />
        </div>
        <StatCard label={`Saldo Awal — ${monthKeyLabel(month)}`} value={formatRupiah(saldoAwalBulan)} />
        <StatCard label="Total Masuk (Credit)" value={formatRupiah(totalCreditBulan)} tone="neutral" />
        <StatCard label="Total Keluar (Debit)" value={formatRupiah(totalDebitBulan)} tone="warning" />
      </div>

      <Card className="mb-6 flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <CardTitle>Filter Bulan</CardTitle>
          <MonthFilter month={month} />
        </div>
        <p className="text-sm text-espresso-soft">
          Saldo akhir {monthKeyLabel(month)}:{" "}
          <span className="font-semibold text-espresso">{formatRupiah(saldoAkhirBulan)}</span>
        </p>
      </Card>

      {rowsDesc.length === 0 && (
        <EmptyState
          title="Belum ada transaksi bulan ini"
          description={`Belum ada catatan uang operasional untuk ${monthKeyLabel(month)}.`}
          action={
            <LinkButton href="/finance/new" size="sm">
              <FiPlus /> Tambah Transaksi
            </LinkButton>
          }
        />
      )}

      {/* Kartu — mobile */}
      <div className="flex flex-col gap-3 md:hidden">
        {rowsDesc.map((e) => (
          <Card key={e.id} className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <Link href={`/finance/${e.id}`} className="min-w-0">
                <p className="font-display font-semibold text-espresso truncate">{e.description}</p>
                <p className="text-xs text-espresso-soft">{formatJakartaDate(e.date)}</p>
              </Link>
              <DeleteButton action={deleteFinanceEntryWithMonth.bind(null, e.id)} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={FINANCE_TYPE_TONE[e.type]}>{FINANCE_TYPE_LABEL[e.type]}</Badge>
              <Badge tone={FINANCE_CATEGORY_TONE[e.category]}>
                {FINANCE_CATEGORY_LABEL[e.category]}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className={e.type === "DEBIT" ? "text-danger font-semibold" : "text-success font-semibold"}>
                {e.type === "DEBIT" ? "-" : "+"}
                {formatRupiah(e.amount)}
              </span>
              <span className="text-xs text-espresso-soft">
                Saldo: {formatRupiah(e.runningBalance)}
              </span>
            </div>
            {e.notes && <p className="text-xs text-espresso-soft/80">{e.notes}</p>}
          </Card>
        ))}
      </div>

      {/* Tabel — desktop */}
      {rowsDesc.length > 0 && (
        <Table>
          <Thead>
            <Th>Tanggal</Th>
            <Th>Deskripsi</Th>
            <Th>Kategori</Th>
            <Th>Tipe</Th>
            <Th className="text-right">Jumlah</Th>
            <Th className="text-right">Saldo</Th>
            <Th></Th>
          </Thead>
          <Tbody>
            {rowsDesc.map((e) => (
              <Tr key={e.id}>
                <Td className="whitespace-nowrap text-espresso-soft">{formatJakartaDate(e.date)}</Td>
                <Td className="font-medium">
                  <Link href={`/finance/${e.id}`} className="hover:text-rose transition-colors">
                    {e.description}
                  </Link>
                  {e.notes && <div className="text-xs text-espresso-soft/70 mt-0.5">{e.notes}</div>}
                </Td>
                <Td>
                  <Badge tone={FINANCE_CATEGORY_TONE[e.category]}>
                    {FINANCE_CATEGORY_LABEL[e.category]}
                  </Badge>
                </Td>
                <Td>
                  <Badge tone={FINANCE_TYPE_TONE[e.type]}>{FINANCE_TYPE_LABEL[e.type]}</Badge>
                </Td>
                <Td
                  className={`text-right font-semibold whitespace-nowrap ${
                    e.type === "DEBIT" ? "text-danger" : "text-success"
                  }`}
                >
                  {e.type === "DEBIT" ? "-" : "+"}
                  {formatRupiah(e.amount)}
                </Td>
                <Td className="text-right whitespace-nowrap text-espresso-soft">
                  {formatRupiah(e.runningBalance)}
                </Td>
                <Td className="text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/finance/${e.id}`} className="text-xs text-espresso-soft hover:text-rose">
                      Edit
                    </Link>
                    <DeleteButton action={deleteFinanceEntryWithMonth.bind(null, e.id)} />
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
