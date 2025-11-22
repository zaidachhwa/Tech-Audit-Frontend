// src/components/admin/BatchProjects.jsx
import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  PlusCircle,
  RefreshCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import StudentProjectCard from "./StudentProjectCard";
import AssignProjectModal from "./AssignProjectModal";
import { Link } from "react-router-dom";

/**
 * BatchProjects
 * - Shows batch header
 * - Accordion list of students
 * - Each student's row includes up to 3 project cards (preview), and "View all" link
 *
 * Props:
 * - batch: batch object (required)
 * - onClose: function to go back to batch list
 */
export default function BatchProjects({ batch, onClose }) {
  const [projects, setProjects] = useState([]); // all projects for this batch
  const [loading, setLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // mapping studentId -> boolean open/closed for accordion
  const [studentOpen, setStudentOpen] = useState({});

  const fetchBatchProjects = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/projects/batch/${batch._id}`);
      // backend returns { count, projects } or just array — normalize:
      const list = Array.isArray(data) ? data : data.projects || data;
      setProjects(list);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch batch projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (batch?._id) fetchBatchProjects();
    // reset accordion on batch change
    setStudentOpen({});
  }, [batch]);

  const handleToggleStudent = (studentId) => {
    setStudentOpen((p) => ({ ...p, [studentId]: !p[studentId] }));
  };

  const handleApproveProject = async (projectId) => {
    try {
      await API.patch(`/projects/${projectId}/approve`);
      toast.success("Project approved");
      fetchBatchProjects();
    } catch (err) {
      console.error(err);
      toast.error("Approval failed");
    }
  };

  // helper: return projects assigned to a student
  const projectsForStudent = (studentId) =>
    projects.filter((p) => (p.assignedTo?._id || p.assignedTo) === studentId);

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white/90 to-slate-50 rounded-3xl p-6 shadow-2xl"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-emerald-700 hover:text-emerald-800 transition"
          >
            <ArrowLeft size={18} />
            Back to Batches
          </button>

          <div className="ml-3">
            <h2 className="text-xl font-semibold text-slate-800">
              {batch.batch_name}{" "}
              <span className="text-slate-400">#{batch.batch_no}</span>
            </h2>
            <p className="text-sm text-slate-500">
              Students & assigned projects
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBatchProjects}
            title="Refresh projects"
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
          >
            <RefreshCcw />
          </button>

          <button
            onClick={() => setShowAssignModal(true)}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-2xl shadow"
          >
            <PlusCircle size={16} /> Assign Project
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-slate-500">
          Loading projects...
        </div>
      ) : (
        <div className="space-y-4">
          {/* Map students (batch.students expected) */}
          {Array.isArray(batch.students) && batch.students.length ? (
            batch.students.map((s) => {
              const sProjects = projectsForStudent(s._id);
              const open = !!studentOpen[s._id];
              return (
                <div
                  key={s._id}
                  className="bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-md"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-slate-800">{s.name}</div>
                      <div className="text-sm text-slate-500">{s.email}</div>
                      <div className="text-xs text-slate-400 mt-1">
                        {s.isActive ? (
                          <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            Approved
                          </span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleStudent(s._id)}
                        className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-2 rounded-xl hover:bg-emerald-200 transition"
                      >
                        {open ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                        {open ? "Hide" : "View"}
                      </button>

                      <Link
                        to={`/admin/project-tracking/student/${s._id}`}
                        state={{ batchId: batch._id }}
                        className="inline-flex items-center gap-2 text-purple-700 hover:underline"
                        title="View all projects for this student"
                      >
                        View all
                      </Link>
                    </div>
                  </div>

                  {/* expanded area */}
                  {open && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                      {sProjects.length ? (
                        // show up to 3 preview cards (modern)
                        sProjects
                          .slice(0, 3)
                          .map((p) => (
                            <StudentProjectCard
                              key={p._id}
                              project={p}
                              compact={false}
                              onApprove={() => handleApproveProject(p._id)}
                            />
                          ))
                      ) : (
                        <div className="col-span-full text-center text-slate-500 py-4 rounded-xl bg-white/40">
                          No projects assigned to this student.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-slate-500">
              No students in this batch.
            </div>
          )}
        </div>
      )}

      {showAssignModal && (
        <AssignProjectModal
          batch={batch}
          onClose={() => setShowAssignModal(false)}
          onAssigned={() => {
            setShowAssignModal(false);
            fetchBatchProjects();
          }}
        />
      )}
    </motion.section>
  );
}
