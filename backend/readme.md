# RUANG WARGA
### Sistem Informasi Pelayanan dan Administrasi Warga Berbasis Website

## 1. Deskripsi Project

**Ruang Warga** adalah aplikasi berbasis website yang dirancang untuk membantu pengelolaan administrasi dan pelayanan masyarakat di lingkungan desa atau kelurahan, RW, dan RT.

Aplikasi ini bertujuan untuk mempermudah komunikasi antara warga dan pengurus lingkungan, mengelola data penduduk, melakukan verifikasi pendaftaran warga, menyampaikan pengumuman, mengelola pengaduan, serta mendukung transparansi keuangan lingkungan.

Project ini dikembangkan menggunakan arsitektur frontend dan backend yang terpisah dengan REST API sebagai penghubungnya.

## 2. Tujuan Project

1. Mempermudah proses pendataan warga.
2. Memfasilitasi verifikasi akun warga oleh Ketua RT.
3. Mempermudah pengurus dalam mengelola administrasi lingkungan.
4. Menyediakan informasi dan pengumuman kepada warga.
5. Memfasilitasi penyampaian dan pengelolaan pengaduan.
6. Membantu pengelolaan keuangan dan pembayaran iuran warga.
7. Meningkatkan transparansi pelayanan di lingkungan RT dan RW.

## 3. Teknologi yang Digunakan

| Teknologi | Kegunaan |
|---|---|
| React | Pengembangan frontend |
| Node.js | Runtime backend |
| Express.js | Framework backend |
| TypeScript | Bahasa pemrograman backend |
| PostgreSQL | Database |
| DBeaver | Pengelolaan database |
| Insomnia | Pengujian REST API |
| JSON Web Token (JWT) | Autentikasi pengguna |
| Bcrypt | Hashing password |
| dotenv | Pengelolaan environment variable |
| CORS | Mengatur akses lintas origin |

## 4. Sistem Hak Akses Pengguna

Ruang Warga menggunakan sistem role-based access control (RBAC).

Terdapat enam jenis role:

| No. | Role | Hak Akses |
|---|---|---|
| 1 | WARGA | Mengakses layanan dan informasi warga |
| 2 | KETUA_RT | Mengelola wilayah RT dan memverifikasi warga |
| 3 | KETUA_RW | Mengelola dan memantau wilayah RW |
| 4 | BENDAHARA_RT | Mengelola keuangan tingkat RT |
| 5 | BENDAHARA_RW | Mengelola keuangan tingkat RW |
| 6 | SUPER_ADMIN | Mengelola sistem dan akun pengurus |

### Kebijakan Pembuatan Akun

Pembuatan akun menggunakan dua pendekatan:

- **Warga:** melakukan registrasi secara mandiri melalui aplikasi.
- **Pengurus:** akun dibuat oleh Super Admin.

Ketua RT bertugas memverifikasi pendaftaran warga yang berada di wilayah RT yang menjadi tanggung jawabnya.

Setiap akun pengurus memiliki cakupan wilayah sesuai tugasnya, yaitu RT atau RW.

## 5. Fitur Utama yang Direncanakan

1. Registrasi dan login pengguna.
2. Verifikasi akun warga oleh Ketua RT.
3. Manajemen akun pengurus oleh Super Admin.
4. Manajemen data warga.
5. Pengumuman lingkungan.
6. Pengaduan warga.
7. Pengajuan surat administrasi.
8. Pengelolaan iuran warga.
9. Pencatatan transaksi keuangan.
10. Forum komunikasi warga.
11. Kegiatan dan agenda lingkungan.
12. Notifikasi.
13. Audit log aktivitas sistem.

## 6. Struktur Project Backend

```text
backend/
│
├── src/
│   ├── config/
│   │   └── database.ts
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── super-admin.controller.ts
│   │   ├── officer.controller.ts
│   │   └── resident-verification.controller.ts
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   └── role.middleware.ts
│   │
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── super-admin.routes.ts
│   │   ├── officer.routes.ts
│   │   └── resident.routes.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── officer.service.ts
│   │   └── resident-verification.service.ts
│   │
│   ├── types/
│   │   ├── auth.types.ts
│   │   └── express.d.ts
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
└── tsconfig.json
```

*Catatan: Struktur di atas menggambarkan file yang telah dibuat atau sedang diintegrasikan dalam tahap pengembangan.*

## 7. Database

Nama database: `db_ruangwarga`

Schema: `ruangwarga`

Tabel utama yang telah disiapkan:

| No. | Nama Tabel | Keterangan |
|---|---|---|
| 1 | users | Data akun pengguna |
| 2 | roles | Daftar role pengguna |
| 3 | user_roles | Relasi pengguna dengan role dan wilayah |
| 4 | villages | Data desa atau kelurahan |
| 5 | rws | Data RW |
| 6 | rts | Data RT |
| 7 | residents | Data penduduk |
| 8 | families | Data keluarga |
| 9 | family_members | Anggota keluarga |
| 10 | announcements | Pengumuman |
| 11 | complaints | Pengaduan |
| 12 | complaint_attachments | Lampiran pengaduan |
| 13 | complaint_histories | Riwayat pengaduan |
| 14 | letter_types | Jenis surat |
| 15 | letter_requests | Pengajuan surat |
| 16 | letter_approvals | Persetujuan surat |
| 17 | dues | Iuran warga |
| 18 | payments | Pembayaran |
| 19 | financial_transactions | Transaksi keuangan |

Tabel tambahan yang direncanakan:

- forum_posts
- forum_comments
- activities
- activity_participants
- notifications
- audit_logs

### Relasi Wilayah Pengurus

Tabel `user_roles` memiliki kolom tambahan:

- `rt_id`
- `rw_id`
- `assigned_by`

Kolom tersebut digunakan untuk menentukan wilayah tugas pengurus dan mencatat Super Admin yang memberikan akun.

Aturan wilayah:
- Ketua RT dan Bendahara RT harus memiliki `rt_id`.
- Ketua RW dan Bendahara RW harus memiliki `rw_id`.
- Warga dan Super Admin tidak memiliki penugasan wilayah melalui tabel `user_roles`.

## 8. Sistem Autentikasi dan Keamanan

Backend menggunakan beberapa mekanisme keamanan:

### Password Hashing

Password pengguna disimpan dalam bentuk hash menggunakan Bcrypt dengan 12 salt rounds.

### JWT Authentication

Setelah berhasil login, pengguna mendapatkan token JWT. Token digunakan untuk mengakses endpoint yang membutuhkan autentikasi.

### Role-Based Access Control

Middleware `authorizeRoles()` membatasi akses endpoint berdasarkan role pengguna.

### Status Akun

Tabel `users` menggunakan tiga status:

- `pending`: akun menunggu aktivasi.
- `active`: akun aktif.
- `suspended`: akun dinonaktifkan atau ditolak.

### Verifikasi Warga

Pendaftaran warga memiliki status:

- `pending`
- `verified`
- `rejected`

Warga hanya dapat login apabila akun telah aktif dan status verifikasi penduduknya sudah `verified`.

## 9. Alur Registrasi dan Verifikasi Warga

1. Warga mengisi formulir registrasi.
2. Backend memvalidasi data registrasi.
3. Password di-hash menggunakan Bcrypt.
4. Data akun disimpan dengan status `pending`.
5. Data penduduk disimpan dengan status verifikasi `pending`.
6. Sistem memberikan role `WARGA`.
7. Ketua RT login ke sistem.
8. Ketua RT melihat daftar warga yang menunggu verifikasi di wilayah tugasnya.
9. Ketua RT menyetujui atau menolak pendaftaran.
10. Jika disetujui, status penduduk menjadi `verified` dan akun menjadi `active`.
11. Jika ditolak, status penduduk menjadi `rejected` dan akun menjadi `suspended`.

## 10. API Backend

Base URL lokal:

```text
http://localhost:5000
```

### Authentication

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/api/auth/register` | Registrasi warga |
| POST | `/api/auth/login` | Login pengguna |

### Super Admin

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/api/super-admin/bootstrap` | Pembuatan awal akun Super Admin |
| GET | `/api/super-admin/profile` | Melihat profil Super Admin |
| POST | `/api/super-admin/officers` | Membuat akun pengurus |

### Verifikasi Warga

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/residents/pending` | Melihat daftar warga menunggu verifikasi |
| PATCH | `/api/residents/:id/approve` | Menyetujui pendaftaran warga |
| PATCH | `/api/residents/:id/reject` | Menolak pendaftaran warga |

*Catatan: Endpoint verifikasi merupakan endpoint yang sedang diintegrasikan. Pastikan route telah didaftarkan di `server.ts` dan diuji sebelum dianggap siap digunakan.*

## 11. Instalasi dan Menjalankan Backend

### Persyaratan

Pastikan sudah menginstal:

- Node.js
- PostgreSQL
- DBeaver (opsional, untuk mengelola database)
- Insomnia (untuk pengujian API)

### Langkah 1 — Masuk ke folder backend

```bash
cd "Ruang Warga/backend"
```

### Langkah 2 — Install dependencies

```bash
npm install
```

### Langkah 3 — Konfigurasi environment

Buat file `.env` berdasarkan `.env.example`.

Isi konfigurasi database, schema, port, dan JWT secret sesuai lingkungan lokal.

Jangan membagikan file `.env` karena berisi informasi rahasia.

### Langkah 4 — Jalankan backend

```bash
npm run dev
```

Backend berjalan pada port yang ditentukan di `.env`, atau port 5000 jika tidak ditentukan.

### Langkah 5 — Build TypeScript

```bash
npm run build
```

### Langkah 6 — Menjalankan hasil build

```bash
npm start
```

## 12. Status Pengembangan

### Backend

- [x] Inisialisasi project Node.js dan TypeScript.
- [x] Konfigurasi Express.
- [x] Koneksi PostgreSQL.
- [x] Pembuatan struktur database.
- [x] Pembuatan tabel dan relasi role.
- [x] Registrasi warga.
- [x] Login pengguna.
- [x] Password hashing dengan Bcrypt.
- [x] Autentikasi JWT.
- [x] Middleware autentikasi.
- [x] Middleware pembatasan role.
- [x] Bootstrap akun Super Admin.
- [x] Pembuatan akun pengurus oleh Super Admin.
- [x] Pengaturan wilayah tugas pengurus.
- [x] Service verifikasi warga.
- [x] Controller verifikasi warga.
- [ ] Penyelesaian integrasi route verifikasi warga.
- [ ] Pengujian endpoint verifikasi warga.
- [ ] Pengujian login warga setelah disetujui.
- [ ] Pengembangan modul pengumuman.
- [ ] Pengembangan modul pengaduan.
- [ ] Pengembangan modul surat administrasi.
- [ ] Pengembangan modul keuangan.

### Frontend

- [ ] Inisialisasi frontend.
- [ ] Halaman registrasi dan login.
- [ ] Dashboard warga.
- [ ] Dashboard Ketua RT.
- [ ] Dashboard Ketua RW.
- [ ] Dashboard Bendahara.
- [ ] Dashboard Super Admin.
- [ ] Integrasi frontend dengan backend.

## 13. Pengujian yang Telah Dilakukan

Beberapa pengujian backend yang sudah dilakukan:

1. Build TypeScript menggunakan `npm run build` berhasil.
2. Login akun Super Admin berhasil.
3. Akses profil Super Admin berhasil.
4. Pembuatan akun Ketua RT berhasil.
5. Pembuatan akun Ketua RW berhasil.
6. Pembuatan akun Bendahara RT berhasil.
7. Pembuatan akun Bendahara RW berhasil.
8. Ketua RT tidak dapat mengakses endpoint khusus Super Admin (HTTP 403).
9. Login warga yang belum diverifikasi ditolak sesuai aturan sistem.

## 14. Pengembangan Selanjutnya

Tahap pengembangan berikutnya adalah menyelesaikan dan menguji fitur verifikasi warga oleh Ketua RT.

Setelah itu, pengembangan dilanjutkan ke modul-modul pelayanan warga, pengelolaan data, pengumuman, pengaduan, surat administrasi, keuangan, serta integrasi frontend dengan backend.

---

**Ruang Warga**  
*Sistem Informasi Pelayanan dan Administrasi Warga Berbasis Website*
