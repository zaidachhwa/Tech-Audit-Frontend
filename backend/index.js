import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/admin.routes.js";
import studentRoutes from "./routes/student.routes.js";
import reportRoutes from "./routes/report.routes.js";
import batchRoutes from "./routes/batch.routes.js";
import projectRoutes from "./routes/project.routes.js";

dotenv.config({ path: "./.env" });

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
connectDB();

// Routes

app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/batch", batchRoutes);
app.use("/api/projects", projectRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
