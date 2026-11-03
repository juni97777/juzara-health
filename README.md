# JUZARA Health – Full-stack starter

## Stack
Next.js 15, React 19, PostgreSQL, Prisma ORM, bcrypt password hashing, signed HttpOnly session cookie.

## Fitur fondasi
- Registrasi pasien dengan validasi, email unik, nomor identitas unik, dan password hash.
- Login benar-benar memeriksa email/password serta status akun.
- Role model: PATIENT, DOCTOR, FACILITY_ADMIN, SUPER_ADMIN. Registrasi publik hanya membuat PATIENT.
- Dashboard memerlukan session login.
- Database relasional untuk profil pasien, faskes, layanan, dokter, jadwal, janji, keluhan, konsultasi, pesan, catatan, hasil lab, validasi lab, artikel, notifikasi, dan audit log.
- Endpoint dasar reservasi dengan transaksi serializable, pengecekan kuota, serta constraint unik slot dan nomor antrean.
- Seed jadwal dokter sesuai daftar kebutuhan. Faskes dan dokter diberi tanda demo.

## Cara menjalankan
1. Pasang Node.js 20+ dan PostgreSQL 15+.
2. Buat database `juzara_health`.
3. Salin `.env.example` menjadi `.env`, isi DATABASE_URL dan SESSION_SECRET (random secret minimal 32 karakter).
4. Jalankan:

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

5. Buka http://localhost:3000

## Batasan dan keamanan
Ini starter pengembangan, belum aplikasi produksi. Data faskes/koordinat/dokter seed adalah data simulasi dan wajib diverifikasi sebelum dipakai. Role dokter/admin perlu dibuat oleh admin utama melalui proses terkontrol; jangan izinkan pilihan role admin dari registrasi publik. Panel dokter/admin, CRUD faskes/jadwal, pencarian peta, antrean realtime, konsultasi/chat, hasil lab/PDF, lupa password/email reset, rate limiting, CSRF hardening, audit menyeluruh, serta tes otomatis masih harus dilengkapi. API reservasi adalah fondasi awal; sistem produksi memerlukan retry konflik serialisasi, penguncian sequence antrean per tanggal, validasi slot dan tes konkurensi. Hasil lab nyata hanya boleh dimasukkan dan divalidasi petugas berwenang.


## Akses aplikasi
- Halaman publik hanya beranda, login, dan registrasi.
- Semua halaman aplikasi privat diarahkan ke `/login` jika belum memiliki sesi valid.
- Registrasi publik hanya membuat peran `PATIENT`; akun dokter/admin tidak dapat dibuat dari form pasien.
- Tanggal lahir dibatasi 1 Januari 1980 sampai 31 Desember 2026.
- Tombol **Lihat/Sembunyikan** tersedia pada input password login dan registrasi.
- Logout menghapus cookie sesi dan mengarahkan kembali ke halaman login.

Lihat `TEST_REPORT.md` untuk status pemeriksaan dan daftar pengujian yang wajib dilakukan.


## Akun demo staf (khusus demonstrasi lokal)
Akun staf **tidak bisa dibuat melalui registrasi publik**. Pada seed lokal, akun demo dibuat dengan kredensial berikut:
- Dokter: `zaskiya.doctor@juzara.demo`, `bayu.doctor@juzara.demo`, `juniar.doctor@juzara.demo`, `zidan.doctor@juzara.demo`, `zahra.doctor@juzara.demo` — password lokal `DokterJuzara#2026`.
- Admin faskes: `admin.faskes@juzara.demo` — password lokal `AdminJuzara#2026`.
- Super admin: `superadmin@juzara.demo` — password lokal `SuperAdminJuzara#2026`.

Kredensial di atas hanya untuk lingkungan lokal. Jangan gunakan di deployment publik. Seed production diblokir secara default; untuk demonstrasi terkontrol, lihat bagian Deployment ke Vercel dan atur password unik melalui environment variables.

## Modul tambahan yang disediakan
- Dashboard dokter dengan antrean pasien.
- Dashboard admin dengan ringkasan pasien, dokter, fasilitas, dan reservasi.
- API pencarian fasilitas, daftar dokter, jadwal, antrean, konsultasi, laboratorium, artikel, dan notifikasi.
- API admin untuk menambah fasilitas dan jadwal dokter.
- Halaman pencarian fasilitas dengan tautan peta OpenStreetMap, jadwal, antrean, edukasi, konsultasi, lab, dan notifikasi.

## Batasan integrasi
Semua data faskes/dokter seed adalah data simulasi. Koordinat contoh hanya penanda demonstrasi wilayah Makassar, bukan alamat operasional. Integrasi BPJS, sistem antrean rumah sakit, rekam medis, chat realtime, pengiriman notifikasi eksternal, validasi laboratorium, dan pembayaran belum terhubung.

- Halaman `/booking` menghubungkan pemilihan faskes → dokter → jadwal → tanggal → jam → keluhan → reservasi dan kode/nomor antrean.


## Fitur tambahan rilis chat/lab/admin/queue
- Chat dua arah dengan polling berkala, pemeriksaan peserta konsultasi, dan notifikasi pesan baru.
- Validasi hasil lab hanya oleh akun admin/staf berwenang pada demo; status dan validator tercatat, pasien hanya dapat mengunduh PDF setelah tervalidasi.
- Manajemen dokter, akun login dokter, status aktif/nonaktif, dan penambahan/nonaktif jadwal melalui `/admin/management`.
- Pembatalan dan perubahan status reservasi melalui API berotorisasi; antrean diperbarui berkala.
- Notifikasi ditarik berkala dari database; ini bukan WebSocket/push notification.

## Pembaruan antarmuka JUZARA
- Dashboard pasien diperbarui dengan tata letak responsif, kartu layanan berwarna, navigasi samping, ringkasan reservasi, dan elemen grafis CSS (tanpa foto ilustrasi AI).
- Pendaftaran pasien menggunakan nama, nomor identitas, tanggal lahir, jenis kelamin, alamat wajib, nomor telepon, email, password, dan konfirmasi password. ZIP code, state, dan address line tidak digunakan.
- Dokter dapat mengubah nama, spesialisasi, nomor telepon, dan foto profil melalui panel profil di dashboard dokter. Foto JPG/PNG/WEBP dibatasi 1 MB dan disimpan sebagai data URL di database. Untuk skala produksi, pindahkan foto ke object storage.

## Deployment ke Vercel

Project ini menggunakan Next.js 15 dan Prisma ORM 6.19. Vercel dapat meng-host aplikasi Next.js, tetapi database PostgreSQL harus disediakan terpisah (misalnya Neon, Supabase, atau Prisma Postgres).

### 1. Siapkan PostgreSQL

Buat database PostgreSQL dan siapkan dua connection string:
- `DATABASE_URL`: connection string pooled untuk trafik aplikasi/serverless (atau direct jika provider tidak menyediakan pooler).
- `DIRECT_URL`: connection string direct/non-pooled untuk perintah Prisma seperti `db push` dan migrasi.
- Opsional `DATABASE_URL_POOLED`: jika provider/Vercel Marketplace memberi URL pooled terpisah. Prisma Client akan memprioritaskan variabel ini saat runtime.

Jangan menaruh connection string di kode atau variabel `NEXT_PUBLIC_*`.

### 2. Siapkan skema database satu kali

Di komputer lokal, salin `.env.example` menjadi `.env` dan isi `DATABASE_URL`, `DIRECT_URL`, serta `SESSION_SECRET`. Kemudian jalankan:

```bash
npm install
npx prisma generate
npx prisma db push
```

Perintah `db push` membuat tabel berdasarkan schema Prisma. Untuk pengembangan produksi jangka panjang, buat dan commit migration SQL dengan `prisma migrate dev`, lalu gunakan `prisma migrate deploy` melalui pipeline rilis. Jangan menjalankan `db push` berulang pada database produksi yang sudah berisi data.

### 3. Push source code ke GitHub

Buat repository GitHub, lalu push seluruh isi folder `juzara-health-fullstack` (bukan file ZIP) ke branch utama.

### 4. Import ke Vercel

Di Vercel pilih **Add New → Project**, import repository GitHub, dan gunakan:
- Framework Preset: Next.js (auto-detect)
- Root Directory: `./` jika repository berisi isi folder project; jika project berada di subfolder, pilih folder `juzara-health-fullstack`
- Install Command: `npm install`
- Build Command: `npm run vercel-build`
- Output Directory: biarkan default Next.js

### 5. Tambahkan Environment Variables di Vercel

Tambahkan untuk environment Production (dan Preview/Development bila diperlukan):
- `DATABASE_URL`
- `DIRECT_URL`
- `DATABASE_URL_POOLED` (opsional, jika tersedia)
- `SESSION_SECRET` (random secret unik minimal 32 karakter)

Contoh membuat secret di terminal: `openssl rand -base64 48`. Jangan gunakan secret contoh dari README atau `.env.example`.

Jika memakai Prisma Postgres melalui Vercel Marketplace, dokumentasi integrasi menyediakan `DATABASE_URL` direct dan `DATABASE_URL_POOLED`; set `DIRECT_URL` sama dengan `DATABASE_URL`, dan runtime akan memakai `DATABASE_URL_POOLED` bila tersedia.

### 6. Deploy dan periksa koneksi

Klik Deploy. Setelah berhasil, buka `https://alamat-project.vercel.app/api/health`. Respons `{"status":"ok","database":"connected"}` menandakan aplikasi dapat menjangkau PostgreSQL. Respons 503 berarti periksa ulang environment variables, akses jaringan, dan status database; setelah mengubah environment variables, lakukan redeploy.

### 7. Akun staf dan data demonstrasi

Seed demo tidak otomatis dijalankan saat build/deploy. Jalankan seed dari komputer tepercaya yang memiliki koneksi database setelah mengisi variabel khusus demo. Pada production, seed ditolak kecuali `ALLOW_DEMO_SEED=true` dan semua password demo diatur secara eksplisit. Gunakan password unik minimal 16 karakter, jalankan `npm run db:seed` satu kali, lalu matikan kembali `ALLOW_DEMO_SEED`. Jangan gunakan akun demo bawaan untuk layanan publik.

### Batasan sebelum publikasi untuk pengguna sungguhan

Deployment Vercel hanya membuat aplikasi dapat diakses melalui internet; ini tidak otomatis menjadikannya layanan medis siap operasional. Sebelum membuka untuk pasien nyata, lakukan audit keamanan dan privasi, batasi admin per fasilitas, aktifkan rate limiting, siapkan reset password, backup/restore database, object storage untuk foto/lampiran, logging/monitoring, HTTPS/domain, kebijakan privasi dan persetujuan, serta integrasi fasilitas/laboratorium yang sah. Data fasilitas, dokter, dan hasil pemeriksaan seed masih simulasi. Jangan gunakan data kesehatan atau identitas pasien sungguhan pada demo publik.
