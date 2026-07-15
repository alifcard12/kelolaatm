"use client";

import { useState } from "react";

type Attachment = {
  id: string;
  url: string;
  resourceType: string;
  filename: string | null;
};

/**
 * Menampilkan grid lampiran tiket (foto + PDF).
 * Foto -> klik buka preview modal. PDF -> klik langsung buka/download di tab baru.
 */
export function TicketAttachments({
  attachments,
  onDelete,
}: {
  attachments: Attachment[];
  onDelete?: (attachmentId: string) => Promise<void>;
}) {
  const [active, setActive] = useState<Attachment | null>(null);

  if (attachments.length === 0) return null;

  function downloadUrl(url: string) {
    const [base, rest] = url.split("/upload/");
    return `${base}/upload/fl_attachment/${rest}`;
  }

  return (
    <>
      <div className="flex flex-wrap gap-2 mt-3">
        {attachments.map((a) => (
          <div key={a.id} className="relative group">
            {a.resourceType === "image" ? (
              <button type="button" onClick={() => setActive(a)} className="block">
                <img
                  src={a.url}
                  alt={a.filename ?? "Lampiran"}
                  className="w-20 h-20 object-cover rounded-md border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
                />
              </button>
            ) : (
              <a
                href={downloadUrl(a.url)}
                target="_blank"
                rel="noreferrer"
                className="w-20 h-20 flex flex-col items-center justify-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-1 hover:bg-slate-100 transition-colors"
                title={a.filename ?? "PDF"}
              >
                <span className="text-xs font-semibold text-red-500">PDF</span>
                <span className="text-[9px] text-slate-500 truncate w-full text-center">
                  {a.filename ?? "Lampiran"}
                </span>
              </a>
            )}
            {onDelete && (
              <form action={() => onDelete(a.id)} className="absolute -top-1.5 -right-1.5">
                <button
                  type="submit"
                  title="Hapus lampiran"
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
            <img
              src={active.url}
              alt={active.filename ?? "Lampiran"}
              className="max-h-[70vh] w-auto rounded-md object-contain"
            />
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
