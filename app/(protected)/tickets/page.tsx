import { prisma } from "@/lib/prisma";
import { deleteTicket } from "./actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { FiPlus } from "react-icons/fi";
import { TicketListClient } from "./TicketListClient";

export default async function TicketsPage() {
  const tickets = await prisma.ticket.findMany({
    include: { atm: true, device: true, attachments: true },
    orderBy: [{ status: "asc" }, { openedAt: "desc" }],
    // status "asc" -> CLOSED < OPEN secara alfabet, jadi kita balik urutannya di bawah
  });

  // OPEN duluan di atas, baru CLOSED, masing-masing terbaru dulu (urutan awal sebelum di-sort ulang di client)
  tickets.sort((a, b) => {
    if (a.status !== b.status) return a.status === "OPEN" ? -1 : 1;
    return b.openedAt.getTime() - a.openedAt.getTime();
  });

  return (
    <div>
      <PageHeader
        title=""
        description=""
        action={
          <LinkButton href="/tickets/new">
            <FiPlus /> Buka Tiket
          </LinkButton>
        }
      />

      <TicketListClient tickets={tickets} onDelete={deleteTicket} />
    </div>
  );
}
