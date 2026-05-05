'use client';

import { useEffect, useState } from 'react';

interface Transaction {
  date: string;
  description: string;
  category: string;
  amount: string;
  type: string;
  wallet: string;
}

interface ReportData {
  startDate: string;
  endDate: string;
  bankBalance: number;
  cashBalance: number;
  totalBalance: number;
  bakiAwalBank: number;
  bakiAwalTunai: number;
  pengerusiName: string;
  bendahariName: string;
  transactions: Transaction[];
}

function formatRM(amount: number) {
  return amount.toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ms-MY', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function ReportPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [printDate] = useState(() => new Date().toLocaleDateString('ms-MY', { day: '2-digit', month: 'long', year: 'numeric' }));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    fetch(`/api/report?${params}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p style={{ fontFamily: 'serif', color: '#333' }}>Menjana laporan...</p>
    </div>
  );

  if (!data) return (
    <div className="flex items-center justify-center min-h-screen">
      <p style={{ fontFamily: 'serif', color: 'red' }}>Gagal memuatkan data laporan.</p>
    </div>
  );

  const receipts = data.transactions.filter(t => t.type === 'penerimaan');
  const expenses = data.transactions.filter(t => t.type === 'perbelanjaan');
  const totalReceipts = receipts.reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalExpenses = expenses.reduce((s, t) => s + parseFloat(t.amount), 0);
  const netBalance = totalReceipts - totalExpenses;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          background: #e5e5e5;
          font-family: 'Times New Roman', Times, serif;
        }

        .print-controls {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #1e3a5f;
          color: white;
          padding: 10px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 1000;
          gap: 10px;
        }

        .btn-print {
          background: #fff;
          color: #1e3a5f;
          border: none;
          padding: 8px 20px;
          font-size: 13px;
          font-weight: bold;
          cursor: pointer;
          border-radius: 4px;
          font-family: Arial, sans-serif;
        }

        .btn-back {
          background: transparent;
          color: #fff;
          border: 1px solid #fff;
          padding: 8px 20px;
          font-size: 13px;
          cursor: pointer;
          border-radius: 4px;
          font-family: Arial, sans-serif;
          text-decoration: none;
          display: inline-block;
        }

        .page-wrapper {
          padding: 60px 20px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* A4 paper simulation */
        .a4-page {
          width: 210mm;
          min-height: 297mm;
          background: white;
          padding: 20mm 20mm 25mm 25mm;
          box-shadow: 0 4px 20px rgba(0,0,0,0.25);
          position: relative;
          font-size: 10pt;
          line-height: 1.4;
          color: #000;
        }

        /* HEADER */
        .report-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 6mm;
          padding-bottom: 4mm;
          border-bottom: 2.5pt solid #000;
        }

        .report-header img {
          width: 18mm;
          height: 18mm;
          object-fit: contain;
        }

        .header-text { flex: 1; }

        .org-name {
          font-size: 13pt;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #000;
        }

        .org-sub {
          font-size: 8.5pt;
          color: #333;
          margin-top: 2px;
        }

        .report-title-block {
          text-align: center;
          margin-bottom: 5mm;
          border-bottom: 1pt solid #000;
          padding-bottom: 4mm;
        }

        .report-main-title {
          font-size: 12pt;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .report-period {
          font-size: 9pt;
          margin-top: 3px;
          color: #333;
        }

        /* SUMMARY TABLE */
        .summary-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 5mm;
        }

        .summary-table td {
          padding: 2.5mm 3mm;
          font-size: 9.5pt;
          border: 0.75pt solid #000;
        }

        .summary-table .label { background: #f0f0f0; font-weight: bold; width: 50%; }
        .summary-table .value { text-align: right; font-family: 'Courier New', monospace; font-weight: bold; }
        .summary-table .total-row td { background: #1e3a5f; color: white; font-weight: bold; }

        /* SECTION HEADERS */
        .section-title {
          font-size: 9.5pt;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: #1e3a5f;
          color: white;
          padding: 2mm 3mm;
          margin-top: 5mm;
          margin-bottom: 0;
        }

        /* TRANSACTION TABLE */
        .tx-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 9pt;
        }

        .tx-table th {
          background: #e8e8e8;
          border: 0.75pt solid #000;
          padding: 1.5mm 2.5mm;
          font-size: 8.5pt;
          font-weight: bold;
          text-align: left;
        }

        .tx-table th.num { text-align: center; width: 8mm; }
        .tx-table th.date { width: 22mm; }
        .tx-table th.wallet { width: 24mm; }
        .tx-table th.amount { text-align: right; width: 28mm; }

        .tx-table td {
          border: 0.75pt solid #000;
          padding: 1.5mm 2.5mm;
          vertical-align: top;
        }

        .tx-table td.num { text-align: center; }
        .tx-table td.amount {
          text-align: right;
          font-family: 'Courier New', monospace;
        }

        .tx-table tr:nth-child(even) td { background: #fafafa; }

        .tx-table .subtotal td {
          background: #e8e8e8;
          font-weight: bold;
          border-top: 1.5pt solid #000;
        }

        .tx-table .subtotal .amount {
          font-family: 'Courier New', monospace;
        }

        .empty-row td {
          text-align: center;
          color: #666;
          font-style: italic;
          padding: 4mm;
        }

        /* NET BALANCE */
        .net-section {
          margin-top: 5mm;
          border: 2pt solid #000;
        }

        .net-section table {
          width: 100%;
          border-collapse: collapse;
        }

        .net-section table td {
          padding: 2mm 3mm;
          font-size: 9.5pt;
          border-bottom: 0.75pt solid #ccc;
        }

        .net-section table tr:last-child td { border-bottom: none; }
        .net-section .net-total td {
          background: #1e3a5f;
          color: white;
          font-weight: bold;
          font-size: 10.5pt;
        }

        .net-amount {
          text-align: right;
          font-family: 'Courier New', monospace;
          font-weight: bold;
        }

        /* SIGNATURES */
        .signature-section {
          margin-top: 12mm;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15mm;
        }

        .sig-block { text-align: center; }

        .sig-line {
          border-bottom: 1pt solid #000;
          height: 12mm;
          margin-bottom: 2mm;
        }

        .sig-name {
          font-size: 9pt;
          font-weight: bold;
          text-transform: uppercase;
        }

        .sig-title {
          font-size: 8pt;
          color: #555;
          margin-top: 1mm;
        }

        /* FOOTER */
        .report-footer {
          margin-top: 8mm;
          padding-top: 3mm;
          border-top: 0.75pt solid #ccc;
          display: flex;
          justify-content: space-between;
          font-size: 7.5pt;
          color: #666;
        }

        /* PRINT STYLES */
        @media print {
          @page {
            size: A4;
            margin: 0;
          }

          body { background: white; }

          .print-controls { display: none !important; }

          .page-wrapper {
            padding: 0;
          }

          .a4-page {
            width: 100%;
            min-height: 100vh;
            box-shadow: none;
            padding: 15mm 18mm 20mm 22mm;
          }
        }
      `}</style>

      {/* Print Controls Bar */}
      <div className="print-controls">
        <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px' }}>
          📄 Pratonton Cetakan — KRT Taman Anggerik Keningau
        </span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <a href="/dashboard" className="btn-back">← Kembali</a>
          <button className="btn-print" onClick={() => window.print()}>🖨️ Cetak / Simpan PDF</button>
        </div>
      </div>

      {/* A4 Page */}
      <div className="page-wrapper">
        <div className="a4-page">

          {/* HEADER */}
          <div className="report-header">
            <img src="https://i.postimg.cc/rFspMy3t/Screenshot-2026-05-04-225319.png" alt="Logo KRT" />
            <div className="header-text">
              <div className="org-name">Kawasan Rukun Tetangga Taman Anggerik Keningau</div>
              <div className="org-sub">
                No. Akaun: Bank Rakyat Keningau — 1102279328 &nbsp;|&nbsp; Sabah, Malaysia
              </div>
            </div>
          </div>

          {/* TITLE */}
          <div className="report-title-block">
            <div className="report-main-title">Penyata Penerimaan dan Perbelanjaan</div>
            <div className="report-period">
              Bagi Tempoh: {formatDate(data.startDate)} hingga {formatDate(data.endDate)}
            </div>
          </div>

          {/* SUMMARY */}
          <table className="summary-table">
            <tbody>
              <tr>
                <td className="label">Jumlah Penerimaan</td>
                <td className="value">RM {formatRM(totalReceipts)}</td>
                <td className="label">Baki Bank (Bank Rakyat)</td>
                <td className="value">RM {formatRM(data.bankBalance)}</td>
              </tr>
              <tr>
                <td className="label">Jumlah Perbelanjaan</td>
                <td className="value">RM {formatRM(totalExpenses)}</td>
                <td className="label">Baki Tunai (Wang Runcit)</td>
                <td className="value">RM {formatRM(data.cashBalance)}</td>
              </tr>
              <tr className="total-row">
                <td colSpan={2}>Lebihan / (Kurangan) Bersih Tempoh Ini</td>
                <td colSpan={2} className="value" style={{ textAlign: 'right', fontFamily: 'Courier New, monospace' }}>
                  RM {formatRM(netBalance)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* RECEIPTS */}
          <div className="section-title">A. Penerimaan (Receipts)</div>
          <table className="tx-table">
            <thead>
              <tr>
                <th className="num">Bil.</th>
                <th className="date">Tarikh</th>
                <th>Butiran / Keterangan</th>
                <th className="wallet">Dompet</th>
                <th className="amount">Jumlah (RM)</th>
              </tr>
            </thead>
            <tbody>
              {receipts.length === 0 ? (
                <tr className="empty-row"><td colSpan={5}>Tiada rekod penerimaan dalam tempoh ini.</td></tr>
              ) : (
                receipts.map((t, i) => (
                  <tr key={i}>
                    <td className="num">{i + 1}</td>
                    <td>{formatDate(t.date)}</td>
                    <td>{t.description}{t.category ? ` (${t.category})` : ''}</td>
                    <td>{t.wallet === 'bank' ? 'Bank Rakyat' : 'Tunai'}</td>
                    <td className="amount">{formatRM(parseFloat(t.amount))}</td>
                  </tr>
                ))
              )}
              <tr className="subtotal">
                <td colSpan={4} style={{ textAlign: 'right', paddingRight: '3mm' }}>JUMLAH PENERIMAAN</td>
                <td className="amount">RM {formatRM(totalReceipts)}</td>
              </tr>
            </tbody>
          </table>

          {/* EXPENSES */}
          <div className="section-title" style={{ marginTop: '6mm' }}>B. Perbelanjaan (Expenses)</div>
          <table className="tx-table">
            <thead>
              <tr>
                <th className="num">Bil.</th>
                <th className="date">Tarikh</th>
                <th>Butiran / Keterangan</th>
                <th className="wallet">Dompet</th>
                <th className="amount">Jumlah (RM)</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr className="empty-row"><td colSpan={5}>Tiada rekod perbelanjaan dalam tempoh ini.</td></tr>
              ) : (
                expenses.map((t, i) => (
                  <tr key={i}>
                    <td className="num">{i + 1}</td>
                    <td>{formatDate(t.date)}</td>
                    <td>{t.description}{t.category ? ` (${t.category})` : ''}</td>
                    <td>{t.wallet === 'bank' ? 'Bank Rakyat' : 'Tunai'}</td>
                    <td className="amount">{formatRM(parseFloat(t.amount))}</td>
                  </tr>
                ))
              )}
              <tr className="subtotal">
                <td colSpan={4} style={{ textAlign: 'right', paddingRight: '3mm' }}>JUMLAH PERBELANJAAN</td>
                <td className="amount">RM {formatRM(totalExpenses)}</td>
              </tr>
            </tbody>
          </table>

          {/* NET BALANCE */}
          <div className="net-section" style={{ marginTop: '6mm' }}>
            <table>
              <tbody>
                <tr>
                  <td style={{ width: '60%' }}>Baki Awal Tempoh</td>
                  <td className="net-amount">RM {formatRM(data.bakiAwalBank + data.bakiAwalTunai)}</td>
                </tr>
                <tr>
                  <td>Tambah: Jumlah Penerimaan</td>
                  <td className="net-amount">RM {formatRM(totalReceipts)}</td>
                </tr>
                <tr>
                  <td>Tolak: Jumlah Perbelanjaan</td>
                  <td className="net-amount">(RM {formatRM(totalExpenses)})</td>
                </tr>
                <tr className="net-total">
                  <td>BAKI AKHIR TEMPOH (RM {formatRM(data.bakiAwalBank + data.bakiAwalTunai)} + RM {formatRM(netBalance)})</td>
                  <td className="net-amount">RM {formatRM(data.totalBalance)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SIGNATURES */}
          <div className="signature-section">
            <div className="sig-block">
              <div className="sig-line"></div>
              <div className="sig-name">{data.pengerusiName}</div>
              <div className="sig-title">Pengerusi KRT Taman Anggerik Keningau</div>
              <div className="sig-title">Tarikh: ___________________</div>
            </div>
            <div className="sig-block">
              <div className="sig-line"></div>
              <div className="sig-name">{data.bendahariName}</div>
              <div className="sig-title">Bendahari KRT Taman Anggerik Keningau</div>
              <div className="sig-title">Tarikh: ___________________</div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="report-footer">
            <span>Laporan ini dijana secara automatik oleh Sistem Pengurusan Kewangan KRT.</span>
            <span>Dicetak pada: {printDate}</span>
          </div>

        </div>
      </div>
    </>
  );
}
