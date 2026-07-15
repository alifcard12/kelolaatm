import { prisma } from "@/lib/prisma";
import { createDevice } from "../actions";

export default async function NewDevicePage() {
  const atms = await prisma.atm.findMany({ orderBy: { tid: "asc" } });

  return (
    <div className="max-w-md">
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Tambah Perangkat</h2>

      {atms.length === 0 ? (
        <p className="text-slate-500 text-sm">
          Belum ada data ATM. Tambahkan ATM dulu di menu ATM sebelum menambah perangkat.
        </p>
      ) : (
        <form
          action={createDevice}
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
                  {atm.tid} — {atm.location}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Tipe Perangkat</label>
            <select
              name="type"
              required
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="NVR">NVR</option>
              <option value="MONITOR">Monitor</option>
              <option value="CCTV">CCTV</option>
              <option value="UPS">UPS</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Brand</label>
            <input
              name="brand"
              type="text"
              required
              placeholder="mis. Hikvision, APC, Samsung"
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Serial Number</label>
            <input
              name="serialNumber"
              type="text"
              required
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Kondisi</label>
            <select
              name="condition"
              required
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="GOOD">Baik</option>
              <option value="DAMAGED">Rusak</option>
              <option value="NEEDS_REPLACEMENT">Perlu Ganti</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Catatan (opsional)</label>
            <textarea
              name="note"
              rows={3}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            className="bg-slate-900 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-700 mt-2"
          >
            Simpan
          </button>
        </form>
      )}
    </div>
  );
}
