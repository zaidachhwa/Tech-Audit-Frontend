import { useState, useEffect, useMemo } from "react";
import { API } from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import {
  ClipboardList, Plus, X, User, Users, Send, Loader2,
  CheckCircle, Clock, BookOpen, AlertCircle, Calendar,
  FileText, Upload, Check, RefreshCw
} from "lucide-react";
import { getHomeworkStatusBadge } from "../../utils/statusHelper";

const S = {
  page: { minHeight: "100vh", background: "#F8FAFC", padding: "28px 32px", fontFamily: "'DM Sans', sans-serif" },
  card: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12, padding: "22px 24px", marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  pageTitle: { fontSize: 20, fontWeight: 700, color: "#1B2B4B", margin: 0 },
  label: { fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748B", marginBottom: 8, display: "block" },
  input: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#1B2B4B", width: "100%", outline: "none", fontFamily: "'DM Sans', sans-serif" },
  textarea: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#1B2B4B", width: "100%", outline: "none", fontFamily: "'DM Sans', sans-serif", minHeight: "100px" },
  select: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#1B2B4B", width: "100%", outline: "none", fontFamily: "'DM Sans', sans-serif" },
  primaryBtn: { background: "#2563EB", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "'DM Sans', sans-serif" },
  secondaryBtn: { background: "#fff", color: "#1B2B4B", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "8px 12px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans', sans-serif" },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: "#1B2B4B", marginBottom: 12, display: "flex", gap: 8, alignItems: "center" },
};

export default function AssignTask() {
  const [activeTab, setActiveTab] = useState("assign"); // 'assign' or 'review'

  // --- Assign Form State ---
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [batches, setBatches] = useState([]);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [selectedLecture, setSelectedLecture] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // --- Review Tab State ---
  const [submissions, setSubmissions] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [expandedSubmission, setExpandedSubmission] = useState(null);
  const [marks, setMarks] = useState("");
  const [outOf, setOutOf] = useState("");
  const [remarks, setRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Load basic dependencies
  useEffect(() => {
    // Load subjects
    API.get("/subjects")
      .then((res) => {
        // syllabus-tracker uses 'syllabi' wrapper
        setSubjects(res.data?.syllabi || res.data || []);
      })
      .catch((err) => { 
        console.error("Subjects fetch error:", err);
        toast.error(err.response?.data?.message || "Failed to load subjects");
      });

    // Load batches
    API.get("/batches")
      .then((res) => {
        setBatches(res.data?.batches || res.data || []);
      })
      .catch((err) => { 
        console.error("Batches fetch error:", err);
        toast.error(err.response?.data?.message || "Failed to load batches");
      });
  }, []);

  // Load lectures when subject & batches are selected
  useEffect(() => {
    if (!selectedSubject) {
      setLectures([]);
      setSelectedLecture("");
      return;
    }
    // Fetch lectures filter by subject
    API.get(`/lectures?subjectId=${selectedSubject}`)
      .then((res) => {
        setLectures(res.data?.lectures || res.data || []);
      })
      .catch(() => { });
  }, [selectedSubject]);

  // Load submissions for review
  const fetchSubmissions = () => {
    setReviewLoading(true);
    // V2 spec: GET /api/homework/pending or GET /api/homework
    API.get("/homework")
      .then((res) => {
        // Flatten homework list with their submissions
        const flat = [];
        const hwList = res.data || [];
        hwList.forEach((hw) => {
          if (hw.submissions && hw.submissions.length > 0) {
            hw.submissions.forEach((sub) => {
              flat.push({
                ...sub,
                student: hw.student,
                homeworkTitle: hw.title,
                homeworkDescription: hw.description,
                dueDate: hw.dueDate,
                subjectName: hw.subject?.subject || "Subject",
                homeworkId: hw._id
              });
            });
          }
        });
        setSubmissions(flat);
      })
      .catch(() => {
        toast.error("Failed to load submissions");
      })
      .finally(() => {
        setReviewLoading(false);
      });
  };

  useEffect(() => {
    if (activeTab === "review") {
      fetchSubmissions();
    }
  }, [activeTab]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      const res = await API.post("/upload", formData);
      setAttachments(prev => [...prev, res.data.fileUrl]);
      toast.success("File uploaded successfully");
    } catch (err) {
      toast.error("File upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleAssignHomework = async (e) => {
    e.preventDefault();
    if (!selectedSubject) return toast.error("Please select a subject");
    if (selectedBatches.length === 0) return toast.error("Please select at least one batch");
    if (!selectedLecture) return toast.error("Please select a lecture");
    if (!title.trim()) return toast.error("Please enter a homework title");
    if (!dueDate) return toast.error("Please select a due date");

    try {
      setSubmitting(true);
      await API.post("/homework", {
        subjectId: selectedSubject,
        lectureId: selectedLecture,
        batchIds: selectedBatches,
        title,
        description,
        dueDate,
        attachments
      });

      toast.success("Homework assigned successfully!");
      // Reset form
      setTitle("");
      setDescription("");
      setDueDate("");
      setAttachments([]);
      setSelectedBatches([]);
      setSelectedLecture("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign homework");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewAction = async (submissionId, action) => {
    if (action === "approve" && (!marks || !outOf)) {
      toast.error("Please input obtained marks and total marks for approval");
      return;
    }
    if (!remarks.trim()) {
      toast.error("Please add teacher remarks");
      return;
    }

    try {
      setActionLoading(true);
      const endpoint = `/homework/${submissionId}/${action}`;
      await API.patch(endpoint, {
        marks: Number(marks) || 0,
        outOf: Number(outOf) || 0,
        remarks
      });

      toast.success(`Submission ${action}d successfully`);
      setExpandedSubmission(null);
      setMarks("");
      setOutOf("");
      setRemarks("");
      fetchSubmissions();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} submission`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBatchToggle = (batchId) => {
    setSelectedBatches((prev) =>
      prev.includes(batchId) ? prev.filter((id) => id !== batchId) : [...prev, batchId]
    );
  };

  return (
    <div style={S.page}>
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2B4B]">Homework Management</h1>
          <p className="text-sm text-[#64748B]">Assign homework and review student submissions.</p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-[#E2E8F0] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("assign")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${activeTab === "assign" ? "bg-white text-[#1B2B4B] shadow-sm" : "text-gray-600"
              }`}
          >
            Assign Homework
          </button>
          <button
            onClick={() => setActiveTab("review")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${activeTab === "review" ? "bg-white text-[#1B2B4B] shadow-sm" : "text-gray-600"
              }`}
          >
            Review Submissions
          </button>
        </div>
      </div>

      {activeTab === "assign" ? (
        <form onSubmit={handleAssignHomework} className="max-w-3xl space-y-6">
          {/* Targets */}
          <div style={S.card} className="space-y-4">
            <h3 style={S.sectionTitle}><BookOpen size={16} /> Homework Target</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label style={S.label}>Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  style={S.select}
                >
                  <option value="">Select Subject</option>
                  {subjects.map((sub) => (
                    <option key={sub._id} value={sub._id}>{sub.subject}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={S.label}>Lecture</label>
                <select
                  value={selectedLecture}
                  onChange={(e) => setSelectedLecture(e.target.value)}
                  style={S.select}
                  disabled={!selectedSubject}
                >
                  <option value="">Select Lecture</option>
                  {lectures.map((lec) => (
                    <option key={lec._id} value={lec._id}>{lec.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={S.label}>Target Batches</label>
              <div className="flex flex-wrap gap-2">
                {batches.map((batch) => {
                  const isSelected = selectedBatches.includes(batch._id);
                  return (
                    <button
                      key={batch._id}
                      type="button"
                      onClick={() => handleBatchToggle(batch._id)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition ${isSelected
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-white border-[#E2E8F0] text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      {batch.batch_name} (#{batch.batch_no})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Details */}
          <div style={S.card} className="space-y-4">
            <h3 style={S.sectionTitle}><ClipboardList size={16} /> Homework Details</h3>

            <div className="space-y-2">
              <label style={S.label}>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Limits and Continuity Sheet"
                style={S.input}
              />
            </div>

            <div className="space-y-2">
              <label style={S.label}>Instructions</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Specify questions or instructions..."
                style={S.textarea}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label style={S.label}>Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={S.input}
                />
              </div>

              <div>
                <label style={S.label}>Attachments</label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2 border border-[#E2E8F0] rounded-lg text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-50 transition">
                    <Upload size={14} />
                    {uploading ? "Uploading..." : "Upload File"}
                    <input type="file" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                  </label>
                </div>
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {attachments.map((url, idx) => (
                      <div key={idx} className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-md text-[11px] border border-gray-200">
                        <span className="truncate max-w-[120px]">File {idx + 1}</span>
                        <button type="button" onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))} className="text-rose-500 font-bold hover:text-rose-700">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            Assign Homework
          </button>
        </form>
      ) : (
        // Review submissions list
        <div className="space-y-4">
          {reviewLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-2">
              <Loader2 className="animate-spin text-blue-600" size={24} />
              <span className="text-sm text-gray-500">Loading submissions...</span>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-16 bg-white border border-[#E2E8F0] rounded-2xl space-y-3">
              <CheckCircle className="mx-auto h-12 w-12 text-emerald-400" />
              <h3 className="text-lg font-bold text-[#1B2B4B]">All caught up</h3>
              <p className="text-sm text-gray-500">No pending student homework submissions found.</p>
            </div>
          ) : (
            submissions.map((sub) => {
              const isExpanded = expandedSubmission === sub._id;
              const s = (sub.status || "").toLowerCase();
              const isPending = s === "pending_review" || s === "submitted" || s === "pending_approval";
              const badge = getHomeworkStatusBadge(sub.status);
              return (
                <div key={sub._id} style={S.card} className="overflow-hidden p-0">
                  <div
                    onClick={() => setExpandedSubmission(isExpanded ? null : sub._id)}
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                        <User size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1B2B4B] text-[15px]">{sub.student?.name || "Student"}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Homework: <span className="font-semibold text-gray-700">{sub.homeworkTitle}</span> ({sub.subjectName})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: badge.bg,
                          color: badge.color,
                        }}
                      >
                        {badge.text}
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-6 bg-gray-50 border-t border-[#E2E8F0] space-y-6">
                      {/* Submission details */}
                      <div className="space-y-2">
                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Submitted Work</h5>
                        <p className="text-sm text-gray-700 bg-white p-4 rounded-xl border border-gray-200 leading-relaxed whitespace-pre-wrap">
                          {sub.submissionText || <span className="text-gray-400 italic">No notes provided</span>}
                        </p>
                        <div className="pt-2">
                          <p className="text-xs font-semibold text-gray-500 mb-2">Student Attachments:</p>
                          <div className="flex flex-wrap gap-2">
                            {sub.fileUrl ? (
                              <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors shadow-sm">
                                <FileText size={12} /> {sub.fileName || "View Submission File"}
                              </a>
                            ) : (
                              <span className="text-xs text-gray-400 italic bg-gray-100 px-3 py-1.5 rounded-lg border border-dashed border-gray-200">No file uploaded</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action panel (for pending) */}
                      {isPending ? (
                        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] space-y-4">
                          <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Review & Grade</h5>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-gray-500">Obtained Marks</label>
                              <input
                                type="number"
                                placeholder="e.g. 10"
                                value={marks}
                                onChange={(e) => setMarks(e.target.value)}
                                style={S.input}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-gray-500">Out Of</label>
                              <input
                                type="number"
                                placeholder="e.g. 20"
                                value={outOf}
                                onChange={(e) => setOutOf(e.target.value)}
                                style={S.input}
                              />
                            </div>
                            <div className="md:col-span-2 space-y-1">
                              <label className="text-xs font-bold text-gray-500">Remarks / Feedback</label>
                              <input
                                type="text"
                                placeholder="Provide feedback to student..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                style={S.input}
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => handleReviewAction(sub._id, "reject")}
                              disabled={actionLoading}
                              className="px-4 py-2 border border-rose-200 text-rose-600 font-semibold rounded-lg text-xs hover:bg-rose-50 transition"
                            >
                              Reject & Request Resubmission
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReviewAction(sub._id, "approve")}
                              disabled={actionLoading}
                              className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg text-xs hover:bg-emerald-700 transition flex items-center gap-1"
                            >
                              <Check size={14} /> Approve Submission
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                          <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Graded Details</h5>
                          {sub.marks !== undefined && (
                            <p className="text-sm font-bold text-gray-800">
                              Score: {sub.marks} {sub.outOf !== undefined ? `/ ${sub.outOf}` : ""} Marks
                            </p>
                          )}
                          <p className="text-sm text-gray-600 italic mt-1">Remarks: "{sub.remarks}"</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}