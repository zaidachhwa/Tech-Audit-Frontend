import { useEffect, useState } from "react";
import { getMe, updateMe } from "../../api/student.api";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { getReportsByStudent } from "../../api/report.api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  User, Mail, Lock, Save, RefreshCw, Shield, Key, BookOpen, BarChart2, FileText, Calendar,
} from "lucide-react";

const S = {
  page: { minHeight: "100vh", background: "#F8FAFC", padding: "28px 32px", fontFamily: "'DM Sans', sans-serif" },
  card: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 20 },
  label: { fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748B" },
  input: { width: "100%", padding: "10px 14px", border: "1.5px solid #E2E8F0", borderRadius: 8, fontSize: 13, color: "#1B2B4B", fontFamily: "'DM Sans', sans-serif", outline: "none", background: "#fff", boxSizing: "border-box" },
  sectionTitle: { fontWeight: 700, color: "#1B2B4B", fontSize: 14, margin: 0 },
};

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

export default function StudentProfile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", currentPassword: "", newPassword: "" });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getMe();
      const s = res.student || res;
      setProfile(s);
      setForm((f) => ({ ...f, name: s.name || "", email: s.email || "" }));
      setReportsLoading(true);
      try {
        const reportRes = await getReportsByStudent(s._id);
        setReports(reportRes?.reports || []);
      } catch (e) { console.error(e); }
      finally { setReportsLoading(false); }
    } catch (err) { toast.error("Failed to load profile"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    try {
      setLoading(true);
      const payload = {};
      if (form.name) payload.name = form.name;
      if (form.email) payload.email = form.email;
      if (form.newPassword) { payload.currentPassword = form.currentPassword; payload.newPassword = form.newPassword; }
      const res = await updateMe(payload);
      toast.success("Profile updated successfully!");
      const updated = res.student || res;
      setProfile(updated);
      setUser?.(updated);
      setForm((f) => ({ ...f, currentPassword: "", newPassword: "" }));
    } catch (err) { toast.error(err.response?.data?.message || "Update failed"); }
    finally { setLoading(false); }
  };

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

  if (!profile) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #E2E8F0", borderTopColor: "#2563EB", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ color: "#64748B", fontSize: 13 }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ maxWidth: 800, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 4, height: 20, background: "#2563EB", borderRadius: 4 }} />
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1B2B4B", margin: 0 }}>Profile Settings</h1>
          </div>
          <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>Manage your account information</p>
        </div>

        {/* Account Info */}
        <div style={S.card}>
          <div style={{ padding: "18px 22px", borderBottom: "1.5px solid #F1F5F9", background: "#F8FAFC", borderRadius: "12px 12px 0 0", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, background: "#EFF6FF", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={16} color="#2563EB" />
            </div>
            <div>
              <p style={S.sectionTitle}>Account Information</p>
              <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>Update your personal details</p>
            </div>
          </div>
          <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ ...S.label, display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
                <User size={11} /> Full Name
              </label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter your full name" style={S.input}
                onFocus={(e) => (e.target.style.borderColor = "#2563EB")} onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")} />
            </div>
            <div>
              <label style={{ ...S.label, display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
                <Mail size={11} /> Email Address
              </label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Enter your email" style={S.input}
                onFocus={(e) => (e.target.style.borderColor = "#2563EB")} onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")} />
            </div>
            {profile.batch_name && (
              <div style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                  <BookOpen size={13} color="#2563EB" />
                  <span style={S.label}>Batch Information</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div style={{ background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "10px 12px" }}>
                    <p style={{ fontSize: 11, color: "#94A3B8", margin: "0 0 4px" }}>Batch Name</p>
                    <p style={{ fontWeight: 700, color: "#1B2B4B", fontSize: 13, margin: 0 }}>{profile.batch_name}</p>
                  </div>
                  <div style={{ background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "10px 12px" }}>
                    <p style={{ fontSize: 11, color: "#94A3B8", margin: "0 0 4px" }}>Batch No</p>
                    <p style={{ fontWeight: 700, color: "#1B2B4B", fontSize: 13, margin: 0 }}>#{profile.batch_no}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security */}
        <div style={S.card}>
          <div style={{ padding: "18px 22px", borderBottom: "1.5px solid #F1F5F9", background: "#F8FAFC", borderRadius: "12px 12px 0 0", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, background: "#EFF6FF", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={16} color="#2563EB" />
            </div>
            <div>
              <p style={S.sectionTitle}>Security Settings</p>
              <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>Change your password (optional)</p>
            </div>
          </div>
          <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "Current Password", field: "currentPassword", placeholder: "Enter current password" },
              { label: "New Password", field: "newPassword", placeholder: "Enter new password" },
            ].map((f) => (
              <div key={f.field}>
                <label style={{ ...S.label, display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
                  <Key size={11} /> {f.label}
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                  <input type="password" placeholder={f.placeholder} value={form[f.field]}
                    onChange={(e) => setForm({ ...form, [f.field]: e.target.value })}
                    style={{ ...S.input, paddingLeft: 36 }}
                    onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
                    onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")} />
                </div>
              </div>
            ))}
            <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>Leave blank if you don't want to change your password.</p>
          </div>
        </div>

        {/* Save Button */}
        <button disabled={loading} onClick={handleSubmit}
          style={{ width: "100%", background: loading ? "#93C5FD" : "#2563EB", color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "'DM Sans', sans-serif", marginBottom: 20 }}>
          {loading
            ? <><RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> Saving...</>
            : <><Save size={16} /> Save Changes</>}
        </button>

        {/* Bar Chart + Recent Reports */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

          {/* ── Bar Chart Card ── */}
          <div style={{ ...S.card, marginBottom: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1.5px solid #F1F5F9", background: "#F8FAFC", borderRadius: "12px 12px 0 0", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <div style={{ width: 30, height: 30, background: "#EFF6FF", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BarChart2 size={14} color="#2563EB" />
              </div>
              <div>
                <p style={S.sectionTitle}>Overall Performance</p>
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
              {reportsLoading ? (
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
          <div style={{ ...S.card, marginBottom: 0, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1.5px solid #F1F5F9", background: "#F8FAFC", borderRadius: "12px 12px 0 0", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 30, height: 30, background: "#FEF3C7", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileText size={14} color="#F59E0B" />
              </div>
              <div>
                <p style={S.sectionTitle}>Recent Reports</p>
                <p style={{ fontSize: 11, color: "#64748B", margin: 0 }}>Your latest evaluations</p>
              </div>
            </div>
            <div style={{ padding: 14, flex: 1, overflowY: "auto", maxHeight: 320 }}>
              {reportsLoading ? (
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
    </div>
  );
}