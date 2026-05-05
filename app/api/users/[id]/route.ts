import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const ROLES = ['bendahari', 'pengerusi', 'view_only', 'auditor'];

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const role = (session.user as any).role;
    if (!['bendahari', 'pengerusi'].includes(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const data: Record<string, any> = { updatedAt: new Date() };
    if (body.name) data.name = body.name;
    if (body.email) data.email = body.email;
    if (body.role && ROLES.includes(body.role)) data.role = body.role;
    if (body.password) data.password = await bcrypt.hash(body.password, 10);

    const updated = await db.update(users).set(data).where(eq(users.id, id)).returning({
      id: users.id, name: users.name, email: users.email, role: users.role,
    });
    if (!updated.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated[0]);
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const role = (session.user as any).role;
    if (!['bendahari', 'pengerusi'].includes(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    if (id === (session.user as any).id) return NextResponse.json({ error: 'Self-delete' }, { status: 400 });

    const deleted = await db.delete(users).where(eq(users.id, id)).returning();
    if (!deleted.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
