"use client";

import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";

export default function VisitTypeFields() {
  return (
    <>
      <input type="hidden" name="visitType" value="PM" />
      <Field
        label="Nomor Tiket"
        htmlFor="ticketNumber"
        hint="Kunjungan yang dicatat manual di sini otomatis bertipe PM — Preventive Maintenance. Kunjungan tipe CM otomatis tercatat saat tiket ditutup di halaman Tiket."
      >
        <Input
          id="ticketNumber"
          name="ticketNumber"
          type="text"
          required
          placeholder="Input manual nomor tiket PM"
        />
      </Field>
    </>
  );
}
