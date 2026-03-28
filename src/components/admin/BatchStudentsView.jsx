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
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500 hover:text-purple-600"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {batch?.batch_name || "Loading..."} Students
            </h1>
            <p className="text-sm text-gray-600 flex items-center gap-2">
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
            className="inline-flex items-center gap-2 bg-white border-2 border-purple-600 text-purple-700 px-4 py-2 rounded-xl shadow-sm hover:bg-purple-50 transition cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAssignModal(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl shadow-lg transition cursor-pointer"
          >
            <PlusCircle size={16} />
            Bulk Assign Project
          </motion.button>
        </div>
      </div>

      {/* Students */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="animate-spin mx-auto text-purple-600" size={32} />
          <p className="text-gray-600 mt-4">Loading students...</p>
        </div>
      ) : students.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => (
            <motion.div
              key={student._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="bg-gradient-to-br from-white to-indigo-50 border border-indigo-100 rounded-2xl shadow-lg p-5 hover:shadow-xl transition cursor-pointer"
              onClick={() =>
                navigate(`/admin/project-tracking/student/${student._id}`)
              }
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full p-3 shadow-md">
                  <Users size={20} />
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    student.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {student.isActive ? "Active" : "Pending"}
                </div>
              </div>

              <h3 className="font-bold text-lg text-gray-800 mb-2">
                {student.name}
              </h3>

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Mail size={14} />
                <span className="truncate">{student.email}</span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-indigo-100">
                <div className="flex items-center gap-2 text-purple-700 font-medium text-sm">
                  <FolderGit2 size={16} />
                  View Projects
                </div>
                <ChevronRight size={20} className="text-purple-600" />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">
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
