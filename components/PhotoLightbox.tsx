"use client";

import { useState } from "react";

type Photo = { id: string; url: string };

/**
 * Menampilkan grid thumbnail foto. Klik foto -> buka modal preview
 * (tidak pindah ke tab Cloudinary), dengan tombol download.
 * `renderDeleteButton` opsional dipakai untuk menaruh tombol hapus foto
 * di pojok thumbnail (dikirim dari server component supaya bisa pakai Server Action).
 */
export function PhotoLightbox({
  photos,
  onDeletePhoto,
}: {
  photos: Photo[];
  onDeletePhoto?: (photoId: string) => Promise<void>;
}) {
  const [active, setActive] = useState<Photo | null>(null);

  if (photos.length === 0) return null;

  function downloadUrl(url: string) {
    // fl_attachment memaksa Cloudinary mengirim sebagai file download, bukan dibuka di tab baru
    const [base, rest] = url.split("/upload/");
    return `${base}/upload/fl_attachment/${rest}`;
  }

  return (
    <>
      <div className="flex flex-wrap gap-2 mt-3">
        {photos.map((photo) => (
          <div key={photo.id} className="relative group">
            <button type="button" onClick={() => setActive(photo)} className="block">
              <img
                src={photo.url}
                alt="Foto kaset"
                className="w-20 h-20 object-cover rounded-md border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
              />
            </button>
            {onDeletePhoto && (
              <form action={() => onDeletePhoto(photo.id)} className="absolute -top-1.5 -right-1.5">
                <button
                  type="submit"
                  title="Hapus foto"
                  className="bg-white border border-slate-300 rounded-full w-5 h-5 text-xs leading-none text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </form>
            )}
          </div>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setActive(null)}
        >
          <div
            className="bg-white rounded-lg p-4 max-w-lg w-full flex flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={active.url} alt="Foto kaset" className="max-h-[70vh] w-auto rounded-md object-contain" />
            <div className="flex gap-2 w-full">
              <a
                href={downloadUrl(active.url)}
                download
                className="flex-1 text-center bg-slate-900 text-white text-sm px-4 py-2 rounded-md hover:bg-slate-700"
              >
                Download
              </a>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="flex-1 bg-slate-100 text-slate-700 text-sm px-4 py-2 rounded-md hover:bg-slate-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
