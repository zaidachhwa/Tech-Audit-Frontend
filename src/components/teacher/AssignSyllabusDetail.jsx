import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import {
  ArrowLeft, BookOpen, CheckCircle2, Clock, AlertCircle,
  CheckCheck, MessageSquare, Edit, RefreshCw, ChevronDown,
  Users, TrendingUp, X, Calendar, Plus, Trash2
} from "lucide-react";

const S = {
  page: { minHeight: "100vh", background: "#F8FAFC", padding: "28px 32px", fontFamily: "'DM Sans', sans-serif" },
  card: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  label: { fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748B" },
  input: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#1B2B4B", width: "100%", outline: "none", fontFamily: "'DM Sans', sans-serif", appearance: "none" },
  btn: { background: "#2563EB", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontFamily: "'DM Sans', sans-serif" },
};

export default function AssignSyllabusDetail() {
  const { batchId } = useParams();
  const navigate = useNavigate();

  const [batch, setBatch] = useState(null);
  const [assignedSyllabi, setAssignedSyllabi] = useState([]);
  const [selectedSyllabusId, setSelectedSyllabusId] = useState("");
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [showRemark, setShowRemark] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [remarkText, setRemarkText] = useState("");
  const [expandedTopic, setExpandedTopic] = useState(null);
  const latestRef = useRef({ batchId: null, syllabusId: null });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [syllabusForm, setSyllabusForm] = useState({ subject: "", description: "", dueDate: "" });
  const [topicForm, setTopicForm] = useState({ title: "", description: "", dueDate: "" });

  // Fetch batch info + syllabi
  const fetchBatchData = () => {
    setLoading(true);
    Promise.all([
      API.get(`/batches/${batchId}/students`),
      API.get("/syllabus/assigned-syllabi"),
    ])
      .then(([batchRes, syllabusRes]) => {
        setBatch(batchRes.data);
        const allBatches = syllabusRes.data?.batches || [];
        const thisBatch = allBatches.find((b) => String(b._id) === String(batchId));
        // Safely filter out any orphaned BatchSyllabus that reference a deleted Syllabus
        const syllabi = (thisBatch?.assignedSyllabi || []).filter(bs => bs.syllabus != null);
        setAssignedSyllabi(syllabi);
        if (syllabi.length === 1) {
          setSelectedSyllabusId(String(syllabi[0]._id));
        } else if (syllabi.length === 0) {
          setSelectedSyllabusId("");
        }
      })
      .catch(() => toast.error("Failed to load batch data"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBatchData();
  }, [batchId]);

  // Fetch topics when syllabus changes
  useEffect(() => {
    if (!selectedSyllabusId) { setTopics([]); return; }
    const bsObj = assignedSyllabi.find((bs) => String(bs._id) === String(selectedSyllabusId));
    const templateId = bsObj?.syllabus?._id || bsObj?.syllabus || selectedSyllabusId;
    latestRef.current = { batchId, syllabusId: templateId };
    setLoadingTopics(true);
    API.get(`/syllabus/batch-topics-teacher?batchId=${batchId}&syllabusId=${templateId}`)
      .then((r) => setTopics(r.data?.topics || []))
      .catch(() => toast.error("Failed to load topics"))
      .finally(() => setLoadingTopics(false));
  }, [selectedSyllabusId]);

  const refreshTopics = async () => {
    const { batchId: bid, syllabusId: sid } = latestRef.current;
    if (!bid || !sid) return;
    setLoadingTopics(true);
    try {
      const r = await API.get(`/syllabus/batch-topics-teacher?batchId=${bid}&syllabusId=${sid}`);
      setTopics(r.data?.topics || []);
    } catch { toast.error("Failed to refresh"); }
    finally { setLoadingTopics(false); }
  };

  const markComplete = async (topicId) => {
    try {
      await API.patch(`/syllabus/topic/${topicId}/complete`);
      toast.success("Topic marked complete!");
      await refreshTopics();
    } catch { toast.error("Failed to mark complete"); }
  };

  const addRemark = async () => {
    if (!selectedTopic || !remarkText.trim()) { toast.error("Enter a remark"); return; }
    try {
      await API.patch(`/syllabus/topic/${selectedTopic._id}/remark`, { remark: remarkText });
      toast.success("Remark saved!");
      setShowRemark(false); setRemarkText(""); setSelectedTopic(null);
      await refreshTopics();
    } catch { toast.error("Failed to save remark"); }
  };

  const handleCreateSyllabus = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/syllabus/create", syllabusForm);
      const newSyllabusId = res.data.syllabus._id;
      
      await API.post("/syllabus/assign-to-batch", {
        syllabusId: newSyllabusId,
        batchId: batchId,
        dueDate: syllabusForm.dueDate
      });
      
      toast.success("Syllabus created and assigned automatically!");
      setShowCreateModal(false);
      setSyllabusForm({ subject: "", description: "", dueDate: "" });
      fetchBatchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create syllabus");
    }
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    const bsObj = assignedSyllabi.find((bs) => String(bs._id) === String(selectedSyllabusId));
    const templateId = bsObj?.syllabus?._id || bsObj?.syllabus || selectedSyllabusId;
      
    if (!templateId) return;
    try {
      await API.post("/syllabus/topic", { ...topicForm, syllabusId: templateId });
      toast.success("Topic added successfully!");
      setTopicForm({ title: "", description: "", dueDate: "" });
      setShowTopicModal(false);
      refreshTopics();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add topic");
    }
  };

  const handleDeleteSyllabus = async () => {
    const bsObj = assignedSyllabi.find((bs) => String(bs._id) === String(selectedSyllabusId));
    const templateId = bsObj?.syllabus?._id || bsObj?.syllabus || null;
    if (!templateId) return;
    if (!window.confirm("Delete this syllabus? This cannot be undone.")) return;
    try {
      await API.delete(`/syllabus/template/${templateId}`);
      toast.success("Syllabus deleted!");
      setSelectedSyllabusId("");
      fetchBatchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete syllabus");
    }
  };

  const stats = {
    total: topics.length,
    completed: topics.filter((t) => t.completionStatus === "Completed").length,
    inProgress: topics.filter((t) => t.completionStatus === "In Progress").length,
    pending: topics.filter((t) => t.completionStatus === "Pending").length,
  };
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const batchName = batch?.batch_name || "—";
  const batchNo = batch?.batch_no || "—";
  const studentCount = batch?.students?.length ?? 0;

  if (loading) {
    return (
      <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center", color: "#64748B" }}>
          <RefreshCw size={36} color="#2563EB" style={{ animation: "spin 1s linear infinite", marginBottom: 12 }} />
          <p style={{ fontSize: 13 }}>Loading syllabus data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <Toaster position="top-right" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => navigate("/teacher/assign-syllabus")}
            style={{ background: "#F1F5F9", border: "none", borderRadius: 8, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <ArrowLeft size={18} color="#1B2B4B" />
          </button>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <div style={{ width: 4, height: 20, background: "#2563EB", borderRadius: 4 }} />
              <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1B2B4B", margin: 0 }}>
                {batchName} — Batch #{batchNo}
              </h1>
            </div>
            <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>
              Manage syllabus topics · {studentCount} student{studentCount !== 1 ? "s" : ""} enrolled
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button style={{ ...S.btn, background: "#10B981" }} onClick={() => setShowCreateModal(true)}>
            <Plus size={14} />
            Create Syllabus
          </button>
          <button style={S.btn} onClick={refreshTopics} disabled={loadingTopics}>
            <RefreshCw size={14} style={loadingTopics ? { animation: "spin 1s linear infinite" } : {}} />
            Refresh
          </button>
        </div>
      </div>

      {/* Batch Info + Syllabus Selector */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {/* Batch card */}
        <div style={{ ...S.card, padding: "18px 22px", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 50, height: 50, borderRadius: 12, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Users size={24} color="#2563EB" />
          </div>
          <div>
            <p style={{ ...S.label, marginBottom: 4 }}>Enrolled Students</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: "#1B2B4B", margin: 0 }}>{studentCount}</p>
          </div>
        </div>

        {/* Syllabus selector */}
        <div style={{ ...S.card, padding: "18px 22px" }}>
          <label style={{ ...S.label, display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <BookOpen size={12} color="#2563EB" /> Assigned Syllabus
          </label>
          {assignedSyllabi.length === 0 ? (
            <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>No syllabus assigned to this batch yet.</p>
          ) : (
            <div style={{ position: "relative" }}>
              <select
                value={selectedSyllabusId}
                onChange={(e) => setSelectedSyllabusId(e.target.value)}
                style={S.input}
              >
                <option value="">Select a syllabus...</option>
                {assignedSyllabi.map((bs) => {
                  const subject = bs.syllabus?.subject || "Default Syllabus";
                  const count = bs.syllabus?.topics?.length || 0;
                  return (
                    <option key={bs._id} value={bs._id}>
                      {subject} {count ? `(${count} topics)` : ""}
                    </option>
                  );
                })}
              </select>
              <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
            </div>
          )}
        </div>
      </div>

      {/* Stat cards */}
      {topics.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
          {[
            { label: "Total Topics", value: stats.total, icon: <BookOpen size={18} />, tint: "#EFF6FF", color: "#2563EB" },
            { label: "Completed", value: stats.completed, icon: <CheckCircle2 size={18} />, tint: "#ECFDF5", color: "#10B981" },
            { label: "In Progress", value: stats.inProgress, icon: <Clock size={18} />, tint: "#FEF3C7", color: "#F59E0B" },
            { label: "Pending", value: stats.pending, icon: <AlertCircle size={18} />, tint: "#FEF2F2", color: "#EF4444" },
          ].map((s) => (
            <div key={s.label} style={{ ...S.card, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <p style={S.label}>{s.label}</p>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: s.tint, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>
                  {s.icon}
                </div>
              </div>
              <p style={{ fontSize: 26, fontWeight: 800, color: "#1B2B4B", margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Progress bar */}
      {topics.length > 0 && (
        <div style={{ ...S.card, padding: "18px 22px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp size={16} color="#2563EB" />
              <p style={{ fontWeight: 700, color: "#1B2B4B", fontSize: 14, margin: 0 }}>Overall Progress</p>
              <p style={{ color: "#64748B", fontSize: 12, margin: 0 }}>— {stats.completed} of {stats.total} completed</p>
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, color: "#2563EB", margin: 0 }}>{completionRate}%</p>
          </div>
          <div style={{ height: 8, background: "#F1F5F9", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${completionRate}%`, background: "linear-gradient(90deg,#2563EB,#60A5FA)", borderRadius: 99, transition: "width 0.5s ease" }} />
          </div>
        </div>
      )}

      {/* Topics list */}
      <div style={S.card}>
        <div style={{ padding: "16px 22px", borderBottom: "1.5px solid #F1F5F9", display: "flex", alignItems: "center", gap: 8, background: "#F8FAFC", borderRadius: "12px 12px 0 0" }}>
          <div style={{ width: 4, height: 18, background: "#2563EB", borderRadius: 4 }} />
          <p style={{ fontWeight: 700, color: "#1B2B4B", fontSize: 15, margin: 0 }}>
            {selectedSyllabusId ? "Topics" : "Select a syllabus to view topics"}
          </p>
          <div style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
            {topics.length > 0 && (
              <span style={{ background: "#EFF6FF", color: "#2563EB", borderRadius: 20, padding: "2px 12px", fontSize: 12, fontWeight: 700 }}>
                {topics.length} topics
              </span>
            )}
            {selectedSyllabusId && (
              <>
                <button 
                  onClick={() => setShowTopicModal(true)} 
                  style={{ background: "#2563EB", color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
                >
                  <Plus size={14} /> Add Topic
                </button>
                <button 
                  onClick={handleDeleteSyllabus} 
                  style={{ background: "#FEF2F2", color: "#EF4444", border: "1.5px solid #FECACA", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
                >
                  <Trash2 size={13} /> Delete Syllabus
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ padding: 20 }}>
          {loadingTopics ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <RefreshCw size={30} color="#2563EB" style={{ animation: "spin 1s linear infinite", marginBottom: 10 }} />
              <p style={{ color: "#64748B", fontSize: 13 }}>Loading topics...</p>
            </div>
          ) : !selectedSyllabusId ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#94A3B8", fontSize: 13 }}>
              <BookOpen size={36} style={{ margin: "0 auto 12px", opacity: 0.4, display: "block" }} />
              <p>Select a syllabus above to view and manage topics.</p>
            </div>
          ) : topics.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#94A3B8", fontSize: 13 }}>
              <BookOpen size={36} style={{ margin: "0 auto 12px", opacity: 0.4, display: "block" }} />
              <p>No topics found for the selected syllabus.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {topics.map((topic) => (
                <TopicCard
                  key={topic._id}
                  topic={topic}
                  expanded={expandedTopic === topic._id}
                  onToggleExpand={() => setExpandedTopic(expandedTopic === topic._id ? null : topic._id)}
                  onMarkComplete={() => markComplete(topic._id)}
                  onOpenRemark={() => { setSelectedTopic(topic); setRemarkText(topic.remarks || ""); setShowRemark(true); }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Remark modal */}
      {showRemark && selectedTopic && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#fff", borderRadius: 12, width: "100%", maxWidth: 520, border: "1.5px solid #E2E8F0", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", fontFamily: "'DM Sans', sans-serif" }}>
            <div style={{ background: "#2563EB", padding: "16px 20px", borderRadius: "12px 12px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontWeight: 700, color: "#fff", fontSize: 15, margin: 0 }}>{remarkText ? "Edit Remark" : "Add Remark"}</p>
                <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, margin: 0 }}>{selectedTopic.title}</p>
              </div>
              <button onClick={() => { setShowRemark(false); setSelectedTopic(null); }} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <X size={15} />
              </button>
            </div>
            <div style={{ padding: 20 }}>
              <textarea
                rows={5}
                value={remarkText}
                onChange={(e) => setRemarkText(e.target.value)}
                placeholder="Write your remarks here..."
                style={{ width: "100%", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#1B2B4B", fontFamily: "'DM Sans', sans-serif", resize: "none", outline: "none", boxSizing: "border-box" }}
              />
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <button onClick={() => { setShowRemark(false); setSelectedTopic(null); }} style={{ flex: 1, background: "#fff", color: "#1B2B4B", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "10px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Cancel</button>
                <button onClick={addRemark} disabled={!remarkText.trim()} style={{ flex: 1, background: "#2563EB", color: "#fff", border: "none", borderRadius: 8, padding: "10px", fontWeight: 600, fontSize: 13, cursor: "pointer", opacity: !remarkText.trim() ? 0.5 : 1 }}>Save Remark</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Syllabus Modal */}
      {showCreateModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyItems: "center", padding: 16, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)", overflowY: "auto" }}>
          <div style={{ background: "#fff", borderRadius: 12, width: "100%", maxWidth: 600, margin: "auto", border: "1.5px solid #E2E8F0", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", fontFamily: "'DM Sans', sans-serif" }}>
            <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1.5px solid #E2E8F0" }}>
              <h2 style={{ fontWeight: 700, color: "#1B2B4B", fontSize: 18, margin: 0 }}>Create Syllabus</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748B" }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: 20 }}>
              <form onSubmit={handleCreateSyllabus} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ ...S.label, display: "block", marginBottom: 6 }}>Subject</label>
                  <input required type="text" placeholder="e.g. Master React" value={syllabusForm.subject} onChange={e => setSyllabusForm({...syllabusForm, subject: e.target.value})} style={S.input} />
                </div>
                <div>
                  <label style={{ ...S.label, display: "block", marginBottom: 6 }}>Description</label>
                  <textarea rows={3} placeholder="Syllabus overview..." value={syllabusForm.description} onChange={e => setSyllabusForm({...syllabusForm, description: e.target.value})} style={{ ...S.input, resize: "vertical" }} />
                </div>
                <div>
                  <label style={{ ...S.label, display: "block", marginBottom: 6 }}>Overall Due Date</label>
                  <input required type="date" value={syllabusForm.dueDate} onChange={e => setSyllabusForm({...syllabusForm, dueDate: e.target.value})} style={S.input} />
                </div>
                <button type="submit" style={{ ...S.btn, alignSelf: "flex-end" }}>Create & Assign to Batch</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Topic Modal */}
      {showTopicModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyItems: "center", padding: 16, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)", overflowY: "auto" }}>
          <div style={{ background: "#fff", borderRadius: 12, width: "100%", maxWidth: 600, margin: "auto", border: "1.5px solid #E2E8F0", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", fontFamily: "'DM Sans', sans-serif" }}>
            <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1.5px solid #E2E8F0" }}>
              <h2 style={{ fontWeight: 700, color: "#1B2B4B", fontSize: 18, margin: 0 }}>Add Topic</h2>
              <button onClick={() => setShowTopicModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748B" }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: 20 }}>
              <form onSubmit={handleAddTopic} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ ...S.label, display: "block", marginBottom: 4 }}>Topic Title</label>
                  <input required type="text" value={topicForm.title} onChange={e => setTopicForm({...topicForm, title: e.target.value})} style={S.input} />
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ ...S.label, display: "block", marginBottom: 4 }}>Description</label>
                    <input type="text" value={topicForm.description} onChange={e => setTopicForm({...topicForm, description: e.target.value})} style={S.input} />
                  </div>
                  <div style={{ width: 140 }}>
                    <label style={{ ...S.label, display: "block", marginBottom: 4 }}>Due Date</label>
                    <input type="date" value={topicForm.dueDate} onChange={e => setTopicForm({...topicForm, dueDate: e.target.value})} style={S.input} />
                  </div>
                </div>
                <button type="submit" style={{ ...S.btn, alignSelf: "flex-end" }}><Plus size={14} /> Add Topic</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TopicCard({ topic, expanded, onToggleExpand, onMarkComplete, onOpenRemark }) {
  const statusMap = {
    Completed: { bg: "#ECFDF5", border: "#A7F3D0", badge: { bg: "#ECFDF5", color: "#065F46" }, icon: <CheckCircle2 size={15} color="#10B981" /> },
    "In Progress": { bg: "#EFF6FF", border: "#BFDBFE", badge: { bg: "#EFF6FF", color: "#1E40AF" }, icon: <Clock size={15} color="#2563EB" /> },
    Pending: { bg: "#FEF3C7", border: "#FDE68A", badge: { bg: "#FEF3C7", color: "#92400E" }, icon: <AlertCircle size={15} color="#F59E0B" /> },
  };
  const cfg = statusMap[topic.completionStatus] || statusMap.Pending;
  const dueDate = topic.dueDate ? new Date(topic.dueDate) : null;
  const isOverdue = dueDate && dueDate < new Date() && topic.completionStatus !== "Completed";

  return (
    <div style={{ background: cfg.bg, border: `1.5px solid ${cfg.border}`, borderRadius: 10, padding: "14px 16px", animation: "fadeIn 0.2s ease-out" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: "#fff", border: "1.5px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {cfg.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
            <p style={{ fontWeight: 700, color: "#1B2B4B", fontSize: 14, margin: 0 }}>{topic.title}</p>
            <span style={{ ...cfg.badge, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}>
              {topic.completionStatus}
            </span>
          </div>
          {topic.description && <p style={{ color: "#64748B", fontSize: 12, margin: "0 0 8px", lineHeight: 1.5 }}>{topic.description}</p>}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <Calendar size={12} color="#94A3B8" />
            <span style={{ color: "#64748B", fontSize: 12 }}>
              Due: {dueDate ? dueDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A"}
            </span>
            {isOverdue && <span style={{ background: "#FEF2F2", color: "#991B1B", borderRadius: 20, padding: "1px 8px", fontSize: 10, fontWeight: 600 }}>Overdue</span>}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {topic.completionStatus !== "Completed" && (
              <button onClick={onMarkComplete} style={{ background: "#10B981", color: "#fff", border: "none", borderRadius: 7, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: "'DM Sans', sans-serif" }}>
                <CheckCheck size={12} /> Mark Complete
              </button>
            )}
            <button onClick={onOpenRemark} style={{ background: "#fff", color: "#2563EB", border: "1.5px solid #BFDBFE", borderRadius: 7, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: "'DM Sans', sans-serif" }}>
              <Edit size={12} /> {topic.remarks ? "Edit Remark" : "Add Remark"}
            </button>
            {topic.remarks && (
              <button onClick={onToggleExpand} style={{ background: "#fff", color: "#64748B", border: "1.5px solid #E2E8F0", borderRadius: 7, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: "'DM Sans', sans-serif" }}>
                <MessageSquare size={12} /> {expanded ? "Hide" : "View"} Remark
              </button>
            )}
          </div>
          {expanded && topic.remarks && (
            <div style={{ marginTop: 12, padding: "10px 14px", background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                <MessageSquare size={12} color="#2563EB" />
                <span style={{ fontWeight: 600, color: "#1B2B4B", fontSize: 12 }}>Remark:</span>
              </div>
              <p style={{ color: "#64748B", fontSize: 12, margin: 0, lineHeight: 1.6 }}>{topic.remarks}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
