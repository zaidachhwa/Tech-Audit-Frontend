import { useState, useEffect } from "react";
import { API } from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { ClipboardList, Plus, X, User, Users, Send, Loader2, CheckCircle, Clock } from "lucide-react";

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
  const [batchStudents, setBatchStudents] = useState([]);
  const [batchStudentsLoading, setBatchStudentsLoading] = useState(false);
  const [parameters, setParameters] = useState([{ name: "", score: "" }]);
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");

  useEffect(() => {
    API.get("/batches/public").then((r) => setBatches(r.data || []));
    API.get("/students/list").then((r) => setStudents(r.data?.students || []));
  }, []);

  const clean = (str) => str?.replace(/\s+/g, "").toUpperCase();

  const uniqueBatchNames = [...new Set(batches.map((b) => clean(b.batch_name)))];

  const filteredBatches = batches.filter((b) => clean(b.batch_name) === batchName);
  const uniqueBatchNumbers = [...new Set(filteredBatches.map((b) => b.batch_no))];

  // When both batch name + number are selected, fetch the enrolled students
  useEffect(() => {
    if (!batchName || !batchNumber) {
      setBatchStudents([]);
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

    if (assignMode === "individual" && !student) {
      return toast.error("Select a student");
    }

    try {
      setLoading(true);

      await API.post("/assignment/create", {
        batchName,
        batchNumber,
        student: assignMode === "individual" ? student : "assign to batch",
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

      console.log(err.response);
      toast.error(err.response?.data?.message || "Assignment failed");
    } finally {

      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <Toaster />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

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
              setBatchStudents([]);
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

        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ ...S.input, marginTop: 10 }} />
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