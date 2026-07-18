import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateDevice, addDeviceLog, deleteDeviceLog, deleteDeviceLogPhoto, deleteDevice } from "../actions";
import { formatJakartaDateTime, formatRelativeTime } from "@/lib/date";
import { PhotoUploader } from "@/components/PhotoUploader";
import { PhotoLightbox } from "@/components/PhotoLightbox";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { FiChevronLeft } from "react-icons/fi";
import { ActionForm } from "@/components/ui/ActionForm";
import { CONDITION_LABEL, CONDITION_TONE } from "@/lib/labels";

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
  const deleteDeviceLogPhotoWithId = deleteDeviceLogPhoto.bind(null, device.id);

  async function deleteAndRedirect() {
    "use server";
    await deleteDevice(device.id);
    redirect("/devices");
  }

  return (
    <div className="max-w-2xl">
      <Link href="/devices" className="inline-flex items-center gap-1 text-xs text-espresso-soft hover:text-rose mb-2">
        <FiChevronLeft /> Kembali ke Perangkat
      </Link>

      <PageHeader
        title={`${device.type} — ${device.brand}`}
        description={
          <Link href={`/atm/${device.atm.id}`} className="hover:text-rose transition-colors">
            TID {device.atm.tid} — {device.atm.location} ({device.atm.branch})
          </Link>
        }
        action={<DeleteButton action={deleteAndRedirect} label="Hapus Perangkat" />}
      />

      {/* Edit info perangkat */}
      <Card className="flex flex-col gap-4 mb-8">
        <CardTitle>Info Perangkat</CardTitle>
        <ActionForm action={updateDeviceWithId} successMessage="Perangkat berhasil disimpan" className="flex flex-col gap-4">
          <Field label="Brand" htmlFor="brand">
            <Input id="brand" name="brand" type="text" required defaultValue={device.brand} />
          </Field>
          <Field label="Serial Number" htmlFor="serialNumber">
            <Input
              id="serialNumber"
              name="serialNumber"
              type="text"
              required
              defaultValue={device.serialNumber}
            />
          </Field>
          <Field label="Kondisi" htmlFor="condition">
            <Select id="condition" name="condition" required defaultValue={device.condition}>
              <option value="GOOD">Baik</option>
              <option value="DAMAGED">Rusak</option>
              <option value="NEEDS_REPLACEMENT">Perlu Ganti</option>
            </Select>
          </Field>
          <Field label="Catatan (opsional)" htmlFor="note">
            <Textarea id="note" name="note" rows={3} defaultValue={device.note ?? ""} />
          </Field>
          <div className="flex items-center gap-3">
            <Badge tone={CONDITION_TONE[device.condition]}>{CONDITION_LABEL[device.condition]}</Badge>
            <span className="text-xs text-espresso-soft/70">
              Last Update: {formatRelativeTime(device.updatedAt)}
            </span>
          </div>
          <Button type="submit" className="self-start">
            Simpan Perubahan
          </Button>
        </ActionForm>
      </Card>

      {/* Tambah riwayat + foto perangkat */}
      <Card className="flex flex-col gap-4 mb-8">
        <CardTitle>Tambah Riwayat / Foto Perangkat</CardTitle>
        <ActionForm action={addDeviceLogWithId} successMessage="Riwayat berhasil ditambahkan" resetOnSuccess className="flex flex-col gap-4">
          <Field label="Catatan (opsional)" htmlFor="logNote">
            <Textarea
              id="logNote"
              name="note"
              rows={2}
              placeholder="mis. hasil pengecekan, temuan kerusakan, perbaikan"
            />
          </Field>
          <Field label="Foto (opsional, bisa lebih dari 1)">
            <PhotoUploader folder="device-logs" />
          </Field>
          <Button type="submit" className="self-start">
            Simpan
          </Button>
        </ActionForm>
      </Card>

      {/* Riwayat perangkat */}
      <h3 className="font-display text-sm font-semibold text-espresso mb-3">Riwayat Perangkat</h3>
      <div className="flex flex-col gap-3">
        {device.logs.length === 0 && (
          <EmptyState title="Belum ada riwayat" description="Riwayat perangkat ini akan muncul di sini." />
        )}
        {device.logs.map((log) => (
          <Card key={log.id}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-espresso-soft/70">{formatJakartaDateTime(log.createdAt)}</span>
              <DeleteButton action={deleteDeviceLog.bind(null, device.id, log.id)} label="Hapus Riwayat" />
            </div>
            {log.note && <p className="text-sm text-espresso-soft mt-2">{log.note}</p>}
            <PhotoLightbox photos={log.photos} onDeletePhoto={deleteDeviceLogPhotoWithId} />
          </Card>
        ))}
      </div>
    </div>
  );
}
