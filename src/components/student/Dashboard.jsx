import { useEffect, useState, useMemo } from "react";
import { API } from "../../api/axios";
import toast from "react-hot-toast";
import {
  RefreshCw, BookOpen, Clock, FileText, CheckCircle2,
  Calendar, Award, Target, MessageSquare, ChevronRight,
  TrendingUp, Star, UserCheck
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const S = {
  page: { minHeight: "100vh", background: "#F8FAFC", padding: "28px 32px", fontFamily: "'DM Sans', sans-serif" },
  card: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" },
  pageTitle: { fontSize: 20, fontWeight: 700, color: "#1B2B4B", margin: 0 },
  label: { fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748B" },
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = () => {
    setLoading(true);
    API.get("/dashboard/student")
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        toast.error("Failed to load dashboard statistics");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const todayLectures = data?.todayLectures || [];
  const homework = data?.homework || [];
  const progressList = data?.progress || [];
  const attendance = data?.attendance || { percentage: 0, presentCount: 0, totalClasses: 0 };

  // Calculate average subject progress
  const avgProgress = useMemo(() => {
    if (progressList.length === 0) return 0;
    const sum = progressList.reduce((acc, curr) => acc + (curr.progress || 0), 0);
    return Math.round(sum / progressList.length);
  }, [progressList]);

  const statCards = [
    { label: "Subject Progress", value: `${avgProgress}%`, icon: <TrendingUp size={18} />, tint: "#EFF6FF", ic: "#2563EB" },
    { label: "Assigned Homework", value: homework.filter(h => h.status === "assigned").length, icon: <FileText size={18} />, tint: "#FEF3C7", ic: "#F59E0B" },
    { label: "Attendance Summary", value: `${attendance.percentage}%`, icon: <UserCheck size={18} />, tint: "#ECFDF5", ic: "#10B981" },
    { label: "Total Subjects", value: progressList.length, icon: <BookOpen size={18} />, tint: "#F5F3FF", ic: "#8B5CF6" },
  ];

  return (
    <div style={S.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 style={S.pageTitle} className="flex items-center gap-2">
            Welcome back, {user?.name || "Student"} 👋
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">Here's your academic summary and today's schedule.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 border border-[#E2E8F0] bg-white text-[#1B2B4B] rounded-xl text-xs font-bold hover:bg-gray-50 transition"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
          <span className="text-sm text-gray-500 font-medium">Loading dashboard overview...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stat Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card) => (
              <div key={card.label} style={S.card} className="p-5 flex items-center justify-between">
                <div>
                  <p style={S.label}>{card.label}</p>
                  <p className="text-2xl font-bold text-[#1B2B4B] mt-1">{card.value}</p>
                </div>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: card.tint, color: card.ic }}
                >
                  {card.icon}
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left side: Today's Lectures & Subject Progress */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Today's Lectures */}
              <div style={S.card} className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={16} className="text-blue-600" />
                  <h3 className="font-bold text-[#1B2B4B] text-[15px]">Today's Lectures</h3>
                </div>
                
                {todayLectures.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-500">
                    No lectures scheduled for today.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayLectures.map((lec) => (
                      <div key={lec._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                          <h4 className="font-bold text-[#1B2B4B] text-sm">{lec.title}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">{lec.subject?.subject || "Subject"}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-white border border-[#E2E8F0] px-3 py-1 rounded-lg">
                          <span>{lec.lectureDuration || lec.duration || 60} mins</span>
                          <span>•</span>
                          <span className="text-blue-600 uppercase text-[10px]">{lec.lectureType || "Normal"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Subject Progress */}
              <div style={S.card} className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={16} className="text-blue-600" />
                  <h3 className="font-bold text-[#1B2B4B] text-[15px]">Subject Progress</h3>
                </div>

                {progressList.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-500">
                    No subjects assigned to your batch.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {progressList.map((prog, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-gray-700">
                          <span>{prog.subject}</span>
                          <span>{prog.completedLectures} / {prog.totalLectures} Lectures ({prog.progress || 0}%)</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-500"
                            style={{ width: `${prog.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right side: Homework & Deadlines */}
            <div className="space-y-6">
              
              {/* Homework Card */}
              <div style={S.card} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-blue-600" />
                    <h3 className="font-bold text-[#1B2B4B] text-[15px]">Assigned Homework</h3>
                  </div>
                  <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                    Action Required
                  </span>
                </div>

                {homework.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-500">
                    No assigned homework.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {homework.slice(0, 4).map((hw) => (
                      <div key={hw._id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <h4 className="font-bold text-gray-800 text-xs truncate">{hw.title}</h4>
                        <div className="flex justify-between items-center text-[10px] text-gray-500 mt-2">
                          <span>{hw.subject?.subject || "Subject"}</span>
                          <span className="font-semibold text-rose-600">Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Attendance Card */}
              <div style={S.card} className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Award size={16} className="text-blue-600" />
                  <h3 className="font-bold text-[#1B2B4B] text-[15px]">Attendance Summary</h3>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-extrabold text-[#1B2B4B]">{attendance.percentage}%</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Attended {attendance.presentCount} of {attendance.totalClasses} classes
                    </p>
                  </div>
                  
                  {/* Circular visual progress */}
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="32" cy="32" r="28" fill="transparent" stroke="#F1F5F9" strokeWidth="4" />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="transparent"
                        stroke="#10B981"
                        strokeWidth="4"
                        strokeDasharray={2 * Math.PI * 28}
                        strokeDashoffset={2 * Math.PI * 28 * (1 - attendance.percentage / 100)}
                      />
                    </svg>
                    <span className="absolute text-[10px] font-bold text-gray-700">Attend</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}