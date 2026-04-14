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
import { useAuth } from "../../context/AuthContext";
import MultiBatchProjectAssign from "./MultiBatchProjectAssign";

export default function ProjectTracking() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMultiBatchModal, setShowMultiBatchModal] = useState(false);
  const [openCourses, setOpenCourses] = useState({});
  const [search, setSearch] = useState("");
  const { user } = useAuth();
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
    <div className="space-y-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>
      <Toaster position="top-right" />

      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "#1B2B4B", fontWeight: "700" }}>
            <div
              style={{
                backgroundColor: "#EFF6FF",
                padding: "6px",
                borderRadius: "8px",
              }}
            >
              <FolderGit2 size={22} style={{ color: "#2563EB" }} />
            </div>
            Project Tracking
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#94A3B8" }}>
            Track and manage batch-wise student projects
          </p>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowMultiBatchModal(true)}
            className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
            style={{
              backgroundColor: "#2563EB",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#1E40AF";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#2563EB";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(37, 99, 235, 0.3)";
            }}
          >
            <Rocket size={15} />
            Bulk Assign
          </motion.button>

          <button
            onClick={fetchBatches}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
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
            bgColor: "#EFF6FF",
            iconColor: "#2563EB",
          },
          {
            label: "Total Batches",
            value: batches.length,
            icon: <Hash size={18} />,
            bgColor: "#F3E8FF",
            iconColor: "#A78BFA",
          },
          {
            label: "Total Students",
            value: totalStudents,
            icon: <Users size={18} />,
            bgColor: "#ECFDF5",
            iconColor: "#10B981",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-lg p-4 shadow-sm flex items-center gap-3"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #E2E8F0",
              borderRadius: "12px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <div
              className="p-2.5 rounded-lg"
              style={{
                backgroundColor: s.bgColor,
                borderRadius: "8px",
              }}
            >
              <div style={{ color: s.iconColor }}>{s.icon}</div>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: "#1B2B4B", fontWeight: "800" }}>
                {s.value}
              </p>
              <p className="text-xs font-medium" style={{ color: "#94A3B8" }}>
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── SEARCH + BATCH LIST ── */}
      <div
        className="rounded-lg shadow-sm overflow-hidden"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1.5px solid #E2E8F0",
          borderRadius: "12px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        {/* search bar */}
        <div
          className="px-5 py-4 flex items-center gap-3"
          style={{
            backgroundColor: "#F8FAFC",
            borderBottom: "1px solid #F1F5F9",
          }}
        >
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "#94A3B8" }}
            />
            <input
              type="text"
              placeholder="Search courses…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg outline-none transition"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1.5px solid #E2E8F0",
                color: "#1B2B4B",
                borderRadius: "8px",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#2563EB";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#E2E8F0";
              }}
            />
          </div>
          <span className="text-xs whitespace-nowrap" style={{ color: "#94A3B8" }}>
            {filteredEntries.length} course{filteredEntries.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16" style={{ color: "#94A3B8" }}>
            <RefreshCw size={28} className="animate-spin mb-3" style={{ color: "#2563EB" }} />
            <p className="text-sm">Loading batches…</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16" style={{ color: "#94A3B8" }}>
            <Layers size={40} className="mb-3" style={{ color: "#CBD5E1" }} />
            <p className="font-medium" style={{ color: "#64748B" }}>
              No courses found
            </p>
            <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>
              {search ? "Try a different search term" : "Create a batch from the dashboard to get started"}
            </p>
          </div>
        ) : (
          <div style={{ borderTop: "1px solid #F1F5F9" }}>
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
                  style={{ borderBottom: "1px solid #F1F5F9" }}
                >
                  {/* Course row */}
                  <button
                    onClick={() => toggleCourse(courseName)}
                    className="w-full flex items-center gap-4 px-5 py-4 transition text-left group"
                    style={{
                      backgroundColor: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#F8FAFC";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                      style={{
                        backgroundColor: "#2563EB",
                        borderRadius: "8px",
                        boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)",
                      }}
                    >
                      <Layers size={18} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm" style={{ color: "#1B2B4B", fontWeight: "700" }}>
                        {courseName}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="inline-flex items-center gap-1 text-xs" style={{ color: "#94A3B8" }}>
                          <Hash size={11} />
                          {courseBatches.length} batch{courseBatches.length !== 1 ? "es" : ""}
                        </span>
                        <span style={{ color: "#E2E8F0" }}>·</span>
                        <span className="inline-flex items-center gap-1 text-xs" style={{ color: "#94A3B8" }}>
                          <Users size={11} />
                          {studentCount} student{studentCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        color: "#94A3B8",
                        transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
                        transition: "transform 0.2s ease",
                      }}
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
                        className="overflow-hidden"
                        style={{
                          backgroundColor: "#F8FAFC",
                          borderTop: "1px solid #F1F5F9",
                        }}
                      >
                        <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {courseBatches.map((batch) => (
                            <motion.button
                              key={batch._id}
                              whileHover={{ scale: 1.02, y: -1 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                const base = user?.role === "teacher" ? "/teacher" : "/admin";
                                navigate(`${base}/project-tracking/batch/${batch._id}`);
                              }}
                              className="flex items-center justify-between rounded-lg px-4 py-3 text-left transition group"
                              style={{
                                backgroundColor: "#FFFFFF",
                                border: "1.5px solid #E2E8F0",
                                borderRadius: "8px",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = "#2563EB";
                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.2)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = "#E2E8F0";
                                e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
                              }}
                            >
                              <div>
                                <p
                                  className="text-sm font-semibold transition"
                                  style={{
                                    color: "#1B2B4B",
                                    fontWeight: "600",
                                  }}
                                  onMouseEnter={(e) => {
                                    // This is handled by parent button hover
                                  }}
                                >
                                  Batch {batch.batch_no}
                                </p>
                                <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "#94A3B8" }}>
                                  <Users size={10} />
                                  {batch.students?.length || 0} student
                                  {batch.students?.length !== 1 ? "s" : ""}
                                </p>
                              </div>
                              <ChevronRight
                                size={15}
                                style={{
                                  color: "#94A3B8",
                                  flexShrink: 0,
                                  transition: "color 0.2s ease",
                                }}
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