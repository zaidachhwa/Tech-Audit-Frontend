import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import CalendarView from "../shared/CalendarView";
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
  const navigate = useNavigate();
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
  const [assignBatchForm, setAssignBatchForm] = useState({ batchIds: [], notes: "", dueDate: "" });
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
  const [adminSchedules, setAdminSchedules] = useState([]);

  useEffect(() => {
    if (activeTab === "calendar") {
      API.get("/schedules/list")
        .then((res) => setAdminSchedules(res.data || []))
        .catch(() => toast.error("Failed to load schedules for calendar"));
    }
  }, [activeTab]);

  const [chapters, setChapters] = useState([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [chapterForm, setChapterForm] = useState({ title: "", order: 0 });
  const [editingChapterId, setEditingChapterId] = useState(null);
  const [syllabusChapters, setSyllabusChapters] = useState({});
  const [batchesWithSyllabi, setBatchesWithSyllabi] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ batchId: "", teacherId: "", date: "", time: "" });

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
      const [syllabusRes, teacherRes, batchRes, batchSyllabiRes] = await Promise.all([
        API.get("/syllabus/all"),
        API.get("/teachers/list"),
        API.get("/batches/public"),
        API.get("/syllabus/batches-with-syllabi"),
      ]);
      setSyllabi(syllabusRes.data?.syllabi || []);
      setTeachers(teacherRes.data?.teachers || []);
      setBatches(batchRes.data?.batches || batchRes.data || []);
      setBatchesWithSyllabi(batchSyllabiRes.data?.batches || []);
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
    const ids = assignTeacherForm.teacherIds || [];
    if (ids.length === 0) {
      toast.error("Please select at least one teacher");
      return;
    }
    try {
      await API.patch(`/syllabus/${selectedSyllabus._id}/assign-teacher`, { teacherIds: ids });
      toast.success("Teachers assigned to syllabus successfully!");
      setAssignTeacherForm({ teacherIds: [] });
      setShowAssignTeacherModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to assign teachers");
    }
  };

  const handleAssignToBatch = async (e) => {
    e.preventDefault();
    const ids = assignBatchForm.batchIds || [];
    if (ids.length === 0) {
      toast.error("Please select at least one batch");
      return;
    }
    try {
      await API.post("/syllabus/assign-to-batch", {
        syllabusId: selectedSyllabus._id,
        batchIds: ids,
        notes: assignBatchForm.notes,
        dueDate: assignBatchForm.dueDate,
      });
      toast.success("Syllabus assigned to batches successfully!");
      setAssignBatchForm({ batchIds: [], notes: "", dueDate: "" });
      setShowAssignBatchModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to assign syllabus to batches");
    }
  };

  const handleScheduleTopic = async (e) => {
    e.preventDefault();
    const { batchId, teacherId, date, time } = scheduleForm;
    if (!batchId || !teacherId || !date || !time) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Combine date and time
    const combinedDueDate = new Date(`${date}T${time}`);

    try {
      await API.patch(`/syllabus/topic/${selectedTopic._id}/schedule`, {
        batchId,
        teacherId,
        dueDate: combinedDueDate
      });
      toast.success("Lecture scheduled successfully!");
      setShowScheduleModal(false);
      setSelectedTopic(null);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to schedule lecture");
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

  const fetchChaptersForSyllabus = async (syllabusId) => {
    try {
      const res = await API.get(`/chapters?subjectId=${syllabusId}`);
      const chaptersList = res.data || [];
      setSyllabusChapters((prev) => ({
        ...prev,
        [syllabusId]: chaptersList,
      }));
      if (selectedSyllabus && syllabusId === selectedSyllabus._id) {
        setChapters(chaptersList);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateOrUpdateChapter = async (e) => {
    e.preventDefault();
    if (!chapterForm.title) {
      toast.error("Chapter title is required");
      return;
    }
    try {
      if (editingChapterId) {
        await API.patch(`/chapters/${editingChapterId}`, {
          title: chapterForm.title,
          order: Number(chapterForm.order) || 0,
        });
        toast.success("Chapter updated successfully!");
      } else {
        await API.post("/chapters", {
          subjectId: selectedSyllabus._id,
          title: chapterForm.title,
          order: Number(chapterForm.order) || 0,
        });
        toast.success("Chapter added successfully!");
      }
      setChapterForm({ title: "", order: 0 });
      setEditingChapterId(null);
      fetchChaptersForSyllabus(selectedSyllabus._id);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to save chapter");
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!confirm("Are you sure you want to delete this chapter? This will not delete the lectures inside it, but they will become unassigned.")) return;
    try {
      await API.delete(`/chapters/${chapterId}`);
      toast.success("Chapter deleted successfully!");
      fetchChaptersForSyllabus(selectedSyllabus._id);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to delete chapter");
    }
  };

  const toggleExpanded = (syllabusId) => {
    setExpandedSyllabi((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(syllabusId)) {
        newSet.delete(syllabusId);
      } else {
        newSet.add(syllabusId);
        fetchChaptersForSyllabus(syllabusId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    // For each expanded syllabus, if we don't have its chapters yet, fetch them
    expandedSyllabi.forEach(id => {
      if (!syllabusChapters[id]) {
        fetchChaptersForSyllabus(id);
      }
    });
  }, [expandedSyllabi, syllabusChapters]);

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

  const renderTopicCard = (topic, syllabus) => {
    return (
      <div
        key={topic._id}
        className="rounded-lg p-3 border bg-white"
        style={{
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
              <p className="text-xs mt-1" style={{ color: "#94A3B8", whiteSpace: "pre-line" }}>
                {topic.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => openEditTopicModal(topic)}
              className="p-1 rounded transition cursor-pointer"
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
              className="p-1 rounded transition cursor-pointer"
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
              style={{ color: topic.dueDate ? "#475569" : "#94A3B8" }}
            >
              <Calendar size={12} />
              {topic.dueDate ? (
                <span>
                  {new Date(topic.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  {" at "}
                  {new Date(topic.dueDate).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </span>
              ) : (
                <span className="italic">Not Scheduled</span>
              )}
            </div>
            {topic.assignedTo && (
              <div
                className="flex items-center gap-1 text-xs font-medium"
                style={{ color: "#2563EB" }}
              >
                <User size={12} />
                {topic.assignedTo.name}
              </div>
            )}
          </div>
          <button
            onClick={() => {
              // Navigate to Lecture Scheduler with pre-populated context
              const assignedBatches = (batchesWithSyllabi || []).filter(batch =>
                batch && (batch.assignedSyllabi || []).some(bs => bs && (bs.syllabus?._id || bs.syllabus) === syllabus?._id)
              );
              const firstBatch = assignedBatches[0] || null;
              const allAssigned = [
                ...(syllabus?.assignedTeachers || []),
                ...(syllabus?.assignedTeacher ? [syllabus.assignedTeacher] : [])
              ].filter(t => t && (t._id || t.id));
              const firstTeacher = allAssigned[0] || null;

              navigate("/admin/lecture-scheduler", {
                state: {
                  prefill: {
                    syllabusId: syllabus?._id,
                    subjectName: syllabus?.subject || "",
                    batchId: firstBatch?._id || "",
                    teacherId: firstTeacher?._id || firstTeacher?.id || "",
                    topicTitle: topic.title,
                    date: topic.dueDate
                      ? new Date(topic.dueDate).toISOString().split("T")[0]
                      : "",
                  }
                }
              });
            }}
            className="text-xs px-2.5 py-1.5 rounded font-semibold transition cursor-pointer flex items-center gap-1"
            style={{
              backgroundColor: "#EFF6FF",
              color: "#2563EB",
              border: "1.5px solid #BFDBFE",
              borderRadius: "6px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#DBEAFE";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#EFF6FF";
            }}
          >
            <Calendar size={13} />
            Schedule
          </button>
        </div>

        {topic.subLectures && topic.subLectures.length > 0 && (
          <div className="mt-3 pl-4 border-l-2 border-gray-100 space-y-1.5 bg-gray-50/50 p-2.5 rounded-lg">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sub-Lectures ({topic.subLectures.length})</p>
            {topic.subLectures.map((sub, sIdx) => (
              <div key={sIdx} className="flex items-center justify-between text-xs text-gray-600 bg-white border border-gray-100 px-2 py-1 rounded">
                <span>{sub.title}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                  sub.completionStatus === "Completed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                }`}>
                  {sub.completionStatus && sub.completionStatus !== "Pending" ? sub.completionStatus : "Yet to be scheduled"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
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
            <button
              onClick={() => setActiveTab("calendar")}
              className="px-4 py-1.5 h-full rounded text-sm font-medium transition flex items-center gap-1.5"
              style={{
                backgroundColor: activeTab === "calendar" ? "#F8FAFC" : "transparent",
                color: activeTab === "calendar" ? "#2563EB" : "#94A3B8",
                borderRadius: "6px",
                fontWeight: "600",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== "calendar") {
                  e.currentTarget.style.color = "#2563EB";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== "calendar") {
                  e.currentTarget.style.color = "#94A3B8";
                }
              }}
            >
              <Calendar size={15} /> Calendar View
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

      {activeTab === "calendar" && (
        <div className="space-y-6">
          <CalendarView
            schedules={adminSchedules}
            role="admin"
            onSelectLecture={(evt) => {
              navigate("/admin/lecture-scheduler");
            }}
          />
        </div>
      )}

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
                          {/* Show assigned teachers */}
                          {((syllabus.assignedTeachers && syllabus.assignedTeachers.length > 0) || syllabus.assignedTeacher) && (
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <User size={14} style={{ color: "#2563EB" }} />
                              <div className="flex flex-wrap gap-1.5">
                                {(() => {
                                  const teachersList = syllabus.assignedTeachers && syllabus.assignedTeachers.length > 0 
                                    ? syllabus.assignedTeachers 
                                    : [syllabus.assignedTeacher];
                                  return teachersList.map((t, idx) => t && (
                                    <span key={t._id || idx} className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                                      {t.name}
                                    </span>
                                  ));
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedSyllabus(syllabus);
                              const existingIds = syllabus.assignedTeachers && syllabus.assignedTeachers.length > 0
                                ? syllabus.assignedTeachers.map(t => t._id || t)
                                : (syllabus.assignedTeacher ? [syllabus.assignedTeacher._id || syllabus.assignedTeacher] : []);
                              setAssignTeacherForm({ teacherIds: existingIds });
                              setShowAssignTeacherModal(true);
                            }}
                            className="px-3 py-1.5 rounded text-sm font-medium transition flex items-center gap-2"
                            style={{
                              backgroundColor: (syllabus.assignedTeachers?.length > 0 || syllabus.assignedTeacher) ? "#EFF6FF" : "#F8FAFC",
                              color: (syllabus.assignedTeachers?.length > 0 || syllabus.assignedTeacher) ? "#2563EB" : "#64748B",
                              border: "1px solid #E2E8F0",
                              borderRadius: "6px",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#EFF6FF";
                              e.currentTarget.style.color = "#2563EB";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = (syllabus.assignedTeachers?.length > 0 || syllabus.assignedTeacher) ? "#EFF6FF" : "#F8FAFC";
                              e.currentTarget.style.color = (syllabus.assignedTeachers?.length > 0 || syllabus.assignedTeacher) ? "#2563EB" : "#64748B";
                            }}
                          >
                            <Users size={14} />
                            {(syllabus.assignedTeachers?.length > 0 || syllabus.assignedTeacher) ? "Change Teachers" : "Assign Teachers"}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSyllabus(syllabus);
                              const currentlyAssignedBatchIds = (batchesWithSyllabi || [])
                                .filter(batch => batch && (batch.assignedSyllabi || []).some(bs => bs && (bs.syllabus?._id || bs.syllabus) === syllabus._id))
                                .map(b => b._id);
                              setAssignBatchForm({ batchIds: currentlyAssignedBatchIds, notes: "", dueDate: "" });
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
                              Topics Grouped by Chapters
                            </h4>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedSyllabus(syllabus);
                                  setShowChapterModal(true);
                                  fetchChaptersForSyllabus(syllabus._id);
                                }}
                                className="text-xs px-3 py-1.5 rounded font-medium border border-gray-200 bg-white hover:bg-gray-50 transition flex items-center gap-1 cursor-pointer"
                                style={{ color: "#475569", borderRadius: "6px" }}
                              >
                                <BookOpen size={14} />
                                Manage Chapters
                              </button>
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
                          </div>
                          <div className="space-y-4">
                            {(() => {
                              const syllabusChs = syllabusChapters[syllabus._id] || [];
                              const sortedChs = [...syllabusChs].sort((a, b) => (a.order || 0) - (b.order || 0));
                              
                              const grouped = {};
                              sortedChs.forEach(ch => {
                                grouped[ch._id] = [];
                              });
                              const unassignedKey = "unassigned";
                              grouped[unassignedKey] = [];

                              (syllabus.topics || []).forEach(topic => {
                                const chId = topic.chapterId || unassignedKey;
                                if (grouped[chId]) {
                                  grouped[chId].push(topic);
                                } else {
                                  grouped[unassignedKey].push(topic);
                                }
                              });

                              return (
                                <>
                                  {sortedChs.map(ch => {
                                    const chTopics = grouped[ch._id] || [];
                                    const sortedChTopics = [...chTopics].sort((a, b) => (a.order || 0) - (b.order || 0));
                                    
                                    return (
                                      <div key={ch._id} className="border border-gray-100 rounded-lg p-3 bg-white/70 shadow-sm">
                                        <div className="flex items-center justify-between mb-2 pb-1 border-b border-gray-50">
                                          <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                                            <BookOpen size={12} className="text-blue-500" />
                                            {ch.title}
                                            <span className="text-[10px] text-gray-400 normal-case font-medium">({sortedChTopics.length} lectures)</span>
                                          </h5>
                                          <div className="flex items-center gap-1">
                                            <button
                                              onClick={() => {
                                                setSelectedSyllabus(syllabus);
                                                setChapterForm({ title: ch.title, order: ch.order || 0 });
                                                setEditingChapterId(ch._id);
                                                setShowChapterModal(true);
                                              }}
                                              className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                                              title="Edit Chapter"
                                            >
                                              <Edit2 size={12} />
                                            </button>
                                            <button
                                              onClick={() => {
                                                setSelectedSyllabus(syllabus);
                                                handleDeleteChapter(ch._id);
                                              }}
                                              className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                              title="Delete Chapter"
                                            >
                                              <Trash2 size={12} />
                                            </button>
                                          </div>
                                        </div>
                                        {sortedChTopics.length === 0 ? (
                                          <p className="text-[11px] text-gray-400 italic py-1 pl-2">No lectures added to this chapter yet.</p>
                                        ) : (
                                          <div className="space-y-2 mt-2">
                                            {sortedChTopics.map(topic => renderTopicCard(topic, syllabus))}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}

                                  {grouped[unassignedKey].length > 0 && (
                                    <div className="border border-dashed border-gray-200 rounded-lg p-3 bg-gray-50/50">
                                      <div className="flex items-center justify-between mb-2 pb-1 border-b border-gray-100">
                                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                                          <BookOpen size={12} className="text-gray-400" />
                                          General / Standalone Topics (Not in a Chapter)
                                          <span className="text-[10px] text-gray-400 normal-case font-medium">({grouped[unassignedKey].length} topics)</span>
                                        </h5>
                                      </div>
                                      <div className="space-y-2 mt-2">
                                        {grouped[unassignedKey].sort((a, b) => (a.order || 0) - (b.order || 0)).map(topic => renderTopicCard(topic, syllabus))}
                                      </div>
                                    </div>
                                  )}

                                  {sortedChs.length === 0 && grouped[unassignedKey].length === 0 && (
                                    <div className="text-center py-6">
                                      <p className="text-xs text-gray-400">No chapters or lectures created yet. Click "Manage Chapters" or "Add Lecture" to get started.</p>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
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
                        <span className="text-xs font-semibold text-gray-800">{sub.title}</span>
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
          <Modal title={`Assign Teachers to "${selectedSyllabus.subject}"`} onClose={() => { setShowAssignTeacherModal(false); setSelectedSyllabus(null); }}>
            <form onSubmit={handleAssignTeacherToSyllabus} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700" style={{ fontWeight: "600" }}>
                  Select Teachers *
                </label>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-white space-y-2">
                  {teachers.map((teacher) => {
                    const isChecked = assignTeacherForm.teacherIds?.includes(teacher._id) || false;
                    return (
                      <label key={teacher._id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 transition cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const ids = assignTeacherForm.teacherIds || [];
                            if (e.target.checked) {
                              setAssignTeacherForm({
                                teacherIds: [...ids, teacher._id]
                              });
                            } else {
                              setAssignTeacherForm({
                                teacherIds: ids.filter(id => id !== teacher._id)
                              });
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-800">{teacher.name}</span>
                          <span className="text-[10px] text-gray-400">{teacher.email}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
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
                  Assign Teachers
                </button>
              </div>
            </form>
          </Modal>
        )}
        {showAssignBatchModal && selectedSyllabus && (
          <Modal title={`Assign "${selectedSyllabus.subject}" to Batches`} onClose={() => { setShowAssignBatchModal(false); setSelectedSyllabus(null); }}>
            <form onSubmit={handleAssignToBatch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700" style={{ fontWeight: "600" }}>
                  Select Batches *
                </label>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-white space-y-2">
                  {batches.map((batch) => {
                    const isChecked = assignBatchForm.batchIds?.includes(batch._id) || false;
                    return (
                      <label key={batch._id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 transition cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const ids = assignBatchForm.batchIds || [];
                            if (e.target.checked) {
                              setAssignBatchForm({
                                ...assignBatchForm,
                                batchIds: [...ids, batch._id]
                              });
                            } else {
                              setAssignBatchForm({
                                ...assignBatchForm,
                                batchIds: ids.filter(id => id !== batch._id)
                              });
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="flex flex-col flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-800">{batch.batch_name}</span>
                            {isChecked && (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                Assigned
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400">Batch #{batch.batch_no}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
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
                  Assign to Batches
                </button>
              </div>
            </form>
          </Modal>
        )}

        {showScheduleModal && selectedTopic && selectedSyllabus && (
          <Modal title={`Schedule Lecture: "${selectedTopic.title}"`} onClose={() => { setShowScheduleModal(false); setSelectedTopic(null); }}>
            <form onSubmit={handleScheduleTopic} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700" style={{ fontWeight: "600" }}>
                  Selected Subject
                </label>
                <input
                  type="text"
                  value={selectedSyllabus?.subject || ""}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700" style={{ fontWeight: "600" }}>
                    Select Batch *
                  </label>
                  <select
                    value={scheduleForm.batchId}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, batchId: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none"
                  >
                    <option value="">Choose batch...</option>
                    {(() => {
                      const assignedBatches = (batchesWithSyllabi || []).filter(batch => 
                        batch && (batch.assignedSyllabi || []).some(bs => bs && (bs.syllabus?._id || bs.syllabus) === selectedSyllabus?._id)
                      );
                      return assignedBatches.map(b => b && (
                        <option key={b._id} value={b._id}>{b.batch_name} (#{b.batch_no})</option>
                      ));
                    })()}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700" style={{ fontWeight: "600" }}>
                    Select Teacher *
                  </label>
                  <select
                    value={scheduleForm.teacherId}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, teacherId: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none"
                  >
                    <option value="">Choose teacher...</option>
                    {(() => {
                      const allAssigned = [
                        ...(selectedSyllabus?.assignedTeachers || []),
                        ...(selectedSyllabus?.assignedTeacher ? [selectedSyllabus.assignedTeacher] : [])
                      ].filter(t => t && (t._id || t.id));

                      const teacherMap = new Map();
                      allAssigned.forEach(t => {
                        const idKey = (t._id || t.id).toString();
                        if (!teacherMap.has(idKey)) {
                          teacherMap.set(idKey, t);
                        }
                      });
                      
                      return Array.from(teacherMap.values()).map(t => (
                        <option key={t._id || t.id} value={t._id || t.id}>{t.name}</option>
                      ));
                    })()}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700" style={{ fontWeight: "600" }}>
                    Select Date *
                  </label>
                  <input
                    type="date"
                    value={scheduleForm.date}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700" style={{ fontWeight: "600" }}>
                    Select Time *
                  </label>
                  <input
                    type="time"
                    value={scheduleForm.time}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowScheduleModal(false); setSelectedTopic(null); }}
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
                  Schedule Lecture
                </button>
              </div>
            </form>
          </Modal>
        )}
        {showChapterModal && selectedSyllabus && (
          <Modal
            title={`Manage Chapters for "${selectedSyllabus.subject}"`}
            onClose={() => {
              setShowChapterModal(false);
              setChapterForm({ title: "", order: 0 });
              setEditingChapterId(null);
            }}
          >
            <div className="space-y-6">
              {/* Form to Add/Edit Chapter */}
              <form onSubmit={handleCreateOrUpdateChapter} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {editingChapterId ? "Edit Chapter" : "Add New Chapter"}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold mb-1 text-gray-600">Chapter Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Module 1: Web Fundamentals"
                      value={chapterForm.title}
                      onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                      required
                      className="w-full px-3 py-1.5 rounded-lg outline-none text-xs transition"
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
                    <label className="block text-xs font-semibold mb-1 text-gray-600">Order (Number)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={chapterForm.order}
                      onChange={(e) => setChapterForm({ ...chapterForm, order: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg outline-none text-xs transition"
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
                </div>
                <div className="flex justify-end gap-2">
                  {editingChapterId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingChapterId(null);
                        setChapterForm({ title: "", order: 0 });
                      }}
                      className="px-3 py-1.5 rounded-lg font-medium text-xs border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg text-white font-medium text-xs transition bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  >
                    {editingChapterId ? "Update Chapter" : "Add Chapter"}
                  </button>
                </div>
              </form>

              {/* List of Existing Chapters */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Existing Chapters ({(syllabusChapters[selectedSyllabus._id] || []).length})
                </h4>
                <div className="max-h-60 overflow-y-auto pr-1 space-y-2">
                  {loadingChapters ? (
                    <p className="text-xs text-gray-400 italic text-center py-4">Loading chapters...</p>
                  ) : (syllabusChapters[selectedSyllabus._id] || []).length === 0 ? (
                    <p className="text-xs text-gray-400 italic text-center py-4">No chapters created for this syllabus yet.</p>
                  ) : (
                    [...(syllabusChapters[selectedSyllabus._id] || [])]
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((ch) => (
                        <div
                          key={ch._id}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 bg-white hover:border-gray-200 transition"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full min-w-8 text-center">
                              #{ch.order || 0}
                            </span>
                            <span className="text-xs font-medium text-gray-800">{ch.title}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingChapterId(ch._id);
                                setChapterForm({ title: ch.title, order: ch.order || 0 });
                              }}
                              className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteChapter(ch._id)}
                              className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}