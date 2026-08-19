import { useState } from "react";
import { API } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Lock, Mail, Loader2, Shield, GraduationCap, UserCircle, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        email: form.email.trim().toLowerCase(),
        password: form.password.trim(),
      };
      const res = await API.post("/admin/login", payload);
      const token = res.data.token;
      const data = res.data;
      login(token, data, "admin");
      toast.success("Welcome back, Admin!", { duration: 2000 });
      setTimeout(() => navigate("/admin/dashboard"), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        backgroundColor: "#F8FAFC",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        input:focus {
          border-color: #0F3C8A !important;
          box-shadow: 0 0 0 3px rgba(15, 60, 138, 0.1);
        }
      `}</style>
      <Toaster position="top-center" />

      {/* Role Switcher (Top Right) */}
      <div style={{ position: "absolute", top: 24, right: 24, display: "flex", alignItems: "center", gap: 12, zIndex: 100 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B", letterSpacing: "0.02em" }}>Sign in as:</span>
        <Link to="/student/login" style={{ textDecoration: "none" }}>
          <motion.button
            whileHover={{ y: -1, boxShadow: "0 4px 12px rgba(15,60,138,0.08)" }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
              border: "1.5px solid #0F3C8A", background: "#0F3C8A", color: "#fff",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s"
            }}>
            <GraduationCap size={14} /> Student
          </motion.button>
        </Link>
        <Link to="/teacher/login" style={{ textDecoration: "none" }}>
          <motion.button
            whileHover={{ y: -1, boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
              border: "1.5px solid #E2E8F0", background: "#fff", color: "#0F3C8A",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s"
            }}>
            <UserCircle size={14} /> Teacher
          </motion.button>
        </Link>
      </div>

      {/* Centered Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: "100%", maxWidth: "440px" }}
      >
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            padding: "40px 32px",
            boxShadow: "0 10px 25px -5px rgba(15, 30, 54, 0.04), 0 8px 10px -6px rgba(15, 30, 54, 0.04)",
            border: "1px solid #F1F5F9",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          {/* Logo */}
          <img
            src="/logo.png"
            alt="Nexcore Institute of Technology"
            style={{ width: "90px", height: "90px", objectFit: "cover", marginBottom: "16px" }}
          />

          {/* Brand Labels */}
        

          {/* Form Header */}
          <div style={{ alignSelf: "flex-start", width: "100%", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1E293B", margin: 0 }}>
              Admin Sign In
            </h3>
            <p style={{ color: "#64748B", fontSize: "12px", margin: "4px 0 0" }}>
              Access administrative settings and trackers
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px", width: "100%" }}>
            {/* Email */}
            <div>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "#475569", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={15}
                  style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}
                />
                <input
                  type="email"
                  placeholder="admin@nexcore.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  style={{
                    width: "100%", padding: "10px 12px 10px 36px",
                    border: "1.5px solid #E2E8F0", borderRadius: "8px",
                    fontSize: "13px", color: "#1E293B", outline: "none",
                    backgroundColor: "#FFFFFF", transition: "all 0.2s",
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "#475569", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={15}
                  style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  style={{
                    width: "100%", padding: "10px 36px 10px 36px",
                    border: "1.5px solid #E2E8F0", borderRadius: "8px",
                    fontSize: "13px", color: "#1E293B", outline: "none",
                    backgroundColor: "#FFFFFF", transition: "all 0.2s",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "#94A3B8",
                    display: "flex", alignItems: "center", justifyContent: "center", padding: 0
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "11px",
                backgroundColor: "#0F3C8A", color: "#FFFFFF",
                border: "none", borderRadius: "8px",
                fontWeight: "600", fontSize: "13px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                transition: "background-color 0.2s",
                marginTop: "6px"
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#0b2c66"; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#0F3C8A"; }}
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin" /> Signing in...</>
              ) : (
                <><Shield size={15} /> Sign In as Admin</>
              )}
            </button>
          </form>

          {/* Contact Support */}
          <p style={{ textAlign: "center", marginTop: "24px", fontSize: "12px", color: "#94A3B8" }}>
            Authorized access only.{" "}
            <a href="/contact" style={{ color: "#FF6B00", fontWeight: "600", textDecoration: "none" }}>
              Contact Admin Support
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}