
import { Router } from "express";

import {
  createSuperAdmin,
  getSuperAdminProfile,
} from "../controllers/super-admin.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

// Bootstrap Super Admin pertama
router.post("/bootstrap", createSuperAdmin);

// Profil khusus Super Admin
router.get(
  "/profile",
  authenticate,
  authorizeRoles("SUPER_ADMIN"),
  getSuperAdminProfile
);

export default router;
