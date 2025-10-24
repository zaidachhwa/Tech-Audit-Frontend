// routes/batch.routes.js
import express from "express";
import {
  createBatch,
  getAllBatches,
  getBatchById,
  addStudentToBatch,
} from "../controllers/batch.controller.js";
import { isAdmin, verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Create a new batch
router.post("/create", verifyToken, isAdmin, createBatch);

// Get all batches
router.get("/", verifyToken, isAdmin, getAllBatches);

// Get one batch by ID (with students)
router.get("/:id", verifyToken, isAdmin, getBatchById);

// Add student(s) to batch
router.put("/:id/add-student", verifyToken, isAdmin, addStudentToBatch);

export default router;
