import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kelola ATM",
  description: "Aplikasi manajemen operasional servis ATM",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
