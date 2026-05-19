import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { API } from "../api/axios";
import toast from "react-hot-toast";
import {
  CalendarDays,
  Plus,
  Trash2,
  BookOpen,
  User,
  Clock,
  CheckCircle,
  FileSpreadsheet,
  ArrowLeft,
  ChevronRight,
  RefreshCw,
  TrendingUp,
  ListTodo
} from "lucide-react";

export default function LectureSchedule() {
  const { user } = useAuth();
  const role = user?.role || "student";

  // Navigation states
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // Setup form states (Admin)
  const [subject, setSubject] = useState("");
  const [batchId, setBatchId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [numLectures, setNumLectures] = useState(5);
  const [startDate, setStartDate] = useState("");
  const [frequency, setFrequency] = useState("daily");

  // Grid / Spreadsheet states
  const [lectures, setLectures] = useState([]);

  // Option lists (Admin)
  const [batches, setBatches] = useState([]);
  const [teachers, setTeachers] = useState([]);

  // Fetch all schedules
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await API.get("/schedules/list");
      setSchedules(res.data || []);
    } catch (err) {
      toast.error("Failed to load schedules.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch batches and teachers (Admin only)
  const fetchDropdowns = async () => {
    if (role !== "admin") return;
    try {
      const [batchesRes, teachersRes] = await Promise.all([
        API.get("/batches"),
        API.get("/teachers/list")
      ]);
      setBatches(batchesRes.data?.batches || []);
      setTeachers(teachersRes.data?.teachers || []);
    } catch (err) {
      toast.error("Failed to load batches or teachers list.");
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchDropdowns();
  }, [role]);

  // Formatter helper for dates
  const formatDateForInput = (date) => {
    const d = new Date(date);
    let month = "" + (d.getMonth() + 1);
    let day = "" + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  };

  // Frequency interval days helper
  const getFrequencyInterval = (freq) => {
    switch (freq) {
      case "daily": return 1;
      case "every 2 days": return 2;
      case "weekly": return 7;
      case "bi-weekly": return 14;
      default: return 1;
    }
  };

  // Generate rows
  const handleGenerateSchedule = (e) => {
    e.preventDefault();
    if (!subject.trim()) {
      toast.error("Subject name is required.");
      return;
    }
    if (!batchId) {
      toast.error("Please select a Batch.");
      return;
    }
    if (!teacherId) {
      toast.error("Please select a Teacher.");
      return;
    }
    if (!numLectures || numLectures <= 0) {
      toast.error("Please enter a valid number of lectures.");
      return;
    }
    if (!startDate) {
      toast.error("Please select a start date.");
      return;
    }

    const interval = getFrequencyInterval(frequency);
    const generated = [];
    let currentDate = new Date(startDate);

    for (let i = 0; i < numLectures; i++) {
      generated.push({
        _id: `temp-${Date.now()}-${i}`,
        title: `Lecture ${i + 1}`,
        description: "",
        date: formatDateForInput(currentDate),
        status: "Planned"
      });

      if (frequency !== "manual") {
        currentDate.setDate(currentDate.getDate() + interval);
      }
    }

    setLectures(generated);
    toast.success(`Generated schedule with ${numLectures} lectures.`);
  };

  // Append new lecture row
  const addLectureRow = () => {
    const list = [...lectures];
    let nextDate = new Date();

    if (list.length > 0) {
      const last = list[list.length - 1];
      const lastDate = new Date(last.date);
      const interval = getFrequencyInterval(frequency);
      lastDate.setDate(lastDate.getDate() + interval);
      nextDate = lastDate;
    } else if (startDate) {
      nextDate = new Date(startDate);
    }

    list.push({
      _id: `temp-${Date.now()}`,
      title: `Lecture ${list.length + 1}`,
      description: "",
      date: formatDateForInput(nextDate),
      status: "Planned"
    });

    setLectures(list);
  };

  // Update field inside grid
  const handleCellChange = (index, field, value) => {
    const updated = [...lectures];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setLectures(updated);
  };

  // Delete single row from grid (Admin only)
  const removeLectureRow = (index) => {
    const updated = lectures.filter((_, i) => i !== index);
    setLectures(updated);
  };

  // Save changes to database
  const saveSchedule = async () => {
    if (lectures.length === 0) {
      toast.error("Please add at least one lecture row.");
      return;
    }

    // Clean temp IDs before saving
    const sanitizedLectures = lectures.map(l => {
      const cleaned = { ...l };
      if (cleaned._id && cleaned._id.startsWith("temp-")) {
        delete cleaned._id;
      }
      return cleaned;
    });

    try {
      if (isCreating) {
        // Create new
        await API.post("/schedules/create", {
          subject,
          batch: batchId,
          teacher: teacherId,
          lectures: sanitizedLectures
        });
        toast.success("Schedule successfully saved to database!");
      } else {
        // Update existing
        await API.put(`/schedules/update/${selectedSchedule._id}`, {
          subject,
          batch: batchId,
          teacher: teacherId,
          lectures: sanitizedLectures
        });
        toast.success("Schedule changes successfully saved!");
      }
      
      setIsCreating(false);
      setSelectedSchedule(null);
      fetchSchedules();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save schedule.");
    }
  };

  // Delete whole schedule (Admin only)
  const handleDeleteSchedule = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this schedule?")) return;
    try {
      await API.delete(`/schedules/delete/${id}`);
      toast.success("Schedule deleted successfully.");
      fetchSchedules();
    } catch (err) {
      toast.error("Failed to delete schedule.");
    }
  };

  // Export CSV dump
  const exportCSV = () => {
    if (lectures.length === 0) {
      toast.error("No lectures to export.");
      return;
    }

    const csvHeaders = ["Lecture #", "Title", "Description", "Date", "Status"];
    const csvRows = lectures.map((l, index) => [
      index + 1,
      `"${(l.title || "").replace(/"/g, '""')}"`,
      `"${(l.description || "").replace(/"/g, '""')}"`,
      l.date ? new Date(l.date).toLocaleDateString() : "",
      l.status
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [csvHeaders.join(","), ...csvRows.map(r => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${subject || "lecture"}_schedule.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate live stats metrics
  const totalLectures = lectures.length;
  const titledCount = lectures.filter(l => (l.title || "").trim() !== "").length;
  const scheduledCount = lectures.filter(l => l.status === "Scheduled").length;
  const completedCount = lectures.filter(l => l.status === "Done").length;
  const completionPercentage = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;

  // Open scheduler editor
  const handleOpenEdit = (schedule) => {
    setSelectedSchedule(schedule);
    setSubject(schedule.subject);
    setBatchId(schedule.batch?._id || "");
    setTeacherId(schedule.teacher?._id || "");
    setLectures(schedule.lectures || []);
    setIsCreating(false);
  };

  // Open scheduler creator
  const handleOpenCreate = () => {
    setSubject("");
    setBatchId("");
    setTeacherId("");
    setNumLectures(5);
    setStartDate("");
    setFrequency("daily");
    setLectures([]);
    setIsCreating(true);
    setSelectedSchedule(null);
  };

  // Go back to listing dashboard
  const handleBack = () => {
    setSelectedSchedule(null);
    setIsCreating(false);
    fetchSchedules();
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen p-6 font-[DM_Sans] space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {(selectedSchedule || isCreating) && (
              <button 
                onClick={handleBack} 
                className="p-1 text-[#64748B] hover:text-[#1B2B4B] hover:bg-[#F1F5F9] rounded-lg transition-colors cursor-pointer"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <h1 className="text-[20px] font-bold text-[#1B2B4B]">Lecture Scheduler</h1>
          </div>
          <p className="text-[13px] text-[#64748B]">
            {isCreating ? "Generate and define a new course schedule calendar" : selectedSchedule ? `Viewing schedule for ${subject}` : "Manage and track lecture schedules across batches"}
          </p>
        </div>

        {role === "admin" && !selectedSchedule && !isCreating && (
          <button
            onClick={handleOpenCreate}
            className="bg-[#2563EB] text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 hover:bg-[#1D4ED8] transition-all shadow-sm cursor-pointer"
          >
            <Plus size={16} /> New Schedule
          </button>
        )}
      </div>

      {/* DASHBOARD GRID LIST (Only shown when not editing/creating) */}
      {!selectedSchedule && !isCreating ? (
        loading ? (
          <div className="flex justify-center items-center py-20">
            <RefreshCw size={24} className="animate-spin text-[#2563EB]" />
          </div>
        ) : schedules.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center max-w-md mx-auto mt-10">
            <div className="w-12 h-12 bg-blue-50 text-[#2563EB] rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarDays size={24} />
            </div>
            <h3 className="text-base font-bold text-[#1B2B4B] mb-1">No Schedules Scheduled</h3>
            <p className="text-xs text-[#64748B] mb-6">
              {role === "admin" ? "Create your first lecture schedule calendar and assign it to a teacher and batch." : "You do not have any lecture schedules scheduled at this moment."}
            </p>
            {role === "admin" && (
              <button
                onClick={handleOpenCreate}
                className="bg-[#2563EB] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#1D4ED8] transition-all cursor-pointer"
              >
                Create Schedule
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schedules.map((schedule) => {
              const lecturesList = schedule.lectures || [];
              const total = lecturesList.length;
              const done = lecturesList.filter(l => l.status === "Done").length;
              const percent = total > 0 ? Math.round((done / total) * 100) : 0;

              return (
                <div key={schedule._id} className="bg-white border border-[#E2E8F0] rounded-xl p-5 hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#2563EB] uppercase tracking-wider mb-2">
                          {schedule.batch?.batch_name} #{schedule.batch?.batch_no}
                        </span>
                        <h3 className="text-base font-bold text-[#1B2B4B] leading-tight">
                          {schedule.subject}
                        </h3>
                      </div>
                      
                      {role === "admin" && (
                        <button
                          onClick={() => handleDeleteSchedule(schedule._id)}
                          className="text-[#94A3B8] hover:text-red-500 p-1 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 mt-4 text-xs text-[#64748B] border-t border-[#F1F5F9] pt-4">
                      <div className="flex items-center gap-1.5">
                        <User size={13} className="text-[#94A3B8]" />
                        <span>Teacher: <strong className="text-[#475569]">{schedule.teacher?.name || "Unassigned"}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ListTodo size={13} className="text-[#94A3B8]" />
                        <span>Lectures: <strong className="text-[#475569]">{done}/{total} Done</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#F1F5F9]">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#475569] mb-1.5">
                      <span>Schedule Progress</span>
                      <span>{percent}%</span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] rounded-full h-1.5 mb-4">
                      <div className="bg-[#10B981] h-1.5 rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />
                    </div>

                    <button
                      onClick={() => handleOpenEdit(schedule)}
                      className="w-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#1B2B4B] py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      {role === "student" ? "View Lectures" : "Edit / Manage Schedule"} <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        
        /* SCHEDULER BUILDER & EDITOR WORKSPACE */
        <div className="space-y-6">
          
          {/* SETUP BAR (Admin only during creation/edit) */}
          {role === "admin" && (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-[#1B2B4B] mb-4 flex items-center gap-1.5 uppercase tracking-wider">
                <BookOpen size={16} className="text-[#2563EB]" /> Configuration Setup
              </h2>
              <form onSubmit={handleGenerateSchedule} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  
                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-bold text-[#475569] uppercase mb-1.5">Subject Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Full Stack Web Development"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB] text-xs text-[#1B2B4B] font-medium"
                    />
                  </div>

                  {/* Batch Select */}
                  <div>
                    <label className="block text-xs font-bold text-[#475569] uppercase mb-1.5">Assign Batch</label>
                    <select
                      required
                      value={batchId}
                      onChange={(e) => setBatchId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB] text-xs text-[#1B2B4B] font-medium"
                    >
                      <option value="">-- Select Batch --</option>
                      {batches.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.batch_name} #{b.batch_no}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Teacher Select */}
                  <div>
                    <label className="block text-xs font-bold text-[#475569] uppercase mb-1.5">Assign Teacher</label>
                    <select
                      required
                      value={teacherId}
                      onChange={(e) => setTeacherId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB] text-xs text-[#1B2B4B] font-medium"
                    >
                      <option value="">-- Select Teacher --</option>
                      {teachers.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name} ({t.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-xs font-bold text-[#475569] uppercase mb-1.5">Start Date</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB] text-xs text-[#1B2B4B] font-medium"
                    />
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="block text-xs font-bold text-[#475569] uppercase mb-1.5">Interval Frequency</label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB] text-xs text-[#1B2B4B] font-medium"
                    >
                      <option value="daily">Daily</option>
                      <option value="every 2 days">Every 2 days</option>
                      <option value="weekly">Weekly</option>
                      <option value="bi-weekly">Bi-weekly</option>
                      <option value="manual">Manual (Self Date Setup)</option>
                    </select>
                  </div>

                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-[#475569] uppercase">Number of Lectures:</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={numLectures}
                      onChange={(e) => setNumLectures(Number(e.target.value))}
                      className="w-16 px-2 py-1 bg-white border border-[#E2E8F0] rounded-lg text-center text-xs font-bold focus:outline-none focus:border-[#2563EB] text-[#1B2B4B]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                  >
                    Generate Schedule Rows
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* DYNAMIC STATS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Total Lectures */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex justify-between items-center">
              <div>
                <span className="block text-[10px] uppercase font-bold text-[#64748B] tracking-wider mb-1">Total Lectures</span>
                <span className="text-2xl font-extrabold text-[#1B2B4B]">{totalLectures}</span>
              </div>
              <div className="p-2.5 bg-blue-50 text-[#2563EB] rounded-xl">
                <CalendarDays size={20} />
              </div>
            </div>

            {/* Titled Count */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex justify-between items-center">
              <div>
                <span className="block text-[10px] uppercase font-bold text-[#64748B] tracking-wider mb-1">Titled Lectures</span>
                <span className="text-2xl font-extrabold text-[#1B2B4B]">{titledCount}</span>
              </div>
              <div className="p-2.5 bg-[#FFF7ED] text-[#EA580C] rounded-xl">
                <TrendingUp size={20} />
              </div>
            </div>

            {/* Scheduled Count */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex justify-between items-center">
              <div>
                <span className="block text-[10px] uppercase font-bold text-[#64748B] tracking-wider mb-1">Scheduled Lectures</span>
                <span className="text-2xl font-extrabold text-[#1B2B4B]">{scheduledCount}</span>
              </div>
              <div className="p-2.5 bg-purple-50 text-[#9333EA] rounded-xl">
                <Clock size={20} />
              </div>
            </div>

            {/* Completed Count with Progress Bar */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-1">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-[#64748B] tracking-wider mb-0.5">Completed Lectures</span>
                  <span className="text-xl font-extrabold text-[#065F46]">{completedCount}</span>
                </div>
                <span className="text-xs font-bold text-[#059669] bg-[#E8F5E9] border border-[#C8E6C9] px-2 py-0.5 rounded-full">
                  {completionPercentage}% Done
                </span>
              </div>
              <div className="w-full bg-[#E2E8F0] rounded-full h-2">
                <div className="bg-[#10B981] h-2 rounded-full transition-all duration-300" style={{ width: `${completionPercentage}%` }} />
              </div>
            </div>

          </div>

          {/* SPREADSHEET TABLE WORKSPACE */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-[#1B2B4B]">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold uppercase text-[#64748B] tracking-wider">
                  <tr>
                    <th className="px-5 py-3 w-16 text-center">#</th>
                    <th className="px-5 py-3 min-w-[200px]">Lecture Title</th>
                    <th className="px-5 py-3 min-w-[300px]">Description Summary</th>
                    <th className="px-5 py-3 w-44">Date</th>
                    <th className="px-5 py-3 w-40">Status</th>
                    {role === "admin" && <th className="px-5 py-3 w-16 text-center">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {lectures.length === 0 ? (
                    <tr>
                      <td colSpan={role === "admin" ? 6 : 5} className="px-5 py-8 text-center text-xs text-[#94A3B8] font-medium bg-[#FAFBFC]">
                        Grid is empty. Use the configuration generator above to create lecture rows.
                      </td>
                    </tr>
                  ) : (
                    lectures.map((lecture, index) => {
                      const isDone = lecture.status === "Done";
                      
                      return (
                        <tr key={lecture._id || index} className="hover:bg-[#F8FAFC]/50 transition-colors">
                          
                          {/* # Index Badge */}
                          <td className="px-5 py-3.5 text-center">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                              isDone 
                                ? "bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0]" 
                                : "bg-[#F1F5F9] text-[#475569]"
                            }`}>
                              {index + 1}
                            </span>
                          </td>

                          {/* Lecture Title */}
                          <td className="px-5 py-3.5">
                            {role === "admin" ? (
                              <input
                                type="text"
                                placeholder="Enter lecture title..."
                                value={lecture.title || ""}
                                onChange={(e) => handleCellChange(index, "title", e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-[#E2E8F0] focus:border-[#2563EB] focus:outline-none rounded-lg text-xs font-semibold text-[#1B2B4B] shadow-sm"
                              />
                            ) : (
                              <span className="font-semibold text-xs text-[#1B2B4B] block leading-tight">
                                {lecture.title || "Untitled Lecture"}
                              </span>
                            )}
                          </td>

                          {/* Description */}
                          <td className="px-5 py-3.5">
                            {role === "admin" ? (
                              <textarea
                                rows={1}
                                style={{ resize: "none" }}
                                placeholder="Write description/objectives..."
                                value={lecture.description || ""}
                                onInput={(e) => {
                                  e.target.style.height = "auto";
                                  e.target.style.height = e.target.scrollHeight + "px";
                                }}
                                onChange={(e) => handleCellChange(index, "description", e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-[#E2E8F0] focus:border-[#2563EB] focus:outline-none rounded-lg text-xs font-medium text-[#475569] shadow-sm min-h-[36px]"
                              />
                            ) : (
                              <p className="text-xs text-[#64748B] whitespace-pre-wrap leading-relaxed">
                                {lecture.description || "No description / objectives detailed yet."}
                              </p>
                            )}
                          </td>

                          {/* Date */}
                          <td className="px-5 py-3.5">
                            {role === "admin" ? (
                              <input
                                type="date"
                                value={lecture.date ? formatDateForInput(lecture.date) : ""}
                                onChange={(e) => handleCellChange(index, "date", e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-[#E2E8F0] focus:border-[#2563EB] focus:outline-none rounded-lg text-xs font-semibold text-[#1B2B4B] shadow-sm"
                              />
                            ) : (
                              <span className="text-xs font-semibold text-[#475569]">
                                {lecture.date 
                                  ? new Date(lecture.date).toLocaleDateString(undefined, { 
                                      weekday: "short", 
                                      month: "short", 
                                      day: "numeric", 
                                      year: "numeric" 
                                    })
                                  : "Unscheduled"}
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-5 py-3.5">
                            {role === "admin" || (role === "teacher" && selectedSchedule?.teacher?._id === user?.id) ? (
                              <select
                                value={lecture.status}
                                onChange={(e) => handleCellChange(index, "status", e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg text-xs font-bold shadow-sm focus:outline-none focus:border-[#2563EB] cursor-pointer ${
                                  lecture.status === "Done"
                                    ? "bg-[#ECFDF5] border-[#A7F3D0] text-[#047857]"
                                    : lecture.status === "Scheduled"
                                    ? "bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]"
                                    : "bg-white border-[#E2E8F0] text-[#475569]"
                                }`}
                              >
                                <option value="Planned">Planned</option>
                                <option value="Scheduled">Scheduled</option>
                                <option value="Done">Done</option>
                              </select>
                            ) : (
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                                lecture.status === "Done"
                                  ? "bg-[#D1FAE5] border-[#A7F3D0] text-[#065F46]"
                                  : lecture.status === "Scheduled"
                                  ? "bg-[#DBEAFE] border-[#BFDBFE] text-[#1E40AF]"
                                  : "bg-[#F1F5F9] border-[#E2E8F0] text-[#475569]"
                              }`}>
                                {lecture.status}
                              </span>
                            )}
                          </td>

                          {/* Action (Delete Single Row) */}
                          {role === "admin" && (
                            <td className="px-5 py-3.5 text-center">
                              <button
                                onClick={() => removeLectureRow(index)}
                                className="text-[#94A3B8] hover:text-[#EF4444] p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          )}

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ACTIONS BAR */}
          <div className="flex justify-between items-center border-t border-[#E2E8F0] pt-6 flex-wrap gap-4">
            
            <div className="flex gap-2">
              {role === "admin" && (
                <>
                  <button
                    onClick={addLectureRow}
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2.5 rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={14} /> Add Lecture Row
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to clear the entire spreadsheet?")) {
                        setLectures([]);
                        toast.success("Spreadsheet cleared.");
                      }
                    }}
                    disabled={lectures.length === 0}
                    className="bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] px-4 py-2.5 rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Clear All Rows
                  </button>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={exportCSV}
                disabled={lectures.length === 0}
                className="bg-white border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC] px-4 py-2.5 rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <FileSpreadsheet size={14} className="text-[#10B981]" /> Export CSV File
              </button>

              {role !== "student" && (
                <button
                  onClick={saveSchedule}
                  disabled={lectures.length === 0}
                  className="bg-[#10B981] hover:bg-[#059669] text-white px-5 py-2.5 rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                >
                  Save Schedule Database
                </button>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
