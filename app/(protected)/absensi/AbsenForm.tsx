"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast";
import { submitAbsenAction, logoutAbsensiAction } from "./actions";

function parseLatLng(raw: string): { lat: string; lng: string } | null {
  const parts = raw.split(",").map((p) => p.trim());
  if (parts.length !== 2) return null;
  const [lat, lng] = parts;
  if (!lat || !lng || Number.isNaN(Number(lat)) || Number.isNaN(Number(lng))) {
    return null;
  }
  return { lat, lng };
}

export default function AbsenForm() {
  const [keterangan, setKeterangan] = useState<"masuk" | "pulang">("masuk");
  const [latLng, setLatLng] = useState("");
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    const parsed = parseLatLng(latLng);
    if (!parsed) {
      toast.error(
        "Format lokasi salah",
        "Isi dengan format: -7.629873, 111.517497",
      );
      return;
    }

    const formData = new FormData(form);
    formData.set("keterangan", keterangan);
    formData.set("latitude", parsed.lat);
    formData.set("longitude", parsed.lng);
    formData.set("manual_location", "0");

    startTransition(async () => {
      try {
        await submitAbsenAction(formData);
        toast.success("Absen berhasil dikirim");
        form.reset();
        setLatLng("");
        router.refresh();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Absen gagal. Coba lagi.";
        toast.error("Gagal absen", message);
      }
    });
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <CardTitle>Absen</CardTitle>
        <form action={logoutAbsensiAction}>
          <Button type="submit" variant="ghost" size="sm">
            Keluar dari Absensi
          </Button>
        </form>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        aria-busy={pending}
      >
        <fieldset disabled={pending} className="contents">
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

          <Field label="Latitude, Longitude" htmlFor="lat_lng">
            <Input
              id="lat_lng"
              name="lat_lng"
              type="text"
              placeholder="-7.629873, 111.517497"
              value={latLng}
              onChange={(e) => setLatLng(e.target.value)}
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Accuracy" htmlFor="accuracy">
              <Input
                id="accuracy"
                name="accuracy"
                type="text"
                inputMode="decimal"
                defaultValue="3"
                required
              />
            </Field>
            <Field label="Secure Score" htmlFor="secure_score">
              <Input
                id="secure_score"
                name="secure_score"
                type="text"
                inputMode="decimal"
                defaultValue="98"
                required
              />
            </Field>
          </div>

          <Field label="Alasan Terlambat (opsional)" htmlFor="alasan_terlambat">
            <Textarea
              id="alasan_terlambat"
              name="alasan_terlambat"
              rows={2}
              placeholder="Isi kalau absen terlambat"
            />
          </Field>

          <Button type="submit" disabled={pending} className="self-start">
            {pending ? "Mengirim..." : "Kirim Absen"}
          </Button>
        </fieldset>
      </form>
    </Card>
  );
}
