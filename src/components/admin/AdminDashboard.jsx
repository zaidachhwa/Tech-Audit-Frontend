import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  Users,
  RefreshCw,
  Plus,
  X,
  CheckCircle2,
  Ban,
  FolderGit2,
  Notebook,
  GraduationCap,
  UserCheck,
  BookOpen,
  LayoutDashboard,
  Menu,
  ChevronRight,
  TrendingUp,
  Clock,
  AlertCircle,
  Award,
  BookMarked,
  Activity,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import AdminStudentTable from "./AdminStudentTable";
import AdminTeacherTable from "./AdminTeacherTable";

// ⭐ REUSABLE SIDEBAR COMPONENT
import AdminSidebar from "../../components/admin/AdminSidebar";
import PunchLogsTable from "../shared/PunchLogsTable";

export default function AdminDashboard() {
  const { logout } = useAuth();
  const location = useLocation();

  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingSubjects, setPendingSubjects] = useState([]);

  // ⭐ Sidebar state (reused everywhere)
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [reports, setReports] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);

  const [addBatchOpen, setAddBatchOpen] = useState(false);
  const [newBatch, setNewBatch] = useState({ batch_name: "", batch_no: "" });
  const [studentDirectoryOpen, setStudentDirectoryOpen] = useState(false);
  const [directoryViewMode, setDirectoryViewMode] = useState("all");
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "danger",
    onConfirm: () => {},
  });

  const triggerConfirm = (title, message, type, onConfirm) => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      type,
      onConfirm,
    });
  };

  // Stats
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    pendingApprovals: 0,
    totalBatches: 0,
    totalTeachers: 0,
    recentActivity: 0,
    totalSubjects: 0,
    totalLectures: 0,
    totalHomework: 0,
    pendingHomework: 0,
  });

  const createBatch = async () => {
    if (!newBatch.batch_name || !newBatch.batch_no)
      return toast.error("All fields required");

    try {
      const res = await API.post("/batches/create", newBatch);
      toast.success("Batch created");

      const created = res.data?.batch || {
        ...newBatch,
        students: [],
        _id: Date.now().toString(),
      };

      setBatches((prev) => [created, ...prev]);
      setAddBatchOpen(false);
      setNewBatch({ batch_name: "", batch_no: "" });
      fetchBatches();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create batch");
    }
  };

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await API.get("/batches");
      const batchesData = res.data?.batches || res.data || [];
      setBatches(batchesData);

      // Fetch V2 dashboard stats
      const statsRes = await API.get("/dashboard/admin");
      const d = statsRes.data;
      setStats({
        totalStudents: d.totalStudents || 0,
        activeStudents: d.activeStudents ?? d.totalStudents ?? 0,
        pendingApprovals: d.pendingApprovals ?? d.pendingStudents ?? 0,
        totalBatches: d.totalBatches || batchesData.length,
        totalTeachers: d.totalTeachers || 0,
        totalSubjects: d.totalSubjects || 0,
        totalLectures: d.totalLectures || 0,
        totalHomework: d.totalHomework || 0,
        pendingHomework: d.pendingHomework || 0,
        recentActivity: d.pendingHomework || 0,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load batches or dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentReports = async (id) => {
    try {
      setReportLoading(true);
      const res = await API.get(`/reports/student/${id}`);
      setReports(res.data?.reports || res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reports");
      setReports([]);
    } finally {
      setReportLoading(false);
    }
  };

  const fetchPendingSubjects = async () => {
    try {
      const res = await API.get("/subjects?type=scheduling");
      // getSubjectTemplates returns a plain array; normalize defensively
      const data = res.data;
      const list = Array.isArray(data) ? data : (data?.subjects || data?.syllabi || []);
      const pending = list.filter(t => t.status === "pending");
      setPendingSubjects(pending);
    } catch (err) {
      console.error("Failed to load pending subjects", err);
    }
  };

  const handleApproveSubject = async (id) => {
    try {
      await API.patch(`/subjects/${id}/status`, { status: "approved" });
      toast.success("Subject request approved successfully!");
      fetchPendingSubjects();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve request");
    }
  };

  const handleRejectSubject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this subject request?")) return;
    try {
      await API.patch(`/subjects/${id}/status`, { status: "rejected" });
      toast.success("Subject request rejected.");
      fetchPendingSubjects();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject request");
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subject template?")) return;
    try {
      await API.delete(`/subjects/${id}`);
      toast.success("Subject template deleted successfully!");
      fetchPendingSubjects();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete subject template");
    }
  };

  useEffect(() => {
    fetchBatches();
    fetchPendingSubjects();
  }, []);

  // Stats cards
  const statsCards = [
    {
      title: "Total Subjects",
      value: stats.totalSubjects,
      icon: BookOpen,
      color: "bg-blue-500",
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
      change: `+${stats.totalSubjects}`,
      changeType: "positive",
    },
    {
      title: "Total Lectures",
      value: stats.totalLectures,
      icon: BookMarked,
      color: "bg-purple-500",
      bgLight: "bg-purple-50",
      textColor: "text-purple-600",
      change: `+${stats.totalLectures}`,
      changeType: "positive",
    },
    {
      title: "Total Teachers",
      value: stats.totalTeachers,
      icon: UserCheck,
      color: "bg-green-500",
      bgLight: "bg-green-50",
      textColor: "text-green-600",
      change: `Active: ${stats.totalTeachers}`,
      changeType: "positive",
    },
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: GraduationCap,
      color: "bg-blue-500",
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
      change: `Enrolled: ${stats.totalStudents}`,
      changeType: "positive",
    },
    {
      title: "Pending Homework",
      value: stats.pendingHomework,
      icon: Clock,
      color: "bg-yellow-500",
      bgLight: "bg-yellow-50",
      textColor: "text-yellow-600",
      change: stats.pendingHomework > 0 ? "Needs Review" : "All Clear",
      changeType: stats.pendingHomework > 0 ? "warning" : "positive",
    },
  ];

  // Quick Actions
  const quickActions = [
    {
      title: "Add Batch",
      description: "Create a new batch",
      icon: Plus,
      color: "bg-indigo-500",
      action: () => setAddBatchOpen(true),
    },
    {
      title: "Add Reports",
      description: "Upload student reports",
      icon: Notebook,
      color: "bg-green-500",
      action: () => (window.location.href = "/admin/add-reports"),
    },
    {
      title: "Syllabus",
      description: "Track syllabus progress",
      icon: BookMarked,
      color: "bg-blue-500",
      action: () => (window.location.href = "/admin/syllabus"),
    },
    {
      title: "Projects",
      description: "Monitor student projects",
      icon: FolderGit2,
      color: "bg-purple-500",
      action: () => (window.location.href = "/admin/project-tracking"),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar / Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-bold text-slate-800" style={{ fontSize: "20px", fontWeight: "700" }}>
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Welcome back, Admin
          </p>
        </div>
        <button
          onClick={fetchBatches}
          className="p-2 rounded-lg transition-colors"
          style={{
            color: "#94A3B8",
            backgroundColor: "transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#E2E8F0";
            e.currentTarget.style.color = "#1B2B4B";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#94A3B8";
          }}
          title="Refresh"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={stat.onClick}
              className="rounded-3xl p-6 transition flex flex-col justify-between"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1.5px solid #E2E8F0",
                borderRadius: "12px",
                cursor: stat.onClick ? "pointer" : "default",
              }}
              onMouseEnter={(e) => {
                if (stat.onClick) {
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.borderColor = "#2563EB";
                }
              }}
              onMouseLeave={(e) => {
                if (stat.onClick) {
                  e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "#E2E8F0";
                }
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="p-3 rounded-3xl flex items-center justify-center"
                  style={{
                    backgroundColor: stat.bgLight === "bg-blue-50" ? "#EFF6FF" : stat.bgLight === "bg-green-50" ? "#ECFDF5" : stat.bgLight === "bg-yellow-50" ? "#FEF3C7" : "#F3E8FF",
                    width: "52px",
                    height: "52px",
                    borderRadius: "14px",
                  }}
                >
                  <stat.icon
                    size={24}
                    style={{
                      color: stat.textColor === "text-blue-600" ? "#2563EB" : stat.textColor === "text-green-600" ? "#10B981" : stat.textColor === "text-yellow-600" ? "#F59E0B" : "#A78BFA",
                    }}
                  />
                </div>
                <span
                  className="text-xs font-medium px-2 py-1 rounded-full shrink-0"
                  style={{
                    backgroundColor: stat.changeType === "positive" ? "#ECFDF5" : "#FEF3C7",
                    color: stat.changeType === "positive" ? "#065F46" : "#92400E",
                  }}
                >
                  {stat.change}
                </span>
              </div>
              <div>
                <h3 className="font-black mb-1" style={{ color: "#1B2B4B", fontSize: "28px", fontWeight: "800", lineHeight: 1.1 }}>
                  {stat.value}
                </h3>
                <p className="text-[10px]" style={{ color: "#64748B", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {stat.title}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="font-semibold mb-4" style={{ color: "#1B2B4B", fontSize: "20px", fontWeight: "700" }}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={action.action}
                className="rounded-3xl p-6 text-left group transition"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1.5px solid #E2E8F0",
                  borderRadius: "12px",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.borderColor = "#2563EB";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "#E2E8F0";
                }}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition"
                  style={{
                    backgroundColor: action.color === "bg-indigo-500" ? "#2563EB" : action.color === "bg-green-500" ? "#10B981" : action.color === "bg-blue-500" ? "#2563EB" : "#A78BFA",
                  }}
                >
                  <action.icon size={24} style={{ color: "#FFFFFF" }} />
                </div>
                <h3 className="font-semibold mb-1" style={{ color: "#1B2B4B" }}>
                  {action.title}
                </h3>
                <p className="text-sm" style={{ color: "#64748B" }}>
                  {action.description}
                </p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Teacher Punch In & Out Logs Audit Section */}
        <div style={{ marginTop: "30px", marginBottom: "30px" }}>
          <PunchLogsTable isAdmin={true} />
        </div>

        {/* Recent Batches */}
        <RecentBatchesSection
          batches={batches}
          loading={loading}
          setAddBatchOpen={setAddBatchOpen}
          setBatches={setBatches}
          setSelectedStudent={setSelectedStudent}
          fetchStudentReports={fetchStudentReports}
          triggerConfirm={triggerConfirm}
        />

        {/* Pending Subject Approvals */}
        <PendingSubjectApprovals
          pendingSubjects={pendingSubjects}
          onApprove={handleApproveSubject}
          onReject={handleRejectSubject}
          onDelete={handleDeleteSubject}
        />

        {/* Pending Approvals Alert */}
        {stats.pendingApprovals > 0 && (
          <PendingApprovalsAlert stats={stats} />
        )}
      </div>

      {/* Add Batch Modal */}
      <AddBatchModal
        addBatchOpen={addBatchOpen}
        setAddBatchOpen={setAddBatchOpen}
        newBatch={newBatch}
        setNewBatch={setNewBatch}
        createBatch={createBatch}
      />

      {/* Reports Modal */}
      <ReportsModal
        selectedStudent={selectedStudent}
        setSelectedStudent={setSelectedStudent}
        reports={reports}
        reportLoading={reportLoading}
      />

      {/* Student Directory Modal */}
      <StudentDirectoryModal
        isOpen={studentDirectoryOpen}
        onClose={() => setStudentDirectoryOpen(false)}
        batches={batches}
        setBatches={setBatches}
        setStats={setStats}
        viewMode={directoryViewMode}
        triggerConfirm={triggerConfirm}
        onViewReports={(s) => {
          setSelectedStudent(s);
          fetchStudentReports(s._id);
        }}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        type={confirmState.type}
      />
    </div>
  );
}

function PendingSubjectApprovals({ pendingSubjects, onApprove, onReject, onDelete }) {
  if (pendingSubjects.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-4"
      style={{ borderRadius: "12px" }}
    >
      <div className="flex items-center gap-2 pb-2 border-b border-[#F1F5F9]">
        <BookOpen className="text-amber-500" size={20} />
        <h2 className="font-semibold text-lg" style={{ color: "#1B2B4B", fontSize: "16px", fontWeight: "700" }}>
          Pending Subject & Schedule Approvals ({pendingSubjects.length})
        </h2>
      </div>
      <div className="space-y-3">
        {pendingSubjects.map((subj) => (
          <div
            key={subj._id}
            className="flex items-center justify-between p-4 bg-[#FFFDF5] border border-amber-200 rounded-lg hover:shadow-sm transition-all"
            style={{ borderRadius: "8px" }}
          >
            <div>
              <h3 className="font-bold text-sm text-[#1B2B4B]">{subj.name}</h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Requested by: <span className="font-semibold text-[#475569]">{subj.teacher?.name || "Teacher"}</span> ({subj.teacher?.email || ""})
              </p>
              <p className="text-[11px] text-[#94A3B8] mt-1">
                {subj.lectures?.length || 0} Lectures planned
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onApprove(subj._id)}
                className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 border border-green-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Approve
              </button>
              <button
                onClick={() => onReject(subj._id)}
                className="px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-600 border border-yellow-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Reject
              </button>
              <button
                onClick={() => onDelete(subj._id)}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* --- BELOW THIS POINT ARE THE ORIGINAL COMPONENTS (NO CHANGES MADE) --- */
/* EXACT COMPONENTS FROM YOUR ORIGINAL FILE PRESERVED AS-IS */

function RecentBatchesSection({
  batches,
  loading,
  setAddBatchOpen,
  setBatches,
  setSelectedStudent,
  fetchStudentReports,
  triggerConfirm,
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold" style={{ color: "#1B2B4B", fontSize: "20px", fontWeight: "700" }}>
            Recent Batches
          </h2>
          <p className="text-sm mt-1" style={{ color: "#64748B" }}>
            Overview of your latest batches
          </p>
        </div>
        <NavLink
          to="/admin/batch-management"
          className="text-sm font-medium flex items-center gap-1 transition"
          style={{ color: "#2563EB" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#1E40AF")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#2563EB")}
        >
          View All
          <ChevronRight size={16} />
        </NavLink>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-12 rounded-xl" style={{ backgroundColor: "#F8FAFC" }}>
            <div className="animate-spin rounded-full h-8 w-8" style={{ borderBottom: "2px solid #2563EB" }} />
          </div>
        ) : batches.length === 0 ? (
          <div className="text-center py-12 rounded-xl border" style={{ backgroundColor: "#F8FAFC", borderColor: "#E2E8F0", borderRadius: "12px" }}>
            <Users size={48} style={{ margin: "0 auto 12px", color: "#CBD5E1" }} />
            <p className="font-medium" style={{ color: "#1B2B4B" }}>
              No batches found
            </p>
            <p className="text-sm mt-1" style={{ color: "#94A3B8" }}>
              Create your first batch to get started
            </p>
            <button
              onClick={() => setAddBatchOpen(true)}
              className="mt-4 px-4 py-2 rounded-lg transition inline-flex items-center gap-2 font-medium"
              style={{
                backgroundColor: "#2563EB",
                color: "#FFFFFF",
                borderRadius: "8px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1E40AF")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2563EB")}
            >
              <Plus size={18} />
              Add Batch
            </button>
          </div>
        ) : (
          batches.slice(0, 3).map((batch, i) => (
            <BatchCard
              key={batch._id || i}
              batch={batch}
              setBatches={setBatches}
              onViewReports={(s) => {
                setSelectedStudent(s);
                fetchStudentReports(s._id);
              }}
              triggerConfirm={triggerConfirm}
            />
          ))
        )}
      </div>
    </div>
  );
}

function PendingApprovalsAlert({ stats }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-6"
      style={{
        backgroundColor: "#FEF3C7",
        border: "1.5px solid #FCD34D",
        borderRadius: "12px",
      }}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg" style={{ backgroundColor: "#FBBF24" }}>
          <AlertCircle size={24} style={{ color: "#92400E" }} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-1" style={{ color: "#78350F" }}>
            Pending Approvals
          </h3>
          <p className="text-sm" style={{ color: "#92400E" }}>
            You have {stats.pendingApprovals} student(s) waiting for approval.
          </p>
          <NavLink
            to="/admin/student-management"
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium transition"
            style={{ color: "#78350F" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#451A03")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#78350F")}
          >
            Review Now
            <ChevronRight size={16} />
          </NavLink>
        </div>
      </div>
    </motion.div>
  );
}

function AddBatchModal({
  addBatchOpen,
  setAddBatchOpen,
  newBatch,
  setNewBatch,
  createBatch,
}) {
  return (
    <AnimatePresence>
      {addBatchOpen && (
        <motion.div
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setAddBatchOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="rounded-3xl shadow-xl max-w-md w-full p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              boxShadow: "0 20px 25px rgba(0,0,0,0.15)",
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold" style={{ color: "#1B2B4B", fontSize: "18px" }}>
                Create New Batch
              </h3>
              <button
                onClick={() => setAddBatchOpen(false)}
                className="p-2 rounded-lg transition"
                style={{ backgroundColor: "transparent" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#E2E8F0")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <X size={20} style={{ color: "#94A3B8" }} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                  Batch Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., FSD"
                  value={newBatch.batch_name}
                  onChange={(e) =>
                    setNewBatch({ ...newBatch, batch_name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg outline-none transition"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid #E2E8F0",
                    borderRadius: "8px",
                    color: "#1B2B4B",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#2563EB";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#E2E8F0";
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                  Batch Number
                </label>
                <input
                  type="text"
                  placeholder="e.g., 2025-2028"
                  value={newBatch.batch_no}
                  onChange={(e) =>
                    setNewBatch({ ...newBatch, batch_no: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg outline-none transition"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid #E2E8F0",
                    borderRadius: "8px",
                    color: "#1B2B4B",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#2563EB";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#E2E8F0";
                  }}
                />
              </div>

              <button
                onClick={createBatch}
                className="w-full py-2.5 rounded-lg font-medium transition"
                style={{
                  backgroundColor: "#2563EB",
                  color: "#FFFFFF",
                  borderRadius: "8px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1E40AF")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2563EB")}
              >
                Create Batch
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ReportsModal({
  selectedStudent,
  setSelectedStudent,
  reports,
  reportLoading,
}) {
  return (
    <AnimatePresence>
      {selectedStudent && (
        <motion.div
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedStudent(null)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="rounded-3xl shadow-xl max-w-3xl w-full overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
            }}
          >
            <div className="border-b p-4 flex justify-between items-center" style={{ backgroundColor: "#F8FAFC", borderColor: "#E2E8F0" }}>
              <div>
                <h3 className="font-semibold" style={{ color: "#1B2B4B" }}>
                  {selectedStudent.name}
                </h3>
                <p className="text-sm" style={{ color: "#94A3B8" }}>
                  Student Reports
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 rounded-lg transition"
                style={{ backgroundColor: "transparent" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#E2E8F0")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <X size={20} style={{ color: "#94A3B8" }} />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {reportLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8" style={{ borderBottom: "2px solid #2563EB" }} />
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-12">
                  <Notebook size={48} style={{ margin: "0 auto 12px", color: "#CBD5E1" }} />
                  <p style={{ color: "#1B2B4B" }}>No reports found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div
                      key={report._id}
                      className="rounded-xl p-5 border"
                      style={{
                        backgroundColor: "#F8FAFC",
                        border: "1.5px solid #E2E8F0",
                        borderRadius: "12px",
                      }}
                    >
                      <p className="text-sm mb-3" style={{ color: "#64748B" }}>
                        <span className="font-medium" style={{ color: "#1B2B4B" }}>
                          Audit Date:
                        </span>{" "}
                        {report.auditDate
                          ? new Date(report.auditDate).toLocaleDateString()
                          : "—"}
                      </p>

                      <h4 className="font-semibold mb-2" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                        Parameters:
                      </h4>
                      <div className="space-y-1 mb-4">
                        {report.parameters?.map((p, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm py-1"
                          >
                            <span style={{ color: "#64748B" }}>{p.name}</span>
                            <span className="font-medium" style={{ color: "#1B2B4B" }}>
                              {p.score}
                            </span>
                          </div>
                        )) || <p className="text-sm" style={{ color: "#94A3B8" }}>—</p>}
                      </div>

                      <h4 className="font-semibold mb-2" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                        Remarks:
                      </h4>
                      <p className="text-sm" style={{ color: "#64748B" }}>
                        {report.overallRemarks || "—"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StudentDirectoryModal({ isOpen, onClose, batches, setBatches, setStats, viewMode, onViewReports, triggerConfirm }) {
  const [expandedCourses, setExpandedCourses] = useState({});
  const [expandedBatches, setExpandedBatches] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const renderLastLogin = (student) => {
    if (!student.lastLogin) {
      return (
        <span className="text-[11px]" style={{ color: "#94A3B8" }}>
          Never logged in
        </span>
      );
    }
    const formattedDate = new Date(student.lastLogin).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
    return (
      <span className="text-[11px] font-medium" style={{ color: "#64748B" }} title="Last Login Time">
        Last login: {formattedDate}
      </span>
    );
  };

  // Flatten active students list
  const activeStudents = [];
  const activeIds = new Set();
  
  // Flatten pending students list
  const pendingStudents = [];
  const pendingIds = new Set();

  batches.forEach((batch) => {
    batch.students?.forEach((student) => {
      // Filter by search query
      const matchesSearch = searchQuery
        ? student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.email?.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      if (matchesSearch) {
        if (student.isActive) {
          if (!activeIds.has(student._id)) {
            activeIds.add(student._id);
            activeStudents.push({
              ...student,
              batchId: batch._id,
              batchName: batch.batch_name,
              batchNo: batch.batch_no,
            });
          }
        } else {
          if (!pendingIds.has(student._id)) {
            pendingIds.add(student._id);
            pendingStudents.push({
              ...student,
              batchId: batch._id,
              batchName: batch.batch_name,
              batchNo: batch.batch_no,
            });
          }
        }
      }
    });
  });

  // Group batches by batch_name (Course)
  const coursesMap = {};
  batches.forEach((batch) => {
    // Filter students by search query
    const filteredStudents = batch.students?.filter((student) => {
      return searchQuery
        ? student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.email?.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
    }) || [];

    if (filteredStudents.length > 0 || !searchQuery) {
      const courseName = batch.batch_name || "Unassigned Course";
      if (!coursesMap[courseName]) {
        coursesMap[courseName] = [];
      }
      coursesMap[courseName].push({
        ...batch,
        students: filteredStudents,
      });
    }
  });

  // Filter out courses that have no matching batches when searching
  const filteredCoursesMap = {};
  Object.entries(coursesMap).forEach(([courseName, courseBatches]) => {
    const hasMatchingStudents = courseBatches.some((b) => b.students && b.students.length > 0);
    if (hasMatchingStudents || !searchQuery) {
      filteredCoursesMap[courseName] = courseBatches;
    }
  });

  const toggleCourse = (courseName) => {
    setExpandedCourses((prev) => ({
      ...prev,
      [courseName]: !prev[courseName],
    }));
  };

  const toggleBatch = (batchId) => {
    setExpandedBatches((prev) => ({
      ...prev,
      [batchId]: !prev[batchId],
    }));
  };

  const approve = async (id, batchId) => {
    triggerConfirm(
      "Confirm Approval",
      "Are you sure you want to approve this student?",
      "success",
      async () => {
        try {
          await API.patch(`/admin/approve-student/${id}`);
          toast.success("Student approved");

          setBatches((prev) =>
            prev.map((b) =>
              b._id === batchId
                ? {
                    ...b,
                    students: b.students.map((s) =>
                      s._id === id ? { ...s, isActive: true } : s
                    ),
                  }
                : b
            )
          );

          setStats((prev) => {
            const nextActive = prev.activeStudents + 1;
            const nextPending = Math.max(0, prev.pendingApprovals - 1);
            return {
              ...prev,
              activeStudents: nextActive,
              pendingApprovals: nextPending,
              recentActivity: nextPending,
            };
          });
        } catch (err) {
          console.error(err);
          toast.error("Approval failed");
        }
      }
    );
  };

  const reject = async (id, batchId) => {
    triggerConfirm(
      "Confirm Rejection",
      "Are you sure you want to reject this student?",
      "danger",
      async () => {
        try {
          await API.patch(`/admin/reject-student/${id}`);
          toast.success("Student rejected");

          setBatches((prev) =>
            prev.map((b) =>
              b._id === batchId
                ? {
                    ...b,
                    students: b.students.map((s) =>
                      s._id === id ? { ...s, isActive: false } : s
                    ),
                  }
                : b
            )
          );
        } catch (err) {
          console.error(err);
          toast.error("Rejection failed");
        }
      }
    );
  };

  const getHeaderInfo = () => {
    switch (viewMode) {
      case "active":
        return {
          title: "Active Students",
          subtitle: `Flat list of all ${activeStudents.length} active students`,
        };
      case "pending":
        return {
          title: "Pending Approvals",
          subtitle: `Flat list of all ${pendingStudents.length} students waiting for approval`,
        };
      case "batches":
        return {
          title: "Total Batches",
          subtitle: `Flat list of all ${batches.length} batches`,
        };
      case "all":
      default:
        const totalStuds = batches.reduce((acc, b) => acc + (b.students?.length || 0), 0);
        return {
          title: "Student Directory by Course",
          subtitle: `Browse courses, batches, and their ${totalStuds} enrolled students`,
        };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.4)",
        }}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          className="rounded-3xl shadow-xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[85vh]"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
          }}
        >
          {/* Header */}
          <div className="border-b p-5 flex justify-between items-center" style={{ backgroundColor: "#F8FAFC", borderColor: "#E2E8F0" }}>
            <div>
              <h3 className="font-semibold text-lg" style={{ color: "#1B2B4B", fontWeight: "700" }}>
                {headerInfo.title}
              </h3>
              <p className="text-sm mt-0.5" style={{ color: "#94A3B8" }}>
                {headerInfo.subtitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition"
              style={{ backgroundColor: "transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#E2E8F0")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <X size={20} style={{ color: "#94A3B8" }} />
            </button>
          </div>

          {/* Sticky Search Bar Section */}
          {viewMode !== "batches" && (
            <div className="px-6 py-4 border-b bg-slate-50/50" style={{ borderColor: "#F1F5F9" }}>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search students by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  style={{
                    borderRadius: "10px",
                    color: "#1B2B4B",
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {viewMode === "active" && (
              activeStudents.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={48} style={{ margin: "0 auto 12px", color: "#CBD5E1" }} />
                  <p style={{ color: "#1B2B4B" }}>No active students found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeStudents.map((student, idx) => (
                    <div
                      key={student._id}
                      className="bg-white p-4 rounded-xl flex items-center justify-between border border-slate-100 shadow-sm transition hover:shadow-md"
                      style={{ borderRadius: "12px" }}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Index Number */}
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                          style={{
                            backgroundColor: "#ECFDF5",
                            color: "#059669",
                          }}
                        >
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate" style={{ color: "#1B2B4B" }}>
                            {student.name}
                          </p>
                          <p className="text-xs text-slate-400 truncate mb-1">
                            {student.email}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span
                              className="inline-block px-2.5 py-0.5 text-[10px] rounded-full font-medium"
                              style={{
                                backgroundColor: "#EFF6FF",
                                color: "#1E40AF",
                              }}
                            >
                              {student.batchName} • Batch #{student.batchNo}
                            </span>
                            {renderLastLogin(student)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          onClose();
                          onViewReports(student);
                        }}
                        className="px-3.5 py-1.5 text-xs rounded-lg transition font-medium flex-shrink-0"
                        style={{
                          backgroundColor: "#EFF6FF",
                          color: "#2563EB",
                          borderRadius: "8px",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#DBEAFE";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#EFF6FF";
                        }}
                      >
                        View Reports
                      </button>
                    </div>
                  ))}
                </div>
              )
            )}

            {viewMode === "pending" && (
              pendingStudents.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 size={48} style={{ margin: "0 auto 12px", color: "#CBD5E1" }} />
                  <p style={{ color: "#1B2B4B" }}>No pending approvals found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingStudents.map((student, idx) => (
                    <div
                      key={student._id}
                      className="bg-white p-4 rounded-xl flex items-center justify-between border border-slate-100 shadow-sm transition hover:shadow-md"
                      style={{ borderRadius: "12px" }}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Index Number */}
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                          style={{
                            backgroundColor: "#FEF3C7",
                            color: "#D97706",
                          }}
                        >
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate" style={{ color: "#1B2B4B" }}>
                            {student.name}
                          </p>
                          <p className="text-xs text-slate-400 truncate mb-1">
                            {student.email}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span
                              className="inline-block px-2.5 py-0.5 text-[10px] rounded-full font-medium"
                              style={{
                                backgroundColor: "#EFF6FF",
                                color: "#1E40AF",
                              }}
                            >
                              {student.batchName} • Batch #{student.batchNo}
                            </span>
                            {renderLastLogin(student)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => {
                            onClose();
                            onViewReports(student);
                          }}
                          className="px-3 py-1.5 text-xs rounded-lg transition font-medium"
                          style={{
                            backgroundColor: "#EFF6FF",
                            color: "#2563EB",
                            borderRadius: "8px",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#DBEAFE";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#EFF6FF";
                          }}
                        >
                          View Reports
                        </button>

                        <button
                          onClick={() => approve(student._id, student.batchId)}
                          className="p-2 rounded-lg transition"
                          title="Approve"
                          style={{
                            backgroundColor: "#ECFDF5",
                            color: "#10B981",
                            borderRadius: "8px",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#D1FAE5";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#ECFDF5";
                          }}
                        >
                          <CheckCircle2 size={16} />
                        </button>

                        <button
                          onClick={() => reject(student._id, student.batchId)}
                          className="p-2 rounded-lg transition"
                          title="Reject"
                          style={{
                            backgroundColor: "#FEF2F2",
                            color: "#EF4444",
                            borderRadius: "8px",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#FEE2E2";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#FEF2F2";
                          }}
                        >
                          <Ban size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {viewMode === "batches" && (
              batches.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={48} style={{ margin: "0 auto 12px", color: "#CBD5E1" }} />
                  <p style={{ color: "#1B2B4B" }}>No batches found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {batches.map((batch, idx) => {
                    const isBatchExpanded = !!expandedBatches[batch._id];
                    const activeCount = batch.students?.filter((s) => s.isActive).length || 0;
                    const studentCount = batch.students?.length || 0;

                    return (
                      <div
                        key={batch._id}
                        className="border rounded-xl overflow-hidden transition-all duration-300"
                        style={{
                          borderColor: isBatchExpanded ? "#A78BFA" : "#E2E8F0",
                          backgroundColor: "#FFFFFF",
                          borderRadius: "12px",
                        }}
                      >
                        {/* Batch Header Row */}
                        <button
                          onClick={() => toggleBatch(batch._id)}
                          className="w-full p-4 flex items-center justify-between text-left transition-colors"
                          style={{
                            backgroundColor: isBatchExpanded ? "#F5F3FF" : "#F8FAFC",
                          }}
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            {/* Index Number */}
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                              style={{
                                backgroundColor: isBatchExpanded ? "#C084FC" : "#F3E8FF",
                                color: isBatchExpanded ? "#FFFFFF" : "#7C3AED",
                              }}
                            >
                              {idx + 1}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-semibold text-sm" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                                {batch.batch_name}
                              </h4>
                              <p className="text-xs" style={{ color: "#64748B" }}>
                                Batch #{batch.batch_no} • {activeCount}/{studentCount} approved students
                              </p>
                            </div>
                          </div>
                          <ChevronRight
                            size={18}
                            style={{
                              color: "#64748B",
                              transform: isBatchExpanded ? "rotate(90deg)" : "rotate(0deg)",
                              transition: "transform 0.3s ease",
                            }}
                          />
                        </button>

                        {/* Batch Students List Dropdown */}
                        <AnimatePresence>
                          {isBatchExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                              style={{ borderTop: "1px solid #E2E8F0" }}
                            >
                              <div className="p-3 space-y-2" style={{ backgroundColor: "#F8FAFC" }}>
                                {!batch.students || batch.students.length === 0 ? (
                                  <p className="text-xs text-center py-4" style={{ color: "#94A3B8" }}>
                                    No students in this batch
                                  </p>
                                ) : (
                                  batch.students.map((student) => (
                                    <div
                                      key={student._id}
                                      className="bg-white p-3 rounded-lg flex items-center justify-between border border-slate-100 shadow-sm"
                                      style={{ borderRadius: "6px" }}
                                    >
                                      <div className="min-w-0">
                                        <p className="font-medium text-sm truncate" style={{ color: "#1B2B4B" }}>
                                          {student.name}
                                        </p>
                                        <p className="text-xs text-slate-400 truncate mb-1">
                                          {student.email}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                          <span
                                            className="inline-block px-2 py-0.5 text-[10px] rounded-full font-medium"
                                            style={{
                                              backgroundColor: student.isActive ? "#ECFDF5" : "#EFF6FF",
                                              color: student.isActive ? "#065F46" : "#1E40AF",
                                            }}
                                          >
                                            {student.isActive ? "Approved" : "Pending"}
                                          </span>
                                          {renderLastLogin(student)}
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => {
                                          onClose();
                                          onViewReports(student);
                                        }}
                                        className="px-2.5 py-1 text-xs rounded-md transition font-medium"
                                        style={{
                                          backgroundColor: "#EFF6FF",
                                          color: "#2563EB",
                                          borderRadius: "6px",
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.backgroundColor = "#DBEAFE";
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.backgroundColor = "#EFF6FF";
                                        }}
                                      >
                                        View Reports
                                      </button>
                                    </div>
                                  ))
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {viewMode === "all" && (
              Object.keys(filteredCoursesMap).length === 0 ? (
                <div className="text-center py-12">
                  <Users size={48} style={{ margin: "0 auto 12px", color: "#CBD5E1" }} />
                  <p style={{ color: "#1B2B4B" }}>No courses or batches match your search</p>
                </div>
              ) : (
                Object.entries(filteredCoursesMap).map(([courseName, courseBatches]) => {
                  const isCourseExpanded = searchQuery ? true : !!expandedCourses[courseName];
                  const totalCourseStudents = courseBatches.reduce(
                    (acc, b) => acc + (b.students?.length || 0),
                    0
                  );

                  return (
                    <div
                      key={courseName}
                      className="border rounded-xl overflow-hidden transition-all duration-300"
                      style={{
                        borderColor: isCourseExpanded ? "#3B82F6" : "#E2E8F0",
                        backgroundColor: "#FFFFFF",
                        borderRadius: "12px"
                      }}
                    >
                      {/* Course Row */}
                      <button
                        onClick={() => toggleCourse(courseName)}
                        className="w-full p-4 flex items-center justify-between text-left transition-colors"
                        style={{
                          backgroundColor: isCourseExpanded ? "#EFF6FF" : "#F8FAFC",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{
                              backgroundColor: isCourseExpanded ? "#3B82F6" : "#E2E8F0",
                              color: isCourseExpanded ? "#FFFFFF" : "#64748B",
                            }}
                          >
                            <BookOpen size={20} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-base" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                              {courseName}
                            </h4>
                            <p className="text-xs font-medium" style={{ color: "#64748B" }}>
                              {courseBatches.length} batch(es) • {totalCourseStudents} student(s)
                            </p>
                          </div>
                        </div>
                        <ChevronRight
                          size={20}
                          style={{
                            color: "#64748B",
                            transform: isCourseExpanded ? "rotate(90deg)" : "rotate(0deg)",
                            transition: "transform 0.3s ease",
                          }}
                        />
                      </button>

                      {/* Batches Dropdown Container */}
                      <AnimatePresence>
                        {isCourseExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                            style={{ borderTop: "1px solid #E2E8F0" }}
                          >
                            <div className="p-4 space-y-3" style={{ backgroundColor: "#FCFDFE" }}>
                              {courseBatches.map((batch) => {
                                const isBatchExpanded = searchQuery ? true : !!expandedBatches[batch._id];
                                const activeCount = batch.students?.filter((s) => s.isActive).length || 0;
                                const studentCount = batch.students?.length || 0;

                                return (
                                  <div
                                    key={batch._id}
                                    className="border rounded-lg overflow-hidden transition-all"
                                    style={{
                                      borderColor: isBatchExpanded ? "#10B981" : "#E2E8F0",
                                      borderRadius: "8px",
                                    }}
                                  >
                                    {/* Batch Row */}
                                    <button
                                      onClick={() => toggleBatch(batch._id)}
                                      className="w-full p-3 flex items-center justify-between text-left transition-colors"
                                      style={{
                                        backgroundColor: isBatchExpanded ? "#ECFDF5" : "#FFFFFF",
                                      }}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div
                                          className="w-8 h-8 rounded-md flex items-center justify-center"
                                          style={{
                                            backgroundColor: isBatchExpanded ? "#10B981" : "#EFF6FF",
                                            color: isBatchExpanded ? "#FFFFFF" : "#2563EB",
                                          }}
                                        >
                                          <Users size={16} />
                                        </div>
                                        <div>
                                          <h5 className="font-semibold text-sm" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                                            Batch #{batch.batch_no}
                                          </h5>
                                          <p className="text-xs" style={{ color: "#64748B" }}>
                                            {activeCount}/{studentCount} approved students
                                          </p>
                                        </div>
                                      </div>
                                      <ChevronRight
                                        size={18}
                                        style={{
                                          color: "#64748B",
                                          transform: isBatchExpanded ? "rotate(90deg)" : "rotate(0deg)",
                                          transition: "transform 0.3s ease",
                                        }}
                                      />
                                    </button>

                                    {/* Students List Container */}
                                    <AnimatePresence>
                                      {isBatchExpanded && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: "auto", opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          className="overflow-hidden"
                                          style={{ borderTop: "1px solid #E2E8F0" }}
                                        >
                                          <div className="p-3 space-y-2" style={{ backgroundColor: "#F8FAFC" }}>
                                            {batch.students.length === 0 ? (
                                              <p className="text-xs text-center py-4" style={{ color: "#94A3B8" }}>
                                                No students match your search
                                              </p>
                                            ) : (
                                              batch.students.map((student) => (
                                                <div
                                                  key={student._id}
                                                  className="bg-white p-3 rounded-lg flex items-center justify-between border border-slate-100 shadow-sm"
                                                  style={{ borderRadius: "6px" }}
                                                >
                                                  <div className="min-w-0">
                                                    <p className="font-medium text-sm truncate" style={{ color: "#1B2B4B" }}>
                                                      {student.name}
                                                    </p>
                                                    <p className="text-xs text-slate-400 truncate mb-1">
                                                      {student.email}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                                      <span
                                                        className="inline-block px-2 py-0.5 text-[10px] rounded-full font-medium"
                                                        style={{
                                                          backgroundColor: student.isActive ? "#ECFDF5" : "#EFF6FF",
                                                          color: student.isActive ? "#065F46" : "#1E40AF",
                                                        }}
                                                      >
                                                        {student.isActive ? "Approved" : "Pending"}
                                                      </span>
                                                      {renderLastLogin(student)}
                                                    </div>
                                                  </div>
                                                  <button
                                                    onClick={() => {
                                                      onClose();
                                                      onViewReports(student);
                                                    }}
                                                    className="px-2.5 py-1 text-xs rounded-md transition font-medium"
                                                    style={{
                                                      backgroundColor: "#EFF6FF",
                                                      color: "#2563EB",
                                                      borderRadius: "6px",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                      e.currentTarget.style.backgroundColor = "#DBEAFE";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                      e.currentTarget.style.backgroundColor = "#EFF6FF";
                                                    }}
                                                  >
                                                    View Reports
                                                  </button>
                                                </div>
                                              ))
                                            )}
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.4)",
        }}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          className="rounded-2xl shadow-xl max-w-sm w-full p-6 text-center"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
          }}
        >
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4"
            style={{
              backgroundColor: type === "danger" ? "#FEE2E2" : "#D1FAE5",
              color: type === "danger" ? "#EF4444" : "#10B981"
            }}
          >
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold mb-2" style={{ color: "#1B2B4B" }}>{title}</h3>
          <p className="text-sm text-slate-500 mb-6">{message}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-sm font-medium transition"
              style={{
                borderColor: "#E2E8F0",
                color: "#64748B",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F8FAFC"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium transition text-white"
              style={{
                backgroundColor: type === "danger" ? "#EF4444" : "#10B981",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = type === "danger" ? "#DC2626" : "#059669"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = type === "danger" ? "#EF4444" : "#10B981"}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function BatchCard({ batch, onViewReports, setBatches, triggerConfirm }) {
  const [expanded, setExpanded] = useState(false);

  const approve = async (id) => {
    triggerConfirm(
      "Confirm Approval",
      "Are you sure you want to approve this student?",
      "success",
      async () => {
        try {
          await API.patch(`/admin/approve-student/${id}`);
          toast.success("Student approved");

          setBatches((prev) =>
            prev.map((b) =>
              b._id === batch._id ||
              (b.batch_name === batch.batch_name && b.batch_no === batch.batch_no)
                ? {
                    ...b,
                    students: b.students.map((s) =>
                      s._id === id ? { ...s, isActive: true } : s
                    ),
                  }
                : b
            )
          );
        } catch (err) {
          console.error(err);
          toast.error("Approval failed");
        }
      }
    );
  };

  const reject = async (id) => {
    triggerConfirm(
      "Confirm Rejection",
      "Are you sure you want to reject this student?",
      "danger",
      async () => {
        try {
          await API.patch(`/admin/reject-student/${id}`);
          toast.success("Student rejected");

          setBatches((prev) =>
            prev.map((b) =>
              b._id === batch._id ||
              (b.batch_name === batch.batch_name && b.batch_no === batch.batch_no)
                ? {
                    ...b,
                    students: b.students.map((s) =>
                      s._id === id ? { ...s, isActive: false } : s
                    ),
                  }
                : b
            )
          );
        } catch (err) {
          console.error(err);
          toast.error("Rejection failed");
        }
      }
    );
  };

  const studentCount = batch.students?.length || 0;
  const activeCount = batch.students?.filter((s) => s.isActive).length || 0;

  return (
    <div className="rounded-xl overflow-hidden transition" style={{ backgroundColor: "#FFFFFF", border: "1.5px solid #E2E8F0", borderRadius: "12px" }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center justify-between transition"
        style={{
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#F8FAFC";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              backgroundColor: "#EFF6FF",
              borderRadius: "14px",
            }}
          >
            <Users size={24} style={{ color: "#2563EB" }} />
          </div>
          <div className="text-left">
            <h3 className="font-semibold" style={{ color: "#1B2B4B" }}>
              {batch.batch_name}
            </h3>
            <p className="text-sm" style={{ color: "#94A3B8" }}>
              Batch #{batch.batch_no}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm" style={{ color: "#94A3B8" }}>
              Students
            </p>
            <p className="font-semibold" style={{ color: "#1B2B4B" }}>
              {activeCount}/{studentCount}
            </p>
          </div>
          <ChevronRight
            size={20}
            style={{
              color: "#CBD5E1",
              transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
            }}
          />
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-0" style={{ borderTop: "1px solid #F1F5F9" }}>
              {!batch.students || batch.students.length === 0 ? (
                <p className="text-sm text-center py-6" style={{ color: "#94A3B8" }}>
                  No students in this batch
                </p>
              ) : (
                <div className="space-y-3">
                  {batch.students.map((s) => (
                    <div
                      key={s._id}
                      className="rounded-lg p-4 flex items-center justify-between gap-4"
                      style={{
                        backgroundColor: "#F8FAFC",
                        borderRadius: "8px",
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" style={{ color: "#1B2B4B" }}>
                          {s.name}
                        </p>
                        <p className="text-sm truncate" style={{ color: "#94A3B8" }}>
                          {s.email}
                        </p>
                        <span
                          className="inline-block px-3 py-1 text-xs rounded-full mt-2 font-medium"
                          style={{
                            backgroundColor: s.isActive ? "#ECFDF5" : "#EFF6FF",
                            color: s.isActive ? "#065F46" : "#1E40AF",
                            borderRadius: "20px",
                            padding: "3px 12px",
                            fontSize: "12px",
                          }}
                        >
                          {s.isActive ? "Approved" : "Pending"}
                        </span>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => onViewReports(s)}
                          className="px-3 py-1.5 text-sm rounded-lg transition font-medium"
                          style={{
                            backgroundColor: "#EFF6FF",
                            color: "#2563EB",
                            borderRadius: "8px",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#DBEAFE";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#EFF6FF";
                          }}
                        >
                          View
                        </button>

                        {!s.isActive && (
                          <>
                            <button
                              onClick={() => approve(s._id)}
                              className="p-2 rounded-lg transition"
                              title="Approve"
                              style={{
                                backgroundColor: "#ECFDF5",
                                color: "#10B981",
                                borderRadius: "8px",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#D1FAE5";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "#ECFDF5";
                              }}
                            >
                              <CheckCircle2 size={16} />
                            </button>

                            <button
                              onClick={() => reject(s._id)}
                              className="p-2 rounded-lg transition"
                              title="Reject"
                              style={{
                                backgroundColor: "#FEF2F2",
                                color: "#EF4444",
                                borderRadius: "8px",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#FEE2E2";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "#FEF2F2";
                              }}
                            >
                              <Ban size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}