"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/product/penjualan", label: "Penjualan" },
  { href: "/product/daftar", label: "Product" },
];

export function ProductNav() {
  const pathname = usePathname();

  return (
    <div className="flex gap-2 mb-6 border-b border-taupe/70">
      {TABS.map((tab) => {
        const active =
          pathname === tab.href || pathname.startsWith(`${tab.href}/`);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              active
                ? "border-rose text-espresso"
                : "border-transparent text-espresso-soft hover:text-espresso"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
