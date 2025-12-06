import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import { useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

import {
  Mail,
  Lock,
  User,
  GraduationCap,
  Hash,
  Loader2,
  CheckCircle2,
  BookOpen,
} from "lucide-react";

export default function StudentSignup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    batch_name: "",
    batch_no: "",
  });

  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(true);
  const [successModal, setSuccessModal] = useState(false);

  const navigate = useNavigate();

  // Fetch batches from public endpoint
  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/batches/public");
        setBatches(res.data || []);
      } catch (err) {
        toast.error("Failed to load batches");
      } finally {
        setBatchLoading(false);
      }
    };
    load();
  }, []);

  // Validations
  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Invalid email format";
    if (form.password.length < 6)
      return "Password must be at least 6 characters";
    if (!form.batch_name) return "Please select a batch name";
    if (!form.batch_no) return "Please select a batch number";
    return null;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return toast.error(err);

    setLoading(true);

    try {
      await API.post("/students/register", form);

      setSuccessModal(true);

      setTimeout(() => navigate("/student/login"), 5000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const batchNames = [...new Set(batches.map((b) => b.batch_name))];
  const batchNumbers = batches
    .filter((b) => b.batch_name === form.batch_name)
    .map((b) => b.batch_no);

  return (
    <>
      <Toaster position="top-center" />

      {/* Success Modal */}
      <AnimatePresence>
        {successModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full border border-gray-200"
            >
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="text-emerald-600" size={32} />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Account Created Successfully!
              </h2>

              <p className="text-gray-600 text-sm leading-relaxed">
                Your student profile has been created.
                <br />
                You can login once an <span className="font-semibold">admin approves your account.</span>
              </p>

              <p className="text-xs text-gray-500 mt-4">
                Redirecting to login page...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN SIGNUP UI */}
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-200"
        >
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-emerald-500 rounded-lg flex items-center justify-center mb-4 shadow-sm">
              <GraduationCap className="text-white" size={28} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Create Account
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Join our student portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900 placeholder:text-gray-400"
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="email"
                  placeholder="student@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900 placeholder:text-gray-400"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="password"
                  placeholder="Min. 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-900 placeholder:text-gray-400"
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Batch Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch Name
              </label>
              <div className="relative">
                <BookOpen
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={18}
                />
                <select
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer text-gray-900 appearance-none"
                  onChange={(e) =>
                    setForm({ ...form, batch_name: e.target.value, batch_no: "" })
                  }
                  required
                >
                  <option value="">Select Batch Name</option>
                  {batchLoading ? (
                    <option disabled>Loading...</option>
                  ) : (
                    batchNames.map((name, idx) => (
                      <option key={idx} value={name}>
                        {name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Batch Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch Number
              </label>
              <div className="relative">
                <Hash
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={18}
                />
                <select
                  disabled={!form.batch_name}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-900 appearance-none"
                  value={form.batch_no}
                  onChange={(e) => setForm({ ...form, batch_no: e.target.value })}
                  required
                >
                  <option value="">
                    {form.batch_name ? "Select Batch Number" : "Select Batch Name First"}
                  </option>
                  {batchNumbers.map((num, idx) => (
                    <option key={idx} value={num}>
                      Batch #{num}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              disabled={loading}
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-lg font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm mt-6"
            >
              {loading && <Loader2 className="animate-spin" size={20} />}
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            {/* Redirect */}
            <p className="text-center text-gray-600 text-sm mt-4">
              Already have an account?{" "}
              <Link
                to="/student/login"
                className="text-emerald-600 font-semibold hover:text-emerald-700 hover:underline"
              >
                Sign In
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </>
  );
}