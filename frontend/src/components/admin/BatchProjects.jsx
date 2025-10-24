import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle2, PlusCircle } from "lucide-react";
import StudentProjectCard from "./StudentProjectCard";
import AssignProjectModal from "./AssignProjectModal";

export default function BatchProjects({ batch, onClose }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const fetchBatchProjects = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/projects/batch/${batch._id}`);
      setProjects(data || []);
      toast.success("Projects loaded");
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch batch projects");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProject = async (projectId) => {
    try {
      await API.patch(`/projects/${projectId}/approve`);
      toast.success("Project approved successfully");
      fetchBatchProjects();
    } catch (err) {
      toast.error("Approval failed");
    }
  };

  useEffect(() => {
    fetchBatchProjects();
  }, [batch]);

  return (
    <AnimatePresence>
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl shadow-sm p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-emerald-700 hover:text-emerald-800 transition"
          >
            <ArrowLeft size={18} />
            Back to Batches
          </button>

          <h2 className="text-lg font-semibold text-slate-800">
            {batch.batch_name} (#{batch.batch_no})
          </h2>

          {/* Assign Project Button */}
          <button
            onClick={() => setShowAssignModal(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-sm transition cursor-pointer"
          >
            <PlusCircle size={16} /> Assign Project
          </button>
        </div>

        {loading ? (
          <p className="text-center text-slate-500">Loading projects...</p>
        ) : projects.length ? (
          <div className="grid md:grid-cols-2 gap-4">
            {projects.map((p) => (
              <StudentProjectCard
                key={p._id}
                project={p}
                onApprove={handleApproveProject}
              />
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center">
            No projects found for this batch.
          </p>
        )}

        {/* Assign Project Modal */}
        {showAssignModal && (
          <AssignProjectModal
            batch={batch}
            onClose={() => setShowAssignModal(false)}
            onAssigned={fetchBatchProjects}
          />
        )}
      </motion.section>
    </AnimatePresence>
  );
}
