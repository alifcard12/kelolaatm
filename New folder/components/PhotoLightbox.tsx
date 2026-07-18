"use client";

import { useState } from "react";

type Photo = { id: string; url: string };

/**
 * Menampilkan grid thumbnail foto. Klik foto -> buka modal preview
 * (tidak pindah ke tab Cloudinary), dengan tombol download.
 * `onDeletePhoto` opsional dipakai untuk menaruh tombol hapus foto
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
                alt="Foto"
                className="w-20 h-20 object-cover rounded-xl border border-taupe/70 cursor-pointer hover:opacity-80 transition-opacity"
              />
            </button>
            {onDeletePhoto && (
              <form action={() => onDeletePhoto(photo.id)} className="absolute -top-1.5 -right-1.5">
                <button
                  type="submit"
                  title="Hapus foto"
                  className="bg-paper border border-taupe-dark/60 rounded-full w-5 h-5 text-xs leading-none text-danger shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
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
          className="fixed inset-0 bg-espresso/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setActive(null)}
        >
          <div
            className="bg-paper rounded-2xl p-4 max-w-lg w-full flex flex-col items-center gap-3 shadow-[var(--shadow-pop)]"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={active.url} alt="Foto" className="max-h-[70vh] w-auto rounded-xl object-contain" />
            <div className="flex gap-2 w-full">
              <a
                href={downloadUrl(active.url)}
                download
                className="flex-1 text-center bg-espresso text-paper text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-espresso/90 transition-colors"
              >
                Download
              </a>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="flex-1 bg-cream text-espresso text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-taupe/60 transition-colors"
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
