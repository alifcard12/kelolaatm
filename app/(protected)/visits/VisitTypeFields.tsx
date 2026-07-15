"use client";

import { useState } from "react";

type ClosedTicket = {
  id: string;
  ticketNumber: string | null;
  problem: string;
  atm: { tid: number };
};

export default function VisitTypeFields({ closedTickets }: { closedTickets: ClosedTicket[] }) {
  const [visitType, setVisitType] = useState<"PM" | "CM">("PM");

  return (
    <>
      <div>
        <label className="block text-sm text-slate-600 mb-1">Tipe Kunjungan</label>
        <select
          name="visitType"
          required
          value={visitType}
          onChange={(e) => setVisitType(e.target.value as "PM" | "CM")}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="PM">PM — Preventive Maintenance</option>
          <option value="CM">CM — Corrective Maintenance</option>
        </select>
      </div>

      {visitType === "PM" ? (
        <div>
          <label className="block text-sm text-slate-600 mb-1">Nomor Tiket</label>
          <input
            name="ticketNumber"
            type="text"
            placeholder="Input manual nomor tiket PM"
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
      ) : (
        <div>
          <label className="block text-sm text-slate-600 mb-1">Nomor Tiket</label>
          <select
            name="ticketId"
            required
            defaultValue=""
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="" disabled>
              — Pilih tiket yang sudah CLOSED —
            </option>
            {closedTickets.map((t) => (
              <option key={t.id} value={t.id}>
                {t.atm.tid} — {t.problem} (No. {t.ticketNumber ?? "-"})
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-1">
            Hanya menampilkan tiket berstatus CLOSED. Nomor tiket otomatis diambil dari tiket ini.
          </p>
        </div>
      )}
    </>
  );
}
