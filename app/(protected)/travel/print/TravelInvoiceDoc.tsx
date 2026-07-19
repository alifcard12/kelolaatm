import { formatJakartaDateLong, formatRupiah } from "@/lib/date";
import { TRAVEL_VEHICLE_LABEL } from "@/lib/labels";
import { TRAVEL_INVOICE_VENDOR } from "@/lib/travelInvoiceMeta";

export type TravelInvoiceData = {
  invoiceNo: string;
  customerName: string;
  orderDate: Date;
  departureDate: Date;
  origin: string;
  destination: string;
  vehicle: string;
  price: number;
  passengerCount: number;
};

// Satu slip invoice — didesain supaya beberapa slip bisa ditumpuk di satu
// halaman A4 lalu digunting, persis seperti format invoice 57 Tour & Travel.
export function TravelInvoiceDoc({ data }: { data: TravelInvoiceData }) {
  const unitPrice = Math.round(data.price / Math.max(1, data.passengerCount));
  const accent = TRAVEL_INVOICE_VENDOR.accentColor;

  return (
    <div
      className="relative px-6 py-5 mx-auto w-full max-w-[720px]"
      style={{ color: "#111" }}
    >
      {/* Tanda potong pojok */}
      {[
        { top: 0, left: 0, borderTop: "2px solid", borderLeft: "2px solid" },
        { top: 0, right: 0, borderTop: "2px solid", borderRight: "2px solid" },
        { bottom: 0, left: 0, borderBottom: "2px solid", borderLeft: "2px solid" },
        { bottom: 0, right: 0, borderBottom: "2px solid", borderRight: "2px solid" },
      ].map((pos, i) => (
        <span
          key={i}
          className="absolute w-3 h-3"
          style={{ ...pos, borderColor: accent } as React.CSSProperties}
        />
      ))}

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <img
          src="/branding/travel-bus.png"
          alt="Logo"
          className="mt-0.5 shrink-0"
          style={{ width: 62, height: 36, objectFit: "contain" }}
        />
        <div>
          <h1
            className="text-2xl font-extrabold leading-tight"
            style={{ color: accent }}
          >
            {TRAVEL_INVOICE_VENDOR.name}
          </h1>
          <p className="text-xs text-gray-700">{TRAVEL_INVOICE_VENDOR.address}</p>
          <p className="text-xs text-gray-700">{TRAVEL_INVOICE_VENDOR.phone}</p>
        </div>
      </div>

      {/* Meta */}
      <div className="flex justify-between text-sm mb-3 gap-4">
        <div>
          <p>
            <span className="font-bold">No Invoice:</span> {data.invoiceNo}
          </p>
          <p>
            <span className="font-bold">Nama:</span> {data.customerName}
          </p>
        </div>
        <div className="text-right">
          <p>
            <span className="font-bold">Tgl Booking:</span>{" "}
            {formatJakartaDateLong(data.orderDate)}
          </p>
          <p>
            <span className="font-bold">Tgl Berangkat:</span>{" "}
            {formatJakartaDateLong(data.departureDate)}
          </p>
        </div>
      </div>

      {/* Tabel */}
      <table
        className="w-full text-sm border-collapse mb-2"
        style={{ borderColor: accent }}
      >
        <thead>
          <tr>
            {["Dari", "Tujuan", "Kendaraan", "Harga", "Orang", "Total"].map((h) => (
              <th
                key={h}
                className="border px-2 py-1.5 font-bold text-center"
                style={{ borderColor: accent }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border px-2 py-1.5 text-center" style={{ borderColor: accent }}>
              {data.origin}
            </td>
            <td className="border px-2 py-1.5 text-center" style={{ borderColor: accent }}>
              {data.destination}
            </td>
            <td className="border px-2 py-1.5 text-center" style={{ borderColor: accent }}>
              {TRAVEL_VEHICLE_LABEL[data.vehicle] ?? data.vehicle}
            </td>
            <td className="border px-2 py-1.5 text-center whitespace-nowrap" style={{ borderColor: accent }}>
              {formatRupiah(unitPrice)}
            </td>
            <td className="border px-2 py-1.5 text-center" style={{ borderColor: accent }}>
              {data.passengerCount}
            </td>
            <td className="border px-2 py-1.5 text-center whitespace-nowrap" style={{ borderColor: accent }}>
              {formatRupiah(data.price)}
            </td>
          </tr>
        </tbody>
      </table>

      <p className="text-right text-sm mb-2">
        {TRAVEL_INVOICE_VENDOR.issuedCity}, {formatJakartaDateLong(data.orderDate)}
      </p>

      <p className="text-center text-xs" style={{ color: accent }}>
        Terima kasih telah menggunakan jasa kami.
      </p>
    </div>
  );
}
