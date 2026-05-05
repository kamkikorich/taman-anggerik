import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { transactions } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq, gte, lte } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || '2026-05-01';
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];

    // Get all transactions to calculate brought forward balance
    const allTx = await db.query.transactions.findMany({
      where: (t, { eq }) => eq(t.status, 'approved'),
      orderBy: (t, { asc }) => [asc(t.date)],
    });

    let bakiAwalBank = 0, bakiAwalTunai = 0;
    const currentPeriodTx = [];

    for (const t of allTx) {
      const a = parseFloat(t.amount);
      if (t.date < startDate) {
        if (t.wallet === 'bank') {
          t.type === 'penerimaan' ? (bakiAwalBank += a) : (bakiAwalBank -= a);
        } else {
          t.type === 'penerimaan' ? (bakiAwalTunai += a) : (bakiAwalTunai -= a);
        }
      } else if (t.date <= endDate) {
        currentPeriodTx.push(t);
      }
    }

    let bp = 0, be = 0, tp = 0, te = 0;
    for (const t of currentPeriodTx) {
      const a = parseFloat(t.amount);
      if (t.wallet === 'bank') { t.type === 'penerimaan' ? (bp += a) : (be += a); }
      else { t.type === 'penerimaan' ? (tp += a) : (te += a); }
    }

    // Get Pengerusi and Bendahari for signatures
    const pengerusi = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.role, 'pengerusi'),
      orderBy: (u, { desc }) => [desc(u.createdAt)],
    });

    const bendahari = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.role, 'bendahari'),
      orderBy: (u, { desc }) => [desc(u.createdAt)],
    });

    return NextResponse.json({
      transactions: currentPeriodTx,
      startDate, endDate,
      bakiAwalBank, bakiAwalTunai,
      bankBalance: bakiAwalBank + bp - be, 
      cashBalance: bakiAwalTunai + tp - te, 
      totalBalance: (bakiAwalBank + bp - be) + (bakiAwalTunai + tp - te),
      pengerusiName: pengerusi?.name || '___________________',
      bendahariName: bendahari?.name || '___________________',
      qrUrl: `${process.env.APP_URL || 'http://localhost:3000'}/verify?sd=${startDate}&ed=${endDate}`,
    });
  } catch (err) { 
    console.error(err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 }); 
  }
}
