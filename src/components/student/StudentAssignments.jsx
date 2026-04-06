import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import {
  ClipboardList, Calendar, MessageSquare, ChevronDown,
  CheckCircle, AlertCircle, Loader2, Hash, BookOpen,
} from "lucide-react";

const S = {
  page: { minHeight: "100vh", background: "#F8FAFC", padding: "28px 32px", fontFamily: "'DM Sans', sans-serif" },
  card: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" },
};

function getBadgeColor(score) {
  if (score >= 80) return { bg: "#ECFDF5", color: "#065F46" };
  if (score >= 55) return { bg: "#FEF3C7", color: "#92400E" };
  return { bg: "#FEF2F2", color: "#991B1B" };
}

function AssignmentCard({ assignment, index }) {
  const [open, setOpen] = useState(false);

  const assignedOn = assignment.createdAt
    ? new Date(assignment.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : null;

  const dueDate = assignment.date
    ? new Date(assignment.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : null;

  const totalScore = assignment.parameters?.reduce((sum, p) => sum + (p.score || 0), 0) ?? 0;
  const maxPossible = assignment.parameters?.length * 10;
  const pct = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : null;

  return (
    <div style={{ ...S.card, marginBottom: 12, overflow: "hidden" }}>
      {/* Header row */}
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          background: open ? "#EFF6FF" : "#fff",
          borderLeft: `4px solid ${open ? "#2563EB" : "#E2E8F0"}`,
          transition: "all 0.15s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: open ? "#2563EB" : "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
            <ClipboardList size={18} color={open ? "#fff" : "#64748B"} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#1B2B4B", margin: 0 }}>
              {assignment.parameters?.map(p => p.name).filter(Boolean).join(", ") || `Assignment #${index + 1}`}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 3 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#64748B" }}>
                <Hash size={11} /> {assignment.batchName} #{assignment.batchNumber}
              </span>
              {assignedOn && (
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#64748B" }}>
                  <Calendar size={11} /> Assigned {assignedOn}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {pct !== null && (
            <span style={{ fontSize: 13, fontWeight: 700, padding: "3px 12px", borderRadius: 20, ...getBadgeColor(pct) }}>
              {pct}%
            </span>
          )}
          <ChevronDown
            size={16}
            color="#94A3B8"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s ease" }}
          />
        </div>
      </div>

      {/* Expanded content */}
      {open && (
        <div style={{ padding: "16px 20px", borderTop: "1.5px solid #F1F5F9" }}>
          {/* Parameters */}
          {assignment.parameters?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px" }}>
                Assignment Parameters
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8 }}>
                {assignment.parameters.map((p, i) => {
                  const badge = getBadgeColor(p.score * 10);
                  return (
                    <div key={i} style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#1B2B4B", margin: 0 }}>{p.name || `Item ${i + 1}`}</p>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 20, ...badge }}>
                        {p.score}/10
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Due date */}
          {dueDate && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, background: "#FEF3C7", border: "1.5px solid #FDE68A", padding: "8px 14px", borderRadius: 8 }}>
              <Calendar size={14} color="#D97706" />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#92400E" }}>Due: {dueDate}</span>
            </div>
          )}

          {/* Comment */}
          {assignment.comment?.trim() && (
            <div style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <MessageSquare size={13} color="#2563EB" />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em" }}>Teacher's Note</span>
              </div>
              <p style={{ fontSize: 13, color: "#475569", margin: 0, lineHeight: 1.6 }}>{assignment.comment}</p>
            </div>
          )}

          {/* Total score bar */}
          {pct !== null && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>Overall Score</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#2563EB" }}>{totalScore} / {maxPossible} pts ({pct}%)</span>
              </div>
              <div style={{ height: 6, background: "#F1F5F9", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: pct >= 80 ? "#10B981" : pct >= 55 ? "#F59E0B" : "#EF4444", borderRadius: 99, transition: "width 0.5s ease" }} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function StudentAssignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    API.get("/assignment/my")
      .then((r) => setAssignments(r.data?.assignments || []))
      .catch((e) => setError(e.response?.data?.message || "Failed to load assignments"))
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: assignments.length,
    recent: assignments.filter(a => {
      if (!a.createdAt) return false;
      const days = (Date.now() - new Date(a.createdAt)) / (1000 * 60 * 60 * 24);
      return days <= 7;
    }).length,
  };

  return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{ width: 4, height: 20, background: "#2563EB", borderRadius: 4 }} />
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1B2B4B", margin: 0 }}>My Assignments</h1>
        </div>
        <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>
          Tasks assigned to you by your teacher
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total Assigned", value: stats.total, icon: <ClipboardList size={20} />, tint: "#EFF6FF", color: "#2563EB" },
          { label: "This Week", value: stats.recent, icon: <Calendar size={20} />, tint: "#ECFDF5", color: "#10B981" },
        ].map((s) => (
          <div key={s.label} style={{ ...S.card, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: s.tint, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 3px" }}>{s.label}</p>
              <p style={{ fontSize: 26, fontWeight: 800, color: "#1B2B4B", margin: 0 }}>
                {loading ? "—" : s.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Loader2 size={32} color="#2563EB" style={{ animation: "spin 1s linear infinite", marginBottom: 12, display: "block", margin: "0 auto 12px" }} />
          <p style={{ color: "#64748B", fontSize: 13 }}>Loading your assignments...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : error ? (
        <div style={{ ...S.card, padding: "32px", textAlign: "center" }}>
          <AlertCircle size={32} color="#EF4444" style={{ margin: "0 auto 12px", display: "block" }} />
          <p style={{ color: "#EF4444", fontWeight: 600, fontSize: 14, margin: 0 }}>{error}</p>
        </div>
      ) : assignments.length === 0 ? (
        <div style={{ ...S.card, padding: "56px 32px", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <BookOpen size={30} color="#94A3B8" />
          </div>
          <p style={{ fontWeight: 700, color: "#1B2B4B", fontSize: 16, margin: "0 0 8px" }}>No Assignments Yet</p>
          <p style={{ color: "#64748B", fontSize: 13, margin: 0 }}>Your teacher hasn't assigned any tasks to you yet. Check back later!</p>
        </div>
      ) : (
        <div>
          {assignments.map((a, i) => (
            <AssignmentCard key={a._id || i} assignment={a} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
