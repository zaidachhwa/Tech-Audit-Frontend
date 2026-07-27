import { useState, useEffect, useCallback, Fragment } from "react";
import { API } from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import CameraCaptureModal from "./CameraCaptureModal";
import {
  Fingerprint, Clock, LogIn, LogOut, Calendar, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, ChevronDown, ChevronUp, RefreshCw, Download
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function formatTime(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", weekday: "short" });
}

function calcHours(punchIn, punchOut) {
  if (!punchIn || !punchOut) return "—";
  const diff = new Date(punchOut) - new Date(punchIn);
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hrs}h ${mins}m`;
}

export default function StudentAttendancePunch() {
  const { user } = useAuth();
  const [todayRecord, setTodayRecord] = useState(null);
  const [monthRecords, setMonthRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [punching, setPunching] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  const [showCamera, setShowCamera] = useState(false);
  const [punchType, setPunchType] = useState(null); // 'in' or 'out'
  const [location, setLocation] = useState(null);

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  // Live clock
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchToday = useCallback(async () => {
    try {
      const res = await API.get("/attendance/student/today");
      setTodayRecord(res.data.record);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchMonth = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/attendance/student/my", {
        params: { month: viewMonth, year: viewYear },
      });
      setMonthRecords(res.data.records || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load attendance log");
    } finally {
      setLoading(false);
    }
  }, [viewMonth, viewYear]);

  useEffect(() => { fetchToday(); }, [fetchToday]);
  useEffect(() => { fetchMonth(); }, [fetchMonth]);

  const handlePunchIn = async () => {
    try {
      setPunching(true);
      const res = await API.post("/attendance/student/punch-in");
      toast.success(res.data.message);
      fetchToday();
      fetchMonth();
    } catch (err) {
      toast.error(err.response?.data?.message || "Punch In failed");
    } finally {
      setPunching(false);
    }
  };

  const handlePunchClick = (type) => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    toast.loading("Fetching location...", { id: "geo" });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        toast.dismiss("geo");
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setPunchType(type);
        setShowCamera(true);
      },
      (error) => {
        toast.error("Could not get location. Please allow location access to punch in/out.", { id: "geo" });
      },
      { enableHighAccuracy: true }
    );
  };

  const processPunch = async (photoBlob) => {
    setShowCamera(false);
    if (!location) {
      toast.error("Location not found");
      return;
    }

    try {
      setPunching(true);
      toast.loading(`Punching ${punchType === 'in' ? 'In' : 'Out'}...`, { id: "punch" });
      
      const formData = new FormData();
      formData.append("lat", location.lat);
      formData.append("lng", location.lng);
      formData.append("photo", photoBlob, "selfie.jpg");

      const endpoint = punchType === 'in' ? "/attendance/student/punch-in" : "/attendance/student/punch-out";
      const res = await API.post(endpoint, formData);
      
      toast.success(res.data.message, { id: "punch" });
      fetchToday();
      fetchMonth();
    } catch (err) {
      toast.error(err.response?.data?.message || `Punch ${punchType} failed`, { id: "punch" });
    } finally {
      setPunching(false);
      setPunchType(null);
      setLocation(null);
    }
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`My Attendance Report - ${MONTHS[viewMonth]} ${viewYear}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    const tableColumn = ["Date", "Punch In", "Punch Out", "Total Hours", "Status"];
    const tableRows = [];

    monthRecords.forEach(rec => {
      const rowData = [
        formatDate(rec.date),
        formatTime(rec.punchInTime),
        formatTime(rec.punchOutTime),
        calcHours(rec.punchInTime, rec.punchOutTime),
        rec.status === "PUNCHED_OUT" ? "Complete" : rec.status === "PUNCHED_IN" ? "Active" : "Missing"
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [15, 60, 138] },
    });

    doc.save(`Attendance_Report_${MONTHS[viewMonth]}_${viewYear}.pdf`);
  };

  const status = todayRecord?.status || "NOT_PUNCHED";

  // Stats
  const totalDays = monthRecords.length;
  const punchedDays = monthRecords.filter(r => r.status === "PUNCHED_OUT").length;
  const avgHours = (() => {
    const completeDays = monthRecords.filter(r => r.punchInTime && r.punchOutTime);
    if (!completeDays.length) return "—";
    const totalMs = completeDays.reduce((sum, r) => sum + (new Date(r.punchOutTime) - new Date(r.punchInTime)), 0);
    const avgMs = totalMs / completeDays.length;
    const hrs = Math.floor(avgMs / 3600000);
    const mins = Math.floor((avgMs % 3600000) / 60000);
    return `${hrs}h ${mins}m`;
  })();

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px" }}>
      <Toaster position="top-center" />

      {/* ── HEADER ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 5, height: 28, background: "#0F3C8A", borderRadius: 4 }} />
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1e293b", margin: 0 }}>My Attendance</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={downloadPDF} disabled={monthRecords.length === 0} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
            border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", cursor: "pointer",
            fontSize: 12, fontWeight: 700, color: "#0F3C8A", opacity: monthRecords.length === 0 ? 0.5 : 1
          }}>
            <Download size={14} /> Download PDF
          </button>
          <button
            onClick={() => { fetchToday(); fetchMonth(); }}
            disabled={loading}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
              border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", cursor: "pointer",
              fontSize: 12, fontWeight: 700, color: "#475569"
            }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* ── PUNCH CARD ── */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
        borderRadius: 16, padding: 28, marginBottom: 24, position: "relative", overflow: "hidden"
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -40, right: -40, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", bottom: -30, left: -30, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

        {/* Live Clock */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, position: "relative", zIndex: 1 }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, margin: 0, marginBottom: 4 }}>
              {currentTime.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Clock size={20} style={{ color: "#60a5fa" }} />
              <span style={{ fontSize: 28, fontWeight: 800, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
                {currentTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}
              </span>
            </div>
          </div>
          <div style={{
            padding: "6px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1,
            background: status === "PUNCHED_IN" ? "rgba(34,197,94,0.2)" : status === "PUNCHED_OUT" ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.1)",
            color: status === "PUNCHED_IN" ? "#4ade80" : status === "PUNCHED_OUT" ? "#a5b4fc" : "rgba(255,255,255,0.6)",
          }}>
            {status === "PUNCHED_IN" ? "● Active" : status === "PUNCHED_OUT" ? "✓ Completed" : "Not Punched"}
          </div>
        </div>

        {/* Punch Times */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24, position: "relative", zIndex: 1 }}>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <LogIn size={14} style={{ color: "#4ade80" }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1 }}>Punch In</span>
            </div>
            <p style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: 0 }}>
              {todayRecord?.punchInTime ? formatTime(todayRecord.punchInTime) : "—"}
            </p>
          </div>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <LogOut size={14} style={{ color: "#f87171" }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1 }}>Punch Out</span>
            </div>
            <p style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: 0 }}>
              {todayRecord?.punchOutTime ? formatTime(todayRecord.punchOutTime) : "—"}
            </p>
          </div>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <Clock size={14} style={{ color: "#60a5fa" }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1 }}>Total Hours</span>
            </div>
            <p style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: 0 }}>
              {calcHours(todayRecord?.punchInTime, todayRecord?.punchOutTime)}
            </p>
          </div>
        </div>

        {/* Punch Button */}
        <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          {status === "NOT_PUNCHED" && (
            <button
              onClick={() => handlePunchClick('in')}
              disabled={punching}
              style={{
                display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 48px",
                background: "linear-gradient(135deg, #22c55e, #16a34a)", border: "none", borderRadius: 12,
                color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 20px rgba(34,197,94,0.4)",
                transition: "transform 0.15s, box-shadow 0.15s", opacity: punching ? 0.7 : 1
              }}
              onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 6px 25px rgba(34,197,94,0.5)"; }}
              onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 4px 20px rgba(34,197,94,0.4)"; }}
            >
              <Fingerprint size={20} /> {punching ? "Punching In..." : "Punch In"}
            </button>
          )}

          {status === "PUNCHED_IN" && (
            <button
              onClick={() => handlePunchClick('out')}
              disabled={punching}
              style={{
                display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 48px",
                background: "linear-gradient(135deg, #ef4444, #dc2626)", border: "none", borderRadius: 12,
                color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 20px rgba(239,68,68,0.4)",
                transition: "transform 0.15s, box-shadow 0.15s", opacity: punching ? 0.7 : 1
              }}
              onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 6px 25px rgba(239,68,68,0.5)"; }}
              onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 4px 20px rgba(239,68,68,0.4)"; }}
            >
              <Fingerprint size={20} /> {punching ? "Punching Out..." : "Punch Out"}
            </button>
          )}

          {status === "PUNCHED_OUT" && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 32px",
              background: "rgba(99,102,241,0.15)", borderRadius: 12, color: "#a5b4fc", fontSize: 14, fontWeight: 700
            }}>
              <CheckCircle2 size={18} /> Today's attendance is complete
            </div>
          )}
        </div>
      </div>

      {/* ── STATS CARDS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Days Logged", value: totalDays, icon: Calendar, color: "#3b82f6", bg: "rgba(59,130,246,0.08)" },
          { label: "Full Days", value: punchedDays, icon: CheckCircle2, color: "#22c55e", bg: "rgba(34,197,94,0.08)" },
          { label: "Avg Hours/Day", value: avgHours, icon: Clock, color: "#8b5cf6", bg: "rgba(139,92,246,0.08)" },
        ].map((stat, i) => (
          <div key={i} style={{
            background: "#fff", borderRadius: 12, padding: "16px 18px", border: "1px solid #f1f5f9",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <stat.icon size={16} style={{ color: stat.color }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>{stat.label}</span>
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, color: "#1e293b", margin: 0 }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── MONTH LOG ── */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        {/* Month Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: "#1e293b", margin: 0 }}>Attendance Log</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={prevMonth} style={{ padding: 6, border: "1px solid #e2e8f0", borderRadius: 6, background: "#fff", cursor: "pointer", display: "flex" }}>
              <ChevronLeft size={16} color="#64748b" />
            </button>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#334155", minWidth: 130, textAlign: "center" }}>
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button onClick={nextMonth} style={{ padding: 6, border: "1px solid #e2e8f0", borderRadius: 6, background: "#fff", cursor: "pointer", display: "flex" }}>
              <ChevronRight size={16} color="#64748b" />
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Loading...</div>
        ) : monthRecords.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No attendance records for this month.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Date", "Punch In", "Punch Out", "Total Hours", "Status", ""].map((h, i) => (
                    <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, borderBottom: "1px solid #f1f5f9" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthRecords.map((rec, idx) => {
                  const isExpanded = expandedRow === idx;
                  const hasLectures = rec.lectureAttendance && rec.lectureAttendance.length > 0;
                  return (
                    <Fragment key={rec._id || idx}>
                      <tr style={{ borderBottom: "1px solid #f1f5f9", cursor: hasLectures ? "pointer" : "default" }}
                        onClick={() => hasLectures && setExpandedRow(isExpanded ? null : idx)}
                      >
                        <td style={{ padding: "12px 14px", fontWeight: 600, color: "#334155" }}>{formatDate(rec.date)}</td>
                        <td style={{ padding: "12px 14px", color: "#059669", fontWeight: 600 }}>{formatTime(rec.punchInTime)}</td>
                        <td style={{ padding: "12px 14px", color: "#dc2626", fontWeight: 600 }}>{formatTime(rec.punchOutTime)}</td>
                        <td style={{ padding: "12px 14px", color: "#6366f1", fontWeight: 700 }}>{calcHours(rec.punchInTime, rec.punchOutTime)}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{
                            padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                            background: rec.status === "PUNCHED_OUT" ? "rgba(34,197,94,0.1)" : rec.status === "PUNCHED_IN" ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)",
                            color: rec.status === "PUNCHED_OUT" ? "#059669" : rec.status === "PUNCHED_IN" ? "#d97706" : "#dc2626",
                          }}>
                            {rec.status === "PUNCHED_OUT" ? "Complete" : rec.status === "PUNCHED_IN" ? "Active" : "Missing"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          {hasLectures && (isExpanded ? <ChevronUp size={14} color="#94a3b8" /> : <ChevronDown size={14} color="#94a3b8" />)}
                        </td>
                      </tr>
                      {isExpanded && hasLectures && (
                        <tr>
                          <td colSpan={6} style={{ padding: 0 }}>
                            <div style={{ background: "#f8fafc", padding: "12px 20px 12px 40px" }}>
                              <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Lecture Attendance Breakdown</p>
                              {rec.lectureAttendance.map((la, li) => (
                                <div key={li} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: li < rec.lectureAttendance.length - 1 ? "1px solid #e2e8f0" : "none" }}>
                                  {la.status === "Present"
                                    ? <CheckCircle2 size={14} style={{ color: "#22c55e", flexShrink: 0 }} />
                                    : <XCircle size={14} style={{ color: "#ef4444", flexShrink: 0 }} />}
                                  <span style={{ fontSize: 12, fontWeight: 600, color: "#334155", flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {la.lectureTitle || "Lecture"} {la.subject ? `(${la.subject})` : ""}
                                  </span>
                                  <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{la.timeSlot || "—"}</span>
                                  <span style={{
                                    padding: "2px 8px", borderRadius: 12, fontSize: 10, fontWeight: 700,
                                    background: la.status === "Present" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                                    color: la.status === "Present" ? "#059669" : "#dc2626"
                                  }}>
                                    {la.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCamera && (
        <CameraCaptureModal
          onClose={() => setShowCamera(false)}
          onCapture={processPunch}
        />
      )}
    </div>
  );
}

