import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { BarChart3, Users, CheckCircle2, Clock, RefreshCw, AlertCircle } from "lucide-react";

const S = {
  page: { minHeight: "100vh", background: "#F8FAFC", padding: "28px 32px", fontFamily: "'DM Sans', sans-serif" },
  card: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  pageTitle: { fontSize: 20, fontWeight: 700, color: "#1B2B4B", margin: 0 },
  label: { fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748B" },
  secondaryBtn: { background: "#fff", color: "#1B2B4B", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "9px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontFamily: "'DM Sans', sans-serif" },
};

export default function TeacherStudentProgress() {
  const [batchesWithSyllabi, setBatchesWithSyllabi] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [expandedCourses, setExpandedCourses] = useState({});

  useEffect(() => { fetchBatchesWithSyllabi(); }, []);
  useEffect(() => {
    if (selectedBatchId) fetchTopicsForSelectedBatch(selectedBatchId);
    else setTopics([]);
  }, [selectedBatchId]);

  async function fetchBatchesWithSyllabi() {
    try {
      setLoading(true);
      const res = await API.get("/syllabus/assigned-syllabi");
      const fetched = res.data?.batches || [];
      setBatchesWithSyllabi(fetched);
      
      // FIX: Map distinct course names and batch numbers separately
      const simple = fetched.map((b) => ({ 
        _id: b._id, 
        courseName: b.batch_name || "Batch", 
        batchNumber: b.batch_no || "N/A", 
        studentsCount: b.students?.length || 0 
      }));
      
      setBatches(simple);
      if (simple.length === 1) setSelectedBatchId(simple[0]._id);
    } catch { toast.error("Unable to load assigned batches"); }
    finally { setLoading(false); }
  }

  async function fetchTopicsForSelectedBatch(batchId) {
    const batchObj = batchesWithSyllabi.find((b) => String(b._id) === String(batchId));
    if (!batchObj) { setTopics([]); return; }
    const firstSyllabus = (batchObj.assignedSyllabi || [])[0];
    const syllabusTemplateId = firstSyllabus ? (typeof firstSyllabus.syllabus === "object" ? firstSyllabus.syllabus._id || firstSyllabus.syllabus : firstSyllabus.syllabus) : "";
    if (!syllabusTemplateId) { setTopics([]); return; }
    try {
      setLoadingTopics(true);
      const res = await API.get(`/syllabus/batch-topics-teacher?batchId=${encodeURIComponent(batchId)}&syllabusId=${encodeURIComponent(syllabusTemplateId)}`);
      setTopics(res.data?.topics || []);
    } catch { toast.error("Unable to load student progress data"); setTopics([]); }
    finally { setLoadingTopics(false); }
  }

  const completed = topics.filter((t) => t.completionStatus === "Completed").length;
  const inProgress = topics.filter((t) => t.completionStatus === "In Progress").length;
  const pending = topics.filter((t) => t.completionStatus === "Pending").length;
  const total = topics.length;
  const rate = total ? Math.round((completed / total) * 100) : 0;
  const selectedBatch = batches.find((b) => b._id === selectedBatchId);

  // FIX: Group by the new courseName property
  const groupedBatches = batches.reduce((acc, batch) => {
    const courseName = batch.courseName;
    if (!acc[courseName]) acc[courseName] = [];
    acc[courseName].push(batch);
    return acc;
  }, {});

  const toggleCourseExpand = (courseName) => {
    setExpandedCourses((prev) => ({ ...prev, [courseName]: !prev[courseName] }));
  };

  const handleBatchSelect = (batch) => {
    setSelectedBatchId(batch._id);
  };

  return (
    <div style={S.page}>
      <Toaster position="top-right" />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 4, height: 20, background: "#2563EB", borderRadius: 4 }} />
            <h1 style={S.pageTitle}>Student Progress</h1>
          </div>
          <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>Review batch progress and topic completion for your students.</p>
        </div>
        <button style={S.secondaryBtn} onClick={() => { if (selectedBatchId) fetchTopicsForSelectedBatch(selectedBatchId); }}>
          <RefreshCw size={14} className={loadingTopics ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { label: "Assigned Batches", value: batches.length, icon: <Users size={20} />, tint: "#EFF6FF", iconColor: "#2563EB" },
          { label: "Students in Batch", value: selectedBatch?.studentsCount ?? "—", icon: <Users size={20} />, tint: "#ECFDF5", iconColor: "#10B981" },
          { label: "Completion Rate", value: `${rate}%`, icon: <BarChart3 size={20} />, tint: "#FEF3C7", iconColor: "#F59E0B" },
          { label: "Topics Completed", value: completed, icon: <CheckCircle2 size={20} />, tint: "#EFF6FF", iconColor: "#2563EB" },
        ].map((s) => (
          <div key={s.label} style={{ ...S.card, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <p style={S.label}>{s.label}</p>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: s.tint, display: "flex", alignItems: "center", justifyContent: "center", color: s.iconColor }}>{s.icon}</div>
            </div>
            <p style={{ fontSize: 28, fontWeight: 800, color: "#1B2B4B", margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>
        {/* Batch selector */}
        <div style={{ ...S.card, padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 4, height: 16, background: "#2563EB", borderRadius: 4 }} />
            <p style={{ fontWeight: 700, color: "#1B2B4B", fontSize: 14, margin: 0 }}>Batch Selection</p>
          </div>
          <p style={{ color: "#64748B", fontSize: 12, margin: "0 0 16px" }}>Choose a batch to view topic status.</p>
          
          {loading ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: "#94A3B8", fontSize: 13 }}>Loading batches…</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Object.entries(groupedBatches).map(([courseName, courseBatches]) => (
                <div key={courseName} style={{ border: "1.5px solid #E2E8F0", borderRadius: 8, overflow: "hidden" }}>
                  <button
                    onClick={() => toggleCourseExpand(courseName)}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      background: expandedCourses[courseName] ? "#EFF6FF" : "#F8FAFC",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontWeight: 600,
                      fontSize: 13,
                      color: "#1B2B4B",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#2563EB" }}>●</span>
                      {courseName}
                    </span>
                    <span style={{ transform: expandedCourses[courseName] ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>▼</span>
                  </button>

                  {expandedCourses[courseName] && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "10px" }}>
                      {courseBatches.map((batch) => {
                        const isSelected = String(batch._id) === String(selectedBatchId);
                        return (
                          <button
                            key={batch._id}
                            onClick={() => handleBatchSelect(batch)}
                            style={{
                              padding: "10px 12px",
                              background: isSelected ? "#2563EB" : "#F1F5F9",
                              color: isSelected ? "#fff" : "#1B2B4B",
                              border: isSelected ? "1.5px solid #1E40AF" : "1.5px solid #E2E8F0",
                              borderRadius: 6,
                              cursor: "pointer",
                              fontWeight: 500,
                              fontSize: 12,
                              textAlign: "left",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            {/* FIX: Show Batch Number instead of repeating Course Name */}
                            <span>Batch #{batch.batchNumber}</span>
                            <span style={{ fontSize: 11, background: isSelected ? "rgba(255,255,255,0.2)" : "#E0E7FF", color: isSelected ? "#fff" : "#2563EB", padding: "2px 6px", borderRadius: 4 }}>
                              {batch.studentsCount}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Progress panel */}
        <div style={S.card}>
          <div style={{ padding: "18px 22px", borderBottom: "1.5px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F8FAFC", borderRadius: "12px 12px 0 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 4, height: 16, background: "#2563EB", borderRadius: 4 }} />
              <p style={{ fontWeight: 700, color: "#1B2B4B", fontSize: 14, margin: 0 }}>Current Progress</p>
            </div>
            <span style={{ background: "#EFF6FF", color: "#1E40AF", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600 }}>{total} topics tracked</span>
          </div>

          <div style={{ padding: 22 }}>
            {loadingTopics ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <RefreshCw size={32} color="#2563EB" className="animate-spin" style={{ marginBottom: 10 }} />
                <p style={{ color: "#64748B", fontSize: 13 }}>Loading progress...</p>
              </div>
            ) : total === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#94A3B8", fontSize: 13 }}>Pick a batch to view topic progress.</div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
                  {[
                    { label: "Completed", val: completed, bg: "#ECFDF5", color: "#065F46", icon: <CheckCircle2 size={14} /> },
                    { label: "In Progress", val: inProgress, bg: "#EFF6FF", color: "#1E40AF", icon: <Clock size={14} /> },
                    { label: "Pending", val: pending, bg: "#FEF3C7", color: "#92400E", icon: <AlertCircle size={14} /> },
                  ].map((s) => (
                    <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: "12px 14px", border: "1.5px solid rgba(0,0,0,0.06)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, color: s.color, marginBottom: 6 }}>{s.icon}<span style={{ fontSize: 11, fontWeight: 600 }}>{s.label}</span></div>
                      <p style={{ fontSize: 24, fontWeight: 800, color: "#1B2B4B", margin: 0 }}>{s.val}</p>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#64748B" }}>Overall Completion</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#2563EB" }}>{rate}%</span>
                  </div>
                  <div style={{ height: 8, background: "#F1F5F9", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${rate}%`, background: "linear-gradient(90deg,#2563EB,#60A5FA)", borderRadius: 99, transition: "width 0.5s" }} />
                  </div>
                </div>

                <div style={{ overflowX: "auto", borderRadius: 8, border: "1.5px solid #E2E8F0" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#F8FAFC" }}>
                        {["Topic", "Status", "Due Date", "Batch"].map((h) => (
                          <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "#64748B", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {topics.map((topic, i) => {
                        const statusBadge = {
                          Completed: { bg: "#ECFDF5", color: "#065F46" },
                          "In Progress": { bg: "#EFF6FF", color: "#1E40AF" },
                          Pending: { bg: "#FEF3C7", color: "#92400E" },
                        }[topic.completionStatus] || { bg: "#F1F5F9", color: "#64748B" };
                        return (
                          <tr key={topic._id} style={{ background: i % 2 === 0 ? "#fff" : "#F8FAFC", borderTop: "1px solid #F1F5F9" }}>
                            <td style={{ padding: "11px 14px", fontWeight: 500, color: "#1B2B4B" }}>{topic.title || topic.name}</td>
                            <td style={{ padding: "11px 14px" }}>
                              <span style={{ ...statusBadge, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600 }}>{topic.completionStatus || "Unknown"}</span>
                            </td>
                            <td style={{ padding: "11px 14px", color: "#64748B" }}>{topic.dueDate ? new Date(topic.dueDate).toLocaleDateString() : "—"}</td>
                            <td style={{ padding: "11px 14px", color: "#64748B" }}>Batch #{selectedBatch?.batchNumber ?? "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}