import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import { useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Lock, User, GraduationCap, Hash, Loader2,
  CheckCircle2, BookOpen, ChevronDown, Phone, FileText,
  Calendar, Users, Upload
} from "lucide-react";

export default function StudentSignup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNo: "",
    enrollmentNo: "",
    rollNo: "",
    batch_name: "",
    batch_no: "",
    course: "",
    semester: "",
    department: "",
    dob: "",
    gender: "",
    password: "",
    confirmPassword: "",
    profilePhoto: "",
    idCardPhoto: "",
    aadhaarPhoto: ""
  });

  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(true);
  const [successModal, setSuccessModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/batches/public")
      .then((r) => setBatches(r.data || []))
      .catch(() => toast.error("Failed to load batches"))
      .finally(() => setBatchLoading(false));
  }, []);

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, [field]: reader.result }));
      toast.success(`${file.name} uploaded successfully!`);
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    if (!form.name.trim()) return "Full Name is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Invalid email format";
    if (form.phoneNo && !/^\+?[0-9]{10,14}$/.test(form.phoneNo)) return "Invalid mobile number format";
    if (!form.batch_name) return "Please select a batch name";
    if (!form.batch_no) return "Please select a batch number";
    if (form.password.length < 6) return "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
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
      setTimeout(() => navigate("/login"), 5000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const batchNames = [...new Set(batches.map((b) => b.batch_name))];
  const batchNumbers = batches.filter((b) => b.batch_name === form.batch_name).map((b) => b.batch_no);

  const labelStyle = {
    fontSize: "11px",
    fontWeight: "700",
    color: "#475569",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    display: "block",
    marginBottom: "6px"
  };

  const inputStyle = {
    width: "100%",
    padding: "9px 12px 9px 36px",
    border: "1.5px solid #E2E8F0",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#1E293B",
    outline: "none",
    backgroundColor: "#FFFFFF",
    transition: "all 0.2s",
    fontFamily: "'DM Sans', sans-serif"
  };

  return (
    <>
      <Toaster position="top-center" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        input:focus, select:focus {
          border-color: #0F3C8A !important;
          box-shadow: 0 0 0 3px rgba(15, 60, 138, 0.1);
        }
      `}</style>

      {/* Success Modal */}
      <AnimatePresence>
        {successModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(15, 23, 42, 0.3)",
              backdropFilter: "blur(4px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 1000, padding: 16
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: "#fff", padding: 36, borderRadius: 16,
                textAlign: "center", maxWidth: 420, width: "100%",
                border: "1px solid #E2E8F0",
                boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
                fontFamily: "'DM Sans', sans-serif"
              }}
            >
              <div style={{ width: 64, height: 64, background: "#ECFDF5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <CheckCircle2 size={32} color="#10B981" />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F3C8A", margin: "0 0 8px" }}>Registration Successful!</h2>
              <p style={{ color: "#64748B", fontSize: 13, lineHeight: 1.6, margin: "0 0 20px" }}>
                Your student profile has been created successfully. You can login once an <strong style={{ color: "#0F3C8A" }}>admin approves</strong> your account.
              </p>
              <p style={{ color: "#94A3B8", fontSize: 11, fontWeight: 500 }}>Redirecting to login page in a few seconds...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F8FAFC",
          padding: "40px 16px",
          fontFamily: "'DM Sans', sans-serif"
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: "100%", maxWidth: "780px" }}
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
              className="h-28 w-28 mx-auto drop-shadow-md"
            />

            {/* Brand Header */}
          
            <p style={{ fontSize: "13px", fontWeight: "800", color: "#FF6B00", margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "center" }}>
              Student Registration
            </p>
            <p style={{ fontSize: "11px", fontWeight: "500", color: "#64748B", margin: "2px 0 28px", textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "center" }}>
              Academic Management System
            </p>

            <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Section: Personal Info */}
              <div>
                <h4 style={{ fontSize: "13px", fontWeight: "800", color: "#0F3C8A", textTransform: "uppercase", borderBottom: "1.5px solid #F1F5F9", paddingBottom: "6px", marginBottom: "16px" }}>
                  Personal Information
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>Full Name *</label>
                    <div style={{ position: "relative" }}>
                      <User size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                      <input type="text" placeholder="John Doe" style={inputStyle}
                        value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Email Address *</label>
                    <div style={{ position: "relative" }}>
                      <Mail size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                      <input type="email" placeholder="john.doe@nexcore.edu" style={inputStyle}
                        value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Mobile Number</label>
                    <div style={{ position: "relative" }}>
                      <Phone size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                      <input type="tel" placeholder="+919876543210" style={inputStyle}
                        value={form.phoneNo} onChange={(e) => setForm({ ...form, phoneNo: e.target.value })} />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Date of Birth</label>
                    <div style={{ position: "relative" }}>
                      <Calendar size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                      <input type="date" style={inputStyle}
                        value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Gender</label>
                    <div style={{ position: "relative" }}>
                      <Users size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
                      <select style={inputStyle} value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      <ChevronDown size={14} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Academic Info */}
              <div>
                <h4 style={{ fontSize: "13px", fontWeight: "800", color: "#0F3C8A", textTransform: "uppercase", borderBottom: "1.5px solid #F1F5F9", paddingBottom: "6px", marginBottom: "16px" }}>
                  Academic Information
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
                  
                  <div>
                    <label style={labelStyle}>Enrollment Number</label>
                    <div style={{ position: "relative" }}>
                      <FileText size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                      <input type="text" placeholder="e.g. EN1029384" style={inputStyle}
                        value={form.enrollmentNo} onChange={(e) => setForm({ ...form, enrollmentNo: e.target.value })} />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Roll Number</label>
                    <div style={{ position: "relative" }}>
                      <Hash size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                      <input type="text" placeholder="e.g. 21CS45" style={inputStyle}
                        value={form.rollNo} onChange={(e) => setForm({ ...form, rollNo: e.target.value })} />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Batch Name *</label>
                    <div style={{ position: "relative" }}>
                      <BookOpen size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
                      <select style={inputStyle} value={form.batch_name} onChange={(e) => setForm({ ...form, batch_name: e.target.value, batch_no: "" })} required>
                        <option value="">Select Batch Name</option>
                        {batchLoading ? <option disabled>Loading...</option> : batchNames.map((name, i) => <option key={i} value={name}>{name}</option>)}
                      </select>
                      <ChevronDown size={14} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Batch Number *</label>
                    <div style={{ position: "relative" }}>
                      <Hash size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
                      <select disabled={!form.batch_name} value={form.batch_no} style={{ ...inputStyle, opacity: !form.batch_name ? 0.5 : 1 }}
                        onChange={(e) => setForm({ ...form, batch_no: e.target.value })} required>
                        <option value="">{form.batch_name ? "Select Batch Number" : "Select Batch Name First"}</option>
                        {batchNumbers.map((num, i) => <option key={i} value={num}>Batch #{num}</option>)}
                      </select>
                      <ChevronDown size={14} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Course / Degree</label>
                    <div style={{ position: "relative" }}>
                      <GraduationCap size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                      <input type="text" placeholder="e.g. B.Tech Computer Science" style={inputStyle}
                        value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Current Semester</label>
                    <div style={{ position: "relative" }}>
                      <Hash size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                      <input type="text" placeholder="e.g. Semester 5" style={inputStyle}
                        value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Department</label>
                    <div style={{ position: "relative" }}>
                      <BookOpen size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                      <input type="text" placeholder="e.g. Information Technology" style={inputStyle}
                        value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Documents */}
              <div>
                <h4 style={{ fontSize: "13px", fontWeight: "800", color: "#0F3C8A", textTransform: "uppercase", borderBottom: "1.5px solid #F1F5F9", paddingBottom: "6px", marginBottom: "16px" }}>
                  Documents Upload (Optional)
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                  
                  <div>
                    <label style={labelStyle}>Profile Photo</label>
                    <div style={{ position: "relative" }}>
                      <input type="file" accept="image/*" id="profilePhoto" style={{ display: "none" }}
                        onChange={(e) => handleFileChange(e, "profilePhoto")} />
                      <label htmlFor="profilePhoto" style={{
                        display: "flex", alignItems: "center", gap: "8px", justifyContent: "center",
                        padding: "10px", border: "1.5px dashed #E2E8F0", borderRadius: "8px",
                        cursor: "pointer", fontSize: "12px", color: "#64748B", background: "#F8FAFC",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = "#0F3C8A"}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = "#E2E8F0"}
                      >
                        <Upload size={14} /> {form.profilePhoto ? "Change Photo" : "Upload Photo"}
                      </label>
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Student ID Card</label>
                    <div style={{ position: "relative" }}>
                      <input type="file" accept="image/*,application/pdf" id="idCardPhoto" style={{ display: "none" }}
                        onChange={(e) => handleFileChange(e, "idCardPhoto")} />
                      <label htmlFor="idCardPhoto" style={{
                        display: "flex", alignItems: "center", gap: "8px", justifyContent: "center",
                        padding: "10px", border: "1.5px dashed #E2E8F0", borderRadius: "8px",
                        cursor: "pointer", fontSize: "12px", color: "#64748B", background: "#F8FAFC",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = "#0F3C8A"}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = "#E2E8F0"}
                      >
                        <Upload size={14} /> {form.idCardPhoto ? "Change Document" : "Upload ID Card"}
                      </label>
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Aadhaar / ID Doc</label>
                    <div style={{ position: "relative" }}>
                      <input type="file" accept="image/*,application/pdf" id="aadhaarPhoto" style={{ display: "none" }}
                        onChange={(e) => handleFileChange(e, "aadhaarPhoto")} />
                      <label htmlFor="aadhaarPhoto" style={{
                        display: "flex", alignItems: "center", gap: "8px", justifyContent: "center",
                        padding: "10px", border: "1.5px dashed #E2E8F0", borderRadius: "8px",
                        cursor: "pointer", fontSize: "12px", color: "#64748B", background: "#F8FAFC",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = "#0F3C8A"}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = "#E2E8F0"}
                      >
                        <Upload size={14} /> {form.aadhaarPhoto ? "Change Document" : "Upload Aadhaar"}
                      </label>
                    </div>
                  </div>

                </div>
              </div>

              {/* Section: Security */}
              <div>
                <h4 style={{ fontSize: "13px", fontWeight: "800", color: "#0F3C8A", textTransform: "uppercase", borderBottom: "1.5px solid #F1F5F9", paddingBottom: "6px", marginBottom: "16px" }}>
                  Security & Access
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>Password *</label>
                    <div style={{ position: "relative" }}>
                      <Lock size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                      <input type="password" placeholder="Min. 6 characters" style={inputStyle}
                        value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Confirm Password *</label>
                    <div style={{ position: "relative" }}>
                      <Lock size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                      <input type="password" placeholder="Re-enter your password" style={inputStyle}
                        value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
                    </div>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%", padding: "12px",
                    backgroundColor: "#0F3C8A", color: "#FFFFFF",
                    border: "none", borderRadius: "8px",
                    fontWeight: "600", fontSize: "14px",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#0b2c66"; }}
                  onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#0F3C8A"; }}
                >
                  {loading ? (
                    <><Loader2 size={16} className="animate-spin" /> Creating Account...</>
                  ) : (
                    <><GraduationCap size={16} /> Register as Student</>
                  )}
                </button>

                <p style={{ textAlign: "center", fontSize: "13px", color: "#64748B", margin: 0 }}>
                  Already have an account?{" "}
                  <Link to="/login" style={{ color: "#FF6B00", fontWeight: "600", textDecoration: "none" }}>
                    Sign In Here
                  </Link>
                </p>
              </div>

            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
}