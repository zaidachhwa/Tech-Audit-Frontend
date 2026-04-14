import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../api/axios";
import { BookOpen, ChevronDown, ArrowRight, Hash, Layers } from "lucide-react";

const S = {
  page: { minHeight: "100vh", background: "#F8FAFC", padding: "28px 32px", fontFamily: "'DM Sans', sans-serif" },
  heading: { fontSize: 20, fontWeight: 700, color: "#1B2B4B", margin: 0 },
  sub: { fontSize: 13, color: "#64748B", margin: "4px 0 24px" },
  statsRow: { display: "grid", gap: 16, marginBottom: 24, gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" },
  statCard: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12, padding: "18px 22px", display: "flex", alignItems: "center", gap: 14 },
  accordion: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12, overflow: "hidden" },
};

function groupBatches(batches) {
  const map = new Map();
  batches.forEach((b) => {
    const key = (b.batch_name || "Unknown").trim().toUpperCase();
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(b);
  });
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, list]) => ({
      name,
      batches: list.sort((a, b) => String(a.batch_no).localeCompare(String(b.batch_no), undefined, { numeric: true })),
    }));
}

export default function AssignSyllabus() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/batches/public")
      .then((r) => setBatches(r.data || []))
      .finally(() => setLoading(false));
  }, []);

  const grouped = groupBatches(batches);

  const toggle = (name) => setExpanded((prev) => (prev === name ? null : name));

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes slideDown { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        .acc-row { background:#F8FAFC; } 
        .acc-row:hover { background:#EFF6FF !important; }
        .batch-pill { cursor:pointer; transition:all 0.15s ease; border:1.5px solid #E2E8F0; background:#fff; }
        .batch-pill:hover { background:#2563EB !important; color:#fff !important; border-color:#2563EB !important; transform:translateY(-1px); box-shadow:0 4px 12px rgba(37,99,235,0.25); }
        .batch-pill:hover .pill-num { color:#fff !important; }
        .batch-pill:hover .pill-arrow { opacity:1 !important; }
      `}</style>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 4, height: 20, background: "#2563EB", borderRadius: 4 }} />
            <h1 style={S.heading}>Assign Syllabus</h1>
          </div>
          <p style={S.sub}>Select a course batch to assign and manage syllabus topics.</p>
        </div>
      </div>

      {/* Stats */}
      <div style={S.statsRow}>
        {[
          { label: "Total Courses", value: grouped.length, icon: <Layers size={22} color="#2563EB" />, tint: "#EFF6FF" },
          { label: "Total Batches", value: batches.length, icon: <BookOpen size={22} color="#7C3AED" />, tint: "#F5F3FF" },
          { label: "Batch Numbers", value: batches.map((b) => b.batch_no).filter((v, i, a) => a.indexOf(v) === i).length, icon: <Hash size={22} color="#10B981" />, tint: "#ECFDF5" },
        ].map((s) => (
          <div key={s.label} style={S.statCard}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: s.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>{s.label}</p>
              <p style={{ fontSize: 28, fontWeight: 800, color: "#1B2B4B", margin: 0 }}>
                {loading ? "—" : s.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Accordion */}
      <div style={S.accordion}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#94A3B8", fontSize: 13 }}>Loading courses...</div>
        ) : grouped.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#94A3B8", fontSize: 13 }}>No batches found.</div>
        ) : (
          grouped.map((group, idx) => {
            const isOpen = expanded === group.name;
            return (
              <div key={group.name} style={{ borderBottom: idx < grouped.length - 1 ? "1.5px solid #E2E8F0" : "none" }}>
                {/* Course Header */}
                <div
                  className="acc-row"
                  onClick={() => toggle(group.name)}
                  style={{
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    background: isOpen ? "#EFF6FF" : "#F8FAFC",
                    borderLeft: isOpen ? "3px solid #2563EB" : "3px solid transparent",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: isOpen ? "#2563EB" : "#E2E8F0",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.15s ease",
                    }}>
                      <BookOpen size={16} color={isOpen ? "#fff" : "#64748B"} />
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#1B2B4B", margin: 0 }}>{group.name}</p>
                      <p style={{ fontSize: 11, color: "#64748B", margin: 0 }}>{group.batches.length} batch{group.batches.length !== 1 ? "es" : ""}</p>
                    </div>
                  </div>
                  <ChevronDown
                    size={18}
                    color={isOpen ? "#2563EB" : "#94A3B8"}
                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s ease" }}
                  />
                </div>

                {/* Batch Pills */}
                {isOpen && (
                  <div style={{ padding: "16px 20px 20px 20px", display: "flex", flexWrap: "wrap", gap: 10, animation: "slideDown 0.2s ease-out", background: "#fff" }}>
                    {group.batches.map((batch) => (
                      <button
                        key={batch._id}
                        className="batch-pill"
                        onClick={() => navigate(`/teacher/assign-syllabus/${batch._id}`)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "10px 18px", borderRadius: 10,
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        <div style={{
                          width: 28, height: 28, borderRadius: 6,
                          background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <Hash size={13} color="#2563EB" />
                        </div>
                        <div style={{ textAlign: "left" }}>
                          <p className="pill-num" style={{ fontSize: 13, fontWeight: 700, color: "#1B2B4B", margin: 0 }}>
                            Batch #{batch.batch_no}
                          </p>
                        </div>
                        <ArrowRight className="pill-arrow" size={14} color="#2563EB" style={{ opacity: 0.4, transition: "opacity 0.15s", marginLeft: 4 }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
