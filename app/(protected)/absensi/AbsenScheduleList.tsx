import { Card, CardTitle } from "@/components/ui/Card";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { formatJakartaDateTime } from "@/lib/date";
import { listAbsenSchedules } from "@/lib/absenSchedule";
import { deleteAbsenScheduleAction } from "./schedule-actions";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu",
  DONE: "Terkirim",
  FAILED: "Gagal",
};

const STATUS_TONE: Record<string, BadgeTone> = {
  PENDING: "warning",
  DONE: "success",
  FAILED: "danger",
};

export default async function AbsenScheduleList() {
  const schedules = await listAbsenSchedules();

  if (schedules.length === 0) {
    return (
      <Card>
        <CardTitle className="mb-4">Jadwal Absen</CardTitle>
        <EmptyState
          title="Belum ada jadwal"
          description="Jadwal yang dibuat akan otomatis dieksekusi oleh GitHub Actions pada waktunya."
        />
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle className="mb-4">Jadwal Absen</CardTitle>

      {/* Desktop */}
      <Table>
        <Thead>
          <Th>Waktu Jadwal</Th>
          <Th>Keterangan</Th>
          <Th>Lokasi</Th>
          <Th>Accuracy</Th>
          <Th>Secure Score</Th>
          <Th>Status</Th>
          <Th>Hasil</Th>
          <Th className="text-right">Aksi</Th>
        </Thead>
        <Tbody>
          {schedules.map((s) => (
            <Tr key={s.id}>
              <Td className="whitespace-nowrap">{formatJakartaDateTime(s.scheduledAt)}</Td>
              <Td className="capitalize">{s.keterangan}</Td>
              <Td className="whitespace-nowrap">
                {s.latitude}, {s.longitude}
              </Td>
              <Td>{s.accuracy}</Td>
              <Td>{s.secureScore}</Td>
              <Td>
                <Badge tone={STATUS_TONE[s.status]}>{STATUS_LABEL[s.status]}</Badge>
              </Td>
              <Td className="max-w-[220px]">
                {s.resultMessage || <span className="text-espresso-soft/70">-</span>}
              </Td>
              <Td className="text-right">
                <DeleteButton
                  action={deleteAbsenScheduleAction.bind(null, s.id)}
                  confirmTitle="Hapus jadwal ini?"
                  confirmDescription="Jadwal yang belum jalan (Menunggu) akan dibatalkan. Jadwal yang sudah Terkirim/Gagal hanya dihapus dari riwayat."
                  successMessage="Jadwal absen dihapus."
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Mobile */}
      <div className="md:hidden flex flex-col gap-3">
        {schedules.map((s) => (
          <div
            key={s.id}
            className="rounded-xl border border-taupe/70 bg-paper p-3.5 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-espresso capitalize">{s.keterangan}</p>
              <Badge tone={STATUS_TONE[s.status]}>{STATUS_LABEL[s.status]}</Badge>
            </div>
            <p className="text-xs text-espresso-soft">{formatJakartaDateTime(s.scheduledAt)}</p>
            <p className="text-xs text-espresso-soft">
              {s.latitude}, {s.longitude}
            </p>
            <div className="text-xs text-espresso-soft flex flex-wrap gap-x-4 gap-y-1">
              <span>Accuracy: {s.accuracy}</span>
              <span>Secure Score: {s.secureScore}</span>
            </div>
            {s.resultMessage && (
              <p className="text-xs text-espresso-soft">{s.resultMessage}</p>
            )}
            <div className="flex justify-end pt-1">
              <DeleteButton
                action={deleteAbsenScheduleAction.bind(null, s.id)}
                confirmTitle="Hapus jadwal ini?"
                confirmDescription="Jadwal yang belum jalan (Menunggu) akan dibatalkan. Jadwal yang sudah Terkirim/Gagal hanya dihapus dari riwayat."
                successMessage="Jadwal absen dihapus."
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
