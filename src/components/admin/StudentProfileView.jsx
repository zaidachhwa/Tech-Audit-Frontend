import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStudent, uploadStudentPhoto, updateStudent } from "../../api/student.api";
import { getReportsByStudent } from "../../api/report.api";
import { getStudentProjects } from "../../api/project.api";
import { getAssignmentsByStudent } from "../../api/assignment.api";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  ArrowLeft,
  User,
  Mail,
  RefreshCw,
  BookOpen,
  BarChart2,
  FileText,
  Calendar,
  GraduationCap,
  Camera,
  Edit,
  X,
  Phone,
  CheckSquare,
  Briefcase,
  Layers
} from "lucide-react";

export default function StudentProfileView() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [reports, setReports] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: "", email: "", phoneNo: "", password: "" });
  const [savingEdit, setSavingEdit] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const fileInputRef = useRef(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getStudent(studentId);
      const s = res.student || res;
      setStudent(s);

      // Fetch Reports, Tasks, and Projects
      setReportsLoading(true);
      try {
        const [reportRes, tasksRes, projectsRes] = await Promise.allSettled([
          getReportsByStudent(s._id),
          getAssignmentsByStudent(s._id),
          getStudentProjects(s._id)
        ]);

        if (reportRes.status === "fulfilled") setReports(reportRes.value?.reports || []);
        if (tasksRes.status === "fulfilled") setTasks(tasksRes.value?.assignments || []);
        if (projectsRes.status === "fulfilled") setProjects(projectsRes.value?.projects || []);
      } catch (rErr) {
        console.error("Failed to fetch related data:", rErr);
      } finally {
        setReportsLoading(false);
      }
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "Failed to load student profile";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }

    if (file.size > 700 * 1024) {
      toast.error("Image size should be less than 700KB");
      return;
    }

    try {
      setUploadingPhoto(true);
      const reader = new FileReader();

      reader.onloadend = async () => {
        try {
          const base64Photo = reader.result;
          const res = await uploadStudentPhoto(student._id, { photo: base64Photo });
          toast.success(res.message || "Photo updated successfully");
          setStudent((prev) => ({ ...prev, profilePhoto: res.profilePhoto }));
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed to upload photo");
        } finally {
          setUploadingPhoto(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (err) {
      toast.error("Failed to process image");
      setUploadingPhoto(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingEdit(true);
      const payload = { ...editFormData };
      if (!payload.password) delete payload.password; // Don't send empty password

      await updateStudent(student._id, payload);
      toast.success("Student updated successfully");
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update student");
    } finally {
      setSavingEdit(false);
    }
  };

  const openEditModal = () => {
    setEditFormData({
      name: student.name || "",
      email: student.email || "",
      phoneNo: student.phoneNo || "",
      password: "",
    });
    setShowEditModal(true);
  };

  // Calculate average per parameter overall
  const getPieData = () => {
    if (!reports.length) return [];
    const paramStats = {};
    reports.forEach((r) => {
      r.parameters?.forEach((p) => {
        if (!paramStats[p.name]) {
          paramStats[p.name] = { total: 0, count: 0 };
        }
        paramStats[p.name].total += Number(p.score) || 0;
        paramStats[p.name].count += 1;
      });
    });

    return Object.keys(paramStats).map((name) => ({
      name,
      value: Number((paramStats[name].total / paramStats[name].count).toFixed(2)),
    }));
  };

  const pieData = getPieData();
  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#f43f5e", "#14b8a6"];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F8FAFC" }}>
        <div className="text-center">
          <div
            className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4"
            style={{
              borderColor: "#E2E8F0",
              borderTopColor: "#2563EB",
            }}
          />
          <p className="text-sm font-medium" style={{ color: "#94A3B8" }}>
            Loading profile…
          </p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F8FAFC" }}>
        <div className="text-center max-w-sm px-6">
          <GraduationCap size={48} style={{ margin: "0 auto 12px", color: "#CBD5E1" }} />
          <p className="font-semibold mb-1" style={{ color: "#1B2B4B" }}>
            Could not load student
          </p>
          {error && (
            <p
              className="text-sm rounded-lg px-3 py-2 mb-4 font-mono"
              style={{
                backgroundColor: "#FEE2E2",
                border: "1px solid #FECACA",
                color: "#DC2626",
              }}
            >
              {error}
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchData}
              className="px-4 py-2 text-white rounded-lg text-sm transition"
              style={{
                backgroundColor: "#2563EB",
                borderRadius: "8px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#1E40AF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#2563EB";
              }}
            >
              Retry
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-lg text-sm transition"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1.5px solid #E2E8F0",
                color: "#1B2B4B",
                borderRadius: "8px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F8FAFC";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#FFFFFF";
              }}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const avatarLetter = student.name?.charAt(0).toUpperCase() ?? "S";

  return (
    <div className="space-y-6" style={{ backgroundColor: "#F8FAFC", fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", padding: "24px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>
      <Toaster position="top-right" />

      {/* HEADER ROW */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium transition group"
          style={{
            color: "#2563EB",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#1E40AF";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#2563EB";
          }}
        >
          <ArrowLeft
            size={18}
            style={{
              transform: "translateX(0)",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.parentElement.style.transform = "translateX(-4px)";
            }}
          />
          Back to Students
        </button>
        <button
          onClick={fetchData}
          disabled={loading || reportsLoading}
          className="p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          style={{
            backgroundColor: "transparent",
            color: "#94A3B8",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#F8FAFC";
            e.currentTarget.style.color = "#1B2B4B";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#94A3B8";
          }}
          title="Refresh"
        >
          <RefreshCw size={18} className={loading || reportsLoading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="space-y-6">
        
        {/* PROFILE HEADER CARD */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg overflow-hidden"
          style={{
            backgroundColor: "#FFFFFF",
            border: "1.5px solid #E2E8F0",
            borderRadius: "12px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <div className="h-24" style={{ backgroundColor: "#2563EB", opacity: 0.9 }} />
          <div className="px-8 pb-8 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-12 mb-4">
              {/* AVATAR */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-24 h-24 rounded-lg flex items-center justify-center overflow-hidden"
                  style={{
                    backgroundColor: "#2563EB",
                    border: "4px solid #FFFFFF",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
                  }}
                >
                  {student.profilePhoto ? (
                    <img src={student.profilePhoto} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-white">{avatarLetter}</span>
                  )}
                </div>

                {/* Camera upload button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute -bottom-2 -right-2 w-8 h-8 border-2 text-white rounded-full flex items-center justify-center transition disabled:opacity-60"
                  style={{
                    backgroundColor: "#2563EB",
                    borderColor: "#FFFFFF",
                    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#1E40AF";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#2563EB";
                  }}
                  title="Upload photo"
                >
                  {uploadingPhoto ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Camera size={14} />
                  )}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-bold" style={{ color: "#1B2B4B", fontWeight: "700" }}>
                      {student.name}
                    </h1>
                    <p className="text-sm mt-0.5 flex items-center gap-1.5" style={{ color: "#94A3B8" }}>
                      <GraduationCap size={14} style={{ color: "#2563EB" }} />
                      Student Profile
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-4 px-4 py-2 rounded-lg relative"
                    style={{
                      backgroundColor: "#F8FAFC",
                      border: "1.5px solid #E2E8F0",
                      borderRadius: "8px",
                    }}
                  >
                    <div>
                      <p className="text-xs font-medium tracking-wide" style={{ color: "#94A3B8", textTransform: "uppercase", fontSize: "10px", fontWeight: "600", letterSpacing: "0.06em" }}>
                        BATCH NAME
                      </p>
                      <p className="text-sm font-bold" style={{ color: "#1B2B4B" }}>
                        {student.batch_name}
                      </p>
                    </div>
                    <div style={{ width: "1px", height: "32px", backgroundColor: "#E2E8F0" }} />
                    <div>
                      <p className="text-xs font-medium tracking-wide" style={{ color: "#94A3B8", textTransform: "uppercase", fontSize: "10px", fontWeight: "600", letterSpacing: "0.06em" }}>
                        BATCH NO
                      </p>
                      <p className="text-sm font-bold" style={{ color: "#2563EB" }}>
                        #{student.batch_no}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "#64748B" }}>
                  <Mail size={16} style={{ color: "#94A3B8" }} />
                  {student.email}
                </div>
                {student.phoneNo && (
                  <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "#64748B" }}>
                    <Phone size={16} style={{ color: "#94A3B8" }} />
                    {student.phoneNo}
                  </div>
                )}
              </div>
              
              <button
                onClick={openEditModal}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition shadow-sm"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1.5px solid #E2E8F0",
                  color: "#1B2B4B",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F8FAFC";
                  e.currentTarget.style.borderColor = "#CBD5E1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#FFFFFF";
                  e.currentTarget.style.borderColor = "#E2E8F0";
                }}
              >
                <Edit size={16} style={{ color: "#2563EB" }} />
                Edit Credentials
              </button>
            </div>
          </div>
        </motion.div>

        {/* STATS & REPORTS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Performance Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-lg p-6 flex flex-col h-[400px]"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #E2E8F0",
              borderRadius: "12px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                style={{
                  backgroundColor: "#EFF6FF",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #BFDBFE",
                }}
              >
                <BarChart2 size={20} style={{ color: "#2563EB" }} />
              </div>
              <div>
                <h3 className="text-lg font-bold" style={{ color: "#1B2B4B", fontWeight: "700" }}>
                  Overall Performance
                </h3>
                <p className="text-sm" style={{ color: "#64748B" }}>
                  Average Scores per Subject
                </p>
              </div>
            </div>

            <div className="flex-1 w-full relative">
              {reportsLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <RefreshCw size={24} className="animate-spin" style={{ color: "#CBD5E1" }} />
                </div>
              ) : pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}/10`, 'Avg Score']} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <BarChart2 size={40} style={{ color: "#CBD5E1", marginBottom: "8px" }} />
                  <p className="text-sm" style={{ color: "#94A3B8" }}>
                    No report data yet.
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Latest Reports List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-lg p-6 flex flex-col h-[400px]"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #E2E8F0",
              borderRadius: "12px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  style={{
                    backgroundColor: "#FEF3C7",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #FCD34D",
                  }}
                >
                  <FileText size={20} style={{ color: "#F59E0B" }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: "#1B2B4B", fontWeight: "700" }}>
                    Recent Reports
                  </h3>
                  <p className="text-sm" style={{ color: "#64748B" }}>
                    Past evaluation history
                  </p>
                </div>
              </div>
              <div
                className="text-sm font-semibold px-2.5 py-1 rounded"
                style={{
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  color: "#64748B",
                  borderRadius: "6px",
                }}
              >
                {reports.length} Total
              </div>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-2">
              {reportsLoading ? (
                <div className="py-12 flex justify-center">
                  <RefreshCw size={24} className="animate-spin" style={{ color: "#CBD5E1" }} />
                </div>
              ) : reports.length > 0 ? (
                reports.map((r, idx) => {
                  const avg = r.parameters?.reduce((s, p) => s + Number(p.score || 0), 0) / (r.parameters?.length || 1);
                  return (
                    <div
                      key={r._id || idx}
                      onClick={() => setSelectedReport(r)}
                      className="p-4 rounded-lg flex items-center justify-between transition-colors cursor-pointer hover:shadow-sm"
                      style={{
                        backgroundColor: "#F8FAFC",
                        border: "1.5px solid #E2E8F0",
                        borderRadius: "8px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#FFFFFF";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#F8FAFC";
                      }}
                    >
                      <div>
                        <h4 className="font-semibold text-sm" style={{ color: "#1B2B4B" }}>
                          Report #{reports.length - idx}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1 text-xs" style={{ color: "#94A3B8" }}>
                          <Calendar size={12} />
                          {r.auditDate ? new Date(r.auditDate).toLocaleDateString() : "N/A"}
                        </div>
                      </div>
                      <div
                        className="px-3 py-1.5 rounded-lg text-center"
                        style={{
                          backgroundColor: "#FFFFFF",
                          border: "1.5px solid #E2E8F0",
                          borderRadius: "6px",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                          minWidth: "60px",
                        }}
                      >
                        <div className="text-[10px] font-medium tracking-wide" style={{ color: "#94A3B8", textTransform: "uppercase", fontSize: "9px", fontWeight: "600", letterSpacing: "0.05em" }}>
                          Score
                        </div>
                        <div className="text-sm font-bold" style={{ color: "#1B2B4B" }}>
                          {avg.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <FileText size={40} style={{ color: "#CBD5E1", marginBottom: "8px" }} />
                  <p className="text-sm" style={{ color: "#94A3B8" }}>
                    No recent reports found.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* TASKS & PROJECTS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
          {/* Assigned Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-lg p-6 flex flex-col h-[400px]"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #E2E8F0",
              borderRadius: "12px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  style={{
                    backgroundColor: "#E0E7FF",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #C7D2FE",
                  }}
                >
                  <CheckSquare size={20} style={{ color: "#4F46E5" }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: "#1B2B4B", fontWeight: "700" }}>
                    Assigned Tasks
                  </h3>
                  <p className="text-sm" style={{ color: "#64748B" }}>
                    Track assignment progress
                  </p>
                </div>
              </div>
              <div
                className="text-sm font-semibold px-2.5 py-1 rounded"
                style={{
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  color: "#64748B",
                  borderRadius: "6px",
                }}
              >
                {tasks.length} Total
              </div>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-2">
              {reportsLoading ? (
                <div className="py-12 flex justify-center">
                  <RefreshCw size={24} className="animate-spin" style={{ color: "#CBD5E1" }} />
                </div>
              ) : tasks.length > 0 ? (
                tasks.map((task, idx) => (
                  <div
                    key={task._id || idx}
                    className="p-4 rounded-lg transition-colors border"
                    style={{
                      backgroundColor: "#F8FAFC",
                      borderColor: "#E2E8F0",
                      borderRadius: "8px",
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-sm" style={{ color: "#1B2B4B" }}>
                        Task #{tasks.length - idx}
                      </h4>
                      <span
                        className="px-2 py-0.5 text-xs font-semibold rounded-full"
                        style={{
                          backgroundColor: task.status === "Done" ? "#DCFCE7" : "#FEF3C7",
                          color: task.status === "Done" ? "#166534" : "#92400E",
                        }}
                      >
                        {task.status || "Pending"}
                      </span>
                    </div>
                    {task.parameters?.map((p, i) => (
                      <div key={i} className="text-sm" style={{ color: "#475569" }}>
                        <span className="font-medium">{p.name || "Task"}</span>: {p.score || 0}
                      </div>
                    ))}
                    {task.date && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs" style={{ color: "#94A3B8" }}>
                        <Calendar size={12} />
                        {new Date(task.date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center h-full">
                  <CheckSquare size={40} style={{ color: "#CBD5E1", marginBottom: "8px" }} />
                  <p className="text-sm" style={{ color: "#94A3B8" }}>
                    No assigned tasks.
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Assigned Projects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-lg p-6 flex flex-col h-[400px]"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #E2E8F0",
              borderRadius: "12px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  style={{
                    backgroundColor: "#ECFEFF",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #A5F3FC",
                  }}
                >
                  <Briefcase size={20} style={{ color: "#0891B2" }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: "#1B2B4B", fontWeight: "700" }}>
                    Assigned Projects
                  </h3>
                  <p className="text-sm" style={{ color: "#64748B" }}>
                    Ongoing project work
                  </p>
                </div>
              </div>
              <div
                className="text-sm font-semibold px-2.5 py-1 rounded"
                style={{
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  color: "#64748B",
                  borderRadius: "6px",
                }}
              >
                {projects.length} Total
              </div>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-2">
              {reportsLoading ? (
                <div className="py-12 flex justify-center">
                  <RefreshCw size={24} className="animate-spin" style={{ color: "#CBD5E1" }} />
                </div>
              ) : projects.length > 0 ? (
                projects.map((proj, idx) => (
                  <div
                    key={proj._id || idx}
                    onClick={() => setSelectedProject(proj)}
                    className="p-4 rounded-lg flex flex-col transition-colors border cursor-pointer hover:bg-white hover:shadow-sm"
                    style={{
                      backgroundColor: "#F8FAFC",
                      borderColor: "#E2E8F0",
                      borderRadius: "8px",
                    }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-sm" style={{ color: "#1B2B4B" }}>
                        {proj.title}
                      </h4>
                      <span
                        className="px-2 py-0.5 text-xs font-semibold rounded-full"
                        style={{
                          backgroundColor: proj.overallStatus === "Approved" ? "#DCFCE7" : proj.overallStatus === "Submitted" ? "#DBEAFE" : "#F1F5F9",
                          color: proj.overallStatus === "Approved" ? "#166534" : proj.overallStatus === "Submitted" ? "#1E40AF" : "#475569",
                        }}
                      >
                        {proj.overallStatus || "Pending"}
                      </span>
                    </div>
                    <p className="text-xs line-clamp-2" style={{ color: "#64748B", marginBottom: "8px" }}>
                      {proj.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs" style={{ color: "#94A3B8" }}>
                      <div className="flex items-center gap-1.5">
                        <Layers size={12} />
                        {proj.modules?.length || 0} Modules
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center h-full">
                  <Briefcase size={40} style={{ color: "#CBD5E1", marginBottom: "8px" }} />
                  <p className="text-sm" style={{ color: "#94A3B8" }}>
                    No assigned projects.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)" }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden"
            style={{ border: "1px solid #E2E8F0" }}
          >
            <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: "#E2E8F0", backgroundColor: "#F8FAFC" }}>
              <h3 className="font-bold text-lg" style={{ color: "#1B2B4B" }}>Edit Student Credentials</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-md transition-colors"
                style={{ color: "#64748B" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#E2E8F0"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: "#475569" }}>Full Name</label>
                <input 
                  type="text" 
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg outline-none transition-shadow"
                  style={{ border: "1.5px solid #E2E8F0", color: "#1B2B4B" }}
                  onFocus={(e) => { e.target.style.borderColor = "#2563EB"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: "#475569" }}>Email Address</label>
                <input 
                  type="email" 
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg outline-none transition-shadow"
                  style={{ border: "1.5px solid #E2E8F0", color: "#1B2B4B" }}
                  onFocus={(e) => { e.target.style.borderColor = "#2563EB"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: "#475569" }}>Phone Number</label>
                <input 
                  type="text" 
                  value={editFormData.phoneNo}
                  onChange={(e) => setEditFormData({...editFormData, phoneNo: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg outline-none transition-shadow"
                  style={{ border: "1.5px solid #E2E8F0", color: "#1B2B4B" }}
                  onFocus={(e) => { e.target.style.borderColor = "#2563EB"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }}
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: "#475569" }}>New Password</label>
                <input 
                  type="password" 
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({...editFormData, password: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg outline-none transition-shadow"
                  style={{ border: "1.5px solid #E2E8F0", color: "#1B2B4B" }}
                  onFocus={(e) => { e.target.style.borderColor = "#2563EB"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }}
                  placeholder="Leave empty to keep current password"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 font-medium rounded-lg text-sm transition"
                  style={{ color: "#475569", backgroundColor: "#F1F5F9" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#E2E8F0"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#F1F5F9"; }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-4 py-2 font-medium rounded-lg text-sm text-white transition flex items-center justify-center min-w-[100px] disabled:opacity-70"
                  style={{ backgroundColor: "#2563EB" }}
                  onMouseEnter={(e) => { if(!savingEdit) e.currentTarget.style.backgroundColor = "#1D4ED8"; }}
                  onMouseLeave={(e) => { if(!savingEdit) e.currentTarget.style.backgroundColor = "#2563EB"; }}
                >
                  {savingEdit ? <RefreshCw size={16} className="animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* REPORT DETAILS MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)" }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
            style={{ border: "1px solid #E2E8F0" }}
          >
            <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: "#E2E8F0", backgroundColor: "#F8FAFC" }}>
              <div className="flex items-center gap-3">
                <div style={{ backgroundColor: "#FEF3C7", padding: "8px", borderRadius: "8px", border: "1px solid #FCD34D" }}>
                  <FileText size={18} style={{ color: "#F59E0B" }} />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight" style={{ color: "#1B2B4B" }}>Audit Report</h3>
                  <p className="text-xs" style={{ color: "#64748B" }}>
                    {selectedReport.auditDate ? new Date(selectedReport.auditDate).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedReport(null)}
                className="p-1 rounded-md transition-colors"
                style={{ color: "#64748B" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#E2E8F0"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: "#94A3B8" }}>Parameters</h4>
                <div className="grid grid-cols-2 gap-3">
                  {selectedReport.parameters?.map((p, i) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-lg border" style={{ backgroundColor: "#F8FAFC", borderColor: "#E2E8F0" }}>
                      <span className="text-sm font-medium" style={{ color: "#1B2B4B" }}>{p.name}</span>
                      <span className="text-sm font-bold px-2 py-0.5 rounded bg-white border" style={{ color: "#2563EB", borderColor: "#E2E8F0" }}>{p.score}/10</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedReport.feedbackSchema && selectedReport.feedbackSchema.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: "#94A3B8" }}>Feedback</h4>
                  <div className="space-y-2">
                    {selectedReport.feedbackSchema.map((f, i) => (
                      <div key={i} className="text-sm p-3 rounded-lg border" style={{ backgroundColor: "#F8FAFC", borderColor: "#E2E8F0", color: "#475569" }}>
                        {f.point1 && <p>• {f.point1}</p>}
                        {f.point2 && <p>• {f.point2}</p>}
                        {f.point3 && <p>• {f.point3}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedReport.overallRemarks && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 uppercase tracking-wider" style={{ color: "#94A3B8" }}>Overall Remarks</h4>
                  <p className="text-sm p-3 rounded-lg border" style={{ backgroundColor: "#F8FAFC", borderColor: "#E2E8F0", color: "#475569" }}>
                    {selectedReport.overallRemarks}
                  </p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t" style={{ borderColor: "#E2E8F0", backgroundColor: "#F8FAFC" }}>
              <button
                onClick={() => setSelectedReport(null)}
                className="w-full py-2.5 rounded-lg text-sm font-bold transition"
                style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* PROJECT DETAILS MODAL */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)" }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
            style={{ border: "1px solid #E2E8F0" }}
          >
            <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: "#E2E8F0", backgroundColor: "#F8FAFC" }}>
              <div className="flex items-center gap-3">
                <div style={{ backgroundColor: "#ECFEFF", padding: "8px", borderRadius: "8px", border: "1px solid #A5F3FC" }}>
                  <Briefcase size={18} style={{ color: "#0891B2" }} />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight" style={{ color: "#1B2B4B" }}>{selectedProject.title}</h3>
                  <p className="text-xs" style={{ color: "#64748B" }}>
                    Status: <span className="font-semibold">{selectedProject.overallStatus}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedProject(null)}
                className="p-1 rounded-md transition-colors"
                style={{ color: "#64748B" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#E2E8F0"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <h4 className="text-sm font-semibold mb-2 uppercase tracking-wider" style={{ color: "#94A3B8" }}>Description</h4>
                <p className="text-sm text-gray-700 p-3 rounded-lg" style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                  {selectedProject.description || "No description provided."}
                </p>
              </div>

              {selectedProject.modules && selectedProject.modules.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: "#94A3B8" }}>Modules</h4>
                  <div className="space-y-3">
                    {selectedProject.modules.map((m, i) => (
                      <div key={i} className="p-3 rounded-lg border" style={{ backgroundColor: "#FFFFFF", borderColor: "#E2E8F0" }}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-bold text-gray-800">{m.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{
                            backgroundColor: m.status === "Completed" ? "#DCFCE7" : m.status === "In Progress" ? "#FEF3C7" : "#F1F5F9",
                            color: m.status === "Completed" ? "#166534" : m.status === "In Progress" ? "#92400E" : "#475569"
                          }}>{m.status}</span>
                        </div>
                        {m.notes && <p className="text-xs text-gray-500 mt-1">{m.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t" style={{ borderColor: "#E2E8F0", backgroundColor: "#F8FAFC" }}>
              <button
                onClick={() => setSelectedProject(null)}
                className="w-full py-2.5 rounded-lg text-sm font-bold transition"
                style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}