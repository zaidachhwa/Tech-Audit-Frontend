import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import BulkAssignProjectModal from "./BulkAssignProjectModal";

export default function AdminBatchDetail() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Syllabus details
  const [assignedSyllabi, setAssignedSyllabi] = useState([]);
  const [selectedSyllabus, setSelectedSyllabus] = useState("");
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);

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
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch batch details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatchDetails();
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

          {/* Students Section */}
          <div className="flex items-center justify-between pt-4">
            <h2 className="text-lg font-bold text-[#1B2B4B] flex items-center gap-2">
              <Users size={20} className="text-[#2563EB]" />
              Enrolled Students ({students.length})
            </h2>
            <button
              onClick={() => setShowAssignModal(true)}
              className="inline-flex items-center gap-2 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer bg-[#2563EB]"
            >
              <PlusCircle size={14} />
              Bulk Assign Project
            </button>
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
                  onClick={() =>
                    navigate(`/admin/project-tracking/student/${student._id}`)
                  }
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
    </div>
  );
}