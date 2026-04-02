import { useState, useEffect } from "react";
import { API } from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { Megaphone, Plus, X, Send, Clock, Users, Trash2, ChevronDown, AlertCircle, BookOpen, Info } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const S = {
  page: { minHeight: "100vh", background: "#F8FAFC", padding: "28px 32px", fontFamily: "'DM Sans', sans-serif" },
  card: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  pageTitle: { fontSize: 20, fontWeight: 700, color: "#1B2B4B", margin: 0 },
  label: { fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748B" },
  select: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#1B2B4B", width: "100%", outline: "none", fontFamily: "'DM Sans', sans-serif", appearance: "none" },
  input: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#1B2B4B", width: "100%", outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" },
  primaryBtn: { background: "#2563EB", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontFamily: "'DM Sans', sans-serif" },
};

const PRIORITIES = [
  { value: "info", label: "Info", icon: <Info size={14} />, badge: { bg: "#EFF6FF", color: "#1E40AF" } },
  { value: "important", label: "Important", icon: <AlertCircle size={14} />, badge: { bg: "#FEF3C7", color: "#92400E" } },
  { value: "urgent", label: "Urgent", icon: <Megaphone size={14} />, badge: { bg: "#FEF2F2", color: "#991B1B" } },
];

const SAMPLE_ANNOUNCEMENTS = [
  { _id: "1", title: "Mid-term Exams Scheduled", message: "Mid-term exams will be held on 15th April. Please ensure all topics are covered before the date.", batch: "All Batches", priority: "important", createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), author: "John" },
  { _id: "2", title: "Holiday Notice", message: "The institute will remain closed on 14th April for a public holiday. Classes resume on 15th April.", batch: "All Batches", priority: "info", createdAt: new Date(Date.now() - 86400000).toISOString(), author: "John" },
  { _id: "3", title: "Assignment Deadline Extended", message: "The deadline for Assignment 2 has been extended by 3 days. New deadline: 20th April.", batch: "Batch A", priority: "urgent", createdAt: new Date().toISOString(), author: "John" },
];

export default function TeacherAnnouncements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState(SAMPLE_ANNOUNCEMENTS);
  const [batches, setBatches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", batch: "All Batches", priority: "info" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get("/batches/public").then((r) => setBatches(r.data || [])).catch(console.error);
  }, []);

  const handlePost = async () => {
    if (!form.title.trim() || !form.message.trim()) { toast.error("Please fill in title and message"); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const newAnn = {
      _id: Date.now().toString(),
      ...form,
      createdAt: new Date().toISOString(),
      author: user?.teacher?.name || user?.name || "Teacher",
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
    setForm({ title: "", message: "", batch: "All Batches", priority: "info" });
    setShowForm(false);
    toast.success("Announcement posted!");
    setLoading(false);
  };

  const handleDelete = (id) => {
    setAnnouncements((prev) => prev.filter((a) => a._id !== id));
    toast.success("Announcement removed");
  };

  const priorityMap = Object.fromEntries(PRIORITIES.map((p) => [p.value, p]));

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
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
            <h1 style={S.pageTitle}>Announcements</h1>
          </div>
          <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>Post notices and announcements to your batches.</p>
        </div>
        <button style={S.primaryBtn} onClick={() => setShowForm(true)}>
          <Plus size={14} /> New Announcement
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { label: "Total Announcements", value: announcements.length, tint: "#EFF6FF", iconColor: "#2563EB", icon: <Megaphone size={18} /> },
          { label: "This Week", value: announcements.filter((a) => Date.now() - new Date(a.createdAt).getTime() < 604800000).length, tint: "#ECFDF5", iconColor: "#10B981", icon: <Clock size={18} /> },
          { label: "Batches", value: batches.length || "—", tint: "#FEF3C7", iconColor: "#F59E0B", icon: <Users size={18} /> },
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

      {/* New Announcement Form */}
      {showForm && (
        <div style={{ ...S.card, padding: "22px 24px", marginBottom: 20, border: "1.5px solid #BFDBFE" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 4, height: 16, background: "#2563EB", borderRadius: 4 }} />
              <p style={{ fontWeight: 700, color: "#1B2B4B", fontSize: 14, margin: 0 }}>New Announcement</p>
            </div>
            <button onClick={() => setShowForm(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94A3B8" }}><X size={18} /></button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ ...S.label, display: "block", marginBottom: 8 }}>Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Announcement title..." style={S.input} />
            </div>
            <div>
              <label style={{ ...S.label, display: "block", marginBottom: 8 }}>Message</label>
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Write your announcement here..." rows={4} style={{ ...S.input, resize: "vertical" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ ...S.label, display: "block", marginBottom: 8 }}>Target Batch</label>
                <div style={{ position: "relative" }}>
                  <select value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} style={S.select}>
                    <option value="All Batches">All Batches</option>
                    {batches.map((b) => <option key={b._id} value={b.batch_name}>{b.batch_name}</option>)}
                  </select>
                  <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
                </div>
              </div>
              <div>
                <label style={{ ...S.label, display: "block", marginBottom: 8 }}>Priority</label>
                <div style={{ position: "relative" }}>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} style={S.select}>
                    {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                  <ChevronDown size={14} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} />
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 4 }}>
              <button onClick={() => setShowForm(false)} style={{ background: "#fff", color: "#64748B", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "9px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
              <button onClick={handlePost} disabled={loading} style={S.primaryBtn}>
                <Send size={13} /> {loading ? "Posting..." : "Post Announcement"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Announcements List */}
      <div style={S.card}>
        <div style={{ padding: "16px 22px", borderBottom: "1.5px solid #F1F5F9", background: "#F8FAFC", borderRadius: "12px 12px 0 0", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 4, height: 16, background: "#2563EB", borderRadius: 4 }} />
          <p style={{ fontWeight: 700, color: "#1B2B4B", fontSize: 14, margin: 0 }}>All Announcements ({announcements.length})</p>
        </div>
        <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
          {announcements.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#94A3B8", fontSize: 13 }}>No announcements yet. Create one!</div>
          ) : announcements.map((a) => {
            const pCfg = priorityMap[a.priority] || priorityMap.info;
            return (
              <div key={a._id} style={{ border: "1.5px solid #E2E8F0", borderRadius: 10, padding: "16px 18px", background: "#fff", transition: "box-shadow 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                      <p style={{ fontWeight: 700, color: "#1B2B4B", fontSize: 14, margin: 0 }}>{a.title}</p>
                      <span style={{ ...pCfg.badge, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                        {pCfg.icon} {pCfg.label}
                      </span>
                    </div>
                    <p style={{ color: "#64748B", fontSize: 13, margin: "0 0 10px", lineHeight: 1.6 }}>{a.message}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#94A3B8", fontSize: 12 }}>
                        <Users size={12} /> <span>{a.batch}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#94A3B8", fontSize: 12 }}>
                        <Clock size={12} /> <span>{timeAgo(a.createdAt)}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#94A3B8", fontSize: 12 }}>
                        <BookOpen size={12} /> <span>by {a.author}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(a._id)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#CBD5E1", padding: 4, borderRadius: 6, flexShrink: 0 }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#CBD5E1")}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}