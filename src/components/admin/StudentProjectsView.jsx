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
    <div className="min-h-screen bg-[#F8FAFC] font-[DM_Sans]">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-white border-b border-[#E2E8F0] shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white border border-[#E2E8F0] p-2 rounded-lg hover:bg-[#F8FAFC] transition"
              >
                <ArrowLeft className="text-[#1B2B4B]" size={18} />
              </motion.div>
            </button>

            <div className="bg-[#EFF6FF] text-[#2563EB] rounded-xl p-3">
              <FolderGit2 size={22} />
            </div>

            <div>
              <h1 className="text-[20px] font-bold text-[#1B2B4B]">
                {student?.name || "Loading..."}'s Projects
              </h1>
              <p className="text-[13px] text-[#64748B] flex items-center gap-2">
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
            className="inline-flex items-center gap-2 bg-white border border-[#E2E8F0] text-[#1B2B4B] px-4 py-2 rounded-lg hover:bg-[#F8FAFC] text-sm font-medium"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </motion.button>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {student && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-[1.5px] border-[#E2E8F0] rounded-xl shadow-sm p-6 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-[#EFF6FF] text-[#2563EB] rounded-xl p-4">
                  <Users size={28} />
                </div>
                <div>
                  <h2 className="text-[20px] font-bold text-[#1B2B4B]">
                    {student.name}
                  </h2>
                  <p className="text-[13px] text-[#64748B] flex items-center gap-2 mt-1">
                    <Mail size={14} />
                    {student.email}
                  </p>
                </div>
              </div>

              <div className="bg-[#F8FAFC] border border-[#E2E8F0] px-4 py-2 rounded-lg text-center">
                <div className="text-[28px] font-extrabold text-[#1B2B4B]">
                  {projects.length}
                </div>
                <div className="text-[11px] uppercase text-[#64748B] font-semibold tracking-wide">
                  Total Projects
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-[1.5px] border-[#E2E8F0] rounded-xl shadow-sm p-6"
        >
          <h2 className="text-[14px] font-semibold uppercase tracking-wide text-[#64748B] mb-6 flex items-center gap-2">
            <FolderGit2 size={16} />
            All Projects
          </h2>

          {loading ? (
            <div className="text-center py-12 text-[#64748B]">
              <RefreshCw
                className="animate-spin mx-auto"
                size={28}
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

  const status = project.overallStatus || "Pending";
  const isApproved = status === "Approved";

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
      className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm hover:shadow-lg transition-all"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className="bg-[#EFF6FF] text-[#2563EB] p-2 rounded-lg">
            <FolderGit2 size={16} />
          </div>

          <div>
            <h3 className="font-semibold text-[#1B2B4B] text-[14px]">
              {project.title || "Untitled Project"}
            </h3>
            <p className="text-[12px] mt-1">
              <span
                className={`px-3 py-[3px] rounded-full font-semibold ${
                  isApproved
                    ? "bg-[#ECFDF5] text-[#065F46]"
                    : "bg-[#EFF6FF] text-[#1E40AF]"
                }`}
              >
                {status}
              </span>
            </p>
          </div>
        </div>

        {open ? (
          <ChevronUp size={18} className="text-[#64748B]" />
        ) : (
          <ChevronDown size={18} className="text-[#64748B]" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-5 border-t border-[#F1F5F9] space-y-4"
          >
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B] mb-1">
                Description
              </h4>
              <p className="text-[13px] text-[#1B2B4B]">
                {project.description}
              </p>
            </div>

            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B] mb-2">
                Modules
              </h4>
              <div className="space-y-2">
                {project.modules.map((mod) => (
                  <div
                    key={mod._id}
                    className="flex justify-between items-center bg-white border border-[#F1F5F9] p-3 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-[#1B2B4B] text-[13px]">
                        {mod.name}
                      </p>
                      {mod.notes && (
                        <p className="text-[12px] text-[#64748B] mt-0.5">
                          {mod.notes}
                        </p>
                      )}
                    </div>

                    <span className="px-3 py-[3px] text-[12px] rounded-full font-semibold bg-[#EFF6FF] text-[#1E40AF]">
                      {mod.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {project.skills.length > 0 && (
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B] mb-2">
                  Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((s) => (
                    <div
                      key={s._id}
                      className="px-3 py-1 bg-[#EFF6FF] text-[#2563EB] rounded-full text-[12px] font-medium"
                    >
                      {s.name} — {s.level}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {project.outcomes.length > 0 && (
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B] mb-2">
                  Outcomes
                </h4>
                <ul className="list-disc ml-6 text-[13px] text-[#1B2B4B] space-y-1">
                  {project.outcomes.map((o) => (
                    <li key={o._id}>
                      <span className="font-medium">{o.title}:</span>{" "}
                      {o.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-[13px] text-[#64748B] flex justify-between">
              <span>
                Created By:{" "}
                <strong className="text-[#1B2B4B]">
                  {project.createdBy?.name || "Unknown"}
                </strong>
              </span>
              <span>
                Batch:{" "}
                <strong className="text-[#1B2B4B]">
                  {project.batch?.batch_name} #{project.batch?.batch_no}
                </strong>
              </span>
            </div>

            <div className="text-[12px] text-[#94A3B8] flex items-center gap-2">
              <Calendar size={12} />
              {new Date(project.createdAt).toLocaleDateString()}
            </div>

            {canApprove && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onApprove(project._id)}
                className="mt-3 inline-flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-[13px] font-medium"
              >
                <CheckCircle2 size={14} />
                Approve Project
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}