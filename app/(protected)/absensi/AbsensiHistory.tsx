import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { formatJakartaDateTime } from "@/lib/date";
import { listAbsensiLogs } from "@/lib/absensi";

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
        </Thead>
        <Tbody>
          {logs.map((log) => (
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
                <Badge tone={log.success ? "success" : "danger"}>
                  {log.success ? "Berhasil" : "Gagal"}
                </Badge>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Mobile */}
      <div className="md:hidden flex flex-col gap-3">
        {logs.map((log) => (
          <div
            key={log.id}
            className="rounded-xl border border-taupe/70 bg-paper p-3.5 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-espresso capitalize">
                {log.keterangan} · {log.username}
              </p>
              <Badge tone={log.success ? "success" : "danger"}>
                {log.success ? "Berhasil" : "Gagal"}
              </Badge>
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
            {!log.success && log.errorMessage && (
              <p className="text-xs text-danger">{log.errorMessage}</p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
