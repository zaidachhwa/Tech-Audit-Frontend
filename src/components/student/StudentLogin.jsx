import { useState } from "react";
import { API } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { Lock, Mail, Loader2, GraduationCap, BookOpen, BarChart2, Layers, LogIn, Shield, UserCircle } from "lucide-react";

const S = {
  input: { width: "100%", padding: "11px 14px 11px 36px", border: "1.5px solid #E2E8F0", borderRadius: 8, fontSize: 13, color: "#1B2B4B", fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box", background: "#fff" },
  label: { fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748B", display: "block", marginBottom: 8 },
};

export default function StudentLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/students/login", form);
      login(res.data.token, res.data, "student");
      toast.success("Welcome back!");
      setTimeout(() => navigate("/student/dashboard"), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <BookOpen size={17} color="#2563EB" />, title: "Track Projects", desc: "Monitor your assigned projects" },
    { icon: <BarChart2 size={17} color="#10B981" />, title: "View Reports", desc: "Check your evaluation scores" },
    { icon: <Layers size={17} color="#F59E0B" />, title: "Manage Modules", desc: "Update module completion status" },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'DM Sans', sans-serif", background: "#F8FAFC" }}>
      <Toaster position="top-center" />

      {/* Role Selection Buttons */}

      <div style={{ position: "fixed", top: 24, right: 24, display: "flex", alignItems: "center", gap: 12, zIndex: 100 }}>
        <span style={{ fontSize: 17, fontWeight: 900, color: "#1B2B4B", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.02em" }}>Sign in as:</span>
        <Link to="/admin/login" style={{ textDecoration: "none" }}>
          <motion.button
            whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700,
              border: "1px solid #1B2B4B", background: "#1B2B4B", color: "#fff",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s"
            }}>
            <Shield size={16} /> Admin
          </motion.button>
        </Link>
        <Link to="/teacher/login" style={{ textDecoration: "none" }}>
          <motion.button
            whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700,
              border: "1px solid #E2E8F0", background: "#1B2B4B", color: "#fff",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s"
            }}>
            <UserCircle size={16} /> Teacher
          </motion.button>
        </Link>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap'); 
        @keyframes spin{to{transform:rotate(360deg)}}
        @media (max-width: 900px) {
          .desktop-branding { display: none !important; }
          .form-container { padding: 24px !important; }
        }
        @media (min-width: 901px) {
          .mobile-logo { display: none !important; }
        }
      `}</style>

      {/* Left branding */}
      <div className="desktop-branding" style={{ width: "50%", background: "#1B2B4B", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 56px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 280, height: 280, borderRadius: "50%", background: "rgba(37,99,235,0.12)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: "rgba(37,99,235,0.08)", pointerEvents: "none" }} />

        <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}>
            <div style={{ width: 48, height: 48, background: "#2563EB", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GraduationCap size={26} color="#fff" />
            </div>
            <div>
              <p style={{ color: "#fff", fontWeight: 800, fontSize: 18, margin: 0, letterSpacing: "-0.02em" }}>NexCore</p>
              <p style={{ color: "#94A3B8", fontSize: 12, margin: 0 }}>Institute of Technology</p>
            </div>
          </div>
          <h1 style={{ color: "#fff", fontSize: 34, fontWeight: 800, margin: "0 0 12px", lineHeight: 1.15, letterSpacing: "-0.03em" }}>Student Portal</h1>
          <p style={{ color: "#94A3B8", fontSize: 15, margin: "0 0 48px", lineHeight: 1.6 }}>
            Access your dashboard, track projects, view reports and manage your academic progress all in one place.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {features.map((f) => (
              <div key={f.title} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "13px 16px", background: "rgba(255,255,255,0.06)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)" }}>
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

      {/* Right form */}
      <div className="form-container" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 32px" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ width: "100%", maxWidth: 440, background: "#fff", borderRadius: 16, border: "1.5px solid #E2E8F0", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: 36 }}>

          {/* Mobile logo */}
          <div className="mobile-logo" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
            <div style={{ width: 40, height: 40, background: "#1B2B4B", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GraduationCap size={20} color="#fff" />
            </div>
            <span style={{ fontWeight: 800, color: "#1B2B4B", fontSize: 16 }}>NexCore</span>
          </div>

          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1B2B4B", margin: "0 0 6px", letterSpacing: "-0.02em" }}>Sign in</h2>
            <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>Enter your credentials to access your student portal</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={S.label}>Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                <input type="email" placeholder="student@nexcore.edu" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} required style={S.input}
                  onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
                  onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")} />
              </div>
            </div>
            <div>
              <label style={S.label}>Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                <input type="password" placeholder="Enter your password" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} required style={S.input}
                  onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
                  onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")} />
              </div>
            </div>
            <button type="submit" disabled={loading}
              style={{ width: "100%", background: loading ? "#93C5FD" : "#2563EB", color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "'DM Sans', sans-serif" }}>
              {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Signing in...</> : <><LogIn size={16} /> Sign In</>}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 13, color: "#64748B", marginTop: 22 }}>
            Don't have an account?{" "}
            <Link to="/student/signup" style={{ color: "#2563EB", fontWeight: 600, textDecoration: "none" }}>Sign Up</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}