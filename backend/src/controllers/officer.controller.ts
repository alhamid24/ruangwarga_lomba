
import type { Request, Response } from "express";
import { createOfficer } from "../services/officer.service.js";

export const createOfficerAccount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Anda harus login terlebih dahulu",
      });
      return;
    }

    const officer = await createOfficer(
      req.body,
      req.user.id
    );

    res.status(201).json({
      success: true,
      message: "Akun pengurus berhasil dibuat",
      data: officer,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan pada server";

    const statusCode =
      message.includes("wajib diisi") ||
      message.includes("tidak valid") ||
      message.includes("minimal 8 karakter") ||
      message.includes("maksimal 72 byte") ||
      message.includes("Format email")
        ? 400
        : message.includes("tidak ditemukan")
          ? 404
          : message.includes("sudah digunakan")
            ? 409
            : 500;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};
