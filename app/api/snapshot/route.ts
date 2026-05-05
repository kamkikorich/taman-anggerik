import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { transactions, monthlySnapshots } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, gte, lte, and } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userRole = (session.user as any).role;
    if (userRole !== 'pengerusi') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { month } = body;

    const tx = await db.query.transactions.findMany({
      where: (t, { and, gte, lt }) => and(gte(t.date, month), lt(t.date, new Date(new Date(month).getFullYear(), new Date(month).getMonth() + 1, 1).toISOString().split('T')[0])),
    });

    let bp = 0, be = 0, tp = 0, te = 0;
    for (const t of tx) {
      const a = parseFloat(t.amount);
      if (t.wallet === 'bank') { t.type === 'penerimaan' ? (bp += a) : (be += a); }
      else { t.type === 'penerimaan' ? (tp += a) : (te += a); }
    }

    const snapshot = await db.insert(monthlySnapshots).values({
      month, bankBalance: (bp - be).toString(), cashBalance: (tp - te).toString(),
      totalReceipts: (bp + tp).toString(), totalExpenses: (be + te).toString(),
      lockedAt: new Date(), lockedById: (session.user as any).id,
    }).returning();

    return NextResponse.json(snapshot[0]);
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
