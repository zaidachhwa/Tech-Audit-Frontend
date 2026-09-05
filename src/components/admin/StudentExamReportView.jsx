import React, { useState, useEffect, useRef } from "react";
import { getStudentExamReport, downloadStudentExamReportPDF, saveStudentExamReport } from "../../api/student.api";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import {
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Filter,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  RefreshCw,
  Sparkles,
  BookOpen,
  FileCheck,
  Zap,
  Check,
  X,
  HelpCircle,
  Download,
  ChevronDown,
  BookmarkCheck
} from "lucide-react";

/* Custom Tooltip for Recharts Performance Graph */
const GraphTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  const isPositive = data.changePoints > 0;

  return (
    <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-700 min-w-[200px]">
      <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 font-bold text-slate-200">
        <span>{data.name}</span>
        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-semibold">
          {data.examType}
        </span>
      </div>
      <div className="flex justify-between items-center text-slate-300">
        <span>Date:</span>
        <span className="font-semibold text-slate-100">{data.fullDate}</span>
      </div>
      <div className="flex justify-between items-center text-slate-300">
        <span>Score:</span>
        <span className="font-semibold text-slate-100">
          {data.marksObtained} / {data.totalMarks}
        </span>
      </div>
      <div className="flex justify-between items-center text-slate-300">
        <span>Percentage:</span>
        <span className="font-extrabold text-blue-400 text-sm">{data.percentage}%</span>
      </div>
      {data.changePoints !== null && data.changePoints !== undefined && (
        <div className="flex justify-between items-center border-t border-slate-700/60 pt-1.5 text-[11px]">
          <span>vs Previous:</span>
          <span
            className={`font-bold flex items-center gap-1 ${data.changeType === "Improved"
                ? "text-emerald-400"
                : data.changeType === "Declined"
                  ? "text-rose-400"
                  : "text-amber-400"
              }`}
          >
            {isPositive ? `+${data.changePoints}` : data.changePoints}% pts ({data.changeType})
          </span>
        </div>
      )}
    </div>
  );
};

export default function StudentExamReportView({ studentId }) {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Filters state
  const [examType, setExamType] = useState("all");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const subjectDropdownRef = useRef(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        subjectDropdownRef.current &&
        !subjectDropdownRef.current.contains(event.target)
      ) {
        setIsSubjectDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleSubject = (subName) => {
    setSelectedSubjects((prev) =>
      prev.includes(subName) ? prev.filter((s) => s !== subName) : [...prev, subName]
    );
  };

  const handleSelectAllSubjects = () => {
    setSelectedSubjects([]);
  };

  const getSubjectDropdownLabel = () => {
    if (selectedSubjects.length === 0) return "All Subjects";
    if (selectedSubjects.length === 1) return selectedSubjects[0];
    return `${selectedSubjects.length} Subjects Selected`;
  };

  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchReport = async () => {
    try {
      if (!reportData) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      const params = {};
      if (examType && examType !== "all") params.examType = examType;
      if (selectedSubjects.length > 0) params.subject = selectedSubjects.join(",");
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const data = await getStudentExamReport(studentId, params);
      setReportData(data);
    } catch (err) {
      console.error("Failed to load student exam report:", err);
      const msg = err.response?.data?.message || "Failed to load exam report data.";
      if (!reportData) setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const [savingReport, setSavingReport] = useState(false);

  const handleSaveReport = async () => {
    try {
      setSavingReport(true);
      const params = {};
      if (examType && examType !== "all") params.examType = examType;
      if (selectedSubjects.length > 0) params.subject = selectedSubjects.join(",");
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      await saveStudentExamReport(studentId, params);
      toast.success("Exam report saved to All Reports!");
    } catch (err) {
      console.error("Save report failed:", err);
      toast.error(err.response?.data?.message || "Failed to save exam report.");
    } finally {
      setSavingReport(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      const params = {};
      if (examType && examType !== "all") params.examType = examType;
      if (selectedSubjects.length > 0) params.subject = selectedSubjects.join(",");
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const blobData = await downloadStudentExamReportPDF(studentId, params);
      const url = window.URL.createObjectURL(new Blob([blobData], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      const nameStr = reportData?.studentInfo?.name || "Student";
      link.setAttribute("download", `Exam_Report_${nameStr.replace(/\s+/g, "_")}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Exam report PDF downloaded & saved to All Reports!");
    } catch (err) {
      console.error("PDF download failed:", err);
      toast.error("Failed to download PDF report.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchReport();
    }
  }, [studentId, examType, selectedSubjects, startDate, endDate]);

  const handleClearFilters = () => {
    setExamType("all");
    setSelectedSubjects([]);
    setStartDate("");
    setEndDate("");
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[350px]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-[#0F3C8A] rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-600">Analyzing student exam history...</p>
        <p className="text-xs text-slate-400 mt-1">Calculating trend progression, percentage points, & score distribution</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50/50 border border-red-200 rounded-2xl p-8 text-center max-w-lg mx-auto">
        <AlertCircle size={40} className="mx-auto text-red-500 mb-3" />
        <h3 className="text-base font-extrabold text-red-800">Failed to Load Exam Report</h3>
        <p className="text-xs text-red-600 mt-1 mb-4">{error}</p>
        <button
          onClick={fetchReport}
          className="px-4 py-2 bg-[#0F3C8A] text-white text-xs font-bold rounded-lg hover:bg-[#0b2c66] transition inline-flex items-center gap-2"
        >
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  const {
    studentInfo,
    hasSufficientData,
    summary,
    recentPerformance,
    subjectBreakdown,
    examHistory = [],
    graphData = [],
    thresholdUsed = 3
  } = reportData || {};

  // Color mapping helper for status badges
  const getStatusBadge = (status) => {
    if (status === "Improved") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
          <TrendingUp size={14} className="text-emerald-600" /> Improved
        </span>
      );
    } else if (status === "Declined") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200 shadow-sm">
          <TrendingDown size={14} className="text-rose-600" /> Declined
        </span>
      );
    } else if (status === "No significant change") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
          <Minus size={14} className="text-amber-600" /> No Significant Change
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-600 border border-slate-200 shadow-sm">
          <HelpCircle size={14} className="text-slate-400" /> Not Enough Data
        </span>
      );
    }
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* 1. FILTER CONTROLS & HEADER */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Award className="text-[#0F3C8A]" size={22} />
              Student Exam Report
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Comprehensive exam trajectory, trend analysis, and subject-wise score evaluation
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchReport}
              disabled={isRefreshing}
              className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl transition shadow-sm text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              title="Refresh Report"
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin text-[#0F3C8A]" : ""} /> Refresh
            </button>

            <button
              onClick={handleSaveReport}
              disabled={savingReport}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-sm text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              title="Save this report into All Reports"
            >
              {savingReport ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <BookmarkCheck size={14} />
              )}
              {savingReport ? "Saving..." : "Save Report"}
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="px-3.5 py-2 bg-[#0F3C8A] hover:bg-[#0b2c66] text-white rounded-xl transition shadow-sm text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              title="Download Official Exam Report PDF & Auto Save to All Reports"
            >
              {downloadingPdf ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              {downloadingPdf ? "Generating PDF..." : "Download Report"}
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Filter size={14} className="text-[#0F3C8A]" /> Filters:
            </div>

            {/* Exam Type Filter */}
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0F3C8A]/20 transition cursor-pointer"
            >
              <option value="all">All Exams (Online & Offline)</option>
              <option value="online">Online Exams Only</option>
              <option value="offline">Offline Exams Only</option>
            </select>

            {/* Subject Multi-Select Checkbox Dropdown */}
            <div className="relative" ref={subjectDropdownRef}>
              <button
                type="button"
                onClick={() => setIsSubjectDropdownOpen((prev) => !prev)}
                className={`px-3 py-1.5 border rounded-xl text-xs font-bold transition flex items-center gap-2 select-none cursor-pointer ${
                  selectedSubjects.length > 0
                    ? "bg-blue-50 border-[#0F3C8A] text-[#0F3C8A]"
                    : "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100"
                }`}
              >
                <BookOpen size={13} className={selectedSubjects.length > 0 ? "text-[#0F3C8A]" : "text-slate-400"} />
                <span>{getSubjectDropdownLabel()}</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    isSubjectDropdownOpen ? "rotate-180 text-[#0F3C8A]" : "text-slate-400"
                  }`}
                />
              </button>

              {isSubjectDropdownOpen && (
                <div className="absolute top-full mt-1.5 left-0 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl p-2.5 min-w-[210px] max-h-[280px] overflow-y-auto space-y-1">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 px-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Select Subjects</span>
                    {selectedSubjects.length > 0 && (
                      <button
                        type="button"
                        onClick={handleSelectAllSubjects}
                        className="text-rose-600 hover:underline cursor-pointer lowercase font-medium"
                      >
                        reset
                      </button>
                    )}
                  </div>

                  <label className="flex items-center gap-2.5 px-2.5 py-1.5 hover:bg-slate-50 rounded-xl cursor-pointer text-xs font-bold text-slate-800 select-none">
                    <input
                      type="checkbox"
                      checked={selectedSubjects.length === 0}
                      onChange={handleSelectAllSubjects}
                      className="w-4 h-4 text-[#0F3C8A] rounded border-slate-300 accent-[#0F3C8A] cursor-pointer"
                    />
                    <span>All Subjects</span>
                  </label>

                  <div className="border-t border-slate-100 my-1"></div>

                  {(reportData?.availableSubjects || []).length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic px-2 py-1">No subjects available</p>
                  ) : (
                    (reportData?.availableSubjects || []).map((sub) => {
                      const isChecked = selectedSubjects.includes(sub);
                      return (
                        <label
                          key={sub}
                          className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl cursor-pointer text-xs font-semibold select-none transition ${
                            isChecked
                              ? "bg-blue-50/80 text-[#0F3C8A] font-bold"
                              : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSubject(sub)}
                            className="w-4 h-4 text-[#0F3C8A] rounded border-slate-300 accent-[#0F3C8A] cursor-pointer"
                          />
                          <span className="truncate">{sub}</span>
                        </label>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Date Range Inputs */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl text-xs font-medium">
              <Calendar size={13} className="text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-none text-slate-700 text-xs font-semibold focus:outline-none cursor-pointer"
                title="Start Date"
              />
              <span className="text-slate-400 font-bold">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-none text-slate-700 text-xs font-semibold focus:outline-none cursor-pointer"
                title="End Date"
              />
            </div>
          </div>

          {(examType !== "all" || selectedSubjects.length > 0 || startDate || endDate) && (
            <button
              onClick={handleClearFilters}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
            >
              <X size={13} /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* 2. OVERVIEW STAT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Exams */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Attempted</span>
            <div className="p-2 bg-blue-50 text-[#0F3C8A] rounded-xl">
              <FileCheck size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {summary?.totalExamsAttempted || 0}
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Completed exams</p>
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Average Score</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <BarChart2 size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-indigo-900 tracking-tight">
              {summary?.averagePercentage || 0}%
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Across all exams</p>
          </div>
        </div>

        {/* Highest Score */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Highest Score</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-700 tracking-tight">
              {summary?.highestScore || 0}%
            </div>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Best attempt</p>
          </div>
        </div>

        {/* Lowest Score */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Lowest Score</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <TrendingDown size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-700 tracking-tight">
              {summary?.lowestScore || 0}%
            </div>
            <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Lowest attempt</p>
          </div>
        </div>

        {/* Overall Change */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Overall Change</span>
            <div className="p-2 bg-violet-50 text-violet-600 rounded-xl">
              <Zap size={16} />
            </div>
          </div>
          <div>
            <div className={`text-2xl font-black tracking-tight ${(summary?.overallChangePoints || 0) > 0
                ? "text-emerald-700"
                : (summary?.overallChangePoints || 0) < 0
                  ? "text-rose-700"
                  : "text-slate-800"
              }`}>
              {(summary?.overallChangePoints || 0) > 0 ? `+${summary?.overallChangePoints}` : summary?.overallChangePoints || 0}% pts
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">First to latest exam</p>
          </div>
        </div>

        {/* Current Trend Status */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Current Trend</span>
            <div className="p-2 bg-blue-50 text-[#0F3C8A] rounded-xl">
              <Sparkles size={16} />
            </div>
          </div>
          <div>
            <div className="mt-1">
              {getStatusBadge(summary?.overallStatus)}
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-1.5">
              Threshold: &gt; {thresholdUsed}% pts
            </p>
          </div>
        </div>
      </div>

      {/* 3. RECENT PERFORMANCE & INSUFFICIENT DATA NOTICE */}
      {!hasSufficientData ? (
        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 flex items-start gap-4 text-amber-900">
          <AlertCircle size={22} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-800">
              Not Enough Exam Data To Determine Performance Trend
            </h4>
            <p className="text-xs font-medium text-amber-700 mt-1">
              {summary?.totalExamsAttempted === 1
                ? "This student has completed only 1 exam so far. At least 2 completed exams are required to calculate improvement or decline trends."
                : "No completed exam records were found matching the selected filters."}
            </p>
          </div>
        </div>
      ) : (
        recentPerformance && (
          <div className="bg-gradient-to-r from-[#0F3C8A]/5 via-blue-50/40 to-indigo-50/30 border border-[#0F3C8A]/15 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#0F3C8A] uppercase tracking-wider">
                <Sparkles size={14} /> Recent Performance Summary
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                Latest score: <span className="font-extrabold text-[#0F3C8A] text-base">{recentPerformance.latestScore}%</span>{" "}
                <span className="text-slate-500 font-normal">({recentPerformance.latestSubject})</span>
              </h4>
              <p className="text-xs text-slate-600 font-medium">
                Previous score: <span className="font-bold">{recentPerformance.previousScore}%</span> ({recentPerformance.previousSubject})
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm">
              <div className="text-right">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Score Change</p>
                <p className={`text-base font-black ${recentPerformance.changePoints > 0
                    ? "text-emerald-600"
                    : recentPerformance.changePoints < 0
                      ? "text-rose-600"
                      : "text-amber-600"
                  }`}>
                  {recentPerformance.changePoints > 0 ? `+${recentPerformance.changePoints}` : recentPerformance.changePoints}% pts
                </p>
              </div>
              <div>
                {getStatusBadge(recentPerformance.currentTrend)}
              </div>
            </div>
          </div>
        )
      )}

      {/* 4. PERFORMANCE LINE GRAPH & IMPROVEMENT BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <BarChart2 size={16} className="text-[#0F3C8A]" /> Performance Trend Graph
              </h3>
              <p className="text-xs text-slate-400 font-medium">Student percentage score across exams over time</p>
            </div>
            <span className="text-[11px] font-bold text-[#0F3C8A] bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">
              Percentage (%)
            </span>
          </div>

          {graphData.length > 0 ? (
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graphData} margin={{ top: 15, right: 25, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="shortDate"
                    tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    ticks={[0, 25, 50, 75, 100]}
                  />
                  <Tooltip content={<GraphTooltip />} />
                  <ReferenceLine y={40} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "Passing Threshold (40%)", fill: "#d97706", fontSize: 10, position: "insideTopLeft", fontWeight: 700 }} />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="#0F3C8A"
                    strokeWidth={3}
                    dot={{ fill: "#0F3C8A", r: 5, strokeWidth: 2, stroke: "#ffffff" }}
                    activeDot={{ r: 7, fill: "#FF6B00", stroke: "#ffffff", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400 font-semibold">
              No graph data available to display.
            </div>
          )}
        </div>

        {/* Improvement & Transition Stats (1 Col) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <Zap size={16} className="text-[#0F3C8A]" /> Improvement Analysis
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-1.5 mb-4">
              Breakdown of performance transitions between consecutive exams
            </p>

            <div className="space-y-3">
              {/* Improved transitions */}
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-emerald-900">Improved Exams</p>
                    <p className="text-[10px] text-emerald-700 font-medium">Increased by &gt; {thresholdUsed}% pts</p>
                  </div>
                </div>
                <span className="text-xl font-black text-emerald-800">{summary?.improvedCount || 0}</span>
              </div>

              {/* Declined transitions */}
              <div className="p-3.5 bg-rose-50/60 border border-rose-100 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center">
                    <TrendingDown size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-rose-900">Declined Exams</p>
                    <p className="text-[10px] text-rose-700 font-medium">Decreased by &gt; {thresholdUsed}% pts</p>
                  </div>
                </div>
                <span className="text-xl font-black text-rose-800">{summary?.declinedCount || 0}</span>
              </div>

              {/* Stable / Little change */}
              <div className="p-3.5 bg-amber-50/60 border border-amber-100 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                    <Minus size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-amber-900">Little / No Change</p>
                    <p className="text-[10px] text-amber-700 font-medium">Within &plusmn;{thresholdUsed}% pts</p>
                  </div>
                </div>
                <span className="text-xl font-black text-amber-800">{summary?.noChangeCount || 0}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>Overall Trajectory:</span>
            <span className="font-extrabold text-slate-800">
              {(summary?.overallChangePoints || 0) >= 0 ? `+${summary?.overallChangePoints}% pts` : `${summary?.overallChangePoints}% pts`}
            </span>
          </div>
        </div>
      </div>

      {/* 5. SUBJECT / TOPIC PERFORMANCE BREAKDOWN */}
      {subjectBreakdown?.subjectPerformance && subjectBreakdown.subjectPerformance.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <BookOpen size={16} className="text-[#0F3C8A]" /> Subject Performance Breakdown
              </h3>
              <p className="text-xs text-slate-400 font-medium">Evaluation of strong areas, weak areas, and subject-wise averages</p>
            </div>

            <div className="flex items-center gap-3 text-xs font-bold">
              {subjectBreakdown.strongAreas?.length > 0 && (
                <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                  Strong: {subjectBreakdown.strongAreas.join(", ")}
                </span>
              )}
              {subjectBreakdown.weakAreas?.length > 0 && (
                <span className="text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                  Needs Focus: {subjectBreakdown.weakAreas.join(", ")}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {subjectBreakdown.subjectPerformance.map((sub, idx) => (
              <div key={idx} className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2.5 hover:bg-slate-50 transition">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-800 truncate max-w-[170px]">{sub.subject}</h4>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${sub.isStrong
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : sub.isWeak
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-blue-50 text-[#0F3C8A] border-blue-200"
                    }`}>
                    {sub.isStrong ? "Strong Area" : sub.isWeak ? "Weak Area" : "Moderate"}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-black text-slate-900">{sub.averagePercentage}% <span className="text-[10px] font-normal text-slate-400">avg</span></span>
                  <span className="text-xs text-slate-500 font-semibold">{sub.examCount} exam{sub.examCount > 1 ? "s" : ""}</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${sub.averagePercentage >= 75
                        ? "bg-emerald-500"
                        : sub.averagePercentage >= 50
                          ? "bg-[#0F3C8A]"
                          : "bg-rose-500"
                      }`}
                    style={{ width: `${Math.min(100, Math.max(0, sub.averagePercentage))}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 pt-1">
                  <span>Latest: <strong className="text-slate-800">{sub.latestPercentage}%</strong></span>
                  <span className={`font-bold ${sub.trend === "Improved" ? "text-emerald-600" : sub.trend === "Declined" ? "text-rose-600" : "text-slate-600"
                    }`}>
                    {sub.trend === "Improved" ? `Trend: Improved (+${sub.subChange}% pts)` : sub.trend === "Declined" ? `Trend: Declined (${sub.subChange}% pts)` : "Trend: Stable"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. EXAM PERFORMANCE HISTORY TABLE */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden space-y-4 p-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileCheck size={16} className="text-[#0F3C8A]" /> Exam Performance History
            </h3>
            <p className="text-xs text-slate-400 font-medium">All recorded completed exams in chronological order</p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
            Showing {examHistory.length} exams
          </span>
        </div>

        {examHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Exam Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Exam Date</th>
                  <th className="py-3 px-4 text-center">Marks Obtained</th>
                  <th className="py-3 px-4 text-center">Percentage</th>
                  <th className="py-3 px-4 text-center">Change vs Prev</th>
                  <th className="py-3 px-4 text-center">Result / Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {examHistory.map((exam, idx) => {
                  const formattedDate = new Date(exam.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                  });

                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-bold text-slate-400">{exam.attemptNumber}</td>
                      <td className="py-3 px-4 font-extrabold text-slate-900">
                        {exam.subject}
                        {exam.remarks && <p className="text-[10px] text-slate-400 font-normal truncate max-w-xs">{exam.remarks}</p>}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-md border ${exam.examType === "online"
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                        >
                          {exam.examType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-semibold">{formattedDate}</td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">
                        {exam.marksObtained} / {exam.totalMarks}
                      </td>
                      <td className="py-3 px-4 text-center font-extrabold text-sm text-[#0F3C8A]">
                        {exam.percentage}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        {exam.changePoints !== null && exam.changePoints !== undefined ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${exam.changeType === "Improved"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : exam.changeType === "Declined"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-slate-100 text-slate-600 border border-slate-200"
                              }`}
                          >
                            {exam.changeType === "Improved" && <TrendingUp size={12} />}
                            {exam.changeType === "Declined" && <TrendingDown size={12} />}
                            {exam.changeType === "No significant change" && <Minus size={12} />}
                            {exam.changePoints > 0 ? `+${exam.changePoints}` : exam.changePoints}% pts
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Initial Baseline</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase border ${exam.status === "Pass"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                        >
                          {exam.grade ? `${exam.grade} (${exam.status})` : exam.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">
            No exams match the selected filter criteria.
          </div>
        )}
      </div>
    </div>
  );
}
