// StudentProjectsView.jsx - All Projects for a Student
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  ArrowLeft,
  FolderGit2,
  Mail,
  Users,
  GitBranch,
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function StudentProjectsView() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStudentProjects = async () => {
    try {
      setLoading(true);

      const [studentRes, projectsRes] = await Promise.all([
        API.get(`/students/${studentId}`),
        API.get(`/projects/student/${studentId}`),
      ]);

      setStudent(studentRes.data?.student || null);
      setProjects(projectsRes.data?.projects || []);
      toast.success("Projects loaded");
    } catch (err) {
      toast.error("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProject = async (projectId) => {
    try {
      await API.patch(`/projects/${projectId}/approve`);
      toast.success("Project approved");
      fetchStudentProjects();
    } catch (err) {
      toast.error("Approval failed");
    }
  };

  useEffect(() => {
    fetchStudentProjects();
  }, [studentId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-white/30 shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/70 p-2 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer"
              >
                <ArrowLeft className="text-purple-600" size={20} />
              </motion.div>
            </button>

            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl p-3 shadow-md">
              <FolderGit2 size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {student?.name || "Loading..."}'s Projects
              </h1>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Mail size={14} />
                {student?.email || "-"}
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchStudentProjects}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-xl shadow-lg"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </motion.button>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {student && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-3xl shadow-xl p-6 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 rounded-2xl p-4">
                  <Users size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{student.name}</h2>
                  <p className="text-purple-100 flex items-center gap-2 mt-1">
                    <Mail size={14} />
                    {student.email}
                  </p>
                </div>
              </div>

              <div className="bg-white/20 px-4 py-2 rounded-xl">
                <div className="text-3xl font-bold">{projects.length}</div>
                <div className="text-sm text-purple-100">Total Projects</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl p-6"
        >
          <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <FolderGit2 size={20} className="text-purple-600" />
            All Projects
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <RefreshCw
                className="animate-spin mx-auto text-purple-600"
                size={32}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project, index) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  index={index}
                  onApprove={handleApproveProject}
                />
              ))}
            </div>
          )}
        </motion.section>
      </main>
    </div>
  );
}

/* ------------------------------
   COLLAPSIBLE PROJECT CARD
------------------------------- */
function ProjectCard({ project, index, onApprove }) {
  const [open, setOpen] = useState(false);

  // Correct status
  const status = project.overallStatus || "Pending";
  const isApproved = status === "Approved";

  // Modules must ALL be completed to enable approve
  const allModulesCompleted =
    Array.isArray(project.modules) &&
    project.modules.length > 0 &&
    project.modules.every((m) => m.status === "Completed");

  const canApprove = allModulesCompleted && !isApproved;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-purple-200 overflow-hidden"
    >
      {/* Header (Collapsible trigger) */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-2 rounded-lg shadow">
            <FolderGit2 size={18} />
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">
              {project.title || "Untitled Project"}
            </h3>
            <p className="text-xs text-gray-500">
              Status:{" "}
              <span
                className={
                  isApproved
                    ? "text-green-600 font-medium"
                    : "text-yellow-600 font-medium"
                }
              >
                {status}
              </span>
            </p>
          </div>
        </div>

        {open ? (
          <ChevronUp size={20} className="text-purple-600" />
        ) : (
          <ChevronDown size={20} className="text-purple-600" />
        )}
      </button>

      {/* Collapsible Body */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-5 border-t border-purple-100 space-y-4"
          >
            {/* Description */}
            <div>
              <h4 className="font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FileText size={14} className="text-purple-600" />
                Description
              </h4>
              <p className="text-sm text-gray-600">{project.description}</p>
            </div>

            {/* Modules */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Modules</h4>
              <div className="space-y-2">
                {project.modules.map((mod) => (
                  <div
                    key={mod._id}
                    className="flex justify-between items-center bg-white p-3 rounded-xl shadow hover:shadow-md transition border border-purple-100"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{mod.name}</p>
                      {mod.notes && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Notes: {mod.notes}
                        </p>
                      )}
                    </div>

                    <span
                      className={`px-3 py-1 text-xs rounded-full font-semibold ${
                        mod.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : mod.status === "In Progress"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {mod.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            {project.skills.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((s) => (
                    <div
                      key={s._id}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                    >
                      {s.name} — {s.level}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Outcomes */}
            {project.outcomes.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Outcomes</h4>
                <ul className="list-disc ml-6 text-sm text-gray-600 space-y-1">
                  {project.outcomes.map((o) => (
                    <li key={o._id}>
                      <span className="font-medium">{o.title}:</span>{" "}
                      {o.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Created By */}
            <div className="text-sm text-gray-600 flex justify-between mb-2">
              <span>
                Created By:{" "}
                <strong>{project.createdBy?.name || "Unknown"}</strong>
              </span>
              <span>
                Batch:{" "}
                <strong>
                  {project.batch?.batch_name} #{project.batch?.batch_no}
                </strong>
              </span>
            </div>

            {/* Date */}
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <Calendar size={12} />
              {new Date(project.createdAt).toLocaleDateString()}
            </div>

            {/* Approve Button — only if allowed */}
            {canApprove && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onApprove(project._id)}
                className="mt-3 inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl shadow"
              >
                <CheckCircle2 size={16} />
                Approve Project
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
