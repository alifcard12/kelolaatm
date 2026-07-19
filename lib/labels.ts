/**
 * Label & "tone" (warna semantik) terpusat untuk semua enum yang tampil di UI.
 * Dulu tersebar & terduplikasi di banyak halaman (atm, devices, kaset, ...) —
 * sekarang satu sumber kebenaran supaya konsisten dan gampang diubah.
 */
import type { BadgeTone } from "@/components/ui/Badge";

export const CONDITION_LABEL: Record<string, string> = {
  GOOD: "Baik",
  DAMAGED: "Rusak",
  NEEDS_REPLACEMENT: "Perlu Ganti",
};

export const CONDITION_TONE: Record<string, BadgeTone> = {
  GOOD: "success",
  DAMAGED: "danger",
  NEEDS_REPLACEMENT: "warning",
};

export const DEVICE_TYPE_LABEL: Record<string, string> = {
  NVR: "NVR",
  MONITOR: "Monitor",
  CCTV: "CCTV",
  UPS: "UPS",
};

export const KASET_TYPE_LABEL: Record<string, string> = {
  ALL_IN: "All in One",
  CURRENCY: "Currency",
};

export const TICKET_STATUS_LABEL: Record<string, string> = {
  OPEN: "Open",
  CLOSED: "Closed",
};

export const TICKET_STATUS_TONE: Record<string, BadgeTone> = {
  OPEN: "warning",
  CLOSED: "success",
};

export const VISIT_TYPE_LABEL: Record<string, string> = {
  PM: "PM",
  CM: "CM",
};

export const VISIT_TYPE_TONE: Record<string, BadgeTone> = {
  PM: "info",
  CM: "warning",
};

export const HISTORY_ACTION_LABEL: Record<string, string> = {
  ADDED: "Dipasang",
  REPLACED: "Diganti",
  REMOVED: "Dilepas",
};

export const HISTORY_ACTION_TONE: Record<string, BadgeTone> = {
  ADDED: "success",
  REPLACED: "warning",
  REMOVED: "danger",
};

export const FINANCE_TYPE_LABEL: Record<string, string> = {
  DEBIT: "Debit (Keluar)",
  CREDIT: "Credit (Masuk)",
};

export const FINANCE_TYPE_TONE: Record<string, BadgeTone> = {
  DEBIT: "danger",
  CREDIT: "success",
};

export const FINANCE_CATEGORY_LABEL: Record<string, string> = {
  KETERANGAN: "Keterangan",
  TRANSPORTASI: "Transportasi",
  SPJ: "SPJ",
  HOTEL: "Hotel",
  PENGIRIMAN: "Pengiriman",
  OPERASIONAL: "Operasional",
};

export const TRAVEL_VEHICLE_LABEL: Record<string, string> = {
  AVANZA: "Avanza",
  XENIA: "Xenia",
  SIGRA: "Sigra",
  XPANDER: "Xpander",
};

export const HOTEL_ROOM_TYPE_LABEL: Record<string, string> = {
  SUPER_SINGLE: "Super Single",
  DELUXE_DOUBLE: "Deluxe Double",
  DELUXE_TWIN: "Deluxe Twin",
  EXECUTIVE: "Executive",
};

export const HOTEL_PAYMENT_METHOD_LABEL: Record<string, string> = {
  ALFAMART: "Alfamart",
  BRIVA: "BRIVA",
  INDOMARET: "Indomaret",
  OVO: "OVO",
  SHOPEEPAY: "ShopeePay",
  QRIS: "QRIS",
};

export const FINANCE_CATEGORY_TONE: Record<string, BadgeTone> = {
  KETERANGAN: "neutral",
  TRANSPORTASI: "info",
  SPJ: "warning",
  HOTEL: "warning",
  PENGIRIMAN: "info",
  OPERASIONAL: "neutral",
};
