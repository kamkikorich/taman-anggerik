// scripts/run_pindahan_migration.ts
// Run this once after deploying to label any existing paired transactions
// as 'Pindahan Dalaman' so they are excluded from receipts/expenses totals.

import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }

  const sqlPath = path.join(__dirname, '..', 'migrations', '2026_06_22_fix_pindahan.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    console.log('Running pindahan migration...');
    await client.query(sql);
    const { rows } = await client.query(
      "SELECT COUNT(*)::int AS n FROM transactions WHERE category = 'Pindahan Dalaman'"
    );
    console.log(`✓ Migration complete. Pindahan Dalaman rows: ${rows[0].n}`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});