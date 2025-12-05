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
      // but your backend /projects/student/:studentId expects admin - you can call with id:
      // fallback: if the API returns count wrapper
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
  const dueSoon = projects.filter((p) => {
    // if you store a due date in project (e.g., p.dueDate). fallback false
    if (!p.dueDate) return false;
    const diff = (new Date(p.dueDate) - new Date()) / (1000 * 3600 * 24);
    return diff <= 7 && diff >= 0;
  }).length;

  const upcomingDeadlines = projects
    .filter((p) => p.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl shadow-xl p-8 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Hello, {me?.name || authUser?.name || "Student"}
              </h1>
              <p className="text-purple-100">
                Here's your project & report overview.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchAll}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              Refresh
            </motion.button>
          </div>
        </motion.div>

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

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 border border-white/30">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Upcoming Deadlines
            </h3>
            {upcomingDeadlines.length === 0 ? (
              <p className="text-gray-500">No upcoming deadlines.</p>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map((p) => (
                  <div
                    key={p._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50 to-purple-50 border border-purple-100"
                  >
                    <div>
                      <div className="font-semibold text-gray-800">
                        {p.title}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {p.description?.slice(0, 80) || ""}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {p.dueDate
                        ? new Date(p.dueDate).toLocaleDateString()
                        : "—"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity (reports/submissions) */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 border border-white/30">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Recent Activity
            </h3>
            {projects.slice(0, 6).map((p) => (
              <div
                key={p._id}
                className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition"
              >
                <div className="w-2 h-2 rounded-full mt-2 bg-purple-600" />
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{p.title}</div>
                  <div className="text-sm text-gray-500">
                    {p.overallStatus} •{" "}
                    {p.updatedAt ? new Date(p.updatedAt).toLocaleString() : ""}
                  </div>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <p className="text-gray-500">No activity yet.</p>
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
      whileHover={{ y: -4 }}
      className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/30"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded-xl text-white shadow-md">
          {icon}
        </div>
        <div className="text-3xl font-bold text-gray-800">{value}</div>
      </div>
      <div className="font-semibold text-gray-700">{label}</div>
    </motion.div>
  );
}