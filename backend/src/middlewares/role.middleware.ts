
import type {
  Request,
  Response,
  NextFunction,
} from "express";

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {

    // Pastikan pengguna sudah melewati autentikasi
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Anda harus login terlebih dahulu",
      });
      return;
    }

    // Periksa apakah pengguna memiliki role yang diizinkan
    const hasAccess = req.user.roles.some((role) =>
      allowedRoles.includes(role)
    );

    if (!hasAccess) {
      res.status(403).json({
        success: false,
        message: "Anda tidak memiliki hak akses untuk fitur ini",
      });
      return;
    }

    // Jika role sesuai, lanjutkan request
    next();
  };
};
