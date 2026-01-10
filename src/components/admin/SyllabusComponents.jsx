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
    <div className={`${color} rounded-lg shadow-sm p-5 border`}>
      <div className="flex items-center justify-between mb-2">
        <div className="bg-white/80 p-2.5 rounded-lg shadow-sm">{icon}</div>
        <div className="text-2xl font-semibold text-gray-800">{value}</div>
      </div>
      <div className="text-sm font-medium text-gray-700">{label}</div>
    </div>
  );
}

// Empty State Component
export function EmptyState({ onCreateClick }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
      <BookOpen size={64} className="mx-auto text-gray-300 mb-4" />
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        No Syllabi Yet
      </h3>
      <p className="text-gray-500 mb-6">
        Create your first syllabus to get started
      </p>
      <button
        onClick={onCreateClick}
        className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors cursor-pointer inline-flex items-center gap-2"
      >
        <BookOpen size={18} />
        Create Syllabus
      </button>
    </div>
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-indigo-50 p-3 rounded-lg">
                <BookOpen size={24} className="text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
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
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 cursor-pointer transition-colors"
          >
            <UserPlus size={16} />
            Add Topic
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Overall Progress
            </span>
            <span className="text-sm font-semibold text-indigo-600">
              {completedTopics}/{totalTopics} Topics ({progress}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              style={{ width: `${progress}%` }}
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
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
        <div className="p-6 bg-gray-50 space-y-3">
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
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <button
          onClick={onToggleExpand}
          className="w-full flex items-center justify-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer transition-colors"
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
    </div>
  );
}

// Topic Card Component
export function TopicCard({ topic, onAssign }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case "Completed":
        return {
          icon: <CheckCircle2 size={16} />,
          bg: "bg-green-50",
          text: "text-green-700",
          border: "border-green-200",
        };
      case "In Progress":
        return {
          icon: <Clock size={16} />,
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200",
        };
      default:
        return {
          icon: <AlertCircle size={16} />,
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
    <div className={`${config.bg} border ${config.border} rounded-lg p-4`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 mb-1">{topic.title}</h4>
          {topic.description && (
            <p className="text-sm text-gray-600">{topic.description}</p>
          )}
        </div>
        <div
          className={`px-3 py-1 rounded-lg ${config.bg} ${config.text} border ${config.border} flex items-center gap-2 font-medium text-sm`}
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
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors"
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden"
      >
        <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-white hover:bg-indigo-700 p-2 rounded-lg transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
