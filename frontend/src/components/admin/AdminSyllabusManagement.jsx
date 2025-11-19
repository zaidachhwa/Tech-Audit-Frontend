import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Plus,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  UserPlus,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  FileText,
  Target,
} from "lucide-react";
import {
  EmptyState,
  Modal,
  StatCard,
  SyllabusCard,
} from "./SyllabusComponents";

export default function AdminSyllabusManagement() {
  const [syllabi, setSyllabi] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedSyllabus, setSelectedSyllabus] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [expandedSyllabi, setExpandedSyllabi] = useState(new Set());

  // Form states
  const [syllabusForm, setSyllabusForm] = useState({
    subject: "",
    description: "",
  });

  const [topicForm, setTopicForm] = useState({
    title: "",
    description: "",
    dueDate: "",
  });

  const [assignForm, setAssignForm] = useState({
    teacherId: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [syllabusRes, teacherRes] = await Promise.all([
        API.get("/syllabus/all"),
        API.get("/teachers/list"),
      ]);
      setSyllabi(syllabusRes.data?.syllabi || []);
      setTeachers(teacherRes.data?.teachers || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSyllabus = async (e) => {
    e.preventDefault();
    try {
      await API.post("/syllabus/create", syllabusForm);
      toast.success("Syllabus created successfully!");
      setSyllabusForm({ subject: "", description: "" });
      setShowCreateModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create syllabus");
    }
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    try {
      await API.post("/syllabus/topic", {
        ...topicForm,
        syllabusId: selectedSyllabus._id,
      });
      toast.success("Topic added successfully!");
      setTopicForm({ title: "", description: "", dueDate: "" });
      setShowTopicModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add topic");
    }
  };

  const handleAssignTopic = async (e) => {
    e.preventDefault();
    try {
      await API.patch("/syllabus/assign-topic", {
        topicId: selectedTopic._id,
        teacherId: assignForm.teacherId,
      });
      toast.success("Topic assigned to teacher!");
      setAssignForm({ teacherId: "" });
      setShowAssignModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign topic");
    }
  };

  const toggleExpanded = (syllabusId) => {
    setExpandedSyllabi((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(syllabusId)) {
        newSet.delete(syllabusId);
      } else {
        newSet.add(syllabusId);
      }
      return newSet;
    });
  };

  const calculateProgress = (topics) => {
    if (!topics || topics.length === 0) return 0;
    const completed = topics.filter(
      (t) => t.completionStatus === "Completed"
    ).length;
    return Math.round((completed / topics.length) * 100);
  };

  const stats = {
    total: syllabi.length,
    totalTopics: syllabi.reduce((sum, s) => sum + (s.topics?.length || 0), 0),
    completed: syllabi.reduce(
      (sum, s) =>
        sum +
        (s.topics?.filter((t) => t.completionStatus === "Completed").length ||
          0),
      0
    ),
    teachers: teachers.length,
  };

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
              <h1 className="text-3xl font-bold mb-2">Syllabus Management</h1>
              <p className="text-purple-100">
                Create syllabi, manage topics, and track progress
              </p>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchData}
                disabled={loading}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw
                  size={18}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="bg-white text-purple-600 hover:bg-gray-100 px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2 cursor-pointer"
              >
                <Plus size={18} />
                Create Syllabus
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={<BookOpen size={20} />}
            label="Total Syllabi"
            value={stats.total}
            color="from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={<FileText size={20} />}
            label="Total Topics"
            value={stats.totalTopics}
            color="from-purple-500 to-pink-500"
          />
          <StatCard
            icon={<CheckCircle2 size={20} />}
            label="Completed Topics"
            value={stats.completed}
            color="from-green-500 to-emerald-500"
          />
          <StatCard
            icon={<Users size={20} />}
            label="Teachers"
            value={stats.teachers}
            color="from-orange-500 to-amber-500"
          />
        </div>

        {/* Syllabi List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="animate-spin text-purple-600" size={40} />
          </div>
        ) : syllabi.length === 0 ? (
          <EmptyState onCreateClick={() => setShowCreateModal(true)} />
        ) : (
          <div className="space-y-4">
            {syllabi.map((syllabus, index) => (
              <SyllabusCard
                key={syllabus._id}
                syllabus={syllabus}
                index={index}
                expanded={expandedSyllabi.has(syllabus._id)}
                onToggleExpand={() => toggleExpanded(syllabus._id)}
                onAddTopic={() => {
                  setSelectedSyllabus(syllabus);
                  setShowTopicModal(true);
                }}
                onAssignTopic={(topic) => {
                  setSelectedTopic(topic);
                  setShowAssignModal(true);
                }}
                calculateProgress={calculateProgress}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Syllabus Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <Modal
            title="Create New Syllabus"
            onClose={() => setShowCreateModal(false)}
          >
            <form onSubmit={handleCreateSyllabus} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  placeholder="e.g., React.js Advanced"
                  value={syllabusForm.subject}
                  onChange={(e) =>
                    setSyllabusForm({
                      ...syllabusForm,
                      subject: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Describe the syllabus..."
                  value={syllabusForm.description}
                  onChange={(e) =>
                    setSyllabusForm({
                      ...syllabusForm,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 cursor-pointer"
                >
                  Create Syllabus
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* Add Topic Modal */}
      <AnimatePresence>
        {showTopicModal && selectedSyllabus && (
          <Modal
            title={`Add Topic to ${selectedSyllabus.subject}`}
            onClose={() => setShowTopicModal(false)}
          >
            <form onSubmit={handleAddTopic} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Topic Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Hooks and State Management"
                  value={topicForm.title}
                  onChange={(e) =>
                    setTopicForm({ ...topicForm, title: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Describe the topic..."
                  value={topicForm.description}
                  onChange={(e) =>
                    setTopicForm({ ...topicForm, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={topicForm.dueDate}
                  onChange={(e) =>
                    setTopicForm({ ...topicForm, dueDate: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none cursor-pointer"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowTopicModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 cursor-pointer"
                >
                  Add Topic
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* Assign Topic Modal */}
      <AnimatePresence>
        {showAssignModal && selectedTopic && (
          <Modal
            title={`Assign "${selectedTopic.title}" to Teacher`}
            onClose={() => setShowAssignModal(false)}
          >
            <form onSubmit={handleAssignTopic} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Teacher *
                </label>
                <select
                  value={assignForm.teacherId}
                  onChange={(e) => setAssignForm({ teacherId: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none cursor-pointer"
                >
                  <option value="">Choose a teacher...</option>
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name} ({teacher.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 cursor-pointer"
                >
                  Assign Teacher
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
