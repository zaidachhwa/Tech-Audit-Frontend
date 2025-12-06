// src/components/student/StudentDashboard.jsx
import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import { getMe } from "../../api/student.api";
import toast from "react-hot-toast";
import { RefreshCw, Layers, CheckCircle2, Clock, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

export default function StudentDashboard() {
  const { user: authUser } = useAuth();
  const [me, setMe] = useState(null);
  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const meRes = await API.get("/students/me");
      setMe(meRes.data.student || meRes.data);

      // Projects for student
      const projectRes = await API.get(
        `/projects/student/${
          meRes.data.student?.id ||
          meRes.data?.student?._id ||
          meRes.data?.studentId ||
          meRes.data?.id
        }`
      );
      const projectsList = projectRes.data?.projects || projectRes.data || [];
      setProjects(projectsList);

      // Reports
      const reportsRes = await API.get(
        `/reports/student/${
          meRes.data.student?.id || meRes.data?.student?._id || meRes.data?.id
        }`
      );
      const reportsList = reportsRes.data?.reports || reportsRes.data || [];
      setReports(reportsList);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = projects.length;
  const inProgress = projects.filter(
    (p) => p.overallStatus === "In Progress"
  ).length;
  const completed = projects.filter(
    (p) => p.overallStatus === "Completed" || p.overallStatus === "Approved"
  ).length;

  const upcomingDeadlines = projects
    .filter((p) => p.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Hello, {me?.name || authUser?.name || "Student"}
              </h1>
              <p className="text-gray-600 text-sm">
                Here's your project & report overview
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchAll}
              disabled={loading}
              className="bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-400 px-4 py-2 rounded-lg transition flex items-center gap-2 cursor-pointer text-gray-700"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              <span className="text-sm font-medium">Refresh</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Layers size={20} />}
            label="Total Projects"
            value={total}
          />
          <StatCard
            icon={<Clock size={20} />}
            label="In Progress"
            value={inProgress}
          />
          <StatCard
            icon={<CheckCircle2 size={20} />}
            label="Completed"
            value={completed}
          />
          <StatCard
            icon={<Calendar size={20} />}
            label="Reports"
            value={reports.length}
          />
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Upcoming Deadlines
            </h3>
            {upcomingDeadlines.length === 0 ? (
              <p className="text-gray-500 text-sm">No upcoming deadlines.</p>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map((p) => (
                  <div
                    key={p._id}
                    className="flex items-start justify-between p-3 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-sm">
                        {p.title}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {p.description?.slice(0, 80) || ""}
                      </div>
                    </div>
                    <div className="text-xs font-medium text-gray-700 ml-4 whitespace-nowrap">
                      {p.dueDate
                        ? new Date(p.dueDate).toLocaleDateString()
                        : "—"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Recent Activity
            </h3>
            {projects.length === 0 ? (
              <p className="text-gray-500 text-sm">No activity yet.</p>
            ) : (
              <div className="space-y-2">
                {projects.slice(0, 6).map((p) => (
                  <div
                    key={p._id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 bg-emerald-500" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{p.title}</div>
                      <div className="text-xs text-gray-600">
                        {p.overallStatus} •{" "}
                        {p.updatedAt ? new Date(p.updatedAt).toLocaleString() : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-lg shadow-sm p-5 border border-gray-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
          <div className="text-emerald-600">
            {icon}
          </div>
        </div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </div>
      <div className="font-medium text-gray-700 text-sm">{label}</div>
    </motion.div>
  );
}