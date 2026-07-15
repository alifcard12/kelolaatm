import { createKaset } from "../actions";

export default function NewKasetPage() {
  return (
    <div className="max-w-md">
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Tambah Kaset</h2>

      <form action={createKaset} className="flex flex-col gap-4 bg-white p-6 rounded-lg border border-slate-200">
        <div>
          <label className="block text-sm text-slate-600 mb-1">Serial Number (SN)</label>
          <input
            name="serialNumber"
            type="text"
            required
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-600 mb-1">Tipe Kaset</label>
          <select
            name="type"
            required
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="ALL_IN">All in One</option>
            <option value="CURRENCY">Currency</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-600 mb-1">Kondisi Awal</label>
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
          <label className="block text-sm text-slate-600 mb-1">Problem (opsional)</label>
          <textarea
            name="problem"
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
    </div>
  );
}
