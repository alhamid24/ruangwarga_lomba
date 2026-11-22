import { db } from "../config/database.js";
import type { PoolClient, Pool } from "pg";

// Mendapatkan daftar RT yang menjadi tanggung jawab Ketua RT
const getAssignedRtIds = async (
  userId: number,
  client: Pool | PoolClient = db
): Promise<number[]> => {
  const result = await client.query(
    `SELECT ur.rt_id
     FROM ruangwarga.user_roles ur
     JOIN ruangwarga.roles r ON r.id = ur.role_id
     WHERE ur.user_id = $1
       AND r.code = 'KETUA_RT'
       AND ur.rt_id IS NOT NULL`,
    [userId]
  );

  return result.rows.map((row) => Number(row.rt_id));
};

// Melihat daftar warga yang menunggu verifikasi
export const getPendingResidents = async (userId: number) => {
  const rtIds = await getAssignedRtIds(userId);

  if (rtIds.length === 0) {
    throw new Error("Anda tidak memiliki wilayah tugas sebagai Ketua RT");
  }

  const result = await db.query(
    `SELECT
       r.id AS resident_id,
       r.user_id,
       r.full_name,
       r.nik,
       r.birth_place,
       r.birth_date,
       r.gender,
       r.address_detail,
       r.rt_id,
       rt.rt_number,
       r.verification_status,
       r.created_at
     FROM ruangwarga.residents r
     JOIN ruangwarga.rts rt ON rt.id = r.rt_id
     WHERE r.verification_status = 'pending'
       AND r.rt_id = ANY($1::bigint[])
     ORDER BY r.created_at ASC`,
    [rtIds]
  );

  return result.rows;
};

// Menyetujui pendaftaran warga
export const approveResident = async (
  residentId: number,
  userId: number
) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const rtIds = await getAssignedRtIds(userId, client);

    if (rtIds.length === 0) {
      throw new Error("Anda tidak memiliki wilayah tugas sebagai Ketua RT");
    }

    // Memeriksa warga sekaligus membatasi wilayah tugas
    const residentResult = await client.query(
      `SELECT id, user_id
       FROM ruangwarga.residents
       WHERE id = $1
         AND rt_id = ANY($2::bigint[])
         AND verification_status = 'pending'
       FOR UPDATE`,
      [residentId, rtIds]
    );

    if (residentResult.rowCount === 0) {
      throw new Error(
        "Data warga tidak ditemukan atau bukan wilayah tugas Anda"
      );
    }

    const resident = residentResult.rows[0];

    if (!resident.user_id) {
      throw new Error("Data warga tidak terhubung dengan akun pengguna");
    }

    // Memperbarui status verifikasi warga
    await client.query(
      `UPDATE ruangwarga.residents
       SET verification_status = 'verified',
           verified_by = $1,
           verified_at = NOW(),
           updated_at = NOW()
       WHERE id = $2`,
      [userId, residentId]
    );

    // Mengaktifkan akun warga
    const userResult = await client.query(
      `UPDATE ruangwarga.users
       SET status = 'active',
           updated_at = NOW()
       WHERE id = $1
         AND status = 'pending'`,
      [resident.user_id]
    );

    if (userResult.rowCount === 0) {
      throw new Error("Akun warga tidak ditemukan atau tidak berstatus pending");
    }

    await client.query("COMMIT");

    return {
      resident_id: residentId,
      user_id: Number(resident.user_id),
      verification_status: "verified",
      account_status: "active",
      verified_by: userId,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Menolak pendaftaran warga
export const rejectResident = async (
  residentId: number,
  userId: number
) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const rtIds = await getAssignedRtIds(userId, client);

    if (rtIds.length === 0) {
      throw new Error("Anda tidak memiliki wilayah tugas sebagai Ketua RT");
    }

    const residentResult = await client.query(
      `SELECT id, user_id
       FROM ruangwarga.residents
       WHERE id = $1
         AND rt_id = ANY($2::bigint[])
         AND verification_status = 'pending'
       FOR UPDATE`,
      [residentId, rtIds]
    );

    if (residentResult.rowCount === 0) {
      throw new Error(
        "Data warga tidak ditemukan atau bukan wilayah tugas Anda"
      );
    }

    const resident = residentResult.rows[0];

    if (!resident.user_id) {
      throw new Error("Data warga tidak terhubung dengan akun pengguna");
    }

    // Mengubah status verifikasi menjadi rejected
    await client.query(
      `UPDATE ruangwarga.residents
       SET verification_status = 'rejected',
           verified_by = $1,
           verified_at = NOW(),
           updated_at = NOW()
       WHERE id = $2`,
      [userId, residentId]
    );

    // Menonaktifkan akses akun yang ditolak
    const userResult = await client.query(
      `UPDATE ruangwarga.users
       SET status = 'suspended',
           updated_at = NOW()
       WHERE id = $1
         AND status = 'pending'`,
      [resident.user_id]
    );

    if (userResult.rowCount === 0) {
      throw new Error("Akun warga tidak ditemukan atau tidak berstatus pending");
    }

    await client.query("COMMIT");

    return {
      resident_id: residentId,
      user_id: Number(resident.user_id),
      verification_status: "rejected",
      account_status: "suspended",
      verified_by: userId,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
