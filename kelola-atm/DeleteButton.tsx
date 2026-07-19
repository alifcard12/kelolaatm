"use client";

import { useTransition } from "react";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";

/**
 * Tombol hapus dengan modal konfirmasi (bukan window.confirm bawaan browser)
 * sebelum menjalankan Server Action-nya, lalu menampilkan toast hasilnya.
 * Menggantikan pola `<form action={...}><button>Hapus</button></form>`
 * yang tersebar di banyak halaman.
 */
export function DeleteButton({
  action,
  label = "Hapus",
  confirmTitle = "Hapus data ini?",
  confirmDescription = "Tindakan ini tidak bisa dibatalkan.",
  successMessage = "Berhasil dihapus.",
  className = "",
}: {
  action: () => Promise<void>;
  label?: React.ReactNode;
  confirmTitle?: string;
  confirmDescription?: string;
  successMessage?: string;
  className?: string;
}) {
  const confirm = useConfirm();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  async function handleClick() {
    const ok = await confirm({
      title: confirmTitle,
      description: confirmDescription,
      confirmLabel: "Ya, Hapus",
      tone: "danger",
    });
    if (!ok) return;

    startTransition(async () => {
      try {
        await action();
        toast.success(successMessage);
      } catch {
        toast.error("Gagal menghapus", "Coba lagi beberapa saat lagi.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={`text-xs font-medium text-danger hover:underline disabled:opacity-50 ${className}`}
    >
      {pending && typeof label === "string" ? "Menghapus…" : label}
    </button>
  );
}
