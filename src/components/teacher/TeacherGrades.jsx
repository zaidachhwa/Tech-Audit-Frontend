import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { TrendingUp, Users, Award, ChevronDown, Save, RefreshCw, Star, Search } from "lucide-react";

const S = {
  page: { fontFamily: "'DM Sans', sans-serif" },
  card: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  pageTitle: { fontSize: 20, fontWeight: 700, color: "#1B2B4B", margin: 0 },
  label: { fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748B" },
  select: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#1B2B4B", width: "100%", outline: "none", fontFamily: "'DM Sans', sans-serif", appearance: "none" },
  primaryBtn: { background: "#2563EB", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontFamily: "'DM Sans', sans-serif" },
  input: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 6, padding: "7px 10px", fontSize: 13, color: "#1B2B4B", width: "100%", outline: "none", fontFamily: "'DM Sans', sans-serif", textAlign: "center", boxSizing: "border-box" },
};

function getGrade(score, max) {
  if (!score || !max) return { grade: "—", color: "#94A3B8", bg: "#F1F5F9" };
  const pct = (score / max) * 100;
  if (pct >= 90) return { grade: "A+", color: "#065F46", bg: "#ECFDF5" };
  if (pct >= 80) return { grade: "A", color: "#065F46", bg: "#ECFDF5" };
  if (pct >= 70) return { grade: "B", color: "#1E40AF", bg: "#EFF6FF" };
  if (pct >= 60) return { grade: "C", color: "#92400E", bg: "#FEF3C7" };
  if (pct >= 50) return { grade: "D", color: "#92400E", bg: "#FEF3C7" };
  return { grade: "F", color: "#991B1B", bg: "#FEF2F2" };
}

export default function TeacherGrades() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState(["Assignment 1", "Assignment 2", "Final Project"]);
  const [newAssignment, setNewAssignment] = useState("");
  const [maxScore, setMaxScore] = useState({ "Assignment 1": 100, "Assignment 2": 100, "Final Project": 100 });
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    API.get("/batches/public").then((r) => setBatches(r.data || [])).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedBatch) { setStudents([]); setGrades({}); return; }
    setLoading(true);

    Promise.all([
      API.get(`/students/list?batchId=${encodeURIComponent(selectedBatch)}`),
      API.get(`/grades?batchId=${encodeURIComponent(selectedBatch)}`)
    ])
      .then(([studentsRes, gradesRes]) => {
        const allStudents = studentsRes.data?.students || [];
        setStudents(allStudents);

        const savedGrades = gradesRes.data?.grades || [];
        const savedMap = {};
        const allAssignmentNames = new Set(["Assignment 1", "Assignment 2", "Final Project"]);
        const maxScoreMap = { "Assignment 1": 100, "Assignment 2": 100, "Final Project": 100 };

        savedGrades.forEach((g) => {
          const sId = g.student?._id || g.student;
          if (sId) {
            savedMap[sId] = {};
            (g.grades || []).forEach((entry) => {
              if (entry.assignment) {
                allAssignmentNames.add(entry.assignment);
                savedMap[sId][entry.assignment] = entry.score !== null && entry.score !== undefined ? entry.score : "";
                if (entry.maxScore) maxScoreMap[entry.assignment] = entry.maxScore;
              }
            });
          }
        });

        const assignmentList = Array.from(allAssignmentNames);
        setAssignments(assignmentList);
        setMaxScore(maxScoreMap);

        const initGrades = {};
        allStudents.forEach((s) => {
          initGrades[s._id] = {};
          assignmentList.forEach((a) => {
            initGrades[s._id][a] = savedMap[s._id]?.[a] !== undefined ? savedMap[s._id][a] : "";
          });
        });

        setGrades(initGrades);
      })
      .catch((err) => {
        console.error("Grades fetch error:", err);
        toast.error("Failed to load grades data");
      })
      .finally(() => setLoading(false));
  }, [selectedBatch]);

  const updateGrade = (studentId, assignment, value) => {
    setGrades((prev) => ({ ...prev, [studentId]: { ...prev[studentId], [assignment]: value } }));
  };

  const addAssignment = () => {
    if (!newAssignment.trim()) return;
    setAssignments((prev) => [...prev, newAssignment.trim()]);
    setMaxScore((prev) => ({ ...prev, [newAssignment.trim()]: 100 }));
    setGrades((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((id) => { updated[id] = { ...updated[id], [newAssignment.trim()]: "" }; });
      return updated;
    });
    setNewAssignment("");
  };

  const handleSave = async () => {
    if (!selectedBatch) return;
    try {
      setSaving(true);
      const gradesData = students.map((s) => {
        const studentGrades = grades[s._id] || {};
        const gradeEntries = assignments
          .filter((a) => studentGrades[a] !== undefined && studentGrades[a] !== "")
          .map((a) => ({
            assignment: a,
            score: parseFloat(studentGrades[a]),
            maxScore: maxScore[a] || 100,
          }));
        return { student: s._id, grades: gradeEntries };
      });

      await API.post("/grades/save", { batchId: selectedBatch, gradesData });
      toast.success("Grades saved successfully!");
    } catch (err) {
      console.error("Grade save error:", err);
      toast.error(err.response?.data?.message || "Failed to save grades");
    } finally {
      setSaving(false);
    }
  };

  const avgScore = (studentId) => {
    if (!grades[studentId]) return null;
    const vals = assignments.map((a) => parseFloat(grades[studentId]?.[a])).filter((v) => !isNaN(v));
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null;
  };

  const classAvg = (assignment) => {
    const vals = students.map((s) => parseFloat(grades[s._id]?.[assignment])).filter((v) => !isNaN(v));
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : "—";
  };

  const filteredStudents = students.filter(s => (s.name || "").toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div style={S.page}>
      <Toaster position="top-right" />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 4, height: 20, background: "#2563EB", borderRadius: 4 }} />
            <h1 style={S.pageTitle}>Grades & Marks</h1>
          </div>
          <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>Manage assignment scores and generate grade reports.</p>
        </div>
        {students.length > 0 && (
          <button style={S.primaryBtn} onClick={handleSave} disabled={saving}>
            <Save size={14} /> {saving ? "Saving..." : "Save Grades"}
          </button>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {[
          { label: "Total Students", value: students.length, tint: "#EFF6FF", iconColor: "#2563EB", icon: <Users size={18} /> },
          { label: "Assignments", value: assignments.length, tint: "#ECFDF5", iconColor: "#10B981", icon: <Award size={18} /> },
          { label: "Graded Entries", value: Object.values(grades).reduce((sum, g) => sum + Object.values(g).filter((v) => v !== "").length, 0), tint: "#FEF3C7", iconColor: "#F59E0B", icon: <Star size={18} /> },
        ].map((s) => (
          <div key={s.label} style={{ ...S.card, padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <p style={S.label}>{s.label}</p>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: s.tint, display: "flex", alignItems: "center", justifyContent: "center", color: s.iconColor }}>{s.icon}</div>
            </div>
            <p style={{ fontSize: 26, fontWeight: 800, color: "#1B2B4B", margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ ...S.card, padding: "20px 24px", marginBottom: 20 }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label style={{ ...S.label, display: "block", marginBottom: 8 }}>Select Batch</label>
            <div style={{ position: "relative" }}>
              <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} style={S.select}>
                <option value="">Select a batch...</option>
                {batches.map((b) => <option key={b._id} value={b._id}>{b.batch_name} (#{b.batch_no})</option>)}
              </select>
              <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
            </div>
          </div>
          <div>
            <label style={{ ...S.label, display: "block", marginBottom: 8 }}>Add Assignment</label>
            <input value={newAssignment} onChange={(e) => setNewAssignment(e.target.value)} placeholder="e.g. Quiz 1, Mid-term..." style={{ ...S.input, textAlign: "left", padding: "10px 14px" }} onKeyDown={(e) => e.key === "Enter" && addAssignment()} />
          </div>
          <button style={S.primaryBtn} onClick={addAssignment} disabled={!newAssignment.trim()}>+ Add</button>
        </div>
      </div>

      {/* Grades Table */}
      <div style={S.card}>
        <div style={{ padding: "14px 22px", borderBottom: "1.5px solid #F1F5F9", background: "#F8FAFC", borderRadius: "12px 12px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 4, height: 16, background: "#2563EB", borderRadius: 4 }} />
            <p style={{ fontWeight: 700, color: "#1B2B4B", fontSize: 14, margin: 0 }}>Grade Sheet</p>
          </div>
          {students.length > 0 && (
            <div style={{ position: "relative", width: 260 }}>
              <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
              <input
                type="text"
                placeholder="Search student by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ ...S.input, width: "100%", textAlign: "left", padding: "8px 12px 8px 34px", border: "1px solid #E2E8F0" }}
              />
            </div>
          )}
        </div>
        <div style={{ overflowX: "auto", padding: 0 }}>
          {!selectedBatch ? (
            <div style={{ textAlign: "center", padding: "50px 0", color: "#94A3B8", fontSize: 13 }}>Select a batch to view and enter grades.</div>
          ) : loading ? (
            <div style={{ textAlign: "center", padding: "50px 0" }}>
              <RefreshCw size={28} color="#2563EB" style={{ animation: "spin 1s linear infinite", marginBottom: 8 }} />
              <p style={{ color: "#64748B", fontSize: 13 }}>Loading students...</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F8FAFC" }}>
                  <th style={{ padding: "10px 18px", textAlign: "left", fontWeight: 600, color: "#64748B", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>Student</th>
                  {assignments.map((a) => (
                    <th key={a} style={{ padding: "10px 12px", textAlign: "center", fontWeight: 600, color: "#64748B", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", minWidth: 110 }}>
                      {a}
                      <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 500 }}>Avg: {classAvg(a)}</div>
                    </th>
                  ))}
                  <th style={{ padding: "10px 12px", textAlign: "center", fontWeight: 600, color: "#64748B", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", minWidth: 80 }}>Grade</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 && students.length > 0 ? (
                  <tr>
                    <td colSpan={assignments.length + 2} style={{ textAlign: "center", padding: "40px", color: "#64748B", fontSize: 13 }}>
                      No students found matching "{searchQuery}"
                    </td>
                  </tr>
                ) : (
                filteredStudents.map((s, i) => {
                  const avg = avgScore(s._id);
                  const gd = getGrade(avg, 100);
                  return (
                    <tr key={s._id} style={{ background: i % 2 === 0 ? "#fff" : "#F8FAFC", borderTop: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "10px 18px", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#2563EB" }}>{(s.name || "?")[0]}</div>
                          <button 
                            onClick={() => navigate(`/teacher/student-profile/${s._id}`)}
                            style={{ fontWeight: 700, color: "#2563EB", border: "none", background: "none", padding: 0, cursor: "pointer", fontSize: 13 }}
                            className="hover:underline"
                          >
                            {s.name}
                          </button>
                        </div>
                      </td>
                      {assignments.map((a) => (
                        <td key={a} style={{ padding: "8px 10px" }}>
                          <input
                            type="number"
                            min={0}
                            max={maxScore[a] || 100}
                            value={grades[s._id]?.[a] || ""}
                            onChange={(e) => updateGrade(s._id, a, e.target.value)}
                            placeholder="—"
                            style={S.input}
                          />
                        </td>
                      ))}
                      <td style={{ padding: "10px 12px", textAlign: "center" }}>
                        <span style={{ background: gd.bg, color: gd.color, borderRadius: 20, padding: "3px 14px", fontSize: 12, fontWeight: 700 }}>{avg ? `${gd.grade} (${avg})` : "—"}</span>
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}