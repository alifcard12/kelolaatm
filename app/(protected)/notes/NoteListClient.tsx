"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatJakartaDateTime, formatRelativeTime } from "@/lib/date";
import { NOTE_CATEGORY_LABEL, NOTE_CATEGORY_TONE } from "@/lib/labels";
import {
  FiSearch,
  FiFlag,
  FiClock,
  FiArrowUp,
  FiArrowDown,
  FiMoreVertical,
  FiTrash2,
  FiPaperclip,
  FiLink,
} from "react-icons/fi";

type NoteRow = {
  id: string;
  title: string;
  content: string | null;
  link: string | null;
  category: string;
  updatedAt: Date;
  attachmentCount: number;
};

type SortField = "category" | "date";
type SortDir = "asc" | "desc";

const CATEGORY_ORDER: Record<string, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
  ARCHIVE: 4,
};

// Warna tetap per kategori (selaras dengan tone Badge).
const CATEGORY_COLOR: Record<string, string> = {
  URGENT: "var(--color-danger)",
  HIGH: "var(--color-warning)",
  MEDIUM: "var(--color-info)",
  LOW: "var(--color-success)",
  ARCHIVE: "var(--color-taupe-dark)",
};

function categoryColor(category: string) {
  return CATEGORY_COLOR[category] ?? "var(--color-info)";
}

function SortToggle({
  active,
  dir,
  icon,
  tooltip,
  onClick,
}: {
  active: boolean;
  dir: SortDir;
  icon: React.ReactNode;
  tooltip: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={tooltip}
      aria-label={tooltip}
      onClick={onClick}
      className={`flex h-9 items-center gap-1 rounded-xl border px-2.5 transition-colors ${
        active
          ? "border-rose bg-rose-soft text-rose-dark"
          : "border-taupe-dark/60 bg-paper text-espresso-soft hover:border-rose/50"
      }`}
    >
      {icon}
      {active ? (
        dir === "asc" ? (
          <FiArrowUp className="h-3.5 w-3.5" />
        ) : (
          <FiArrowDown className="h-3.5 w-3.5" />
        )
      ) : (
        <FiArrowUp className="h-3.5 w-3.5 opacity-30" />
      )}
    </button>
  );
}

function RowMenu({ onDelete }: { onDelete: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        aria-label="Menu"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="flex h-7 w-7 items-center justify-center rounded-full text-espresso-soft hover:bg-cream transition-colors"
      >
        <FiMoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
            }}
          />
          <div className="absolute right-0 top-full z-20 mt-1 rounded-xl border border-taupe/70 bg-paper shadow-[var(--shadow-pop)] p-1">
            <DeleteButton
              action={async () => onDelete()}
              label={<FiTrash2 className="h-4 w-4" />}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-danger hover:bg-danger-soft transition-colors disabled:opacity-50"
            />
          </div>
        </>
      )}
    </div>
  );
}

export function NoteListClient({
  notes,
  onDelete,
}: {
  notes: NoteRow[];
  onDelete: (id: string) => Promise<void>;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("category");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "date" ? "desc" : "asc");
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = notes;
    if (q) {
      rows = notes.filter((n) =>
        [n.title, n.content ?? "", n.link ?? ""].some((field) => field.toLowerCase().includes(q)),
      );
    }
    const sorted = [...rows].sort((a, b) => {
      let cmp =
        sortField === "date"
          ? a.updatedAt.getTime() - b.updatedAt.getTime()
          : CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category];
      if (cmp === 0 && sortField === "category") cmp = b.updatedAt.getTime() - a.updatedAt.getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [notes, query, sortField, sortDir]);

  function goToDetail(id: string) {
    router.push(`/notes/${id}`);
  }

  return (
    <div>
      <div className="mb-4 flex gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-espresso-soft/60" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari judul, catatan, atau link..."
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <SortToggle
            active={sortField === "category"}
            dir={sortDir}
            icon={<FiFlag className="h-4 w-4" />}
            tooltip="Urutkan berdasarkan Kategori"
            onClick={() => toggleSort("category")}
          />
          <SortToggle
            active={sortField === "date"}
            dir={sortDir}
            icon={<FiClock className="h-4 w-4" />}
            tooltip="Urutkan berdasarkan Update Terakhir"
            onClick={() => toggleSort("date")}
          />
        </div>
      </div>

      {notes.length === 0 ? (
        <EmptyState
          title="Belum ada catatan"
          description="Tambahkan catatan penting, link, atau file pertama di sini."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Tidak ditemukan"
          description="Tidak ada catatan yang cocok dengan pencarian tersebut."
        />
      ) : (
        <div className="flex flex-col gap-3 md:gap-4">
          {filtered.map((n) => (
            <Card
              key={n.id}
              className="border-l-4 cursor-pointer active:opacity-80"
              style={{ borderLeftColor: categoryColor(n.category) }}
              onClick={() => goToDetail(n.id)}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="min-w-0">
                  <Badge tone={NOTE_CATEGORY_TONE[n.category]}>
                    {NOTE_CATEGORY_LABEL[n.category]}
                  </Badge>
                  <div className="text-sm font-medium text-espresso mt-2 truncate">{n.title}</div>
                </div>
                <RowMenu onDelete={() => onDelete(n.id)} />
              </div>

              {n.content && <p className="text-sm text-espresso-soft mb-2 line-clamp-2">{n.content}</p>}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-espresso-soft/70">
                {n.link && (
                  <span className="flex items-center gap-1">
                    <FiLink className="h-3.5 w-3.5" /> Ada link
                  </span>
                )}
                {n.attachmentCount > 0 && (
                  <span className="flex items-center gap-1">
                    <FiPaperclip className="h-3.5 w-3.5" /> {n.attachmentCount} lampiran
                  </span>
                )}
                <span className="flex items-center gap-1" title={formatJakartaDateTime(n.updatedAt)}>
                  <FiClock className="h-3.5 w-3.5" />
                  {formatRelativeTime(n.updatedAt)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
