import { useState, useEffect } from "react";
import { API } from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { ClipboardList, Plus, X, ChevronDown, User, Users, Calendar, Send } from "lucide-react";

const S = {
  page: { minHeight: "100vh", background: "#F8FAFC", padding: "28px 32px", fontFamily: "'DM Sans', sans-serif" },
  card: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "22px 24px", marginBottom: 20 },
  pageTitle: { fontSize: 20, fontWeight: 700, color: "#1B2B4B", margin: 0 },
  label: { fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748B", display: "block", marginBottom: 8 },
  input: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#1B2B4B", width: "100%", outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" },
  select: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#1B2B4B", width: "100%", outline: "none", fontFamily: "'DM Sans', sans-serif", appearance: "none" },
  primaryBtn: { background: "#2563EB", color: "#fff", border: "none", borderRadius: 8, padding: "11px 24px", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "'DM Sans', sans-serif" },
  secondaryBtn: { background: "#fff", color: "#1B2B4B", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "9px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans', sans-serif" },
  dangerBtn: { background: "transparent", color: "#EF4444", border: "none", cursor: "pointer", padding: "6px", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: "#1B2B4B", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 },
};

function SelectField({ label, icon, value, onChange, children, disabled }) {
  return (
    <div>
      <label style={S.label}>{icon && <span style={{ marginRight: 4, verticalAlign: "middle" }}>{icon}</span>}{label}</label>
      <div style={{ position: "relative" }}>
        <select value={value} onChange={onChange} disabled={disabled} style={{ ...S.select, opacity: disabled ? 0.5 : 1 }}>{children}</select>
        <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
      </div>
    </div>
  );
}

export default function AssignTask() {
  const [batchName, setBatchName] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [date, setDate] = useState("");
  const [student, setStudent] = useState("");
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [parameters, setParameters] = useState([{ name: "", score: "" }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get("/batches/public").then((r) => setBatches(r.data || [])).catch(console.error);
    API.get("/students/list").then((r) => setStudents(r.data?.students || [])).catch(console.error);
  }, []);

  const addParameter = () => setParameters([...parameters, { name: "", score: "" }]);
  const removeParameter = (i) => setParameters(parameters.filter((_, idx) => idx !== i));
  const updateParameter = (i, field, val) => {
    const updated = [...parameters];
    updated[i][field] = val;
    setParameters(updated);
  };

  const handleAssign = async () => {
    if (!batchName) { toast.error("Please select a batch name"); return; }
    if (!parameters[0]?.name) { toast.error("Please enter at least one assignment name"); return; }
    try {
      setLoading(true);
      await API.post("/assignments/create", { batchName, batchNumber, student, parameters, date });
      toast.success("Assignment assigned successfully!");
      setBatchName(""); setBatchNumber(""); setDate(""); setStudent("");
      setParameters([{ name: "", score: "" }]);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to assign task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <Toaster position="top-right" />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{ width: 4, height: 20, background: "#2563EB", borderRadius: 4 }} />
          <h1 style={S.pageTitle}>Assign Project</h1>
        </div>
        <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>Assign tasks and projects to students in your batches.</p>
      </div>

      {/* Batch Information */}
      <div style={S.card}>
        <p style={S.sectionTitle}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Users size={16} color="#2563EB" />
          </div>
          Batch Information
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <SelectField label="Batch Name" value={batchName} onChange={(e) => setBatchName(e.target.value)}>
            <option value="">Select Batch Name</option>
            {batches.map((b) => <option key={b._id} value={b.batch_name}>{b.batch_name}</option>)}
          </SelectField>
          <SelectField label="Batch Number" value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)}>
            <option value="">Select Batch Number</option>
            {batches.map((b) => <option key={b._id} value={b.batch_no}>{b.batch_no}</option>)}
          </SelectField>
        </div>
        <div>
          <label style={S.label}><Calendar size={11} style={{ marginRight: 4, verticalAlign: "middle" }} />Due Date</label>
          <div style={{ position: "relative" }}>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={S.input} />
          </div>
        </div>
      </div>

      {/* Student Selection */}
      <div style={S.card}>
        <p style={S.sectionTitle}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={16} color="#10B981" />
          </div>
          Student Selection
          <span style={{ background: "#F1F5F9", color: "#64748B", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>Optional</span>
        </p>
        <SelectField label="Select Student (leave blank to assign to all)" value={student} onChange={(e) => setStudent(e.target.value)}>
          <option value="">All Students in Batch</option>
          {students.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
        </SelectField>
      </div>

      {/* Assignment Parameters */}
      <div style={S.card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <p style={{ ...S.sectionTitle, margin: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ClipboardList size={16} color="#F59E0B" />
            </div>
            Assignment Parameters
          </p>
          <button style={S.secondaryBtn} onClick={addParameter}>
            <Plus size={13} /> Add Parameter
          </button>
        </div>

        {/* Table header */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 40px", gap: 10, marginBottom: 10 }}>
          <span style={S.label}>Assignment Name</span>
          <span style={S.label}>Score / Weight</span>
          <span />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {parameters.map((param, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 120px 40px", gap: 10, alignItems: "center" }}>
              <input
                placeholder="e.g. Final Project, Assignment 1..."
                value={param.name}
                onChange={(e) => updateParameter(i, "name", e.target.value)}
                style={S.input}
              />
              <input
                placeholder="Score"
                value={param.score}
                onChange={(e) => updateParameter(i, "score", e.target.value)}
                style={S.input}
              />
              <button
                onClick={() => removeParameter(i)}
                style={S.dangerBtn}
                disabled={parameters.length === 1}
                title="Remove"
              >
                <X size={15} color={parameters.length === 1 ? "#CBD5E1" : "#EF4444"} />
              </button>
            </div>
          ))}
        </div>

        {parameters.length > 1 && (
          <p style={{ color: "#94A3B8", fontSize: 12, marginTop: 10, fontStyle: "italic" }}>
            {parameters.length} parameters configured
          </p>
        )}
      </div>

      {/* Submit */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={handleAssign} disabled={loading} style={{ ...S.primaryBtn, opacity: loading ? 0.7 : 1 }}>
          <Send size={15} />
          {loading ? "Assigning..." : "Assign Task"}
        </button>
      </div>
    </div>
  );
}