import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { getHomeworkStatusBadge } from "../../utils/statusHelper";
import {
  RefreshCw, ClipboardList, BookOpen, Clock, Calendar,
  TrendingUp, CheckSquare, Award, AlertCircle, PlayCircle,
  HelpCircle, User
} from "lucide-react";
import { Link } from "react-router-dom";

export default function StudentDashboard() {
  const { user: authUser } = useAuth();
  const [me, setMe] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [examResults, setExamResults] = useState([]);
  const [examFilter, setExamFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [meRes, dbRes, examRes] = await Promise.all([
        API.get("/students/me"),
        API.get("/dashboard/student"),
        API.get("/exam-results/my-results").catch(() => ({ data: [] }))
      ]);
      setMe(meRes.data.student || meRes.data);
      setDashboardData(dbRes.data);
      const offlineOnlyExams = (examRes?.data || []).filter(r => r && r.exam?.examType !== "online");
      setExamResults(offlineOnlyExams);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Compute stat metrics
  const homework = dashboardData?.homework || [];
  const totalHomework = homework.length;
  const submittedHomework = homework.filter(h => (h.status || "").toLowerCase() !== "assigned").length;
  const pendingHomework = homework.filter(h => {
    const s = (h.status || "").toLowerCase();
    return s === "pending_review" || s === "pending approval" || s === "pending_approval" || s === "submitted";
  }).length;
  const approvedHomework = homework.filter(h => {
    const s = (h.status || "").toLowerCase();
    return s === "approved" || s === "completed";
  }).length;
  const rejectedHomework = homework.filter(h => (h.status || "").toLowerCase() === "rejected").length;

  const lectures = dashboardData?.todayLectures || [];
  const normalLectures = lectures.filter(l => (l.lectureType || "Normal") === "Normal");
  const refLectures = lectures.filter(l => (l.lectureType || "Normal") === "Reference");
  const totalLectures = normalLectures.length;
  const completedLectures = normalLectures.filter(l => l.completionStatus === "Completed").length;
  const remainingLectures = totalLectures - completedLectures;
  const refCompleted = refLectures.filter(l => l.completionStatus === "Completed").length;

  const attendance = dashboardData?.attendance || { present: 0, absent: 0, percentage: 0 };
  const totalClasses = attendance.present + attendance.absent;

  return (
    <div className="space-y-6">

      {/* TOP HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-6 bg-[#0F3C8A] rounded-full" />
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              Welcome back, {me?.name || authUser?.name || "Student"} 👋
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            {me?.batch_name ? `${me.batch_name} (No. ${me.batch_no})` : "Student Dashboard"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/student/lecture-scheduler"
            className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white hover:bg-[#1D4ED8] rounded-lg text-xs font-bold transition shadow-sm"
          >
            <Calendar size={14} /> Open Calendar View
          </Link>
          <button
            onClick={fetchAll}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition shadow-sm"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* RENDER STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Attendance Summary */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attendance Percentage</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0F3C8A] flex items-center justify-center"><CheckSquare size={16} /></div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <span className="text-3xl font-black text-slate-800">{attendance.percentage}%</span>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                Present on {attendance.present} of {totalClasses} classes
              </p>
            </div>
            {attendance.percentage >= 75 ? (
              <span className="text-[9px] bg-emerald-50 text-emerald-600 font-extrabold uppercase px-2 py-0.5 rounded border border-emerald-100">Good Status</span>
            ) : (
              <span className="text-[9px] bg-rose-50 text-rose-600 font-extrabold uppercase px-2 py-0.5 rounded border border-rose-100">Low Attendance</span>
            )}
          </div>
        </div>

        {/* Homework Overview */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Homework Status</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF6B00] flex items-center justify-center"><ClipboardList size={16} /></div>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div>
              <span className="block text-[9px] font-bold text-slate-400 uppercase">Assigned</span>
              <span className="text-slate-800 font-black text-base">{totalHomework}</span>
            </div>
            <div>
              <span className="block text-[9px] font-bold text-blue-400 uppercase">Pending</span>
              <span className="text-blue-600 font-black text-base">{pendingHomework}</span>
            </div>
            <div>
              <span className="block text-[9px] font-bold text-emerald-400 uppercase">Approved</span>
              <span className="text-emerald-600 font-black text-base">{approvedHomework}</span>
            </div>
            <div>
              <span className="block text-[9px] font-bold text-rose-400 uppercase">Rejected</span>
              <span className="text-rose-600 font-black text-base">{rejectedHomework}</span>
            </div>
          </div>
        </div>

        {/* Lecture Progress */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lectures progress</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center"><BookOpen size={16} /></div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="block text-[9px] font-bold text-slate-400 uppercase">Total Normal</span>
              <span className="text-slate-800 font-black text-base">{totalLectures}</span>
            </div>
            <div>
              <span className="block text-[9px] font-bold text-emerald-400 uppercase">Completed</span>
              <span className="text-emerald-600 font-black text-base">{completedLectures}</span>
            </div>
            <div>
              <span className="block text-[9px] font-bold text-indigo-400 uppercase">Ref Done</span>
              <span className="text-indigo-600 font-black text-base">{refCompleted}</span>
            </div>
          </div>
        </div>

      </div>

      {/* SUBJECT PROGRESS GRAPH */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-extrabold text-[#0F3C8A] uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp size={16} /> Syllabus Progress
          </span>
          <span className="text-sm font-black text-[#0F3C8A]">{dashboardData?.progress || 0}%</span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 bg-[#0F3C8A]"
            style={{ width: `${dashboardData?.progress || 0}%` }}
          />
        </div>
      </div>

      {/* DOUBLE GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Lectures List */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <div className="w-1 h-4 bg-[#0F3C8A] rounded-full" />
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Batch Lectures list</h3>
          </div>
          <div className="p-6 flex-1 space-y-3 max-h-96 overflow-y-auto">
            {lectures.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-12">No lectures assigned to your batch yet.</p>
            ) : (
              lectures.map((lec) => (
                <div key={lec._id} className="p-3.5 border border-slate-100 bg-slate-50/50 rounded-xl flex justify-between items-center gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-700">{lec.title}</span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold">
                      <span>{lec.syllabus?.subject || lec.syllabus?.name || lec.subjectName || "General"}</span>
                      <span>•</span>
                      <span>{lec.lectureDuration || lec.duration || 60} mins</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded border ${
                    lec.completionStatus === "Completed"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}>
                    {lec.completionStatus || "Pending"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Homework Assignments */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#0F3C8A] rounded-full" />
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">My Homework tasks</h3>
            </div>
            <Link to="/student/assignments" className="text-xs font-bold text-[#FF6B00] hover:underline">View All</Link>
          </div>
          <div className="p-6 flex-1 space-y-3 max-h-96 overflow-y-auto">
            {homework.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-12">No homework tasks assigned to you yet.</p>
            ) : (
              homework.slice(0, 6).map((hw) => {
                const badge = getHomeworkStatusBadge(hw.status);
                // Subject: try lecture.syllabus.subject, then lecture.title, then hw.batchName
                const subjectName =
                  hw.lecture?.syllabus?.subject ||
                  hw.lecture?.title ||
                  hw.batchName ||
                  "—";
                return (
                  <div key={hw._id} className="p-3.5 border border-slate-100 bg-slate-50/50 rounded-xl flex justify-between items-center gap-3">
                    <div className="space-y-1 min-w-0">
                      <span className="text-xs font-bold text-slate-700 block truncate">{hw.title}</span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold flex-wrap">
                        <span className="text-indigo-500 font-bold">{subjectName}</span>
                        <span>•</span>
                        <span>Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span
                      className="px-2 py-0.5 text-[9px] font-extrabold uppercase rounded border whitespace-nowrap"
                      style={{
                        backgroundColor: badge.bg,
                        color: badge.color,
                        borderColor: `${badge.color}20`,
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* EXAM RESULTS MODULE */}
      {(() => {
        const filteredExams = examResults.filter((res) => {
          const type = (res.exam?.examType || "offline").toLowerCase();
          if (examFilter === "online") return type === "online";
          if (examFilter === "offline") return type === "offline";
          return true; // "all"
        });

        return (
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden mt-6">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-orange-500 rounded-full" />
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Award size={16} className="text-orange-500" /> Exams & Results
                </h3>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Filter Buttons */}
                <div className="flex items-center bg-slate-200/60 p-1 rounded-xl gap-1">
                  <button
                    onClick={() => setExamFilter("all")}
                    className={`px-3 py-1 text-xs font-extrabold rounded-lg transition ${
                      examFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setExamFilter("online")}
                    className={`px-3 py-1 text-xs font-extrabold rounded-lg transition ${
                      examFilter === "online" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Online
                  </button>
                  <button
                    onClick={() => setExamFilter("offline")}
                    className={`px-3 py-1 text-xs font-extrabold rounded-lg transition ${
                      examFilter === "offline" ? "bg-white text-amber-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Offline
                  </button>
                </div>

                <Link
                  to="/student/exams"
                  className="text-xs font-extrabold text-[#2563EB] hover:underline bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100"
                >
                  View All Exams →
                </Link>
              </div>
            </div>

            <div className="p-6">
              {filteredExams.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  {examResults.length === 0 ? "No exam results published yet." : `No ${examFilter} exams found.`}
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredExams.map((res) => {
                    const isOnline = res.exam?.examType === "online";
                    const isPending = res.status === "Pending" || res.marksObtained === null || res.marksObtained === undefined;

                    return (
                      <div key={res._id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="font-bold text-slate-800 text-sm truncate">{res.exam?.subject || "Exam"}</h4>
                            <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded border ${
                              isOnline
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : "bg-amber-50 text-amber-600 border-amber-100"
                            }`}>
                              {isOnline ? "Online" : "Offline"}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-semibold mb-3">
                            {res.exam?.date ? new Date(res.exam.date).toLocaleDateString() : "Date N/A"}
                          </p>
                          
                          <div className="flex justify-between items-end mb-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Score</span>
                            {isPending ? (
                              <span className="text-sm font-bold text-slate-400">Awaiting Evaluation</span>
                            ) : (
                              <span className="text-lg font-black text-slate-800">
                                {res.marksObtained} <span className="text-xs text-slate-400">/ {res.totalMarks}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 flex-wrap gap-2">
                          <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded border ${
                            isPending
                              ? "bg-slate-100 text-slate-500 border-slate-200"
                              : res.status === "Pass" 
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                : "bg-rose-50 text-rose-600 border-rose-100"
                          }`}>
                            {isPending ? "Pending" : res.status}
                          </span>
                          
                          <div className="flex items-center gap-2">
                            {isOnline && (
                              <button
                                onClick={() => window.open("https://quiz.nexcoreinstitute.org/", "_blank")}
                                className="text-[10px] font-bold text-emerald-600 hover:underline"
                              >
                                Exam Link
                              </button>
                            )}
                            {!isOnline && res.exam?.questionPaper?.fileUrl && (
                              <a 
                                href={res.exam.questionPaper.fileUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-[10px] font-bold text-amber-600 hover:underline"
                              >
                                Question Paper
                              </a>
                            )}
                            {res.gradedPaper?.fileUrl && (
                              <a 
                                href={res.gradedPaper.fileUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-[10px] font-bold text-blue-600 hover:underline"
                              >
                                Graded Paper
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })()}

    </div>
  );
}