"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast";
import { createAbsenScheduleAction } from "./schedule-actions";

export default function AbsenScheduleForm() {
  const [keterangan, setKeterangan] = useState<"masuk" | "pulang">("masuk");
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("keterangan", keterangan);
    // Lokasi jadwal selalu diisi manual (beda-beda tiap jadwal), jadi kita
    // paksa manual_location = "1" — tidak ada mode GPS otomatis di sini
    // karena jadwal dieksekusi nanti oleh server, bukan browser.
    formData.set("manual_location", "1");

    startTransition(async () => {
      try {
        await createAbsenScheduleAction(formData);
        toast.success("Jadwal absen dibuat");
        form.reset();
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Gagal membuat jadwal.";
        toast.error("Gagal membuat jadwal", message);
      }
    });
  }

  return (
    <Card>
      <CardTitle className="mb-4">Buat Jadwal Absen</CardTitle>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" aria-busy={pending}>
        <fieldset disabled={pending} className="contents">
          <Field label="Tanggal & Jam Absen (WIB)" htmlFor="scheduled_at">
            <Input id="scheduled_at" name="scheduled_at" type="datetime-local" required />
          </Field>

          <Field label="Keterangan" htmlFor="keterangan">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setKeterangan("masuk")}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  keterangan === "masuk"
                    ? "border-rose bg-rose/10 text-rose"
                    : "border-taupe-dark/40 text-espresso-soft"
                }`}
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => setKeterangan("pulang")}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  keterangan === "pulang"
                    ? "border-rose bg-rose/10 text-rose"
                    : "border-taupe-dark/40 text-espresso-soft"
                }`}
              >
                Pulang
              </button>
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude" htmlFor="latitude">
              <Input
                id="latitude"
                name="latitude"
                type="text"
                inputMode="decimal"
                placeholder="-7.629873"
                required
              />
            </Field>
            <Field label="Longitude" htmlFor="longitude">
              <Input
                id="longitude"
                name="longitude"
                type="text"
                inputMode="decimal"
                placeholder="111.517497"
                required
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Accuracy" htmlFor="accuracy">
              <Input id="accuracy" name="accuracy" type="text" inputMode="decimal" required />
            </Field>
            <Field label="Secure Score" htmlFor="secure_score">
              <Input id="secure_score" name="secure_score" type="text" inputMode="decimal" required />
            </Field>
          </div>

          <Field label="Alasan Terlambat (opsional)" htmlFor="alasan_terlambat">
            <Textarea id="alasan_terlambat" name="alasan_terlambat" rows={2} />
          </Field>

          <Button type="submit" disabled={pending} className="self-start">
            {pending ? "Menyimpan..." : "Simpan Jadwal"}
          </Button>
        </fieldset>
      </form>
    </Card>
  );
}
