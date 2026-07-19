"use client";

import { useState, ReactNode } from "react"; // 1. Import ReactNode

export default function CopyTextButton({
  text,
  label,
  className,
}: {
  text: string;
  label: ReactNode; // 2. Ubah tipe string menjadi ReactNode di sini
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback kalau Clipboard API diblokir (mis. http non-secure context)
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={
        className ??
        "bg-espresso text-paper text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-espresso/90 transition-colors"
      }
    >
      {copied ? "Tersalin!" : label}
    </button>
  );
}
