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
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Toaster position="top-center" />
      
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 h-screen bg-black items-center justify-center p-12">
        <div className="max-w-md">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-8">
              <Shield size={40} className="text-black" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
              Admin Portal
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
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
            <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center">
              <Shield size={32} className="text-white" />
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-black mb-2">
              Sign In
            </h2>
            <p className="text-black/60">
              Enter your credentials to access the admin panel
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40"
                  size={20}
                />
                <input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={form.email}
                  className="w-full pl-11 pr-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-black/10 transition-all text-black placeholder:text-black/40 bg-white"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40"
                  size={20}
                />
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  className="w-full pl-11 pr-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-4 focus:ring-black/10 transition-all text-black placeholder:text-black/40 bg-white"
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-black hover:bg-black/90 text-white py-3 rounded-lg font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
            <p className="text-sm text-black/50">
              Protected by enterprise-grade security
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}