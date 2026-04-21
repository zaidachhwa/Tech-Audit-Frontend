import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { GraduationCap, Mail, Lock, LogIn, RefreshCw, BookOpen, BarChart3, Users, Shield } from "lucide-react";
import { loginTeacher } from "../../api/syllabus.api";
import { useAuth } from "../../context/AuthContext";

export default function TeacherLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await loginTeacher(formData);
      login(res.token, { teacher: res.teacher });
      toast.success("Login successful!");
      navigate("/teacher/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <BookOpen size={18} color="#2563EB" />, title: "Syllabus Management", desc: "Track topics and course progress" },
    { icon: <BarChart3 size={18} color="#10B981" />, title: "Student Analytics", desc: "Monitor performance & completion" },
    { icon: <Users size={18} color="#F59E0B" />, title: "Batch Oversight", desc: "Manage multiple student batches" },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'DM Sans', sans-serif", background: "#F8FAFC" }}>
      <Toaster position="top-center" />
      
      {/* Role Selection Buttons */}
      <div style={{ position: "fixed", top: 24, right: 24, display: "flex", alignItems: "center", gap: 12, zIndex: 100 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#64748B", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.02em" }}>Sign in as:</span>
        <Link to="/student/login" style={{ textDecoration: "none" }}>
          <motion.button 
            whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.98 }}
            style={{ 
              padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700, 
              border: "1px solid #1B2B4B", background: "#1B2B4B", color: "#fff", 
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s"
            }}>
            <GraduationCap size={16} /> Student
          </motion.button>
        </Link>
        <Link to="/admin/login" style={{ textDecoration: "none" }}>
          <motion.button 
            whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.98 }}
            style={{ 
              padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700, 
              border: "1px solid #E2E8F0", background: "#fff", color: "#1B2B4B", 
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s"
            }}>
            <Shield size={16} /> Admin
          </motion.button>
        </Link>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      {/* LEFT BRANDING PANEL */}
      <div style={{ width: "50%", background: "#1B2B4B", flexDirection: "column", justifyContent: "center", padding: "60px 56px", position: "relative", overflow: "hidden" }} className="hidden lg:flex flex-col">
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 280, height: 280, borderRadius: "50%", background: "rgba(37,99,235,0.12)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(37,99,235,0.08)", pointerEvents: "none" }} />

        <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}>
            <div style={{ width: 48, height: 48, background: "#2563EB", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GraduationCap size={26} color="#fff" />
            </div>
            <div>
              <p style={{ color: "#fff", fontWeight: 800, fontSize: 18, margin: 0, letterSpacing: "-0.02em" }}>NexCore</p>
              <p style={{ color: "#94A3B8", fontSize: 12, margin: 0 }}>Institute of Technology</p>
            </div>
          </div>

          <h1 style={{ color: "#fff", fontSize: 34, fontWeight: 800, margin: "0 0 12px", lineHeight: 1.15, letterSpacing: "-0.03em" }}>
            Teacher Portal
          </h1>
          <p style={{ color: "#94A3B8", fontSize: 15, margin: "0 0 48px", lineHeight: 1.6 }}>
            Your command centre for managing courses, tracking student progress, and delivering excellence.
          </p>

          {/* Feature highlights */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {features.map((f) => (
              <div key={f.title} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 16px", background: "rgba(255,255,255,0.06)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <p style={{ color: "#E2E8F0", fontWeight: 600, fontSize: 13, margin: "0 0 2px" }}>{f.title}</p>
                  <p style={{ color: "#64748B", fontSize: 12, margin: 0 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* RIGHT FORM PANEL */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 32px" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ width: "100%", maxWidth: 440, background: "#fff", borderRadius: 16, border: "1.5px solid #E2E8F0", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: 36 }}>

          {/* Mobile logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }} className="lg:hidden">
            <div style={{ width: 40, height: 40, background: "#1B2B4B", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GraduationCap size={20} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, color: "#1B2B4B", fontSize: 16 }}>NexCore</span>
          </div>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1B2B4B", margin: "0 0 6px", letterSpacing: "-0.02em" }}>Sign in</h2>
            <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>Enter your credentials to access your teacher portal</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Email */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748B", display: "block", marginBottom: 8 }}>Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                <input
                  type="email"
                  placeholder="teacher@nexcore.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  style={{ width: "100%", padding: "11px 14px 11px 36px", border: "1.5px solid #E2E8F0", borderRadius: 8, fontSize: 13, color: "#1B2B4B", fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box", background: "#fff" }}
                  onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
                  onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748B", display: "block", marginBottom: 8 }}>Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  style={{ width: "100%", padding: "11px 14px 11px 36px", border: "1.5px solid #E2E8F0", borderRadius: 8, fontSize: 13, color: "#1B2B4B", fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box", background: "#fff" }}
                  onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
                  onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", background: loading ? "#93C5FD" : "#2563EB", color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "'DM Sans', sans-serif", transition: "background 0.2s" }}
            >
              {loading ? <><RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> Signing in...</> : <><LogIn size={16} /> Sign In</>}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 13, color: "#64748B", marginTop: 22 }}>
            Don't have an account?{" "}
            <Link to="/teacher/register" style={{ color: "#2563EB", fontWeight: 600, textDecoration: "none" }}>Sign Up</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}