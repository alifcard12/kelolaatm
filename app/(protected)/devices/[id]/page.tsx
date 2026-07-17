import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateDevice, addDeviceLog, deleteDeviceLog, deleteDeviceLogPhoto, deleteDevice } from "../actions";
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

export default async function DeviceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const device = await prisma.device.findUnique({
    where: { id },
    include: {
      atm: true,
      logs: { orderBy: { createdAt: "desc" }, include: { photos: true } },
    },
  });

  if (!device) notFound();

  const updateDeviceWithId = updateDevice.bind(null, device.id);
  const addDeviceLogWithId = addDeviceLog.bind(null, device.id);
  const deleteDeviceLogWithId = deleteDeviceLog.bind(null, device.id);
  const deleteDeviceLogPhotoWithId = deleteDeviceLogPhoto.bind(null, device.id);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/devices" className="text-xs text-slate-400 hover:underline">
            ← Kembali ke Perangkat
          </Link>
          <h2 className="text-2xl font-semibold text-slate-800 mt-1">
            {device.type} — {device.brand}
          </h2>
          <Link href={`/atm/${device.atm.id}`} className="text-xs text-slate-500 hover:underline">
            TID {device.atm.tid} — {device.atm.location} ({device.atm.branch})
          </Link>
        </div>
        <form
          action={async () => {
            "use server";
            await deleteDevice(device.id);
            redirect("/devices");
          }}
        >
          <button className="text-red-500 hover:underline text-xs">Hapus Perangkat</button>
        </form>
      </div>

      {/* Edit info perangkat */}
      <form
        action={updateDeviceWithId}
        className="flex flex-col gap-4 bg-white p-6 rounded-lg border border-slate-200 mb-8"
      >
        <h3 className="text-sm font-semibold text-slate-700">Info Perangkat</h3>
        <div>
          <label className="block text-sm text-slate-600 mb-1">Brand</label>
          <input
            name="brand"
            type="text"
            required
            defaultValue={device.brand}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">Serial Number</label>
          <input
            name="serialNumber"
            type="text"
            required
            defaultValue={device.serialNumber}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">Kondisi</label>
          <select
            name="condition"
            required
            defaultValue={device.condition}
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
            defaultValue={device.note ?? ""}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded-full text-xs ${conditionColor[device.condition]}`}>
            {conditionLabel[device.condition]}
          </span>
          <span className="text-xs text-slate-400">
            Last Update: {formatRelativeTime(device.updatedAt)}
          </span>
        </div>
        <button
          type="submit"
          className="bg-slate-900 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-700 self-start"
        >
          Simpan Perubahan
        </button>
      </form>

      {/* Tambah riwayat + foto perangkat */}
      <form
        action={addDeviceLogWithId}
        className="flex flex-col gap-4 bg-white p-6 rounded-lg border border-slate-200 mb-8"
      >
        <h3 className="text-sm font-semibold text-slate-700">Tambah Riwayat / Foto Perangkat</h3>
        <div>
          <label className="block text-sm text-slate-600 mb-1">Catatan (opsional)</label>
          <textarea
            name="note"
            rows={2}
            placeholder="mis. hasil pengecekan, temuan kerusakan, perbaikan"
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">Foto (opsional, bisa lebih dari 1)</label>
          <PhotoUploader folder="device-logs" />
        </div>
        <button
          type="submit"
          className="bg-slate-900 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-700 self-start"
        >
          Simpan
        </button>
      </form>

      {/* Riwayat perangkat */}
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Riwayat Perangkat</h3>
      <div className="flex flex-col gap-3">
        {device.logs.length === 0 && (
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center text-slate-400 text-sm">
            Belum ada riwayat untuk perangkat ini.
          </div>
        )}
        {device.logs.map((log) => (
          <div key={log.id} className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{formatJakartaDateTime(log.createdAt)}</span>
              <form
                action={async () => {
                  "use server";
                  await deleteDeviceLogWithId(log.id);
                }}
              >
                <button type="submit" className="text-red-500 hover:underline text-xs">
                  Hapus Riwayat
                </button>
              </form>
            </div>
            {log.note && <p className="text-sm text-slate-600 mt-2">{log.note}</p>}
            <PhotoLightbox photos={log.photos} onDeletePhoto={deleteDeviceLogPhotoWithId} />
          </div>
        ))}
      </div>
    </div>
  );
}
