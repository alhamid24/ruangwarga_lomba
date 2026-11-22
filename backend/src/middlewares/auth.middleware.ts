
import type {
  Request,
  Response,
  NextFunction,
} from "express";

import jwt from "jsonwebtoken";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 1. Ambil token dari header Authorization
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Token autentikasi tidak ditemukan",
    });
    return;
  }

  // 2. Pisahkan kata Bearer dari token
  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Format token tidak valid",
    });
    return;
  }

  // 3. Ambil JWT_SECRET dari environment
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    res.status(500).json({
      success: false,
      message: "Konfigurasi autentikasi server belum tersedia",
    });
    return;
  }

  try {
    // 4. Verifikasi token JWT
    const decoded = jwt.verify(token, jwtSecret);

    // 5. Pastikan payload JWT berbentuk object
    if (
      typeof decoded === "string" ||
      !decoded.sub ||
      !Array.isArray(decoded.roles)
    ) {
      res.status(401).json({
        success: false,
        message: "Payload token tidak valid",
      });
      return;
    }

    // 6. Ambil ID dan role dari token
    const userId = Number(decoded.sub);

    const roles = decoded.roles.filter(
      (role): role is string => typeof role === "string"
    );

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      res.status(401).json({
        success: false,
        message: "Identitas pengguna pada token tidak valid",
      });
      return;
    }

    // 7. Simpan informasi pengguna ke request
    req.user = {
      id: userId,
      roles,
    };

    // 8. Lanjutkan ke proses berikutnya
    next();

  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Token tidak valid atau sudah kedaluwarsa",
    });
  }
};
