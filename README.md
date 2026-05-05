# waju.my - Sistem Pengurusan Kewangan KRT Taman Anggerik Keningau

Sistem perakaunan digital untuk menggantikan pengurusan kewangan manual berasaskan CamScanner/PDF.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Docker & Docker Compose (optional)

### Local Development

1. **Setup environment**
```bash
cd waju-app
cp .env.example .env
# Edit .env with your database credentials
```

2. **Install dependencies**
```bash
npm install
```

3. **Start PostgreSQL** (via Docker)
```bash
docker run -d --name waju-db -e POSTGRES_DB=waju_db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16-alpine
```

4. **Generate database schema**
```bash
npm run db:push
```

5. **Seed initial data** (opening balances + default users)
```bash
npm run db:seed
```

6. **Start development server**
```bash
npm run dev
```

Buka http://localhost:3000

### Default Login Credentials
- **Bendahari**: `bendahari@waju.my` (Sila hubungi pentadbir sistem untuk kata laluan)

##  Docker Deployment (Coolify)

```bash
# Build & run with Docker Compose
docker-compose up -d

# Seed database after startup
docker-compose exec waju-app npm run db:seed
```

## 📁 Project Structure

```
waju-app/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # Authentication
│   │   ├── transactions/        # CRUD API
│   │   └── balance/             # Balance API
│   ├── dashboard/               # Main dashboard
│   ├── login/                   # Login page
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── BalanceCard.tsx          # Balance display
│   ├── TransactionForm.tsx      # Add transaction form
│   └── TransactionList.tsx      # Transaction list with edit/delete
├── lib/
│   ├── db/
│   │   ├── schema.ts            # Drizzle schema
│   │   └── index.ts             # Database connection
│   ├── auth.ts                  # NextAuth config
│   └── utils.ts                 # Utility functions
├── scripts/
│   └── seed.ts                  # Database seeding
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## ✨ Features (Phase 1 - MVP)

- ✅ User Login (NextAuth.js)
- ✅ Dashboard dengan baki semasa
- ✅ CRUD Transaksi (Tambah/Edit/Padam)
- ✅ Multi-Wallet (Bank vs Tunai)
- ✅ Validasi Tarikh (blok tarikh tidak wujud)
- ✅ RBAC (Bendahari + Pengerusi)
- ✅ Opening Balances (RM392.39 bank, RM44.38 tunai)
- ✅ Mobile-Friendly UI

## 📋 Features (Phase 2 - Coming Soon)

- PDF Export (format KRT)
- QR Code Verification
- Cash Flow Charts (Recharts)
- Month-End Snapshot Locking

## 🔮 Features (Phase 3 - AI)

- OCR Receipt Scanner
- Voice-to-Text Entry
- AI-Suggested Categorization

##  Tech Stack

- Next.js 15 (App Router)
- TypeScript
- TailwindCSS v4
- Drizzle ORM + PostgreSQL
- NextAuth.js
- Docker

## 📝 License

Private - KRT Taman Anggerik Keningau
