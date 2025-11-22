// src/components/admin/MultiBatchProjectAssign.jsx
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
          const promises = batch.students.map((student) =>
            API.post("/projects/create", {
              title: project.title,
              description: project.description,
              repo: project.repo,
              studentId: student._id,
              batchId: batch._id,
              modules: validModules,
              outcomes: validOutcomes,
              skills: validSkills,
              overallStatus: project.overallStatus,
              assignedTo: student._id,
            })
          );

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FolderGit2 size={24} />
              Multi-Batch Project Assignment
            </h3>
            <p className="text-sm text-purple-100 mt-1">
              Assign multiple projects across multiple batches
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-xl transition cursor-pointer"
          >
            <X size={24} />
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Batch Selection */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-5 border-2 border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-gray-800 flex items-center gap-2">
                <Layers size={18} className="text-purple-600" />
                Select Batches ({selectedBatches.length}/{batches.length})
              </h4>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleAllBatches}
                className="text-sm text-purple-700 hover:text-purple-800 font-medium flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg hover:bg-purple-50 transition"
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
                  className="animate-spin mx-auto text-purple-600"
                  size={24}
                />
                <p className="text-sm text-gray-600 mt-2">Loading batches...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto bg-white rounded-xl p-3 border border-purple-100">
                {batches.map((batch) => (
                  <motion.label
                    key={batch._id}
                    whileHover={{ scale: 1.02 }}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                      selectedBatches.includes(batch._id)
                        ? "bg-gradient-to-r from-purple-100 to-indigo-100 border-2 border-purple-300"
                        : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedBatches.includes(batch._id)}
                      onChange={() => toggleBatch(batch._id)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 text-sm truncate">
                        {batch.batch_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        Batch #{batch.batch_no} • {batch.students?.length || 0}{" "}
                        students
                      </div>
                    </div>
                    {selectedBatches.includes(batch._id) && (
                      <CheckSquare
                        size={16}
                        className="text-purple-600 flex-shrink-0"
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
              <h4 className="font-bold text-gray-800 flex items-center gap-2">
                <FolderGit2 size={18} className="text-indigo-600" />
                Projects ({projects.length})
              </h4>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addProject}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-medium cursor-pointer transition shadow-md"
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
              className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5"
            >
              <div className="flex items-start gap-3">
                <Users size={24} className="text-blue-600 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="font-bold text-blue-900 text-lg">
                    Assignment Summary
                  </p>
                  <div className="text-sm text-blue-800 space-y-1">
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
              </div>
            </motion.div>
          )}

          {/* Warnings */}
          {selectedBatches.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 flex items-start gap-3"
            >
              <AlertCircle
                size={20}
                className="text-yellow-600 flex-shrink-0 mt-0.5"
              />
              <div className="text-sm text-yellow-800">
                <strong>No batches selected!</strong> Please select at least one
                batch.
              </div>
            </motion.div>
          )}

          {validProjectCount === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 flex items-start gap-3"
            >
              <AlertCircle
                size={20}
                className="text-yellow-600 flex-shrink-0 mt-0.5"
              />
              <div className="text-sm text-yellow-800">
                <strong>No valid projects!</strong> Please add project title and
                description.
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200 flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition cursor-pointer"
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
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
    <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-5 border-2 border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h5 className="font-bold text-gray-800">Project #{projectIndex + 1}</h5>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium px-3 py-1 rounded-lg hover:bg-indigo-50 transition cursor-pointer"
          >
            {expanded ? "Collapse" : "Expand"}
          </button>
          {canRemove && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => removeProject(projectIndex)}
              className="text-red-500 hover:bg-red-50 p-2 rounded-lg cursor-pointer transition"
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
            {/* Basic fields - Similar structure as BulkAssignProjectModal but condensed */}
            <input
              type="text"
              placeholder="Project Title *"
              value={project.title}
              onChange={(e) =>
                updateProject(projectIndex, "title", e.target.value)
              }
              className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-indigo-400 outline-none"
            />
            <textarea
              placeholder="Description *"
              value={project.description}
              onChange={(e) =>
                updateProject(projectIndex, "description", e.target.value)
              }
              className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-indigo-400 outline-none resize-none"
              rows={2}
            />
            {/* Add modules, outcomes, skills sections similar to BulkAssignProjectModal but more compact */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
