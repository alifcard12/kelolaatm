"use client";

import { useRouter } from "next/navigation";
import { useTransition, type FormEvent, type ReactNode } from "react";
import { useToast } from "@/components/ui/toast";

type ServerAction = (formData: FormData) => Promise<void>;

function isNavigationSignal(err: unknown): boolean {
  const digest = (err as { digest?: unknown } | null)?.digest;
  return typeof digest === "string" && (digest.startsWith("NEXT_REDIRECT") || digest.startsWith("NEXT_NOT_FOUND"));
}

/**
 * Pengganti `<form action={serverAction}>` polos supaya submit-nya
 * menampilkan toast sukses/gagal. Server Action-nya sendiri TIDAK berubah —
 * ini cuma pembungkus. Kalau action-nya memanggil `redirect()`, navigasi
 * tetap berjalan seperti biasa (error redirect Next.js dibiarkan lolos).
 * Kalau action melempar `Error` (mis. validasi), pesannya otomatis
 * ditampilkan di toast error.
 */
export function ActionForm({
  action,
  successMessage,
  resetOnSuccess = false,
  className = "",
  children,
}: {
  action: ServerAction;
  successMessage: string;
  resetOnSuccess?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const toast = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        await action(formData);
        toast.success(successMessage);
        if (resetOnSuccess) form.reset();
        router.refresh();
      } catch (err) {
        if (isNavigationSignal(err)) {
          toast.success(successMessage);
          throw err;
        }
        const message = err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.";
        toast.error("Gagal menyimpan", message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className={className} aria-busy={pending}>
      <fieldset disabled={pending} className="contents">
        {children}
      </fieldset>
    </form>
  );
}
