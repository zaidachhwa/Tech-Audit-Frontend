import { useState } from "react";
import { API } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Lock, Mail, Loader2, Shield, BarChart2, Users, Settings } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/admin/login", form);
      const token = res.data.token;
      const data = res.data;
      login(token, data);
      toast.success("Welcome back, Admin!", { duration: 2000 });
      setTimeout(() => navigate("/admin/dashboard"), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Shield size={18} />,
      color: "#3B82F6",
      title: "User Management",
      desc: "Control access and permissions",
    },
    {
      icon: <BarChart2 size={18} />,
      color: "#F59E0B",
      title: "System Analytics",
      desc: "Monitor performance & activity",
    },
    {
      icon: <Users size={18} />,
      color: "#10B981",
      title: "Team Oversight",
      desc: "Manage roles and departments",
    },
  ];

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: "#F1F5F9" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
      `}</style>
      <Toaster position="top-center" />

      {/* Left Panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: "#0F172A" }}
      >
        {/* Background blobs */}
        <div
          style={{
            position: "absolute", top: "-80px", right: "-80px",
            width: "320px", height: "320px", borderRadius: "50%",
            backgroundColor: "#1E3A5F", opacity: 0.6, filter: "blur(2px)",
          }}
        />
        <div
          style={{
            position: "absolute", bottom: "-60px", left: "-60px",
            width: "260px", height: "260px", borderRadius: "50%",
            backgroundColor: "#1E3A5F", opacity: 0.4,
          }}
        />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative", zIndex: 1 }}
        >
          <div
            style={{
              width: "40px", height: "40px", borderRadius: "10px",
              backgroundColor: "#2563EB", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <Shield size={20} color="#fff" />
          </div>
          <div>
            <p style={{ color: "#FFFFFF", fontWeight: "700", fontSize: "15px", margin: 0 }}>AdminCore</p>
            <p style={{ color: "#94A3B8", fontSize: "12px", margin: 0 }}>Management Suite</p>
          </div>
        </motion.div>

        {/* Main text */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ position: "relative", zIndex: 1 }}
        >
          <h1
            style={{
              color: "#FFFFFF", fontSize: "42px", fontWeight: "800",
              lineHeight: "1.2", marginBottom: "16px",
            }}
          >
            Admin Portal
          </h1>
          <p style={{ color: "#94A3B8", fontSize: "15px", lineHeight: "1.7", marginBottom: "40px" }}>
            Your command centre for managing users, monitoring systems, and controlling operations.
          </p>

          {/* Feature cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  backgroundColor: "#1E293B", borderRadius: "12px",
                  padding: "14px 16px",
                }}
              >
                <div
                  style={{
                    width: "36px", height: "36px", borderRadius: "8px",
                    backgroundColor: f.color + "22",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: f.color, flexShrink: 0,
                  }}
                >
                  {f.icon}
                </div>
                <div>
                  <p style={{ color: "#F1F5F9", fontWeight: "600", fontSize: "14px", margin: 0 }}>{f.title}</p>
                  <p style={{ color: "#64748B", fontSize: "12px", margin: 0 }}>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div style={{ position: "relative", zIndex: 1 }} />
      </div>

      {/* Right Panel */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center p-8"
        style={{ backgroundColor: "#F1F5F9" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: "100%", maxWidth: "420px" }}
        >
          {/* Card */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              padding: "40px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
            }}
          >
            {/* Card logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px" }}>
              <div
                style={{
                  width: "36px", height: "36px", borderRadius: "9px",
                  backgroundColor: "#0F172A", display: "flex",
                  alignItems: "center", justifyContent: "center",
                }}
              >
                <Shield size={18} color="#fff" />
              </div>
              <span style={{ fontWeight: "700", fontSize: "15px", color: "#0F172A" }}>AdminCore</span>
            </div>

            {/* Heading */}
            <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#0F172A", margin: "0 0 4px" }}>
              Sign in
            </h2>
            <p style={{ color: "#94A3B8", fontSize: "13px", marginBottom: "28px" }}>
              Enter your credentials to access the admin panel
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Email */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "#64748B", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <Mail
                    size={16}
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
                      fontSize: "14px", color: "#0F172A", outline: "none",
                      backgroundColor: "#FFFFFF", transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#2563EB"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#E2E8F0"; }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "#64748B", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <Lock
                    size={16}
                    style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}
                  />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    style={{
                      width: "100%", padding: "10px 12px 10px 36px",
                      border: "1.5px solid #E2E8F0", borderRadius: "8px",
                      fontSize: "14px", color: "#0F172A", outline: "none",
                      backgroundColor: "#FFFFFF", transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#2563EB"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#E2E8F0"; }}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%", padding: "11px",
                  backgroundColor: "#2563EB", color: "#FFFFFF",
                  border: "none", borderRadius: "8px",
                  fontWeight: "600", fontSize: "14px",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#1D4ED8"; }}
                onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#2563EB"; }}
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Signing in...</>
                ) : (
                  <><Shield size={16} /> Sign In</>
                )}
              </button>
            </form>

            {/* Footer link */}
            <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#94A3B8" }}>
              Need access?{" "}
              <a href="/contact" style={{ color: "#2563EB", fontWeight: "600", textDecoration: "none" }}>
                Contact Support
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}