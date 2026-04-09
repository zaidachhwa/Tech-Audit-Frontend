import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../api/axios";
import { Calendar, Eye, Trash2, Layers, ChevronRight, Users, Hash, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Drafts() {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [openCourses, setOpenCourses] = useState({});
  const [openBatches, setOpenBatches] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const fetchDrafts = async () => {
    const res = await API.get("/reports/drafts");
    setDrafts(res.data);
  };

  useEffect(() => { fetchDrafts(); }, []);

  const filteredDrafts = drafts.filter((d) =>
    (d.student?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group: { FSD: { 1: [...drafts], 2: [...drafts] }, BVOC: { ... } }
  const grouped = filteredDrafts.reduce((acc, draft) => {
    const course = draft.student?.batch_name || "Unknown";
    const batchNo = draft.student?.batch_no || "?";
    if (!acc[course]) acc[course] = {};
    if (!acc[course][batchNo]) acc[course][batchNo] = [];
    acc[course][batchNo].push(draft);
    return acc;
  }, {});

  const toggleCourse = (course) =>
    setOpenCourses(prev => ({ ...prev, [course]: !prev[course] }));

  const toggleBatch = (key) =>
    setOpenBatches(prev => ({ ...prev, [key]: !prev[key] }));

  const handleDelete = async (id) => {
    await API.delete(`/reports/draft/${id}`);
    toast.success("Draft Deleted");
    fetchDrafts();
  };

  const handleViewDraft = async (draft) => {
    try {
      const res = await API.post(
        "/reports/preview",
        {
          student: {
            name: draft.student?.name,
            email: draft.student?.email,
            batch_name: draft.student?.batch_name,
            batch_no: draft.student?.batch_no,
          },
          parameters: draft.parameters,
          feedbackSchema: draft.feedbackSchema?.[0],
          overallRemarks: draft.overallRemarks,
          auditDate: draft.auditDate,
        },
        { responseType: "blob" }
      );
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      setPreviewPdfUrl(url);
      setShowPreview(true);
    } catch (err) {
      toast.error("Preview failed");
    }
  };

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: "#F8FAFC", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>

      {/* Header Card */}
      <div
        className="rounded-lg shadow-sm p-6 mb-6"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1.5px solid #E2E8F0",
          borderRadius: "12px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="text-white rounded-lg p-3"
            style={{
              backgroundColor: "#2563EB",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
            }}
          >
            <Layers size={22} />
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: "#1B2B4B", fontWeight: "700" }}>
              Draft Reports
            </h2>
            <p className="text-sm" style={{ color: "#94A3B8" }}>
              {drafts.length} total drafts across all batches
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ marginTop: 20 }}>
          <div style={{ position: "relative", maxWidth: 400 }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
            <input
              type="text"
              placeholder="Search reports by student name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px 10px 38px",
                borderRadius: 10,
                border: "1.5px solid #E2E8F0",
                fontSize: 14,
                outline: "none",
                fontFamily: "'DM Sans', sans-serif",
                color: "#1B2B4B"
              }}
              onFocus={(e) => e.target.style.borderColor = "#2563EB"}
              onBlur={(e) => e.target.style.borderColor = "#E2E8F0"}
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <div
        className="rounded-lg shadow-sm p-6"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1.5px solid #E2E8F0",
          borderRadius: "12px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        {!drafts.length ? (
          <div className="text-center py-12">
            <Layers size={48} style={{ margin: "0 auto 16px", color: "#CBD5E1" }} />
            <p className="text-lg" style={{ color: "#94A3B8" }}>
              No drafts found.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([courseName, batches]) => {
              const totalDrafts = Object.values(batches).flat().length;

              return (
                <motion.div
                  key={courseName}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-lg overflow-hidden"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid #E2E8F0",
                    borderRadius: "12px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  {/* Course Row */}
                  <div
                    onClick={() => toggleCourse(courseName)}
                    className="flex items-center gap-4 px-5 py-4 cursor-pointer transition"
                    style={{
                      backgroundColor: "#F8FAFC",
                      borderBottom: "1px solid #F1F5F9",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#F1F5F9";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#F8FAFC";
                    }}
                  >
                    <div
                      className="text-white rounded-lg p-2"
                      style={{
                        backgroundColor: "#2563EB",
                        borderRadius: "8px",
                        boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)",
                      }}
                    >
                      <Layers size={20} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg" style={{ color: "#1B2B4B", fontWeight: "700" }}>
                        {courseName}
                      </h3>
                      <div className="flex items-center gap-2 text-sm" style={{ color: "#94A3B8" }}>
                        <Hash size={13} />
                        <span>{Object.keys(batches).length} batch{Object.keys(batches).length > 1 ? "es" : ""}</span>
                        <span className="mx-1">·</span>
                        <Users size={13} />
                        <span>{totalDrafts} draft{totalDrafts > 1 ? "s" : ""}</span>
                      </div>
                    </div>
                    <ChevronRight
                      size={20}
                      style={{
                        color: "#2563EB",
                        transform: openCourses[courseName] ? "rotate(90deg)" : "rotate(0deg)",
                        transition: "transform 0.3s ease",
                      }}
                    />
                  </div>

                  {/* Batches under this course */}
                  {openCourses[courseName] && (
                    <div
                      className="px-5 py-4 space-y-3"
                      style={{
                        backgroundColor: "#F8FAFC",
                        borderTop: "1px solid #F1F5F9",
                      }}
                    >
                      {Object.entries(batches).map(([batchNo, batchDrafts]) => {
                        const batchKey = `${courseName}-${batchNo}`;

                        return (
                          <div
                            key={batchKey}
                            className="rounded-lg overflow-hidden"
                            style={{
                              backgroundColor: "#FFFFFF",
                              border: "1.5px solid #E2E8F0",
                              borderRadius: "8px",
                            }}
                          >
                            {/* Batch Row */}
                            <div
                              onClick={() => toggleBatch(batchKey)}
                              className="flex items-center gap-3 px-4 py-3 cursor-pointer transition"
                              style={{
                                backgroundColor: "#F8FAFC",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#F1F5F9";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "#F8FAFC";
                              }}
                            >
                              <div
                                className="rounded-lg p-1.5"
                                style={{
                                  backgroundColor: "#EFF6FF",
                                  color: "#2563EB",
                                  borderRadius: "6px",
                                }}
                              >
                                <Users size={16} />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-sm" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                                  Batch No. {batchNo}
                                </p>
                                <p className="text-xs" style={{ color: "#94A3B8" }}>
                                  {batchDrafts.length} student draft{batchDrafts.length > 1 ? "s" : ""}
                                </p>
                              </div>
                              <ChevronRight
                                size={16}
                                style={{
                                  color: "#2563EB",
                                  transform: openBatches[batchKey] ? "rotate(90deg)" : "rotate(0deg)",
                                  transition: "transform 0.3s ease",
                                }}
                              />
                            </div>

                            {/* Student Table */}
                            {openBatches[batchKey] && (
                              <div style={{ borderTop: "1px solid #F1F5F9" }}>
                                <table className="w-full text-left">
                                  <thead>
                                    <tr
                                      style={{
                                        backgroundColor: "#F8FAFC",
                                        borderBottom: "1px solid #E2E8F0",
                                      }}
                                    >
                                      <th
                                        className="px-4 py-2 text-xs font-semibold uppercase tracking-wide"
                                        style={{
                                          color: "#64748B",
                                          fontSize: "11px",
                                          fontWeight: "600",
                                          letterSpacing: "0.06em",
                                        }}
                                      >
                                        Student Name
                                      </th>
                                      <th
                                        className="px-4 py-2 text-xs font-semibold uppercase tracking-wide"
                                        style={{
                                          color: "#64748B",
                                          fontSize: "11px",
                                          fontWeight: "600",
                                          letterSpacing: "0.06em",
                                        }}
                                      >
                                        Date
                                      </th>
                                      <th
                                        className="px-4 py-2 text-xs font-semibold uppercase tracking-wide"
                                        style={{
                                          color: "#64748B",
                                          fontSize: "11px",
                                          fontWeight: "600",
                                          letterSpacing: "0.06em",
                                        }}
                                      >
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {batchDrafts.map((d, idx) => (
                                      <tr
                                        key={d._id}
                                        style={{
                                          backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#F8FAFC",
                                          borderBottom: "1px solid #F1F5F9",
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.backgroundColor = "#F1F5F9";
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#FFFFFF" : "#F8FAFC";
                                        }}
                                      >
                                        <td className="px-4 py-3 font-bold text-sm" style={{ color: "#2563EB" }}>
                                          <button 
                                            onClick={() => navigate(`/admin/student/${d.student?._id}`)}
                                            className="hover:underline text-left"
                                          >
                                            {d.student?.name}
                                          </button>
                                        </td>
                                        <td className="px-4 py-3 text-sm" style={{ color: "#94A3B8" }}>
                                          <div className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {d.createdAt?.substring(0, 10)}
                                          </div>
                                        </td>
                                        <td className="px-4 py-3">
                                          <div className="flex items-center gap-2">
                                            <button
                                              className="p-2 rounded-lg transition cursor-pointer"
                                              style={{
                                                backgroundColor: "transparent",
                                                color: "#10B981",
                                              }}
                                              onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = "#ECFDF5";
                                              }}
                                              onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = "transparent";
                                              }}
                                              onClick={() => handleViewDraft(d)}
                                              title="View Draft"
                                            >
                                              <Eye size={18} />
                                            </button>
                                            <button
                                              className="p-2 rounded-lg transition cursor-pointer"
                                              style={{
                                                backgroundColor: "transparent",
                                                color: "#EF4444",
                                              }}
                                              onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = "#FEE2E2";
                                              }}
                                              onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = "transparent";
                                              }}
                                              onClick={() => handleDelete(d._id)}
                                              title="Delete Draft"
                                            >
                                              <Trash2 size={18} />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && previewPdfUrl && (
        <PreviewModal
          pdfUrl={previewPdfUrl}
          onClose={() => {
            URL.revokeObjectURL(previewPdfUrl);
            setPreviewPdfUrl(null);
            setShowPreview(false);
          }}
        />
      )}
    </div>
  );
}

function PreviewModal({ pdfUrl, onClose }) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
      onClick={onClose}
    >
      <div
        className="w-[90%] h-[90%] rounded-lg overflow-hidden"
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "12px",
          boxShadow: "0 20px 25px rgba(0,0,0,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="p-3 flex justify-end"
          style={{
            backgroundColor: "#F8FAFC",
            borderBottom: "1px solid #E2E8F0",
          }}
        >
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm rounded-lg font-medium transition"
            style={{
              backgroundColor: "#FEE2E2",
              color: "#EF4444",
              borderRadius: "6px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#FEE2E2";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#FEE2E2";
            }}
          >
            Close
          </button>
        </div>
        <iframe src={pdfUrl} className="w-full h-full" title="Preview" />
      </div>
    </div>
  );
}