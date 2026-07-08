import { useEffect, useState, useMemo } from "react";
import { API } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import {
  ClipboardList, Calendar, MessageSquare, ChevronDown,
  CheckCircle, AlertCircle, Loader2, BookOpen, Clock,
  Search, FileText, Send, Upload, Paperclip
} from "lucide-react";
import toast from "react-hot-toast";

const S = {
  page: { fontFamily: "'DM Sans', sans-serif" },
  card: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" },
};

function getStatusBadge(status) {
  const s = (status || "assigned").toLowerCase();
  switch (s) {
    case "approved":
      return { bg: "#ECFDF5", color: "#065F46", text: "Approved" };
    case "rejected":
      return { bg: "#FEF2F2", color: "#991B1B", text: "Rejected" };
    case "submitted":
    case "pending approval":
    case "pending_approval":
      return { bg: "#EFF6FF", color: "#1D4ED8", text: "Pending Review" };
    default:
      return { bg: "#FFFBEB", color: "#92400E", text: "Assigned" };
  }
}

function HomeworkCard({ homework, onSubmitted }) {
  const [open, setOpen] = useState(false);
  const [submissionText, setSubmissionText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const status = (homework.status || "assigned").toLowerCase();
  const badge = getStatusBadge(status);

  // Prefill if editing/updating submission
  useEffect(() => {
    if (homework.submissionText) {
      setSubmissionText(homework.submissionText);
    }
    if (homework.submissionAttachments) {
      setAttachments(homework.submissionAttachments);
    }
  }, [homework]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setAttachments(prev => [...prev, res.data.fileUrl]);
      toast.success("File uploaded successfully");
    } catch (err) {
      toast.error("File upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAttachment = (idx) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submissionText.trim() && attachments.length === 0) {
      toast.error("Please provide submission text or attach a file");
      return;
    }

    try {
      setSubmitting(true);
      // For V2 POST /api/student-homework body: { homeworkId, submissionText, attachments }
      await API.post("/student-homework", {
        homeworkId: homework._id,
        submissionText,
        attachments
      });

      toast.success("Homework submitted successfully");
      onSubmitted();
      setOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit homework");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ ...S.card, marginBottom: 16, overflow: "hidden" }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          padding: "18px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          background: open ? "#F8FAFC" : "#fff",
          borderLeft: `4px solid ${
            status === "approved" ? "#10B981" : status === "rejected" ? "#EF4444" : "#F59E0B"
          }`,
          transition: "all 0.2s"
        }}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <ClipboardList size={20} />
          </div>
          <div>
            <h3 className="font-bold text-[#1B2B4B] text-[15px]">{homework.title}</h3>
            <div className="flex items-center gap-4 text-xs text-[#64748B] mt-1">
              <span className="flex items-center gap-1">
                <BookOpen size={13} />
                {homework.lecture?.syllabus?.subject || homework.lecture?.title || homework.batchName || "General"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar size={13} /> Due: {new Date(homework.dueDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            style={{
              fontSize: "12px",
              fontWeight: "700",
              padding: "4px 12px",
              borderRadius: "9999px",
              background: badge.bg,
              color: badge.color
            }}
          >
            {badge.text}
          </span>
          <ChevronDown
            size={18}
            className="text-gray-400 transition-transform duration-200"
            style={{ transform: open ? "rotate(180deg)" : "none" }}
          />
        </div>
      </div>

      {open && (
        <div className="p-6 border-t border-[#E2E8F0] bg-white space-y-6">
          {/* Homework description & attachments */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Instructions</h4>
            <p className="text-sm text-[#334155] leading-relaxed">{homework.description}</p>
            
            {homework.attachments?.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-semibold text-[#64748B]">Reference Attachments:</p>
                <div className="flex flex-wrap gap-2">
                  {homework.attachments.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-blue-600 hover:bg-blue-50 transition"
                    >
                      <Paperclip size={12} /> Reference File {i + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submission Feedback (for Approved/Rejected) */}
          {homework.remarks && (
            <div className={`p-4 rounded-xl border ${
              status === "approved" ? "bg-emerald-50/50 border-emerald-100" : "bg-rose-50/50 border-rose-100"
            }`}>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Teacher Feedback</h4>
              {homework.marks !== undefined && (
                <p className="text-sm font-bold text-[#1B2B4B] mb-1">Score: {homework.marks} Marks</p>
              )}
              <p className="text-sm text-gray-600 italic">"{homework.remarks}"</p>
            </div>
          )}

          {/* Submission Form (or submission details) */}
          {status === "assigned" || status === "rejected" ? (
            <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-[#E2E8F0]">
              <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                {status === "rejected" ? "Resubmit Homework" : "Submit Answer"}
              </h4>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#475569]">Submission Text / Notes</label>
                <textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Explain your submission here..."
                  className="w-full min-h-[120px] p-3 text-sm border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#475569] block">Attachments</label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2 border border-[#E2E8F0] rounded-xl text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 transition">
                    <Upload size={16} />
                    {uploading ? "Uploading..." : "Upload Document"}
                    <input type="file" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                  </label>
                </div>

                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {attachments.map((url, i) => (
                      <div key={i} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-[#E2E8F0] text-xs">
                        <FileText size={12} className="text-gray-500" />
                        <span className="max-w-[120px] truncate text-gray-700">File {i + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(i)}
                          className="text-rose-500 font-bold hover:text-rose-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                <Send size={16} />
                {submitting ? "Submitting..." : "Submit Homework"}
              </button>
            </form>
          ) : (
            <div className="pt-4 border-t border-[#E2E8F0] space-y-3">
              <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Your Submission</h4>
              <p className="text-sm text-[#334155] bg-gray-50 p-4 rounded-xl border border-gray-100 leading-relaxed">
                {homework.submissionText || <span className="text-gray-400 italic">No notes provided</span>}
              </p>
              {homework.submissionAttachments?.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-[#64748B]">Submitted Attachments:</p>
                  <div className="flex flex-wrap gap-2">
                    {homework.submissionAttachments.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-[#E2E8F0] text-xs font-medium text-blue-600 hover:bg-blue-50"
                      >
                        <FileText size={12} /> Submission Document {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function StudentAssignments() {
  const [homeworkList, setHomeworkList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("assigned"); // 'assigned' or 'history'

  const fetchHomework = () => {
    setLoading(true);
    API.get("/student-homework")
      .then((res) => {
        // Handle both array response and wrapped { data: [] } shape
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data?.homework)
          ? res.data.homework
          : [];
        console.log("[My Homework] Fetched:", data.length, "records", data);
        setHomeworkList(data);
      })
      .catch((err) => {
        console.error("[My Homework] Error:", err.response?.data || err.message);
        toast.error(err.response?.data?.message || "Failed to load homework assignments");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHomework();
  }, []);

  const filteredHomework = useMemo(() => {
    return homeworkList.filter((hw) => {
      const subjectName = hw.lecture?.syllabus?.subject || hw.lecture?.title || hw.batchName || "";
      const matchesSearch =
        hw.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subjectName.toLowerCase().includes(searchQuery.toLowerCase());

      const status = (hw.status || "assigned").toLowerCase();
      if (activeTab === "assigned") {
        // Show anything that needs action: assigned, rejected, or pending
        return matchesSearch && (
          status === "assigned" ||
          status === "rejected" ||
          status === "pending" ||
          status === "pending_approval" ||
          status === "pending approval"
        );
      } else {
        // History: submitted or approved
        return matchesSearch && (
          status === "submitted" ||
          status === "approved" ||
          status === "pending approval" ||
          status === "pending_approval"
        );
      }
    });
  }, [homeworkList, searchQuery, activeTab]);

  return (
    <div style={S.page}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1B2B4B]">My Homework</h1>
            <p className="text-sm text-[#64748B]">View assigned tasks and submit your homework answers.</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search homework..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-xl text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("assigned")}
            className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "assigned"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Assigned & Action Required
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "history"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Submission History
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            <span className="text-sm text-gray-500">Loading homework list...</span>
          </div>
        ) : filteredHomework.length === 0 ? (
          <div className="text-center py-16 bg-white border border-[#E2E8F0] rounded-2xl space-y-3">
            <ClipboardList className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="text-lg font-bold text-[#1B2B4B]">No homework found</h3>
            <p className="text-sm text-gray-500">You are all caught up!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHomework.map((hw) => (
              <HomeworkCard key={hw._id} homework={hw} onSubmitted={fetchHomework} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}