import Link from "next/link";
import { prisma } from "@/lib/prisma";
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

const typeLabel: Record<string, string> = {
  ALL_IN: "All in One",
  CURRENCY: "Currency",
};

export default async function KasetListPage() {
  const kasetList = await prisma.kaset.findMany({
    include: {
      logs: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  // Urutkan berdasarkan log terbaru (last update), bukan createdAt kaset itu sendiri
  kasetList.sort((a, b) => {
    const aTime = a.logs[0]?.createdAt.getTime() ?? 0;
    const bTime = b.logs[0]?.createdAt.getTime() ?? 0;
    return bTime - aTime;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">Kaset</h2>
        <Link
          href="/kaset/new"
          className="bg-slate-900 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-700"
        >
          + Tambah Kaset
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600 text-left">
            <tr>
              <th className="px-4 py-3">SN</th>
              <th className="px-4 py-3">Tipe</th>
              <th className="px-4 py-3">Kondisi Terakhir</th>
              <th className="px-4 py-3">Problem Terakhir</th>
              <th className="px-4 py-3">Last Update</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {kasetList.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Belum ada data kaset.
                </td>
              </tr>
            )}
            {kasetList.map((k) => {
              const latest = k.logs[0];
              return (
                <tr key={k.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    <Link href={`/kaset/${k.id}`} className="hover:underline">
                      {k.serialNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{typeLabel[k.type]}</td>
                  <td className="px-4 py-3">
                    {latest ? (
                      <span className={`px-2 py-1 rounded-full text-xs ${conditionColor[latest.condition]}`}>
                        {conditionLabel[latest.condition]}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{latest?.problem ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {latest ? (
                      <span title={formatJakartaDateTime(latest.createdAt)}>
                        {formatRelativeTime(latest.createdAt)}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/kaset/${k.id}`} className="text-slate-600 hover:underline text-xs">
                      Lihat Riwayat
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
