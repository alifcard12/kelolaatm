import { prisma } from "@/lib/prisma";
import { createVisit } from "../actions";
import VisitTypeFields from "../VisitTypeFields";

// Nilai default untuk <input type="datetime-local">, mengikuti waktu Jakarta (WIB, UTC+7)
function defaultDatetimeLocalValue(date: Date): string {
  const jakarta = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return jakarta.toISOString().slice(0, 16);
}

export default async function NewVisitPage() {
  const [atms, closedTickets] = await Promise.all([
    prisma.atm.findMany({ orderBy: { tid: "asc" } }),
    prisma.ticket.findMany({
      where: { status: "CLOSED" },
      include: { atm: true },
      orderBy: { closedAt: "desc" },
    }),
  ]);

  return (
    <div className="max-w-md">
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Tambah Jadwal Kunjungan</h2>

      {atms.length === 0 ? (
        <p className="text-slate-500 text-sm">
          Belum ada data ATM. Tambahkan ATM dulu di menu ATM sebelum mencatat kunjungan.
        </p>
      ) : (
        <form
          action={createVisit}
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

          <VisitTypeFields closedTickets={closedTickets} />

          <div>
            <label className="block text-sm text-slate-600 mb-1">Tanggal &amp; Waktu Kunjungan</label>
            <input
              name="visitDate"
              type="datetime-local"
              required
              defaultValue={defaultDatetimeLocalValue(new Date())}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Keterangan (opsional)</label>
            <textarea
              name="keterangan"
              rows={3}
              placeholder="mis. Cek fisik mesin, bersih-bersih kaset, cek grounding"
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">URL Foto (opsional)</label>
            <input
              name="photoUrl"
              type="url"
              placeholder="https://..."
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            />
            <p className="text-xs text-slate-400 mt-1">
              Sementara tempel link foto (mis. dari Cloudinary/Google Drive). Upload langsung bisa
              menyusul.
            </p>
          </div>

          <button
            type="submit"
            className="bg-slate-900 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-700 mt-2"
          >
            Simpan Kunjungan
          </button>
        </form>
      )}
    </div>
  );
}
