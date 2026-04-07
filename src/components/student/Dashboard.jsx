// src/components/student/StudentDashboard.jsx
import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import { getMe } from "../../api/student.api";
import toast from "react-hot-toast";
import { RefreshCw, Layers, CheckCircle2, Clock, Calendar, BarChart2, FileText } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

const style = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
  .sd-wrap { font-family: 'DM Sans', sans-serif; }
`;

// Color based on score out of 10
function getBarColor(score) {
  if (score >= 8) return "#10B981";  // green — excellent
  if (score >= 6) return "#2563EB";  // blue — good
  if (score >= 4) return "#F59E0B";  // amber — average
  return "#EF4444";                  // red — needs improvement
}

// Custom bar value label on top
function CustomBarLabel({ x, y, width, value }) {
  return (
    <text x={x + width / 2} y={y - 5} textAnchor="middle" fontSize={10} fontWeight={700} fill="#1B2B4B" fontFamily="'DM Sans', sans-serif">
      {value}
    </text>
  );
}

// Custom X-axis tick — truncates long names
function CustomXTick({ x, y, payload }) {
  const name = payload.value.length > 9 ? payload.value.slice(0, 8) + "…" : payload.value;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={10} textAnchor="middle" fontSize={9} fontWeight={600} fill="#64748B" fontFamily="'DM Sans', sans-serif">
        {name}
      </text>
    </g>
  );
}

// Custom tooltip
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0].payload;
  const color = getBarColor(value);
  return (
    <div style={{
      background: "#1B2B4B", borderRadius: 8, padding: "8px 12px",
      fontSize: 12, fontFamily: "'DM Sans', sans-serif", color: "#fff",
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    }}>
      <div style={{ fontWeight: 600, marginBottom: 3, color: "#94A3B8", fontSize: 11 }}>{name}</div>
      <div style={{ color, fontWeight: 800, fontSize: 16 }}>
        {value}<span style={{ fontSize: 10, fontWeight: 500, color: "#64748B" }}>/10</span>
      </div>
    </div>
  );
}

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

  // Aggregate avg score per parameter across all reports
  const getBarData = () => {
    if (!reports.length) return [];
    const paramStats = {};
    reports.forEach((r) => {
      r.parameters?.forEach((p) => {
        if (!paramStats[p.name]) paramStats[p.name] = { total: 0, count: 0 };
        paramStats[p.name].total += Number(p.score) || 0;
        paramStats[p.name].count += 1;
      });
    });
    return Object.keys(paramStats)
      .map((name) => ({
        name,
        value: Number((paramStats[name].total / paramStats[name].count).toFixed(1)),
      }))
      .sort((a, b) => b.value - a.value); // highest first
  };

  const barData = getBarData();
  const chartHeight = Math.min(Math.max(barData.length * 36, 160), 240);

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
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

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

          {/* Bar Chart + Recent Reports */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>

            {/* ── Bar Chart Card ── */}
            <div style={{ background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1.5px solid #F1F5F9", background: "#F8FAFC", borderRadius: "12px 12px 0 0", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <div style={{ width: 30, height: 30, background: "#EFF6FF", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <BarChart2 size={14} color="#2563EB" />
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: "#1B2B4B", fontSize: 14, margin: 0 }}>Overall Performance</p>
                  <p style={{ fontSize: 11, color: "#64748B", margin: 0 }}>Avg score per parameter</p>
                </div>
              </div>

              {/* Color legend */}
              <div style={{ padding: "10px 16px 0", display: "flex", flexWrap: "wrap", gap: "5px 10px", flexShrink: 0 }}>
                {[
                  { color: "#10B981", label: "Excellent 8+" },
                  { color: "#2563EB", label: "Good 6–7.9" },
                  { color: "#F59E0B", label: "Avg 4–5.9" },
                  { color: "#EF4444", label: "Low <4" },
                ].map((l) => (
                  <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
                    <span style={{ fontSize: 10, color: "#64748B", fontWeight: 500 }}>{l.label}</span>
                  </div>
                ))}
              </div>

              {/* Chart area */}
              <div style={{ padding: "10px 6px 14px 2px", flexShrink: 0 }}>
                {loading ? (
                  <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 28, height: 28, border: "3px solid #E2E8F0", borderTopColor: "#2563EB", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  </div>
                ) : barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={chartHeight}>
                    <BarChart data={barData} margin={{ top: 20, right: 8, left: -20, bottom: 4 }} barCategoryGap="35%">
                      <CartesianGrid vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="name" tick={<CustomXTick />} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]}
                        tick={{ fontSize: 10, fill: "#94A3B8", fontFamily: "'DM Sans', sans-serif" }}
                        axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(37,99,235,0.04)" }} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} label={<CustomBarLabel />} maxBarSize={32}>
                        {barData.map((entry, i) => (
                          <Cell key={i} fill={getBarColor(entry.value)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>
                    <BarChart2 size={36} style={{ marginBottom: 8, opacity: 0.3 }} />
                    <p style={{ fontSize: 13, margin: 0 }}>No report data yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Reports */}
            <div style={{ background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1.5px solid #F1F5F9", background: "#F8FAFC", borderRadius: "12px 12px 0 0", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 30, height: 30, background: "#FEF3C7", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FileText size={14} color="#F59E0B" />
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: "#1B2B4B", fontSize: 14, margin: 0 }}>Recent Reports</p>
                  <p style={{ fontSize: 11, color: "#64748B", margin: 0 }}>Your latest evaluations</p>
                </div>
              </div>
              <div style={{ padding: 14, flex: 1, overflowY: "auto", maxHeight: 320 }}>
                {loading ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "30px 0" }}>
                    <div style={{ width: 24, height: 24, border: "3px solid #E2E8F0", borderTopColor: "#2563EB", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  </div>
                ) : reports.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {reports.map((r, idx) => {
                      const avg = r.parameters?.reduce((s, p) => s + Number(p.score || 0), 0) / (r.parameters?.length || 1);
                      const scoreColor = getBarColor(avg);
                      return (
                        <div key={r._id || idx} style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "10px 12px", border: "1.5px solid #F1F5F9",
                          borderLeft: `3px solid ${scoreColor}`,
                          borderRadius: 8, background: "#F8FAFC",
                        }}>
                          <div>
                            <p style={{ fontWeight: 600, color: "#1B2B4B", fontSize: 12, margin: "0 0 3px" }}>
                              Report #{reports.length - idx}
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#94A3B8", fontSize: 11 }}>
                              <Calendar size={11} />
                              {r.auditDate ? new Date(r.auditDate).toLocaleDateString() : "N/A"}
                            </div>
                          </div>
                          <div style={{ background: scoreColor, borderRadius: 8, padding: "6px 12px", textAlign: "center", minWidth: 50 }}>
                            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", margin: "0 0 1px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Score</p>
                            <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", margin: 0 }}>{avg.toFixed(1)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "30px 0", color: "#94A3B8" }}>
                    <FileText size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                    <p style={{ fontSize: 13, margin: 0 }}>No reports found.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </>
  );
}