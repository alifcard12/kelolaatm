"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/login/actions";
import { BrandMark } from "@/components/brand-mark";
import { FiMenu, FiX, FiLogOut } from "react-icons/fi";

const navItems = [
  { href: "/atm", label: "ATM", description: "Data Unit ATM" },
  { href: "/devices", label: "Perangkat", description: "Perangkat Pendukung" },
  { href: "/kaset", label: "Kaset", description: "Kaset ATM" },
  { href: "/tickets", label: "Ticket", description: "Tiket Servis" },
  { href: "/notes", label: "Catatan", description: "Catatan Tim" },
  { href: "/travel", label: "Travel", description: "Pemesanan Travel" },
  { href: "/hotel", label: "Hotel", description: "Pemesanan Hotel" },
  { href: "/product", label: "Product", description: "Data Master Product" },
  { href: "/finance", label: "Keuangan", description: "Keuangan Operasional" },
  { href: "/visits", label: "Jadwal Kunjungan", description: "Jadwal Kunjungan" },
  { href: "/absensi", label: "Absensi", description: "Absen Masuk & Pulang" },
];

const DEFAULT_BRAND = { label: "Kelola ATM", description: "Operasional & Servis" };

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getBrandText(pathname: string) {
  const active = navItems.find((item) => isActive(pathname, item.href));
  if (!active) return DEFAULT_BRAND;
  return { label: active.label, description: active.description };
}

function Brand({ pathname }: { pathname: string }) {
  const { label, description } = getBrandText(pathname);
  return (
    <Link href="/" className="flex items-center gap-3 px-2">
      <BrandMark className="h-9 w-9 shrink-0" />
      <div className="leading-tight">
        <p className="font-display text-base font-semibold text-espresso">
          {label}
        </p>
        <p className="text-[11px] text-espresso-soft">{description}</p>
      </div>
    </Link>
  );
}

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`relative px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              active
                ? "bg-rose text-paper shadow-sm shadow-rose/25"
                : "text-espresso-soft hover:bg-taupe/50 hover:text-espresso"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function LogoutForm({ className = "" }: { className?: string }) {
  return (
    <form action={logout} className={className}>
      <button
        type="submit"
        className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium text-espresso-soft hover:bg-danger-soft hover:text-danger transition-colors"
      >
        <FiLogOut />
        Keluar
      </button>
    </form>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Tutup drawer otomatis setiap kali pindah halaman.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Kunci scroll body saat drawer mobile terbuka.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* --- Top bar mobile (< md) --- */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-taupe/70 bg-cream/90 backdrop-blur px-4 py-3">
        <Brand pathname={pathname} />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Buka menu"
          aria-expanded={open}
          className="flex items-center justify-center h-10 w-10 rounded-xl text-espresso hover:bg-taupe/50 transition-colors"
        >
          <FiMenu />
        </button>
      </header>

      {/* --- Drawer mobile --- */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-opacity duration-200 ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-espresso/40 backdrop-blur-[1px]"
        />
        <div
          className={`absolute inset-y-0 left-0 w-72 max-w-[60%] bg-cream border-r border-taupe/70 p-4 flex flex-col gap-6 shadow-[var(--shadow-pop)] transition-transform duration-200 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <Brand pathname={pathname} />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Tutup menu"
              className="flex items-center justify-center h-9 w-9 rounded-xl text-espresso-soft hover:bg-taupe/50 transition-colors"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
          <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
          <div className="mt-auto border-t border-taupe/70 pt-3">
            <LogoutForm />
          </div>
        </div>
      </div>

      {/* --- Sidebar desktop (≥ md) --- */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col gap-8 border-r border-taupe/70 bg-cream sticky top-0 h-screen p-5">
        <Brand pathname={pathname} />
        <NavLinks pathname={pathname} />
        <div className="mt-auto border-t border-taupe/70 pt-3">
          <LogoutForm />
        </div>
      </aside>
    </>
  );
}
