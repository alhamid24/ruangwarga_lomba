
import { db } from "../config/database.js";
import {
  hashPassword,
  comparePassword
} from "../utils/password.js";
import jwt from "jsonwebtoken";

import type {
  RegisterInput,
  AuthUser,
  LoginInput
} from "../types/auth.types.js";

// ==========================================
// 1. REGISTRASI WARGA
// ==========================================

export const registerUser = async (
  data: RegisterInput
): Promise<AuthUser> => {

  // 1. Validasi data dasar
  const fullName = data.full_name.trim();
  const email = data.email?.trim().toLowerCase() || null;
  const phone = data.phone?.trim() || null;
  const nik = data.nik.trim();

  if (!fullName || !data.password) {
    throw new Error("Nama lengkap dan password wajib diisi");
  }

  if (!email && !phone) {
    throw new Error("Email atau nomor telepon wajib diisi");
  }

  if (!/^\d{16}$/.test(nik)) {
    throw new Error("NIK harus terdiri dari 16 angka");
  }

  if (data.password.length < 8) {
    throw new Error("Password minimal 8 karakter");
  }

  if (!Number.isInteger(data.rt_id) || data.rt_id <= 0) {
    throw new Error("RT tidak valid");
  }

  // 2. Hash password
  const passwordHash = await hashPassword(data.password);

  // 3. Membuka koneksi transaksi
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // 4. Memastikan RT yang dipilih tersedia
    const rtResult = await client.query(
      "SELECT id FROM rts WHERE id = $1",
      [data.rt_id]
    );

    if (rtResult.rowCount === 0) {
      throw new Error("RT yang dipilih tidak ditemukan");
    }

    // 5. Mengambil role WARGA
    const roleResult = await client.query(
      "SELECT id FROM roles WHERE code = $1",
      ["WARGA"]
    );

    if (roleResult.rowCount === 0) {
      throw new Error("Role WARGA belum tersedia");
    }

    // 6. Menyimpan akun pengguna
    const userResult = await client.query(
      `INSERT INTO users (
        full_name,
        email,
        phone,
        password_hash
      )
      VALUES ($1, $2, $3, $4)
      RETURNING id, full_name, email, phone, status`,
      [fullName, email, phone, passwordHash]
    );

    const user = userResult.rows[0];

    // 7. Menyimpan identitas warga
    await client.query(
      `INSERT INTO residents (
        user_id,
        rt_id,
        nik,
        full_name,
        birth_place,
        birth_date,
        gender,
        address_detail
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        user.id,
        data.rt_id,
        nik,
        fullName,
        data.birth_place.trim(),
        data.birth_date,
        data.gender,
        data.address_detail.trim()
      ]
    );

    // 8. Memberikan role WARGA
    await client.query(
      `INSERT INTO user_roles (
        user_id,
        role_id
      )
      VALUES ($1, $2)`,
      [user.id, roleResult.rows[0].id]
    );

    // 9. Menyimpan seluruh perubahan
    await client.query("COMMIT");

    return user as AuthUser;

  } catch (error) {
    // Membatalkan transaksi jika terjadi kegagalan
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Database rollback error:", rollbackError);
    }

    const pgError = error as { code?: string };

    if (pgError.code === "23505") {
      throw new Error(
        "Email, nomor telepon, atau NIK sudah terdaftar"
      );
    }

    throw error;

  } finally {
    // Mengembalikan koneksi ke pool
    client.release();
  }
};


// ==========================================
// 2. LOGIN PENGGUNA
// ==========================================

export const loginUser = async (data: LoginInput) => {

  // 1. Validasi input
  const identifier =
    typeof data?.identifier === "string"
      ? data.identifier.trim()
      : "";

  const password =
    typeof data?.password === "string"
      ? data.password
      : "";

  if (!identifier || !password) {
    throw new Error(
      "Email/nomor telepon dan password wajib diisi"
    );
  }

  // 2. Mencari akun berdasarkan email atau nomor telepon
  const userResult = await db.query(
    `SELECT
       id,
       full_name,
       email,
       phone,
       password_hash,
       status
     FROM users
     WHERE LOWER(email) = LOWER($1)
        OR phone = $2
     LIMIT 1`,
    [identifier, identifier]
  );

  if (userResult.rowCount === 0) {
    throw new Error(
      "Email/nomor telepon atau password salah"
    );
  }

  const user = userResult.rows[0];

  // 3. Memeriksa password menggunakan bcrypt
  const passwordValid = await comparePassword(
    password,
    user.password_hash
  );

  if (!passwordValid) {
    throw new Error(
      "Email/nomor telepon atau password salah"
    );
  }

  // 4. Memeriksa status akun
  if (user.status === "suspended") {
    throw new Error("Akun sedang dinonaktifkan");
  }

  if (user.status !== "active") {
    throw new Error(
      "Akun belum aktif. Silakan menunggu verifikasi pengurus."
    );
  }

  // 5. Mengambil seluruh role pengguna
  const roleResult = await db.query(
    `SELECT
       r.id,
       r.code,
       r.name
     FROM user_roles ur
     JOIN roles r ON r.id = ur.role_id
     WHERE ur.user_id = $1`,
    [user.id]
  );

  const roles = roleResult.rows;

  if (roles.length === 0) {
    throw new Error("Akun belum memiliki role");
  }

  // 6. Memeriksa identitas khusus untuk akun WARGA
  const isCitizen = roles.some(
    (role: { code: string }) => role.code === "WARGA"
  );

  if (isCitizen) {
    const residentResult = await db.query(
      `SELECT verification_status
       FROM residents
       WHERE user_id = $1
       LIMIT 1`,
      [user.id]
    );

    if (residentResult.rowCount === 0) {
      throw new Error(
        "Data identitas warga tidak ditemukan"
      );
    }

    const verificationStatus =
      residentResult.rows[0].verification_status;

    if (verificationStatus === "pending") {
      throw new Error(
        "Identitas warga masih menunggu verifikasi"
      );
    }

    if (verificationStatus === "rejected") {
      throw new Error(
        "Identitas warga ditolak oleh pengurus"
      );
    }

    if (verificationStatus !== "verified") {
      throw new Error(
        "Status verifikasi warga tidak valid"
      );
    }
  }

  // 7. Memeriksa konfigurasi JWT
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error(
      "Konfigurasi JWT_SECRET belum tersedia"
    );
  }

  // 8. Membuat token JWT
  const token = jwt.sign(
    {
      sub: String(user.id),
      roles: roles.map(
        (role: { code: string }) => role.code
      )
    },
    jwtSecret,
    {
      expiresIn: (
        process.env.JWT_EXPIRES_IN || "1d"
      ) as jwt.SignOptions["expiresIn"]
    }
  );

  // 9. Mengembalikan token dan informasi pengguna
  return {
    token,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      status: user.status,
      roles: roles.map(
        (role: { id: number; code: string; name: string }) => ({
          id: role.id,
          code: role.code,
          name: role.name
        })
      )
    }
  };
};
