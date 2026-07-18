import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  formatJakartaDateTime,
  formatRelativeTime,
  formatRupiah,
} from "@/lib/date";
import {
  TICKET_STATUS_LABEL,
  TICKET_STATUS_TONE,
  VISIT_TYPE_LABEL,
  VISIT_TYPE_TONE,
} from "@/lib/labels";
import {
  FiCreditCard,
  FiHardDrive,
  FiPackage,
  FiClipboard,
  FiTruck,
  FiHome,
  FiShoppingBag,
  FiDollarSign,
  FiMapPin,
  FiArrowRight,
  FiAlertTriangle,
} from "react-icons/fi";
import type { IconType } from "react-icons";

// Menu utama untuk akses cepat dari dashboard — urutannya sengaja dibuat
// sesuai prioritas kerja harian (operasional ATM dulu, administratif belakangan).
const quickLinks: {
  href: string;
  label: string;
  description: string;
  icon: IconType;
}[] = [
  {
    href: "/atm",
    label: "ATM",
    description: "Data & lokasi mesin",
    icon: FiCreditCard,
  },
  {
    href: "/tickets",
    label: "Ticket",
    description: "Kendala & perbaikan",
    icon: FiClipboard,
  },
  {
    href: "/devices",
    label: "Perangkat",
    description: "NVR, Monitor, CCTV, UPS",
    icon: FiHardDrive,
  },
  {
    href: "/kaset",
    label: "Kaset",
    description: "Kondisi kaset",
    icon: FiPackage,
  },
  {
    href: "/visits",
    label: "Kunjungan",
    description: "Jadwal PM & CM",
    icon: FiMapPin,
  },
  {
    href: "/finance",
    label: "Keuangan",
    description: "Kas operasional",
    icon: FiDollarSign,
  },
  {
    href: "/travel",
    label: "Travel",
    description: "Pemesanan travel",
    icon: FiTruck,
  },
  {
    href: "/hotel",
    label: "Hotel",
    description: "Pemesanan hotel",
    icon: FiHome,
  },
  {
    href: "/product",
    label: "Product",
    description: "Stok & penjualan",
    icon: FiShoppingBag,
  },
];

function signedAmount(entry: { type: string; amount: number }) {
  return entry.type === "CREDIT" ? entry.amount : -entry.amount;
}

export default async function HomePage() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    atmCount,
    openTicketCount,
    attentionDeviceCount,
    visitsThisMonth,
    recentOpenTickets,
    recentVisits,
    kasetList,
    financeRows,
  ] = await Promise.all([
    prisma.atm.count(),
    prisma.ticket.count({ where: { status: "OPEN" } }),
    prisma.device.count({ where: { condition: { not: "GOOD" } } }),
    prisma.visit.count({ where: { visitDate: { gte: startOfMonth } } }),
    prisma.ticket.findMany({
      where: { status: "OPEN" },
      include: { atm: true },
      orderBy: { openedAt: "desc" },
      take: 5,
    }),
    prisma.visit.findMany({
      include: { atm: true },
      orderBy: { visitDate: "desc" },
      take: 5,
    }),
    prisma.kaset.findMany({
      include: { logs: { orderBy: { createdAt: "desc" }, take: 1 } },
    }),
    prisma.financeEntry.findMany({
      where: { date: { gte: startOfMonth } },
      select: { type: true, amount: true },
    }),
  ]);

  const attentionKasetCount = kasetList.filter((k) => {
    const latest = k.logs[0];
    return latest && latest.condition !== "GOOD";
  }).length;

  const saldoBulanIni = financeRows.reduce(
    (acc, r) => acc + signedAmount(r),
    0,
  );

  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title="Selamat datang kembali"
        description="Ringkasan cepat kondisi ATM, perangkat, tiket, dan kas operasional."
      />

      {attentionDeviceCount + attentionKasetCount > 0 && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-danger/30 bg-danger-soft px-4 py-3.5 md:px-5">
          <FiAlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
          <p className="text-sm text-danger">
            Ada {attentionDeviceCount} perangkat dan {attentionKasetCount} kaset
            yang butuh perhatian segera. Cek halaman{" "}
            <Link href="/devices" className="font-semibold underline">
              Perangkat
            </Link>{" "}
            dan{" "}
            <Link href="/kaset" className="font-semibold underline">
              Kaset
            </Link>{" "}
            untuk detailnya.
          </p>
        </div>
      )}

      {/* --- Akses cepat --- */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-espresso-soft mb-3">
          Akses Cepat
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
          {quickLinks.map(({ href, label, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex flex-col items-center gap-1.5 rounded-2xl border border-taupe/70 bg-paper px-2 py-3.5 text-center shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)] sm:gap-2 sm:py-4 md:items-start md:text-left"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-soft text-rose transition-colors group-hover:bg-rose group-hover:text-paper sm:h-10 sm:w-10">
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
              <span className="min-w-0 w-full">
                <span className="block text-xs font-semibold text-espresso sm:text-sm">
                  {label}
                </span>
                <span className="hidden md:block text-xs text-espresso-soft truncate">
                  {description}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* --- Statistik --- */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-espresso-soft mb-3">
          Ringkasan
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <StatCard label="Total ATM" value={atmCount} href="/atm" />
          <StatCard
            label="Tiket Open"
            value={openTicketCount}
            href="/tickets"
            tone="warning"
          />
          <StatCard
            label="Perangkat Perlu Perhatian"
            value={attentionDeviceCount}
            href="/devices"
            tone="danger"
          />
          <StatCard
            label="Kaset Bermasalah"
            value={attentionKasetCount}
            href="/kaset"
            tone="danger"
          />
          <StatCard
            label="Kunjungan Bulan Ini"
            value={visitsThisMonth}
            href="/visits"
            tone="rose"
          />
          <StatCard
            label="Arus Kas Bulan Ini"
            value={formatRupiah(saldoBulanIni)}
            href="/finance"
            tone={saldoBulanIni < 0 ? "danger" : "neutral"}
          />
        </div>
      </div>

      {/* --- Detail: tiket & kunjungan terbaru --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        <Card padded={false} className="overflow-hidden">
          <div className="flex items-center justify-between px-5 md:px-6 pt-5 md:pt-6 pb-4">
            <CardTitle>Tiket Open Terbaru</CardTitle>
            <Link
              href="/tickets"
              className="flex items-center gap-1 text-xs font-medium text-rose hover:underline"
            >
              Lihat semua <FiArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentOpenTickets.length === 0 ? (
            <div className="px-5 md:px-6 pb-6">
              <EmptyState
                title="Tidak ada tiket open"
                description="Semua tiket sudah ditutup. Kerja bagus!"
              />
            </div>
          ) : (
            <div className="divide-y divide-taupe/50">
              {recentOpenTickets.map((t) => (
                <Link
                  key={t.id}
                  href={`/tickets/${t.id}`}
                  className="flex items-center justify-between gap-4 px-5 md:px-6 py-3.5 hover:bg-cream/60 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-espresso truncate">
                      {t.atm.tid} — {t.atm.location}
                    </p>
                    <p className="text-xs text-espresso-soft truncate">
                      {t.problem}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="hidden sm:inline text-xs text-espresso-soft/70">
                      {formatJakartaDateTime(t.openedAt)}
                    </span>
                    <Badge tone={TICKET_STATUS_TONE[t.status]}>
                      {TICKET_STATUS_LABEL[t.status]}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card padded={false} className="overflow-hidden">
          <div className="flex items-center justify-between px-5 md:px-6 pt-5 md:pt-6 pb-4">
            <CardTitle>Kunjungan Terbaru</CardTitle>
            <Link
              href="/visits"
              className="flex items-center gap-1 text-xs font-medium text-rose hover:underline"
            >
              Lihat semua <FiArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentVisits.length === 0 ? (
            <div className="px-5 md:px-6 pb-6">
              <EmptyState
                title="Belum ada kunjungan"
                description="Catat kunjungan preventive/corrective pertama di sini."
              />
            </div>
          ) : (
            <div className="divide-y divide-taupe/50">
              {recentVisits.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between gap-4 px-5 md:px-6 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-espresso truncate">
                      {v.atm.tid} — {v.atm.location}
                    </p>
                    <p className="text-xs text-espresso-soft truncate">
                      {formatRelativeTime(v.visitDate)}
                    </p>
                  </div>
                  <Badge
                    tone={VISIT_TYPE_TONE[v.visitType]}
                    className="shrink-0"
                  >
                    {VISIT_TYPE_LABEL[v.visitType]}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
