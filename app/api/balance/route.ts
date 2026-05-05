import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { transactions } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const allTx = await db.query.transactions.findMany({
      where: eq(transactions.status, 'approved'),
    });

    let bp = 0, be = 0, tp = 0, te = 0;
    for (const t of allTx) {
      const a = parseFloat(t.amount);
      if (t.wallet === 'bank') { t.type === 'penerimaan' ? (bp += a) : (be += a); }
      else { t.type === 'penerimaan' ? (tp += a) : (te += a); }
    }

    return NextResponse.json({
      bank: { penerimaan: bp, perbelanjaan: be, balance: bp - be },
      tunai: { penerimaan: tp, perbelanjaan: te, balance: tp - te },
      total: (bp - be) + (tp - te),
    });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
