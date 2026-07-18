"use client";

import { useState } from "react";

export type UploadedPhoto = { url: string; publicId: string };

const MAX_PHOTOS = 6;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Upload foto langsung dari browser ke Cloudinary (unsigned upload),
 * lalu simpan hasil URL+publicId ke sebuah hidden input bernama `photosJson`
 * supaya bisa dibaca oleh Server Action tanpa perlu mengirim file itu sendiri.
 *
 * Alur: HP -> Cloudinary (langsung) -> Server Action cuma terima teks URL.
 */
export function PhotoUploader({
  name = "photosJson",
  folder = "kaset-logs",
}: {
  name?: string;
  folder?: string;
}) {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const files = Array.from(fileList);

    if (photos.length + files.length > MAX_PHOTOS) {
      setError(`Maksimal ${MAX_PHOTOS} foto per update.`);
      return;
    }
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setError(`File "${file.name}" bukan gambar.`);
        return;
      }
      if (file.size > MAX_PHOTO_SIZE) {
        setError(`File "${file.name}" lebih dari 5MB.`);
        return;
      }
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      setError("Konfigurasi Cloudinary (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME / NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) belum diisi.");
      return;
    }

    setUploading(true);
    try {
      const uploaded: UploadedPhoto[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);
        formData.append("folder", folder);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error?.message ?? `Upload "${file.name}" gagal.`);
        }

        const data = await res.json();
        uploaded.push({ url: data.secure_url, publicId: data.public_id });
      }
      setPhotos((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload gagal.");
    } finally {
      setUploading(false);
    }
  }

  function removePhoto(publicId: string) {
    setPhotos((prev) => prev.filter((p) => p.publicId !== publicId));
  }

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(photos)} />

      <label
        className={`flex items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed px-3 py-4 text-sm transition-colors ${
          uploading || photos.length >= MAX_PHOTOS
            ? "border-taupe-dark/40 text-espresso-soft/50 cursor-not-allowed"
            : "border-taupe-dark/60 text-espresso-soft hover:border-rose hover:text-rose cursor-pointer"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
          <path
            d="M12 16V4m0 0-4 4m4-4 4 4M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {uploading ? "Mengunggah…" : "Pilih atau ambil foto"}
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={uploading || photos.length >= MAX_PHOTOS}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </label>
      <p className="text-xs text-espresso-soft/70 mt-1.5">
        Maksimal {MAX_PHOTOS} foto, masing-masing di bawah 5MB.
      </p>

      {error && <p className="text-xs text-danger mt-2">{error}</p>}

      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {photos.map((p) => (
            <div key={p.publicId} className="relative group">
              <img
                src={p.url}
                alt="Foto"
                className="w-16 h-16 object-cover rounded-xl border border-taupe/70"
              />
              <button
                type="button"
                onClick={() => removePhoto(p.publicId)}
                title="Hapus foto"
                className="absolute -top-1.5 -right-1.5 bg-paper border border-taupe-dark/60 rounded-full w-5 h-5 text-xs leading-none text-danger shadow-sm"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
