// src/components/syllabus/BatchAssignmentsPanel.jsx
import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
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
  Edit2,
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
      });
      toast.success("Teacher assigned to batch topic successfully!");
      setShowAssignTeacherModal(false);
      setTeacherAssignForm({ batchTopicId: "", teacherId: "" });
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
        return "text-green-600 bg-green-50";
      case "In Progress":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
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
      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <Target size={24} className="text-purple-600" />
              Batch Assignments
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Assign syllabus templates to specific batches and manage batch
              topics
            </p>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAssignModal(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition"
            >
              <Plus size={18} />
              Assign to Batch
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchBatchSyllabi}
              disabled={loading}
              className="bg-white/50 hover:bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-xl transition shadow-sm border border-gray-200"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </motion.button>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Batches"
            value={batches.length}
            icon={<Users size={18} />}
            color="from-blue-500 to-cyan-500"
          />
          <StatCard
            label="Templates"
            value={templates.length}
            icon={<FileText size={18} />}
            color="from-purple-500 to-pink-500"
          />
          <StatCard
            label="Assignments"
            value={totalAssignedInstances}
            icon={<Target size={18} />}
            color="from-green-500 to-emerald-500"
          />
          <StatCard
            label="Teachers"
            value={teachers.length}
            icon={<Users size={18} />}
            color="from-orange-500 to-amber-500"
          />
        </div>
      </div>

      {/* Batch list with assigned syllabi */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg">
            <RefreshCw
              className="animate-spin mx-auto text-purple-600 mb-3"
              size={40}
            />
            <p className="text-gray-600">Loading batch assignments...</p>
          </div>
        ) : batchSyllabi.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 text-center shadow-lg border border-white/20"
          >
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-purple-100 to-indigo-100 p-6 rounded-full">
                <Target size={48} className="text-purple-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              No Batch Assignments Yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start by assigning syllabus templates to specific batches. This
              creates batch-specific topic instances that can be tracked
              independently.
            </p>
            <button
              onClick={() => setShowAssignModal(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition flex items-center gap-2 mx-auto"
            >
              <Plus size={20} />
              Assign First Syllabus
            </button>
          </motion.div>
        ) : (
          batchSyllabi.map((batch, index) => (
            <motion.div
              key={batch._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition"
            >
              {/* Batch Header */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-xl">
                      <Users size={24} className="text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">
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
                    className="p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition"
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
              <AnimatePresence>
                {expandedBatches.has(batch._id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-100 bg-gradient-to-b from-gray-50/50 to-white/50"
                  >
                    <div className="p-6 space-y-3">
                      {batch.assignedSyllabi &&
                      batch.assignedSyllabi.length > 0 ? (
                        batch.assignedSyllabi.map((bs, bsIndex) => (
                          <motion.div
                            key={bs._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: bsIndex * 0.05 }}
                            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <FileText
                                    size={18}
                                    className="text-purple-600"
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
                                    {new Date(
                                      bs.createdAt
                                    ).toLocaleDateString()}
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
                                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold hover:from-purple-700 hover:to-indigo-700 transition"
                                >
                                  View Topics
                                </button>

                                <button
                                  onClick={() =>
                                    handleDeleteBatchSyllabus(bs._id)
                                  }
                                  className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                                  title="Delete Assignment"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          </motion.div>
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
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>

      {/* Assign to Batch Modal */}
      <AnimatePresence>
        {showAssignModal && (
          <Modal
            title="Assign Syllabus to Batch"
            onClose={() => setShowAssignModal(false)}
          >
            <form onSubmit={handleAssignToBatch} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Batch *
                </label>
                <select
                  value={assignForm.batchId}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, batchId: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  rows={3}
                  value={assignForm.notes}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, notes: e.target.value })
                  }
                  placeholder="Add any notes about this assignment..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50"
                >
                  {loading ? "Assigning..." : "Assign Syllabus"}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* Batch topics modal */}
      <AnimatePresence>
        {showTopicsModal && activeBatchSyllabus && (
          <Modal
            title={`${activeBatchSyllabus.syllabus.subject} — Batch Topics`}
            onClose={() => {
              setShowTopicsModal(false);
              setActiveBatchSyllabus(null);
              setBatchTopics([]);
            }}
          >
            <div className="space-y-4">
              {loadingTopics ? (
                <div className="py-8 text-center">
                  <RefreshCw
                    className="animate-spin mx-auto text-purple-600 mb-3"
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
                batchTopics.map((t, index) => (
                  <motion.div
                    key={t._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-white rounded-xl border shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-800">
                            {t.title}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getStatusColor(
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
                            ...teacherAssignForm,
                            batchTopicId: t._id,
                          });
                          setShowAssignTeacherModal(true);
                        }}
                        className="px-3 py-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition text-sm font-semibold flex items-center gap-2"
                      >
                        <User size={16} />
                        {t.assignedTo ? "Reassign" : "Assign"}
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Assign teacher modal */}
      <AnimatePresence>
        {showAssignTeacherModal && selectedTopicForAssign && (
          <Modal
            title={`Assign Teacher to "${selectedTopicForAssign.title}"`}
            onClose={() => {
              setShowAssignTeacherModal(false);
              setSelectedTopicForAssign(null);
              setTeacherAssignForm({ batchTopicId: "", teacherId: "" });
            }}
          >
            <form
              onSubmit={handleAssignTeacherToBatchTopic}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                >
                  <option value="">Choose teacher...</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignTeacherModal(false);
                    setSelectedTopicForAssign(null);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50"
                >
                  {loading ? "Assigning..." : "Assign Teacher"}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
