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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.7 }}
              transition={{ type: "spring", stiffness: 120 }}
              className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md mx-auto"
            >
              <CheckCircle2 className="text-green-600 mx-auto mb-4" size={60} />

              <h2 className="text-2xl font-semibold text-gray-800">
                Account Created Successfully!
              </h2>

              <p className="text-gray-600 mt-2 leading-relaxed">
                Your student profile has been created.
                <br />
                You can login once an <b>admin approves your account.</b>
              </p>

              <p className="text-xs text-gray-400 mt-4">
                Redirecting to login...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN SIGNUP UI */}
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl"
        >
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <GraduationCap className="text-indigo-600 mb-3" size={40} />
            <h2 className="text-3xl font-semibold text-indigo-700">
              Student Signup
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Create your student account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="relative group">
              <User
                className="absolute left-3 top-3 text-gray-400 group-hover:text-indigo-600 transition-all"
                size={20}
              />
              <input
                type="text"
                placeholder="Full Name"
                className="w-full pl-10 border border-gray-300 py-2 rounded-lg transition-all
                focus:ring-2 focus:ring-indigo-500 outline-none group-hover:ring group-hover:ring-indigo-200"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            {/* Email */}
            <div className="relative group">
              <Mail
                className="absolute left-3 top-3 text-gray-400 group-hover:text-indigo-600 transition-all"
                size={20}
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full pl-10 border border-gray-300 py-2 rounded-lg transition-all
                focus:ring-2 focus:ring-indigo-500 outline-none group-hover:ring group-hover:ring-indigo-200"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <Lock
                className="absolute left-3 top-3 text-gray-400 group-hover:text-indigo-600 transition-all"
                size={20}
              />
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                className="w-full pl-10 border border-gray-300 py-2 rounded-lg transition-all
                focus:ring-2 focus:ring-indigo-500 outline-none group-hover:ring group-hover:ring-indigo-200"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {/* Batch Name */}
            <div className="relative group">
              <GraduationCap
                className="absolute left-3 top-3 text-gray-400 group-hover:text-indigo-600 transition-all"
                size={20}
              />
              <select
                className="w-full pl-10 border border-gray-300 py-2 rounded-lg bg-white transition-all
                focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer group-hover:ring group-hover:ring-indigo-200"
                onChange={(e) =>
                  setForm({ ...form, batch_name: e.target.value, batch_no: "" })
                }
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

            {/* Batch Number */}
            <div className="relative group">
              <Hash
                className="absolute left-3 top-3 text-gray-400 group-hover:text-indigo-600 transition-all"
                size={20}
              />
              <select
                disabled={!form.batch_name}
                className="w-full pl-10 border border-gray-300 py-2 rounded-lg bg-white transition-all
                focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer disabled:cursor-not-allowed
                group-hover:ring group-hover:ring-indigo-200"
                value={form.batch_no}
                onChange={(e) => setForm({ ...form, batch_no: e.target.value })}
              >
                <option value="">Select Batch Number</option>
                {batchNumbers.map((num, idx) => (
                  <option key={idx} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              disabled={loading}
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700
              text-white py-2 rounded-lg font-medium transition-all cursor-pointer"
            >
              {loading && <Loader2 className="animate-spin" size={20} />}
              {loading ? "Creating Account..." : "Signup"}
            </button>

            {/* Redirect */}
            <p className="text-center text-gray-500 text-sm">
              Already have an account?{" "}
              <Link
                to="/student/login"
                className="text-indigo-600 font-medium hover:underline cursor-pointer"
              >
                Login
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </>
  );
}
