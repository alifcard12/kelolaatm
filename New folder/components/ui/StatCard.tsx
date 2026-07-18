import Link from "next/link";
import { Card } from "@/components/ui/Card";

export function StatCard({
  label,
  value,
  href,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  href?: string;
  tone?: "neutral" | "rose" | "warning" | "danger";
}) {
  const valueColor =
    tone === "rose"
      ? "text-rose"
      : tone === "warning"
      ? "text-warning"
      : tone === "danger"
      ? "text-danger"
      : "text-espresso";

  const content = (
    <Card className="h-full transition-shadow hover:shadow-[var(--shadow-pop)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-espresso-soft mb-2">
        {label}
      </p>
      <p className={`font-display text-3xl font-semibold ${valueColor}`}>{value}</p>
    </Card>
  );

  if (!href) return content;

  return (
    <Link href={href} className="block h-full">
      {content}
    </Link>
  );
}
