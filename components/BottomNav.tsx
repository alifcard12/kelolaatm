"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { bottomNavItems } from "./nav-items";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/90 backdrop-blur-lg border-t border-zinc-100 pb-safe">
      <div className="flex items-stretch justify-between px-1">
        {bottomNavItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 min-w-0"
            >
              <span
                className={`flex items-center justify-center w-9 h-9 rounded-xl transition-colors ${
                  active ? "bg-brand-50 text-brand-600" : "text-zinc-400"
                }`}
              >
                <Icon width={20} height={20} strokeWidth={active ? 2 : 1.8} />
              </span>
              <span
                className={`text-[10px] leading-none truncate max-w-full ${
                  active ? "text-brand-600 font-medium" : "text-zinc-400"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
