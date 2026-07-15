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

      <input
        type="file"
        accept="image/*,application/pdf"
        multiple
        disabled={uploading || files.length >= MAX_FILES}
        onChange={(e) => handleFiles(e.target.files)}
        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm file:mr-3 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-slate-100 file:text-slate-700"
      />
      <p className="text-xs text-slate-400 mt-1">
        Foto atau PDF, maksimal {MAX_FILES} file, masing-masing di bawah 10MB.
      </p>

      {uploading && <p className="text-xs text-slate-500 mt-2">Mengunggah file...</p>}
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {files.map((f) => (
            <div key={f.publicId} className="relative group">
              {f.resourceType === "image" ? (
                <img
                  src={f.url}
                  alt={f.filename}
                  className="w-16 h-16 object-cover rounded-md border border-slate-200"
                />
              ) : (
                <div className="w-16 h-16 flex flex-col items-center justify-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-1">
                  <span className="text-[10px] font-semibold text-red-500">PDF</span>
                  <span className="text-[9px] text-slate-500 truncate w-full text-center">
                    {f.filename}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(f.publicId)}
                title="Hapus file"
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
