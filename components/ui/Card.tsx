export function Card({
  children,
  className = "",
  padded = true,
  style,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  return (
    <div
      className={`bg-paper border border-taupe/70 rounded-2xl shadow-[var(--shadow-card)] ${
        padded ? "px-3 py-2 md:p-6" : ""
      } ${className}`}
      style={style}
      onClick={onClick}
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
    <h3
      className={`font-display text-base font-semibold text-espresso ${className}`}
    >
      {children}
    </h3>
  );
}
