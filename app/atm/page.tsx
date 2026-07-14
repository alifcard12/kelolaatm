import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteAtm } from "./actions";
import { Atm } from "@prisma/client";

export default async function AtmListPage() {
  const atms = await prisma.atm.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">Data ATM</h2>
        <Link
          href="/atm/new"
          className="bg-slate-900 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-700"
        >
          + Tambah ATM
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600 text-left">
            <tr>
              <th className="px-4 py-3">TID</th>
              <th className="px-4 py-3">Lokasi</th>
              <th className="px-4 py-3">Branch</th>
              <th className="px-4 py-3">SSB</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {atms.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-slate-400"
                >
                  Belum ada data ATM.
                </td>
              </tr>
            )}
            {atms.map((atm: Atm) => (
              <tr key={atm.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-800">
                  {atm.tid}
                </td>
                <td className="px-4 py-3">{atm.location}</td>
                <td className="px-4 py-3">{atm.branch}</td>
                <td className="px-4 py-3">{atm.ssb}</td>
                <td className="px-4 py-3 text-right">
                  <form
                    action={async () => {
                      "use server";
                      await deleteAtm(atm.id);
                    }}
                  >
                    <button className="text-red-500 hover:underline text-xs">
                      Hapus
                    </button>
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
