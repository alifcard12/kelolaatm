export function PageHeader({
  title,
  description,
  action,
  eyebrow,
}: {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold tracking-wide text-rose uppercase mb-1">{eyebrow}</p>
        )}
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-espresso">{title}</h1>
        {description && <p className="text-espresso-soft mt-1.5 text-sm max-w-prose">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
