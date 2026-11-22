
import type { Request, Response } from "express";
import {
  registerUser,
  loginUser,
} from "../services/auth.service.js";

// ==========================================
// REGISTER / PENDAFTARAN WARGA
// ==========================================
export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "Registrasi berhasil. Silakan menunggu verifikasi pengurus.",
      data: user,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan pada server";

    const statusCode =
      message.includes("sudah terdaftar") ? 409 :
      message.includes("tidak ditemukan") ? 400 :
      message.includes("wajib diisi") ? 400 :
      message.includes("tidak valid") ? 400 :
      message.includes("minimal 8 karakter") ? 400 :
      message.includes("belum tersedia") ? 500 :
      500;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

// ==========================================
// LOGIN / MASUK PENGGUNA
// ==========================================
export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await loginUser(req.body);

    res.status(200).json({
      success: true,
      message: "Login berhasil",
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan pada server";

    const statusCode =
      message.includes("salah") ? 401 :
      message.includes("dinonaktifkan") ? 403 :
      message.includes("belum aktif") ? 403 :
      message.includes("menunggu verifikasi") ? 403 :
      message.includes("ditolak") ? 403 :
      message.includes("tidak ditemukan") ? 403 :
      message.includes("belum memiliki role") ? 403 :
      message.includes("tidak valid") ? 400 :
      message.includes("wajib diisi") ? 400 :
      500;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};
