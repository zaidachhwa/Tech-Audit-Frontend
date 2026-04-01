import { useState } from "react";
import { API } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Lock, Mail, Loader2, Shield } from "lucide-react";
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

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F8FAFC", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>
      <Toaster position="top-center" />
      
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 h-screen items-center justify-center p-12" style={{ backgroundColor: "#2563EB" }}>
        <div className="max-w-md">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8"
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
              }}
            >
              <Shield size={40} style={{ color: "#2563EB" }} />
            </div>
            <h1 className="font-black mb-4 leading-tight" style={{ color: "#FFFFFF", fontSize: "48px", fontWeight: "800" }}>
              Admin Portal
            </h1>
            <p className="leading-relaxed" style={{ color: "#FFFFFF", fontSize: "18px", opacity: 0.9 }}>
              Secure access to your administrative dashboard. Manage users, monitor systems, and control operations.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: "#2563EB",
                borderRadius: "12px",
              }}
            >
              <Shield size={32} style={{ color: "#FFFFFF" }} />
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="font-black mb-2" style={{ color: "#2563EB", fontSize: "32px", fontWeight: "800" }}>
              Sign In
            </h2>
            <p style={{ color: "#64748B", fontSize: "14px" }}>
              Enter your credentials to access the admin panel
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: "#1B2B4B", fontWeight: "600", fontSize: "14px" }}>
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  size={20}
                  style={{ color: "#94A3B8" }}
                />
                <input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={form.email}
                  className="w-full pl-11 pr-4 py-3 rounded-lg transition-all text-gray-900 placeholder:text-gray-400 outline-none"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid #E2E8F0",
                    borderRadius: "8px",
                    color: "#1B2B4B",
                    fontSize: "14px",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#2563EB";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#E2E8F0";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: "#1B2B4B", fontWeight: "600", fontSize: "14px" }}>
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  size={20}
                  style={{ color: "#94A3B8" }}
                />
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  className="w-full pl-11 pr-4 py-3 rounded-lg transition-all text-gray-900 placeholder:text-gray-400 outline-none"
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid #E2E8F0",
                    borderRadius: "8px",
                    color: "#1B2B4B",
                    fontSize: "14px",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#2563EB";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#E2E8F0";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 text-white py-3 rounded-lg font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: loading ? "#1E40AF" : "#2563EB",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = "#1E40AF";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(37, 99, 235, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = "#2563EB";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.3)";
                }
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Signing in...
                </>
              ) : (
                <>
                  <Shield size={20} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm" style={{ color: "#94A3B8" }}>
              Protected by enterprise-grade security
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}