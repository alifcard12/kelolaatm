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

      <input
        type="file"
        accept="image/*"
        multiple
        disabled={uploading || photos.length >= MAX_PHOTOS}
        onChange={(e) => handleFiles(e.target.files)}
        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm file:mr-3 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-slate-100 file:text-slate-700"
      />
      <p className="text-xs text-slate-400 mt-1">Maksimal {MAX_PHOTOS} foto, masing-masing di bawah 5MB.</p>

      {uploading && <p className="text-xs text-slate-500 mt-2">Mengunggah foto...</p>}
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {photos.map((p) => (
            <div key={p.publicId} className="relative group">
              <img src={p.url} alt="Foto kaset" className="w-16 h-16 object-cover rounded-md border border-slate-200" />
              <button
                type="button"
                onClick={() => removePhoto(p.publicId)}
                title="Hapus foto"
                className="absolute -top-1.5 -right-1.5 bg-white border border-slate-300 rounded-full w-5 h-5 text-xs leading-none text-red-500"
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
