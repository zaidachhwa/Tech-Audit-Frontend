import { useEffect, useState } from "react";
import { fileToCleanCSV } from "../../utils/excelToCSV";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { API } from "../../api/axios";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Users,
  Mail,
  FolderGit2,
  ChevronRight,
  RefreshCw,
  PlusCircle,
  Hash,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Calendar,
  Trash2,
  Upload,
  X,
  Download,
  Phone
} from "lucide-react";
import BulkAssignProjectModal from "./BulkAssignProjectModal";
import { getProjectsByBatch, deleteProject } from "../../api/project.api";

export default function AdminBatchDetail() {
  const { batchId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Manual Add Student States
  const [showManualAddModal, setShowManualAddModal] = useState(false);
  const [manualAdding, setManualAdding] = useState(false);
  const [manualForm, setManualForm] = useState({
    name: "",
    email: "",
    phoneNo: ""
  });

  // Bulk Upload Student States
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  // Syllabus details
  const [assignedSyllabi, setAssignedSyllabi] = useState([]);
  const [selectedSyllabus, setSelectedSyllabus] = useState("");
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);

  // Batch Projects
  const [groupedProjects, setGroupedProjects] = useState([]);
  const [enrolledSubjects, setEnrolledSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const handleManualAddSubmit = async (e) => {
    e.preventDefault();
    if (!manualForm.name || !manualForm.email) {
      toast.error("Name and Email are required");
      return;
    }
    try {
      setManualAdding(true);
      await API.post("/students/register", {
        name: manualForm.name,
        email: manualForm.email,
        phoneNo: manualForm.phoneNo,
        batch_name: batch.batch_name,
        batch_no: batch.batch_no,
      });
      toast.success("Student added successfully! Credentials emailed.");
      setManualForm({ name: "", email: "", phoneNo: "" });
      setShowManualAddModal(false);
      fetchBatchDetails();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add student");
    } finally {
      setManualAdding(false);
    }
  };

  const handleBulkUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error("Please select a file");
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const csvData = await fileToCleanCSV(uploadFile);

      const res = await API.post("/students/bulk-import", {
        batch_name: batch.batch_name,
        batch_no: batch.batch_no,
        csvData
      });

      setUploadResult(res.data);
      if (res.data.successCount > 0) {
        toast.success(`Successfully imported ${res.data.successCount} students! Credentials emailed.`);
        fetchBatchDetails();
      } else {
        toast.error("Failed to import students. Check row-wise errors.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Bulk upload failed");
    } finally {
      setUploading(false);
    }
  };

  const downloadCsvTemplate = () => {
    const headers = ["name", "email", "phone"];
    const rows = [
      ["John Doe", "john.doe@example.com", "9876543210"],
      ["Jane Smith", "jane.smith@example.com", ""]
    ];
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `student_import_template_${batch?.batch_name || 'batch'}_${batch?.batch_no || 'no'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchBatchDetails = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/batches/${batchId}`);
      setBatch(data);
      setStudents(data?.students || []);

      // Also get assigned syllabi for this batch
      const syllabusRes = await API.get("/syllabus/batches-with-syllabi");
      const allBatches = syllabusRes.data?.batches || [];
      const thisBatch = allBatches.find((b) => String(b._id) === String(batchId));
      
      const syllabi = thisBatch?.assignedSyllabi || [];
      setAssignedSyllabi(syllabi);
      if (syllabi.length > 0) {
        setSelectedSyllabus(syllabi[0].syllabus?._id || syllabi[0].syllabus);
      }

      // Fetch batch projects
      const projsReq = await getProjectsByBatch(batchId);
      const grouped = Object.values(
        (projsReq.projects || []).reduce((acc, p) => {
          if (!acc[p.title]) acc[p.title] = { title: p.title, description: p.description, ids: [] };
          acc[p.title].ids.push(p._id);
          return acc;
        }, {})
      );
      setGroupedProjects(grouped);

      // Fetch enrolled subjects (schedules) for this batch
      const schedulesRes = await API.get("/schedules/list");
      const batchSchedules = (schedulesRes.data || []).filter(
        (s) => String(s.batch?._id || s.batch) === String(batchId)
      );
      setEnrolledSubjects(batchSchedules);
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch batch details");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await API.get("/teachers/list");
      setTeachers(res.data?.teachers || []);
    } catch (err) {
      console.error("Failed to load teachers", err);
    }
  };

  const handleTeacherChange = async (scheduleId, newTeacherId) => {
    try {
      const sched = enrolledSubjects.find(s => s._id === scheduleId);
      if (!sched) return;

      const sanitizedLectures = (sched.lectures || []).map(l => {
        const cleaned = { ...l };
        if (cleaned.teacher && typeof cleaned.teacher === "object") {
          cleaned.teacher = cleaned.teacher._id;
        }
        return cleaned;
      });

      const payload = {
        subject: sched.subject,
        batch: sched.batch?._id || sched.batch,
        teacher: newTeacherId || undefined,
        lectures: sanitizedLectures
      };

      await API.put(`/schedules/update/${scheduleId}`, payload);
      toast.success("Assigned teacher updated successfully!");
      fetchBatchDetails();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update assigned teacher.");
    }
  };

  const handleDeleteGroupProject = async (ids) => {
    if (!window.confirm("Are you sure you want to delete this project for ALL students in this batch?")) return;
    try {
      setLoading(true);
      await Promise.all(ids.map(id => deleteProject(id)));
      toast.success("Project deleted successfully from the batch.");
      fetchBatchDetails();
    } catch (err) {
      toast.error("Failed to delete project");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatchDetails();
    fetchTeachers();
  }, [batchId]);

  useEffect(() => {
    if (!selectedSyllabus) return;
    setLoadingTopics(true);
    // Fetch batch topics
    API.get(`/syllabus/batch-topics?batchId=${batchId}&syllabusId=${selectedSyllabus}`)
      .then((res) => {
        setTopics(res.data?.topics || []);
      })
      .catch(() => {
        toast.error("Failed to fetch topics");
      })
      .finally(() => {
        setLoadingTopics(false);
      });
  }, [selectedSyllabus, batchId]);

  const stats = {
    total: topics.length,
    completed: topics.filter((t) => t.completionStatus === "Completed").length,
    inProgress: topics.filter((t) => t.completionStatus === "In Progress").length,
    pending: topics.filter((t) => t.completionStatus === "Pending").length,
  };
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="space-y-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg transition"
            style={{
              backgroundColor: "transparent",
              color: "#94A3B8",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#F8FAFC";
              e.currentTarget.style.color = "#2563EB";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#94A3B8";
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-bold" style={{ color: "#1B2B4B", fontSize: "24px", fontWeight: "700" }}>
              {batch?.batch_name || "Loading..."} Details
            </h1>
            <p className="text-sm flex items-center gap-2" style={{ color: "#64748B" }}>
              <Hash size={14} />
              Batch No: {batch?.batch_no || "-"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchBatchDetails}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition cursor-pointer disabled:opacity-50"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #2563EB",
              color: "#2563EB",
              borderRadius: "8px",
            }}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </motion.button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="animate-spin mx-auto" size={32} style={{ color: "#2563EB" }} />
          <p className="mt-4" style={{ color: "#64748B" }}>Loading data...</p>
        </div>
      ) : (
        <>
          {/* Syllabus Section */}
          <div className="p-5 rounded-lg border border-[#E2E8F0] bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-[#1B2B4B]">
              <BookOpen size={20} className="text-[#2563EB]"/>
              <h2 className="text-lg font-bold">Batch Syllabus</h2>
            </div>
            {assignedSyllabi.length > 0 ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between bg-[#F8FAFC] p-4 rounded-lg border border-[#E2E8F0]">
                  <select
                    className="border border-[#E2E8F0] bg-white rounded-lg px-4 py-2 text-sm outline-none w-full sm:w-auto"
                    value={selectedSyllabus}
                    onChange={(e) => setSelectedSyllabus(e.target.value)}
                  >
                    {assignedSyllabi.map((s) => (
                      <option key={s._id} value={s.syllabus?._id || s.syllabus}>
                        {s.syllabus?.subject || "Syllabus"}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-4 text-sm font-semibold">
                    <span className="text-[#1B2B4B]">{stats.completed}/{stats.total} Completed</span>
                    <span className="text-[#2563EB] bg-[#EFF6FF] px-2 py-1 rounded-md">{completionRate}%</span>
                  </div>
                </div>

                {loadingTopics ? (
                  <div className="text-center py-6">
                    <RefreshCw className="animate-spin mx-auto text-[#94A3B8]" size={24} />
                  </div>
                ) : topics.length > 0 ? (
                  <div className="space-y-3">
                    {topics.map(topic => (
                      <div key={topic._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-[#E2E8F0] rounded-lg">
                        <div>
                          <h4 className="font-bold text-[#1B2B4B]">{topic.title || topic.templateTopic?.title}</h4>
                          <p className="text-xs text-[#64748B] mt-1">{topic.description || topic.templateTopic?.description}</p>
                          <p className="text-xs text-[#94A3B8] mt-2 flex items-center gap-1">
                            <Calendar size={12}/> Due: {topic.dueDate ? new Date(topic.dueDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div className="mt-3 sm:mt-0 flex items-center gap-2">
                           <span className={`px-3 py-1 rounded-full text-xs font-semibold
                              ${topic.completionStatus === 'Completed' ? 'bg-[#ECFDF5] text-[#065F46]' :
                                topic.completionStatus === 'In Progress' ? 'bg-[#EFF6FF] text-[#1E40AF]' :
                                'bg-[#FEF3C7] text-[#92400E]'}`}
                           >
                              {topic.completionStatus}
                           </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-[#94A3B8] py-4 text-sm">No topics found for this syllabus.</p>
                )}
              </div>
            ) : (
              <p className="text-[#64748B] text-sm py-4">No syllabus assigned to this batch yet.</p>
            )}
          </div>

          {/* Enrolled Subjects Section */}
          <div className="p-5 rounded-lg border border-[#E2E8F0] bg-white shadow-sm mt-5">
            <div className="flex items-center gap-2 mb-4 text-[#1B2B4B]">
              <BookOpen size={20} className="text-[#2563EB]"/>
              <h2 className="text-lg font-bold">Enrolled Subjects</h2>
            </div>
            {enrolledSubjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enrolledSubjects.map((sched) => {
                  const total = sched.lectures?.length || 0;
                  const done = sched.lectures?.filter((l) => l.status === "Done").length || 0;
                  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
                  
                  return (
                    <div
                      key={sched._id}
                      className="p-4 border border-[#E2E8F0] rounded-xl bg-[#F8FAFC] flex flex-col justify-between"
                      style={{ borderRadius: "12px" }}
                    >
                      <div>
                        <h4 className="font-bold text-[#1B2B4B] text-sm mb-1">{sched.subject}</h4>
                        {user?.role === "admin" ? (
                          <div className="mt-1.5 mb-2">
                            <label className="block text-[9px] font-bold text-[#64748B] uppercase mb-0.5">
                              Assigned Teacher
                            </label>
                            <select
                              value={sched.teacher?._id || sched.teacher || ""}
                              onChange={(e) => handleTeacherChange(sched._id, e.target.value)}
                              className="w-full px-2 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#1B2B4B] shadow-sm focus:outline-none focus:border-[#2563EB] cursor-pointer"
                            >
                              <option value="">-- Unassigned --</option>
                              {teachers.map((t) => (
                                <option key={t._id} value={t._id}>
                                  {t.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <p className="text-xs text-[#64748B]">
                            Teacher: <span className="font-semibold text-[#475569]">{sched.teacher?.name || "Unassigned"}</span>
                          </p>
                        )}
                        <p className="text-[11px] text-[#94A3B8] mt-2">
                          {total} lecture(s) scheduled • {done} done
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#E2E8F0]">
                        <div className="flex justify-between items-center text-[10px] font-semibold text-[#64748B] mb-1">
                          <span>Syllabus Progress</span>
                          <span>{percent}%</span>
                        </div>
                        <div className="w-full bg-[#E2E8F0] rounded-full h-1">
                          <div
                            className="bg-[#10B981] h-1 rounded-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[#64748B] text-sm py-4 text-center">No subjects enrolled to this batch yet.</p>
            )}
          </div>

          {/* Assigned Batch Projects */}
          <div className="p-5 rounded-lg border border-[#E2E8F0] bg-white shadow-sm mt-5">
            <div className="flex items-center justify-between mb-4 text-[#1B2B4B]">
              <div className="flex items-center gap-2">
                <FolderGit2 size={20} className="text-[#2563EB]"/>
                <h2 className="text-lg font-bold">Assigned Projects</h2>
              </div>
            </div>
            {groupedProjects.length > 0 ? (
              <div className="space-y-3">
                {groupedProjects.map((group, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-[#E2E8F0] rounded-lg">
                    <div>
                      <h4 className="font-bold text-[#1B2B4B]">{group.title}</h4>
                      <p className="text-xs text-[#64748B] mt-1">{group.description}</p>
                      <p className="text-xs text-[#94A3B8] mt-2">Assigned to {group.ids.length} students</p>
                    </div>
                    <div className="mt-3 sm:mt-0 flex items-center">
                      <button
                        onClick={() => handleDeleteGroupProject(group.ids)}
                        className="text-[#EF4444] hover:bg-[#FEE2E2] p-2 rounded-md transition"
                        title="Delete project for all students"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#64748B] text-sm py-4 text-center">No projects assigned to this batch.</p>
            )}
          </div>

          {/* Students Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 mt-1 gap-3">
            <h2 className="text-lg font-bold text-[#1B2B4B] flex items-center gap-2">
              <Users size={20} className="text-[#2563EB]" />
              Enrolled Students ({students.length})
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowManualAddModal(true)}
                className="inline-flex items-center gap-2 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer bg-[#2563EB] hover:bg-[#1D4ED8]"
              >
                <PlusCircle size={14} />
                Add Student
              </button>
              <button
                onClick={() => setShowBulkUploadModal(true)}
                className="inline-flex items-center gap-2 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer bg-[#10B981] hover:bg-[#059669]"
              >
                <Upload size={14} />
                Bulk Upload
              </button>
              <button
                onClick={() => setShowAssignModal(true)}
                className="inline-flex items-center gap-2 text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer hover:bg-slate-200"
              >
                <FolderGit2 size={14} />
                Bulk Assign Project
              </button>
            </div>
          </div>
          
          {students.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student) => (
                <motion.div
                  key={student._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="rounded-lg p-5 transition cursor-pointer"
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1.5px solid #E2E8F0",
                    borderRadius: "12px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                  onClick={() => {
                    const base = user?.role === "teacher" ? "/teacher" : "/admin";
                    navigate(`${base}/project-tracking/student/${student._id}`);
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-white rounded-full p-3 bg-[#2563EB] shadow-[#2563eb4d]">
                      <Users size={20} />
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold inline-block
                        ${student.isActive ? "bg-[#ECFDF5] text-[#065F46]" : "bg-[#EFF6FF] text-[#1E40AF]"}`}
                    >
                      {student.isActive ? "Active" : "Pending"}
                    </div>
                  </div>

                  <h3 className="font-bold mb-2 text-[#2563EB] text-[18px] group-hover:underline">
                    {student.name}
                  </h3>

                  <div className="flex items-center gap-2 text-sm mb-4 text-[#64748B]">
                    <Mail size={14} />
                    <span className="truncate">{student.email}</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
                    <div className="flex items-center gap-2 font-medium text-sm text-[#2563EB]">
                      <FolderGit2 size={16} />
                      View Projects
                    </div>
                    <ChevronRight size={20} className="text-[#2563EB]" />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-[#E2E8F0] rounded-lg bg-white">
              <Users size={48} style={{ margin: "0 auto 16px", color: "#CBD5E1" }} />
              <p className="text-lg text-[#94A3B8]">
                No students found in this batch.
              </p>
            </div>
          )}
        </>
      )}

      {/* Bulk Assign Modal */}
      {showAssignModal && batch && (
        <BulkAssignProjectModal
          batch={batch}
          students={students}
          onClose={() => setShowAssignModal(false)}
          onAssigned={fetchBatchDetails}
        />
      )}

      {/* Manual Add Student Modal */}
      {showManualAddModal && batch && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-[#2563EB] rounded-lg">
                  <Users size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1B2B4B]">Add Student Manually</h2>
                  <p className="text-xs text-[#64748B]">Batch: {batch.batch_name} #{batch.batch_no}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowManualAddModal(false)}
                className="text-[#94A3B8] hover:text-[#64748B] transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleManualAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1B2B4B] uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aayush Sharma"
                  value={manualForm.name}
                  onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2B4B] uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. aayush@example.com"
                  value={manualForm.email}
                  onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                  className="w-full px-3.5 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2B4B] uppercase tracking-wider mb-1.5">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={manualForm.phoneNo}
                    onChange={(e) => setManualForm({ ...manualForm, phoneNo: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowManualAddModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={manualAdding}
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg transition flex items-center gap-2 disabled:opacity-50"
                >
                  {manualAdding ? <RefreshCw className="animate-spin" size={14} /> : null}
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Student Modal */}
      {showBulkUploadModal && batch && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Upload size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1B2B4B]">Bulk Student Upload</h2>
                  <p className="text-xs text-[#64748B]">Batch: {batch.batch_name} #{batch.batch_no}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowBulkUploadModal(false);
                  setUploadFile(null);
                  setUploadResult(null);
                }}
                className="text-[#94A3B8] hover:text-[#64748B] transition"
                disabled={uploading}
              >
                <X size={20} />
              </button>
            </div>

            {!uploadResult ? (
              <form onSubmit={handleBulkUploadSubmit} className="space-y-6">
                {/* CSV Template Download */}
                <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg p-4 flex justify-between items-center">
                  <div className="flex gap-3 items-center">
                    <div className="p-2 bg-blue-100 text-[#2563EB] rounded-full">
                      <Download size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1E40AF]">Excel / CSV Template</h4>
                      <p className="text-[11px] text-[#64748B] mt-0.5">Columns required: name, email (phone optional)</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={downloadCsvTemplate}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] bg-white border border-[#BFDBFE] px-3 py-1.5 rounded-lg hover:bg-[#EFF6FF] transition cursor-pointer"
                  >
                    Download Template
                  </button>
                </div>

                {/* File Drop Area */}
                <div>
                  <label className="block text-xs font-bold text-[#1B2B4B] uppercase tracking-wider mb-2">
                    Upload Excel or CSV File
                  </label>
                  <div className="border-2 border-dashed border-[#E2E8F0] rounded-xl p-8 text-center bg-[#F8FAFC] hover:bg-[#F1F5F9] transition relative">
                    <input
                      id="bulk-upload-file-input"
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      multiple={false}
                      required
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const name = file.name.toLowerCase();
                          if (name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".csv")) {
                            setUploadFile(file);
                          } else {
                            toast.error("Please upload a valid Excel (.xlsx, .xls) or CSV (.csv) file");
                          }
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <Upload size={32} className="mx-auto text-[#94A3B8] mb-3" />
                    {uploadFile ? (
                      <p className="text-sm font-semibold text-[#2563EB]">{uploadFile.name}</p>
                    ) : (
                      <>
                        <p className="text-sm text-[#475569] font-medium">Click or Drag Excel / CSV file here</p>
                        <p className="text-xs text-[#94A3B8] mt-1">.xlsx, .xls, .csv — Maximum file size 2 MB</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowBulkUploadModal(false)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || !uploadFile}
                    className="px-4 py-2 text-sm font-semibold text-white bg-[#10B981] hover:bg-[#059669] rounded-lg transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {uploading ? <RefreshCw className="animate-spin" size={14} /> : null}
                    Start Upload
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-5">
                {/* Upload Results Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                    <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Successfully Added</p>
                    <p className="text-3xl font-extrabold text-[#065F46] mt-1">{uploadResult.successCount}</p>
                  </div>
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-center">
                    <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">Failed / Skipped</p>
                    <p className="text-3xl font-extrabold text-[#991B1B] mt-1">{uploadResult.failedCount}</p>
                  </div>
                </div>

                {/* Import Errors / Warning List */}
                {uploadResult.errors?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-[#1B2B4B] mb-2 flex items-center gap-1.5">
                      <AlertCircle size={16} className="text-rose-600" /> Error Details
                    </h4>
                    <div className="max-h-60 overflow-y-auto border border-[#E2E8F0] rounded-lg divide-y divide-[#E2E8F0]">
                      {uploadResult.errors.map((err, idx) => (
                        <div key={idx} className="p-3 text-xs bg-slate-50 flex items-start gap-2">
                          <span className="font-semibold text-slate-500 bg-white px-2 py-0.5 border border-slate-200 rounded">Row {err.row}</span>
                          <span className="text-rose-600">{err.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 flex justify-end border-t border-slate-100">
                  <button
                    onClick={() => {
                      setShowBulkUploadModal(false);
                      setUploadFile(null);
                      setUploadResult(null);
                    }}
                    className="px-5 py-2 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}