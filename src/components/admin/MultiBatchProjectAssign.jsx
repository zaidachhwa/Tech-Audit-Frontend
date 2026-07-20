import { useState, useEffect } from "react";
import { API } from "../../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  X,
  FolderGit2,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  RefreshCw,
  AlertCircle,
  Layers,
  Users,
  Upload,
  Download,
  FileText,
  Target,
  Award,
} from "lucide-react";

export default function MultiBatchProjectAssign({ onClose, onAssigned }) {
  const [batches, setBatches] = useState([]);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [projects, setProjects] = useState([
    {
      title: "",
      description: "",
      repo: "",
      modules: [{ name: "", status: "Pending", notes: "" }],
      outcomes: [{ title: "", description: "" }],
      skills: [{ name: "", level: "Intermediate" }],
      overallStatus: "Pending",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [fetchingBatches, setFetchingBatches] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setFetchingBatches(true);
      const { data } = await API.get("/batches");
      setBatches(data.batches || []);
      setSelectedBatches((data.batches || []).map((b) => b._id)); // Select all by default
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch batches");
    } finally {
      setFetchingBatches(false);
    }
  };

  const toggleBatch = (id) => {
    setSelectedBatches((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAllBatches = () => {
    setSelectedBatches((prev) =>
      prev.length === batches.length ? [] : batches.map((b) => b._id)
    );
  };

  // Project handlers
  const addProject = () => {
    setProjects([
      ...projects,
      {
        title: "",
        description: "",
        repo: "",
        modules: [{ name: "", status: "Pending", notes: "" }],
        outcomes: [{ title: "", description: "" }],
        skills: [{ name: "", level: "Intermediate" }],
        overallStatus: "Pending",
      },
    ]);
  };

  const removeProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const updateProject = (index, field, value) => {
    const updated = [...projects];
    updated[index][field] = value;
    setProjects(updated);
  };

  // Module handlers for specific project
  const addModule = (projectIndex) => {
    const updated = [...projects];
    updated[projectIndex].modules.push({
      name: "",
      status: "Pending",
      notes: "",
    });
    setProjects(updated);
  };

  const removeModule = (projectIndex, moduleIndex) => {
    const updated = [...projects];
    updated[projectIndex].modules = updated[projectIndex].modules.filter(
      (_, i) => i !== moduleIndex
    );
    setProjects(updated);
  };

  const updateModule = (projectIndex, moduleIndex, field, value) => {
    const updated = [...projects];
    updated[projectIndex].modules[moduleIndex][field] = value;
    setProjects(updated);
  };

  // Similar handlers for outcomes and skills
  const addOutcome = (projectIndex) => {
    const updated = [...projects];
    updated[projectIndex].outcomes.push({ title: "", description: "" });
    setProjects(updated);
  };

  const removeOutcome = (projectIndex, outcomeIndex) => {
    const updated = [...projects];
    updated[projectIndex].outcomes = updated[projectIndex].outcomes.filter(
      (_, i) => i !== outcomeIndex
    );
    setProjects(updated);
  };

  const updateOutcome = (projectIndex, outcomeIndex, field, value) => {
    const updated = [...projects];
    updated[projectIndex].outcomes[outcomeIndex][field] = value;
    setProjects(updated);
  };

  const addSkill = (projectIndex) => {
    const updated = [...projects];
    updated[projectIndex].skills.push({ name: "", level: "Intermediate" });
    setProjects(updated);
  };

  const removeSkill = (projectIndex, skillIndex) => {
    const updated = [...projects];
    updated[projectIndex].skills = updated[projectIndex].skills.filter(
      (_, i) => i !== skillIndex
    );
    setProjects(updated);
  };

  const updateSkill = (projectIndex, skillIndex, field, value) => {
    const updated = [...projects];
    updated[projectIndex].skills[skillIndex][field] = value;
    setProjects(updated);
  };

  const handleSubmit = async () => {
    // Validation
    const validProjects = projects.filter(
      (p) => p.title.trim() && p.description.trim()
    );

    if (validProjects.length === 0) {
      toast.error("Please add at least one valid project");
      return;
    }

    if (selectedBatches.length === 0) {
      toast.error("Please select at least one batch");
      return;
    }

    try {
      setLoading(true);
      let totalAssignments = 0;

      // For each selected batch
      for (const batchId of selectedBatches) {
        const batch = batches.find((b) => b._id === batchId);
        if (!batch || !batch.students || batch.students.length === 0) continue;

        // For each project
        for (const project of validProjects) {
          const validModules = project.modules.filter((m) => m.name.trim());
          const validOutcomes = project.outcomes.filter((o) => o.title.trim());
          const validSkills = project.skills.filter((s) => s.name.trim());

          // Assign to each student in the batch
          const promises = batch.students.map((student) => {
            const sId = typeof student === "object" ? (student._id || student.id || student) : student;
            return API.post("/projects/create", {
              title: project.title,
              description: project.description || project.title,
              repo: project.repo || "",
              studentId: sId,
              batchId: batch._id,
              modules: validModules,
              outcomes: validOutcomes,
              skills: validSkills,
              overallStatus: project.overallStatus || "Pending",
              assignedTo: sId,
            });
          });

          await Promise.all(promises);
          totalAssignments += batch.students.length;
        }
      }

      toast.success(
        `${validProjects.length} project(s) assigned to ${totalAssignments} student(s) across ${selectedBatches.length} batch(es)`
      );
      if (onAssigned) onAssigned();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign projects");
    } finally {
      setLoading(false);
    }
  };

  // Calculate total students
  const totalStudents = batches
    .filter((b) => selectedBatches.includes(b._id))
    .reduce((sum, b) => sum + (b.students?.length || 0), 0);

  const validProjectCount = projects.filter(
    (p) => p.title.trim() && p.description.trim()
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="rounded-lg w-full max-w-6xl overflow-hidden max-h-[90vh] flex flex-col"
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "12px",
          boxShadow: "0 20px 25px rgba(0,0,0,0.15)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        `}</style>

        {/* Header */}
        <div
          className="px-6 py-5 flex items-center justify-between flex-shrink-0"
          style={{
            backgroundColor: "#2563EB",
            borderBottom: "1px solid #E2E8F0",
          }}
        >
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: "#FFFFFF", fontWeight: "700" }}>
              <FolderGit2 size={24} />
              Multi-Batch Project Assignment
            </h3>
            <p className="text-sm mt-1" style={{ color: "#BFDBFE" }}>
              Assign multiple projects across multiple batches
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 rounded-lg transition"
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              color: "#FFFFFF",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
            }}
          >
            <X size={24} />
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Batch Selection */}
          <div
            className="rounded-lg p-5"
            style={{
              backgroundColor: "#F8FAFC",
              border: "1.5px solid #E2E8F0",
              borderRadius: "12px",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold flex items-center gap-2" style={{ color: "#1B2B4B", fontWeight: "700" }}>
                <div
                  style={{
                    backgroundColor: "#EFF6FF",
                    padding: "6px",
                    borderRadius: "6px",
                  }}
                >
                  <Layers size={18} style={{ color: "#2563EB" }} />
                </div>
                Select Batches ({selectedBatches.length}/{batches.length})
              </h4>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleAllBatches}
                className="text-sm font-medium flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg transition"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  color: "#2563EB",
                  borderRadius: "6px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#EFF6FF";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#FFFFFF";
                }}
              >
                {selectedBatches.length === batches.length ? (
                  <>
                    <Square size={16} /> Deselect All
                  </>
                ) : (
                  <>
                    <CheckSquare size={16} /> Select All
                  </>
                )}
              </motion.button>
            </div>

            {fetchingBatches ? (
              <div className="text-center py-8">
                <RefreshCw
                  className="animate-spin mx-auto"
                  size={24}
                  style={{ color: "#2563EB" }}
                />
                <p className="text-sm mt-2" style={{ color: "#64748B" }}>
                  Loading batches...
                </p>
              </div>
            ) : (
              <div
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto rounded-lg p-3"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "8px",
                }}
              >
                {batches.map((batch) => (
                  <motion.label
                    key={batch._id}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition"
                    style={{
                      backgroundColor: selectedBatches.includes(batch._id)
                        ? "#EFF6FF"
                        : "#F8FAFC",
                      border: selectedBatches.includes(batch._id)
                        ? "1.5px solid #2563EB"
                        : "1.5px solid transparent",
                      borderRadius: "6px",
                    }}
                    onMouseEnter={(e) => {
                      if (!selectedBatches.includes(batch._id)) {
                        e.currentTarget.style.backgroundColor = "#F1F5F9";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = selectedBatches.includes(batch._id)
                        ? "#EFF6FF"
                        : "#F8FAFC";
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedBatches.includes(batch._id)}
                      onChange={() => toggleBatch(batch._id)}
                      className="w-4 h-4 rounded cursor-pointer"
                      style={{
                        accentColor: "#2563EB",
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                        {batch.batch_name}
                      </div>
                      <div className="text-xs" style={{ color: "#94A3B8" }}>
                        Batch #{batch.batch_no} • {batch.students?.length || 0}{" "}
                        students
                      </div>
                    </div>
                    {selectedBatches.includes(batch._id) && (
                      <CheckSquare
                        size={16}
                        style={{ color: "#2563EB", flexShrink: 0 }}
                      />
                    )}
                  </motion.label>
                ))}
              </div>
            )}
          </div>

          {/* Projects Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2" style={{ color: "#1B2B4B", fontWeight: "700" }}>
                <div
                  style={{
                    backgroundColor: "#EFF6FF",
                    padding: "6px",
                    borderRadius: "6px",
                  }}
                >
                  <FolderGit2 size={18} style={{ color: "#2563EB" }} />
                </div>
                Projects ({projects.length})
              </h4>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addProject}
                className="flex items-center gap-2 text-white px-4 py-2 rounded-lg font-medium cursor-pointer transition"
                style={{
                  backgroundColor: "#2563EB",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#1E40AF";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#2563EB";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(37, 99, 235, 0.3)";
                }}
              >
                <Plus size={18} /> Add Project
              </motion.button>
            </div>

            {projects.map((project, pIdx) => (
              <ProjectForm
                key={pIdx}
                project={project}
                projectIndex={pIdx}
                updateProject={updateProject}
                removeProject={removeProject}
                addModule={addModule}
                removeModule={removeModule}
                updateModule={updateModule}
                addOutcome={addOutcome}
                removeOutcome={removeOutcome}
                updateOutcome={updateOutcome}
                addSkill={addSkill}
                removeSkill={removeSkill}
                updateSkill={updateSkill}
                canRemove={projects.length > 1}
              />
            ))}
          </div>

          {/* Summary */}
          {validProjectCount > 0 && selectedBatches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg p-5 flex items-start gap-3"
              style={{
                backgroundColor: "#EFF6FF",
                border: "1.5px solid #BFDBFE",
                borderRadius: "8px",
              }}
            >
              <Users
                size={24}
                style={{ color: "#2563EB", flexShrink: 0, marginTop: "2px" }}
              />
              <div className="space-y-2">
                <p className="font-bold text-lg" style={{ color: "#1E40AF", fontWeight: "700" }}>
                  Assignment Summary
                </p>
                <div className="text-sm space-y-1" style={{ color: "#1E40AF" }}>
                  <p>
                    • <strong>{validProjectCount}</strong> valid project(s)
                    will be assigned
                  </p>
                  <p>
                    • To <strong>{totalStudents}</strong> student(s) across{" "}
                    <strong>{selectedBatches.length}</strong> batch(es)
                  </p>
                  <p>
                    • Total assignments:{" "}
                    <strong className="text-lg">
                      {validProjectCount * totalStudents}
                    </strong>
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Warnings */}
          {selectedBatches.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-lg p-4 flex items-start gap-3"
              style={{
                backgroundColor: "#FEF3C7",
                border: "1.5px solid #FCD34D",
                borderRadius: "8px",
              }}
            >
              <AlertCircle
                size={20}
                style={{ color: "#92400E", marginTop: "2px", flexShrink: 0 }}
              />
              <div className="text-sm" style={{ color: "#92400E" }}>
                <strong>No batches selected!</strong> Please select at least one
                batch.
              </div>
            </motion.div>
          )}

          {validProjectCount === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-lg p-4 flex items-start gap-3"
              style={{
                backgroundColor: "#FEF3C7",
                border: "1.5px solid #FCD34D",
                borderRadius: "8px",
              }}
            >
              <AlertCircle
                size={20}
                style={{ color: "#92400E", marginTop: "2px", flexShrink: 0 }}
              />
              <div className="text-sm" style={{ color: "#92400E" }}>
                <strong>No valid projects!</strong> Please add project title and
                description.
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex items-center justify-end gap-3 flex-shrink-0"
          style={{
            backgroundColor: "#F8FAFC",
            borderTop: "1px solid #E2E8F0",
          }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg font-medium transition cursor-pointer"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #E2E8F0",
              color: "#1B2B4B",
              borderRadius: "8px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#F1F5F9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#FFFFFF";
            }}
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={
              loading || validProjectCount === 0 || selectedBatches.length === 0
            }
            className="px-5 py-2.5 rounded-lg text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            style={{
              backgroundColor: "#2563EB",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
            }}
            onMouseEnter={(e) => {
              if (!(loading || validProjectCount === 0 || selectedBatches.length === 0)) {
                e.currentTarget.style.backgroundColor = "#1E40AF";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(37, 99, 235, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#2563EB";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.3)";
            }}
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw size={18} />
                </motion.div>
                Assigning {validProjectCount * totalStudents} projects...
              </>
            ) : (
              <>
                <Upload size={18} />
                Assign {validProjectCount * totalStudents} Project(s)
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Project Form Component
function ProjectForm({
  project,
  projectIndex,
  updateProject,
  removeProject,
  addModule,
  removeModule,
  updateModule,
  addOutcome,
  removeOutcome,
  updateOutcome,
  addSkill,
  removeSkill,
  updateSkill,
  canRemove,
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      className="rounded-lg p-5"
      style={{
        backgroundColor: "#F8FAFC",
        border: "1.5px solid #E2E8F0",
        borderRadius: "12px",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h5 className="font-bold" style={{ color: "#1B2B4B", fontWeight: "700" }}>
          Project #{projectIndex + 1}
        </h5>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm font-medium px-3 py-1 rounded-lg transition cursor-pointer"
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
            {expanded ? "Collapse" : "Expand"}
          </button>
          {canRemove && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => removeProject(projectIndex)}
              className="p-2 rounded-lg transition"
              style={{
                backgroundColor: "transparent",
                color: "#EF4444",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#FEE2E2";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Trash2 size={18} />
            </motion.button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-4"
          >
            {/* Basic fields */}
            <input
              type="text"
              placeholder="Project Title *"
              value={project.title}
              onChange={(e) =>
                updateProject(projectIndex, "title", e.target.value)
              }
              className="w-full px-4 py-2 rounded-lg outline-none transition"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1.5px solid #E2E8F0",
                color: "#1B2B4B",
                borderRadius: "8px",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#2563EB";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#E2E8F0";
              }}
            />
            <textarea
              placeholder="Description *"
              value={project.description}
              onChange={(e) =>
                updateProject(projectIndex, "description", e.target.value)
              }
              className="w-full px-4 py-2 rounded-lg outline-none resize-none transition"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1.5px solid #E2E8F0",
                color: "#1B2B4B",
                borderRadius: "8px",
              }}
              rows={2}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#2563EB";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#E2E8F0";
              }}
            />
            <input
              type="text"
              placeholder="Repository URL (optional)"
              value={project.repo}
              onChange={(e) =>
                updateProject(projectIndex, "repo", e.target.value)
              }
              className="w-full px-4 py-2 rounded-lg outline-none transition"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1.5px solid #E2E8F0",
                color: "#1B2B4B",
                borderRadius: "8px",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#2563EB";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#E2E8F0";
              }}
            />
            <select
              value={project.overallStatus}
              onChange={(e) =>
                updateProject(projectIndex, "overallStatus", e.target.value)
              }
              className="w-full px-4 py-2 rounded-lg outline-none cursor-pointer transition"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1.5px solid #E2E8F0",
                color: "#1B2B4B",
                borderRadius: "8px",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#2563EB";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#E2E8F0";
              }}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Submitted">Submitted</option>
              <option value="Approved">Approved</option>
            </select>

            {/* Modules Section */}
            <div
              className="rounded-lg p-3 space-y-2"
              style={{
                backgroundColor: "#F0F9FF",
                border: "1px solid #BFDBFE",
                borderRadius: "8px",
              }}
            >
              <div className="flex items-center justify-between">
                <h6 className="text-sm font-semibold flex items-center gap-2" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                  <Layers size={14} style={{ color: "#2563EB" }} />
                  Modules
                </h6>
                <button
                  onClick={() => addModule(projectIndex)}
                  className="text-xs text-white px-2 py-1 rounded transition"
                  style={{
                    backgroundColor: "#2563EB",
                    borderRadius: "4px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#1E40AF";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#2563EB";
                  }}
                >
                  <Plus size={12} className="inline mr-1" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {project.modules.map((module, mIdx) => (
                  <div key={mIdx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Module name"
                      value={module.name}
                      onChange={(e) =>
                        updateModule(projectIndex, mIdx, "name", e.target.value)
                      }
                      className="flex-1 px-2 py-1 text-sm rounded outline-none transition"
                      style={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        color: "#1B2B4B",
                        borderRadius: "4px",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#2563EB";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#E2E8F0";
                      }}
                    />
                    {project.modules.length > 1 && (
                      <button
                        onClick={() => removeModule(projectIndex, mIdx)}
                        className="p-1 rounded transition"
                        style={{
                          backgroundColor: "transparent",
                          color: "#EF4444",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#FEE2E2";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Outcomes Section */}
            <div
              className="rounded-lg p-3 space-y-2"
              style={{
                backgroundColor: "#F0FDF4",
                border: "1px solid #DCFCE7",
                borderRadius: "8px",
              }}
            >
              <div className="flex items-center justify-between">
                <h6 className="text-sm font-semibold flex items-center gap-2" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                  <Target size={14} style={{ color: "#10B981" }} />
                  Outcomes
                </h6>
                <button
                  onClick={() => addOutcome(projectIndex)}
                  className="text-xs text-white px-2 py-1 rounded transition"
                  style={{
                    backgroundColor: "#10B981",
                    borderRadius: "4px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#059669";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#10B981";
                  }}
                >
                  <Plus size={12} className="inline mr-1" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {project.outcomes.map((outcome, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Outcome title"
                      value={outcome.title}
                      onChange={(e) =>
                        updateOutcome(projectIndex, oIdx, "title", e.target.value)
                      }
                      className="flex-1 px-2 py-1 text-sm rounded outline-none transition"
                      style={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        color: "#1B2B4B",
                        borderRadius: "4px",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#10B981";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#E2E8F0";
                      }}
                    />
                    {project.outcomes.length > 1 && (
                      <button
                        onClick={() => removeOutcome(projectIndex, oIdx)}
                        className="p-1 rounded transition"
                        style={{
                          backgroundColor: "transparent",
                          color: "#EF4444",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#FEE2E2";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Skills Section */}
            <div
              className="rounded-lg p-3 space-y-2"
              style={{
                backgroundColor: "#FEF3C7",
                border: "1px solid #FCD34D",
                borderRadius: "8px",
              }}
            >
              <div className="flex items-center justify-between">
                <h6 className="text-sm font-semibold flex items-center gap-2" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                  <Award size={14} style={{ color: "#F59E0B" }} />
                  Skills
                </h6>
                <button
                  onClick={() => addSkill(projectIndex)}
                  className="text-xs text-white px-2 py-1 rounded transition"
                  style={{
                    backgroundColor: "#F59E0B",
                    borderRadius: "4px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#D97706";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#F59E0B";
                  }}
                >
                  <Plus size={12} className="inline mr-1" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {project.skills.map((skill, sIdx) => (
                  <div key={sIdx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Skill name"
                      value={skill.name}
                      onChange={(e) =>
                        updateSkill(projectIndex, sIdx, "name", e.target.value)
                      }
                      className="flex-1 px-2 py-1 text-sm rounded outline-none transition"
                      style={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        color: "#1B2B4B",
                        borderRadius: "4px",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#F59E0B";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#E2E8F0";
                      }}
                    />
                    <select
                      value={skill.level}
                      onChange={(e) =>
                        updateSkill(projectIndex, sIdx, "level", e.target.value)
                      }
                      className="px-2 py-1 text-sm rounded outline-none cursor-pointer transition"
                      style={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        color: "#1B2B4B",
                        borderRadius: "4px",
                        minWidth: "100px",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#F59E0B";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#E2E8F0";
                      }}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                    {project.skills.length > 1 && (
                      <button
                        onClick={() => removeSkill(projectIndex, sIdx)}
                        className="p-1 rounded transition"
                        style={{
                          backgroundColor: "transparent",
                          color: "#EF4444",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#FEE2E2";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}