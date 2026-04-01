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
      className="rounded-lg p-6"
      style={{
        backgroundColor: "#FFFFFF",
        border: "1.5px solid #E2E8F0",
        borderRadius: "12px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-2 transition"
            style={{
              color: "#2563EB",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#1E40AF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#2563EB";
            }}
          >
            <ArrowLeft size={18} />
            Back to Batches
          </button>

          <div className="ml-3">
            <h2 className="font-bold" style={{ color: "#1B2B4B", fontSize: "20px", fontWeight: "700" }}>
              {batch.batch_name}{" "}
              <span style={{ color: "#94A3B8" }}>#{batch.batch_no}</span>
            </h2>
            <p className="text-sm" style={{ color: "#94A3B8" }}>
              Students & assigned projects
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBatchProjects}
            title="Refresh projects"
            className="inline-flex items-center gap-2 p-2 rounded-lg transition"
            style={{
              color: "#2563EB",
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#EFF6FF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <RefreshCcw size={20} />
          </button>

          <button
            onClick={() => setShowAssignModal(true)}
            className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-lg font-medium transition"
            style={{
              backgroundColor: "#2563EB",
              borderRadius: "8px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#1E40AF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#2563EB";
            }}
          >
            <PlusCircle size={16} /> Assign Project
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center" style={{ color: "#94A3B8" }}>
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
                  className="rounded-lg p-4"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid #E2E8F0",
                    borderRadius: "12px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium" style={{ color: "#1B2B4B" }}>
                        {s.name}
                      </div>
                      <div className="text-sm" style={{ color: "#94A3B8" }}>
                        {s.email}
                      </div>
                      <div className="text-xs mt-1">
                        {s.isActive ? (
                          <span
                            className="px-2 py-0.5 rounded-full font-medium inline-block"
                            style={{
                              backgroundColor: "#ECFDF5",
                              color: "#065F46",
                              borderRadius: "20px",
                              padding: "3px 12px",
                              fontSize: "12px",
                              fontWeight: "600",
                            }}
                          >
                            Active
                          </span>
                        ) : (
                          <span
                            className="px-2 py-0.5 rounded-full font-medium inline-block"
                            style={{
                              backgroundColor: "#EFF6FF",
                              color: "#1E40AF",
                              borderRadius: "20px",
                              padding: "3px 12px",
                              fontSize: "12px",
                              fontWeight: "600",
                            }}
                          >
                            Pending
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleStudent(s._id)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition"
                        style={{
                          backgroundColor: "#EFF6FF",
                          color: "#2563EB",
                          border: "1px solid #BFDBFE",
                          borderRadius: "8px",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#DBEAFE";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#EFF6FF";
                        }}
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
                        className="inline-flex items-center gap-2 font-medium transition"
                        style={{
                          color: "#2563EB",
                          textDecoration: "none",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.textDecoration = "underline";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.textDecoration = "none";
                        }}
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
                        <div
                          className="col-span-full text-center py-4 rounded-lg"
                          style={{
                            backgroundColor: "#F8FAFC",
                            color: "#94A3B8",
                            borderRadius: "8px",
                          }}
                        >
                          No projects assigned to this student.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center" style={{ color: "#94A3B8" }}>
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