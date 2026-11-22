
import { db } from "../config/database.js";
import { hashPassword } from "../utils/password.js";

type OfficerRole =
  | "KETUA_RT"
  | "KETUA_RW"
  | "BENDAHARA_RT"
  | "BENDAHARA_RW";

interface CreateOfficerInput {
  full_name: string;
  email?: string;
  phone?: string;
  password: string;
  role_code: OfficerRole;
  rt_id?: number;
  rw_id?: number;
}

export const createOfficer = async (
  input: CreateOfficerInput,
  assignedBy: number
) => {
  const {
    full_name,
    email,
    phone,
    password,
    role_code,
    rt_id,
    rw_id,
  } = input;

  // 1. Validasi data wajib
  if (
    !full_name?.trim() ||
    !password ||
    !role_code
  ) {
    throw new Error("Nama, password, dan role wajib diisi");
  }

  // 2. Validasi email atau nomor HP
  const normalizedEmail = email?.trim().toLowerCase() || null;
  const normalizedPhone = phone?.trim() || null;

  if (!normalizedEmail && !normalizedPhone) {
    throw new Error("Email atau nomor HP wajib diisi");
  }

  if (
    normalizedEmail &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  ) {
    throw new Error("Format email tidak valid");
  }

  if (password.length < 8) {
    throw new Error("Password minimal 8 karakter");
  }

  if (Buffer.byteLength(password, "utf8") > 72) {
    throw new Error("Password maksimal 72 byte");
  }

  // 3. Validasi wilayah berdasarkan role
  const rtRoles: OfficerRole[] = ["KETUA_RT", "BENDAHARA_RT"];
  const rwRoles: OfficerRole[] = ["KETUA_RW", "BENDAHARA_RW"];

  if (rtRoles.includes(role_code)) {
    if (!Number.isSafeInteger(rt_id) || !rt_id || rw_id != null) {
      throw new Error("Role RT wajib memiliki rt_id dan tidak boleh memiliki rw_id");
    }
  } else if (rwRoles.includes(role_code)) {
    if (!Number.isSafeInteger(rw_id) || !rw_id || rt_id != null) {
      throw new Error("Role RW wajib memiliki rw_id dan tidak boleh memiliki rt_id");
    }
  } else {
    throw new Error("Role pengurus tidak valid");
  }

  // 4. Membuat hash password
  const passwordHash = await hashPassword(password);

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // 5. Memastikan role tersedia
    const roleResult = await client.query(
      `SELECT id, code
       FROM ruangwarga.roles
       WHERE code = $1`,
      [role_code]
    );

    if (roleResult.rowCount === 0) {
      throw new Error("Role pengurus tidak ditemukan");
    }

    const roleId = roleResult.rows[0].id;

    // 6. Memastikan wilayah RT tersedia
    if (rt_id != null) {
      const rtResult = await client.query(
        `SELECT id
         FROM ruangwarga.rts
         WHERE id = $1`,
        [rt_id]
      );

      if (rtResult.rowCount === 0) {
        throw new Error("RT yang dipilih tidak ditemukan");
      }
    }

    // 7. Memastikan wilayah RW tersedia
    if (rw_id != null) {
      const rwResult = await client.query(
        `SELECT id
         FROM ruangwarga.rws
         WHERE id = $1`,
        [rw_id]
      );

      if (rwResult.rowCount === 0) {
        throw new Error("RW yang dipilih tidak ditemukan");
      }
    }

    // 8. Membuat akun pengguna
    const userResult = await client.query(
      `INSERT INTO ruangwarga.users
       (full_name, email, phone, password_hash, status)
       VALUES ($1, $2, $3, $4, 'active')
       RETURNING id, full_name, email, phone, status`,
      [
        full_name.trim(),
        normalizedEmail,
        normalizedPhone,
        passwordHash,
      ]
    );

    const user = userResult.rows[0];

    // 9. Menghubungkan akun dengan role dan wilayah
    await client.query(
      `INSERT INTO ruangwarga.user_roles
       (user_id, role_id, assigned_by, rt_id, rw_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        user.id,
        roleId,
        assignedBy,
        rt_id ?? null,
        rw_id ?? null,
      ]
    );

    await client.query("COMMIT");

    return {
      ...user,
      role: role_code,
      rt_id: rt_id ?? null,
      rw_id: rw_id ?? null,
    };
  } catch (error) {
    await client.query("ROLLBACK");

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "23505"
    ) {
      throw new Error("Email, nomor HP, atau penugasan role sudah digunakan");
    }

    throw error;
  } finally {
    client.release();
  }
};
