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

export default function AdminDashboard() {
  const { logout } = useAuth();
  const location = useLocation();

  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);

  // ⭐ Sidebar state (reused everywhere)
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [reports, setReports] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);

  const [addBatchOpen, setAddBatchOpen] = useState(false);
  const [newBatch, setNewBatch] = useState({ batch_name: "", batch_no: "" });

  // Stats
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    pendingApprovals: 0,
    totalBatches: 0,
    totalTeachers: 0,
    recentActivity: 0,
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
      calculateStats([created, ...batches]);
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
      calculateStats(batchesData);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load batches");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (batchesData) => {
    const totalStudents = batchesData.reduce(
      (acc, batch) => acc + (batch.students?.length || 0),
      0
    );
    const activeStudents = batchesData.reduce(
      (acc, batch) =>
        acc + (batch.students?.filter((s) => s.isActive).length || 0),
      0
    );
    const pendingApprovals = totalStudents - activeStudents;

    setStats({
      totalStudents,
      activeStudents,
      pendingApprovals,
      totalBatches: batchesData.length,
      totalTeachers: 0, // You can fetch this from API
      recentActivity: pendingApprovals,
    });
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

  useEffect(() => {
    fetchBatches();
  }, []);

  // Stats cards
  const statsCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: GraduationCap,
      color: "bg-blue-500",
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
      change: "+12%",
      changeType: "positive",
    },
    {
      title: "Active Students",
      value: stats.activeStudents,
      icon: CheckCircle2,
      color: "bg-green-500",
      bgLight: "bg-green-50",
      textColor: "text-green-600",
      change: "+8%",
      changeType: "positive",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingApprovals,
      icon: Clock,
      color: "bg-yellow-500",
      bgLight: "bg-yellow-50",
      textColor: "text-yellow-600",
      change: stats.pendingApprovals > 0 ? "Needs attention" : "All clear",
      changeType: stats.pendingApprovals > 0 ? "warning" : "positive",
    },
    {
      title: "Total Batches",
      value: stats.totalBatches,
      icon: Users,
      color: "bg-purple-500",
      bgLight: "bg-purple-50",
      textColor: "text-purple-600",
      change: "+3",
      changeType: "positive",
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
    <div className="space-y-5" style={{ backgroundColor: "#F8FAFC", fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", padding: "24px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>

      {/* Top Bar / Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-5xl" style={{ color: "#1B2B4B", fontSize: "20px", fontWeight: "700" }}>
            Dashboard
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#64748B", fontSize: "13px" }}>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-3xl p-6 transition"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1.5px solid #E2E8F0",
                borderRadius: "12px",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
                e.currentTarget.style.transform = "translateY(0)";
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
                  className="text-xs font-medium px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: stat.changeType === "positive" ? "#ECFDF5" : "#FEF3C7",
                    color: stat.changeType === "positive" ? "#065F46" : "#92400E",
                  }}
                >
                  {stat.change}
                </span>
              </div>
              <h3 className="font-black mb-1" style={{ color: "#1B2B4B", fontSize: "28px", fontWeight: "800" }}>
                {stat.value}
              </h3>
              <p className="text-sm" style={{ color: "#64748B", fontSize: "11px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {stat.title}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="font-semibold mb-4" style={{ color: "#1B2B4B", fontSize: "20px", fontWeight: "700" }}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Recent Batches */}
        <RecentBatchesSection
          batches={batches}
          loading={loading}
          setAddBatchOpen={setAddBatchOpen}
          setBatches={setBatches}
          setSelectedStudent={setSelectedStudent}
          fetchStudentReports={fetchStudentReports}
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
    </div>
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

function BatchCard({ batch, onViewReports, setBatches }) {
  const [expanded, setExpanded] = useState(false);

  const approve = async (id) => {
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
  };

  const reject = async (id) => {
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