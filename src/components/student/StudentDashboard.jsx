import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
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
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [meRes, dbRes] = await Promise.all([
        API.get("/students/me"),
        API.get("/dashboard/student")
      ]);
      setMe(meRes.data.student || meRes.data);
      setDashboardData(dbRes.data);
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
  const pendingHomework = homework.filter(h => ["pending approval", "pending_approval", "submitted"].includes((h.status || "").toLowerCase())).length;
  const approvedHomework = homework.filter(h => ["approved", "completed"].includes((h.status || "").toLowerCase())).length;
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

  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "approved":
      case "completed":
        return { bg: "bg-emerald-50 text-emerald-700 border-emerald-100", label: "Approved" };
      case "rejected":
        return { bg: "bg-rose-50 text-rose-700 border-rose-100", label: "Rejected" };
      case "submitted":
      case "pending approval":
      case "pending_approval":
        return { bg: "bg-blue-50 text-blue-700 border-blue-100", label: "Pending" };
      default:
        return { bg: "bg-amber-50 text-amber-700 border-amber-100", label: "Assigned" };
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen font-sans" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>
      <Toaster position="top-center" />

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
        <button
          onClick={fetchAll}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition shadow-sm"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
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
                      <span>{lec.syllabus?.subject || "Subject"}</span>
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
            <Link to="/student/homework" className="text-xs font-bold text-[#FF6B00] hover:underline">View All</Link>
          </div>
          <div className="p-6 flex-1 space-y-3 max-h-96 overflow-y-auto">
            {homework.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-12">No homework tasks assigned to you yet.</p>
            ) : (
              homework.slice(0, 6).map((hw) => {
                const badge = getStatusBadge(hw.status);
                return (
                  <div key={hw._id} className="p-3.5 border border-slate-100 bg-slate-50/50 rounded-xl flex justify-between items-center gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-700">{hw.title}</span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold">
                        <span>Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded border ${badge.bg}`}>
                      {badge.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}