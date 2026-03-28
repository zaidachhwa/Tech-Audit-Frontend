// src/components/admin/ProjectTracking.jsx
import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  RefreshCw,
  Layers,
  ChevronRight,
  ChevronDown,
  Users,
  Hash,
  FolderGit2,
  Rocket,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MultiBatchProjectAssign from "./MultiBatchProjectAssign";

export default function ProjectTracking() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMultiBatchModal, setShowMultiBatchModal] = useState(false);
  const [openCourses, setOpenCourses] = useState({});
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  /* group batches by course name */
  const grouped = batches.reduce((acc, batch) => {
    const key = batch.batch_name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(batch);
    return acc;
  }, {});

  /* filter by search */
  const filteredEntries = Object.entries(grouped).filter(([name]) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleCourse = (name) =>
    setOpenCourses((prev) => ({ ...prev, [name]: !prev[name] }));

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/batches");
      setBatches(data.batches || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch batches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const totalStudents = batches.reduce(
    (sum, b) => sum + (b.students?.length || 0),
    0
  );

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FolderGit2 size={22} className="text-indigo-600" />
            Project Tracking
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Track and manage batch-wise student projects
          </p>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowMultiBatchModal(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium transition cursor-pointer"
          >
            <Rocket size={15} />
            Bulk Assign
          </motion.button>

          <button
            onClick={fetchBatches}
            disabled={loading}
            className="inline-flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg shadow-sm text-sm font-medium transition disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── STAT PILLS ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Courses",
            value: Object.keys(grouped).length,
            icon: <Layers size={18} />,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
          },
          {
            label: "Total Batches",
            value: batches.length,
            icon: <Hash size={18} />,
            color: "text-violet-600",
            bg: "bg-violet-50",
          },
          {
            label: "Total Students",
            value: totalStudents,
            icon: <Users size={18} />,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-3"
          >
            <div className={`${s.bg} ${s.color} p-2.5 rounded-lg`}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── SEARCH + BATCH LIST ── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* search bar */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search courses…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
            />
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {filteredEntries.length} course{filteredEntries.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <RefreshCw size={28} className="animate-spin mb-3 text-indigo-400" />
            <p className="text-sm">Loading batches…</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Layers size={40} className="mb-3 text-gray-300" />
            <p className="font-medium text-gray-500">No courses found</p>
            <p className="text-xs mt-1">
              {search ? "Try a different search term" : "Create a batch from the dashboard to get started"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredEntries.map(([courseName, courseBatches], i) => {
              const isOpen = openCourses[courseName];
              const studentCount = courseBatches.reduce(
                (sum, b) => sum + (b.students?.length || 0),
                0
              );

              return (
                <motion.div
                  key={courseName}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {/* Course row */}
                  <button
                    onClick={() => toggleCourse(courseName)}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition text-left group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                      <Layers size={18} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">
                        {courseName}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <Hash size={11} />
                          {courseBatches.length} batch{courseBatches.length !== 1 ? "es" : ""}
                        </span>
                        <span className="text-gray-300">·</span>
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <Users size={11} />
                          {studentCount} student{studentCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`text-gray-400 group-hover:text-indigo-500 transition-transform duration-200 ${
                        isOpen ? "rotate-0" : "-rotate-90"
                      }`}
                    >
                      <ChevronDown size={18} />
                    </div>
                  </button>

                  {/* Batch cards */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-gray-100 bg-gray-50"
                      >
                        <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {courseBatches.map((batch) => (
                            <motion.button
                              key={batch._id}
                              whileHover={{ scale: 1.02, y: -1 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() =>
                                navigate(
                                  `/admin/project-tracking/batch/${batch._id}`
                                )
                              }
                              className="flex items-center justify-between bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-md rounded-xl px-4 py-3 shadow-sm text-left transition group"
                            >
                              <div>
                                <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-600 transition">
                                  Batch {batch.batch_no}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                  <Users size={10} />
                                  {batch.students?.length || 0} student
                                  {batch.students?.length !== 1 ? "s" : ""}
                                </p>
                              </div>
                              <ChevronRight
                                size={15}
                                className="text-gray-300 group-hover:text-indigo-400 transition flex-shrink-0"
                              />
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Multi-Batch Assignment Modal */}
      <AnimatePresence>
        {showMultiBatchModal && (
          <MultiBatchProjectAssign
            onClose={() => setShowMultiBatchModal(false)}
            onAssigned={fetchBatches}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
