import type { TdHTMLAttributes, ThHTMLAttributes } from "react";

/** Primitif tabel untuk daftar data di layar desktop (≥ md). Untuk mobile,
 * setiap halaman list merender kartu terpisah — lihat pola di app/(protected)/*\/page.tsx. */
export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="hidden md:block bg-paper border border-taupe/70 rounded-2xl overflow-hidden shadow-[var(--shadow-card)]">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  );
}

export function Thead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-cream text-espresso-soft text-left text-xs font-semibold uppercase tracking-wide">
      <tr>{children}</tr>
    </thead>
  );
}

export function Th({ className = "", ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={`px-4 py-3 font-semibold ${className}`} {...props} />;
}

export function Tbody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-taupe/50">{children}</tbody>;
}

export function Tr({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <tr className={`hover:bg-cream/60 transition-colors ${className}`}>{children}</tr>;
}

export function Td({ className = "", ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={`px-4 py-3.5 align-middle text-espresso ${className}`} {...props} />;
}
