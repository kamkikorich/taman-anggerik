import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { transactions } from '@/lib/db/schema';
import { sql, and, eq, ne, isNotNull } from 'drizzle-orm';

// One-shot migration: label paired transfer transactions (same date, same amount,
// one perbelanjaan + one penerimaan, different wallets) as 'Pindahan Dalaman'.
// Only Pengerusi or Bendahari can trigger it.
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const role = (session.user as any).role;
    if (!['pengerusi', 'bendahari'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result = await db.execute(sql`
      WITH candidate_pairs AS (
        SELECT out_tx.id AS out_id, in_tx.id AS in_id
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
      WHERE id IN (SELECT out_id FROM candidate_pairs UNION SELECT in_id FROM candidate_pairs)
      RETURNING id
    `);

    const count = (result as any)?.length ?? (result as any)?.rowCount ?? 0;

    const { rows: summary } = await db.execute(sql`
      SELECT COUNT(*)::int AS pindahan_count FROM transactions WHERE category = 'Pindahan Dalaman'
    `) as any;

    return NextResponse.json({
      success: true,
      updatedNow: count,
      totalPindahanRows: (summary as any)?.[0]?.pindahan_count ?? 0,
    });
  } catch (err: any) {
    console.error('Migration error:', err);
    return NextResponse.json({ error: 'Failed', detail: String(err) }, { status: 500 });
  }
}