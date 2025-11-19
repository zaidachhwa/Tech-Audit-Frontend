// ============================================
// src/api/syllabus.api.js - API Helper Functions
// ============================================
import { API } from "./axios";

/**
 * ADMIN APIs
 */

// Create a new syllabus
export const createSyllabus = async (data) => {
  try {
    const res = await API.post("/syllabus/create", data);
    return res.data;
  } catch (error) {
    console.error("Error creating syllabus:", error);
    throw error;
  }
};

// Add topic to syllabus
export const addTopic = async (data) => {
  try {
    const res = await API.post("/syllabus/topic", data);
    return res.data;
  } catch (error) {
    console.error("Error adding topic:", error);
    throw error;
  }
};

// Assign topic to teacher
export const assignTopicToTeacher = async (data) => {
  try {
    const res = await API.patch("/syllabus/assign-topic", data);
    return res.data;
  } catch (error) {
    console.error("Error assigning topic:", error);
    throw error;
  }
};

// Get syllabus with progress
export const getSyllabusProgress = async (syllabusId) => {
  try {
    const res = await API.get(`/syllabus/progress/${syllabusId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching syllabus progress:", error);
    throw error;
  }
};

// Get all syllabi (need to add this endpoint to backend)
export const getAllSyllabi = async () => {
  try {
    const res = await API.get("/syllabus/all");
    return res.data;
  } catch (error) {
    console.error("Error fetching all syllabi:", error);
    throw error;
  }
};

/**
 * TEACHER APIs
 */

// Get teacher's topics
export const getTeacherTopics = async () => {
  try {
    const res = await API.get("/syllabus/my-topics");
    return res.data;
  } catch (error) {
    console.error("Error fetching teacher topics:", error);
    throw error;
  }
};

// Mark topic as completed
export const markTopicCompleted = async (topicId) => {
  try {
    const res = await API.patch(`/syllabus/topic/${topicId}/complete`);
    return res.data;
  } catch (error) {
    console.error("Error marking topic as completed:", error);
    throw error;
  }
};

// Add remark to topic
export const addTopicRemark = async (topicId, remark) => {
  try {
    const res = await API.patch(`/syllabus/topic/${topicId}/remark`, {
      remark,
    });
    return res.data;
  } catch (error) {
    console.error("Error adding topic remark:", error);
    throw error;
  }
};

/**
 * TEACHER AUTH APIs
 */

// Register teacher
export const registerTeacher = async (data) => {
  try {
    const res = await API.post("/teachers/register", data);
    return res.data;
  } catch (error) {
    console.error("Error registering teacher:", error);
    throw error;
  }
};

// Login teacher
export const loginTeacher = async (credentials) => {
  try {
    const res = await API.post("/teachers/login", credentials);
    return res.data;
  } catch (error) {
    console.error("Error logging in teacher:", error);
    throw error;
  }
};

// Get all teachers (for admin)
export const getAllTeachers = async () => {
  try {
    const res = await API.get("/teachers/list");
    return res.data;
  } catch (error) {
    console.error("Error fetching teachers:", error);
    throw error;
  }
};

// ============================================
// BACKEND ADDITIONS NEEDED
// ============================================

// Add these routes to your backend:
// routes/syllabus.routes.js

/*
import express from "express";
import {
  verifyToken,
  isAdmin,
  isTeacher,
} from "../middleware/auth.middleware.js";
import {
  createSyllabus,
  addTopic,
  assignTopicToTeacher,
  getTeacherTopics,
  markTopicCompleted,
  addTopicRemark,
  getSyllabusWithProgress,
  getAllSyllabi, // NEW
} from "../controllers/syllabus.controller.js";

const router = express.Router();

// ADMIN
router.post("/create", verifyToken, isAdmin, createSyllabus);
router.post("/topic", verifyToken, isAdmin, addTopic);
router.patch("/assign-topic", verifyToken, isAdmin, assignTopicToTeacher);
router.get("/progress/:syllabusId", verifyToken, isAdmin, getSyllabusWithProgress);
router.get("/all", verifyToken, isAdmin, getAllSyllabi); // NEW ROUTE

// TEACHER
router.get("/my-topics", verifyToken, isTeacher, getTeacherTopics);
router.patch("/topic/:topicId/complete", verifyToken, isTeacher, markTopicCompleted);
router.patch("/topic/:topicId/remark", verifyToken, isTeacher, addTopicRemark);

export default router;
*/

// ============================================
// Add this controller function to syllabus.controller.js
// ============================================

/*
// ADMIN: Get all syllabi with populated data
export const getAllSyllabi = async (req, res) => {
  try {
    const syllabi = await Syllabus.find()
      .populate("topics")
      .populate("assignedTeachers", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ syllabi });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
*/

// ============================================
// Add this route to teacher.routes.js
// ============================================

/*
// GET ALL TEACHERS (for admin assignment)
router.get("/list", verifyToken, isAdmin, async (req, res) => {
  try {
    const teachers = await Teacher.find().select("-password");
    res.json({ teachers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
*/

// ============================================
// App.jsx Route Configuration
// ============================================

/*
// Add these routes to your App.jsx

import AdminSyllabusManagement from "./components/admin/AdminSyllabusManagement";
import TeacherSyllabusDashboard from "./components/teacher/TeacherSyllabusDashboard";
import TeacherLogin from "./components/teacher/TeacherLogin";

// In your routes:

// Admin route
<Route
  path="/admin/syllabus"
  element={
    <PrivateRoute role="admin">
      <AdminSyllabusManagement />
    </PrivateRoute>
  }
/>

// Teacher routes
<Route path="/teacher/login" element={<TeacherLogin />} />
<Route
  path="/teacher/dashboard"
  element={
    <PrivateRoute role="teacher">
      <TeacherSyllabusDashboard />
    </PrivateRoute>
  }
/>
*/

// ============================================
// TeacherLogin.jsx Component
// ============================================

/*
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { BookOpen, Mail, Lock, LogIn } from "lucide-react";
import { loginTeacher } from "../../api/syllabus.api";

export default function TeacherLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await loginTeacher(formData);
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.teacher));
      toast.success("Login successful!");
      navigate("/teacher/dashboard");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 flex items-center justify-center p-6">
      <Toaster position="top-right" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/30"
      >
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Teacher Login
          </h1>
          <p className="text-gray-600">
            Access your syllabus dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                placeholder="teacher@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="animate-spin" size={20} />
            ) : (
              <>
                <LogIn size={20} />
                Login
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
*/

// ============================================
// AuthContext.jsx Update
// ============================================

/*
// Add teacher role support in your AuthContext

const getUserFromStorage = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// In your login function, handle all roles:
const login = (token, userData) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(userData));
  setUser(userData);

  // Navigate based on role
  if (userData.role === "admin") {
    navigate("/admin/dashboard");
  } else if (userData.role === "teacher") {
    navigate("/teacher/dashboard");
  } else {
    navigate("/student/dashboard");
  }
};
*/
