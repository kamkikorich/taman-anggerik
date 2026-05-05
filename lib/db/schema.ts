import { pgTable, uuid, varchar, decimal, date, timestamp, jsonb, boolean, text, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('view_only'), // 'bendahari' | 'pengerusi' | 'view_only' | 'auditor'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
  monthlySnapshots: many(monthlySnapshots),
}));

// Transactions table
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: date('date').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'penerimaan' | 'perbelanjaan'
  category: varchar('category', { length: 255 }).notNull(),
  description: text('description').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  wallet: varchar('wallet', { length: 50 }).notNull(), // 'bank' | 'tunai'
  receiptImageUrl: text('receipt_image_url'),
  ocrData: jsonb('ocr_data'),
  status: varchar('status', { length: 50 }).default('draft').notNull(), // 'draft' | 'approved'
  createdById: uuid('created_by_id').references(() => users.id),
  approvedById: uuid('approved_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  createdBy: one(users, {
    fields: [transactions.createdById],
    references: [users.id],
  }),
  approvedBy: one(users, {
    fields: [transactions.approvedById],
    references: [users.id],
  }),
}));

// Monthly snapshots for audit
export const monthlySnapshots = pgTable('monthly_snapshots', {
  id: uuid('id').primaryKey().defaultRandom(),
  month: date('month').notNull(), // First day of month
  bankBalance: decimal('bank_balance', { precision: 12, scale: 2 }).notNull(),
  cashBalance: decimal('cash_balance', { precision: 12, scale: 2 }).notNull(),
  totalReceipts: decimal('total_receipts', { precision: 12, scale: 2 }).notNull(),
  totalExpenses: decimal('total_expenses', { precision: 12, scale: 2 }).notNull(),
  lockedAt: timestamp('locked_at'),
  lockedById: uuid('locked_by_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const monthlySnapshotsRelations = relations(monthlySnapshots, ({ one }) => ({
  lockedBy: one(users, {
    fields: [monthlySnapshots.lockedById],
    references: [users.id],
  }),
}));

// Receipts table for OCR tracking
export const receipts = pgTable('receipts', {
  id: uuid('id').primaryKey().defaultRandom(),
  transactionId: uuid('transaction_id').references(() => transactions.id),
  imageUrl: text('image_url').notNull(),
  ocrRawText: text('ocr_raw_text'),
  ocrConfidence: decimal('ocr_confidence', { precision: 5, scale: 4 }),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Audit logs
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(), // 'create', 'update', 'delete', 'approve', 'lock'
  entityType: varchar('entity_type', { length: 100 }).notNull(), // 'transaction', 'snapshot'
  entityId: uuid('entity_id').notNull(),
  changes: jsonb('changes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
