import { motion } from "framer-motion";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  UserPlus,
  ChevronDown,
  ChevronUp,
  Users,
  X,
} from "lucide-react";

// Stat Card Component
export function StatCard({ icon, label, value, color }) {
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
        <div className="text-3xl font-bold">{value}</div>
      </div>
      <div className="text-sm font-medium opacity-90">{label}</div>
    </motion.div>
  );
}

// Empty State Component
export function EmptyState({ onCreateClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-12 text-center"
    >
      <BookOpen size={64} className="mx-auto text-gray-300 mb-4" />
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        No Syllabi Yet
      </h3>
      <p className="text-gray-500 mb-6">
        Create your first syllabus to get started
      </p>
      <button
        onClick={onCreateClick}
        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 cursor-pointer inline-flex items-center gap-2"
      >
        <BookOpen size={18} />
        Create Syllabus
      </button>
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
  onAssignTopic,
  calculateProgress,
}) {
  const progress = calculateProgress(syllabus.topics);
  const totalTopics = syllabus.topics?.length || 0;
  const completedTopics =
    syllabus.topics?.filter((t) => t.completionStatus === "Completed").length ||
    0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-3 rounded-xl shadow-md">
                <BookOpen size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {syllabus.subject}
                </h3>
                {syllabus.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {syllabus.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onAddTopic}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 cursor-pointer"
          >
            <UserPlus size={16} />
            Add Topic
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Overall Progress
            </span>
            <span className="text-sm font-bold text-purple-600">
              {completedTopics}/{totalTopics} Topics ({progress}%)
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
            />
          </div>
        </div>

        {/* Teachers Info */}
        {syllabus.assignedTeachers && syllabus.assignedTeachers.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users size={16} />
            <span>{syllabus.assignedTeachers.length} Teacher(s) Assigned</span>
          </div>
        )}
      </div>

      {/* Topics List */}
      {expanded && syllabus.topics && syllabus.topics.length > 0 && (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-purple-50 space-y-3">
          {syllabus.topics.map((topic) => (
            <TopicCard
              key={topic._id}
              topic={topic}
              onAssign={() => onAssignTopic(topic)}
            />
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <button
          onClick={onToggleExpand}
          className="w-full flex items-center justify-center gap-2 text-purple-600 hover:text-purple-700 font-medium cursor-pointer"
        >
          {expanded ? (
            <>
              <ChevronUp size={18} />
              Hide Topics
            </>
          ) : (
            <>
              <ChevronDown size={18} />
              View {totalTopics} Topic(s)
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

// Topic Card Component
export function TopicCard({ topic, onAssign }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case "Completed":
        return {
          icon: <CheckCircle2 size={16} />,
          color: "from-green-500 to-emerald-500",
          bg: "bg-green-50",
          text: "text-green-700",
          border: "border-green-200",
        };
      case "In Progress":
        return {
          icon: <Clock size={16} />,
          color: "from-blue-500 to-cyan-500",
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200",
        };
      default:
        return {
          icon: <AlertCircle size={16} />,
          color: "from-amber-500 to-orange-500",
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200",
        };
    }
  };

  const config = getStatusConfig(topic.completionStatus);
  const dueDate = topic.dueDate
    ? new Date(topic.dueDate).toLocaleDateString()
    : "N/A";

  return (
    <div className={`${config.bg} border-2 ${config.border} rounded-xl p-4`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 mb-1">{topic.title}</h4>
          {topic.description && (
            <p className="text-sm text-gray-600">{topic.description}</p>
          )}
        </div>
        <div
          className={`px-3 py-1 rounded-lg ${config.bg} ${config.text} border-2 ${config.border} flex items-center gap-2 font-medium text-sm`}
        >
          {config.icon}
          {topic.completionStatus}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>Due: {dueDate}</span>
          </div>
          {topic.assignedTo && (
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>Assigned</span>
            </div>
          )}
        </div>

        {!topic.assignedTo && (
          <button
            onClick={onAssign}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-3 py-1 rounded-lg text-sm font-medium cursor-pointer"
          >
            Assign Teacher
          </button>
        )}
      </div>

      {topic.remarks && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-700 italic">{topic.remarks}</p>
        </div>
      )}
    </div>
  );
}

// Modal Component
export function Modal({ title, children, onClose }) {
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
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-xl transition cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  );
}
