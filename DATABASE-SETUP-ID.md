# Panduan singkat mengaktifkan database JUZARA

Project ini menggunakan Next.js + Prisma + PostgreSQL. Registrasi pasien memakai endpoint `/api/auth/register` dan menyimpan akun ke tabel Prisma. Supabase Auth / Publishable Key tidak dipakai oleh alur login pada source code ini.

## Environment Variables di Vercel

Tambahkan sebagai **Secret** untuk Production:

- `DATABASE_URL`: connection string PostgreSQL untuk aplikasi. Untuk Supabase, gunakan Session Pooler (port 5432) atau connection string pooled yang sesuai.
- `DIRECT_URL`: connection string PostgreSQL untuk operasi Prisma. Gunakan Direct Connection atau Session Pooler yang mendukung koneksi Prisma.
- `SESSION_SECRET`: string acak rahasia minimal 32 karakter.

Ganti `[YOUR-PASSWORD]` pada connection string dengan password database Supabase yang sebenarnya. Jika password mengandung karakter khusus, URL-encode karakter tersebut. Jangan menaruh password, connection string, atau secret di source code dan jangan membagikannya.

## Membuat tabel Prisma satu kali

1. Di GitHub repository, buka **Settings → Secrets and variables → Actions → New repository secret**.
2. Buat secret bernama `DATABASE_URL` dan isi dengan connection string yang sama seperti di Vercel.
3. Buat secret bernama `DIRECT_URL` dan isi dengan direct/session-pooler connection string.
4. Pastikan folder `.github/workflows/sync-database.yml` sudah ada di branch utama.
5. Buka tab **Actions → Sync Prisma database schema → Run workflow**.
6. Tunggu sampai semua langkah berstatus hijau.

Workflow ini menjalankan `prisma db push` secara manual untuk membuat/menyesuaikan tabel dari `prisma/schema.prisma`. Jangan jalankan pada database produksi yang sudah berisi data penting tanpa backup dan pemeriksaan perubahan terlebih dahulu.

## Setelah itu

Pastikan Vercel memiliki `DATABASE_URL`, `DIRECT_URL`, dan `SESSION_SECRET` untuk Production, lalu lakukan **Redeploy**. Tes:

`https://DOMAIN-VERCEL-KAMU/api/health`

Hasil yang diharapkan: `{"status":"ok","database":"connected"}`.
