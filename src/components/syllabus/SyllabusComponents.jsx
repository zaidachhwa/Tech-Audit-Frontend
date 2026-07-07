// src/components/syllabus/SyllabusComponents.jsx
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Calendar,
  BookOpen,
  Edit2,
  Trash2,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
} from "lucide-react";

// Empty State Component
export function EmptyState({ onCreateClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 text-center shadow-lg border border-white/20"
    >
      <div className="flex justify-center mb-6">
        <div className="bg-gradient-to-br from-purple-100 to-indigo-100 p-6 rounded-full">
          <BookOpen size={48} className="text-purple-600" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-3">
        No Syllabi Created Yet
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Get started by creating your first syllabus template. You can add lectures
        and assign them to batches later.
      </p>
      <button
        onClick={onCreateClick}
        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition flex items-center gap-2 mx-auto"
      >
        <Plus size={20} />
        Create Your First Syllabus
      </button>
    </motion.div>
  );
}

// Modal Component
export function Modal({ title, onClose, children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  );
}

// Stat Card Component
export function StatCard({ icon, label, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium mb-1">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="bg-white/20 p-3 rounded-xl">{icon}</div>
      </div>
    </motion.div>
  );
}

// Syllabus Card Component
export function SyllabusCard({
  syllabus,
  index,
  expanded,
  onToggleExpand,
  onAddTopic,
  onEditSyllabus,
  onDeleteSyllabus,
  onEditTopic,
  onDeleteTopic,
  onAssignTopic,
  calculateProgress,
}) {
  const progress = calculateProgress(syllabus.topics || []);
  const topicCount = syllabus.topics?.length || 0;

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition"
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-500 p-2 rounded-lg">
                <BookOpen size={20} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                {syllabus.subject}
              </h3>
            </div>
            {syllabus.description && (
              <p className="text-gray-600 text-sm mb-3">
                {syllabus.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {new Date(syllabus.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <User size={14} />
                {syllabus.createdBy?.name || "Unknown"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onEditSyllabus}
              className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
              title="Edit Syllabus"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={onDeleteSyllabus}
              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
              title="Delete Syllabus"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={onToggleExpand}
              className="p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition"
            >
              {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium">
              Progress: {topicCount} topic{topicCount !== 1 ? "s" : ""}
            </span>
            <span className="text-purple-600 font-bold">{progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Topics List */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-100"
          >
            <div className="p-6 space-y-3 bg-gradient-to-b from-gray-50/50 to-white/50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-700">Topics</h4>
                <button
                  onClick={onAddTopic}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-indigo-700 transition flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Lecture
                </button>
              </div>

              {topicCount === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    No lectures yet. Click "Add Lecture" to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {syllabus.topics.map((topic, topicIndex) => (
                    <motion.div
                      key={topic._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: topicIndex * 0.05 }}
                      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-800">
                              {topic.title}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getStatusColor(
                                topic.completionStatus
                              )}`}
                            >
                              {getStatusIcon(topic.completionStatus)}
                              {topic.completionStatus || "Pending"}
                            </span>
                          </div>
                          {topic.description && (
                            <p className="text-sm text-gray-600 mb-2">
                              {topic.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {topic.dueDate && (
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                Due:{" "}
                                {new Date(topic.dueDate).toLocaleDateString()}
                              </span>
                            )}
                            {topic.assignedTo && (
                              <span className="flex items-center gap-1">
                                <User size={12} />
                                {topic.assignedTo.name}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onAssignTopic(topic)}
                            className="p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition text-xs"
                            title="Assign Teacher"
                          >
                            <User size={16} />
                          </button>
                          <button
                            onClick={() => onEditTopic(topic)}
                            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                            title="Edit Topic"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => onDeleteTopic(topic._id)}
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                            title="Delete Topic"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
