import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { formatJakartaDateLong, formatRupiah } from "@/lib/date";
import { TRAVEL_VEHICLE_LABEL } from "@/lib/labels";
import { TRAVEL_INVOICE_VENDOR } from "@/lib/travelInvoiceMeta";
import type { TravelInvoiceData } from "./TravelInvoiceDoc";

const accent = TRAVEL_INVOICE_VENDOR.accentColor;

// A4 = 595.28 x 841.89 pt. 4 slip per halaman, masing-masing ~190pt.
const SLIP_HEIGHT = 190;

const styles = StyleSheet.create({
  page: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#111111",
  },
  slip: {
    height: SLIP_HEIGHT,
    width: 450,
    paddingHorizontal: 14,
    paddingVertical: 12,
    position: "relative",
    borderBottomWidth: 1,
    borderBottomColor: "#d0d0d0",
    borderBottomStyle: "dashed",
  },
  corner: {
    position: "absolute",
    width: 10,
    height: 10,
    borderColor: accent,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  logo: { width: 46, height: 46, objectFit: "contain" },
  vendorName: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: accent,
  },
  vendorSub: { fontSize: 7, color: "#444444" },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  metaLabel: { fontFamily: "Helvetica-Bold" },
  metaRight: { alignItems: "flex-end" },
  table: {
    borderWidth: 1,
    borderColor: accent,
    marginBottom: 6,
  },
  tr: { flexDirection: "row" },
  th: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: accent,
    borderBottomWidth: 1,
    borderBottomColor: accent,
    paddingVertical: 4,
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
  },
  td: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: accent,
    paddingVertical: 4,
    textAlign: "center",
  },
  footerDate: { textAlign: "right", marginBottom: 4 },
  thanks: { textAlign: "center", color: accent, fontSize: 8 },
});

function InvoiceSlip({
  data,
  logoSrc,
}: {
  data: TravelInvoiceData;
  logoSrc: string;
}) {
  const unitPrice = Math.round(data.price / Math.max(1, data.passengerCount));
  const cols = [
    data.origin,
    data.destination,
    TRAVEL_VEHICLE_LABEL[data.vehicle] ?? data.vehicle,
    formatRupiah(unitPrice),
    String(data.passengerCount),
    formatRupiah(data.price),
  ];

  return (
    <View style={styles.slip} wrap={false}>
      <View
        style={[
          styles.corner,
          { top: 0, left: 0, borderTopWidth: 0, borderLeftWidth: 1 },
        ]}
      />
      <View
        style={[
          styles.corner,
          { top: 0, right: 0, borderTopWidth: 0, borderRightWidth: 1 },
        ]}
      />
      <View
        style={[
          styles.corner,
          { bottom: 0, left: 0, borderBottomWidth: 0, borderLeftWidth: 1 },
        ]}
      />
      <View
        style={[
          styles.corner,
          { bottom: 0, right: 0, borderBottomWidth: 0, borderRightWidth: 1 },
        ]}
      />

      <View style={styles.header}>
        <Image src={logoSrc} style={styles.logo} />
        <View>
          <Text style={styles.vendorName}>{TRAVEL_INVOICE_VENDOR.name}</Text>
          <Text style={styles.vendorSub}>{TRAVEL_INVOICE_VENDOR.address}</Text>
          <Text style={styles.vendorSub}>{TRAVEL_INVOICE_VENDOR.phone}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View>
          <Text>
            <Text style={styles.metaLabel}>No Invoice: </Text>
            {data.invoiceNo}
          </Text>
          <Text>
            <Text style={styles.metaLabel}>Nama: </Text>
            {data.customerName}
          </Text>
        </View>
        <View style={styles.metaRight}>
          <Text>
            <Text style={styles.metaLabel}>Tgl Booking: </Text>
            {formatJakartaDateLong(data.orderDate)}
          </Text>
          <Text>
            <Text style={styles.metaLabel}>Tgl Berangkat: </Text>
            {formatJakartaDateLong(data.departureDate)}
          </Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tr}>
          {["Dari", "Tujuan", "Kendaraan", "Harga", "Orang", "Total"].map(
            (h) => (
              <Text key={h} style={styles.th}>
                {h}
              </Text>
            ),
          )}
        </View>
        <View style={styles.tr}>
          {cols.map((c, i) => (
            <Text
              key={i}
              style={[
                styles.td,
                i === cols.length - 1 ? { borderRightWidth: 0 } : {},
              ]}
            >
              {c}
            </Text>
          ))}
        </View>
      </View>

      <Text style={styles.footerDate}>
        {TRAVEL_INVOICE_VENDOR.issuedCity},{" "}
        {formatJakartaDateLong(data.orderDate)}
      </Text>
      <Text style={styles.thanks}>
        Terima kasih telah menggunakan jasa kami.
      </Text>
    </View>
  );
}

const PER_PAGE = 4;

export function TravelInvoicePdfDoc({
  travels,
  logoSrc,
}: {
  travels: TravelInvoiceData[];
  logoSrc: string;
}) {
  const pages: TravelInvoiceData[][] = [];
  for (let i = 0; i < travels.length; i += PER_PAGE) {
    pages.push(travels.slice(i, i + PER_PAGE));
  }
  if (pages.length === 0) pages.push([]);

  return (
    <Document>
      {pages.map((pageItems, i) => (
        <Page key={i} size="A4" style={styles.page}>
          {pageItems.map((t, j) => (
            <InvoiceSlip key={j} data={t} logoSrc={logoSrc} />
          ))}
        </Page>
      ))}
    </Document>
  );
}
