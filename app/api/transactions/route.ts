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
    const role = (session.user as any).role;

    if (!date || !type || !amount) return NextResponse.json({ error: 'Missing' }, { status: 400 });
    if (!isValidDate(date)) return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
    if (!['penerimaan', 'perbelanjaan', 'pindahan'].includes(type)) return NextResponse.json({ error: 'Invalid type' }, { status: 400 });

    // For 'pindahan', we expect `fromWallet` and `toWallet` in body
    if (type === 'pindahan') {
      const { fromWallet, toWallet } = body;
      if (!fromWallet || !toWallet) return NextResponse.json({ error: 'Missing fromWallet/toWallet' }, { status: 400 });
      if (!['bank', 'tunai'].includes(fromWallet) || !['bank', 'tunai'].includes(toWallet)) return NextResponse.json({ error: 'Invalid fromWallet/toWallet' }, { status: 400 });
      if (fromWallet === toWallet) return NextResponse.json({ error: 'From and To wallets must differ' }, { status: 400 });

      const desc = (description || `Pindahan dari ${fromWallet} ke ${toWallet}`).trim();
      const txOut = await db.insert(transactions).values({
        date, type: 'perbelanjaan', category: 'Pindahan Dalaman',
        description: `${desc} (keluar)`, amount: amount.toString(), wallet: fromWallet,
        createdById: (session.user as any).id,
        status: ['pengerusi', 'bendahari'].includes(role) ? 'approved' : 'draft',
      }).returning();
      const txIn = await db.insert(transactions).values({
        date, type: 'penerimaan', category: 'Pindahan Dalaman',
        description: `${desc} (masuk)`, amount: amount.toString(), wallet: toWallet,
        createdById: (session.user as any).id,
        status: ['pengerusi', 'bendahari'].includes(role) ? 'approved' : 'draft',
      }).returning();

      return NextResponse.json({ transferPair: [txOut[0], txIn[0]] });
    }

    // For non-pindahan: category and wallet are required
    if (!category || !description || !wallet) return NextResponse.json({ error: 'Missing' }, { status: 400 });
    if (!['bank', 'tunai'].includes(wallet)) return NextResponse.json({ error: 'Invalid wallet' }, { status: 400 });

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });

    const newTx = await db.insert(transactions).values({
      date, type, category, description, amount: amount.toString(), wallet,
      createdById: (session.user as any).id,
      status: ['pengerusi', 'bendahari'].includes(role) ? 'approved' : 'draft',
    }).returning();
    return NextResponse.json(newTx[0]);
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
