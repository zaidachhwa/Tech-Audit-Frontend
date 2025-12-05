// src/components/teacher/TeacherSyllabusDashboard.jsx

import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";

export default function TeacherSyllabusDashboard() {
  const { user, logout } = useAuth();

  // Topics are batch-specific BatchTopic documents returned by:
  // GET /syllabus/batch-topics?batchId=...&syllabusId=...
  const [topics, setTopics] = useState([]);

  // batchesWithSyllabi contains full batch info + assignedSyllabi array
  // fetched from backend: GET /syllabus/batches-with-syllabi
  const [batchesWithSyllabi, setBatchesWithSyllabi] = useState([]);
  const [batches, setBatches] = useState([]); // simplified list for select
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
    // Fetch batches along with their assigned syllabi
    fetchBatchesWithSyllabi();
  }, []);

  useEffect(() => {
    // When selected batch changes, update the assigned syllabus options
    if (!selectedBatchId) {
      setAssignedSyllabiForBatch([]);
      setSelectedBatchSyllabusId("");
      setTopics([]);
      return;
    }

    const batchObj = batchesWithSyllabi.find((b) => b._id === selectedBatchId);
    const assigned = batchObj?.assignedSyllabi || [];
    setAssignedSyllabiForBatch(assigned);

    // If there's exactly one assigned syllabus, auto-select it (convenience)
    if (assigned.length === 1) {
      const id = assigned[0]._id;
      setSelectedBatchSyllabusId(id);
      // fetch topics for this batch-syllabus
      fetchTopicsForBatchSyllabus(selectedBatchId, id);
    } else {
      // clear previous selection / topics
      setSelectedBatchSyllabusId("");
      setTopics([]);
    }
  }, [selectedBatchId, batchesWithSyllabi]);

  useEffect(() => {
    // When selected batch-syllabus changes, fetch topics
    if (selectedBatchId && selectedBatchSyllabusId) {
      fetchTopicsForBatchSyllabus(selectedBatchId, selectedBatchSyllabusId);
    }
  }, [selectedBatchSyllabusId, selectedBatchId]);

  // Fetch batches with their assigned syllabi (admin-provided endpoint)
  const fetchBatchesWithSyllabi = async () => {
    try {
      setLoading(true);
      const res = await API.get("/syllabus/assigned-syllabi");
      const fetched = res.data?.batches || [];
      setBatchesWithSyllabi(fetched);

      // also prepare a simple batches array for the first select
      const simple = fetched.map((b) => ({
        _id: b._id,
        batch_name: b.batch_name,
        batch_no: b.batch_no,
        studentsCount: b.students?.length || 0,
      }));
      setBatches(simple);

      // If only one batch exists, auto-select it (friendly)
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

  // Fetch topics for a given batch & assigned syllabus (BatchTopic documents)
  const fetchTopicsForBatchSyllabus = async (batchId, batchSyllabusId) => {
    try {
      setLoadingTopics(true);

      // The backend expects syllabusId (template) and batchId for batch-topics
      // But our batches-with-syllabi array contains assignedSyllabi where each has syllabus field populated.
      // We need the syllabus template id (bs.syllabus._id) to call /batch-topics.
      // Find batchSyllabus object in batch list to extract syllabus template id safely.
      const batchObj = batchesWithSyllabi.find((b) => b._id === batchId);
      if (!batchObj) {
        throw new Error("Selected batch not found");
      }

      const bsObj =
        batchObj.assignedSyllabi?.find((bs) => {
          // bs._id is the BatchSyllabus document id
          return String(bs._id) === String(batchSyllabusId);
        }) || null;

      if (!bsObj) {
        // Safety: if not found, try to use batchSyllabusId as the syllabus template id
        // but this is unlikely; we'll throw a helpful message
        throw new Error(
          "Assignment info not found for selected batch. Please refresh."
        );
      }

      // bsObj.syllabus may be an object (populated) or an ObjectId. Normalize:
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

      // API returns topics (BatchTopic docs) with assignedTo populated in controller
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

  // Mark a batch-topic (BatchTopic) as completed
  const markComplete = async (topicId) => {
    try {
      await API.patch(`/syllabus/topic/${topicId}/complete`);
      toast.success("Topic marked as completed! 🎉");
      // refresh currently selected batch-syllabus topics
      if (selectedBatchId && selectedBatchSyllabusId) {
        fetchTopicsForBatchSyllabus(selectedBatchId, selectedBatchSyllabusId);
      }
    } catch (err) {
      console.error("Failed to mark complete:", err);
      toast.error("Failed to mark complete");
    }
  };

  // Save teacher remark on batch-topic
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

  // Filter & sort logic (same as before)
  const getFilteredTopics = () => {
    let filtered = [...topics];

    if (filterStatus !== "all") {
      filtered = filtered.filter((t) => t.completionStatus === filterStatus);
    }

    filtered.sort((a, b) => {
      if (sortBy === "dueDate") {
        // handle missing dueDate gracefully
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

  // Stats computed from the topics currently displayed (batch-syllabus scope)
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-4 md:p-6">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl shadow-xl p-6 md:p-8 text-white"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Heading */}
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl shadow-lg">
                <BookOpen size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  Teacher Dashboard
                </h1>
                <p className="text-purple-100 mt-1">
                  Welcome back,{" "}
                  <span className="font-semibold">{user?.name}</span>
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  // refresh topics for current selection, otherwise refresh batches
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
                className="flex-1 md:flex-none bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw
                  size={18}
                  className={loading || loadingTopics ? "animate-spin" : ""}
                />
                Refresh
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={logout}
                className="flex-1 md:flex-none bg-white text-purple-600 px-4 py-2 rounded-xl font-semibold hover:bg-gray-100 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut size={18} />
                Logout
              </motion.button>
            </div>
          </div>
        </motion.header>

        {/* ============================ */}
        {/*   BATCH + ASSIGNED SYLLABUS SELECTORS   */}
        {/* ============================ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-md p-5 rounded-3xl shadow-md"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 bg gap-4">
            {/* Batch selector */}
            <div>
              <label className="text-gray-700 font-semibold mb-2 block">
                Select Batch
              </label>
              <div className="relative">
                <ChevronDown
                  size={18}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none cursor-pointer"
                >
                  <option value="">Select a batch...</option>
                  {batches.map((batch) => (
                    <option key={batch._id} value={batch._id}>
                      {batch.batch_name} (#{batch.batch_no}) —{" "}
                      {batch.studentsCount} students
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assigned Syllabus selector */}
            <div>
              <label className="text-gray-700 font-semibold mb-2 block">
                Assigned Syllabus (for selected batch)
              </label>
              <div className="relative">
                <ChevronDown
                  size={18}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <select
                  value={selectedBatchSyllabusId}
                  onChange={(e) => setSelectedBatchSyllabusId(e.target.value)}
                  disabled={
                    !selectedBatchId || assignedSyllabiForBatch.length === 0
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none cursor-pointer"
                >
                  <option value="">
                    {selectedBatchId
                      ? assignedSyllabiForBatch.length === 0
                        ? "No assigned syllabi for this batch"
                        : "Select an assigned syllabus..."
                      : "Select a batch first"}
                  </option>

                  {assignedSyllabiForBatch.map((bs) => {
                    // bs.syllabus may be populated (object) or an id — handle both
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
              </div>
            </div>
          </div>
        </motion.div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            label="Total Topics"
            value={stats.total}
            icon={<BookOpen size={20} />}
            color="from-blue-500 to-cyan-500"
            delay={0}
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            icon={<CheckCircle2 size={20} />}
            color="from-emerald-500 to-green-500"
            delay={0.1}
          />
          <StatCard
            label="In Progress"
            value={stats.inProgress}
            icon={<Clock size={20} />}
            color="from-orange-500 to-amber-500"
            delay={0.2}
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            icon={<AlertCircle size={20} />}
            color="from-red-400 to-pink-500"
            delay={0.3}
          />
        </div>

        {/* PROGRESS BAR */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-6 border border-white/30"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-3 rounded-xl">
                <TrendingUp size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">
                  Overall Progress
                </h3>
                <p className="text-sm text-gray-600">
                  Your completion rate (current selection)
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-purple-600">
                {completionRate}%
              </div>
              <div className="text-xs text-gray-600">
                {stats.completed} of {stats.total}
              </div>
            </div>
          </div>

          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${completionRate}%` }}
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
            />
          </div>
        </motion.div>

        {/* TOPICS SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-md rounded-3xl shadow-lg border border-white/30 overflow-hidden"
        >
          {/* Filters */}
          <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-indigo-50">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold flex gap-2 items-center">
                  <FileText className="text-purple-600" /> My Topics
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredTopics.length} topics found
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {/* Filter */}
                <div className="relative">
                  <Filter
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-xl border-2 border-gray-200 bg-white text-sm focus:border-purple-500"
                  >
                    <option value="all">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* Sort */}
                <div className="relative">
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="pr-10 pl-4 py-2 rounded-xl border-2 border-gray-200 bg-white text-sm focus:border-purple-500 appearance-none"
                  >
                    <option value="dueDate">Sort by Due Date</option>
                    <option value="title">Sort by Title</option>
                    <option value="status">Sort by Status</option>
                  </select>
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
                <AnimatePresence mode="popLayout">
                  {filteredTopics.map((topic, index) => (
                    <TopicCard
                      key={topic._id}
                      topic={topic}
                      index={index}
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
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* REMARK MODAL */}
      <AnimatePresence>
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
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------- */
/* UI HELPER COMPONENTS (kept same styling / logic as original)  */
/* ------------------------------------------------------------- */

function StatCard({ label, value, icon, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`bg-gradient-to-br ${color} rounded-2xl shadow-lg p-4 md:p-5 text-white`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="bg-white/20 p-2 rounded-xl">{icon}</div>
        <div className="text-3xl md:text-4xl font-bold">{value}</div>
      </div>
      <div className="text-sm font-medium opacity-90">{label}</div>
    </motion.div>
  );
}

function LoadingBlock() {
  return (
    <div className="py-20 flex flex-col items-center justify-center">
      <RefreshCw className="animate-spin text-purple-600 mb-4" size={48} />
      <p className="text-gray-600">Loading topics...</p>
    </div>
  );
}

function EmptyState({ filterStatus, onRefresh }) {
  return (
    <div className="py-16 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <BookOpen size={48} className="text-purple-600" />
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {filterStatus === "all"
            ? "No Topics Assigned"
            : `No ${filterStatus} Topics`}
        </h3>
        <p className="text-gray-600 mb-6">
          {filterStatus === "all"
            ? "You don't have any topics assigned for the selected batch & syllabus."
            : `No topics with "${filterStatus}" status.`}
        </p>

        <button
          onClick={onRefresh}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 mx-auto"
        >
          <RefreshCw size={18} /> Refresh Topics
        </button>
      </motion.div>
    </div>
  );
}

/* Remark modal (same UX as before) */
function RemarkModal({ topic, remarkText, setRemarkText, onClose, onSubmit }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden z-10"
      >
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 flex justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">
              {remarkText ? "Edit Remark" : "Add Remark"}
            </h3>
            <p className="text-sm text-purple-100 mt-1">{topic.title}</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-xl"
          >
            <X size={24} />
          </motion.button>
        </div>

        <div className="p-6">
          <label className="block text-sm font-semibold mb-2">
            Your Remark
          </label>

          <textarea
            rows={8}
            value={remarkText}
            onChange={(e) => setRemarkText(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 resize-none"
            placeholder="Write your remarks..."
          />

          <div className="flex gap-3 pt-4">
            <button
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 hover:bg-gray-50"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
              onClick={onSubmit}
              disabled={!remarkText.trim()}
            >
              Save Remark
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* Topic Card (keeps same design/logic as your original) */
function TopicCard({
  topic,
  index,
  expanded,
  onToggleExpand,
  onMarkComplete,
  onOpenRemark,
}) {
  const getStatusConfig = (status) => {
    switch (status) {
      case "Completed":
        return {
          bg: "from-green-50 to-emerald-50",
          border: "border-green-200",
          icon: <CheckCircle2 size={20} className="text-green-600" />,
          badge: "bg-green-100 text-green-700 border-green-200",
        };
      case "In Progress":
        return {
          bg: "from-blue-50 to-cyan-50",
          border: "border-blue-200",
          icon: <Clock size={20} className="text-blue-600" />,
          badge: "bg-blue-100 text-blue-700 border-blue-200",
        };
      default:
        return {
          bg: "from-amber-50 to-orange-50",
          border: "border-amber-200",
          icon: <AlertCircle size={20} className="text-amber-600" />,
          badge: "bg-amber-100 text-amber-700 border-amber-200",
        };
    }
  };

  const config = getStatusConfig(topic.completionStatus);
  const dueDate = topic.dueDate ? new Date(topic.dueDate) : null;
  const isOverdue =
    dueDate && dueDate < new Date() && topic.completionStatus !== "Completed";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-gradient-to-br ${config.bg} border-2 ${config.border} rounded-2xl overflow-hidden hover:shadow-lg transition-all`}
    >
      <div className="p-4 md:p-5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 bg-white rounded-xl p-3 shadow-sm">
            {config.icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-lg mb-1">
                  {topic.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {topic.syllabus?.subject || topic.syllabus || "No syllabus"}
                </p>
              </div>

              <div
                className={`px-3 py-1.5 rounded-lg border-2 ${config.badge} font-semibold text-xs whitespace-nowrap`}
              >
                {topic.completionStatus}
              </div>
            </div>

            {topic.description && (
              <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                {topic.description}
              </p>
            )}

            <div className="flex items-center gap-2 mb-4">
              <Calendar size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600">
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
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
                  Overdue
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {topic.completionStatus !== "Completed" && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onMarkComplete(topic._id)}
                  className="flex-1 md:flex-none bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <CheckCheck size={16} />
                  <span>Mark Complete</span>
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenRemark}
                className="flex-1 md:flex-none bg-white border-2 border-purple-300 text-purple-700 px-4 py-2 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-purple-50 cursor-pointer"
              >
                <Edit size={16} />
                <span>{topic.remarks ? "Edit Remark" : "Add Remark"}</span>
              </motion.button>

              {topic.remarks && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onToggleExpand}
                  className="flex-1 md:flex-none bg-white border-2 border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer"
                >
                  <MessageSquare size={16} />
                  <span>{expanded ? "Hide" : "View"} Remark</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {expanded && topic.remarks && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t-2 border-white/50">
                <div className="bg-white/80 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start gap-2 mb-2">
                    <MessageSquare
                      size={16}
                      className="text-purple-600 mt-1 flex-shrink-0"
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
