import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Monitor,
  Play,
  Clock,
  Calendar,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Award,
  Search,
  BookOpen,
  X,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";

export default function StudentOnlineExams() {
  const navigate = useNavigate();
  const [onlineExams, setOnlineExams] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState("all"); // "all", "active", "upcoming", "completed"

  // Result Breakdown Modal state
  const [activeResultDetail, setActiveResultDetail] = useState(null);

  const fetchOnlineExams = async () => {
    try {
      setLoading(true);
      const res = await API.get("/exam-results/my-results");
      const allData = res.data || [];
      const onlyOnline = allData.filter((r) => r.exam && r.exam.examType === "online");
      setOnlineExams(onlyOnline);

      // Fetch window status for each online exam
      onlyOnline.forEach((r) => {
        const eId = r.exam._id;
        API.get(`/online-exams/status/${eId}`)
          .then((statusRes) => {
            setStatuses((prev) => ({
              ...prev,
              [eId]: statusRes.data
            }));
          })
          .catch(() => {});
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load online exams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnlineExams();
  }, []);

  const handleOpenResultDetail = async (examId) => {
    try {
      toast.loading("Loading result breakdown...", { id: "detail" });
      const res = await API.get(`/online-exams/result-detail/${examId}`);
      setActiveResultDetail(res.data);
      toast.dismiss("detail");
    } catch (err) {
      toast.dismiss("detail");
      toast.error("Result breakdown not available yet");
    }
  };

  const checkExamDone = (r, statusesMap) => {
    const eId = r.exam?._id;
    const statusObj = statusesMap[eId];
    const wStatus = statusObj?.windowStatus;
    const attemptStatus = statusObj?.attempt?.status;

    return (
      (r.status !== "Pending" && r.marksObtained !== null && r.marksObtained !== undefined) ||
      wStatus === "completed" ||
      attemptStatus === "completed" ||
      attemptStatus === "auto_submitted"
    );
  };

  // Filter logic
  const filteredList = onlineExams.filter((item) => {
    const subject = (item.exam?.subject || "").toLowerCase();
    const matchesSearch = subject.includes(searchQuery.toLowerCase());

    const statusObj = statuses[item.exam?._id];
    const wStatus = statusObj?.windowStatus || "available";
    const isDone = checkExamDone(item, statuses);

    let matchesTab = true;
    if (filterTab === "active") {
      matchesTab = (wStatus === "available" || wStatus === "in_progress") && !isDone;
    } else if (filterTab === "upcoming") {
      matchesTab = wStatus === "upcoming";
    } else if (filterTab === "completed") {
      matchesTab = isDone || wStatus === "completed";
    }

    return matchesSearch && matchesTab;
  });

  const activeCount = onlineExams.filter((r) => {
    const st = statuses[r.exam?._id]?.windowStatus;
    const isDone = checkExamDone(r, statuses);
    return (st === "available" || st === "in_progress") && !isDone;
  }).length;

  const upcomingCount = onlineExams.filter((r) => statuses[r.exam?._id]?.windowStatus === "upcoming").length;
  const completedCount = onlineExams.filter((r) => checkExamDone(r, statuses)).length;

  return (
    <div className="space-y-6 pb-24 font-['DM_Sans',sans-serif]">
      <Toaster position="top-right" />

      {/* PAGE HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-1.5 h-7 bg-emerald-600 rounded-full" />
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              Online Exam Portal <Monitor size={22} className="text-emerald-600" />
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Take online quizzes & assessments scheduled for your batch
          </p>
        </div>

        <button
          onClick={fetchOnlineExams}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition shadow-sm"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Portal
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Available / In Progress</span>
            <span className="text-2xl font-black text-emerald-600">{activeCount}</span>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Ready to take now</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Play size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Upcoming Exams</span>
            <span className="text-2xl font-black text-blue-600">{upcomingCount}</span>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Scheduled for future date/time</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Completed Quizzes</span>
            <span className="text-2xl font-black text-indigo-600">{completedCount}</span>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Submitted & evaluated</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search online exam by subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 w-full md:w-auto">
          <button
            onClick={() => setFilterTab("all")}
            className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-extrabold rounded-lg transition ${
              filterTab === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            All Online ({onlineExams.length})
          </button>
          <button
            onClick={() => setFilterTab("active")}
            className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-extrabold rounded-lg transition ${
              filterTab === "active" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilterTab("upcoming")}
            className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-extrabold rounded-lg transition ${
              filterTab === "upcoming" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            onClick={() => setFilterTab("completed")}
            className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-extrabold rounded-lg transition ${
              filterTab === "completed" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>
      </div>

      {/* ONLINE EXAMS CARDS GRID */}
      {loading ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-slate-400 font-semibold text-xs shadow-sm">
          Loading online exams...
        </div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-slate-400 font-semibold text-xs shadow-sm">
          {searchQuery || filterTab !== "all"
            ? "No online exams match your filter criteria."
            : "No online exams currently scheduled for your batch."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredList.map((res) => {
            const examData = res.exam;
            const statusObj = statuses[examData._id];
            const wStatus = statusObj?.windowStatus || "available";
            const attemptStatus = statusObj?.attempt?.status;

            const isCompleted = checkExamDone(res, statuses);

            const scoreObtained = res.marksObtained !== null && res.marksObtained !== undefined
              ? res.marksObtained
              : (statusObj?.attempt?.score !== undefined ? statusObj.attempt.score : null);

            const totalMarksVal = res.totalMarks || statusObj?.attempt?.totalMarks || examData.totalMarks || 100;

            const percentage = scoreObtained !== null && totalMarksVal > 0
              ? Math.round((scoreObtained / totalMarksVal) * 100)
              : (statusObj?.attempt?.percentage !== undefined ? statusObj.attempt.percentage : 0);

            return (
              <div
                key={res._id}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-base">{examData.subject}</h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold mt-0.5">
                        <Calendar size={12} />
                        <span>{new Date(examData.date).toLocaleDateString()}</span>
                        <span>• {examData.startTime || "10:00"}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-lg border ${
                        isCompleted
                          ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                          : wStatus === "in_progress"
                          ? "bg-amber-50 text-amber-600 border-amber-100 animate-pulse"
                          : wStatus === "upcoming"
                          ? "bg-slate-100 text-slate-500 border-slate-200"
                          : "bg-emerald-50 text-emerald-600 border-emerald-100"
                      }`}
                    >
                      {isCompleted ? "Completed" : wStatus === "in_progress" ? "In Progress" : wStatus === "upcoming" ? "Upcoming" : "Available"}
                    </span>
                  </div>

                  {/* Rules Overview */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-4 grid grid-cols-2 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase block">Duration</span>
                      <span className="font-bold text-slate-700">{examData.durationMinutes || 60} Minutes</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase block">Total Marks</span>
                      <span className="font-bold text-emerald-600">{examData.totalMarks || 100} Marks</span>
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTON */}
                <div className="pt-3 border-t border-slate-100">
                  {!isCompleted ? (
                    <button
                      onClick={() => navigate(`/student/online-exam/${examData._id}`)}
                      disabled={wStatus === "upcoming"}
                      className={`w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
                        wStatus === "in_progress"
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                          : wStatus === "upcoming"
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }`}
                    >
                      <Play size={14} />
                      {wStatus === "in_progress"
                        ? "Resume Online Exam"
                        : wStatus === "upcoming"
                        ? `Starts at ${examData.startTime || "scheduled time"}`
                        : "Start Online Exam"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenResultDetail(examData._id)}
                      className="w-full flex items-center justify-between text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 p-2.5 rounded-xl transition"
                    >
                      <span className="flex items-center gap-1.5"><Award size={14} /> Exam Completed</span>
                      <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-black">
                        {percentage}% Score <Eye size={13} />
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RESULT BREAKDOWN MODAL */}
      {activeResultDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto font-['DM_Sans',sans-serif]">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded-lg border border-emerald-100">
                  Online Exam Result Details
                </span>
                <h2 className="text-xl font-black text-slate-800 mt-1">{activeResultDetail.exam?.subject}</h2>
              </div>

              <button
                onClick={() => setActiveResultDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">Score Obtained</span>
                <p className="text-lg font-black text-slate-800">{activeResultDetail.attempt?.score} / {activeResultDetail.attempt?.totalMarks}</p>
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">Percentage</span>
                <p className="text-lg font-black text-indigo-600">{activeResultDetail.attempt?.percentage}%</p>
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">Grade</span>
                <p className="text-lg font-black text-blue-600">{activeResultDetail.attempt?.grade || "N/A"}</p>
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">Status</span>
                <p className={`text-sm font-black uppercase mt-1 ${activeResultDetail.attempt?.status === "Pass" ? "text-emerald-600" : "text-rose-600"}`}>
                  {activeResultDetail.attempt?.status}
                </p>
              </div>
            </div>

            {/* SECURITY AUDIT SUMMARY */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                {activeResultDetail.attempt?.securityStatus === "Suspicious" || activeResultDetail.attempt?.securityStatus === "AutoSubmitted" ? (
                  <ShieldAlert size={20} className="text-rose-500 shrink-0" />
                ) : (
                  <ShieldCheck size={20} className="text-emerald-500 shrink-0" />
                )}
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Exam Security Audit</span>
                  <span className="font-bold text-slate-700">Security Rating: </span>
                  <span className={`font-black uppercase ${
                    activeResultDetail.attempt?.securityStatus === "Suspicious" || activeResultDetail.attempt?.securityStatus === "AutoSubmitted"
                      ? "text-rose-600"
                      : activeResultDetail.attempt?.securityStatus === "Warning"
                      ? "text-amber-600"
                      : "text-emerald-600"
                  }`}>
                    {activeResultDetail.attempt?.securityStatus || "Normal"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[11px] font-bold text-slate-600">
                <span>Tab Switches: <strong className="text-slate-900">{activeResultDetail.attempt?.tabSwitchCount || 0}</strong></span>
                <span>Fullscreen Exits: <strong className="text-slate-900">{activeResultDetail.attempt?.fullscreenExitCount || 0}</strong></span>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
                Question Performance Breakdown ({activeResultDetail.breakdown ? activeResultDetail.breakdown.length : 0})
              </h3>

              {!activeResultDetail.breakdown || activeResultDetail.breakdown.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No detailed responses stored for this attempt.</p>
              ) : (
                activeResultDetail.breakdown.map((q, idx) => (
                  <div
                    key={idx}
                    className={`p-4 border rounded-2xl space-y-2 transition ${
                      q.isCorrect
                        ? "bg-emerald-50/40 border-emerald-200"
                        : "bg-rose-50/40 border-rose-200"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-800">Question #{idx + 1}</span>
                      <span className={`font-extrabold ${q.isCorrect ? "text-emerald-600" : "text-rose-600"}`}>
                        {q.marksAwarded} / {q.totalMarks} Marks
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-900">{q.questionText}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-xs">
                      <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Your Answer</span>
                        <span className={`font-extrabold ${q.isCorrect ? "text-emerald-700" : "text-rose-700"}`}>
                          {q.userAnswer || "(No answer submitted)"}
                        </span>
                      </div>
                      <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Correct Answer</span>
                        <span className="font-extrabold text-emerald-700">{q.correctAnswer}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                onClick={() => setActiveResultDetail(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
