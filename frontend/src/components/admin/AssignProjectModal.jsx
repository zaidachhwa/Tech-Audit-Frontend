// src/components/admin/AssignProjectModal.jsx
import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import toast from "react-hot-toast";
import { X } from "lucide-react";

/**
 * AssignProjectModal
 * - batch: the batch object with students
 * - onClose: close handler
 * - onAssigned: callback after assignment to refresh
 *
 * Behavior:
 * - Pick multiple students (checkboxes)
 * - Provide project title, description and optional repo link
 * - Submits by creating one project per student (sequentially)
 */

export default function AssignProjectModal({ batch, onClose, onAssigned }) {
  const [selected, setSelected] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [repo, setRepo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (batch?.students) {
      setSelected(batch.students.map((s) => s._id)); // default select all
    }
  }, [batch]);

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const submit = async () => {
    if (!title || !selected.length)
      return toast.error("Title & at least one student required");
    try {
      setLoading(true);
      // create a project for each student (sequentially to keep it simple)
      for (const studentId of selected) {
        await API.post("/projects/create", {
          title,
          description,
          repo,
          studentId,
          batchId: batch._id,
        });
      }
      toast.success("Projects assigned");
      if (onAssigned) onAssigned();
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign projects");
    } finally {
      setLoading(false);
      onClose?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl p-5 w-full max-w-2xl shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Assign Project to Students — {batch?.batch_name} #{batch?.batch_no}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-800"
          >
            <X />
          </button>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Project Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200"
          />
          <input
            type="text"
            placeholder="Repository URL (optional)"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200"
          />
          <textarea
            placeholder="Short description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200"
            rows={3}
          />

          <div>
            <div className="text-sm font-medium mb-2">Students</div>
            <div className="grid gap-2 max-h-40 overflow-auto">
              {batch?.students?.map((s) => (
                <label
                  key={s._id}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(s._id)}
                    onChange={() => toggle(s._id)}
                  />
                  <div>
                    <div className="text-sm font-medium">{s.name}</div>
                    <div className="text-xs text-slate-500">{s.email}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
              disabled={loading}
            >
              {loading ? "Assigning..." : "Assign"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
