import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteVisit } from "./actions";
import { formatJakartaDateTime } from "@/lib/date";

export default async function VisitsPage() {
  const visits = await prisma.visit.findMany({
    include: { atm: true, ticket: true },
    orderBy: { visitDate: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Jadwal Kunjungan</h2>
          <p className="text-slate-500 mt-1 text-sm">
            Log kunjungan per ATM, untuk melihat kunjungan terakhir.
          </p>
        </div>
        <Link
          href="/visits/new"
          className="bg-slate-900 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-700"
        >
          + Catat Kunjungan
        </Link>
      </div>

      {visits.length === 0 && (
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-10 text-center text-slate-400 text-sm">
          Belum ada data kunjungan.
        </div>
      )}

      <div className="flex flex-col gap-4">
        {visits.map((v) => {
          const deleteVisitWithId = deleteVisit.bind(null, v.id);

          return (
            <div key={v.id} className="bg-white border border-slate-200 rounded-lg p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      v.visitType === "PM"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {v.visitType === "PM" ? "PM — Preventive" : "CM — Corrective"}
                  </span>
                  <div className="text-sm font-medium text-slate-800 mt-2">
                    {v.atm.tid} — {v.atm.location} ({v.atm.branch})
                  </div>
                  <div className="text-xs text-slate-400">SSB: {v.atm.ssb}</div>
                </div>

                <form action={deleteVisitWithId}>
                  <button className="text-red-500 hover:underline text-xs">Hapus</button>
                </form>
              </div>

              <div className="text-xs text-slate-400 mb-2">
                {formatJakartaDateTime(v.visitDate)}
                {v.visitType === "PM" && v.ticketNumber && (
                  <> · No. Tiket: {v.ticketNumber}</>
                )}
                {v.visitType === "CM" && v.ticket && (
                  <>
                    {" "}
                    · No. Tiket: {v.ticket.ticketNumber ?? "(belum ada nomor)"} — {v.ticket.problem}
                  </>
                )}
              </div>

              {v.keterangan && (
                <div className="text-sm text-slate-600 mb-2">
                  <span className="text-slate-400">Keterangan: </span>
                  {v.keterangan}
                </div>
              )}

              {v.photoUrl && (
                <a
                  href={v.photoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-slate-500 underline"
                >
                  Lihat Foto
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
