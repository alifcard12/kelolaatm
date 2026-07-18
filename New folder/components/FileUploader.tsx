"use client";

import { useState } from "react";

export type UploadedFile = {
  url: string;
  publicId: string;
  resourceType: "image" | "raw";
  filename: string;
};

const MAX_FILES = 6;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Upload foto (jpg/png/dll) atau PDF langsung dari browser ke Cloudinary
 * (unsigned upload, endpoint /auto/upload supaya tipe resource otomatis
 * terdeteksi: "image" untuk foto, "raw" untuk PDF), lalu simpan hasilnya
 * ke sebuah hidden input JSON supaya bisa dibaca Server Action tanpa
 * perlu mengirim file mentah.
 *
 * Alur: HP -> Cloudinary (langsung) -> Server Action cuma terima teks URL.
 */
export function FileUploader({
  name = "filesJson",
  folder = "tickets",
}: {
  name?: string;
  folder?: string;
}) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const picked = Array.from(fileList);

    if (files.length + picked.length > MAX_FILES) {
      setError(`Maksimal ${MAX_FILES} file per tiket.`);
      return;
    }
    for (const file of picked) {
      const isImage = file.type.startsWith("image/");
      const isPdf = file.type === "application/pdf";
      if (!isImage && !isPdf) {
        setError(`File "${file.name}" harus berupa foto atau PDF.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`File "${file.name}" lebih dari 10MB.`);
        return;
      }
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      setError(
        "Konfigurasi Cloudinary (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME / NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) belum diisi."
      );
      return;
    }

    setUploading(true);
    try {
      const uploaded: UploadedFile[] = [];
      for (const file of picked) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);
        formData.append("folder", folder);

        // endpoint "auto" supaya PDF (resource_type "raw") dan gambar
        // (resource_type "image") bisa lewat satu preset yang sama
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error?.message ?? `Upload "${file.name}" gagal.`);
        }

        const data = await res.json();
        uploaded.push({
          url: data.secure_url,
          publicId: data.public_id,
          resourceType: data.resource_type === "raw" ? "raw" : "image",
          filename: file.name,
        });
      }
      setFiles((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload gagal.");
    } finally {
      setUploading(false);
    }
  }

  function removeFile(publicId: string) {
    setFiles((prev) => prev.filter((f) => f.publicId !== publicId));
  }

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(files)} />

      <label
        className={`flex items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed px-3 py-4 text-sm transition-colors ${
          uploading || files.length >= MAX_FILES
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
        {uploading ? "Mengunggah…" : "Pilih foto atau PDF"}
        <input
          type="file"
          accept="image/*,application/pdf"
          multiple
          disabled={uploading || files.length >= MAX_FILES}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </label>
      <p className="text-xs text-espresso-soft/70 mt-1.5">
        Foto atau PDF, maksimal {MAX_FILES} file, masing-masing di bawah 10MB.
      </p>

      {error && <p className="text-xs text-danger mt-2">{error}</p>}

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {files.map((f) => (
            <div key={f.publicId} className="relative group">
              {f.resourceType === "image" ? (
                <img
                  src={f.url}
                  alt={f.filename}
                  className="w-16 h-16 object-cover rounded-xl border border-taupe/70"
                />
              ) : (
                <div className="w-16 h-16 flex flex-col items-center justify-center gap-1 rounded-xl border border-taupe/70 bg-cream px-1">
                  <span className="text-[10px] font-semibold text-danger">PDF</span>
                  <span className="text-[9px] text-espresso-soft truncate w-full text-center">
                    {f.filename}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(f.publicId)}
                title="Hapus file"
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
