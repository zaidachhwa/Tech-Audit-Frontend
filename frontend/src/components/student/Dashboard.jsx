import { useEffect, useState } from "react";
import { Layers, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { getReportsByStudent } from "../../api/report.api";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, inProgress: 0, completed: 0 });

  useEffect(() => {
    async function fetchReports() {
      const res = await getReportsByStudent(user.id);
      const reports = res?.reports || [];

      const completed = reports.filter((r) => r.status === "Completed").length;
      const inProgress = reports.filter(
        (r) => r.status === "In Progress"
      ).length;

      setStats({
        total: reports.length,
        completed,
        inProgress,
      });
    }
    fetchReports();
  }, [user]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h1 className="text-2xl font-semibold text-slate-800">
        Welcome back, {user?.name} 👋
      </h1>

      <div className="grid md:grid-cols-3 gap-4">
        <StatCard
          icon={<Layers className="text-emerald-600" />}
          label="Total Projects"
          value={stats.total}
        />
        <StatCard
          icon={<Clock className="text-amber-600" />}
          label="In Progress"
          value={stats.inProgress}
        />
        <StatCard
          icon={<CheckCircle2 className="text-green-600" />}
          label="Completed"
          value={stats.completed}
        />
      </div>
    </motion.div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-xl p-5 shadow-sm">
      <div className="mb-2">{icon}</div>
      <h2 className="text-lg font-semibold text-slate-700">{label}</h2>
      <p className="text-sm text-slate-500">{value}</p>
    </div>
  );
}
