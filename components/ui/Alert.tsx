import { FiCheckCircle, FiInfo, FiAlertTriangle, FiAlertCircle, FiX } from "react-icons/fi";

export type AlertVariant = "success" | "info" | "warning" | "danger";

const ICONS: Record<AlertVariant, React.ComponentType<{ className?: string }>> = {
  success: FiCheckCircle,
  info: FiInfo,
  warning: FiAlertTriangle,
  danger: FiAlertCircle,
};

const CONTAINER_CLASSES: Record<AlertVariant, string> = {
  success: "bg-success-soft border-success/25",
  info: "bg-info-soft border-info/25",
  warning: "bg-warning-soft border-warning/25",
  danger: "bg-danger-soft border-danger/25",
};

const ICON_CLASSES: Record<AlertVariant, string> = {
  success: "text-success",
  info: "text-info",
  warning: "text-warning",
  danger: "text-danger",
};

const TITLE_CLASSES: Record<AlertVariant, string> = {
  success: "text-success",
  info: "text-info",
  warning: "text-warning",
  danger: "text-danger",
};

/**
 * Banner alert statis untuk ditaruh di dalam halaman/form — bukan notifikasi
 * yang muncul-hilang sendiri (untuk itu pakai `useToast()` dari `toast.tsx`).
 * Cocok untuk: error validasi form, info di atas tabel, pesan sukses setelah
 * redirect, dsb.
 */
export function Alert({
  variant = "info",
  title,
  children,
  onDismiss,
  className = "",
}: {
  variant?: AlertVariant;
  title?: string;
  children?: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}) {
  const Icon = ICONS[variant];

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${CONTAINER_CLASSES[variant]} ${className}`}
    >
      <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${ICON_CLASSES[variant]}`} />
      <div className="min-w-0 flex-1">
        {title && <p className={`font-semibold leading-snug ${TITLE_CLASSES[variant]}`}>{title}</p>}
        {children && (
          <div className={`leading-snug text-espresso-soft ${title ? "mt-0.5" : ""}`}>{children}</div>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Tutup"
          className="shrink-0 rounded-lg p-0.5 text-espresso-soft/60 hover:text-espresso hover:bg-black/5 transition-colors"
        >
          <FiX className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
