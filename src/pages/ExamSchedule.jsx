import React, { useEffect, useState } from "react";
import { API } from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { Calendar, BookOpen, Monitor, Building2, Trash2, ExternalLink, FileText, Upload } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const S = {
  page: { fontFamily: "'DM Sans', sans-serif" },
  pageTitle: { fontSize: 20, fontWeight: 700, color: "#1B2B4B", marginBottom: 2 },
  pageSubtitle: { fontSize: 13, color: "#64748B", marginBottom: 20 },
  card: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12, padding: 20, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  sectionHeader: { display: "flex", alignItems: "center", gap: 8, marginBottom: 16, paddingBottom: 12, borderBottom: "0.5px solid #E2E8F0" },
  dot: { width: 8, height: 8, borderRadius: "50%", background: "#2563EB", flexShrink: 0 },
  sectionTitle: { fontSize: 13, fontWeight: 500, color: "#1B2B4B" },
  label: { fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 5, display: "block", textTransform: "uppercase", letterSpacing: "0.06em" },
  input: { width: "100%", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "9px 11px", fontSize: 13, color: "#1B2B4B", outline: "none", background: "#fff", boxSizing: "border-box" },
  select: { width: "100%", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "9px 11px", fontSize: 13, color: "#1B2B4B", outline: "none", background: "#fff", boxSizing: "border-box" },
  btnSave: { padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", background: "#2563EB", color: "#fff", display: "inline-flex", alignItems: "center", gap: 6 },
  btnDelete: { background: "none", border: "none", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }
};

export default function ExamSchedule() {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);

  const [form, setForm] = useState({
    batch: "",
    subject: "",
    date: "",
    examType: "offline"
  });

  const [filterBatch, setFilterBatch] = useState("");

  useEffect(() => {
    API.get("/batches/public")
      .then((res) => setBatches(res.data || []))
      .catch(() => toast.error("Failed to load batches"));
      
    API.get("/subjects")
      .then((res) => {
        const data = res.data;
        setSubjects(Array.isArray(data) ? data : (data?.subjects || data?.syllabi || []));
      })
      .catch(() => toast.error("Failed to load subjects"));

    fetchExams("");
  }, []);

  const fetchExams = (batchId) => {
    setLoading(true);
    let url = "/exams";
    if (batchId) url += `?batch=${batchId}`;
    
    API.get(url)
      .then((res) => setExams(res.data || []))
      .catch(() => toast.error("Failed to load exams"))
      .finally(() => setLoading(false));
  };

  const handleFilterChange = (e) => {
    const val = e.target.value;
    setFilterBatch(val);
    fetchExams(val);
  };

  const handleSave = async () => {
    if (!form.batch || !form.subject || !form.date || !form.examType) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      setSaving(true);
      
      let questionPaperData = null;
      if (form.examType === "offline" && file) {
        toast.loading("Uploading question paper...", { id: "upload" });
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await API.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        questionPaperData = {
          fileName: uploadRes.data.originalName || file.name,
          fileUrl: uploadRes.data.fileUrl
        };
        toast.dismiss("upload");
      }
      
      const payload = {
        ...form,
        ...(questionPaperData && { questionPaper: questionPaperData })
      };
      
      await API.post("/exams", payload);
      toast.success("Exam scheduled successfully");
      setForm({ batch: "", subject: "", date: "", examType: "offline" });
      setFile(null);
      fetchExams(filterBatch);
    } catch (err) {
      toast.dismiss("upload");
      toast.error(err.response?.data?.message || "Failed to schedule exam");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;
    try {
      await API.delete(`/exams/${id}`);
      toast.success("Exam deleted");
      fetchExams(filterBatch);
    } catch (err) {
      toast.error("Failed to delete exam");
    }
  };

  return (
    <div style={S.page}>
      <Toaster />
      <p style={S.pageTitle}>Exam Schedule</p>
      <p style={S.pageSubtitle}>Schedule and manage upcoming exams</p>

      {/* Schedule Form */}
      <div style={S.card}>
        <div style={S.sectionHeader}>
          <div style={S.dot} />
          <span style={S.sectionTitle}>Schedule New Exam</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label style={S.label}>Batch</label>
            <select style={S.select} value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })}>
              <option value="">Select Batch</option>
              {batches.map((b) => <option key={b._id} value={b._id}>{b.batch_name} (#{b.batch_no})</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Subject</label>
            <select style={S.select} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
              <option value="">Select Subject</option>
              {subjects.map((s) => {
                const sName = s.subject || s.name || s.title;
                return <option key={s._id || sName} value={sName}>{sName}</option>;
              })}
            </select>
          </div>
          <div>
            <label style={S.label}>Exam Date</label>
            <input 
              type="date" 
              style={S.input} 
              value={form.date} 
              onChange={(e) => setForm({ ...form, date: e.target.value })} 
            />
          </div>
          <div>
            <label style={S.label}>Exam Type</label>
            <select style={S.select} value={form.examType} onChange={(e) => {
              setForm({ ...form, examType: e.target.value });
              if (e.target.value === "online") setFile(null);
            }}>
              <option value="offline">Offline</option>
              <option value="online">Online</option>
            </select>
          </div>
        </div>
        
        {form.examType === "offline" && (
          <div className="mb-4">
            <label style={S.label}>Question Paper (PDF/Doc)</label>
            <div className="flex items-center gap-4">
              <label style={{ ...S.btnSave, background: "#F1F5F9", color: "#475569", border: "1.5px solid #CBD5E1", cursor: "pointer" }}>
                <Upload size={14} /> {file ? "Change File" : "Upload File"}
                <input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
              </label>
              {file && <span style={{ fontSize: 13, color: "#1B2B4B", fontWeight: 500 }}>{file.name}</span>}
            </div>
          </div>
        )}
        
        <div className="flex justify-end">
          <button style={S.btnSave} onClick={handleSave} disabled={saving}>
            {saving ? "Scheduling..." : "Schedule Exam"}
          </button>
        </div>
      </div>

      {/* Exam List */}
      <div style={S.card}>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E2E8F0]">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={S.dot} />
            <span style={S.sectionTitle}>Scheduled Exams</span>
          </div>
          <div style={{ width: 200 }}>
            <select style={{...S.select, padding: "6px 10px"}} value={filterBatch} onChange={handleFilterChange}>
              <option value="">All Batches</option>
              {batches.map((b) => <option key={b._id} value={b._id}>{b.batch_name} (#{b.batch_no})</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748B" }}>Loading exams...</div>
        ) : exams.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748B" }}>No exams scheduled.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map((exam) => (
              <div key={exam._id} style={{ border: "1.5px solid #E2E8F0", borderRadius: 10, padding: 16 }}>
                <div className="flex justify-between items-start mb-2">
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1B2B4B", display: "flex", alignItems: "center", gap: 6 }}>
                    <BookOpen size={16} color="#2563EB" />
                    {exam.subject}
                  </h3>
                  {(user?.role === 'admin' || user?.role === 'teacher') && (
                    <button style={S.btnDelete} onClick={() => handleDelete(exam._id)} title="Delete Exam">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                
                <p style={{ margin: "0 0 8px 0", fontSize: 13, color: "#64748B", fontWeight: 500 }}>
                  Batch: {exam.batch?.batch_name} (#{exam.batch?.batch_no})
                </p>
                
                <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: "1px dashed #E2E8F0" }}>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-[#475569]">
                      <Calendar size={14} />
                      <span style={{ fontSize: 12, fontWeight: 500 }}>
                        {new Date(exam.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#475569]">
                      {exam.examType === "online" ? <Monitor size={14} color="#10B981" /> : <Building2 size={14} color="#F59E0B" />}
                      <span style={{ fontSize: 12, fontWeight: 600, color: exam.examType === "online" ? "#10B981" : "#F59E0B", textTransform: "capitalize" }}>
                        {exam.examType}
                      </span>
                    </div>
                  </div>
                </div>
                {exam.examType === "online" && (
                  <button
                    onClick={() => window.open("https://quiz.nexcoreinstitute.org/", "_blank")}
                    style={{
                      width: "100%",
                      marginTop: 12,
                      padding: "8px 0",
                      background: "#10B981",
                      border: "none",
                      borderRadius: 8,
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    Go to Exam Page <ExternalLink size={14} />
                  </button>
                )}
                
                {exam.examType === "offline" && exam.questionPaper?.fileUrl && (
                  <button
                    onClick={() => window.open(exam.questionPaper.fileUrl, "_blank")}
                    style={{
                      width: "100%",
                      marginTop: 12,
                      padding: "8px 0",
                      background: "#F1F5F9",
                      border: "1.5px solid #CBD5E1",
                      borderRadius: 8,
                      color: "#475569",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <FileText size={14} /> View Question Paper
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
