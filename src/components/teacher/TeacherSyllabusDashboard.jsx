// ============================================
// TeacherSyllabusDashboard.jsx - Teacher View
// ============================================
import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

import {
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  FileText,
  Edit,
  RefreshCw,
  TrendingUp,
  Target,
  MessageSquare,
  CheckCheck,
} from "lucide-react";

export default function TeacherSyllabusDashboard() {
  const { user } = useAuth();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [remarkText, setRemarkText] = useState("");

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const res = await API.get("/syllabus/my-topics");
      setTopics(res.data?.topics || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch topics");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (topicId) => {
    try {
      await API.patch(`/syllabus/topic/${topicId}/complete`);
      toast.success("Topic marked as completed! 🎉");
      fetchTopics();
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark topic as complete");
    }
  };

  const handleAddRemark = async (e) => {
    e.preventDefault();
    try {
      await API.patch(`/syllabus/topic/${selectedTopic._id}/remark`, {
        remark: remarkText,
      });
      toast.success("Remark added successfully!");
      setRemarkText("");
      setShowRemarkModal(false);
      fetchTopics();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add remark");
    }
  };

  const stats = {
    total: topics.length,
    completed: topics.filter((t) => t.completionStatus === "Completed").length,
    inProgress: topics.filter((t) => t.completionStatus === "In Progress")
      .length,
    pending: topics.filter((t) => t.completionStatus === "Pending").length,
  };

  const completionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-6">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl shadow-xl p-8 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Topics</h1>
              <p className="text-purple-100">
                Track and manage your assigned topics
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchTopics}
              disabled={loading}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              Refresh
            </motion.button>
          </div>
        </motion.div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <TeacherStatCard
            icon={<BookOpen size={20} />}
            label="Total Topics"
            value={stats.total}
            color="from-blue-500 to-cyan-500"
          />
          <TeacherStatCard
            icon={<CheckCircle2 size={20} />}
            label="Completed"
            value={stats.completed}
            color="from-green-500 to-emerald-500"
          />
          <TeacherStatCard
            icon={<Clock size={20} />}
            label="In Progress"
            value={stats.inProgress}
            color="from-orange-500 to-amber-500"
          />
          <TeacherStatCard
            icon={<AlertCircle size={20} />}
            label="Pending"
            value={stats.pending}
            color="from-red-500 to-pink-500"
          />
        </div>

        {/* Completion Rate */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-3 rounded-xl">
              <TrendingUp size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">
                Completion Rate
              </h3>
              <p className="text-sm text-gray-600">Your overall progress</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionRate}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                />
              </div>
            </div>
            <div className="text-4xl font-bold text-purple-600">
              {completionRate}%
            </div>
          </div>
        </motion.div>

        {/* Topics List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="animate-spin text-purple-600" size={40} />
          </div>
        ) : topics.length === 0 ? (
          <EmptyTopicsState />
        ) : (
          <div className="space-y-4">
            {/* Group by status */}
            {["Pending", "In Progress", "Completed"].map((status) => {
              const filteredTopics = topics.filter(
                (t) => t.completionStatus === status
              );
              if (filteredTopics.length === 0) return null;

              return (
                <div key={status}>
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    {status === "Completed" && (
                      <CheckCircle2 size={20} className="text-green-600" />
                    )}
                    {status === "In Progress" && (
                      <Clock size={20} className="text-orange-600" />
                    )}
                    {status === "Pending" && (
                      <AlertCircle size={20} className="text-red-600" />
                    )}
                    {status} ({filteredTopics.length})
                  </h3>
                  <div className="space-y-3">
                    {filteredTopics.map((topic, index) => (
                      <TeacherTopicCard
                        key={topic._id}
                        topic={topic}
                        index={index}
                        onMarkComplete={handleMarkComplete}
                        onAddRemark={(topic) => {
                          setSelectedTopic(topic);
                          setRemarkText(topic.remarks || "");
                          setShowRemarkModal(true);
                        }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Remark Modal */}
      <AnimatePresence>
        {showRemarkModal && selectedTopic && (
          <RemarkModal
            topic={selectedTopic}
            remarkText={remarkText}
            setRemarkText={setRemarkText}
            onClose={() => setShowRemarkModal(false)}
            onSubmit={handleAddRemark}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Teacher Stat Card
function TeacherStatCard({ icon, label, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={`bg-gradient-to-br ${color} rounded-2xl shadow-lg p-6 text-white`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
          {icon}
        </div>
        <div className="text-4xl font-bold">{value}</div>
      </div>
      <div className="text-sm font-medium opacity-90">{label}</div>
    </motion.div>
  );
}

// Empty Topics State
function EmptyTopicsState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-12 text-center"
    >
      <Target size={64} className="mx-auto text-gray-300 mb-4" />
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        No Topics Assigned
      </h3>
      <p className="text-gray-500">Topics assigned to you will appear here</p>
    </motion.div>
  );
}

// Teacher Topic Card
function TeacherTopicCard({ topic, index, onMarkComplete, onAddRemark }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case "Completed":
        return {
          bg: "from-green-50 to-emerald-50",
          border: "border-green-200",
          badge: "from-green-500 to-emerald-500",
        };
      case "In Progress":
        return {
          bg: "from-blue-50 to-cyan-50",
          border: "border-blue-200",
          badge: "from-blue-500 to-cyan-500",
        };
      default:
        return {
          bg: "from-amber-50 to-orange-50",
          border: "border-amber-200",
          badge: "from-amber-500 to-orange-500",
        };
    }
  };

  const config = getStatusConfig(topic.completionStatus);
  const dueDate = topic.dueDate
    ? new Date(topic.dueDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  const isOverdue = topic.dueDate && new Date(topic.dueDate) < new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-gradient-to-br ${config.bg} border-2 ${config.border} rounded-2xl p-6 hover:shadow-lg transition`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`bg-gradient-to-r ${config.badge} p-2 rounded-lg`}>
              <BookOpen size={20} className="text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-lg">{topic.title}</h4>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <span className="font-medium">
                  {topic.syllabus?.subject || "N/A"}
                </span>
              </div>
            </div>
          </div>
          {topic.description && (
            <p className="text-sm text-gray-600 ml-11">{topic.description}</p>
          )}
        </div>
      </div>

      {/* Due Date */}
      <div className="flex items-center gap-6 mb-4 ml-11">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-500" />
          <span className="text-sm text-gray-700">
            Due:{" "}
            <span
              className={
                isOverdue ? "text-red-600 font-semibold" : "font-medium"
              }
            >
              {dueDate}
            </span>
          </span>
          {isOverdue && topic.completionStatus !== "Completed" && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
              Overdue
            </span>
          )}
        </div>
      </div>

      {/* Remarks */}
      {topic.remarks && (
        <div className="ml-11 mb-4 bg-white/80 rounded-xl p-4 border border-gray-200">
          <div className="flex items-start gap-2 mb-2">
            <MessageSquare size={16} className="text-purple-600 mt-0.5" />
            <span className="text-sm font-semibold text-gray-700">
              Remarks:
            </span>
          </div>
          <p className="text-sm text-gray-600 italic ml-6">{topic.remarks}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 ml-11">
        {topic.completionStatus !== "Completed" && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onMarkComplete(topic._id)}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCheck size={18} />
            Mark as Complete
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onAddRemark(topic)}
          className="flex-1 bg-white border-2 border-purple-300 text-purple-700 px-4 py-2 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-purple-50 cursor-pointer"
        >
          <Edit size={18} />
          {topic.remarks ? "Edit Remark" : "Add Remark"}
        </motion.button>
      </div>
    </motion.div>
  );
}

// Remark Modal
function RemarkModal({ topic, remarkText, setRemarkText, onClose, onSubmit }) {
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
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">
            {remarkText ? "Edit" : "Add"} Remark
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-xl transition cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Topic: {topic.title}
            </label>
            <textarea
              placeholder="Enter your remarks or notes about this topic..."
              value={remarkText}
              onChange={(e) => setRemarkText(e.target.value)}
              rows={6}
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 cursor-pointer"
            >
              Save Remark
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
