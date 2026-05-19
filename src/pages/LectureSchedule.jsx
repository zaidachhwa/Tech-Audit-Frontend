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
  ListTodo,
  FileText,
  Lock,
  Download,
  AlertCircle,
  Eye,
  Check,
  UploadCloud,
  X
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

  // Homework modal states
  const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState(false);
  const [activeHomeworkLecture, setActiveHomeworkLecture] = useState(null);
  const [homeworkIndex, setHomeworkIndex] = useState(null);
  
  // Homework form states (Admin/Teacher)
  const [homeworkTitle, setHomeworkTitle] = useState("");
  const [homeworkDesc, setHomeworkDesc] = useState("");
  const [homeworkDueDate, setHomeworkDueDate] = useState("");
  const [homeworkAcceptSubmissions, setHomeworkAcceptSubmissions] = useState(true);
  const [homeworkSubmissions, setHomeworkSubmissions] = useState([]);
  const [savingHW, setSavingHW] = useState(false);

  // Student submission states
  const [selectedFile, setSelectedFile] = useState(null);
  const [submittingHW, setSubmittingHW] = useState(false);

  // Submissions Tracker Center states (Admin/Teacher)
  const [isViewingSubmissionsCenter, setIsViewingSubmissionsCenter] = useState(false);
  const [trackerCourse, setTrackerCourse] = useState("");
  const [trackerSchedule, setTrackerSchedule] = useState(null);
  const [trackerSubmissions, setTrackerSubmissions] = useState([]);
  const [trackerStudents, setTrackerStudents] = useState([]);
  const [trackerSelectedStudentId, setTrackerSelectedStudentId] = useState("");
  const [loadingTracker, setLoadingTracker] = useState(false);

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

  // Fetch batches and teachers (Admin/Teacher)
  const fetchDropdowns = async () => {
    if (role !== "admin" && role !== "teacher") return;
    try {
      if (role === "admin") {
        const [batchesRes, teachersRes] = await Promise.all([
          API.get("/batches"),
          API.get("/teachers/list")
        ]);
        setBatches(batchesRes.data?.batches || []);
        setTeachers(teachersRes.data?.teachers || []);
      } else if (role === "teacher") {
        const batchesRes = await API.get("/batches");
        setBatches(batchesRes.data?.batches || []);
        // For teacher, they can only assign themselves. 
        // We set the teachers list to just the current teacher.
        setTeachers([{
          _id: user?.id,
          name: user?.name,
          email: user?.email
        }]);
        setTeacherId(user?.id || "");
      }
    } catch (err) {
      toast.error("Failed to load configuration options.");
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchDropdowns();
  }, [role]);

  // Formatter helper for dates
  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
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
        status: "Planned",
        homework: {
          title: "",
          description: "",
          due_date: undefined,
          accept_submissions: true
        }
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
      status: "Planned",
      homework: {
        title: "",
        description: "",
        due_date: undefined,
        accept_submissions: true
      }
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

    const csvHeaders = ["Lecture #", "Title", "Description", "Date", "Status", "Homework Title", "Homework Due Date"];
    const csvRows = lectures.map((l, index) => [
      index + 1,
      `"${(l.title || "").replace(/"/g, '""')}"`,
      `"${(l.description || "").replace(/"/g, '""')}"`,
      l.date ? new Date(l.date).toLocaleDateString() : "",
      l.status,
      `"${(l.homework?.title || "").replace(/"/g, '""')}"`,
      l.homework?.due_date ? new Date(l.homework.due_date).toLocaleDateString() : ""
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
    setTeacherId(role === "teacher" ? (user?.id || "") : "");
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
    setIsViewingSubmissionsCenter(false);
    fetchSchedules();
  };

  // Handle tracker schedule selected
  const handleTrackerScheduleChange = async (scheduleId) => {
    if (!scheduleId) {
      setTrackerSchedule(null);
      setTrackerSubmissions([]);
      setTrackerStudents([]);
      setTrackerSelectedStudentId("");
      return;
    }

    const schedule = schedules.find(s => s._id === scheduleId);
    setTrackerSchedule(schedule);
    setTrackerSelectedStudentId("");
    
    try {
      setLoadingTracker(true);
      const [subsRes, batchRes] = await Promise.all([
        API.get(`/schedules/${scheduleId}/submissions`),
        API.get(`/batches/${schedule.batch?._id}`)
      ]);
      setTrackerSubmissions(subsRes.data || []);
      setTrackerStudents(batchRes.data?.students || []);
      
      const studentsList = batchRes.data?.students || [];
      if (studentsList.length > 0) {
        setTrackerSelectedStudentId(studentsList[0]._id);
      }
    } catch (err) {
      toast.error("Failed to load submissions or students list.");
    } finally {
      setLoadingTracker(false);
    }
  };

  // Toggle review status from the tracker dashboard
  const handleTrackerToggleReview = async (submissionId) => {
    try {
      const res = await API.patch(`/schedules/submissions/${submissionId}/review`);
      toast.success(res.data?.message || "Review status updated.");
      
      setTrackerSubmissions(prev => prev.map(s => 
        s._id === submissionId ? { ...s, status: res.data?.submission?.status } : s
      ));
    } catch (err) {
      toast.error("Failed to toggle review status.");
    }
  };

  // Fetch Submissions for active Homework
  const fetchSubmissions = async (schedId, lectId) => {
    if (!schedId || !lectId || lectId.startsWith("temp-")) return;
    try {
      const res = await API.get(`/schedules/${schedId}/lectures/${lectId}/submissions`);
      setHomeworkSubmissions(res.data || []);
    } catch (err) {
      toast.error("Failed to load submissions.");
    }
  };

  // Homework Modal opening logic with dynamic pre-fill due dates
  const openHomeworkModal = (lecture, index) => {
    if (!selectedSchedule?._id) {
      toast.error("Please save the schedule first before assigning homework.");
      return;
    }

    setActiveHomeworkLecture(lecture);
    setHomeworkIndex(index);
    setSelectedFile(null);

    setHomeworkTitle(lecture.homework?.title || "");
    setHomeworkDesc(lecture.homework?.description || "");
    setHomeworkAcceptSubmissions(
      typeof lecture.homework?.accept_submissions !== "undefined"
        ? lecture.homework.accept_submissions
        : true
    );

    // Auto Pre-fill due date logic
    if (lecture.homework?.due_date) {
      setHomeworkDueDate(formatDateForInput(lecture.homework.due_date));
    } else {
      const nextLect = lectures[index + 1];
      if (nextLect && nextLect.date) {
        setHomeworkDueDate(formatDateForInput(nextLect.date));
      } else {
        // Last lecture row or no next lecture -> date + 7 days
        if (lecture.date) {
          const calcDate = new Date(lecture.date);
          calcDate.setDate(calcDate.getDate() + 7);
          setHomeworkDueDate(formatDateForInput(calcDate));
        } else {
          // Fallback to today + 7 days
          const calcDate = new Date();
          calcDate.setDate(calcDate.getDate() + 7);
          setHomeworkDueDate(formatDateForInput(calcDate));
        }
      }
    }

    setIsHomeworkModalOpen(true);
    fetchSubmissions(selectedSchedule._id, lecture._id);
  };

  // Admin/Teacher: Save homework changes
  const saveHomework = async () => {
    if (!homeworkTitle.trim()) {
      toast.error("Homework title is required.");
      return;
    }

    try {
      setSavingHW(true);
      const res = await API.post(
        `/schedules/${selectedSchedule._id}/lectures/${activeHomeworkLecture._id}/homework`,
        {
          title: homeworkTitle,
          description: homeworkDesc,
          due_date: homeworkDueDate,
          accept_submissions: homeworkAcceptSubmissions
        }
      );

      // Update local grid state
      const list = [...lectures];
      list[homeworkIndex] = {
        ...list[homeworkIndex],
        homework: res.data.lecture.homework
      };
      setLectures(list);

      toast.success("Homework saved successfully!");
      setIsHomeworkModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save homework.");
    } finally {
      setSavingHW(false);
    }
  };

  // Student: Convert selected file to base64
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File is too large. Maximum size allowed is 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedFile({
        name: file.name,
        base64: reader.result
      });
    };
    reader.readAsDataURL(file);
  };

  // Student: submit file to backend
  const handleHWSubmission = async () => {
    if (!selectedFile) {
      toast.error("Please upload a file first.");
      return;
    }

    try {
      setSubmittingHW(true);
      await API.post(
        `/schedules/${selectedSchedule._id}/lectures/${activeHomeworkLecture._id}/submissions`,
        {
          fileName: selectedFile.name,
          fileUrl: selectedFile.base64
        }
      );

      toast.success("Assignment submitted successfully!");
      setSelectedFile(null);
      fetchSubmissions(selectedSchedule._id, activeHomeworkLecture._id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit assignment.");
    } finally {
      setSubmittingHW(false);
    }
  };

  // Student: delete submission
  const handleDeleteSubmission = async (submissionId) => {
    if (!window.confirm("Are you sure you want to delete this submission?")) return;

    try {
      setSubmittingHW(true); // Reuse submittingHW state for loading indication
      await API.delete(`/schedules/submissions/${submissionId}`);
      
      toast.success("Submission deleted successfully!");
      fetchSubmissions(selectedSchedule._id, activeHomeworkLecture._id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete submission.");
    } finally {
      setSubmittingHW(false);
    }
  };

  // Admin/Teacher: Toggle submission status between pending/reviewed
  const handleToggleReview = async (subId) => {
    try {
      const res = await API.patch(`/schedules/submissions/${subId}/review`);
      toast.success(res.data.message);
      
      // Update in submissions list immediately
      setHomeworkSubmissions(prev =>
        prev.map(item => item._id === subId ? res.data.submission : item)
      );
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  // Render a clean submission download helper
  const handleDownloadFile = (fileName, base64Url) => {
    const link = document.createElement("a");
    link.href = base64Url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen p-6 font-[DM_Sans] space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {(selectedSchedule || isCreating || isViewingSubmissionsCenter) && (
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
            {isViewingSubmissionsCenter 
              ? "Global Homework Submissions Tracker for students and batches"
              : isCreating 
              ? "Generate and define a new course schedule calendar" 
              : selectedSchedule 
              ? `Viewing schedule for ${subject}` 
              : "Manage and track lecture schedules across batches"}
          </p>
        </div>

        {(role === "admin" || role === "teacher") && !selectedSchedule && !isCreating && (
          <div className="flex gap-3">
            {!isViewingSubmissionsCenter ? (
              <button
                onClick={() => {
                  setIsViewingSubmissionsCenter(true);
                  setTrackerCourse("");
                  setTrackerSchedule(null);
                  setTrackerSubmissions([]);
                  setTrackerStudents([]);
                  setTrackerSelectedStudentId("");
                }}
                className="bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#475569] px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Eye size={16} className="text-[#4F46E5]" /> Submissions Tracker
              </button>
            ) : (
              <button
                onClick={() => setIsViewingSubmissionsCenter(false)}
                className="bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#475569] px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <ArrowLeft size={16} /> View Schedules
              </button>
            )}
            
            {!isViewingSubmissionsCenter && (
              <button
                onClick={handleOpenCreate}
                className="bg-[#2563EB] text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 hover:bg-[#1D4ED8] transition-all shadow-sm cursor-pointer"
              >
                <Plus size={16} /> New Schedule
              </button>
            )}
          </div>
        )}
      </div>

      {/* SUBMISSIONS TRACKER WORKSPACE */}
      {isViewingSubmissionsCenter ? (
        <div className="space-y-6">
          {/* TRACKER FILTERS */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-[#1B2B4B] mb-4 flex items-center gap-1.5 uppercase tracking-wider">
              <Eye size={16} className="text-[#2563EB]" /> Homework Submissions Filter
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Select Subject/Course */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#64748B] mb-1.5">
                  Select Course/Subject
                </label>
                <select
                  value={trackerCourse}
                  onChange={(e) => {
                    setTrackerCourse(e.target.value);
                    handleTrackerScheduleChange("");
                  }}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] focus:border-[#2563EB] focus:outline-none rounded-lg text-xs font-semibold text-[#1B2B4B] transition-all"
                >
                  <option value="">-- Choose Course --</option>
                  {Array.from(new Set(schedules.map(s => s.subject))).map((subj, idx) => (
                    <option key={idx} value={subj}>{subj}</option>
                  ))}
                </select>
              </div>

              {/* Select Batch */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#64748B] mb-1.5">
                  Select Course Batch
                </label>
                <select
                  value={trackerSchedule?._id || ""}
                  onChange={(e) => handleTrackerScheduleChange(e.target.value)}
                  disabled={!trackerCourse}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] focus:border-[#2563EB] focus:outline-none rounded-lg text-xs font-semibold text-[#1B2B4B] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">-- Choose Batch --</option>
                  {schedules
                    .filter(s => s.subject === trackerCourse)
                    .map(s => (
                      <option key={s._id} value={s._id}>
                        {s.batch?.batch_name} #{s.batch?.batch_no}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* MAIN TRACKER CONTENT */}
          {trackerSchedule ? (
            loadingTracker ? (
              <div className="flex justify-center items-center py-20 bg-white border border-[#E2E8F0] rounded-xl shadow-sm">
                <RefreshCw size={24} className="animate-spin text-[#2563EB]" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Master Students List */}
                <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-[#F1F5F9] bg-[#FAFBFC]">
                    <h3 className="text-xs font-bold text-[#1B2B4B] uppercase tracking-wider">
                      Students ({trackerStudents.length})
                    </h3>
                  </div>
                  <div className="divide-y divide-[#F1F5F9] max-h-[500px] overflow-y-auto">
                    {trackerStudents.length === 0 ? (
                      <p className="p-6 text-center text-xs text-[#94A3B8] font-medium">
                        No students enrolled in this batch.
                      </p>
                    ) : (
                      trackerStudents.map(student => {
                        const isSelected = student._id === trackerSelectedStudentId;
                        
                        // Count student's submissions for this schedule's homeworks
                        const scheduleHWCount = (trackerSchedule.lectures || []).filter(l => l.homework?.title).length;
                        const studentSubsCount = trackerSubmissions.filter(sub => sub.student?._id === student._id).length;

                        return (
                          <button
                            key={student._id}
                            onClick={() => setTrackerSelectedStudentId(student._id)}
                            className={`w-full text-left p-4 transition-all flex flex-col gap-1 hover:bg-[#F8FAFC] cursor-pointer ${
                              isSelected ? "bg-blue-50/70 border-r-4 border-[#2563EB]" : ""
                            }`}
                          >
                            <span className="text-xs font-bold text-[#1B2B4B]">
                              {student.name}
                            </span>
                            <div className="flex justify-between items-center text-[10px] text-[#64748B]">
                              <span>{student.email}</span>
                              <span className="font-semibold px-1.5 py-0.5 rounded bg-[#F1F5F9]">
                                {studentSubsCount} / {scheduleHWCount} Submitted
                              </span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right Pane: Homework submissions details */}
                <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-[#F1F5F9] bg-[#FAFBFC] flex justify-between items-center">
                    <h3 className="text-xs font-bold text-[#1B2B4B] uppercase tracking-wider">
                      Assignment Status & Submissions
                    </h3>
                    {trackerSelectedStudentId && (
                      <span className="text-xs font-bold text-[#2563EB]">
                        {trackerStudents.find(s => s._id === trackerSelectedStudentId)?.name}
                      </span>
                    )}
                  </div>

                  <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
                    {!trackerSelectedStudentId ? (
                      <div className="text-center py-12 text-[#94A3B8]">
                        <Clock size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-xs font-medium">Select a student from the list to view their submissions.</p>
                      </div>
                    ) : (trackerSchedule.lectures || []).filter(l => l.homework?.title).length === 0 ? (
                      <div className="text-center py-12 text-[#94A3B8]">
                        <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-xs font-medium">No homework assignments configured in this schedule.</p>
                      </div>
                    ) : (
                      (trackerSchedule.lectures || [])
                        .filter(l => l.homework?.title)
                        .map((lecture, idx) => {
                          // Find submission for this lecture by selected student
                          const sub = trackerSubmissions.find(
                            s => s.lecture_id === lecture._id && s.student?._id === trackerSelectedStudentId
                          );

                          return (
                            <div key={lecture._id || idx} className="border border-[#E2E8F0] rounded-xl p-4 space-y-3 hover:shadow-sm transition-all">
                              <div className="flex justify-between items-start flex-wrap gap-2">
                                <div>
                                  <h4 className="text-xs font-bold text-[#1B2B4B]">
                                    {lecture.homework.title}
                                  </h4>
                                  <p className="text-[10px] text-[#64748B]">
                                    Lecture: {lecture.title} | Due: {lecture.homework.due_date ? new Date(lecture.homework.due_date).toLocaleDateString() : "No due date"}
                                  </p>
                                </div>
                                
                                {/* Status badge */}
                                {sub ? (
                                  sub.status === "reviewed" ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0]">
                                      Reviewed
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#2563EB] border border-[#BFDBFE]">
                                      Pending Review
                                    </span>
                                  )
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-[#EF4444] border border-[#FEE2E2]">
                                    Not Submitted
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-[#64748B] bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E2E8F0] whitespace-pre-wrap">
                                {lecture.homework.description || "No instructions provided."}
                              </p>

                              {sub && (
                                <div className="flex justify-between items-center bg-blue-50/40 p-3 rounded-lg border border-blue-100 flex-wrap gap-2">
                                  <div className="flex items-center gap-2">
                                    <FileText size={16} className="text-[#2563EB]" />
                                    <div className="text-left">
                                      <p className="text-xs font-bold text-[#1B2B4B] max-w-[180px] truncate">
                                        {sub.file_url ? (sub.file_url.split(",")[0].startsWith("data:") ? "student_submission_file" : sub.file_url) : "Uploaded File"}
                                      </p>
                                      <p className="text-[9px] text-[#64748B]">
                                        Submitted at: {new Date(sub.submitted_at).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex gap-2">
                                    {sub.file_url && (
                                      <button
                                        onClick={() => handleDownloadFile(sub.file_url.split(",")[0].startsWith("data:") ? "homework_solution.pdf" : "homework_solution", sub.file_url)}
                                        className="bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#475569] p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all shadow-sm cursor-pointer"
                                        title="Download homework submission"
                                      >
                                        <Download size={13} /> Download
                                      </button>
                                    )}

                                    <button
                                      onClick={() => handleTrackerToggleReview(sub._id)}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm cursor-pointer ${
                                        sub.status === "reviewed"
                                          ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200"
                                          : "bg-[#10B981] hover:bg-[#059669] text-white border border-[#10B981]"
                                      }`}
                                    >
                                      {sub.status === "reviewed" ? "Mark Pending" : "Mark Reviewed"}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>

              </div>
            )
          ) : (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center max-w-md mx-auto mt-10">
              <div className="w-12 h-12 bg-indigo-50 text-[#4F46E5] rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen size={24} />
              </div>
              <h3 className="text-base font-bold text-[#1B2B4B] mb-1">No Schedule Selected</h3>
              <p className="text-xs text-[#64748B] mb-2">
                Please select a course and batch schedule above to review student homework submissions.
              </p>
            </div>
          )}
        </div>
      ) : !selectedSchedule && !isCreating ? (
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
              {(role === "admin" || role === "teacher") ? "Create your first lecture schedule calendar and assign it to a batch." : "You do not have any lecture schedules scheduled at this moment."}
            </p>
            {(role === "admin" || role === "teacher") && (
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
          
          {/* SETUP BAR */}
          {(role === "admin" || role === "teacher") && (
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
                    <th className="px-5 py-3 min-w-[180px]">Lecture Title</th>
                    <th className="px-5 py-3 min-w-[220px]">Description Summary</th>
                    <th className="px-5 py-3 w-40">Date</th>
                    <th className="px-5 py-3 w-40">Homework</th>
                    <th className="px-5 py-3 w-36">Status</th>
                    {(role === "admin" || role === "teacher") && <th className="px-5 py-3 w-16 text-center">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {lectures.length === 0 ? (
                    <tr>
                      <td colSpan={role === "admin" ? 7 : 6} className="px-5 py-8 text-center text-xs text-[#94A3B8] font-medium bg-[#FAFBFC]">
                        Grid is empty. Use the configuration generator above to create lecture rows.
                      </td>
                    </tr>
                  ) : (
                    lectures.map((lecture, index) => {
                      const isDone = lecture.status === "Done";
                      const hasHW = lecture.homework?.title;
                      
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
                            {(role === "admin" || role === "teacher") ? (
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
                            {(role === "admin" || role === "teacher") ? (
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
                            {(role === "admin" || role === "teacher") ? (
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

                          {/* Homework Action Column */}
                          <td className="px-5 py-3.5">
                            {lecture._id && !lecture._id.startsWith("temp-") ? (
                              <button
                                onClick={() => openHomeworkModal(lecture, index)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                  hasHW
                                    ? "bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE] hover:bg-[#E0E7FF]"
                                    : "bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
                                }`}
                              >
                                <BookOpen size={13} />
                                {role === "student" ? (hasHW ? "View Homework" : "No HW") : (hasHW ? "Edit HW" : "Add HW")}
                                {hasHW && (
                                  <span className="w-1.5 h-1.5 bg-[#4F46E5] rounded-full inline-block animate-pulse" />
                                )}
                              </button>
                            ) : (
                              <span className="text-[11px] text-[#94A3B8] font-medium italic block leading-tight">
                                Save schedule first
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
                          {(role === "admin" || role === "teacher") && (
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
              {(role === "admin" || role === "teacher") && (
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

      {/* DYNAMIC INTERACTIVE HOMEWORK MODAL */}
      {isHomeworkModalOpen && activeHomeworkLecture && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden animate-[fadeIn_0.2s_ease-out]">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9]">
              <div>
                <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider block mb-0.5">
                  Lecture #{homeworkIndex + 1}: {activeHomeworkLecture.title}
                </span>
                <h3 className="text-base font-extrabold text-[#1B2B4B]">Homework Assignments</h3>
              </div>
              <button
                onClick={() => setIsHomeworkModalOpen(false)}
                className="text-[#94A3B8] hover:text-[#475569] p-1.5 hover:bg-[#F1F5F9] rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* ADMIN / TEACHER EDIT VIEW */}
              {role !== "student" ? (
                <div className="space-y-6">
                  
                  {/* Homework Form */}
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-5 rounded-xl space-y-4">
                    <h4 className="text-xs font-bold text-[#475569] uppercase tracking-wider flex items-center gap-1">
                      <FileText size={14} className="text-[#2563EB]" /> Assignment Config
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Homework Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Build Mongoose Models"
                          value={homeworkTitle}
                          onChange={(e) => setHomeworkTitle(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-[#E2E8F0] focus:border-[#2563EB] focus:outline-none rounded-lg text-xs font-semibold text-[#1B2B4B] shadow-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Due Date</label>
                        <input
                          type="date"
                          value={homeworkDueDate}
                          onChange={(e) => setHomeworkDueDate(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-[#E2E8F0] focus:border-[#2563EB] focus:outline-none rounded-lg text-xs font-semibold text-[#1B2B4B] shadow-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Instructions / Description</label>
                      <textarea
                        rows={3}
                        placeholder="Provide details and instructions for the students..."
                        value={homeworkDesc}
                        onChange={(e) => setHomeworkDesc(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#E2E8F0] focus:border-[#2563EB] focus:outline-none rounded-lg text-xs font-medium text-[#475569] shadow-sm"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
                      <div className="flex items-center gap-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={homeworkAcceptSubmissions}
                            onChange={(e) => setHomeworkAcceptSubmissions(e.target.checked)}
                          />
                          <div className="w-9 h-5 bg-[#CBD5E1] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10B981]"></div>
                        </label>
                        <span className="text-xs font-bold text-[#475569]">
                          {homeworkAcceptSubmissions ? "Accepting student file submissions" : "Submissions locked / closed"}
                        </span>
                      </div>

                      <button
                        onClick={saveHomework}
                        disabled={savingHW}
                        className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {savingHW ? "Saving..." : "Save Homework Settings"}
                      </button>
                    </div>
                  </div>

                  {/* Student Submissions List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-[#475569] uppercase tracking-wider">
                      Student Submissions ({homeworkSubmissions.length})
                    </h4>
                    
                    {homeworkSubmissions.length === 0 ? (
                      <div className="border border-dashed border-[#E2E8F0] rounded-xl p-8 text-center text-xs text-[#94A3B8] font-medium bg-[#FAFBFC]">
                        No student submissions uploaded yet.
                      </div>
                    ) : (
                      <div className="divide-y divide-[#F1F5F9] border border-[#E2E8F0] rounded-xl bg-white overflow-hidden max-h-[250px] overflow-y-auto">
                        {homeworkSubmissions.map((sub) => (
                          <div key={sub._id} className="p-3.5 flex justify-between items-center text-xs hover:bg-[#F8FAFC]">
                            <div>
                              <strong className="block text-[#1B2B4B]">{sub.student?.name}</strong>
                              <span className="text-[10px] text-[#64748B] block mt-0.5">{sub.student?.email}</span>
                              <button
                                onClick={() => handleDownloadFile(sub.fileName, sub.fileUrl)}
                                className="text-[#2563EB] hover:underline flex items-center gap-1 mt-1 text-[10px] font-semibold text-left"
                              >
                                <Download size={11} /> {sub.fileName}
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                                sub.status === "reviewed"
                                  ? "bg-[#D1FAE5] border-[#A7F3D0] text-[#065F46]"
                                  : "bg-[#FFF7ED] border-[#FED7AA] text-[#C2410C]"
                              }`}>
                                {sub.status}
                              </span>

                              <button
                                onClick={() => handleToggleReview(sub._id)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm transition-all cursor-pointer ${
                                  sub.status === "reviewed"
                                    ? "bg-white border border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC]"
                                    : "bg-[#10B981] hover:bg-[#059669] text-white"
                                }`}
                              >
                                {sub.status === "reviewed" ? "Re-open" : "Mark Reviewed"}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                
                /* STUDENT SUBMISSION VIEW */
                <div className="space-y-6">
                  
                  {/* Read-Only Assignment Details */}
                  {!activeHomeworkLecture.homework?.title ? (
                    <div className="bg-[#FFF7ED] border border-[#FED7AA] text-[#9A3412] p-5 rounded-xl text-center space-y-2">
                      <Lock className="mx-auto text-[#EA580C]" size={24} />
                      <h4 className="text-sm font-bold">No Homework Assigned</h4>
                      <p className="text-xs">Your instructor has not added any homework task for this lecture yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      
                      {/* Assignment card */}
                      <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-5 rounded-xl space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#EEF2FF] text-[#4F46E5] uppercase tracking-wider mb-2">
                              Assigned Assignment
                            </span>
                            <h4 className="text-base font-bold text-[#1B2B4B] leading-tight">
                              {activeHomeworkLecture.homework.title}
                            </h4>
                          </div>

                          <div className="text-right">
                            <span className="block text-[10px] font-bold text-[#64748B] uppercase mb-0.5">Due Date</span>
                            <span className="text-xs font-semibold text-[#EF4444]">
                              {activeHomeworkLecture.homework.due_date 
                                ? new Date(activeHomeworkLecture.homework.due_date).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric"
                                  })
                                : "No due date set"}
                            </span>
                          </div>
                        </div>

                        {activeHomeworkLecture.homework.description && (
                          <div className="pt-3 border-t border-[#E2E8F0]">
                            <span className="block text-[10px] font-bold text-[#64748B] uppercase mb-1">Instructions</span>
                            <p className="text-xs text-[#475569] whitespace-pre-wrap leading-relaxed">
                              {activeHomeworkLecture.homework.description}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Submission Area */}
                      {activeHomeworkLecture.homework.accept_submissions === false ? (
                        <div className="bg-[#F1F5F9] border border-[#E2E8F0] p-6 rounded-xl text-center space-y-2 text-[#475569]">
                          <Lock className="mx-auto text-[#64748B]" size={22} />
                          <h5 className="text-xs font-bold uppercase tracking-wider">Submissions Locked</h5>
                          <p className="text-xs text-[#64748B]">The submissions portal for this assignment has been closed by your instructor.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          
                          {/* Green Confirmation banner if already submitted */}
                          {homeworkSubmissions.length > 0 && (
                            <div className="bg-[#ECFDF5] border border-[#A7F3D0] p-4 rounded-xl flex items-start justify-between gap-3 text-[#065F46] text-xs">
                              <div className="flex items-start gap-3">
                                <CheckCircle size={18} className="text-[#059669] shrink-0 mt-0.5" />
                                <div>
                                  <strong className="block text-[#047857]">Assignment Successfully Submitted!</strong>
                                  <span className="block mt-0.5">
                                    You uploaded <strong className="font-semibold">{homeworkSubmissions[0].fileName}</strong> on{" "}
                                    {new Date(homeworkSubmissions[0].updatedAt).toLocaleString()}.
                                  </span>
                                  <span className="block text-[10px] text-[#059669] mt-1 font-bold">
                                    Review Status: {homeworkSubmissions[0].status.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteSubmission(homeworkSubmissions[0]._id)}
                                disabled={submittingHW}
                                className="bg-white border border-[#A7F3D0] hover:bg-[#D1FAE5] text-[#047857] px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                title="Delete submitted homework"
                              >
                                <Trash2 size={13} className="text-[#059669]" /> Delete
                              </button>
                            </div>
                          )}

                          {/* File Dropzone Area */}
                          <div className="bg-white border-2 border-dashed border-[#CBD5E1] rounded-xl p-6 text-center space-y-3 relative hover:border-[#2563EB] transition-colors">
                            <input
                              type="file"
                              onChange={handleFileChange}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            
                            <UploadCloud className="mx-auto text-[#94A3B8]" size={36} />
                            
                            <div>
                              <p className="text-xs font-bold text-[#1B2B4B]">
                                {selectedFile ? `Selected: ${selectedFile.name}` : "Click or drag your assignment file here"}
                              </p>
                              <p className="text-[10px] text-[#64748B] mt-1">Accepts any file formats (PDF, DOCX, ZIP, PNG) up to 2MB</p>
                            </div>
                          </div>

                          {selectedFile && (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setSelectedFile(null)}
                                className="bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleHWSubmission}
                                disabled={submittingHW}
                                className="bg-[#10B981] hover:bg-[#059669] text-white px-5 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                {submittingHW ? "Submitting..." : "Submit Assignment"}
                              </button>
                            </div>
                          )}

                        </div>
                      )}

                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#F1F5F9] flex justify-end">
              <button
                onClick={() => setIsHomeworkModalOpen(false)}
                className="bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#475569] px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
