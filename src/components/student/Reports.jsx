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

  console.log(reports);

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
    if (avg >= 9)
      return { grade: "A+", color: "from-green-500 to-emerald-500" };
    if (avg >= 8) return { grade: "A", color: "from-green-500 to-teal-500" };
    if (avg >= 7) return { grade: "B+", color: "from-blue-500 to-cyan-500" };
    if (avg >= 6) return { grade: "B", color: "from-blue-500 to-indigo-500" };
    if (avg >= 5) return { grade: "C", color: "from-orange-500 to-amber-500" };
    return { grade: "D", color: "from-red-500 to-pink-500" };
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-6">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl shadow-xl p-8 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Performance Reports</h1>
              <p className="text-purple-100">
                Track your progress and view detailed feedback
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchReports}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              Refresh
            </motion.button>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={<FileText size={20} />}
            label="Total Reports"
            value={stats.total}
            color="bg-gradient-to-br from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={<TrendingUp size={20} />}
            label="Average Score"
            value={`${stats.avgScore}/10`}
            color="bg-gradient-to-br from-purple-500 to-pink-500"
          />
          <StatCard
            icon={<Star size={20} />}
            label="Highest Score"
            value={`${stats.highest}/10`}
            color="bg-gradient-to-br from-orange-500 to-amber-500"
          />
          <StatCard
            icon={<Award size={20} />}
            label="Current Grade"
            value={getGrade(stats.avgScore).grade}
            color={`bg-gradient-to-br ${getGrade(stats.avgScore).color}`}
          />
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="animate-spin text-purple-600" size={40} />
          </div>
        ) : reports.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-12 text-center"
          >
            <BarChart2 size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Reports Yet
            </h3>
            <p className="text-gray-500">
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
function StatCard({ icon, label, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={`${color} rounded-2xl shadow-lg p-6 text-white`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
          {icon}
        </div>
        <div className="text-3xl font-bold">{value}</div>
      </div>
      <div className="text-sm font-medium opacity-90">{label}</div>
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

  // Get score color
  const getScoreColor = (score) => {
    if (score >= 8) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 5) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`bg-gradient-to-r ${gradeInfo.color} p-3 rounded-xl shadow-md`}
              >
                <BarChart2 size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
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
          <div
            className={`bg-gradient-to-r ${gradeInfo.color} px-6 py-3 rounded-2xl shadow-lg`}
          >
            <div className="text-center text-white">
              <div className="text-xs font-medium opacity-90">Grade</div>
              <div className="text-3xl font-bold">{gradeInfo.grade}</div>
            </div>
          </div>
        </div>

        {/* Average Score */}
        <div className="flex items-center justify-between bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Target size={20} className="text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Average Score</div>
              <div className="text-2xl font-bold text-purple-600">
                {avgScore}/10
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Parameters Evaluated</div>
            <div className="text-xl font-bold text-gray-800">
              {report.parameters?.length || 0}
            </div>
          </div>
        </div>

        {/* Parameters Summary - Compact View */}
        {!expanded && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Award size={16} className="text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">
                Parameters Overview
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {report.parameters?.slice(0, 4).map((param, idx) => (
                <div
                  key={idx}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 ${getScoreColor(
                    param.score
                  )}`}
                >
                  {param.name}:{" "}
                  <span className="font-bold">{param.score}/10</span>
                </div>
              ))}
              {report.parameters?.length > 4 && (
                <div className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-600">
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
            <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-purple-50">
              {/* Detailed Parameters */}
              <div>
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Award size={18} className="text-purple-600" />
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
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <MessageSquare size={18} className="text-blue-600" />
                    Feedback Points
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(report.feedbackSchema[0]).map(
                      ([key, value], idx) => {
                        if (key !== "_id" && value) {
                          return (
                            <div
                              key={idx}
                              className="flex items-start gap-3 bg-white rounded-xl p-4 border border-blue-100"
                            >
                              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg flex items-center justify-center font-bold text-sm">
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
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <FileText size={18} className="text-green-600" />
                    Overall Remarks
                  </h4>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-100">
                    <p className="text-gray-700 leading-relaxed">
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
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition"
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
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onToggleExpand}
          className="w-full flex items-center justify-center gap-2 text-purple-600 hover:text-purple-700 font-medium cursor-pointer"
        >
          {expanded ? (
            <>
              <ChevronUp size={18} />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown size={18} />
              View Full Report
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

  const getScoreConfig = (score) => {
    if (score >= 8) {
      return {
        bg: "from-green-50 to-emerald-50",
        border: "border-green-200",
        text: "text-green-700",
        badge: "from-green-500 to-emerald-500",
      };
    }
    if (score >= 5) {
      return {
        bg: "from-amber-50 to-yellow-50",
        border: "border-amber-200",
        text: "text-amber-700",
        badge: "from-amber-500 to-orange-500",
      };
    }
    return {
      bg: "from-red-50 to-pink-50",
      border: "border-red-200",
      text: "text-red-700",
      badge: "from-red-500 to-pink-500",
    };
  };

  const config = getScoreConfig(score);

  return (
    <div
      className={`bg-gradient-to-br ${config.bg} rounded-xl p-4 border-2 ${config.border}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h5 className={`font-semibold ${config.text} mb-1`}>
            {parameter.name}
          </h5>
          <div className="w-full h-2 bg-white/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score * 10}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className={`h-full bg-gradient-to-r ${config.badge} rounded-full`}
            />
          </div>
        </div>
        <div
          className={`ml-4 bg-gradient-to-r ${config.badge} text-white px-4 py-2 rounded-xl shadow-md`}
        >
          <div className="text-center">
            <div className="text-2xl font-bold">{score}</div>
            <div className="text-xs opacity-90">/10</div>
          </div>
        </div>
      </div>
    </div>
  );
}