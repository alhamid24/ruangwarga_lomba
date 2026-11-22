
import { db } from "../config/database.js";
import { hashPassword } from "../utils/password.js";
import { timingSafeEqual } from "node:crypto";

interface CreateSuperAdminInput {
  full_name: string;
  email: string;
  password: string;
}

export const createInitialSuperAdmin = async (
  data: CreateSuperAdminInput,
  setupKey: string
) => {
  // 1. Memeriksa kunci bootstrap
  const configuredKey = process.env.SUPER_ADMIN_SETUP_KEY;

  if (!configuredKey) {
    throw new Error("Konfigurasi kunci Super Admin belum tersedia");
  }

  if (
    typeof setupKey !== "string" ||
    setupKey.length === 0
  ) {
    throw new Error("Kunci bootstrap wajib diisi");
  }

  const suppliedBuffer = Buffer.from(setupKey);
  const configuredBuffer = Buffer.from(configuredKey);

  if (
    suppliedBuffer.length !== configuredBuffer.length ||
    !timingSafeEqual(suppliedBuffer, configuredBuffer)
  ) {
    throw new Error("Kunci bootstrap tidak valid");
  }

  // 2. Validasi data akun
  const fullName =
    typeof data.full_name === "string"
      ? data.full_name.trim()
      : "";

  const email =
    typeof data.email === "string"
      ? data.email.trim().toLowerCase()
      : "";

  const password =
    typeof data.password === "string"
      ? data.password
      : "";

  if (!fullName || !email || !password) {
    throw new Error("Nama, email, dan password wajib diisi");
  }

  if (password.length < 8) {
    throw new Error("Password minimal 8 karakter");
  }

  if (Buffer.byteLength(password, "utf8") > 72) {
    throw new Error("Password maksimal 72 byte");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Format email tidak valid");
  }

  // 3. Mengubah password menjadi hash
  const passwordHash = await hashPassword(password);

  // 4. Membuka koneksi database
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Mengunci proses bootstrap agar tidak berjalan bersamaan
    await client.query(
      "SELECT pg_advisory_xact_lock($1)",
      [20261121]
    );

    // 5. Memastikan Super Admin belum tersedia
    const existingAdmin = await client.query(
      `SELECT 1
       FROM user_roles ur
       JOIN roles r ON r.id = ur.role_id
       WHERE r.code = $1
       LIMIT 1`,
      ["SUPER_ADMIN"]
    );

    if (existingAdmin.rowCount !== 0) {
      throw new Error("Akun Super Admin sudah tersedia");
    }

    // 6. Mengambil role SUPER_ADMIN
    const roleResult = await client.query(
      "SELECT id FROM roles WHERE code = $1",
      ["SUPER_ADMIN"]
    );

    if (roleResult.rowCount === 0) {
      throw new Error("Role SUPER_ADMIN tidak ditemukan");
    }

    // 7. Membuat akun pengguna
    const userResult = await client.query(
      `INSERT INTO users (
        full_name,
        email,
        phone,
        password_hash,
        status
      )
      VALUES ($1, $2, NULL, $3, 'active')
      RETURNING id, full_name, email, status`,
      [fullName, email, passwordHash]
    );

    const user = userResult.rows[0];

    // 8. Memberikan role SUPER_ADMIN
    await client.query(
      `INSERT INTO user_roles (
        user_id,
        role_id
      )
      VALUES ($1, $2)`,
      [user.id, roleResult.rows[0].id]
    );

    // 9. Menyimpan seluruh transaksi
    await client.query("COMMIT");

    // 10. Menonaktifkan kunci pada proses server saat ini
    process.env.SUPER_ADMIN_SETUP_KEY = "";

    return user;

  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Database rollback error:", rollbackError);
    }

    const pgError = error as { code?: string };

    if (pgError.code === "23505") {
      throw new Error("Email sudah terdaftar");
    }

    throw error;

  } finally {
    // Mengembalikan koneksi ke connection pool
    client.release();
  }
};
