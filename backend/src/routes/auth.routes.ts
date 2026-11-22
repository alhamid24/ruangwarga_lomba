
import { Router } from "express";
import {
  register,
  login,
} from "../controllers/auth.controller.js";

const router = Router();

// Registrasi warga
router.post("/register", register);

// Login warga dan pengurus
router.post("/login", login);

export default router;