
import { Router } from "express";
import { createSuperAdmin } from "../controllers/super-admin.controller.js";

const router = Router();

router.post("/bootstrap", createSuperAdmin);

export default router;
