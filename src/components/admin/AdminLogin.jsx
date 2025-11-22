import { useState } from "react";
import { API } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Lock, Mail, Loader2 } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <Toaster position="top-center" />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl"
      >
        <h2 className="text-3xl font-semibold text-center mb-6 text-blue-700">
          Admin Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative group">
            <Mail
              className="absolute group-hover:text-blue-500 left-3 top-3 text-gray-400"
              size={20}
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full outline-0 pl-10 border group-hover:ring group-hover:ring-blue-200 border-gray-300 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="relative group">
            <Lock
              className="absolute group-hover:text-blue-500 left-3 top-3 text-gray-400"
              size={20}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full outline-0 pl-10 border group-hover:ring group-hover:ring-blue-200 border-gray-300 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-all cursor-pointer"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : null}
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
