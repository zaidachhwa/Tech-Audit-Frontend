// src/components/admin/BulkAssignProjectModal.jsx
import { useState } from "react";
import { API } from "../../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  X,
  Users,
  CheckSquare,
  Square,
  AlertCircle,
  FolderGit2,
  GitBranch,
  FileText,
  RefreshCw,
  Plus,
  Trash2,
  Target,
  Award,
  Layers,
} from "lucide-react";

export default function BulkAssignProjectModal({
  batch,
  students,
  onClose,
  onAssigned,
}) {
  const [selected, setSelected] = useState(students.map((s) => s._id));
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [repo, setRepo] = useState("");
  const [loading, setLoading] = useState(false);

  // New fields matching schema
  const [modules, setModules] = useState([
    { name: "", status: "Pending", notes: "" },
  ]);
  const [outcomes, setOutcomes] = useState([{ title: "", description: "" }]);
  const [skills, setSkills] = useState([{ name: "", level: "Intermediate" }]);
  const [overallStatus, setOverallStatus] = useState("Pending");

  const toggleStudent = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    setSelected((prev) =>
      prev.length === students.length ? [] : students.map((s) => s._id)
    );
  };

  // Module handlers
  const addModule = () => {
    setModules([...modules, { name: "", status: "Pending", notes: "" }]);
  };

  const removeModule = (index) => {
    setModules(modules.filter((_, i) => i !== index));
  };

  const updateModule = (index, field, value) => {
    const updated = [...modules];
    updated[index][field] = value;
    setModules(updated);
  };

  // Outcome handlers
  const addOutcome = () => {
    setOutcomes([...outcomes, { title: "", description: "" }]);
  };

  const removeOutcome = (index) => {
    setOutcomes(outcomes.filter((_, i) => i !== index));
  };

  const updateOutcome = (index, field, value) => {
    const updated = [...outcomes];
    updated[index][field] = value;
    setOutcomes(updated);
  };

  // Skill handlers
  const addSkill = () => {
    setSkills([...skills, { name: "", level: "Intermediate" }]);
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const updateSkill = (index, field, value) => {
    const updated = [...skills];
    updated[index][field] = value;
    setSkills(updated);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Project title is required");
      return;
    }
    if (!description.trim()) {
      toast.error("Project description is required");
      return;
    }
    if (selected.length === 0) {
      toast.error("Please select at least one student");
      return;
    }

    // Filter out empty modules, outcomes, and skills
    const validModules = modules.filter((m) => m.name.trim());
    const validOutcomes = outcomes.filter((o) => o.title.trim());
    const validSkills = skills.filter((s) => s.name.trim());

    try {
      setLoading(true);
      const promises = selected.map((studentId) =>
        API.post("/projects/create", {
          title,
          description,
          repo,
          studentId,
          batchId: batch._id,
          modules: validModules,
          outcomes: validOutcomes,
          skills: validSkills,
          overallStatus,
          assignedTo: studentId,
        })
      );
      await Promise.all(promises);
      toast.success(`Project assigned to ${selected.length} student(s)`);
      if (onAssigned) onAssigned();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign projects");
    } finally {
      setLoading(false);
    }
  };

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
        className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FolderGit2 size={24} />
              Bulk Assign Project
            </h3>
            <p className="text-sm text-purple-100 mt-1">
              {batch.batch_name} (Batch #{batch.batch_no})
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

        {/* Content - Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Basic Project Details */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-5 border-2 border-purple-100 space-y-4">
            <h4 className="font-bold text-gray-800 flex items-center gap-2">
              <FileText size={18} className="text-purple-600" />
              Basic Information
            </h4>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                placeholder="Enter project title (e.g., E-commerce Website)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                placeholder="Provide project details, requirements, and deliverables..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition outline-none resize-none"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Repository URL (Optional)
              </label>
              <input
                type="text"
                placeholder="https://github.com/username/repo"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Overall Status
              </label>
              <select
                value={overallStatus}
                onChange={(e) => setOverallStatus(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition outline-none cursor-pointer"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Submitted">Submitted</option>
                <option value="Approved">Approved</option>
              </select>
            </div>
          </div>

          {/* Modules Section */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border-2 border-blue-100 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-gray-800 flex items-center gap-2">
                <Layers size={18} className="text-blue-600" />
                Modules (Optional)
              </h4>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addModule}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition"
              >
                <Plus size={16} /> Add Module
              </motion.button>
            </div>

            <div className="space-y-3">
              {modules.map((module, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 border-2 border-blue-100 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        placeholder="Module name (e.g., User Authentication)"
                        value={module.name}
                        onChange={(e) =>
                          updateModule(index, "name", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={module.status}
                          onChange={(e) =>
                            updateModule(index, "status", e.target.value)
                          }
                          className="px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 outline-none cursor-pointer"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Notes (optional)"
                          value={module.notes}
                          onChange={(e) =>
                            updateModule(index, "notes", e.target.value)
                          }
                          className="px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                        />
                      </div>
                    </div>
                    {modules.length > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeModule(index)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg cursor-pointer transition"
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Outcomes Section */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-100 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-gray-800 flex items-center gap-2">
                <Target size={18} className="text-green-600" />
                Learning Outcomes (Optional)
              </h4>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addOutcome}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition"
              >
                <Plus size={16} /> Add Outcome
              </motion.button>
            </div>

            <div className="space-y-3">
              {outcomes.map((outcome, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 border-2 border-green-100 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        placeholder="Outcome title (e.g., Build RESTful APIs)"
                        value={outcome.title}
                        onChange={(e) =>
                          updateOutcome(index, "title", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none"
                      />
                      <textarea
                        placeholder="Description (optional)"
                        value={outcome.description}
                        onChange={(e) =>
                          updateOutcome(index, "description", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none resize-none"
                        rows={2}
                      />
                    </div>
                    {outcomes.length > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeOutcome(index)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg cursor-pointer transition"
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Section */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 border-2 border-orange-100 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-gray-800 flex items-center gap-2">
                <Award size={18} className="text-orange-600" />
                Required Skills (Optional)
              </h4>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addSkill}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition"
              >
                <Plus size={16} /> Add Skill
              </motion.button>
            </div>

            <div className="space-y-3">
              {skills.map((skill, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 border-2 border-orange-100"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Skill name (e.g., React.js)"
                      value={skill.name}
                      onChange={(e) =>
                        updateSkill(index, "name", e.target.value)
                      }
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none"
                    />
                    <select
                      value={skill.level}
                      onChange={(e) =>
                        updateSkill(index, "level", e.target.value)
                      }
                      className="px-3 py-2 rounded-lg border border-gray-200 focus:border-orange-400 outline-none cursor-pointer"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                    {skills.length > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeSkill(index)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg cursor-pointer transition"
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Selection */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-5 border-2 border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Users size={16} className="text-purple-600" />
                Select Students ({selected.length}/{students.length})
              </label>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleAll}
                className="text-sm text-purple-700 hover:text-purple-800 font-medium flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg hover:bg-purple-50 transition"
              >
                {selected.length === students.length ? (
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

            <div className="grid gap-2 max-h-60 overflow-y-auto bg-white rounded-xl p-3 border border-purple-100">
              {students.map((student) => (
                <motion.label
                  key={student._id}
                  whileHover={{ scale: 1.01 }}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                    selected.includes(student._id)
                      ? "bg-gradient-to-r from-purple-100 to-indigo-100 border-2 border-purple-300"
                      : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(student._id)}
                    onChange={() => toggleStudent(student._id)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 truncate">
                      {student.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {student.email}
                    </div>
                  </div>
                  {selected.includes(student._id) && (
                    <CheckSquare
                      size={20}
                      className="text-purple-600 flex-shrink-0"
                    />
                  )}
                </motion.label>
              ))}
            </div>
          </div>

          {/* Warning if no students selected */}
          {selected.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 flex items-start gap-3"
            >
              <AlertCircle
                size={20}
                className="text-yellow-600 flex-shrink-0 mt-0.5"
              />
              <div className="text-sm text-yellow-800">
                <strong>No students selected!</strong> Please select at least
                one student to assign the project.
              </div>
            </motion.div>
          )}

          {/* Info message */}
          {selected.length > 0 && title && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-start gap-3"
            >
              <Users size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                The project "<strong>{title}</strong>" will be assigned to{" "}
                <strong>{selected.length}</strong> student(s) with{" "}
                <strong>{modules.filter((m) => m.name.trim()).length}</strong>{" "}
                module(s),{" "}
                <strong>{outcomes.filter((o) => o.title.trim()).length}</strong>{" "}
                outcome(s), and{" "}
                <strong>{skills.filter((s) => s.name.trim()).length}</strong>{" "}
                skill(s).
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
              loading ||
              !title.trim() ||
              !description.trim() ||
              selected.length === 0
            }
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw size={16} />
                </motion.div>
                Assigning...
              </>
            ) : (
              <>
                <CheckSquare size={16} />
                Assign to {selected.length} Student
                {selected.length !== 1 ? "s" : ""}
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
