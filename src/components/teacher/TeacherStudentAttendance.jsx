import { useState, useEffect, useCallback, Fragment } from "react";
import { API } from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Fingerprint, Search, Filter, ChevronDown, ChevronUp, CheckCircle2, XCircle,
  RefreshCw, Edit3, X, Clock, Calendar, Users, LogIn, LogOut, Save, AlertTriangle, Download, Camera
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function formatTime(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}
function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", weekday: "short" });
}
function calcHours(pi, po) {
  if (!pi || !po) return "—";
  const d = new Date(po) - new Date(pi);
  return `${Math.floor(d / 3600000)}h ${Math.floor((d % 3600000) / 60000)}m`;
}
function toInputDT(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function TeacherStudentAttendance() {
  const [records, setRecords] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  // Filters
  const [filterBatch, setFilterBatch] = useState("all");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Edit modal
  const [editRecord, setEditRecord] = useState(null);
  const [editPunchIn, setEditPunchIn] = useState("");
  const [editPunchOut, setEditPunchOut] = useState("");
  const [editReason, setEditReason] = useState("");
  const [saving, setSaving] = useState(false);

  // Image Modal
  // Image modal state removed

  const fetchBatches = async () => {
    try {
      const res = await API.get("/batches");
      setBatches(res.data.batches || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterBatch !== "all") params.batchId = filterBatch;
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      const res = await API.get("/attendance/student/records", { params });
      setRecords(res.data.records || []);
    } catch (err) {
      toast.error("Failed to load attendance logs");
    } finally {
      setLoading(false);
    }
  }, [filterBatch, filterStartDate, filterEndDate]);

  useEffect(() => { fetchBatches(); }, []);
  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const openEdit = (rec) => {
    setEditRecord(rec);
    setEditPunchIn(toInputDT(rec.punchInTime));
    setEditPunchOut(toInputDT(rec.punchOutTime));
    setEditReason("");
  };

  const handleSaveEdit = async () => {
    if (!editReason.trim()) {
      toast.error("Please provide a reason for the edit.");
      return;
    }
    try {
      setSaving(true);
      const body = { reason: editReason.trim() };
      if (editPunchIn) body.punchInTime = new Date(editPunchIn).toISOString();
      if (editPunchOut) body.punchOutTime = new Date(editPunchOut).toISOString();
      const res = await API.patch(`/attendance/student/${editRecord._id}/edit`, body);
      toast.success(res.data.message || "Updated successfully");
      setEditRecord(null);
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleApproveLate = async (id) => {
    try {
      const res = await API.put(`/attendance/student/approve-late/${id}`);
      toast.success(res.data.message || "Late attendance approved!");
      // Update locally
      setRecords(records.map(r => r._id === id ? res.data.record : r));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve late attendance");
    }
  };

  const handleRejectLate = async (id) => {
    try {
      const res = await API.put(`/attendance/student/reject-late/${id}`);
      toast.success(res.data.message || "Late attendance rejected!");
      // Update locally
      setRecords(records.map(r => r._id === id ? res.data.record : r));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject late attendance");
    }
  };

  const getDerivedStatus = (r) => {
    let derivedStatus = "Absent";
    let derivedAppStatus = r.lateApprovalStatus || "None";

    if (r.attendanceStatus === "Late") {
      derivedStatus = "Late";
    } else if (r.attendanceStatus === "Present") {
      derivedStatus = "Present";
    } else if (r.status !== "NOT_PUNCHED" && r.punchInTime) {
      // Retroactive check for old records
      const pin = new Date(r.punchInTime);
      const istTimeStr = pin.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit' });
      if (istTimeStr > "09:10") {
        derivedStatus = "Late";
        derivedAppStatus = "Pending";
      } else {
        derivedStatus = "Present";
      }
    }

    return { derivedStatus, derivedAppStatus };
  };

  // Client-side search & status filter
  const filtered = records.filter((r) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (r.student?.name || "").toLowerCase();
      const email = (r.student?.email || "").toLowerCase();
      const roll = (r.student?.rollNo || "").toLowerCase();
      if (!name.includes(q) && !email.includes(q) && !roll.includes(q)) return false;
    }
    
    const { derivedStatus } = getDerivedStatus(r);

    if (statusFilter === "P" && derivedStatus !== "Present") return false;
    if (statusFilter === "L" && derivedStatus !== "Late") return false;
    if (statusFilter === "A" && derivedStatus !== "Absent") return false;

    return true;
  });

  // Quick filter helpers
  const setThisWeek = () => {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    setFilterStartDate(monday.toISOString().split("T")[0]);
    setFilterEndDate(now.toISOString().split("T")[0]);
  };
  const setThisMonth = () => {
    const now = new Date();
    setFilterStartDate(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]);
    setFilterEndDate(now.toISOString().split("T")[0]);
  };
  const clearFilters = () => {
    setFilterBatch("all");
    setFilterStartDate("");
    setFilterEndDate("");
    setSearchQuery("");
  };

  const downloadPDF = () => {
    const doc = new jsPDF("landscape");
    doc.text("Student Attendance Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    const tableColumn = ["Student", "Roll No", "Batch", "Date", "Punch In", "Punch Out", "Hours", "Status"];
    const tableRows = [];

    filtered.forEach(rec => {
      const studentData = [
        rec.student?.name || "Unknown",
        rec.student?.rollNo || "—",
        `${rec.batch?.batch_name || "—"} ${rec.batch?.batch_no ? `#${rec.batch.batch_no}` : ""}`,
        formatDate(rec.date),
        formatTime(rec.punchInTime),
        formatTime(rec.punchOutTime),
        calcHours(rec.punchInTime, rec.punchOutTime),
        rec.status === "PUNCHED_OUT" ? "Complete" : rec.status === "PUNCHED_IN" ? "Active" : "Missing"
      ];
      tableRows.push(studentData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [15, 60, 138] },
    });

    doc.save("Student_Attendance_Report.pdf");
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px" }}>
      <Toaster position="top-center" />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ background: "#2563eb", color: "#fff", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>TEACHER</span>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a" }}>Student Attendance</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={downloadPDF} disabled={filtered.length === 0} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
            border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", cursor: "pointer",
            fontSize: 12, fontWeight: 700, color: "#0F3C8A", opacity: filtered.length === 0 ? 0.5 : 1
          }}>
            <Download size={14} /> Download PDF
          </button>
          <button onClick={fetchRecords} disabled={loading} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
            border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", cursor: "pointer",
            fontSize: 12, fontWeight: 700, color: "#475569"
          }}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        background: "#fff", borderRadius: 12, border: "1px solid #f1f5f9", padding: "16px 20px",
        marginBottom: 20, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Filter size={14} color="#64748b" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>Filters</span>
        </div>

        <select value={filterBatch} onChange={e => setFilterBatch(e.target.value)} style={{
          padding: "7px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, fontWeight: 600,
          color: "#334155", background: "#fff", minWidth: 160
        }}>
          <option value="all">All Batches</option>
          {batches.map(b => (
            <option key={b._id} value={b._id}>{b.batch_name} #{b.batch_no}</option>
          ))}
        </select>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)}
            style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, fontWeight: 600 }} />
          <span style={{ fontSize: 11, color: "#94a3b8" }}>to</span>
          <input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)}
            style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, fontWeight: 600 }} />
        </div>

        <button onClick={setThisWeek} style={{
          padding: "6px 12px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#f8fafc",
          fontSize: 11, fontWeight: 700, color: "#475569", cursor: "pointer"
        }}>This Week</button>

        <button onClick={setThisMonth} style={{
          padding: "6px 12px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#f8fafc",
          fontSize: 11, fontWeight: 700, color: "#475569", cursor: "pointer"
        }}>This Month</button>

        <button onClick={clearFilters} style={{
          padding: "6px 12px", borderRadius: 6, border: "1px solid #fecaca", background: "rgba(239,68,68,0.05)",
          fontSize: 11, fontWeight: 700, color: "#dc2626", cursor: "pointer"
        }}>Clear</button>

        <div style={{ display: "flex", gap: 4, background: "#f1f5f9", padding: 4, borderRadius: 8 }}>
          {["ALL", "P", "L", "A"].map(filter => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              style={{
                padding: "4px 10px",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                border: "none",
                background: statusFilter === filter ? "#0F3C8A" : "transparent",
                color: statusFilter === filter ? "#fff" : "#475569",
              }}
            >
              {filter}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: "auto", position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            placeholder="Search student..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              padding: "7px 12px 7px 32px", borderRadius: 8, border: "1px solid #e2e8f0",
              fontSize: 12, fontWeight: 600, minWidth: 200
            }}
          />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Records", value: filtered.length, icon: Calendar, color: "#3b82f6", bg: "rgba(59,130,246,0.08)" },
          { label: "Complete", value: filtered.filter(r => r.status === "PUNCHED_OUT").length, icon: CheckCircle2, color: "#22c55e", bg: "rgba(34,197,94,0.08)" },
          { label: "Active (In)", value: filtered.filter(r => r.status === "PUNCHED_IN").length, icon: Clock, color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
          { label: "Missing", value: filtered.filter(r => r.status === "NOT_PUNCHED").length, icon: XCircle, color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "#fff", borderRadius: 12, padding: "14px 16px", border: "1px solid #f1f5f9",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <s.icon size={14} style={{ color: s.color }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</span>
            </div>
            <p style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f1f5f9", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No attendance records found.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Student", "Batch", "Date", "Punch In", "Punch Out", "Hours", "Status", "Actions", ""].map((h, i) => (
                    <th key={i} style={{
                      padding: "10px 12px", textAlign: "left", fontWeight: 700, color: "#64748b",
                      fontSize: 10, textTransform: "uppercase", letterSpacing: 1, borderBottom: "1px solid #f1f5f9"
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((rec, idx) => {
                  const isExpanded = expandedRow === idx;
                  const hasLectures = rec.lectureAttendance?.length > 0;
                  const hasEdits = rec.editHistory?.length > 0;
                  
                  const { derivedStatus, derivedAppStatus } = getDerivedStatus(rec);

                  return (
                    <Fragment key={rec._id || idx}>
                      <tr style={{ borderBottom: "1px solid #f1f5f9", background: derivedStatus === "Late" && derivedAppStatus === "Pending" ? "rgba(254,226,226,0.5)" : "transparent" }}>
                        <td style={{ padding: "10px 12px" }}>
                          <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 12 }}>{rec.student?.name || "Unknown"}</div>
                          <div style={{ fontSize: 10, color: "#94a3b8" }}>{rec.student?.rollNo || rec.student?.email || ""}</div>
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 12, color: "#475569", fontWeight: 600 }}>
                          {rec.batch?.batch_name || "—"} {rec.batch?.batch_no ? `#${rec.batch.batch_no}` : ""}
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 12, fontWeight: 600, color: "#334155" }}>{formatDate(rec.date)}</td>
                        <td style={{ padding: "10px 12px", color: "#059669", fontWeight: 600, fontSize: 12 }}>{formatTime(rec.punchInTime)}</td>
                        <td style={{ padding: "10px 12px", color: "#dc2626", fontWeight: 600, fontSize: 12 }}>{formatTime(rec.punchOutTime)}</td>
                        <td style={{ padding: "10px 12px", color: "#6366f1", fontWeight: 700, fontSize: 12 }}>{calcHours(rec.punchInTime, rec.punchOutTime)}</td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{
                            padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                            background: derivedStatus === "Late" ? "rgba(239,68,68,0.1)" : derivedStatus === "Present" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
                            color: derivedStatus === "Late" ? "#dc2626" : derivedStatus === "Present" ? "#059669" : "#d97706",
                          }}>
                            {derivedStatus === "Late" ? "LATE" : derivedStatus === "Present" ? "PRESENT" : "ABSENT"}
                          </span>
                          {hasEdits && (
                            <span title="Edited by admin" style={{ marginLeft: 6, display: "inline-flex" }}>
                              <AlertTriangle size={12} style={{ color: "#f59e0b" }} />
                            </span>
                          )}
                        </td>

                        <td style={{ padding: "10px 12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            {rec.status !== "NOT_PUNCHED" && (
                              <button onClick={() => openEdit(rec)} style={{
                                display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6,
                                border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer",
                                fontSize: 11, fontWeight: 700, color: "#475569"
                              }}>
                                <Edit3 size={12} /> Edit
                              </button>
                            )}
                            {derivedStatus === "Late" && derivedAppStatus === "Pending" && (
                              <>
                                <button onClick={() => handleApproveLate(rec._id)} style={{
                                  display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6,
                                  border: "1px solid #bbf7d0", background: "#f0fdf4", cursor: "pointer",
                                  fontSize: 11, fontWeight: 700, color: "#166534"
                                }}>
                                  <CheckCircle2 size={12} /> Approve
                                </button>
                                <button onClick={() => handleRejectLate(rec._id)} style={{
                                  display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6,
                                  border: "1px solid #fecaca", background: "#fef2f2", cursor: "pointer",
                                  fontSize: 11, fontWeight: 700, color: "#991b1b"
                                }}>
                                  <XCircle size={12} /> Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          {hasLectures && (
                            <button onClick={() => setExpandedRow(isExpanded ? null : idx)} style={{
                              display: "flex", padding: 4, border: "none", background: "transparent", cursor: "pointer"
                            }}>
                              {isExpanded ? <ChevronUp size={14} color="#94a3b8" /> : <ChevronDown size={14} color="#94a3b8" />}
                            </button>
                          )}
                        </td>
                      </tr>
                      {isExpanded && hasLectures && (
                        <tr>
                          <td colSpan={9} style={{ padding: 0 }}>
                            <div style={{ background: "#f8fafc", padding: "12px 20px 12px 44px" }}>
                              <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
                                Lecture Attendance Breakdown
                              </p>
                              {rec.lectureAttendance.map((la, li) => (
                                <div key={li} style={{
                                  display: "flex", alignItems: "center", gap: 10, padding: "6px 0",
                                  borderBottom: li < rec.lectureAttendance.length - 1 ? "1px solid #e2e8f0" : "none"
                                }}>
                                  {la.status === "Present"
                                    ? <CheckCircle2 size={14} style={{ color: "#22c55e", flexShrink: 0 }} />
                                    : <XCircle size={14} style={{ color: "#ef4444", flexShrink: 0 }} />}
                                  <span style={{ fontSize: 12, fontWeight: 600, color: "#334155", flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {la.lectureTitle || "Untitled Lecture"} {la.subject ? `(${la.subject})` : ""}
                                  </span>
                                  <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{la.timeSlot || "—"}</span>
                                  <span style={{
                                    padding: "2px 8px", borderRadius: 12, fontSize: 10, fontWeight: 700,
                                    background: la.status === "Present" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                                    color: la.status === "Present" ? "#059669" : "#dc2626"
                                  }}>{la.status}</span>
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

      {/* ── EDIT MODAL ── */}
      {editRecord && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20
        }} onClick={() => setEditRecord(null)}>
          <div style={{
            background: "#fff", borderRadius: 16, width: "100%", maxWidth: 480, padding: 28,
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1e293b", margin: 0 }}>Edit Punch Time</h3>
              <button onClick={() => setEditRecord(null)} style={{ border: "none", background: "transparent", cursor: "pointer" }}>
                <X size={18} color="#94a3b8" />
              </button>
            </div>

            <div style={{ marginBottom: 16, padding: "12px 14px", background: "#f8fafc", borderRadius: 10 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", margin: "0 0 4px" }}>{editRecord.student?.name || "Student"}</p>
              <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>
                {editRecord.batch?.batch_name || ""} — {formatDate(editRecord.date)}
              </p>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
                <LogIn size={12} style={{ marginRight: 4, verticalAlign: "middle" }} /> Punch In Time
              </label>
              <input
                type="datetime-local"
                value={editPunchIn}
                onChange={e => setEditPunchIn(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, fontWeight: 600, boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
                <LogOut size={12} style={{ marginRight: 4, verticalAlign: "middle" }} /> Punch Out Time
              </label>
              <input
                type="datetime-local"
                value={editPunchOut}
                onChange={e => setEditPunchOut(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, fontWeight: 600, boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
                Reason for Edit *
              </label>
              <textarea
                rows={3}
                value={editReason}
                onChange={e => setEditReason(e.target.value)}
                placeholder="Why are you editing this record?"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, fontWeight: 600, resize: "vertical", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setEditRecord(null)} style={{
                padding: "10px 20px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff",
                fontSize: 13, fontWeight: 700, color: "#64748b", cursor: "pointer"
              }}>Cancel</button>
              <button onClick={handleSaveEdit} disabled={saving} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "10px 24px", borderRadius: 8,
                border: "none", background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff",
                fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: saving ? 0.7 : 1,
                boxShadow: "0 2px 10px rgba(37,99,235,0.3)"
              }}>
                <Save size={14} /> {saving ? "Saving..." : "Save & Recalculate"}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
