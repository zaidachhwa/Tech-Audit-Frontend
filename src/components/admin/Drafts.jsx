import React, { useEffect, useState } from "react";
import { API } from "../../api/axios";
import { Calendar, Eye, Trash2, Layers, ChevronRight, Users, Hash } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Drafts() {
  const [drafts, setDrafts] = useState([]);
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [openCourses, setOpenCourses] = useState({});
  const [openBatches, setOpenBatches] = useState({});

  const fetchDrafts = async () => {
    const res = await API.get("/reports/drafts");
    setDrafts(res.data);
  };

  useEffect(() => { fetchDrafts(); }, []);

  // Group: { FSD: { 1: [...drafts], 2: [...drafts] }, BVOC: { ... } }
  const grouped = drafts.reduce((acc, draft) => {
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
    <div className="p-6 min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100">
      
      {/* Header Card */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl p-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl p-3 shadow-md">
            <Layers size={22} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Draft Reports</h2>
            <p className="text-sm text-gray-500">{drafts.length} total drafts across all batches</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl p-6">
        {!drafts.length ? (
          <div className="text-center py-12">
            <Layers size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No drafts found.</p>
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
                  className="bg-gradient-to-br from-white to-purple-50 border border-purple-100 rounded-2xl shadow-lg overflow-hidden"
                >
                  {/* Course Row */}
                  <div
                    onClick={() => toggleCourse(courseName)}
                    className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-purple-50 transition"
                  >
                    <div className="bg-gradient-to-r from-blue-400 to-indigo-600 text-white rounded-xl p-2 shadow-md">
                      <Layers size={20} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800">{courseName}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Hash size={13} />
                        <span>{Object.keys(batches).length} batch{Object.keys(batches).length > 1 ? "es" : ""}</span>
                        <span className="mx-1">·</span>
                        <Users size={13} />
                        <span>{totalDrafts} draft{totalDrafts > 1 ? "s" : ""}</span>
                      </div>
                    </div>
                    <ChevronRight
                      size={20}
                      className={`text-purple-500 transition-transform duration-300 ${openCourses[courseName] ? "rotate-90" : ""}`}
                    />
                  </div>

                  {/* Batches under this course */}
                  {openCourses[courseName] && (
                    <div className="border-t border-purple-100 px-5 py-4 space-y-3">
                      {Object.entries(batches).map(([batchNo, batchDrafts]) => {
                        const batchKey = `${courseName}-${batchNo}`;

                        return (
                          <div
                            key={batchKey}
                            className="bg-white border border-purple-100 rounded-xl shadow-sm overflow-hidden"
                          >
                            {/* Batch Row */}
                            <div
                              onClick={() => toggleBatch(batchKey)}
                              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-purple-50 transition"
                            >
                              <div className="bg-purple-100 text-purple-700 rounded-lg p-1.5">
                                <Users size={16} />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-700 text-sm">Batch No. {batchNo}</p>
                                <p className="text-xs text-gray-400">{batchDrafts.length} student draft{batchDrafts.length > 1 ? "s" : ""}</p>
                              </div>
                              <ChevronRight
                                size={16}
                                className={`text-purple-400 transition-transform duration-300 ${openBatches[batchKey] ? "rotate-90" : ""}`}
                              />
                            </div>

                            {/* Student Table */}
                            {openBatches[batchKey] && (
                              <div className="border-t border-purple-50">
                                <table className="w-full text-left">
                                  <thead>
                                    <tr className="bg-purple-50 text-xs text-purple-700 uppercase tracking-wide">
                                      <th className="px-4 py-2">Student Name</th>
                                      <th className="px-4 py-2">Date</th>
                                      <th className="px-4 py-2">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {batchDrafts.map((d) => (
                                      <tr
                                        key={d._id}
                                        className="border-t border-purple-50 hover:bg-purple-50/50 transition"
                                      >
                                        <td className="px-4 py-3 text-gray-700 font-medium text-sm">{d.student?.name}</td>
                                        <td className="px-4 py-3 text-gray-500 text-sm">
                                          <div className="flex items-center gap-1">
                                            <Calendar size={14} className="text-gray-400" />
                                            {d.createdAt?.substring(0, 10)}
                                          </div>
                                        </td>
                                        <td className="px-4 py-3">
                                          <div className="flex items-center gap-2">
                                            <Eye
                                              size={28}
                                              className="text-emerald-600 cursor-pointer hover:bg-green-100 hover:scale-110 p-[3px] rounded transition"
                                              onClick={() => handleViewDraft(d)}
                                            />
                                            <Trash2
                                              size={28}
                                              className="text-red-500 cursor-pointer hover:bg-red-50 hover:scale-110 p-[3px] rounded transition"
                                              onClick={() => handleDelete(d._id)}
                                            />
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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white w-[90%] h-[90%] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition"
          >
            Close
          </button>
        </div>
        <iframe src={pdfUrl} className="w-full h-full" title="Preview" />
      </div>
    </div>
  );
}