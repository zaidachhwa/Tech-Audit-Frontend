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
} from "lucide-react";
import BulkAssignProjectModal from "./BulkAssignProjectModal";


export default function BatchStudentsView() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const fetchBatchDetails = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/batches/${batchId}`);
      setBatch(data);
      setStudents(data?.students || []);
      toast.success("Batch details loaded");
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

  return (
    <div className="space-y-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>

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
              {batch?.batch_name || "Loading..."} Students
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
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#EFF6FF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#FFFFFF";
            }}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAssignModal(true)}
            className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-lg font-medium transition cursor-pointer"
            style={{
              backgroundColor: "#2563EB",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#1E40AF";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(37, 99, 235, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#2563EB";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 99, 235, 0.3)";
            }}
          >
            <PlusCircle size={16} />
            Bulk Assign Project
          </motion.button>
        </div>
      </div>

      {/* Students */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="animate-spin mx-auto" size={32} style={{ color: "#2563EB" }} />
          <p className="mt-4" style={{ color: "#64748B" }}>
            Loading students...
          </p>
        </div>
      ) : students.length > 0 ? (
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
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)";
                e.currentTarget.style.borderColor = "#2563EB";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
                e.currentTarget.style.borderColor = "#E2E8F0";
              }}
              onClick={() =>
                navigate(`/admin/project-tracking/student/${student._id}`)
              }
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="text-white rounded-full p-3"
                  style={{
                    backgroundColor: "#2563EB",
                    borderRadius: "50%",
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
                  }}
                >
                  <Users size={20} />
                </div>
                <div
                  className="px-3 py-1 rounded-full text-xs font-semibold inline-block"
                  style={{
                    backgroundColor: student.isActive
                      ? "#ECFDF5"
                      : "#EFF6FF",
                    color: student.isActive
                      ? "#065F46"
                      : "#1E40AF",
                    borderRadius: "20px",
                    padding: "3px 12px",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  {student.isActive ? "Active" : "Pending"}
                </div>
              </div>

              <h3 className="font-bold mb-2" style={{ color: "#1B2B4B", fontSize: "18px", fontWeight: "700" }}>
                {student.name}
              </h3>

              <div className="flex items-center gap-2 text-sm mb-4" style={{ color: "#64748B" }}>
                <Mail size={14} />
                <span className="truncate">{student.email}</span>
              </div>

              <div
                className="flex items-center justify-between pt-4"
                style={{
                  borderTop: "1px solid #E2E8F0",
                }}
              >
                <div
                  className="flex items-center gap-2 font-medium text-sm"
                  style={{
                    color: "#2563EB",
                  }}
                >
                  <FolderGit2 size={16} />
                  View Projects
                </div>
                <ChevronRight size={20} style={{ color: "#2563EB" }} />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users size={48} style={{ margin: "0 auto 16px", color: "#CBD5E1" }} />
          <p className="text-lg" style={{ color: "#94A3B8" }}>
            No students found in this batch.
          </p>
        </div>
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