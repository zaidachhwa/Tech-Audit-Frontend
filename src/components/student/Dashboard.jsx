// src/components/student/StudentDashboard.jsx
import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import { getMe } from "../../api/student.api";
import toast from "react-hot-toast";
import { RefreshCw, Layers, CheckCircle2, Clock, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

const style = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
  .sd-wrap { font-family: 'DM Sans', sans-serif; }
`;

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
      setMe(meRes.data.student || meRes.data);

      const projectRes = await API.get(
        `/projects/student/${
          meRes.data.student?.id ||
          meRes.data?.student?._id ||
          meRes.data?.studentId ||
          meRes.data?.id
        }`
      );
      const projectsList = projectRes.data?.projects || projectRes.data || [];
      setProjects(projectsList);

      const reportsRes = await API.get(
        `/reports/student/${
          meRes.data.student?.id || meRes.data?.student?._id || meRes.data?.id
        }`
      );
      const reportsList = reportsRes.data?.reports || reportsRes.data || [];
      setReports(reportsList);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = projects.length;
  const inProgress = projects.filter((p) => p.overallStatus === "In Progress").length;
  const completed = projects.filter(
    (p) => p.overallStatus === "Completed" || p.overallStatus === "Approved"
  ).length;

  const upcomingDeadlines = projects
    .filter((p) => p.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  const statCards = [
    { icon: <Layers size={22} />, label: "Total Projects", value: total, tint: "#EFF6FF", iconColor: "#2563EB" },
    { icon: <Clock size={22} />, label: "In Progress", value: inProgress, tint: "#ECFDF5", iconColor: "#10B981" },
    { icon: <CheckCircle2 size={22} />, label: "Completed", value: completed, tint: "#FEF3C7", iconColor: "#F59E0B" },
    { icon: <Calendar size={22} />, label: "Reports", value: reports.length, tint: "#EFF6FF", iconColor: "#2563EB" },
  ];

  return (
    <>
      <style>{style}</style>
      <div className="sd-wrap" style={{ minHeight: "100vh", background: "#F8FAFC", padding: "28px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "#fff",
              border: "1.5px solid #E2E8F0",
              borderRadius: 12,
              padding: "20px 24px",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#1B2B4B" }}>
                Hello, {me?.name || authUser?.name || "Student"} 👋
              </div>
              <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
                Here's your project & report overview
              </div>
            </div>
            <button
              onClick={fetchAll}
              disabled={loading}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                background: "#fff", border: "1.5px solid #E2E8F0",
                borderRadius: 8, padding: "8px 16px",
                color: "#1B2B4B", fontWeight: 600, fontSize: 13,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <RefreshCw size={16} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
              Refresh
            </button>
          </motion.div>

          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
            {statCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ transform: "translateY(-2px)", boxShadow: "0 6px 20px rgba(0,0,0,0.08)" }}
                style={{
                  background: "#fff", border: "1.5px solid #E2E8F0",
                  borderRadius: 12, padding: "18px 20px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: card.tint, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    color: card.iconColor,
                  }}>
                    {card.icon}
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#1B2B4B" }}>{card.value}</div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {card.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Content Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            {/* Upcoming Deadlines */}
            <div style={{
              background: "#fff", border: "1.5px solid #E2E8F0",
              borderRadius: 12, padding: "20px 22px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ width: 4, height: 18, background: "#2563EB", borderRadius: 4 }} />
                <div style={{ fontSize: 15, fontWeight: 700, color: "#1B2B4B" }}>Upcoming Deadlines</div>
              </div>
              {upcomingDeadlines.length === 0 ? (
                <div style={{ color: "#94A3B8", fontSize: 13, textAlign: "center", padding: "24px 0" }}>
                  No upcoming deadlines
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {upcomingDeadlines.map((p) => (
                    <div
                      key={p._id}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "10px 12px", background: "#F8FAFC",
                        border: "1px solid #F1F5F9", borderRadius: 8,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#1B2B4B" }}>{p.title}</div>
                        <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                          {p.description?.slice(0, 60) || ""}
                        </div>
                      </div>
                      <div style={{
                        fontSize: 11, fontWeight: 600, color: "#2563EB",
                        background: "#EFF6FF", padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap", marginLeft: 8,
                      }}>
                        {p.dueDate ? new Date(p.dueDate).toLocaleDateString() : "—"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div style={{
              background: "#fff", border: "1.5px solid #E2E8F0",
              borderRadius: 12, padding: "20px 22px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ width: 4, height: 18, background: "#2563EB", borderRadius: 4 }} />
                <div style={{ fontSize: 15, fontWeight: 700, color: "#1B2B4B" }}>Recent Activity</div>
              </div>
              {projects.length === 0 ? (
                <div style={{ color: "#94A3B8", fontSize: 13, textAlign: "center", padding: "24px 0" }}>
                  No activity yet
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {projects.slice(0, 6).map((p) => (
                    <div
                      key={p._id}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: 10,
                        padding: "8px 10px", borderRadius: 8,
                        borderLeft: "3px solid #2563EB",
                        background: "#F8FAFC",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#1B2B4B" }}>{p.title}</div>
                        <div style={{ fontSize: 11, color: "#64748B" }}>
                          {p.overallStatus} · {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : ""}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </>
  );
}