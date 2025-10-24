import { Router } from "express";
import {
  deleteStudent,
  getAllStudents,
  loginStudent,
  registerStudent,
} from "../controllers/student.controller.js";
import { isAdmin, verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", registerStudent);
router.post("/login", loginStudent);
router.get("/list", getAllStudents);

// Admin protected route
router.delete("/delete/:id", verifyToken, isAdmin, deleteStudent);

export default router;
