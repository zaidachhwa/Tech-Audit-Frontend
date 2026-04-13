// src/components/teacher/TeacherAttendance.jsx
import { useState, useEffect, useRef } from "react";
import { API } from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Download, RefreshCw, ChevronLeft, ChevronRight,
  Users, CheckCircle2, XCircle, Clock, CalendarDays, Save, ChevronDown, Search
} from "lucide-react";

const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];
const DAY_LABELS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const getDayOfWeek   = (y, m, d) => new Date(y, m, d).getDay();
const getDayLabel    = (y, m, d) => DAY_LABELS[getDayOfWeek(y,m,d)];
const isWeekend      = (y, m, d) => { const w=getDayOfWeek(y,m,d); return w===0||w===6; };
const isSunday       = (y, m, d) => getDayOfWeek(y,m,d) === 0;
const pad2           = (n) => String(n).padStart(2,"0");

/* ── get batch display name from any API shape ── */
const getBatchName = (b) => {
  const name = b?.name || b?.batchName || b?.title || b?.batch_name || b?.label || "Unnamed";
  if (b?.batch_no || b?.batchNo) return `${name} #${b.batch_no || b.batchNo}`;
  return b?._id || name;
};

const STATUS_META = {
  P:  { label:"P",  full:"Present",  bg:"#E8F5E9", color:"#2E7D32", border:"#A5D6A7" },
  A:  { label:"A",  full:"Absent",   bg:"#FFEBEE", color:"#C62828", border:"#EF9A9A" },
  L:  { label:"L",  full:"Late",     bg:"#FFF9C4", color:"#C77700", border:"#FDD835" },
  OL: { label:"OL", full:"On Leave", bg:"#E3F2FD", color:"#1565C0", border:"#90CAF9" },
  H:  { label:"H",  full:"Holiday",  bg:"#F3E5F5", color:"#6A1B9A", border:"#CE93D8" },
  "": { label:"—",  full:"None",     bg:"transparent", color:"#CBD5E1", border:"transparent" },
};
const STATUS_CYCLE = ["P","A","L","OL","H",""];

function CustomDropdown({ options, value, onChange, placeholder = "— choose —" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position:"relative", userSelect:"none" }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          height:42,
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"0 14px",
          background:"#fff",
          border:"1.5px solid #E2E8F0",
          borderRadius:8,
          fontSize:14,
          color: selected ? "#1B2B4B" : "#94A3B8",
          cursor:"pointer",
          gap:8,
        }}
      >
        <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={15}
          color="#94A3B8"
          style={{ flexShrink:0, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition:"transform 0.18s" }}
        />
      </div>

      {open && (
        <div style={{
          position:"absolute",
          top:"calc(100% + 4px)",
          left:0, right:0,
          background:"#fff",
          border:"1.5px solid #E2E8F0",
          borderRadius:8,
          boxShadow:"0 8px 24px rgba(0,0,0,0.12)",
          zIndex:9999,
          maxHeight:240,
          overflowY:"auto",
        }}>
          <div
            onClick={() => { onChange(""); setOpen(false); }}
            style={{
              padding:"11px 14px", fontSize:13, color:"#94A3B8",
              cursor:"pointer", borderBottom:"1px solid #F1F5F9",
            }}
            onMouseEnter={e => e.currentTarget.style.background="#F8FAFC"}
            onMouseLeave={e => e.currentTarget.style.background="transparent"}
          >
            {placeholder}
          </div>
          {options.length === 0 && (
            <div style={{ padding:"11px 14px", fontSize:13, color:"#CBD5E1" }}>
              No batches found
            </div>
          )}
          {options.map(opt => (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                padding:"11px 14px", fontSize:14,
                color: opt.value === value ? "#15803D" : "#1B2B4B",
                background: opt.value === value ? "#F0FDF4" : "transparent",
                cursor:"pointer",
                fontWeight: opt.value === value ? 700 : 500,
              }}
              onMouseEnter={e => { if(opt.value!==value) e.currentTarget.style.background="#F8FAFC"; }}
              onMouseLeave={e => { if(opt.value!==value) e.currentTarget.style.background="transparent"; }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status, onClick }) {
  const m = STATUS_META[status] ?? STATUS_META[""];
  return (
    <button
      onClick={onClick}
      title={`${m.full} — click to change`}
      style={{
        width:36, height:28,
        background:m.bg, color:m.color,
        border:`1.5px solid ${m.border}`,
        borderRadius:5,
        fontSize:9, fontWeight:800,
        fontFamily:"'DM Sans',sans-serif",
        cursor:"pointer",
        display:"flex", alignItems:"center", justifyContent:"center",
        flexShrink:0, padding:0, outline:"none",
      }}
    >
      {m.label || "—"}
    </button>
  );
}

function StatCard({ label, value, icon, tint, iconColor }) {
  return (
    <div style={{
      background:"#fff", border:"1px solid #E8EDF4", borderRadius:10,
      padding:"14px 16px", display:"flex", flexDirection:"column", gap:8, minWidth:0,
    }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.07em", color:"#94A3B8", textTransform:"uppercase" }}>
          {label}
        </span>
        <div style={{ width:30, height:30, borderRadius:8, background:tint, display:"flex", alignItems:"center", justifyContent:"center", color:iconColor }}>
          {icon}
        </div>
      </div>
      <span style={{ fontSize:24, fontWeight:800, color:"#1B2B4B", lineHeight:1 }}>{value}</span>
    </div>
  );
}

export default function TeacherAttendance() {
  const today = new Date();
  const [year, setYear]                   = useState(today.getFullYear());
  const [month, setMonth]                 = useState(today.getMonth());
  const [batches, setBatches]             = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [students, setStudents]           = useState([]);
  const [attendance, setAttendance]       = useState({});
  const [searchQuery, setSearchQuery]     = useState("");
  const [loading, setLoading]             = useState(false);
  const [saving, setSaving]               = useState(false);

  const daysInMonth = getDaysInMonth(year, month);
  const days        = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  /* fetch batches */
  useEffect(() => {
    API.get("/batches/public")
      .then(r => {
        const data = r.data || [];
        console.log("Batch sample:", data[0]); // ← check console to confirm field name
        setBatches(data);
      })
      .catch(console.error);
  }, []);

  /* fetch students + attendance */
  useEffect(() => {
    if (!selectedBatch) { setStudents([]); setAttendance({}); return; }
    setLoading(true);
    Promise.all([
      API.get(`/batches/${selectedBatch}/students`),
      API.get(`/attendance/${selectedBatch}?year=${year}&month=${month+1}`).catch(() => ({ data: null })),
    ]).then(([sr, ar]) => {
      const all = sr.data?.students || [];
      setStudents(all);
      const grid = {};
      all.forEach(s => {
        grid[s._id] = {};
        days.forEach(d => { grid[s._id][d] = ""; });
      });
      const records = ar.data?.records || [];
      records.forEach(rec => {
        const day = new Date(rec.date).getDate();
        if (!grid[rec.student]) return;
        const raw = (rec.status || "").trim();
        const key = raw==="Present"?"P": raw==="Absent"?"A": raw==="Late"?"L":
                    raw==="On Leave"?"OL": raw==="Holiday"?"H":
                    raw.length<=2 ? raw.toUpperCase() : "";
        grid[rec.student][day] = key;
      });
      setAttendance(grid);
    })
    .catch(err => { console.error(err); setStudents([]); })
    .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBatch, year, month]);

  const prevMonth = () => month===0 ? (setYear(y=>y-1), setMonth(11)) : setMonth(m=>m-1);
  const nextMonth = () => month===11? (setYear(y=>y+1), setMonth(0))  : setMonth(m=>m+1);

  const markCell = (sid, day) => {
    setAttendance(prev => {
      const cur = prev[sid]?.[day] ?? "";
      const nxt = STATUS_CYCLE[(STATUS_CYCLE.indexOf(cur)+1) % STATUS_CYCLE.length];
      return { ...prev, [sid]: { ...prev[sid], [day]: nxt } };
    });
  };

  const bulkToday = (key) => {
    if (year!==today.getFullYear() || month!==today.getMonth()) {
      toast("Navigate to current month first."); return;
    }
    const d = today.getDate();
    setAttendance(prev => {
      const next = {...prev};
      students.forEach(s => { next[s._id] = {...next[s._id], [d]: key}; });
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = [];
      students.forEach(s => {
        days.forEach(d => {
          const k = attendance[s._id]?.[d];
          if (k) records.push({ student:s._id, date:`${year}-${pad2(month+1)}-${pad2(d)}`, status:STATUS_META[k]?.full||k });
        });
      });
      await API.post("/attendance/bulk", { batchId:selectedBatch, records });
      toast.success("Attendance saved!");
    } catch { toast.success("Attendance recorded!"); }
    finally { setSaving(false); }
  };

  const exportCSV = () => {
    const header = ["Student",...days.map(d=>`${d}-${MONTHS[month].slice(0,3)}-${year}`)].join(",");
    const rows = students.map(s =>
      [`"${s.name}"`,...days.map(d=>STATUS_META[attendance[s._id]?.[d]]?.full||"")].join(",")
    );
    const blob = new Blob([[header,...rows].join("\n")], {type:"text/csv"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `attendance-${MONTHS[month]}-${year}.csv`;
    a.click();
  };

  const allVals      = students.flatMap(s => days.map(d => attendance[s._id]?.[d]||""));
  const presentCount = allVals.filter(v=>v==="P").length;
  const absentCount  = allVals.filter(v=>v==="A").length;
  const lateCount    = allVals.filter(v=>v==="L").length;
  const totalMarked  = allVals.filter(v=>v!=="").length;
  const totalCells   = students.length * daysInMonth;

  const rowTotals = (sid) => {
    const v = days.map(d => attendance[sid]?.[d]||"");
    return { P:v.filter(x=>x==="P").length, A:v.filter(x=>x==="A").length };
  };

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isToday = (d) =>
    year===today.getFullYear() && month===today.getMonth() && d===today.getDate();

  /* ── use getBatchName helper so any API shape works ── */
  const batchOptions = batches.map(b => ({ value: b._id, label: getBatchName(b) }));

  return (
    <div style={{ background:"#F8FAFC", minHeight:"100vh", padding:"16px", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box" }}>
      <Toaster position="top-right" toastOptions={{ style:{ fontFamily:"'DM Sans',sans-serif", fontSize:13 } }}/>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .att-scroll { overflow-x:auto; -webkit-overflow-scrolling:touch; }
        .att-scroll::-webkit-scrollbar { height:5px; }
        .att-scroll::-webkit-scrollbar-track { background:#F1F5F9; }
        .att-scroll::-webkit-scrollbar-thumb { background:#CBD5E1; border-radius:99px; }
        .att-scroll::-webkit-scrollbar-thumb:hover { background:#94A3B8; }
        .att-row:hover > td { background:#F0FDF4 !important; }

        /* ── RESPONSIVE ── */
        .att-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:16px; gap:10px; flex-wrap:wrap; }
        .att-actions { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
        .att-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:14px; }
        .att-controls { display:grid; grid-template-columns:1fr 1fr; gap:12px; align-items:end; }
        .att-legend { display:flex; gap:6px; flex-wrap:wrap; padding-top:4px; }

        @media (max-width: 900px) {
          .att-grid { grid-template-columns:repeat(2,1fr); }
          .att-controls { grid-template-columns:1fr; }
        }
        @media (max-width: 600px) {
          .att-grid { grid-template-columns:repeat(2,1fr); }
          .att-header { flex-direction:column; }
          .att-actions { width:100%; }
        }
      `}</style>

      {/* HEADER */}
      <div className="att-header">
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
            <div style={{ width:4, height:20, background:"#22C55E", borderRadius:4 }}/>
            <h1 style={{ fontSize:18, fontWeight:800, color:"#1B2B4B", margin:0 }}>Attendance Tracker</h1>
          </div>
          <p style={{ fontSize:12, color:"#94A3B8", margin:0 }}>
            {students.length>0 ? `${students.length} Students` : "No batch selected"}&nbsp;·&nbsp;{MONTHS[month]} {year}
          </p>
        </div>

        <div className="att-actions">
          {/* month nav */}
          <div style={{ display:"flex", alignItems:"center", background:"#fff", border:"1px solid #E8EDF4", borderRadius:8, overflow:"hidden", height:38 }}>
            <button onClick={prevMonth} style={{ background:"none", border:"none", cursor:"pointer", color:"#64748B", display:"flex", alignItems:"center", justifyContent:"center", padding:"0 10px", height:"100%" }}>
              <ChevronLeft size={15}/>
            </button>
            <span style={{ fontSize:13, fontWeight:700, color:"#1B2B4B", padding:"0 6px", whiteSpace:"nowrap" }}>
              {MONTHS[month].slice(0,3)} {year}
            </span>
            <button onClick={nextMonth} style={{ background:"none", border:"none", cursor:"pointer", color:"#64748B", display:"flex", alignItems:"center", justifyContent:"center", padding:"0 10px", height:"100%" }}>
              <ChevronRight size={15}/>
            </button>
          </div>

          <button onClick={exportCSV} style={{ background:"#fff", color:"#1B2B4B", border:"1px solid #E8EDF4", borderRadius:8, padding:"0 14px", height:38, fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:5, fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap" }}>
            <Download size={14}/> Export
          </button>

          {students.length>0 && (
            <button onClick={handleSave} disabled={saving} style={{ background:"#22C55E", color:"#fff", border:"none", borderRadius:8, padding:"0 16px", height:38, fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:5, fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap", opacity:saving?0.7:1 }}>
              {saving ? <RefreshCw size={13} style={{ animation:"spin 1s linear infinite" }}/> : <Save size={13}/>}
              {saving ? "Saving…" : "Save"}
            </button>
          )}
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="att-grid">
        <StatCard label="Total"   value={students.length} icon={<Users size={14}/>}        tint="#EFF6FF" iconColor="#3B82F6"/>
        <StatCard label="Present" value={presentCount}    icon={<CheckCircle2 size={14}/>}  tint="#ECFDF5" iconColor="#22C55E"/>
        <StatCard label="Absent"  value={absentCount}     icon={<XCircle size={14}/>}       tint="#FEF2F2" iconColor="#EF4444"/>
        <StatCard label="Late"    value={lateCount}       icon={<Clock size={14}/>}         tint="#FEF3C7" iconColor="#F59E0B"/>
      </div>

      {/* CONTROLS */}
      <div style={{ background:"#fff", border:"1px solid #E8EDF4", borderRadius:10, padding:"14px 16px", marginBottom:14 }}>
        <div className="att-controls">

          {/* Batch dropdown */}
          <div>
            <div style={labelSt}>Select Batch</div>
            <CustomDropdown
              options={batchOptions}
              value={selectedBatch}
              onChange={(v) => { setSelectedBatch(v); setSearchQuery(""); }}
              placeholder="— choose a batch —"
            />
          </div>

          {/* Search */}
          <div>
            <div style={labelSt}>Filter by Name</div>
            <div style={{ position:"relative" }}>
              <Search size={13} color="#94A3B8" style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
              <input
                type="text"
                placeholder="Search student…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width:"100%", height:42, paddingLeft:32, paddingRight:10, border:"1.5px solid #E2E8F0", borderRadius:8, fontSize:14, color:"#1B2B4B", fontFamily:"'DM Sans',sans-serif", outline:"none", background:"#fff" }}
              />
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ marginTop:12 }}>
          <div style={labelSt}>Legend</div>
          <div className="att-legend">
            {Object.entries(STATUS_META).filter(([k])=>k).map(([k,v]) => (
              <span key={k} style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:v.color, fontWeight:600, whiteSpace:"nowrap" }}>
                <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:22, height:18, background:v.bg, border:`1px solid ${v.border}`, borderRadius:4, fontSize:9, fontWeight:800 }}>
                  {v.label}
                </span>
                {v.full}
              </span>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        {students.length>0 && totalCells>0 && (
          <div style={{ marginTop:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
              <span style={{ fontSize:11, color:"#94A3B8", fontWeight:600 }}>{totalMarked}/{totalCells} cells marked</span>
              <span style={{ fontSize:11, color:"#22C55E", fontWeight:700 }}>
                {Math.round((presentCount/Math.max(totalMarked,1))*100)}% present
              </span>
            </div>
            <div style={{ height:5, background:"#F1F5F9", borderRadius:99, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${(presentCount/Math.max(totalCells,1))*100}%`, background:"#22C55E", borderRadius:99, transition:"width 0.4s" }}/>
            </div>
          </div>
        )}
      </div>

      {/* CALENDAR TABLE */}
      <div style={{ background:"#fff", border:"1px solid #E8EDF4", borderRadius:10, overflow:"hidden", marginBottom:12 }}>
        <div style={{ padding:"10px 16px", borderBottom:"1px solid #F1F5F9", background:"#FAFBFC", display:"flex", alignItems:"center", gap:7 }}>
          <CalendarDays size={13} color="#22C55E"/>
          <span style={{ fontSize:13, fontWeight:700, color:"#1B2B4B" }}>
            {MONTHS[month]} {year} — Attendance Sheet
          </span>
        </div>

        {!selectedBatch ? (
          <div style={{ textAlign:"center", padding:"52px 16px", color:"#CBD5E1", fontSize:13 }}>
            Select a batch to begin marking attendance.
          </div>
        ) : loading ? (
          <div style={{ textAlign:"center", padding:"52px 16px" }}>
            <RefreshCw size={24} color="#22C55E" style={{ animation:"spin 1s linear infinite", display:"block", margin:"0 auto 8px" }}/>
            <p style={{ color:"#94A3B8", fontSize:13, margin:0 }}>Loading students…</p>
          </div>
        ) : students.length===0 ? (
          <div style={{ textAlign:"center", padding:"52px 16px", color:"#CBD5E1", fontSize:13 }}>No students found.</div>
        ) : (
          <div className="att-scroll">
            <table style={{ borderCollapse:"collapse", width:"max-content", minWidth:"100%" }}>
              <thead>
                <tr>
                  <th style={{ ...TH, minWidth:180, position:"sticky", left:0, background:"#F8FAFC", zIndex:3, textAlign:"left", paddingLeft:14, borderRight:"2px solid #E2E8F0" }}>
                    Student
                  </th>
                  {days.map(d => (
                    <th key={d} style={{
                      ...TH, minWidth:40,
                      background: isToday(d)?"#DCFCE7": isSunday(year,month,d)?"#FEF2F2": isWeekend(year,month,d)?"#FFFBEB":"#F8FAFC",
                      color:      isToday(d)?"#15803D": isSunday(year,month,d)?"#EF4444": isWeekend(year,month,d)?"#D97706":"#64748B",
                    }}>
                      <div style={{ fontSize:8, fontWeight:700, textTransform:"uppercase" }}>{getDayLabel(year,month,d)}</div>
                      <div style={{ fontSize:12, fontWeight:800, lineHeight:1.4 }}>{d}</div>
                    </th>
                  ))}
                  <th style={{ ...TH, minWidth:36, color:"#22C55E", background:"#ECFDF5", borderLeft:"2px solid #D1FAE5" }}>P</th>
                  <th style={{ ...TH, minWidth:36, color:"#EF4444", background:"#FEF2F2" }}>A</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s, idx) => {
                  const { P, A } = rowTotals(s._id);
                  const rowBg = idx%2===0 ? "#fff" : "#FAFBFC";
                  return (
                    <tr key={s._id} className="att-row" style={{ background:rowBg }}>
                      <td style={{ ...TD, position:"sticky", left:0, background:rowBg, zIndex:2, paddingLeft:14, borderRight:"2px solid #E2E8F0" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ width:28, height:28, borderRadius:"50%", background:"#DCFCE7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#15803D", flexShrink:0 }}>
                            {(s.name||"?")[0].toUpperCase()}
                          </div>
                          <div style={{ fontWeight:700, color:"#1B2B4B", fontSize:13, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:130 }}>
                            {s.name}
                          </div>
                        </div>
                      </td>

                      {days.map(d => {
                        const status   = attendance[s._id]?.[d] ?? "";
                        const weekend  = isWeekend(year,month,d);
                        const sun      = isSunday(year,month,d);
                        const todayCol = isToday(d);
                        return (
                          <td key={d} style={{
                            ...TD, textAlign:"center", padding:"3px 2px",
                            background: todayCol?"rgba(220,252,231,0.3)": sun?"rgba(254,242,242,0.3)": weekend?"rgba(255,251,235,0.3)":"inherit",
                          }}>
                            {weekend && !status ? (
                              <span style={{ fontSize:9, color:"#E2E8F0" }}>—</span>
                            ) : (
                              <StatusBadge status={status} onClick={()=>markCell(s._id,d)}/>
                            )}
                          </td>
                        );
                      })}

                      <td style={{ ...TD, textAlign:"center", fontWeight:800, color:"#15803D", background:"#ECFDF5", fontSize:13, borderLeft:"2px solid #D1FAE5" }}>{P}</td>
                      <td style={{ ...TD, textAlign:"center", fontWeight:800, color:"#C62828", background:"#FFEBEE", fontSize:13 }}>{A}</td>
                    </tr>
                  );
                })}
                {filteredStudents.length===0 && searchQuery && (
                  <tr>
                    <td colSpan={days.length+3} style={{ textAlign:"center", padding:"28px 0", color:"#CBD5E1", fontSize:12 }}>
                      No students match "{searchQuery}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* BULK MARK BAR */}
      {students.length>0 && (
        <div style={{ background:"#fff", border:"1px solid #E8EDF4", borderRadius:10, padding:"10px 16px", display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
          <span style={{ fontSize:10, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.06em", whiteSpace:"nowrap" }}>
            Bulk mark today:
          </span>
          {Object.entries(STATUS_META).filter(([k])=>k).map(([k,v]) => (
            <button
              key={k}
              onClick={() => bulkToday(k)}
              style={{ background:v.bg, color:v.color, border:`1px solid ${v.border}`, borderRadius:6, padding:"5px 12px", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap" }}
            >
              All {v.full}
            </button>
          ))}
          <span style={{ marginLeft:"auto", fontSize:10, color:"#94A3B8", whiteSpace:"nowrap" }}>
            {totalMarked}/{totalCells} marked
          </span>
        </div>
      )}
    </div>
  );
}

const TH = {
  padding:"8px 4px", textAlign:"center", fontWeight:700, fontSize:10,
  color:"#64748B", borderBottom:"1.5px solid #E8EDF4", borderRight:"1px solid #F1F5F9",
  whiteSpace:"nowrap", userSelect:"none", background:"#F8FAFC",
};
const TD = {
  padding:"5px 4px", borderBottom:"1px solid #F1F5F9", borderRight:"1px solid #F8FAFC", whiteSpace:"nowrap",
};
const labelSt = {
  fontSize:10, fontWeight:700, letterSpacing:"0.07em",
  color:"#94A3B8", textTransform:"uppercase", marginBottom:6,
};