import express from "express";
import {
  assignProjectToBatch,
  getProjectsByBatch,
  getProjectsByStudent,
  updateModuleStatus,
  updateProjectStatus,
  submitProject,
  approveProject,
} from "../controllers/project.controller.js";
import {
  verifyToken,
  isAdmin,
  isStudent,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// 🔹 Admin assigns a project to entire batch
router.post("/assign-to-batch", verifyToken, isAdmin, assignProjectToBatch);

// 🔹 Admin gets all projects for a batch
router.get("/batch/:batchId", verifyToken, isAdmin, getProjectsByBatch);

// 🔹 Student gets their own projects
router.get("/student/:studentId", verifyToken, isStudent, getProjectsByStudent);

// 🔹 Student updates module status
router.patch("/module/:moduleId", verifyToken, isStudent, updateModuleStatus);

// 🔹 Student updates overall project progress
router.patch("/:projectId/status", verifyToken, isStudent, updateProjectStatus);

// 🔹 Student submits project for admin approval
router.patch("/:projectId/submit", verifyToken, isStudent, submitProject);

// 🔹 Admin approves a student's project
router.patch("/:projectId/approve", verifyToken, isAdmin, approveProject);

export default router;
