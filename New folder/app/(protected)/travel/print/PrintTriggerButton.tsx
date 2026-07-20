"use client";

import { FiPrinter } from "react-icons/fi";

export function PrintTriggerButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-espresso text-paper px-5 py-3 font-semibold shadow-lg hover:bg-espresso/90 transition-colors"
    >
      <FiPrinter /> Cetak / Simpan PDF
    </button>
  );
}
