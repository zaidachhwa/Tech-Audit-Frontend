// src/components/teacher/TeacherAttendance.jsx
import { useState, useEffect, useRef } from "react";
import { API } from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Download, RefreshCw, ChevronLeft, ChevronRight,
  Users, CheckCircle2, XCircle, Clock, CalendarDays, Save, ChevronDown, Search, HelpCircle
} from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const pad2 = (n) => String(n).padStart(2, "0");

const getBatchName = (b) => {
  const name = b?.name || b?.batchName || b?.title || b?.batch_name || b?.label || "Unnamed";
  if (b?.batch_no || b?.batchNo) return `${name} #${b.batch_no || b.batchNo}`;
  return b?._id || name;
};

// Cycle Order: P -> A -> L -> P
const STATUS_CYCLE = ["P", "A", "L"];

const STATUS_META = {
  P: { label: "P", full: "Present", bg: "rgba(16, 185, 129, 0.1)", color: "#059669", border: "rgba(16, 185, 129, 0.3)" },
  A: { label: "A", full: "Absent", bg: "rgba(239, 68, 68, 0.1)", color: "#dc2626", border: "rgba(239, 68, 68, 0.3)" },
  L: { label: "L", full: "Late", bg: "rgba(245, 158, 11, 0.1)", color: "#d97706", border: "rgba(245, 158, 11, 0.3)" }
};

export default function TeacherAttendance() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [students, setStudents] = useState([]);
  const [grid, setGrid] = useState({}); // { [dateStr]: { [studentId]: status } }
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  // Month boundary calculations
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Chronological order for horizontal dates (1 to daysInMonth)
  const activeDaysList = [];
  for (let d = 1; d <= daysInMonth; d++) {
    activeDaysList.push(d);
  }

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
  const todayDay = today.getDate();

  // Helper formatting function
  const formatDate = (y, m, d) => {
    const date = new Date(y, m, d);
    const dayStr = String(d).padStart(2, "0");
    const monthStr = MONTHS[m].slice(0, 3);
    const dayLabel = DAY_LABELS[date.getDay()];
    return `${dayStr} ${monthStr} ${y} (${dayLabel})`;
  };

  const isSunday = (y, m, d) => {
    return new Date(y, m, d).getDay() === 0;
  };
  const isSaturday = (y, m, d) => {
    return new Date(y, m, d).getDay() === 6;
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Lock body/html scroll on mount, restore on unmount
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    
    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, []);

  // Fetch batches
  useEffect(() => {
    API.get("/batches/public")
      .then(r => {
        setBatches(r.data || []);
      })
      .catch(err => {
        console.error("Error fetching batches:", err);
        toast.error("Failed to load batches");
      });
  }, []);

  // Fetch students & attendance records
  useEffect(() => {
    if (!selectedBatch) {
      setStudents([]);
      setGrid({});
      setIsDirty(false);
      return;
    }

    setLoading(true);
    setIsDirty(false);

    Promise.all([
      API.get(`/batches/${selectedBatch}/students`),
      API.get(`/attendance/${selectedBatch}?year=${year}&month=${month + 1}`).catch(() => ({ data: { records: [] } }))
    ])
      .then(([sr, ar]) => {
        const batchStudents = sr.data?.students || [];
        setStudents(batchStudents);

        const tempGrid = {};
        // Default to "P" for all days in the displayed range
        activeDaysList.forEach(day => {
          const dStr = `${year}-${pad2(month + 1)}-${pad2(day)}`;
          tempGrid[dStr] = {};
          batchStudents.forEach(s => {
            tempGrid[dStr][s._id] = "P";
          });
        });

        // Merge saved backend records
        const savedRecords = ar.data?.records || [];
        savedRecords.forEach(doc => {
          const docDate = new Date(doc.date);
          const dStr = `${docDate.getFullYear()}-${pad2(docDate.getMonth() + 1)}-${pad2(docDate.getDate())}`;
          
          if (!tempGrid[dStr]) {
            tempGrid[dStr] = {};
          }

          doc.records.forEach(rec => {
            const rawStatus = rec.status;
            let key = "P";
            if (rawStatus === "Absent") key = "A";
            else if (rawStatus === "Late") key = "L";
            else if (rawStatus === "On Leave") key = "OL";
            else if (rawStatus === "Holiday") key = "H";

            const sId = rec.student?._id || rec.student;
            tempGrid[dStr][sId] = key;
          });
        });

        setGrid(tempGrid);
      })
      .catch(err => {
        console.error("Error fetching attendance data:", err);
        toast.error("Failed to fetch students or attendance records");
      })
      .finally(() => {
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBatch, year, month]);

  const prevMonth = () => {
    if (isDirty && !window.confirm("You have unsaved changes. Discard and change month?")) return;
    if (month === 0) {
      setYear(y => y - 1);
      setMonth(11);
    } else {
      setMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (isDirty && !window.confirm("You have unsaved changes. Discard and change month?")) return;
    if (month === 11) {
      setYear(y => y + 1);
      setMonth(0);
    } else {
      setMonth(m => m + 1);
    }
  };

  // Toggle single cell status
  const cycleCellStatus = (dateStr, studentId) => {
    setGrid(prev => {
      const currentStatus = prev[dateStr]?.[studentId] || "P";
      const idx = STATUS_CYCLE.indexOf(currentStatus);
      const nextStatus = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
      
      const newGrid = {
        ...prev,
        [dateStr]: {
          ...(prev[dateStr] || {}),
          [studentId]: nextStatus
        }
      };
      return newGrid;
    });
    setIsDirty(true);
  };

  // Bulk mark entire column (day)
  const bulkMarkRow = (dateStr, status) => {
    setGrid(prev => {
      const colUpdates = {};
      students.forEach(s => {
        colUpdates[s._id] = status;
      });

      return {
        ...prev,
        [dateStr]: colUpdates
      };
    });
    setIsDirty(true);
    toast.success(`Day updated to ${STATUS_META[status].full}`);
  };

  // Save changes to backend
  const handleSave = async () => {
    if (!selectedBatch) return;
    setSaving(true);
    try {
      const recordsToSave = [];
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      // Save all active dates loaded in the grid that are not in the future and not Sunday
      Object.keys(grid).forEach(dStr => {
        const [y, m, d] = dStr.split("-").map(Number);
        const dateVal = new Date(y, m - 1, d);
        if (dateVal > todayStart || dateVal.getDay() === 0) return; // skip future dates and Sundays

        students.forEach(s => {
          const statusKey = grid[dStr]?.[s._id] || "P";
          const fullStatus = statusKey === "P" ? "Present" :
                             statusKey === "A" ? "Absent" :
                             statusKey === "L" ? "Late" :
                             statusKey === "OL" ? "On Leave" : "Holiday";
          recordsToSave.push({
            student: s._id,
            date: dStr,
            status: fullStatus
          });
        });
      });

      await API.post("/attendance/bulk", {
        batchId: selectedBatch,
        records: recordsToSave
      });

      toast.success("Attendance saved successfully!");
      setIsDirty(false);
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save attendance records");
    } finally {
      setSaving(false);
    }
  };

  // Export CSV (flipped axes: Rows = Students)
  const handleExportCSV = () => {
    if (students.length === 0) {
      toast.error("No students to export");
      return;
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const headers = ["Student Name", "P Count", "A Count", "L Count", ...activeDaysList.map(day => `"${formatDate(year, month, day).split(" (")[0]}"`)];
    const rows = [];

    students.forEach(s => {
      const { p, a, l } = getStudentMetrics(s._id);
      const row = [
        `"${s.name}"`,
        p,
        a,
        l,
        ...activeDaysList.map(day => {
          const dateVal = new Date(year, month, day);
          if (dateVal > todayStart || dateVal.getDay() === 0) return '""'; // blank for future dates and Sundays

          const dStr = `${year}-${pad2(month + 1)}-${pad2(day)}`;
          const statusKey = grid[dStr]?.[s._id] || "P";
          return `"${STATUS_META[statusKey].full}"`;
        })
      ];
      rows.push(row.join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_Grid_${getBatchName(batches.find(b => b._id === selectedBatch))}_${MONTHS[month]}_${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Grid Export downloaded!");
  };

  // Student metrics calculations
  const getStudentMetrics = (studentId) => {
    let p = 0, a = 0, l = 0;
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const nonFutureDays = activeDaysList.filter(day => {
      const dateVal = new Date(year, month, day);
      return dateVal <= todayStart && !isSunday(year, month, day);
    });

    nonFutureDays.forEach(day => {
      const dStr = `${year}-${pad2(month + 1)}-${pad2(day)}`;
      const status = grid[dStr]?.[studentId] || "P";
      if (status === "P") p++;
      else if (status === "A") a++;
      else if (status === "L") l++;
    });

    const activeDaysCount = nonFutureDays.length;

    const presentOrEquivalent = nonFutureDays.filter(day => {
      const dStr = `${year}-${pad2(month + 1)}-${pad2(day)}`;
      const status = grid[dStr]?.[studentId] || "P";
      return status === "P" || status === "L";
    }).length;

    const attendancePct = activeDaysCount > 0 ? Math.round((presentOrEquivalent / activeDaysCount) * 100) : 100;

    return { p, a, l, attendancePct };
  };

  // Header metrics calculations
  const todayStr = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;
  
  const absentToday = students.filter(s => (grid[todayStr]?.[s._id] || "P") === "A").length;
  const lateToday = students.filter(s => (grid[todayStr]?.[s._id] || "P") === "L").length;
  
  // Overall Batch Attendance rate (Excluding holidays, Sundays, and future dates)
  let totalActiveCells = 0;
  let presentActiveCells = 0;
  
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  activeDaysList.forEach(day => {
    const dateVal = new Date(year, month, day);
    if (dateVal > todayStart || isSunday(year, month, day)) return; // skip future days and Sundays

    const dStr = `${year}-${pad2(month + 1)}-${pad2(day)}`;
    
    students.forEach(s => {
      const status = grid[dStr]?.[s._id] || "P";
      if (status !== "H") {
        totalActiveCells++;
        if (status === "P" || status === "L" || status === "OL") {
          presentActiveCells++;
        }
      }
    });
  });
  const overallPresentPct = totalActiveCells > 0 ? Math.round((presentActiveCells / totalActiveCells) * 100) : 100;

  // Filter students based on search query
  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedBatchObj = batches.find(b => b._id === selectedBatch);

  return (
    <div className="page-container">
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: "'DM Sans', sans-serif", fontSize: 13 } }} />
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        
        .page-container {
          background: #FAF9F5;
          height: 100vh;
          padding: 24px;
          font-family: 'DM Sans', sans-serif;
          color: #1F2421;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        @media (max-width: 1023px) {
          .page-container {
            height: calc(100vh - 56px);
            padding: 16px;
            overflow: hidden;
          }
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 16px;
        }
        @media (max-width: 1023px) {
          .stats-grid {
            display: flex !important;
            overflow-x: auto;
            gap: 12px;
            margin-bottom: 12px;
            padding-bottom: 8px;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
          }
          .stats-grid::-webkit-scrollbar {
            height: 4px;
          }
          .stats-grid::-webkit-scrollbar-thumb {
            background: #E6E1DA;
            border-radius: 2px;
          }
          .stats-card {
            min-width: 220px;
            flex: 1;
            scroll-snap-align: start;
          }
          .filter-bar {
            padding: 12px !important;
            gap: 12px !important;
            margin-bottom: 12px !important;
          }
          .filter-item {
            flex: 1;
            min-width: 180px !important;
          }
        }
        .premium-table {
          border-collapse: separate;
          border-spacing: 0;
          width: max-content;
          min-width: 100%;
        }
        .premium-table th {
          font-weight: 700;
          font-size: 13px;
        }
        .premium-table td {
          border-bottom: 1px solid #EFEBE4;
          transition: background-color 0.15s;
        }
        .scroll-container::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        .scroll-container::-webkit-scrollbar-track {
          background: #FAF9F5;
        }
        .scroll-container::-webkit-scrollbar-thumb {
          background: #E6E1DA;
          border-radius: 99px;
        }
        .scroll-container::-webkit-scrollbar-thumb:hover {
          background: #D5CFC5;
        }
        .badge-cell:hover {
          transform: scale(1.08);
        }
        .badge-cell:active {
          transform: scale(0.92);
        }
        .bulk-btn:hover {
          transform: scale(1.1);
        }
      `}</style>

      {/* HEADER SECTION */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "16px", flexShrink: 0 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <div style={{ width: "6px", height: "24px", background: "#10B981", borderRadius: "3px" }} />
            <h1 style={{ fontSize: "24px", fontWeight: 800, margin: 0, tracking: "-0.02em" }}>Attendance Grid</h1>
          </div>
          <p style={{ fontSize: "14px", color: "#7D8480", margin: 0 }}>
            {selectedBatch ? `${getBatchName(selectedBatchObj)} · ` : ""}Horizontal scrolling timeline layout
          </p>
        </div>

        {/* CONTROLS (HEADER ACTIONS) */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {/* Month selector */}
          <div style={{ display: "flex", alignItems: "center", background: "#FFFFFF", border: "1.5px solid #EFEBE4", borderRadius: "10px", height: "42px", padding: "0 4px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
            <button 
              onClick={prevMonth} 
              style={{ background: "none", border: "none", cursor: "pointer", color: "#7D8480", display: "flex", alignItems: "center", justifyItems: "center", width: "32px", height: "32px", borderRadius: "8px" }}
              onMouseEnter={e => e.currentTarget.style.background = "#FAF8F5"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#1F2421", padding: "0 10px", minWidth: "100px", textAlign: "center", fontFamily: "'DM Mono', monospace" }}>
              {MONTHS[month].slice(0, 3).toUpperCase()} {year}
            </span>
            <button 
              onClick={nextMonth} 
              style={{ background: "none", border: "none", cursor: "pointer", color: "#7D8480", display: "flex", alignItems: "center", justifyItems: "center", width: "32px", height: "32px", borderRadius: "8px" }}
              onMouseEnter={e => e.currentTarget.style.background = "#FAF8F5"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Export CSV button */}
          <button 
            onClick={handleExportCSV}
            disabled={students.length === 0}
            style={{
              background: "#FFFFFF",
              color: "#1F2421",
              border: "1.5px solid #EFEBE4",
              borderRadius: "10px",
              padding: "0 16px",
              height: "42px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: students.length === 0 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              opacity: students.length === 0 ? 0.6 : 1,
              transition: "all 0.2s",
              boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
            }}
            onMouseEnter={e => { if (students.length > 0) e.currentTarget.style.background = "#FAF8F5"; }}
            onMouseLeave={e => { if (students.length > 0) e.currentTarget.style.background = "#FFFFFF"; }}
          >
            <Download size={15} /> Export CSV
          </button>

          {/* Save Button */}
          {students.length > 0 && (
            <button 
              onClick={handleSave} 
              disabled={saving || !isDirty} 
              style={{
                background: isDirty ? "linear-gradient(135deg, #10B981, #059669)" : "#EFEBE4",
                color: isDirty ? "#FFFFFF" : "#7D8480",
                border: "none",
                borderRadius: "10px",
                padding: "0 20px",
                height: "42px",
                fontSize: "14px",
                fontWeight: 700,
                cursor: saving || !isDirty ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s",
                boxShadow: isDirty ? "0 4px 12px rgba(16, 185, 129, 0.2)" : "none"
              }}
            >
              {saving ? <RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={15} />}
              {saving ? "Saving..." : isDirty ? "Save Changes" : "Saved"}
            </button>
          )}
        </div>
      </div>

      {/* STATISTICS CARDS */}
      <div className="stats-grid" style={{ flexShrink: 0 }}>
        {/* Total Students */}
        <div className="stats-card" style={{ background: "#FFFFFF", border: "1.5px solid #EFEBE4", borderRadius: "14px", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,0.01)" }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#7D8480", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Total Students</div>
            <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{students.length}</div>
          </div>
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(99, 102, 241, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366F1" }}>
            <Users size={20} />
          </div>
        </div>

        {/* Absent Today */}
        <div className="stats-card" style={{ background: "#FFFFFF", border: "1.5px solid #EFEBE4", borderRadius: "14px", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,0.01)" }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#7D8480", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Absent Today</div>
            <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "'DM Mono', monospace", lineHeight: 1, color: absentToday > 0 ? "#dc2626" : "#1F2421" }}>{selectedBatch ? absentToday : "—"}</div>
          </div>
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444" }}>
            <XCircle size={20} />
          </div>
        </div>

        {/* Late Today */}
        <div className="stats-card" style={{ background: "#FFFFFF", border: "1.5px solid #EFEBE4", borderRadius: "14px", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,0.01)" }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#7D8480", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Late Today</div>
            <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "'DM Mono', monospace", lineHeight: 1, color: lateToday > 0 ? "#d97706" : "#1F2421" }}>{selectedBatch ? lateToday : "—"}</div>
          </div>
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(245, 158, 11, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F59E0B" }}>
            <Clock size={20} />
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="stats-card" style={{ background: "#FFFFFF", border: "1.5px solid #EFEBE4", borderRadius: "14px", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,0.01)" }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#7D8480", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Present Rate (Month)</div>
            <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "'DM Mono', monospace", lineHeight: 1, color: "#059669" }}>{selectedBatch ? `${overallPresentPct}%` : "—"}</div>
          </div>
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10B981" }}>
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* FILTER & FILTER BAR */}
      <div className="filter-bar" style={{ background: "#FFFFFF", border: "1.5px solid #EFEBE4", borderRadius: "14px", padding: "16px", marginBottom: "16px", display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center", flexShrink: 0 }}>
        
        {/* Batch Dropdown */}
        <div ref={dropdownRef} className="filter-item" style={{ position: "relative", width: "260px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#7D8480", letterSpacing: "0.05em", marginBottom: "6px" }}>Active Batch</div>
          <div 
            onClick={() => setDropdownOpen(o => !o)}
            style={{
              height: "42px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 14px",
              background: "#FFFFFF",
              border: "1.5px solid #EFEBE4",
              borderRadius: "10px",
              fontSize: "14px",
              color: selectedBatch ? "#1F2421" : "#7D8480",
              cursor: "pointer",
              fontWeight: 500,
              boxShadow: "0 2px 4px rgba(0,0,0,0.01)"
            }}
          >
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {selectedBatch ? getBatchName(selectedBatchObj) : "Select Batch..."}
            </span>
            <ChevronDown size={16} color="#7D8480" style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
          </div>

          {dropdownOpen && (
            <div style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              background: "#FFFFFF",
              border: "1.5px solid #EFEBE4",
              borderRadius: "10px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
              zIndex: 99,
              maxHeight: "200px",
              overflowY: "auto",
            }}>
              {batches.length === 0 ? (
                <div style={{ padding: "12px 14px", fontSize: "14px", color: "#7D8480" }}>No batches available</div>
              ) : (
                batches.map(b => (
                  <div
                    key={b._id}
                    onClick={() => {
                      if (isDirty && !window.confirm("You have unsaved changes. Change batch anyway?")) return;
                      setSelectedBatch(b._id);
                      setDropdownOpen(false);
                    }}
                    style={{
                      padding: "11px 14px",
                      fontSize: "14px",
                      color: b._id === selectedBatch ? "#059669" : "#1F2421",
                      background: b._id === selectedBatch ? "rgba(16, 185, 129, 0.05)" : "transparent",
                      cursor: "pointer",
                      fontWeight: b._id === selectedBatch ? 700 : 500,
                      borderBottom: "1px solid #FAF8F5",
                      transition: "background 0.15s"
                    }}
                    onMouseEnter={e => { if(b._id !== selectedBatch) e.currentTarget.style.background = "#FAF8F5"; }}
                    onMouseLeave={e => { if(b._id !== selectedBatch) e.currentTarget.style.background = "transparent"; }}
                  >
                    {getBatchName(b)}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Student Search */}
        <div className="filter-item" style={{ flex: 1, minWidth: "220px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#7D8480", letterSpacing: "0.05em", marginBottom: "6px" }}>Filter Students</div>
          <div style={{ position: "relative" }}>
            <Search size={16} color="#7D8480" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input 
              type="text"
              placeholder="Search student by name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                height: "42px",
                paddingLeft: "36px",
                paddingRight: "14px",
                background: "#FFFFFF",
                border: "1.5px solid #EFEBE4",
                borderRadius: "10px",
                fontSize: "14px",
                outline: "none",
                fontFamily: "'DM Sans', sans-serif",
                color: "#1F2421",
                transition: "border-color 0.2s"
              }}
              onFocus={e => e.currentTarget.style.borderColor = "#D5CFC5"}
              onBlur={e => e.currentTarget.style.borderColor = "#EFEBE4"}
            />
          </div>
        </div>

        {/* Legends / Status helpers */}
        <div style={{ flexBasis: "100%", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #FAF8F5" }}>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#7D8480", textTransform: "uppercase", letterSpacing: "0.05em" }}>Legend:</span>
            {Object.entries(STATUS_META).map(([key, value]) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "26px",
                  height: "22px",
                  background: value.bg,
                  color: value.color,
                  border: `1px solid ${value.border}`,
                  borderRadius: "4px",
                  fontSize: "10px",
                  fontWeight: 800,
                  fontFamily: "'DM Mono', monospace"
                }}>
                  {value.label}
                </span>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#5C625E" }}>{value.full}</span>
              </div>
            ))}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#7D8480" }}>
              <HelpCircle size={14} />
              <span>Click cells to cycle status. Unsaved changes will be lost on exit.</span>
            </div>
          </div>
        </div>

      </div>

      {/* ATTENDANCE SHEET GRID (FLIPPED AXES: ROWS = STUDENTS) */}
      <div style={{ background: "#FFFFFF", border: "1.5px solid #EFEBE4", borderRadius: "14px", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.01)", marginBottom: "16px", flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        
        {/* Table Title Bar */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #EFEBE4", background: "#FAF9F5", display: "flex", alignItems: "center", gap: "8px" }}>
          <CalendarDays size={16} color="#10B981" />
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#1F2421", tracking: "-0.01em" }}>
            Monthly Ledger — {MONTHS[month]} {year}
          </span>
          {isDirty && (
            <span style={{ background: "#FEF3C7", color: "#D97706", fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "99px", marginLeft: "8px" }}>
              Unsaved Changes
            </span>
          )}
        </div>

        {!selectedBatch ? (
          <div style={{ textAlign: "center", padding: "80px 24px", color: "#7D8480" }}>
            <CalendarDays size={36} color="#D5CFC5" style={{ display: "block", margin: "0 auto 12px" }} />
            <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "4px" }}>No Batch Selected</div>
            <p style={{ fontSize: "13px", margin: 0 }}>Choose a batch from the selector above to manage student attendance.</p>
          </div>
        ) : loading ? (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <RefreshCw size={32} color="#10B981" style={{ animation: "spin 1s linear infinite", display: "block", margin: "0 auto 12px" }} />
            <p style={{ color: "#7D8480", fontSize: "14px", margin: 0 }}>Syncing attendance ledger...</p>
          </div>
        ) : students.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px", color: "#7D8480" }}>
            <Users size={36} color="#D5CFC5" style={{ display: "block", margin: "0 auto 12px" }} />
            <div style={{ fontSize: "15px", fontWeight: 600 }}>No Students Found</div>
            <p style={{ fontSize: "13px", margin: 0 }}>There are no registered students in the selected batch.</p>
          </div>
        ) : (
          <div className="scroll-container" style={{ overflowX: "auto", overflowY: "hidden", width: "100%", position: "relative", flex: 1, minHeight: 0 }}>
            <table className="premium-table">
              <thead>
                <tr>
                  {/* Sticky Header: Student Name */}
                  <th style={{
                    position: "sticky",
                    top: 0,
                    left: 0,
                    zIndex: 30,
                    background: "#FAF9F5",
                    textAlign: "left",
                    padding: "16px 20px",
                    width: "160px",
                    minWidth: "160px",
                    borderRight: "2px solid #EFEBE4",
                    borderBottom: "2px solid #EFEBE4",
                    fontWeight: 700,
                    fontSize: "12px",
                    boxShadow: "2px 2px 5px rgba(0,0,0,0.01)"
                  }}>
                    Student Name
                  </th>

                  {/* Header: Date Columns */}
                  {activeDaysList.map(day => {
                    const isToday = isCurrentMonth && day === todayDay;
                    const isSun = isSunday(year, month, day);
                    const isSat = isSaturday(year, month, day);
                    const dayOfWeekLabel = DAY_LABELS[new Date(year, month, day).getDay()];
                    
                    return (
                      <th 
                        key={day} 
                        style={{
                          position: "sticky",
                          top: 0,
                          zIndex: 20,
                          background: isToday ? "#ECFDF5" : "#FAF9F5",
                          padding: "10px 4px",
                          textAlign: "center",
                          width: "60px",
                          minWidth: "60px",
                          borderRight: "1px solid #EFEBE4",
                          borderBottom: "2px solid #EFEBE4",
                          opacity: isSun ? 0.35 : (isSat ? 0.7 : 1) // Sunday dimmed, Saturday slightly de-emphasized
                        }}
                      >
                        <div style={{ fontSize: "13px", fontWeight: isToday ? 800 : 700, color: isToday ? "#059669" : "#1F2421", fontFamily: "'DM Mono', monospace" }}>
                          {pad2(day)}
                        </div>
                        <div style={{ fontSize: "9px", fontWeight: 600, color: isToday ? "#059669" : "#7D8480", marginTop: "1px", textTransform: "uppercase" }}>
                          {dayOfWeekLabel}
                        </div>
                      </th>
                    );
                  })}

                  {/* Sticky Header: Totals Column */}
                  <th style={{
                    position: "sticky",
                    top: 0,
                    right: 0,
                    zIndex: 30,
                    background: "#FAF9F5",
                    textAlign: "center",
                    padding: "16px 8px",
                    width: "110px",
                    minWidth: "110px",
                    borderLeft: "2px solid #EFEBE4",
                    borderBottom: "2px solid #EFEBE4",
                    fontWeight: 700,
                    fontSize: "12px",
                    boxShadow: "-2px 2px 5px rgba(0,0,0,0.01)"
                  }}>
                    Totals (P/A/L)
                  </th>
                </tr>

                {/* Bulk Actions Header Row */}
                <tr>
                  {/* Sticky Bulk Action Label cell */}
                  <th style={{
                    position: "sticky",
                    top: "42px",
                    left: 0,
                    zIndex: 29,
                    background: "#FFFFFF",
                    padding: "10px 16px",
                    borderRight: "2px solid #EFEBE4",
                    borderBottom: "2px solid #EFEBE4",
                    fontWeight: 700,
                    fontSize: "11px",
                    color: "#7D8480",
                    textAlign: "left",
                    boxShadow: "2px 2px 5px rgba(0,0,0,0.01)"
                  }}>
                    Bulk Action
                  </th>

                  {/* Bulk Actions for each day column */}
                  {activeDaysList.map(day => {
                    const dStr = `${year}-${pad2(month + 1)}-${pad2(day)}`;
                    const isToday = isCurrentMonth && day === todayDay;
                    
                    const dateVal = new Date(year, month, day);
                    const todayStart = new Date();
                    todayStart.setHours(0, 0, 0, 0);
                    const isFuture = dateVal > todayStart;
                    const isSun = isSunday(year, month, day);
                    const isSat = isSaturday(year, month, day);

                    return (
                      <th
                        key={day}
                        style={{
                          position: "sticky",
                          top: "42px",
                          zIndex: 19,
                          background: isToday ? "rgba(16, 185, 129, 0.05)" : (isFuture || isSun ? "rgba(240, 240, 240, 0.05)" : "#FFFFFF"),
                          padding: "6px 2px",
                          borderRight: "1px solid #EFEBE4",
                          borderBottom: "2px solid #EFEBE4",
                          opacity: isSun ? 0.35 : (isSat ? 0.7 : 1),
                          textAlign: "center"
                        }}
                      >
                        {!isFuture && !isSun && (
                          <div style={{ display: "flex", gap: "2px", justifyContent: "center" }}>
                            <button 
                              onClick={() => bulkMarkRow(dStr, "A")}
                              className="bulk-btn"
                              style={{ width: "16px", height: "16px", borderRadius: "50%", background: "rgba(239, 68, 68, 0.08)", border: "none", color: "#dc2626", fontSize: "8px", fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                              title="Mark all absent today"
                            >
                              A
                            </button>
                            <button 
                              onClick={() => bulkMarkRow(dStr, "L")}
                              className="bulk-btn"
                              style={{ width: "16px", height: "16px", borderRadius: "50%", background: "rgba(245, 158, 11, 0.08)", border: "none", color: "#d97706", fontSize: "8px", fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                              title="Mark all late today"
                            >
                              L
                            </button>
                            <button 
                              onClick={() => bulkMarkRow(dStr, "P")}
                              className="bulk-btn"
                              style={{ width: "16px", height: "16px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.08)", border: "none", color: "#059669", fontSize: "8px", fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                              title="Reset all to present"
                            >
                              ↺
                            </button>
                          </div>
                        )}
                      </th>
                    );
                  })}

                  {/* Sticky Totals Column empty header */}
                  <th style={{
                    position: "sticky",
                    top: "42px",
                    right: 0,
                    zIndex: 29,
                    background: "#FFFFFF",
                    padding: "10px 16px",
                    borderLeft: "2px solid #EFEBE4",
                    borderBottom: "2px solid #EFEBE4",
                    boxShadow: "-2px 2px 5px rgba(0,0,0,0.01)"
                  }} />
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map((s, sIdx) => {
                  const rowBg = sIdx % 2 === 0 ? "#FFFFFF" : "#FAF9F6";
                  const { p, a, l } = getStudentMetrics(s._id);
                  
                  return (
                    <tr key={s._id} style={{ background: rowBg }}>
                      {/* Sticky Student Name Cell */}
                      <td style={{
                        position: "sticky",
                        left: 0,
                        zIndex: 10,
                        background: rowBg,
                        padding: "12px 16px",
                        borderRight: "2px solid #EFEBE4",
                        boxShadow: "2px 0 5px rgba(0,0,0,0.01)",
                        textAlign: "left"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #10B981, #059669)",
                            color: "#FFFFFF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "11px",
                            fontWeight: 700
                          }}>
                            {(s.name || "S")[0].toUpperCase()}
                          </div>
                          <div 
                            style={{ fontSize: "13px", fontWeight: 600, color: "#1F2421", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "110px" }}
                            title={s.name}
                          >
                            {s.name}
                          </div>
                        </div>
                      </td>

                      {/* Date status badges */}
                      {activeDaysList.map(day => {
                        const dStr = `${year}-${pad2(month + 1)}-${pad2(day)}`;
                        const isToday = isCurrentMonth && day === todayDay;
                        
                        const dateVal = new Date(year, month, day);
                        const todayStart = new Date();
                        todayStart.setHours(0, 0, 0, 0);
                        const isFuture = dateVal > todayStart;
                        const isSun = isSunday(year, month, day);
                        const isSat = isSaturday(year, month, day);

                        const status = grid[dStr]?.[s._id] || "P";
                        const meta = STATUS_META[status];
                        
                        return (
                          <td
                            key={day}
                            style={{
                              background: isToday ? "rgba(16, 185, 129, 0.04)" : (isSun ? "rgba(239, 68, 68, 0.02)" : (isSat ? "rgba(245, 158, 11, 0.02)" : "inherit")),
                              padding: "6px 4px",
                              textAlign: "center",
                              borderRight: "1px solid #EFEBE4"
                            }}
                          >
                            {isFuture || isSun ? (
                              <span style={{ color: "#E6E1DA", fontSize: "11px", fontWeight: 500, fontFamily: "'DM Mono', monospace" }}>—</span>
                            ) : (
                              <button
                                onClick={() => cycleCellStatus(dStr, s._id)}
                                className="badge-cell"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  width: "32px",
                                  height: "26px",
                                  background: meta.bg,
                                  color: meta.color,
                                  border: `1.5px solid ${meta.border}`,
                                  borderRadius: "5px",
                                  fontSize: "10px",
                                  fontWeight: 800,
                                  fontFamily: "'DM Mono', monospace",
                                  cursor: "pointer",
                                  transition: "all 0.1s ease",
                                  opacity: isSat && status === "P" ? 0.7 : 1
                                }}
                                title={`Date: ${formatDate(year, month, day)}\nStudent: ${s.name}\nStatus: ${meta.full}`}
                              >
                                {meta.label}
                              </button>
                            )}
                          </td>
                        );
                      })}

                      {/* Sticky Student Totals */}
                      <td style={{
                        position: "sticky",
                        right: 0,
                        zIndex: 10,
                        background: rowBg,
                        padding: "12px 8px",
                        borderLeft: "2px solid #EFEBE4",
                        boxShadow: "-2px 0 5px rgba(0,0,0,0.01)",
                        textAlign: "center",
                        fontSize: "12px",
                        fontWeight: 700,
                        fontFamily: "'DM Mono', monospace",
                        whiteSpace: "nowrap"
                      }}>
                        <span style={{ color: "#059669" }} title="Present">{p}P</span>
                        <span style={{ color: "#7D8480", margin: "0 2px" }}>/</span>
                        <span style={{ color: "#dc2626" }} title="Absent">{a}A</span>
                        <span style={{ color: "#7D8480", margin: "0 2px" }}>/</span>
                        <span style={{ color: "#d97706" }} title="Late">{l}L</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* STUDENT SUMMARY CARDS SECTION */}
      {students.length > 0 && (
        <div style={{ flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", marginTop: "12px" }}>
            <Users size={18} color="#10B981" />
            <h2 style={{ fontSize: "18px", fontWeight: 800, margin: 0, tracking: "-0.01em" }}>Student Monthly Performance Summaries</h2>
          </div>

          <div className="scroll-container" style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "12px", width: "100%" }}>
            {filteredStudents.map(s => {
              const { p, a, l, attendancePct } = getStudentMetrics(s._id);
              let healthColor = "#059669"; // Green
              if (attendancePct < 75) healthColor = "#dc2626"; // Red
              else if (attendancePct < 90) healthColor = "#d97706"; // Amber

              return (
                <div 
                  key={s._id}
                  style={{
                    background: "#FFFFFF",
                    border: "1.5px solid #EFEBE4",
                    borderRadius: "14px",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.01)",
                    width: "280px",
                    minWidth: "280px",
                    flexShrink: 0,
                    transition: "transform 0.15s, box-shadow 0.15s"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.03)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.01)";
                  }}
                >
                  {/* Name and avatar */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #10B981, #059669)",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      fontWeight: 700
                    }}>
                      {(s.name || "S")[0].toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#1F2421", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={s.name}>
                        {s.name}
                      </div>
                      <div style={{ fontSize: "11px", color: "#7D8480", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {s.email || "No email listed"}
                      </div>
                    </div>
                  </div>

                  <hr style={{ border: "none", borderTop: "1px solid #EFEBE4", margin: 0 }} />

                  {/* Attendance rate indicator */}
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", color: "#7D8480", fontWeight: 500 }}>Month Rate:</span>
                    <span style={{ fontSize: "24px", fontWeight: 800, fontFamily: "'DM Mono', monospace", color: healthColor }}>
                      {attendancePct}%
                    </span>
                  </div>

                  {/* Visual progress bar */}
                  <div style={{ height: "6px", background: "#EFEBE4", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${attendancePct}%`, background: healthColor, borderRadius: "3px", transition: "width 0.4s ease" }} />
                  </div>

                  {/* Detailed stats */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#FAF9F5", padding: "8px 12px", borderRadius: "8px" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <span style={{ fontSize: "9px", fontWeight: 700, color: "#059669" }}>PRESENT</span>
                      <span style={{ fontSize: "13px", fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{p}</span>
                    </div>
                    <div style={{ width: "1px", height: "20px", background: "#EFEBE4" }} />
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <span style={{ fontSize: "9px", fontWeight: 700, color: "#dc2626" }}>ABSENT</span>
                      <span style={{ fontSize: "13px", fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{a}</span>
                    </div>
                    <div style={{ width: "1px", height: "20px", background: "#EFEBE4" }} />
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <span style={{ fontSize: "9px", fontWeight: 700, color: "#d97706" }}>LATE</span>
                      <span style={{ fontSize: "13px", fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{l}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}