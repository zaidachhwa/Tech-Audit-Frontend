import { useEffect, useState, useMemo } from "react";
import { API } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import {
  ClipboardList, Calendar, MessageSquare, ChevronDown,
  CheckCircle, AlertCircle, Loader2, Hash, BookOpen, Clock,
  Search, SlidersHorizontal, ArrowUpDown
} from "lucide-react";
import toast from "react-hot-toast";

const S = {
  page: { minHeight: "100vh", background: "#F8FAFC", padding: "28px 32px", fontFamily: "'DM Sans', sans-serif" },
  card: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" },
};

// Filter options with color coding
const FILTERS = [
  { key: "All",     label: "All",      bg: "#F1F5F9", color: "#1B2B4B", activeBg: "#1B2B4B", activeColor: "#fff" },
  { key: "Pending", label: "Pending",  bg: "#FEF2F2", color: "#991B1B", activeBg: "#EF4444", activeColor: "#fff" },
  { key: "Done",    label: "Done",     bg: "#ECFDF5", color: "#065F46", activeBg: "#10B981", activeColor: "#fff" },
];

const SORT_OPTIONS = [
  { key: "newest",  label: "Newest First" },
  { key: "oldest",  label: "Oldest First" },
  { key: "az",      label: "Name A→Z" },
  { key: "za",      label: "Name Z→A" },
];

function getStatusBadge(status) {
  if (status === "Done") return { bg: "#ECFDF5", color: "#065F46", text: "Done" };
  return { bg: "#FEF2F2", color: "#991B1B", text: "Pending" };
}

function AssignmentCard({ assignment, index, onStatusChange }) {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const assignedOn = assignment.createdAt
    ? new Date(assignment.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : null;

  const dueDate = assignment.date
    ? new Date(assignment.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : null;

  const status = assignment.status || "Pending";
  const badge = getStatusBadge(status);

  const toggleStatus = async (e) => {
    e.stopPropagation();
    try {
      setUpdating(true);
      const newStatus = status === "Pending" ? "Done" : "Pending";
      const res = await API.patch(`/assignment/${assignment._id}/status`, { status: newStatus });
      onStatusChange(assignment._id, res.data.assignment.status);
      toast.success(`Task marked as ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

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
          borderLeft: `4px solid ${status === "Done" ? "#10B981" : open ? "#2563EB" : "#E2E8F0"}`,
          transition: "all 0.15s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: open ? "#2563EB" : "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
            <ClipboardList size={18} color={open ? "#fff" : "#64748B"} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#1B2B4B", margin: 0 }}>
              {assignment.parameters?.map(p => p.name).filter(Boolean).join(", ") || `Task #${index + 1}`}
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
          <button
            onClick={toggleStatus}
            disabled={updating}
            style={{
              fontSize: 13, fontWeight: 700, padding: "4px 14px", borderRadius: 20,
              background: badge.bg, color: badge.color, border: "none",
              cursor: updating ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 6,
              opacity: updating ? 0.7 : 1,
            }}
          >
            {status === "Done" ? <CheckCircle size={14} /> : <Clock size={14} />}
            {updating ? "Saving..." : badge.text}
          </button>
          <ChevronDown
            size={16} color="#94A3B8"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s ease" }}
          />
        </div>
      </div>

      {/* Expanded content */}
      {open && (
        <div style={{ padding: "16px 20px", borderTop: "1.5px solid #F1F5F9" }}>
          {dueDate && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, background: "#FEF3C7", border: "1.5px solid #FDE68A", padding: "8px 14px", borderRadius: 8 }}>
              <Calendar size={14} color="#D97706" />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#92400E" }}>Due: {dueDate}</span>
            </div>
          )}

          {assignment.parameters?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px" }}>Task Items</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {assignment.parameters.map((p, i) => (
                  <div key={i} style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563EB" }} />
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#1B2B4B", margin: 0 }}>{p.name || `Item ${i + 1}`}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {assignment.comment?.trim() && (
            <div style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <MessageSquare size={13} color="#2563EB" />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em" }}>Teacher's Note</span>
              </div>
              <p style={{ fontSize: 13, color: "#475569", margin: 0, lineHeight: 1.6 }}>{assignment.comment}</p>
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

  // ── Search / Filter / Sort state ──
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortKey, setSortKey] = useState("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    API.get("/assignment/my")
      .then((r) => setAssignments(r.data?.assignments || []))
      .catch((e) => setError(e.response?.data?.message || "Failed to load tasks"))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = (id, newStatus) => {
    setAssignments(prev => prev.map(a => a._id === id ? { ...a, status: newStatus } : a));
  };

  // ── Filtered + Sorted list ──
  const filtered = useMemo(() => {
    let list = [...assignments];

    // Filter by status
    if (activeFilter !== "All") {
      list = list.filter(a => (a.status || "Pending") === activeFilter);
    }

    // Search by task name or batch
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a => {
        const name = a.parameters?.map(p => p.name).join(" ").toLowerCase() || "";
        const batch = `${a.batchName || ""} ${a.batchNumber || ""}`.toLowerCase();
        return name.includes(q) || batch.includes(q);
      });
    }

    // Sort
    list.sort((a, b) => {
      if (sortKey === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortKey === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      const nameA = a.parameters?.map(p => p.name).join("") || "";
      const nameB = b.parameters?.map(p => p.name).join("") || "";
      if (sortKey === "az") return nameA.localeCompare(nameB);
      if (sortKey === "za") return nameB.localeCompare(nameA);
      return 0;
    });

    return list;
  }, [assignments, activeFilter, search, sortKey]);

  const stats = {
    total: assignments.length,
    pending: assignments.filter(a => (a.status || "Pending") !== "Done").length,
    done: assignments.filter(a => a.status === "Done").length,
  };

  const activeSortLabel = SORT_OPTIONS.find(s => s.key === sortKey)?.label || "Sort";

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        .sort-menu { position: absolute; top: 42px; right: 0; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.1); z-index: 100; min-width: 160px; overflow: hidden; }
        .sort-item:hover { background: #F1F5F9 !important; }
        .search-input:focus { outline: none; border-color: #2563EB !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{ width: 4, height: 20, background: "#2563EB", borderRadius: 4 }} />
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1B2B4B", margin: 0 }}>My Tasks</h1>
        </div>
        <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>Tasks assigned to you by your teacher</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total Tasks", value: stats.total,   icon: <ClipboardList size={20} />, tint: "#EFF6FF", color: "#2563EB" },
          { label: "Pending",     value: stats.pending, icon: <Clock size={20} />,         tint: "#FEF2F2", color: "#991B1B" },
          { label: "Done",        value: stats.done,    icon: <CheckCircle size={20} />,   tint: "#ECFDF5", color: "#10B981" },
        ].map((s) => (
          <div key={s.label} style={{ ...S.card, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: s.tint, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 3px" }}>{s.label}</p>
              <p style={{ fontSize: 26, fontWeight: 800, color: "#1B2B4B", margin: 0 }}>{loading ? "—" : s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search + Filter + Sort bar ── */}
      <div style={{ ...S.card, padding: "14px 16px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>

          {/* Search */}
          <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
            <input
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks or batch..."
              style={{
                width: "100%", padding: "9px 12px 9px 36px",
                border: "1.5px solid #E2E8F0", borderRadius: 8,
                fontSize: 13, color: "#1B2B4B", background: "#F8FAFC",
                fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
            />
          </div>

          {/* Filter pills */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <SlidersHorizontal size={14} color="#94A3B8" />
            {FILTERS.map((f) => {
              const isActive = activeFilter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  style={{
                    padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                    border: "none", cursor: "pointer", transition: "all 0.15s",
                    background: isActive ? f.activeBg : f.bg,
                    color: isActive ? f.activeColor : f.color,
                  }}
                >
                  {f.label}
                  {f.key !== "All" && (
                    <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.85 }}>
                      ({f.key === "Pending" ? stats.pending : stats.done})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sort dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowSortMenu(p => !p)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 8,
                border: "1.5px solid #E2E8F0", background: "#fff",
                fontSize: 12, fontWeight: 600, color: "#1B2B4B",
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <ArrowUpDown size={13} color="#64748B" />
              {activeSortLabel}
              <ChevronDown size={13} color="#94A3B8" style={{ transform: showSortMenu ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
            </button>
            {showSortMenu && (
              <div className="sort-menu">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    className="sort-item"
                    onClick={() => { setSortKey(opt.key); setShowSortMenu(false); }}
                    style={{
                      width: "100%", padding: "10px 16px", textAlign: "left",
                      background: sortKey === opt.key ? "#EFF6FF" : "#fff",
                      color: sortKey === opt.key ? "#2563EB" : "#1B2B4B",
                      fontWeight: sortKey === opt.key ? 700 : 500,
                      fontSize: 13, border: "none", cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active filter + result count */}
        {(search || activeFilter !== "All") && (
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>
              Showing <strong style={{ color: "#1B2B4B" }}>{filtered.length}</strong> of {assignments.length} tasks
            </p>
            <button
              onClick={() => { setSearch(""); setActiveFilter("All"); setSortKey("newest"); }}
              style={{ fontSize: 12, color: "#2563EB", fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Loader2 size={32} color="#2563EB" style={{ animation: "spin 1s linear infinite", display: "block", margin: "0 auto 12px" }} />
          <p style={{ color: "#64748B", fontSize: 13 }}>Loading your tasks...</p>
        </div>
      ) : error ? (
        <div style={{ ...S.card, padding: "32px", textAlign: "center" }}>
          <AlertCircle size={32} color="#EF4444" style={{ margin: "0 auto 12px", display: "block" }} />
          <p style={{ color: "#EF4444", fontWeight: 600, fontSize: 14, margin: 0 }}>{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ ...S.card, padding: "56px 32px", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <BookOpen size={30} color="#94A3B8" />
          </div>
          <p style={{ fontWeight: 700, color: "#1B2B4B", fontSize: 16, margin: "0 0 8px" }}>
            {assignments.length === 0 ? "No Tasks Yet" : "No Matching Tasks"}
          </p>
          <p style={{ color: "#64748B", fontSize: 13, margin: 0 }}>
            {assignments.length === 0
              ? "Your teacher hasn't assigned any tasks yet. Check back later!"
              : "Try adjusting your search or filters."}
          </p>
        </div>
      ) : (
        <div onClick={() => showSortMenu && setShowSortMenu(false)}>
          {filtered.map((a, i) => (
            <AssignmentCard key={a._id || i} assignment={a} index={i} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
}