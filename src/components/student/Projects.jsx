// src/components/student/Projects.jsx
import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  Target,
  Award,
  GitBranch,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Layers,
  RefreshCw,
  FileText,
  Calendar,
  User,
} from "lucide-react";

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState(new Set());

  // Fetch projects
  useEffect(() => {
    if (!user?.id) return;
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/projects/student/${user.id}`);
      setProjects(res.data?.projects || res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  // Toggle project expansion
  const toggleExpanded = (projectId) => {
    setExpandedProjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) newSet.delete(projectId);
      else newSet.add(projectId);
      return newSet;
    });
  };

  // ----------------------
  // Module toggle: optimistic update for better UX
  // ----------------------
  const handleModuleToggle = async (project, moduleId, currentStatus) => {
    if (["Submitted", "Approved"].includes(project.overallStatus)) {
      toast.error("Cannot modify modules after submission/approval");
      return;
    }

    const statusFlow = ["Pending", "In Progress", "Completed"];
    const currentIndex = statusFlow.indexOf(currentStatus);
    const nextStatus = statusFlow[(currentIndex + 1) % statusFlow.length];

    // Optimistic update: update only the specific module in state
    setProjects((prev) =>
      prev.map((p) => {
        if (p._id !== project._id) return p;
        return {
          ...p,
          modules: p.modules.map((m) =>
            m._id === moduleId ? { ...m, status: nextStatus } : m
          ),
        };
      })
    );

    try {
      await API.patch(`/projects/module/${moduleId}`, { status: nextStatus });
      toast.success(`Module updated to ${nextStatus}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update module");

      // Revert on error: fetch the single project from server or re-fetch all
      // To avoid full fetch we attempt to revert locally by re-requesting that project
      try {
        const res = await API.get(`/projects/${project._id}`);
        const freshProject = res.data || res.data?.project || res.data;
        setProjects((prev) =>
          prev.map((p) => (p._id === project._id ? freshProject : p))
        );
      } catch (fetchErr) {
        // fallback: re-fetch all
        fetchProjects();
      }
    }
  };

  // ----------------------
  // Submit project (student)
  // ----------------------
  const handleSubmit = async (project) => {
    if (["Submitted", "Approved"].includes(project.overallStatus)) {
      toast.error("Project already submitted");
      return;
    }

    const allCompleted = project.modules?.every(
      (m) => m.status === "Completed"
    );
    if (!allCompleted) {
      toast.error("Complete all modules before submitting");
      return;
    }

    // Additionally require overallStatus === 'Completed' to be allowed to submit
    if (project.overallStatus !== "Completed") {
      toast.error("Set overall status to Completed before submitting");
      return;
    }

    try {
      const res = await API.patch(`/projects/${project._id}/submit`);
      toast.success("Project submitted for approval! 🎉");

      // update local project status to Submitted
      setProjects((prev) =>
        prev.map((p) =>
          p._id === project._id
            ? { ...p, overallStatus: "Submitted", ...res.data?.project }
            : p
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit project");
    }
  };

  // ----------------------
  // Update overall project status (student)
  // - Students can set overall status (but Completed only when all modules done)
  // ----------------------
  const handleSetOverallStatus = async (project, newStatus) => {
    // Guard: Completed only when modules all completed
    const allModulesCompleted = project.modules?.every(
      (m) => m.status === "Completed"
    );
    if (newStatus === "Completed" && !allModulesCompleted) {
      toast.error(
        "All modules must be completed before setting overall status to Completed"
      );
      return;
    }

    // Optimistic update local project
    const prevProject = projects.find((p) => p._id === project._id);
    setProjects((prev) =>
      prev.map((p) =>
        p._id === project._id ? { ...p, overallStatus: newStatus } : p
      )
    );

    try {
      const res = await API.patch(`/projects/${project._id}/status`, {
        status: newStatus,
      });
      toast.success("Overall status updated");
      // Update with response project if provided
      if (res.data?.project) {
        setProjects((prev) =>
          prev.map((p) => (p._id === project._id ? res.data.project : p))
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update overall status");
      // revert
      setProjects((prev) =>
        prev.map((p) => (p._id === project._id ? prevProject : p))
      );
    }
  };

  // Calculate progress
  const calculateProgress = (modules) => {
    if (!modules || modules.length === 0) return 0;
    const completed = modules.filter((m) => m.status === "Completed").length;
    return Math.round((completed / modules.length) * 100);
  };

  // Statistics
  const stats = {
    total: projects.length,
    inProgress: projects.filter((p) => p.overallStatus === "In Progress")
      .length,
    completed: projects.filter((p) => p.overallStatus === "Completed").length,
    submitted: projects.filter((p) => p.overallStatus === "Submitted").length,
    approved: projects.filter((p) => p.overallStatus === "Approved").length,
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
              <h1 className="text-2xl font-bold text-gray-900 mb-1">My Projects</h1>
              <p className="text-gray-600 text-sm">
                Track your progress and submit completed work
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchProjects}
              disabled={loading}
              className="bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-400 px-4 py-2 rounded-lg transition flex items-center gap-2 cursor-pointer text-gray-700"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              <span className="text-sm font-medium">Refresh</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard
            icon={<Layers size={20} />}
            label="Total"
            value={stats.total}
          />
          <StatCard
            icon={<Clock size={20} />}
            label="In Progress"
            value={stats.inProgress}
          />
          <StatCard
            icon={<CheckCircle2 size={20} />}
            label="Completed"
            value={stats.completed}
          />
          <StatCard
            icon={<Send size={20} />}
            label="Submitted"
            value={stats.submitted}
          />
          <StatCard
            icon={<Award size={20} />}
            label="Approved"
            value={stats.approved}
          />
        </div>

        {/* Projects List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="animate-spin text-emerald-600" size={40} />
          </div>
        ) : projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200"
          >
            <Layers size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Projects Yet
            </h3>
            <p className="text-gray-600 text-sm">
              Projects assigned to you will appear here
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {projects.map((project, index) => (
              <ProjectCard
                key={project._id}
                project={project}
                index={index}
                expanded={expandedProjects.has(project._id)}
                onToggleExpand={() => toggleExpanded(project._id)}
                onModuleToggle={handleModuleToggle}
                onSubmit={handleSubmit}
                onSetOverallStatus={handleSetOverallStatus}
                calculateProgress={calculateProgress}
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
          <div className="text-emerald-600">{icon}</div>
        </div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </div>
      <div className="text-sm font-medium text-gray-700">{label}</div>
    </motion.div>
  );
}

// Project Card Component
function ProjectCard({
  project,
  index,
  expanded,
  onToggleExpand,
  onModuleToggle,
  onSubmit,
  onSetOverallStatus,
  calculateProgress,
}) {
  const progress = calculateProgress(project.modules);
  const isLocked = ["Submitted", "Approved"].includes(project.overallStatus);

  // Student can Submit only when:
  // - all modules completed
  // - overallStatus is "Completed"
  const allModulesCompleted = project.modules?.every(
    (m) => m.status === "Completed"
  );
  const canSubmit =
    allModulesCompleted &&
    project.overallStatus === "Completed" &&
    !["Submitted", "Approved"].includes(project.overallStatus);

  const getStatusConfig = (status) => {
    const configs = {
      Pending: {
        icon: <Clock size={16} />,
        color: "bg-gray-100 text-gray-700 border-gray-200",
      },
      "In Progress": {
        icon: <TrendingUp size={16} />,
        color: "bg-blue-50 text-blue-700 border-blue-200",
      },
      Completed: {
        icon: <CheckCircle2 size={16} />,
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      },
      Submitted: {
        icon: <Send size={16} />,
        color: "bg-purple-50 text-purple-700 border-purple-200",
      },
      Approved: {
        icon: <Award size={16} />,
        color: "bg-green-50 text-green-700 border-green-200",
      },
    };
    return configs[status] || configs.Pending;
  };

  const statusConfig = getStatusConfig(project.overallStatus);

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
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                <Layers size={20} className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                {project.title}
              </h3>
            </div>
            <p className="text-gray-600 text-sm">{project.description}</p>
          </div>

          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-semibold text-sm ${statusConfig.color}`}
          >
            {statusConfig.icon}
            {project.overallStatus}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Overall Progress
            </span>
            <span className="text-sm font-bold text-emerald-600">
              {progress}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-emerald-500 rounded-full"
            />
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <InfoBadge
            icon={<Layers size={14} />}
            label="Batch"
            value={project.batch?.batch_name || "-"}
          />
          <InfoBadge
            icon={<Target size={14} />}
            label="Batch No"
            value={`#${project.batch?.batch_no || "-"}`}
          />
          <InfoBadge
            icon={<User size={14} />}
            label="Assigned By"
            value={project.createdBy?.name || "-"}
          />
          <InfoBadge
            icon={<Calendar size={14} />}
            label="Created"
            value={
              project.createdAt
                ? new Date(project.createdAt).toLocaleDateString()
                : "-"
            }
          />
          <InfoBadge
            icon={<Clock size={14} />}
            label="Due Date"
            value={
              project.dueDate
                ? new Date(project.dueDate).toLocaleDateString()
                : "-"
            }
          />
        </div>

        {/* Repository */}
        {project.repo && (
          <a
            href={project.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
          >
            <GitBranch size={16} />
            View Repository
            <ExternalLink size={14} />
          </a>
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
              {/* Modules */}
              {project.modules && project.modules.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Layers size={18} className="text-emerald-600" />
                    Modules ({project.modules.length})
                  </h4>
                  <div className="space-y-2">
                    {project.modules.map((module) => (
                      <ModuleCard
                        key={module._id}
                        module={module}
                        isLocked={isLocked}
                        onToggle={() =>
                          onModuleToggle(project, module._id, module.status)
                        }
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Learning Outcomes */}
              {project.outcomes && project.outcomes.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Target size={18} className="text-emerald-600" />
                    Learning Outcomes
                  </h4>
                  <div className="space-y-2">
                    {project.outcomes.map((outcome, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-lg p-4 border border-gray-200"
                      >
                        <h5 className="font-semibold text-gray-900 mb-1 text-sm">
                          {outcome.title}
                        </h5>
                        {outcome.description && (
                          <p className="text-sm text-gray-600">
                            {outcome.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {project.skills && project.skills.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Award size={18} className="text-emerald-600" />
                    Required Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.skills.map((skill, idx) => (
                      <div
                        key={idx}
                        className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-lg"
                      >
                        <div className="font-semibold text-emerald-700 text-sm">
                          {skill.name}
                        </div>
                        <div className="text-xs text-emerald-600">
                          {skill.level}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onToggleExpand}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium cursor-pointer"
        >
          {expanded ? (
            <>
              <ChevronUp size={18} />
              <span className="text-sm">Show Less</span>
            </>
          ) : (
            <>
              <ChevronDown size={18} />
              <span className="text-sm">Show Details</span>
            </>
          )}
        </motion.button>

        <div className="flex items-center gap-3">
          {/* Overall status quick control for student */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg">
            <label className="text-xs text-gray-600 font-medium">Status</label>
            <select
              value={project.overallStatus}
              onChange={(e) => onSetOverallStatus(project, e.target.value)}
              disabled={["Submitted", "Approved"].includes(
                project.overallStatus
              )}
              className="text-sm px-2 py-1 rounded-md outline-none border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed" disabled={!allModulesCompleted}>
                Completed
              </option>
              <option value="Submitted" disabled>
                Submitted
              </option>
              <option value="Approved" disabled>
                Approved
              </option>
            </select>
          </div>

          {/* Submit button -> only when overallStatus is Completed & all modules completed */}
          {canSubmit && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSubmit(project)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold shadow-sm cursor-pointer"
            >
              <Send size={18} />
              Submit Project
            </motion.button>
          )}

          {isLocked && (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <AlertCircle size={16} />
              {project.overallStatus === "Submitted"
                ? "Awaiting approval"
                : "Project approved"}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Module Card Component
function ModuleCard({ module, isLocked, onToggle }) {
  const getModuleConfig = (status) => {
    const configs = {
      Pending: {
        color: "bg-gray-50 border-gray-200 text-gray-700",
        buttonColor: "bg-gray-100 hover:bg-gray-200 text-gray-700",
      },
      "In Progress": {
        color: "bg-blue-50 border-blue-200 text-blue-700",
        buttonColor: "bg-blue-100 hover:bg-blue-200 text-blue-700",
      },
      Completed: {
        color: "bg-emerald-50 border-emerald-200 text-emerald-700",
        buttonColor: "bg-emerald-100 hover:bg-emerald-200 text-emerald-700",
      },
    };
    return configs[status] || configs.Pending;
  };

  const config = getModuleConfig(module.status);

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-lg border ${config.color}`}
    >
      <div className="flex-1">
        <h5 className="font-semibold text-sm">{module.name}</h5>
        {module.notes && (
          <p className="text-xs mt-1 opacity-75">{module.notes}</p>
        )}
      </div>
      <motion.button
        whileHover={{ scale: isLocked ? 1 : 1.02 }}
        whileTap={{ scale: isLocked ? 1 : 0.98 }}
        onClick={onToggle}
        disabled={isLocked}
        className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
          config.buttonColor
        } ${isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        {module.status}
      </motion.button>
    </div>
  );
}

// Info Badge Component
function InfoBadge({ icon, label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
      <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <div className="text-sm font-semibold text-gray-900 truncate">
        {value}
      </div>
    </div>
  );
}