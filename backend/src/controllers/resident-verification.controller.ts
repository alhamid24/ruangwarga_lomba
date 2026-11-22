
import type { Request, Response } from "express";
import {
  getPendingResidents,
  approveResident,
  rejectResident,
} from "../services/resident-verification.service.js";

// Melihat daftar warga yang menunggu verifikasi
export const getPendingResidentsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const residents = await getPendingResidents(req.user!.id);

    res.status(200).json({
      success: true,
      message: "Daftar warga menunggu verifikasi berhasil diambil",
      data: residents,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal mengambil daftar warga",
    });
  }
};

// Menyetujui pendaftaran warga
export const approveResidentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const residentId = Number(req.params.id);

    if (!Number.isSafeInteger(residentId) || residentId <= 0) {
      res.status(400).json({
        success: false,
        message: "ID warga tidak valid",
      });
      return;
    }

    const result = await approveResident(residentId, req.user!.id);

    res.status(200).json({
      success: true,
      message: "Pendaftaran warga berhasil disetujui",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal menyetujui pendaftaran warga",
    });
  }
};

// Menolak pendaftaran warga
export const rejectResidentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const residentId = Number(req.params.id);

    if (!Number.isSafeInteger(residentId) || residentId <= 0) {
      res.status(400).json({
        success: false,
        message: "ID warga tidak valid",
      });
      return;
    }

    const result = await rejectResident(residentId, req.user!.id);

    res.status(200).json({
      success: true,
      message: "Pendaftaran warga berhasil ditolak",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal menolak pendaftaran warga",
    });
  }
};
