Berikut dokumentasi yang bisa langsung kamu salin dan simpan sebagai README.md di folder utama project Ruang Warga.
:::writing{variant="document" id="73182"}
# Ruang Warga

**Sistem Informasi Pelayanan dan Administrasi Warga Berbasis Website**

Ruang Warga merupakan aplikasi berbasis website yang dirancang untuk membantu pengelolaan administrasi, informasi, dan pelayanan masyarakat di tingkat desa atau kelurahan, RW, dan RT.

Aplikasi ini bertujuan untuk mempermudah komunikasi antara warga dan pengurus lingkungan, meningkatkan transparansi pengelolaan administrasi, serta membantu digitalisasi pelayanan masyarakat.

---

## 1. Tujuan Project

Ruang Warga dikembangkan untuk menyediakan sistem terintegrasi yang dapat digunakan oleh warga dan pengurus lingkungan dalam melakukan berbagai aktivitas administrasi, seperti:

- Pengelolaan data warga.
- Verifikasi pendaftaran warga.
- Penyampaian pengumuman lingkungan.
- Pengajuan surat administrasi.
- Penyampaian dan pengelolaan pengaduan warga.
- Pengelolaan iuran dan keuangan lingkungan.
- Pengelolaan informasi pada tingkat RT dan RW.

## 2. Teknologi yang Digunakan

Teknologi yang direncanakan dan digunakan dalam pengembangan project ini meliputi:

### Backend
- Node.js
- Express.js
- TypeScript
- PostgreSQL
- JSON Web Token (JWT)
- Bcrypt
- dotenv

### Database
- PostgreSQL
- DBeaver untuk pengelolaan database

### API Testing
- Insomnia

### Version Control
- Git
- GitHub

### Frontend
Frontend akan dikembangkan dan diintegrasikan dengan backend pada tahap pengembangan berikutnya.

## 3. Role dan Hak Akses Pengguna

Sistem Ruang Warga memiliki enam jenis role pengguna.

| Role | Keterangan |
|---|---|
| WARGA | Pengguna masyarakat yang dapat mengakses layanan warga. |
| KETUA_RT | Pengurus RT yang bertugas memverifikasi data warga dan mengelola wilayah RT. |
| KETUA_RW | Pengurus RW yang bertugas mengawasi pengelolaan wilayah RW. |
| BENDAHARA_RT | Pengurus yang bertugas mengelola keuangan tingkat RT. |
| BENDAHARA_RW | Pengurus yang bertugas mengelola keuangan tingkat RW. |
| SUPER_ADMIN | Pengelola utama yang memiliki kewenangan administrasi sistem. |

### Kebijakan Pembuatan Akun

Sistem menggunakan pendekatan berikut:

1. Warga dapat melakukan registrasi secara mandiri.
2. Akun warga akan menunggu verifikasi Ketua RT.
3. Ketua RT, Ketua RW, Bendahara RT, dan Bendahara RW dibuat oleh Super Admin.
4. Warga tidak dapat menentukan atau memberikan role pengurus kepada dirinya sendiri.
5. Super Admin memiliki kewenangan untuk mengelola akun pengurus.

## 4. Struktur Project Backend

Struktur folder backend saat ini:

```text
backend/
├── src/
│   ├── config/
│   │   └── database.ts
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   └── super-admin.controller.ts
│   │
│   ├── middlewares/
│   │
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   └── super-admin.routes.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   └── super-admin.service.ts
│   │
│   ├── types/
│   │   └── auth.types.ts
│   │
│   ├── utils/
│   │   └── password.ts
│   │
│   └── server.ts
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── tsconfig.json
```

## 5. Database

Database menggunakan PostgreSQL dengan schema `ruangwarga`.

Tabel yang sudah disiapkan:

| No. | Nama Tabel | Fungsi |
|---|---|---|
| 1 | users | Menyimpan akun pengguna |
| 2 | roles | Menyimpan daftar role |
| 3 | user_roles | Relasi pengguna dengan role |
| 4 | villages | Menyimpan data desa atau kelurahan |
| 5 | rws | Menyimpan data RW |
| 6 | rts | Menyimpan data RT |
| 7 | residents | Menyimpan data penduduk |
| 8 | families | Menyimpan data keluarga |
| 9 | family_members | Relasi anggota keluarga |
| 10 | announcements | Menyimpan pengumuman |
| 11 | complaints | Menyimpan pengaduan |
| 12 | complaint_attachments | Lampiran pengaduan |
| 13 | complaint_histories | Riwayat pengaduan |
| 14 | letter_types | Jenis surat administrasi |
| 15 | letter_requests | Pengajuan surat |
| 16 | letter_approvals | Persetujuan surat |
| 17 | dues | Data iuran |
| 18 | payments | Data pembayaran |
| 19 | financial_transactions | Transaksi keuangan |

## 6. Fitur Backend yang Sudah Dibuat

### 6.1 Konfigurasi Database

Koneksi backend ke PostgreSQL menggunakan library `pg` dengan konfigurasi dari file `.env`.

### 6.2 Registrasi Warga

Endpoint registrasi digunakan untuk mendaftarkan warga baru.

Proses registrasi meliputi:

- Validasi data pendaftaran.
- Pemeriksaan RT yang dipilih.
- Enkripsi password menggunakan Bcrypt.
- Penyimpanan akun ke tabel `users`.
- Penyimpanan data penduduk ke tabel `residents`.
- Pemberian role awal WARGA.
- Status akun awal `pending`.
- Status verifikasi penduduk awal `pending`.

### 6.3 Login Pengguna

Sistem login menggunakan email atau nomor telepon dan password.

Proses login meliputi:

- Pemeriksaan akun pengguna.
- Verifikasi password menggunakan Bcrypt.
- Pemeriksaan status akun.
- Pemeriksaan status verifikasi warga.
- Pengambilan role pengguna.
- Pembuatan token autentikasi JWT.

### 6.4 Bootstrap Super Admin

Fitur bootstrap digunakan untuk membuat akun Super Admin pertama.

Proses ini menggunakan kunci bootstrap dari environment variable dan hanya digunakan saat inisialisasi akun Super Admin pertama.

Setelah akun berhasil dibuat, kunci bootstrap dinonaktifkan dan tidak digunakan lagi untuk pembuatan akun berikutnya.

## 7. API Endpoint

Base URL backend:

```text
http://localhost:5000
```

Endpoint yang sudah dibuat:

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/` | Memeriksa backend |
| GET | `/api/health` | Memeriksa kesehatan server |
| GET | `/api/roles` | Melihat daftar role |
| POST | `/api/auth/register` | Registrasi warga |
| POST | `/api/auth/login` | Login pengguna |
| POST | `/api/super-admin/bootstrap` | Bootstrap Super Admin pertama |

**Catatan:** Endpoint bootstrap hanya untuk inisialisasi awal. Setelah akun Super Admin berhasil dibuat, konfigurasi kunci bootstrap telah dinonaktifkan.

## 8. Persyaratan Instalasi

Sebelum menjalankan backend, pastikan perangkat sudah memiliki:

- Node.js dan npm.
- PostgreSQL.
- Database Ruang Warga beserta schema dan tabelnya.
- Git.

## 9. Cara Menjalankan Backend

### Langkah 1: Clone Repository

```bash
git clone https://github.com/USERNAME/ruang-warga.git
```

### Langkah 2: Masuk ke Folder Backend

```bash
cd ruang-warga/backend
```

### Langkah 3: Install Dependencies

```bash
npm install
```

### Langkah 4: Konfigurasi Environment

Buat file `.env` berdasarkan `.env.example`.

Contoh konfigurasi:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=nama_database
DB_USER=postgres
DB_PASSWORD=password_database
DB_SCHEMA=ruangwarga

JWT_SECRET=ganti_dengan_secret_yang_kuat
JWT_EXPIRES_IN=1d

SUPER_ADMIN_SETUP_KEY=
```

Sesuaikan konfigurasi database dengan PostgreSQL yang digunakan.

Jangan mengunggah file `.env` ke GitHub karena berisi informasi rahasia.

### Langkah 5: Menjalankan Development Server

```bash
npm run dev
```

Backend akan berjalan pada:

```text
http://localhost:5000
```

### Langkah 6: Build TypeScript

Untuk memeriksa dan mengompilasi kode TypeScript:

```bash
npm run build
```

### Langkah 7: Menjalankan Build

```bash
npm start
```

## 10. Perintah NPM

| Perintah | Fungsi |
|---|---|
| `npm install` | Menginstal dependencies |
| `npm run dev` | Menjalankan development server |
| `npm run build` | Mengompilasi TypeScript |
| `npm start` | Menjalankan hasil build |

## 11. Pengujian API

Pengujian API dilakukan menggunakan Insomnia.

Contoh request login:

**Method:**

```text
POST
```

**URL:**

```text
http://localhost:5000/api/auth/login
```

**Body JSON:**

```json
{
  "identifier": "admin@ruangwarga.test",
  "password": "PASSWORD_ANDA"
}
```

Jika login berhasil, server akan memberikan respons berupa:

- Status keberhasilan.
- Pesan login.
- Token JWT.
- Informasi pengguna.
- Daftar role pengguna.

Jangan menyimpan token JWT aktif atau password asli di repository.

## 12. Status Pengembangan

Berikut status pengembangan project saat dokumentasi ini dibuat:

- [x] Inisialisasi backend Node.js.
- [x] Konfigurasi TypeScript.
- [x] Koneksi PostgreSQL.
- [x] Konfigurasi Express.js.
- [x] Endpoint pemeriksaan server.
- [x] Endpoint daftar role.
- [x] Implementasi Bcrypt.
- [x] Registrasi warga.
- [x] Bootstrap akun Super Admin pertama.
- [x] Implementasi login pengguna.
- [x] Pembuatan token JWT.
- [x] Integrasi route registrasi.
- [x] Integrasi route login.
- [x] Build TypeScript berhasil.
- [ ] Middleware autentikasi JWT.
- [ ] Middleware otorisasi role.
- [ ] Manajemen akun pengurus.
- [ ] Verifikasi warga oleh Ketua RT.
- [ ] Modul pengumuman.
- [ ] Modul pengaduan.
- [ ] Modul surat administrasi.
- [ ] Modul keuangan.
- [ ] Integrasi frontend.
- [ ] Pengujian sistem secara menyeluruh.

## 13. Cara Upload Project ke GitHub

Pastikan file `.gitignore` sudah mengabaikan file dan folder berikut:

```gitignore
node_modules/
dist/
.env
```

Kemudian buka terminal pada folder utama project dan jalankan:

### 1. Inisialisasi Git

```bash
git init
```

### 2. Tambahkan File ke Git

```bash
git add .
```

### 3. Commit Pertama

```bash
git commit -m "Initial commit: Ruang Warga backend"
```

### 4. Buat Repository di GitHub

1. Buka https://github.com
2. Login ke akun GitHub.
3. Klik tombol **New repository**.
4. Isi nama repository dengan `ruang-warga`.
5. Pilih Public atau Private sesuai kebutuhan.
6. Jangan centang opsi pembuatan README jika README sudah dibuat secara lokal.
7. Klik **Create repository**.

### 5. Hubungkan Repository Lokal ke GitHub

Ganti `USERNAME` dengan username GitHub milikmu.

```bash
git branch -M main
git remote add origin https://github.com/USERNAME/ruang-warga.git
```

### 6. Upload ke GitHub

```bash
git push -u origin main
```

Setelah proses selesai, refresh halaman repository GitHub. File project akan muncul di sana.

### Jika Ingin Upload Perubahan Berikutnya

Gunakan:

```bash
git add .
git commit -m "Deskripsi perubahan"
git push
```

## 14. Keamanan Project

Beberapa hal yang harus diperhatikan:

- Jangan mengunggah file `.env`.
- Jangan membagikan password database.
- Jangan membagikan `JWT_SECRET`.
- Jangan membagikan token JWT aktif.
- Jangan mengaktifkan kembali endpoint bootstrap tanpa mekanisme pengamanan.
- Gunakan validasi dan otorisasi pada setiap endpoint yang membutuhkan hak akses tertentu.

---

## 15. Pengembang

**Project:** Ruang Warga

**Jenis:** Sistem Informasi Pelayanan dan Administrasi Warga Berbasis Website

**Backend:** Node.js, Express.js, TypeScript, PostgreSQL

**Repository:** Akan ditambahkan setelah project diunggah ke GitHub.

:::