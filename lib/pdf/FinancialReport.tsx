import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import QRCode from 'qrcode';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: 'Helvetica' },
  header: { textAlign: 'center', marginBottom: 15 },
  logo: { width: 60, height: 60, alignSelf: 'center', marginBottom: 5 },
  title: { fontSize: 14, marginBottom: 2 },
  subtitle: { fontSize: 10, marginBottom: 4 },
  info: { marginBottom: 12, fontSize: 10 },
  table: { display: 'flex', flexDirection: 'row', gap: 10 },
  col: { flex: 1 },
  colHeader: { fontSize: 11, backgroundColor: '#f3f4f6', padding: 4, marginBottom: 5, textAlign: 'center' },
  row: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#e5e7eb', paddingVertical: 3 },
  cell: { flex: 1, fontSize: 8 },
  totalRow: { flexDirection: 'row', paddingVertical: 6, borderTopWidth: 1.5, borderTopColor: '#000', marginTop: 5 },
  totalCell: { flex: 1, fontSize: 10 },
  footer: { marginTop: 40, flexDirection: 'row', justifyContent: 'space-around' },
  signature: { textAlign: 'center', width: 150 },
  qr: { width: 60, height: 60, alignSelf: 'center', marginTop: 10 },
  balanceBox: { marginTop: 20, padding: 10, borderTopWidth: 1, borderTopColor: '#eee' },
  balanceItem: { fontSize: 11, marginBottom: 2 },
});

export default function FinancialReport({ transactions, startDate, endDate, bakiAwalBank, bakiAwalTunai, bankBalance, cashBalance, totalBalance }: any) {
  const penerimaan = transactions.filter((t: any) => t.type === 'penerimaan');
  const perbelanjaan = transactions.filter((t: any) => t.type === 'perbelanjaan');

  const totalPenerimaan = penerimaan.reduce((s: number, t: any) => s + parseFloat(t.amount), 0);
  const totalPerbelanjaan = perbelanjaan.reduce((s: number, t: any) => s + parseFloat(t.amount), 0);
  const bakiAwalTotal = (bakiAwalBank || 0) + (bakiAwalTunai || 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image src="https://i.postimg.cc/rFspMy3t/Screenshot-2026-05-04-225319.png" style={styles.logo} />
          <Text style={styles.title}>PENYATA PENERIMAAN DAN PERBELANJAAN</Text>
          <Text style={styles.subtitle}>KRT TAMAN ANGGERIK KENINGAU BAGI {startDate} HINGGA {endDate}</Text>
        </View>

        <View style={styles.info}>
          <Text>NAMA RT : KRT TAMAN ANGGERIK KENINGAU</Text>
          <Text>NAMA BANK : BANK RAKYAT KENINGAU | NO AKAUN : 1102279328</Text>
          <Text style={{ marginTop: 4, fontWeight: 'bold' }}>BAKI BAWA KE HADAPAN : RM {bakiAwalTotal.toFixed(2)} (Bank: RM{bakiAwalBank.toFixed(2)}, Tunai: RM{bakiAwalTunai.toFixed(2)})</Text>
        </View>

        <View style={styles.table}>
          {/* PENERIMAAN COL */}
          <View style={styles.col}>
            <Text style={styles.colHeader}>PENERIMAAN (DEBIT)</Text>
            <View style={{ flexDirection: 'row', borderBottomWidth: 1, paddingBottom: 2, marginBottom: 4 }}>
              <Text style={{ flex: 1, fontSize: 7, fontWeight: 'bold' }}>TARIKH</Text>
              <Text style={{ flex: 2, fontSize: 7, fontWeight: 'bold' }}>BUTIRAN</Text>
              <Text style={{ flex: 1, fontSize: 7, fontWeight: 'bold', textAlign: 'right' }}>JUMLAH</Text>
            </View>
            
            {/* Show Brought Forward as first row if needed, or just keep it in info */}
            {penerimaan.map((t: any, i: number) => (
              <View key={i} style={styles.row}>
                <Text style={{ flex: 1, fontSize: 7 }}>{t.date}</Text>
                <Text style={{ flex: 2, fontSize: 7 }}>{t.description}</Text>
                <Text style={{ flex: 1, fontSize: 7, textAlign: 'right' }}>{parseFloat(t.amount).toFixed(2)}</Text>
              </View>
            ))}
            
            <View style={styles.totalRow}>
              <Text style={styles.totalCell}>JUMLAH PENERIMAAN</Text>
              <Text style={{ ...styles.totalCell, textAlign: 'right' }}>
                RM {totalPenerimaan.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* PERBELANJAAN COL */}
          <View style={styles.col}>
            <Text style={styles.colHeader}>PERBELANJAAN (KREDIT)</Text>
            <View style={{ flexDirection: 'row', borderBottomWidth: 1, paddingBottom: 2, marginBottom: 4 }}>
              <Text style={{ flex: 1, fontSize: 7, fontWeight: 'bold' }}>TARIKH</Text>
              <Text style={{ flex: 2, fontSize: 7, fontWeight: 'bold' }}>BUTIRAN</Text>
              <Text style={{ flex: 1, fontSize: 7, fontWeight: 'bold', textAlign: 'right' }}>JUMLAH</Text>
            </View>
            {perbelanjaan.map((t: any, i: number) => (
              <View key={i} style={styles.row}>
                <Text style={{ flex: 1, fontSize: 7 }}>{t.date}</Text>
                <Text style={{ flex: 2, fontSize: 7 }}>{t.description}</Text>
                <Text style={{ flex: 1, fontSize: 7, textAlign: 'right' }}>{parseFloat(t.amount).toFixed(2)}</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalCell}>JUMLAH PERBELANJAAN</Text>
              <Text style={{ ...styles.totalCell, textAlign: 'right' }}>
                RM {totalPerbelanjaan.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.balanceBox}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={styles.balanceItem}>Baki Bawa Ke Hadapan</Text>
            <Text style={styles.balanceItem}>RM {bakiAwalTotal.toFixed(2)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={styles.balanceItem}>Tambah: Jumlah Penerimaan</Text>
            <Text style={styles.balanceItem}>RM {totalPenerimaan.toFixed(2)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={styles.balanceItem}>Tolak: Jumlah Perbelanjaan</Text>
            <Text style={styles.balanceItem}>RM {totalPerbelanjaan.toFixed(2)}</Text>
          </View>
          
          <View style={{ borderTopWidth: 1, paddingTop: 5, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold' }}>BAKI AKHIR PADA {endDate}</Text>
            <Text style={{ fontSize: 12, fontWeight: 'bold' }}>RM {totalBalance.toFixed(2)}</Text>
          </View>
          
          <View style={{ marginTop: 10, borderTopWidth: 0.5, borderTopColor: '#eee', paddingTop: 5 }}>
            <Text style={{ fontSize: 8, color: '#666' }}>Pecahan Baki: Bank (RM {bankBalance.toFixed(2)}) | Tunai (RM {cashBalance.toFixed(2)})</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.signature}>
            <Text style={{ fontSize: 8 }}>Disediakan Oleh:</Text>
            <Text style={{ marginTop: 25 }}>_______________________</Text>
            <Text style={{ marginTop: 5, fontWeight: 'bold' }}>RAMLAH BINTI JALI</Text>
            <Text style={{ fontSize: 7 }}>Bendahari KRT</Text>
          </View>
          <View style={styles.signature}>
            <Text style={{ fontSize: 8 }}>Disahkan Oleh:</Text>
            <Text style={{ marginTop: 25 }}>_______________________</Text>
            <Text style={{ marginTop: 5, fontWeight: 'bold' }}>KENNEDY MATTAH</Text>
            <Text style={{ fontSize: 7 }}>Pengerusi KRT</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
