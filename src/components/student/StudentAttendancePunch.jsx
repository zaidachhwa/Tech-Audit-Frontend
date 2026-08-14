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
    <div className="max-w-4xl mx-auto px-4 pb-10 pt-4">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div style={{ width: 5, height: 28, background: "#0F3C8A", borderRadius: 4 }} />
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 m-0">My Attendance</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 relative z-10">
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1 m-0">
              {currentTime.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-blue-400" />
              <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
                {currentTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}
              </span>
            </div>
          </div>
          <div style={{
            padding: "6px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1,
            background: status === "PUNCHED_IN" ? "rgba(34,197,94,0.2)" : status === "PUNCHED_OUT" ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.1)",
            color: status === "PUNCHED_IN" ? "#4ade80" : status === "PUNCHED_OUT" ? "#a5b4fc" : "rgba(255,255,255,0.6)",
            width: "fit-content"
          }}>
            {status === "PUNCHED_IN" ? "● Active" : status === "PUNCHED_OUT" ? "✓ Completed" : "Not Punched"}
          </div>
        </div>

        {/* Punch Times */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 relative z-10">
          <div className="bg-white/10 rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <LogIn size={14} className="text-green-400" />
              <span className="text-[10px] sm:text-xs font-bold text-white/50 uppercase tracking-widest">Punch In</span>
            </div>
            <p className="text-base sm:text-lg font-extrabold text-white m-0">
              {todayRecord?.punchInTime ? formatTime(todayRecord.punchInTime) : "—"}
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <LogOut size={14} className="text-red-400" />
              <span className="text-[10px] sm:text-xs font-bold text-white/50 uppercase tracking-widest">Punch Out</span>
            </div>
            <p className="text-base sm:text-lg font-extrabold text-white m-0">
              {todayRecord?.punchOutTime ? formatTime(todayRecord.punchOutTime) : "—"}
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 sm:p-4 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Clock size={14} className="text-blue-400" />
              <span className="text-[10px] sm:text-xs font-bold text-white/50 uppercase tracking-widest">Total Hours</span>
            </div>
            <p className="text-base sm:text-lg font-extrabold text-white m-0">
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
              className="hover:opacity-90 active:scale-95"
              style={{
                display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 48px",
                background: "linear-gradient(135deg, #22c55e, #16a34a)", border: "none", borderRadius: 12,
                color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer",
                transition: "opacity 0.15s, transform 0.15s", opacity: punching ? 0.7 : 1
              }}
            >
              <Fingerprint size={20} /> {punching ? "Punching In..." : "Punch In"}
            </button>
          )}

          {status === "PUNCHED_IN" && (
            <button
              onClick={() => handlePunchClick('out')}
              disabled={punching}
              className="hover:opacity-90 active:scale-95"
              style={{
                display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 48px",
                background: "linear-gradient(135deg, #ef4444, #dc2626)", border: "none", borderRadius: 12,
                color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer",
                transition: "opacity 0.15s, transform 0.15s", opacity: punching ? 0.7 : 1
              }}
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {[
          { label: "Days Logged", value: totalDays, icon: Calendar, color: "#3b82f6", bg: "rgba(59,130,246,0.08)" },
          { label: "Full Days", value: punchedDays, icon: CheckCircle2, color: "#22c55e", bg: "rgba(34,197,94,0.08)" },
          { label: "Avg Hours/Day", value: avgHours, icon: Clock, color: "#8b5cf6", bg: "rgba(139,92,246,0.08)" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center justify-between sm:block">
            <div className="flex items-center gap-2 sm:mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: stat.bg }}>
                <stat.icon size={16} style={{ color: stat.color }} />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-800 m-0">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── MONTH LOG ── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden mb-6">
        {/* Month Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 border-b border-slate-100 gap-3">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-800 m-0">Attendance Log</h2>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button onClick={prevMonth} className="p-1.5 border border-slate-200 rounded-md bg-white flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
              <ChevronLeft size={16} className="text-slate-500" />
            </button>
            <span className="text-sm font-bold text-slate-700 min-w-[130px] text-center">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button onClick={nextMonth} className="p-1.5 border border-slate-200 rounded-md bg-white flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
              <ChevronRight size={16} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-10 text-center text-slate-400 text-sm">Loading...</div>
        ) : monthRecords.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">No attendance records for this month.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[550px] border-collapse text-[13px]">
              <thead>
                <tr className="bg-slate-50">
                  {["Date", "Punch In", "Punch Out", "Total Hours", "Status", ""].map((h, i) => (
                    <th key={i} className="px-3.5 py-2.5 text-left font-bold text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-100">
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

