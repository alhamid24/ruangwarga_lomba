
import type { Request, Response } from "express";
import { createInitialSuperAdmin } from "../services/super-admin.service.js";

export const createSuperAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { full_name, email, password, setup_key } = req.body;

    const user = await createInitialSuperAdmin(
      {
        full_name,
        email,
        password,
      },
      setup_key
    );

    res.status(201).json({
      success: true,
      message: "Akun Super Admin pertama berhasil dibuat",
      data: user,
    });

  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan pada server";

    const statusCode =
      message.includes("Kunci bootstrap") ? 401 :
      message.includes("sudah tersedia") ? 409 :
      message.includes("wajib diisi") ? 400 :
      message.includes("minimal 8 karakter") ? 400 :
      message.includes("maksimal 72 karakter") ? 400 :
      message.includes("Format email") ? 400 :
      message.includes("tidak ditemukan") ? 500 :
      message.includes("Konfigurasi") ? 500 :
      500;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};
