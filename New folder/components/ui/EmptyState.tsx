export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 text-center rounded-2xl border-2 border-dashed border-taupe-dark/50 bg-paper/40 px-6 py-12">
      <div className="h-11 w-11 rounded-full bg-taupe/50 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-espresso-soft" fill="none">
          <path
            d="M4 7h16M4 12h16M4 17h10"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div>
        <p className="font-display text-base font-semibold text-espresso">{title}</p>
        {description && <p className="text-sm text-espresso-soft mt-1 max-w-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}
