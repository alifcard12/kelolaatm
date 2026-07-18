import { prisma } from "@/lib/prisma";
import { deleteVisit } from "./actions";
import { formatJakartaDateTime } from "@/lib/date";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { FiPlus } from "react-icons/fi";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { VISIT_TYPE_LABEL, VISIT_TYPE_TONE } from "@/lib/labels";

export default async function VisitsPage() {
  const visits = await prisma.visit.findMany({
    include: { atm: true, ticket: true },
    orderBy: { visitDate: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Jadwal Kunjungan"
        description="Log kunjungan per ATM, untuk melihat kunjungan terakhir."
        action={
          <LinkButton href="/visits/new">
            <FiPlus /> Catat Kunjungan
          </LinkButton>
        }
      />

      {visits.length === 0 && (
        <EmptyState
          title="Belum ada data kunjungan"
          description="Catat kunjungan preventive maintenance pertama di sini."
          action={
            <LinkButton href="/visits/new" size="sm">
              <FiPlus /> Catat Kunjungan
            </LinkButton>
          }
        />
      )}

      <div className="flex flex-col gap-3 md:gap-4">
        {visits.map((v) => (
          <Card key={v.id}>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <Badge tone={VISIT_TYPE_TONE[v.visitType]}>{VISIT_TYPE_LABEL[v.visitType]}</Badge>
                <div className="text-sm font-medium text-espresso mt-2">
                  {v.atm.tid} — {v.atm.location} ({v.atm.branch})
                </div>
                <div className="text-xs text-espresso-soft/70">SSB: {v.atm.ssb}</div>
              </div>

              <DeleteButton action={deleteVisit.bind(null, v.id)} />
            </div>

            <div className="text-xs text-espresso-soft/70 mb-2">
              {formatJakartaDateTime(v.visitDate)}
              {v.visitType === "PM" && v.ticketNumber && <> · No. Tiket: {v.ticketNumber}</>}
              {v.visitType === "CM" && v.ticket && (
                <>
                  {" "}
                  · No. Tiket: {v.ticket.ticketNumber ?? "(belum ada nomor)"} — {v.ticket.problem}
                </>
              )}
            </div>

            {v.keterangan && (
              <div className="text-sm text-espresso mb-2">
                <span className="text-espresso-soft/70">Keterangan: </span>
                {v.keterangan}
              </div>
            )}

            {v.photoUrl && (
              <a
                href={v.photoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-rose hover:underline"
              >
                Lihat Foto
              </a>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
