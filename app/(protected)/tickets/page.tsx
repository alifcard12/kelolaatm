import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteTicket } from "./actions";
import { formatJakartaDateTime } from "@/lib/date";
import { buildOpenTicketText, buildCloseTicketText } from "@/lib/ticketText";
import CopyTextButton from "@/components/CopyTextButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { FiPlus } from "react-icons/fi";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { TICKET_STATUS_LABEL, TICKET_STATUS_TONE } from "@/lib/labels";

export default async function TicketsPage() {
  const tickets = await prisma.ticket.findMany({
    include: { atm: true, device: true, attachments: true },
    orderBy: [{ status: "asc" }, { openedAt: "desc" }],
    // status "asc" -> CLOSED < OPEN secara alfabet, jadi kita balik urutannya di bawah
  });

  // OPEN duluan di atas, baru CLOSED, masing-masing terbaru dulu
  tickets.sort((a, b) => {
    if (a.status !== b.status) return a.status === "OPEN" ? -1 : 1;
    return b.openedAt.getTime() - a.openedAt.getTime();
  });

  return (
    <div>
      <PageHeader
        title="Ticket"
        description="Tiket gangguan ATM & perangkat, dari dibuka sampai ditutup."
        action={
          <LinkButton href="/tickets/new">
            <FiPlus /> Buka Tiket
          </LinkButton>
        }
      />

      {tickets.length === 0 && (
        <EmptyState
          title="Belum ada tiket"
          description="Tiket gangguan yang dibuka akan tercatat di sini."
          action={
            <LinkButton href="/tickets/new" size="sm">
              <FiPlus /> Buka Tiket
            </LinkButton>
          }
        />
      )}

      <div className="flex flex-col gap-3 md:gap-4">
        {tickets.map((t) => {
          const openText = buildOpenTicketText({
            date: t.openedAt,
            location: t.atm.location,
            branch: t.atm.branch,
            tid: t.atm.tid,
            ssb: t.atm.ssb,
            problem: t.problem,
          });

          const closeText =
            t.status === "CLOSED"
              ? buildCloseTicketText({
                  date: t.openedAt,
                  location: t.atm.location,
                  branch: t.atm.branch,
                  tid: t.atm.tid,
                  ssb: t.atm.ssb,
                  problem: t.problem,
                  ticketNumber: t.ticketNumber ?? "",
                  action: t.action ?? "",
                })
              : "";

          return (
            <Card key={t.id}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <Badge tone={TICKET_STATUS_TONE[t.status]}>{TICKET_STATUS_LABEL[t.status]}</Badge>
                  <div className="text-sm font-medium text-espresso mt-2">
                    {t.atm.tid} — {t.atm.location} ({t.atm.branch})
                  </div>
                  <div className="text-xs text-espresso-soft/70">SSB: {t.atm.ssb}</div>
                  {t.device && (
                    <div className="text-xs text-espresso-soft/70">
                      Device: {t.device.type} — {t.device.brand} — SN {t.device.serialNumber}
                    </div>
                  )}
                </div>

                <DeleteButton action={deleteTicket.bind(null, t.id)} />
              </div>

              <div className="text-sm text-espresso mb-1">
                <span className="text-espresso-soft/70">Problem: </span>
                {t.problem}
              </div>
              <div className="text-xs text-espresso-soft/70 mb-4">
                Dibuka: {formatJakartaDateTime(t.openedAt)}
                {t.status === "CLOSED" && t.closedAt && (
                  <> · Ditutup: {formatJakartaDateTime(t.closedAt)}</>
                )}
                {t.status === "CLOSED" && t.ticketNumber && <> · No. Tiket: {t.ticketNumber}</>}
                {t.attachments.length > 0 && <> · Lampiran: {t.attachments.length}</>}
              </div>

              {t.status === "CLOSED" && t.action && (
                <div className="text-sm text-espresso mb-4">
                  <span className="text-espresso-soft/70">Action: </span>
                  {t.action}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <CopyTextButton text={openText} label="Copy Teks Open" />

                {t.status === "CLOSED" && (
                  <CopyTextButton
                    text={closeText}
                    label="Copy Teks Close"
                    className="bg-success text-paper text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-success/90 transition-colors"
                  />
                )}

                <Link href={`/tickets/${t.id}`} className="text-espresso-soft hover:text-rose text-xs px-2 transition-colors">
                  {t.status === "OPEN" ? "Detail / Tutup Tiket" : "Detail / Edit Tiket"}
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
