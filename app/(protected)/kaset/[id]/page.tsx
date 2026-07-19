import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatJakartaDateTime } from "@/lib/date";
import {
  addKasetLog,
  deleteKaset,
  deleteKasetLog,
  deleteKasetLogPhoto,
  updateKasetType,
} from "../actions";
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
import { FiArrowLeft, FiClock, FiSave, FiTrash } from "react-icons/fi";
import { ActionForm } from "@/components/ui/ActionForm";
import {
  KASET_CONDITION_LABEL,
  KASET_CONDITION_TONE,
  KASET_TYPE_LABEL,
  GANTI_PART_LABEL,
} from "@/lib/labels";

export default async function KasetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const kaset = await prisma.kaset.findUnique({
    where: { id },
    include: {
      logs: { orderBy: { createdAt: "desc" }, include: { photos: true } },
    },
  });

  if (!kaset) notFound();

  const addLogWithId = addKasetLog.bind(null, kaset.id);
  const updateTypeWithId = updateKasetType.bind(null, kaset.id);
  const deleteKasetLogPhotoWithId = deleteKasetLogPhoto.bind(null, kaset.id);

  return (
    <div className="max-w-2xl">
      <Link
        href="/kaset"
        className="inline-flex items-center gap-1 text-xs text-espresso-soft hover:text-rose mb-2"
      >
        <FiArrowLeft /> Back to Kaset
      </Link>

      <PageHeader
        title={`Kaset ${kaset.serialNumber}`}
        action={
          <DeleteButton
            action={deleteKaset.bind(null, kaset.id)}
            label={
              <div className="inline-flex items-center px-2 py-1.5 rounded-lg gap-1 bg-rose text-paper hover:bg-rose-dark active:bg-rose-dark shadow-sm shadow-rose/20">
                <FiTrash /> Hapus Kaset
              </div>
            }
          />
        }
      />

      {/* Tipe kaset */}
      <Card className="flex flex-wrap items-center gap-3 mb-6">
        <Badge tone="neutral">{KASET_TYPE_LABEL[kaset.type]}</Badge>
        <ActionForm
          action={updateTypeWithId}
          successMessage="Tipe kaset berhasil diubah"
          className="flex items-center gap-2 ml-auto"
        >
          <Select name="type" defaultValue={kaset.type} className="w-auto">
            <option value="ALL_IN">All In</option>
            <option value="CURRENCY">Currency</option>
          </Select>
          <Button type="submit" size="sm" variant="dark">
            Ubah Tipe
          </Button>
        </ActionForm>
      </Card>

      {/* Form tambah update kondisi baru */}
      <Card className="flex flex-col gap-4 mb-4">
        <CardTitle>Update Kondisi</CardTitle>
        <ActionForm
          action={addLogWithId}
          successMessage="Update kondisi berhasil ditambahkan"
          resetOnSuccess
          className="flex flex-col gap-4"
        >
          <Field label="Kondisi" htmlFor="condition">
            <Select
              id="condition"
              name="condition"
              required
              defaultValue="GOOD"
            >
              <option value="GOOD">Good</option>
              <option value="BAD">Bad</option>
              <option value="BROKEN">Broken</option>
              <option value="SCRAP">Scrap</option>
            </Select>
          </Field>
          <Field label="Problem (opsional)" htmlFor="problem">
            <Textarea id="problem" name="problem" rows={2} />
          </Field>
          <Field label="Action (opsional)" htmlFor="action">
            <Input id="action" name="action" type="text" />
          </Field>
          <Field label="Notes (opsional)" htmlFor="notes">
            <Textarea id="notes" name="notes" rows={2} />
          </Field>
          <Field label="Ganti Part (opsional)" htmlFor="gantiPart">
            <Select id="gantiPart" name="gantiPart" defaultValue="">
              <option value="">Tidak ada</option>
              <option value="STOCK">Stock</option>
              <option value="SCRAP">Scrap</option>
            </Select>
          </Field>
          <Field label="Foto (opsional, bisa lebih dari 1)">
            <PhotoUploader />
          </Field>
          <Button variant="success" type="submit" className="self-start">
            <FiSave />
            Simpan
          </Button>
        </ActionForm>
      </Card>

      {/* Riwayat */}
      <h3 className="font-display text-sm font-semibold text-espresso mb-3">
        Riwayat
      </h3>
      <div className="flex flex-col gap-3">
        {kaset.logs.length === 0 && (
          <EmptyState
            title="Belum ada riwayat"
            description="Riwayat kondisi kaset akan muncul di sini."
          />
        )}
        {kaset.logs.map((log) => (
          <Card key={log.id}>
            <div className="flex items-center justify-between">
              <Badge tone={KASET_CONDITION_TONE[log.condition]}>
                {KASET_CONDITION_LABEL[log.condition]}
              </Badge>
              <div className="flex items-center gap-3">
                <span className="text-xs text-espresso-soft/70 flex items-center gap-1">
                  <FiClock className="text-espresso-soft" />
                  {formatJakartaDateTime(log.createdAt)}
                </span>
                <DeleteButton
                  action={deleteKasetLog.bind(null, kaset.id, log.id)}
                  label={
                    <div className="inline-flex items-center px-1 py-1 rounded-lg gap-1 bg-rose text-paper hover:bg-rose-dark active:bg-rose-dark shadow-sm shadow-rose/20">
                      <FiTrash />
                    </div>
                  }
                />
              </div>
            </div>
            {log.problem && (
              <p className="text-sm text-espresso-soft mt-2">{log.problem}</p>
            )}
            {log.action && (
              <p className="text-sm text-espresso mt-2">
                <span className="text-espresso-soft/70">Action: </span>
                {log.action}
              </p>
            )}
            {log.notes && (
              <p className="text-sm text-espresso mt-1">
                <span className="text-espresso-soft/70">Notes: </span>
                {log.notes}
              </p>
            )}
            {log.gantiPart && (
              <p className="text-sm text-espresso mt-1">
                <span className="text-espresso-soft/70">Ganti Part: </span>
                {GANTI_PART_LABEL[log.gantiPart]}
              </p>
            )}
            <PhotoLightbox
              photos={log.photos}
              onDeletePhoto={deleteKasetLogPhotoWithId}
            />
          </Card>
        ))}
      </div>
    </div>
  );
}
