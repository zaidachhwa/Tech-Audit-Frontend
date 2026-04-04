import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import { useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, GraduationCap, Hash, Loader2, CheckCircle2, BookOpen, ChevronDown } from "lucide-react";

const S = {
  input: { width: "100%", padding: "10px 14px 10px 36px", border: "1.5px solid #E2E8F0", borderRadius: 8, fontSize: 13, color: "#1B2B4B", fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box", background: "#fff" },
  select: { width: "100%", padding: "10px 14px 10px 36px", border: "1.5px solid #E2E8F0", borderRadius: 8, fontSize: 13, color: "#1B2B4B", fontFamily: "'DM Sans', sans-serif", outline: "none", background: "#fff", appearance: "none" },
  label: { fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748B", display: "block", marginBottom: 8 },
};

export default function StudentSignup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", batch_name: "", batch_no: "" });
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(true);
  const [successModal, setSuccessModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/batches/public").then((r) => setBatches(r.data || [])).catch(() => toast.error("Failed to load batches")).finally(() => setBatchLoading(false));
  }, []);

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Invalid email format";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    if (!form.batch_name) return "Please select a batch name";
    if (!form.batch_no) return "Please select a batch number";
    return null;
  };

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
  const batchNumbers = batches.filter((b) => b.batch_name === form.batch_name).map((b) => b.batch_no);

  return (
    <>
      <Toaster position="top-center" />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap'); @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Success Modal */}
      <AnimatePresence>
        {successModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: "#fff", padding: 36, borderRadius: 16, textAlign: "center", maxWidth: 400, width: "100%", border: "1.5px solid #E2E8F0", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", fontFamily: "'DM Sans', sans-serif" }}>
              <div style={{ width: 60, height: 60, background: "#ECFDF5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <CheckCircle2 size={30} color="#10B981" />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1B2B4B", margin: "0 0 8px" }}>Account Created!</h2>
              <p style={{ color: "#64748B", fontSize: 13, lineHeight: 1.6, margin: "0 0 16px" }}>
                Your student profile has been created. You can login once an <strong style={{ color: "#1B2B4B" }}>admin approves</strong> your account.
              </p>
              <p style={{ color: "#94A3B8", fontSize: 12 }}>Redirecting to login page...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC", padding: 16, fontFamily: "'DM Sans', sans-serif" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          style={{ width: "100%", maxWidth: 460, background: "#fff", borderRadius: 16, border: "1.5px solid #E2E8F0", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: 36 }}>

          {/* Header */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
            <div style={{ width: 48, height: 48, background: "#1B2B4B", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <GraduationCap size={24} color="#fff" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1B2B4B", margin: "0 0 4px", letterSpacing: "-0.02em" }}>Create Account</h2>
            <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>Join NexCore Student Portal</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Name */}
            <div>
              <label style={S.label}>Full Name</label>
              <div style={{ position: "relative" }}>
                <User size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                <input type="text" placeholder="John Doe" style={S.input}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required
                  onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
                  onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={S.label}>Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                <input type="email" placeholder="student@nexcore.edu" style={S.input}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} required
                  onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
                  onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={S.label}>Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                <input type="password" placeholder="Min. 6 characters" style={S.input}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} required
                  onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
                  onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")} />
              </div>
            </div>

            {/* Batch Name */}
            <div>
              <label style={S.label}>Batch Name</label>
              <div style={{ position: "relative" }}>
                <BookOpen size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
                <select style={S.select} onChange={(e) => setForm({ ...form, batch_name: e.target.value, batch_no: "" })} required
                  onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
                  onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}>
                  <option value="">Select Batch Name</option>
                  {batchLoading ? <option disabled>Loading...</option> : batchNames.map((name, i) => <option key={i} value={name}>{name}</option>)}
                </select>
                <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
              </div>
            </div>

            {/* Batch Number */}
            <div>
              <label style={S.label}>Batch Number</label>
              <div style={{ position: "relative" }}>
                <Hash size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
                <select disabled={!form.batch_name} value={form.batch_no} style={{ ...S.select, opacity: !form.batch_name ? 0.5 : 1 }}
                  onChange={(e) => setForm({ ...form, batch_no: e.target.value })} required
                  onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
                  onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}>
                  <option value="">{form.batch_name ? "Select Batch Number" : "Select Batch Name First"}</option>
                  {batchNumbers.map((num, i) => <option key={i} value={num}>Batch #{num}</option>)}
                </select>
                <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
              </div>
            </div>

            <button disabled={loading} type="submit"
              style={{ width: "100%", background: loading ? "#93C5FD" : "#2563EB", color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>
              {loading && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <p style={{ textAlign: "center", fontSize: 13, color: "#64748B", margin: 0 }}>
              Already have an account?{" "}
              <Link to="/student/login" style={{ color: "#2563EB", fontWeight: 600, textDecoration: "none" }}>Sign In</Link>
            </p>
          </form>
        </motion.div>
      </div>
    </>
  );
}