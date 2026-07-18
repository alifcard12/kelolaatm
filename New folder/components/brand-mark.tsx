/** Monogram kartu/chip ATM — dipakai sebagai brand mark di sidebar & login. */
export function BrandMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden>
      <rect x="1" y="1" width="34" height="34" rx="10" fill="var(--color-espresso)" />
      <rect x="8" y="11" width="12" height="9" rx="2" fill="var(--color-rose)" />
      <path d="M8 14.5h12M12 11v9" stroke="var(--color-espresso)" strokeWidth="0.8" />
      <rect x="22.5" y="11" width="5.5" height="14" rx="1.5" fill="var(--color-cream)" opacity="0.85" />
    </svg>
  );
}
