import React, { useEffect, useState } from "react";
import { API } from "../../api/axios";
import { toast, Toaster } from "react-hot-toast";

const S = {
  page: {},
  pageTitle: { fontSize: 20, fontWeight: 700, color: "#1B2B4B", marginBottom: 2 },
  pageSubtitle: { fontSize: 13, color: "#64748B", marginBottom: 20 },
  card: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12, padding: 20, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  sectionHeader: { display: "flex", alignItems: "center", gap: 8, marginBottom: 16, paddingBottom: 12, borderBottom: "0.5px solid #E2E8F0" },
  sectionHeaderRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingBottom: 12, borderBottom: "0.5px solid #E2E8F0" },
  dot: { width: 8, height: 8, borderRadius: "50%", background: "#2563EB", flexShrink: 0 },
  sectionTitle: { fontSize: 13, fontWeight: 500, color: "#1B2B4B" },
  label: { fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 5, display: "block", textTransform: "uppercase", letterSpacing: "0.06em" },
  input: { width: "100%", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "9px 11px", fontSize: 13, color: "#1B2B4B", outline: "none", background: "#fff" },
  select: { width: "100%", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "9px 11px", fontSize: 13, color: "#1B2B4B", outline: "none", background: "#fff" },
  textarea: { width: "100%", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "9px 11px", fontSize: 13, color: "#1B2B4B", outline: "none", background: "#fff", minHeight: 80, resize: "vertical", lineHeight: 1.5 },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 },
  btnSave: { padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "1.5px solid #BBF7D0", background: "#DCFCE7", color: "#166534" },
  btnAI: { padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "1.5px solid #BFDBFE", background: "#EFF6FF", color: "#1D4ED8" },
  btnPDF: { padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", border: "1.5px solid #FBCFE8", background: "#FDF2F8", color: "#9D174D" },
  statCard: { background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: 15, display: "flex", flexDirection: "column", gap: 5 },
  statValue: { fontSize: 24, fontWeight: 700, color: "#0F172A" },
  statLabel: { fontSize: 11, color: "#64748B", textTransform: "uppercase" },
  historyRow: { padding: "10px 0", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }
};

export default function PerformanceReportShared() {
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  
  const [form, setForm] = useState({
    batch_name: "",
    batch_no: "",
    studentId: "",
    startDate: "",
    endDate: ""
  });

  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [history, setHistory] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    API.get("/students/list")
      .then((res) => setStudents(res.data?.students || []))
      .catch(() => toast.error("Failed to load students"));

    API.get("/batches/public")
      .then((res) => setBatches(res.data || []))
      .catch(() => toast.error("Failed to load batches"));
  }, []);

  useEffect(() => {
    if (form.batch_name && form.batch_no) {
      setFilteredStudents(
        students.filter((s) => s.batch_name === form.batch_name && s.batch_no === form.batch_no)
      );
    } else {
      setFilteredStudents([]);
    }
  }, [form.batch_name, form.batch_no, students]);

  useEffect(() => {
    if (form.studentId) {
      fetchHistory(form.studentId);
    } else {
      setHistory([]);
      setReportData(null);
    }
  }, [form.studentId]);

  const fetchHistory = async (studentId) => {
    try {
      const res = await API.get("/performance-reports/history/" + studentId);
      setHistory(res.data);
    } catch (err) {
      toast.error("Failed to load history");
    }
  };

  const getBatchNames = () => [...new Set(batches.map((b) => b.batch_name))];
  const getBatchNos = () =>
    batches.filter((b) => b.batch_name === form.batch_name).map((b) => b.batch_no);

  const handleGenerate = async () => {
    if (!form.studentId || !form.batch_name || !form.batch_no || !form.startDate || !form.endDate) {
      return toast.error("Please fill all required fields");
    }
    
    if (new Date(form.endDate) < new Date(form.startDate)) {
      return toast.error("End date cannot be smaller than Start date");
    }
    
    if (new Date(form.endDate) > new Date() || new Date(form.startDate) > new Date()) {
      return toast.error("Future dates are not allowed");
    }

    setLoading(true);
    try {
      const batchObj = batches.find(b => b.batch_name === form.batch_name && b.batch_no === form.batch_no);
      if(!batchObj) throw new Error("Invalid batch");

      const res = await API.post("/performance-reports/generate", {
        studentId: form.studentId,
        batchId: batchObj._id,
        startDate: form.startDate,
        endDate: form.endDate
      });
      setReportData(res.data);
      toast.success("Report generated successfully");
      fetchHistory(form.studentId);
    } catch (err) {
      toast.error(err.response?.data?.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!reportData) return;
    setAiLoading(true);
    try {
      const res = await API.post("/performance-reports/generate-ai-summary", {
        reportId: reportData._id
      });
      setReportData(prev => ({ ...prev, aiSummary: res.data }));
      toast.success("AI Summary generated");
      fetchHistory(form.studentId);
    } catch (err) {
      toast.error(err.response?.data?.message || "AI Generation failed");
    } finally {
      setAiLoading(false);
    }
  };

  const handleDownload = (id) => {
    const a = document.createElement("a");
    a.href = `${import.meta.env.VITE_API_URL}/performance-reports/pdf/${id}?t=${Date.now()}`;
    a.download = `PerformanceReport_${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <p style={S.pageTitle}>Performance Reports</p>
      <p style={S.pageSubtitle}>Generate and view consolidated performance reports</p>

      <div style={S.card}>
        <div style={S.sectionHeader}>
          <div style={S.dot} />
          <span style={S.sectionTitle}>Report Criteria</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
          <div>
            <label style={S.label}>Batch Name *</label>
            <select style={S.select} value={form.batch_name} onChange={(e) => setForm({ ...form, batch_name: e.target.value, batch_no: "", studentId: "" })}>
              <option value="">Select Batch</option>
              {getBatchNames().map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Batch No *</label>
            <select style={{ ...S.select, opacity: !form.batch_name ? 0.5 : 1 }} value={form.batch_no} onChange={(e) => setForm({ ...form, batch_no: e.target.value, studentId: "" })} disabled={!form.batch_name}>
              <option value="">Batch No</option>
              {getBatchNos().map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Start Date *</label>
            <input
              type="date"
              style={S.input}
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div>
            <label style={S.label}>End Date *</label>
            <input
              type="date"
              style={S.input}
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        <div className="mb-4">
          <label style={S.label}>Student *</label>
          <select style={{ ...S.select, opacity: !form.batch_no ? 0.5 : 1 }} value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} disabled={!form.batch_no}>
            <option value="">Select Student</option>
            {filteredStudents.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>

        <div style={{ marginTop: 15 }}>
          <button style={{...S.btnSave, opacity: (!form.studentId || !form.startDate || !form.endDate) ? 0.5 : 1}} onClick={handleGenerate} disabled={loading || !form.studentId || !form.startDate || !form.endDate}>
            {loading ? "Generating..." : "Generate Performance Report"}
          </button>
        </div>
      </div>

      {reportData && (
        <div style={S.card}>
          <div style={S.sectionHeaderRow}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={S.dot} />
              <div style={S.sectionTitle}>Performance Dashboard</div>
            </div>
            <button style={S.btnPDF} onClick={() => handleDownload(reportData._id)}>
              Download Performance PDF
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div style={S.statCard}>
              <div style={S.statValue}>{reportData.attendanceData?.percentage || 0}%</div>
              <div style={S.statLabel}>Attendance</div>
            </div>
            <div style={S.statCard}>
              <div style={S.statValue}>{reportData.statistics?.averageScore || 0} / 10</div>
              <div style={S.statLabel}>Average Score</div>
            </div>
            <div style={S.statCard}>
              <div style={S.statValue}>{reportData.statistics?.overallGrade || "N/A"}</div>
              <div style={S.statLabel}>Overall Grade</div>
            </div>
            <div style={S.statCard}>
              <div style={S.statValue}>{reportData.auditData?.length || 0}</div>
              <div style={S.statLabel}>Total Audits</div>
            </div>
          </div>

          <div style={S.sectionHeaderRow}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={S.dot} />
              <div style={S.sectionTitle}>AI Summary</div>
            </div>
            {!reportData.aiSummary?.strengths && (
              <button style={S.btnAI} onClick={handleGenerateAI} disabled={aiLoading}>
                {aiLoading ? "Generating..." : "Generate Performance Summary with AI"}
              </button>
            )}
          </div>

          {reportData.aiSummary?.strengths && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div><strong style={{fontSize: 12}}>Strengths:</strong> <span style={{fontSize: 12, color: "#475569"}}>{reportData.aiSummary.strengths}</span></div>
              <div><strong style={{fontSize: 12}}>Weaknesses:</strong> <span style={{fontSize: 12, color: "#475569"}}>{reportData.aiSummary.weaknesses}</span></div>
              <div><strong style={{fontSize: 12}}>Recommendations:</strong> <span style={{fontSize: 12, color: "#475569"}}>{reportData.aiSummary.teacherRecommendation}</span></div>
            </div>
          )}
        </div>
      )}

      {form.studentId && history.length > 0 && (
        <div style={S.card}>
          <div style={S.sectionHeader}>
            <div style={S.dot} />
            <span style={S.sectionTitle}>Report History</span>
          </div>
          {history.map((h) => (
            <div key={h._id} style={S.historyRow}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{new Date(h.startDate).toLocaleDateString()} to {new Date(h.endDate).toLocaleDateString()}</div>
                <div style={{ fontSize: 11, color: "#64748B" }}>Generated on {new Date(h.createdAt).toLocaleDateString()}</div>
              </div>
              <button style={S.btnPDF} onClick={() => handleDownload(h._id)}>Download PDF</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
