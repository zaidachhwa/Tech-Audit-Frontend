import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import toast from "react-hot-toast";
import {
  RefreshCw,
  Users,
  FileText,
  Plus,
  Trash2,
  Calendar,
  Target,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";
import { Modal, StatCard } from "./SyllabusComponents";

export default function BatchAssignmentsPanel({ onActionComplete }) {
  const [batches, setBatches] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [batchSyllabi, setBatchSyllabi] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedBatches, setExpandedBatches] = useState(new Set());

  // Assign modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({
    syllabusId: "",
    batchId: "",
    notes: "",
    dueDate: "",
  });

  // View topics modal
  const [showTopicsModal, setShowTopicsModal] = useState(false);
  const [activeBatchSyllabus, setActiveBatchSyllabus] = useState(null);
  const [batchTopics, setBatchTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);

  // Teacher assign to batch-topic
  const [showAssignTeacherModal, setShowAssignTeacherModal] = useState(false);
  const [teacherAssignForm, setTeacherAssignForm] = useState({
    batchTopicId: "",
    teacherId: "",
    dueDate: "",
  });
  const [selectedTopicForAssign, setSelectedTopicForAssign] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [bRes, sRes, tRes] = await Promise.all([
        API.get("/batches/public"),
        API.get("/syllabus/all"),
        API.get("/teachers/list"),
      ]);
      setBatches(bRes.data?.batches || bRes.data || []);
      setTemplates(sRes.data?.syllabi || []);
      setTeachers(tRes.data?.teachers || []);
      await fetchBatchSyllabi();
    } catch (err) {
      console.error(err);
      toast.error("Failed to load batch assignment data");
    } finally {
      setLoading(false);
    }
  };

  const fetchBatchSyllabi = async () => {
    try {
      const res = await API.get("/syllabus/batches-with-syllabi");
      setBatchSyllabi(res.data?.batches || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch batch syllabi");
    }
  };

  const handleAssignToBatch = async (e) => {
    e.preventDefault();
    if (!assignForm.syllabusId || !assignForm.batchId) {
      toast.error("Select both syllabus and batch");
      return;
    }
    try {
      setLoading(true);
      await API.post("/syllabus/assign-to-batch", {
        syllabusId: assignForm.syllabusId,
        batchId: assignForm.batchId,
        notes: assignForm.notes,
        dueDate: assignForm.dueDate,
      });
      toast.success("Syllabus assigned to batch successfully!");
      setShowAssignModal(false);
      setAssignForm({ syllabusId: "", batchId: "", notes: "" });
      fetchBatchSyllabi();
      onActionComplete?.();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to assign syllabus");
    } finally {
      setLoading(false);
    }
  };

  const openTopicsModal = async (batchSyllabus) => {
    setActiveBatchSyllabus(batchSyllabus);
    setShowTopicsModal(true);
    setLoadingTopics(true);

    try {
      const batchId =
        typeof batchSyllabus.batch === "object"
          ? batchSyllabus.batch._id
          : batchSyllabus.batch;

      const syllabusId =
        typeof batchSyllabus.syllabus === "object"
          ? batchSyllabus.syllabus._id
          : batchSyllabus.syllabus;

      const res = await API.get(
        `/syllabus/batch-topics?batchId=${batchId}&syllabusId=${syllabusId}`
      );

      setBatchTopics(res.data?.topics || []);
    } catch (err) {
      console.error("Error loading topics:", err);
      toast.error("Failed to load batch topics");
    } finally {
      setLoadingTopics(false);
    }
  };

  const handleAssignTeacherToBatchTopic = async (e) => {
    e.preventDefault();
    if (!teacherAssignForm.batchTopicId || !teacherAssignForm.teacherId) {
      toast.error("Select a topic and a teacher");
      return;
    }

    try {
      setLoading(true);
      await API.post("/syllabus/assign-teacher", {
        batchTopicId: teacherAssignForm.batchTopicId,
        teacherId: teacherAssignForm.teacherId,
        dueDate: teacherAssignForm.dueDate || undefined,
      });
      toast.success("Teacher assigned to batch topic successfully!");
      setShowAssignTeacherModal(false);
      setTeacherAssignForm({ batchTopicId: "", teacherId: "", dueDate: "" });
      setSelectedTopicForAssign(null);

      if (activeBatchSyllabus) openTopicsModal(activeBatchSyllabus);
      onActionComplete?.();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to assign teacher");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBatchSyllabus = async (batchSyllabusId) => {
    if (
      !confirm(
        "Delete this syllabus assignment and all its topics? This cannot be undone."
      )
    )
      return;
    try {
      setLoading(true);
      await API.delete(`/syllabus/batch-syllabus/${batchSyllabusId}`);
      toast.success("Batch syllabus assignment deleted successfully!");
      fetchBatchSyllabi();
      onActionComplete?.();
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to delete assignment"
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleBatchExpanded = (batchId) => {
    setExpandedBatches((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(batchId)) {
        newSet.delete(batchId);
      } else {
        newSet.add(batchId);
      }
      return newSet;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return { backgroundColor: "#ECFDF5", color: "#065F46", borderColor: "#D1FAE5" };
      case "In Progress":
        return { backgroundColor: "#FEF3C7", color: "#92400E", borderColor: "#FCD34D" };
      default:
        return { backgroundColor: "#F8FAFC", color: "#64748B", borderColor: "#E2E8F0" };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <CheckCircle2 size={14} />;
      case "In Progress":
        return <Clock size={14} />;
      default:
        return <AlertCircle size={14} />;
    }
  };

  const totalAssignedInstances = batchSyllabi.reduce(
    (acc, b) => acc + (b.assignedSyllabi?.length || 0),
    0
  );

  return (
    <div className="space-y-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>

      {/* Header Card */}
      <div
        className="p-6 rounded-lg"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1.5px solid #E2E8F0",
          borderRadius: "12px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold flex items-center gap-2" style={{ color: "#1B2B4B", fontSize: "20px", fontWeight: "700" }}>
              <div
                style={{
                  backgroundColor: "#EFF6FF",
                  padding: "8px",
                  borderRadius: "8px",
                }}
              >
                <Target size={22} style={{ color: "#2563EB" }} />
              </div>
              Batch Assignments
            </h3>
            <p className="text-sm mt-1" style={{ color: "#64748B" }}>
              Assign syllabus templates to specific batches and manage batch
              topics
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAssignModal(true)}
              className="text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
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
              <Plus size={18} />
              Assign to Batch
            </button>

            <button
              onClick={fetchBatchSyllabi}
              disabled={loading}
              className="px-3 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: "#F8FAFC",
                border: "1.5px solid #E2E8F0",
                borderRadius: "8px",
                color: "#94A3B8",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#E2E8F0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#F8FAFC";
              }}
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Batches"
            value={batches.length}
            icon={<Users size={18} style={{ color: "#2563EB" }} />}
            color={{ backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" }}
          />
          <StatCard
            label="Templates"
            value={templates.length}
            icon={<FileText size={18} style={{ color: "#A78BFA" }} />}
            color={{ backgroundColor: "#F3E8FF", borderColor: "#E9D5FF" }}
          />
          <StatCard
            label="Assignments"
            value={totalAssignedInstances}
            icon={<Target size={18} style={{ color: "#10B981" }} />}
            color={{ backgroundColor: "#ECFDF5", borderColor: "#D1FAE5" }}
          />
          <StatCard
            label="Teachers"
            value={teachers.length}
            icon={<Users size={18} style={{ color: "#F59E0B" }} />}
            color={{ backgroundColor: "#FEF3C7", borderColor: "#FCD34D" }}
          />
        </div>
      </div>

      {/* Batch list with assigned syllabi */}
      <div className="space-y-4">
        {loading ? (
          <div
            className="py-12 text-center rounded-lg"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #E2E8F0",
              borderRadius: "12px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <RefreshCw
              className="animate-spin mx-auto mb-3"
              size={40}
              style={{ color: "#2563EB" }}
            />
            <p style={{ color: "#64748B" }}>Loading batch assignments...</p>
          </div>
        ) : batchSyllabi.length === 0 ? (
          <div
            className="rounded-lg p-12 text-center"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #E2E8F0",
              borderRadius: "12px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <div className="flex justify-center mb-6">
              <div
                style={{
                  backgroundColor: "#EFF6FF",
                  padding: "24px",
                  borderRadius: "50%",
                }}
              >
                <Target size={48} style={{ color: "#2563EB" }} />
              </div>
            </div>
            <h3 className="font-bold mb-3" style={{ color: "#1B2B4B", fontSize: "20px", fontWeight: "700" }}>
              No Batch Assignments Yet
            </h3>
            <p className="mb-6 max-w-md mx-auto" style={{ color: "#64748B" }}>
              Start by assigning syllabus templates to specific batches. This
              creates batch-specific topic instances that can be tracked
              independently.
            </p>
            <button
              onClick={() => setShowAssignModal(true)}
              className="text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 mx-auto transition-colors"
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
              <Plus size={20} />
              Assign First Syllabus
            </button>
          </div>
        ) : (
          batchSyllabi.map((batch) => (
            <div
              key={batch._id}
              className="rounded-lg overflow-hidden"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1.5px solid #E2E8F0",
                borderRadius: "12px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              {/* Batch Header */}
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      style={{
                        backgroundColor: "#EFF6FF",
                        padding: "12px",
                        borderRadius: "8px",
                      }}
                    >
                      <Users size={24} style={{ color: "#2563EB" }} />
                    </div>
                    <div>
                      <h4 className="font-bold" style={{ color: "#1B2B4B", fontSize: "18px", fontWeight: "700" }}>
                        {batch.batch_name}
                      </h4>
                      <div className="flex items-center gap-3 text-sm mt-1" style={{ color: "#64748B" }}>
                        <span>Batch #{batch.batch_no}</span>
                        <span>•</span>
                        <span>{batch.students?.length || 0} Students</span>
                        <span>•</span>
                        <span>
                          {batch.assignedSyllabi?.length || 0} Syllabus
                          {batch.assignedSyllabi?.length !== 1 ? "es" : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleBatchExpanded(batch._id)}
                    className="p-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: "#F8FAFC",
                      color: "#94A3B8",
                      borderRadius: "8px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#E2E8F0";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#F8FAFC";
                    }}
                  >
                    {expandedBatches.has(batch._id) ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* Assigned Syllabi */}
              {expandedBatches.has(batch._id) && (
                <div
                  style={{
                    borderTop: "1px solid #F1F5F9",
                    backgroundColor: "#F8FAFC",
                  }}
                >
                  <div className="p-5 space-y-3">
                    {batch.assignedSyllabi &&
                    batch.assignedSyllabi.length > 0 ? (
                      batch.assignedSyllabi.map((bs) => (
                        <div
                          key={bs._id}
                          className="rounded-lg p-4"
                          style={{
                            backgroundColor: "#FFFFFF",
                            border: "1.5px solid #E2E8F0",
                            borderRadius: "8px",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText
                                  size={18}
                                  style={{ color: "#2563EB" }}
                                />
                                <h5 className="font-semibold" style={{ color: "#1B2B4B" }}>
                                  {bs.syllabus.subject}
                                </h5>
                              </div>
                              {bs.syllabus.description && (
                                <p className="text-sm mb-2" style={{ color: "#64748B" }}>
                                  {bs.syllabus.description}
                                </p>
                              )}
                              {bs.notes && (
                                <p className="text-xs italic mb-2" style={{ color: "#94A3B8" }}>
                                  Note: {bs.notes}
                                </p>
                              )}
                              <div className="flex items-center gap-2 text-xs" style={{ color: "#94A3B8" }}>
                                <span className="flex items-center gap-1">
                                  <Calendar size={12} />
                                  Assigned:{" "}
                                  {new Date(bs.createdAt).toLocaleDateString()}
                                </span>
                                {bs.assignedBy && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <User size={12} />
                                      {bs.assignedBy.name}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openTopicsModal(bs)}
                                className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
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
                                View Topics
                              </button>

                              <button
                                onClick={() =>
                                  handleDeleteBatchSyllabus(bs._id)
                                }
                                className="p-2 rounded-lg transition-colors"
                                style={{
                                  backgroundColor: "#FEF2F2",
                                  color: "#EF4444",
                                  border: "1.5px solid #FECACA",
                                  borderRadius: "8px",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = "#FEE2E2";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = "#FEF2F2";
                                }}
                                title="Delete Assignment"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8" style={{ color: "#94A3B8" }}>
                        <AlertCircle size={32} className="mx-auto mb-2" />
                        <p className="text-sm">
                          No syllabi assigned to this batch yet
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Assign to Batch Modal */}
      {showAssignModal && (
        <Modal
          title="Assign Syllabus to Batch"
          onClose={() => setShowAssignModal(false)}
        >
          <form onSubmit={handleAssignToBatch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                Select Batch *
              </label>
              <select
                value={assignForm.batchId}
                onChange={(e) =>
                  setAssignForm({ ...assignForm, batchId: e.target.value })
                }
                required
                className="w-full px-3 py-2 rounded-lg outline-none transition"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1.5px solid #E2E8F0",
                  borderRadius: "8px",
                  color: "#1B2B4B",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#2563EB";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#E2E8F0";
                }}
              >
                <option value="">Choose batch...</option>
                {batches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.batch_name} (#{b.batch_no}) - {b.students?.length || 0}{" "}
                    students
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                Select Syllabus Template *
              </label>
              <select
                value={assignForm.syllabusId}
                onChange={(e) =>
                  setAssignForm({
                    ...assignForm,
                    syllabusId: e.target.value,
                  })
                }
                required
                className="w-full px-3 py-2 rounded-lg outline-none transition"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1.5px solid #E2E8F0",
                  borderRadius: "8px",
                  color: "#1B2B4B",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#2563EB";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#E2E8F0";
                }}
              >
                <option value="">Choose syllabus...</option>
                {templates.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.subject} ({t.topics?.length || 0} topics)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                Due Date
              </label>
              <input
                type="date"
                value={assignForm.dueDate}
                onChange={(e) =>
                  setAssignForm({ ...assignForm, dueDate: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg outline-none transition"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1.5px solid #E2E8F0",
                  borderRadius: "8px",
                  color: "#1B2B4B",
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
              <label className="block text-sm font-medium mb-2" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                Notes (optional)
              </label>
              <textarea
                rows={3}
                value={assignForm.notes}
                onChange={(e) =>
                  setAssignForm({ ...assignForm, notes: e.target.value })
                }
                placeholder="Add any notes about this assignment..."
                className="w-full px-3 py-2 rounded-lg outline-none resize-none transition"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1.5px solid #E2E8F0",
                  borderRadius: "8px",
                  color: "#1B2B4B",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#2563EB";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#E2E8F0";
                }}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1.5px solid #E2E8F0",
                  color: "#1B2B4B",
                  borderRadius: "8px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F8FAFC";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#FFFFFF";
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "#2563EB",
                  borderRadius: "8px",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = "#1E40AF";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#2563EB";
                }}
              >
                {loading ? "Assigning..." : "Assign Syllabus"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Batch topics modal */}
      {showTopicsModal && activeBatchSyllabus && (
        <Modal
          title={`${activeBatchSyllabus.syllabus.subject} — Batch Topics`}
          onClose={() => {
            setShowTopicsModal(false);
            setActiveBatchSyllabus(null);
            setBatchTopics([]);
          }}
        >
          <div className="space-y-3">
            {loadingTopics ? (
              <div className="py-8 text-center">
                <RefreshCw
                  className="animate-spin mx-auto mb-3"
                  size={32}
                  style={{ color: "#2563EB" }}
                />
                <p className="text-sm" style={{ color: "#64748B" }}>
                  Loading topics...
                </p>
              </div>
            ) : batchTopics.length === 0 ? (
              <div className="text-center py-8" style={{ color: "#94A3B8" }}>
                <AlertCircle size={32} className="mx-auto mb-2" />
                <p className="text-sm">
                  No topics found for this batch-syllabus assignment.
                </p>
              </div>
            ) : (
              batchTopics.map((t) => (
                <div
                  key={t._id}
                  className="p-4 rounded-lg transition-colors"
                  style={{
                    backgroundColor: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#2563EB";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#E2E8F0";
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold" style={{ color: "#1B2B4B" }}>
                          {t.title}
                        </span>
                        <span
                          className="text-xs px-2 py-1 rounded flex items-center gap-1 font-medium"
                          style={{
                            ...getStatusColor(t.completionStatus),
                            borderRadius: "6px",
                            border: `1px solid ${getStatusColor(t.completionStatus).borderColor}`,
                            padding: "3px 12px",
                          }}
                        >
                          {getStatusIcon(t.completionStatus)}
                          {t.completionStatus || "Pending"}
                        </span>
                      </div>
                      {t.description && (
                        <p className="text-sm mb-2" style={{ color: "#64748B" }}>
                          {t.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs" style={{ color: "#94A3B8" }}>
                        {t.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            Due: {new Date(t.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {t.assignedTo ? t.assignedTo.name : "Not assigned"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedTopicForAssign(t);
                        setTeacherAssignForm({
                          batchTopicId: t._id,
                          teacherId: t.assignedTo?._id || "",
                          dueDate: t.dueDate ? t.dueDate.split("T")[0] : "",
                        });
                        setShowAssignTeacherModal(true);
                      }}
                      className="px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                      style={{
                        backgroundColor: "#EFF6FF",
                        color: "#2563EB",
                        border: "1.5px solid #BFDBFE",
                        borderRadius: "8px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#DBEAFE";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#EFF6FF";
                      }}
                    >
                      <User size={16} />
                      {t.assignedTo ? "Reassign" : "Assign"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Modal>
      )}

      {/* Assign teacher modal */}
      {showAssignTeacherModal && selectedTopicForAssign && (
        <Modal
          title={`Assign Teacher to "${selectedTopicForAssign.title}"`}
          onClose={() => {
            setShowAssignTeacherModal(false);
            setSelectedTopicForAssign(null);
            setTeacherAssignForm({
              batchTopicId: "",
              teacherId: "",
              dueDate: "",
            });
          }}
        >
          <form
            onSubmit={handleAssignTeacherToBatchTopic}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                Select Teacher *
              </label>
              <select
                value={teacherAssignForm.teacherId}
                onChange={(e) =>
                  setTeacherAssignForm({
                    ...teacherAssignForm,
                    teacherId: e.target.value,
                  })
                }
                required
                className="w-full px-3 py-2 rounded-lg outline-none transition"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1.5px solid #E2E8F0",
                  borderRadius: "8px",
                  color: "#1B2B4B",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#2563EB";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#E2E8F0";
                }}
              >
                <option value="">Choose teacher...</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                Due Date (optional)
              </label>
              <input
                type="date"
                value={teacherAssignForm.dueDate}
                onChange={(e) =>
                  setTeacherAssignForm({
                    ...teacherAssignForm,
                    dueDate: e.target.value,
                  })
                }
                className="w-full px-3 py-2 rounded-lg outline-none transition"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1.5px solid #E2E8F0",
                  borderRadius: "8px",
                  color: "#1B2B4B",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#2563EB";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#E2E8F0";
                }}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAssignTeacherModal(false);
                  setSelectedTopicForAssign(null);
                }}
                className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1.5px solid #E2E8F0",
                  color: "#1B2B4B",
                  borderRadius: "8px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F8FAFC";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#FFFFFF";
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "#2563EB",
                  borderRadius: "8px",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = "#1E40AF";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#2563EB";
                }}
              >
                {loading ? "Assigning..." : "Assign Teacher"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}