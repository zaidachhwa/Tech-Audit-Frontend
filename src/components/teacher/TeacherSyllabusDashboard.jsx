// src/components/teacher/TeacherSyllabusDashboard.jsx

import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import {
  LogOut,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Edit,
  RefreshCw,
  X,
  CheckCheck,
  MessageSquare,
  Filter,
  TrendingUp,
  FileText,
  ChevronDown,
  Users,
  User,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function TeacherSyllabusDashboard() {
  const { user, logout } = useAuth();

  const [topics, setTopics] = useState([]);
  const [batchesWithSyllabi, setBatchesWithSyllabi] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [assignedSyllabiForBatch, setAssignedSyllabiForBatch] = useState([]);
  const [selectedBatchSyllabusId, setSelectedBatchSyllabusId] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);

  const [remarkText, setRemarkText] = useState("");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showRemark, setShowRemark] = useState(false);

  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");
  const [expandedTopic, setExpandedTopic] = useState(null);

  useEffect(() => {
    fetchBatchesWithSyllabi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedBatchId) {
      setAssignedSyllabiForBatch([]);
      setSelectedBatchSyllabusId("");
      setTopics([]);
      return;
    }

    const batchObj = batchesWithSyllabi.find((b) => b._id === selectedBatchId);
    const assigned = batchObj?.assignedSyllabi || [];
    setAssignedSyllabiForBatch(assigned);

    if (assigned.length === 1) {
      const id = assigned[0]._id;
      setSelectedBatchSyllabusId(id);
      fetchTopicsForBatchSyllabus(selectedBatchId, id);
    } else {
      setSelectedBatchSyllabusId("");
      setTopics([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBatchId, batchesWithSyllabi]);

  useEffect(() => {
    if (selectedBatchId && selectedBatchSyllabusId) {
      fetchTopicsForBatchSyllabus(selectedBatchId, selectedBatchSyllabusId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBatchSyllabusId, selectedBatchId]);

  const fetchBatchesWithSyllabi = async () => {
    try {
      setLoading(true);
      const res = await API.get("/syllabus/assigned-syllabi");
      const fetched = res.data?.batches || [];
      setBatchesWithSyllabi(fetched);

      const simple = fetched.map((b) => ({
        _id: b._id,
        batch_name: b.batch_name,
        batch_no: b.batch_no,
        studentsCount: b.students?.length || 0,
      }));
      setBatches(simple);

      if (simple.length === 1) {
        setSelectedBatchId(simple[0]._id);
      }
    } catch (err) {
      console.error("Failed to fetch batches-with-syllabi:", err);
      toast.error("Failed to load batches");
    } finally {
      setLoading(false);
    }
  };

  const fetchTopicsForBatchSyllabus = async (batchId, batchSyllabusId) => {
    try {
      setLoadingTopics(true);

      const batchObj = batchesWithSyllabi.find((b) => b._id === batchId);
      if (!batchObj) {
        throw new Error("Selected batch not found");
      }

      const bsObj =
        batchObj.assignedSyllabi?.find((bs) => {
          return String(bs._id) === String(batchSyllabusId);
        }) || null;

      if (!bsObj) {
        throw new Error(
          "Assignment info not found for selected batch. Please refresh."
        );
      }

      const syllabusTemplateId =
        typeof bsObj.syllabus === "object"
          ? bsObj.syllabus._id
          : bsObj.syllabus;

      if (!syllabusTemplateId) {
        throw new Error("Syllabus template id missing for this assignment");
      }

      const res = await API.get(
        `/syllabus/batch-topics-teacher?batchId=${batchId}&syllabusId=${syllabusTemplateId}`
      );

      const fetchedTopics = res.data?.topics || [];
      setTopics(fetchedTopics);
    } catch (err) {
      console.error("Failed to fetch batch topics:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load topics for this assignment";
      toast.error(msg);
      setTopics([]);
    } finally {
      setLoadingTopics(false);
    }
  };

  const markComplete = async (topicId) => {
    try {
      await API.patch(`/syllabus/topic/${topicId}/complete`);
      toast.success("Topic marked as completed!");
      if (selectedBatchId && selectedBatchSyllabusId) {
        fetchTopicsForBatchSyllabus(selectedBatchId, selectedBatchSyllabusId);
      }
    } catch (err) {
      console.error("Failed to mark complete:", err);
      toast.error("Failed to mark complete");
    }
  };

  const addRemark = async () => {
    if (!selectedTopic) return;
    if (!remarkText.trim()) {
      toast.error("Please enter a remark");
      return;
    }
    try {
      await API.patch(`/syllabus/topic/${selectedTopic._id}/remark`, {
        remark: remarkText,
      });
      toast.success("Remark saved successfully!");
      setShowRemark(false);
      setRemarkText("");
      setSelectedTopic(null);

      if (selectedBatchId && selectedBatchSyllabusId) {
        fetchTopicsForBatchSyllabus(selectedBatchId, selectedBatchSyllabusId);
      }
    } catch (err) {
      console.error("Failed to save remark:", err);
      toast.error("Failed to save remark");
    }
  };

  const getFilteredTopics = () => {
    let filtered = [...topics];

    if (filterStatus !== "all") {
      filtered = filtered.filter((t) => t.completionStatus === filterStatus);
    }

    filtered.sort((a, b) => {
      if (sortBy === "dueDate") {
        const da = a.dueDate ? new Date(a.dueDate) : null;
        const db = b.dueDate ? new Date(b.dueDate) : null;
        if (!da && !db) return 0;
        if (!da) return 1;
        if (!db) return -1;
        return da - db;
      }
      if (sortBy === "title")
        return (a.title || "").localeCompare(b.title || "");
      if (sortBy === "status") {
        const order = { Pending: 0, "In Progress": 1, Completed: 2 };
        return order[a.completionStatus] - order[b.completionStatus];
      }
      return 0;
    });

    return filtered;
  };

  const filteredTopics = getFilteredTopics();

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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <header className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                <BookOpen size={28} className="text-emerald-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Teacher Dashboard
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Welcome back, <span className="font-medium">{user?.name}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <Link to="/teacher/profile" className="flex-1 md:flex-none">
                <button className="w-full bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2">
                  <User size={18} />
                  Profile
                </button>
              </Link>

              <button
                onClick={() => {
                  if (selectedBatchId && selectedBatchSyllabusId) {
                    fetchTopicsForBatchSyllabus(
                      selectedBatchId,
                      selectedBatchSyllabusId
                    );
                  } else {
                    fetchBatchesWithSyllabi();
                  }
                }}
                disabled={loading || loadingTopics}
                className="flex-1 md:flex-none bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RefreshCw
                  size={18}
                  className={loading || loadingTopics ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <button
                onClick={logout}
                className="flex-1 md:flex-none bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* BATCH SELECTORS */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-gray-700 font-medium mb-2 flex items-center gap-2">
                <Users size={16} className="text-emerald-600" />
                Select Batch
              </label>
              <div className="relative">
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none cursor-pointer appearance-none"
                >
                  <option value="">Select a batch...</option>
                  {batches.map((batch) => (
                    <option key={batch._id} value={batch._id}>
                      {batch.batch_name} (#{batch.batch_no}) — {batch.studentsCount} students
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-700 font-medium mb-2 flex items-center gap-2">
                <BookOpen size={16} className="text-emerald-600" />
                Assigned Syllabus
              </label>
              <div className="relative">
                <select
                  value={selectedBatchSyllabusId}
                  onChange={(e) => setSelectedBatchSyllabusId(e.target.value)}
                  disabled={
                    !selectedBatchId || assignedSyllabiForBatch.length === 0
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none cursor-pointer appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {selectedBatchId
                      ? assignedSyllabiForBatch.length === 0
                        ? "No assigned syllabi for this batch"
                        : "Select an assigned syllabus..."
                      : "Select a batch first"}
                  </option>

                  {assignedSyllabiForBatch.map((bs) => {
                    const subject =
                      typeof bs.syllabus === "object"
                        ? bs.syllabus.subject
                        : bs.syllabus;
                    const topicsCount =
                      typeof bs.syllabus === "object"
                        ? bs.syllabus.topics?.length || 0
                        : "";
                    return (
                      <option key={bs._id} value={bs._id}>
                        {subject} {topicsCount ? `(${topicsCount} topics)` : ""}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Topics"
            value={stats.total}
            icon={<BookOpen size={20} />}
            bgColor="bg-white"
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50"
            borderColor="border-gray-200"
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            icon={<CheckCircle2 size={20} />}
            bgColor="bg-white"
            iconColor="text-green-600"
            iconBgColor="bg-green-50"
            borderColor="border-gray-200"
          />
          <StatCard
            label="In Progress"
            value={stats.inProgress}
            icon={<Clock size={20} />}
            bgColor="bg-white"
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
            borderColor="border-gray-200"
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            icon={<AlertCircle size={20} />}
            bgColor="bg-white"
            iconColor="text-orange-600"
            iconBgColor="bg-orange-50"
            borderColor="border-gray-200"
          />
        </div>

        {/* PROGRESS BAR */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                <TrendingUp size={24} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Overall Progress</h3>
                <p className="text-sm text-gray-600">Your completion rate</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-emerald-600">
                {completionRate}%
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {stats.completed} of {stats.total} topics
              </div>
            </div>
          </div>

          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>

          {completionRate === 100 && stats.total > 0 && (
            <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 font-medium text-sm">
              <CheckCircle2 size={20} />
              Congratulations! All topics completed!
            </div>
          )}
        </div>

        {/* TOPICS SECTION */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="p-6 border-b bg-gray-50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold flex gap-2 items-center text-gray-900">
                  <FileText className="text-emerald-600" size={24} />
                  My Topics
                </h2>
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                  <BarChart3 size={14} />
                  {filteredTopics.length} topics found
                </p>
              </div>

              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                  <Filter
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="relative flex-1 md:flex-none">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none appearance-none"
                  >
                    <option value="dueDate">Sort by Due Date</option>
                    <option value="title">Sort by Title</option>
                    <option value="status">Sort by Status</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Topic List */}
          <div className="p-6">
            {loadingTopics ? (
              <LoadingBlock />
            ) : filteredTopics.length === 0 ? (
              <EmptyState
                filterStatus={filterStatus}
                onRefresh={() => {
                  if (selectedBatchId && selectedBatchSyllabusId) {
                    fetchTopicsForBatchSyllabus(
                      selectedBatchId,
                      selectedBatchSyllabusId
                    );
                  } else {
                    fetchBatchesWithSyllabi();
                  }
                }}
              />
            ) : (
              <div className="space-y-4">
                {filteredTopics.map((topic) => (
                  <TopicCard
                    key={topic._id}
                    topic={topic}
                    expanded={expandedTopic === topic._id}
                    onToggleExpand={() =>
                      setExpandedTopic(
                        expandedTopic === topic._id ? null : topic._id
                      )
                    }
                    onMarkComplete={markComplete}
                    onOpenRemark={() => {
                      setSelectedTopic(topic);
                      setRemarkText(topic.remarks || "");
                      setShowRemark(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* REMARK MODAL */}
      {showRemark && selectedTopic && (
        <RemarkModal
          topic={selectedTopic}
          remarkText={remarkText}
          setRemarkText={setRemarkText}
          onClose={() => {
            setShowRemark(false);
            setRemarkText("");
            setSelectedTopic(null);
          }}
          onSubmit={addRemark}
        />
      )}
    </div>
  );
}

/* HELPER COMPONENTS */

function StatCard({ label, value, icon, bgColor, iconColor, iconBgColor, borderColor }) {
  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-5 shadow-sm`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`${iconBgColor} p-2.5 rounded-lg border ${borderColor}`}>
          <div className={iconColor}>{icon}</div>
        </div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </div>
      <div className="text-sm font-medium text-gray-700">{label}</div>
    </div>
  );
}

function LoadingBlock() {
  return (
    <div className="py-20 flex flex-col items-center justify-center">
      <RefreshCw className="animate-spin text-emerald-600 mb-4" size={48} />
      <p className="text-gray-600 font-medium">Loading topics...</p>
    </div>
  );
}

function EmptyState({ filterStatus, onRefresh }) {
  return (
    <div className="py-16 text-center">
      <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 border border-gray-200">
        <BookOpen size={48} className="text-gray-400" />
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {filterStatus === "all"
          ? "No Topics Assigned"
          : `No ${filterStatus} Topics`}
      </h3>
      <p className="text-gray-600 mb-6 text-sm">
        {filterStatus === "all"
          ? "You don't have any topics assigned for the selected batch & syllabus."
          : `No topics with "${filterStatus}" status.`}
      </p>

      <button
        onClick={onRefresh}
        className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 mx-auto transition shadow-sm"
      >
        <RefreshCw size={18} /> Refresh Topics
      </button>
    </div>
  );
}

function RemarkModal({ topic, remarkText, setRemarkText, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-2xl shadow-lg border border-gray-200">
        <div className="bg-emerald-500 px-6 py-4 flex justify-between items-center rounded-t-lg">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare size={20} />
              {remarkText ? "Edit Remark" : "Add Remark"}
            </h3>
            <p className="text-sm text-white/90 mt-1">{topic.title}</p>
          </div>

          <button
            onClick={onClose}
            className="text-white hover:bg-emerald-600 p-2 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <label className="flex text-sm font-medium mb-2 text-gray-700">
            Your Remark
          </label>

          <textarea
            rows={8}
            value={remarkText}
            onChange={(e) => setRemarkText(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 resize-none outline-none"
            placeholder="Write your remarks here..."
          />

          <div className="flex gap-3 pt-4">
            <button
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 font-medium transition"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              onClick={onSubmit}
              disabled={!remarkText.trim()}
            >
              Save Remark
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopicCard({
  topic,
  expanded,
  onToggleExpand,
  onMarkComplete,
  onOpenRemark,
}) {
  const getStatusConfig = (status) => {
    switch (status) {
      case "Completed":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          icon: <CheckCircle2 size={20} className="text-green-600" />,
          badge: "bg-green-100 text-green-700 border-green-200",
        };
      case "In Progress":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          icon: <Clock size={20} className="text-blue-600" />,
          badge: "bg-blue-100 text-blue-700 border-blue-200",
        };
      default:
        return {
          bg: "bg-orange-50",
          border: "border-orange-200",
          icon: <AlertCircle size={20} className="text-orange-600" />,
          badge: "bg-orange-100 text-orange-700 border-orange-200",
        };
    }
  };

  const config = getStatusConfig(topic.completionStatus);
  const dueDate = topic.dueDate ? new Date(topic.dueDate) : null;
  const isOverdue =
    dueDate && dueDate < new Date() && topic.completionStatus !== "Completed";

  return (
    <div className={`${config.bg} border ${config.border} rounded-lg p-5`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 bg-white p-2.5 rounded-lg border border-gray-200">
          {config.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg mb-1">
                {topic.title}
              </h3>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <BookOpen size={14} />
                {topic.syllabus?.subject || topic.syllabus || "No syllabus"}
              </p>
            </div>

            <div
              className={`px-3 py-1.5 rounded-lg border ${config.badge} font-semibold text-xs whitespace-nowrap`}
            >
              {topic.completionStatus}
            </div>
          </div>

          {topic.description && (
            <p className="text-sm text-gray-700 mb-4 line-clamp-2">
              {topic.description}
            </p>
          )}

          <div className="flex items-center gap-2 mb-4">
            <Calendar size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600 font-medium">
              Due:{" "}
              {dueDate
                ? dueDate.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "N/A"}
            </span>
            {isOverdue && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold border border-red-200">
                Overdue
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {topic.completionStatus !== "Completed" && (
              <button
                onClick={() => onMarkComplete(topic._id)}
                className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition shadow-sm"
              >
                <CheckCheck size={16} />
                <span>Mark Complete</span>
              </button>
            )}

            <button
              onClick={onOpenRemark}
              className="flex-1 md:flex-none bg-white hover:bg-gray-50 border border-emerald-300 text-emerald-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition"
            >
              <Edit size={16} />
              <span>{topic.remarks ? "Edit Remark" : "Add Remark"}</span>
            </button>

            {topic.remarks && (
              <button
                onClick={onToggleExpand}
                className="flex-1 md:flex-none bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition"
              >
                <MessageSquare size={16} />
                <span>{expanded ? "Hide" : "View"} Remark</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {expanded && topic.remarks && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-start gap-2 mb-2">
              <MessageSquare
                size={16}
                className="text-emerald-600 mt-0.5 flex-shrink-0"
              />
              <span className="text-sm font-semibold text-gray-700">
                Your Remark:
              </span>
            </div>
            <p className="text-sm text-gray-700 ml-6 leading-relaxed">
              {topic.remarks}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}