import { formatJakartaDateDMY } from "./date";

type TicketTextBase = {
  date: Date;
  location: string; // dari Atm.location
  branch: string; // dari Atm.branch (KANCA)
  tid: number; // dari Atm.tid
  ssb: string; // dari Atm.ssb
  problem: string;
};

// Contoh output:
// Assalamu'alaikum,
// Mohon dibantu bang
//
//
//
// OPEN TIKET  CM
// DATE :  15-07-2026
// LOKASI : BRI UNIT PALLENGU
// KANCA : JENEPONTO
// TID : 190147
// SSB : 5310271459
// PROBLEM : GROUNDING TINGGI
export function buildOpenTicketText(input: TicketTextBase): string {
  return [
    "Assalamu'alaikum, ",
    "Mohon dibantu bang",
    "",
    " ",
    " ",
    "OPEN TIKET  CM",
    `DATE :  ${formatJakartaDateDMY(input.date)}`,
    `LOKASI : ${input.location}`,
    `KANCA : ${input.branch}`,
    `TID : ${input.tid}`,
    `SSB : ${input.ssb}`,
    `PROBLEM : ${input.problem}`,
  ].join("\n");
}

// Contoh output:
// Assalamu'alaikum,
// Mohon dibantu bang
//
//
//
// CLOSE TIKET  CM 54564554
// DATE :  15-07-2026
// LOKASI : BRI UNIT PALLENGU
// KANCA : JENEPONTO
// TID : 190147
// SSB : 5310271459
// PROBLEM : GROUNDING TINGGI
// ACTION : REPLACE PSU, TES FUNGSI OK
export function buildCloseTicketText(
  input: TicketTextBase & { ticketNumber: string; action: string }
): string {
  return [
    "Assalamu'alaikum, ",
    "Mohon dibantu bang",
    "",
    " ",
    " ",
    `CLOSE TIKET  CM ${input.ticketNumber}`,
    `DATE :  ${formatJakartaDateDMY(input.date)}`,
    `LOKASI : ${input.location}`,
    `KANCA : ${input.branch}`,
    `TID : ${input.tid}`,
    `SSB : ${input.ssb}`,
    `PROBLEM : ${input.problem}`,
    `ACTION : ${input.action}`,
  ].join("\n");
}
