import { Router } from "express";
import { loginAdmin, RegisterAdmin } from "../controllers/admin.controller.js";

const router = Router();

// Auth Routes
router.post("/register", RegisterAdmin);
router.post("/login", loginAdmin);

export default router;
