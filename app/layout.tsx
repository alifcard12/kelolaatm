import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Kelola ATM",
  description: "Aplikasi manajemen operasional servis ATM",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="flex">
        <Sidebar />
        <main className="flex-1 p-8 bg-slate-50 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
