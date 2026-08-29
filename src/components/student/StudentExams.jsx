import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Search,
  FileText,
  ExternalLink,
  CheckCircle2,
  Clock,
  TrendingUp,
  RefreshCw,
  BookOpen,
  Calendar,
  Download
} from "lucide-react";

export default function StudentExams() {
  const [examResults, setExamResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [examFilter, setExamFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await API.get("/exam-results/my-results");
      const offlineOnly = (res.data || []).filter(r => r && r.exam?.examType !== "online");
      setExamResults(offlineOnly);
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

  // Filtering
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
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      {/* PAGE HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-1.5 h-7 bg-[#2563EB] rounded-full" />
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              My Exams & Results
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Comprehensive overview of online & offline assessments
          </p>
        </div>

        <button
          onClick={fetchResults}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition shadow-sm"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* SUMMARY STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Exams */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Exams</span>
            <span className="text-2xl font-black text-slate-800">{totalExams}</span>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Scheduled for your batch</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BookOpen size={20} />
          </div>
        </div>

        {/* Passed Exams */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Passed Exams</span>
            <span className="text-2xl font-black text-emerald-600">{passedExams}</span>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Passed successfully</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Average Score</span>
            <span className="text-2xl font-black text-indigo-600">{averageScore}%</span>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Overall performance</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingUp size={20} />
          </div>
        </div>

        {/* Pending / Failed */}
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
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Awaiting evaluation / retry</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Clock size={20} />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search exam by subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 w-full md:w-auto">
          <button
            onClick={() => setExamFilter("all")}
            className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-extrabold rounded-lg transition ${
              examFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            All Exams ({totalExams})
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
          Loading exam records...
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-slate-400 font-semibold text-xs shadow-sm">
          {searchQuery || examFilter !== "all"
            ? "No exams found matching your filter criteria."
            : "No exams scheduled or published for your batch yet."}
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
                className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Card Top Header */}
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

                  {/* Score & Progress Section */}
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

                    {/* Progress Bar */}
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

                  {/* Status & Remarks */}
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

                {/* Footer Action Links */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    {isOnline && (
                      <a
                        href="https://quiz.nexcoreinstitute.org/"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg transition"
                      >
                        Portal Link <ExternalLink size={12} />
                      </a>
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
                  </div>

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
    </div>
  );
}
