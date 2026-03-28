// AdminDashboard.jsx
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
    <div className="space-y-5">
      {/* Top Bar / Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back, Admin</p>
        </div>
        <button
          onClick={fetchBatches}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
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
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.bgLight} p-3 rounded-lg`}>
                    <stat.icon size={24} className={stat.textColor} />
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      stat.changeType === "positive"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </h3>
                <p className="text-sm text-gray-500">{stat.title}</p>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
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
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-indigo-200 transition text-left group"
                >
                  <div
                    className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition`}
                  >
                    <action.icon size={24} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-500">{action.description}</p>
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
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Batches
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Overview of your latest batches
          </p>
        </div>
        <NavLink
          to="/admin/batch-management"
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
        >
          View All
          <ChevronRight size={16} />
        </NavLink>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-12 bg-gray-50 rounded-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : batches.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <Users size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-600 font-medium">No batches found</p>
            <p className="text-sm text-gray-400 mt-1">
              Create your first batch to get started
            </p>
            <button
              onClick={() => setAddBatchOpen(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition inline-flex items-center gap-2"
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
      className="bg-yellow-50 border border-yellow-200 rounded-xl p-6"
    >
      <div className="flex items-start gap-4">
        <div className="bg-yellow-100 p-3 rounded-lg">
          <AlertCircle size={24} className="text-yellow-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-900 mb-1">
            Pending Approvals
          </h3>
          <p className="text-sm text-yellow-700">
            You have {stats.pendingApprovals} student(s) waiting for approval.
          </p>
          <NavLink
            to="/admin/student-management"
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-yellow-800 hover:text-yellow-900"
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setAddBatchOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Create New Batch
              </h3>
              <button
                onClick={() => setAddBatchOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., FSD"
                  value={newBatch.batch_name}
                  onChange={(e) =>
                    setNewBatch({ ...newBatch, batch_name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch Number
                </label>
                <input
                  type="number"
                  placeholder="e.g., 1"
                  value={newBatch.batch_no}
                  onChange={(e) =>
                    setNewBatch({ ...newBatch, batch_no: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                />
              </div>

              <button
                onClick={createBatch}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition"
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedStudent(null)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl max-w-3xl w-full overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {selectedStudent.name}
                </h3>
                <p className="text-sm text-gray-500">Student Reports</p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {reportLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-12">
                  <Notebook size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-600">No reports found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div
                      key={report._id}
                      className="bg-gray-50 rounded-xl p-5 border border-gray-200"
                    >
                      <p className="text-sm text-gray-600 mb-3">
                        <span className="font-medium text-gray-900">
                          Audit Date:
                        </span>{" "}
                        {report.auditDate
                          ? new Date(report.auditDate).toLocaleDateString()
                          : "—"}
                      </p>

                      <h4 className="font-semibold text-gray-900 mb-2">
                        Parameters:
                      </h4>
                      <div className="space-y-1 mb-4">
                        {report.parameters?.map((p, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm py-1"
                          >
                            <span className="text-gray-600">{p.name}</span>
                            <span className="font-medium text-gray-900">
                              {p.score}
                            </span>
                          </div>
                        )) || <p className="text-sm text-gray-500">—</p>}
                      </div>

                      <h4 className="font-semibold text-gray-900 mb-2">
                        Remarks:
                      </h4>
                      <p className="text-sm text-gray-600">
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
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Users size={24} className="text-indigo-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{batch.batch_name}</h3>
            <p className="text-sm text-gray-500">Batch #{batch.batch_no}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm text-gray-500">Students</p>
            <p className="font-semibold text-gray-900">
              {activeCount}/{studentCount}
            </p>
          </div>
          <ChevronRight
            size={20}
            className={`text-gray-400 transition-transform ${
              expanded ? "rotate-90" : ""
            }`}
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
            <div className="p-5 pt-0 border-t border-gray-100">
              {!batch.students || batch.students.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">
                  No students in this batch
                </p>
              ) : (
                <div className="space-y-3">
                  {batch.students.map((s) => (
                    <div
                      key={s._id}
                      className="bg-gray-50 rounded-lg p-4 flex items-center justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {s.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {s.email}
                        </p>
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                            s.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {s.isActive ? "Approved" : "Pending"}
                        </span>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => onViewReports(s)}
                          className="px-3 py-1.5 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition"
                        >
                          View
                        </button>

                        {!s.isActive && (
                          <>
                            <button
                              onClick={() => approve(s._id)}
                              className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                              title="Approve"
                            >
                              <CheckCircle2 size={16} />
                            </button>

                            <button
                              onClick={() => reject(s._id)}
                              className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                              title="Reject"
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
