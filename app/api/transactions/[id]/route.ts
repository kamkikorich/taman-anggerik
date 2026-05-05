import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { transactions } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { isValidDate } from '@/lib/utils';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const tx = await db.query.transactions.findFirst({ where: eq(transactions.id, id), with: { createdBy: true, approvedBy: true } });
    if (!tx) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(tx);
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = (session.user as any).role;
    if (!['bendahari', 'pengerusi'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const data: Record<string, any> = { updatedAt: new Date() };
    if (body.date && !isValidDate(body.date)) return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
    if (body.date) data.date = body.date;
    if (body.type) data.type = body.type;
    if (body.category) data.category = body.category;
    if (body.description) data.description = body.description;
    if (body.amount) data.amount = body.amount.toString();
    if (body.wallet) data.wallet = body.wallet;
    if (body.status) data.status = body.status;

    const updated = await db.update(transactions).set(data).where(eq(transactions.id, id)).returning();
    if (!updated.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated[0]);
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = (session.user as any).role;
    if (role !== 'bendahari') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const deleted = await db.delete(transactions).where(eq(transactions.id, id)).returning();
    if (!deleted.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
