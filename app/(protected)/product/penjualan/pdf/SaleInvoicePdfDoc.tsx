import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { formatJakartaDate, formatRupiah } from "@/lib/date";
import { SALE_INVOICE_VENDOR } from "@/lib/saleInvoiceMeta";

const accent = SALE_INVOICE_VENDOR.accentColor;

export type SaleInvoiceItem = {
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type SaleInvoiceData = {
  invoiceNo: string;
  customerName: string;
  saleDate: Date;
  totalAmount: number;
  items: SaleInvoiceItem[];
};

// Berapa nota yang dimuat dalam 1 halaman A4.
const SLIPS_PER_PAGE = 3;

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    paddingVertical: 16,
    paddingHorizontal: 14,
    fontSize: 7.5,
    fontFamily: "Helvetica",
    color: "#111111",
  },
  slip: {
    width: 400,
    flex: 1,
    position: "relative",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  slipDivider: {
    borderTopWidth: 1,
    borderTopColor: "#A7A7A7",
    borderStyle: "dashed",
  },
  emptySlot: {
    flex: 1,
  },
  corner: {
    position: "absolute",
    width: 8,
    height: 8,
    borderColor: "#A7A7A7",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logo: { width: 34, height: 34, objectFit: "contain" },
  vendorName: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: accent,
  },
  vendorTagline: { fontSize: 6.5, color: "#444444", marginTop: 1 },
  vendorSub: { fontSize: 6.5, color: "#444444" },
  metaBlock: { alignItems: "flex-end" },
  metaLine: { flexDirection: "row", marginBottom: 1 },
  metaLabel: { fontFamily: "Helvetica-Bold", width: 32 },
  table: {
    flex: 1,
    flexDirection: "column",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: "#111111",
    marginBottom: 4,
  },
  tr: { flexDirection: "row" },
  th: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#111111",
    paddingVertical: 3,
    paddingHorizontal: 3,
    justifyContent: "center",
  },
  thText: {
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },
  td: {
    borderRightWidth: 1,
    borderColor: "#111111",
    paddingVertical: 3,
    paddingHorizontal: 3,
    justifyContent: "center",
  },
  tdFillerRow: { flex: 1 },
  totalRow: { flexDirection: "row" },
  totalLabelCell: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopWidth: 1.5,
    borderColor: "#111111",
    paddingVertical: 3,
    paddingHorizontal: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  totalLabelText: { fontFamily: "Helvetica-Bold", textAlign: "center" },
  totalValueCell: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopWidth: 1.5,
    borderColor: "#111111",
    paddingVertical: 3,
    paddingHorizontal: 3,
    justifyContent: "center",
  },
  totalValueText: { fontFamily: "Helvetica-Bold" },
  footerNote: { fontSize: 6, color: "#111111", marginTop: 10 },
});

// Lebar kolom TETAP supaya header & body selalu sejajar.
// [Qty, Nama Barang, Harga Satuan, Jumlah]
const COL_WIDTHS = [32, 226, 90, 90];

function InvoiceSlip({
  data,
  logoSrc,
  isFirst,
}: {
  data: SaleInvoiceData;
  logoSrc: string;
  isFirst: boolean;
}) {
  return (
    <View style={[styles.slip, ...(isFirst ? [] : [styles.slipDivider])]}>
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
        <View style={styles.headerLeft}>
          <Image src={logoSrc} style={styles.logo} />
          <View>
            <Text style={styles.vendorName}>{SALE_INVOICE_VENDOR.name}</Text>
            <Text style={styles.vendorTagline}>
              {SALE_INVOICE_VENDOR.tagline}
            </Text>
            <Text style={styles.vendorSub}>{SALE_INVOICE_VENDOR.address}</Text>
            <Text style={styles.vendorSub}>{SALE_INVOICE_VENDOR.phone}</Text>
          </View>
        </View>

        <View style={styles.metaBlock}>
          <View style={styles.metaLine}>
            <Text style={styles.metaLabel}>Tgl.</Text>
            <Text>: {formatJakartaDate(data.saleDate)}</Text>
          </View>
          <View style={styles.metaLine}>
            <Text style={styles.metaLabel}>Nama</Text>
            <Text>: {data.customerName}</Text>
          </View>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tr}>
          {["Qty", "Nama Barang", "Harga Satuan", "Jumlah"].map((h, i) => (
            <View key={h} style={[styles.th, { width: COL_WIDTHS[i] }]}>
              <Text style={styles.thText}>{h}</Text>
            </View>
          ))}
        </View>
        {data.items.map((item, idx) => (
          <View key={idx} style={styles.tr}>
            <View style={[styles.td, { width: COL_WIDTHS[0] }]}>
              <Text style={{ textAlign: "center" }}>{item.quantity}</Text>
            </View>
            <View style={[styles.td, { width: COL_WIDTHS[1] }]}>
              <Text>{item.productName}</Text>
            </View>
            <View style={[styles.td, { width: COL_WIDTHS[2] }]}>
              <Text>{formatRupiah(item.unitPrice)}</Text>
            </View>
            <View style={[styles.td, { width: COL_WIDTHS[3] }]}>
              <Text>{formatRupiah(item.subtotal)}</Text>
            </View>
          </View>
        ))}
        {/* Baris pengisi kosong (flex), mengisi sisa ruang tabel supaya tinggi nota konsisten */}
        <View style={[styles.tr, styles.tdFillerRow]}>
          <View style={[styles.td, { width: COL_WIDTHS[0] }]}>
            <Text> </Text>
          </View>
          <View style={[styles.td, { width: COL_WIDTHS[1] }]}>
            <Text> </Text>
          </View>
          <View style={[styles.td, { width: COL_WIDTHS[2] }]}>
            <Text> </Text>
          </View>
          <View style={[styles.td, { width: COL_WIDTHS[3] }]}>
            <Text> </Text>
          </View>
        </View>
        <View style={styles.totalRow}>
          <View
            style={[
              styles.totalLabelCell,
              { width: COL_WIDTHS[0] + COL_WIDTHS[1] + COL_WIDTHS[2] },
            ]}
          >
            <Text style={styles.totalLabelText}>Total</Text>
          </View>
          <View style={[styles.totalValueCell, { width: COL_WIDTHS[3] }]}>
            <Text style={styles.totalValueText}>
              {formatRupiah(data.totalAmount)}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.footerNote}>{SALE_INVOICE_VENDOR.footerNote}</Text>
    </View>
  );
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

export function SaleInvoicePdfDoc({
  sales,
  logoSrc,
}: {
  sales: SaleInvoiceData[];
  logoSrc: string;
}) {
  const groups = chunk(sales, SLIPS_PER_PAGE);

  return (
    <Document>
      {groups.map((group, gi) => (
        <Page key={gi} size="A4" style={styles.page}>
          {Array.from({ length: SLIPS_PER_PAGE }).map((_, idx) => {
            const sale = group[idx];
            if (!sale) {
              // Slot kosong: tetap punya flex:1 supaya tinggi nota
              // di atasnya tidak melar, meski halaman belum penuh 3 nota.
              return <View key={idx} style={styles.emptySlot} />;
            }
            return (
              <InvoiceSlip
                key={idx}
                data={sale}
                logoSrc={logoSrc}
                isFirst={idx === 0}
              />
            );
          })}
        </Page>
      ))}
      {groups.length === 0 && (
        <Page size="A4" style={styles.page}>
          <Text>Tidak ada data penjualan.</Text>
        </Page>
      )}
    </Document>
  );
}
