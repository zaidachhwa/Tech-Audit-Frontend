import { useState, useEffect } from "react";
import { API } from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { ClipboardList, Plus, X, ChevronDown, User, Users, Calendar, Send } from "lucide-react";

const S = {
  page: { minHeight: "100vh", background: "#F8FAFC", padding: "28px 32px" },
  card: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12, padding: "22px 24px", marginBottom: 20 },
  pageTitle: { fontSize: 20, fontWeight: 700 },
  label: { fontSize: 11, fontWeight: 600, marginBottom: 8, display: "block" },
  input: { border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "10px", width: "100%" },
  select: { border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "10px", width: "100%" },
  primaryBtn: { background: "#2563EB", color: "#fff", borderRadius: 8, padding: "10px 20px", cursor: "pointer" },
  secondaryBtn: { border: "1px solid #ccc", borderRadius: 8, padding: "8px 12px", cursor: "pointer" },
  sectionTitle: { fontWeight: 700, marginBottom: 10, display: "flex", gap: 8, alignItems: "center" },
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
  const [students, setStudents] = useState([]);
  const [parameters, setParameters] = useState([{ name: "", score: "" }]);
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");

  useEffect(() => {
    API.get("/batches/public").then((r) => setBatches(r.data || []));
    API.get("/students/list").then((r) => setStudents(r.data?.students || []));
  }, []);

  const clean = (str) => str?.replace(/\s+/g, "").toUpperCase();

  const uniqueBatchNames = [...new Set(batches.map((b) => clean(b.batch_name)))];

  const uniqueBatchNumbers = [
    ...new Set(
      batches
        .filter((b) => clean(b.batch_name) === batchName)
        .map((b) => b.batch_no)
    ),
  ];

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

    if (assignMode === "individual" && !student) {
      return toast.error("Select a student");
    }

    try {
      setLoading(true);

      await API.post("/assignments/create", {
        batchName,
        batchNumber,
        student: assignMode === "individual" ? student : null,
        parameters,
        date,
        mode: assignMode,
        comment,
      });

      toast.success("Assigned successfully");

      setBatchName("");
      setBatchNumber("");
      setStudent("");
      setDate("");
      setParameters([{ name: "", score: "" }]);
    } catch (err) {
      toast.error("Failed to assign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <Toaster />

      <h1 style={S.pageTitle}>Assign Project</h1>

      {/* Batch */}
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
            }}
          >
            <option value="">Select Batch</option>
            {uniqueBatchNames.map((name) => (
              <option key={name}>{name}</option>
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
              <option key={num}>{num}</option>
            ))}
          </SelectField>
        </div>

        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ ...S.input, marginTop: 10 }} />
      </div>

      {/* Mode */}
      <div style={S.card}>
        <div style={S.sectionTitle}>Assignment Mode</div>

        <label>
          <input type="radio" value="batch" checked={assignMode === "batch"} onChange={(e) => setAssignMode(e.target.value)} />
          Assign to Batch
        </label>

        <label style={{ marginLeft: 20 }}>
          <input type="radio" value="individual" checked={assignMode === "individual"} onChange={(e) => setAssignMode(e.target.value)} />
          Assign to Individual
        </label>
      </div>

      {/* Student ONLY for individual */}
      {assignMode === "individual" && (
        <div style={S.card}>
          <div style={S.sectionTitle}>
            <User size={16} /> Student Selection
          </div>

          <SelectField
            label="Select Student"
            value={student}
            onChange={(e) => setStudent(e.target.value)}
          >
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </SelectField>
        </div>
      )}

      {/* Parameters */}
      <div style={S.card}>
        <div style={S.sectionTitle}>
          <ClipboardList size={16} /> Assignment Parameters
        </div>

        {parameters.map((p, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
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
              style={S.input}
            />
            <button onClick={() => removeParameter(i)}>
              <X />
            </button>
          </div>
        ))}
        

        <button onClick={addParameter} style={S.secondaryBtn}>
          <Plus size={14} /> Add Parameter
        </button>
        <div className="mt-4">
  <label className="text-sm text-gray-600 mb-1 block">
    Assignment Description / Comments
  </label>

  <textarea
    value={comment}
    onChange={(e) => setComment(e.target.value)}
    placeholder="Write instructions, notes, expectations..."
    className="border rounded-lg p-3 w-full min-h-[100px]"
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