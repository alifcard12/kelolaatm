import { prisma } from "@/lib/prisma";
import { TravelInvoiceDoc } from "./TravelInvoiceDoc";
import { PrintTriggerButton } from "./PrintTriggerButton";

export default async function TravelPrintPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids: idsParam } = await searchParams;
  const ids = idsParam ? idsParam.split(",").filter(Boolean) : undefined;

  const travels = await prisma.travel.findMany({
    where: ids ? { id: { in: ids } } : undefined,
    orderBy: [{ departureDate: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white py-8 print:py-0">
      {/* Aturan cetak: 4 slip per halaman A4, mirip contoh invoice vendor. */}
      <style>{`
        @page { size: A4; margin: 10mm; }
        @media print {
          body { background: white; }
        }
        
        }
        .invoice-slip:last-child { border-bottom: none; }
        @media print {
          .invoice-slip { break-inside: avoid; }
          .invoice-page-break { break-after: page; }
        }
      `}</style>

      <div className="mx-auto max-w-[794px] bg-white shadow print:shadow-none">
        {travels.length === 0 ? (
          <p className="p-10 text-center text-gray-500">
            Tidak ada data travel untuk dicetak.
          </p>
        ) : (
          travels.map((t, i) => (
            <div
              key={t.id}
              className={`invoice-slip  ${
                (i + 1) % 4 === 0 && i !== travels.length - 1
                  ? "invoice-page-break"
                  : ""
              }`}
            >
              <TravelInvoiceDoc data={t} />
            </div>
          ))
        )}
      </div>

      <PrintTriggerButton />
    </div>
  );
}
