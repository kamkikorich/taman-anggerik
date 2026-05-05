import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { transactions } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { isValidDate } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const sd = searchParams.get('startDate'), ed = searchParams.get('endDate');
    const w = searchParams.get('wallet');
    const ty = searchParams.get('type');

    const all = await db.query.transactions.findMany({
      with: { createdBy: true, approvedBy: true },
      orderBy: (t: any, { asc }: any) => [asc(t.date)],
    });

    let bf = 0;
    let filtered = all as any[];

    if (sd) {
      for (const t of all) {
        if (t.date < sd) {
          // If filtering by wallet, only count BF for that wallet
          if (w && t.wallet !== w) continue;
          
          const amt = parseFloat(t.amount);
          if (t.type === 'penerimaan') bf += amt;
          else bf -= amt;
        }
      }
      filtered = filtered.filter((t: any) => t.date >= sd);
    }
    
    if (ed) filtered = filtered.filter((t: any) => t.date <= ed);
    if (w) filtered = filtered.filter((t: any) => t.wallet === w);
    if (ty) filtered = filtered.filter((t: any) => t.type === ty);

    // Return descending for display
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ transactions: filtered, broughtForward: bf });
  } catch (err) { 
    console.error(err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 }); 
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { date, type, category, description, amount, wallet } = body;
    if (!date || !type || !category || !description || !amount || !wallet) return NextResponse.json({ error: 'Missing' }, { status: 400 });
    if (!isValidDate(date)) return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
    if (!['penerimaan', 'perbelanjaan'].includes(type)) return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    if (!['bank', 'tunai'].includes(wallet)) return NextResponse.json({ error: 'Invalid wallet' }, { status: 400 });

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });

    const role = (session.user as any).role;
    const newTx = await db.insert(transactions).values({
      date, type, category, description, amount: amount.toString(), wallet,
      createdById: (session.user as any).id,
      status: ['pengerusi', 'bendahari'].includes(role) ? 'approved' : 'draft',
    }).returning();
    return NextResponse.json(newTx[0]);
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
