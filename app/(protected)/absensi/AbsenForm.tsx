"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useToast } from "@/components/ui/toast";
import { submitAbsenAction, logoutAbsensiAction } from "./actions";

type GeoState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; latitude: number; longitude: number; accuracy: number };

function useGeolocation() {
  const [geo, setGeo] = useState<GeoState>({ status: "loading" });

  const request = () => {
    if (!("geolocation" in navigator)) {
      setGeo({ status: "error", message: "Perangkat/browser ini tidak mendukung geolokasi." });
      return;
    }
    setGeo({ status: "loading" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({
          status: "ready",
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        setGeo({
          status: "error",
          message:
            err.code === err.PERMISSION_DENIED
              ? "Izin lokasi ditolak. Aktifkan izin lokasi lalu coba lagi, atau isi lokasi manual."
              : "Gagal mengambil lokasi. Coba lagi atau isi lokasi manual.",
        });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  return { geo, request };
}

export default function AbsenForm() {
  const { geo, request } = useGeolocation();
  const [manual, setManual] = useState(false);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  // Diminta sekali otomatis saat form dibuka.
  useEffect(() => {
    request();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const effectiveLat =
    manual ? manualLat : geo.status === "ready" ? String(geo.latitude) : "";
  const effectiveLng =
    manual ? manualLng : geo.status === "ready" ? String(geo.longitude) : "";
  const effectiveAccuracy = manual ? "0" : geo.status === "ready" ? String(Math.round(geo.accuracy)) : "";
  const hasLocation = Boolean(effectiveLat && effectiveLng);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("latitude", effectiveLat);
    formData.set("longitude", effectiveLng);
    formData.set("accuracy", effectiveAccuracy);
    formData.set("manual_location", manual ? "1" : "0");
    // Skor keamanan bawaan: 100 kalau lokasi diambil otomatis dari GPS
    // perangkat, lebih rendah kalau lokasi diisi manual. Sesuaikan kalau
    // ternyata server absensi mengharapkan nilai/skala lain.
    formData.set("secure_score", manual ? "50" : "100");

    startTransition(async () => {
      try {
        await submitAbsenAction(formData);
        toast.success("Absen berhasil dikirim");
        form.reset();
        setManual(false);
        setManualLat("");
        setManualLng("");
        request();
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Absen gagal. Coba lagi.";
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

      {geo.status === "loading" && !manual && (
        <Alert variant="info" title="Mencari lokasi..." className="mb-4">
          Pastikan izin lokasi browser diaktifkan.
        </Alert>
      )}
      {geo.status === "error" && !manual && (
        <Alert variant="warning" title="Lokasi otomatis gagal" className="mb-4">
          {geo.message}
        </Alert>
      )}
      {geo.status === "ready" && !manual && (
        <Alert variant="success" title="Lokasi ditemukan" className="mb-4">
          Akurasi ± {Math.round(geo.accuracy)} m
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" aria-busy={pending}>
        <fieldset disabled={pending} className="contents">
          <Field label="Keterangan" htmlFor="keterangan">
            <Select id="keterangan" name="keterangan" required defaultValue="">
              <option value="" disabled>
                Pilih keterangan
              </option>
              <option value="masuk">Masuk</option>
              <option value="pulang">Pulang</option>
            </Select>
          </Field>

          <label className="flex items-center gap-2 text-xs font-medium text-espresso-soft">
            <input
              type="checkbox"
              checked={manual}
              onChange={(e) => setManual(e.target.checked)}
              className="h-4 w-4 rounded border-taupe-dark/60"
            />
            Isi lokasi manual (kalau GPS tidak akurat/gagal)
          </label>

          {manual && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Latitude" htmlFor="manualLat">
                <Input
                  id="manualLat"
                  type="text"
                  inputMode="decimal"
                  placeholder="-6.xxxxxx"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  required
                />
              </Field>
              <Field label="Longitude" htmlFor="manualLng">
                <Input
                  id="manualLng"
                  type="text"
                  inputMode="decimal"
                  placeholder="111.xxxxxx"
                  value={manualLng}
                  onChange={(e) => setManualLng(e.target.value)}
                  required
                />
              </Field>
            </div>
          )}

          <Field
            label={manual ? "Alasan Terlambat / Lokasi Manual" : "Alasan Terlambat (opsional)"}
            htmlFor="alasan_terlambat"
          >
            <Textarea
              id="alasan_terlambat"
              name="alasan_terlambat"
              rows={2}
              required={manual}
              placeholder="mis. GPS tidak akurat di lokasi, koneksi terganggu, dll."
            />
          </Field>

          <Button type="submit" disabled={!hasLocation || pending} className="self-start">
            {pending ? "Mengirim..." : "Kirim Absen"}
          </Button>
          {!hasLocation && (
            <p className="text-xs text-espresso-soft/80">
              Menunggu lokasi{manual ? " manual diisi" : " otomatis"} sebelum bisa absen.
            </p>
          )}
        </fieldset>
      </form>
    </Card>
  );
}
