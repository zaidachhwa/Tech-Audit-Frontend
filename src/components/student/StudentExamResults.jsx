import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Award,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  RefreshCw,
  BookOpen,
  Calendar,
  Download,
  FileText,
  Eye,
  X
} from "lucide-react";

export default function StudentExamResults() {
  const [examResults, setExamResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [examFilter, setExamFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeResultDetail, setActiveResultDetail] = useState(null);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await API.get("/exam-results/my-results");
      setExamResults(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load exam results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleOpenResultDetail = async (examId) => {
    try {
      toast.loading("Loading breakdown...", { id: "detail" });
      const res = await API.get(`/online-exams/result-detail/${examId}`);
      setActiveResultDetail(res.data);
      toast.dismiss("detail");
    } catch (err) {
      toast.dismiss("detail");
      toast.error("Detailed breakdown not available for this exam");
    }
  };

  // Compute metrics
  const gradedExams = examResults.filter(
    (r) => r.status !== "Pending" && r.marksObtained !== null && r.marksObtained !== undefined
  );
  const totalExams = examResults.length;
  const passedExams = gradedExams.filter((r) => r.status === "Pass").length;
  const failedExams = gradedExams.filter((r) => r.status === "Fail").length;
  const pendingExams = examResults.length - gradedExams.length;

  const totalPercentage = gradedExams.reduce((acc, curr) => {
    if (!curr.totalMarks) return acc;
    return acc + (curr.marksObtained / curr.totalMarks) * 100;
  }, 0);

  const averageScore = gradedExams.length > 0 ? Math.round(totalPercentage / gradedExams.length) : 0;

  // Filtered List
  const filteredExams = examResults.filter((item) => {
    const type = (item.exam?.examType || "offline").toLowerCase();
    const subject = (item.exam?.subject || "").toLowerCase();
    
    const matchesFilter =
      examFilter === "all" ||
      (examFilter === "online" && type === "online") ||
      (examFilter === "offline" && type === "offline");

    const matchesSearch = subject.includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-24 font-['DM_Sans',sans-serif]">
      <Toaster position="top-right" />

      {/* PAGE HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-1.5 h-7 bg-indigo-600 rounded-full" />
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              Exam Results & Performance <Award size={22} className="text-indigo-600" />
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Detailed scores, grades, and paper evaluation summaries
          </p>
        </div>

        <button
          onClick={fetchResults}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition shadow-sm"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Results
        </button>
      </div>

      {/* SUMMARY STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Exams</span>
            <span className="text-2xl font-black text-slate-800">{totalExams}</span>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Evaluated & Pending</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BookOpen size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Passed Exams</span>
            <span className="text-2xl font-black text-emerald-600">{passedExams}</span>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Cleared successfully</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Average Score</span>
            <span className="text-2xl font-black text-indigo-600">{averageScore}%</span>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Overall percentage</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Pending / Failed</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-amber-500">{pendingExams}</span>
              <span className="text-xs text-slate-400 font-bold">Pending</span>
              {failedExams > 0 && (
                <span className="text-xs text-rose-500 font-bold">• {failedExams} Fail</span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Pending evaluation / retry</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Clock size={20} />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search exam results..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 w-full md:w-auto">
          <button
            onClick={() => setExamFilter("all")}
            className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-extrabold rounded-lg transition ${
              examFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            All Results ({totalExams})
          </button>
          <button
            onClick={() => setExamFilter("online")}
            className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-extrabold rounded-lg transition ${
              examFilter === "online" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Online ({examResults.filter(r => (r.exam?.examType || "").toLowerCase() === "online").length})
          </button>
          <button
            onClick={() => setExamFilter("offline")}
            className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-extrabold rounded-lg transition ${
              examFilter === "offline" ? "bg-white text-amber-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Offline ({examResults.filter(r => (r.exam?.examType || "").toLowerCase() !== "online").length})
          </button>
        </div>
      </div>

      {/* EXAMS LIST GRID */}
      {loading ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-slate-400 font-semibold text-xs shadow-sm">
          Loading exam results...
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-slate-400 font-semibold text-xs shadow-sm">
          {searchQuery || examFilter !== "all"
            ? "No exam results match your filter criteria."
            : "No exam results recorded for your account yet."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredExams.map((res) => {
            const isOnline = (res.exam?.examType || "").toLowerCase() === "online";
            const isPending =
              res.status === "Pending" ||
              res.marksObtained === null ||
              res.marksObtained === undefined;

            const percentage =
              !isPending && res.totalMarks ? Math.round((res.marksObtained / res.totalMarks) * 100) : 0;

            return (
              <div
                key={res._id}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-base">{res.exam?.subject || "Exam Subject"}</h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold mt-0.5">
                        <Calendar size={12} />
                        <span>{res.exam?.date ? new Date(res.exam.date).toLocaleDateString() : "N/A"}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-lg border ${
                        isOnline
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-amber-50 text-amber-600 border-amber-100"
                      }`}
                    >
                      {isOnline ? "Online Exam" : "Offline Exam"}
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        Score Obtained
                      </span>
                      {isPending ? (
                        <span className="text-xs font-bold text-amber-500">Awaiting Evaluation</span>
                      ) : (
                        <div className="text-right">
                          <span className="text-lg font-black text-slate-800">{res.marksObtained}</span>
                          <span className="text-xs text-slate-400 font-semibold"> / {res.totalMarks}</span>
                        </div>
                      )}
                    </div>

                    {!isPending && (
                      <div className="space-y-1">
                        <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              percentage >= 70 ? "bg-emerald-500" : percentage >= 40 ? "bg-blue-500" : "bg-rose-500"
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-extrabold text-slate-400">
                          <span>0%</span>
                          <span>{percentage}%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-lg border ${
                        isPending
                          ? "bg-amber-50 text-amber-600 border-amber-100"
                          : res.status === "Pass"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-rose-50 text-rose-600 border-rose-100"
                      }`}
                    >
                      {isPending ? "Pending Result" : res.status}
                    </span>

                    {res.remarks && (
                      <span className="text-[10px] text-slate-500 font-semibold italic truncate max-w-[150px]">
                        "{res.remarks}"
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                  {isOnline && !isPending && (
                    <button
                      onClick={() => handleOpenResultDetail(res.exam._id)}
                      className="w-full flex items-center justify-between text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 p-2.5 rounded-xl transition"
                    >
                      <span className="flex items-center gap-1.5"><Award size={14} /> View Question Breakdown</span>
                      <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-black">
                        {percentage}% <Eye size={13} />
                      </span>
                    </button>
                  )}

                  {!isOnline && res.exam?.questionPaper?.fileUrl && (
                    <a
                      href={res.exam.questionPaper.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-lg transition"
                    >
                      <FileText size={13} /> Question Paper
                    </a>
                  )}

                  {res.gradedPaper?.fileUrl && (
                    <a
                      href={res.gradedPaper.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg transition"
                    >
                      <Download size={13} /> Graded PDF
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAILED RESULT BREAKDOWN MODAL */}
      {activeResultDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto font-['DM_Sans',sans-serif]">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded-lg border border-emerald-100">
                  Detailed Result Breakdown
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

            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
                Questions Breakdown ({activeResultDetail.breakdown ? activeResultDetail.breakdown.length : 0})
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
