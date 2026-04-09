import { useState, useEffect } from "react";
import { API } from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { ClipboardList, Plus, X, User, Users, Send, Loader2, CheckCircle, Clock } from "lucide-react";

const S = {
  page: { minHeight: "100vh", background: "#F8FAFC", padding: "28px 32px", fontFamily: "'DM Sans', sans-serif" },
  card: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12, padding: "22px 24px", marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  pageTitle: { fontSize: 20, fontWeight: 700, color: "#1B2B4B", margin: 0 },
  label: { fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748B", marginBottom: 8, display: "block" },
  input: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#1B2B4B", width: "100%", outline: "none", fontFamily: "'DM Sans', sans-serif" },
  select: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#1B2B4B", width: "100%", outline: "none", fontFamily: "'DM Sans', sans-serif" },
  primaryBtn: { background: "#2563EB", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "'DM Sans', sans-serif" },
  secondaryBtn: { background: "#fff", color: "#1B2B4B", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "8px 12px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans', sans-serif" },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: "#1B2B4B", marginBottom: 12, display: "flex", gap: 8, alignItems: "center" },
};

function SelectField({ label, value, onChange, children, disabled }) {
  return (
    <div>
      <label style={S.label}>{label}</label>
      <select value={value} onChange={onChange} disabled={disabled} style={{ ...S.select, opacity: disabled ? 0.5 : 1 }}>
        {children}
      </select>
    </div>
  );
}

export default function AssignTask() {
  const [assignMode, setAssignMode] = useState("batch");

  const [batchName, setBatchName] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [date, setDate] = useState("");
  const [student, setStudent] = useState("");

  const [batches, setBatches] = useState([]);
  const [batchStudents, setBatchStudents] = useState([]);
  const [batchStudentsLoading, setBatchStudentsLoading] = useState(false);
  const [parameters, setParameters] = useState([{ name: "", score: "" }]);
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");

  useEffect(() => {
    API.get("/batches/public").then((r) => setBatches(r.data || []));
  }, []);

  const clean = (str) => str?.replace(/\s+/g, "").toUpperCase();

  const uniqueBatchNames = [...new Set(batches.map((b) => clean(b.batch_name)))];
  const filteredBatches = batches.filter((b) => clean(b.batch_name) === batchName);
  const uniqueBatchNumbers = [...new Set(filteredBatches.map((b) => b.batch_no))];

  // Fetch students when batch name + number are selected
  useEffect(() => {
    if (!batchName || !batchNumber) {
      setBatchStudents([]);
      setStudent("");
      return;
    }
    const found = filteredBatches.find((b) => String(b.batch_no) === String(batchNumber));
    if (!found?._id) return;

    setBatchStudentsLoading(true);
    API.get(`/batches/${found._id}/students`)
      .then((r) => setBatchStudents(r.data?.students || []))
      .catch(() => setBatchStudents([]))
      .finally(() => setBatchStudentsLoading(false));
  }, [batchName, batchNumber]);

  const addParameter = () => setParameters([...parameters, { name: "", score: "" }]);

  const updateParameter = (i, field, val) => {
    const updated = [...parameters];
    updated[i][field] = val;
    setParameters(updated);
  };

  const removeParameter = (i) => {
    if (parameters.length === 1) return;
    setParameters(parameters.filter((_, idx) => idx !== i));
  };

  const handleAssign = async () => {
    if (!batchName) return toast.error("Select batch name");
    if (!batchNumber) return toast.error("Select batch number");
    if (!date) return toast.error("Select a date");

    if (assignMode === "individual" && !student) {
      return toast.error("Select a student");
    }

    // Validate parameters — skip empty ones
    const cleanParams = parameters
      .filter((p) => p.name.trim() !== "")
      .map((p) => ({ name: p.name.trim(), score: Number(p.score) || 0 }));

    try {
      setLoading(true);

      const payload = {
        batchName,
        batchNumber,
        parameters: cleanParams,
        date,
        mode: assignMode,
        comment,
      };

      // Only send student field in individual mode
      if (assignMode === "individual") {
        payload.student = student;
      }

      await API.post("/assignment/create", payload);

      toast.success(
        assignMode === "batch"
          ? `Assigned to all students in ${batchName} - Batch ${batchNumber}`
          : "Assigned to student successfully"
      );

      // Reset form
      setBatchName("");
      setBatchNumber("");
      setStudent("");
      setDate("");
      setParameters([{ name: "", score: "" }]);
      setComment("");
      setBatchStudents([]);
    } catch (err) {
      console.error("Assignment error:", err.response?.data);
      toast.error(err.response?.data?.message || "Assignment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <Toaster />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 4, height: 20, background: "#2563EB", borderRadius: 4 }} />
            <h1 style={S.pageTitle}>Assign Project</h1>
          </div>
          <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>Assign new projects or tasks to your batches or individual students.</p>
        </div>
      </div>

      {/* Batch Info */}
      <div style={S.card}>
        <div style={S.sectionTitle}>
          <Users size={16} /> Batch Info
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <SelectField
            label="Batch Name"
            value={batchName}
            onChange={(e) => {
              setBatchName(e.target.value);
              setBatchNumber("");
              setBatchStudents([]);
              setStudent("");
            }}
          >
            <option value="">Select Batch</option>
            {uniqueBatchNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </SelectField>

          <SelectField
            label="Batch Number"
            value={batchNumber}
            onChange={(e) => setBatchNumber(e.target.value)}
            disabled={!batchName}
          >
            <option value="">Select Number</option>
            {uniqueBatchNumbers.map((num) => (
              <option key={num} value={num}>{num}</option>
            ))}
          </SelectField>
        </div>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ ...S.input, marginTop: 10 }}
        />
      </div>

      {/* Enrolled Students Preview */}
      {(batchStudentsLoading || batchStudents.length > 0) && batchName && batchNumber && (
        <div style={S.card}>
          <div style={{ ...S.sectionTitle, justifyContent: "space-between" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Users size={16} color="#2563EB" />
              Enrolled Students
            </span>
            <span style={{
              background: "#EFF6FF", color: "#2563EB",
              borderRadius: 20, padding: "2px 12px",
              fontSize: 12, fontWeight: 700,
            }}>
              {batchStudentsLoading ? "..." : `${batchStudents.length} students`}
            </span>
          </div>

          {batchStudentsLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748B", fontSize: 13 }}>
              <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
              Loading students...
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
              {batchStudents.map((s, i) => (
                <div key={s._id || i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 12px",
                  background: "#F8FAFC",
                  border: "1.5px solid #E2E8F0",
                  borderRadius: 8,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "linear-gradient(135deg,#2563EB,#60A5FA)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0,
                  }}>
                    {(s.name || "?")[0].toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {s.name}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                      {s.isActive ? (
                        <><CheckCircle size={10} color="#10B981" /><span style={{ fontSize: 10, color: "#10B981" }}>Active</span></>
                      ) : (
                        <><Clock size={10} color="#F59E0B" /><span style={{ fontSize: 10, color: "#F59E0B" }}>Pending</span></>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Assignment Mode */}
      <div style={S.card}>
        <div style={S.sectionTitle}>Assignment Mode</div>
        <label>
          <input
            type="radio"
            value="batch"
            checked={assignMode === "batch"}
            onChange={(e) => { setAssignMode(e.target.value); setStudent(""); }}
          />
          {" "}Assign to Batch
        </label>
        <label style={{ marginLeft: 20 }}>
          <input
            type="radio"
            value="individual"
            checked={assignMode === "individual"}
            onChange={(e) => setAssignMode(e.target.value)}
          />
          {" "}Assign to Individual
        </label>
      </div>

      {/* Student Selection — only for individual, only from selected batch */}
      {assignMode === "individual" && (
        <div style={S.card}>
          <div style={S.sectionTitle}>
            <User size={16} /> Student Selection
          </div>

          {!batchName || !batchNumber ? (
            <p style={{ color: "#94A3B8", fontSize: 13 }}>Please select a batch first to see students.</p>
          ) : batchStudentsLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748B", fontSize: 13 }}>
              <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
              Loading students...
            </div>
          ) : (
            <SelectField
              label="Select Student"
              value={student}
              onChange={(e) => setStudent(e.target.value)}
            >
              <option value="">Select Student</option>
              {batchStudents.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </SelectField>
          )}
        </div>
      )}

      {/* Parameters */}
      <div style={S.card}>
        <div style={S.sectionTitle}>
          <ClipboardList size={16} /> Assignment Parameters
        </div>

        {parameters.map((p, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center" }}>
            <input
              placeholder="Assignment Name"
              value={p.name}
              onChange={(e) => updateParameter(i, "name", e.target.value)}
              style={S.input}
            />
            <input
              placeholder="Score"
              value={p.score}
              onChange={(e) => updateParameter(i, "score", e.target.value)}
              style={{ ...S.input, maxWidth: 120 }}
            />
            <button onClick={() => removeParameter(i)} style={{ cursor: "pointer", color: "#EF4444", background: "none", border: "none" }}>
              <X size={18} />
            </button>
          </div>
        ))}

        <button onClick={addParameter} style={S.secondaryBtn}>
          <Plus size={14} /> Add Parameter
        </button>
        <div className="mt-4">
          <label style={S.label}>
            Assignment Description / Comments
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write instructions, notes, expectations..."
            style={{ ...S.input, minHeight: 100, textAlign: "left" }}
          />
        </div>
      </div>
      

      <button onClick={handleAssign} style={S.primaryBtn}>
        <Send size={14} />
        {loading ? "Assigning..." : assignMode === "batch" ? "Assign to Batch" : "Assign to Student"}
      </button>
    </div>
  );
}