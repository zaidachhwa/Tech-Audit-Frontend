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
  const [dueDate, setDueDate] = useState("");

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
          ...(dueDate ? { dueDate } : {}),
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
        className="rounded-lg w-full max-w-5xl overflow-hidden max-h-[90vh] flex flex-col"
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
              Bulk Assign Project
            </h3>
            <p className="text-sm mt-1" style={{ color: "#BFDBFE" }}>
              {batch.batch_name} (Batch #{batch.batch_no})
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

        {/* Content - Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Basic Project Details */}
          <div
            className="rounded-lg p-5 space-y-4"
            style={{
              backgroundColor: "#F8FAFC",
              border: "1.5px solid #E2E8F0",
              borderRadius: "12px",
            }}
          >
            <h4 className="font-bold flex items-center gap-2" style={{ color: "#1B2B4B", fontWeight: "700" }}>
              <div
                style={{
                  backgroundColor: "#EFF6FF",
                  padding: "6px",
                  borderRadius: "6px",
                }}
              >
                <FileText size={18} style={{ color: "#2563EB" }} />
              </div>
              Basic Information
            </h4>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                Project Title *
              </label>
              <input
                type="text"
                placeholder="Enter project title (e.g., E-commerce Website)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-lg outline-none transition"
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
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                Description *
              </label>
              <textarea
                placeholder="Provide project details, requirements, and deliverables..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-lg outline-none resize-none transition"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1.5px solid #E2E8F0",
                  color: "#1B2B4B",
                  borderRadius: "8px",
                }}
                rows={4}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#2563EB";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#E2E8F0";
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                Repository URL (Optional)
              </label>
              <input
                type="text"
                placeholder="https://github.com/username/repo"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                className="w-full px-4 py-3 rounded-lg outline-none transition"
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
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                Due Date (Optional)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 rounded-lg outline-none transition"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1.5px solid #E2E8F0",
                  color: "#1B2B4B",
                  borderRadius: "8px",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#2563EB"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#E2E8F0"; }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                Overall Status
              </label>
              <select
                value={overallStatus}
                onChange={(e) => setOverallStatus(e.target.value)}
                className="w-full px-4 py-3 rounded-lg outline-none cursor-pointer transition"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1.5px solid #E2E8F0",
                  color: "#1B2B4B",
                  borderRadius: "8px",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#2563EB"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#E2E8F0"; }}
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
          <div
            className="rounded-lg p-5 space-y-4"
            style={{
              backgroundColor: "#F0F9FF",
              border: "1.5px solid #BFDBFE",
              borderRadius: "12px",
            }}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2" style={{ color: "#1B2B4B", fontWeight: "700" }}>
                <div
                  style={{
                    backgroundColor: "#DBEAFE",
                    padding: "6px",
                    borderRadius: "6px",
                  }}
                >
                  <Layers size={18} style={{ color: "#2563EB" }} />
                </div>
                Modules (Optional)
              </h4>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addModule}
                className="flex items-center gap-2 text-white px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition"
                style={{
                  backgroundColor: "#2563EB",
                  borderRadius: "6px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#1E40AF";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#2563EB";
                }}
              >
                <Plus size={16} /> Add Module
              </motion.button>
            </div>

            <div className="space-y-3">
              {modules.map((module, index) => (
                <div
                  key={index}
                  className="rounded-lg p-4 space-y-3"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid #BFDBFE",
                    borderRadius: "8px",
                  }}
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
                        className="w-full px-3 py-2 rounded-lg outline-none transition"
                        style={{
                          backgroundColor: "#F8FAFC",
                          border: "1px solid #E2E8F0",
                          color: "#1B2B4B",
                          borderRadius: "6px",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "#2563EB";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "#E2E8F0";
                        }}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={module.status}
                          onChange={(e) =>
                            updateModule(index, "status", e.target.value)
                          }
                          className="px-3 py-2 rounded-lg outline-none cursor-pointer transition"
                          style={{
                            backgroundColor: "#F8FAFC",
                            border: "1px solid #E2E8F0",
                            color: "#1B2B4B",
                            borderRadius: "6px",
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
                        </select>
                        <input
                          type="text"
                          placeholder="Notes (optional)"
                          value={module.notes}
                          onChange={(e) =>
                            updateModule(index, "notes", e.target.value)
                          }
                          className="px-3 py-2 rounded-lg outline-none transition"
                          style={{
                            backgroundColor: "#F8FAFC",
                            border: "1px solid #E2E8F0",
                            color: "#1B2B4B",
                            borderRadius: "6px",
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = "#2563EB";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = "#E2E8F0";
                          }}
                        />
                      </div>
                    </div>
                    {modules.length > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeModule(index)}
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
              ))}
            </div>
          </div>

          {/* Outcomes Section */}
          <div
            className="rounded-lg p-5 space-y-4"
            style={{
              backgroundColor: "#F0FDF4",
              border: "1.5px solid #DCFCE7",
              borderRadius: "12px",
            }}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2" style={{ color: "#1B2B4B", fontWeight: "700" }}>
                <div
                  style={{
                    backgroundColor: "#DCFCE7",
                    padding: "6px",
                    borderRadius: "6px",
                  }}
                >
                  <Target size={18} style={{ color: "#10B981" }} />
                </div>
                Learning Outcomes (Optional)
              </h4>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addOutcome}
                className="flex items-center gap-2 text-white px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition"
                style={{
                  backgroundColor: "#10B981",
                  borderRadius: "6px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#059669";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#10B981";
                }}
              >
                <Plus size={16} /> Add Outcome
              </motion.button>
            </div>

            <div className="space-y-3">
              {outcomes.map((outcome, index) => (
                <div
                  key={index}
                  className="rounded-lg p-4 space-y-3"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid #DCFCE7",
                    borderRadius: "8px",
                  }}
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
                        className="w-full px-3 py-2 rounded-lg outline-none transition"
                        style={{
                          backgroundColor: "#F8FAFC",
                          border: "1px solid #E2E8F0",
                          color: "#1B2B4B",
                          borderRadius: "6px",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "#10B981";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "#E2E8F0";
                        }}
                      />
                      <textarea
                        placeholder="Description (optional)"
                        value={outcome.description}
                        onChange={(e) =>
                          updateOutcome(index, "description", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg outline-none resize-none transition"
                        style={{
                          backgroundColor: "#F8FAFC",
                          border: "1px solid #E2E8F0",
                          color: "#1B2B4B",
                          borderRadius: "6px",
                        }}
                        rows={2}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "#10B981";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "#E2E8F0";
                        }}
                      />
                    </div>
                    {outcomes.length > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeOutcome(index)}
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
              ))}
            </div>
          </div>

          {/* Skills Section */}
          <div
            className="rounded-lg p-5 space-y-4"
            style={{
              backgroundColor: "#FEF3C7",
              border: "1.5px solid #FCD34D",
              borderRadius: "12px",
            }}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2" style={{ color: "#1B2B4B", fontWeight: "700" }}>
                <div
                  style={{
                    backgroundColor: "#FCD34D",
                    padding: "6px",
                    borderRadius: "6px",
                  }}
                >
                  <Award size={18} style={{ color: "#92400E" }} />
                </div>
                Required Skills (Optional)
              </h4>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addSkill}
                className="flex items-center gap-2 text-white px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition"
                style={{
                  backgroundColor: "#F59E0B",
                  borderRadius: "6px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#D97706";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#F59E0B";
                }}
              >
                <Plus size={16} /> Add Skill
              </motion.button>
            </div>

            <div className="space-y-3">
              {skills.map((skill, index) => (
                <div
                  key={index}
                  className="rounded-lg p-4"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid #FCD34D",
                    borderRadius: "8px",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Skill name (e.g., React.js)"
                      value={skill.name}
                      onChange={(e) =>
                        updateSkill(index, "name", e.target.value)
                      }
                      className="flex-1 px-3 py-2 rounded-lg outline-none transition"
                      style={{
                        backgroundColor: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        color: "#1B2B4B",
                        borderRadius: "6px",
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
                        updateSkill(index, "level", e.target.value)
                      }
                      className="px-3 py-2 rounded-lg outline-none cursor-pointer transition"
                      style={{
                        backgroundColor: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        color: "#1B2B4B",
                        borderRadius: "6px",
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
                    {skills.length > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeSkill(index)}
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
              ))}
            </div>
          </div>

          {/* Student Selection */}
          <div
            className="rounded-lg p-5"
            style={{
              backgroundColor: "#F8FAFC",
              border: "1.5px solid #E2E8F0",
              borderRadius: "12px",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-semibold flex items-center gap-2" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                <div
                  style={{
                    backgroundColor: "#EFF6FF",
                    padding: "6px",
                    borderRadius: "6px",
                  }}
                >
                  <Users size={16} style={{ color: "#2563EB" }} />
                </div>
                Select Students ({selected.length}/{students.length})
              </label>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleAll}
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

            <div
              className="grid gap-2 max-h-60 overflow-y-auto rounded-lg p-3"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
              }}
            >
              {students.map((student) => (
                <motion.label
                  key={student._id}
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition"
                  style={{
                    backgroundColor: selected.includes(student._id)
                      ? "#EFF6FF"
                      : "#F8FAFC",
                    border: selected.includes(student._id)
                      ? "1.5px solid #2563EB"
                      : "1.5px solid transparent",
                    borderRadius: "6px",
                  }}
                  onMouseEnter={(e) => {
                    if (!selected.includes(student._id)) {
                      e.currentTarget.style.backgroundColor = "#F1F5F9";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = selected.includes(student._id)
                      ? "#EFF6FF"
                      : "#F8FAFC";
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(student._id)}
                    onChange={() => toggleStudent(student._id)}
                    className="w-5 h-5 rounded cursor-pointer"
                    style={{
                      accentColor: "#2563EB",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate" style={{ color: "#1B2B4B" }}>
                      {student.name}
                    </div>
                    <div className="text-xs truncate" style={{ color: "#94A3B8" }}>
                      {student.email}
                    </div>
                  </div>
                  {selected.includes(student._id) && (
                    <CheckSquare size={20} style={{ color: "#2563EB", flexShrink: 0 }} />
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
              className="rounded-lg p-4 flex items-start gap-3"
              style={{
                backgroundColor: "#FEF3C7",
                border: "1.5px solid #FCD34D",
                borderRadius: "8px",
              }}
            >
              <AlertCircle size={20} style={{ color: "#92400E", marginTop: "2px", flexShrink: 0 }} />
              <div className="text-sm" style={{ color: "#92400E" }}>
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
              className="rounded-lg p-4 flex items-start gap-3"
              style={{
                backgroundColor: "#EFF6FF",
                border: "1.5px solid #BFDBFE",
                borderRadius: "8px",
              }}
            >
              <Users size={20} style={{ color: "#2563EB", marginTop: "2px", flexShrink: 0 }} />
              <div className="text-sm" style={{ color: "#1E40AF" }}>
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
              loading ||
              !title.trim() ||
              !description.trim() ||
              selected.length === 0
            }
            className="px-5 py-2.5 rounded-lg text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            style={{
              backgroundColor: "#2563EB",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
            }}
            onMouseEnter={(e) => {
              if (!loading && title.trim() && description.trim() && selected.length > 0) {
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