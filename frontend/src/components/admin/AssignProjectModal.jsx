import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Layers, PlusCircle } from "lucide-react";
import toast from "react-hot-toast";
import { API } from "../../api/axios";

export default function AssignProjectModal({ batch, onClose, onAssigned }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [modules, setModules] = useState([{ name: "" }]);
  const [loading, setLoading] = useState(false);

  const handleModuleChange = (index, value) => {
    const updated = [...modules];
    updated[index].name = value;
    setModules(updated);
  };

  const addModule = () => {
    setModules([...modules, { name: "" }]);
  };

  const admin = JSON.parse(localStorage.getItem("user"));

  const handleAssign = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        batchId: batch._id,
        title,
        description,
        modules,
        adminId: admin?.id, // Assuming you store admin ID on login
      };

      await API.post("/projects/assign-to-batch", payload);
      toast.success("Project assigned successfully!");
      onAssigned();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 relative"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 text-white rounded-full p-2">
                <Layers size={18} />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">
                Assign Project to {batch.batch_name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Project Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Enter project title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Enter project description"
              />
            </div>

            {/* Modules */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-600">
                Modules
              </label>
              {modules.map((m, i) => (
                <input
                  key={i}
                  value={m.name}
                  onChange={(e) => handleModuleChange(i, e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder={`Module ${i + 1}`}
                />
              ))}
              <button
                onClick={addModule}
                className="text-emerald-700 text-sm font-medium flex items-center gap-1 mt-1 hover:text-emerald-800"
              >
                <PlusCircle size={14} /> Add Module
              </button>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm disabled:opacity-70"
              >
                {loading ? "Assigning..." : "Assign Project"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
