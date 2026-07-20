import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Link,
} from "@react-pdf/renderer";
import {
  formatJakartaDateLong,
  formatJakartaDateDMY,
  formatRupiah,
} from "@/lib/date";

// Data ini diambil dari database (Prisma), bukan dari file meta statis.
export type HotelInvoiceData = {
  bookingNo: string;
  poBooking: string;
  bookingDate: Date;
  paymentMethod: string;
  transactionStatus: string;
  customerName: string;
  email: string;
  phone: string;
  hotelName: string;
  hotelAddress: string;
  checkInDate: Date;
  duration: number;
  roomType: string;
  guestCount: number;
  price: number;
  totalPrice: number;
};

const BLUE = "#0194f3";
const GRAY_BG = "#f3f4f6"; // tailwind bg-gray-100
const BORDER = "#e5e7eb"; // tailwind border-gray-200

const styles = StyleSheet.create({
  page: {
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#000000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
    paddingTop: 26,
    paddingLeft: 38,
    paddingRight: 38,
    position: "relative",
  },
  headerLeft: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  headerBar: {
    width: 4,
    height: 50,
    borderRadius: 4,
    backgroundColor: BLUE,
    marginTop: 2,
  },
  headerTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: -0.2,
  },
  headerMeta: { fontSize: 10, fontFamily: "Helvetica-Bold", marginTop: 2 },
  logo: { width: 130, height: 39, objectFit: "contain" },

  sectionBar: {
    backgroundColor: GRAY_BG,
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginHorizontal: 38,
    marginBottom: 4,
  },

  paymentRow: {
    flexDirection: "row",
    marginBottom: 16,
    paddingHorizontal: 8,
    marginHorizontal: 38,
    fontSize: 8,
    letterSpacing: 0.3,
    justifyContent: "space-between",
  },

  twoColWrap: { paddingHorizontal: 38, marginTop: 22 },
  twoColBarRow: {
    backgroundColor: GRAY_BG,
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 8,
    marginBottom: 4,
    flexDirection: "row",
  },
  twoColBarRight: { marginLeft: 210 },
  twoColBody: { flexDirection: "row" },
  colLeft: { fontSize: 8, width: 267, paddingRight: 8, marginLeft: 8 },
  colRight: { fontSize: 8, width: 267, marginLeft: 20 },
  kvRow: { flexDirection: "row", marginBottom: 2 },
  kvLabelShort: { width: 55 },
  kvLabelLong: { width: 55 },
  kvColon: { width: 8 },
  kvValue: { flex: 1 },

  guestSection: { marginBottom: 22, paddingHorizontal: 38, marginTop: -1 },
  guestName: {
    paddingHorizontal: 8,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },

  hotelSection: { marginBottom: 16, paddingHorizontal: 38 },
  hotelBody: {
    paddingHorizontal: 8,
    paddingTop: 4,
    fontSize: 8,
    lineHeight: 1.3,
  },
  hotelName: { fontFamily: "Helvetica-Bold" },

  itemsSection: { marginBottom: 16, paddingHorizontal: 38 },
  table: { fontSize: 8 },
  theadRow: { flexDirection: "row" },
  th: {
    borderColor: BORDER,
    borderWidth: 1.2,
    paddingHorizontal: 4,
    paddingVertical: 8,
    justifyContent: "center",
  },
  thText: { fontSize: 8 },
  td: {
    borderColor: BORDER,
    borderWidth: 1.2,
    paddingHorizontal: 4,
    paddingVertical: 4,
    justifyContent: "center",
  },
  tdRight: { textAlign: "right" },
  tdBold: { fontFamily: "Helvetica-Bold" },
  colNo: { width: 24 },
  colJenis: { width: 78 },
  colDeskripsi: { width: 210 },
  colJml: { width: 25 },
  colHarga: { flex: 1 },
  colTotal: { width: 78 },

  footer: { marginTop: 24 },
  paidLogoWrap: { marginTop: 24, paddingBottom: 20, paddingHorizontal: 38 },
  paidLogo: { width: 110, height: 80, objectFit: "contain" },
  helpWrap: { marginTop: 16, alignItems: "center" },
  helpRow: { flexDirection: "row", fontSize: 8, alignItems: "center" },
  helpLink: { color: BLUE },
  tncBar: {
    backgroundColor: BLUE,
    color: "#ffffff",
    paddingVertical: 6,
    marginTop: 8,
    fontSize: 8.5,
    textAlign: "center",
    width: "100%",
  },
});

function HotelInvoicePage({
  data,
  logoSrc,
  paidLogoSrc,
}: {
  data: HotelInvoiceData;
  logoSrc: string;
  paidLogoSrc: string;
}) {
  return (
    <Page size="A4" style={styles.page}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerBar} />
          <View>
            <Text style={styles.headerTitle}>BUKTI PEMBELIAN (RECEIPT)</Text>
            <Text style={styles.headerMeta}>Nomor : #{data.bookingNo}</Text>
            <Text style={styles.headerMeta}>
              Tanggal : {formatJakartaDateLong(data.bookingDate)}
            </Text>
          </View>
        </View>
        <Image src={logoSrc} style={styles.logo} />
      </View>

      {/* DETAIL PEMBAYARAN */}
      <Text style={styles.sectionBar}>DETAIL PEMBAYARAN</Text>
      <View style={styles.paymentRow}>
        <Text>P.O. NUMBER: {data.poBooking}</Text>
        <Text>PEMBELIAN MELALUI: {data.paymentMethod}</Text>
        <Text>DETAIL TRANSAKSI: Lunas</Text>
      </View>

      {/* DATA PEMESAN / DETAIL PERUSAHAAN */}
      <View style={styles.twoColWrap}>
        <View style={styles.twoColBarRow}>
          <Text>DATA PEMESAN</Text>
          <Text style={styles.twoColBarRight}>DETAIL PERUSAHAAN</Text>
        </View>
        <View style={styles.twoColBody}>
          <View style={styles.colLeft}>
            <View style={styles.kvRow}>
              <Text style={styles.kvLabelShort}>Nama</Text>
              <Text style={styles.kvColon}>:</Text>
              <Text style={styles.kvValue}>{data.customerName}</Text>
            </View>
            <View style={styles.kvRow}>
              <Text style={styles.kvLabelShort}>Email</Text>
              <Text style={styles.kvColon}>:</Text>
              <Text style={styles.kvValue}>{data.email}</Text>
            </View>
            <View style={styles.kvRow}>
              <Text style={styles.kvLabelShort}>No. Kontak</Text>
              <Text style={styles.kvColon}>:</Text>
              <Text style={styles.kvValue}>{data.phone}</Text>
            </View>
          </View>
          <View style={styles.colRight}>
            <View style={styles.kvRow}>
              <Text style={styles.kvLabelLong}>Nama</Text>
              <Text style={styles.kvColon}>:</Text>
              <Text style={styles.kvValue}>Trinusa Travelindo</Text>
            </View>
            <View style={styles.kvRow}>
              <Text style={styles.kvLabelLong}>NPWP</Text>
              <Text style={styles.kvColon}>:</Text>
              <Text style={styles.kvValue}>31.616.320.3-031.000</Text>
            </View>
            <View style={styles.kvRow}>
              <Text style={styles.kvLabelLong}>Alamat</Text>
              <Text style={styles.kvColon}>:</Text>
              <Text style={styles.kvValue}>
                Traveloka Campus [d/h Green Office Park 1] South Tower Lantai 2
                Zone 10, Jl. Grand Boulevard BSD Green Office Park Sampora,
                Cisauk, Kab Tangerang, Banten 15345
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* TAMU */}
      <View style={styles.guestSection}>
        <Text style={styles.sectionBar}>TAMU</Text>
        <Text style={styles.guestName}>{data.customerName}</Text>
      </View>

      {/* DETAIL HOTEL */}
      <View style={styles.hotelSection}>
        <Text style={styles.sectionBar}>DETAIL HOTEL</Text>
        <View style={styles.hotelBody}>
          <Text style={styles.hotelName}>{data.hotelName}</Text>
          <Text>Alamat: {data.hotelAddress}</Text>
          <Text>Check-in: {formatJakartaDateDMY(data.checkInDate)}</Text>
          <Text>Durasi: {data.duration} malam</Text>
        </View>
      </View>

      {/* DETAIL PEMBELIAN */}
      <View style={styles.itemsSection}>
        <Text style={styles.sectionBar}>DETAIL PEMBELIAN</Text>
        <View style={styles.table}>
          <View style={styles.theadRow}>
            <View style={[styles.th, styles.colNo]}>
              <Text style={styles.thText}>No.</Text>
            </View>
            <View style={[styles.th, styles.colJenis]}>
              <Text style={styles.thText}>Jenis Barang</Text>
            </View>
            <View style={[styles.th, styles.colDeskripsi]}>
              <Text style={styles.thText}>Deskripsi</Text>
            </View>
            <View style={[styles.th, styles.colJml]}>
              <Text style={styles.thText}>Jml</Text>
            </View>
            <View style={[styles.th, styles.colHarga]}>
              <Text style={styles.thText}>Harga satuan Rp</Text>
            </View>
            <View style={[styles.th, styles.colTotal]}>
              <Text style={styles.thText}>Total Rp</Text>
            </View>
          </View>

          <View style={styles.theadRow}>
            <View style={[styles.td, styles.colNo]}>
              <Text>1</Text>
            </View>
            <View style={[styles.td, styles.colJenis]}>
              <Text style={styles.tdBold}>Akomodasi</Text>
            </View>
            <View style={[styles.td, styles.colDeskripsi]}>
              <Text>
                {data.hotelName}, {data.roomType} - {data.guestCount} tamu
              </Text>
            </View>
            <View style={[styles.td, styles.colJml]}>
              <Text style={styles.tdRight}>{data.duration}</Text>
            </View>
            <View style={[styles.td, styles.colHarga]}>
              <Text style={styles.tdRight}>{formatRupiah(data.price)}</Text>
            </View>
            <View style={[styles.td, styles.colTotal]}>
              <Text style={styles.tdRight}>
                {formatRupiah(data.price * data.duration)}
              </Text>
            </View>
          </View>

          <View style={styles.theadRow}>
            <View
              style={[styles.td, { width: 24 + 78 + 210 + 25, borderWidth: 0 }]}
            />
            <View style={[styles.td, styles.colHarga]}>
              <Text>TOTAL</Text>
            </View>
            <View style={[styles.td, styles.colTotal]}>
              <Text style={styles.tdRight}>
                {formatRupiah(data.price * data.duration)}
              </Text>
            </View>
          </View>

          <View style={styles.theadRow}>
            <View
              style={[styles.td, { width: 24 + 78 + 210 + 25, borderWidth: 0 }]}
            />
            <View style={[styles.td, styles.colHarga]}>
              <Text style={styles.tdBold}>JUMLAH PEMBAYARAN</Text>
            </View>
            <View style={[styles.td, styles.colTotal]}>
              <Text style={[styles.tdRight, styles.tdBold]}>
                {formatRupiah(data.price * data.duration)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <View style={styles.paidLogoWrap}>
          <Image src={paidLogoSrc} style={styles.paidLogo} />
        </View>

        <View style={styles.helpWrap}>
          <View style={styles.helpRow}>
            <Text>
              Untuk pertanyaan apa pun, kunjungi Traveloka Help Center:{" "}
            </Text>
            <Link src="https://www.traveloka.com/help" style={styles.helpLink}>
              www.traveloka.com/help
            </Link>
          </View>
          <Text style={styles.tncBar}>
            Syarat dan Ketentuan berlaku. Silakan lihat
            http://www.traveloka.com/termsandconditions
          </Text>
        </View>
      </View>
    </Page>
  );
}

export function HotelInvoicePdfDoc({
  hotels,
  logoSrc,
  paidLogoSrc,
}: {
  hotels: HotelInvoiceData[];
  logoSrc: string;
  paidLogoSrc: string;
}) {
  const pages = hotels.length > 0 ? hotels : [];
  return (
    <Document>
      {pages.length === 0 ? (
        <Page size="A4" style={styles.page}>
          <Text>Tidak ada data hotel untuk dicetak.</Text>
        </Page>
      ) : (
        pages.map((h, i) => (
          <HotelInvoicePage
            key={i}
            data={h}
            logoSrc={logoSrc}
            paidLogoSrc={paidLogoSrc}
          />
        ))
      )}
    </Document>
  );
}
