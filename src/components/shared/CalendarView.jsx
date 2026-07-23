import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  Eye,
  Download,
  Filter,
  Plus,
  Layers,
  Sparkles
} from "lucide-react";

export default function CalendarView({
  schedules = [],
  role = "student",
  onSelectLecture,
  onAddLectureOnDate,
  onUpdateLectureStatus
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month"); // "month" | "week"
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedTeacher, setSelectedTeacher] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [activeLectureModal, setActiveLectureModal] = useState(null);

  // Extract list of unique batches & teachers for filters
  const filterOptions = useMemo(() => {
    const batchMap = new Map();
    const teacherMap = new Map();

    schedules.forEach((sch) => {
      if (sch.batch) {
        const bId = sch.batch._id || sch.batch;
        const bName = sch.batch.batch_name
          ? `${sch.batch.batch_name} #${sch.batch.batch_no || ""}`
          : `Batch ${bId}`;
        batchMap.set(String(bId), bName);
      }
      if (sch.teacher) {
        const tId = sch.teacher._id || sch.teacher;
        const tName = sch.teacher.name || "Teacher";
        teacherMap.set(String(tId), tName);
      }
    });

    return {
      batches: Array.from(batchMap.entries()).map(([id, name]) => ({ id, name })),
      teachers: Array.from(teacherMap.entries()).map(([id, name]) => ({ id, name })),
    };
  }, [schedules]);

  // Flatten all lectures from schedules into single array with parent schedule context
  const allEvents = useMemo(() => {
    const events = [];

    schedules.forEach((sch) => {
      const batchId = String(sch.batch?._id || sch.batch || "");
      const teacherId = String(sch.teacher?._id || sch.teacher || "");
      const batchName = sch.batch?.batch_name
        ? `${sch.batch.batch_name} #${sch.batch.batch_no || ""}`
        : "Batch";
      const teacherName = sch.teacher?.name || "Teacher";
      const subjectName = sch.subject || "Syllabus";

      (sch.lectures || []).forEach((lec, index) => {
        if (!lec.date) return;
        const dateStr = String(lec.date).split("T")[0];
        const lecTeacherName = (typeof lec.teacher === "object" && lec.teacher?.name)
          ? lec.teacher.name
          : (sch.teacher?.name || "Teacher");

        events.push({
          ...lec,
          lectureIndex: index,
          scheduleId: sch._id,
          subject: subjectName,
          batchId,
          batchName,
          teacherId: (typeof lec.teacher === "object" && lec.teacher?._id) ? String(lec.teacher._id) : teacherId,
          teacherName: lecTeacherName,
          dateStr,
        });
      });
    });

    return events;
  }, [schedules]);

  // Filter events based on selected dropdown filters
  const filteredEvents = useMemo(() => {
    return allEvents.filter((evt) => {
      if (selectedBatch !== "all" && evt.batchId !== selectedBatch) return false;
      if (selectedTeacher !== "all" && evt.teacherId !== selectedTeacher) return false;
      if (selectedStatus !== "all") {
        if (selectedStatus === "Done" && evt.status !== "Done") return false;
        if (selectedStatus === "In Progress" && evt.status !== "In Progress") return false;
        if (selectedStatus === "Planned" && evt.status !== "Planned" && evt.status !== "Scheduled" && evt.status !== "Yet to be scheduled") return false;
      }
      return true;
    });
  }, [allEvents, selectedBatch, selectedTeacher, selectedStatus]);

  // Map filtered events by YYYY-MM-DD
  const eventsByDate = useMemo(() => {
    const map = {};
    filteredEvents.forEach((evt) => {
      if (!map[evt.dateStr]) map[evt.dateStr] = [];
      map[evt.dateStr].push(evt);
    });
    return map;
  }, [filteredEvents]);

  // Calendar Date Math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Generate Month Grid Days
  const monthDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
    const totalDays = lastDayOfMonth.getDate();

    const days = [];

    // Previous month padding days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const pDay = prevMonthLastDay - i;
      const pDate = new Date(year, month - 1, pDay);
      const dateStr = pDate.toISOString().split("T")[0];
      days.push({
        date: pDate,
        dateStr,
        dayNum: pDay,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Current month days
    const todayStr = new Date().toISOString().split("T")[0];
    for (let d = 1; d <= totalDays; d++) {
      const cDate = new Date(year, month, d);
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        date: cDate,
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
      });
    }

    // Next month padding days to complete 35 or 42 grid items
    const totalCells = days.length > 35 ? 42 : 35;
    const remainingCells = totalCells - days.length;
    for (let n = 1; n <= remainingCells; n++) {
      const nDate = new Date(year, month + 1, n);
      const dateStr = nDate.toISOString().split("T")[0];
      days.push({
        date: nDate,
        dateStr,
        dayNum: n,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  }, [year, month]);

  // Week Grid Days (for Week View)
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

    const days = [];
    const todayStr = new Date().toISOString().split("T")[0];

    for (let i = 0; i < 7; i++) {
      const wDate = new Date(startOfWeek);
      wDate.setDate(wDate.getDate() + i);
      const dateStr = wDate.toISOString().split("T")[0];
      days.push({
        date: wDate,
        dateStr,
        dayNum: wDate.getDate(),
        isCurrentMonth: wDate.getMonth() === month,
        isToday: dateStr === todayStr,
      });
    }
    return days;
  }, [currentDate, month]);

  const displayedDays = viewMode === "month" ? monthDays : weekDays;

  // Month Title
  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const getStatusBadge = (status) => {
    switch (status) {
      case "Done":
      case "Completed":
        return { label: "Done", bg: "#D1FAE5", text: "#065F46", border: "#A7F3D0" };
      case "In Progress":
        return { label: "In Progress", bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" };
      default:
        return { label: "Scheduled", bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE" };
    }
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden select-none font-sans">
      {/* ── TOOLBAR / CONTROLS ── */}
      <div className="p-4 sm:p-5 border-b border-[#E2E8F0] bg-[#FAFBFC] flex flex-col gap-4">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Navigation & Month Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white border border-[#E2E8F0] rounded-lg p-0.5 shadow-xs">
              <button
                onClick={prevMonth}
                className="p-1.5 hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#1E293B] rounded-md transition cursor-pointer"
                title="Previous"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={goToToday}
                className="px-2.5 py-1 text-xs font-bold text-[#1E293B] hover:bg-[#F1F5F9] rounded-md transition cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#1E293B] rounded-md transition cursor-pointer"
                title="Next"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A] flex items-center gap-2">
              <CalendarIcon className="text-[#2563EB]" size={20} />
              {monthName}
            </h2>
          </div>

          {/* View Switcher & Stats */}
          <div className="flex items-center gap-2">
            <div className="bg-[#E2E8F0] p-0.5 rounded-lg flex items-center text-xs font-bold">
              <button
                onClick={() => setViewMode("month")}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                  viewMode === "month" ? "bg-white text-[#2563EB] shadow-xs" : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode("week")}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                  viewMode === "week" ? "bg-white text-[#2563EB] shadow-xs" : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                Week
              </button>
            </div>

            <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-[#2563EB] rounded-lg text-xs font-bold border border-blue-100">
              <Sparkles size={14} /> {filteredEvents.length} Lectures Scheduled
            </span>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[#F1F5F9]">
          {/* Batch Filter */}
          <div>
            <label className="block text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider mb-1">
              Filter Batch
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] focus:border-[#2563EB] rounded-lg text-xs font-semibold text-[#0F172A] outline-none transition"
            >
              <option value="all">All Batches</option>
              {filterOptions.batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Teacher Filter */}
          <div>
            <label className="block text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider mb-1">
              Filter Teacher
            </label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] focus:border-[#2563EB] rounded-lg text-xs font-semibold text-[#0F172A] outline-none transition"
            >
              <option value="all">All Teachers</option>
              {filterOptions.teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider mb-1">
              Filter Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] focus:border-[#2563EB] rounded-lg text-xs font-semibold text-[#0F172A] outline-none transition"
            >
              <option value="all">All Statuses</option>
              <option value="Done">Completed / Done</option>
              <option value="In Progress">In Progress</option>
              <option value="Planned">Scheduled / Planned</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── CALENDAR GRID ── */}
      <div>
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-[#E2E8F0] bg-[#F8FAFC] text-center">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName, idx) => (
            <div
              key={dayName}
              className={`py-2 text-[11px] font-extrabold uppercase tracking-wider ${
                idx === 0 || idx === 6 ? "text-amber-600 bg-amber-50/40" : "text-[#64748B]"
              }`}
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Days Cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#F1F5F9] bg-[#F8FAFC]">
          {displayedDays.map((dObj, idx) => {
            const dayEvents = eventsByDate[dObj.dateStr] || [];
            const isWeekend = dObj.date.getDay() === 0 || dObj.date.getDay() === 6;

            return (
              <div
                key={dObj.dateStr + idx}
                className={`min-h-[110px] sm:min-h-[130px] p-1.5 transition flex flex-col justify-between ${
                  !dObj.isCurrentMonth
                    ? "bg-[#F8FAFC] opacity-40"
                    : dObj.isToday
                    ? "bg-blue-50/50"
                    : isWeekend
                    ? "bg-amber-50/20"
                    : "bg-white"
                } hover:bg-slate-50/80 group relative`}
              >
                {/* Date Header */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      dObj.isToday
                        ? "bg-[#2563EB] text-white shadow-xs"
                        : dObj.isCurrentMonth
                        ? "text-[#0F172A]"
                        : "text-[#94A3B8]"
                    }`}
                  >
                    {dObj.dayNum}
                  </span>

                  {/* Add Button for Admin/Teacher */}
                  {(role === "admin" || role === "teacher") && (
                    <button
                      onClick={() => onAddLectureOnDate && onAddLectureOnDate(dObj.dateStr)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#E2E8F0] text-[#64748B] hover:text-[#2563EB] rounded transition cursor-pointer"
                      title="Schedule Lecture on this date"
                    >
                      <Plus size={13} />
                    </button>
                  )}
                </div>

                {/* Events list */}
                <div className="flex-1 space-y-1 overflow-y-auto max-h-[100px] scrollbar-thin">
                  {dayEvents.slice(0, 3).map((evt) => {
                    const stBadge = getStatusBadge(evt.status);
                    return (
                      <div
                        key={evt._id || evt.lectureIndex}
                        onClick={() => {
                          setActiveLectureModal(evt);
                        }}
                        style={{
                          backgroundColor: stBadge.bg,
                          color: stBadge.text,
                          borderColor: stBadge.border,
                        }}
                        className="p-1.5 rounded-lg border text-[10px] font-bold cursor-pointer hover:shadow-xs transition hover:scale-[1.02] flex flex-col gap-0.5"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate max-w-[90px] font-extrabold">
                            {evt.subject}
                          </span>
                          {evt.time_slot && (
                            <span className="text-[9px] opacity-80 shrink-0 font-medium">
                              {evt.time_slot.split("-")[0]}
                            </span>
                          )}
                        </div>
                        <span className="truncate text-[10px] text-slate-800">
                          {evt.title}
                        </span>
                        <div className="flex items-center justify-between gap-1 text-[8.5px] opacity-90 mt-0.5 font-bold">
                          <span className="truncate max-w-[80px] text-[#475569]">{evt.batchName}</span>
                          {evt.teacherName && (
                            <span className="truncate max-w-[90px] text-[#2563EB] font-extrabold" title={`Lecturer: ${evt.teacherName}`}>
                              👤 {evt.teacherName}
                            </span>
                          )}
                          {evt.homework?.title && <span title="Homework assigned">📝</span>}
                          {evt.notes_shared?.fileUrl && <span title="Shared notes">📄</span>}
                        </div>
                      </div>
                    );
                  })}

                  {/* Overflow tag */}
                  {dayEvents.length > 3 && (
                    <button
                      onClick={() => setActiveLectureModal(dayEvents[0])}
                      className="w-full text-center text-[9px] font-extrabold text-[#2563EB] hover:underline bg-blue-50 rounded py-0.5 cursor-pointer"
                    >
                      +{dayEvents.length - 3} more lectures
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── LECTURE EVENT DETAIL MODAL ── */}
      {activeLectureModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-3 border-b border-[#F1F5F9]">
              <div>
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-50 text-[#2563EB] mb-1">
                  {activeLectureModal.batchName}
                </span>
                <h3 className="text-base font-extrabold text-[#0F172A] leading-snug">
                  {activeLectureModal.title || "Untitled Lecture"}
                </h3>
                <p className="text-xs text-[#64748B] font-semibold">
                  Course: {activeLectureModal.subject}
                </p>
              </div>
              <button
                onClick={() => setActiveLectureModal(null)}
                className="p-1 rounded-lg text-[#94A3B8] hover:bg-slate-100 hover:text-[#0F172A] transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Lecture Properties Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                <span className="block text-[9px] font-extrabold text-[#64748B] uppercase mb-0.5">
                  Scheduled Date
                </span>
                <span className="font-bold text-[#0F172A] flex items-center gap-1">
                  <CalendarIcon size={12} className="text-[#2563EB]" />
                  {activeLectureModal.dateStr}
                </span>
              </div>

              <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                <span className="block text-[9px] font-extrabold text-[#64748B] uppercase mb-0.5">
                  Time Slot
                </span>
                <span className="font-bold text-[#0F172A] flex items-center gap-1">
                  <Clock size={12} className="text-[#2563EB]" />
                  {activeLectureModal.time_slot || "Not specified"}
                </span>
              </div>

              <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                <span className="block text-[9px] font-extrabold text-[#64748B] uppercase mb-0.5">
                  Teacher
                </span>
                <span className="font-bold text-[#0F172A] flex items-center gap-1 truncate">
                  <User size={12} className="text-[#2563EB]" />
                  {activeLectureModal.teacherName}
                </span>
              </div>

              <div className="p-2.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                <span className="block text-[9px] font-extrabold text-[#64748B] uppercase mb-0.5">
                  Completion Status
                </span>
                <span className="font-bold text-[#0F172A] flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-[#10B981]" />
                  {activeLectureModal.status || "Planned"}
                </span>
              </div>
            </div>

            {/* Description */}
            {activeLectureModal.description && (
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-xs">
                <span className="block text-[9px] font-extrabold text-[#64748B] uppercase mb-1">
                  Lecture Topics / Outline
                </span>
                <p className="text-[#334155] whitespace-pre-wrap font-medium leading-relaxed">
                  {activeLectureModal.description}
                </p>
              </div>
            )}

            {/* Homework Section */}
            {activeLectureModal.homework?.title && (
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs space-y-1">
                <span className="block text-[9px] font-extrabold text-amber-800 uppercase">
                  📝 Homework Assignment
                </span>
                <p className="font-bold text-amber-950">{activeLectureModal.homework.title}</p>
                {activeLectureModal.homework.description && (
                  <p className="text-amber-800 font-medium text-[11px]">
                    {activeLectureModal.homework.description}
                  </p>
                )}
                {activeLectureModal.homework.due_date && (
                  <p className="text-[10px] text-amber-700 font-semibold pt-1">
                    Due Date: {new Date(activeLectureModal.homework.due_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* Notes Section */}
            {(activeLectureModal.notes_shared?.fileUrl || activeLectureModal.notes_teacher?.fileUrl) && (
              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg text-xs space-y-2">
                <span className="block text-[9px] font-extrabold text-blue-800 uppercase tracking-wider">
                  📄 Study Notes & Resources
                </span>
                {activeLectureModal.notes_shared?.fileUrl && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const fileUrl = activeLectureModal.notes_shared.fileUrl;
                      const fileName = activeLectureModal.notes_shared.fileName || "study_notes.pdf";
                      const link = document.createElement("a");
                      let targetUrl = fileUrl;
                      if (!targetUrl.startsWith("data:") && !targetUrl.startsWith("http://") && !targetUrl.startsWith("https://") && !targetUrl.startsWith("blob:")) {
                        const serverOrigin = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "") : "http://localhost:5000";
                        targetUrl = `${serverOrigin}/${targetUrl.replace(/^\//, "")}`;
                      }
                      link.href = targetUrl;
                      link.download = fileName;
                      link.target = "_blank";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="flex items-center gap-1.5 text-blue-700 font-bold hover:underline cursor-pointer bg-transparent border-0 p-0 text-left"
                  >
                    <Download size={13} /> {activeLectureModal.notes_shared.fileName || "Shared Notes File"}
                  </button>
                )}
                {activeLectureModal.notes_teacher?.fileUrl && role !== "student" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const fileUrl = activeLectureModal.notes_teacher.fileUrl;
                      const fileName = activeLectureModal.notes_teacher.fileName || "teacher_reference.pdf";
                      const link = document.createElement("a");
                      let targetUrl = fileUrl;
                      if (!targetUrl.startsWith("data:") && !targetUrl.startsWith("http://") && !targetUrl.startsWith("https://") && !targetUrl.startsWith("blob:")) {
                        const serverOrigin = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "") : "http://localhost:5000";
                        targetUrl = `${serverOrigin}/${targetUrl.replace(/^\//, "")}`;
                      }
                      link.href = targetUrl;
                      link.download = fileName;
                      link.target = "_blank";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="flex items-center gap-1.5 text-amber-700 font-bold hover:underline cursor-pointer bg-transparent border-0 p-0 text-left"
                  >
                    <Download size={13} /> {activeLectureModal.notes_teacher.fileName || "Teacher Reference Notes"}
                  </button>
                )}
              </div>
            )}

            {/* Actions for Admin/Teacher */}
            {(role === "admin" || role === "teacher") && (
              <div className="pt-2 flex gap-2 flex-wrap">
                {activeLectureModal.status !== "Done" && (
                  <button
                    onClick={() => {
                      if (onUpdateLectureStatus) {
                        onUpdateLectureStatus(
                          activeLectureModal.scheduleId,
                          activeLectureModal.lectureIndex,
                          "Done"
                        );
                      }
                      setActiveLectureModal(null);
                    }}
                    className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                  >
                    <CheckCircle2 size={14} /> Mark Done
                  </button>
                )}
                {onSelectLecture && (
                  <button
                    onClick={() => {
                      onSelectLecture(activeLectureModal);
                      setActiveLectureModal(null);
                    }}
                    className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                  >
                    <Eye size={14} /> Open Full Editor
                  </button>
                )}
                <button
                  onClick={() => setActiveLectureModal(null)}
                  className="px-4 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#1E293B] rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
