import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Plus,
  Users,
  FileText,
  CheckCircle2,
  RefreshCw,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  X,
  Target,
} from "lucide-react";
import {
  EmptyState,
  Modal,
} from "./SyllabusComponents";
import BatchAssignmentsPanel from "./BatchAssignmentsPanel";

const SearchableSelect = ({ value, onChange, options, placeholder }) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <div
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white cursor-pointer flex justify-between items-center"
        onClick={() => setOpen(!open)}
      >
        <span className={selectedOption ? "text-gray-800" : "text-gray-400"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="text-gray-400 text-xs">▼</span>
      </div>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto p-2 space-y-1">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-gray-100 rounded text-xs bg-slate-50 focus:outline-none mb-1"
            onClick={(e) => e.stopPropagation()}
          />
          {filteredOptions.length === 0 ? (
            <p className="text-xs text-gray-400 p-2">No matching lectures found</p>
          ) : (
            filteredOptions.map(opt => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                  setSearch("");
                }}
                className={`px-3 py-2 rounded text-xs cursor-pointer hover:bg-slate-50 transition ${
                  value === opt.value ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"
                }`}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default function AdminSyllabusManagement() {
  const [syllabi, setSyllabi] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditTopicModal, setShowEditTopicModal] = useState(false);
  const [showAssignTeacherModal, setShowAssignTeacherModal] = useState(false);
  const [showAssignBatchModal, setShowAssignBatchModal] = useState(false);
  const [selectedSyllabus, setSelectedSyllabus] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [expandedSyllabi, setExpandedSyllabi] = useState(new Set());

  const [syllabusForm, setSyllabusForm] = useState({ subject: "", description: "" });
  const [subTitleInput, setSubTitleInput] = useState("");
  const [subDurationInput, setSubDurationInput] = useState("");
  const [topicForm, setTopicForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    duration: 60,
    lectureType: "Normal",
    batchIds: [],
    teacherId: "",
    order: 0,
    status: "active",
    chapterId: "",
    referenceTo: "",
    subLectures: []
  });
  const [assignForm, setAssignForm] = useState({ teacherId: "" });
  const [assignTeacherForm, setAssignTeacherForm] = useState({ teacherId: "" });
  const [assignBatchForm, setAssignBatchForm] = useState({ batchId: "", notes: "", dueDate: "" });
  const [editForm, setEditForm] = useState({ subject: "", description: "" });
  const [editTopicForm, setEditTopicForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    duration: 60,
    lectureType: "Normal",
    batchIds: [],
    teacherId: "",
    order: 0,
    status: "active",
    chapterId: "",
    referenceTo: "",
    subLectures: []
  });
  const [activeTab, setActiveTab] = useState("templates");

  const [chapters, setChapters] = useState([]);
  const [loadingChapters, setLoadingChapters] = useState(false);

  useEffect(() => {
    const targetSyllabusId = selectedSyllabus?._id || selectedTopic?.syllabus;
    if ((showTopicModal || showEditTopicModal) && targetSyllabusId) {
      setLoadingChapters(true);
      API.get(`/chapters?subjectId=${targetSyllabusId}`)
        .then((res) => {
          setChapters(res.data || []);
        })
        .catch(() => {
          setChapters([]);
        })
        .finally(() => {
          setLoadingChapters(false);
        });
    }
  }, [showTopicModal, showEditTopicModal, selectedSyllabus, selectedTopic]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [syllabusRes, teacherRes, batchRes] = await Promise.all([
        API.get("/syllabus/all"),
        API.get("/teachers/list"),
        API.get("/batches/public"),
      ]);
      setSyllabi(syllabusRes.data?.syllabi || []);
      setTeachers(teacherRes.data?.teachers || []);
      setBatches(batchRes.data?.batches || batchRes.data || []);
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
      toast.error(err?.response?.data?.message || "Failed to create syllabus");
    }
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (topicForm.lectureType === "Reference" && !topicForm.referenceTo) {
      return toast.error("Please select the lecture this reference lecture belongs to.");
    }
    try {
      await API.post("/syllabus/topic", { ...topicForm, syllabusId: selectedSyllabus._id });
      toast.success("Lecture added successfully!");
      setTopicForm({
        title: "",
        description: "",
        dueDate: "",
        duration: 60,
        lectureType: "Normal",
        batchIds: [],
        teacherId: "",
        order: 0,
        status: "active",
        chapterId: "",
        referenceTo: "",
        subLectures: []
      });
      setShowTopicModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to add lecture");
    }
  };

  const handleAssignTopic = async (e) => {
    e.preventDefault();
    try {
      await API.patch("/syllabus/assign-topic", { topicId: selectedTopic._id, teacherId: assignForm.teacherId });
      toast.success("Topic assigned to teacher!");
      setAssignForm({ teacherId: "" });
      setShowAssignModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to assign topic");
    }
  };

  const handleAssignTeacherToSyllabus = async (e) => {
    e.preventDefault();
    if (!assignTeacherForm.teacherId) {
      toast.error("Please select a teacher");
      return;
    }
    try {
      await API.patch(`/syllabus/${selectedSyllabus._id}/assign-teacher`, { teacherId: assignTeacherForm.teacherId });
      toast.success("Teacher assigned to syllabus!");
      setAssignTeacherForm({ teacherId: "" });
      setShowAssignTeacherModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to assign teacher");
    }
  };

  const handleAssignToBatch = async (e) => {
    e.preventDefault();
    if (!assignBatchForm.batchId) {
      toast.error("Please select a batch");
      return;
    }
    try {
      await API.post("/syllabus/assign-to-batch", {
        syllabusId: selectedSyllabus._id,
        batchId: assignBatchForm.batchId,
        notes: assignBatchForm.notes,
        dueDate: assignBatchForm.dueDate,
      });
      toast.success("Syllabus assigned to batch successfully!");
      setAssignBatchForm({ batchId: "", notes: "", dueDate: "" });
      setShowAssignBatchModal(false);
      // No need to call fetchData since the batch assignment isn't displayed on this tab, 
      // but we could if we wanted to show assignment counts
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to assign syllabus to batch");
    }
  };

  const handleEditSyllabus = async (e) => {
    e.preventDefault();
    try {
      await API.put(
        `/syllabus/template/${selectedSyllabus._id}`,
        editForm
      );

      toast.success("Syllabus updated successfully!");
      setShowEditModal(false);
      setSelectedSyllabus(null);
      setEditForm({ subject: "", description: "" });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to update syllabus");
    }
  };

  const handleEditTopic = async (e) => {
    e.preventDefault();
    if (editTopicForm.lectureType === "Reference" && !editTopicForm.referenceTo) {
      return toast.error("Please select the lecture this reference lecture belongs to.");
    }
    try {
      await API.put(
        `/syllabus/topic/${selectedTopic._id}`,
        editTopicForm
      );

      toast.success("Topic updated successfully!");
      setShowEditTopicModal(false);
      setSelectedTopic(null);
      setEditTopicForm({
        title: "",
        description: "",
        dueDate: "",
        duration: 60,
        lectureType: "Normal",
        batchIds: [],
        teacherId: "",
        order: 0,
        status: "active",
        chapterId: "",
        referenceTo: "",
        subLectures: []
      });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to update topic");
    }
  };

  const handleDeleteSyllabus = async (syllabusId) => {
    if (!window.confirm("Are you sure you want to delete this syllabus? This action cannot be undone.")) return;

    try {
      await API.delete(`/syllabus/template/${syllabusId}`);
      toast.success("Syllabus deleted successfully!");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to delete syllabus");
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (!confirm("Are you sure you want to delete this topic?")) return;

    try {
      await API.delete(`/syllabus/topic/${topicId}`);
      toast.success("Topic deleted successfully!");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to delete topic");
    }
  };

  const toggleExpanded = (syllabusId) => {
    setExpandedSyllabi((prev) => {
      const newSet = new Set(prev);
      newSet.has(syllabusId) ? newSet.delete(syllabusId) : newSet.add(syllabusId);
      return newSet;
    });
  };

  const calculateProgress = (topics) => {
    if (!topics || topics.length === 0) return 0;
    const completed = topics.filter((t) => t.completionStatus === "Completed").length;
    return Math.round((completed / topics.length) * 100);
  };

  const openEditModal = (syllabus) => {
    setSelectedSyllabus(syllabus);
    setEditForm({ subject: syllabus.subject, description: syllabus.description || "" });
    setShowEditModal(true);
  };

  const openEditTopicModal = (topic) => {
    setSelectedTopic(topic);
    setEditTopicForm({
      title: topic.title,
      description: topic.description || "",
      dueDate: topic.dueDate ? new Date(topic.dueDate).toISOString().split("T")[0] : "",
      duration: topic.duration || topic.lectureDuration || 60,
      lectureType: topic.lectureType || "Normal",
      batchIds: topic.batchIds || [],
      teacherId: topic.assignedTo?._id || topic.assignedTo || "",
      order: topic.order || 0,
      status: topic.status || "active",
      chapterId: topic.chapterId || "",
      subLectures: topic.subLectures || [],
      referenceTo: topic.referenceTo?._id || topic.referenceTo || ""
    });
    setShowEditTopicModal(true);
  };

  const stats = {
    total: syllabi.length,
    totalTopics: syllabi.reduce((sum, s) => sum + (s.topics?.length || 0), 0),
    completed: syllabi.reduce((sum, s) => sum + (s.topics?.filter((t) => t.completionStatus === "Completed").length || 0), 0),
    teachers: teachers.length,
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      Completed: { backgroundColor: "#ECFDF5", color: "#065F46", border: "1px solid #D1FAE5" },
      "In Progress": { backgroundColor: "#EFF6FF", color: "#1E40AF", border: "1px solid #BFDBFE" },
      Pending: { backgroundColor: "#F8FAFC", color: "#64748B", border: "1px solid #E2E8F0" },
    };
    const style = styles[status] || styles.Pending;
    return (
      <span
        className="text-xs px-3 py-1 rounded font-medium inline-block"
        style={{
          ...style,
          borderRadius: "20px",
          padding: "3px 12px",
          fontSize: "12px",
          fontWeight: "600",
        }}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-bold" style={{ color: "#1B2B4B", fontSize: "20px", fontWeight: "700" }}>
            Syllabus Management
          </h1>
          <p className="text-sm mt-1" style={{ color: "#64748B", fontSize: "13px" }}>
            Create syllabi, manage topics, and track progress
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div
            className="flex items-center h-[42px] rounded-lg p-1"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #E2E8F0",
              borderRadius: "8px",
            }}
          >
            <button
              onClick={() => setActiveTab("templates")}
              className="px-4 py-1.5 h-full rounded text-sm font-medium transition"
              style={{
                backgroundColor: activeTab === "templates" ? "#F8FAFC" : "transparent",
                color: activeTab === "templates" ? "#1B2B4B" : "#94A3B8",
                borderRadius: "6px",
                fontWeight: "600",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== "templates") {
                  e.currentTarget.style.color = "#1B2B4B";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== "templates") {
                  e.currentTarget.style.color = "#94A3B8";
                }
              }}
            >
              Templates
            </button>
            <button
              onClick={() => setActiveTab("batch")}
              className="px-4 py-1.5 h-full rounded text-sm font-medium transition"
              style={{
                backgroundColor: activeTab === "batch" ? "#F8FAFC" : "transparent",
                color: activeTab === "batch" ? "#1B2B4B" : "#94A3B8",
                borderRadius: "6px",
                fontWeight: "600",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== "batch") {
                  e.currentTarget.style.color = "#1B2B4B";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== "batch") {
                  e.currentTarget.style.color = "#94A3B8";
                }
              }}
            >
              Batch Assignments
            </button>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-lg transition-colors cursor-pointer"
            style={{
              backgroundColor: "transparent",
              color: "#94A3B8",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#E2E8F0";
              e.currentTarget.style.color = "#1B2B4B";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#94A3B8";
            }}
            title="Refresh"
          >
            <RefreshCw size={18} className={`${loading ? "animate-spin" : ""}`} />
          </button>
          {activeTab === "templates" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="h-[42px] px-4 text-white rounded-lg text-sm font-medium flex items-center gap-2 cursor-pointer transition"
              style={{
                backgroundColor: "#2563EB",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#1E40AF";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#2563EB";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(37, 99, 235, 0.3)";
              }}
            >
              <Plus size={18} />
              Create Syllabus
            </button>
          )}
        </div>
      </div>

      {activeTab === "templates" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
          <div
            className="rounded-xl p-4 hover:shadow-lg transition cursor-pointer"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #E2E8F0",
              borderRadius: "12px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium" style={{ color: "#64748B", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Total Syllabi
              </p>
              <div style={{ backgroundColor: "#EFF6FF", padding: "8px", borderRadius: "8px" }}>
                <BookOpen size={18} style={{ color: "#2563EB" }} />
              </div>
            </div>
            <div className="text-2xl font-bold" style={{ color: "#1B2B4B", fontSize: "28px", fontWeight: "800" }}>
              {stats.total}
            </div>
          </div>
          
          <div
            className="rounded-xl p-4 hover:shadow-lg transition cursor-pointer"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #E2E8F0",
              borderRadius: "12px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium" style={{ color: "#64748B", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Total Topics
              </p>
              <div style={{ backgroundColor: "#F3E8FF", padding: "8px", borderRadius: "8px" }}>
                <FileText size={18} style={{ color: "#A78BFA" }} />
              </div>
            </div>
            <div className="text-2xl font-bold" style={{ color: "#1B2B4B", fontSize: "28px", fontWeight: "800" }}>
              {stats.totalTopics}
            </div>
          </div>

          <div
            className="rounded-xl p-4 hover:shadow-lg transition cursor-pointer"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #E2E8F0",
              borderRadius: "12px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium" style={{ color: "#64748B", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Completed Topics
              </p>
              <div style={{ backgroundColor: "#ECFDF5", padding: "8px", borderRadius: "8px" }}>
                <CheckCircle2 size={18} style={{ color: "#10B981" }} />
              </div>
            </div>
            <div className="text-2xl font-bold" style={{ color: "#1B2B4B", fontSize: "28px", fontWeight: "800" }}>
              {stats.completed}
            </div>
          </div>

          <div
            className="rounded-xl p-4 hover:shadow-lg transition cursor-pointer"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #E2E8F0",
              borderRadius: "12px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium" style={{ color: "#64748B", fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Teachers
              </p>
              <div style={{ backgroundColor: "#FEF3C7", padding: "8px", borderRadius: "8px" }}>
                <Users size={18} style={{ color: "#F59E0B" }} />
              </div>
            </div>
            <div className="text-2xl font-bold" style={{ color: "#1B2B4B", fontSize: "28px", fontWeight: "800" }}>
              {stats.teachers}
            </div>
          </div>
        </div>
      )}

      {activeTab === "templates" ? (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="animate-spin" size={40} style={{ color: "#2563EB" }} />
            </div>
          ) : syllabi.length === 0 ? (
            <EmptyState onCreateClick={() => setShowCreateModal(true)} />
          ) : (
            <div className="space-y-3">
              {syllabi.map((syllabus) => {
                const isExpanded = expandedSyllabi.has(syllabus._id);
                const progress = calculateProgress(syllabus.topics);
                return (
                  <div
                    key={syllabus._id}
                    className="rounded-lg overflow-hidden"
                    style={{
                      backgroundColor: "#FFFFFF",
                      border: "1.5px solid #E2E8F0",
                      borderRadius: "12px",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold" style={{ color: "#1B2B4B" }}>
                              {syllabus.subject}
                            </h3>
                            <span className="text-xs" style={{ color: "#94A3B8" }}>
                              {syllabus.topics?.length || 0} topics
                            </span>
                          </div>
                          {syllabus.description && (
                            <p className="text-sm" style={{ color: "#64748B" }}>
                              {syllabus.description}
                            </p>
                          )}
                          {/* Show assigned teacher */}
                          {syllabus.assignedTeacher && (
                            <div className="mt-2 flex items-center gap-2">
                              <User size={14} style={{ color: "#2563EB" }} />
                              <span className="text-sm font-medium" style={{ color: "#2563EB" }}>
                                {syllabus.assignedTeacher.name}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedSyllabus(syllabus);
                              setShowAssignTeacherModal(true);
                            }}
                            className="px-3 py-1.5 rounded text-sm font-medium transition flex items-center gap-2"
                            style={{
                              backgroundColor: syllabus.assignedTeacher ? "#EFF6FF" : "#F8FAFC",
                              color: syllabus.assignedTeacher ? "#2563EB" : "#64748B",
                              border: "1px solid #E2E8F0",
                              borderRadius: "6px",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#EFF6FF";
                              e.currentTarget.style.color = "#2563EB";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = syllabus.assignedTeacher ? "#EFF6FF" : "#F8FAFC";
                              e.currentTarget.style.color = syllabus.assignedTeacher ? "#2563EB" : "#64748B";
                            }}
                          >
                            <Users size={14} />
                            {syllabus.assignedTeacher ? "Change Teacher" : "Assign Teacher"}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSyllabus(syllabus);
                              setShowAssignBatchModal(true);
                            }}
                            className="px-3 py-1.5 rounded text-sm font-medium transition flex items-center gap-2"
                            style={{
                              backgroundColor: "#F8FAFC",
                              color: "#64748B",
                              border: "1px solid #E2E8F0",
                              borderRadius: "6px",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#EFF6FF";
                              e.currentTarget.style.color = "#2563EB";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#F8FAFC";
                              e.currentTarget.style.color = "#64748B";
                            }}
                            title="Assign to Batch"
                          >
                            <Target size={14} />
                            Assign to Batch
                          </button>
                          <button
                            onClick={() => openEditModal(syllabus)}
                            className="p-1.5 rounded transition"
                            style={{ backgroundColor: "transparent" }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#F8FAFC";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent";
                            }}
                          >
                            <Edit2 size={16} style={{ color: "#94A3B8" }} />
                          </button>
                          <button
                            onClick={() => handleDeleteSyllabus(syllabus._id)}
                            className="p-1.5 rounded transition"
                            style={{ backgroundColor: "transparent" }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#FEF2F2";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent";
                            }}
                          >
                            <Trash2 size={16} style={{ color: "#EF4444" }} />
                          </button>
                          <button
                            onClick={() => toggleExpanded(syllabus._id)}
                            className="p-1.5 rounded transition"
                            style={{ backgroundColor: "transparent" }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#F8FAFC";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent";
                            }}
                          >
                            {isExpanded ? (
                              <ChevronUp size={16} style={{ color: "#94A3B8" }} />
                            ) : (
                              <ChevronDown size={16} style={{ color: "#94A3B8" }} />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className="flex-1 rounded-full h-2 overflow-hidden"
                          style={{
                            backgroundColor: "#E2E8F0",
                            borderRadius: "9999px",
                          }}
                        >
                          <div
                            className="h-full transition-all duration-500"
                            style={{
                              backgroundColor: "#2563EB",
                              width: `${progress}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium" style={{ color: "#64748B" }}>
                          {progress}%
                        </span>
                      </div>
                    </div>
                    {isExpanded && (
                      <div style={{ borderTop: "1px solid #F1F5F9" }}>
                        <div
                          className="p-4"
                          style={{
                            backgroundColor: "#F8FAFC",
                          }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold" style={{ color: "#1B2B4B" }}>
                              Topics
                            </h4>
                            <button
                              onClick={() => {
                                setSelectedSyllabus(syllabus);
                                setShowTopicModal(true);
                              }}
                              className="text-xs px-3 py-1.5 rounded text-white font-medium hover:shadow transition flex items-center gap-1 cursor-pointer"
                              style={{
                                backgroundColor: "#2563EB",
                                borderRadius: "6px",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#1E40AF";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "#2563EB";
                              }}
                            >
                              <Plus size={14} />
                              Add Lecture
                            </button>
                          </div>
                          <div className="space-y-2">
                            {syllabus.topics?.map((topic) => (
                              <div
                                key={topic._id}
                                className="rounded-lg p-3 border"
                                style={{
                                  backgroundColor: "#FFFFFF",
                                  border: "1.5px solid #E2E8F0",
                                  borderRadius: "8px",
                                }}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h5 className="text-sm font-medium" style={{ color: "#1B2B4B" }}>
                                      {topic.title}
                                    </h5>
                                    {topic.description && (
                                      <p className="text-xs" style={{ color: "#94A3B8" }}>
                                        {topic.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => openEditTopicModal(topic)}
                                      className="p-1 rounded transition"
                                      style={{ backgroundColor: "transparent" }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = "#F8FAFC";
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = "transparent";
                                      }}
                                    >
                                      <Edit2 size={14} style={{ color: "#94A3B8" }} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTopic(topic._id)}
                                      className="p-1 rounded transition"
                                      style={{ backgroundColor: "transparent" }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = "#FEF2F2";
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = "transparent";
                                      }}
                                    >
                                      <Trash2 size={14} style={{ color: "#EF4444" }} />
                                    </button>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <div className="flex items-center gap-3 flex-wrap">
                                    <StatusBadge status={topic.completionStatus} />
                                    
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                      <span>{topic.duration || topic.lectureDuration || 60} mins</span>
                                      <span>•</span>
                                      <span className="text-[10px] font-bold uppercase">{topic.lectureType || "Normal"}</span>
                                      {topic.lectureType === "Reference" && topic.referenceTo && (
                                        <span className="text-[10px] font-bold bg-[#EFF6FF] text-[#0F3C8A] px-2 py-0.5 rounded border border-[#BFDBFE]">
                                          Ref To: {typeof topic.referenceTo === "object" ? topic.referenceTo.title : (syllabus.topics?.find(t => t._id === topic.referenceTo)?.title || topic.referenceTo)}
                                        </span>
                                      )}
                                      {topic.status && (
                                        <>
                                          <span>•</span>
                                          <span className={`text-[10px] font-bold uppercase ${
                                            topic.status === "active" ? "text-green-600" : "text-gray-500"
                                          }`}>{topic.status}</span>
                                        </>
                                      )}
                                    </div>

                                    <div
                                      className="flex items-center gap-1 text-xs"
                                      style={{ color: "#94A3B8" }}
                                    >
                                      <Calendar size={12} />
                                      {new Date(topic.dueDate).toLocaleDateString()}
                                    </div>
                                    {topic.assignedTo && (
                                      <div
                                        className="flex items-center gap-1 text-xs"
                                        style={{ color: "#64748B" }}
                                      >
                                        <User size={12} />
                                        {topic.assignedTo.name}
                                      </div>
                                    )}
                                  </div>
                                  {!topic.assignedTo && (
                                    <button
                                      onClick={() => {
                                        setSelectedTopic(topic);
                                        setShowAssignModal(true);
                                      }}
                                      className="text-xs px-2 py-1 rounded transition font-medium"
                                      style={{
                                        backgroundColor: "#F8FAFC",
                                        color: "#64748B",
                                        border: "1px solid #E2E8F0",
                                        borderRadius: "6px",
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = "#E2E8F0";
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = "#F8FAFC";
                                      }}
                                    >
                                      Assign
                                    </button>
                                  )}
                                </div>

                                {topic.subLectures && topic.subLectures.length > 0 && (
                                  <div className="mt-3 pl-4 border-l-2 border-gray-100 space-y-1.5 bg-gray-50/50 p-2.5 rounded-lg">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sub-Lectures ({topic.subLectures.length})</p>
                                    {topic.subLectures.map((sub, sIdx) => (
                                      <div key={sIdx} className="flex items-center justify-between text-xs text-gray-600 bg-white border border-gray-100 px-2 py-1 rounded">
                                        <span>{sub.title} ({sub.duration || 0} mins)</span>
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                          sub.completionStatus === "Completed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                                        }`}>
                                          {sub.completionStatus || "Pending"}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <BatchAssignmentsPanel onActionComplete={() => { fetchData(); }} />
      )}

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && (
          <Modal title="Create New Syllabus" onClose={() => setShowCreateModal(false)}>
            <form onSubmit={handleCreateSyllabus} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                  Subject *
                </label>
                <input
                  type="text"
                  placeholder="e.g., React.js Advanced"
                  value={syllabusForm.subject}
                  onChange={(e) => setSyllabusForm({...syllabusForm, subject: e.target.value})}
                  required
                  className="w-full px-3 py-2 rounded-lg outline-none text-sm transition"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid #E2E8F0",
                    borderRadius: "8px",
                    color: "#1B2B4B",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#2563EB";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#E2E8F0";
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                  Description
                </label>
                <textarea
                  placeholder="Describe the syllabus..."
                  value={syllabusForm.description}
                  onChange={(e) => setSyllabusForm({...syllabusForm, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg outline-none resize-none text-sm transition"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid #E2E8F0",
                    borderRadius: "8px",
                    color: "#1B2B4B",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#2563EB";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#E2E8F0";
                  }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg font-medium transition text-sm"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid #E2E8F0",
                    color: "#1B2B4B",
                    borderRadius: "8px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#F8FAFC";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#FFFFFF";
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition text-sm"
                  style={{
                    backgroundColor: "#2563EB",
                    borderRadius: "8px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#1E40AF";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#2563EB";
                  }}
                >
                  Create Syllabus
                </button>
              </div>
            </form>
          </Modal>
        )}
        {showEditModal && selectedSyllabus && (
          <Modal title="Edit Syllabus" onClose={() => { setShowEditModal(false); setSelectedSyllabus(null); }}>
            <form onSubmit={handleEditSyllabus} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                  Subject *
                </label>
                <input
                  type="text"
                  value={editForm.subject}
                  onChange={(e) => setEditForm({...editForm, subject: e.target.value})}
                  required
                  className="w-full px-3 py-2 rounded-lg outline-none text-sm transition"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid #E2E8F0",
                    borderRadius: "8px",
                    color: "#1B2B4B",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#2563EB";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#E2E8F0";
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg outline-none resize-none text-sm transition"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid #E2E8F0",
                    borderRadius: "8px",
                    color: "#1B2B4B",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#2563EB";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#E2E8F0";
                  }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setSelectedSyllabus(null); }}
                  className="flex-1 px-4 py-2 rounded-lg font-medium transition text-sm"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid #E2E8F0",
                    color: "#1B2B4B",
                    borderRadius: "8px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#F8FAFC";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#FFFFFF";
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition text-sm"
                  style={{
                    backgroundColor: "#2563EB",
                    borderRadius: "8px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#1E40AF";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#2563EB";
                  }}
                >
                  Update Syllabus
                </button>
              </div>
            </form>
          </Modal>
        )}
        {showTopicModal && selectedSyllabus && (
          <Modal title={`Add Lecture to ${selectedSyllabus.subject}`} onClose={() => setShowTopicModal(false)}>
            <form onSubmit={handleAddTopic} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={selectedSyllabus.subject}
                    disabled
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Chapter
                  </label>
                  <select
                    value={topicForm.chapterId}
                    onChange={(e) => setTopicForm({...topicForm, chapterId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  >
                    <option value="">Select Chapter (Optional)</option>
                    {chapters.map(ch => (
                      <option key={ch._id} value={ch._id}>{ch.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Lecture Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Hooks and State Management"
                  value={topicForm.title}
                  onChange={(e) => setTopicForm({...topicForm, title: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Describe the lecture..."
                  value={topicForm.description}
                  onChange={(e) => setTopicForm({...topicForm, description: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={topicForm.dueDate}
                    onChange={(e) => setTopicForm({...topicForm, dueDate: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Duration (mins) *
                  </label>
                  <input
                    type="number"
                    value={topicForm.duration}
                    onChange={(e) => setTopicForm({...topicForm, duration: Number(e.target.value) || 0})}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Lecture Type
                  </label>
                  <select
                    value={topicForm.lectureType}
                    onChange={(e) => setTopicForm({...topicForm, lectureType: e.target.value, referenceTo: e.target.value === "Normal" ? "" : topicForm.referenceTo})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Reference">Reference</option>
                  </select>
                </div>
              </div>

              {topicForm.lectureType === "Reference" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Reference To (Previous Lecture) *
                  </label>
                  <SearchableSelect
                    value={topicForm.referenceTo}
                    onChange={(val) => setTopicForm({ ...topicForm, referenceTo: val })}
                    placeholder="Select Normal Lecture..."
                    options={(selectedSyllabus?.topics || [])
                      .filter(t => (t.lectureType || "Normal") === "Normal")
                      .map(t => ({ value: t._id, label: t.title }))}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Assigned Teacher
                  </label>
                  <select
                    value={topicForm.teacherId}
                    onChange={(e) => setTopicForm({...topicForm, teacherId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  >
                    <option value="">Select Teacher (Optional)</option>
                    {teachers.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    value={topicForm.order}
                    onChange={(e) => setTopicForm({...topicForm, order: Number(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={topicForm.status}
                    onChange={(e) => setTopicForm({...topicForm, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Propagate to Batches
                </label>
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  {batches.map(b => {
                    const isSelected = topicForm.batchIds.includes(b._id);
                    return (
                      <button
                        key={b._id}
                        type="button"
                        onClick={() => {
                          setTopicForm({
                            ...topicForm,
                            batchIds: isSelected
                              ? topicForm.batchIds.filter(id => id !== b._id)
                              : [...topicForm.batchIds, b._id]
                          });
                        }}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                          isSelected
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {b.batch_name} (#{b.batch_no})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nested Sub Lectures Section */}
              <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Nested Sub-Lectures</h4>
                
                {topicForm.subLectures.length > 0 && (
                  <div className="space-y-2">
                    {topicForm.subLectures.map((sub, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white border border-gray-100 px-3 py-2 rounded-lg">
                        <span className="text-xs font-semibold text-gray-800">{sub.title} ({sub.duration} mins)</span>
                        <button
                          type="button"
                          onClick={() => {
                            setTopicForm({
                              ...topicForm,
                              subLectures: topicForm.subLectures.filter((_, i) => i !== idx)
                            });
                          }}
                          className="text-rose-500 font-bold hover:text-rose-700 text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Sub-lecture title"
                    value={subTitleInput}
                    onChange={(e) => setSubTitleInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Duration (mins)"
                    value={subDurationInput}
                    onChange={(e) => setSubDurationInput(e.target.value)}
                    className="w-24 px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!subTitleInput.trim()) return;
                      setTopicForm({
                        ...topicForm,
                        subLectures: [
                          ...topicForm.subLectures,
                          { title: subTitleInput.trim(), duration: Number(subDurationInput) || 0, order: topicForm.subLectures.length }
                        ]
                      });
                      setSubTitleInput("");
                      setSubDurationInput("");
                    }}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-blue-700 transition"
                  >
                    + Add
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowTopicModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl font-semibold border border-gray-200 text-gray-700 text-sm bg-white hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl text-white font-semibold text-sm bg-blue-600 hover:bg-blue-700 transition"
                >
                  Create Lecture
                </button>
              </div>
            </form>
          </Modal>
        )}
        {showEditTopicModal && selectedTopic && (
          <Modal title="Edit Topic" onClose={() => { setShowEditTopicModal(false); setSelectedTopic(null); }}>
            <form onSubmit={handleEditTopic} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                  Topic Title *
                </label>
                <input
                  type="text"
                  value={editTopicForm.title}
                  onChange={(e) => setEditTopicForm({...editTopicForm, title: e.target.value})}
                  required
                  className="w-full px-3 py-2 rounded-lg outline-none text-sm transition"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid #E2E8F0",
                    borderRadius: "8px",
                    color: "#1B2B4B",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#2563EB";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#E2E8F0";
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                  Description
                </label>
                <textarea
                  value={editTopicForm.description}
                  onChange={(e) => setEditTopicForm({...editTopicForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg outline-none resize-none text-sm transition"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid #E2E8F0",
                    borderRadius: "8px",
                    color: "#1B2B4B",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#2563EB";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#E2E8F0";
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                  Due Date *
                </label>
                <input
                  type="date"
                  value={editTopicForm.dueDate}
                  onChange={(e) => setEditTopicForm({...editTopicForm, dueDate: e.target.value})}
                  required
                  className="w-full px-3 py-2 rounded-lg outline-none text-sm transition"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid #E2E8F0",
                    borderRadius: "8px",
                    color: "#1B2B4B",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#2563EB";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#E2E8F0";
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                  Lecture Type
                </label>
                <select
                  value={editTopicForm.lectureType}
                  onChange={(e) => setEditTopicForm({...editTopicForm, lectureType: e.target.value, referenceTo: e.target.value === "Normal" ? "" : editTopicForm.referenceTo})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid #E2E8F0",
                    borderRadius: "8px",
                    color: "#1B2B4B",
                  }}
                >
                  <option value="Normal">Normal</option>
                  <option value="Reference">Reference</option>
                </select>
              </div>

              {editTopicForm.lectureType === "Reference" && (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                    Reference To (Previous Lecture) *
                  </label>
                  <SearchableSelect
                    value={editTopicForm.referenceTo}
                    onChange={(val) => setEditTopicForm({ ...editTopicForm, referenceTo: val })}
                    placeholder="Select Normal Lecture..."
                    options={(() => {
                      const activeSyllabusForEdit = syllabi.find(s => s._id === (selectedTopic?.syllabus?._id || selectedTopic?.syllabus));
                      const editNormalLectures = activeSyllabusForEdit?.topics?.filter(t => (t.lectureType || "Normal") === "Normal" && t._id !== selectedTopic?._id) || [];
                      return editNormalLectures.map(t => ({ value: t._id, label: t.title }));
                    })()}
                  />
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowEditTopicModal(false); setSelectedTopic(null); }}
                  className="flex-1 px-4 py-2 rounded-lg font-medium transition text-sm"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid #E2E8F0",
                    color: "#1B2B4B",
                    borderRadius: "8px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#F8FAFC";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#FFFFFF";
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition text-sm"
                  style={{
                    backgroundColor: "#2563EB",
                    borderRadius: "8px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#1E40AF";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#2563EB";
                  }}
                >
                  Update Topic
                </button>
              </div>
            </form>
          </Modal>
        )}
        {showAssignModal && selectedTopic && (
          <Modal title={`Assign "${selectedTopic.title}" to Teacher`} onClose={() => setShowAssignModal(false)}>
            <form onSubmit={handleAssignTopic} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                  Select Teacher *
                </label>
                <select
                  value={assignForm.teacherId}
                  onChange={(e) => setAssignForm({teacherId: e.target.value})}
                  required
                  className="w-full px-3 py-2 rounded-lg outline-none text-sm transition"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid #E2E8F0",
                    borderRadius: "8px",
                    color: "#1B2B4B",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#2563EB";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#E2E8F0";
                  }}
                >
                  <option value="">Choose a teacher...</option>
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name} ({teacher.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg font-medium transition text-sm"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid #E2E8F0",
                    color: "#1B2B4B",
                    borderRadius: "8px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#F8FAFC";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#FFFFFF";
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition text-sm"
                  style={{
                    backgroundColor: "#2563EB",
                    borderRadius: "8px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#1E40AF";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#2563EB";
                  }}
                >
                  Assign Teacher
                </button>
              </div>
            </form>
          </Modal>
        )}
        {showAssignTeacherModal && selectedSyllabus && (
          <Modal title={`Assign Teacher to "${selectedSyllabus.subject}"`} onClose={() => { setShowAssignTeacherModal(false); setSelectedSyllabus(null); }}>
            <form onSubmit={handleAssignTeacherToSyllabus} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                  Select Teacher *
                </label>
                <select
                  value={assignTeacherForm.teacherId}
                  onChange={(e) => setAssignTeacherForm({teacherId: e.target.value})}
                  required
                  className="w-full px-3 py-2 rounded-lg outline-none text-sm transition"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid #E2E8F0",
                    borderRadius: "8px",
                    color: "#1B2B4B",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#2563EB";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#E2E8F0";
                  }}
                >
                  <option value="">Choose a teacher...</option>
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name} ({teacher.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-xs" style={{ color: "#64748B" }}>
                  This will assign all topics of this syllabus to the selected teacher.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowAssignTeacherModal(false); setSelectedSyllabus(null); }}
                  className="flex-1 px-4 py-2 rounded-lg font-medium transition text-sm"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid #E2E8F0",
                    color: "#1B2B4B",
                    borderRadius: "8px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#F8FAFC";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#FFFFFF";
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition text-sm"
                  style={{
                    backgroundColor: "#2563EB",
                    borderRadius: "8px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#1E40AF";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#2563EB";
                  }}
                >
                  Assign Teacher
                </button>
              </div>
            </form>
          </Modal>
        )}
        {showAssignBatchModal && selectedSyllabus && (
          <Modal title={`Assign "${selectedSyllabus.subject}" to Batch`} onClose={() => { setShowAssignBatchModal(false); setSelectedSyllabus(null); }}>
            <form onSubmit={handleAssignToBatch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                  Select Batch *
                </label>
                <select
                  value={assignBatchForm.batchId}
                  onChange={(e) => setAssignBatchForm({ ...assignBatchForm, batchId: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg outline-none text-sm transition"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid #E2E8F0",
                    borderRadius: "8px",
                    color: "#1B2B4B",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#2563EB";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#E2E8F0";
                  }}
                >
                  <option value="">Choose a batch...</option>
                  {batches.map((batch) => (
                    <option key={batch._id} value={batch._id}>
                      {batch.batch_name} (#{batch.batch_no})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                  Due Date
                </label>
                <input
                  type="date"
                  value={assignBatchForm.dueDate}
                  onChange={(e) => setAssignBatchForm({ ...assignBatchForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg outline-none text-sm transition"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid #E2E8F0",
                    borderRadius: "8px",
                    color: "#1B2B4B",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#2563EB";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#E2E8F0";
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                  Notes (optional)
                </label>
                <textarea
                  rows={3}
                  value={assignBatchForm.notes}
                  onChange={(e) => setAssignBatchForm({ ...assignBatchForm, notes: e.target.value })}
                  placeholder="Add any notes about this assignment..."
                  className="w-full px-3 py-2 rounded-lg outline-none resize-none text-sm transition"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid #E2E8F0",
                    borderRadius: "8px",
                    color: "#1B2B4B",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#2563EB";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#E2E8F0";
                  }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowAssignBatchModal(false); setSelectedSyllabus(null); }}
                  className="flex-1 px-4 py-2 rounded-lg font-medium transition text-sm"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid #E2E8F0",
                    color: "#1B2B4B",
                    borderRadius: "8px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#F8FAFC";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#FFFFFF";
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition text-sm"
                  style={{
                    backgroundColor: "#2563EB",
                    borderRadius: "8px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#1E40AF";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#2563EB";
                  }}
                >
                  Assign to Batch
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}