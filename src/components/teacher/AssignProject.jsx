import { useState, useEffect } from "react";
import { API } from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { FolderGit2, Plus, Users, Send, Loader2, Trash2, Layers, Target, Award } from "lucide-react";

const S = {
  page: { minHeight: "100vh", background: "#F8FAFC", padding: "28px 32px", fontFamily: "'DM Sans', sans-serif" },
  card: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12, padding: "22px 24px", marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  pageTitle: { fontSize: 20, fontWeight: 700, color: "#1B2B4B", margin: 0 },
  label: { fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748B", marginBottom: 8, display: "block" },
  input: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#1B2B4B", width: "100%", outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" },
  select: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#1B2B4B", width: "100%", outline: "none", fontFamily: "'DM Sans', sans-serif" },
  primaryBtn: { background: "#2563EB", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "'DM Sans', sans-serif" },
  secondaryBtn: { background: "#10B981", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", fontWeight: 600, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans', sans-serif" },
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

export default function AssignProject() {
  const [assignMode, setAssignMode] = useState("batch");
  const [batchName, setBatchName] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [student, setStudent] = useState("");
  const [batches, setBatches] = useState([]);
  const [batchStudents, setBatchStudents] = useState([]);
  const [batchStudentsLoading, setBatchStudentsLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [repo, setRepo] = useState("");
  const [overallStatus, setOverallStatus] = useState("Pending");
  const [dueDate, setDueDate] = useState("");
  const [modules, setModules] = useState([{ name: "", status: "Pending", notes: "" }]);
  const [outcomes, setOutcomes] = useState([{ title: "", description: "" }]);
  const [skills, setSkills] = useState([{ name: "", level: "Intermediate" }]);

  useEffect(() => {
    API.get("/batches/public").then((r) => setBatches(r.data || []));
  }, []);

  const clean = (str) => str?.replace(/\s+/g, "").toUpperCase();
  const uniqueBatchNames = [...new Set(batches.map((b) => clean(b.batch_name)))];
  const filteredBatches = batches.filter((b) => clean(b.batch_name) === batchName);
  const uniqueBatchNumbers = [...new Set(filteredBatches.map((b) => b.batch_no))];

  useEffect(() => {
    if (!batchName || !batchNumber) { setBatchStudents([]); setStudent(""); return; }
    const found = filteredBatches.find((b) => String(b.batch_no) === String(batchNumber));
    if (!found?._id) return;
    setBatchStudentsLoading(true);
    API.get("/batches/" + found._id + "/students")
      .then((r) => setBatchStudents(r.data?.students || []))
      .catch(() => setBatchStudents([]))
      .finally(() => setBatchStudentsLoading(false));
  }, [batchName, batchNumber]);

  const addModule = () => setModules([...modules, { name: "", status: "Pending", notes: "" }]);
  const updateModule = (i, f, v) => { const u = [...modules]; u[i][f] = v; setModules(u); };
  const removeModule = (i) => setModules(modules.filter((_, idx) => idx !== i));

  const addOutcome = () => setOutcomes([...outcomes, { title: "", description: "" }]);
  const updateOutcome = (i, f, v) => { const u = [...outcomes]; u[i][f] = v; setOutcomes(u); };
  const removeOutcome = (i) => setOutcomes(outcomes.filter((_, idx) => idx !== i));

  const addSkill = () => setSkills([...skills, { name: "", level: "Intermediate" }]);
  const updateSkill = (i, f, v) => { const u = [...skills]; u[i][f] = v; setSkills(u); };
  const removeSkill = (i) => setSkills(skills.filter((_, idx) => idx !== i));

  const handleAssign = async () => {
    if (!title.trim()) return toast.error("Project title is required");
    if (!description.trim()) return toast.error("Project description is required");
    if (!batchName || !batchNumber) return toast.error("Select a batch");
    if (assignMode === "individual" && !student) return toast.error("Select a student");

    const foundBatch = filteredBatches.find((b) => String(b.batch_no) === String(batchNumber));
    if (!foundBatch) return toast.error("Batch not found");

    const validModules = modules.filter((m) => m.name.trim());
    const validOutcomes = outcomes.filter((o) => o.title.trim());
    const validSkills = skills.filter((s) => s.name.trim());

    try {
      setLoading(true);
      const targetStudents = assignMode === "batch" ? batchStudents.map((s) => s._id) : [student];
      const promises = targetStudents.map((studentId) =>
        API.post("/projects/create", {
          title,
          description,
          repo,
          studentId,
          batchId: foundBatch._id,
          modules: validModules,
          outcomes: validOutcomes,
          skills: validSkills,
          overallStatus,
          assignedTo: studentId,
          ...(dueDate ? { dueDate } : {}),
        })
      );
      await Promise.all(promises);

      const msg = assignMode === "batch"
        ? "Assigned project to all students in " + batchName + " - Batch " + batchNumber
        : "Assigned project to student successfully";
      toast.success(msg);

      setTitle("");
      setDescription("");
      setRepo("");
      setDueDate("");
      setModules([{ name: "", status: "Pending", notes: "" }]);
      setOutcomes([{ title: "", description: "" }]);
      setSkills([{ name: "", level: "Intermediate" }]);
    } catch (err) {
      console.error("Assignment error:", err.response?.data);
      toast.error(err.response?.data?.message || "Assignment failed");
    } finally {
      setLoading(false);
    }
  };

  const spinStyle = { animation: "spin 1s linear infinite" };

  return (
    <div style={S.page}>
      <Toaster />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 4, height: 20, background: "#2563EB", borderRadius: 4 }} />
            <h1 style={S.pageTitle}>Assign Project</h1>
          </div>
          <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>Assign new projects to your batches or individual students.</p>
        </div>
      </div>

      {/* Project Basic Details */}
      <div style={S.card}>
        <div style={S.sectionTitle}>
          <FolderGit2 size={16} /> Basic Project Information
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
          <div>
            <label style={S.label}>Project Title *</label>
            <input type="text" placeholder="e.g. Full-Stack E-Commerce Website" value={title} onChange={(e) => setTitle(e.target.value)} style={S.input} />
          </div>
          <div>
            <label style={S.label}>Description *</label>
            <textarea placeholder="Provide project details, requirements, and deliverables..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} style={{ ...S.input, minHeight: 80, resize: "vertical" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <div>
              <label style={S.label}>Repository URL (Optional)</label>
              <input type="text" placeholder="https://github.com/..." value={repo} onChange={(e) => setRepo(e.target.value)} style={S.input} />
            </div>
            <div>
              <label style={S.label}>Due Date (Optional)</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={S.input} />
            </div>
            <div>
              <label style={S.label}>Initial Status</label>
              <select value={overallStatus} onChange={(e) => setOverallStatus(e.target.value)} style={S.input}>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Submitted">Submitted</option>
                <option value="Approved">Approved</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Batch & Assignment Target */}
      <div style={S.card}>
        <div style={S.sectionTitle}>
          <Users size={16} /> Assignment Target
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          <SelectField label="Batch Name" value={batchName} onChange={(e) => { setBatchName(e.target.value); setBatchNumber(""); setBatchStudents([]); setStudent(""); }}>
            <option value="">Select Batch</option>
            {uniqueBatchNames.map((name) => (<option key={name} value={name}>{name}</option>))}
          </SelectField>
          <SelectField label="Batch Number" value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} disabled={!batchName}>
            <option value="">Select Number</option>
            {uniqueBatchNumbers.map((num) => (<option key={num} value={num}>{num}</option>))}
          </SelectField>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ ...S.label, marginBottom: 8 }}>Assignment Mode</label>
          <div style={{ display: "flex", gap: 20 }}>
            <label style={{ fontSize: 13, color: "#1B2B4B", display: "flex", alignItems: "center", gap: 6 }}>
              <input type="radio" value="batch" checked={assignMode === "batch"} onChange={(e) => { setAssignMode(e.target.value); setStudent(""); }} />
              Assign to Entire Batch
            </label>
            <label style={{ fontSize: 13, color: "#1B2B4B", display: "flex", alignItems: "center", gap: 6 }}>
              <input type="radio" value="individual" checked={assignMode === "individual"} onChange={(e) => setAssignMode(e.target.value)} />
              Assign to Individual Student
            </label>
          </div>
        </div>

        {assignMode === "individual" && (
          <div style={{ marginTop: 16 }}>
            {!batchName || !batchNumber ? (
              <p style={{ color: "#94A3B8", fontSize: 13 }}>Please select a batch first to see students.</p>
            ) : batchStudentsLoading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748B", fontSize: 13 }}>
                <Loader2 size={14} style={spinStyle} /> Loading students...
              </div>
            ) : (
              <SelectField label="Select Student" value={student} onChange={(e) => setStudent(e.target.value)}>
                <option value="">Select Student</option>
                {batchStudents.map((s) => (<option key={s._id} value={s._id}>{s.name}</option>))}
              </SelectField>
            )}
          </div>
        )}
      </div>

      {/* Modules */}
      <div style={S.card}>
        <div style={{ ...S.sectionTitle, justifyContent: "space-between" }}>
          <span style={{ display: "flex", gap: 8, alignItems: "center" }}><Layers size={16} /> Modules</span>
          <button onClick={addModule} style={S.secondaryBtn}><Plus size={14} /> Add Module</button>
        </div>
        {modules.map((m, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start", background: "#F8FAFC", padding: 12, borderRadius: 8 }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <input placeholder="Module Name" value={m.name} onChange={(e) => updateModule(i, "name", e.target.value)} style={S.input} />
              <div style={{ display: "flex", gap: 8 }}>
                <select value={m.status} onChange={(e) => updateModule(i, "status", e.target.value)} style={{ ...S.input, width: "30%" }}>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <input placeholder="Notes (optional)" value={m.notes} onChange={(e) => updateModule(i, "notes", e.target.value)} style={{ ...S.input, width: "70%" }} />
              </div>
            </div>
            {modules.length > 1 && (
              <button onClick={() => removeModule(i)} style={{ color: "#EF4444", background: "none", border: "none", cursor: "pointer", padding: 6 }}>
                <Trash2 size={18} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Outcomes & Skills */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={S.card}>
          <div style={{ ...S.sectionTitle, justifyContent: "space-between" }}>
            <span style={{ display: "flex", gap: 8, alignItems: "center" }}><Target size={16} /> Learning Outcomes</span>
            <button onClick={addOutcome} style={S.secondaryBtn}><Plus size={14} /> Add</button>
          </div>
          {outcomes.map((o, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start", background: "#F0FDF4", padding: 12, borderRadius: 8 }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <input placeholder="Outcome Title" value={o.title} onChange={(e) => updateOutcome(i, "title", e.target.value)} style={S.input} />
                <input placeholder="Description (optional)" value={o.description} onChange={(e) => updateOutcome(i, "description", e.target.value)} style={S.input} />
              </div>
              {outcomes.length > 1 && (
                <button onClick={() => removeOutcome(i)} style={{ color: "#EF4444", background: "none", border: "none", cursor: "pointer", padding: 6 }}>
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div style={S.card}>
          <div style={{ ...S.sectionTitle, justifyContent: "space-between" }}>
            <span style={{ display: "flex", gap: 8, alignItems: "center" }}><Award size={16} /> Required Skills</span>
            <button onClick={addSkill} style={S.secondaryBtn}><Plus size={14} /> Add</button>
          </div>
          {skills.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start", background: "#FEF3C7", padding: 12, borderRadius: 8 }}>
              <div style={{ flex: 1, display: "flex", gap: 8 }}>
                <input placeholder="Skill Name" value={s.name} onChange={(e) => updateSkill(i, "name", e.target.value)} style={{ ...S.input, flex: 2 }} />
                <select value={s.level} onChange={(e) => updateSkill(i, "level", e.target.value)} style={{ ...S.input, flex: 1 }}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              {skills.length > 1 && (
                <button onClick={() => removeSkill(i)} style={{ color: "#EF4444", background: "none", border: "none", cursor: "pointer", padding: 6 }}>
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleAssign}
        disabled={loading}
        style={{ ...S.primaryBtn, width: "100%", justifyContent: "center", padding: "14px 20px", fontSize: 14, opacity: loading ? 0.7 : 1 }}
      >
        {loading ? <Loader2 size={18} style={spinStyle} /> : <Send size={18} />}
        {loading ? "Assigning Project..." : assignMode === "batch" ? "Assign Project to Batch" : "Assign Project to Student"}
      </button>
    </div>
  );
}