import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Eye, LogOut, Calendar, GraduationCap } from "lucide-react";

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filter, setFilter] = useState({ date: "", search: "" });

  const fetchReports = async () => {
    try {
      const { data } = await API.get(`/reports/student/${user.id}`);
      setReports(data);
      setFilteredReports(data);
    } catch (error) {
      toast.error("Failed to load reports");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // 🔍 Handle Filters
  useEffect(() => {
    let filtered = reports;

    if (filter.date) {
      filtered = filtered.filter((r) =>
        new Date(r.auditDate).toLocaleDateString().includes(filter.date)
      );
    }

    if (filter.search) {
      filtered = filtered.filter((r) =>
        r.overallRemarks?.toLowerCase().includes(filter.search.toLowerCase())
      );
    }

    setFilteredReports(filtered);
  }, [filter, reports]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 text-gray-800">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-md px-6 py-4 flex justify-between items-center border-b border-indigo-100">
        <div className="flex items-center gap-3">
          <GraduationCap className="text-indigo-600" size={30} />
          <h1 className="text-2xl font-semibold text-indigo-700">
            Welcome, {user?.name?.split(" ")[0]}
          </h1>
        </div>
        <button
          onClick={() => {
            logout();
            toast.success("Logged out successfully");
          }}
          className="flex cursor-pointer items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </header>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-6 flex flex-wrap gap-4 items-center justify-between"
      >
        <div className="flex gap-3 flex-wrap items-center">
          <div className="flex items-center bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-lg px-3 py-2">
            <Calendar className="text-indigo-500 mr-2" size={18} />
            <input
              type="date"
              value={filter.date}
              onChange={(e) => setFilter({ ...filter, date: e.target.value })}
              className="bg-transparent outline-none"
            />
          </div>

          <div className="relative bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-lg">
            <Search
              className="absolute left-3 top-2.5 text-indigo-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Search remarks..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="pl-10 pr-3 py-2 w-64 bg-transparent outline-none text-gray-700"
            />
          </div>
        </div>
      </motion.div>

      {/* Table / Card Layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-6"
      >
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <div className="bg-white/80 backdrop-blur-md border border-indigo-100 rounded-2xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-indigo-100/70 text-indigo-800">
                <tr>
                  <th className="text-left p-4 font-semibold">Audit Date</th>
                  <th className="text-left p-4 font-semibold">
                    Total Parameters
                  </th>
                  <th className="text-left p-4 font-semibold">Remarks</th>
                  <th className="text-center p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length > 0 ? (
                  filteredReports.map((r, index) => (
                    <motion.tr
                      key={r._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-t hover:bg-indigo-50/60 transition-all"
                    >
                      <td className="p-4">
                        {new Date(r.auditDate).toLocaleDateString()}
                      </td>
                      <td className="p-4">{r.parameters?.length || 0}</td>
                      <td className="p-4 truncate max-w-xs">
                        {r.overallRemarks || "—"}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setSelectedReport(r)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1 rounded-lg flex items-center gap-2 mx-auto transition-all cursor-pointer"
                        >
                          <Eye size={16} /> View
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-gray-500 p-6">
                      No reports found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden space-y-4">
          {filteredReports.length > 0 ? (
            filteredReports.map((r, index) => (
              <motion.div
                key={r._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/80 backdrop-blur-md border border-indigo-100 rounded-2xl shadow-md p-4"
              >
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Date:</strong>{" "}
                  {new Date(r.auditDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Parameters:</strong> {r.parameters?.length || 0}
                </p>
                <p className="text-sm text-gray-600 truncate mb-2">
                  <strong>Remarks:</strong> {r.overallRemarks || "—"}
                </p>
                <button
                  onClick={() => setSelectedReport(r)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                  <Eye size={16} /> View Details
                </button>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-6">No reports found</p>
          )}
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center p-4 z-50"
            onClick={() => setSelectedReport(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg overflow-y-auto max-h-[90vh]"
            >
              <h2 className="text-2xl font-semibold mb-4 text-indigo-700">
                Report Details
              </h2>

              <div className="space-y-3 text-sm">
                <p>
                  <strong>Audit Date:</strong>{" "}
                  {new Date(selectedReport.auditDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Remarks:</strong>{" "}
                  {selectedReport.overallRemarks || "N/A"}
                </p>

                <h3 className="text-lg font-semibold mt-4 text-indigo-600">
                  Scores:
                </h3>
                <ul className="space-y-1">
                  {selectedReport.parameters.map((p, i) => (
                    <li key={i} className="flex justify-between border-b py-1">
                      <span>{p.name}</span>
                      <span className="font-medium text-indigo-700">
                        {p.score}
                      </span>
                    </li>
                  ))}
                </ul>

                <h3 className="text-lg font-semibold mt-4 text-indigo-600">
                  Feedback:
                </h3>
                {selectedReport.feedbackSchema.map((f, i) => (
                  <div
                    key={i}
                    className="border rounded-lg p-3 mb-2 bg-indigo-50/50"
                  >
                    {Object.entries(f).map(([k, v]) => (
                      <p key={k} className="text-sm">
                        <strong className="capitalize">{k}:</strong> {v}
                      </p>
                    ))}
                  </div>
                ))}
              </div>

              <div className="text-right mt-6">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-lg font-medium transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
