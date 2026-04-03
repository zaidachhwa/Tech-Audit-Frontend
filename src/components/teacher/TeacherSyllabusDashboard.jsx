import { useEffect, useState, useRef } from "react";
import { API } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Edit,
  RefreshCw,
  X,
  CheckCheck,
  MessageSquare,
  Filter,
  TrendingUp,
  FileText,
  ChevronDown,
  Users,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";

const S = {
  page: {
    minHeight: "100vh",
    background: "#F8FAFC",
    padding: "28px 32px",
    fontFamily: "'DM Sans', sans-serif",
  },
  card: {
    background: "#fff",
    border: "1.5px solid #E2E8F0",
    borderRadius: 12,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#1B2B4B",
    margin: 0,
  },
  pageSubtitle: {
    fontSize: 13,
    color: "#64748B",
    margin: "4px 0 0",
  },
  primaryBtn: {
    background: "#2563EB",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "9px 18px",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 7,
    fontFamily: "'DM Sans', sans-serif",
    transition: "opacity 0.15s",
  },
  secondaryBtn: {
    background: "#fff",
    color: "#1B2B4B",
    border: "1.5px solid #E2E8F0",
    borderRadius: 8,
    padding: "9px 18px",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 7,
    fontFamily: "'DM Sans', sans-serif",
  },
  label: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#64748B",
  },
  input: {
    background: "#fff",
    border: "1.5px solid #E2E8F0",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    color: "#1B2B4B",
    width: "100%",
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
    appearance: "none",
  },
};

export default function TeacherSyllabusDashboard() {
  const { user, logout } = useAuth();
  const [topics, setTopics] = useState([]);
  const [batchesWithSyllabi, setBatchesWithSyllabi] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [assignedSyllabiForBatch, setAssignedSyllabiForBatch] = useState([]);
  const [selectedBatchSyllabusId, setSelectedBatchSyllabusId] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [remarkText, setRemarkText] = useState("");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showRemark, setShowRemark] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");
  const [expandedTopic, setExpandedTopic] = useState(null);
  const latestSelectedRefs = useRef({ batchId: null, syllabusId: null });

  useEffect(() => { fetchBatchesWithSyllabi(); }, []);

  useEffect(() => {
    if (!selectedBatchId) {
      setAssignedSyllabiForBatch([]);
      setSelectedBatchSyllabusId("");
      setTopics([]);
      latestSelectedRefs.current = { batchId: null, syllabusId: null };
      return;
    }
    const batchObj = batchesWithSyllabi.find((b) => String(b._id) === String(selectedBatchId));
    const assigned = batchObj?.assignedSyllabi || [];
    setAssignedSyllabiForBatch(assigned);
    if (assigned.length === 1) {
      const only = assigned[0];
      setSelectedBatchSyllabusId(String(only._id));
      const syllabusTemplateId = typeof only.syllabus === "object" ? only.syllabus._id || only.syllabus : only.syllabus;
      latestSelectedRefs.current = { batchId: selectedBatchId, syllabusId: syllabusTemplateId };
      fetchTopicsForBatchSyllabus(selectedBatchId, syllabusTemplateId);
    } else {
      setSelectedBatchSyllabusId("");
      setTopics([]);
    }
  }, [selectedBatchId, batchesWithSyllabi]);

  useEffect(() => {
    if (!selectedBatchId || !selectedBatchSyllabusId) return;
    const batchObj = batchesWithSyllabi.find((b) => String(b._id) === String(selectedBatchId));
    const bsObj = batchObj?.assignedSyllabi?.find((bs) => String(bs._id) === String(selectedBatchSyllabusId)) || null;
    const syllabusTemplateId = bsObj
      ? typeof bsObj.syllabus === "object" ? bsObj.syllabus._id || bsObj.syllabus : bsObj.syllabus
      : selectedBatchSyllabusId;
    latestSelectedRefs.current = { batchId: selectedBatchId, syllabusId: syllabusTemplateId };
    fetchTopicsForBatchSyllabus(selectedBatchId, syllabusTemplateId);
  }, [selectedBatchSyllabusId]);

  async function fetchBatchesWithSyllabi() {
    try {
      setLoading(true);
      const res = await API.get("/syllabus/assigned-syllabi");
      const fetched = res.data?.batches || [];
      setBatchesWithSyllabi(fetched);
      const simple = fetched.map((b) => ({ _id: b._id, batch_name: b.batch_name, batch_no: b.batch_no, studentsCount: b.students?.length || 0 }));
      setBatches(simple);
      if (simple.length === 1) setSelectedBatchId(simple[0]._id);
    } catch (err) {
      toast.error("Failed to load batches");
    } finally {
      setLoading(false);
    }
  }

  async function fetchTopicsForBatchSyllabus(batchId, syllabusTemplateId) {
    if (!batchId || !syllabusTemplateId) { setTopics([]); return; }
    try {
      setLoadingTopics(true);
      const res = await API.get(`/syllabus/batch-topics-teacher?batchId=${encodeURIComponent(batchId)}&syllabusId=${encodeURIComponent(syllabusTemplateId)}`);
      setTopics(res.data?.topics || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load topics");
      setTopics([]);
    } finally {
      setLoadingTopics(false);
    }
  }

  const markComplete = async (topicId) => {
    try {
      await API.patch(`/syllabus/topic/${topicId}/complete`);
      toast.success("Topic marked as completed!");
      const { batchId, syllabusId } = latestSelectedRefs.current;
      if (batchId && syllabusId) await fetchTopicsForBatchSyllabus(batchId, syllabusId);
    } catch { toast.error("Failed to mark complete"); }
  };

  const addRemark = async () => {
    if (!selectedTopic) return;
    if (!remarkText.trim()) { toast.error("Please enter a remark"); return; }
    try {
      await API.patch(`/syllabus/topic/${selectedTopic._id}/remark`, { remark: remarkText });
      toast.success("Remark saved!");
      setShowRemark(false); setRemarkText(""); setSelectedTopic(null);
      const { batchId, syllabusId } = latestSelectedRefs.current;
      if (batchId && syllabusId) await fetchTopicsForBatchSyllabus(batchId, syllabusId);
    } catch { toast.error("Failed to save remark"); }
  };

  const getFilteredTopics = () => {
    let filtered = [...topics];
    if (filterStatus !== "all") filtered = filtered.filter((t) => t.completionStatus === filterStatus);
    filtered.sort((a, b) => {
      if (sortBy === "dueDate") {
        const da = a.dueDate ? new Date(a.dueDate) : null, db = b.dueDate ? new Date(b.dueDate) : null;
        if (!da && !db) return 0; if (!da) return 1; if (!db) return -1; return da - db;
      }
      if (sortBy === "title") return (a.title || "").localeCompare(b.title || "");
      if (sortBy === "status") { const order = { Pending: 0, "In Progress": 1, Completed: 2 }; return (order[a.completionStatus] ?? 3) - (order[b.completionStatus] ?? 3); }
      return 0;
    });
    return filtered;
  };

  const filteredTopics = getFilteredTopics();
  const stats = {
    total: topics.length,
    completed: topics.filter((t) => t.completionStatus === "Completed").length,
    inProgress: topics.filter((t) => t.completionStatus === "In Progress").length,
    pending: topics.filter((t) => t.completionStatus === "Pending").length,
  };
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const handleRefresh = () => {
    if (selectedBatchId && selectedBatchSyllabusId) {
      const batchObj = batchesWithSyllabi.find((b) => String(b._id) === String(selectedBatchId));
      const bsObj = batchObj?.assignedSyllabi?.find((bs) => String(bs._id) === String(selectedBatchSyllabusId)) || null;
      const templateId = bsObj ? (typeof bsObj.syllabus === "object" ? bsObj.syllabus._id || bsObj.syllabus : bsObj.syllabus) : selectedBatchSyllabusId;
      fetchTopicsForBatchSyllabus(selectedBatchId, templateId);
    } else { fetchBatchesWithSyllabi(); }
  };

  return (
    <div style={S.page}>
      <Toaster position="top-right" />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      {/* PAGE HEADER */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 4, height: 20, background: "#2563EB", borderRadius: 4 }} />
            <h1 style={S.pageTitle}>Teacher Dashboard</h1>
          </div>
          <p style={S.pageSubtitle}>Welcome back, <strong style={{ color: "#1B2B4B" }}>{user?.teacher?.name || user?.name}</strong></p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link to="/teacher/profile" style={{ textDecoration: "none" }}>
            <button style={S.secondaryBtn}>Profile</button>
          </Link>
          <button style={S.secondaryBtn} onClick={handleRefresh} disabled={loading || loadingTopics}>
            <RefreshCw size={14} className={loading || loadingTopics ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* BATCH SELECTORS */}
      <div style={{ ...S.card, padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ ...S.label, display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <Users size={13} color="#2563EB" /> Select Batch
            </label>
            <div style={{ position: "relative" }}>
              <select value={selectedBatchId} onChange={(e) => setSelectedBatchId(e.target.value)} style={S.input}>
                <option value="">Select a batch...</option>
                {batches.map((b) => <option key={b._id} value={b._id}>{b.batch_name} (#{b.batch_no}) — {b.studentsCount} students</option>)}
              </select>
              <ChevronDown size={15} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
            </div>
          </div>
          <div>
            <label style={{ ...S.label, display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <BookOpen size={13} color="#2563EB" /> Assigned Syllabus
            </label>
            <div style={{ position: "relative" }}>
              <select value={selectedBatchSyllabusId} onChange={(e) => setSelectedBatchSyllabusId(e.target.value)} disabled={!selectedBatchId || assignedSyllabiForBatch.length === 0} style={{ ...S.input, opacity: (!selectedBatchId || assignedSyllabiForBatch.length === 0) ? 0.5 : 1 }}>
                <option value="">{selectedBatchId ? (assignedSyllabiForBatch.length === 0 ? "No assigned syllabi" : "Select syllabus...") : "Select a batch first"}</option>
                {assignedSyllabiForBatch.map((bs) => {
                  const subject = typeof bs.syllabus === "object" ? bs.syllabus.subject || bs.syllabus._id : bs.syllabus;
                  const topicsCount = typeof bs.syllabus === "object" ? bs.syllabus.topics?.length || 0 : "";
                  return <option key={bs._id} value={bs._id}>{subject} {topicsCount ? `(${topicsCount} topics)` : ""}</option>;
                })}
              </select>
              <ChevronDown size={15} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
            </div>
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { label: "Total Topics", value: stats.total, icon: <BookOpen size={20} />, tint: "#EFF6FF", iconColor: "#2563EB" },
          { label: "Completed", value: stats.completed, icon: <CheckCircle2 size={20} />, tint: "#ECFDF5", iconColor: "#10B981" },
          { label: "In Progress", value: stats.inProgress, icon: <Clock size={20} />, tint: "#FEF3C7", iconColor: "#F59E0B" },
          { label: "Pending", value: stats.pending, icon: <AlertCircle size={20} />, tint: "#FEF2F2", iconColor: "#EF4444" },
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

      {/* PROGRESS BAR */}
      <div style={{ ...S.card, padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={20} color="#2563EB" />
            </div>
            <div>
              <p style={{ fontWeight: 700, color: "#1B2B4B", fontSize: 14, margin: 0 }}>Overall Progress</p>
              <p style={{ color: "#64748B", fontSize: 12, margin: 0 }}>{stats.completed} of {stats.total} topics completed</p>
            </div>
          </div>
          <p style={{ fontSize: 28, fontWeight: 800, color: "#2563EB", margin: 0 }}>{completionRate}%</p>
        </div>
        <div style={{ height: 8, background: "#F1F5F9", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${completionRate}%`, background: "linear-gradient(90deg,#2563EB,#60A5FA)", borderRadius: 99, transition: "width 0.5s ease" }} />
        </div>
        {completionRate === 100 && stats.total > 0 && (
          <div style={{ marginTop: 12, background: "#ECFDF5", border: "1.5px solid #A7F3D0", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, color: "#065F46", fontSize: 13, fontWeight: 600 }}>
            <CheckCircle2 size={16} /> Congratulations! All topics completed!
          </div>
        )}
      </div>

      {/* TOPICS */}
      <div style={S.card}>
        {/* Filters header */}
        <div style={{ padding: "18px 24px", borderBottom: "1.5px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, background: "#F8FAFC", borderRadius: "12px 12px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 4, height: 18, background: "#2563EB", borderRadius: 4 }} />
            <div>
              <p style={{ fontWeight: 700, color: "#1B2B4B", fontSize: 15, margin: 0 }}>My Topics</p>
              <p style={{ color: "#64748B", fontSize: 12, margin: 0 }}>{filteredTopics.length} topics found</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ position: "relative" }}>
              <Filter size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ ...S.input, paddingLeft: 28, width: "auto", fontSize: 12 }}>
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div style={{ position: "relative" }}>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ ...S.input, paddingRight: 28, width: "auto", fontSize: 12 }}>
                <option value="dueDate">Sort by Due Date</option>
                <option value="title">Sort by Title</option>
                <option value="status">Sort by Status</option>
              </select>
              <ChevronDown size={13} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
            </div>
          </div>
        </div>

        {/* Topic list */}
        <div style={{ padding: 24 }}>
          {loadingTopics ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <RefreshCw size={36} color="#2563EB" style={{ animation: "spin 1s linear infinite", marginBottom: 12 }} />
              <p style={{ color: "#64748B", fontSize: 13 }}>Loading topics...</p>
            </div>
          ) : filteredTopics.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <BookOpen size={36} color="#94A3B8" />
              </div>
              <p style={{ fontWeight: 700, color: "#1B2B4B", fontSize: 16, margin: "0 0 6px" }}>
                {filterStatus === "all" ? "No Topics Assigned" : `No ${filterStatus} Topics`}
              </p>
              <p style={{ color: "#64748B", fontSize: 13, marginBottom: 20 }}>
                {filterStatus === "all" ? "Select a batch & syllabus to view topics." : `No topics with "${filterStatus}" status.`}
              </p>
              <button style={S.primaryBtn} onClick={handleRefresh}>
                <RefreshCw size={14} /> Refresh Topics
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filteredTopics.map((topic) => (
                <TopicCard
                  key={topic._id}
                  topic={topic}
                  expanded={expandedTopic === topic._id}
                  onToggleExpand={() => setExpandedTopic(expandedTopic === topic._id ? null : topic._id)}
                  onMarkComplete={markComplete}
                  onOpenRemark={() => { setSelectedTopic(topic); setRemarkText(topic.remarks || ""); setShowRemark(true); }}
                  batches={batches}
                  selectedBatchId={selectedBatchId}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* REMARK MODAL */}
      {showRemark && selectedTopic && (
        <RemarkModal
          topic={selectedTopic}
          remarkText={remarkText}
          setRemarkText={setRemarkText}
          onClose={() => { setShowRemark(false); setRemarkText(""); setSelectedTopic(null); }}
          onSubmit={addRemark}
        />
      )}
    </div>
  );
}

function TopicCard({ topic, expanded, onToggleExpand, onMarkComplete, onOpenRemark }) {
  const statusMap = {
    Completed: { bg: "#ECFDF5", border: "#A7F3D0", badge: { bg: "#ECFDF5", color: "#065F46" }, icon: <CheckCircle2 size={16} color="#10B981" /> },
    "In Progress": { bg: "#EFF6FF", border: "#BFDBFE", badge: { bg: "#EFF6FF", color: "#1E40AF" }, icon: <Clock size={16} color="#2563EB" /> },
    Pending: { bg: "#FEF3C7", border: "#FDE68A", badge: { bg: "#FEF3C7", color: "#92400E" }, icon: <AlertCircle size={16} color="#F59E0B" /> },
  };
  const cfg = statusMap[topic.completionStatus] || statusMap.Pending;
  const dueDate = topic.dueDate ? new Date(topic.dueDate) : null;
  const isOverdue = dueDate && dueDate < new Date() && topic.completionStatus !== "Completed";

  return (
    <div style={{ background: cfg.bg, border: `1.5px solid ${cfg.border}`, borderRadius: 10, padding: "16px 18px" }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: "#fff", border: "1.5px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {cfg.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6, gap: 10 }}>
            <p style={{ fontWeight: 700, color: "#1B2B4B", fontSize: 14, margin: 0 }}>{topic.templateTopic?.title || topic.title || "Untitled"}</p>
            <span style={{ ...cfg.badge, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}>
              {topic.completionStatus}
            </span>
          </div>
          {(topic.templateTopic?.description || topic.description) && <p style={{ color: "#64748B", fontSize: 12, margin: "0 0 10px", lineHeight: 1.5 }}>{topic.templateTopic?.description || topic.description}</p>}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <Calendar size={13} color="#94A3B8" />
            <span style={{ color: "#64748B", fontSize: 12 }}>Due: {dueDate ? dueDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A"}</span>
            {isOverdue && <span style={{ background: "#FEF2F2", color: "#991B1B", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600 }}>Overdue</span>}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {topic.completionStatus !== "Completed" && (
              <button onClick={() => onMarkComplete(topic._id)} style={{ background: "#10B981", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans', sans-serif" }}>
                <CheckCheck size={13} /> Mark Complete
              </button>
            )}
            <button onClick={onOpenRemark} style={{ background: "#fff", color: "#2563EB", border: "1.5px solid #BFDBFE", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans', sans-serif" }}>
              <Edit size={13} /> {topic.remarks ? "Edit Remark" : "Add Remark"}
            </button>
            {topic.remarks && (
              <button onClick={onToggleExpand} style={{ background: "#fff", color: "#64748B", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans', sans-serif" }}>
                <MessageSquare size={13} /> {expanded ? "Hide" : "View"} Remark
              </button>
            )}
          </div>
        </div>
      </div>
      {expanded && topic.remarks && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1.5px solid rgba(0,0,0,0.06)" }}>
          <div style={{ background: "#fff", borderRadius: 8, padding: "12px 14px", border: "1.5px solid #E2E8F0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <MessageSquare size={13} color="#2563EB" />
              <span style={{ fontWeight: 600, color: "#1B2B4B", fontSize: 12 }}>Your Remark:</span>
            </div>
            <p style={{ color: "#64748B", fontSize: 13, margin: 0, lineHeight: 1.6 }}>{topic.remarks}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function RemarkModal({ topic, remarkText, setRemarkText, onClose, onSubmit }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#fff", borderRadius: 12, width: "100%", maxWidth: 560, border: "1.5px solid #E2E8F0", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ background: "#2563EB", padding: "18px 22px", borderRadius: "12px 12px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontWeight: 700, color: "#fff", fontSize: 15, margin: 0 }}>{remarkText ? "Edit Remark" : "Add Remark"}</p>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, margin: 0 }}>{topic.templateTopic?.title || topic.title || "Topic"}</p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: 22 }}>
          <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748B", display: "block", marginBottom: 8 }}>Your Remark</label>
          <textarea rows={6} value={remarkText} onChange={(e) => setRemarkText(e.target.value)} placeholder="Write your remarks here..." style={{ width: "100%", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#1B2B4B", fontFamily: "'DM Sans', sans-serif", resize: "none", outline: "none", boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button onClick={onClose} style={{ flex: 1, background: "#fff", color: "#1B2B4B", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "10px", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
            <button onClick={onSubmit} disabled={!remarkText.trim()} style={{ flex: 1, background: "#2563EB", color: "#fff", border: "none", borderRadius: 8, padding: "10px", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", opacity: !remarkText.trim() ? 0.5 : 1 }}>Save Remark</button>
          </div>
        </div>
      </div>
    </div>
  );
}