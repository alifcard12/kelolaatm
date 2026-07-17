"use client";

export default function VisitTypeFields() {
  return (
    <>
      <input type="hidden" name="visitType" value="PM" />
      <div>
        <label className="block text-sm text-slate-600 mb-1">Nomor Tiket</label>
        <input
          name="ticketNumber"
          type="text"
          required
          placeholder="Input manual nomor tiket PM"
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
        />
        <p className="text-xs text-slate-400 mt-1">
          Kunjungan yang dicatat manual di sini otomatis bertipe PM — Preventive Maintenance.
          Kunjungan tipe CM otomatis tercatat saat tiket ditutup di halaman Tiket.
        </p>
      </div>
    </>
  );
}
