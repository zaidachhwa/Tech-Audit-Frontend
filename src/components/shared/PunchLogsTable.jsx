import { useState, useEffect, useMemo } from "react";
import { API } from "../../api/axios";
import toast from "react-hot-toast";
import {
  Clock,
  User,
  BookOpen,
  Calendar,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  FileText,
  Filter,
  Search,
  RefreshCw,
  X,
  Users,
} from "lucide-react";

export default function PunchLogsTable({ isAdmin = false }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [teacherFilter, setTeacherFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");
  const [dateRangeMode, setDateRangeMode] = useState("all"); // "all" | "week" | "month" | "custom"
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetched lists
  const [fetchedTeachers, setFetchedTeachers] = useState([]);
  const [fetchedBatches, setFetchedBatches] = useState([]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchPunchLogs();
  }, [dateRangeMode, startDate, endDate, teacherFilter, batchFilter, statusFilter]);

  const fetchFilterOptions = async () => {
    try {
      const [tRes, bRes] = await Promise.all([
        API.get("/teachers/list").catch(() => ({ data: [] })),
        API.get("/batches").catch(() => ({ data: [] })),
      ]);

      const teachersData = tRes.data?.teachers || (Array.isArray(tRes.data) ? tRes.data : []);
      const batchesData = bRes.data?.batches || (Array.isArray(bRes.data) ? bRes.data : []);

      setFetchedTeachers(teachersData);
      setFetchedBatches(batchesData);
    } catch (err) {
      console.error("Failed to load filter options:", err);
    }
  };

  const fetchPunchLogs = async () => {
    try {
      setLoading(true);

      let queryParams = [];
      if (statusFilter !== "all") queryParams.push(`status=${statusFilter}`);
      if (teacherFilter !== "all") queryParams.push(`teacherId=${teacherFilter}`);
      if (batchFilter !== "all") queryParams.push(`batchId=${batchFilter}`);

      if (dateRangeMode === "custom") {
        if (startDate) queryParams.push(`startDate=${startDate}`);
        if (endDate) queryParams.push(`endDate=${endDate}`);
      } else if (dateRangeMode === "week") {
        const now = new Date();
        const first = now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1);
        const monday = new Date(now.setDate(first));
        monday.setHours(0, 0, 0, 0);
        const sunday = new Date(monday);
        sunday.setDate(sunday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);
        queryParams.push(`startDate=${monday.toISOString().split("T")[0]}`);
        queryParams.push(`endDate=${sunday.toISOString().split("T")[0]}`);
      } else if (dateRangeMode === "month") {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        queryParams.push(`startDate=${firstDay.toISOString().split("T")[0]}`);
        queryParams.push(`endDate=${lastDay.toISOString().split("T")[0]}`);
      }

      const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
      const res = await API.get(`/punch/logs${queryString}`);
      setLogs(res.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load punch logs");
    } finally {
      setLoading(false);
    }
  };

  // Build combined Teachers options dropdown
  const teachersOptions = useMemo(() => {
    const map = new Map();
    fetchedTeachers.forEach((t) => {
      if (t && t._id) map.set(String(t._id), { _id: String(t._id), name: t.name || t.email });
    });
    logs.forEach((log) => {
      if (log.teacher && log.teacher._id) {
        map.set(String(log.teacher._id), {
          _id: String(log.teacher._id),
          name: log.teacher.name || log.teacher.email || "Teacher",
        });
      }
    });
    return Array.from(map.values());
  }, [fetchedTeachers, logs]);

  // Build combined Batches options dropdown
  const batchesOptions = useMemo(() => {
    const map = new Map();
    fetchedBatches.forEach((b) => {
      if (b && b._id) {
        map.set(String(b._id), {
          _id: String(b._id),
          label: `${b.batch_name || "Batch"} (${b.batch_no || ""})`,
        });
      }
    });
    logs.forEach((log) => {
      if (log.batch && log.batch._id) {
        map.set(String(log.batch._id), {
          _id: String(log.batch._id),
          label: `${log.batch.batch_name || "Batch"} (${log.batch.batch_no || ""})`,
        });
      }
    });
    return Array.from(map.values());
  }, [fetchedBatches, logs]);

  // Comprehensive Client-side Filter
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 1. Status Filter
      if (statusFilter !== "all" && log.status !== statusFilter) return false;

      // 2. Teacher Filter
      if (teacherFilter !== "all") {
        const logTeacherId = String(log.teacher?._id || log.teacher || "");
        if (logTeacherId !== String(teacherFilter)) return false;
      }

      // 3. Batch Filter
      if (batchFilter !== "all") {
        const logBatchId = String(log.batch?._id || log.batch || "");
        if (logBatchId !== String(batchFilter)) return false;
      }

      // 4. Date Filter
      const logDate = new Date(log.scheduledDate || log.punchInTime || log.createdAt);
      if (dateRangeMode === "week") {
        const now = new Date();
        const first = now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1);
        const monday = new Date(now.setDate(first));
        monday.setHours(0, 0, 0, 0);
        const sunday = new Date(monday);
        sunday.setDate(sunday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);
        if (logDate < monday || logDate > sunday) return false;
      } else if (dateRangeMode === "month") {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        if (logDate < firstDay || logDate > lastDay) return false;
      } else if (dateRangeMode === "custom") {
        if (startDate) {
          const s = new Date(startDate);
          s.setHours(0, 0, 0, 0);
          if (logDate < s) return false;
        }
        if (endDate) {
          const e = new Date(endDate);
          e.setHours(23, 59, 59, 999);
          if (logDate > e) return false;
        }
      }

      // 5. Search Query
      if (searchQuery.trim()) {
        const searchLower = searchQuery.toLowerCase();
        const teacherName = log.teacher?.name?.toLowerCase() || "";
        const subject = log.subject?.toLowerCase() || "";
        const title = log.lectureTitle?.toLowerCase() || "";
        const batchName = log.batch?.batch_name?.toLowerCase() || "";
        const inNotes = log.punchInNotes?.toLowerCase() || "";
        const outNotes = log.punchOutNotes?.toLowerCase() || "";

        const matches =
          teacherName.includes(searchLower) ||
          subject.includes(searchLower) ||
          title.includes(searchLower) ||
          batchName.includes(searchLower) ||
          inNotes.includes(searchLower) ||
          outNotes.includes(searchLower);

        if (!matches) return false;
      }

      return true;
    });
  }, [logs, statusFilter, teacherFilter, batchFilter, dateRangeMode, startDate, endDate, searchQuery]);

  const calculateDuration = (inTime, outTime) => {
    if (!inTime || !outTime) return "N/A";
    const start = new Date(inTime);
    const end = new Date(outTime);
    const diffMs = end - start;
    if (diffMs <= 0) return "0 mins";
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins} mins`;
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTeacherFilter("all");
    setBatchFilter("all");
    setDateRangeMode("all");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div style={S.container}>
      {/* Header */}
      <div style={S.headerRow}>
        <div>
          <h3 style={S.title}>
            <Clock size={20} color="#2563EB" style={{ flexShrink: 0 }} />
            <span>Lecture Punch In & Punch Out Audit Logs</span>
          </h3>
          <p style={S.subtitle}>
            Filter and audit teacher check-in times, planned topics, actual taught topics, and attachments.
          </p>
        </div>

        <button onClick={fetchPunchLogs} style={S.refreshBtn} title="Refresh Logs">
          <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
        </button>
      </div>

      {/* ─── ENHANCED FILTER BAR ─── */}
      <div style={S.filterBox}>
        <div style={S.filterGrid}>
          {/* Search Box */}
          <div style={S.fieldCol}>
            <label style={S.fieldLabel}>Search Lecture / Subject</label>
            <div style={S.searchWrapper}>
              <Search size={15} style={S.searchIcon} />
              <input
                type="text"
                placeholder="Lecture, subject, topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={S.searchInput}
              />
            </div>
          </div>

          {/* Date Period Filter */}
          <div style={S.fieldCol}>
            <label style={S.fieldLabel}>Date Range</label>
            <select
              value={dateRangeMode}
              onChange={(e) => setDateRangeMode(e.target.value)}
              style={S.select}
            >
              <option value="all">All Dates</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Customized Dates</option>
            </select>
          </div>

          {/* Custom Date Pickers */}
          {dateRangeMode === "custom" && (
            <>
              <div style={S.fieldCol}>
                <label style={S.fieldLabel}>From Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={S.dateInput}
                />
              </div>
              <div style={S.fieldCol}>
                <label style={S.fieldLabel}>To Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={S.dateInput}
                />
              </div>
            </>
          )}

          {/* Teacher Selector (Admin Only) */}
          {isAdmin && (
            <div style={S.fieldCol}>
              <label style={S.fieldLabel}>Filter by Teacher</label>
              <select
                value={teacherFilter}
                onChange={(e) => setTeacherFilter(e.target.value)}
                style={S.select}
              >
                <option value="all">All Teachers ({teachersOptions.length})</option>
                {teachersOptions.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Batch Selector */}
          <div style={S.fieldCol}>
            <label style={S.fieldLabel}>Filter by Batch</label>
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              style={S.select}
            >
              <option value="all">All Batches ({batchesOptions.length})</option>
              {batchesOptions.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Selector */}
          <div style={S.fieldCol}>
            <label style={S.fieldLabel}>Punch Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={S.select}
            >
              <option value="all">All Statuses</option>
              <option value="PUNCHED_IN">In Progress (Punched In)</option>
              <option value="PUNCHED_OUT">Completed (Punched Out)</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button onClick={clearAllFilters} style={S.clearBtn}>
              <X size={14} /> Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={S.loadingBox}>Loading punch logs...</div>
      ) : filteredLogs.length === 0 ? (
        <div style={S.emptyBox}>No punch records match your selected filters.</div>
      ) : (
        <div style={S.tableWrapper}>
          <table style={S.table}>
            <thead>
              <tr style={S.thRow}>
                {isAdmin && <th style={S.th}>Teacher</th>}
                <th style={S.th}>Lecture & Subject</th>
                <th style={S.th}>Batch</th>
                <th style={S.th}>Scheduled Date</th>
                <th style={S.th}>Punch In Details</th>
                <th style={S.th}>Punch Out Details</th>
                <th style={S.th}>Duration</th>
                <th style={S.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log._id} style={S.tr}>
                  {isAdmin && (
                    <td style={S.td}>
                      <div style={{ fontWeight: 600, color: "#1E293B" }}>
                        {log.teacher?.name || "Unassigned"}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748B" }}>
                        {log.teacher?.email}
                      </div>
                    </td>
                  )}
                  <td style={S.td}>
                    <div style={{ fontWeight: 600, color: "#0F172A" }}>
                      {log.lectureTitle || "Lecture"}
                    </div>
                    <div style={{ fontSize: 12, color: "#2563EB", fontWeight: 500 }}>
                      {log.subject}
                    </div>
                  </td>
                  <td style={S.td}>
                    {log.batch?.batch_name ? (
                      <span style={S.batchBadge}>
                        {log.batch.batch_name} ({log.batch.batch_no || "N/A"})
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td style={S.td}>
                    <div style={{ fontSize: 12, color: "#334155" }}>
                      {log.scheduledDate
                        ? new Date(log.scheduledDate).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "TBD"}
                    </div>
                    {log.scheduledTimeSlot && (
                      <div style={{ fontSize: 11, color: "#64748B" }}>
                        ⏰ {log.scheduledTimeSlot}
                      </div>
                    )}
                  </td>
                  {/* Punch In */}
                  <td style={S.td}>
                    {log.punchInTime ? (
                      <div>
                        <div style={S.timestampLabel}>
                          🕒 {new Date(log.punchInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                        <div style={S.notesBox}>
                          <strong>Planned:</strong> {log.punchInNotes || "No notes"}
                        </div>
                        {log.punchInFile?.fileUrl && (
                          <a
                            href={`${log.punchInFile.fileUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={S.fileLink}
                          >
                            <Paperclip size={12} /> {log.punchInFile.fileName || "View File"}
                          </a>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: "#94A3B8" }}>Not Punched In</span>
                    )}
                  </td>
                  {/* Punch Out */}
                  <td style={S.td}>
                    {log.punchOutTime ? (
                      <div>
                        <div style={S.timestampLabelDone}>
                          ✅ {new Date(log.punchOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                        <div style={S.notesBox}>
                          <strong>Taught:</strong> {log.punchOutNotes || "No notes"}
                        </div>
                        {log.punchOutFile?.fileUrl && (
                          <a
                            href={`${log.punchOutFile.fileUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={S.fileLink}
                          >
                            <Paperclip size={12} /> {log.punchOutFile.fileName || "View File"}
                          </a>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: "#94A3B8" }}>In Progress / Pending</span>
                    )}
                  </td>
                  <td style={S.td}>
                    <span style={{ fontWeight: 600, fontSize: 12, color: "#475569" }}>
                      {calculateDuration(log.punchInTime, log.punchOutTime)}
                    </span>
                  </td>
                  <td style={S.td}>
                    {log.status === "PUNCHED_OUT" ? (
                      <span style={S.statusDone}>
                        <CheckCircle2 size={13} /> Completed
                      </span>
                    ) : (
                      <span style={S.statusInProg}>
                        <Clock size={13} /> Punched In
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const S = {
  container: {
    background: "#ffffff",
    borderRadius: "14px",
    border: "1.5px solid #E2E8F0",
    padding: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "16px",
  },
  title: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#0F172A",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  subtitle: {
    fontSize: "12px",
    color: "#64748B",
    margin: "4px 0 0",
  },
  refreshBtn: {
    background: "#F1F5F9",
    border: "1px solid #CBD5E1",
    borderRadius: "8px",
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#334155",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  filterBox: {
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: "10px",
    padding: "14px",
    marginBottom: "18px",
  },
  filterGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    alignItems: "center",
  },
  fieldCol: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  fieldLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  },
  searchWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: "10px",
    color: "#94A3B8",
  },
  searchInput: {
    paddingLeft: "32px",
    paddingRight: "12px",
    paddingTop: "6px",
    paddingBottom: "6px",
    borderRadius: "8px",
    border: "1.5px solid #CBD5E1",
    fontSize: "13px",
    outline: "none",
    width: "190px",
    background: "#fff",
  },
  select: {
    padding: "6px 10px",
    borderRadius: "8px",
    border: "1.5px solid #CBD5E1",
    fontSize: "13px",
    outline: "none",
    background: "#fff",
    color: "#1E293B",
  },
  dateInput: {
    padding: "5px 10px",
    borderRadius: "8px",
    border: "1.5px solid #CBD5E1",
    fontSize: "12px",
    outline: "none",
    background: "#fff",
    color: "#1E293B",
  },
  clearBtn: {
    background: "#FFFFFF",
    border: "1px solid #CBD5E1",
    color: "#64748B",
    borderRadius: "8px",
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    height: "32px",
  },
  loadingBox: {
    padding: "30px",
    textAlign: "center",
    color: "#64748B",
    fontSize: "14px",
  },
  emptyBox: {
    padding: "30px",
    textAlign: "center",
    color: "#94A3B8",
    fontSize: "14px",
    background: "#F8FAFC",
    borderRadius: "8px",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px",
  },
  thRow: {
    background: "#F1F5F9",
    borderBottom: "2px solid #E2E8F0",
  },
  th: {
    padding: "10px 12px",
    textAlign: "left",
    fontWeight: "700",
    color: "#475569",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  },
  tr: {
    borderBottom: "1px solid #E2E8F0",
    transition: "background 0.15s",
  },
  td: {
    padding: "12px",
    verticalAlign: "top",
  },
  batchBadge: {
    background: "#EFF6FF",
    color: "#1D4ED8",
    padding: "3px 8px",
    borderRadius: "6px",
    fontWeight: "600",
    fontSize: "11px",
    display: "inline-block",
  },
  timestampLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#D97706",
    marginBottom: "4px",
  },
  timestampLabelDone: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#15803D",
    marginBottom: "4px",
  },
  notesBox: {
    background: "#F8FAFC",
    borderLeft: "3px solid #CBD5E1",
    padding: "6px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    color: "#334155",
    marginTop: "2px",
    maxWidth: "240px",
    wordBreak: "break-word",
  },
  fileLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "11px",
    color: "#2563EB",
    fontWeight: "600",
    marginTop: "4px",
    textDecoration: "none",
  },
  statusDone: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 10px",
    borderRadius: "20px",
    background: "#DCFCE7",
    color: "#15803D",
    fontWeight: "700",
    fontSize: "11px",
  },
  statusInProg: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 10px",
    borderRadius: "20px",
    background: "#FEF3C7",
    color: "#B45309",
    fontWeight: "700",
    fontSize: "11px",
  },
};
