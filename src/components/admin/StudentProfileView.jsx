import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getStudent, uploadStudentPhoto, updateStudent } from "../../api/student.api";
import { getReportsByStudent } from "../../api/report.api";
import { getStudentProjects, deleteProject, approveProject } from "../../api/project.api";
import { getAssignmentsByStudent } from "../../api/assignment.api";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { getHomeworkStatusBadge } from "../../utils/statusHelper";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  ArrowLeft, User, Mail, RefreshCw, BookOpen, BarChart2,
  FileText, Calendar, GraduationCap, Camera, Edit, X, Phone,
  CheckSquare, Briefcase, Layers, Trash2, Key, CheckCircle,
  Clock, AlertTriangle, XCircle, ChevronRight, Download, Eye
} from "lucide-react";

export default function StudentProfileView() {
  const { studentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [academicInfo, setAcademicInfo] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [homeworkSummary, setHomeworkSummary] = useState(null);
  const [lectureProgress, setLectureProgress] = useState(null);
  const [activityTimeline, setActivityTimeline] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [reports, setReports] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "", email: "", phoneNo: "", enrollmentNo: "",
    rollNo: "", course: "", semester: "", department: "",
    dob: "", gender: "", password: ""
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const fileInputRef = useRef(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await getStudent(studentId);
      setStudent(res.student);
      setAcademicInfo(res.academicInfo);
      setAttendanceSummary(res.attendanceSummary);
      setHomeworkSummary(res.homeworkSummary);
      setLectureProgress(res.lectureProgress);
      setActivityTimeline(res.activityTimeline || []);
      setDocuments(res.documents || []);

      // Fetch CRM details (Reports, Tasks, Projects)
      setReportsLoading(true);
      try {
        const [reportRes, tasksRes, projectsRes] = await Promise.allSettled([
          getReportsByStudent(studentId),
          getAssignmentsByStudent(studentId),
          getStudentProjects(studentId)
        ]);

        if (reportRes.status === "fulfilled") setReports(reportRes.value?.reports || []);
        if (tasksRes.status === "fulfilled") setTasks(tasksRes.value?.assignments || []);
        if (projectsRes.status === "fulfilled") setProjects(projectsRes.value?.projects || []);
      } catch (rErr) {
        console.error("Failed to fetch related crm data:", rErr);
      } finally {
        setReportsLoading(false);
      }
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "Failed to load student profile";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [studentId]);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    try {
      setUploadingPhoto(true);
      const reader = new FileReader();

      reader.onloadend = async () => {
        try {
          const base64Photo = reader.result;
          const res = await uploadStudentPhoto(studentId, { photo: base64Photo });
          toast.success("Photo updated successfully");
          setStudent((prev) => ({ ...prev, profilePhoto: res.profilePhoto }));
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed to upload photo");
        } finally {
          setUploadingPhoto(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (err) {
      toast.error("Failed to process image");
      setUploadingPhoto(false);
    }
  };

  const handleResetPassword = async () => {
    const newPass = window.prompt("Enter new password for this student (Min. 6 chars):");
    if (!newPass) return;
    if (newPass.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    try {
      await updateStudent(student._id, { password: newPass });
      toast.success("Password reset successfully!");
    } catch (err) {
      toast.error("Failed to reset password");
    }
  };

  const toggleStatus = async () => {
    try {
      const updatedStatus = !student.isActive;
      await updateStudent(student._id, { isActive: updatedStatus });
      setStudent(prev => ({ ...prev, isActive: updatedStatus }));
      toast.success(`Student status set to ${updatedStatus ? "Active" : "Inactive"}`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteProject = async (e, projectId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;

    try {
      await deleteProject(projectId);
      toast.success("Project deleted successfully");
      const projectsRes = await getStudentProjects(studentId);
      setProjects(projectsRes.projects || projectsRes.data || projectsRes || []);
    } catch (err) {
      toast.error("Failed to delete project");
      console.error(err);
    }
  };

  const handleApproveProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to approve this project?")) return;
    try {
      await approveProject(projectId);
      toast.success("Project approved successfully!");
      setSelectedProject(null);
      fetchData();
    } catch {
      toast.error("Failed to approve project");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingEdit(true);
      const payload = { ...editFormData };
      if (!payload.password) delete payload.password;

      await updateStudent(student._id, payload);
      toast.success("Student updated successfully");
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update student");
    } finally {
      setSavingEdit(false);
    }
  };

  const openEditModal = () => {
    setEditFormData({
      name: student.name || "",
      email: student.email || "",
      phoneNo: student.phoneNo || "",
      enrollmentNo: student.enrollmentNo || "",
      rollNo: student.rollNo || "",
      course: student.course || "",
      semester: student.semester || "",
      department: student.department || "",
      dob: student.dob || "",
      gender: student.gender || "",
      password: "",
    });
    setShowEditModal(true);
  };

  const getPieData = () => {
    if (!reports.length) return [];
    const paramStats = {};
    reports.forEach((r) => {
      r.parameters?.forEach((p) => {
        if (!paramStats[p.name]) {
          paramStats[p.name] = { total: 0, count: 0, totalScore: Number(p.totalScore) || 10 };
        }
        paramStats[p.name].total += Number(p.score) || 0;
        paramStats[p.name].count += 1;
      });
    });

    return Object.keys(paramStats).map((name) => ({
      name,
      value: Number((paramStats[name].total / paramStats[name].count).toFixed(2)),
      totalScore: paramStats[name].totalScore
    }));
  };

  const pieData = getPieData();
  const COLORS = ["#0F3C8A", "#FF6B00", "#10B981", "#8B5CF6", "#EC4899", "#F43F5E", "#14B8A6"];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-[#0F3C8A] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-500">Loading student profile dashboard...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center max-w-sm">
          <GraduationCap size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="font-bold text-slate-800 mb-2">Student Not Found</p>
          {error && <p className="text-xs bg-red-50 text-red-600 border border-red-200 p-2.5 rounded-lg font-mono mb-4">{error}</p>}
          <div className="flex gap-3 justify-center">
            <button onClick={fetchData} className="px-4 py-2 bg-[#0F3C8A] text-white rounded-lg text-xs font-bold hover:bg-[#0b2c66] transition">Retry</button>
            <button onClick={() => navigate(-1)} className="px-4 py-2 border border-slate-200 text-slate-700 bg-white rounded-lg text-xs font-bold hover:bg-slate-50 transition">Go Back</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen font-sans" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Toaster position="top-center" />

      {/* TOP NAVIGATION HEADER */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#0F3C8A] font-bold text-sm hover:text-[#0b2c66] transition"
        >
          <ArrowLeft size={16} /> Back to Directory
        </button>
        <button
          onClick={fetchData}
          className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-slate-700 rounded-lg shadow-sm hover:shadow transition"
          title="Refresh"
        >
          <RefreshCw size={16} className={reportsLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* 1. STUDENT HEADER CARD */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row items-center p-6 gap-6">
        {/* Avatar Photo */}
        <div className="relative flex-shrink-0">
          <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-white shadow-md bg-slate-100 flex items-center justify-center">
            {student.profilePhoto ? (
              <img src={student.profilePhoto} alt={student.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-extrabold text-[#0F3C8A]">{student.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPhoto}
            className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#0F3C8A] border-2 border-white rounded-full flex items-center justify-center text-white shadow hover:bg-[#0b2c66] transition"
            title="Update photo"
          >
            {uploadingPhoto ? <RefreshCw size={12} className="animate-spin" /> : <Camera size={12} />}
          </button>
          <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />
        </div>

        {/* Info Grid */}
        <div className="flex-1 space-y-3 text-center md:text-left min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 justify-center md:justify-start">
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">{student.name}</h1>
            <span className={`inline-block px-3 py-1 text-[10px] font-extrabold uppercase rounded-full border ${
              student.isActive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}>
              {student.isActive ? "Active" : "Inactive"} 
              
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium text-slate-500">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enrollment No</p>
              <p className="text-slate-800 font-bold mt-0.5">{student.enrollmentNo || "N/A"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Roll No</p>
              <p className="text-slate-800 font-bold mt-0.5">{student.rollNo || "N/A"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Batch</p>
              <p className="text-[#0F3C8A] font-extrabold mt-0.5">{student.batch_name} (No. {student.batch_no})</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Course / Dept</p>
              <p className="text-slate-800 font-bold mt-0.5">{student.course || "N/A"} ({student.department || "N/A"})</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-slate-500 justify-center md:justify-start">
            <span className="flex items-center gap-1.5"><Mail size={14} className="text-slate-400" /> {student.email}</span>
            {student.phoneNo && <span className="flex items-center gap-1.5"><Phone size={14} className="text-slate-400" /> {student.phoneNo}</span>}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap md:flex-col gap-2.5 justify-center w-full md:w-auto">
          <button onClick={openEditModal} className="flex-1 md:w-44 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm">
            <Edit size={13} /> Edit Profile
          </button>
          <button onClick={handleResetPassword} className="flex-1 md:w-44 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm">
            <Key size={13} /> Reset Password
          </button>
          <button onClick={toggleStatus} className={`flex-1 md:w-44 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow ${
            student.isActive ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"
          }`}>
            <User size={13} /> {student.isActive ? "Deactivate" : "Activate"}
          </button>
        </div>
      </div>

      {/* CATEGORY TABS SWITCHER */}
      <div className="flex border-b border-slate-200 flex-wrap gap-4 scrollbar-none">
        {[
          { id: "overview", label: "Overview", icon: Layers },
          { id: "academic", label: "Academic Info", icon: BookOpen },
          { id: "attendance", label: "Attendance & Homework", icon: CheckSquare },
          { id: "timeline", label: "Activity Timeline", icon: Calendar },
          { id: "documents", label: "Documents", icon: FileText },
          { id: "crm", label: "Projects & Reports", icon: Briefcase },
          { id: "reports-history", label: "Reports History", icon: BarChart2 }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-1 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-[#0F3C8A] text-[#0F3C8A]"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT AREAS */}
      <div>
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Subject Progress & Academic Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress Bars */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-4">Subject-wise Syllabus Progress</h3>
                {academicInfo?.subjectProgress && academicInfo.subjectProgress.length > 0 ? (
                  <div className="space-y-4">
                    {academicInfo.subjectProgress.map((sub, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span>{sub.subjectName}</span>
                          <span>{sub.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#0F3C8A] h-full rounded-full transition-all duration-500"
                            style={{ width: `${sub.progress}%`, backgroundColor: sub.progress >= 75 ? "#10B981" : sub.progress >= 40 ? "#0F3C8A" : "#FF6B00" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No subjects currently assigned to this batch.</p>
                )}
              </div>

              {/* Lecture Progress stats card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Total Lectures", count: lectureProgress?.totalLectures || 0, color: "text-[#0F3C8A] bg-blue-50 border-blue-100", icon: BookOpen },
                  { label: "Completed", count: lectureProgress?.completedLectures || 0, color: "text-emerald-700 bg-emerald-50 border-emerald-100", icon: CheckCircle },
                  { label: "Remaining", count: lectureProgress?.remainingLectures || 0, color: "text-amber-700 bg-amber-50 border-amber-100", icon: Clock },
                  { label: "Reference Completed", count: lectureProgress?.referenceLecturesCompleted || 0, color: "text-indigo-700 bg-indigo-50 border-indigo-100", icon: Layers }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className={`p-4 rounded-xl border flex flex-col items-center text-center ${item.color}`}>
                      <Icon size={20} className="mb-2 opacity-80" />
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">{item.label}</span>
                      <span className="text-2xl font-black mt-1">{item.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 1 Col: Attendance & Homework summaries */}
            <div className="space-y-6">
              {/* Attendance Card */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col items-center">
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider self-start mb-4">Attendance summary</h3>
                <div className="relative w-28 h-28 flex items-center justify-center">
                  {/* Radial progress ring */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="48" stroke="#F1F5F9" strokeWidth="8" fill="transparent" />
                    <circle cx="56" cy="56" r="48" stroke="#0F3C8A" strokeWidth="8" fill="transparent"
                      strokeDasharray={301.6}
                      strokeDashoffset={301.6 - (301.6 * (attendanceSummary?.percentage || 0)) / 100}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-xl font-black text-slate-800">{attendanceSummary?.percentage || 0}%</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Attendance</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 w-full text-center mt-6 border-t border-slate-100 pt-4 text-xs font-semibold">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Total</span>
                    <span className="text-slate-800 font-bold text-sm">{attendanceSummary?.totalClasses || 0}</span>
                  </div>
                  <div>
                    <span className="text-emerald-500 block text-[9px] uppercase font-bold tracking-wider">Present</span>
                    <span className="text-emerald-600 font-bold text-sm">{attendanceSummary?.present || 0}</span>
                  </div>
                  <div>
                    <span className="text-rose-500 block text-[9px] uppercase font-bold tracking-wider">Absent</span>
                    <span className="text-rose-600 font-bold text-sm">{attendanceSummary?.absent || 0}</span>
                  </div>
                </div>
              </div>

              {/* Homework Card */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-4">Homework Metrics</h3>
                <div className="grid grid-cols-2 gap-3 text-center text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider">Total</span>
                    <span className="text-slate-800 font-black text-lg">{homeworkSummary?.totalHomework || 0}</span>
                  </div>
                  <div className="p-3 bg-blue-50/50 border border-blue-100/50 rounded-xl">
                    <span className="text-blue-500 block text-[9px] font-bold uppercase tracking-wider">Submitted</span>
                    <span className="text-[#0F3C8A] font-black text-lg">{homeworkSummary?.submitted || 0}</span>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                    <span className="text-amber-500 block text-[9px] font-bold uppercase tracking-wider">Pending Approval</span>
                    <span className="text-amber-600 font-black text-lg">{homeworkSummary?.pending || 0}</span>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <span className="text-emerald-500 block text-[9px] font-bold uppercase tracking-wider">Approved</span>
                    <span className="text-emerald-600 font-black text-lg">{homeworkSummary?.approved || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: ACADEMIC INFO */}
        {activeTab === "academic" && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">Course & Class Administration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl space-y-3">
                  <h4 className="text-xs font-extrabold text-[#0F3C8A] uppercase tracking-wider">Academic Record</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                      <span className="text-slate-400">Course / Degree:</span>
                      <span className="text-slate-700 font-bold">{student.course || "N/A"}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                      <span className="text-slate-400">Department:</span>
                      <span className="text-slate-700 font-bold">{student.department || "N/A"}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                      <span className="text-slate-400">Semester:</span>
                      <span className="text-slate-700 font-bold">{student.semester || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Date of Birth:</span>
                      <span className="text-slate-700 font-bold">{student.dob ? new Date(student.dob).toLocaleDateString() : "N/A"}</span>
                    </div>
                  </div>
                </div>

                {student.customFields && Object.keys(student.customFields).length > 0 && (
                  <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl space-y-3">
                    <h4 className="text-xs font-extrabold text-[#0F3C8A] uppercase tracking-wider">Additional Information</h4>
                    <div className="space-y-2 text-xs">
                      {Object.entries(student.customFields).map(([key, value], idx, arr) => (
                        <div key={key} className={`flex justify-between ${idx !== arr.length - 1 ? 'border-b border-slate-200/50 pb-1.5' : ''}`}>
                          <span className="text-slate-400 capitalize">{key}:</span>
                          <span className="text-slate-700 font-bold">{value || "N/A"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl space-y-3">
                  <h4 className="text-xs font-extrabold text-[#0F3C8A] uppercase tracking-wider">Assigned Teachers</h4>
                  {academicInfo?.assignedTeachers && academicInfo.assignedTeachers.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {academicInfo.assignedTeachers.map((teach, i) => (
                        <span key={i} className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700 font-semibold flex items-center gap-1.5">
                          <User size={13} className="text-[#0F3C8A]" /> {teach}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No teachers assigned to this student's lectures yet.</p>
                  )}
                </div>
              </div>

              {/* Subject details progress list */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Assigned Subjects Detail</h4>
                {academicInfo?.subjectProgress && academicInfo.subjectProgress.length > 0 ? (
                  <div className="space-y-3">
                    {academicInfo.subjectProgress.map((sub, idx) => (
                      <div key={idx} className="p-4 border border-slate-200/70 rounded-xl bg-white flex justify-between items-center">
                        <div className="space-y-1">
                          <span className="text-sm font-bold text-slate-800">{sub.subjectName}</span>
                          <span className="block text-[10px] text-slate-400 font-semibold uppercase">Progress Status: {sub.progress >= 75 ? "Excellent" : sub.progress >= 40 ? "On Track" : "Action Required"}</span>
                        </div>
                        <span className={`px-2.5 py-1 text-xs font-black rounded-lg ${
                          sub.progress >= 75 ? "bg-emerald-50 text-emerald-600" : sub.progress >= 40 ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
                        }`}>{sub.progress}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No assigned subjects available.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: ATTENDANCE & HOMEWORK */}
        {activeTab === "attendance" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 1 Col: Present/Absent Logs */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">Attendance Stats</h3>
              <div className="flex-1 flex flex-col justify-center items-center py-6">
                <div className="text-4xl font-black text-[#0F3C8A] mb-1">{attendanceSummary?.percentage || 0}%</div>
                <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">Overall Percentage</div>
                
                <div className="w-full space-y-3.5 mt-8 border-t border-slate-100 pt-6">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Total Classes Taken:</span>
                    <span className="text-slate-700 font-bold">{attendanceSummary?.totalClasses || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-emerald-500 font-semibold">Total Days Present:</span>
                    <span className="text-emerald-600 font-bold">{attendanceSummary?.present || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-rose-500 font-semibold">Total Days Absent:</span>
                    <span className="text-rose-600 font-bold">{attendanceSummary?.absent || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 2 Cols: Homework History List */}
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">Homework Submission History</h3>
              {homeworkSummary?.history && homeworkSummary.history.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {homeworkSummary.history.map((hw, i) => (
                    <div key={i} className="p-4 border border-slate-100 bg-slate-50/50 rounded-xl flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-700">{hw.lecture?.title || "Syllabus Homework"}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold">Assigned By: {hw.assignedBy?.name || "Teacher"}</p>
                        {hw.grade && <span className="inline-block text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">Grade: {hw.grade}</span>}
                        {hw.remarks && <p className="text-[10px] text-slate-500 italic mt-1">Remark: "{hw.remarks}"</p>}
                      </div>
                      <div className="text-right space-y-1">
                        {(() => {
                          const badge = getHomeworkStatusBadge(hw.status);
                          return (
                            <span
                              className="inline-block px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-full border"
                              style={{
                                backgroundColor: badge.bg,
                                color: badge.color,
                                borderColor: `${badge.color}20`,
                              }}
                            >
                              {badge.text}
                            </span>
                          );
                        })()}
                        <p className="text-[9px] text-slate-400 font-bold">{new Date(hw.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">No homework tasks logged for this student.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB: ACTIVITY TIMELINE */}
        {activeTab === "timeline" && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">Recent Student Activity Logs</h3>
            {activityTimeline && activityTimeline.length > 0 ? (
              <div className="relative border-l border-slate-200 ml-4 pl-6 space-y-6 py-2">
                {activityTimeline.map((act, i) => (
                  <div key={i} className="relative">
                    {/* Circle timeline bullet */}
                    <div className="absolute -left-[31px] top-0.5 bg-white border-2 border-[#0F3C8A] w-4.5 h-4.5 rounded-full flex items-center justify-center z-10" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-800">{act.title}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{new Date(act.timestamp).toLocaleString()}</span>
                      </div>
                      {act.description && <p className="text-xs text-slate-500">{act.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No activity timeline records available for this student.</p>
            )}
          </div>
        )}

        {/* TAB: DOCUMENTS */}
        {activeTab === "documents" && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">Identification Documents</h3>
            {documents && documents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {documents.map((doc, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <span className="text-xs font-extrabold text-[#0F3C8A] uppercase tracking-wider">{doc.name}</span>
                      
                      {/* Document thumbnail */}
                      <div className="w-full h-32 rounded-lg bg-white overflow-hidden border border-slate-100 flex items-center justify-center shadow-inner">
                        {doc.url.startsWith("data:image/") || doc.url.includes("image") ? (
                          <img src={doc.url} alt={doc.name} className="w-full h-full object-cover" />
                        ) : (
                          <FileText size={40} className="text-slate-300" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <a href={doc.url} download={doc.name} className="flex-1 py-1.5 bg-[#0F3C8A] hover:bg-[#0b2c66] text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1">
                        <Download size={13} /> Download
                      </a>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition flex items-center justify-center">
                        <Eye size={13} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No uploaded documents available.</p>
            )}
          </div>
        )}

        {/* TAB: PROJECTS & REPORTS (CRM DATA) */}
        {activeTab === "crm" && (
          <div className="space-y-6">
            
            {/* Split layout: Reports with Piechart & Projects list */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 1 Col: Reports Summary & parameters score chart */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">Performance Parameters</h3>
                
                {pieData.length > 0 ? (
                  <div className="h-64 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name, props) => `${value} / ${props.payload.totalScore || 10}`} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-12 text-center">No parameters scores logged in performance reports.</p>
                )}
              </div>

              {/* Right 2 Cols: Projects list */}
              <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">Project submissions</h3>
                
                {projects && projects.length > 0 ? (
                  <div className="space-y-3">
                    {projects.map((proj, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedProject(proj)}
                        className="p-4 border border-slate-200 hover:border-[#0F3C8A]/30 bg-slate-50/50 hover:bg-slate-50 rounded-xl flex justify-between items-center gap-4 cursor-pointer transition"
                      >
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-slate-700">{proj.title}</span>
                          <span className="block text-[10px] text-slate-400 font-bold">Category: {proj.category || "General"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-full border ${
                            proj.overallStatus === "Approved"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                              : proj.overallStatus === "Submitted"
                              ? "bg-amber-50 text-amber-600 border-amber-200"
                              : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}>{proj.overallStatus}</span>
                          
                          <button
                            onClick={(e) => handleDeleteProject(e, proj._id)}
                            className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-6 text-center">No projects submitted by this student.</p>
                )}
              </div>
            </div>

            {/* Performance Reports History Log */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">Academic Reports Logs</h3>
              {reports && reports.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {reports.map((rep, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedReport(rep)}
                      className="p-4 border border-slate-100 bg-slate-50/50 hover:bg-slate-50 rounded-xl flex justify-between items-center cursor-pointer transition"
                    >
                      <div className="space-y-1 text-xs">
                        <span className="font-bold text-slate-700">{rep.title || `Performance Report ${idx + 1}`}</span>
                        <p className="text-[10px] text-slate-400 font-bold">Evaluated On: {new Date(rep.createdAt).toLocaleDateString()}</p>
                      </div>
                      <ChevronRight size={16} className="text-slate-400" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">No evaluation reports generated yet.</p>
              )}
            </div>

          </div>
        )}

        {/* TAB: REPORTS HISTORY */}
        {activeTab === "reports-history" && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm min-h-[400px]">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
              <BarChart2 size={18} className="text-[#0F3C8A]" />
              Reports History
            </h3>
            
            {reportsLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <RefreshCw size={24} className="animate-spin mb-3 text-[#0F3C8A]" />
                <p className="text-xs font-bold uppercase tracking-widest">Loading Reports...</p>
              </div>
            ) : reports && reports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports.map((rep, idx) => {
                  const score = rep.parameters?.reduce((acc, p) => acc + (p.score || 0), 0) || 0;
                  const maxScore = rep.parameters?.reduce((acc, p) => acc + (p.totalScore || 10), 0) || 0;
                  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
                  
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedReport(rep)}
                      className="p-5 border border-slate-200 bg-white hover:border-[#0F3C8A]/30 hover:shadow-md rounded-xl flex flex-col gap-3 cursor-pointer transition-all duration-200 group"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-800 group-hover:text-[#0F3C8A] transition-colors line-clamp-1">
                            {rep.title || `Performance Report ${idx + 1}`}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <Calendar size={12} /> {new Date(rep.createdAt || rep.auditDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 text-[#0F3C8A] group-hover:bg-[#0F3C8A] group-hover:text-white transition-colors">
                          <Eye size={14} />
                        </div>
                      </div>
                      
                      <div className="pt-3 border-t border-slate-100 mt-1">
                        <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
                          <span>Score: <span className="text-slate-800">{score}</span> <span className="text-slate-400">/ {maxScore}</span></span>
                          <span className={percentage >= 75 ? "text-emerald-600" : percentage >= 40 ? "text-amber-600" : "text-red-600"}>{percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%`, backgroundColor: percentage >= 75 ? "#10B981" : percentage >= 40 ? "#F59E0B" : "#EF4444" }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                <FileText size={32} className="text-slate-300 mb-3" />
                <p className="text-sm font-bold text-slate-500">No evaluation reports generated yet.</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm text-center">When a report is generated for this student, its score and timeline will appear here.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* EDIT STUDENT PROFILE MODAL */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-6 z-[1000]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-xl w-full overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-extrabold text-slate-800 text-base uppercase tracking-wider">Edit Student Profile</h3>
                <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
              </div>
              
              <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto space-y-4 text-xs font-semibold">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 uppercase tracking-wider text-[10px] mb-1">Full Name</label>
                    <input type="text" value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 bg-slate-50/50 rounded-lg outline-none" />
                  </div>
                  <div>
                    <label className="block text-slate-400 uppercase tracking-wider text-[10px] mb-1">Email Address</label>
                    <input type="email" value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 bg-slate-50/50 rounded-lg outline-none" />
                  </div>
                  <div>
                    <label className="block text-slate-400 uppercase tracking-wider text-[10px] mb-1">Mobile Number</label>
                    <input type="text" value={editFormData.phoneNo} onChange={(e) => setEditFormData({ ...editFormData, phoneNo: e.target.value })} className="w-full px-3 py-2 border border-slate-200 bg-slate-50/50 rounded-lg outline-none" />
                  </div>
                  <div>
                    <label className="block text-slate-400 uppercase tracking-wider text-[10px] mb-1">Enrollment Number</label>
                    <input type="text" value={editFormData.enrollmentNo} onChange={(e) => setEditFormData({ ...editFormData, enrollmentNo: e.target.value })} className="w-full px-3 py-2 border border-slate-200 bg-slate-50/50 rounded-lg outline-none" />
                  </div>
                  <div>
                    <label className="block text-slate-400 uppercase tracking-wider text-[10px] mb-1">Roll Number</label>
                    <input type="text" value={editFormData.rollNo} onChange={(e) => setEditFormData({ ...editFormData, rollNo: e.target.value })} className="w-full px-3 py-2 border border-slate-200 bg-slate-50/50 rounded-lg outline-none" />
                  </div>
                  <div>
                    <label className="block text-slate-400 uppercase tracking-wider text-[10px] mb-1">Course / Degree</label>
                    <input type="text" value={editFormData.course} onChange={(e) => setEditFormData({ ...editFormData, course: e.target.value })} className="w-full px-3 py-2 border border-slate-200 bg-slate-50/50 rounded-lg outline-none" />
                  </div>
                  <div>
                    <label className="block text-slate-400 uppercase tracking-wider text-[10px] mb-1">Semester</label>
                    <input type="text" value={editFormData.semester} onChange={(e) => setEditFormData({ ...editFormData, semester: e.target.value })} className="w-full px-3 py-2 border border-slate-200 bg-slate-50/50 rounded-lg outline-none" />
                  </div>
                  <div>
                    <label className="block text-slate-400 uppercase tracking-wider text-[10px] mb-1">Department</label>
                    <input type="text" value={editFormData.department} onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })} className="w-full px-3 py-2 border border-slate-200 bg-slate-50/50 rounded-lg outline-none" />
                  </div>
                  <div>
                    <label className="block text-slate-400 uppercase tracking-wider text-[10px] mb-1">Date of Birth</label>
                    <input type="date" value={editFormData.dob} onChange={(e) => setEditFormData({ ...editFormData, dob: e.target.value })} className="w-full px-3 py-2 border border-slate-200 bg-slate-50/50 rounded-lg outline-none" />
                  </div>
                  <div>
                    <label className="block text-slate-400 uppercase tracking-wider text-[10px] mb-1">Gender</label>
                    <select value={editFormData.gender} onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })} className="w-full px-3 py-2 border border-slate-200 bg-slate-50/50 rounded-lg outline-none bg-white">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 uppercase tracking-wider text-[10px] mb-1">Update Password (Leave blank to keep current)</label>
                  <input type="password" placeholder="••••••••" value={editFormData.password} onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })} className="w-full px-3 py-2 border border-slate-200 bg-slate-50/50 rounded-lg outline-none" />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100 justify-end">
                  <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition">Cancel</button>
                  <button type="submit" disabled={savingEdit} className="px-5 py-2 bg-[#0F3C8A] hover:bg-[#0b2c66] text-white rounded-lg font-bold transition flex items-center gap-1.5 shadow">
                    {savingEdit && <RefreshCw size={13} className="animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAIL PROJECT MODAL VIEW */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-6 z-[1000]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-xl w-full overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base uppercase tracking-wider">{selectedProject.title}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Status: {selectedProject.overallStatus}</p>
                </div>
                <button onClick={() => setSelectedProject(null)} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description</h4>
                  <p className="bg-slate-50 border border-slate-150 p-3 rounded-lg text-slate-700 leading-relaxed">
                    {selectedProject.description || "No description provided."}
                  </p>
                </div>
                {selectedProject.modules && selectedProject.modules.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-400 uppercase tracking-wider">Modules Detail</h4>
                    <div className="space-y-2">
                      {selectedProject.modules.map((m, i) => (
                        <div key={i} className="p-3 border border-slate-100 bg-slate-50 rounded-xl flex justify-between items-center">
                          <div>
                            <span className="font-bold text-slate-700 block">{m.name}</span>
                            {m.notes && <p className="text-[10px] text-slate-400 mt-0.5">{m.notes}</p>}
                          </div>
                          <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-full ${
                            m.status === "Completed" ? "bg-emerald-50 text-emerald-600" : m.status === "In Progress" ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-600"
                          }`}>{m.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                <button onClick={() => setSelectedProject(null)} className="flex-1 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg font-bold transition">Close</button>
                {selectedProject.overallStatus === "Submitted" && (
                  <button onClick={() => handleApproveProject(selectedProject._id)} className="flex-[2] py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition shadow shadow-emerald-100">Approve Project</button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAIL REPORT MODAL VIEW */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-6 z-[1000]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-extrabold text-slate-800 text-base uppercase tracking-wider">{selectedReport.title || "Report Details"}</h3>
                <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                {selectedReport.description && (
                  <div>
                    <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-1.5">Evaluator Summary</h4>
                    <p className="bg-slate-50 border border-slate-150 p-3 rounded-lg text-slate-700 leading-relaxed italic">
                      "{selectedReport.description}"
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2">Parameters & Scores</h4>
                  {selectedReport.parameters?.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2.5 border-b border-slate-100">
                      <span className="font-bold text-slate-700">{p.name}</span>
                      <span className="font-black text-[#0F3C8A] bg-blue-50 px-2 py-0.5 rounded">{p.score} / {p.totalScore || 10}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50">
                <button onClick={() => setSelectedReport(null)} className="w-full py-2 bg-[#0F3C8A] hover:bg-[#0b2c66] text-white rounded-lg font-bold transition">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}