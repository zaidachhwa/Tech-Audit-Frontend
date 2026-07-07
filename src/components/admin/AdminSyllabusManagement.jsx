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
  const [topicForm, setTopicForm] = useState({ title: "", description: "", dueDate: "" });
  const [assignForm, setAssignForm] = useState({ teacherId: "" });
  const [assignTeacherForm, setAssignTeacherForm] = useState({ teacherId: "" });
  const [assignBatchForm, setAssignBatchForm] = useState({ batchId: "", notes: "", dueDate: "" });
  const [editForm, setEditForm] = useState({ subject: "", description: "" });
  const [editTopicForm, setEditTopicForm] = useState({ title: "", description: "", dueDate: "" });
  const [activeTab, setActiveTab] = useState("templates");

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
    try {
      await API.post("/syllabus/topic", { ...topicForm, syllabusId: selectedSyllabus._id });
      toast.success("Lecture added successfully!");
      setTopicForm({ title: "", description: "", dueDate: "" });
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
    try {
      await API.put(
        `/syllabus/topic/${selectedTopic._id}`,
        editTopicForm
      );

      toast.success("Topic updated successfully!");
      setShowEditTopicModal(false);
      setSelectedTopic(null);
      setEditTopicForm({ title: "", description: "", dueDate: "" });
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
            <form onSubmit={handleAddTopic} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#1B2B4B", fontWeight: "600" }}>
                  Lecture Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Hooks and State Management"
                  value={topicForm.title}
                  onChange={(e) => setTopicForm({...topicForm, title: e.target.value})}
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
                  placeholder="Describe the topic..."
                  value={topicForm.description}
                  onChange={(e) => setTopicForm({...topicForm, description: e.target.value})}
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
                  value={topicForm.dueDate}
                  onChange={(e) => setTopicForm({...topicForm, dueDate: e.target.value})}
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
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowTopicModal(false)}
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
                  Add Topic
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