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
    <div className="flex flex-col gap-1 mb-2 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold tracking-wide text-rose uppercase mb-1">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-xl md:text-3xl font-semibold text-espresso">
          {title}
        </h1>
        {description && (
          <p className="text-espresso-soft mt-1.5 text-sm max-w-prose">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 flex justify-end">{action}</div>}
    </div>
  );
}
