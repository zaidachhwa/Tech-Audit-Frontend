import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import toast from "react-hot-toast";
import {
  RefreshCw, Layers, CheckCircle2, Clock, FileText, TrendingUp,
  Calendar, X, ChevronDown, ChevronUp, Award, Target,
  MessageSquare, Download, BarChart2
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const S = {
  page: { 
    minHeight: "100vh", 
    background: "#F8FAFC", 
    padding: "clamp(16px, 4vw, 32px)", 
    fontFamily: "'DM Sans', sans-serif",
    width: "100%",
    boxSizing: "border-box",
    overflowX: "hidden"
  },
  card: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", boxSizing: "border-box" },
  pageTitle: { fontSize: 20, fontWeight: 700, color: "#1B2B4B", margin: 0 },
  label: { fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748B" },
  secondaryBtn: { background: "#fff", color: "#1B2B4B", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "9px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontFamily: "'DM Sans', sans-serif" },
};

// ─── Shared Helpers ──────────────────────────────────────────────────────────
const calculateAverage = (parameters) => {
  if (!parameters || parameters.length === 0) return 0;
  const total = parameters.reduce((sum, p) => sum + (Number(p.score) || 0), 0);
  return (total / parameters.length).toFixed(1);
};

const getGrade = (avg) => {
  if (avg >= 9) return "A+";
  if (avg >= 8) return "A";
  if (avg >= 7) return "B+";
  if (avg >= 6) return "B";
  if (avg >= 5) return "C";
  return "D";
};

const getScoreStyle = (score) => {
  const n = Number(score);
  if (n >= 8) return { background: "#2563EB", color: "#fff" };
  if (n >= 5) return { background: "#F59E0B", color: "#fff" };
  return { background: "#EF4444", color: "#fff" };
};

// ─── ReportCard ──────────────────────────────────────────────────────────────
function ReportCard({ report, index, expanded, onToggleExpand }) {
  const avgScore = calculateAverage(report.parameters);
  const grade = getGrade(avgScore);
  const auditDate = report.auditDate
    ? new Date(report.auditDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "N/A";

  return (
    <div style={{ background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <div style={{ padding: "20px 22px", borderBottom: "1px solid #F1F5F9" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563EB" }}>
              <BarChart2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1B2B4B" }}>Performance Report #{index + 1}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                <Calendar size={12} style={{ color: "#64748B" }} />
                <span style={{ fontSize: 12, color: "#64748B" }}>{auditDate}</span>
              </div>
            </div>
          </div>
          <div style={{ background: "#1B2B4B", borderRadius: 10, padding: "8px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Grade</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{grade}</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F8FAFC", border: "1px solid #F1F5F9", borderRadius: 8, padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#fff", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", color: "#1B2B4B" }}>
              <Target size={18} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Average Score</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#1B2B4B" }}>{avgScore}/10</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Parameters</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#1B2B4B" }}>{report.parameters?.length || 0}</div>
          </div>
        </div>

        {!expanded && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Parameters Overview</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {report.parameters?.slice(0, 4).map((param, idx) => (
                <div key={idx} style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: "#EFF6FF", color: "#1E40AF", border: "1px solid #BFDBFE" }}>
                  {param.name}: <span style={{ fontWeight: 800 }}>{param.score}/10</span>
                </div>
              ))}
              {report.parameters?.length > 4 && (
                <div style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: "#F8FAFC", color: "#64748B", border: "1px solid #E2E8F0" }}>
                  +{report.parameters.length - 4} more
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
            <div style={{ padding: "20px 22px", background: "#F8FAFC", display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1B2B4B", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <Award size={16} style={{ color: "#2563EB" }} /> Detailed Scores ({report.parameters?.length || 0})
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {report.parameters?.map((param, idx) => {
                    const score = Number(param.score) || 0;
                    return (
                      <div key={idx} style={{ background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#1B2B4B", marginBottom: 8 }}>{param.name}</div>
                          <div style={{ height: 6, background: "#E2E8F0", borderRadius: 99, overflow: "hidden" }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${score * 10}%` }} transition={{ duration: 0.8, delay: 0.1 }} style={{ height: "100%", background: "#2563EB", borderRadius: 99 }} />
                          </div>
                        </div>
                        <div style={{ background: "#2563EB", color: "#fff", borderRadius: 8, padding: "6px 10px", textAlign: "center", minWidth: 48 }}>
                          <div style={{ fontSize: 18, fontWeight: 800 }}>{score}</div>
                          <div style={{ fontSize: 10, opacity: 0.8 }}>/10</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {report.feedbackSchema && report.feedbackSchema.length > 0 && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1B2B4B", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                    <MessageSquare size={16} style={{ color: "#2563EB" }} /> Feedback Points
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {Object.entries(report.feedbackSchema[0]).map(([key, value], idx) => {
                      if (key !== "_id" && value) {
                        return (
                          <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "12px 14px" }}>
                            <div style={{ width: 26, height: 26, background: "#2563EB", color: "#fff", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{idx + 1}</div>
                            <p style={{ fontSize: 13, color: "#1B2B4B", margin: 0, flex: 1 }}>{value}</p>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}

              {report.overallRemarks && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1B2B4B", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    <FileText size={16} style={{ color: "#2563EB" }} /> Overall Remarks
                  </div>
                  <div style={{ background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "14px 16px", fontSize: 13, color: "#1B2B4B", lineHeight: 1.7 }}>
                    {report.overallRemarks}
                  </div>
                </div>
              )}

              {report.pdfUrl && (
                <a href={report.pdfUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#2563EB", color: "#fff", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 13, textDecoration: "none", width: "fit-content" }}>
                  <Download size={16} /> Download PDF Report
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={onToggleExpand}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px", background: "#F8FAFC", borderTop: "1px solid #F1F5F9", border: "none", cursor: "pointer", color: "#64748B", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
        {expanded ? <><ChevronUp size={16} /> Show Less</> : <><ChevronDown size={16} /> View Full Report</>}
      </button>
    </div>
  );
}

// ─── Report Preview Modal ────────────────────────────────────────────────────
function ReportModal({ report, reportIndex, onClose }) {
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", backdropFilter: "blur(2px)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.2 }}
        style={{ background: "#F8FAFC", borderRadius: 16, width: "100%", maxWidth: 680, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* Modal Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", background: "#fff", borderBottom: "1.5px solid #E2E8F0", borderRadius: "16px 16px 0 0", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563EB" }}>
              <BarChart2 size={18} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1B2B4B" }}>Report Preview</div>
              <div style={{ fontSize: 12, color: "#64748B" }}>Performance Report #{reportIndex + 1}</div>
            </div>
          </div>
          <button onClick={onClose}
            style={{ width: 34, height: 34, borderRadius: 8, border: "1.5px solid #E2E8F0", background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748B" }}>
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: 16 }}>
          <ReportCard
            report={report}
            index={reportIndex}
            expanded={expanded}
            onToggleExpand={() => setExpanded((p) => !p)}
          />
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const { user: authUser } = useAuth();
  const [me, setMe] = useState(null);
  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null); // { report, index }

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

      {/* ── Report Preview Modal ── */}
      <AnimatePresence>
        {selectedReport && (
          <ReportModal
            report={selectedReport.report}
            reportIndex={selectedReport.index}
            onClose={() => setSelectedReport(null)}
          />
        )}
      </AnimatePresence>

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
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
        {statCards.map((s) => (
          <div key={s.label} style={{ ...S.card, padding: "18px 20px", flex: "1 1 calc(25% - 16px)", minWidth: "160px" }}>
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
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginBottom: 20 }}>
        {/* Upcoming Deadlines */}
        <div style={{...S.card, flex: "1 1 320px"}}>
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
        <div style={{...S.card, flex: "1 1 320px"}}>
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

      {/* ── Recent Reports (CLICKABLE) ── */}
      <div style={S.card}>
        <div style={{ padding: "16px 20px", borderBottom: "1.5px solid #F1F5F9", background: "#F8FAFC", borderRadius: "12px 12px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 4, height: 16, background: "#2563EB", borderRadius: 4 }} />
            <p style={{ fontWeight: 700, color: "#1B2B4B", fontSize: 14, margin: 0 }}>Recent Reports</p>
          </div>
          <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>Click a report to preview</p>
        </div>
        <div style={{ padding: 16 }}>
          {reports.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: "#94A3B8", fontSize: 13 }}>No reports available yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {reports.slice(0, 3).map((report, index) => {
                const avg = calculateAverage(report.parameters);
                const scoreStyle = getScoreStyle(avg);
                const auditDate = report.auditDate
                  ? new Date(report.auditDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : "N/A";
                return (
                  <div
                    key={report._id}
                    onClick={() => setSelectedReport({ report, index })}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 10, border: "1.5px solid #F1F5F9", background: "#fff", cursor: "pointer", transition: "all 0.15s ease" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#EFF6FF";
                      e.currentTarget.style.borderColor = "#BFDBFE";
                      e.currentTarget.style.transform = "translateX(3px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#fff";
                      e.currentTarget.style.borderColor = "#F1F5F9";
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563EB", flexShrink: 0 }}>
                        <FileText size={16} />
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, color: "#1B2B4B", fontSize: 13, margin: "0 0 3px" }}>Report #{index + 1}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#94A3B8", fontSize: 11 }}>
                          <Calendar size={11} />{auditDate}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 2px" }}>Score</p>
                        <div style={{ ...scoreStyle, borderRadius: 8, padding: "4px 12px", fontWeight: 800, fontSize: 14, minWidth: 52, textAlign: "center" }}>{avg}</div>
                      </div>
                      <div style={{ color: "#CBD5E1", fontSize: 18, fontWeight: 300 }}>›</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}