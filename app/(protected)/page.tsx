import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatJakartaDateTime } from "@/lib/date";
import { TICKET_STATUS_LABEL, TICKET_STATUS_TONE } from "@/lib/labels";

export default async function HomePage() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [atmCount, openTicketCount, attentionDeviceCount, visitsThisMonth, recentOpenTickets] =
    await Promise.all([
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
    ]);

  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title="Selamat datang kembali"
        description="Ringkasan cepat kondisi ATM, perangkat, dan tiket yang sedang berjalan."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        <StatCard label="Total ATM" value={atmCount} href="/atm" />
        <StatCard label="Tiket Open" value={openTicketCount} href="/tickets" tone="warning" />
        <StatCard
          label="Perangkat Perlu Perhatian"
          value={attentionDeviceCount}
          href="/devices"
          tone="danger"
        />
        <StatCard label="Kunjungan Bulan Ini" value={visitsThisMonth} href="/visits" tone="rose" />
      </div>

      <Card padded={false} className="overflow-hidden">
        <div className="flex items-center justify-between px-5 md:px-6 pt-5 md:pt-6 pb-4">
          <CardTitle>Tiket Open Terbaru</CardTitle>
          <Link href="/tickets" className="text-xs font-medium text-rose hover:underline">
            Lihat semua →
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
                  <p className="text-xs text-espresso-soft truncate">{t.problem}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="hidden sm:inline text-xs text-espresso-soft/70">
                    {formatJakartaDateTime(t.openedAt)}
                  </span>
                  <Badge tone={TICKET_STATUS_TONE[t.status]}>{TICKET_STATUS_LABEL[t.status]}</Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
