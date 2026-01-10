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
      // Fix: batch may be ID or populated object
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

      // refresh topics
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
        return "text-green-700 bg-green-50 border-green-200";
      case "In Progress":
        return "text-amber-700 bg-amber-50 border-amber-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
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
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Target size={22} className="text-indigo-600" />
              Batch Assignments
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Assign syllabus templates to specific batches and manage batch
              topics
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAssignModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-indigo-700 transition-colors"
            >
              <Plus size={18} />
              Assign to Batch
            </button>

            <button
              onClick={fetchBatchSyllabi}
              disabled={loading}
              className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors border border-gray-200"
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
            icon={<Users size={18} className="text-blue-600" />}
            color="bg-blue-50 border-blue-200"
          />
          <StatCard
            label="Templates"
            value={templates.length}
            icon={<FileText size={18} className="text-indigo-600" />}
            color="bg-indigo-50 border-indigo-200"
          />
          <StatCard
            label="Assignments"
            value={totalAssignedInstances}
            icon={<Target size={18} className="text-emerald-600" />}
            color="bg-emerald-50 border-emerald-200"
          />
          <StatCard
            label="Teachers"
            value={teachers.length}
            icon={<Users size={18} className="text-amber-600" />}
            color="bg-amber-50 border-amber-200"
          />
        </div>
      </div>

      {/* Batch list with assigned syllabi */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center bg-white rounded-lg shadow-sm border border-gray-200">
            <RefreshCw
              className="animate-spin mx-auto text-indigo-600 mb-3"
              size={40}
            />
            <p className="text-gray-600">Loading batch assignments...</p>
          </div>
        ) : batchSyllabi.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-200">
            <div className="flex justify-center mb-6">
              <div className="bg-indigo-50 p-6 rounded-full">
                <Target size={48} className="text-indigo-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              No Batch Assignments Yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start by assigning syllabus templates to specific batches. This
              creates batch-specific topic instances that can be tracked
              independently.
            </p>
            <button
              onClick={() => setShowAssignModal(true)}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus size={20} />
              Assign First Syllabus
            </button>
          </div>
        ) : (
          batchSyllabi.map((batch) => (
            <div
              key={batch._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Batch Header */}
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-indigo-50 p-3 rounded-lg">
                      <Users size={24} className="text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">
                        {batch.batch_name}
                      </h4>
                      <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
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
                    className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
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
                <div className="border-t border-gray-200 bg-gray-50">
                  <div className="p-5 space-y-3">
                    {batch.assignedSyllabi &&
                    batch.assignedSyllabi.length > 0 ? (
                      batch.assignedSyllabi.map((bs) => (
                        <div
                          key={bs._id}
                          className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText
                                  size={18}
                                  className="text-indigo-600"
                                />
                                <h5 className="font-semibold text-gray-800">
                                  {bs.syllabus.subject}
                                </h5>
                              </div>
                              {bs.syllabus.description && (
                                <p className="text-sm text-gray-600 mb-2">
                                  {bs.syllabus.description}
                                </p>
                              )}
                              {bs.notes && (
                                <p className="text-xs text-gray-500 italic mb-2">
                                  Note: {bs.notes}
                                </p>
                              )}
                              <div className="flex items-center gap-2 text-xs text-gray-500">
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
                                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
                              >
                                View Topics
                              </button>

                              <button
                                onClick={() =>
                                  handleDeleteBatchSyllabus(bs._id)
                                }
                                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-200"
                                title="Delete Assignment"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <AlertCircle
                          size={32}
                          className="mx-auto mb-2 opacity-50"
                        />
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Batch *
              </label>
              <select
                value={assignForm.batchId}
                onChange={(e) =>
                  setAssignForm({ ...assignForm, batchId: e.target.value })
                }
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={assignForm.dueDate}
                onChange={(e) =>
                  setAssignForm({ ...assignForm, dueDate: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                rows={3}
                value={assignForm.notes}
                onChange={(e) =>
                  setAssignForm({ ...assignForm, notes: e.target.value })
                }
                placeholder="Add any notes about this assignment..."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="animate-spin mx-auto text-indigo-600 mb-3"
                  size={32}
                />
                <p className="text-sm text-gray-600">Loading topics...</p>
              </div>
            ) : batchTopics.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  No topics found for this batch-syllabus assignment.
                </p>
              </div>
            ) : (
              batchTopics.map((t) => (
                <div
                  key={t._id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-800">
                          {t.title}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-md border flex items-center gap-1 ${getStatusColor(
                            t.completionStatus
                          )}`}
                        >
                          {getStatusIcon(t.completionStatus)}
                          {t.completionStatus || "Pending"}
                        </span>
                      </div>
                      {t.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {t.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
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
                      className="px-3 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors text-sm font-medium flex items-center gap-2 border border-indigo-200"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAssignTeacherModal(false);
                  setSelectedTopicForAssign(null);
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
