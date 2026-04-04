import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import toast from "react-hot-toast";
import { RefreshCw, Layers, CheckCircle2, Clock, FileText, TrendingUp, Calendar } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const S = {
  page: { minHeight: "100vh", background: "#F8FAFC", padding: "28px 32px", fontFamily: "'DM Sans', sans-serif" },
  card: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  pageTitle: { fontSize: 20, fontWeight: 700, color: "#1B2B4B", margin: 0 },
  label: { fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748B" },
  secondaryBtn: { background: "#fff", color: "#1B2B4B", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "9px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontFamily: "'DM Sans', sans-serif" },
};

export default function StudentDashboard() {
  const { user: authUser } = useAuth();
  const [me, setMe] = useState(null);
  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const meRes = await API.get("/students/me");
      const student = meRes.data.student || meRes.data;
      setMe(student);
      const studentId = student?.id || student?._id;
      const [projectRes, reportsRes] = await Promise.allSettled([
        API.get(`/projects/student/${studentId}`),
        API.get(`/reports/student/${studentId}`),
      ]);
      if (projectRes.status === "fulfilled") setProjects(projectRes.value.data?.projects || projectRes.value.data || []);
      if (reportsRes.status === "fulfilled") setReports(reportsRes.value.data?.reports || reportsRes.value.data || []);
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const total = projects.length;
  const inProgress = projects.filter((p) => p.overallStatus === "In Progress").length;
  const completed = projects.filter((p) => ["Completed", "Approved"].includes(p.overallStatus)).length;
  const upcomingDeadlines = projects.filter((p) => p.dueDate).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 5);

  const statCards = [
    { label: "Total Projects", value: total, icon: <Layers size={18} />, tint: "#EFF6FF", ic: "#2563EB" },
    { label: "In Progress", value: inProgress, icon: <Clock size={18} />, tint: "#FEF3C7", ic: "#F59E0B" },
    { label: "Completed", value: completed, icon: <CheckCircle2 size={18} />, tint: "#ECFDF5", ic: "#10B981" },
    { label: "Reports", value: reports.length, icon: <FileText size={18} />, tint: "#EFF6FF", ic: "#2563EB" },
  ];

  const statusBadge = (status) => {
    const map = {
      "In Progress": { bg: "#EFF6FF", color: "#1E40AF" },
      "Completed": { bg: "#ECFDF5", color: "#065F46" },
      "Approved": { bg: "#ECFDF5", color: "#065F46" },
      "Submitted": { bg: "#F5F3FF", color: "#6D28D9" },
      "Pending": { bg: "#FEF3C7", color: "#92400E" },
    };
    return map[status] || { bg: "#F1F5F9", color: "#64748B" };
  };

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap'); @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 4, height: 20, background: "#2563EB", borderRadius: 4 }} />
            <h1 style={S.pageTitle}>Welcome back, {me?.name || authUser?.name || "Student"} 👋</h1>
          </div>
          <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>Here's your project & report overview.</p>
        </div>
        <button style={S.secondaryBtn} onClick={fetchAll} disabled={loading}>
          <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        {statCards.map((s) => (
          <div key={s.label} style={{ ...S.card, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <p style={S.label}>{s.label}</p>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: s.tint, display: "flex", alignItems: "center", justifyContent: "center", color: s.ic }}>{s.icon}</div>
            </div>
            <p style={{ fontSize: 28, fontWeight: 800, color: "#1B2B4B", margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div style={{ ...S.card, padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <TrendingUp size={16} color="#2563EB" />
            <span style={{ fontWeight: 700, color: "#1B2B4B", fontSize: 14 }}>Overall Progress</span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#2563EB" }}>{total ? Math.round((completed / total) * 100) : 0}%</span>
        </div>
        <div style={{ height: 8, background: "#F1F5F9", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${total ? Math.round((completed / total) * 100) : 0}%`, background: "linear-gradient(90deg,#2563EB,#60A5FA)", borderRadius: 99, transition: "width 0.5s" }} />
        </div>
        <p style={{ fontSize: 12, color: "#94A3B8", margin: "8px 0 0" }}>{completed} of {total} projects completed</p>
      </div>

      {/* Two-column grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Upcoming Deadlines */}
        <div style={S.card}>
          <div style={{ padding: "16px 20px", borderBottom: "1.5px solid #F1F5F9", background: "#F8FAFC", borderRadius: "12px 12px 0 0", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 4, height: 16, background: "#2563EB", borderRadius: 4 }} />
            <p style={{ fontWeight: 700, color: "#1B2B4B", fontSize: 14, margin: 0 }}>Upcoming Deadlines</p>
          </div>
          <div style={{ padding: 16 }}>
            {upcomingDeadlines.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 0", color: "#94A3B8", fontSize: 13 }}>No upcoming deadlines.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {upcomingDeadlines.map((p) => (
                  <div key={p._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", borderRadius: 8, border: "1.5px solid #F1F5F9", background: "#F8FAFC" }}>
                    <div>
                      <p style={{ fontWeight: 600, color: "#1B2B4B", fontSize: 13, margin: "0 0 3px" }}>{p.title}</p>
                      <p style={{ color: "#94A3B8", fontSize: 11, margin: 0 }}>{p.description?.slice(0, 60) || ""}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#64748B", fontSize: 12, flexShrink: 0, marginLeft: 10 }}>
                      <Calendar size={12} />
                      {p.dueDate ? new Date(p.dueDate).toLocaleDateString() : "—"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={S.card}>
          <div style={{ padding: "16px 20px", borderBottom: "1.5px solid #F1F5F9", background: "#F8FAFC", borderRadius: "12px 12px 0 0", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 4, height: 16, background: "#2563EB", borderRadius: 4 }} />
            <p style={{ fontWeight: 700, color: "#1B2B4B", fontSize: 14, margin: 0 }}>Recent Activity</p>
          </div>
          <div style={{ padding: 16 }}>
            {projects.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 0", color: "#94A3B8", fontSize: 13 }}>No activity yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {projects.slice(0, 6).map((p) => {
                  const badge = statusBadge(p.overallStatus);
                  return (
                    <div key={p._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #F1F5F9" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFC")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2563EB", flexShrink: 0 }} />
                        <div>
                          <p style={{ fontWeight: 600, color: "#1B2B4B", fontSize: 13, margin: 0 }}>{p.title}</p>
                          <p style={{ color: "#94A3B8", fontSize: 11, margin: 0 }}>{p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : ""}</p>
                        </div>
                      </div>
                      <span style={{ ...badge, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", marginLeft: 8 }}>{p.overallStatus}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}