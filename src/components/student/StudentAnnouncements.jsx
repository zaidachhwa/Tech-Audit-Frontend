import { useState, useEffect } from "react";
import { API } from "../../api/axios";
import { Megaphone, Clock, Users, BookOpen, RefreshCw, Info, AlertCircle } from "lucide-react";

const S = {
  page: { minHeight: "100vh", background: "#F8FAFC", padding: "28px 32px", fontFamily: "'DM Sans', sans-serif" },
  card: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  pageTitle: { fontSize: 20, fontWeight: 700, color: "#1B2B4B", margin: 0 },
  label: { fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748B" },
};

const PRIORITIES = {
  info: { label: "Info", icon: <Info size={14} />, badge: { bg: "#EFF6FF", color: "#1E40AF" } },
  important: { label: "Important", icon: <AlertCircle size={14} />, badge: { bg: "#FEF3C7", color: "#92400E" } },
  urgent: { label: "Urgent", icon: <Megaphone size={14} />, badge: { bg: "#FEF2F2", color: "#991B1B" } },
};

export default function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [fetching, setFetching] = useState(true);

  const fetchAnnouncements = async () => {
    try {
      setFetching(true);
      const res = await API.get("/announcement/student");
      setAnnouncements(res.data.announcements || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const timeAgo = (dateStr) => {
    if (!dateStr) return "just now";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return `just now`;
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 4, height: 20, background: "#2563EB", borderRadius: 4 }} />
            <h1 style={S.pageTitle}>Announcements</h1>
          </div>
          <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>Latest updates and notices from your teachers.</p>
        </div>
        <button 
          style={{ background: "#fff", color: "#2563EB", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "10px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontFamily: "'DM Sans', sans-serif" }} 
          onClick={fetchAnnouncements}
        >
          <RefreshCw size={14} className={fetching ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Announcements List */}
      <div style={S.card}>
        <div style={{ padding: "16px 22px", borderBottom: "1.5px solid #F1F5F9", background: "#F8FAFC", borderRadius: "12px 12px 0 0", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 4, height: 16, background: "#2563EB", borderRadius: 4 }} />
          <p style={{ fontWeight: 700, color: "#1B2B4B", fontSize: 14, margin: 0 }}>All Announcements ({announcements.length})</p>
        </div>
        <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
          {fetching ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#94A3B8", fontSize: 13 }}>Loading announcements…</div>
          ) : announcements.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#94A3B8", fontSize: 13 }}>No announcements for you yet.</div>
          ) : announcements.map((a) => {
            const pCfg = PRIORITIES[a.priority] || PRIORITIES.info;
            return (
              <div key={a._id} style={{ border: "1.5px solid #E2E8F0", borderRadius: 10, padding: "16px 18px", background: "#fff", transition: "transform 0.2s" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
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
                        <BookOpen size={12} /> <span>by {a.teacher?.name || "Teacher"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
