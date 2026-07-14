import Link from "next/link";

const navItems = [
  { href: "/atm", label: "ATM" },
  { href: "/devices", label: "Perangkat Pendukung" },
  { href: "/kaset", label: "Kaset" },
  { href: "/tickets", label: "Ticket" },
  { href: "/finance", label: "Keuangan Operasional" },
  { href: "/visits", label: "Jadwal Kunjungan" },
];

export default function Sidebar() {
  return (
    <aside className="w-60 shrink-0 border-r border-slate-200 bg-white min-h-screen p-4">
      <h1 className="text-lg font-semibold text-slate-800 mb-6 px-2">Kelola ATM</h1>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-3 py-2 rounded-md text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
