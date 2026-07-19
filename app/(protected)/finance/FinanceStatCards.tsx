"use client";

import { useState } from "react";
import { StatCard } from "@/components/ui/StatCard";
import { FaAnglesDown, FaAnglesUp } from "react-icons/fa6";

export function FinanceStatCards({
  saldoTerakhir,
  totalCredit,
  totalDebit,
  saldoBulanIni,
  debitBulanIni,
  creditBulanIni,
}: {
  saldoTerakhir: string;
  totalCredit: string;
  totalDebit: string;
  saldoBulanIni: string;
  debitBulanIni: string;
  creditBulanIni: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mb-1">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 md:gap-4">
        <StatCard
          label="Saldo Bulan Ini"
          value={saldoBulanIni}
          tone="warning"
        />
        <StatCard label="Debit Bulan Ini" value={debitBulanIni} tone="rose" />
      </div>

      {expanded && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 md:gap-4 mt-1 md:mt-4">
          <StatCard
            label="Saldo Terakhir"
            value={saldoTerakhir}
            tone="warning"
          />
          <StatCard label="Total Credit" value={totalCredit} tone="success" />
          <StatCard label="Total Debit" value={totalDebit} tone="rose" />
          <StatCard
            label="Credit Bulan Ini"
            value={creditBulanIni}
            tone="success"
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-2 flex justify-center w-full  items-center gap-1 text-xs font-semibold text-espresso-soft hover:text-espresso transition-colors"
      >
        {expanded ? (
          <>
            <FaAnglesUp />
          </>
        ) : (
          <>
            <FaAnglesDown />
          </>
        )}
      </button>
    </div>
  );
}
