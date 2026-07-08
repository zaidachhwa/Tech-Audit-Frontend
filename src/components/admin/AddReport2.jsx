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
    parameters: [{ name: "", score: "" }],
    feedbackSchema: { point1: "", point2: "", point3: "" },
    overallRemarks: "",
    auditDate: "",
    isAutoFilled: false,
    existingStatus: ""
  });

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
    if (!form.studentId || !form.auditDate) return;

    const autoFill = async () => {
      try {
        const res = await API.get(`/reports/lookup?studentId=${form.studentId}&auditDate=${form.auditDate}`);
        if (res.data) {
          const existing = res.data;
          setForm(prev => ({
            ...prev,
            parameters: existing.parameters?.length ? existing.parameters : prev.parameters,
            feedbackSchema: existing.feedbackSchema || prev.feedbackSchema,
            overallRemarks: existing.overallRemarks || prev.overallRemarks,
            isAutoFilled: true,
            existingStatus: existing.status
          }));
          toast.success(`Found existing ${existing.status}. Data auto-filled.`, {
            duration: 4000,
            icon: '📋'
          });
        } else {
          // Reset autoFilled flag if no report exists for this combo
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
  };

  const addParameter = () =>
    setForm({ ...form, parameters: [...form.parameters, { name: "", score: "" }] });

  const removeParameter = (i) =>
    setForm({ ...form, parameters: form.parameters.filter((_, idx) => idx !== i) });

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

  // Validation helper
  const validate = () => {
    if (!form.studentId) { toast.error("Please select a student"); return false; }
    if (!form.auditDate) { toast.error("Please select audit date"); return false; }
    const validParams = form.parameters.filter((p) => p.name.trim());
    if (!validParams.length) { toast.error("Add at least one parameter"); return false; }
    return true;
  };

  // Get selected student object for preview
  const getSelectedStudent = () => {
    return filteredStudents.find((s) => s._id === form.studentId) || null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await API.post("/reports/create", {
        studentId: form.studentId,
        parameters: form.parameters.filter((p) => p.name.trim()),
        feedbackSchema: form.feedbackSchema,
        overallRemarks: form.overallRemarks,
        auditDate: form.auditDate,
      });
      toast.success("Report saved successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save report");
    }
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

  // Save first then download PDF
  const handleDownload = async () => {
    if (!validate()) return;
    try {
      const saveRes = await API.post("/reports/create", {
        studentId: form.studentId,
        parameters: form.parameters.filter((p) => p.name.trim()),
        feedbackSchema: form.feedbackSchema,
        overallRemarks: form.overallRemarks,
        auditDate: form.auditDate,
      });

      const id = saveRes.data?.report?._id;
      if (!id) { toast.error("Failed to get report ID"); return; }

      const pdf = await API.get(`/reports/${id}/pdf`, { responseType: "blob" });

      const url = window.URL.createObjectURL(new Blob([pdf.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `report-${form.studentId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("PDF downloaded");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to download PDF");
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

  return (
    <div className="space-y-6">
      <Toaster />

      <p style={S.pageTitle}>Add Report</p>
      <p style={S.pageSubtitle}>Create student audit reports</p>

      {/* Auto-fill Alert */}
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
            Showing data from an existing <strong>{form.existingStatus}</strong> for this student on this date. You can add more parameters or update existing ones.
          </span>
          <button 
            onClick={() => setForm({...form, isAutoFilled: false, parameters: [{name: "", score: ""}], feedbackSchema: {point1: "", point2: "", point3: ""}, overallRemarks: ""})}
            style={{ marginLeft: "auto", background: "none", border: "none", color: "#2563EB", cursor: "pointer", fontWeight: 600, fontSize: 12 }}
          >
            Clear Form
          </button>
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
            <button style={S.removeBtn} onClick={() => removeParameter(i)}>✕</button>
          </div>
        ))}
      </div>

      {/* Feedback */}
      <div style={S.card}>
        <div style={S.sectionHeader}>
          <div style={S.dot} />
          <span style={S.sectionTitle}>Feedback Points</span>
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
        <button style={S.btnDraft} onClick={handleSaveDraft}>Draft</button>
        <button style={S.btnSave} onClick={handleSubmit}>Save</button>
        <button style={S.btnPdf} onClick={handleDownload}>PDF</button>
      </div>
    </div>
  );
}