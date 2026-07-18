import Link from "next/link";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "dark" | "warning";
export type ButtonSize = "sm" | "md";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-rose text-paper hover:bg-rose-dark active:bg-rose-dark shadow-sm shadow-rose/20",
  dark: "bg-espresso text-paper hover:bg-espresso/90 active:bg-espresso/90",
  secondary:
    "bg-paper text-espresso border border-taupe-dark/70 hover:bg-cream active:bg-cream",
  ghost: "bg-transparent text-espresso-soft hover:bg-taupe/40 active:bg-taupe/50",
  danger: "bg-danger text-paper hover:bg-danger/90 active:bg-danger/90 shadow-sm shadow-danger/20",
  warning: "bg-warning text-paper hover:bg-warning/90 active:bg-warning/90",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "text-xs px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2.5 gap-2",
};

const BASE =
  "inline-flex items-center justify-center rounded-xl font-semibold transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none";

function classes(variant: ButtonVariant, size: ButtonSize, className: string) {
  return `${BASE} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`;
}

/** Tombol standar untuk form/aksi. Aman dipakai di server maupun client component. */
export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button className={classes(variant, size, className)} {...props} />;
}

/** Versi Link (next/link) dari Button, untuk aksi navigasi seperti "+ Tambah". */
export function LinkButton({
  variant = "primary",
  size = "md",
  className = "",
  href,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return <Link href={href} className={classes(variant, size, className)} {...props} />;
}
