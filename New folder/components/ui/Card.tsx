export function Card({
  children,
  className = "",
  padded = true,
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={`bg-paper border border-taupe/70 rounded-2xl shadow-[var(--shadow-card)] ${
        padded ? "p-5 md:p-6" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={`font-display text-base font-semibold text-espresso ${className}`}>
      {children}
    </h3>
  );
}
