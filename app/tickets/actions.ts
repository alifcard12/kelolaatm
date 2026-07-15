"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createTicket(formData: FormData) {
  const atmId = String(formData.get("atmId") ?? "");
  const problem = String(formData.get("problem") ?? "").trim();

  if (!atmId || !problem) {
    throw new Error("ATM dan problem wajib diisi.");
  }

  await prisma.ticket.create({
    data: { atmId, problem },
  });

  revalidatePath("/tickets");
  redirect("/tickets");
}

export async function closeTicket(ticketId: string, formData: FormData) {
  const ticketNumber = String(formData.get("ticketNumber") ?? "").trim();
  const action = String(formData.get("action") ?? "").trim();

  if (!ticketNumber || !action) {
    throw new Error("Nomor tiket dan action wajib diisi.");
  }

  await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      ticketNumber,
      action,
      status: "CLOSED",
      closedAt: new Date(),
    },
  });

  revalidatePath("/tickets");
}

export async function reopenTicket(ticketId: string) {
  await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      status: "OPEN",
      ticketNumber: null,
      action: null,
      closedAt: null,
    },
  });

  revalidatePath("/tickets");
}

export async function deleteTicket(id: string) {
  await prisma.ticket.delete({ where: { id } });
  revalidatePath("/tickets");
}
