import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const role = (session.user as any).role;
    if (!['bendahari', 'pengerusi'].includes(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const all = await db.query.users.findMany({
      columns: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: (u: any, { desc }: any) => [desc(u.createdAt)],
    });
    return NextResponse.json(all);
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const role = (session.user as any).role;
    if (!['bendahari', 'pengerusi'].includes(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { name, email, password, role: userRole } = body;
    if (!name || !email || !password || !userRole) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const allowed = ['bendahari', 'pengerusi', 'view_only', 'auditor'];
    if (!allowed.includes(userRole)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 });

    const existing = await db.query.users.findFirst({ where: (u: any, { eq }: any) => eq(u.email, email) });
    if (existing) return NextResponse.json({ error: 'Email exists' }, { status: 400 });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await db.insert(users).values({ name, email, password: hashed, role: userRole }).returning();
    return NextResponse.json(newUser[0]);
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
