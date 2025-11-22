// src/components/admin/ProjectTracking.jsx
import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  RefreshCw,
  Layers,
  ChevronRight,
  Users,
  Hash,
  FolderGit2,
  ArrowLeft,
  Rocket,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import MultiBatchProjectAssign from "./MultiBatchProjectAssign";

export default function ProjectTracking() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMultiBatchModal, setShowMultiBatchModal] = useState(false);
  const navigate = useNavigate();

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/batches");
      setBatches(data.batches || []);
      toast.success("Batches loaded");
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch batches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100 text-gray-800">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-white/30 shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/70 backdrop-blur-xl p-2 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer"
              >
                <ArrowLeft className="text-purple-600" size={20} />
              </motion.div>
            </Link>
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl p-3 shadow-md">
              <FolderGit2 size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Project Tracking
              </h1>
              <p className="text-sm text-gray-600">
                Manage batch-wise project progress
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Multi-Batch Assign Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMultiBatchModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl shadow-lg transition cursor-pointer font-medium"
            >
              <Rocket size={18} />
              Bulk Assign (All Batches)
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchBatches}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl shadow-lg transition cursor-pointer"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </motion.button>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Batch List */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-3xl shadow-xl p-6"
        >
          <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <Layers size={20} className="text-purple-600" />
            Available Batches
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <RefreshCw
                className="animate-spin mx-auto text-purple-600"
                size={32}
              />
              <p className="text-gray-600 mt-4">Loading batches...</p>
            </div>
          ) : batches.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {batches.map((batch) => (
                <motion.div
                  key={batch._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="bg-gradient-to-br from-white to-purple-50 border border-purple-100 rounded-2xl shadow-lg p-5 hover:shadow-xl transition cursor-pointer"
                  onClick={() =>
                    navigate(`/admin/project-tracking/batch/${batch._id}`)
                  }
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl p-2 shadow-md">
                      <Layers size={20} />
                    </div>
                    <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                      {batch.students?.length || 0} Students
                    </div>
                  </div>

                  <h3 className="font-bold text-lg text-gray-800 mb-1">
                    {batch.batch_name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Hash size={14} />
                    <span>Batch No: {batch.batch_no}</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-purple-100">
                    <div className="flex items-center gap-2 text-purple-700 font-medium text-sm">
                      <Users size={16} />
                      View Students
                    </div>
                    <ChevronRight size={20} className="text-purple-600" />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Layers size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No batches found.</p>
              <p className="text-gray-400 text-sm mt-2">
                Create a batch from the admin dashboard to get started.
              </p>
            </div>
          )}
        </motion.section>
      </main>

      {/* Multi-Batch Assignment Modal */}
      <AnimatePresence>
        {showMultiBatchModal && (
          <MultiBatchProjectAssign
            onClose={() => setShowMultiBatchModal(false)}
            onAssigned={fetchBatches}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
