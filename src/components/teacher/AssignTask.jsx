import { useState, useEffect, useMemo } from "react";
import { API } from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import {
  ClipboardList, Plus, X, User, Users, Send, Loader2,
  CheckCircle, Clock, BookOpen, AlertCircle, Calendar,
  FileText, Upload, Check, RefreshCw, Filter, Search, ChevronDown,
  AlertTriangle
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
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
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
  
  // Isolated review form state keyed by submission ID: { [subId]: { marks, outOf, remarks } }
  const [reviewForms, setReviewForms] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewSearchQuery, setReviewSearchQuery] = useState("");
  const [reviewStatusFilter, setReviewStatusFilter] = useState("all");
  const [reviewBatchFilter, setReviewBatchFilter] = useState("all");

  // Load basic dependencies
  useEffect(() => {
    // Load subjects
    API.get("/subjects")
      .then((res) => {
        setSubjects(res.data?.syllabi || res.data?.subjects || res.data || []);
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

  // Compute unique courses and semesters from batches
  const availableCourses = useMemo(() => {
    const set = new Set();
    batches.forEach(b => {
      if (b.course && b.course.trim()) set.add(b.course.trim());
    });
    return Array.from(set);
  }, [batches]);

  const availableSemesters = useMemo(() => {
    const set = new Set();
    batches.forEach(b => {
      if (selectedCourse && b.course && b.course.trim() !== selectedCourse) return;
      if (b.semester && b.semester.trim()) set.add(b.semester.trim());
    });
    return Array.from(set);
  }, [batches, selectedCourse]);

  // Filter batches by selected course and semester
  const filteredBatches = useMemo(() => {
    return batches.filter(b => {
      if (selectedCourse && b.course && b.course.trim() !== selectedCourse) return false;
      if (selectedSemester && b.semester && b.semester.trim() !== selectedSemester) return false;
      return true;
    });
  }, [batches, selectedCourse, selectedSemester]);

  // Load lectures when subject is selected
  useEffect(() => {
    if (!selectedSubject) {
      setLectures([]);
      setSelectedLecture("");
      return;
    }
    API.get(`/lectures?subjectId=${selectedSubject}`)
      .then((res) => {
        setLectures(res.data?.lectures || res.data || []);
      })
      .catch(() => { });
  }, [selectedSubject]);

  // Load submissions for review
  const fetchSubmissions = () => {
    setReviewLoading(true);
    setSubmissions([]);
    API.get("/homework")
      .then((res) => {
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
                course: hw.course || hw.batch?.course || "",
                semester: hw.semester || hw.batch?.semester || "",
                batchName: hw.batchName || hw.batch?.batch_name || "",
                batchNumber: hw.batchNumber || hw.batch?.batch_no || "",
                batchId: hw.batch?._id || hw.batch || "",
                subjectName: hw.subjectName || hw.lecture?.syllabus?.subject || hw.subject?.subject || "Subject",
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

    const subjectObj = subjects.find(s => s._id === selectedSubject);

    try {
      setSubmitting(true);
      await API.post("/homework", {
        course: selectedCourse,
        semester: selectedSemester,
        subjectId: selectedSubject,
        subjectName: subjectObj?.subject || subjectObj?.name || "",
        lectureId: selectedLecture,
        batchIds: selectedBatches,
        title: title.trim(),
        description: description.trim(),
        dueDate,
        attachments
      });

      toast.success("Homework assigned successfully to selected batches!");
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

  const updateReviewFormField = (subId, field, value) => {
    setReviewForms(prev => ({
      ...prev,
      [subId]: {
        ...(prev[subId] || {}),
        [field]: value
      }
    }));
  };

  const handleReviewAction = async (sub, action) => {
    const formData = reviewForms[sub._id] || {};
    const marksVal = formData.marks !== undefined ? formData.marks : (sub.marks !== undefined ? sub.marks : "");
    const outOfVal = formData.outOf !== undefined ? formData.outOf : (sub.outOf !== undefined ? sub.outOf : "");
    const remarksVal = formData.remarks !== undefined ? formData.remarks : (sub.remarks || "");

    if (action === "approve") {
      if (marksVal === "" || outOfVal === "") {
        toast.error("Please enter both Obtained Marks and Total Marks");
        return;
      }

      const numMarks = Number(marksVal);
      const numOutOf = Number(outOfVal);

      if (isNaN(numMarks) || isNaN(numOutOf)) {
        toast.error("Marks must be numeric values");
        return;
      }

      if (numOutOf <= 0) {
        toast.error("Total marks (Out Of) must be greater than 0");
        return;
      }

      if (numMarks < 0) {
        toast.error("Obtained marks cannot be negative");
        return;
      }

      if (numMarks > numOutOf) {
        toast.error(`Invalid Marks: Obtained marks (${numMarks}) cannot exceed Total marks (${numOutOf})`);
        return;
      }
    }

    if (action === "reject") {
      if (!remarksVal.trim()) {
        toast.error("Please enter feedback remarks explaining why the submission was rejected");
        return;
      }
    }

    try {
      setActionLoading(true);
      const endpoint = `/homework/${sub._id}/${action}`;
      await API.patch(endpoint, {
        marks: Number(marksVal) || 0,
        outOf: Number(outOfVal) || 0,
        remarks: remarksVal.trim()
      });

      toast.success(`Submission ${action === "approve" ? "approved and graded" : "rejected"} successfully`);
      setExpandedSubmission(null);
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

  const handleSelectAllFilteredBatches = () => {
    const ids = filteredBatches.map(b => b._id);
    setSelectedBatches(ids);
  };

  const filteredReviewSubmissions = useMemo(() => {
    return submissions.filter(sub => {
      const matchSearch =
        !reviewSearchQuery ||
        sub.student?.name?.toLowerCase().includes(reviewSearchQuery.toLowerCase()) ||
        sub.homeworkTitle?.toLowerCase().includes(reviewSearchQuery.toLowerCase()) ||
        sub.subjectName?.toLowerCase().includes(reviewSearchQuery.toLowerCase());

      const s = (sub.status || "").toLowerCase();
      const matchStatus =
        reviewStatusFilter === "all" ||
        (reviewStatusFilter === "pending" && (s === "pending_review" || s === "submitted" || s === "pending_approval")) ||
        (reviewStatusFilter === "approved" && (s === "approved" || s === "completed")) ||
        (reviewStatusFilter === "rejected" && s === "rejected");

      const matchBatch =
        reviewBatchFilter === "all" ||
        sub.batchId === reviewBatchFilter ||
        sub.batchName === reviewBatchFilter;

      return matchSearch && matchStatus && matchBatch;
    });
  }, [submissions, reviewSearchQuery, reviewStatusFilter, reviewBatchFilter]);

  return (
    <div style={S.page}>
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2B4B]">Task & Assignment Center</h1>
          <p className="text-sm text-[#64748B]">Assign structured coursework to Batches, Classes & Academic Years, and grade student submissions.</p>
        </div>

        {/* Tab Selector & Actions */}
        <div className="flex items-center gap-2">
          {activeTab === "review" && (
            <button
              onClick={fetchSubmissions}
              disabled={reviewLoading}
              title="Refresh submissions"
              className="p-2 bg-white border border-[#E2E8F0] rounded-xl text-gray-600 hover:text-blue-600 hover:border-blue-200 transition shadow-sm disabled:opacity-50"
            >
              <RefreshCw size={15} className={reviewLoading ? "animate-spin text-blue-600" : ""} />
            </button>
          )}
          <div className="flex bg-[#E2E8F0] p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("assign")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${activeTab === "assign" ? "bg-white text-[#1B2B4B] shadow-sm" : "text-gray-600"
                }`}
            >
              Assign Task / Homework
            </button>
            <button
              onClick={() => setActiveTab("review")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${activeTab === "review" ? "bg-white text-[#1B2B4B] shadow-sm" : "text-gray-600"
                }`}
            >
              Review Submissions ({submissions.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === "assign" ? (
        <form onSubmit={handleAssignHomework} className="max-w-3xl space-y-6">
          {/* Target Class, Year & Batches */}
          <div style={S.card} className="space-y-4">
            <h3 style={S.sectionTitle}><Users size={16} className="text-blue-600" /> Class, Academic Year & Batch Targeting</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label style={S.label}>Class / Course</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => {
                    setSelectedCourse(e.target.value);
                    setSelectedBatches([]);
                  }}
                  style={S.select}
                >
                  <option value="">-- All Classes / Courses --</option>
                  {availableCourses.map((c, idx) => (
                    <option key={idx} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={S.label}>Academic Year / Semester</label>
                <select
                  value={selectedSemester}
                  onChange={(e) => {
                    setSelectedSemester(e.target.value);
                    setSelectedBatches([]);
                  }}
                  style={S.select}
                >
                  <option value="">-- All Years / Semesters --</option>
                  {availableSemesters.map((s, idx) => (
                    <option key={idx} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label style={{ ...S.label, marginBottom: 0 }}>
                  Target Batches ({selectedBatches.length} selected)
                </label>
                {filteredBatches.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAllFilteredBatches}
                    className="text-xs text-blue-600 font-bold hover:underline"
                  >
                    Select All Matching Batches
                  </button>
                )}
              </div>

              {filteredBatches.length === 0 ? (
                <p className="text-xs text-gray-400 italic bg-gray-50 p-3 rounded-lg border">No batches match the selected Course/Semester.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {filteredBatches.map((batch) => {
                    const isSelected = selectedBatches.includes(batch._id);
                    return (
                      <button
                        key={batch._id}
                        type="button"
                        onClick={() => handleBatchToggle(batch._id)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${isSelected
                            ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                            : "bg-white border-[#E2E8F0] text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        {batch.batch_name} #{batch.batch_no}
                        {batch.course ? ` (${batch.course})` : ""}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Subject & Lecture */}
          <div style={S.card} className="space-y-4">
            <h3 style={S.sectionTitle}><BookOpen size={16} className="text-blue-600" /> Subject & Lecture Module</h3>

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
                    <option key={sub._id} value={sub._id}>{sub.subject || sub.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={S.label}>Lecture Module / Topic</label>
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
          </div>

          {/* Details */}
          <div style={S.card} className="space-y-4">
            <h3 style={S.sectionTitle}><ClipboardList size={16} className="text-blue-600" /> Task Details & Instructions</h3>

            <div className="space-y-2">
              <label style={S.label}>Assignment Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Module 3: Database Indexing Assignment"
                style={S.input}
              />
            </div>

            <div className="space-y-2">
              <label style={S.label}>Instructions / Task Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed instructions, requirements, code repository links, etc..."
                style={S.textarea}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label style={S.label}>Submission Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={S.input}
                />
              </div>

              <div>
                <label style={S.label}>Reference Attachments</label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2 border border-[#E2E8F0] rounded-lg text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-50 transition">
                    <Upload size={14} />
                    {uploading ? "Uploading..." : "Upload Document or Sample"}
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
            className="w-full py-3.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            Assign Task to Selected Batches
          </button>
        </form>
      ) : (
        // Review submissions workspace
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search student or task..."
                value={reviewSearchQuery}
                onChange={(e) => setReviewSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={reviewStatusFilter}
                onChange={(e) => setReviewStatusFilter(e.target.value)}
                className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none font-semibold text-gray-700"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved / Graded</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={reviewBatchFilter}
                onChange={(e) => setReviewBatchFilter(e.target.value)}
                className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none font-semibold text-gray-700"
              >
                <option value="all">All Batches</option>
                {batches.map(b => (
                  <option key={b._id} value={b._id}>{b.batch_name} #{b.batch_no}</option>
                ))}
              </select>
            </div>
          </div>

          {reviewLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-2">
              <Loader2 className="animate-spin text-blue-600" size={24} />
              <span className="text-sm text-gray-500">Loading student submissions...</span>
            </div>
          ) : filteredReviewSubmissions.length === 0 ? (
            <div className="text-center py-16 bg-white border border-[#E2E8F0] rounded-2xl space-y-3">
              <CheckCircle className="mx-auto h-12 w-12 text-emerald-400" />
              <h3 className="text-lg font-bold text-[#1B2B4B]">No submissions found</h3>
              <p className="text-sm text-gray-500">No submissions match the current filter selection.</p>
            </div>
          ) : (
            filteredReviewSubmissions.map((sub) => {
              const isExpanded = expandedSubmission === sub._id;
              const s = (sub.status || "").toLowerCase();
              const isPending = s === "pending_review" || s === "submitted" || s === "pending_approval";
              const badge = getHomeworkStatusBadge(sub.status);

              // Get isolated values for this submission card
              const formValues = reviewForms[sub._id] || {};
              const currentMarks = formValues.marks !== undefined ? formValues.marks : (sub.marks !== undefined ? sub.marks : "");
              const currentOutOf = formValues.outOf !== undefined ? formValues.outOf : (sub.outOf !== undefined ? sub.outOf : "");
              const currentRemarks = formValues.remarks !== undefined ? formValues.remarks : (sub.remarks || "");

              const isMarksExceeding =
                currentMarks !== "" &&
                currentOutOf !== "" &&
                Number(currentMarks) > Number(currentOutOf);

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
                          Task: <span className="font-semibold text-gray-700">{sub.homeworkTitle}</span> • {sub.subjectName} • Batch: {sub.batchName} #{sub.batchNumber}
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
                      <ChevronDown
                        size={16}
                        className={`text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-6 bg-gray-50 border-t border-[#E2E8F0] space-y-6">
                      {/* Submission details */}
                      <div className="space-y-2">
                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Submitted Work</h5>
                        <p className="text-sm text-gray-700 bg-white p-4 rounded-xl border border-gray-200 leading-relaxed whitespace-pre-wrap">
                          {sub.submissionText || <span className="text-gray-400 italic">No text notes provided</span>}
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
                          <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Review & Grade Submission</h5>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-gray-500">Obtained Marks</label>
                              <input
                                type="number"
                                min="0"
                                placeholder="e.g. 18"
                                value={currentMarks}
                                onChange={(e) => updateReviewFormField(sub._id, "marks", e.target.value)}
                                style={{
                                  ...S.input,
                                  borderColor: isMarksExceeding ? "#EF4444" : "#E2E8F0"
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-gray-500">Total Out Of</label>
                              <input
                                type="number"
                                min="1"
                                placeholder="e.g. 20"
                                value={currentOutOf}
                                onChange={(e) => updateReviewFormField(sub._id, "outOf", e.target.value)}
                                style={S.input}
                              />
                            </div>
                            <div className="md:col-span-2 space-y-1">
                              <label className="text-xs font-bold text-gray-500">Teacher Remarks / Feedback</label>
                              <input
                                type="text"
                                placeholder="Add constructive feedback..."
                                value={currentRemarks}
                                onChange={(e) => updateReviewFormField(sub._id, "remarks", e.target.value)}
                                style={S.input}
                              />
                            </div>
                          </div>

                          {/* Live validation error alert if obtained > total */}
                          {isMarksExceeding && (
                            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                              <AlertTriangle size={14} />
                              Obtained marks ({currentMarks}) cannot exceed Total marks ({currentOutOf}). Please correct before approving.
                            </div>
                          )}

                          <div className="flex justify-end gap-3 pt-2">
                            <button
                              type="button"
                              onClick={() => handleReviewAction(sub, "reject")}
                              disabled={actionLoading}
                              className="px-4 py-2 border border-rose-200 text-rose-600 font-semibold rounded-lg text-xs hover:bg-rose-50 transition cursor-pointer"
                            >
                              Reject & Request Resubmission
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReviewAction(sub, "approve")}
                              disabled={actionLoading || isMarksExceeding}
                              className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg text-xs hover:bg-emerald-700 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              <Check size={14} /> Approve & Publish Grade
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                          <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Graded Details</h5>
                          {sub.marks !== undefined && (
                            <p className="text-sm font-bold text-gray-800">
                              Score: <span className="text-emerald-600">{sub.marks}</span> {sub.outOf !== undefined ? `/ ${sub.outOf}` : ""} Marks
                            </p>
                          )}
                          <p className="text-sm text-gray-600 italic mt-1">Remarks: "{sub.remarks || "No remarks provided"}"</p>
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