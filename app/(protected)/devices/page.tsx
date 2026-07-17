import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteDevice } from "./actions";
import { formatJakartaDateTime, formatRelativeTime } from "@/lib/date";

const conditionLabel: Record<string, string> = {
  GOOD: "Baik",
  DAMAGED: "Rusak",
  NEEDS_REPLACEMENT: "Perlu Ganti",
};

const conditionColor: Record<string, string> = {
  GOOD: "bg-green-100 text-green-700",
  DAMAGED: "bg-red-100 text-red-700",
  NEEDS_REPLACEMENT: "bg-amber-100 text-amber-700",
};

export default async function DevicesPage() {
  const devices = await prisma.device.findMany({
    include: { atm: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">Perangkat Pendukung</h2>
        <Link
          href="/devices/new"
          className="bg-slate-900 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-700"
        >
          + Tambah Perangkat
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600 text-left">
            <tr>
              <th className="px-4 py-3">Tipe</th>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">SN</th>
              <th className="px-4 py-3">ATM (TID)</th>
              <th className="px-4 py-3">Kondisi</th>
              <th className="px-4 py-3">Last Update</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {devices.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                  Belum ada data perangkat.
                </td>
              </tr>
            )}
            {devices.map((d) => (
              <tr key={d.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-800">{d.type}</td>
                <td className="px-4 py-3">{d.brand}</td>
                <td className="px-4 py-3">{d.serialNumber}</td>
                <td className="px-4 py-3">
                  <Link href={`/atm/${d.atm.id}`} className="hover:underline">
                    {d.atm.tid} — {d.atm.location}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${conditionColor[d.condition]}`}>
                    {conditionLabel[d.condition]}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  <span title={formatJakartaDateTime(d.updatedAt)}>
                    {formatRelativeTime(d.updatedAt)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <form
                    action={async () => {
                      "use server";
                      await deleteDevice(d.id);
                    }}
                  >
                    <button className="text-red-500 hover:underline text-xs">Hapus</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
