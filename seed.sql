INSERT INTO "users" ("name", "email", "password", "role") VALUES 
('Justinah Binti Buki', 'bendahari@waju.my', '<SILA_TUKAR_HASH_INI>', 'bendahari');


INSERT INTO "transactions" ("date", "type", "category", "description", "amount", "wallet", "status", "created_by_id", "approved_by_id")
SELECT '2026-05-01', 'penerimaan', 'Baki Awal', 'Baki Akhir ditangan (dari rekod manual 30 April 2026)', '44.38', 'tunai', 'approved', id, id FROM "users" WHERE email = 'bendahari@waju.my';

INSERT INTO "transactions" ("date", "type", "category", "description", "amount", "wallet", "status", "created_by_id", "approved_by_id")
SELECT '2026-05-01', 'penerimaan', 'Baki Awal', 'Baki Di Bank (05/12/2025) - Bank Rakyat Keningau (1102279328)', '392.39', 'bank', 'approved', id, id FROM "users" WHERE email = 'bendahari@waju.my';

INSERT INTO "monthly_snapshots" ("month", "bank_balance", "cash_balance", "total_receipts", "total_expenses", "locked_at", "locked_by_id")
SELECT '2026-04-01', '392.39', '44.38', '2590.77', '2154.00', NOW(), id FROM "users" WHERE email = 'bendahari@waju.my';
