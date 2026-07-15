import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { closeTicket, deleteTicket, reopenTicket } from "./actions";
import { formatJakartaDateTime } from "@/lib/date";
import { buildOpenTicketText, buildCloseTicketText } from "@/lib/ticketText";
import CopyTextButton from "@/components/CopyTextButton";

export default async function TicketsPage() {
  const tickets = await prisma.ticket.findMany({
    include: { atm: true },
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">Ticket</h2>
        <Link
          href="/tickets/new"
          className="bg-slate-900 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-700"
        >
          + Buka Tiket
        </Link>
      </div>

      {tickets.length === 0 && (
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-10 text-center text-slate-400 text-sm">
          Belum ada tiket.
        </div>
      )}

      <div className="flex flex-col gap-4">
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

          const closeTicketWithId = closeTicket.bind(null, t.id);

          return (
            <div key={t.id} className="bg-white border border-slate-200 rounded-lg p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      t.status === "OPEN"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {t.status === "OPEN" ? "OPEN" : "CLOSED"}
                  </span>
                  <div className="text-sm font-medium text-slate-800 mt-2">
                    {t.atm.tid} — {t.atm.location} ({t.atm.branch})
                  </div>
                  <div className="text-xs text-slate-400">SSB: {t.atm.ssb}</div>
                </div>

                <form
                  action={async () => {
                    "use server";
                    await deleteTicket(t.id);
                  }}
                >
                  <button className="text-red-500 hover:underline text-xs">Hapus</button>
                </form>
              </div>

              <div className="text-sm text-slate-600 mb-1">
                <span className="text-slate-400">Problem: </span>
                {t.problem}
              </div>
              <div className="text-xs text-slate-400 mb-4">
                Dibuka: {formatJakartaDateTime(t.openedAt)}
                {t.status === "CLOSED" && t.closedAt && (
                  <> · Ditutup: {formatJakartaDateTime(t.closedAt)}</>
                )}
                {t.status === "CLOSED" && t.ticketNumber && (
                  <> · No. Tiket: {t.ticketNumber}</>
                )}
              </div>

              {t.status === "CLOSED" && t.action && (
                <div className="text-sm text-slate-600 mb-4">
                  <span className="text-slate-400">Action: </span>
                  {t.action}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <CopyTextButton text={openText} label="Copy Teks Open" />

                {t.status === "CLOSED" && (
                  <CopyTextButton
                    text={closeText}
                    label="Copy Teks Close"
                    className="bg-green-700 text-white text-xs px-3 py-1.5 rounded-md hover:bg-green-600"
                  />
                )}

                {t.status === "CLOSED" && (
                  <form
                    action={async () => {
                      "use server";
                      await reopenTicket(t.id);
                    }}
                  >
                    <button className="text-slate-500 hover:underline text-xs px-2">
                      Buka Kembali
                    </button>
                  </form>
                )}
              </div>

              {t.status === "OPEN" && (
                <form
                  action={closeTicketWithId}
                  className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3"
                >
                  <h4 className="text-xs font-semibold text-slate-500 uppercase">
                    Tutup Tiket
                  </h4>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs text-slate-500 mb-1">
                        Nomor Tiket (CM)
                      </label>
                      <input
                        name="ticketNumber"
                        type="text"
                        required
                        placeholder="mis. 54564554"
                        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Action</label>
                    <textarea
                      name="action"
                      rows={2}
                      required
                      placeholder="mis. REPLACE PSU, TES FUNGSI OK"
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-slate-900 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-700 self-start"
                  >
                    Tutup Tiket
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
