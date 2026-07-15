import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatJakartaDateTime } from "@/lib/date";
import { addKasetLog, deleteKaset, updateKasetType } from "../actions";

const conditionLabel: Record<string, string> = {
  GOOD: "Baik",
  DAMAGED: "Rusak",
  NEEDS_REPLACEMENT: "Perlu Ganti",
};

const typeLabel: Record<string, string> = {
  ALL_IN: "All in One",
  CURRENCY: "Currency",
};

const conditionColor: Record<string, string> = {
  GOOD: "bg-green-100 text-green-700",
  DAMAGED: "bg-red-100 text-red-700",
  NEEDS_REPLACEMENT: "bg-amber-100 text-amber-700",
};

export default async function KasetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const kaset = await prisma.kaset.findUnique({
    where: { id },
    include: { logs: { orderBy: { createdAt: "desc" } } },
  });

  if (!kaset) notFound();

  const addLogWithId = addKasetLog.bind(null, kaset.id);
  const updateTypeWithId = updateKasetType.bind(null, kaset.id);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">Kaset {kaset.serialNumber}</h2>
        <form
          action={async () => {
            "use server";
            await deleteKaset(kaset.id);
          }}
        >
          <button className="text-red-500 hover:underline text-xs">Hapus Kaset</button>
        </form>
      </div>

      {/* Tipe kaset */}
      <form
        action={updateTypeWithId}
        className="flex items-center gap-3 bg-white p-4 rounded-lg border border-slate-200 mb-6"
      >
        <span className="text-sm text-slate-600">Tipe:</span>
        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
          {typeLabel[kaset.type]}
        </span>
        <select
          name="type"
          defaultValue={kaset.type}
          className="border border-slate-300 rounded-md px-2 py-1.5 text-sm ml-auto"
        >
          <option value="ALL_IN">All in One</option>
          <option value="CURRENCY">Currency</option>
        </select>
        <button
          type="submit"
          className="bg-slate-900 text-white text-xs px-3 py-1.5 rounded-md hover:bg-slate-700"
        >
          Ubah Tipe
        </button>
      </form>

      {/* Form tambah update kondisi baru */}
      <form
        action={addLogWithId}
        className="flex flex-col gap-4 bg-white p-6 rounded-lg border border-slate-200 mb-8"
      >
        <h3 className="text-sm font-semibold text-slate-700">Tambah Update Kondisi</h3>
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
          <label className="block text-sm text-slate-600 mb-1">Problem (opsional)</label>
          <textarea
            name="problem"
            rows={2}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="bg-slate-900 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-700 self-start"
        >
          Simpan Update
        </button>
      </form>

      {/* Riwayat */}
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Riwayat</h3>
      <div className="flex flex-col gap-3">
        {kaset.logs.map((log) => (
          <div key={log.id} className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded-full text-xs ${conditionColor[log.condition]}`}>
                {conditionLabel[log.condition]}
              </span>
              <span className="text-xs text-slate-400">{formatJakartaDateTime(log.createdAt)}</span>
            </div>
            {log.problem && <p className="text-sm text-slate-600 mt-2">{log.problem}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
