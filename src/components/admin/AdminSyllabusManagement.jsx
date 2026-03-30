// src/components/syllabus/AdminSyllabusManagement.jsx
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
} from "lucide-react";
import {
  EmptyState,
  Modal,
} from "./SyllabusComponents";
import BatchAssignmentsPanel from "./BatchAssignmentsPanel";

export default function AdminSyllabusManagement() {
  const [syllabi, setSyllabi] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditTopicModal, setShowEditTopicModal] = useState(false);
  const [selectedSyllabus, setSelectedSyllabus] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [expandedSyllabi, setExpandedSyllabi] = useState(new Set());

  const [syllabusForm, setSyllabusForm] = useState({ subject: "", description: "" });
  const [topicForm, setTopicForm] = useState({ title: "", description: "", dueDate: "" });
  const [assignForm, setAssignForm] = useState({ teacherId: "" });
  const [editForm, setEditForm] = useState({ subject: "", description: "" });
  const [editTopicForm, setEditTopicForm] = useState({ title: "", description: "", dueDate: "" });
  const [activeTab, setActiveTab] = useState("templates");

  useEffect(() => { fetchData(); }, []);

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
      toast.error(err?.response?.data?.message || "Failed to create syllabus");
    }
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    try {
      await API.post("/syllabus/topic", { ...topicForm, syllabusId: selectedSyllabus._id });
      toast.success("Topic added successfully!");
      setTopicForm({ title: "", description: "", dueDate: "" });
      setShowTopicModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to add topic");
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
      Completed: "bg-green-50 text-green-700 border-green-200",
      "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
      Pending: "bg-gray-50 text-gray-600 border-gray-200",
    };
    return <span className={`text-xs px-2 py-1 rounded border ${styles[status]}`}>{status}</span>;
  };

  return (
    <div className="space-y-5">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Syllabus Management</h1>
          <p className="text-sm text-gray-500 mt-1">Create syllabi, manage topics, and track progress</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-1 flex items-center h-[42px]">
            <button onClick={() => setActiveTab("templates")} className={`px-4 py-1.5 h-full rounded-md text-sm font-medium transition ${activeTab === "templates" ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:text-gray-900"}`}>Templates</button>
            <button onClick={() => setActiveTab("batch")} className={`px-4 py-1.5 h-full rounded-md text-sm font-medium transition ${activeTab === "batch" ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:text-gray-900"}`}>Batch Assignments</button>
          </div>
          <button onClick={fetchData} disabled={loading} className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer" title="Refresh">
            <RefreshCw size={18} className={`${loading ? "animate-spin" : ""}`} />
          </button>
          {activeTab === "templates" && (
            <button onClick={() => setShowCreateModal(true)} className="h-[42px] px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2 cursor-pointer shadow-sm">
              <Plus size={18} />Create Syllabus
            </button>
          )}
        </div>
      </div>

      {activeTab === "templates" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
          <div className="bg-white shadow-sm rounded-xl p-4 border border-gray-200 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-500">Total Syllabi</p>
              <div className="bg-blue-50 p-2 rounded-lg"><BookOpen size={18} className="text-blue-600" /></div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          
          <div className="bg-white shadow-sm rounded-xl p-4 border border-gray-200 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-500">Total Topics</p>
              <div className="bg-purple-50 p-2 rounded-lg"><FileText size={18} className="text-purple-600" /></div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalTopics}</div>
          </div>

          <div className="bg-white shadow-sm rounded-xl p-4 border border-gray-200 hover:shadow-md transition">
             <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-500">Completed Topics</p>
              <div className="bg-green-50 p-2 rounded-lg"><CheckCircle2 size={18} className="text-green-600" /></div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
          </div>

          <div className="bg-white shadow-sm rounded-xl p-4 border border-gray-200 hover:shadow-md transition">
             <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-500">Teachers</p>
              <div className="bg-orange-50 p-2 rounded-lg"><Users size={18} className="text-orange-600" /></div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.teachers}</div>
          </div>
        </div>
      )}

        {activeTab === "templates" ? (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-20"><RefreshCw className="animate-spin text-blue-600" size={40} /></div>
            ) : syllabi.length === 0 ? (
              <EmptyState onCreateClick={() => setShowCreateModal(true)} />
            ) : (
              <div className="space-y-3">
                {syllabi.map((syllabus) => {
                  const isExpanded = expandedSyllabi.has(syllabus._id);
                  const progress = calculateProgress(syllabus.topics);
                  return (
                    <div key={syllabus._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{syllabus.subject}</h3>
                              <span className="text-xs text-gray-500">{syllabus.topics?.length || 0} topics</span>
                            </div>
                            {syllabus.description && <p className="text-sm text-gray-600">{syllabus.description}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEditModal(syllabus)} className="p-1.5 hover:bg-gray-100 rounded transition"><Edit2 size={16} className="text-gray-600" /></button>
                            <button onClick={() => handleDeleteSyllabus(syllabus._id)} className="p-1.5 hover:bg-red-50 rounded transition"><Trash2 size={16} className="text-red-600" /></button>
                            <button onClick={() => toggleExpanded(syllabus._id)} className="p-1.5 hover:bg-gray-100 rounded transition">{isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-xs font-medium text-gray-600">{progress}%</span>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="border-t border-gray-100">
                          <div className="p-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-semibold text-gray-700">Topics</h4>
                              <button onClick={() => { setSelectedSyllabus(syllabus); setShowTopicModal(true); }} className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-1"><Plus size={12} />Add Topic</button>
                            </div>
                            <div className="space-y-2">
                              {syllabus.topics?.map((topic) => (
                                <div key={topic._id} className="bg-white rounded-lg border border-gray-200 p-3">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <h5 className="text-sm font-medium text-gray-900 mb-1">{topic.title}</h5>
                                      {topic.description && <p className="text-xs text-gray-600">{topic.description}</p>}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button onClick={() => openEditTopicModal(topic)} className="p-1 hover:bg-gray-100 rounded"><Edit2 size={14} className="text-gray-500" /></button>
                                      <button onClick={() => handleDeleteTopic(topic._id)} className="p-1 hover:bg-red-50 rounded"><Trash2 size={14} className="text-red-500" /></button>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <StatusBadge status={topic.completionStatus} />
                                      <div className="flex items-center gap-1 text-xs text-gray-500"><Calendar size={12} />{new Date(topic.dueDate).toLocaleDateString()}</div>
                                      {topic.assignedTo && <div className="flex items-center gap-1 text-xs text-gray-600"><User size={12} />{topic.assignedTo.name}</div>}
                                    </div>
                                    {!topic.assignedTo && <button onClick={() => { setSelectedTopic(topic); setShowAssignModal(true); }} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">Assign</button>}
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
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input type="text" placeholder="e.g., React.js Advanced" value={syllabusForm.subject} onChange={(e) => setSyllabusForm({...syllabusForm, subject: e.target.value})} required className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea placeholder="Describe the syllabus..." value={syllabusForm.description} onChange={(e) => setSyllabusForm({...syllabusForm, description: e.target.value})} rows={4} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm" /></div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition text-sm">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition text-sm">Create Syllabus</button>
              </div>
            </form>
          </Modal>
        )}
        {showEditModal && selectedSyllabus && (
          <Modal title="Edit Syllabus" onClose={() => { setShowEditModal(false); setSelectedSyllabus(null); }}>
            <form onSubmit={handleEditSyllabus} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input type="text" value={editForm.subject} onChange={(e) => setEditForm({...editForm, subject: e.target.value})} required className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} rows={4} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm" /></div>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setShowEditModal(false); setSelectedSyllabus(null); }} className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition text-sm">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition text-sm">Update Syllabus</button>
              </div>
            </form>
          </Modal>
        )}
        {showTopicModal && selectedSyllabus && (
          <Modal title={`Add Topic to ${selectedSyllabus.subject}`} onClose={() => setShowTopicModal(false)}>
            <form onSubmit={handleAddTopic} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Topic Title *</label>
                <input type="text" placeholder="e.g., Hooks and State Management" value={topicForm.title} onChange={(e) => setTopicForm({...topicForm, title: e.target.value})} required className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea placeholder="Describe the topic..." value={topicForm.description} onChange={(e) => setTopicForm({...topicForm, description: e.target.value})} rows={3} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                <input type="date" value={topicForm.dueDate} onChange={(e) => setTopicForm({...topicForm, dueDate: e.target.value})} required className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" /></div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowTopicModal(false)} className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition text-sm">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition text-sm">Add Topic</button>
              </div>
            </form>
          </Modal>
        )}
        {showEditTopicModal && selectedTopic && (
          <Modal title="Edit Topic" onClose={() => { setShowEditTopicModal(false); setSelectedTopic(null); }}>
            <form onSubmit={handleEditTopic} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Topic Title *</label>
                <input type="text" value={editTopicForm.title} onChange={(e) => setEditTopicForm({...editTopicForm, title: e.target.value})} required className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={editTopicForm.description} onChange={(e) => setEditTopicForm({...editTopicForm, description: e.target.value})} rows={3} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                <input type="date" value={editTopicForm.dueDate} onChange={(e) => setEditTopicForm({...editTopicForm, dueDate: e.target.value})} required className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm" /></div>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setShowEditTopicModal(false); setSelectedTopic(null); }} className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition text-sm">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition text-sm">Update Topic</button>
              </div>
            </form>
          </Modal>
        )}
        {showAssignModal && selectedTopic && (
          <Modal title={`Assign "${selectedTopic.title}" to Teacher`} onClose={() => setShowAssignModal(false)}>
            <form onSubmit={handleAssignTopic} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Select Teacher *</label>
                <select value={assignForm.teacherId} onChange={(e) => setAssignForm({teacherId: e.target.value})} required className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm">
                  <option value="">Choose a teacher...</option>
                  {teachers.map((teacher) => (<option key={teacher._id} value={teacher._id}>{teacher.name} ({teacher.email})</option>))}
                </select>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowAssignModal(false)} className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition text-sm">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition text-sm">Assign Teacher</button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}