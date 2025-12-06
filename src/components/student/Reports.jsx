// src/components/student/Reports.jsx
import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart2,
  TrendingUp,
  Calendar,
  FileText,
  Award,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Download,
  Star,
  Target,
  MessageSquare,
} from "lucide-react";

export default function Reports() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedReports, setExpandedReports] = useState(new Set());

  // Fetch reports
  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/reports/student/${user.id}`);
      setReports(res.data?.reports || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  // Toggle report expansion
  const toggleExpanded = (reportId) => {
    setExpandedReports((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reportId)) {
        newSet.delete(reportId);
      } else {
        newSet.add(reportId);
      }
      return newSet;
    });
  };

  // Calculate average score
  const calculateAverage = (parameters) => {
    if (!parameters || parameters.length === 0) return 0;
    const total = parameters.reduce(
      (sum, p) => sum + (Number(p.score) || 0),
      0
    );
    return (total / parameters.length).toFixed(1);
  };

  // Get grade based on average
  const getGrade = (avg) => {
    if (avg >= 9) return { grade: "A+" };
    if (avg >= 8) return { grade: "A" };
    if (avg >= 7) return { grade: "B+" };
    if (avg >= 6) return { grade: "B" };
    if (avg >= 5) return { grade: "C" };
    return { grade: "D" };
  };

  // Statistics
  const stats = {
    total: reports.length,
    avgScore:
      reports.length > 0
        ? (
            reports.reduce(
              (sum, r) => sum + Number(calculateAverage(r.parameters)),
              0
            ) / reports.length
          ).toFixed(1)
        : 0,
    highest:
      reports.length > 0
        ? Math.max(
            ...reports.map((r) => Number(calculateAverage(r.parameters)))
          )
        : 0,
    latest: reports.length > 0 ? reports[0] : null,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Performance Reports</h1>
              <p className="text-gray-600 text-sm">
                Track your progress and view detailed feedback
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchReports}
              disabled={loading}
              className="bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-400 px-4 py-2 rounded-lg transition flex items-center gap-2 cursor-pointer text-gray-700"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              <span className="text-sm font-medium">Refresh</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={<FileText size={20} />}
            label="Total Reports"
            value={stats.total}
          />
          <StatCard
            icon={<TrendingUp size={20} />}
            label="Average Score"
            value={`${stats.avgScore}/10`}
          />
          <StatCard
            icon={<Star size={20} />}
            label="Highest Score"
            value={`${stats.highest}/10`}
          />
          <StatCard
            icon={<Award size={20} />}
            label="Current Grade"
            value={getGrade(stats.avgScore).grade}
          />
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="animate-spin text-emerald-600" size={40} />
          </div>
        ) : reports.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200"
          >
            <BarChart2 size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Reports Yet
            </h3>
            <p className="text-gray-600 text-sm">
              Your performance reports will appear here once available
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {reports.map((report, index) => (
              <ReportCard
                key={report._id}
                report={report}
                index={index}
                expanded={expandedReports.has(report._id)}
                onToggleExpand={() => toggleExpanded(report._id)}
                calculateAverage={calculateAverage}
                getGrade={getGrade}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, label, value }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-lg shadow-sm p-5 border border-gray-200"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
          <div className="text-emerald-600">
            {icon}
          </div>
        </div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </div>
      <div className="text-sm font-medium text-gray-700">{label}</div>
    </motion.div>
  );
}

// Report Card Component
function ReportCard({
  report,
  index,
  expanded,
  onToggleExpand,
  calculateAverage,
  getGrade,
}) {
  const avgScore = calculateAverage(report.parameters);
  const gradeInfo = getGrade(avgScore);
  const auditDate = report.auditDate
    ? new Date(report.auditDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                <BarChart2 size={20} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Performance Report #{index + 1}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar size={14} className="text-gray-500" />
                  <span className="text-sm text-gray-600">{auditDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grade Badge */}
          <div className="bg-emerald-500 px-5 py-2.5 rounded-lg">
            <div className="text-center text-white">
              <div className="text-xs font-medium">Grade</div>
              <div className="text-2xl font-bold">{gradeInfo.grade}</div>
            </div>
          </div>
        </div>

        {/* Average Score */}
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg border border-gray-200">
              <Target size={20} className="text-gray-700" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Average Score</div>
              <div className="text-2xl font-bold text-gray-900">
                {avgScore}/10
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Parameters</div>
            <div className="text-xl font-bold text-gray-900">
              {report.parameters?.length || 0}
            </div>
          </div>
        </div>

        {/* Parameters Summary - Compact View */}
        {!expanded && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Award size={16} className="text-gray-600" />
              <span className="text-sm font-semibold text-gray-900">
                Parameters Overview
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {report.parameters?.slice(0, 4).map((param, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 border border-gray-200 text-gray-900"
                >
                  {param.name}:{" "}
                  <span className="font-bold">{param.score}/10</span>
                </div>
              ))}
              {report.parameters?.length > 4 && (
                <div className="px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-600 border border-gray-200">
                  +{report.parameters.length - 4} more
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Expandable Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 space-y-6 bg-gray-50">
              {/* Detailed Parameters */}
              <div>
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award size={18} className="text-emerald-600" />
                  Detailed Scores ({report.parameters?.length || 0})
                </h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {report.parameters?.map((param, idx) => (
                    <ParameterCard key={idx} parameter={param} />
                  ))}
                </div>
              </div>

              {/* Feedback Points */}
              {report.feedbackSchema && report.feedbackSchema.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MessageSquare size={18} className="text-emerald-600" />
                    Feedback Points
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(report.feedbackSchema[0]).map(
                      ([key, value], idx) => {
                        if (key !== "_id" && value) {
                          return (
                            <div
                              key={idx}
                              className="flex items-start gap-3 bg-white rounded-lg p-4 border border-gray-200"
                            >
                              <div className="flex-shrink-0 w-7 h-7 bg-emerald-500 text-white rounded-lg flex items-center justify-center font-semibold text-sm">
                                {idx + 1}
                              </div>
                              <p className="text-sm text-gray-700 flex-1">
                                {value}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }
                    )}
                  </div>
                </div>
              )}

              {/* Overall Remarks */}
              {report.overallRemarks && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText size={18} className="text-emerald-600" />
                    Overall Remarks
                  </h4>
                  <div className="bg-white rounded-lg p-5 border border-gray-200">
                    <p className="text-gray-700 leading-relaxed text-sm">
                      {report.overallRemarks}
                    </p>
                  </div>
                </div>
              )}

              {/* PDF Download */}
              {report.pdfUrl && (
                <div>
                  <a
                    href={report.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-semibold shadow-sm transition"
                  >
                    <Download size={18} />
                    Download PDF Report
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={onToggleExpand}
          className="w-full flex items-center justify-center gap-2 text-gray-700 hover:text-gray-900 font-medium cursor-pointer"
        >
          {expanded ? (
            <>
              <ChevronUp size={18} />
              <span className="text-sm">Show Less</span>
            </>
          ) : (
            <>
              <ChevronDown size={18} />
              <span className="text-sm">View Full Report</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

// Parameter Card Component
function ParameterCard({ parameter }) {
  const score = Number(parameter.score) || 0;

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h5 className="font-semibold text-gray-900 mb-2 text-sm">
            {parameter.name}
          </h5>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score * 10}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-emerald-500 rounded-full"
            />
          </div>
        </div>
        <div className="ml-4 bg-emerald-500 text-white px-3 py-1.5 rounded-lg">
          <div className="text-center">
            <div className="text-xl font-bold">{score}</div>
            <div className="text-xs opacity-90">/10</div>
          </div>
        </div>
      </div>
    </div>
  );
}