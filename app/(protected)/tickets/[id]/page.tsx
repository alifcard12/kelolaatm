import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  updateTicket,
  closeTicket,
  reopenTicket,
  deleteTicket,
  deleteTicketAttachment,
} from "../actions";
import { formatJakartaDateTime } from "@/lib/date";
import { buildOpenTicketText, buildCloseTicketText } from "@/lib/ticketText";
import CopyTextButton from "@/components/CopyTextButton";
import { FileUploader } from "@/components/FileUploader";
import { TicketAttachments } from "@/components/TicketAttachments";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { FiChevronLeft } from "react-icons/fi";
import { ActionForm } from "@/components/ui/ActionForm";
import { TICKET_STATUS_LABEL, TICKET_STATUS_TONE } from "@/lib/labels";

function deviceLabel(d: { type: string; brand: string; serialNumber: string }) {
  return `${d.type} — ${d.brand} — SN ${d.serialNumber}`;
}

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      atm: { include: { devices: { orderBy: { type: "asc" } } } },
      device: true,
      attachments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!ticket) notFound();

  const updateTicketWithId = updateTicket.bind(null, ticket.id);
  const closeTicketWithId = closeTicket.bind(null, ticket.id);
  const deleteAttachmentWithId = deleteTicketAttachment.bind(null, ticket.id);

  async function deleteAndRedirect() {
    "use server";
    await deleteTicket(ticket.id);
    redirect("/tickets");
  }

  const openText = buildOpenTicketText({
    date: ticket.openedAt,
    location: ticket.atm.location,
    branch: ticket.atm.branch,
    tid: ticket.atm.tid,
    ssb: ticket.atm.ssb,
    problem: ticket.problem,
  });

  const closeText =
    ticket.status === "CLOSED"
      ? buildCloseTicketText({
          date: ticket.openedAt,
          location: ticket.atm.location,
          branch: ticket.atm.branch,
          tid: ticket.atm.tid,
          ssb: ticket.atm.ssb,
          problem: ticket.problem,
          ticketNumber: ticket.ticketNumber ?? "",
          action: ticket.action ?? "",
        })
      : "";

  return (
    <div className="max-w-2xl">
      <Link href="/tickets" className="inline-flex items-center gap-1 text-xs text-espresso-soft hover:text-rose mb-2">
        <FiChevronLeft /> Kembali ke Tiket
      </Link>

      <PageHeader
        title={`${ticket.atm.tid} — ${ticket.atm.location}`}
        description={`${ticket.atm.branch} · SSB: ${ticket.atm.ssb}`}
        action={
          <div className="flex items-center gap-3">
            <Badge tone={TICKET_STATUS_TONE[ticket.status]}>{TICKET_STATUS_LABEL[ticket.status]}</Badge>
            <DeleteButton action={deleteAndRedirect} label="Hapus Tiket" />
          </div>
        }
      />

      <div className="text-xs text-espresso-soft/70 mb-6">
        Dibuka: {formatJakartaDateTime(ticket.openedAt)}
        {ticket.status === "CLOSED" && ticket.closedAt && (
          <> · Ditutup: {formatJakartaDateTime(ticket.closedAt)}</>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <CopyTextButton text={openText} label="Copy Teks Open" />
        {ticket.status === "CLOSED" && (
          <CopyTextButton
            text={closeText}
            label="Copy Teks Close"
            className="bg-success text-paper text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-success/90 transition-colors"
          />
        )}
        {ticket.status === "CLOSED" && (
          <ActionForm action={reopenTicket.bind(null, ticket.id)} successMessage="Tiket dibuka kembali">
            <button className="text-espresso-soft hover:text-rose text-xs px-2 transition-colors">
              Buka Kembali
            </button>
          </ActionForm>
        )}
      </div>

      {/* Edit problem & device rujukan */}
      <Card className="flex flex-col gap-4 mb-6">
        <CardTitle>Edit Tiket</CardTitle>
        <ActionForm action={updateTicketWithId} successMessage="Tiket berhasil diperbarui" className="flex flex-col gap-4">
          <Field label="Problem" htmlFor="problem">
            <Textarea id="problem" name="problem" rows={3} required defaultValue={ticket.problem} />
          </Field>

          <Field label="Device Rujukan (opsional)" htmlFor="deviceId">
            <Select id="deviceId" name="deviceId" defaultValue={ticket.deviceId ?? ""}>
              <option value="">Tidak ada</option>
              {ticket.atm.devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {deviceLabel(d)}
                </option>
              ))}
            </Select>
            {ticket.atm.devices.length === 0 && (
              <p className="text-xs text-espresso-soft/70 mt-1.5">
                Belum ada perangkat terdaftar untuk TID {ticket.atm.tid} ini.
              </p>
            )}
          </Field>

          <Button type="submit" className="self-start">
            Simpan Perubahan
          </Button>
        </ActionForm>
      </Card>

      {/* Tutup / edit detail penutupan tiket */}
      <Card className="flex flex-col gap-4 mb-6">
        <CardTitle>{ticket.status === "OPEN" ? "Tutup Tiket" : "Edit Detail Penutupan"}</CardTitle>
        <ActionForm
          action={closeTicketWithId}
          successMessage={ticket.status === "OPEN" ? "Tiket berhasil ditutup" : "Perubahan berhasil disimpan"}
          resetOnSuccess={false}
          className="flex flex-col gap-4"
        >
          <Field label="Nomor Tiket (CM)" htmlFor="ticketNumber">
            <Input
              id="ticketNumber"
              name="ticketNumber"
              type="text"
              required
              defaultValue={ticket.ticketNumber ?? ""}
              placeholder="mis. 54564554"
            />
          </Field>

          <Field label="Action" htmlFor="action">
            <Textarea
              id="action"
              name="action"
              rows={2}
              required
              defaultValue={ticket.action ?? ""}
              placeholder="mis. REPLACE PSU, TES FUNGSI OK"
            />
          </Field>

          <Field label="Device Rujukan (opsional)" htmlFor="deviceId2">
            <Select id="deviceId2" name="deviceId" defaultValue={ticket.deviceId ?? ""}>
              <option value="">Tidak ada</option>
              {ticket.atm.devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {deviceLabel(d)}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Lampiran Foto / PDF (opsional, bisa lebih dari 1)">
            <FileUploader />
          </Field>

          <Button type="submit" className="self-start">
            {ticket.status === "OPEN" ? "Tutup Tiket" : "Simpan Perubahan"}
          </Button>
        </ActionForm>
      </Card>

      {/* Lampiran yang sudah ada */}
      {ticket.attachments.length > 0 && (
        <Card>
          <CardTitle className="mb-1">Lampiran</CardTitle>
          <TicketAttachments attachments={ticket.attachments} onDelete={deleteAttachmentWithId} />
        </Card>
      )}
    </div>
  );
}
