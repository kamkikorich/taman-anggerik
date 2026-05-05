# KRT Taman Anggerik Keningau - Sistem Pengurusan Kewangan

## Gambaran Keseluruhan Projek
Sistem pengurusan kewangan digital berasaskan web untuk Kawasan Rukun Tetangga (KRT) Taman Anggerik, Keningau. Sistem ini merekodkan penerimaan dan perbelanjaan, mengira baki larian (running balance) untuk dua jenis dompet (Bank dan Tunai), serta menjana penyata kewangan (PDF) secara automatik.

## Teknologi Utama
- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: NextAuth (Credentials Provider, JWT Strategy)
- **Styling**: TailwindCSS
- **PDF Generation**: HTML/CSS to Print (Browser native)

## Status Terkini & Pembaikan (Setakat Mei 2026)
Sistem telah dibaiki dan dikemaskini dengan ciri-ciri berikut:
1. **Logik Perakaunan yang Tepat**: Pengiraan Baki Bawa Ke Depan (Brought Forward) telah diimplementasikan dalam API `/api/transactions` dan `/api/report`. Baki larian dalam UI jadual dan Penyata PDF kini tepat walaupun ditapis mengikut tarikh.
2. **Tandatangan Dinamik (PDF)**: Laporan PDF kini mengambil nama pengguna dengan peranan `pengerusi` dan `bendahari` secara dinamik dari pangkalan data untuk bahagian tandatangan.
3. **Peningkatan UI Log Masuk**: Ditambah fungsi "Ingat Saya" (Sesi kekal 30 hari) dan butang "Lihat Kata Laluan" (Ikon Mata).
4. **Kelulusan Automatik Bendahari**: Transaksi yang direkodkan oleh Bendahari kini berstatus `approved` secara lalai supaya ia terus dikira dalam baki.
5. **Pembaikan Skrip**: Fail `scripts/seed.ts` telah dikemaskini dengan `dotenv/config` untuk membetulkan ralat sambungan pangkalan data (SASL) semasa dijalankan secara berasingan.

## Panduan Deployment (Coolify)
1. **Langkah 1**: Buat resource PostgreSQL di Coolify. Namakan `waju_db`. Salin *Internal Database URL*.
2. **Langkah 2**: Sambungkan repositori GitHub ke Coolify (pilih Next.js / Dockerfile). Pastikan Build Pack ditetapkan kepada Dockerfile/Nixpacks bergantung kepada konfigurasi projek.
3. **Langkah 3**: Tetapkan pembolehubah persekitaran (Environment Variables) *sebelum* deploy:
   - `DATABASE_URL` = `postgresql://postgres:<KATA_LALUAN_SULIT>@f4ocbdv8l5sml2qq65utg4rx:5432/waju_db` (Sila rujuk skrip penciptaan DB untuk kata laluan sebenar)
   - `NEXTAUTH_SECRET` = String rawak dan panjang (mesti dijana dengan selamat)
   - `NEXTAUTH_URL` = URL rasmi aplikasi (cth: `https://akaun.waju.my`)
   - `APP_URL` = URL rasmi aplikasi
4. **Langkah 4**: Jalankan Deploy dari panel Coolify.
5. **Langkah 5 (Migrasi Data)**: Setelah aplikasi beroperasi (Healthy), buka Terminal dalam Coolify untuk aplikasi tersebut dan jalankan:
   - `npm run db:push` (Penting: Tekan 'Enter' jika ditanya soalan amaran unik e-mel)
   - `npm run db:seed` (Sila pastikan `DEFAULT_PASSWORD` ditetapkan dalam .env)

## Automasi & Skrip Penting (Rujukan Masa Depan)
- **Token API Coolify**: Untuk skrip automasi, Coolify v4 memerlukan token API yang dihubungkan kepada `team_id`. Jika penjanaan token ralat (`team_id null constraint`), pastikan token diwujudkan melalui antaramuka (UI) Coolify (Security -> API Tokens) dan bukannya melalui `tinker` secara langsung.
- **Fail Automasi**: Terdapat beberapa fail automasi (cth: `create_db.sh`, `artisan_deploy.sh`) dalam folder root server. Untuk mencipta pangkalan data secara automatik, disyorkan menggunakan API rasmi Coolify `POST /api/v1/databases/postgresql` dengan Bearer Token yang sah.

## Nota Tambahan
- Akaun lalai Bendahari: `bendahari@waju.my` (Sila rujuk pentadbir untuk kata laluan selamat)
- Jika terdapat ralat berkaitan `next-auth` atau JWT (sesi terputus-putus), pastikan `NEXTAUTH_SECRET` tidak berubah secara tidak sengaja antara binaan.
