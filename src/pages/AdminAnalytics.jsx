import { API } from "../api/axios";
import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Cell,
} from "recharts";

const PREVIEW = 5;

/* Tooltip */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff",
      border: "1.5px solid #E2E8F0",
      borderRadius: 10,
      padding: "10px 14px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      fontSize: 12
    }}>
      <p style={{ margin: 0, fontWeight: 700, color: "#1B2B4B" }}>{label}</p>
      <p style={{ margin: "4px 0 0", color: "#2563EB", fontWeight: 600 }}>
        Avg Score: <strong>{payload[0].value}</strong>
      </p>
    </div>
  );
};

/* Stat Card */
const StatCard = ({ label, value, icon, bg }) => (
  <div style={{
    background: "#fff",
    border: "1.5px solid #E2E8F0",
    borderRadius: 12,
    padding: "20px",
    flex: 1,
    minWidth: 150,
    display: "flex",
    alignItems: "center",
    gap: 16,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    transition: "all 0.2s"
  }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
    }}>
    <div style={{
      width: 52,
      height: 52,
      borderRadius: 14,
      background: bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 20
    }}>
      {icon}
    </div>
    <div>
      <p style={{
        margin: 0,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: "#64748B"
      }}>{label}</p>
      <p style={{
        margin: "4px 0 0",
        fontSize: 28,
        fontWeight: 800,
        color: "#1B2B4B"
      }}>{value ?? "—"}</p>
    </div>
  </div>
);

/* Student Row */
const StudentRow = ({ rank, name, score, isTop }) => (
  <div style={{
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 14px",
    borderRadius: 10,
    background: "#F8FAFC",
    border: "1px solid #F1F5F9",
    marginBottom: 8
  }}>
    <span style={{
      width: 26,
      height: 26,
      borderRadius: "50%",
      background: "#2563EB",
      color: "#fff",
      fontSize: 12,
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>{rank}</span>

    <span style={{
      flex: 1,
      fontSize: 14,
      fontWeight: 600,
      color: "#1B2B4B"
    }}>{name}</span>

    <span style={{
      fontSize: 12,
      fontWeight: 600,
      padding: "3px 10px",
      borderRadius: 20,
      background: isTop ? "#ECFDF5" : "#FEF3C7",
      color: isTop ? "#065F46" : "#92400E"
    }}>
      {score}
    </span>
  </div>
);

/* Section Title */
const SectionTitle = ({ title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
    <span style={{
      width: 4,
      height: 20,
      background: "#2563EB",
      borderRadius: 4
    }} />
    <h3 style={{
      margin: 0,
      fontSize: 13,
      fontWeight: 600,
      color: "#64748B",
      textTransform: "uppercase"
    }}>{title}</h3>
  </div>
);

/* Student List */
const StudentList = ({ students, isTop, loading }) => {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? students : students?.slice(0, PREVIEW);
  const hasMore = (students?.length ?? 0) > PREVIEW;

  return (
    <div>
      {loading ? (
        <p style={{ color: "#64748B", fontSize: 13 }}>Loading...</p>
      ) : (
        <>
          {shown?.map((s, i) => (
            <StudentRow key={i} rank={i + 1} name={s.name} score={s.avgScore} isTop={isTop} />
          ))}

          {hasMore && (
            <button
              onClick={() => setExpanded(e => !e)}
              style={{
                width: "100%",
                marginTop: 4,
                padding: "8px 0",
                borderRadius: 8,
                border: "1px solid #E2E8F0",
                background: "#fff",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 500,
                color: "#1B2B4B"
              }}
            >
              {expanded ? "View Less" : `View ${students.length - PREVIEW} More`}
            </button>
          )}
        </>
      )}
    </div>
  );
};

const BAR_COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#6366F1"];

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/analytics")
      .then(res => { setData(res.data); setLoading(false); })
      .catch((err) => { 
        console.error("Analytics Error:", err);
        setLoading(false); 
      });
  }, []);

  return (
    <div style={{
      background: "#F8FAFC",
      minHeight: "100vh",
      padding: "28px 32px",
      fontFamily: "'DM Sans', sans-serif"
    }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          margin: 0,
          fontSize: 20,
          fontWeight: 700,
          color: "#1B2B4B"
        }}>
          Analytics Dashboard
        </h1>
        <p style={{
          marginTop: 4,
          fontSize: 13,
          color: "#64748B"
        }}>
          Overview of student performance & batch metrics
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <StatCard label="Avg Score" value={data?.avgScore} icon="📊" bg="#EFF6FF" />
        <StatCard label="Reports" value={data?.totalReports} icon="📋" bg="#ECFDF5" />
        <StatCard label="Projects" value={data?.totalProjects} icon="🗂️" bg="#FEF3C7" />
      </div>

      {/* Students */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{
          flex: "1 1 300px",
          background: "#fff",
          border: "1.5px solid #E2E8F0",
          borderRadius: 12,
          padding: 20
        }}>
          <SectionTitle title="Top Students" />
          <StudentList students={data?.topStudents} isTop={true} loading={loading} />
        </div>

        <div style={{
          flex: "1 1 300px",
          background: "#fff",
          border: "1.5px solid #E2E8F0",
          borderRadius: 12,
          padding: 20
        }}>
          <SectionTitle title="Needs Improvement" />
          <StudentList students={data?.weakStudents} isTop={false} loading={loading} />
        </div>
      </div>

      {/* Chart */}
      <div style={{
        background: "#fff",
        border: "1.5px solid #E2E8F0",
        borderRadius: 12,
        padding: "20px 24px"
      }}>
        <SectionTitle title="Batch Performance" />

        {loading ? (
          <p style={{ color: "#64748B" }}>Loading...</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data?.batchPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="batch" tick={{ fill: "#64748B", fontSize: 12 }} />
              <YAxis tick={{ fill: "#64748B", fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avgScore" radius={[8, 8, 0, 0]}>
                {data?.batchPerformance?.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;