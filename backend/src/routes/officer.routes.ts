
import { Router } from "express";

import {
  createOfficerAccount,
} from "../controllers/officer.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

// Membuat akun pengurus
router.post(
  "/",
  authenticate,
  authorizeRoles("SUPER_ADMIN"),
  createOfficerAccount
);

export default router;
