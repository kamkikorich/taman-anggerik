import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { users, transactions, monthlySnapshots } from '../lib/db/schema';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding database...');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const db = drizzle(pool);

  // Create default user - Bendahari
  const hashedPassword = await bcrypt.hash(process.env.DEFAULT_PASSWORD || 'SilaTukarKatalaluanIni123!', 10);

  const [bendahari] = await db.insert(users).values([
    {
      name: 'Justinah Binti Buki',
      email: 'bendahari@waju.my',
      password: hashedPassword,
      role: 'bendahari',
    },
  ]).returning();

  console.log(`✅ Created user: ${bendahari.name} (Bendahari)`);

  // Create opening balances transaction
  await db.insert(transactions).values([
    {
      date: '2026-05-01',
      type: 'penerimaan',
      category: 'Baki Awal',
      description: 'Baki Akhir ditangan (dari rekod manual 30 April 2026)',
      amount: '44.38',
      wallet: 'tunai',
      status: 'approved',
      createdById: bendahari.id,
      approvedById: bendahari.id,
    },
    {
      date: '2026-05-01',
      type: 'penerimaan',
      category: 'Baki Awal',
      description: 'Baki Di Bank (05/12/2025) - Bank Rakyat Keningau (1102279328)',
      amount: '392.39',
      wallet: 'bank',
      status: 'approved',
      createdById: bendahari.id,
      approvedById: bendahari.id,
    },
  ]);

  console.log('✅ Created opening balance transactions');

  // Create monthly snapshot for April 2026
  await db.insert(monthlySnapshots).values({
    month: '2026-04-01',
    bankBalance: '392.39',
    cashBalance: '44.38',
    totalReceipts: '2590.77',
    totalExpenses: '2154.00',
    lockedAt: new Date(),
    lockedById: bendahari.id,
  });

  console.log('✅ Created April 2026 snapshot');
  console.log(' Seeding complete!');
  console.log('\n📧 Login credentials:');
  console.log('   Sila tetapkan kata laluan melalui Environment Variable atau hubungi pentadbir.');

  await pool.end();
}

seed().catch(console.error);
