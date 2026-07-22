import { Card, CardTitle } from "@/components/ui/Card";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { formatJakartaDateTime } from "@/lib/date";
import { listAbsensiLogs } from "@/lib/absensi";
import { deleteAbsensiLogAction } from "./actions";

function statusInfo(log: { success: boolean; errorMessage: string | null }): {
  label: string;
  tone: BadgeTone;
} {
  if (!log.success) return { label: "Gagal", tone: "danger" };
  if (log.errorMessage) return { label: "Perlu Dicek", tone: "warning" };
  return { label: "Berhasil", tone: "success" };
}

export default async function AbsensiHistory() {
  const logs = await listAbsensiLogs();

  if (logs.length === 0) {
    return (
      <Card>
        <CardTitle className="mb-4">Riwayat Absen</CardTitle>
        <EmptyState
          title="Belum ada riwayat"
          description="Riwayat absen manual maupun otomatis akan muncul di sini."
        />
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle className="mb-4">Riwayat Absen</CardTitle>

      {/* Desktop */}
      <Table>
        <Thead>
          <Th>Waktu</Th>
          <Th>User</Th>
          <Th>Keterangan</Th>
          <Th>Metode</Th>
          <Th>Lokasi</Th>
          <Th>Accuracy</Th>
          <Th>Secure Score</Th>
          <Th>Alasan Terlambat</Th>
          <Th>Status</Th>
          <Th className="text-right">Aksi</Th>
        </Thead>
        <Tbody>
          {logs.map((log) => {
            const status = statusInfo(log);
            return (
              <Tr key={log.id}>
                <Td className="whitespace-nowrap">{formatJakartaDateTime(log.createdAt)}</Td>
                <Td>{log.username}</Td>
                <Td className="capitalize">{log.keterangan}</Td>
                <Td>
                  <Badge tone={log.manualLocation ? "info" : "neutral"}>
                    {log.manualLocation ? "Manual" : "Otomatis"}
                  </Badge>
                </Td>
                <Td className="whitespace-nowrap">
                  {log.latitude}, {log.longitude}
                </Td>
                <Td>{log.accuracy}</Td>
                <Td>{log.secureScore}</Td>
                <Td className="max-w-[220px]">
                  {log.alasanTerlambat || <span className="text-espresso-soft/70">-</span>}
                </Td>
                <Td>
                  <Badge tone={status.tone}>{status.label}</Badge>
                </Td>
                <Td className="text-right">
                  <DeleteButton
                    action={deleteAbsensiLogAction.bind(null, log.id)}
                    confirmTitle="Hapus riwayat absen ini?"
                    confirmDescription="Catatan ini akan dihapus dari riwayat di aplikasi kita. Data di web absensi.itsview.id tidak ikut terhapus."
                    successMessage="Riwayat absen dihapus."
                  />
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>

      {/* Mobile */}
      <div className="md:hidden flex flex-col gap-3">
        {logs.map((log) => {
          const status = statusInfo(log);
          return (
            <div
              key={log.id}
              className="rounded-xl border border-taupe/70 bg-paper p-3.5 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-espresso capitalize">
                  {log.keterangan} · {log.username}
                </p>
                <Badge tone={status.tone}>{status.label}</Badge>
              </div>
              <p className="text-xs text-espresso-soft">{formatJakartaDateTime(log.createdAt)}</p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={log.manualLocation ? "info" : "neutral"}>
                  {log.manualLocation ? "Manual" : "Otomatis"}
                </Badge>
                <span className="text-xs text-espresso-soft">
                  {log.latitude}, {log.longitude}
                </span>
              </div>
              <div className="text-xs text-espresso-soft flex flex-wrap gap-x-4 gap-y-1">
                <span>Accuracy: {log.accuracy}</span>
                <span>Secure Score: {log.secureScore}</span>
              </div>
              {log.alasanTerlambat && (
                <p className="text-xs text-espresso-soft">
                  Alasan terlambat: {log.alasanTerlambat}
                </p>
              )}
              {log.errorMessage && (
                <p className={`text-xs ${log.success ? "text-warning" : "text-danger"}`}>
                  {log.errorMessage}
                </p>
              )}
              <div className="flex justify-end pt-1">
                <DeleteButton
                  action={deleteAbsensiLogAction.bind(null, log.id)}
                  confirmTitle="Hapus riwayat absen ini?"
                  confirmDescription="Catatan ini akan dihapus dari riwayat di aplikasi kita. Data di web absensi.itsview.id tidak ikut terhapus."
                  successMessage="Riwayat absen dihapus."
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
