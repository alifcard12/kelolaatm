"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast";
import { submitAbsenAction, logoutAbsensiAction } from "./actions";

type LocationMode = "manual" | "otomatis";

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
  // Default input manual sesuai permintaan.
  const [mode, setMode] = useState<LocationMode>("manual");
  const [latLng, setLatLng] = useState("");
  const [accuracy, setAccuracy] = useState("3");
  const [locating, setLocating] = useState(false);
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  function handleModeChange(next: LocationMode) {
    setMode(next);
    // Ganti mode, bersihkan lokasi lama biar tidak ketuker manual <-> otomatis.
    setLatLng("");
    if (next === "manual") setAccuracy("3");
  }

  function handleDeteksiLokasi() {
    if (!("geolocation" in navigator)) {
      toast.error("Tidak didukung", "Browser ini tidak mendukung deteksi lokasi.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy: acc } = pos.coords;
        setLatLng(`${latitude}, ${longitude}`);
        setAccuracy(String(Math.round(acc)));
        setLocating(false);
        toast.success("Lokasi terdeteksi");
      },
      (err) => {
        setLocating(false);
        toast.error(
          "Gagal deteksi lokasi",
          err.message || "Izinkan akses lokasi lalu coba lagi."
        );
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    const parsed = parseLatLng(latLng);
    if (!parsed) {
      toast.error(
        mode === "manual" ? "Format lokasi salah" : "Lokasi belum terdeteksi",
        mode === "manual"
          ? "Isi dengan format: -7.629873, 111.517497"
          : "Tekan tombol \"Deteksi Lokasi Saat Ini\" dulu."
      );
      return;
    }

    const formData = new FormData(form);
    formData.set("keterangan", keterangan);
    formData.set("latitude", parsed.lat);
    formData.set("longitude", parsed.lng);
    formData.set("manual_location", "0");
    // Catatan: server absensi.itsview.id ternyata cuma benar-benar menyimpan
    // absen kalau manual_location = "0" -- baik posisi lat/lon-nya diisi
    // manual maupun dari GPS. Value "1" dulu dikira untuk mode "Manual", tapi
    // ternyata bikin absen tidak tersimpan walau server tetap balas sukses/500.

    startTransition(async () => {
      try {
        const result = await submitAbsenAction(formData);
        if (result.warning) {
          toast.warning("Perlu dicek", result.warning);
        } else {
          toast.success("Absen berhasil dikirim");
        }
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

          <Field label="Metode Lokasi" htmlFor="mode">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleModeChange("manual")}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  mode === "manual"
                    ? "border-rose bg-rose/10 text-rose"
                    : "border-taupe-dark/40 text-espresso-soft"
                }`}
              >
                Manual
              </button>
              <button
                type="button"
                onClick={() => handleModeChange("otomatis")}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  mode === "otomatis"
                    ? "border-rose bg-rose/10 text-rose"
                    : "border-taupe-dark/40 text-espresso-soft"
                }`}
              >
                Otomatis (GPS)
              </button>
            </div>
          </Field>

          {mode === "manual" ? (
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
          ) : (
            <Field
              label="Lokasi Saat Ini"
              htmlFor="lat_lng_auto"
              hint={latLng ? undefined : "Tekan tombol di bawah untuk ambil lokasi dari GPS."}
            >
              <div className="flex flex-col gap-2">
                <Input
                  id="lat_lng_auto"
                  name="lat_lng_auto"
                  type="text"
                  placeholder="Belum terdeteksi"
                  value={latLng}
                  readOnly
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleDeteksiLokasi}
                  disabled={locating}
                >
                  {locating ? "Mendeteksi..." : "Deteksi Lokasi Saat Ini"}
                </Button>
              </div>
            </Field>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Accuracy" htmlFor="accuracy">
              <Input
                id="accuracy"
                name="accuracy"
                type="text"
                inputMode="decimal"
                value={accuracy}
                onChange={(e) => setAccuracy(e.target.value)}
                readOnly={mode === "otomatis"}
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
