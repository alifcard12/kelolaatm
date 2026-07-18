import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatJakartaDateTime } from "@/lib/date";
import { addKasetLog, deleteKaset, deleteKasetLog, deleteKasetLogPhoto, updateKasetType } from "../actions";
import { PhotoUploader } from "@/components/PhotoUploader";
import { PhotoLightbox } from "@/components/PhotoLightbox";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { FiChevronLeft } from "react-icons/fi";
import { ActionForm } from "@/components/ui/ActionForm";
import { CONDITION_LABEL, CONDITION_TONE, KASET_TYPE_LABEL } from "@/lib/labels";

export default async function KasetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const kaset = await prisma.kaset.findUnique({
    where: { id },
    include: { logs: { orderBy: { createdAt: "desc" }, include: { photos: true } } },
  });

  if (!kaset) notFound();

  const addLogWithId = addKasetLog.bind(null, kaset.id);
  const updateTypeWithId = updateKasetType.bind(null, kaset.id);
  const deleteKasetLogPhotoWithId = deleteKasetLogPhoto.bind(null, kaset.id);

  return (
    <div className="max-w-2xl">
      <Link href="/kaset" className="inline-flex items-center gap-1 text-xs text-espresso-soft hover:text-rose mb-2">
        <FiChevronLeft /> Kembali ke Kaset
      </Link>

      <PageHeader
        title={`Kaset ${kaset.serialNumber}`}
        action={<DeleteButton action={deleteKaset.bind(null, kaset.id)} label="Hapus Kaset" />}
      />

      {/* Tipe kaset */}
      <Card className="flex flex-wrap items-center gap-3 mb-6">
        <span className="text-sm text-espresso-soft">Tipe saat ini:</span>
        <Badge tone="neutral">{KASET_TYPE_LABEL[kaset.type]}</Badge>
        <ActionForm action={updateTypeWithId} successMessage="Tipe kaset berhasil diubah" className="flex items-center gap-2 ml-auto">
          <Select name="type" defaultValue={kaset.type} className="w-auto">
            <option value="ALL_IN">All in One</option>
            <option value="CURRENCY">Currency</option>
          </Select>
          <Button type="submit" size="sm" variant="dark">
            Ubah Tipe
          </Button>
        </ActionForm>
      </Card>

      {/* Form tambah update kondisi baru */}
      <Card className="flex flex-col gap-4 mb-8">
        <CardTitle>Tambah Update Kondisi</CardTitle>
        <ActionForm action={addLogWithId} successMessage="Update kondisi berhasil ditambahkan" resetOnSuccess className="flex flex-col gap-4">
          <Field label="Kondisi" htmlFor="condition">
            <Select id="condition" name="condition" required defaultValue="GOOD">
              <option value="GOOD">Baik</option>
              <option value="DAMAGED">Rusak</option>
              <option value="NEEDS_REPLACEMENT">Perlu Ganti</option>
            </Select>
          </Field>
          <Field label="Problem (opsional)" htmlFor="problem">
            <Textarea id="problem" name="problem" rows={2} />
          </Field>
          <Field label="Foto (opsional, bisa lebih dari 1)">
            <PhotoUploader />
          </Field>
          <Button type="submit" className="self-start">
            Simpan Update
          </Button>
        </ActionForm>
      </Card>

      {/* Riwayat */}
      <h3 className="font-display text-sm font-semibold text-espresso mb-3">Riwayat</h3>
      <div className="flex flex-col gap-3">
        {kaset.logs.length === 0 && (
          <EmptyState title="Belum ada riwayat" description="Riwayat kondisi kaset akan muncul di sini." />
        )}
        {kaset.logs.map((log) => (
          <Card key={log.id}>
            <div className="flex items-center justify-between">
              <Badge tone={CONDITION_TONE[log.condition]}>{CONDITION_LABEL[log.condition]}</Badge>
              <div className="flex items-center gap-3">
                <span className="text-xs text-espresso-soft/70">{formatJakartaDateTime(log.createdAt)}</span>
                <DeleteButton action={deleteKasetLog.bind(null, kaset.id, log.id)} label="Hapus Riwayat" />
              </div>
            </div>
            {log.problem && <p className="text-sm text-espresso-soft mt-2">{log.problem}</p>}
            <PhotoLightbox photos={log.photos} onDeletePhoto={deleteKasetLogPhotoWithId} />
          </Card>
        ))}
      </div>
    </div>
  );
}
