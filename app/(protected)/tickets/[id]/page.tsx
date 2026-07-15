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
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/tickets" className="text-xs text-slate-400 hover:underline">
            ← Kembali ke Tiket
          </Link>
          <h2 className="text-2xl font-semibold text-slate-800 mt-1">
            {ticket.atm.tid} — {ticket.atm.location}
          </h2>
          <div className="text-xs text-slate-400">
            {ticket.atm.branch} · SSB: {ticket.atm.ssb}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              ticket.status === "OPEN"
                ? "bg-amber-100 text-amber-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {ticket.status}
          </span>
          <form
            action={async () => {
              "use server";
              await deleteTicket(ticket.id);
              redirect("/tickets");
            }}
          >
            <button className="text-red-500 hover:underline text-xs">Hapus Tiket</button>
          </form>
        </div>
      </div>

      <div className="text-xs text-slate-400 mb-6">
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
            className="bg-green-700 text-white text-xs px-3 py-1.5 rounded-md hover:bg-green-600"
          />
        )}
        {ticket.status === "CLOSED" && (
          <form
            action={async () => {
              "use server";
              await reopenTicket(ticket.id);
            }}
          >
            <button className="text-slate-500 hover:underline text-xs px-2">Buka Kembali</button>
          </form>
        )}
      </div>

      {/* Edit problem & device rujukan */}
      <form
        action={updateTicketWithId}
        className="flex flex-col gap-4 bg-white p-6 rounded-lg border border-slate-200 mb-6"
      >
        <h3 className="text-sm font-semibold text-slate-700">Edit Tiket</h3>

        <div>
          <label className="block text-sm text-slate-600 mb-1">Problem</label>
          <textarea
            name="problem"
            rows={3}
            required
            defaultValue={ticket.problem}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-600 mb-1">Device Rujukan (opsional)</label>
          <select
            name="deviceId"
            defaultValue={ticket.deviceId ?? ""}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">Tidak ada</option>
            {ticket.atm.devices.map((d) => (
              <option key={d.id} value={d.id}>
                {deviceLabel(d)}
              </option>
            ))}
          </select>
          {ticket.atm.devices.length === 0 && (
            <p className="text-xs text-slate-400 mt-1">
              Belum ada perangkat terdaftar untuk TID {ticket.atm.tid} ini.
            </p>
          )}
        </div>

        <button
          type="submit"
          className="bg-slate-900 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-700 self-start"
        >
          Simpan Perubahan
        </button>
      </form>

      {/* Tutup / edit detail penutupan tiket */}
      <form
        action={closeTicketWithId}
        className="flex flex-col gap-4 bg-white p-6 rounded-lg border border-slate-200 mb-6"
      >
        <h3 className="text-sm font-semibold text-slate-700">
          {ticket.status === "OPEN" ? "Tutup Tiket" : "Edit Detail Penutupan"}
        </h3>

        <div>
          <label className="block text-sm text-slate-600 mb-1">Nomor Tiket (CM)</label>
          <input
            name="ticketNumber"
            type="text"
            required
            defaultValue={ticket.ticketNumber ?? ""}
            placeholder="mis. 54564554"
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-600 mb-1">Action</label>
          <textarea
            name="action"
            rows={2}
            required
            defaultValue={ticket.action ?? ""}
            placeholder="mis. REPLACE PSU, TES FUNGSI OK"
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-600 mb-1">Device Rujukan (opsional)</label>
          <select
            name="deviceId"
            defaultValue={ticket.deviceId ?? ""}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">Tidak ada</option>
            {ticket.atm.devices.map((d) => (
              <option key={d.id} value={d.id}>
                {deviceLabel(d)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-600 mb-1">
            Lampiran Foto / PDF (opsional, bisa lebih dari 1)
          </label>
          <FileUploader />
        </div>

        <button
          type="submit"
          className="bg-slate-900 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-700 self-start"
        >
          {ticket.status === "OPEN" ? "Tutup Tiket" : "Simpan Perubahan"}
        </button>
      </form>

      {/* Lampiran yang sudah ada */}
      {ticket.attachments.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-1">Lampiran</h3>
          <TicketAttachments attachments={ticket.attachments} onDelete={deleteAttachmentWithId} />
        </div>
      )}
    </div>
  );
}
