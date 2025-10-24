import jwt from "jsonwebtoken";
import { Admin } from "../model/admin.model.js";
import { Student } from "../model/student.model.js";

// Verify JWT and attach user info to request
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to req.user based on role
    if (decoded.role === "admin") {
      const admin = await Admin.findById(decoded.id).select("-password");
      if (!admin)
        return res.status(401).json({ message: "Invalid admin token" });
      req.user = admin;
      req.user.role = "admin";
    } else if (decoded.role === "student") {
      const student = await Student.findById(decoded.id).select("-password");
      if (!student)
        return res.status(401).json({ message: "Invalid student token" });
      req.user = student;
      req.user.role = "student";
    } else {
      return res.status(401).json({ message: "Invalid token role" });
    }

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Unauthorized", error: error.message });
  }
};

// Allow only Admins
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Access denied. Admins only." });
};

// Allow only Students
export const isStudent = (req, res, next) => {
  if (req.user && (req.user.role === "student" || req.user.role === "admin")) {
    return next();
  }
  return res.status(403).json({ message: "Access denied. Students only." });
};
