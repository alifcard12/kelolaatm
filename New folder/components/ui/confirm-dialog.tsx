"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { FiAlertTriangle, FiTrash2 } from "react-icons/fi";
import { Button } from "@/components/ui/Button";

export type ConfirmTone = "danger" | "warning" | "neutral";

export type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
};

type PendingConfirm = ConfirmOptions & { resolve: (value: boolean) => void };

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

const TONE_ICON: Record<ConfirmTone, React.ComponentType<{ className?: string }>> = {
  danger: FiTrash2,
  warning: FiAlertTriangle,
  neutral: FiAlertTriangle,
};

const TONE_ICON_WRAP: Record<ConfirmTone, string> = {
  danger: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
  neutral: "bg-taupe/60 text-espresso-soft",
};

/**
 * Modal konfirmasi (mis. "Yakin ingin menghapus?") menggantikan window.confirm
 * bawaan browser supaya tampilannya konsisten dengan palette aplikasi.
 * Pasang <ConfirmProvider> sekali di root layout, lalu di komponen client
 * mana pun panggil `const confirm = useConfirm()` lalu
 * `const ok = await confirm({ title, description, tone: "danger" })`.
 */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback<ConfirmFn>((options) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve });
    });
  }, []);

  function close(result: boolean) {
    pending?.resolve(result);
    setPending(null);
  }

  const tone: ConfirmTone = pending?.tone ?? "danger";
  const Icon = TONE_ICON[tone];

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {pending && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-espresso/40 backdrop-blur-[1px] p-4"
          onClick={() => close(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            className="w-full max-w-sm rounded-2xl bg-paper p-5 shadow-[var(--shadow-pop)] border border-taupe/70 modal-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`h-11 w-11 rounded-full flex items-center justify-center mb-3 ${TONE_ICON_WRAP[tone]}`}>
              <Icon className="h-5 w-5" />
            </div>
            <h3 id="confirm-dialog-title" className="font-display text-base font-semibold text-espresso mb-1">
              {pending.title}
            </h3>
            {pending.description && (
              <p className="text-sm text-espresso-soft mb-5">{pending.description}</p>
            )}
            <div className="flex items-center justify-end gap-2 mt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => close(false)}>
                {pending.cancelLabel ?? "Batal"}
              </Button>
              <Button
                type="button"
                variant={tone === "danger" ? "danger" : "warning"}
                size="sm"
                onClick={() => close(true)}
              >
                {pending.confirmLabel ?? "Ya, lanjutkan"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm harus dipakai di dalam <ConfirmProvider>");
  return ctx;
}
