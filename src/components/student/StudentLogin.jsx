import { useState } from "react";
import { API } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { Lock, Mail, Loader2, GraduationCap } from "lucide-react";

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
      login(res.data.token, res.data);

      toast.success("Welcome back!", {
        duration: 1800,
        style: { textAlign: "center" },
      });
      setTimeout(() => navigate("/student/dashboard"), 1200);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials", {
        style: { textAlign: "center" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100">
      <Toaster position="top-center" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl"
      >
        <div className="flex flex-col items-center mb-6">
          <GraduationCap className="text-indigo-600 mb-3" size={40} />
          <h2 className="text-3xl font-semibold text-indigo-700">
            Student Login
          </h2>
          <p className="text-gray-500 text-sm mt-1">Access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="relative group">
            <Mail
              className="absolute left-3 top-3 text-gray-400 group-hover:text-indigo-600"
              size={20}
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full pl-10 border border-gray-300 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          {/* Password */}
          <div className="relative group">
            <Lock
              className="absolute left-3 top-3 text-gray-400 group-hover:text-indigo-600"
              size={20}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 border border-gray-300 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {/* Submit */}
          <button
            disabled={loading}
            type="submit"
            className="w-full cursor-pointer flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-all"
          >
            {loading && <Loader2 className="animate-spin" size={20} />}
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-gray-500 text-sm mt-2">
            Don't have an account?{" "}
            <Link
              to="/student/signup"
              className="text-indigo-600 font-medium hover:underline"
            >
              Signup
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
