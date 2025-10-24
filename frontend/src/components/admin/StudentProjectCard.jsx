import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Layers,
  Loader2,
  AlertCircle,
  CircleCheckBig,
} from "lucide-react";

export default function StudentProjectCard({ project, onApprove }) {
  // Calculate project completion percentage
  const totalModules = project.modules.length || 1;
  const completedModules = project.modules.filter(
    (m) => m.status === "Completed"
  ).length;
  const progress = Math.round((completedModules / totalModules) * 100);

  // Badge style map
  const badgeStyles = {
    Completed: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    "In Progress": "bg-amber-100 text-amber-700 border border-amber-200",
    Pending: "bg-slate-100 text-slate-600 border border-slate-200",
    Submitted: "bg-blue-100 text-blue-700 border border-blue-200",
    Approved: "bg-green-100 text-green-700 border border-green-200",
    Rejected: "bg-rose-100 text-rose-700 border border-rose-200",
  };

  // Status Icon map
  const statusIcon = {
    Completed: <CircleCheckBig size={14} className="text-emerald-600" />,
    "In Progress": (
      <Loader2 size={14} className="animate-spin text-amber-600" />
    ),
    Pending: <Clock size={14} className="text-slate-500" />,
    Submitted: <AlertCircle size={14} className="text-blue-600" />,
    Approved: <CheckCircle2 size={14} className="text-green-600" />,
    Rejected: <AlertCircle size={14} className="text-rose-600" />,
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="border border-slate-200 bg-white rounded-xl shadow-sm p-5 space-y-4 transition"
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-slate-800 font-semibold text-base">
            {project.title}
          </h3>
          <p className="text-sm text-slate-500">{project.description}</p>
          <p className="text-xs text-slate-400 mt-1">
            Assigned to: <b>{project.assignedTo?.name}</b>
          </p>
        </div>

        <div
          className={`text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1 ${
            badgeStyles[project.overallStatus] || "bg-slate-100"
          }`}
        >
          {statusIcon[project.overallStatus]}
          {project.overallStatus}
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              progress === 100
                ? "bg-emerald-500"
                : progress >= 50
                ? "bg-amber-400"
                : "bg-slate-400"
            }`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-emerald-700 flex items-center gap-2">
          <Layers size={14} /> Modules
        </h4>
        {project.modules.map((m, i) => (
          <div
            key={i}
            className={`flex justify-between items-center p-2 rounded-lg text-sm border ${
              badgeStyles[m.status]
            }`}
          >
            <span className="font-medium">{m.name}</span>
            <span className="flex items-center gap-1">
              {statusIcon[m.status]} {m.status}
            </span>
          </div>
        ))}
      </div>

      {/* Approve Button */}
      {project.overallStatus === "Submitted" && (
        <button
          onClick={() => onApprove(project._id)}
          className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <CheckCircle2 size={16} />
          Approve Project
        </button>
      )}
    </motion.div>
  );
}
