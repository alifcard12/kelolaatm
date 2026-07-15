import { createAtm } from "../actions";

export default function NewAtmPage() {
  return (
    <div className="max-w-md">
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Tambah ATM</h2>

      <form action={createAtm} className="flex flex-col gap-4 bg-white p-6 rounded-lg border border-slate-200">
        <div>
          <label className="block text-sm text-slate-600 mb-1">TID</label>
          <input
            name="tid"
            type="number"
            required
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-600 mb-1">Location</label>
          <input
            name="location"
            type="text"
            required
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-600 mb-1">Branch</label>
          <input
            name="branch"
            type="text"
            required
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-600 mb-1">SSB</label>
          <input
            name="ssb"
            type="text"
            required
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
