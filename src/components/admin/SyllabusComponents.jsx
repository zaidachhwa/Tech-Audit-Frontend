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
    <div className="bg-white border-[1.5px] border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-lg transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="w-[52px] h-[52px] flex items-center justify-center rounded-[14px] bg-[#EFF6FF] text-[#2563EB]">
          {icon}
        </div>
        <div className="text-[28px] font-extrabold text-[#1B2B4B]">
          {value}
        </div>
      </div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-[#64748B]">
        {label}
      </div>
    </div>
  );
}

// Empty State Component
export function EmptyState({ onCreateClick }) {
  return (
    <div className="bg-white border-[1.5px] border-[#E2E8F0] rounded-xl p-12 text-center shadow-sm">
      <BookOpen size={56} className="mx-auto text-[#94A3B8] mb-4" />
      <h3 className="text-[20px] font-bold text-[#1B2B4B] mb-2">
        No Syllabi Yet
      </h3>
      <p className="text-[13px] text-[#64748B] mb-6">
        Create your first syllabus to get started
      </p>
      <button
        onClick={onCreateClick}
        className="bg-[#2563EB] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 inline-flex items-center gap-2"
      >
        <BookOpen size={16} />
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
    <div className="bg-white border-[1.5px] border-[#E2E8F0] rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[#F1F5F9]">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-[#EFF6FF] text-[#2563EB] p-3 rounded-lg">
                <BookOpen size={20} />
              </div>
              <div>
                <h3 className="text-[16px] font-semibold text-[#1B2B4B]">
                  {syllabus.subject}
                </h3>
                {syllabus.description && (
                  <p className="text-[13px] text-[#64748B] mt-1">
                    {syllabus.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onAddTopic}
            className="bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700"
          >
            <UserPlus size={14} />
            Add Topic
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase text-[#64748B]">
              Progress
            </span>
            <span className="text-[13px] font-medium text-[#1B2B4B]">
              {completedTopics}/{totalTopics} ({progress}%)
            </span>
          </div>
          <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
            <div
              style={{ width: `${progress}%` }}
              className="h-full bg-[#2563EB] rounded-full transition-all"
            />
          </div>
        </div>

        {syllabus.assignedTeachers && syllabus.assignedTeachers.length > 0 && (
          <div className="flex items-center gap-2 text-[13px] text-[#64748B]">
            <Users size={14} />
            <span>{syllabus.assignedTeachers.length} Teacher(s)</span>
          </div>
        )}
      </div>

      {/* Topics */}
      {expanded && syllabus.topics && syllabus.topics.length > 0 && (
        <div className="p-6 bg-[#F8FAFC] space-y-3">
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
      <div className="p-4 border-t border-[#F1F5F9]">
        <button
          onClick={onToggleExpand}
          className="w-full flex items-center justify-center gap-2 text-[#2563EB] font-medium text-sm hover:underline"
        >
          {expanded ? (
            <>
              <ChevronUp size={16} />
              Hide Topics
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              View {totalTopics} Topics
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
          bg: "bg-[#ECFDF5]",
          text: "text-[#065F46]",
        };
      case "In Progress":
        return {
          bg: "bg-[#EFF6FF]",
          text: "text-[#1E40AF]",
        };
      default:
        return {
          bg: "bg-[#FEF3C7]",
          text: "text-[#92400E]",
        };
    }
  };

  const config = getStatusConfig(topic.completionStatus);
  const dueDate = topic.dueDate
    ? new Date(topic.dueDate).toLocaleDateString()
    : "N/A";

  return (
    <div className="bg-white border border-[#F1F5F9] rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-[14px] font-semibold text-[#1B2B4B]">
            {topic.title}
          </h4>
          {topic.description && (
            <p className="text-[13px] text-[#64748B]">
              {topic.description}
            </p>
          )}
        </div>

        <span
          className={`px-3 py-[3px] rounded-full text-[12px] font-semibold ${config.bg} ${config.text}`}
        >
          {topic.completionStatus}
        </span>
      </div>

      <div className="flex items-center justify-between text-[13px] text-[#64748B]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{dueDate}</span>
          </div>
          {topic.assignedTo && (
            <div className="flex items-center gap-1">
              <Users size={12} />
              <span>Assigned</span>
            </div>
          )}
        </div>

        {!topic.assignedTo && (
          <button
            onClick={onAssign}
            className="bg-[#2563EB] text-white px-3 py-1.5 rounded-lg text-[12px] font-medium hover:bg-blue-700"
          >
            Assign
          </button>
        )}
      </div>

      {topic.remarks && (
        <div className="mt-3 pt-3 border-t border-[#F1F5F9] text-[13px] text-[#64748B] italic">
          {topic.remarks}
        </div>
      )}
    </div>
  );
}

// Modal Component
export function Modal({ title, children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-[#E2E8F0] rounded-xl w-full max-w-lg shadow-lg"
      >
        <div className="px-6 py-4 border-b border-[#F1F5F9] flex items-center justify-between">
          <h3 className="text-[16px] font-semibold text-[#1B2B4B]">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:bg-[#F8FAFC] p-2 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}