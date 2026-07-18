export function Field({
  label,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-espresso-soft mb-1.5">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-espresso-soft/80 mt-1.5">{hint}</p>}
    </div>
  );
}
