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
  paramRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 },
  scoreInput: { width: 90, border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "9px 11px", fontSize: 13, color: "#1B2B4B", outline: "none", background: "#fff", flexShrink: 0 },
  removeBtn: { width: 28, height: 28, borderRadius: 8, border: "1.5px solid #E2E8F0", background: "#F8FAFC", color: "#94A3B8", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 },
  addParamBtn: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#2563EB", background: "none", border: "none", cursor: "pointer", padding: "4px 0", fontWeight: 500 },
  previewBtn: { fontSize: 12, padding: "5px 14px", borderRadius: 8, border: "1.5px solid #BFDBFE", background: "#EFF6FF", color: "#1D4ED8", cursor: "pointer", fontWeight: 500 },
  btnRow: { display: "flex", gap: 10, marginTop: 4 },
  btnDraft: { padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "1.5px solid #FDE68A", background: "#FEF9C3", color: "#92400E" },
  btnSave: { padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "1.5px solid #BBF7D0", background: "#DCFCE7", color: "#166534" },
  btnPdf: { padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "none", background: "#2563EB", color: "#fff" },
};

export default function AddReport2() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);

  const [form, setForm] = useState({
    batch_name: "",
    batch_no: "",
    studentId: "",
    parameters: [{ name: "", score: "", totalScore: "" }],
    feedbackSchema: { point1: "", point2: "", point3: "" },
    overallRemarks: "",
    auditDate: "",
    isAutoFilled: false,
    existingStatus: ""
  });
  const [generatingAI, setGeneratingAI] = useState(false);
  // Tracks whether a published report already exists for current student+date
  const [existingReportId, setExistingReportId] = useState(null);
  const [existingReportName, setExistingReportName] = useState("");

  useEffect(() => {
    API.get("/students/list")
      .then((res) => setStudents(res.data?.students || []))
      .catch(() => toast.error("Failed to load students"));

    API.get("/batches/public")
      .then((res) => setBatches(res.data || []))
      .catch(() => toast.error("Failed to load batches"));
  }, []);

  useEffect(() => {
    const filtered = students.filter(
      (s) =>
        s.batch_name === form.batch_name &&
        s.batch_no?.toString() === form.batch_no?.toString()
    );
    setFilteredStudents(filtered);
  }, [form.batch_name, form.batch_no, students]);

  // 🔥 AUTO-FILL LOGIC: Fetch existing report/draft when student + date are selected
  useEffect(() => {
    if (!form.studentId || !form.auditDate) {
      setExistingReportId(null);
      setExistingReportName("");
      return;
    }

    const autoFill = async () => {
      try {
        const res = await API.get(`/reports/lookup?studentId=${form.studentId}&auditDate=${form.auditDate}`);
        if (res.data) {
          const existing = res.data;

          // Auto-fill form with existing data (draft or published)
          // NOTE: we do NOT lock the save button here — user may want a new
          // report on the same date with different parameters.
          setForm(prev => ({
            ...prev,
            parameters: existing.parameters?.length ? existing.parameters : prev.parameters,
            feedbackSchema: existing.feedbackSchema || prev.feedbackSchema,
            overallRemarks: existing.overallRemarks || prev.overallRemarks,
            isAutoFilled: true,
            existingStatus: existing.status
          }));

          if (existing.status === "draft") {
            toast.success(`Found existing draft. Data auto-filled.`, { duration: 3000, icon: '📋' });
          } else {
            toast(`Existing report found for this date — data auto-filled. Modify parameters to save a new report.`, {
              icon: '📋',
              duration: 4000,
              style: { background: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE' }
            });
          }
        } else {
          // No existing report for this combo
          setExistingReportId(null);
          setExistingReportName("");
          if (form.isAutoFilled) {
            setForm(prev => ({ ...prev, isAutoFilled: false, existingStatus: "" }));
          }
        }
      } catch (err) {
        console.error("Lookup error:", err);
      }
    };

    autoFill();
  }, [form.studentId, form.auditDate]);

  const getBatchNames = () => [...new Set(batches.map((b) => b.batch_name))];
  const getBatchNos = () =>
    batches.filter((b) => b.batch_name === form.batch_name).map((b) => b.batch_no);

  const handleParamChange = (i, field, value) => {
    const updated = [...form.parameters];
    updated[i][field] = value;
    setForm({ ...form, parameters: updated });
    // Reset session lock so Save & Download PDF button is shown again
    setExistingReportId(null);
    setExistingReportName("");
  };

  const addParameter = () => {
    setForm({ ...form, parameters: [...form.parameters, { name: "", score: "", totalScore: "" }] });
    setExistingReportId(null);
    setExistingReportName("");
  };

  const removeParameter = (i) => {
    setForm({ ...form, parameters: form.parameters.filter((_, idx) => idx !== i) });
    setExistingReportId(null);
    setExistingReportName("");
  };

  const saveParametersToLocal = () => {
    localStorage.setItem("savedParameters", JSON.stringify(form.parameters));
    toast.success("Parameters saved locally");
  };

  const loadParametersFromLocal = () => {
    const saved = localStorage.getItem("savedParameters");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setForm({ ...form, parameters: parsed });
        toast.success("Parameters loaded");
      } catch(e) {
        toast.error("Failed to load parameters");
      }
    } else {
      toast.error("No saved parameters found");
    }
  };

  const handleGenerateFeedback = async () => {
    const validParams = form.parameters.filter((p) => p.name.trim());
    if (!validParams.length) { toast.error("Add at least one parameter to generate feedback"); return; }
    
    try {
      setGeneratingAI(true);
      toast.loading("Generating AI Feedback...", { id: "ai-feedback" });
      const res = await API.post("/reports/generate-feedback", { parameters: validParams });
      const { feedback: points, overallRemarks } = res.data;
      setForm((prev) => ({
        ...prev,
        feedbackSchema: {
          point1: points[0] || prev.feedbackSchema.point1,
          point2: points[1] || prev.feedbackSchema.point2,
          point3: points[2] || prev.feedbackSchema.point3,
        },
        overallRemarks: overallRemarks || prev.overallRemarks
      }));
      toast.dismiss("ai-feedback");
      toast.success("AI Feedback Generated!");
    } catch (err) {
      toast.dismiss("ai-feedback");
      toast.error(err.response?.data?.message || "Failed to generate AI feedback");
    } finally {
      setGeneratingAI(false);
    }
  };

  // Validation helper
  const validate = () => {
    if (!form.studentId) { toast.error("Please select a student"); return false; }
    if (!form.auditDate) { toast.error("Please select audit date"); return false; }
    const validParams = form.parameters.filter((p) => p.name.trim());
    if (!validParams.length) { toast.error("Add at least one parameter"); return false; }
    for (const p of validParams) {
      if (Number(p.score) > (Number(p.totalScore) || 10)) {
        toast.error(`Score cannot exceed total score for: ${p.name}`);
        return false;
      }
    }
    return true;
  };

  // Get selected student object for preview
  const getSelectedStudent = () => {
    return filteredStudents.find((s) => s._id === form.studentId) || null;
  };

  const handleSaveDraft = async () => {
    if (!form.studentId) { toast.error("Please select a student"); return; }
    try {
      await API.post("/reports/draft", {
        studentId: form.studentId,
        parameters: form.parameters.filter((p) => p.name.trim()),
        feedbackSchema: form.feedbackSchema,
        overallRemarks: form.overallRemarks,
        auditDate: form.auditDate,
      });
      toast.success("Draft saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save draft");
    }
  };

  // ✅ Download PDF from an already-saved report (no new save)
  const handleDownloadOnly = async (reportId) => {
    try {
      toast.loading("Preparing PDF...", { id: "pdf-dl" });
      const pdf = await API.get(`/reports/${reportId}/pdf`, { responseType: "blob" });
      toast.dismiss("pdf-dl");

      const student = filteredStudents.find(s => s._id === form.studentId);
      const studentName = student?.name?.replace(/\s+/g, "_") || "Student";
      const batchName = student?.batch_name || "Batch";
      const batchNo = student?.batch_no || "";
      const date = form.auditDate || new Date().toISOString().split("T")[0];
      const fileName = `${studentName}-${batchName}-${batchNo}-${date}.pdf`;

      const url = window.URL.createObjectURL(new Blob([pdf.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("PDF downloaded");
    } catch (err) {
      toast.error("Failed to download PDF");
    }
  };

  // ✅ Single action: Save ONCE then immediately download PDF
  const handleSaveAndDownload = async () => {
    if (!validate()) return;
    try {
      toast.loading("Saving report...", { id: "save-dl" });

      let reportId;

      try {
        const saveRes = await API.post("/reports/create", {
          studentId: form.studentId,
          parameters: form.parameters.filter((p) => p.name.trim()),
          feedbackSchema: form.feedbackSchema,
          overallRemarks: form.overallRemarks,
          auditDate: form.auditDate,
        });
        reportId = saveRes.data?.report?._id;
        // Mark as saved so the UI switches to Download-only mode
        const student = filteredStudents.find(s => s._id === form.studentId);
        setExistingReportId(reportId);
        setExistingReportName(student?.name || "this student");
      } catch (saveErr) {
        if (saveErr.response?.status === 409) {
          const { reason, message: errMsg } = saveErr.response.data || {};

          // Only data_duplicate is possible now (date_duplicate guard removed)
          // Show error and block — do not download
          toast.dismiss("save-dl");
          toast.error(errMsg || "Report with the same data already exists for this student.", {
            duration: 5000,
            style: { background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }
          });
          return;
        } else {
          toast.dismiss("save-dl");
          toast.error(saveErr.response?.data?.message || "Failed to save report");
          return;
        }
      }

      if (!reportId) {
        toast.dismiss("save-dl");
        toast.error("Failed to get report ID");
        return;
      }

      toast.loading("Generating PDF...", { id: "save-dl" });
      const pdf = await API.get(`/reports/${reportId}/pdf`, { responseType: "blob" });
      toast.dismiss("save-dl");

      const student = filteredStudents.find(s => s._id === form.studentId);
      const studentName = student?.name?.replace(/\s+/g, "_") || "Student";
      const batchName = student?.batch_name || "Batch";
      const batchNo = student?.batch_no || "";
      const date = form.auditDate || new Date().toISOString().split("T")[0];
      const fileName = `${studentName}-${batchName}-${batchNo}-${date}.pdf`;

      const url = window.URL.createObjectURL(new Blob([pdf.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Report saved & PDF downloaded!");
    } catch (err) {
      toast.dismiss("save-dl");
      toast.error("Failed to complete save & download");
    }
  };

  // Preview PDF in new tab without saving
  const handlePreview = async () => {
    if (!validate()) return;
    const student = getSelectedStudent();
    if (!student) { toast.error("Student not found"); return; }

    try {
      toast.loading("Generating preview...", { id: "preview" });

      const res = await API.post(
        "/reports/preview",
        {
          student: {
            name: student.name,
            email: student.email,
            batch_name: student.batch_name,
            batch_no: student.batch_no,
          },
          parameters: form.parameters.filter((p) => p.name.trim()),
          feedbackSchema: form.feedbackSchema,
          overallRemarks: form.overallRemarks,
          auditDate: form.auditDate,
        },
        { responseType: "blob" }
      );

      toast.dismiss("preview");
      toast.success("Preview ready");

      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      window.open(url, "_blank");
    } catch (err) {
      toast.dismiss("preview");
      toast.error(err.response?.data?.message || "Preview failed");
    }
  };

  const calculateTotals = () => {
    let obtained = 0;
    let total = 0;
    form.parameters.forEach(p => {
      const s = Number(p.score) || 0;
      const t = Number(p.totalScore) || 10;
      if (p.name.trim()) {
        obtained += s;
        total += t;
      }
    });
    return { obtained, total };
  };

  const { obtained: grandObtained, total: grandTotal } = calculateTotals();
  const grandPercentage = grandTotal > 0 ? (grandObtained / grandTotal) * 100 : 0;
  
  const getGrade = (percentage) => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C";
    if (percentage >= 40) return "D";
    if (grandTotal === 0) return "-";
    return "F";
  };
  
  const grade = getGrade(grandPercentage);

  return (
    <div className="space-y-6">
      <Toaster />

      <p style={S.pageTitle}>Add Report</p>
      <p style={S.pageSubtitle}>Create student audit reports</p>

      {/* 📋 Auto-fill alert — shown when form is populated from an existing draft or report */}
      {form.isAutoFilled && (
        <div style={{
          background: "#EFF6FF",
          border: "1.5px solid #BFDBFE",
          borderRadius: 12,
          padding: "12px 16px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 12,
          color: "#1E40AF",
          fontSize: 13,
          fontWeight: 500
        }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2563EB" }} />
          <span>
            {form.existingStatus === "draft"
              ? <>Showing data from an existing <strong>draft</strong> for this student on this date.</>  
              : <>Existing report found — data auto-filled. <strong>Modify parameters</strong> to save a new report.</>}
          </span>
          <button 
            onClick={() => setForm({...form, isAutoFilled: false, existingStatus: "", parameters: [{name: "", score: "", totalScore: ""}], feedbackSchema: {point1: "", point2: "", point3: ""}, overallRemarks: ""})}
            style={{ marginLeft: "auto", background: "none", border: "none", color: "#2563EB", cursor: "pointer", fontWeight: 600, fontSize: 12 }}
          >
            Clear Form
          </button>
        </div>
      )}

      {/* ✅ After-save banner — shown only when report was just saved this session */}
      {existingReportId && (
        <div style={{
          background: "#ECFDF5",
          border: "1.5px solid #6EE7B7",
          borderRadius: 12,
          padding: "12px 16px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 12,
          color: "#065F46",
          fontSize: 13,
          fontWeight: 500
        }}>
          <span style={{ fontSize: 16 }}>✅</span>
          <span>
            Report for <strong>{existingReportName}</strong> was saved successfully. Use <strong>Download PDF</strong> to re-download.
          </span>
        </div>
      )}

      {/* Batch Info */}
      <div style={S.card}>
        <div style={S.sectionHeader}>
          <div style={S.dot} />
          <span style={S.sectionTitle}>Batch Information</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label style={S.label}>Batch Name</label>
            <select style={S.select} value={form.batch_name} onChange={(e) => setForm({ ...form, batch_name: e.target.value, batch_no: "", studentId: "" })}>
              <option value="">Select Batch</option>
              {getBatchNames().map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Batch No</label>
            <select style={{ ...S.select, opacity: !form.batch_name ? 0.5 : 1 }} value={form.batch_no} onChange={(e) => setForm({ ...form, batch_no: e.target.value, studentId: "" })} disabled={!form.batch_name}>
              <option value="">Batch No</option>
              {getBatchNos().map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Audit Date</label>
            <input type="date" style={S.input} value={form.auditDate} onChange={(e) => setForm({ ...form, auditDate: e.target.value })} />
          </div>
        </div>

        <div>
          <label style={S.label}>Student</label>
          <select style={{ ...S.select, opacity: !form.batch_no ? 0.5 : 1 }} value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} disabled={!form.batch_no}>
            <option value="">Select Student</option>
            {filteredStudents.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {/* Parameters */}
      <div style={S.card}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#E2E8F0] mb-4">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={S.dot} />
            <span style={S.sectionTitle}>Parameters</span>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <button style={{ ...S.previewBtn, background: "#fff", color: "#64748B", border: "1.5px solid #E2E8F0" }} onClick={saveParametersToLocal}>Save Preset</button>
            <button style={{ ...S.previewBtn, background: "#fff", color: "#64748B", border: "1.5px solid #E2E8F0" }} onClick={loadParametersFromLocal}>Load Preset</button>
            <button style={S.previewBtn} onClick={handlePreview}>Preview PDF</button>
            <button style={{ ...S.addParamBtn, border: "1.5px solid #E2E8F0", padding: "5px 12px", borderRadius: 8 }} onClick={addParameter}>+ Add</button>
          </div>
        </div>

        {form.parameters.map((p, i) => (
          <div key={i} style={S.paramRow}>
            <input style={S.input} placeholder="Name" value={p.name} onChange={(e) => handleParamChange(i, "name", e.target.value)} />
            <input style={S.scoreInput} placeholder="Score" value={p.score} onChange={(e) => handleParamChange(i, "score", e.target.value)} />
            <span style={{color: "#64748B", fontWeight: 600}}>/</span>
            <input style={S.scoreInput} placeholder="Total" value={p.totalScore !== undefined ? p.totalScore : 10} onChange={(e) => handleParamChange(i, "totalScore", e.target.value)} />
            <button style={S.removeBtn} onClick={() => removeParameter(i)}>✕</button>
          </div>
        ))}

        <div style={{ marginTop: 16, padding: "12px 16px", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>Grand Total:</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#1B2B4B", marginLeft: 8 }}>{grandObtained} / {grandTotal}</span>
          </div>
          <div>
            <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>Grade:</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: "#2563EB", marginLeft: 8 }}>{grade}</span>
          </div>
        </div>
      </div>

      {/* Feedback */}
      <div style={S.card}>
        <div style={S.sectionHeaderRow}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={S.dot} />
            <span style={S.sectionTitle}>Feedback Points</span>
          </div>
          <button 
            style={{ ...S.previewBtn, background: "#F3E8FF", color: "#7E22CE", border: "1.5px solid #D8B4FE", display: "flex", alignItems: "center", gap: 6 }} 
            onClick={handleGenerateFeedback}
            disabled={generatingAI}
          >
            {generatingAI ? "Generating..." : "✨ Generate with AI"}
          </button>
        </div>
        <textarea
          style={{ ...S.textarea, marginBottom: 10 }}
          placeholder="Point 1"
          value={form.feedbackSchema.point1}
          onChange={(e) => setForm({ ...form, feedbackSchema: { ...form.feedbackSchema, point1: e.target.value } })}
        />
        <textarea
          style={{ ...S.textarea, marginBottom: 10 }}
          placeholder="Point 2"
          value={form.feedbackSchema.point2}
          onChange={(e) => setForm({ ...form, feedbackSchema: { ...form.feedbackSchema, point2: e.target.value } })}
        />
        <textarea
          style={S.textarea}
          placeholder="Point 3"
          value={form.feedbackSchema.point3}
          onChange={(e) => setForm({ ...form, feedbackSchema: { ...form.feedbackSchema, point3: e.target.value } })}
        />
      </div>

      {/* Remarks */}
      <div style={S.card}>
        <div style={S.sectionHeader}>
          <div style={S.dot} />
          <span style={S.sectionTitle}>Overall Remarks & Summary</span>
        </div>
        <textarea
          style={S.textarea}
          placeholder="Remarks"
          value={form.overallRemarks}
          onChange={(e) => setForm({ ...form, overallRemarks: e.target.value })}
        />
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap gap-3 mt-4">
        {/* Draft button always available */}
        <button style={S.btnDraft} onClick={handleSaveDraft}>Draft</button>

        {existingReportId ? (
          // ✅ Report already saved — only allow re-downloading, no re-save
          <button
            style={{
              ...S.btnPdf,
              display: "flex",
              alignItems: "center",
              gap: 8,
              opacity: 1,
            }}
            onClick={() => handleDownloadOnly(existingReportId)}
          >
            <span>⬇</span> Download PDF
          </button>
        ) : (
          // ✅ No existing report — save once and download
          <button
            style={{
              ...S.btnPdf,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
            onClick={handleSaveAndDownload}
          >
            <span>💾</span> Save & Download PDF
          </button>
        )}
      </div>
    </div>
  );
}