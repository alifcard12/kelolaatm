import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateAtm, addAtmLog, deleteAtmLog, deleteAtmLogPhoto, deleteAtm } from "../actions";
import { deleteDevice, replaceDevice } from "../../devices/actions";
import { formatJakartaDateTime, formatRelativeTime } from "@/lib/date";
import { PhotoUploader } from "@/components/PhotoUploader";
import { PhotoLightbox } from "@/components/PhotoLightbox";

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

const historyActionLabel: Record<string, string> = {
  ADDED: "Dipasang",
  REPLACED: "Diganti",
  REMOVED: "Dilepas",
};

const historyActionColor: Record<string, string> = {
  ADDED: "bg-green-100 text-green-700",
  REPLACED: "bg-amber-100 text-amber-700",
  REMOVED: "bg-red-100 text-red-700",
};

export default async function AtmDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const atm = await prisma.atm.findUnique({
    where: { id },
    include: {
      devices: { orderBy: { type: "asc" } },
      deviceHistory: { orderBy: { createdAt: "desc" } },
      logs: { orderBy: { createdAt: "desc" }, include: { photos: true } },
      visits: { orderBy: { visitDate: "desc" }, include: { ticket: true } },
    },
  });

  if (!atm) notFound();

  const updateAtmWithId = updateAtm.bind(null, atm.id);
  const addAtmLogWithId = addAtmLog.bind(null, atm.id);
  const deleteAtmLogWithId = deleteAtmLog.bind(null, atm.id);
  const deleteAtmLogPhotoWithId = deleteAtmLogPhoto.bind(null, atm.id);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/atm" className="text-xs text-slate-400 hover:underline">
            ← Kembali ke Data ATM
          </Link>
          <h2 className="text-2xl font-semibold text-slate-800 mt-1">TID {atm.tid}</h2>
        </div>
        <form
          action={async () => {
            "use server";
            await deleteAtm(atm.id);
            redirect("/atm");
          }}
        >
          <button className="text-red-500 hover:underline text-xs">Hapus ATM</button>
        </form>
      </div>

      {/* Edit info ATM */}
      <form
        action={updateAtmWithId}
        className="flex flex-col gap-4 bg-white p-6 rounded-lg border border-slate-200 mb-8"
      >
        <h3 className="text-sm font-semibold text-slate-700">Info ATM</h3>
        <div>
          <label className="block text-sm text-slate-600 mb-1">Location</label>
          <input
            name="location"
            type="text"
            required
            defaultValue={atm.location}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">Branch</label>
          <input
            name="branch"
            type="text"
            required
            defaultValue={atm.branch}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">SSB</label>
          <input
            name="ssb"
            type="text"
            required
            defaultValue={atm.ssb}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="bg-slate-900 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-700 self-start"
        >
          Simpan Perubahan
        </button>
      </form>

      {/* Devices terkait */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-700">Perangkat Terpasang</h3>
        <Link href="/devices/new" className="text-xs text-slate-500 hover:underline">
          + Tambah Perangkat
        </Link>
      </div>
      <div className="flex flex-col gap-3 mb-8">
        {atm.devices.length === 0 && (
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center text-slate-400 text-sm">
            Belum ada perangkat terpasang di ATM ini.
          </div>
        )}
        {atm.devices.map((d) => {
          const deleteDeviceWithId = deleteDevice.bind(null, d.id);
          const replaceDeviceWithId = replaceDevice.bind(null, d.id);
          return (
            <div key={d.id} className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-slate-800">
                    {d.type} — {d.brand}
                  </span>
                  <span className="text-xs text-slate-400 ml-2">SN {d.serialNumber}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${conditionColor[d.condition]}`}>
                  {conditionLabel[d.condition]}
                </span>
              </div>
              {d.note && <p className="text-sm text-slate-600 mt-2">{d.note}</p>}
              <div className="text-xs text-slate-400 mt-2">
                Last Update: {formatRelativeTime(d.updatedAt)}
              </div>

              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
                <details className="flex-1">
                  <summary className="text-xs text-amber-600 hover:underline cursor-pointer">
                    Ganti Perangkat
                  </summary>
                  <form
                    action={replaceDeviceWithId}
                    className="flex flex-col gap-3 mt-3 bg-slate-50 p-3 rounded-md"
                  >
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Tipe Perangkat Baru</label>
                      <select
                        name="type"
                        required
                        defaultValue={d.type}
                        className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
                      >
                        <option value="NVR">NVR</option>
                        <option value="MONITOR">Monitor</option>
                        <option value="CCTV">CCTV</option>
                        <option value="UPS">UPS</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Brand Baru</label>
                      <input
                        name="brand"
                        type="text"
                        required
                        placeholder="mis. Hikvision, APC, Samsung"
                        className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">SN Baru</label>
                      <input
                        name="serialNumber"
                        type="text"
                        required
                        className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Kondisi Perangkat Baru</label>
                      <select
                        name="condition"
                        required
                        defaultValue="GOOD"
                        className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
                      >
                        <option value="GOOD">Baik</option>
                        <option value="DAMAGED">Rusak</option>
                        <option value="NEEDS_REPLACEMENT">Perlu Ganti</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Catatan (opsional)</label>
                      <textarea
                        name="note"
                        rows={2}
                        placeholder="mis. alasan penggantian"
                        className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-amber-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-amber-500 self-start"
                    >
                      Simpan Penggantian
                    </button>
                  </form>
                </details>

                <form
                  action={async () => {
                    "use server";
                    await deleteDeviceWithId();
                  }}
                >
                  <button className="text-red-500 hover:underline text-xs">Hapus</button>
                </form>
              </div>
            </div>
          );
        })}
      </div>

      {/* Riwayat penggantian device */}
      {atm.deviceHistory.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Riwayat Perangkat</h3>
          <div className="flex flex-col gap-2 mb-8">
            {atm.deviceHistory.map((h) => (
              <div
                key={h.id}
                className="bg-white border border-slate-200 rounded-lg p-3 flex items-start justify-between gap-3"
              >
                <div>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${historyActionColor[h.action]}`}>
                    {historyActionLabel[h.action]}
                  </span>
                  <div className="text-sm text-slate-700 mt-1">
                    {h.deviceType} — {h.brand} — SN {h.serialNumber}
                  </div>
                  {h.note && <div className="text-xs text-slate-500 mt-1">{h.note}</div>}
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {formatJakartaDateTime(h.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Jadwal kunjungan terkait */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-700">Jadwal Kunjungan</h3>
        <Link href="/visits/new" className="text-xs text-slate-500 hover:underline">
          + Catat Kunjungan
        </Link>
      </div>
      <div className="flex flex-col gap-2 mb-8">
        {atm.visits.length === 0 && (
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center text-slate-400 text-sm">
            Belum ada jadwal kunjungan untuk ATM ini.
          </div>
        )}
        {atm.visits.map((v) => (
          <div
            key={v.id}
            className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between gap-3"
          >
            <div>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  v.visitType === "PM"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {v.visitType === "PM" ? "PM — Preventive" : "CM — Corrective"}
              </span>
              <span className="text-sm text-slate-700 ml-2">
                {v.visitType === "PM"
                  ? v.ticketNumber
                    ? `No. Tiket: ${v.ticketNumber}`
                    : "Tanpa nomor tiket"
                  : v.ticket
                  ? `No. Tiket: ${v.ticket.ticketNumber ?? "(belum ada nomor)"} — ${v.ticket.problem}`
                  : "Tiket tidak ditemukan"}
              </span>
              {v.keterangan && (
                <div className="text-xs text-slate-500 mt-1">{v.keterangan}</div>
              )}
            </div>
            <span className="text-xs text-slate-400 whitespace-nowrap">
              {formatJakartaDateTime(v.visitDate)}
            </span>
          </div>
        ))}
      </div>

      {/* Tambah riwayat + foto ATM */}
      <form
        action={addAtmLogWithId}
        className="flex flex-col gap-4 bg-white p-6 rounded-lg border border-slate-200 mb-8"
      >
        <h3 className="text-sm font-semibold text-slate-700">Tambah Riwayat / Foto ATM</h3>
        <div>
          <label className="block text-sm text-slate-600 mb-1">Catatan (opsional)</label>
          <textarea
            name="note"
            rows={2}
            placeholder="mis. kunjungan rutin, kondisi lokasi, dsb."
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">Foto (opsional, bisa lebih dari 1)</label>
          <PhotoUploader folder="atm-logs" />
        </div>
        <button
          type="submit"
          className="bg-slate-900 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-700 self-start"
        >
          Simpan
        </button>
      </form>

      {/* Riwayat ATM */}
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Riwayat ATM</h3>
      <div className="flex flex-col gap-3">
        {atm.logs.length === 0 && (
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center text-slate-400 text-sm">
            Belum ada riwayat untuk ATM ini.
          </div>
        )}
        {atm.logs.map((log) => (
          <div key={log.id} className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{formatJakartaDateTime(log.createdAt)}</span>
              <form
                action={async () => {
                  "use server";
                  await deleteAtmLogWithId(log.id);
                }}
              >
                <button type="submit" className="text-red-500 hover:underline text-xs">
                  Hapus Riwayat
                </button>
              </form>
            </div>
            {log.note && <p className="text-sm text-slate-600 mt-2">{log.note}</p>}
            <PhotoLightbox photos={log.photos} onDeletePhoto={deleteAtmLogPhotoWithId} />
          </div>
        ))}
      </div>
    </div>
  );
}
