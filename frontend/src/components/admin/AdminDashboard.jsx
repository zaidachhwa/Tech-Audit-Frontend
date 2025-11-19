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
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle2,
  Ban,
  FolderGit2,
  Notebook,
} from "lucide-react";
import { NavLink } from "react-router-dom";

// Student table component (make sure this file exists at the path)
import AdminStudentTable from "./AdminStudentTable";

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [reports, setReports] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);

  const [addBatchOpen, setAddBatchOpen] = useState(false);
  const [newBatch, setNewBatch] = useState({ batch_name: "", batch_no: "" });

  // Create batch - updates UI state without refresh
  const createBatch = async () => {
    if (!newBatch.batch_name || !newBatch.batch_no)
      return toast.error("All fields required");

    try {
      const res = await API.post("/batches/create", newBatch);
      toast.success("Batch created");
      // Push returned batch (if backend returns it), otherwise use newBatch with a temporary id
      const created = res.data?.batch || {
        ...newBatch,
        students: [],
        _id: Date.now().toString(),
      };
      setBatches((prev) => [created, ...prev]);
      setAddBatchOpen(false);
      setNewBatch({ batch_name: "", batch_no: "" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to create batch");
    }
  };

  // Fetch batches
  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await API.get("/batches");
      // keep legacy compatibility
      setBatches(res.data?.batches || res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load batches");
    } finally {
      setLoading(false);
    }
  };

  // Fetch reports of a student
  const fetchStudentReports = async (id) => {
    try {
      setReportLoading(true);
      const res = await API.get(`/reports/student/${id}`);
      // Some endpoints return { count, reports } or just array
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100 text-gray-900">
      <Toaster position="top-right" />

      {/* HEADER */}
      <header className="bg-white/70 backdrop-blur-xl shadow-sm px-6 py-4 flex flex-col md:flex-row justify-between items-center rounded-b-2xl">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-2xl text-white shadow-md">
            <Users size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Admin Dashboard</h2>
            <p className="text-sm text-gray-600">
              Manage batches, students & approvals
            </p>
          </div>
        </div>

        <div className="flex flex-wrap mt-4 md:mt-0 items-center gap-3">
          <NavLink
            to="/admin/syllabus"
            className="cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl shadow transition flex items-center gap-2"
          >
            <Notebook size={18} /> <span>Syllabus Tracker</span>
          </NavLink>
          <NavLink
            to="/admin/project-tracking"
            className="cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl shadow transition flex items-center gap-2"
          >
            <FolderGit2 size={18} /> <span>Project Tracking</span>
          </NavLink>

          <NavLink
            to="/admin/add-reports"
            className="cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl shadow transition flex items-center gap-2"
          >
            <Plus size={18} /> <span>Add Reports</span>
          </NavLink>

          <button
            onClick={fetchBatches}
            className="cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl shadow flex items-center gap-2"
            title="Refresh batches"
          >
            <RefreshCw size={18} /> Refresh
          </button>

          <button
            onClick={logout}
            className="cursor-pointer px-4 py-2 rounded-xl shadow bg-white hover:bg-gray-100 transition flex items-center gap-2"
            title="Logout"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Add Batch button */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setAddBatchOpen(true)}
            className="cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl shadow flex items-center gap-2"
          >
            <Plus size={18} /> Add Batch
          </button>

          <div className="text-sm text-gray-600">Quick actions & overview</div>
        </div>

        {/* Batches list */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl"
        >
          <h3 className="text-lg font-semibold mb-4">Batches Overview</h3>

          {loading ? (
            <p className="text-center py-6 text-gray-600">Loading...</p>
          ) : batches.length === 0 ? (
            <p className="text-center py-6 text-gray-600">No batches found.</p>
          ) : (
            <div className="space-y-4">
              {batches.map((b, i) => (
                <BatchAccordion
                  key={b._id || i}
                  batch={b}
                  setBatches={setBatches}
                  onViewReports={(s) => {
                    setSelectedStudent(s);
                    fetchStudentReports(s._id);
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Student table */}
        <AdminStudentTable onRefresh={fetchBatches} batches={batches} />
      </main>

      {/* Add Batch Modal */}
      <AnimatePresence>
        {addBatchOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setAddBatchOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="bg-white/90 rounded-3xl shadow-xl max-w-md w-full p-6"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Create New Batch</h3>
                <X
                  size={20}
                  className="cursor-pointer"
                  onClick={() => setAddBatchOpen(false)}
                />
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Batch Name (e.g., FSD)"
                  value={newBatch.batch_name}
                  onChange={(e) =>
                    setNewBatch({ ...newBatch, batch_name: e.target.value })
                  }
                  className="w-full p-3 rounded-xl bg-white/60 border border-white/30"
                />

                <input
                  type="number"
                  placeholder="Batch No (e.g., 1)"
                  value={newBatch.batch_no}
                  onChange={(e) =>
                    setNewBatch({ ...newBatch, batch_no: e.target.value })
                  }
                  className="w-full p-3 rounded-xl bg-white/60 border border-white/30"
                />

                <button
                  onClick={createBatch}
                  className="cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 w-full text-white py-3 rounded-xl"
                >
                  Create Batch
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reports Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedStudent(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="bg-white/90 rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden"
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
            >
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white flex justify-between items-center">
                <h3 className="font-semibold">
                  {selectedStudent.name} — Reports
                </h3>
                <X
                  size={24}
                  className="cursor-pointer"
                  onClick={() => setSelectedStudent(null)}
                />
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {reportLoading ? (
                  <p className="text-center">Loading...</p>
                ) : reports.length === 0 ? (
                  <p className="text-center text-gray-600">No reports found.</p>
                ) : (
                  reports.map((report) => (
                    <div
                      key={report._id}
                      className="bg-white p-5 rounded-2xl shadow mb-4"
                    >
                      <p className="text-sm mb-2">
                        <b>Audit Date:</b>{" "}
                        {report.auditDate
                          ? new Date(report.auditDate).toLocaleString()
                          : "—"}
                      </p>

                      <h4 className="font-semibold">Parameters:</h4>
                      <ul className="ml-4 my-2 text-sm space-y-1">
                        {report.parameters?.map((p, idx) => (
                          <li key={idx}>
                            {p.name}: <b>{p.score}</b>
                          </li>
                        )) || <li>—</li>}
                      </ul>

                      <h4 className="font-semibold">Remarks:</h4>
                      <p className="text-sm">{report.overallRemarks || "—"}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -----------------------
  BatchAccordion component
   - receives setBatches so we can update state locally
------------------------ */
function BatchAccordion({ batch, onViewReports, setBatches }) {
  const [open, setOpen] = useState(false);

  // Approve student: update server and local state
  const approve = async (id) => {
    try {
      await API.patch(`/admin/approve-student/${id}`);
      toast.success("Student approved");

      // update batches state immutably
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

  // Reject student: update server and local state
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

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/30">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold text-gray-800">{batch.batch_name}</p>
          <p className="text-sm text-gray-500">Batch #{batch.batch_no}</p>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="cursor-pointer bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 px-4 py-2 rounded-xl flex items-center gap-2 hover:opacity-95 transition"
        >
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          {open ? "Hide" : "View"}
        </button>
      </div>

      {open && (
        <div className="mt-4 space-y-3">
          {!batch.students || batch.students.length === 0 ? (
            <p className="text-sm text-gray-500">No students</p>
          ) : (
            batch.students.map((s) => (
              <div
                key={s._id}
                className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-gray-800">{s.name}</p>
                  <p className="text-sm text-gray-500">{s.email}</p>

                  <span
                    className={`px-2 py-1 text-xs rounded-full mt-2 inline-block ${
                      s.isActive
                        ? "bg-green-200 text-green-800"
                        : "bg-yellow-200 text-yellow-800"
                    }`}
                  >
                    {s.isActive ? "Approved" : "Pending Approval"}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onViewReports(s)}
                    className="cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-3 py-2 rounded-xl transition flex items-center gap-2"
                  >
                    View
                  </button>

                  {!s.isActive && (
                    <>
                      <button
                        onClick={() => approve(s._id)}
                        className="cursor-pointer bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white px-3 py-2 rounded-xl flex items-center gap-2"
                      >
                        <CheckCircle2 size={16} /> Approve
                      </button>

                      <button
                        onClick={() => reject(s._id)}
                        className="cursor-pointer bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white px-3 py-2 rounded-xl flex items-center gap-2"
                      >
                        <Ban size={16} /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
