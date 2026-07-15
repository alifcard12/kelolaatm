import { prisma } from "@/lib/prisma";
import { createTicket } from "../actions";

export default async function NewTicketPage() {
  const atms = await prisma.atm.findMany({ orderBy: { tid: "asc" } });

  return (
    <div className="max-w-md">
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Buka Tiket Baru</h2>

      {atms.length === 0 ? (
        <p className="text-slate-500 text-sm">
          Belum ada data ATM. Tambahkan ATM dulu di menu ATM sebelum membuka tiket.
        </p>
      ) : (
        <form
          action={createTicket}
          className="flex flex-col gap-4 bg-white p-6 rounded-lg border border-slate-200"
        >
          <div>
            <label className="block text-sm text-slate-600 mb-1">ATM</label>
            <select
              name="atmId"
              required
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            >
              {atms.map((atm) => (
                <option key={atm.id} value={atm.id}>
                  {atm.tid} — {atm.location} ({atm.branch})
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">
              Lokasi, kanca, TID, dan SSB otomatis diambil dari data ATM ini.
            </p>
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Problem</label>
            <textarea
              name="problem"
              rows={3}
              required
              placeholder="mis. GROUNDING TINGGI"
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            className="bg-slate-900 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-700 mt-2"
          >
            Buka Tiket
          </button>
        </form>
      )}
    </div>
  );
}
