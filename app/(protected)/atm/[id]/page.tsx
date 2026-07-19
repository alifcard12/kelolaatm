import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  updateAtm,
  addAtmLog,
  deleteAtmLog,
  deleteAtmLogPhoto,
  deleteAtm,
} from "../actions";
import { deleteDevice, replaceDevice } from "../../devices/actions";
import {
  formatJakartaDateTime,
  formatJakartaDate,
  formatRelativeTime,
} from "@/lib/date";
import { PhotoUploader } from "@/components/PhotoUploader";
import { PhotoLightbox } from "@/components/PhotoLightbox";
import CopyTextButton from "@/components/CopyTextButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { FiArrowLeft, FiClock, FiPlus, FiSave, FiTrash } from "react-icons/fi";
import { ActionForm } from "@/components/ui/ActionForm";
import {
  CONDITION_LABEL,
  CONDITION_TONE,
  HISTORY_ACTION_LABEL,
  HISTORY_ACTION_TONE,
  VISIT_TYPE_LABEL,
  VISIT_TYPE_TONE,
} from "@/lib/labels";

export default async function AtmDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
  const deleteAtmLogPhotoWithId = deleteAtmLogPhoto.bind(null, atm.id);

  async function deleteAndRedirect() {
    "use server";
    await deleteAtm(atm!.id);
    redirect("/atm");
  }

  return (
    <div className="max-w-2xl">
      <Link
        href="/atm"
        className="inline-flex items-center gap-1 text-xs text-espresso-soft hover:text-rose mb-2"
      >
        <FiArrowLeft /> Back to ATM
      </Link>

      <PageHeader
        title={`TID ${atm.tid}`}
        action={
          <DeleteButton
            action={deleteAndRedirect}
            label={
              <div className="inline-flex items-center px-2 py-1.5 rounded-lg gap-1 bg-rose text-paper hover:bg-rose-dark active:bg-rose-dark shadow-sm shadow-rose/20">
                <FiTrash /> Hapus ATM
              </div>
            }
          />
        }
      />

      {/* Edit info ATM */}
      <Card className="flex flex-col gap-4 mb-4">
        <CardTitle>Info ATM</CardTitle>

        <div className="flex flex-wrap gap-2 -mt-1">
          <CopyTextButton
            text={String(atm.tid)}
            label={`Copy TID`}
            className="bg-cream text-espresso-soft text-xs font-medium px-2 py-1.5 rounded-lg border border-taupe/70 hover:border-rose/50 hover:text-rose transition-colors"
          />
          <CopyTextButton
            text={atm.location}
            label="Copy Lokasi"
            className="bg-cream text-espresso-soft text-xs font-medium px-2 py-1.5 rounded-lg border border-taupe/70 hover:border-rose/50 hover:text-rose transition-colors"
          />
          <CopyTextButton
            text={atm.branch}
            label="Copy Branch"
            className="bg-cream text-espresso-soft text-xs font-medium px-2 py-1.5 rounded-lg border border-taupe/70 hover:border-rose/50 hover:text-rose transition-colors"
          />
          <CopyTextButton
            text={atm.ssb}
            label="Copy SSB"
            className="bg-cream text-espresso-soft text-xs font-medium px-2 py-1.5 rounded-lg border border-taupe/70 hover:border-rose/50 hover:text-rose transition-colors"
          />
        </div>

        <ActionForm
          action={updateAtmWithId}
          successMessage="Info ATM berhasil disimpan"
          className="flex flex-col gap-4"
        >
          <Field label="Location" htmlFor="location">
            <Input
              id="location"
              name="location"
              type="text"
              required
              defaultValue={atm.location}
            />
          </Field>
          <Field label="Branch" htmlFor="branch">
            <Input
              id="branch"
              name="branch"
              type="text"
              required
              defaultValue={atm.branch}
            />
          </Field>
          <Field label="SSB" htmlFor="ssb">
            <Input
              id="ssb"
              name="ssb"
              type="text"
              required
              defaultValue={atm.ssb}
            />
          </Field>
          <Button variant="success" type="submit" className="self-start">
            <FiSave />
            Simpan
          </Button>
        </ActionForm>
      </Card>

      {/* Devices terkait */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-sm font-semibold text-espresso">
          Perangkat Terpasang
        </h3>
        <Link
          href="/devices/new"
          className="inline-flex items-center gap-1 text-xs text-rose hover:underline"
        >
          <FiPlus className="h-3.5 w-3.5" /> Tambah Perangkat
        </Link>
      </div>
      <div className="flex flex-col gap-3 mb-8">
        {atm.devices.length === 0 && (
          <EmptyState
            title="Belum ada perangkat"
            description="Belum ada perangkat terpasang di ATM ini."
          />
        )}
        {atm.devices.map((d) => {
          const replaceDeviceWithId = replaceDevice.bind(null, d.id);
          return (
            <Card key={d.id}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-sm font-medium text-espresso">
                    {d.type} - {d.brand}
                  </span>
                </div>
                <Badge tone={CONDITION_TONE[d.condition]}>
                  {CONDITION_LABEL[d.condition]}
                </Badge>
              </div>
              {d.note && (
                <p className="text-sm text-espresso-soft mt-2">{d.note}</p>
              )}
              <div className="text-xs text-espresso-soft/70 mt-2 flex items-center justify-between">
                <span className="text-xs text-espresso-soft/70 ">
                  {d.serialNumber}
                </span>
                <div className="flex gap-1 items-center ">
                  <FiClock /> {formatRelativeTime(d.updatedAt)}
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-taupe/60">
                <details className="flex-1 group">
                  <summary className="text-xs font-medium text-warning hover:underline cursor-pointer list-none">
                    Ganti Perangkat
                  </summary>
                  <ActionForm
                    action={replaceDeviceWithId}
                    successMessage="Perangkat berhasil diganti"
                    className="flex flex-col gap-3 mt-3 bg-cream/70 p-3.5 rounded-xl"
                  >
                    <Field label="Tipe Perangkat Baru" htmlFor={`type-${d.id}`}>
                      <Select
                        id={`type-${d.id}`}
                        name="type"
                        required
                        defaultValue={d.type}
                      >
                        <option value="NVR">NVR</option>
                        <option value="MONITOR">Monitor</option>
                        <option value="CCTV">CCTV</option>
                        <option value="UPS">UPS</option>
                      </Select>
                    </Field>
                    <Field label="Brand Baru" htmlFor={`brand-${d.id}`}>
                      <Input
                        id={`brand-${d.id}`}
                        name="brand"
                        type="text"
                        required
                        placeholder="mis. Hikvision, APC, Samsung"
                      />
                    </Field>
                    <Field label="SN Baru" htmlFor={`sn-${d.id}`}>
                      <Input
                        id={`sn-${d.id}`}
                        name="serialNumber"
                        type="text"
                        required
                      />
                    </Field>
                    <Field
                      label="Kondisi Perangkat Baru"
                      htmlFor={`condition-${d.id}`}
                    >
                      <Select
                        id={`condition-${d.id}`}
                        name="condition"
                        required
                        defaultValue="GOOD"
                      >
                        <option value="GOOD">Baik</option>
                        <option value="DAMAGED">Rusak</option>
                        <option value="NEEDS_REPLACEMENT">Perlu Ganti</option>
                      </Select>
                    </Field>
                    <Field label="Catatan (opsional)" htmlFor={`note-${d.id}`}>
                      <Textarea
                        id={`note-${d.id}`}
                        name="note"
                        rows={2}
                        placeholder="mis. alasan penggantian"
                      />
                    </Field>
                    <Button
                      type="submit"
                      size="sm"
                      variant="warning"
                      className="self-start"
                    >
                      Simpan Penggantian
                    </Button>
                  </ActionForm>
                </details>

                <DeleteButton action={deleteDevice.bind(null, d.id)} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Riwayat penggantian device */}
      {atm.deviceHistory.length > 0 && (
        <>
          <h3 className="font-display text-sm font-semibold text-espresso mb-3">
            Riwayat Perangkat
          </h3>
          <div className="flex flex-col gap-2 mb-8">
            {atm.deviceHistory.map((h) => (
              <Card
                key={h.id}
                padded={false}
                className="p-3.5 flex items-start justify-between gap-3"
              >
                <div>
                  <Badge tone={HISTORY_ACTION_TONE[h.action]}>
                    {HISTORY_ACTION_LABEL[h.action]}
                  </Badge>
                  <div className="text-sm text-espresso mt-1.5">
                    {h.deviceType} - {h.brand} - SN {h.serialNumber}
                  </div>
                  {h.note && (
                    <div className="text-xs text-espresso-soft/70 mt-1">
                      {h.note}
                    </div>
                  )}
                </div>
                <span className="text-xs text-espresso-soft/70 whitespace-nowrap flex items-center gap-1">
                  <FiClock />
                  {formatJakartaDateTime(h.createdAt)}
                </span>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Jadwal kunjungan terkait */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-sm font-semibold text-espresso">
          Jadwal Kunjungan
        </h3>
        <Link
          href="/visits/new"
          className="inline-flex items-center gap-1 text-xs text-rose hover:underline"
        >
          <FiPlus className="h-3.5 w-3.5" /> Catat Kunjungan
        </Link>
      </div>
      <div className="flex flex-col gap-2 mb-8">
        {atm.visits.length === 0 && (
          <EmptyState
            title="Belum ada kunjungan"
            description="Belum ada jadwal kunjungan untuk ATM ini."
          />
        )}
        {atm.visits.map((v) => (
          <Card key={v.id} padded={false} className="p-3.5  gap-3">
            <div>
              <div className="min-w-0">
                <Badge tone={VISIT_TYPE_TONE[v.visitType]}>
                  {VISIT_TYPE_LABEL[v.visitType]}
                </Badge>
                <span className="text-xs text-espresso ml-2">
                  {v.visitType === "PM"
                    ? v.ticketNumber
                      ? `No. Tiket: ${v.ticketNumber}`
                      : "Tanpa nomor tiket"
                    : v.ticket
                      ? `No. Tiket: ${v.ticket.ticketNumber ?? "(belum ada nomor)"} - ${v.ticket.problem}`
                      : "Tiket tidak ditemukan"}
                </span>

                {v.keterangan && (
                  <div className="text-xs text-espresso-soft/70 mt-1 ">
                    {v.keterangan}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end gap-1 mt-1">
                <FiClock />
                <p className="text-xs text-espresso-soft/70  ">
                  {formatJakartaDate(v.visitDate)}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tambah riwayat + foto ATM */}
      <Card className="flex flex-col gap-4 mb-8">
        <CardTitle>Tambah Riwayat / Foto ATM</CardTitle>
        <ActionForm
          action={addAtmLogWithId}
          successMessage="Riwayat berhasil ditambahkan"
          resetOnSuccess
          className="flex flex-col gap-4"
        >
          <Field label="Catatan (opsional)" htmlFor="atmLogNote">
            <Textarea
              id="atmLogNote"
              name="note"
              rows={2}
              placeholder="mis. kunjungan rutin, kondisi lokasi, dsb."
            />
          </Field>
          <Field label="Foto (opsional, bisa lebih dari 1)">
            <PhotoUploader folder="atm-logs" />
          </Field>
          <Button variant="success" type="submit" className="self-start">
            <FiSave />
            Simpan
          </Button>
        </ActionForm>
      </Card>

      {/* Riwayat ATM */}
      <h3 className="font-display text-sm font-semibold text-espresso mb-3">
        Riwayat ATM
      </h3>
      <div className="flex flex-col gap-3">
        {atm.logs.length === 0 && (
          <EmptyState
            title="Belum ada riwayat"
            description="Belum ada riwayat untuk ATM ini."
          />
        )}
        {atm.logs.map((log) => (
          <Card key={log.id}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-espresso-soft/70">
                {formatJakartaDateTime(log.createdAt)}
              </span>
              <DeleteButton
                action={deleteAtmLog.bind(null, atm.id, log.id)}
                label={
                  <div className="inline-flex items-center px-1 py-1 rounded-lg gap-1 bg-rose text-paper hover:bg-rose-dark active:bg-rose-dark shadow-sm shadow-rose/20">
                    <FiTrash />
                  </div>
                }
              />
            </div>
            {log.note && (
              <p className="text-sm text-espresso-soft mt-2">{log.note}</p>
            )}
            <PhotoLightbox
              photos={log.photos}
              onDeletePhoto={deleteAtmLogPhotoWithId}
            />
          </Card>
        ))}
      </div>
    </div>
  );
}
