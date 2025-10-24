import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { RefreshCw, Layers, ChevronRight } from "lucide-react";
import BatchProjects from "../../components/admin/BatchProjects";

export default function ProjectTracking() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/batch");
      setBatches(data || []);
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-slate-50 text-gray-800">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 text-white rounded-full p-2 shadow">
            <Layers size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              Project Tracking
            </h1>
            <p className="text-sm text-slate-500">
              Manage batch-wise project progress
            </p>
          </div>
        </div>

        <button
          onClick={fetchBatches}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-sm transition cursor-pointer"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Batch List */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl shadow-sm p-4"
        >
          <h2 className="text-lg font-semibold mb-4 text-slate-800">
            Available Batches
          </h2>

          {batches.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {batches.map((batch) => (
                <motion.div
                  key={batch._id}
                  whileHover={{ scale: 1.02 }}
                  className="border border-slate-200 bg-white rounded-xl shadow-sm p-4 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-semibold text-slate-700">
                      {batch.batch_name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      Batch No: {batch.batch_no}
                    </p>
                    <p className="text-xs text-slate-400">
                      {batch.students?.length || 0} Students
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedBatch(batch)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-full transition cursor-pointer"
                  >
                    <ChevronRight size={18} />
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center">No batches found.</p>
          )}
        </motion.section>

        {/* Batch Projects */}
        {selectedBatch && (
          <BatchProjects
            batch={selectedBatch}
            onClose={() => setSelectedBatch(null)}
          />
        )}
      </main>
    </div>
  );
}
