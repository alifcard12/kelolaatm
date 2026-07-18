"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { FiCheckCircle, FiInfo, FiAlertTriangle, FiAlertCircle, FiX } from "react-icons/fi";

export type ToastVariant = "success" | "info" | "warning" | "danger";

type ToastItem = {
  id: number;
  variant: ToastVariant;
  title: string;
  description?: string;
};

type ToastFns = {
  success: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
};

const ToastContext = createContext<ToastFns | null>(null);

const ICONS: Record<ToastVariant, React.ComponentType<{ className?: string }>> = {
  success: FiCheckCircle,
  info: FiInfo,
  warning: FiAlertTriangle,
  danger: FiAlertCircle,
};

const ACCENT_BORDER: Record<ToastVariant, string> = {
  success: "border-l-success",
  info: "border-l-info",
  warning: "border-l-warning",
  danger: "border-l-danger",
};

const ICON_COLOR: Record<ToastVariant, string> = {
  success: "text-success",
  info: "text-info",
  warning: "text-warning",
  danger: "text-danger",
};

let uid = 0;
const DEFAULT_DURATION = 4000;

/**
 * Notifikasi mengambang (toast) — otomatis hilang setelah beberapa detik.
 * Pasang <ToastProvider> sekali di root layout, lalu di komponen mana pun
 * panggil `const toast = useToast()` lalu `toast.success("Tersimpan")`.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (variant: ToastVariant, title: string, description?: string) => {
      const id = ++uid;
      setToasts((prev) => [...prev, { id, variant, title, description }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), DEFAULT_DURATION)
      );
    },
    [dismiss]
  );

  const fns: ToastFns = {
    success: (title, description) => push("success", title, description),
    info: (title, description) => push("info", title, description),
    warning: (title, description) => push("warning", title, description),
    error: (title, description) => push("danger", title, description),
  };

  return (
    <ToastContext.Provider value={fns}>
      {children}

      <div className="fixed z-[100] inset-x-4 bottom-4 flex flex-col-reverse gap-2 md:inset-x-auto md:bottom-auto md:top-4 md:right-4 md:w-96 pointer-events-none">
        {toasts.map((t) => {
          const Icon = ICONS[t.variant];
          return (
            <div
              key={t.id}
              role="status"
              className={`toast-in pointer-events-auto flex items-start gap-3 rounded-xl border border-l-4 border-taupe/60 bg-paper px-4 py-3 shadow-[var(--shadow-pop)] ${ACCENT_BORDER[t.variant]}`}
            >
              <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${ICON_COLOR[t.variant]}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-espresso leading-snug">{t.title}</p>
                {t.description && (
                  <p className="text-xs text-espresso-soft mt-0.5 leading-snug">{t.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Tutup notifikasi"
                className="shrink-0 text-espresso-soft/60 hover:text-espresso transition-colors"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast harus dipakai di dalam <ToastProvider>");
  return ctx;
}
