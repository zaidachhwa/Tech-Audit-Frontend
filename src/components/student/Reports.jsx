// src/components/student/Reports.jsx
import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart2, TrendingUp, Calendar, FileText, Award,
  ChevronDown, ChevronUp, RefreshCw, Download, Star,
  Target, MessageSquare,
} from "lucide-react";

const style = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
  .rp-wrap * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
  .rp-btn:hover { background: #F1F5F9 !important; }
  .rp-row:hover { background: #F1F5F9 !important; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

export default function Reports() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedReports, setExpandedReports] = useState(new Set());

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/reports/student/${user.id}`);
      setReports(res.data?.reports || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (reportId) => {
    setExpandedReports((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reportId)) newSet.delete(reportId);
      else newSet.add(reportId);
      return newSet;
    });
  };

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

  const stats = {
    total: reports.length,
    avgScore: reports.length > 0
      ? (reports.reduce((sum, r) => sum + Number(calculateAverage(r.parameters)), 0) / reports.length).toFixed(1)
      : 0,
    highest: reports.length > 0
      ? Math.max(...reports.map((r) => Number(calculateAverage(r.parameters))))
      : 0,
  };

  const statCards = [
    { icon: <FileText size={22} />, label: "Total Reports", value: stats.total, tint: "#EFF6FF", iconColor: "#2563EB" },
    { icon: <TrendingUp size={22} />, label: "Average Score", value: `${stats.avgScore}/10`, tint: "#ECFDF5", iconColor: "#10B981" },
    { icon: <Star size={22} />, label: "Highest Score", value: `${stats.highest}/10`, tint: "#FEF3C7", iconColor: "#F59E0B" },
    { icon: <Award size={22} />, label: "Current Grade", value: getGrade(stats.avgScore), tint: "#EFF6FF", iconColor: "#2563EB" },
  ];

  return (
    <>
      <style>{style}</style>
      <Toaster position="top-right" />
      <div className="rp-wrap" style={{ minHeight: "100vh", background: "#F8FAFC", padding: "28px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12,
              padding: "20px 24px", marginBottom: 20,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#1B2B4B" }}>Performance Reports</div>
              <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
                Track your progress and view detailed feedback
              </div>
            </div>
            <button
              onClick={fetchReports}
              disabled={loading}
              className="rp-btn"
              style={{
                display: "flex", alignItems: "center", gap: 7,
                background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 8,
                padding: "8px 16px", color: "#1B2B4B", fontWeight: 600,
                fontSize: 13, cursor: "pointer",
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
                    alignItems: "center", justifyContent: "center", color: card.iconColor,
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

          {/* Reports List */}
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
              <RefreshCw size={36} style={{ animation: "spin 1s linear infinite", color: "#2563EB" }} />
            </div>
          ) : reports.length === 0 ? (
            <div style={{
              background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12,
              padding: "60px 24px", textAlign: "center",
            }}>
              <BarChart2 size={56} style={{ color: "#E2E8F0", margin: "0 auto 16px" }} />
              <div style={{ fontSize: 17, fontWeight: 700, color: "#1B2B4B", marginBottom: 6 }}>No Reports Yet</div>
              <div style={{ fontSize: 13, color: "#64748B" }}>
                Your performance reports will appear here once available
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {reports.map((report, index) => (
                <ReportCard
                  key={report._id}
                  report={report}
                  index={index}
                  expanded={expandedReports.has(report._id)}
                  onToggleExpand={() => toggleExpanded(report._id)}
                  calculateAverage={calculateAverage}
                  getGrade={getGrade}
                />
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
}

function ReportCard({ report, index, expanded, onToggleExpand, calculateAverage, getGrade }) {
  const avgScore = calculateAverage(report.parameters);
  const grade = getGrade(avgScore);
  const auditDate = report.auditDate
    ? new Date(report.auditDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "N/A";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      style={{
        background: "#fff", border: "1.5px solid #E2E8F0",
        borderRadius: 12, overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      {/* Card Header */}
      <div style={{ padding: "20px 22px", borderBottom: "1px solid #F1F5F9" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: "#EFF6FF", display: "flex",
              alignItems: "center", justifyContent: "center", color: "#2563EB",
            }}>
              <BarChart2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1B2B4B" }}>
                Performance Report #{index + 1}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                <Calendar size={12} style={{ color: "#64748B" }} />
                <span style={{ fontSize: 12, color: "#64748B" }}>{auditDate}</span>
              </div>
            </div>
          </div>
          {/* Grade Badge */}
          <div style={{
            background: "#1B2B4B", borderRadius: 10,
            padding: "8px 16px", textAlign: "center",
          }}>
            <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Grade</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{grade}</div>
          </div>
        </div>

        {/* Avg Score bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "#F8FAFC", border: "1px solid #F1F5F9", borderRadius: 8, padding: "12px 16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: "#fff", border: "1px solid #E2E8F0",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#1B2B4B",
            }}>
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

        {/* Parameters summary (collapsed) */}
        {!expanded && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Parameters Overview
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {report.parameters?.slice(0, 4).map((param, idx) => (
                <div key={idx} style={{
                  padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                  background: "#EFF6FF", color: "#1E40AF", border: "1px solid #BFDBFE",
                }}>
                  {param.name}: <span style={{ fontWeight: 800 }}>{param.score}/10</span>
                </div>
              ))}
              {report.parameters?.length > 4 && (
                <div style={{
                  padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                  background: "#F8FAFC", color: "#64748B", border: "1px solid #E2E8F0",
                }}>
                  +{report.parameters.length - 4} more
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "20px 22px", background: "#F8FAFC", display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Detailed Parameters */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1B2B4B", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <Award size={16} style={{ color: "#2563EB" }} />
                  Detailed Scores ({report.parameters?.length || 0})
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {report.parameters?.map((param, idx) => {
                    const score = Number(param.score) || 0;
                    return (
                      <div key={idx} style={{
                        background: "#fff", border: "1.5px solid #E2E8F0",
                        borderRadius: 10, padding: "14px 16px",
                        display: "flex", alignItems: "center", gap: 12,
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#1B2B4B", marginBottom: 8 }}>{param.name}</div>
                          <div style={{ height: 6, background: "#E2E8F0", borderRadius: 99, overflow: "hidden" }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${score * 10}%` }}
                              transition={{ duration: 0.8, delay: 0.1 }}
                              style={{ height: "100%", background: "#2563EB", borderRadius: 99 }}
                            />
                          </div>
                        </div>
                        <div style={{
                          background: "#2563EB", color: "#fff", borderRadius: 8,
                          padding: "6px 10px", textAlign: "center", minWidth: 48,
                        }}>
                          <div style={{ fontSize: 18, fontWeight: 800 }}>{score}</div>
                          <div style={{ fontSize: 10, opacity: 0.8 }}>/10</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Feedback Points */}
              {report.feedbackSchema && report.feedbackSchema.length > 0 && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1B2B4B", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                    <MessageSquare size={16} style={{ color: "#2563EB" }} />
                    Feedback Points
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {Object.entries(report.feedbackSchema[0]).map(([key, value], idx) => {
                      if (key !== "_id" && value) {
                        return (
                          <div key={idx} style={{
                            display: "flex", alignItems: "flex-start", gap: 10,
                            background: "#fff", border: "1.5px solid #E2E8F0",
                            borderRadius: 8, padding: "12px 14px",
                          }}>
                            <div style={{
                              width: 26, height: 26, background: "#2563EB", color: "#fff",
                              borderRadius: 6, display: "flex", alignItems: "center",
                              justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0,
                            }}>
                              {idx + 1}
                            </div>
                            <p style={{ fontSize: 13, color: "#1B2B4B", margin: 0, flex: 1 }}>{value}</p>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}

              {/* Overall Remarks */}
              {report.overallRemarks && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1B2B4B", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    <FileText size={16} style={{ color: "#2563EB" }} />
                    Overall Remarks
                  </div>
                  <div style={{
                    background: "#fff", border: "1.5px solid #E2E8F0",
                    borderRadius: 8, padding: "14px 16px",
                    fontSize: 13, color: "#1B2B4B", lineHeight: 1.7,
                  }}>
                    {report.overallRemarks}
                  </div>
                </div>
              )}

              {/* PDF Download */}
              {report.pdfUrl && (
                <a
                  href={report.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "#2563EB", color: "#fff", borderRadius: 8,
                    padding: "10px 20px", fontWeight: 700, fontSize: 13,
                    textDecoration: "none", width: "fit-content",
                  }}
                >
                  <Download size={16} />
                  Download PDF Report
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer toggle */}
      <button
        onClick={onToggleExpand}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
          gap: 6, padding: "12px", background: "#F8FAFC",
          borderTop: "1px solid #F1F5F9", border: "none",
          cursor: "pointer", color: "#64748B", fontSize: 13, fontWeight: 600,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {expanded ? <><ChevronUp size={16} /> Show Less</> : <><ChevronDown size={16} /> View Full Report</>}
      </button>
    </motion.div>
  );
}