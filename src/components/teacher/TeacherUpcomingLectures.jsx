import { useState, useEffect } from "react";
import { API } from "../../api/axios";
import toast from "react-hot-toast";
import {
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  LogIn,
  LogOut,
  Paperclip,
  AlertCircle,
  FileText,
  RefreshCw,
  Sparkles,
  ChevronRight,
} from "lucide-react";

export default function TeacherUpcomingLectures({ onRefreshLogs }) {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  // Form states per lecture
  const [punchInNotesMap, setPunchInNotesMap] = useState({});
  const [punchOutNotesMap, setPunchOutNotesMap] = useState({});
  const [punchInFileMap, setPunchInFileMap] = useState({});
  const [punchOutFileMap, setPunchOutFileMap] = useState({});

  const [submittingId, setSubmittingId] = useState(null);

  // Live timer tick every 5 seconds to update time evaluation automatically
  useEffect(() => {
    fetchUpcomingLectures();
    const interval = setInterval(() => {
      setNow(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchUpcomingLectures = async () => {
    try {
      setLoading(true);
      const res = await API.get("/punch/upcoming");
      setLectures(res.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load upcoming lectures");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Determine if Punch In should be enabled based on scheduled date & time
   */
  const checkIsTimeReached = (lecture) => {
    if (!lecture.date) return true; // fallback to enable if no date set

    const schedDate = new Date(lecture.date);

    // If time_slot is provided like "15:30" or "15:30 - 16:30"
    if (lecture.time_slot && typeof lecture.time_slot === "string") {
      const match = lecture.time_slot.match(/(\d{1,2}):(\d{2})/);
      if (match) {
        const hours = parseInt(match[1], 10);
        const mins = parseInt(match[2], 10);
        schedDate.setHours(hours, mins, 0, 0);
      }
    }

    // Is current time >= scheduled start time?
    return now >= schedDate;
  };

  const formatScheduledTime = (lecture) => {
    if (!lecture.date) return "N/A";
    const d = new Date(lecture.date);
    const dateStr = d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    if (lecture.time_slot) {
      return `${dateStr} @ ${lecture.time_slot}`;
    }
    return dateStr;
  };

  const handlePunchIn = async (lec) => {
    const notes = punchInNotesMap[lec._id] || "";
    if (!notes.trim()) {
      return toast.error("Please enter what you are going to teach before punching in.");
    }

    try {
      setSubmittingId(lec._id);
      const formData = new FormData();
      if (lec.scheduleId) formData.append("scheduleId", lec.scheduleId);
      if (lec.batchLectureId) formData.append("batchLectureId", lec.batchLectureId);
      formData.append("lectureId", lec._id);
      formData.append("punchInNotes", notes);

      const file = punchInFileMap[lec._id];
      if (file) {
        formData.append("file", file);
      }

      const res = await API.post("/punch/in", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data?.message || "Punched In successfully!");
      fetchUpcomingLectures();
      if (onRefreshLogs) onRefreshLogs();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to Punch In.");
    } finally {
      setSubmittingId(null);
    }
  };

  const handlePunchOut = async (lec) => {
    const notes = punchOutNotesMap[lec._id] || "";
    if (!notes.trim()) {
      return toast.error("Please enter what was taught in this lecture before punching out.");
    }

    try {
      setSubmittingId(lec._id);
      const formData = new FormData();
      if (lec.scheduleId) formData.append("scheduleId", lec.scheduleId);
      if (lec.batchLectureId) formData.append("batchLectureId", lec.batchLectureId);
      formData.append("lectureId", lec._id);
      formData.append("punchOutNotes", notes);

      const file = punchOutFileMap[lec._id];
      if (file) {
        formData.append("file", file);
      }

      const res = await API.post("/punch/out", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data?.message || "Punched Out successfully!");
      fetchUpcomingLectures();
      if (onRefreshLogs) onRefreshLogs();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to Punch Out.");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div style={S.card}>
      <div style={S.header}>
        <div>
          <div style={S.badgeRow}>
            <span style={S.liveBadge}>
              <Sparkles size={13} /> LIVE DASHBOARD
            </span>
            <span style={S.clockDisplay}>
              ⏰ Current Time: {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          </div>
          <h2 style={S.title}>Upcoming & Active Scheduled Lectures</h2>
          <p style={S.subtitle}>
            Punch in when your lecture time arrives. Add planned topics and optional files before check-in.
          </p>
        </div>
        <button onClick={fetchUpcomingLectures} style={S.refreshBtn} title="Refresh Scheduled Lectures">
          <RefreshCw size={15} className={loading ? "spin" : ""} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={S.loadingBox}>Loading upcoming scheduled lectures...</div>
      ) : lectures.length === 0 ? (
        <div style={S.emptyBox}>
          <Calendar size={32} color="#94A3B8" style={{ marginBottom: 8 }} />
          <div>No upcoming lectures scheduled for you right now.</div>
        </div>
      ) : (
        <div style={S.grid}>
          {lectures.map((lec) => {
            const isTimeReached = checkIsTimeReached(lec);
            const isPunchedIn = lec.punchStatus === "PUNCHED_IN";
            const isPunchedOut = lec.punchStatus === "PUNCHED_OUT";

            const inNotes = punchInNotesMap[lec._id] || "";
            const outNotes = punchOutNotesMap[lec._id] || "";

            const isPunchInBtnDisabled = !isTimeReached || !inNotes.trim() || submittingId === lec._id;
            const isPunchOutBtnDisabled = !outNotes.trim() || submittingId === lec._id;

            return (
              <div
                key={lec._id}
                style={{
                  ...S.lectureCard,
                  borderColor: isPunchedIn ? "#F59E0B" : isPunchedOut ? "#10B981" : "#E2E8F0",
                }}
              >
                {/* Lecture Meta */}
                <div style={S.cardTop}>
                  <div>
                    <span style={S.subjectBadge}>{lec.subject}</span>
                    <h4 style={S.lecTitle}>{lec.title}</h4>
                    <div style={S.metaText}>
                      🎓 Batch: <strong>{lec.batch?.batch_name || "N/A"} ({lec.batch?.batch_no || ""})</strong>
                    </div>
                    <div style={S.metaText}>
                      📅 Scheduled: <strong>{formatScheduledTime(lec)}</strong>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div>
                    {isPunchedOut ? (
                      <span style={S.statusBadgeCompleted}>
                        <CheckCircle2 size={13} /> Completed
                      </span>
                    ) : isPunchedIn ? (
                      <span style={S.statusBadgeInProg}>
                        <Clock size={13} /> Punched In
                      </span>
                    ) : !isTimeReached ? (
                      <span style={S.statusBadgePending}>
                        🔒 Starts at {lec.time_slot || "scheduled time"}
                      </span>
                    ) : (
                      <span style={S.statusBadgeReady}>
                        ⚡ Ready to Punch In
                      </span>
                    )}
                  </div>
                </div>

                <hr style={S.divider} />

                {/* ─── STATE 1: PENDING PUNCH IN ─── */}
                {!isPunchedIn && !isPunchedOut && (
                  <div style={S.actionArea}>
                    {!isTimeReached && (
                      <div style={S.timeNotice}>
                        <AlertCircle size={14} color="#D97706" />
                        Punch In will be enabled automatically at lecture time (
                        {lec.time_slot || formatScheduledTime(lec)}).
                      </div>
                    )}

                    <label style={S.label}>
                      What are you going to teach in this lecture? <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <textarea
                      placeholder="Enter planned topics, syllabus chapters, or objectives..."
                      value={inNotes}
                      onChange={(e) =>
                        setPunchInNotesMap((prev) => ({ ...prev, [lec._id]: e.target.value }))
                      }
                      style={S.textarea}
                      rows={2}
                    />

                    {/* Optional File Upload */}
                    <div style={S.fileRow}>
                      <label style={S.fileLabel}>
                        <Paperclip size={13} /> Attach Teaching File (Optional):
                      </label>
                      <input
                        type="file"
                        onChange={(e) =>
                          setPunchInFileMap((prev) => ({
                            ...prev,
                            [lec._id]: e.target.files[0] || null,
                          }))
                        }
                        style={S.fileInput}
                      />
                    </div>

                    <button
                      onClick={() => handlePunchIn(lec)}
                      disabled={isPunchInBtnDisabled}
                      style={{
                        ...S.punchInBtn,
                        opacity: isPunchInBtnDisabled ? 0.5 : 1,
                        cursor: isPunchInBtnDisabled ? "not-allowed" : "pointer",
                      }}
                    >
                      <LogIn size={16} />
                      {!isTimeReached
                        ? "Punch In Disabled (Time Not Reached)"
                        : !inNotes.trim()
                        ? "Enter Topic to Enable Punch In"
                        : submittingId === lec._id
                        ? "Punching In..."
                        : "Punch In & Record Time"}
                    </button>
                  </div>
                )}

                {/* ─── STATE 2: PUNCHED IN / READY TO PUNCH OUT ─── */}
                {isPunchedIn && !isPunchedOut && (
                  <div style={S.actionArea}>
                    <div style={S.punchInSuccessBox}>
                      <div style={{ fontWeight: 600, color: "#92400E" }}>
                        ✅ Punched In at:{" "}
                        {lec.punchInTime
                          ? new Date(lec.punchInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : "Recorded"}
                      </div>
                      <div style={{ fontSize: 12, color: "#78350F", marginTop: 4 }}>
                        <strong>Planned Topic:</strong> {lec.punchInNotes || "N/A"}
                      </div>
                      {lec.punchInFile?.fileUrl && (
                        <a href={lec.punchInFile.fileUrl} target="_blank" rel="noopener noreferrer" style={S.attachmentLink}>
                          📎 Attached File
                        </a>
                      )}
                    </div>

                    <label style={{ ...S.label, marginTop: 12 }}>
                      What was taught in this lecture? <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <textarea
                      placeholder="Enter details of topics covered, completed chapters, student responses..."
                      value={outNotes}
                      onChange={(e) =>
                        setPunchOutNotesMap((prev) => ({ ...prev, [lec._id]: e.target.value }))
                      }
                      style={S.textarea}
                      rows={2}
                    />

                    {/* Optional File Upload */}
                    <div style={S.fileRow}>
                      <label style={S.fileLabel}>
                        <Paperclip size={13} /> Attach Notes / File (Optional):
                      </label>
                      <input
                        type="file"
                        onChange={(e) =>
                          setPunchOutFileMap((prev) => ({
                            ...prev,
                            [lec._id]: e.target.files[0] || null,
                          }))
                        }
                        style={S.fileInput}
                      />
                    </div>

                    <button
                      onClick={() => handlePunchOut(lec)}
                      disabled={isPunchOutBtnDisabled}
                      style={{
                        ...S.punchOutBtn,
                        opacity: isPunchOutBtnDisabled ? 0.5 : 1,
                        cursor: isPunchOutBtnDisabled ? "not-allowed" : "pointer",
                      }}
                    >
                      <LogOut size={16} />
                      {!outNotes.trim()
                        ? "Enter Taught Topic to Enable Punch Out"
                        : submittingId === lec._id
                        ? "Punching Out..."
                        : "Punch Out & Complete Lecture"}
                    </button>
                  </div>
                )}

                {/* ─── STATE 3: PUNCHED OUT / COMPLETED ─── */}
                {isPunchedOut && (
                  <div style={S.completedBox}>
                    <div style={S.completedHeader}>
                      <CheckCircle2 size={18} color="#059669" />
                      <strong>Lecture Punch Log Complete</strong>
                    </div>

                    <div style={S.logSummaryGrid}>
                      <div>
                        <div style={S.logSubHeading}>Punch In Time</div>
                        <div style={S.logVal}>
                          {lec.punchInTime
                            ? new Date(lec.punchInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "N/A"}
                        </div>
                        <div style={S.logNotes}>
                          <strong>Planned:</strong> {lec.punchInNotes || "N/A"}
                        </div>
                      </div>

                      <div>
                        <div style={S.logSubHeading}>Punch Out Time</div>
                        <div style={S.logVal}>
                          {lec.punchOutTime
                            ? new Date(lec.punchOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "N/A"}
                        </div>
                        <div style={S.logNotes}>
                          <strong>Taught:</strong> {lec.punchOutNotes || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const S = {
  card: {
    background: "#ffffff",
    borderRadius: "16px",
    border: "1.5px solid #E2E8F0",
    padding: "24px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.03)",
    marginBottom: "24px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "20px",
  },
  badgeRow: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    marginBottom: "6px",
  },
  liveBadge: {
    background: "#EFF6FF",
    color: "#2563EB",
    fontWeight: "700",
    fontSize: "11px",
    padding: "3px 10px",
    borderRadius: "20px",
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    letterSpacing: "0.05em",
  },
  clockDisplay: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#475569",
    background: "#F8FAFC",
    padding: "3px 10px",
    borderRadius: "6px",
  },
  title: {
    fontSize: "19px",
    fontWeight: "700",
    color: "#0F172A",
    margin: 0,
  },
  subtitle: {
    fontSize: "13px",
    color: "#64748B",
    margin: "4px 0 0",
  },
  refreshBtn: {
    background: "#F1F5F9",
    border: "1px solid #CBD5E1",
    borderRadius: "8px",
    padding: "8px 14px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#334155",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  loadingBox: {
    textAlign: "center",
    padding: "40px",
    color: "#64748B",
    fontSize: "14px",
  },
  emptyBox: {
    textAlign: "center",
    padding: "40px",
    color: "#64748B",
    fontSize: "14px",
    background: "#F8FAFC",
    borderRadius: "12px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
    gap: "18px",
  },
  lectureCard: {
    background: "#ffffff",
    borderRadius: "12px",
    border: "2px solid #E2E8F0",
    padding: "18px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
  },
  subjectBadge: {
    background: "#DBEAFE",
    color: "#1E40AF",
    fontWeight: "700",
    fontSize: "11px",
    padding: "2px 8px",
    borderRadius: "4px",
    textTransform: "uppercase",
  },
  lecTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#0F172A",
    margin: "6px 0 4px",
  },
  metaText: {
    fontSize: "12px",
    color: "#475569",
    marginTop: "2px",
  },
  statusBadgeReady: {
    background: "#FEF3C7",
    color: "#B45309",
    fontWeight: "700",
    fontSize: "11px",
    padding: "4px 10px",
    borderRadius: "20px",
  },
  statusBadgePending: {
    background: "#F1F5F9",
    color: "#64748B",
    fontWeight: "600",
    fontSize: "11px",
    padding: "4px 10px",
    borderRadius: "20px",
  },
  statusBadgeInProg: {
    background: "#FFFBEB",
    color: "#D97706",
    fontWeight: "700",
    fontSize: "11px",
    padding: "4px 10px",
    borderRadius: "20px",
  },
  statusBadgeCompleted: {
    background: "#DCFCE7",
    color: "#15803D",
    fontWeight: "700",
    fontSize: "11px",
    padding: "4px 10px",
    borderRadius: "20px",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  },
  divider: {
    margin: "14px 0",
    border: "none",
    borderTop: "1px solid #F1F5F9",
  },
  actionArea: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  timeNotice: {
    background: "#FFFBEB",
    border: "1px solid #FDE68A",
    padding: "8px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    color: "#92400E",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  label: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#334155",
  },
  textarea: {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1.5px solid #CBD5E1",
    fontSize: "13px",
    fontFamily: "inherit",
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
  },
  fileRow: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  fileLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#64748B",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  fileInput: {
    fontSize: "12px",
    color: "#475569",
  },
  punchInBtn: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#2563EB",
    color: "#ffffff",
    fontWeight: "700",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginTop: "6px",
  },
  punchOutBtn: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#D97706",
    color: "#ffffff",
    fontWeight: "700",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginTop: "6px",
  },
  punchInSuccessBox: {
    background: "#FEF3C7",
    border: "1px solid #FDE68A",
    borderRadius: "8px",
    padding: "10px",
  },
  attachmentLink: {
    fontSize: "11px",
    color: "#2563EB",
    fontWeight: "600",
    marginTop: "4px",
    display: "inline-block",
  },
  completedBox: {
    background: "#F0FDF4",
    border: "1px solid #BBF7D0",
    borderRadius: "8px",
    padding: "12px",
  },
  completedHeader: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "#166534",
    marginBottom: "10px",
  },
  logSummaryGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  logSubHeading: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#15803D",
    textTransform: "uppercase",
  },
  logVal: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#0F172A",
  },
  logNotes: {
    fontSize: "11px",
    color: "#334155",
    marginTop: "2px",
    wordBreak: "break-word",
  },
};
