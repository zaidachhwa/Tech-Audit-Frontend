import { useEffect, useState, useMemo } from "react";
import { API } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Users, RefreshCw, Plus } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { NavLink } from "react-router-dom";

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [students, setStudents] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedStudentReports, setSelectedStudentReports] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [compareData, setCompareData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [compareFilter, setCompareFilter] = useState({
    parameter: "",
    batch_name: "",
    batch_no: "",
    audit_date: "",
  });

  // 🧭 Fetch all students
  const fetchStudents = async () => {
    try {
      const { data } = await API.get("/student/list");
      setStudents(data.students || []);
      toast.success("Students loaded");
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch students");
    }
  };

  //  Fetch reports for selected student
  const fetchStudentReports = async (studentId) => {
    try {
      setLoading(true);
      const { data } = await API.get(`/reports/student/${studentId}`);
      setSelectedStudentReports(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  // 📊 Compare batches (UPDATED)
  const handleCompare = async () => {
    const { parameter, batch_name, batch_no, audit_date } = compareFilter;
    if (
      !parameter.trim() ||
      !batch_name.trim() ||
      !batch_no.trim() ||
      !audit_date
    )
      return toast.error("Please fill all comparison fields");

    try {
      setLoading(true);
      const { data } = await API.get("/reports/compare", {
        params: { parameter, batch_name, batch_no, audit_date },
      });
      setCompareData(data.results || []);
      toast.success("Comparison loaded");
    } catch (err) {
      console.error(err);
      toast.error("Comparison failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // 🧠 Chart Data
  const compareChartData = useMemo(() => {
    if (!compareData?.length) return [];
    return compareData.map((d, i) => ({
      name: d.student_name || `Student ${i + 1}`,
      score: d.score || 0,
      batch: `${d.batch_name || "Batch"} ${d.batch_no || ""}`,
      audit_date: d.audit_date
        ? new Date(d.audit_date).toLocaleDateString()
        : "—",
    }));
  }, [compareData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-slate-50 text-gray-800">
      <Toaster position="top-right" />
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-100 shadow-sm px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-600 text-white rounded-full p-2 shadow-md">
            <Users size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              Admin Dashboard
            </h1>
            <p className="text-sm text-slate-500">
              Manage reports & comparisons
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NavLink
            to="/admin/add-reports"
            title="Add Reports"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg shadow-sm transition cursor-pointer"
          >
            <Plus size={16} />
            <span className="hidden md:inline">Add Reports</span>
          </NavLink>

          <button
            onClick={fetchStudents}
            title="Refresh"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg shadow-sm transition cursor-pointer"
          >
            <RefreshCw size={16} />
            <span className="hidden md:inline">Refresh</span>
          </button>

          <button
            onClick={logout}
            className="inline-flex cursor-pointer items-center gap-2 border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50 transition"
          >
            <LogOut size={16} />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* 🧾 Students Table */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl shadow-sm p-4"
        >
          <h2 className="text-lg font-semibold mb-3 text-slate-800">
            Students Overview
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-emerald-50 text-emerald-800">
                <tr>
                  <th className="p-3 text-left font-medium">Name</th>
                  <th className="p-3 text-left font-medium">Batch</th>
                  <th className="p-3 text-left font-medium">Email</th>
                  <th className="p-3 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? (
                  students.map((s, i) => (
                    <motion.tr
                      key={s._id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-t hover:bg-emerald-50/40"
                    >
                      <td className="p-3">{s.name}</td>
                      <td className="p-3">
                        {s.batch_name} ({s.batch_no})
                      </td>
                      <td className="p-3">{s.email}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedStudent(s);
                            fetchStudentReports(s._id);
                          }}
                          className="px-3 py-2 cursor-pointer rounded-lg bg-emerald-600 text-white"
                        >
                          View Reports
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-slate-500">
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* 🧩 Comparison Section */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl shadow-sm p-5"
        >
          {/* Filter Inputs (UPDATED) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <input
              placeholder="Parameter"
              value={compareFilter.parameter}
              onChange={(e) =>
                setCompareFilter((p) => ({ ...p, parameter: e.target.value }))
              }
              className="border rounded-lg px-3 py-2 bg-white/70"
            />
            <input
              placeholder="Batch Name"
              value={compareFilter.batch_name}
              onChange={(e) =>
                setCompareFilter((p) => ({ ...p, batch_name: e.target.value }))
              }
              className="border rounded-lg px-3 py-2 bg-white/70"
            />
            <input
              placeholder="Batch No"
              value={compareFilter.batch_no}
              onChange={(e) =>
                setCompareFilter((p) => ({ ...p, batch_no: e.target.value }))
              }
              className="border rounded-lg px-3 py-2 bg-white/70"
            />
            <input
              type="date"
              value={compareFilter.audit_date}
              onChange={(e) =>
                setCompareFilter((p) => ({ ...p, audit_date: e.target.value }))
              }
              className="border rounded-lg px-3 py-2 bg-white/70"
            />
          </div>

          <button
            onClick={handleCompare}
            className="bg-emerald-600 cursor-pointer hover:bg-emerald-700 text-white px-4 py-2 rounded-lg"
          >
            Compare
          </button>

          <button
            onClick={() => {
              setCompareData([]);
              setCompareFilter({
                parameter: "",
                batch_name: "",
                batch_no: "",
                audit_date: "",
              });
            }}
            className="ml-3 bg-emerald-600 cursor-pointer hover:bg-emerald-700 text-white px-4 py-2 rounded-lg"
          >
            Clear
          </button>

          <div className="mt-5 grid grid-cols-1 gap-4">
            {/* Chart */}
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">
                Student-wise Comparison
              </h3>
              {compareChartData.length ? (
                <div style={{ width: "100%", height: 280 }}>
                  <ResponsiveContainer>
                    <BarChart data={compareChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="score" name="Score" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No comparison data yet.
                </p>
              )}
            </div>

            {/* Table */}
            <div className="bg-white p-4 rounded-lg border shadow-sm overflow-auto">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">
                Comparison Details
              </h3>
              {compareData.length ? (
                <table className="min-w-full text-sm">
                  <thead className="bg-emerald-50 text-emerald-800">
                    <tr>
                      <th className="p-2 text-left">Student</th>
                      <th className="p-2 text-left">Batch</th>
                      <th className="p-2 text-left">Parameter</th>
                      <th className="p-2 text-left">Score</th>
                      <th className="p-2 text-left">Audit Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compareData.map((d, i) => (
                      <tr key={i} className="border-t hover:bg-emerald-50/30">
                        <td className="p-2">{d.student_name}</td>
                        <td className="p-2">
                          {d.batch_name} #{d.batch_no}
                        </td>
                        <td className="p-2">{d.parameter}</td>
                        <td className="p-2">{d.score}</td>
                        <td className="p-2">
                          {d.audit_date
                            ? new Date(d.audit_date).toLocaleDateString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-slate-500">No comparison data.</p>
              )}
            </div>
          </div>
        </motion.section>
      </main>

      {/* 🪟 Student Report Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedStudent(null)}
          >
            <motion.div
              className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-3xl relative overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">
                  {selectedStudent.name}’s Detailed Reports
                </h2>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-white hover:text-gray-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                {loading ? (
                  <p className="text-center text-slate-500">Loading...</p>
                ) : selectedStudentReports.length ? (
                  selectedStudentReports.map((r, i) => (
                    <div
                      key={i}
                      className="border border-slate-200 rounded-xl p-5 bg-white/80 shadow-sm space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-slate-500">
                          <span className="font-medium text-emerald-700">
                            Audit Date:
                          </span>{" "}
                          {r.auditDate
                            ? new Date(r.auditDate).toLocaleString()
                            : "—"}
                        </p>
                        <p className="text-xs text-slate-400">
                          Created:{" "}
                          {r.createdAt
                            ? new Date(r.createdAt).toLocaleString()
                            : "—"}
                        </p>
                      </div>

                      {/* Parameters */}
                      <div>
                        <h4 className="text-sm font-semibold text-emerald-700 mb-2">
                          Parameters & Scores
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {r.parameters?.map((p, idx) => (
                            <div
                              key={idx}
                              className="bg-emerald-50 p-2 rounded-lg text-sm border border-emerald-100"
                            >
                              <span className="font-medium">{p.name}</span>:{" "}
                              {p.score}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Feedback Schema */}
                      {r.feedbackSchema?.length ? (
                        <div>
                          <h4 className="text-sm font-semibold text-emerald-700 mb-2">
                            Feedback Schema
                          </h4>
                          {r.feedbackSchema.map((f, idx) => (
                            <div
                              key={idx}
                              className="bg-slate-50 rounded-lg p-3 border text-sm text-slate-700 space-y-1"
                            >
                              <p>
                                <b>Point 1:</b> {f.point1 || "—"}
                              </p>
                              <p>
                                <b>Point 2:</b> {f.point2 || "—"}
                              </p>
                              <p>
                                <b>Point 3:</b> {f.point3 || "—"}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {/* Remarks */}
                      <div>
                        <h4 className="text-sm font-semibold text-emerald-700 mb-2">
                          Overall Remarks
                        </h4>
                        <p className="bg-slate-50 border rounded-lg p-3 text-sm text-slate-700">
                          {r.overallRemarks || "No remarks provided."}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-500">
                    No reports for this student.
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
