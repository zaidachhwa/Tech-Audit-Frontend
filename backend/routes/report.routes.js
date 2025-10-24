import express from "express";
import {
  createReport,
  getAllReports,
  getReportsByStudent,
  getBatchAverages,
  compareBatchesByParameterDetailed,
} from "../controllers/report.controller.js";
import {
  isAdmin,
  isStudent,
  verifyToken,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Admin-only route
router.post("/create", verifyToken, isAdmin, createReport);
router.get("/", verifyToken, isAdmin, getAllReports);
router.get("/compare", verifyToken, isAdmin, compareBatchesByParameterDetailed);
router.get("/batch/average", verifyToken, isAdmin, getBatchAverages);

// Student-only route
router.get("/student/:studentId", verifyToken, isStudent, getReportsByStudent);

export default router;
