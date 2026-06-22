-- Migration: 2026-06-22 Fix double-counting of internal transfers
-- Tujuan: Tandakan transaksi yang merupakan pindahan antara bank & tunai
-- sebagai kategori "Pindahan Dalaman" supaya tidak dikira dalam Jumlah
-- Penerimaan/Perbelanjaan di laporan.
--
-- Strategi: Padankan dua transaksi (satu perbelanjaan dari satu dompet,
-- satu penerimaan ke dompet lain) yang mempunyai tarikh sama dan jumlah
-- sama. Jika pasangan ditemui, label kedua-duanya sebagai pindahan.

BEGIN;

WITH candidate_pairs AS (
  SELECT
    out_tx.id AS out_id,
    in_tx.id AS in_id
  FROM transactions out_tx
  JOIN transactions in_tx
    ON out_tx.date = in_tx.date
   AND out_tx.amount = in_tx.amount
   AND out_tx.id <> in_tx.id
   AND out_tx.type = 'perbelanjaan'
   AND in_tx.type = 'penerimaan'
   AND out_tx.wallet <> in_tx.wallet
   AND (out_tx.category IS DISTINCT FROM 'Pindahan Dalaman')
   AND (in_tx.category  IS DISTINCT FROM 'Pindahan Dalaman')
)
UPDATE transactions
SET category = 'Pindahan Dalaman',
    description = COALESCE(NULLIF(description, ''), 'Pindahan antara dompet')
WHERE id IN (SELECT out_id FROM candidate_pairs UNION SELECT in_id FROM candidate_pairs);

COMMIT;