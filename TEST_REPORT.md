# Laporan Pemeriksaan – JUZARA Health

Tanggal penyusunan: 4 November 2026

## Pemeriksaan yang dilakukan pada source
- Struktur proyek dan file konfigurasi diperiksa.
- Endpoint registrasi menerapkan validasi input, email unik, nomor identitas unik, serta hashing password bcrypt.
- Validasi tahun lahir ditambahkan pada antarmuka dan endpoint: 1980–2026.
- Tombol lihat/sembunyikan password ditambahkan pada login, password baru, dan konfirmasi password.
- Login memeriksa akun aktif dan mencocokkan password hash; sesi menggunakan cookie HttpOnly.
- Middleware mengarahkan pengunjung tanpa sesi ke halaman login untuk halaman aplikasi dan API privat.
- API reservasi memerlukan sesi berperan PATIENT, memeriksa jadwal, kuota, dan memakai transaksi serializable serta constraint unik database.

## Belum dapat dinyatakan lulus
Belum dilakukan pengujian end-to-end pada server PostgreSQL aktif dan browser nyata. Karena itu laporan ini **bukan** klaim bahwa seluruh aplikasi sudah lolos QA.

## Pengujian wajib sebelum penggunaan
1. Jalankan migrasi pada PostgreSQL kosong.
2. Uji registrasi valid dan registrasi dengan email duplikat.
3. Uji nomor identitas duplikat.
4. Uji tahun lahir 1979, 1980, 2026, dan 2027.
5. Uji password salah, akun nonaktif, dan login berhasil.
6. Uji akses URL privat sebelum dan sesudah login.
7. Uji dua permintaan reservasi bersamaan untuk slot/kuota yang sama.
8. Uji pemisahan akses pasien, dokter, admin faskes, dan admin utama.
9. Uji audit log, validasi hasil lab, dan akses konsultasi lintas pengguna.
10. Uji responsif, aksesibilitas, backup, pemulihan, dan keamanan deployment.

## Status fitur
Registrasi, login, proteksi sesi dasar, skema database, seed jadwal demo, dan pondasi reservasi telah disiapkan. Pencarian/peta faskes, panel operasional dokter/admin, antrean real-time, chat konsultasi, notifikasi terjadwal, hasil lab PDF, edukasi dinamis, serta suite tes otomatis masih merupakan pekerjaan lanjutan.


## Penambahan modul pada rilis ini
- Akun dokter, admin faskes, dan super admin dibuat oleh seed, bukan formulir registrasi pasien.
- Halaman portal dokter dan panel admin memakai pemeriksaan role di server.
- Endpoint daftar fasilitas/dokter/jadwal/antrean/konsultasi/lab/artikel/notifikasi memerlukan session.
- Endpoint panggil antrean dan pembuatan jadwal/fasilitas memiliki pembatasan role.
- Halaman fasilitas, jadwal, antrean, konsultasi, lab, edukasi, dan notifikasi mengambil data dari API database.

## Catatan yang tetap perlu dituntaskan untuk produksi
- Terapkan pembatasan admin faskes hanya ke fasilitas yang ditugaskan; saat ini role admin faskes masih bersifat global pada demo.
- Tambahkan manajemen dokter dan kuota dengan UI lengkap, chat dua arah, notifikasi realtime/push/email/SMS, PDF lab, unggah lampiran, dan pencatatan validasi lab.
- Tambahkan penguncian urutan antrean dan retry transaksi untuk beban konkurensi tinggi.
- Tambahkan CSRF/origin policy, rate limiting, reset password melalui email, MFA untuk staf, rotasi secret, serta audit akses data sensitif.
- Jalankan test suite integrasi dan Playwright pada database staging.

- Halaman pendaftaran konsultasi pasien ditambahkan dan memanggil API reservasi.


## Fitur yang ditambahkan pada rilis lanjutan
- Endpoint chat membatasi akses hanya kepada pasien dan dokter yang menjadi peserta konsultasi.
- Chat dan daftar notifikasi menggunakan polling browser (bukan kanal WebSocket); uji beban dan pengujian end-to-end tetap diperlukan.
- Hasil lab memiliki endpoint validasi role terbatas, audit log, notifikasi pasien, dan ekspor PDF; pasien dibatasi untuk mengunduh hasil tervalidasi miliknya.
- Admin dapat membuat akun dokter, menonaktifkan/mengaktifkan akun, menambah jadwal, dan menonaktifkan jadwal.
- Reservasi memiliki endpoint perubahan status dengan pemeriksaan pemilik dan peran.

## UI/profile update (2026-11-04)
- Updated patient dashboard layout and responsive color system; no generated/stock AI portrait images are embedded in the patient dashboard.
- Simplified patient signup by removing address and password-confirmation fields. ZIP code, state, and address-line fields are not present. API defaults the required database address field to `Belum diisi`.
- Added doctor-only profile update API and dashboard editor for name, specialty, phone, and profile photo (JPG/PNG/WEBP, max 1 MB).
- Static checks: package JSON parsed successfully; source files and routes were checked for presence. Full Next.js typecheck/build and browser/database tests were not run because dependencies and PostgreSQL were not installed/configured in this working session.
