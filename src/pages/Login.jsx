import { useState } from "react";
import { API } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { Lock, Mail, Loader2, GraduationCap, LogIn, Shield, UserCircle, Eye, EyeOff, KeyRound, CheckCircle2 } from "lucide-react";


export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [authView, setAuthView] = useState("login"); // login | forgot | reset
  const [forgotForm, setForgotForm] = useState({ email: "" });
  const [resetForm, setResetForm] = useState({ otp: "", newPassword: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        email: form.email.trim().toLowerCase(),
        password: form.password.trim(),
      };

      const res = await API.post("/auth/login", payload);
      const { token, role } = res.data;
      const userData = res.data;

      login(token, userData, role);
      toast.success("Login successful!");
      
      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "teacher") navigate("/teacher/dashboard");
      else if (role === "student") navigate("/student/dashboard");

    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/forgot-password", { email: forgotForm.email.trim().toLowerCase() });
      toast.success("OTP sent to your email!");
      setAuthView("reset");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/reset-password", {
        email: forgotForm.email.trim().toLowerCase(),
        otp: resetForm.otp.trim(),
        newPassword: resetForm.newPassword.trim(),
      });
      toast.success("Password reset successfully! Please login.");
      setAuthView("login");
      setForgotForm({ email: "" });
      setResetForm({ otp: "", newPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Error resetting password");
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
            className="h-28 w-28 mx-auto"
          />

          {authView === "login" && (
            <>
              {/* Form Header */}
              <div style={{ alignSelf: "flex-start", width: "100%", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1E293B", margin: 0 }}>
                  Sign In
                </h3>
                <p style={{ color: "#64748B", fontSize: "12px", margin: "4px 0 0" }}>
                  Access your dashboard
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
                      placeholder="user@nexcore.edu"
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
                  <div style={{ textAlign: "right", marginTop: "6px" }}>
                    <button
                      type="button"
                      onClick={() => setAuthView("forgot")}
                      style={{
                        background: "none", border: "none", padding: 0,
                        color: "#0F3C8A", fontSize: "11px", fontWeight: "600",
                        cursor: "pointer"
                      }}
                    >
                      Forgot Password?
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
                    <><LogIn size={15} /> Sign In</>
                  )}
                </button>
              </form>

              {/* Contact / Register */}
              <p style={{ textAlign: "center", marginTop: "24px", fontSize: "12px", color: "#94A3B8" }}>
                Don't have an account?{" "}
                <Link to="/student/signup" style={{ color: "#FF6B00", fontWeight: "600", textDecoration: "none" }}>
                  Sign Up
                </Link>
              </p>
            </>
          )}

          {authView === "forgot" && (
            <>
              <div style={{ alignSelf: "flex-start", width: "100%", marginBottom: "20px" }}>
                <button 
                  onClick={() => setAuthView("login")}
                  style={{ background: "none", border: "none", color: "#64748B", fontSize: "12px", cursor: "pointer", padding: 0, marginBottom: "12px", fontWeight: "600" }}
                >
                  ← Back to Login
                </button>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1E293B", margin: 0 }}>
                  Forgot Password
                </h3>
                <p style={{ color: "#64748B", fontSize: "12px", margin: "4px 0 0" }}>
                  Enter your email to receive a password reset OTP.
                </p>
              </div>

              <form onSubmit={handleForgotSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px", width: "100%" }}>
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
                      placeholder="student@nexcore.edu"
                      value={forgotForm.email}
                      onChange={(e) => setForgotForm({ ...forgotForm, email: e.target.value })}
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
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#0b2c66"; }}
                  onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#0F3C8A"; }}
                >
                  {loading ? <><Loader2 size={15} className="animate-spin" /> Sending OTP...</> : "Send OTP"}
                </button>
              </form>
            </>
          )}

          {authView === "reset" && (
            <>
              <div style={{ alignSelf: "flex-start", width: "100%", marginBottom: "20px" }}>
                <button 
                  onClick={() => setAuthView("login")}
                  style={{ background: "none", border: "none", color: "#64748B", fontSize: "12px", cursor: "pointer", padding: 0, marginBottom: "12px", fontWeight: "600" }}
                >
                  ← Back to Login
                </button>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1E293B", margin: 0 }}>
                  Reset Password
                </h3>
                <p style={{ color: "#64748B", fontSize: "12px", margin: "4px 0 0" }}>
                  Enter the OTP sent to your email and your new password.
                </p>
              </div>

              <form onSubmit={handleResetSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px", width: "100%" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "#475569", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                    Enter OTP
                  </label>
                  <div style={{ position: "relative" }}>
                    <KeyRound
                      size={15}
                      style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}
                    />
                    <input
                      type="text"
                      placeholder="123456"
                      value={resetForm.otp}
                      onChange={(e) => setResetForm({ ...resetForm, otp: e.target.value })}
                      required
                      style={{
                        width: "100%", padding: "10px 12px 10px 36px",
                        border: "1.5px solid #E2E8F0", borderRadius: "8px",
                        fontSize: "13px", color: "#1E293B", outline: "none",
                        backgroundColor: "#FFFFFF", transition: "all 0.2s",
                        letterSpacing: "4px"
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "#475569", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                    New Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <Lock
                      size={15}
                      style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={resetForm.newPassword}
                      onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
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
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#0b2c66"; }}
                  onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#0F3C8A"; }}
                >
                  {loading ? <><Loader2 size={15} className="animate-spin" /> Resetting...</> : <><CheckCircle2 size={15} /> Confirm Reset</>}
                </button>
              </form>
            </>
          )}

        </div>
      </motion.div>
    </div>
  );
}